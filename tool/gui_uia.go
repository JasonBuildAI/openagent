//go:build windows

// Copyright 2025 The OpenAgent Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package tool

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
	"unsafe"

	"github.com/ThinkInAIXYZ/go-mcp/protocol"
	"github.com/shirou/gopsutil/cpu"
	"github.com/the-open-agent/openagent/agent/builtin_tool"
	"github.com/uandersonricardo/uiautomation"
)

// GuiUiaProvider is the local Windows UI Automation implementation of the Tool
// provider Type "GUI" (SubType "UIA").
//
// This provider intentionally exposes "win_*" tools.
type GuiUiaProvider struct{}

func NewGuiUiaProvider(config Config) (*GuiUiaProvider, error) {
	// ProviderUrl is unused for local UIA implementation.
	return &GuiUiaProvider{}, nil
}

func (p *GuiUiaProvider) BuiltinTools() []builtin_tool.BuiltinTool {
	return []builtin_tool.BuiltinTool{
		&winOpenApplicationBuiltin{},
		&winFocusWindowBuiltin{},
		&winFindElementBuiltin{},
		&winInteractBuiltin{},
		&winWaitBuiltin{},
		&winAssertBuiltin{},
		&winReadSystemMetricBuiltin{},
		&winWordWriteAndSaveBuiltin{},
		&winEmergencyStopBuiltin{},
	}
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

func winToolText(text string) *protocol.CallToolResult {
	return &protocol.CallToolResult{
		IsError: false,
		Content: []protocol.Content{
			&protocol.TextContent{Type: "text", Text: text},
		},
	}
}

func winToolError(text string) *protocol.CallToolResult {
	return &protocol.CallToolResult{
		IsError: true,
		Content: []protocol.Content{
			&protocol.TextContent{Type: "text", Text: text},
		},
	}
}

// resolveDesktopPath tries to resolve the current user's desktop directory.
// It handles OneDrive redirected desktops by checking common locations.
func resolveDesktopPath() string {
	home, err := os.UserHomeDir()
	if err != nil || home == "" {
		return ""
	}
	// Prefer OneDrive Desktop if present (common on Win11).
	oneDriveDesktop := filepath.Join(home, "OneDrive", "Desktop")
	if st, err := os.Stat(oneDriveDesktop); err == nil && st.IsDir() {
		return oneDriveDesktop
	}
	return filepath.Join(home, "Desktop")
}

func parseNumber(v any) (float64, bool) {
	switch x := v.(type) {
	case float64:
		return x, true
	case int:
		return float64(x), true
	case int64:
		return float64(x), true
	case json.Number:
		f, err := x.Float64()
		return f, err == nil
	default:
		return 0, false
	}
}

// ---------------------------------------------------------------------------
// win_find_element
// ---------------------------------------------------------------------------

type winFindElementBuiltin struct{}

func (b *winFindElementBuiltin) GetName() string { return "win_find_element" }

func (b *winFindElementBuiltin) GetDescription() string {
	return `Find a UI element in a window via generic UIA criteria and return an element_id for later operations.

Recommended planning pattern:
1) win_focus_window / win_find_element
2) win_interact (click / set_text / get_text)
3) win_wait / win_assert for verification`
}

func (b *winFindElementBuiltin) GetInputSchema() interface{} {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]any{
			"window_title_contains": map[string]any{
				"type":        "string",
				"description": "Top-level window title substring.",
			},
			"name_contains": map[string]any{
				"type":        "string",
				"description": "Element Name substring (optional).",
			},
			"class_name": map[string]any{
				"type":        "string",
				"description": "Element class name substring (optional).",
			},
			"control_type": map[string]any{
				"type":        "string",
				"description": "Optional logical control type: button/edit/document/window/menuitem/text/listitem.",
			},
		},
		"required": []string{"window_title_contains"},
	}
}

