import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { AlertCircle, ArrowRight, Loader2, LockKeyhole, UserRound } from "lucide-react"
import i18next from "i18next"

import { getSigninOptions, signinWithPassword } from "~/backend/AccountBackend"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import "~/i18n"

export function meta() {
  return [{ title: "Sign In — OpenAgent" }]
}

export default function SigninPage() {
  const navigate = useNavigate()
  const passwordRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [showSignin, setShowSignin] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("")
  const [titleText, setTitleText] = useState("")
  const [titleDone, setTitleDone] = useState(false)

  const fullTitle = i18next.t("login:Build agents that actually do things.")
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    let cancelled = false
    getSigninOptions().then((res) => {
      if (cancelled) return
      if (res.status === "ok" && res.data?.casdoorAvailable) {
        // Redirect to Casdoor login — will be handled once Casdoor integration is added
        return
      }
      setLoading(false)
      setShowSignin(res.status === "ok" && !(res.data?.casdoorAvailable ?? false) && (res.data?.signinAvailable ?? false))
      setErrorMessage(res.status === "ok" ? "" : res.msg ?? "")
    }).catch((err: Error) => {
      if (cancelled) return
      setLoading(false)
      setShowSignin(false)
      setErrorMessage(err.message)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!loading && showSignin) passwordRef.current?.focus()
  }, [loading, showSignin])

  useEffect(() => {
    if (titleDone) return
    if (prefersReducedMotion) { setTitleText(fullTitle); setTitleDone(true); return }
    let i = 0
    const timer = setInterval(() => {
      i++
      setTitleText(fullTitle.slice(0, i))
      if (i >= fullTitle.length) { clearInterval(timer); setTitleDone(true) }
    }, 60)
    return () => clearInterval(timer)
  }, [titleDone, prefersReducedMotion, fullTitle])

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  const backgroundStyle = isDark
    ? { backgroundImage: "radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05), transparent 22%), linear-gradient(180deg, #090909 0%, #111111 100%)" }
    : { backgroundImage: "radial-gradient(circle at top left, rgba(0,0,0,0.06), transparent 28%), radial-gradient(circle at 80% 20%, rgba(0,0,0,0.045), transparent 22%), linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)" }

  const inputCls = "h-11 rounded-xl border border-border/30 bg-transparent px-4 shadow-none placeholder:text-muted-foreground/70 transition-all duration-200 hover:border-border/50 focus-visible:border-indigo-500/30 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
  const buttonCls = "group h-11 w-full rounded-xl border-0 bg-indigo-600 text-white shadow-[0_14px_28px_rgba(79,70,229,0.20)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-[0_20px_42px_rgba(79,70,229,0.28)] hover:ring-2 hover:ring-indigo-400/25 active:translate-y-0 active:scale-[0.99]"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setErrorMessage("")
    try {
      const res = await signinWithPassword(username, password)
      if (res.status === "ok") {
        const from = sessionStorage.getItem("from") || "/"
        sessionStorage.removeItem("from")
        navigate(from)
        return
      }
      setErrorMessage(res.msg || i18next.t("login:Login Error"))
      setPassword("")
      passwordRef.current?.focus()
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Unknown error")
      setPassword("")
      passwordRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  function renderCard() {
    if (loading) {
      return (
        <div className="relative w-full overflow-hidden rounded-[28px]">
          <div className="space-y-2 px-6 py-5">
            <div className="text-2xl font-semibold">{i18next.t("login:Signing in...")}</div>
            <div className="text-sm text-muted-foreground">{i18next.t("login:Preparing the workspace entry screen.")}</div>
          </div>
          <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{i18next.t("login:Loading OpenAgent sign in.")}</p>
          </div>
        </div>
      )
    }

    if (!showSignin) {
      return (
        <div className="relative w-full overflow-hidden rounded-[28px]">
          <div className="space-y-3 px-6 py-5">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <div>
              <div className="text-2xl font-semibold">{i18next.t("login:Login Error")}</div>
              <div className="mt-2 text-sm text-muted-foreground">{errorMessage || i18next.t("account:Sign in is unavailable")}</div>
            </div>
          </div>
          <div className="space-y-4 px-6 py-6">
            <Alert variant="destructive">
              <AlertTitle>{i18next.t("login:Login Error")}</AlertTitle>
              <AlertDescription>{errorMessage || i18next.t("account:Sign in is unavailable")}</AlertDescription>
            </Alert>
            <Button className="h-11 w-full rounded-xl" variant="outline" onClick={() => navigate("/")}>
              {i18next.t("general:Back Home")}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="relative w-full overflow-hidden rounded-[28px]">
        <div className="space-y-2 px-6 py-5">
          <div className="text-2xl font-semibold sm:text-3xl">{i18next.t("login:Welcome back")}</div>
        </div>
        <div className="space-y-4 px-6 py-6">
          {errorMessage && (
            <Alert variant="destructive">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <AlertTitle>{i18next.t("login:Login Error")}</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </div>
              </div>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">{i18next.t("general:Username")}</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="username" name="username" autoComplete="username" value={username}
                  onChange={(e) => setUsername(e.target.value)} placeholder={i18next.t("general:Username")}
                  className={inputCls + " pl-10"} disabled={submitting} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{i18next.t("general:Password")}</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input ref={passwordRef} id="password" name="password" type="password" autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={i18next.t("general:Password")} className={inputCls + " pl-10"} disabled={submitting} />
              </div>
            </div>
            <Button type="submit" className={buttonCls} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{i18next.t("account:Sign In")}</>
              ) : (
                <>{i18next.t("account:Sign In")}<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground" style={backgroundStyle}>
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <img
          src="https://cdn.openagentai.org/img/openagent-logo_1900x450.png"
          alt="OpenAgent"
          className="absolute left-0 top-4 h-10 w-auto object-contain sm:left-0 sm:top-6 sm:h-12 lg:left-0 lg:top-8 lg:h-14"
        />
        <section className="w-full max-w-6xl space-y-6 pt-12 text-center sm:pt-16">
          <h1 className="whitespace-nowrap bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400 sm:text-5xl md:text-6xl lg:text-7xl">
            {titleText}
            <span className={`inline-block w-[3px] h-[0.85em] align-middle bg-fuchsia-500 ml-0.5 ${titleDone ? "animate-pulse" : ""}`} />
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            {i18next.t("login:Self-hosted. 30+ model providers. Full MCP support. Your personal AI assistant.")}
          </p>
        </section>
        <section className="relative mt-8 flex w-full items-center justify-center gap-4 sm:mt-10 sm:gap-8">
          <div className="hidden flex-1 lg:flex items-center justify-center overflow-hidden">
            <div className="h-24 w-24 rounded-full bg-indigo-500/10 blur-xl" style={{ animation: "float-left 6s ease-in-out infinite" }} />
          </div>
          <div className="w-full max-w-[480px] shrink-0">{renderCard()}</div>
          <div className="relative hidden flex-1 lg:flex items-center justify-center overflow-hidden">
            <div className="absolute h-72 w-72 rounded-full border border-indigo-500/10" style={{ animation: "spin 20s linear infinite" }} />
            <div className="absolute h-64 w-64 rounded-full border border-violet-500/10" style={{ animation: "spin 25s linear infinite reverse" }} />
            <div className="absolute h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-fuchsia-500/10 blur-xl" />
          </div>
        </section>
      </div>
    </div>
  )
}
