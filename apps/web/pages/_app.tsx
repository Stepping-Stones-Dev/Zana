import type { AppProps } from 'next/app';

import dynamic from "next/dynamic";
import {HeroUIProvider} from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { I18nProvider } from "@sam/i18n";

import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";

// Lazy-load AuthProvider (and thus Firebase) only on private routes
const AuthProvider = dynamic(() => import("@sam/auth").then(m => m.AuthProvider), {
  ssr: false,
  // Render children directly while loading to avoid blocking navigation
  loading: ({ children }: any) => <>{children}</>,
});

export default function App({ Component, pageProps, router }: AppProps) {
  const { locale, defaultLocale } = router;
  const effectiveLocale = locale ?? defaultLocale ?? 'en';
  const path = router.pathname || "";

  // Public routes that don't need auth context; keeps marketing pages snappy
  const isPublicRoute =
    path === "/" ||
    path.startsWith("/landing") ||
    path.startsWith("/tenants") ||
    path.startsWith("/saml-success") ||
    path.startsWith("/payments") ||
    path.startsWith("/onboarding/profile") ||
    path.startsWith("/landing/");

  return (
    <HeroUIProvider>
  <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider locale={effectiveLocale}>
          {isPublicRoute ? (
            <Component {...pageProps} />
          ) : (
            <AuthProvider>
              <Component {...pageProps} />
            </AuthProvider>
          )}
        </I18nProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};