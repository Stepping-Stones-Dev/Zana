import type { AppProps } from 'next/app';

import {HeroUIProvider} from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";

import { AuthProvider } from "@/providers/AuthProvider";

import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {

  return (
    <HeroUIProvider>
      <NextThemesProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};