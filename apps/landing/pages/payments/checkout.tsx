import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, Tabs, Tab, Chip } from "@heroui/react";
import { Input } from "@heroui/input";
import Link from "next/link";
import { useTranslation } from "@zana/i18n";
import { computePlanAmounts, getPlanById, PlanId } from "@zana/payments";
import { PayPalButton, PesapalButton } from "@zana/payments";

export default function CheckoutPage() {
  const { t, locale } = useTranslation();

  // State
  const [planId, setPlanId] = useState<PlanId>("pro");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const pq = sp.get("plan");
      const bq = sp.get("billing");
      if (pq === "standard" || pq === "pro" || pq === "org") setPlanId(pq as PlanId);
      if (bq === "yearly" || bq === "monthly") setBilling(bq as "monthly" | "yearly");
    } catch {
      // ignore parse errors
    }
  }, []);

  const plan = getPlanById(planId)!;
  const { monthlyKES, yearlyKES } = useMemo(() => computePlanAmounts(planId, billing), [planId, billing]);
  const currency = t("pricing.currency");
  const formatKES = (n: number) => `${currency} ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
  // VAT calculation (example 16%)
  const VAT_RATE = 0.16;
  const baseAmount = billing === "monthly" ? monthlyKES : yearlyKES;
  const vatAmount = Math.round(baseAmount * VAT_RATE);
  const totalWithVat = baseAmount + vatAmount;
  const yearlySavings = useMemo(() => Math.max(0, (monthlyKES || 0) * 12 - (yearlyKES || 0)), [monthlyKES, yearlyKES]);

  const [email, setEmail] = useState("");
  const [loading] = useState(false);
  // consents
  const [agreeAccountEmails, setAgreeAccountEmails] = useState(false);
  const [agreeMarketingEmails, setAgreeMarketingEmails] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // No phone collection needed for Pesapal hosted checkout
  const emailLabel = t("pricing.checkout.email");

  // Map our plan keys to actual PayPal subscription plan IDs from env
  const ppPlanIdMap: Record<string, string | undefined> = {
    standard: process.env.NEXT_PUBLIC_PAYPAL_PLAN_STANDARD,
    pro: process.env.NEXT_PUBLIC_PAYPAL_PLAN_PRO,
    org: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ORG,
  };
  const ppPlanId = ppPlanIdMap[planId];

  const brand = process.env.NEXT_PUBLIC_BRAND || "Zana";

  return (
    <div className="relative min-h-screen">
      {/* Background split: left white, right black */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-2">
        <div className="bg-white" />
        <div className="bg-black" />
      </div>

      <main className="relative px-6 sm:px-10 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment form column */}
          <section aria-labelledby="pay-form">
            {/* Left column header (dark on white) */}
            <div className="px-1 pb-3">
              <Link href="/landing/pricing" locale={locale} className="flex items-center gap-2 text-black hover:text-black transition">
                <span aria-hidden>←</span>
                <span className="text-sm">{t("pricing.checkout.back")}</span>
              </Link>
            </div>
            <h1 id="pay-form" className="sr-only">{t("pricing.checkout.payFormAria")}</h1>
            <Card className="shadow-none bg-transparent border-0">
              <CardBody className="flex flex-col gap-6">
                {/* Plan selector and amount */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-semibold text-neutral-900">{t(plan.nameKey)} {t("pricing.planSuffix")}</div>
                    <div className="text-sm text-neutral-600">{t(plan.blurbKey)}</div>
                  </div>
                  <div className="text-2xl font-bold">{formatKES(baseAmount)}</div>
                </div>

                {/* Email above the billing toggle */}
                <div className="flex flex-col gap-4 w-full">
                  <Input
                    label={emailLabel}
                    labelPlacement="outside"
                    value={email}
                    onValueChange={setEmail}
                    placeholder={t("pricing.checkout.emailPlaceholder")}
                    variant="bordered"
                    radius="sm"
                    inputMode="email"
                    autoComplete="email"
                    classNames={{
                      label: "text-black font-medium",
                      inputWrapper: "bg-white border-neutral-300 focus-within:ring-2 focus-within:ring-black focus-within:border-black",
                      input: "text-neutral-900 placeholder:text-neutral-600 caret-black",
                    }}
                  />
                </div>

                {/* Billing period toggle moved to right column */}

                {/* Provider selection removed; both buttons are shown below */}

                {/* Consents */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-2 text-sm text-neutral-800">
                    <input type="checkbox" className="mt-0.5" checked={agreeAccountEmails} onChange={(e) => setAgreeAccountEmails(e.target.checked)} />
                    <span>{t("pricing.checkout.consent.accountEmails")} <span className="text-red-600">*</span></span>
                  </label>
                  <label className="flex items-start gap-2 text-sm text-neutral-800">
                    <input type="checkbox" className="mt-0.5" checked={agreeMarketingEmails} onChange={(e) => setAgreeMarketingEmails(e.target.checked)} />
                    <span>{t("pricing.checkout.consent.marketingEmails")}</span>
                  </label>
                  <label className="flex items-start gap-2 text-sm text-neutral-800">
                    <input type="checkbox" className="mt-0.5" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                    <span>
                      {t("pricing.checkout.consent.termsPrefix")} 
                      <Link href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">{t("pricing.checkout.consent.termsLink")}</Link> 
                      {t("pricing.checkout.consent.and")} 
                      <Link href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">{t("pricing.checkout.consent.privacyLink")}</Link>.
                      <span className="text-red-600"> *</span>
                    </span>
                  </label>
                </div>

                {/* Legal trial text */}
                <div className="text-xs text-neutral-700">
                  {t("pricing.checkout.legalTrial", { period: t(billing === "monthly" ? "pricing.perMonth" : "pricing.perYear") })}
                </div>

                
                <PesapalButton email={email} planId={planId} billing={billing} disabled={!agreeAccountEmails || !agreeTerms || !email} />

                {/* Both provider buttons, gated by required consents */}
                <div className="flex flex-col gap-3">
                  {agreeAccountEmails && agreeTerms && email ? (
                    ppPlanId ? (
                      <PayPalButton
                        planId={ppPlanId}
                        onApproved={async (subscriptionId) => {
                          try {
                            await fetch("/api/webhooks/paypal", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ type: "checkout.approved", subscriptionId, status: "succeeded" }),
                            });
                          } catch {}
                          window.location.assign(`/payments/success`);
                        }}
                        color="black"
                        label="subscribe"
                      />
                    ) : (
                      <div className="text-sm text-red-600">
                        PayPal plan ID for {planId} is not configured. Set NEXT_PUBLIC_PAYPAL_PLAN_{planId.toUpperCase()} in .env.
                      </div>
                    )
                  ) : (
                    <Button isDisabled disableRipple className="bg-black text-white opacity-50 cursor-not-allowed rounded-md py-8">{t("pricing.checkout.paypalDisabled")}</Button>
                  )}

                  {!agreeAccountEmails || !agreeTerms ? (
                    <Chip color="danger" size="sm" variant="flat">{t("pricing.checkout.consent.requiredNote")}</Chip>
                  ) : null}
                </div>

                {/* Footer removed as legal moved above and buttons rendered */}
              </CardBody>
            </Card>
          </section>

          {/* Order summary column */}
          <aside aria-labelledby="order-summary" className="text-white">
            {/* Right column header (light on black) */}
            <div className="px-1 pb-3 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-xs" aria-hidden>
                  {brand.substring(0, 1)}
                </div>
                <span className="text-sm font-medium">{brand}</span>
              </div>
            </div>
            <h2 id="order-summary" className="sr-only">{t("pricing.checkout.orderSummaryAria")}</h2>
            <Card className="sticky top-4 shadow-none bg-transparent border-0">
              <CardBody className="flex flex-col gap-4">
                {/* Billing period tabs (dark side) */}
                <div className="flex items-center justify-between">
                  <Tabs
                    selectedKey={billing}
                    onSelectionChange={(k) => setBilling(k as any)}
                    radius="full"
                    classNames={{
                      tabList: "flex p-1 gap-2 rounded-full bg-neutral-200 focus-within:outline focus-within:outline-2 focus-within:outline-black",
                      tab: "px-3 py-1 rounded-full text-neutral-800 data-[hover=true]:bg-black/10 data-[focus-visible=true]:outline data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-black data-[selected=true]:bg-black data-[selected=true]:text-white",
                    }}
                    aria-label={t("pricing.ariaBilling")}
                  >
                    <Tab key="monthly" title={t("pricing.monthly")} />
                    <Tab key="yearly" title={t("pricing.yearly")} />
                  </Tabs>
                </div>

                <div className="text-base font-medium">{t("pricing.checkout.orderSummary")}</div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{t("pricing.buy", { plan: t(plan.nameKey) })}</div>
                    <div className="text-small text-white/70">{t(plan.blurbKey)}</div>
                    <div className="text-tiny text-white/60 mt-1">{t("pricing.billed", { period: t(billing === "monthly" ? "pricing.perMonth" : "pricing.perYear") })}</div>
                  </div>
                  <div className="font-semibold">{formatKES(baseAmount)}</div>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <div className="text-sm text-white/80">{t("pricing.checkout.subtotal")}</div>
                  <div className="text-sm">{formatKES(baseAmount)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/80">{t("pricing.checkout.vatPercent", { percent: Math.round(VAT_RATE * 100) })}</div>
                  <div className="text-sm">{formatKES(vatAmount)}</div>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <div className="font-medium">{t("pricing.checkout.totalDue")}</div>
                  <div className="font-semibold">{formatKES(totalWithVat)}</div>
                </div>
                {billing === "yearly" && yearlySavings > 0 ? (
                  <div className="flex items-center justify-end">
                    <Chip color="success" variant="flat" size="sm">
                      {t("pricing.save", { amount: formatKES(yearlySavings) })}
                    </Chip>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
