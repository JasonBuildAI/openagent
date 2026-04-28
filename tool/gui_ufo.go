// Copyright 2026 The OpenAgent Authors. All Rights Reserved.
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

// GuiProvider talks to a running UFO API server (https://github.com/microsoft/UFO).
// Set ProviderUrl to the server base URL, e.g. "http://localhost:8080".
// Each builtin tool sends a POST /execute request with an action name and params.

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/ThinkInAIXYZ/go-mcp/protocol"
	"github.com/the-open-agent/openagent/agent/builtin_tool"
)

const (
	guiDefaultTimeout = 30 * time.Second
	guiExecutePath    = "/execute"
)

// GuiProvider is the Tool provider Type "GUI".
type GuiProvider struct {
	baseURL string
}

func NewGuiProvider(config ProviderConfig) (*GuiProvider, error) {
	url := strings.TrimRight(strings.TrimSpace(config.ProviderUrl), "/")
	if url == "" {
		url = "http://localhost:8080"
	}
	return &GuiProvider{baseURL: url}, nil
}

func (p *GuiProvider) BuiltinTools() []builtin_tool.BuiltinTool {
	return []builtin_tool.BuiltinTool{
		&guiScreenshotBuiltin{baseURL: p.baseURL},
		&guiGetUITreeBuiltin{baseURL: p.baseURL},
		&guiClickBuiltin{baseURL: p.baseURL},
		&guiDoubleClickBuiltin{baseURL: p.baseURL},
		&guiTypeBuiltin{baseURL: p.baseURL},
		&guiHotkeyBuiltin{baseURL: p.baseURL},
		&guiScrollBuiltin{baseURL: p.baseURL},
	}
}

// ufoRequest is the body sent to POST /execute.
type ufoRequest struct {
	Action string                 `json:"action"`
	Params map[string]interface{} `json:"params,omitempty"`
}

// ufoResponse is what the UFO API server returns.
type ufoResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Error   string      `json:"error,omitempty"`
}

// callUFO posts an action to the UFO API server and returns the response body as a string.
func callUFO(ctx context.Context, baseURL, action string, params map[string]interface{}) (*protocol.CallToolResult, error) {
	reqBody := ufoRequest{Action: action, Params: params}
	b, err := json.Marshal(reqBody)
	if err != nil {
		return guiToolError(fmt.Sprintf("failed to marshal UFO request: %s", err)), nil
	}

	timeoutCtx, cancel := context.WithTimeout(ctx, guiDefaultTimeout)
	defer cancel()

	req, err := http.NewRequestWithContext(timeoutCtx, http.MethodPost, baseURL+guiExecutePath, bytes.NewReader(b))
	if err != nil {
		return guiToolError(fmt.Sprintf("failed to create HTTP request: %s", err)), nil
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return guiToolError(fmt.Sprintf("UFO API request failed: %s", err)), nil
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return guiToolError(fmt.Sprintf("failed to read UFO response: %s", err)), nil
	}

	if resp.StatusCode != http.StatusOK {
		return guiToolError(fmt.Sprintf("UFO API returned HTTP %d: %s", resp.StatusCode, string(body))), nil
	}

	var ufoResp ufoResponse
	if err := json.Unmarshal(body, &ufoResp); err != nil {
		// Return raw body if not structured JSON
		return guiToolText(string(body)), nil
	}

	if !ufoResp.Success {
		errMsg := ufoResp.Error
		if errMsg == "" {
			errMsg = "UFO API returned success=false"
		}
		return guiToolError(errMsg), nil
	}

	result, err := json.MarshalIndent(ufoResp.Data, "", "  ")
	if err != nil {
		return guiToolText(fmt.Sprintf("%v", ufoResp.Data)), nil
	}
	return guiToolText(string(result)), nil
}

func guiToolText(text string) *protocol.CallToolResult {
	return &protocol.CallToolResult{
		IsError: false,
		Content: []protocol.Content{
			&protocol.TextContent{Type: "text", Text: text},
		},
	}
}

func guiToolError(text string) *protocol.CallToolResult {
	return &protocol.CallToolResult{
		IsError: true,
		Content: []protocol.Content{
			&protocol.TextContent{Type: "text", Text: text},
		},
	}
}

// ---------------------------------------------------------------------------
// gui_screenshot
// ---------------------------------------------------------------------------

type guiScreenshotBuiltin struct{ baseURL string }

func (g *guiScreenshotBuiltin) GetName() string { return "gui_screenshot" }

func (g *guiScreenshotBuiltin) GetDescription() string {
	return `Capture a screenshot of the Windows desktop or a specific application window using the UFO GUI agent. Returns the screenshot as a base64-encoded PNG or a file path, depending on the UFO server configuration.`
}