func (b *winFindElementBuiltin) Execute(ctx context.Context, arguments map[string]any) (*protocol.CallToolResult, error) {
	_ = ctx
	windowTitleContains, _ := arguments["window_title_contains"].(string)
	nameContains, _ := arguments["name_contains"].(string)
	className, _ := arguments["class_name"].(string)
	controlType, _ := arguments["control_type"].(string)

	engine, err := getUiaEngine()
	if err != nil {
		return winToolError(err.Error()), nil
	}
	_, meta, err := engine.findElementByCriteria(windowTitleContains, nameContains, className, controlType)
	if err != nil {
		return winToolError(err.Error()), nil
	}
	bb, _ := json.Marshal(map[string]any{
		"success": true,
		"element": meta,
	})
	return winToolText(string(bb)), nil
}

// ---------------------------------------------------------------------------
// win_interact
// ---------------------------------------------------------------------------

type winInteractBuiltin struct{}

func (b *winInteractBuiltin) GetName() string { return "win_interact" }

func (b *winInteractBuiltin) GetDescription() string {
	return `Interact with a previously found UI element.

Supported actions:
- click
- set_text (requires text)
- get_text
- focus
- hotkey (without element_id, send keyboard shortcut globally to focused window)`
}

func (b *winInteractBuiltin) GetInputSchema() interface{} {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]any{
			"action": map[string]any{
				"type": "string",
				"enum": []string{"click", "set_text", "get_text", "focus", "hotkey"},
			},
			"element_id": map[string]any{
				"type":        "string",
				"description": "Element id from win_find_element. Not required for action=hotkey.",
			},
			"text": map[string]any{
				"type":        "string",
				"description": "Text used by action=set_text.",
			},
			"keys": map[string]any{
				"type":        "array",
				"description": "Hotkey keys, e.g. [\"ctrl\",\"shift\",\"s\"] or [\"enter\"].",
				"items": map[string]any{
					"type": "string",
				},
			},
		},
		"required": []string{"action"},
	}
}

func (b *winInteractBuiltin) Execute(ctx context.Context, arguments map[string]any) (*protocol.CallToolResult, error) {
	_ = ctx
	action, _ := arguments["action"].(string)
	action = strings.ToLower(strings.TrimSpace(action))
	elementID, _ := arguments["element_id"].(string)
	text, _ := arguments["text"].(string)

	engine, err := getUiaEngine()
	if err != nil {
		return winToolError(err.Error()), nil
	}

	if action == "hotkey" {
		rawKeys, _ := arguments["keys"].([]any)
		keys := make([]string, 0, len(rawKeys))
		for _, k := range rawKeys {
			s, _ := k.(string)
			s = strings.TrimSpace(strings.ToLower(s))
			if s != "" {
				keys = append(keys, s)
			}
		}
		if len(keys) == 0 {
			return winToolError("keys is required for action=hotkey"), nil
		}
		if len(keys) == 1 {
			if err := sendKeyTap(keys[0]); err != nil {
				return winToolError(err.Error()), nil
			}
		} else {
			mainKey := keys[len(keys)-1]
			mods := keys[:len(keys)-1]
			if err := sendKeyTap(mainKey, mods...); err != nil {
				return winToolError(err.Error()), nil
			}
		}
		return winToolText(`{"success":true}`), nil
	}

	if strings.TrimSpace(elementID) == "" {
		return winToolError("element_id is required for this action"), nil
	}

	switch action {
	case "click":
		if err := engine.clickElement(elementID); err != nil {
			return winToolError(err.Error()), nil
		}
		return winToolText(`{"success":true}`), nil
	case "set_text":
		if err := engine.setTextElement(elementID, text); err != nil {
			return winToolError(err.Error()), nil
		}
		return winToolText(`{"success":true}`), nil
	case "get_text":
		v, err := engine.getTextElement(elementID)
		if err != nil {
			return winToolError(err.Error()), nil
		}
		bb, _ := json.Marshal(map[string]any{"success": true, "text": v})
		return winToolText(string(bb)), nil
	case "focus":
		if err := engine.clickElement(elementID); err != nil {
			return winToolError(err.Error()), nil
		}
		return winToolText(`{"success":true}`), nil
	default:
		return winToolError("unsupported action"), nil
	}
}

