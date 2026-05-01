<h1 align="center">OpenAgent</h1>
<h3 align="center">Next-generation personal AI assistant powered by LLM, RAG and agent loops,<br>supporting computer-use, browser-use and coding agent</h3>

<p align="center">
  <a href="https://github.com/the-open-agent/openagent/actions/workflows/build.yml">
    <img alt="Build" src="https://github.com/the-open-agent/openagent/workflows/Build/badge.svg?style=flat-square">
  </a>
  <a href="https://github.com/the-open-agent/openagent/releases/latest">
    <img alt="Release" src="https://img.shields.io/github/v/release/the-open-agent/openagent.svg">
  </a>
  <a href="https://hub.docker.com/r/casbin/openagent">
    <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/casbin/openagent.svg">
  </a>
  <a href="https://goreportcard.com/report/github.com/the-open-agent/openagent">
    <img alt="Go Report Card" src="https://goreportcard.com/badge/github.com/the-open-agent/openagent?style=flat-square">
  </a>
  <a href="https://github.com/the-open-agent/openagent/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/the-open-agent/openagent?style=flat-square">
  </a>
  <a href="https://discord.gg/5rPsrAzK7S">
    <img alt="Discord" src="https://img.shields.io/discord/1022748306096537660?logo=discord&label=discord&color=5865F2">
  </a>
</p>

---

OpenAgent is an open-source personal AI assistant that brings together powerful LLMs, your own knowledge base, and autonomous agent loops — all in one self-hostable platform. Connect any model provider, build a RAG knowledge base from your documents, and let agents browse the web, run code, and call any MCP-compatible tool on your behalf.

## Online Demo

|                  | URL                          | Notes                                             |
|------------------|------------------------------|---------------------------------------------------|
| **Live Preview** | https://demo.openagentai.org | Read-only tour — no account needed                |
| **Playground**   | https://try.openagentai.org  | Make changes freely — data resets every 5 minutes |

## Quick Start

Pre-built binaries are available for Linux, macOS, and Windows (amd64 / arm64). The install script downloads the latest release, installs it, and starts the server on **port 14000**.

### Install binary (recommended)

**macOS / Linux / WSL**

```bash
curl -fsSL --proto '=https' --tlsv1.2 \
  https://raw.githubusercontent.com/the-open-agent/openagent/master/scripts/install.sh | bash
```

**Windows (PowerShell)**

```powershell
irm https://raw.githubusercontent.com/the-open-agent/openagent/master/scripts/install.ps1 | iex
```

Then open [http://localhost:14000](http://localhost:14000).

Optional environment variables: `OPENAGENT_VERSION`, `INSTALL_DIR`, `BIN_DIR`.

### Build from source

```bash
# Backend
go build

# Frontend
cd web && yarn install && yarn start
```

## Highlights

### Agent Loops

- **Browser-Use** — drive a real browser: navigate, click, fill forms, scrape, and screenshot pages
- **Web Search & Fetch** — search the web and pull page content directly into the agent's context
- **Shell Execution** — run shell commands and scripts from within the agent loop
- **Office Automation** — read and write Word, Excel, and PowerPoint files
- **MCP (Model Context Protocol)** — connect any MCP-compatible server over SSE, Stdio, or StreamableHTTP and expose its tools to the agent
- **Transparent Tool Calls** — see exactly which tool was invoked, with what arguments, and what it returned, step by step

### RAG & Knowledge Base

- **Document Ingestion** — upload PDFs, Word docs, Excel sheets, and more; they are chunked, embedded, and indexed automatically
- **Semantic Search** — every chat retrieves the most relevant passages from your knowledge base before the LLM responds
- **Pluggable Embedding Providers** — OpenAI, Azure, Gemini, Qwen, Cohere, Jina, HuggingFace, local models, and more
- **Per-Store Isolation** — organise knowledge into separate stores and assign them to individual chats or applications

### 30+ Model Providers

Works out of the box with all major LLM providers — configure as many as you like and switch between them per chat:

OpenAI · Azure OpenAI · Claude (Anthropic) · Gemini (Google) · DeepSeek · Mistral · Grok · Qwen · Doubao · Moonshot · ChatGLM · Baichuan · Ernie · iFlytek · HuggingFace · Cohere · Amazon Bedrock · OpenRouter · local models · and more

### Workflow Automation

- **Visual Workflow Builder** — compose multi-step pipelines with a BPMN-style editor
- **Conditional & Parallel Execution** — branch on gateway conditions and run tasks concurrently
- **Task Scheduling** — run workflows or agent jobs on a recurring schedule
- **Usage Analytics** — track token consumption and cost per provider, model, and user

### Platform Features

- **Single Sign-On** — OIDC / OAuth2 / LDAP / SAML via the integrated auth layer
- **Multi-tenant** — separate workspaces per user or organisation
- **REST API + Swagger UI** — every feature is accessible programmatically
- **Audit Logs** — full activity history for every action
- **File & Video Management** — built-in storage for files, images, and video content

## Documentation

https://www.openagentai.org/

## Community

- Discord: https://discord.gg/5rPsrAzK7S
- Issues and PRs are welcome — please open an issue first to discuss larger changes

## License

[Apache-2.0](https://github.com/the-open-agent/openagent/blob/master/LICENSE)
