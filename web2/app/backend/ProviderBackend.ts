import { apiFetch, apiPost } from "~/lib/api"

export type Provider = {
  owner: string
  name: string
  displayName?: string
  category: string
  type: string
  state?: string
  logoUrl?: string
}

export function getProviders(owner: string): Promise<any> {
  return apiFetch(`/api/get-providers?owner=${encodeURIComponent(owner)}`)
}

export function getProvider(owner: string, name: string): Promise<any> {
  return apiFetch(`/api/get-provider?id=${encodeURIComponent(owner)}/${encodeURIComponent(name)}`)
}

export function isProviderSupportWebSearch(provider: Provider): boolean {
  if (!provider || provider.category !== "Model") return false
  const supportedTypes = ["OpenAI", "Alibaba Cloud", "Baidu", "Tencent Cloud", "ByteDance", "Moonshot", "DeepSeek"]
  return supportedTypes.includes(provider.type)
}

export function getServers(owner: string): Promise<any> {
  return apiFetch(`/api/get-servers?owner=${encodeURIComponent(owner)}`)
}

export function getSkills(owner: string): Promise<any> {
  return apiFetch(`/api/get-skills?owner=${encodeURIComponent(owner)}`)
}

export function getTools(owner: string): Promise<any> {
  return apiFetch(`/api/get-tools?owner=${encodeURIComponent(owner)}`)
}

export function getStorageProviders(owner: string): Promise<any> {
  return apiFetch(`/api/get-storage-providers?owner=${encodeURIComponent(owner)}`)
}

const PROVIDER_LOGO_BASE = "https://cdn.openagentai.org/img/social_"

const TYPE_LOGO_MAP: Record<string, string> = {
  // Model
  "OpenAI": "openai.png",
  "Azure": "azure.png",
  "Anthropic": "anthropic.png",
  "Google": "google.png",
  "Gemini": "google.png",
  "Mistral": "mistral.png",
  "Ollama": "ollama.png",
  "Groq": "groq.png",
  "Cohere": "cohere.png",
  "HuggingFace": "huggingface.png",
  "Local": "local.png",
  // Storage
  "AWS S3": "aws.png",
  "Azure Blob": "azure.png",
  "Google Cloud": "google.png",
  "Tencent Cloud": "tencent.png",
  "Aliyun": "aliyun.png",
  "Local File System": "local.png",
  "MinIO": "minio.png",
}

export function getProviderLogoUrl(provider: { type: string; category?: string }): string {
  const logo = TYPE_LOGO_MAP[provider.type]
  if (logo) return `${PROVIDER_LOGO_BASE}${logo}`
  return `${PROVIDER_LOGO_BASE}default.png`
}

export function getProviderDisplayName(provider: Provider): string {
  return provider.displayName || provider.name
}