// ---------------------------------------------------------------------------
// win_wait
// ---------------------------------------------------------------------------

type winWaitBuiltin struct{}

func (b *winWaitBuiltin) GetName() string { return "win_wait" }

func (b *winWaitBuiltin) GetDescription() string {
	return `Wait for a condition. Supports waiting by seconds or waiting for a window title to appear.`
}

func (b *winWaitBuiltin) GetInputSchema() interface{} {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]any{
			"seconds": map[string]any{
				"type":        "number",
				"description": "Simple sleep duration in seconds.",
				"minimum":     0,
				"maximum":     120,
			},
			"window_title_contains": map[string]any{
				"type":        "string",
				"description": "If set, poll until a matching top-level window appears.",
			},
			"timeout_seconds": map[string]any{
				"type":        "number",
				"default":     10,
				"minimum":     1,
				"maximum":     120,
			},
		},
	}
}

func (b *winWaitBuiltin) Execute(ctx context.Context, arguments map[string]any) (*protocol.CallToolResult, error) {
	seconds, hasSeconds := parseNumber(arguments["seconds"])
	windowTitleContains, _ := arguments["window_title_contains"].(string)
	timeoutSeconds := 10.0
	if v, ok := parseNumber(arguments["timeout_seconds"]); ok && v > 0 {
		timeoutSeconds = math.Min(v, 120)
	}

	if strings.TrimSpace(windowTitleContains) != "" {
		deadline := time.Now().Add(time.Duration(timeoutSeconds * float64(time.Second)))
		for time.Now().Before(deadline) {
			select {
			case <-ctx.Done():
				return winToolError("wait cancelled"), nil
			default:
			}
			if hwnd, err := findTopLevelWindowByTitleContains(windowTitleContains); err == nil && hwnd != 0 {
				bb, _ := json.Marshal(map[string]any{"success": true, "hwnd": hwnd})
				return winToolText(string(bb)), nil
			}
			time.Sleep(200 * time.Millisecond)
		}
		return winToolError("wait timeout: window not found"), nil
	}

	if !hasSeconds {
		seconds = 1
	}
	seconds = math.Max(0, math.Min(120, seconds))
	time.Sleep(time.Duration(seconds * float64(time.Second)))
	return winToolText(`{"success":true}`), nil
}

// ---------------------------------------------------------------------------
// win_assert
// ---------------------------------------------------------------------------

type winAssertBuiltin struct{}

func (b *winAssertBuiltin) GetName() string { return "win_assert" }

func (b *winAssertBuiltin) GetDescription() string {
	return `Assert post-conditions in GUI workflows.

Supported checks:
- window_exists (requires window_title_contains)
- file_exists (requires path)
- text_contains (requires text + expected_substring)`
}

func (b *winAssertBuiltin) GetInputSchema() interface{} {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]any{
			"check": map[string]any{
				"type": "string",
				"enum": []string{"window_exists", "file_exists", "text_contains"},
			},
			"window_title_contains": map[string]any{"type": "string"},
			"path":                  map[string]any{"type": "string"},
			"text":                  map[string]any{"type": "string"},
			"expected_substring":    map[string]any{"type": "string"},
		},
		"required": []string{"check"},
	}
}

