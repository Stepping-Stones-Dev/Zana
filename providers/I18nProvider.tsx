import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Dict = Record<string, any>;

// Namespaces to load and merge for each locale. Keep in sync with files under /locales.
const NAMESPACES = ["common", "features", "pricing"] as const;

function deepMerge(target: Dict, source: Dict): Dict {
  const out: Dict = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge(out[k] ?? {}, v as Dict);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function getLocaleDict(locale: string): Dict {
  const isSw = locale?.toLowerCase().startsWith("sw");

  // Load English base first as a guaranteed fallback
  let enDict: Dict = {};
  for (const ns of NAMESPACES) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const part = require(`../locales/en/${ns}.json`);
    enDict = deepMerge(enDict, part);
  }

  if (!isSw) {
    return enDict;
  }

  // Load Swahili overlays and merge onto English
  let swDict: Dict = {};
  for (const ns of NAMESPACES) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const part = require(`../locales/sw/${ns}.json`);
      swDict = deepMerge(swDict, part);
    } catch {
      // missing namespace in sw is okay; English will be used
    }
  }
  return deepMerge(enDict, swDict);
}

type Ctx = {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: string;
  setLocale: (loc: string) => void;
};
const I18nCtx = createContext<Ctx>({ t: (k) => k, locale: "en", setLocale: () => {} });

export function I18nProvider({ children, locale: propLocale }: { children: React.ReactNode; locale?: string }) {
  // Internal locale for instantaneous client-side updates; sync with prop when it changes
  const [curLocale, setCurLocale] = useState<string>((propLocale || "en") as string);
  useEffect(() => {
    if (propLocale && propLocale !== curLocale) setCurLocale(propLocale);
  }, [propLocale]);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = curLocale.startsWith("sw") ? "sw" : "en";
    }
  }, [curLocale]);

  const dict = useMemo(() => getLocaleDict(curLocale), [curLocale]);
  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const parts = key.split(".");

      // Walk value from merged locale dict
      let cur: any = dict;
      for (const p of parts) {
        if (cur && typeof cur === "object" && p in cur) cur = cur[p];
        else {
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.warn(`[i18n] Missing key for locale ${curLocale}: ${key}`);
          }
          return key; // final fallback: key
        }
      }

      const str = typeof cur === "string" ? cur : key;
      if (params) {
        let out = str;
        for (const [k, v] of Object.entries(params)) {
          out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
        }
        return out;
      }
      return str;
    };
  }, [dict, curLocale]);

  return <I18nCtx.Provider value={{ t, locale: curLocale, setLocale: setCurLocale }}>{children}</I18nCtx.Provider>;
}

export function useTranslation() {
  return useContext(I18nCtx);
}
