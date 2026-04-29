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

package controllers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/beego/beego/utils/pagination"
	"github.com/the-open-agent/openagent/conf"
	"github.com/the-open-agent/openagent/object"
	"github.com/the-open-agent/openagent/util"
)

// GetGlobalResources
// @Title GetGlobalResources
// @Tag Resource API
// @Description get global resources
// @Success 200 {array} object.Resource The Response object
// @router /get-global-resources [get]
func (c *ApiController) GetGlobalResources() {
	owner := c.Input().Get("owner")
	limit := c.Input().Get("pageSize")
	page := c.Input().Get("p")
	field := c.Input().Get("field")
	value := c.Input().Get("value")
	sortField := c.Input().Get("sortField")
	sortOrder := c.Input().Get("sortOrder")

	if limit == "" || page == "" {
		resources, err := object.GetGlobalResources(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(resources)
	} else {
		if !c.RequireAdmin() {
			return
		}

		limitInt := util.ParseInt(limit)
		count, err := object.GetResourceCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		paginator := pagination.SetPaginator(c.Ctx, limitInt, count)
		resources, err := object.GetPaginationResources(owner, paginator.Offset(), limitInt, field, value, sortField, sortOrder)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(resources, count)
	}
}

// GetResource
// @Title GetResource
// @Tag Resource API
// @Description get resource by id
// @Param id query string true "The id (owner/name) of the resource"
// @Success 200 {object} object.Resource The Response object
// @router /get-resource [get]
func (c *ApiController) GetResource() {
	id := c.Input().Get("id")

	resource, err := object.GetResource(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(resource)
}

// UpdateResource
// @Title UpdateResource
// @Tag Resource API
// @Description update resource
// @Param id query string true "The id (owner/name) of the resource"
// @Param body body object.Resource true "The resource object"
// @Success 200 {object} controllers.Response The Response object
// @router /update-resource [post]
func (c *ApiController) UpdateResource() {
	id := c.Input().Get("id")

	var resource object.Resource
	err := json.NewDecoder(c.Ctx.Request.Body).Decode(&resource)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	success, err := object.UpdateResource(id, &resource)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(success)
}

// AddResource
// @Title AddResource
// @Tag Resource API
// @Description add resource
// @Param body body object.Resource true "The resource object"
// @Success 200 {object} controllers.Response The Response object
// @router /add-resource [post]
func (c *ApiController) AddResource() {
	var resource object.Resource
	err := json.NewDecoder(c.Ctx.Request.Body).Decode(&resource)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	success, err := object.AddResource(&resource)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(success)
}

// DeleteResource
// @Title DeleteResource
// @Tag Resource API
// @Description delete resource
// @Param body body object.Resource true "The resource object"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-resource [post]
func (c *ApiController) DeleteResource() {
	var resource object.Resource
	err := json.NewDecoder(c.Ctx.Request.Body).Decode(&resource)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	success, err := object.DeleteResource(&resource)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(success)
}

// UploadFile
// @Title UploadFile
// @Tag File API
// @Description upload file to storage and record it as a resource
// @Param file formData string true "The base64 encoded file data"
// @Param type formData string true "The file type/extension"
// @Param name formData string true "The file name"
// @Param category formData string false "Resource category: avatar (default), chat, document"
// @Param objectType formData string false "Associated object type: store, task, message, chat"
// @Param objectId formData string false "Associated object id (owner/name)"
// @Success 200 {object} controllers.Response The Response object
// @router /upload-file [post]
func (c *ApiController) UploadFile() {
	userName, ok := c.RequireSignedIn()
	if !ok {
		return
	}

	fileBase64 := c.Input().Get("file")
	fileType := c.Input().Get("type")
	fileName := c.Input().Get("name")
	category := c.Input().Get("category")
	objectType := c.Input().Get("objectType")
	objectId := c.Input().Get("objectId")

	if fileBase64 == "" || fileType == "" || fileName == "" {
		c.ResponseError(c.T("application:Missing required parameters"))
		return
	}

	if category == "" {
		category = "avatar"
	}

	index := strings.Index(fileBase64, ",")
	if index == -1 {
		c.ResponseError(c.T("resource:Invalid file data format"))
		return
	}

	fileBytes, err := base64.StdEncoding.DecodeString(fileBase64[index+1:])
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	filePath := fmt.Sprintf("openagent/resources/%s/%s/%s", category, userName, fileName)

	if !conf.IsCasdoorAvailable() {
		c.ResponseError(c.T("auth:This feature is unavailable in this sign-in mode"))
		return
	}

	fileUrl, err := object.UploadFileToStorageSafe(userName, "file", "UploadFile", filePath, fileBytes)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	format := strings.TrimPrefix(strings.ToLower(filepath.Ext(fileName)), ".")
	resource := object.NewResourceFromUpload("admin", userName, category, fileName, format, fileUrl, int64(len(fileBytes)), objectType, objectId)
	_, err = object.AddResource(resource)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(fileUrl)
}
