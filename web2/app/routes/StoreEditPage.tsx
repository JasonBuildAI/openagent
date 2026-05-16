import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Loader2Icon, XIcon, ChevronDownIcon, CheckIcon } from "lucide-react"
import { toast } from "sonner"
import i18next from "i18next"
import "~/i18n"

import { isAdminUser, isChatAdminUser, isLocalAdminUser } from "~/backend/AccountBackend"
import { type Store, claimStore, deleteStore, getStore, getStores, updateStore } from "~/backend/StoreBackend"
import {
  getProviderLogoUrl,
  getProviders,
  getServers,
  getSkills,
  getTools,
  type Provider,
} from "~/backend/ProviderBackend"
import { useAccount } from "~/context/AccountContext"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"

export function meta() {
  return [{ title: "Edit Store — OpenAgent" }]
}

// ── Helper components ─────────────────────────────────────────────────────────

function FormField({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function SectionCard({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <Card className="mt-4">
      <CardHeader className="border-b pb-4">
        <CardTitle>{title}</CardTitle>
        {desc && <CardDescription>{desc}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max,
}: {
  value: number | undefined
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <Input
      type="number"
      value={value ?? ""}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}

// Simple multi-select pill component
function MultiSelect({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string[]
  options: Array<{ label: string; value: string }>
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function toggle(v: string) {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v))
    } else {
      onChange([...value, v])
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={() => setOpen((o) => !o)}
      >
        {value.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          value.map((v) => {
            const opt = options.find((o) => o.value === v)
            return (
              <span
                key={v}
                className="inline-flex h-5 items-center gap-1 rounded bg-muted px-1.5 text-xs font-medium"
              >
                {opt?.label ?? v}
                <button
                  type="button"
                  className="ml-0.5 opacity-60 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggle(v)
                  }}
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            )
          })
        )}
        <ChevronDownIcon className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-md">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => toggle(opt.value)}
            >
              <span className="flex h-4 w-4 items-center justify-center">
                {value.includes(opt.value) && <CheckIcon className="h-3.5 w-3.5" />}
              </span>
              {opt.label}
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {i18next.t("general:No data")}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Tag input for free-form tags
function TagInput({
  value,
  onChange,
  placeholder,
  suggestions,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  suggestions?: string[]
}) {
  const [inputVal, setInputVal] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function add(v: string) {
    const trimmed = v.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputVal("")
    setOpen(false)
  }

  function remove(v: string) {
    onChange(value.filter((x) => x !== v))
  }

  const filtered = (suggestions ?? []).filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(inputVal.toLowerCase())
  )

  return (
    <div ref={ref} className="relative">
      <div className="flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        {value.map((v) => (
          <span
            key={v}
            className="inline-flex h-5 items-center gap-1 rounded bg-muted px-1.5 text-xs font-medium"
          >
            {v}
            <button
              type="button"
              className="opacity-60 hover:opacity-100"
              onClick={() => remove(v)}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          className="min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          value={inputVal}
          placeholder={value.length === 0 ? placeholder : ""}
          onChange={(e) => {
            setInputVal(e.target.value)
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              add(inputVal)
            }
            if (e.key === "Backspace" && !inputVal && value.length > 0) {
              remove(value[value.length - 1])
            }
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-md">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => add(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StoreEditPage() {
  const { owner, storeName } = useParams<{ owner: string; storeName: string }>()
  const navigate = useNavigate()
  const { account } = useAccount()

  const [store, setStore] = useState<Store | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [modelProviders, setModelProviders] = useState<Provider[]>([])
  const [storageProviders, setStorageProviders] = useState<Provider[]>([])
  const [embeddingProviders, setEmbeddingProviders] = useState<Provider[]>([])
  const [ttsProviders, setTtsProviders] = useState<Provider[]>([])
  const [sttProviders, setSttProviders] = useState<Provider[]>([])
  const [mcpServers, setMcpServers] = useState<Array<{ name: string; displayName?: string }>>([])
  const [skills, setSkills] = useState<Array<{ name: string; displayName?: string; state?: string }>>([])
  const [tools, setTools] = useState<Array<{ name: string; type?: string }>>([])
  const [isNewStore, setIsNewStore] = useState(false)
  const [saving, setSaving] = useState(false)
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)

  const isAdmin = isLocalAdminUser(account)
  const isGlobalAdmin = isAdminUser(account)

  const shouldShowClaim =
    store?.owner === "admin" &&
    isChatAdminUser(account) &&
    !isGlobalAdmin

  useEffect(() => {
    if (!owner || !storeName) return
    loadStore()
    if (account) {
      loadStores()
      loadProviders()
      loadMcpServers()
      loadSkills()
      loadTools()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, storeName])

  function loadStore() {
    if (!owner || !storeName) return
    getStore(owner, storeName).then((res) => {
      if (res.status === "ok") {
        const s = res.data as Store
        if (res.data2 && typeof res.data2 === "string" && res.data2 !== "") {
          s.error = res.data2
        }
        setStore(s)
        if (s.owner && s.owner !== owner) {
          navigate(`/stores/${s.owner}/${s.name}`, { replace: true })
        }
      } else {
        toast.error(`${i18next.t("general:Failed to get")}: ${res.msg}`)
      }
    })
  }

  function loadStores() {
    if (!account) return
    getStores(account.name).then((res) => {
      if (res.status === "ok") setStores(res.data ?? [])
    })
  }

  function loadProviders() {
    if (!account) return
    getProviders(account.name).then((res) => {
      if (res.status === "ok") {
        const all = (res.data ?? []) as Provider[]
        setModelProviders(all.filter((p) => p.category === "Model"))
        setStorageProviders(all.filter((p) => p.category === "Storage"))
        setEmbeddingProviders(all.filter((p) => p.category === "Embedding"))
        setTtsProviders(all.filter((p) => p.category === "Text-to-Speech"))
        setSttProviders(all.filter((p) => p.category === "Speech-to-Text"))
      }
    })
  }

  function loadMcpServers() {
    if (!account) return
    getServers(account.name).then((res) => {
      if (res.status === "ok") setMcpServers(res.data ?? [])
    })
  }

  function loadSkills() {
    if (!account) return
    getSkills(account.name).then((res) => {
      if (res.status === "ok") setSkills(res.data ?? [])
    })
  }

  function loadTools() {
    if (!account) return
    getTools(account.name).then((res) => {
      if (res.status === "ok") setTools(res.data ?? [])
    })
  }

  function update<K extends keyof Store>(key: K, value: Store[K]) {
    setStore((s) => (s ? { ...s, [key]: value } : null))
  }

  async function save(exit: boolean) {
    if (!store || !owner || !storeName) return
    setSaving(true)
    const payload = { ...store, fileTree: undefined }
    try {
      const res = await updateStore(owner, storeName, payload)
      if (res.status === "ok") {
        toast.success(i18next.t("general:Successfully saved"))
        setIsNewStore(false)
        window.dispatchEvent(new Event("storesChanged"))
        if (exit) {
          navigate("/stores")
        } else {
          navigate(`/stores/${store.owner}/${store.name}`, { replace: true })
        }
      } else {
        toast.error(`${i18next.t("general:Failed to save")}: ${res.msg}`)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (isNewStore && store) {
      deleteStore(store).then((res) => {
        if (res.status === "ok") {
          toast.success(i18next.t("general:Cancelled successfully"))
          window.dispatchEvent(new Event("storesChanged"))
          navigate("/stores")
        } else {
          toast.error(`${i18next.t("general:Failed to cancel")}: ${res.msg}`)
        }
      })
    } else {
      navigate("/stores")
    }
  }

  function handleClaim() {
    if (!store) return
    claimStore(store.owner, store.name).then((res) => {
      if (res.status === "ok") {
        toast.success(i18next.t("general:Successfully saved"))
        window.dispatchEvent(new Event("storesChanged"))
        const s = res.data as Store
        setStore(s)
        navigate(`/stores/${s.owner}/${s.name}`, { replace: true })
      } else {
        toast.error(`${i18next.t("general:Failed to save")}: ${res.msg}`)
      }
    })
    setClaimDialogOpen(false)
  }

  if (!store) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const providerSelectItems = (providers: Provider[]) =>
    providers.map((p) => (
      <SelectItem key={p.name} value={p.name}>
        <img
          src={getProviderLogoUrl(p)}
          alt={p.name}
          className="h-4 w-4 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
        />
        {p.displayName || p.name} ({p.name})
      </SelectItem>
    ))

  const allStores = stores.filter((s) => s.name !== store.name)
  const skillOptions = skills
    .filter((s) => s.state === "Active")
    .map((s) => ({ label: s.displayName ? `${s.displayName} (${s.name})` : s.name, value: s.name }))
  skillOptions.unshift({ label: i18next.t("store:All"), value: "All" })

  const toolOptions = tools.map((t) => ({ label: t.name, value: t.name }))
  toolOptions.unshift({ label: i18next.t("store:All"), value: "All" })

  const modelProviderOptions = modelProviders.map((p) => ({
    label: `${p.displayName || p.name} (${p.name})`,
    value: p.name,
  }))

  const storeOptions = allStores.map((s) => ({
    label: `${s.displayName} (${s.name})`,
    value: s.name,
  }))

  return (
    <div className="min-h-screen bg-background px-5 py-4 pb-16">
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{i18next.t("store:Edit Store")}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving}>
            {saving && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
            {i18next.t("general:Save")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => save(true)} disabled={saving}>
            {i18next.t("general:Save & Exit")}
          </Button>
          {isNewStore && (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              {i18next.t("general:Cancel")}
            </Button>
          )}
          {shouldShowClaim && (
            <Button variant="outline" size="sm" onClick={() => setClaimDialogOpen(true)}>
              {i18next.t("store:Claim")}
            </Button>
          )}
        </div>
      </div>

      {/* General Settings */}
      <SectionCard
        title={i18next.t("general:General Settings")}
        desc={i18next.t("general:General Settings desc")}
      >
        <FormField label={i18next.t("general:Owner")}>
          <Input value={store.owner} disabled={!isGlobalAdmin} onChange={(e) => update("owner", e.target.value)} />
        </FormField>
        <FormField label={i18next.t("general:Name")}>
          <Input value={store.name} onChange={(e) => update("name", e.target.value)} />
        </FormField>
        <FormField label={i18next.t("general:Display name")}>
          <Input value={store.displayName} onChange={(e) => update("displayName", e.target.value)} />
        </FormField>
        <FormField label={i18next.t("general:Title")}>
          <Input value={store.title} onChange={(e) => update("title", e.target.value)} />
        </FormField>
        <FormField label={i18next.t("general:State")}>
          <Select value={store.state} onValueChange={(v) => update("state", v ?? "Active")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">{i18next.t("general:Active")}</SelectItem>
              <SelectItem value="Inactive">{i18next.t("general:Inactive")}</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={i18next.t("general:Avatar")}>
          <Input value={store.avatar} onChange={(e) => update("avatar", e.target.value)} />
        </FormField>
        <FormField label={i18next.t("store:Is default")}>
          <div className="flex h-9 items-center">
            <Switch
              checked={store.isDefault}
              onCheckedChange={(checked) => update("isDefault", checked)}
            />
          </div>
        </FormField>
        <FormField label={i18next.t("store:Enable extra options")}>
          <div className="flex h-9 items-center">
            <Switch
              checked={store.enableExtraOptions ?? false}
              onCheckedChange={(checked) => update("enableExtraOptions", checked)}
            />
          </div>
        </FormField>
      </SectionCard>

      {/* Providers */}
      <SectionCard
        title={i18next.t("general:Providers")}
        desc={i18next.t("general:Providers desc")}
      >
        {store.enableExtraOptions && (
          <>
            <FormField label={i18next.t("store:Storage provider")}>
              <Select value={store.storageProvider || ""} onValueChange={(v) => update("storageProvider", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={i18next.t("general:empty")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{i18next.t("general:empty")}</SelectItem>
                  {providerSelectItems(storageProviders)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={i18next.t("store:Storage subpath")}>
              <Input
                value={store.storageSubpath ?? ""}
                onChange={(e) => update("storageSubpath", e.target.value)}
              />
            </FormField>
            <FormField label={i18next.t("store:Split provider")}>
              <Select value={store.splitProvider || "Default"} onValueChange={(v) => update("splitProvider", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Default", "Basic", "QA", "Markdown"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={i18next.t("store:Search provider")}>
              <Select value={store.searchProvider || "Default"} onValueChange={(v) => update("searchProvider", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Default", "Hierarchy"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </>
        )}
        <FormField label={i18next.t("provider:Model provider")}>
          <Select value={store.modelProvider || ""} onValueChange={(v) => update("modelProvider", v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={i18next.t("general:empty")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{i18next.t("general:empty")}</SelectItem>
              {providerSelectItems(modelProviders)}
            </SelectContent>
          </Select>
        </FormField>
        {store.enableExtraOptions && (
          <>
            <FormField label={i18next.t("store:Embedding provider")}>
              <Select value={store.embeddingProvider || ""} onValueChange={(v) => update("embeddingProvider", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={i18next.t("general:empty")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{i18next.t("general:empty")}</SelectItem>
                  {providerSelectItems(embeddingProviders)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={i18next.t("store:MCP server")}>
              <Select value={store.mcpServer || ""} onValueChange={(v) => update("mcpServer", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={i18next.t("general:empty")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{i18next.t("general:empty")}</SelectItem>
                  {mcpServers.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.displayName || s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={i18next.t("general:Skills")} className="sm:col-span-2">
              <MultiSelect
                value={store.skills ?? []}
                options={skillOptions}
                onChange={(v) => update("skills", v)}
                placeholder={i18next.t("store:Select skills")}
              />
            </FormField>
            <FormField label={i18next.t("general:Tools")} className="sm:col-span-2">
              <MultiSelect
                value={store.tools ?? []}
                options={toolOptions}
                onChange={(v) => update("tools", v)}
                placeholder={i18next.t("store:Select tools")}
              />
            </FormField>
          </>
        )}
        <FormField label={i18next.t("store:Text-to-Speech provider")}>
          <Select value={store.textToSpeechProvider || ""} onValueChange={(v) => update("textToSpeechProvider", v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={i18next.t("general:empty")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{i18next.t("general:empty")}</SelectItem>
              <SelectItem value="Browser Built-In">Browser Built-In</SelectItem>
              {providerSelectItems(ttsProviders)}
            </SelectContent>
          </Select>
        </FormField>
        {store.enableExtraOptions && (
          <>
            <FormField label={i18next.t("store:Speech-to-Text provider")}>
              <Select value={store.speechToTextProvider || ""} onValueChange={(v) => update("speechToTextProvider", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={i18next.t("general:empty")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{i18next.t("general:empty")}</SelectItem>
                  <SelectItem value="Browser Built-In">Browser Built-In</SelectItem>
                  {providerSelectItems(sttProviders)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={i18next.t("store:Enable TTS streaming")}>
              <div className="flex h-9 items-center">
                <Switch
                  checked={store.enableTtsStreaming ?? false}
                  onCheckedChange={(v) => update("enableTtsStreaming", v)}
                />
              </div>
            </FormField>
          </>
        )}
        <FormField label={i18next.t("store:Memory limit")}>
          <NumberInput
            value={store.memoryLimit}
            onChange={(v) => update("memoryLimit", v)}
            min={0}
          />
        </FormField>
        {store.enableExtraOptions && (
          <>
            <FormField label={i18next.t("store:Frequency")}>
              <NumberInput value={store.frequency} onChange={(v) => update("frequency", v)} min={0} />
            </FormField>
            <FormField label={i18next.t("store:Limit minutes")}>
              <NumberInput value={store.limitMinutes} onChange={(v) => update("limitMinutes", v)} min={0} />
            </FormField>
          </>
        )}
      </SectionCard>

      {/* Chat */}
      <Card className="mt-4">
        <CardHeader className="border-b pb-4">
          <CardTitle>{i18next.t("general:Chat")}</CardTitle>
          <CardDescription>{i18next.t("general:Chat desc")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label={i18next.t("store:Welcome")}>
              <Input value={store.welcome ?? ""} onChange={(e) => update("welcome", e.target.value)} />
            </FormField>
            <FormField label={i18next.t("store:Welcome title")}>
              <Input value={store.welcomeTitle ?? ""} onChange={(e) => update("welcomeTitle", e.target.value)} />
            </FormField>
            <FormField label={i18next.t("store:Welcome text")}>
              <Input value={store.welcomeText ?? ""} onChange={(e) => update("welcomeText", e.target.value)} />
            </FormField>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <FormField label={i18next.t("store:Prompt")}>
              <Textarea
                value={store.prompt ?? ""}
                onChange={(e) => update("prompt", e.target.value)}
                className="min-h-24"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <SectionCard
        title={i18next.t("general:Options")}
        desc={i18next.t("general:Options desc")}
      >
        <FormField label={i18next.t("store:Knowledge count")}>
          <NumberInput
            value={store.knowledgeCount}
            onChange={(v) => update("knowledgeCount", v)}
            min={0}
            max={100}
          />
        </FormField>
        <FormField label={i18next.t("store:Suggestion count")}>
          <NumberInput
            value={store.suggestionCount}
            onChange={(v) => update("suggestionCount", v)}
            min={0}
            max={10}
          />
        </FormField>
        <FormField label={i18next.t("store:Memory limit")}>
          <NumberInput value={store.memoryLimit} onChange={(v) => update("memoryLimit", v)} min={0} />
        </FormField>
        {store.enableExtraOptions && (
          <>
            <FormField label={i18next.t("store:Frequency")}>
              <NumberInput value={store.frequency} onChange={(v) => update("frequency", v)} min={0} />
            </FormField>
            <FormField label={i18next.t("store:Limit minutes")}>
              <NumberInput value={store.limitMinutes} onChange={(v) => update("limitMinutes", v)} min={0} />
            </FormField>
            <FormField label={i18next.t("store:Vector stores")} className="sm:col-span-2">
              <TagInput
                value={store.vectorStores ?? []}
                onChange={(v) => update("vectorStores", v)}
                suggestions={allStores.map((s) => s.name)}
                placeholder={i18next.t("store:Vector stores")}
              />
            </FormField>
            <FormField label={i18next.t("store:Child stores")} className="sm:col-span-2">
              <TagInput
                value={store.childStores ?? []}
                onChange={(v) => update("childStores", v)}
                suggestions={allStores.map((s) => s.name)}
                placeholder={i18next.t("store:Child stores")}
              />
            </FormField>
          </>
        )}
        <FormField label={i18next.t("store:Child model providers")} className="sm:col-span-2">
          <TagInput
            value={store.childModelProviders ?? []}
            onChange={(v) => update("childModelProviders", v)}
            suggestions={modelProviders.map((p) => p.name)}
            placeholder={i18next.t("store:Child model providers")}
          />
        </FormField>
        <FormField label={i18next.t("store:Forbidden words")} className="sm:col-span-2">
          <TagInput
            value={store.forbiddenWords ?? []}
            onChange={(v) => update("forbiddenWords", v)}
            placeholder={i18next.t("store:Forbidden words")}
          />
        </FormField>
        <FormField label={i18next.t("store:Show auto read")}>
          <div className="flex h-9 items-center">
            <Switch
              checked={store.showAutoRead ?? false}
              onCheckedChange={(v) => update("showAutoRead", v)}
            />
          </div>
        </FormField>
        <FormField label={i18next.t("store:Disable file upload")}>
          <div className="flex h-9 items-center">
            <Switch
              checked={store.disableFileUpload ?? false}
              onCheckedChange={(v) => update("disableFileUpload", v)}
            />
          </div>
        </FormField>
        <FormField label={i18next.t("store:Hide thinking")}>
          <div className="flex h-9 items-center">
            <Switch
              checked={store.hideThinking ?? false}
              onCheckedChange={(v) => update("hideThinking", v)}
            />
          </div>
        </FormField>
      </SectionCard>

      {/* Bottom action bar */}
      <div className="mt-6 flex items-center gap-2">
        <Button onClick={() => save(false)} disabled={saving}>
          {saving && <Loader2Icon className="h-4 w-4 animate-spin" />}
          {i18next.t("general:Save")}
        </Button>
        <Button variant="outline" onClick={() => save(true)} disabled={saving}>
          {i18next.t("general:Save & Exit")}
        </Button>
        {isNewStore && (
          <Button variant="outline" onClick={handleCancel}>
            {i18next.t("general:Cancel")}
          </Button>
        )}
        {shouldShowClaim && (
          <Button variant="outline" onClick={() => setClaimDialogOpen(true)}>
            {i18next.t("store:Claim")}
          </Button>
        )}
      </div>

      {/* Claim dialog */}
      <AlertDialog open={claimDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i18next.t("store:Claim")}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18next.t("store:Claim")} {store.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClaimDialogOpen(false)}>
              {i18next.t("general:Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleClaim}>
              {i18next.t("general:OK")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
