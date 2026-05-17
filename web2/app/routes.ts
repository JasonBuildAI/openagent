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

    // Sites
    route("sites", "routes/SiteListPage.tsx"),
    route("sites/:owner/:siteName", "routes/SiteEditPage.tsx"),
  ]),
] satisfies RouteConfig
