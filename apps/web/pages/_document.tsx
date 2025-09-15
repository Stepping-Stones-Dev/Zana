import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from "next/document";
import clsx from "clsx";

import { fontSans } from "@/config/fonts";

export default class MyDocument extends Document<{ locale?: string }> {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & { locale?: string }> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, locale: ctx.locale || ctx.defaultLocale || "en" };
  }

  render() {
    const locale = (this.props as any).locale || "en";
    return (
      <Html lang={locale}>
        <Head />
        <body
          className={clsx(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
          )}
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
