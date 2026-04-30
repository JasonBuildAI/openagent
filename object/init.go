// Copyright 2023 The OpenAgent Authors. All Rights Reserved.
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

package object

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/the-open-agent/openagent/conf"
	"github.com/the-open-agent/openagent/util"
)

func InitDb() {
	modelProviderName, embeddingProviderName, ttsProviderName, sttProviderName := initBuiltInProviders()
	initBuiltInStore(modelProviderName, embeddingProviderName, ttsProviderName, sttProviderName)
	initBuiltInTools()
	initBuiltInSite()
	InitUsers()
}

func initBuiltInStore(modelProviderName string, embeddingProviderName string, ttsProviderName string, sttProviderName string) {
	stores, err := GetGlobalStores()
	if err != nil {
		panic(err)
	}

	if len(stores) > 0 {
		return
	}

	imageProviderName := ""
	providerDbName := conf.GetConfigString("providerDbName")
	if providerDbName != "" {
		imageProviderName = "provider_storage_casibase_default"
	}

	store := &Store{
		Owner:                "admin",
		Name:                 "store-built-in",
		CreatedTime:          util.GetCurrentTime(),
		DisplayName:          "Built-in Store",
		Title:                "AI Assistant",
		Avatar:               "https://cdn.casibase.com/static/favicon.png",
		StorageProvider:      "provider-storage-built-in",
		StorageSubpath:       "store-built-in",
		ImageProvider:        imageProviderName,
		SplitProvider:        "Default",
		ModelProvider:        modelProviderName,
		EmbeddingProvider:    embeddingProviderName,
		AgentProvider:        "",
		TextToSpeechProvider: ttsProviderName,
		SpeechToTextProvider: sttProviderName,
		Frequency:            10000,
		MemoryLimit:          10,
		LimitMinutes:         15,
		Welcome:              "Hello",
		WelcomeTitle:         "Hello, this is the OpenAgent AI Assistant",
		WelcomeText:          "I'm here to help answer your questions",
		Prompt:               "You are an expert in your field and you specialize in using your knowledge to answer or solve people's problems.",
		ExampleQuestions:     []ExampleQuestion{},
		KnowledgeCount:       5,
		SuggestionCount:      3,
		ChildStores:          []string{},
		ChildModelProviders:  []string{},
		Tools:                []string{},
		IsDefault:            true,
		State:                "Active",
		EnableExtraOptions:   conf.GetConfigBool("showGithubCorner"),
		PropertiesMap:        map[string]*Properties{},
	}

	if providerDbName != "" {
		store.ShowAutoRead = true
		store.DisableFileUpload = true

		tokens := conf.ReadGlobalConfigTokens()
		if len(tokens) > 0 {
			store.Title = tokens[0]
			store.Avatar = tokens[1]
			store.Welcome = tokens[2]
			store.WelcomeTitle = tokens[3]
			store.WelcomeText = tokens[4]
			store.Prompt = tokens[5]
		}
	}

	_, err = AddStore(store)
	if err != nil {
		panic(err)
	}
}

func getDefaultStoragePath() (string, error) {
	providerDbName := conf.GetConfigString("providerDbName")
	if providerDbName != "" {
		dbName := conf.GetConfigString("dbName")
		return fmt.Sprintf("C:/casibase_data/%s", dbName), nil
	}

	cwd, err := os.Getwd()
	if err != nil {
		return "", err
	}

	res := filepath.Join(cwd, "files")
	return res, nil
}

func initBuiltInProviders() (string, string, string, string) {
	storageProvider, err := GetDefaultStorageProvider()
	if err != nil {
		panic(err)
	}

	modelProvider, err := GetDefaultModelProvider()
	if err != nil {
		panic(err)
	}

	embeddingProvider, err := GetDefaultEmbeddingProvider()
	if err != nil {
		panic(err)
	}

	ttsProvider, err := GetDefaultTextToSpeechProvider()
	if err != nil {
		panic(err)
	}

	if storageProvider == nil {
		var path string
		path, err = getDefaultStoragePath()
		if err != nil {
			panic(err)
		}

		util.EnsureFileFolderExists(path)

		storageProvider = &Provider{
			Owner:       "admin",
			Name:        "provider-storage-built-in",
			CreatedTime: util.GetCurrentTime(),
			DisplayName: "Built-in Storage Provider",
			Category:    "Storage",
			Type:        "Local File System",
			ClientId:    path,
			IsDefault:   true,
		}
		_, err = AddProvider(storageProvider)
		if err != nil && !isUniqueConstraintError(err) {
			panic(err)
		}
	}

	if modelProvider == nil {
		modelProvider = &Provider{
			Owner:       "admin",
			Name:        "dummy-model-provider",
			CreatedTime: util.GetCurrentTime(),
			DisplayName: "Dummy Model Provider",
			Category:    "Model",
			Type:        "Dummy",
			SubType:     "Dummy",
			IsDefault:   true,
		}
		_, err = AddProvider(modelProvider)
		if err != nil && !isUniqueConstraintError(err) {
			panic(err)
		}
	}

	if embeddingProvider == nil {
		embeddingProvider = &Provider{
			Owner:       "admin",
			Name:        "dummy-embedding-provider",
			CreatedTime: util.GetCurrentTime(),
			DisplayName: "Dummy Embedding Provider",
			Category:    "Embedding",
			Type:        "Dummy",
			SubType:     "Dummy",
			IsDefault:   true,
		}
		_, err = AddProvider(embeddingProvider)
		if err != nil && !isUniqueConstraintError(err) {
			panic(err)
		}
	}

	ttsProviderName := "Browser Built-In"
	if ttsProvider != nil {
		ttsProviderName = ttsProvider.Name
	}

	sttProviderName := "Browser Built-In"

	return modelProvider.Name, embeddingProvider.Name, ttsProviderName, sttProviderName
}