func (b *winAssertBuiltin) Execute(ctx context.Context, arguments map[string]any) (*protocol.CallToolResult, error) {
	_ = ctx
	check, _ := arguments["check"].(string)
	check = strings.ToLower(strings.TrimSpace(check))
	switch check {
	case "window_exists":
		title, _ := arguments["window_title_contains"].(string)
		if strings.TrimSpace(title) == "" {
			return winToolError("window_title_contains is required"), nil
		}
		if hwnd, err := findTopLevelWindowByTitleContains(title); err == nil && hwnd != 0 {
			return winToolText(`{"success":true}`), nil
		}
		return winToolError("assertion failed: window not found"), nil
	case "file_exists":
		p, _ := arguments["path"].(string)
		if strings.TrimSpace(p) == "" {
			return winToolError("path is required"), nil
		}
		st, err := os.Stat(p)
		if err == nil && !st.IsDir() {
			return winToolText(`{"success":true}`), nil
		}
		return winToolError("assertion failed: file not found"), nil
	case "text_contains":
		text, _ := arguments["text"].(string)
		exp, _ := arguments["expected_substring"].(string)
		if !strings.Contains(strings.ToLower(text), strings.ToLower(exp)) {
			return winToolError("assertion failed: expected_substring not found"), nil
		}
		return winToolText(`{"success":true}`), nil
	default:
		return winToolError("unsupported check"), nil
	}
}

// ---------------------------------------------------------------------------
// win_open_application
// ---------------------------------------------------------------------------

type winOpenApplicationBuiltin struct{}

func (b *winOpenApplicationBuiltin) GetName() string { return "win_open_application" }

func (b *winOpenApplicationBuiltin) GetDescription() string {
	return `Open a Windows application in the current interactive desktop session.

This tool is generic and does NOT hardcode specific apps. The model should pass a target such as:
- "calc" / "calc.exe"
- "taskmgr" / "taskmgr.exe"
- "winword" / "winword.exe"
- an absolute path to an executable

method:
- "auto" (default): prefer exe, fallback to shell/search
- "exe": run the executable
- "shell": use "cmd /c start" to open the target (best-effort)
- "search": open Start menu, type target and press Enter (fallback, less reliable)`
}

func (b *winOpenApplicationBuiltin) GetInputSchema() interface{} {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]any{
			"target": map[string]any{
				"type":        "string",
				"description": "Application identifier: executable name, path, or a searchable name.",
			},
			"method": map[string]any{
				"type":        "string",
				"enum":        []string{"auto", "exe", "shell", "search"},
				"default":     "auto",
				"description": "Launch method preference.",
			},
			"wait_seconds": map[string]any{
				"type":        "number",
				"default":     2,
				"minimum":     0,
				"maximum":     30,
				"description": "Seconds to wait after launching (best-effort).",
			},
		},
		"required": []string{"target"},
	}
}

func (b *winOpenApplicationBuiltin) Execute(ctx context.Context, arguments map[string]any) (*protocol.CallToolResult, error) {
	target, _ := arguments["target"].(string)
	target = strings.TrimSpace(target)
	if target == "" {
		return winToolError("missing required parameter: target"), nil
	}
	method, _ := arguments["method"].(string)
	method = strings.ToLower(strings.TrimSpace(method))
	if method == "" {
		method = "auto"
	}
	waitSecs := 2.0
	if v, ok := parseNumber(arguments["wait_seconds"]); ok && v >= 0 {
		waitSecs = math.Min(30, v)
	}

	launch := func(m string) error {
		switch m {
		case "exe":
			// LookPath for non-absolute paths.
			cmdTarget := target
			if !filepath.IsAbs(cmdTarget) && !strings.Contains(cmdTarget, string(filepath.Separator)) {
				if p, err := exec.LookPath(cmdTarget); err == nil {
					cmdTarget = p
				}
			}
			cmd := exec.CommandContext(ctx, cmdTarget)
			return cmd.Start()
		case "shell":
			// Best-effort: `cmd.exe /C start "" <target>`
			cmdExe := resolveCmdExe()
			cmd := exec.CommandContext(ctx, cmdExe, "/C", "start", "", target)
			return cmd.Start()
		case "search":
			// Fallback: open Start and type.
			if err := sendKeyTap("win"); err != nil {
				return err
			}
			time.Sleep(350 * time.Millisecond)
			if err := sendTextInput(target); err != nil {
				return err
			}
			time.Sleep(150 * time.Millisecond)
			if err := sendKeyTap("enter"); err != nil {
				return err
			}
			return nil
		default:
			return fmt.Errorf("unsupported method: %s", m)
		}
	}

	if method == "auto" {
		errExe := launch("exe")
		if errExe != nil {
			errShell := launch("shell")
			if errShell != nil {
				errSearch := launch("search")
				if errSearch != nil {
					return winToolError(fmt.Sprintf(
						"failed to launch target via auto (exe: %v; shell: %v; search: %v)",
						errExe, errShell, errSearch,
					)), nil
				}
			}
		}
	} else {
		if err := launch(method); err != nil {
			return winToolError(fmt.Sprintf("failed to launch target via %s: %s", method, err.Error())), nil
		}
	}

	if waitSecs > 0 {
		time.Sleep(time.Duration(waitSecs * float64(time.Second)))
	}

	return winToolText(fmt.Sprintf(`{"success":true,"target":%q,"method":%q}`, target, method)), nil
}

