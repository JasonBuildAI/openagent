import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Locales are loaded once at module initialisation time (client bundle only).
// SSR falls back to "en" since localStorage is unavailable server-side.
let initialLanguage = "en"
if (typeof localStorage !== "undefined") {
  const stored = localStorage.getItem("language")
  if (stored === "zh") initialLanguage = "zh"
}

// Lazily imported so the JSON does not bloat the SSR bundle
import en from "./locales/en/data.json"
import zh from "./locales/zh/data.json"

i18n.use(initReactI18next).init({
  lng: initialLanguage,
  resources: { en, zh },
  fallbackLng: "en",
  supportedLngs: ["en", "zh"],
  keySeparator: false,
  interpolation: { escapeValue: false },
  saveMissing: false,
})

export default i18n
export { i18n }