func (g *guiScreenshotBuiltin) GetInputSchema() interface{} {
	return map[string]interface{}{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]interface{}{
			"window_title": map[string]interface{}{
				"type":        "string",
				"description": "Optional title (or partial title) of the window to capture. If omitted, the full desktop is captured.",
			},
			"save_path": map[string]interface{}{
				"type":        "string",
				"description": "Optional absolute file path on the UFO server host where the screenshot should be saved (e.g. 'C:/screenshots/shot.png').",
			},
		},
	}
}

func (g *guiScreenshotBuiltin) Execute(ctx context.Context, arguments map[string]interface{}) (*protocol.CallToolResult, error) {
	params := map[string]interface{}{}
	if v, ok := arguments["window_title"].(string); ok && strings.TrimSpace(v) != "" {
		params["window_title"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["save_path"].(string); ok && strings.TrimSpace(v) != "" {
		params["save_path"] = strings.TrimSpace(v)
	}
	return callUFO(ctx, g.baseURL, "screenshot", params)
}

// ---------------------------------------------------------------------------
// gui_get_ui_tree
// ---------------------------------------------------------------------------

type guiGetUITreeBuiltin struct{ baseURL string }

func (g *guiGetUITreeBuiltin) GetName() string { return "gui_get_ui_tree" }

func (g *guiGetUITreeBuiltin) GetDescription() string {
	return `Retrieve the UI element tree of a Windows application window using the UFO GUI agent and Windows UI Automation (UIA). Returns a structured JSON tree of all accessible controls, their names, types, states, and bounding rectangles.`
}

func (g *guiGetUITreeBuiltin) GetInputSchema() interface{} {
	return map[string]interface{}{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]interface{}{
			"window_title": map[string]interface{}{
				"type":        "string",
				"description": "Title (or partial title) of the window whose UI tree should be retrieved.",
			},
			"depth": map[string]interface{}{
				"type":        "integer",
				"description": "Maximum depth of the UI tree to traverse (default 5, max 10).",
				"default":     5,
				"minimum":     1,
				"maximum":     10,
			},
		},
		"required": []string{"window_title"},
	}
}

func (g *guiGetUITreeBuiltin) Execute(ctx context.Context, arguments map[string]interface{}) (*protocol.CallToolResult, error) {
	windowTitle, ok := arguments["window_title"].(string)
	if !ok || strings.TrimSpace(windowTitle) == "" {
		return guiToolError("missing required parameter: window_title"), nil
	}
	params := map[string]interface{}{"window_title": strings.TrimSpace(windowTitle)}
	if depth, ok := arguments["depth"].(float64); ok && depth > 0 {
		params["depth"] = int(depth)
	}
	return callUFO(ctx, g.baseURL, "get_ui_tree", params)
}

// ---------------------------------------------------------------------------
// gui_click
// ---------------------------------------------------------------------------

type guiClickBuiltin struct{ baseURL string }

func (g *guiClickBuiltin) GetName() string { return "gui_click" }

func (g *guiClickBuiltin) GetDescription() string {
	return `Click a UI element in a Windows application using the UFO GUI agent. You can target the element by its automation name/ID (preferred) or by absolute screen coordinates.`
}

func (g *guiClickBuiltin) GetInputSchema() interface{} {
	return map[string]interface{}{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]interface{}{
			"window_title": map[string]interface{}{
				"type":        "string",
				"description": "Title (or partial title) of the target application window.",
			},
			"control_name": map[string]interface{}{
				"type":        "string",
				"description": "Automation name or title of the control to click (e.g. 'OK', 'Submit'). Use this instead of coordinates when possible.",
			},
			"control_type": map[string]interface{}{
				"type":        "string",
				"description": "UIA control type to narrow the search (e.g. 'Button', 'Edit', 'MenuItem'). Optional.",
			},
			"x": map[string]interface{}{
				"type":        "integer",
				"description": "Absolute screen X coordinate to click. Used when control_name is not provided.",
			},
			"y": map[string]interface{}{
				"type":        "integer",
				"description": "Absolute screen Y coordinate to click. Used when control_name is not provided.",
			},
		},
	}
}