func resolveCmdExe() string {
	windir := os.Getenv("WINDIR")
	if windir == "" {
		windir = "C:\\Windows"
	}
	return filepath.Join(windir, "System32", "cmd.exe")
}

// ---------------------------------------------------------------------------
// win_focus_window
// ---------------------------------------------------------------------------

type winFocusWindowBuiltin struct{}

func (b *winFocusWindowBuiltin) GetName() string { return "win_focus_window" }

func (b *winFocusWindowBuiltin) GetDescription() string {
	return `Focus (bring to foreground) an application window.

Preferred criteria is "title_contains". If multiple match, the first found is focused.`
}

func (b *winFocusWindowBuiltin) GetInputSchema() interface{} {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]any{
			"title_contains": map[string]any{
				"type":        "string",
				"description": "Substring of the window title to match.",
			},
		},
		"required": []string{"title_contains"},
	}
}

func (b *winFocusWindowBuiltin) Execute(ctx context.Context, arguments map[string]any) (*protocol.CallToolResult, error) {
	title, _ := arguments["title_contains"].(string)
	title = strings.TrimSpace(title)
	if title == "" {
		return winToolError("missing required parameter: title_contains"), nil
	}
	hwnd, err := findTopLevelWindowByTitleContains(title)
	if err != nil {
		return winToolError(err.Error()), nil
	}
	if err := focusWindow(hwnd); err != nil {
		return winToolError(err.Error()), nil
	}
	return winToolText(fmt.Sprintf(`{"success":true,"hwnd":%d}`, hwnd)), nil
}

// ---------------------------------------------------------------------------
// win_read_system_metric
// ---------------------------------------------------------------------------

type winReadSystemMetricBuiltin struct{}

func (b *winReadSystemMetricBuiltin) GetName() string { return "win_read_system_metric" }

func (b *winReadSystemMetricBuiltin) GetDescription() string {
	return `Read system metrics such as CPU utilization without relying on UI text.

For cpu_percent, this uses gopsutil sampling (P0).`
}

func (b *winReadSystemMetricBuiltin) GetInputSchema() interface{} {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]any{
			"metric": map[string]any{
				"type":        "string",
				"enum":        []string{"cpu_percent"},
				"description": "Metric to read.",
			},
			"duration_seconds": map[string]any{
				"type":        "number",
				"default":     10,
				"minimum":     1,
				"maximum":     120,
				"description": "Sampling duration in seconds.",
			},
			"interval_seconds": map[string]any{
				"type":        "number",
				"default":     1,
				"minimum":     0.2,
				"maximum":     10,
				"description": "Sampling interval in seconds.",
			},
			"aggregation": map[string]any{
				"type":        "string",
				"enum":        []string{"avg", "series"},
				"default":     "avg",
				"description": "Aggregation method.",
			},
		},
		"required": []string{"metric"},
	}
}

