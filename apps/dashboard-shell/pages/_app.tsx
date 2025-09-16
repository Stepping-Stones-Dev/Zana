import type { AppProps } from 'next/app';
import {HeroUIProvider} from '@heroui/system';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { I18nProvider } from '@sam/i18n';
import '../styles/globals.css';

export default function App({ Component, pageProps, router }: AppProps) {
  const { locale, defaultLocale } = router;
  const effectiveLocale = locale || defaultLocale || 'en';
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider locale={effectiveLocale}>
          <Component {...pageProps} />
        </I18nProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