func (g *guiClickBuiltin) Execute(ctx context.Context, arguments map[string]interface{}) (*protocol.CallToolResult, error) {
	params := map[string]interface{}{}
	if v, ok := arguments["window_title"].(string); ok && strings.TrimSpace(v) != "" {
		params["window_title"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["control_name"].(string); ok && strings.TrimSpace(v) != "" {
		params["control_name"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["control_type"].(string); ok && strings.TrimSpace(v) != "" {
		params["control_type"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["x"].(float64); ok {
		params["x"] = int(v)
	}
	if v, ok := arguments["y"].(float64); ok {
		params["y"] = int(v)
	}
	if _, hasName := params["control_name"]; !hasName {
		if _, hasX := params["x"]; !hasX {
			return guiToolError("either control_name or x/y coordinates are required"), nil
		}
	}
	return callUFO(ctx, g.baseURL, "click", params)
}

// ---------------------------------------------------------------------------
// gui_double_click
// ---------------------------------------------------------------------------

type guiDoubleClickBuiltin struct{ baseURL string }

func (g *guiDoubleClickBuiltin) GetName() string { return "gui_double_click" }

func (g *guiDoubleClickBuiltin) GetDescription() string {
	return `Double-click a UI element in a Windows application using the UFO GUI agent. Useful for opening files, activating list items, or triggering double-click actions.`
}

func (g *guiDoubleClickBuiltin) GetInputSchema() interface{} {
	return map[string]interface{}{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]interface{}{
			"window_title": map[string]interface{}{
				"type":        "string",
				"description": "Title (or partial title) of the target application window.",
			},
			"control_name": map[string]interface{}{
				"type":        "string",
				"description": "Automation name or title of the control to double-click.",
			},
			"control_type": map[string]interface{}{
				"type":        "string",
				"description": "UIA control type to narrow the search (e.g. 'ListItem', 'TreeItem').",
			},
			"x": map[string]interface{}{
				"type":        "integer",
				"description": "Absolute screen X coordinate.",
			},
			"y": map[string]interface{}{
				"type":        "integer",
				"description": "Absolute screen Y coordinate.",
			},
		},
	}
}

func (g *guiDoubleClickBuiltin) Execute(ctx context.Context, arguments map[string]interface{}) (*protocol.CallToolResult, error) {
	params := map[string]interface{}{}
	if v, ok := arguments["window_title"].(string); ok && strings.TrimSpace(v) != "" {
		params["window_title"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["control_name"].(string); ok && strings.TrimSpace(v) != "" {
		params["control_name"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["control_type"].(string); ok && strings.TrimSpace(v) != "" {
		params["control_type"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["x"].(float64); ok {
		params["x"] = int(v)
	}
	if v, ok := arguments["y"].(float64); ok {
		params["y"] = int(v)
	}
	if _, hasName := params["control_name"]; !hasName {
		if _, hasX := params["x"]; !hasX {
			return guiToolError("either control_name or x/y coordinates are required"), nil
		}
	}
	return callUFO(ctx, g.baseURL, "double_click", params)
}

// ---------------------------------------------------------------------------
// gui_type
// ---------------------------------------------------------------------------

type guiTypeBuiltin struct{ baseURL string }

func (g *guiTypeBuiltin) GetName() string { return "gui_type" }

func (g *guiTypeBuiltin) GetDescription() string {
	return `Type text into a UI element or the currently focused control in a Windows application using the UFO GUI agent. Optionally clears the existing content before typing.`
}

func (g *guiTypeBuiltin) GetInputSchema() interface{} {
	return map[string]interface{}{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]interface{}{
			"text": map[string]interface{}{
				"type":        "string",
				"description": "The text to type.",
			},
			"window_title": map[string]interface{}{
				"type":        "string",
				"description": "Title (or partial title) of the target application window.",
			},
			"control_name": map[string]interface{}{
				"type":        "string",
				"description": "Automation name or title of the text field to type into. If omitted, types into the currently focused element.",
			},
			"control_type": map[string]interface{}{
				"type":        "string",
				"description": "UIA control type to narrow the search (e.g. 'Edit', 'Document').",
			},
			"clear_first": map[string]interface{}{
				"type":        "boolean",
				"description": "If true, clears the current content of the field before typing (default false).",
				"default":     false,
			},
		},
		"required": []string{"text"},
	}
}

func (g *guiTypeBuiltin) Execute(ctx context.Context, arguments map[string]interface{}) (*protocol.CallToolResult, error) {
	text, ok := arguments["text"].(string)
	if !ok {
		return guiToolError("missing required parameter: text"), nil
	}
	params := map[string]interface{}{"text": text}
	if v, ok := arguments["window_title"].(string); ok && strings.TrimSpace(v) != "" {
		params["window_title"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["control_name"].(string); ok && strings.TrimSpace(v) != "" {
		params["control_name"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["control_type"].(string); ok && strings.TrimSpace(v) != "" {
		params["control_type"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["clear_first"].(bool); ok {
		params["clear_first"] = v
	}
	return callUFO(ctx, g.baseURL, "type", params)
}

// ---------------------------------------------------------------------------
// gui_hotkey
// ---------------------------------------------------------------------------

type guiHotkeyBuiltin struct{ baseURL string }

func (g *guiHotkeyBuiltin) GetName() string { return "gui_hotkey" }

func (g *guiHotkeyBuiltin) GetDescription() string {
	return `Send a keyboard shortcut or key combination to a Windows application using the UFO GUI agent. Keys are specified as a list of key names (e.g. ["ctrl", "c"] for Copy, ["alt", "F4"] to close a window).`
}

func (g *guiHotkeyBuiltin) GetInputSchema() interface{} {
	return map[string]interface{}{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]interface{}{
			"keys": map[string]interface{}{
				"type":        "array",
				"description": `Key names to press simultaneously, e.g. ["ctrl", "c"], ["alt", "F4"], ["win", "d"]. Supported modifiers: ctrl, alt, shift, win. Special keys: enter, tab, escape, backspace, delete, home, end, pageup, pagedown, up, down, left, right, F1-F12.`,
				"items": map[string]interface{}{
					"type": "string",
				},
				"minItems": 1,
			},
			"window_title": map[string]interface{}{
				"type":        "string",
				"description": "Title (or partial title) of the target application window. If omitted, sends to the foreground window.",
			},
		},
		"required": []string{"keys"},
	}
}

func (g *guiHotkeyBuiltin) Execute(ctx context.Context, arguments map[string]interface{}) (*protocol.CallToolResult, error) {
	rawKeys, ok := arguments["keys"]
	if !ok {
		return guiToolError("missing required parameter: keys"), nil
	}
	keysSlice, ok := rawKeys.([]interface{})
	if !ok || len(keysSlice) == 0 {
		return guiToolError("keys must be a non-empty array of key name strings"), nil
	}
	keys := make([]string, 0, len(keysSlice))
	for _, k := range keysSlice {
		s, ok := k.(string)
		if !ok || strings.TrimSpace(s) == "" {
			return guiToolError("each key in the keys array must be a non-empty string"), nil
		}
		keys = append(keys, strings.TrimSpace(s))
	}
	params := map[string]interface{}{"keys": keys}
	if v, ok := arguments["window_title"].(string); ok && strings.TrimSpace(v) != "" {
		params["window_title"] = strings.TrimSpace(v)
	}
	return callUFO(ctx, g.baseURL, "hotkey", params)
}

// ---------------------------------------------------------------------------
// gui_scroll
// ---------------------------------------------------------------------------

type guiScrollBuiltin struct{ baseURL string }

func (g *guiScrollBuiltin) GetName() string { return "gui_scroll" }

func (g *guiScrollBuiltin) GetDescription() string {
	return `Scroll inside a UI element of a Windows application using the UFO GUI agent. Direction can be "up", "down", "left", or "right". The amount controls how many scroll steps to perform.`
}

func (g *guiScrollBuiltin) GetInputSchema() interface{} {
	return map[string]interface{}{
		"type":                 "object",
		"additionalProperties": false,
		"properties": map[string]interface{}{
			"direction": map[string]interface{}{
				"type":        "string",
				"description": `Scroll direction: "up", "down", "left", or "right".`,
				"enum":        []string{"up", "down", "left", "right"},
			},
			"amount": map[string]interface{}{
				"type":        "integer",
				"description": "Number of scroll steps (default 3).",
				"default":     3,
				"minimum":     1,
				"maximum":     20,
			},
			"window_title": map[string]interface{}{
				"type":        "string",
				"description": "Title (or partial title) of the target application window.",
			},
			"control_name": map[string]interface{}{
				"type":        "string",
				"description": "Automation name of the scrollable control. If omitted, scrolls the focused/foreground element.",
			},
			"x": map[string]interface{}{
				"type":        "integer",
				"description": "Absolute screen X coordinate of the scroll target (alternative to control_name).",
			},
			"y": map[string]interface{}{
				"type":        "integer",
				"description": "Absolute screen Y coordinate of the scroll target (alternative to control_name).",
			},
		},
		"required": []string{"direction"},
	}
}

func (g *guiScrollBuiltin) Execute(ctx context.Context, arguments map[string]interface{}) (*protocol.CallToolResult, error) {
	direction, ok := arguments["direction"].(string)
	if !ok || strings.TrimSpace(direction) == "" {
		return guiToolError("missing required parameter: direction"), nil
	}
	direction = strings.ToLower(strings.TrimSpace(direction))
	if direction != "up" && direction != "down" && direction != "left" && direction != "right" {
		return guiToolError(`direction must be one of: "up", "down", "left", "right"`), nil
	}
	params := map[string]interface{}{"direction": direction}
	if v, ok := arguments["amount"].(float64); ok && v > 0 {
		params["amount"] = int(v)
	}
	if v, ok := arguments["window_title"].(string); ok && strings.TrimSpace(v) != "" {
		params["window_title"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["control_name"].(string); ok && strings.TrimSpace(v) != "" {
		params["control_name"] = strings.TrimSpace(v)
	}
	if v, ok := arguments["x"].(float64); ok {
		params["x"] = int(v)
	}
	if v, ok := arguments["y"].(float64); ok {
		params["y"] = int(v)
	}
	return callUFO(ctx, g.baseURL, "scroll", params)
}