func (b *winReadSystemMetricBuiltin) Execute(ctx context.Context, arguments map[string]any) (*protocol.CallToolResult, error) {
	metric, _ := arguments["metric"].(string)
	metric = strings.TrimSpace(metric)
	if metric != "cpu_percent" {
		return winToolError(`metric must be "cpu_percent"`), nil
	}
	dur := 10.0
	if v, ok := parseNumber(arguments["duration_seconds"]); ok && v > 0 {
		dur = math.Min(120, v)
	}
	interval := 1.0
	if v, ok := parseNumber(arguments["interval_seconds"]); ok && v > 0 {
		interval = math.Min(10, v)
	}
	agg, _ := arguments["aggregation"].(string)
	agg = strings.ToLower(strings.TrimSpace(agg))
	if agg == "" {
		agg = "avg"
	}

	// Warm-up: first call sometimes returns 0.
	_, _ = cpu.Percent(0, false)

	var samples []float64
	start := time.Now()
	for time.Since(start) < time.Duration(dur*float64(time.Second)) {
		select {
		case <-ctx.Done():
			return winToolError("metric sampling cancelled"), nil
		default:
		}
		p, err := cpu.Percent(0, false)
		if err == nil && len(p) > 0 {
			samples = append(samples, p[0])
		}
		time.Sleep(time.Duration(interval * float64(time.Second)))
	}

	if len(samples) == 0 {
		return winToolError("no samples collected"), nil
	}

	sum := 0.0
	for _, s := range samples {
		sum += s
	}
	avg := sum / float64(len(samples))

	if agg == "series" {
		b, _ := json.Marshal(map[string]any{
			"success":      true,
			"metric":       "cpu_percent",
			"aggregation":  "series",
			"samples":      samples,
			"sample_count": len(samples),
			"duration":     dur,
			"interval":     interval,
		})
		return winToolText(string(b)), nil
	}

	bb, _ := json.Marshal(map[string]any{
		"success":      true,
		"metric":       "cpu_percent",
		"aggregation":  "avg",
		"value":        avg,
		"unit":         "%",
		"sample_count": len(samples),
		"duration":     dur,
		"interval":     interval,
	})
	return winToolText(string(bb)), nil
}

// ---------------------------------------------------------------------------
// win_word_write_and_save (P0 high-level primitive)
// ---------------------------------------------------------------------------
//
// P0 ships a single high-level tool to ensure we can reliably satisfy the
// end-to-end requirement (Word GUI must open, write content, save to Desktop).
//
// Later phases can split this into lower-level primitives (find/interact/save).

type winWordWriteAndSaveBuiltin struct{}

func (b *winWordWriteAndSaveBuiltin) GetName() string { return "win_word_write_and_save" }

func (b *winWordWriteAndSaveBuiltin) GetDescription() string {
	return `Legacy fallback for Word write+save in one call.

Prefer generic primitives for new plans:
- win_find_element
- win_interact
- win_wait
- win_assert`
}

func (b *winWordWriteAndSaveBuiltin) GetInputSchema() interface{} {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]any{
			"word_target": map[string]any{
				"type":        "string",
				"default":     "winword",
				"description": "How to launch Word if needed (passed to win_open_application semantics). Examples: \"winword\", \"winword.exe\".",
			},
			"open_if_needed": map[string]any{
				"type":        "boolean",
				"default":     true,
				"description": "If true, attempts to launch Word before writing/saving.",
			},
			"content": map[string]any{
				"type":        "string",
				"description": "Text content to write into Word.",
			},
			"file_name": map[string]any{
				"type":        "string",
				"default":     "CPU_Report.docx",
				"description": "Output file name on Desktop.",
			},
			"overwrite": map[string]any{
				"type":        "boolean",
				"default":     true,
				"description": "Whether to overwrite if file exists.",
			},
		},
		"required": []string{"content"},
	}
}

