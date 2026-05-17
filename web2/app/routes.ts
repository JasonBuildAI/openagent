import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  // Auth routes (outside layout — no sidebar/header)
  route("signin", "routes/SigninPage.tsx"),
  route("callback", "routes/AuthCallback.tsx"),

  // Main app layout
  layout("routes/_layout.tsx", [
    index("routes/HomePage.tsx"),

    // Stores
    route("stores", "routes/StoreListPage.tsx"),
    route("stores/:owner/:storeName", "routes/StoreEditPage.tsx"),

    // Providers
    route("providers", "routes/ProviderListPage.tsx"),
    route("providers/:providerName", "routes/ProviderEditPage.tsx"),

    // Sites
    route("sites", "routes/SiteListPage.tsx"),
    route("sites/:owner/:siteName", "routes/SiteEditPage.tsx"),

    // System Info
    route("sysinfo", "routes/SystemInfoPage.tsx"),

    // Chat
    route("chat", "routes/ChatPage.tsx", { id: "chat" }),
    route("chat/:chatName", "routes/ChatPage.tsx", { id: "chat-by-name" }),
    route(":owner/:storeName/chat", "routes/ChatPage.tsx", { id: "store-chat" }),
    route(":owner/:storeName/chat/:chatName", "routes/ChatPage.tsx", { id: "store-chat-by-name" }),
  ]),
] satisfies RouteConfig
