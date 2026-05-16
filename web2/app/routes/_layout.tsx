import { Outlet } from "react-router"

import { AppFooter } from "~/components/layout/AppFooter"
import { AppHeader } from "~/components/layout/AppHeader"
import { AppSidebar } from "~/components/layout/AppSidebar"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"

// Placeholder account — replace with real auth context when migrated
const mockAccount = {
  name: "admin",
  displayName: "Admin",
  avatar: "",
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader account={mockAccount} onSignOut={() => {}} />
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}
