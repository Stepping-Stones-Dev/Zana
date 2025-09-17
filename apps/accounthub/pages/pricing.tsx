import { useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import {Tabs, Tab} from "@heroui/tabs";
import {Card, CardBody} from "@heroui/card";
import {Accordion, AccordionItem} from "@heroui/accordion";
import { useTranslation } from "@zana/i18n";
import NextLink from "next/link";
import { BASE_PLANS as LIB_BASE_PLANS, computePlanAmounts } from "@zana/payments";

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
      const supportKey = `pricing.matrix.support.${column}.${rowKey}`;
      const supportValue = t(supportKey, {});

      if (supportValue && supportValue !== supportKey && supportValue.trim() && features.length < max) {
        features.push(lbl);
      }
    }
  }
  return features;
}

const PricingPage = () => {
  const { t } = useTranslation();
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const currency = t("pricing.currency");

  const BASE_PLANS = LIB_BASE_PLANS.map((plan) => ({
    ...plan,
    name: t(plan.nameKey),
    blurb: t(plan.blurbKey),
    users: t(plan.usersKey),
    features: deriveFeaturesFor(plan.id as "standard" | "pro" | "proPlus", t),
  }));

  const plans: Plan[] = [
    BASE_PLANS[0], // standard
    {
      ...BASE_PLANS[1],
      highlight: true,
    }, // pro highlighted
    BASE_PLANS[2], // org
  ];

  return (
    <DefaultLayout>
      <main className="px-6 sm:px-10">
        <section className="relative mt-1 flex w-full flex-col items-center pb-24">
          <div className="relative z-20 flex max-w-2xl flex-col text-center">
            <h2 className="text-primary-600 font-medium">{t("pricing.heading")}</h2>
            <h1 className="text-3xl font-medium tracking-tight lg:text-5xl">
              <span className="text-primary">{t("pricing.title.main")}</span> {t("pricing.title.sub")}
            </h1>
            <h2 className="text-medium text-default-500 lg:text-large mt-2 lg:mt-4">
              {t("pricing.subheading")}
            </h2>
          </div>

          <div className="relative z-20 mt-8 flex flex-col items-center">
            <Tabs
              key="billing"
              selectedKey={billing}
              onSelectionChange={(key) => setBilling(key as "monthly" | "yearly")}
              classNames={{
                base: "p-0 rounded-full bg-default-100 dark:bg-default-50 shadow-small",
                tabList: "gap-0 w-full relative rounded-full p-0 border-b border-divider",
                cursor: "absolute z-0 inset-0 rounded-full bg-background shadow-small dark:bg-default-200/50",
                tabContent: "relative z-10 whitespace-nowrap transition-colors text-default-500 group-data-[selected=true]:text-default-foreground",
              }}
              radius="full"
            >
              <Tab key="monthly" title={t("pricing.billingToggle.monthly")} />
              <Tab key="yearly" title={t("pricing.billingToggle.yearly")} />
            </Tabs>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} billing={billing} />
            ))}
          </div>

          {/* FAQ Section */}
          <section className="w-full max-w-4xl mt-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight">{t("pricing.faq.title")}</h2>
              <p className="text-default-500 mt-2">{t("pricing.faq.subtitle")}</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion variant="splitted">
                <AccordionItem key="freeTrial" aria-label={t("pricing.faq.items.freeTrial.title")} title={t("pricing.faq.items.freeTrial.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.freeTrial.body")}</div>
                </AccordionItem>
                <AccordionItem key="paymentMethods" aria-label={t("pricing.faq.items.paymentMethods.title")} title={t("pricing.faq.items.paymentMethods.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.paymentMethods.body")}</div>
                </AccordionItem>
                <AccordionItem key="cancellation" aria-label={t("pricing.faq.items.cancellation.title")} title={t("pricing.faq.items.cancellation.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.cancellation.body")}</div>
                </AccordionItem>
                <AccordionItem key="support" aria-label={t("pricing.faq.items.support.title")} title={t("pricing.faq.items.support.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.support.body")}</div>
                </AccordionItem>
                <AccordionItem key="dataOwnership" aria-label={t("pricing.faq.items.dataOwnership.title")} title={t("pricing.faq.items.dataOwnership.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.dataOwnership.body")}</div>
                </AccordionItem>
                <AccordionItem key="upgradeLater" aria-label={t("pricing.faq.items.upgradeLater.title")} title={t("pricing.faq.items.upgradeLater.title")} className="px-0 md:px-6">
                  <div className="py-2 pt-0 pb-6 text-base text-default-500">{t("pricing.faq.items.upgradeLater.body")}</div>
                </AccordionItem>
              </Accordion>
            </div>
          </section>
        </section>
      </main>
    </DefaultLayout>
  );
};

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
              <span className="text-tiny text-default-500">{t("pricing.billed")} {billing === "monthly" ? t("pricing.monthly") : t("pricing.yearly")}</span>
            </div>
          </div>
          {billing === "yearly" ? (
            <div className="mt-1 flex items-center gap-3">
              <div className="text-small text-default-500 line-through">{formatKES(yearlyFullKES, currency)}</div>
              <div className="max-w-fit min-w-min inline-flex items-center justify-between px-2 h-6 text-tiny rounded-full bg-success/20 text-success-600">
                {t("pricing.save")} {formatKES(savingsKES, currency)}
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
          className="mt-auto w-full bg-primary text-primary-foreground"
        >
          {t("pricing.buy", { plan: t(plan.name) })}
        </Button>
        </CardBody>
      </Card>
    </div>
  );
}

export default PricingPage;