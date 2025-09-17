"use client";
import React from "react";
import { useTranslation } from "./I18nProvider";

function setNextLocaleCookie(locale: string) {
  try {
    document.cookie = `NEXT_LOCALE=${locale}; Max-Age=31536000; Path=/`;
  } catch {}
}

export function FloatingLanguage() {
  const { t, locale, setLocale } = useTranslation();

  const change = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value as "en" | "sw";
    setLocale(nextLocale);
    setNextLocaleCookie(nextLocale);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="backdrop-blur-md bg-background/70 border border-default-200 rounded-xl shadow-xl p-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-default-500">{t("language.label")}</span>
          <select
            className="border rounded-md px-2 py-1 text-sm text-foreground bg-content2 focus:outline-none focus:ring-2 focus:ring-primary-400"
            onChange={change}
            value={locale}
          >
            <option value="en">{t("language.en")}</option>
            <option value="sw">{t("language.sw")}</option>
          </select>
        </label>
      </div>
    </div>
  );
}
