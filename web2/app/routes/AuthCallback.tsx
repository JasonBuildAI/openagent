import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { signin } from "~/backend/AccountBackend"

export default function CallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const code = params.get("code")
    const state = params.get("state")
    if (!code || !state) { navigate("/signin"); return }
    signin(code, state).then((res) => {
      navigate(res.status === "ok" ? "/" : "/signin")
    }).catch(() => navigate("/signin"))
  }, [])

  return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Signing in…</p></div>
}
