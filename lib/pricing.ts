export type PlanId = "standard" | "pro" | "org";

export type BasePlan = {
  id: PlanId;
  nameKey: string;
  blurbKey: string;
  priceUSD: number; // monthly USD
  usersKey: string;
  highlight?: boolean;
};

// Configurable USD→KES conversion (client-safe via NEXT_PUBLIC_ var)
export const USD_TO_KES_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_KES ?? 175);
export const usdToKes = (amountUSD: number, rate: number = USD_TO_KES_RATE) => amountUSD * rate;
export const roundUpTo999 = (amountKES: number) => Math.ceil((amountKES + 1) / 1000) * 1000 - 1;

export const BASE_PLANS: BasePlan[] = [
  {
    id: "standard",
    nameKey: "pricing.plans.standard.name",
    blurbKey: "pricing.plans.standard.blurb",
    priceUSD: 199,
    usersKey: "pricing.plans.standard.users",
  },
  {
    id: "pro",
    nameKey: "pricing.plans.pro.name",
    blurbKey: "pricing.plans.pro.blurb",
    priceUSD: 299,
    usersKey: "pricing.plans.pro.users",
    highlight: true,
  },
  {
    id: "org",
    nameKey: "pricing.plans.org.name",
    blurbKey: "pricing.plans.org.blurb",
    priceUSD: 499,
    usersKey: "pricing.plans.org.users",
  },
];

export function getPlanById(id: PlanId) {
  return BASE_PLANS.find((p) => p.id === id) || null;
}

export function computePlanAmounts(planId: PlanId, billing: "monthly" | "yearly") {
  const plan = getPlanById(planId);
  if (!plan) return { amountKES: 0, monthlyKES: 0, yearlyKES: 0, yearlyFullKES: 0, savingsKES: 0 };
  const monthlyUSD = plan.priceUSD;
  const yearlyFullUSD = monthlyUSD * 12;
  const yearlyUSD = monthlyUSD * 10; // two months free

  const monthlyKES = roundUpTo999(usdToKes(monthlyUSD));
  const yearlyFullKES = roundUpTo999(usdToKes(yearlyFullUSD));
  const yearlyKES = roundUpTo999(usdToKes(yearlyUSD));
  const savingsKES = Math.max(0, yearlyFullKES - yearlyKES);

  const amountKES = billing === "monthly" ? monthlyKES : yearlyKES;
  return { amountKES, monthlyKES, yearlyKES, yearlyFullKES, savingsKES };
}
