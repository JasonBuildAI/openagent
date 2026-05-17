import { Outlet, useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

import { AccountProvider, useAccount } from "~/context/AccountContext"
import { AppFooter } from "~/components/layout/AppFooter"
import { AppHeader } from "~/components/layout/AppHeader"
import { AppSidebar } from "~/components/layout/AppSidebar"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import "~/i18n"

function LayoutInner() {
  const { i18n } = useTranslation()
  const { account, handleSignout } = useAccount()
  const navigate = useNavigate()

  // Redirect to signin when explicitly not authenticated (null = confirmed no session)
  if (account === null) {
    navigate("/signin")
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar account={account ?? undefined} />
      <SidebarInset>
        <AppHeader account={account ?? undefined} onSignOut={handleSignout} />
        <main className="flex flex-1 flex-col">
          <Outlet key={i18n.language} />
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AppLayout() {
  return (
    <AccountProvider>
      <LayoutInner />
    </AccountProvider>
  )
}
