import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  LockKeyhole,
  UserRound,
} from "lucide-react"
import i18next from "i18next"

import { getSigninOptions, signinWithPassword } from "~/backend/AccountBackend"
import { getSigninUrl, getSignupUrl } from "~/lib/AuthConfig"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import "~/i18n"

export function meta() {
  return [{ title: "Sign In - OpenAgent" }]
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
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    let cancelled = false
    getSigninOptions()
      .then((res) => {
        if (cancelled) {
          return
        }

        if (res.status === "ok" && res.data?.casdoorAvailable) {
          const signinUrl = getSigninUrl()
          if (signinUrl) {
            window.location.replace(signinUrl)
            return
          }
        }

        setLoading(false)
        setShowSignin(
          res.status === "ok" &&
            !res.data?.casdoorAvailable &&
            !!res.data?.signinAvailable
        )
        setErrorMessage(res.status === "ok" ? "" : (res.msg ?? ""))
      })
      .catch((err: Error) => {
        if (cancelled) {
          return
        }

        setLoading(false)
        setShowSignin(false)
        setErrorMessage(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!loading && showSignin) {
      passwordRef.current?.focus()
    }
  }, [loading, showSignin])

  useEffect(() => {
    if (titleDone) {
      return
    }

    if (prefersReducedMotion) {
      setTitleText(fullTitle)
      setTitleDone(true)
      return
    }

    let i = 0
    const timer = setInterval(() => {
      i += 1
      setTitleText(fullTitle.slice(0, i))
      if (i >= fullTitle.length) {
        clearInterval(timer)
        setTitleDone(true)
      }
    }, 60)

    return () => clearInterval(timer)
  }, [titleDone, prefersReducedMotion, fullTitle])

  const signupUrl = getSignupUrl()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) {
      return
    }

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

  const inputClassName =
    "h-11 rounded-lg bg-background pl-10 shadow-none transition-colors"

  function renderCard() {
    if (loading) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">
              {i18next.t("login:Signing in...")}
            </CardTitle>
            <CardDescription>
              {i18next.t("login:Preparing the workspace entry screen.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {i18next.t("login:Loading OpenAgent sign in.")}
            </p>
          </CardContent>
        </Card>
      )
    }

    if (!showSignin) {
      const message =
        errorMessage || i18next.t("account:Sign in is unavailable")

      return (
        <Card className="w-full">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <CardTitle className="text-2xl">
              {i18next.t("login:Login Error")}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>{i18next.t("login:Login Error")}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            <Button
              className="h-11 w-full"
              variant="outline"
              onClick={() => navigate("/")}
            >
              {i18next.t("general:Back Home")}
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">
            {i18next.t("login:Welcome back")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <UserRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={i18next.t("general:Username")}
                  className={inputClassName}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{i18next.t("general:Password")}</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={i18next.t("general:Password")}
                  className={inputClassName}
                  disabled={submitting}
                />
              </div>
            </div>

            <Button type="submit" className="h-11 w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {i18next.t("account:Sign In")}
                </>
              ) : (
                <>
                  {i18next.t("account:Sign In")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {signupUrl && (
            <div className="flex justify-end text-sm">
              <a
                href={signupUrl}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {i18next.t("account:Sign Up")}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <img
          src="https://cdn.openagentai.org/img/openagent-logo_1900x450.png"
          alt="OpenAgent"
          className="absolute top-4 left-4 h-10 w-auto object-contain sm:top-6 sm:left-6 sm:h-12 lg:top-8 lg:left-8 lg:h-14"
        />

        <section className="w-full max-w-6xl space-y-4 pt-16 text-center sm:pt-20">
          <h1 className="mx-auto max-w-5xl text-4xl leading-tight font-semibold tracking-normal text-balance text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {titleText}
            <span
              className={`ml-0.5 inline-block h-[0.85em] w-[3px] bg-primary align-middle ${
                titleDone ? "animate-pulse" : ""
              }`}
            />
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            {i18next.t(
              "login:Self-hosted. 30+ model providers. Full MCP support. Your personal AI assistant."
            )}
          </p>
        </section>

        <section className="mt-8 flex w-full justify-center sm:mt-10">
          <div className="w-full max-w-[480px]">{renderCard()}</div>
        </section>
      </div>
    </div>
  )
}
