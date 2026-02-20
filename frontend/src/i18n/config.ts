import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ko from "./locales/ko/translation.json";
import en from "./locales/en/translation.json";

const STORAGE_KEY = "wordapp-lang";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    lng: localStorage.getItem(STORAGE_KEY) ?? "ko",
    fallbackLng: "ko",
    supportedLngs: ["ko", "en"],
    interpolation: { escapeValue: false },
    detection: { order: [] }, // disable auto-detection; use explicit selection
  });

// Persist language choice whenever it changes
i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
