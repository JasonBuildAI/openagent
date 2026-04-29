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
import {Button, Card, Col, Image, Input, Row, Select} from "antd";
import * as ResourceBackend from "./backend/ResourceBackend";
import * as Setting from "./Setting";
import i18next from "i18next";

const {Option} = Select;

class ResourceEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      owner: props.match.params.owner,
      resourceName: props.match.params.resourceName,
      resource: null,
      loading: false,
    };
  }

  UNSAFE_componentWillMount() {
    this.getResource();
  }

  getResource() {
    ResourceBackend.getResource(this.state.owner, this.state.resourceName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({resource: res.data});
        } else {
          Setting.showMessage("error", `${i18next.t("general:Failed to get")}: ${res.msg}`);
        }
      });
  }

  onUpdateField(key, value) {
    const resource = this.state.resource;
    resource[key] = value;
    this.setState({resource: resource});
  }

  submitResourceEdit() {
    this.setState({loading: true});
    ResourceBackend.updateResource(this.state.owner, this.state.resourceName, this.state.resource)
      .then((res) => {
        this.setState({loading: false});
        if (res.status === "ok") {
          Setting.showMessage("success", i18next.t("general:Successfully saved"));
          this.props.history.push("/resources");
        } else {
          Setting.showMessage("error", `${i18next.t("general:Failed to save")}: ${res.msg}`);
        }
      })
      .catch(error => {
        this.setState({loading: false});
        Setting.showMessage("error", `${i18next.t("general:Failed to save")}: ${error}`);
      });
  }

  renderResource() {
    const resource = this.state.resource;
    if (!resource) {return null;}

    const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes((resource.format || "").toLowerCase());

    return (
      <Card size="small">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {i18next.t("general:Name")}:
          </Col>
          <Col span={22}>
            <Input value={resource.name} disabled />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {i18next.t("general:Display name")}:
          </Col>
          <Col span={22}>
            <Input
              value={resource.displayName}
              onChange={e => this.onUpdateField("displayName", e.target.value)}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {i18next.t("general:User")}:
          </Col>
          <Col span={22}>
            <Input value={resource.user} disabled />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {i18next.t("resource:Category")}:
          </Col>
          <Col span={22}>
            <Select
              value={resource.category}
              onChange={value => this.onUpdateField("category", value)}
              style={{width: "200px"}}
            >
              <Option value="avatar">{i18next.t("resource:avatar")}</Option>
              <Option value="chat">{i18next.t("resource:chat")}</Option>
              <Option value="document">{i18next.t("resource:document")}</Option>
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {i18next.t("resource:File name")}:
          </Col>
          <Col span={22}>
            <Input value={resource.fileName} disabled />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {i18next.t("resource:Format")}:
          </Col>
          <Col span={22}>
            <Input value={resource.format} disabled />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {i18next.t("resource:File size")}:
          </Col>
          <Col span={22}>
            <Input value={resource.fileSize ? `${resource.fileSize} B` : "-"} disabled />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            URL:
          </Col>
          <Col span={22}>
            <Input
              value={resource.url}
              onChange={e => this.onUpdateField("url", e.target.value)}
            />
          </Col>
        </Row>
        {resource.url && isImage && (
          <Row style={{marginTop: "20px"}} >
            <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
              {i18next.t("resource:Preview")}:
            </Col>
            <Col span={22}>
              <Image src={resource.url} width={200} style={{objectFit: "cover", borderRadius: 4}} preview={{mask: i18next.t("general:Preview")}} />
            </Col>
          </Row>
        )}
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {i18next.t("resource:Object type")}:
          </Col>
          <Col span={22}>
            <Input value={resource.objectType} disabled />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {i18next.t("resource:Object")}:
          </Col>
          <Col span={22}>
            <Input value={resource.objectId} disabled />
          </Col>
        </Row>
      </Card>
    );
  }

  render() {
    return (
      <div>
        {
          this.state.resource === null ? null : (
            <div>
              {this.renderResource()}
              <div style={{marginTop: "20px", marginLeft: "40px"}}>
                <Button size="large" onClick={() => this.props.history.push("/resources")}>{i18next.t("general:Cancel")}</Button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button type="primary" size="large" loading={this.state.loading} onClick={this.submitResourceEdit.bind(this)}>
                  {i18next.t("general:Save")}
                </Button>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default ResourceEditPage;
