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
	"strings"
)

// NewGuiProvider constructs the Tool provider Type "GUI".
// GUI is UIA-only. Empty subtype is accepted for backward compatibility and
// normalized to UIA behavior. Non-UIA subtypes fail explicitly.
func NewGuiProvider(config Config) (Provider, error) {
	subType := strings.TrimSpace(config.SubType)
	if subType != "" && !strings.EqualFold(subType, "UIA") {
		return nil, fmt.Errorf("unsupported GUI subtype: %s (only UIA is supported)", config.SubType)
	}
	return NewGuiUiaProvider(config)
}
