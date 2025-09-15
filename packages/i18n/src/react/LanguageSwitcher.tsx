"use client";
import React from "react";
import { useTranslation } from "./I18nProvider.js";

function setNextLocaleCookie(locale: string) {
  try {
    document.cookie = `NEXT_LOCALE=${locale}; Max-Age=31536000; Path=/`;
  } catch {}
}

export function LanguageSwitcher() {
  const { t, locale, setLocale } = useTranslation();

  const change = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value as "en" | "sw";
    if (typeof window === "undefined") return;
    setLocale(nextLocale);
    setNextLocaleCookie(nextLocale);
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