func (b *winWordWriteAndSaveBuiltin) Execute(ctx context.Context, arguments map[string]any) (*protocol.CallToolResult, error) {
	wordTarget, _ := arguments["word_target"].(string)
	wordTarget = strings.TrimSpace(wordTarget)
	if wordTarget == "" {
		wordTarget = "winword"
	}
	openIfNeeded := true
	if v, ok := arguments["open_if_needed"].(bool); ok {
		openIfNeeded = v
	}
	content, _ := arguments["content"].(string)
	if strings.TrimSpace(content) == "" {
		return winToolError("missing required parameter: content"), nil
	}
	fileName, _ := arguments["file_name"].(string)
	fileName = strings.TrimSpace(fileName)
	if fileName == "" {
		fileName = "CPU_Report.docx"
	}
	overwrite := true
	if v, ok := arguments["overwrite"].(bool); ok {
		overwrite = v
	}
	desktop := resolveDesktopPath()
	if desktop == "" {
		return winToolError("failed to resolve Desktop path"), nil
	}
	outPath := filepath.Join(desktop, fileName)

	// If Word is already open, do NOT launch a new instance (prevents multi-open).
	_, focusErr := b.focusWord()
	if focusErr != nil && openIfNeeded {
		cmdExe := resolveCmdExe()
		_ = exec.CommandContext(ctx, cmdExe, "/C", "start", "", wordTarget).Start()
		time.Sleep(2 * time.Second)
		_, _ = b.focusWord()
	}

	// Write content via clipboard paste (more reliable than direct typing for Word).
	if err := setClipboardUnicodeText(content); err == nil {
		_ = sendKeyTap("a", "ctrl")
		time.Sleep(80 * time.Millisecond)
		_ = sendKeyTap("v", "ctrl")
	} else {
		_ = sendTextInput(content)
	}
	time.Sleep(250 * time.Millisecond)

	// Save As: Ctrl+Shift+S then use UIA to fill the dialog reliably.
	_ = sendKeyTap("s", "ctrl", "shift")
	if err := b.handleSaveAsDialog(outPath, overwrite); err != nil {
		// Fallback: type path and press Enter.
		time.Sleep(900 * time.Millisecond)
		_ = sendTextInput(outPath)
		time.Sleep(200 * time.Millisecond)
		_ = sendKeyTap("enter")
		if overwrite {
			time.Sleep(600 * time.Millisecond)
			_ = sendKeyTap("y")
			_ = sendKeyTap("enter")
		}
	}

	// Verify file exists.
	deadline := time.Now().Add(10 * time.Second)
	for time.Now().Before(deadline) {
		if st, err := os.Stat(outPath); err == nil && !st.IsDir() {
			bb, _ := json.Marshal(map[string]any{
				"success": true,
				"path":    outPath,
			})
			return winToolText(string(bb)), nil
		}
		time.Sleep(300 * time.Millisecond)
	}
	return winToolError(fmt.Sprintf("file not found after save: %s", outPath)), nil
}

func (b *winWordWriteAndSaveBuiltin) focusWord() (uintptr, error) {
	for _, hint := range []string{"Word", "Microsoft Word", "WPS Writer", "文档", "Word 文档"} {
		hwnd, err := findTopLevelWindowByTitleContains(hint)
		if err == nil {
			return hwnd, focusWindow(hwnd)
		}
	}
	return 0, fmt.Errorf("unable to locate Word window to focus")
}

