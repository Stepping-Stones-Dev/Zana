import NextHead from "next/head";

export function Head() {
  return (
    <NextHead>
      <title>Zana - Account Hub</title>
      <meta name="description" content="Manage your Zana account, organizations, and billing" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:title" content="Zana - Account Hub" />
      <meta property="og:description" content="Manage your Zana account, organizations, and billing" />
      <meta property="og:image" content="/og-image.png" />
      <meta property="og:url" content="https://account.zana.africa" />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  );
}