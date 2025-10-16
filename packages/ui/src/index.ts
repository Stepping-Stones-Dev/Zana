/**
 * @zana/ui - Composite application surfaces for the Zana platform
 * 
 * Higher‑order, accessibility‑first UI structures powered by CSS tokens,
 * instant theming, runtime i18n, instrumentation & onboarding hooks.
 * 
 * This package focuses on opinionated, product‑level composition rather
 * than primitive components (which come from Heroui CDN).
 */

// Export i18n utilities
export * from './i18n/index';

// Export all components
export * from './components/index';

// Re-export clsx for convenience
export { clsx } from 'clsx';