func initBuiltInTools() {
	builtInTools := []*Tool{
		{
			Owner:       "admin",
			Name:        "tool-time",
			DisplayName: "Time",
			Type:        "Time",
			SubType:     "Default",
			TestContent: `{"tool":"time","arguments":{"operation":"current"}}`,
			State:       "Active",
		},
		{
			Owner:       "admin",
			Name:        "tool-web-search",
			DisplayName: "Web Search",
			Type:        "Web Search",
			SubType:     "DuckDuckGo",
			TestContent: `{"tool":"web_search","arguments":{"query":"hello world"}}`,
			State:       "Active",
		},
		{
			Owner:       "admin",
			Name:        "tool-shell",
			DisplayName: "Shell",
			Type:        "Shell",
			SubType:     "Default",
			TestContent: `{"tool":"shell","arguments":{"command":"echo hello"}}`,
			State:       "Active",
		},
		{
			Owner:       "admin",
			Name:        "tool-office",
			DisplayName: "Office",
			Type:        "Office",
			SubType:     "Default",
			TestContent: `{"tool":"word_read","arguments":{"path":"test.docx"}}`,
			State:       "Active",
		},
		{
			Owner:       "admin",
			Name:        "tool-web-fetch",
			DisplayName: "Web Fetch",
			Type:        "Web Fetch",
			SubType:     "Default",
			TestContent: `{"tool":"web_fetch","arguments":{"url":"https://example.com"}}`,
			State:       "Active",
		},
		{
			Owner:       "admin",
			Name:        "tool-web-browser",
			DisplayName: "Web Browser",
			Type:        "Web Browser",
			SubType:     "Default",
			TestContent: `{"tool":"web_browser","arguments":{"url":"https://example.com"}}`,
			State:       "Active",
		},
		{
			Owner:       "admin",
			Name:        "tool-gui",
			DisplayName: "GUI",
			Type:        "GUI",
			SubType:     "Windows UIA",
			TestContent: `{"tool":"win_open_application","arguments":{"target":"calc","method":"auto","wait_seconds":2}}`,
			State:       "Active",
		},
		{
			Owner:       "admin",
			Name:        "tool-video-download",
			DisplayName: "Video Download",
			Type:        "Video Download",
			SubType:     "Default",
			TestContent: `{"tool":"video_info","arguments":{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}}`,
			State:       "Active",
		},
	}

	for _, t := range builtInTools {
		existing, err := getTool(t.Owner, t.Name)
		if err != nil {
			panic(err)
		}
		if existing != nil {
			continue
		}
		t.CreatedTime = util.GetCurrentTime()
		_, err = AddTool(t)
		if err != nil {
			panic(err)
		}
	}
}

func initBuiltInSite() {
	sites, err := GetGlobalSites()
	if err != nil {
		panic(err)
	}

	if len(sites) > 0 {
		return
	}

	// Navbar leaves enabled by default: all groups except Cloud (/cloud/*) and Multimedia (/multimedia/*).
	// Keys must match ManagementPage.getMenuItems admin-branch child keys (filterMenuItems).
	builtInNavItems := []string{
		"/chat",
		"/stores", "/chats", "/messages",
		"/files", "/vectors", "/resources",
		"/providers", "/tools",
		"/records", "/sessions",
		"/users", "/casdoor-resources", "/permissions",
		"/sites", "/usages", "/activities", "/sysinfo", "/swagger",
	}

	site := &Site{
		Owner:       "admin",
		Name:        "site-built-in",
		CreatedTime: util.GetCurrentTime(),
		DisplayName: "Built-in Site",
		ThemeColor:  "#262626",
		HtmlTitle:   "",
		FaviconUrl:  "https://cdn.casibase.com/img/casibase.png",
		LogoUrl:     "https://cdn.casibase.org/img/casibase-logo_1200x256.png",
		FooterHtml:  "",
		NavItems:    builtInNavItems,
	}

	_, err = AddSite(site)
	if err != nil {
		panic(err)
	}
}
