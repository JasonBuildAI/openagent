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

import (
	"fmt"

	"github.com/the-open-agent/openagent/agent/builtin_tool"
	"github.com/the-open-agent/openagent/i18n"
)

// Provider supplies LLM-callable tools.
type Provider interface {
	BuiltinTools() []builtin_tool.BuiltinTool
}

// Config contains the fields needed to construct builtin tools.
type Config struct {
	Type         string
	SubType      string
	ProviderUrl  string
	ClientId     string
	ClientSecret string
	EnableProxy  bool
}

// NewProvider instantiates a Tool provider implementation from type.
func NewProvider(config Config, lang string) (Provider, error) {
	switch config.Type {
	case "Time":
		return &TimeProvider{}, nil
	case "Web Search":
		return NewWebSearchProvider(config)
	case "Shell":
		return &ShellProvider{}, nil
	case "Office":
		return &OfficeProvider{subType: officeSubType(config.SubType)}, nil
	case "Web Fetch":
		return NewWebFetchProvider(config)
	case "Web Browser":
		return NewBrowserProvider(config)
	case "GUI":
		return NewGuiProvider(config)
	case "Video Download":
		return &VideoDownloadProvider{}, nil
	default:
		return nil, fmt.Errorf(i18n.Translate(lang, "tool:unsupported tool provider type: %s"), config.Type)
	}
}
