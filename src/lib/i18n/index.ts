import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from "./locales/en.json";
import myTranslations from "./locales/my.json";

type TranslationTree = Record<string, unknown>;

function isObject(value: unknown): value is TranslationTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(
  base: TranslationTree,
  override: TranslationTree
): TranslationTree {
  const result: TranslationTree = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const existing = result[key];
    if (isObject(existing) && isObject(value)) {
      result[key] = deepMerge(existing, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

const resources = {
  en: {
    translation: enTranslations,
  },
  my: {
    translation: deepMerge(
      enTranslations as TranslationTree,
      myTranslations as TranslationTree
    ),
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ["en", "my"],
    fallbackLng: "en",
    debug: false,
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    interpolation: {
      escapeValue: false,
    },
    keySeparator: ".",
    nsSeparator: ":",
  });

i18n.on("languageChanged", (language) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language === "my" ? "my" : "en";
  }
});

export default i18n;