func (b *winWordWriteAndSaveBuiltin) handleSaveAsDialog(path string, overwrite bool) error {
	engine, err := getUiaEngine()
	if err != nil {
		return err
	}

	// Wait for Save As dialog window.
	var dlgHwnd uintptr
	deadline := time.Now().Add(6 * time.Second)
	for time.Now().Before(deadline) {
		for _, t := range []string{"另存为", "Save As", "保存", "Save"} {
			if hwnd, err := findTopLevelWindowByTitleContains(t); err == nil && hwnd != 0 {
				dlgHwnd = hwnd
				break
			}
		}
		if dlgHwnd != 0 {
			break
		}
		time.Sleep(200 * time.Millisecond)
	}
	if dlgHwnd == 0 {
		return fmt.Errorf("save dialog not found")
	}
	_ = focusWindow(dlgHwnd)

	root, err := engine.elementFromHandle(dlgHwnd)
	if err != nil {
		return err
	}

	// Find file name edit box: prefer Edit control.
	editCond, err := engine.createPropertyConditionControlType(uiautomation.EditControlTypeId)
	if err != nil {
		return err
	}
	editEl, err := engine.findFirst(root, uiautomation.TreeScopeDescendants, editCond)
	if err != nil {
		return err
	}

	// Set via ValuePattern if available; fallback to focus + typing.
	_ = globalSta.run(func() error {
		patObj, err := editEl.GetCurrentPatternAs(uiautomation.ValuePatternId, uiautomation.IID_IUIAutomationValuePattern)
		if err == nil && patObj != nil {
			vp := (*uiautomation.ValuePattern)(unsafe.Pointer(patObj))
			if err := vp.SetValue(path); err == nil {
				return nil
			}
		}
		_ = editEl.SetFocus()
		// Use clipboard paste for safety (path contains backslashes/colon).
		if err := setClipboardUnicodeText(path); err == nil {
			_ = sendKeyTap("a", "ctrl")
			time.Sleep(50 * time.Millisecond)
			_ = sendKeyTap("v", "ctrl")
			return nil
		}
		_ = sendTextInput(path)
		return nil
	})

	// Confirm save: press Enter in the dialog (more reliable than "first button" heuristics).
	time.Sleep(120 * time.Millisecond)
	_ = sendKeyTap("enter")

	// Overwrite confirmation: best-effort click Yes.
	if overwrite {
		time.Sleep(400 * time.Millisecond)
		for _, yesHint := range []string{"确认另存为", "Confirm Save As", "确认保存", "Confirm Save", "Microsoft Word"} {
			if hwnd, err := findTopLevelWindowByTitleContains(yesHint); err == nil && hwnd != 0 && hwnd != dlgHwnd {
				confRoot, err := engine.elementFromHandle(hwnd)
				if err != nil {
					continue
				}
				for _, yesLabel := range []string{"是", "Yes"} {
					yesNameCond, err := engine.createPropertyConditionString(uiautomation.NamePropertyId, yesLabel, uiautomation.PropertyConditionFlagsMatchSubstring)
					if err != nil {
						continue
					}
					yesEl, err := engine.findFirst(confRoot, uiautomation.TreeScopeDescendants, yesNameCond)
					if err == nil && yesEl != nil {
						_ = globalSta.run(func() error {
							patObj, err := yesEl.GetCurrentPatternAs(uiautomation.InvokePatternId, uiautomation.IID_IUIAutomationInvokePattern)
							if err == nil && patObj != nil {
								ip := (*uiautomation.InvokePattern)(unsafe.Pointer(patObj))
								_ = ip.Invoke()
							}
							return nil
						})
						return nil
					}
				}
			}
		}
	}
	return nil
}

// ---------------------------------------------------------------------------
// win_safety_emergency_stop
// ---------------------------------------------------------------------------

type winEmergencyStopBuiltin struct{}

func (b *winEmergencyStopBuiltin) GetName() string { return "win_safety_emergency_stop" }

func (b *winEmergencyStopBuiltin) GetDescription() string {
	return `Emergency stop: release modifier keys and send Escape to cancel modal dialogs.`
}

func (b *winEmergencyStopBuiltin) GetInputSchema() interface{} {
	return map[string]any{
		"type":                 "object",
		"additionalProperties": false,
		"properties":           map[string]any{},
	}
}

func (b *winEmergencyStopBuiltin) Execute(ctx context.Context, arguments map[string]any) (*protocol.CallToolResult, error) {
	_ = ctx
	_ = arguments
	once := sync.Once{}
	once.Do(func() {
		_ = sendKeyUp("ctrl")
		_ = sendKeyUp("alt")
		_ = sendKeyUp("shift")
		_ = sendKeyTap("esc")
	})
	return winToolText(`{"success":true}`), nil
}

