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

import React from "react";
import {Link} from "react-router-dom";
import {Button, Image, Popconfirm, Table, Tag, Tooltip} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import BaseListPage from "./BaseListPage";
import * as Setting from "./Setting";
import * as ResourceBackend from "./backend/ResourceBackend";
import i18next from "i18next";

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) {return "-";}
  if (bytes < 1024) {return `${bytes} B`;}
  if (bytes < 1024 * 1024) {return `${(bytes / 1024).toFixed(1)} KB`;}
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryColor(category) {
  const map = {avatar: "blue", chat: "green", document: "orange"};
  return map[category] || "default";
}

class ResourceListPage extends BaseListPage {
  newResource() {
    return {
      owner: this.props.account?.name || "admin",
      name: `resource_${Date.now()}`,
      createdTime: new Date().toISOString(),
      displayName: "New Resource",
      user: this.props.account?.name || "",
      category: "avatar",
      format: "",
      fileName: "",
      fileSize: 0,
      url: "",
      objectType: "",
      objectId: "",
    };
  }

  addResource() {
    const newResource = this.newResource();
    ResourceBackend.addResource(newResource)
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", i18next.t("general:Successfully added"));
          this.props.history.push(`/resources/${newResource.owner}/${newResource.name}`);
        } else {
          Setting.showMessage("error", `${i18next.t("general:Failed to add")}: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `${i18next.t("general:Failed to add")}: ${error}`);
      });
  }

  deleteItem = async(i) => {
    return ResourceBackend.deleteResource(this.state.data[i]);
  };

  deleteResource(record) {
    ResourceBackend.deleteResource(record)
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", i18next.t("general:Successfully deleted"));
          this.setState({
            data: this.state.data.filter((item) => item.name !== record.name),
            pagination: {
              ...this.state.pagination,
              total: this.state.pagination.total - 1,
            },
          });
        } else {
          Setting.showMessage("error", `${i18next.t("general:Failed to delete")}: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `${i18next.t("general:Failed to delete")}: ${error}`);
      });
  }

  renderTable(resources) {
    const columns = [
      {
        title: i18next.t("general:Owner"),
        dataIndex: "owner",
        key: "owner",
        width: "90px",
        sorter: (a, b) => (a.owner || "").localeCompare(b.owner || ""),
        ...this.getColumnSearchProps("owner"),
      },
      {
        title: i18next.t("general:Name"),
        dataIndex: "name",
        key: "name",
        width: "200px",
        sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
        ...this.getColumnSearchProps("name"),
        render: (text, record) => (
          <Link to={`/resources/${record.owner}/${text}`}>{text}</Link>
        ),
      },
      {
        title: i18next.t("general:Created time"),
        dataIndex: "createdTime",
        key: "createdTime",
        width: "160px",
        sorter: (a, b) => (a.createdTime || "").localeCompare(b.createdTime || ""),
        render: (text) => Setting.getFormattedDate(text),
      },
      {
        title: i18next.t("general:User"),
        dataIndex: "user",
        key: "user",
        width: "120px",
        sorter: (a, b) => (a.user || "").localeCompare(b.user || ""),
        ...this.getColumnSearchProps("user"),
      },
      {
        title: i18next.t("resource:Category"),
        dataIndex: "category",
        key: "category",
        width: "100px",
        sorter: (a, b) => (a.category || "").localeCompare(b.category || ""),
        ...this.getColumnSearchProps("category"),
        render: (text) => (
          <Tag color={getCategoryColor(text)}>{text}</Tag>
        ),
      },
      {
        title: i18next.t("resource:File name"),
        dataIndex: "fileName",
        key: "fileName",
        sorter: (a, b) => (a.fileName || "").localeCompare(b.fileName || ""),
        ...this.getColumnSearchProps("fileName"),
      },
      {
        title: i18next.t("resource:Format"),
        dataIndex: "format",
        key: "format",
        width: "80px",
        sorter: (a, b) => (a.format || "").localeCompare(b.format || ""),
      },
      {
        title: i18next.t("resource:File size"),
        dataIndex: "fileSize",
        key: "fileSize",
        width: "100px",
        sorter: (a, b) => (a.fileSize || 0) - (b.fileSize || 0),
        render: (text) => formatFileSize(text),
      },
      {
        title: i18next.t("resource:Preview"),
        dataIndex: "url",
        key: "url",
        width: "100px",
        render: (url, record) => {
          if (!url) {return null;}
          const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes((record.format || "").toLowerCase());
          if (isImage) {
            return (
              <Image src={url} width={48} height={48} style={{objectFit: "cover", borderRadius: 4}} preview={{mask: i18next.t("general:Preview")}} />
            );
          }
          return (
            <Tooltip title={url}>
              <a href={url} target="_blank" rel="noopener noreferrer">{i18next.t("general:Download")}</a>
            </Tooltip>
          );
        },
      },
      {
        title: i18next.t("resource:Object"),
        dataIndex: "objectId",
        key: "objectId",
        width: "180px",
        sorter: (a, b) => (a.objectId || "").localeCompare(b.objectId || ""),
        ...this.getColumnSearchProps("objectId"),
        render: (text, record) => {
          if (!text) {return null;}
          return (
            <span>
              <Tag>{record.objectType}</Tag>
              {text}
            </span>
          );
        },
      },
      {
        title: i18next.t("general:Action"),
        dataIndex: "action",
        key: "action",
        width: "160px",
        fixed: "right",
        render: (text, record) => (
          <div>
            <Button
              style={{marginTop: "10px", marginBottom: "10px", marginRight: "10px"}}
              type="primary"
              onClick={() => this.props.history.push(`/resources/${record.owner}/${record.name}`)}
            >
              {i18next.t("general:Edit")}
            </Button>
            <Popconfirm
              title={`${i18next.t("general:Sure to delete")}: ${record.name} ?`}
              onConfirm={() => this.deleteResource(record)}
              okText={i18next.t("general:OK")}
              cancelText={i18next.t("general:Cancel")}
            >
              <Button style={{marginBottom: "10px"}} type="primary" danger>
                {i18next.t("general:Delete")}
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ];

    const paginationProps = {
      current: this.state.pagination.current,
      pageSize: this.state.pagination.pageSize,
      total: this.state.pagination.total,
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
      showTotal: () => i18next.t("general:{total} in total").replace("{total}", this.state.pagination.total),
    };

    return (
      <div>
        <Table
          scroll={{x: "max-content"}}
          columns={columns}
          dataSource={resources}
          rowKey="name"
          rowSelection={this.getRowSelection()}
          size="middle"
          bordered
          pagination={paginationProps}
          title={() => (
            <div>
              {i18next.t("general:Resources")}&nbsp;&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="small" onClick={this.addResource.bind(this)}>
                {i18next.t("general:Add")}
              </Button>
              {this.state.selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`${i18next.t("general:Sure to delete")}: ${this.state.selectedRowKeys.length} ${i18next.t("general:items")} ?`}
                  onConfirm={() => this.performBulkDelete(this.state.selectedRows, this.state.selectedRowKeys)}
                  okText={i18next.t("general:OK")}
                  cancelText={i18next.t("general:Cancel")}
                >
                  <Button type="primary" danger size="small" icon={<DeleteOutlined />} style={{marginLeft: 8}}>
                    {i18next.t("general:Delete")} ({this.state.selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
            </div>
          )}
          loading={this.getTableLoading()}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }

  fetch = (params = {}) => {
    const field = params.searchedColumn, value = params.searchText;
    const sortField = params.sortField, sortOrder = params.sortOrder;
    this.setState({loading: true});
    ResourceBackend.getGlobalResources("", params.pagination.current, params.pagination.pageSize, field, value, sortField, sortOrder)
      .then((res) => {
        this.setState({loading: false});
        if (!res || res.status !== "ok") {
          if (res && Setting.isResponseDenied(res)) {
            this.setState({isAuthorized: false});
          } else {
            Setting.showMessage("error", (res && res.msg) || i18next.t("general:Failed to load"));
            this.setState({data: []});
          }
          return;
        }
        this.setState({
          data: res.data,
          pagination: {
            ...params.pagination,
            total: res.data2,
          },
          searchText: params.searchText,
          searchedColumn: params.searchedColumn,
        });
      })
      .catch((error) => {
        this.setState({loading: false, data: []});
        Setting.showMessage("error", `${i18next.t("general:Failed to connect to server")}: ${error.message || error}`);
      });
  };
}

export default ResourceListPage;
