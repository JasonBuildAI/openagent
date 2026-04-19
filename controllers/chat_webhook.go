// Copyright 2026 The Casibase Authors. All Rights Reserved.
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

package controllers

import (
	"fmt"
	"io"

	"github.com/casibase/casibase/object"
	"github.com/casibase/casibase/util"
)

// TelegramWebhook receives incoming updates from Telegram for a given Chat provider.
// The URL format is: /webhook/telegram/:providerName
// This endpoint does not require authentication because it is called by Telegram servers.
// @router /webhook/telegram/:providerName [post]
func (c *ApiController) TelegramWebhook() {
	providerName := c.Ctx.Input.Param(":providerName")

	provider, err := object.GetProvider(util.GetIdFromOwnerAndName("admin", providerName))
	if err != nil {
		c.Ctx.ResponseWriter.WriteHeader(500)
		return
	}
	if provider == nil || provider.Category != "Chat" || provider.Type != "Telegram" {
		c.Ctx.ResponseWriter.WriteHeader(404)
		return
	}

	chatProviderObj, err := provider.GetChatProvider(c.GetAcceptLanguage())
	if err != nil {
		c.Ctx.ResponseWriter.WriteHeader(500)
		return
	}

	body, err := io.ReadAll(c.Ctx.Request.Body)
	if err != nil {
		c.Ctx.ResponseWriter.WriteHeader(400)
		return
	}

	incoming, err := chatProviderObj.ParseWebhookRequest(body)
	if err != nil {
		// Return 200 so Telegram does not retry malformed updates
		c.Ctx.ResponseWriter.WriteHeader(200)
		return
	}
	if incoming == nil {
		// Non-text update (sticker, photo, etc.) — acknowledge silently
		c.Ctx.ResponseWriter.WriteHeader(200)
		return
	}

	// Use clientId as the model provider name; empty string falls back to default store
	modelProvider := provider.ClientId
	answer, _, err := object.GetAnswer(modelProvider, incoming.Text, c.GetAcceptLanguage())
	if err != nil {
		_ = chatProviderObj.SendMessage(incoming.ChatId, fmt.Sprintf("Error: %v", err))
		c.Ctx.ResponseWriter.WriteHeader(200)
		return
	}

	_ = chatProviderObj.SendMessage(incoming.ChatId, answer)
	c.Ctx.ResponseWriter.WriteHeader(200)
}

// SetTelegramWebhook calls the Telegram Bot API to register the webhook URL for the given provider.
// @Title SetTelegramWebhook
// @Tag Provider API
// @Description set Telegram webhook for a Chat provider
// @Param   id     query    string  true  "The id of the provider (owner/name)"
// @Success 200 {object} controllers.Response The Response object
// @router /api/set-telegram-webhook [post]
func (c *ApiController) SetTelegramWebhook() {
	id := c.Input().Get("id")

	provider, err := object.GetProvider(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	if provider == nil {
		c.ResponseError("provider not found")
		return
	}
	if provider.Category != "Chat" || provider.Type != "Telegram" {
		c.ResponseError("provider is not a Telegram Chat provider")
		return
	}

	chatProviderObj, err := provider.GetChatProvider(c.GetAcceptLanguage())
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	if provider.Domain == "" {
		c.ResponseError("Domain is not set on this provider")
		return
	}

	webhookUrl := fmt.Sprintf("%s/webhook/telegram/%s", provider.Domain, provider.Name)
	if err = chatProviderObj.SetWebhook(webhookUrl); err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(webhookUrl)
}
