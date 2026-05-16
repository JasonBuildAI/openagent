import { Link } from "react-router"
import {
  DatabaseIcon,
  LayoutGridIcon,
  MessageCircleIcon,
  PlugIcon,
  RocketIcon,
} from "lucide-react"

const quickLinks = [
  { title: "Chat", description: "Start a conversation with your AI assistant", href: "/chat", icon: MessageCircleIcon },
  { title: "Quick Setup", description: "Configure your AI in minutes", href: "/quick-setup", icon: RocketIcon },
  { title: "Stores", description: "Manage your knowledge stores", href: "/stores", icon: LayoutGridIcon },
  { title: "Providers", description: "Connect AI model providers", href: "/providers", icon: PlugIcon },
  { title: "Files", description: "Upload and manage knowledge files", href: "/files", icon: DatabaseIcon },
]

export function meta() {
  return [{ title: "OpenAgent" }]
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to OpenAgent</h1>
        <p className="mt-2 text-muted-foreground">
          Your self-hosted AI agent platform. Build agents that actually do things.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{item.title}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{item.description}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
