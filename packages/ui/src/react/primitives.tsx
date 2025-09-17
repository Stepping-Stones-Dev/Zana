import { tv } from "tailwind-variants";

export const title = tv({
  base: "tracking-tight inline font-semibold",
  variants: {
    color: {
      violet: "from-[#FF1CF7] to-[#b249f8]",
      yellow: "from-[#FF705B] to-[#FFB457]",
      blue: "from-[#5EA2EF] to-[#0072F5]",
      cyan: "from-[#00b7fa] to-[#01cfea]",
      green: "from-[#6FEE8D] to-[#17c964]",
      pink: "from-[#FF72E1] to-[#F54C7A]",
      foreground: "dark:from-[#FFFFFF] dark:to-[#4B4B4B]",
    },
    size: {
      sm: "text-3xl lg:text-4xl",
      md: "text-[2.3rem] lg:text-5xl leading-9",
      lg: "text-4xl lg:text-6xl",
    },
    fullWidth: {
      true: "w-full block",
    },
  },
  defaultVariants: {
    size: "md",
  },
  compoundVariants: [
    {
      color: [
        "violet",
        "yellow",
        "blue",
        "cyan",
        "green",
        "pink",
        "foreground",
      ],
      class: "bg-clip-text text-transparent bg-gradient-to-b",
    },
  ],
});

// Safelist helper div so Tailwind picks gradient classes during content scan
// This has no runtime effect but ensures from/to color utilities are generated in JIT.
export const __gradientSafelist = () => (
  <div className="hidden from-[#FF1CF7] to-[#b249f8] from-[#FF705B] to-[#FFB457] from-[#5EA2EF] to-[#0072F5] from-[#00b7fa] to-[#01cfea] from-[#6FEE8D] to-[#17c964] from-[#FF72E1] to-[#F54C7A] dark:from-[#FFFFFF] dark:to-[#4B4B4B] bg-gradient-to-b" />
);

export const subtitle = tv({
  base: "w-full md:w-1/2 my-2 text-lg lg:text-xl text-default-600 block max-w-full",
  variants: {
    fullWidth: {
      true: "!w-full",
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
});

// Floating animation + delay helpers
export const floating = tv({
  base: "will-change-transform",
  variants: {
    speed: {
      normal: "animate-levitate",
      fast: "animate-levitate-fast",
      slower: "animate-levitate-slower",
    },
    delay: {
      d120: "[animation-delay:120ms]",
      d300: "[animation-delay:300ms]",
      d420: "[animation-delay:420ms]",
      d650: "[animation-delay:650ms]",
      d900: "[animation-delay:900ms]",
      d1100: "[animation-delay:1100ms]",
      d1300: "[animation-delay:1300ms]",
      d1400: "[animation-delay:1400ms]",
      d1700: "[animation-delay:1700ms]",
    },
  },
});

// Floating tag (pill) with color variants
export const floatingTag = tv({
  base: "px-3 py-1.5 inline-flex items-center justify-center rounded-medium shadow-small text-sm",
  variants: {
    color: {
      secondary: "bg-secondary text-secondary-foreground",
      success: "bg-success text-success-foreground",
      warning: "bg-warning text-warning-foreground",
      primary: "bg-primary text-primary-foreground",
      default: "bg-default text-foreground",
    },
  },
  defaultVariants: {
    color: "secondary",
  },
});

// Floating card base skin
export const floatingCard = tv({
  base: "overflow-hidden text-foreground bg-content1 shadow-large rounded-large transition border-none",
});

// Simple pill container (e.g., tabs)
export const pillContainer = tv({
  base: "flex p-1 gap-2 items-center bg-default-100 rounded-full shadow-sm",
});