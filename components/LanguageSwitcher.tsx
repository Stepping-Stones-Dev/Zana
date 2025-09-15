import React from "react";
import { useTranslation } from "@/providers/I18nProvider";
// No router import needed; we defer navigation to the next link click

function setNextLocaleCookie(locale: string) {
  try {
    // Persist locale for future navigations and SSR via Next.js i18n
    document.cookie = `NEXT_LOCALE=${locale}; Max-Age=31536000; Path=/`;
  } catch {
    // ignore cookie set failures
  }
}

export function LanguageSwitcher() {
  const { t, locale, setLocale } = useTranslation();

  const change = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value as "en" | "sw";
    if (typeof window === "undefined") return;

    // Update provider immediately for UI text, and persist selection
    setLocale(nextLocale);
    setNextLocaleCookie(nextLocale);
  // No immediate navigation. The NEXT_LOCALE cookie + components that pass
  // locale to NextLink/Router will ensure the next navigation uses it.
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-default-500">{t("language.label")}</span>
      <select className="bg-transparent border rounded-md px-2 py-1 text-sm" onChange={change} value={locale}>
        <option value="en">{t("language.en")}</option>
        <option value="sw">{t("language.sw")}</option>
      </select>
    </label>
  );
}
