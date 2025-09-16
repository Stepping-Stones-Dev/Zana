import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';

export default class DashboardDocument extends Document<{ locale?: string }> {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & { locale?: string }> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, locale: ctx.locale || ctx.defaultLocale || 'en' };
  }
  render() {
    const locale = (this.props as any).locale || 'en';
    return (
      <Html lang={locale}>
        <Head />
        <body className="min-h-screen bg-background font-sans antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
