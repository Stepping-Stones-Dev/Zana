module.exports = {
  transpilePackages: ["@sam/payments", "@sam/auth", "@sam/i18n"],
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
