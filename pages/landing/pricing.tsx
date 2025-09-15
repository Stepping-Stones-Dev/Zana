import { useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Tabs, Tab, Card, CardBody, Accordion, AccordionItem } from "@heroui/react";
import { useTranslation } from "@/providers/I18nProvider";
import NextLink from "next/link";
import { BASE_PLANS as LIB_BASE_PLANS, computePlanAmounts } from "@/lib/pricing";

type Plan = {
  id: "standard" | "pro" | "org";
  name: string;
  blurb: string;
  users: string;
  highlight?: boolean;
  features?: string[];
};

function formatKES(amount: number, currency: string) {
  try {
  return `${currency} ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  } catch {
  return `${currency} ${amount}`;
  }
}

// Ordered labels per category use row keys; UI strings come from locales
const GROUPS: { cat: string; rows: string[] }[] = [
  { cat: "pricing", rows: ["cost", "targetAudience"] },
  { cat: "student", rows: ["studentRegistration", "discipline", "promotionWorkflows"] },
  { cat: "attendance", rows: ["studentAttendance", "staffAttendance", "timetableBuilder"] },
  { cat: "exams", rows: ["examResults", "gradingScales", "performanceDashboards", "predictiveAlerts"] },
  { cat: "portal", rows: ["mobileAccess", "pushNotifications", "parentTeacherCommunication"] },
  { cat: "finance", rows: ["feeStructures", "mpesa", "payroll", "hostelTransport", "financeForecasting"] },
  { cat: "communication", rows: ["bulkSms", "emailIntegration", "inAppChat", "automatedReminders"] },
  { cat: "analytics", rows: ["attendanceAnalytics", "examAnalytics", "financeDashboards", "customReportBuilder"] },
  { cat: "staff", rows: ["staffRecords", "staffPortal", "staffAppraisals", "leaveManagement"] },
  { cat: "advanced", rows: ["library", "hostel", "inventory", "transport", "cafeteria", "clubs"] },
  { cat: "tech", rows: ["cloudDeployment", "offlineAccess", "curriculumLocalization", "multiSchoolDashboards", "apiIntegrations"] },
  { cat: "support", rows: ["customerSupport", "training", "dataMigration"] },
];

function deriveFeaturesFor(
  column: "standard" | "pro" | "proPlus",
  t: (key: string, params?: Record<string, string | number>) => string,
  max = 12
): string[] {
  const features: string[] = [];
  for (const group of GROUPS) {
    for (const rowKey of group.rows) {
      const lbl = t(`pricing.matrix.labels.${rowKey}`);
      const valueKey = `pricing.matrix.values.${rowKey}.${column}`;
      const translatedVal = t(valueKey);
      if (!translatedVal || translatedVal === valueKey) continue;
      const bullet = `${lbl}: ${translatedVal}`;
      features.push(bullet);
      if (features.length >= max) return features;
    }
  }
  return features;
}

const BASE_PLANS: Plan[] = LIB_BASE_PLANS.map((p) => ({
  id: p.id,
  name: p.nameKey,
  blurb: p.blurbKey,
  users: p.usersKey,
  highlight: p.highlight,
}));

function usePayment() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  async function initiate({ email, phone, amount }: { email: string; phone: string; amount: number }) {
    setMessage(null);
    setLoading("Processing…");
    try {
      const resp = await fetch("/api/payments/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, amount }),
      });
      const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error || t("pricing.payment.failed"));
  setMessage(t("pricing.payment.requestSent"));
    } catch (e: any) {
  setMessage(e.message || t("pricing.payment.failed"));
    } finally {
      setLoading(null);
    }
  }

  return { loading, message, initiate };
}

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const { t } = useTranslation();
  const plans: Plan[] = BASE_PLANS.map((p) => ({
    ...p,
    features:
      p.id === "standard"
        ? deriveFeaturesFor("standard", t)
        : p.id === "pro"
        ? deriveFeaturesFor("pro", t)
        : deriveFeaturesFor("proPlus", t),
  }));
  return (
    <DefaultLayout>
      <main className="px-6 sm:px-10">
        <section className="relative mt-1 flex w-full flex-col items-center pb-24">
          <div className="relative z-20 flex max-w-2xl flex-col text-center">
            <h2 className="text-primary-600 font-medium">{t("pricing.title")}</h2>
            <h1 className="text-3xl font-medium tracking-tight lg:text-5xl">{t("pricing.choosePlan")}</h1>
            <h2 className="text-medium text-default-500 lg:text-large mt-2 lg:mt-4">{t("pricing.startTrial")}</h2>
          </div>

          {/* Billing period selector */}
          <div className="mt-6 inline-flex relative z-20">
            <Tabs
              aria-label={t("pricing.ariaBilling")}
              selectedKey={billing}
              onSelectionChange={(key) => setBilling(key as "monthly" | "yearly")}
              classNames={{
                tabList: "flex p-1 h-fit gap-2 items-center flex-nowrap overflow-x-auto rounded-full bg-black/30", 
                tab: "z-0 w-full px-3 py-1 flex group relative justify-center items-center cursor-pointer transition-opacity h-8 text-small rounded-full font-medium",
                cursor: "absolute z-0 inset-0 rounded-full bg-background shadow-small dark:bg-default-200/50",
                tabContent: "relative z-10 whitespace-nowrap transition-colors text-default-500 group-data-[selected=true]:text-default-foreground",
              }}
              radius="full"
            >
              <Tab key="monthly" title={t("pricing.monthly")} />
              <Tab key="yearly" title={t("pricing.yearly")} />
            </Tabs>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} billing={billing} />
            ))}
          </div>

          {/* FAQ Section */}
          <section className="z-20 w-full max-w-7xl pt-16 pb-12">
            <div className="flex w-full flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12">
              <div>
                <h2 className="inline-block text-3xl leading-7 font-semibold tracking-tight">
                  {t("pricing.faq.sectionTitle")}
                </h2>
                <p className="text-default-500 mt-2">{t("pricing.faq.sectionIntro")}</p>
              </div>
              <Accordion
                variant="splitted"
                selectionMode="multiple"
                className="px-2 w-full gap-3"
                itemClasses={{ base: "px-0 md:px-6" }}
              >
                <AccordionItem key="whatIsPro" aria-label={t("pricing.faq.items.whatIsPro.title")} title={t("pricing.faq.items.whatIsPro.title")}
                  className="px-0 md:px-6"
                >
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.whatIsPro.body")}</div>
                </AccordionItem>
                <AccordionItem key="freeUpdates" aria-label={t("pricing.faq.items.freeUpdates.title")} title={t("pricing.faq.items.freeUpdates.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.freeUpdates.body")}</div>
                </AccordionItem>
                <AccordionItem key="requiredVersion" aria-label={t("pricing.faq.items.requiredVersion.title")} title={t("pricing.faq.items.requiredVersion.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.requiredVersion.body")}</div>
                </AccordionItem>
                <AccordionItem key="teamOrgPlans" aria-label={t("pricing.faq.items.teamOrgPlans.title")} title={t("pricing.faq.items.teamOrgPlans.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.teamOrgPlans.body")}</div>
                </AccordionItem>
                <AccordionItem key="orgMoreLicenses" aria-label={t("pricing.faq.items.orgMoreLicenses.title")} title={t("pricing.faq.items.orgMoreLicenses.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">
                    {t("pricing.faq.items.orgMoreLicenses.body")} <a className="text-primary" href="/landing/contact">{t("pricing.faq.contactUs")}</a>.
                  </div>
                </AccordionItem>
        <AccordionItem key="commercialUse" aria-label={t("pricing.faq.items.commercialUse.title")} title={t("pricing.faq.items.commercialUse.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">
          {t("pricing.faq.items.commercialUse.body")}
                  </div>
                </AccordionItem>
        <AccordionItem key="perProjectLicense" aria-label={t("pricing.faq.items.perProjectLicense.title")} title={t("pricing.faq.items.perProjectLicense.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">
          {t("pricing.faq.items.perProjectLicense.body")}
                  </div>
                </AccordionItem>
                <AccordionItem key="upgradeLater" aria-label={t("pricing.faq.items.upgradeLater.title")} title={t("pricing.faq.items.upgradeLater.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.upgradeLater.body")}</div>
                </AccordionItem>
        <AccordionItem key="foundIssue" aria-label={t("pricing.faq.items.foundIssue.title")} title={t("pricing.faq.items.foundIssue.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">
          {t("pricing.faq.items.foundIssue.body")} <a className="text-primary" href="/landing/contact">{t("pricing.faq.contactUs")}</a>.
                  </div>
                </AccordionItem>
        <AccordionItem key="refundPolicy" aria-label={t("pricing.faq.items.refundPolicy.title")} title={t("pricing.faq.items.refundPolicy.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">
          {t("pricing.faq.items.refundPolicy.body")} <a className="text-primary" href="/landing/contact">{t("pricing.faq.contactUs")}</a>.
                  </div>
                </AccordionItem>
        <AccordionItem key="stillHaveQuestions" aria-label={t("pricing.faq.items.stillHaveQuestions.title")} title={t("pricing.faq.items.stillHaveQuestions.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">
          {t("pricing.faq.items.stillHaveQuestions.body")} <a className="text-primary" href="/landing/contact">{t("pricing.faq.contactUs")}</a>.
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </section>
        </section>
      </main>
    </DefaultLayout>
  );
}

function PlanCard({ plan, billing }: { plan: Plan; billing: "monthly" | "yearly" }) {
  const { t, locale } = useTranslation();
  const currency = t("pricing.currency");
  const { monthlyKES, yearlyKES, yearlyFullKES, savingsKES } = computePlanAmounts(plan.id, billing);
  const selectedAmount = billing === "monthly" ? monthlyKES : yearlyKES;

  return (
    <div className={`${plan.highlight ? "order-first lg:order-none" : "lg:mt-8"} relative overflow-visible`}>
      {plan.highlight ? (
        <div className="z-20 max-w-fit min-w-min inline-flex items-center justify-between px-1 h-7 text-small rounded-full bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 shadow-large">
          <span className="px-2 font-semibold">{t("pricing.mostPopular")}</span>
        </div>
      ) : null}
      <Card className={`h-full shadow-medium rounded-large backdrop-blur-md bg-background/80 border-small p-3 ${plan.highlight ? "border-primary/50" : "border-white/10"}`}>
        <CardBody className="flex flex-col gap-4 h-full">
        <div className="flex flex-col gap-1 pb-2">
          <h2 className="text-large font-medium">{`${t(plan.name)} ${t("pricing.planSuffix")}`}</h2>
          <p className="text-medium text-default-500">{t(plan.blurb)}</p>
        </div>
        <hr className="h-divider bg-default-200/50 border-none" />
        <div className="pt-2">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-extrabold">{formatKES(selectedAmount, currency)}</span>
            <div className="ml-2 flex flex-col">
              <span className="text-tiny font-semibold">{billing === "monthly" ? t("pricing.perMonth") : t("pricing.perYear")}</span>
              <span className="text-tiny text-default-500">{t("pricing.billed", { period: billing })}</span>
            </div>
          </div>
          {billing === "yearly" ? (
            <div className="mt-1 flex items-center gap-3">
              <div className="text-small text-default-500 line-through">{formatKES(yearlyFullKES, currency)}</div>
              <div className="max-w-fit min-w-min inline-flex items-center justify-between px-2 h-6 text-tiny rounded-full bg-success/20 text-success-600">
                {t("pricing.save", { amount: formatKES(savingsKES, currency) })}
              </div>
            </div>
          ) : null}
        </div>

        <ul className="flex flex-col mt-2 gap-1.5">
          {(plan.features ?? []).map((f) => (
            <li key={f} className="flex items-start gap-2 py-1 min-h-[28px]">
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="text-primary flex-none mt-0.5"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m6 12 4.243 4.243 8.484-8.486"
                />
              </svg>
              <p className="text-tiny leading-snug text-default-600 tracking-tight">{f}</p>
            </li>
          ))}
        </ul>
        <Button
          as={NextLink}
          href={`/payments/checkout?plan=${plan.id}&billing=${billing}`}
          locale={locale as any}
          className="mt-auto w-full bg-primary text-primary-foreground"
        >
          {t("pricing.buy", { plan: t(plan.name) })}
        </Button>
        </CardBody>
      </Card>
    </div>
  );
}
