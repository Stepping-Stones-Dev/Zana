module.exports = {
  transpilePackages: ["@zana/payments", "@zana/auth", "@zana/i18n"],
  experimental: { externalDir: true },
  i18n: {
    locales: ["en", "sw"],
    defaultLocale: "en",
    localeDetection: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
