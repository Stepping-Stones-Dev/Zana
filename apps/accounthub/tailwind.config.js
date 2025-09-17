import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Include shared packages so tailwind picks up variant class names generated via tailwind-variants
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/i18n/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/auth/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/payments/src/**/*.{js,ts,jsx,tsx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

export default config;