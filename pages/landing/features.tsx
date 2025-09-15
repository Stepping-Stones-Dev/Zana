import { useEffect, useMemo, useState } from "react";
import DefaultLayout from "@/layouts/default";
// Removed Tabs; implementing scroll-based navigation instead
import { useTranslation } from "@/providers/I18nProvider";

type PlanKey = "standard" | "pro" | "proPlus";
type Feature = { key: string; title: string; desc: string; plans: PlanKey[] };
type Category = { key: string; title: string; blurb?: string; badge?: string; features: Feature[] };
type TopGroup = { key: string; title: string; subkeys: string[] };

const PLAN_LABELS: Record<PlanKey, string> = {
  standard: "features.planLabels.standard",
  pro: "features.planLabels.pro",
  proPlus: "features.planLabels.proPlus",
};

const CATEGORIES: Category[] = [
  {
    key: "student",
    title: "features.categories.student.title",
    blurb: "features.categories.student.blurb",
    features: [
  { key: "student-registration", title: "features.items.student-registration.title", desc: "features.items.student-registration.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "extended-profiles", title: "features.items.extended-profiles.title", desc: "features.items.extended-profiles.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "discipline-logs", title: "features.items.discipline-logs.title", desc: "features.items.discipline-logs.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "transfers-promotions", title: "features.items.transfers-promotions.title", desc: "features.items.transfers-promotions.desc", plans: ["pro", "proPlus"] },
  { key: "graduation", title: "features.items.graduation.title", desc: "features.items.graduation.desc", plans: ["pro", "proPlus"] },
    ],
  },
  {
    key: "attendance",
    title: "features.categories.attendance.title",
    blurb: "features.categories.attendance.blurb",
    features: [
  { key: "student-attendance", title: "features.items.student-attendance.title", desc: "features.items.student-attendance.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "staff-attendance", title: "features.items.staff-attendance.title", desc: "features.items.staff-attendance.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "timetable-builder", title: "features.items.timetable-builder.title", desc: "features.items.timetable-builder.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "smart-scheduling", title: "features.items.smart-scheduling.title", desc: "features.items.smart-scheduling.desc", plans: ["pro", "proPlus"] },
  { key: "multi-school-scheduling", title: "features.items.multi-school-scheduling.title", desc: "features.items.multi-school-scheduling.desc", plans: ["proPlus"] },
    ],
  },
  {
    key: "exams",
    title: "features.categories.exams.title",
    blurb: "features.categories.exams.blurb",
    features: [
  { key: "exam-setup", title: "features.items.exam-setup.title", desc: "features.items.exam-setup.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "report-cards", title: "features.items.report-cards.title", desc: "features.items.report-cards.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "grading-scales", title: "features.items.grading-scales.title", desc: "features.items.grading-scales.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "dashboards", title: "features.items.dashboards.title", desc: "features.items.dashboards.desc", plans: ["pro", "proPlus"] },
  { key: "predictive-analytics", title: "features.items.predictive-analytics.title", desc: "features.items.predictive-analytics.desc", plans: ["proPlus"] },
    ],
  },
  {
    key: "portal",
    title: "features.categories.portal.title",
    blurb: "features.categories.portal.blurb",
    features: [
  { key: "mobile-app", title: "features.items.mobile-app.title", desc: "features.items.mobile-app.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "push-notifications", title: "features.items.push-notifications.title", desc: "features.items.push-notifications.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "fee-tracking", title: "features.items.fee-tracking.title", desc: "features.items.fee-tracking.desc", plans: ["pro", "proPlus"] },
  { key: "in-app-chat", title: "features.items.in-app-chat.title", desc: "features.items.in-app-chat.desc", plans: ["pro", "proPlus"] },
  { key: "multilingual", title: "features.items.multilingual.title", desc: "features.items.multilingual.desc", plans: ["proPlus"] },
    ],
  },
  {
    key: "finance",
    title: "features.categories.finance.title",
    blurb: "features.categories.finance.blurb",
    features: [
  { key: "fee-structures", title: "features.items.fee-structures.title", desc: "features.items.fee-structures.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "invoices", title: "features.items.invoices.title", desc: "features.items.invoices.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "arrears-alerts", title: "features.items.arrears-alerts.title", desc: "features.items.arrears-alerts.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "mpesa", title: "features.items.mpesa.title", desc: "features.items.mpesa.desc", plans: ["pro", "proPlus"] },
  { key: "scholarships", title: "features.items.scholarships.title", desc: "features.items.scholarships.desc", plans: ["pro", "proPlus"] },
  { key: "transport-hostel", title: "features.items.transport-hostel.title", desc: "features.items.transport-hostel.desc", plans: ["pro", "proPlus"] },
  { key: "forecasting", title: "features.items.forecasting.title", desc: "features.items.forecasting.desc", plans: ["proPlus"] },
    ],
  },
  {
    key: "communication",
    title: "features.categories.communication.title",
    blurb: "features.categories.communication.blurb",
    features: [
  { key: "bulk-sms", title: "features.items.bulk-sms.title", desc: "features.items.bulk-sms.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "email", title: "features.items.email.title", desc: "features.items.email.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "meeting-reminders", title: "features.items.meeting-reminders.title", desc: "features.items.meeting-reminders.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "chat", title: "features.items.chat.title", desc: "features.items.chat.desc", plans: ["pro", "proPlus"] },
  { key: "auto-notifications", title: "features.items.auto-notifications.title", desc: "features.items.auto-notifications.desc", plans: ["pro", "proPlus"] },
    ],
  },
  {
    key: "analytics",
    title: "features.categories.analytics.title",
    blurb: "features.categories.analytics.blurb",
    features: [
  { key: "basic-reports", title: "features.items.basic-reports.title", desc: "features.items.basic-reports.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "trend-dashboards", title: "features.items.trend-dashboards.title", desc: "features.items.trend-dashboards.desc", plans: ["pro", "proPlus"] },
  { key: "custom-reports", title: "features.items.custom-reports.title", desc: "features.items.custom-reports.desc", plans: ["pro", "proPlus"] },
  { key: "predictive", title: "features.items.predictive.title", desc: "features.items.predictive.desc", plans: ["proPlus"] },
  { key: "comparative", title: "features.items.comparative.title", desc: "features.items.comparative.desc", plans: ["proPlus"] },
    ],
  },
  {
    key: "staff",
    title: "features.categories.staff.title",
    blurb: "features.categories.staff.blurb",
    features: [
  { key: "staff-records", title: "features.items.staff-records.title", desc: "features.items.staff-records.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "payroll", title: "features.items.payroll.title", desc: "features.items.payroll.desc", plans: ["pro", "proPlus"] },
  { key: "leave", title: "features.items.leave.title", desc: "features.items.leave.desc", plans: ["pro", "proPlus"] },
  { key: "staff-portal", title: "features.items.staff-portal.title", desc: "features.items.staff-portal.desc", plans: ["pro", "proPlus"] },
  { key: "appraisals", title: "features.items.appraisals.title", desc: "features.items.appraisals.desc", plans: ["proPlus"] },
  { key: "development", title: "features.items.development.title", desc: "features.items.development.desc", plans: ["proPlus"] },
    ],
  },
  {
    key: "advanced",
    title: "features.categories.advanced.title",
    blurb: "features.categories.advanced.blurb",
    features: [
  { key: "library", title: "features.items.library.title", desc: "features.items.library.desc", plans: ["pro", "proPlus"] },
  { key: "hostel", title: "features.items.hostel.title", desc: "features.items.hostel.desc", plans: ["pro", "proPlus"] },
  { key: "inventory", title: "features.items.inventory.title", desc: "features.items.inventory.desc", plans: ["pro", "proPlus"] },
  { key: "transport", title: "features.items.transport.title", desc: "features.items.transport.desc", plans: ["pro", "proPlus"] },
  { key: "gps", title: "features.items.gps.title", desc: "features.items.gps.desc", plans: ["proPlus"] },
  { key: "cafeteria", title: "features.items.cafeteria.title", desc: "features.items.cafeteria.desc", plans: ["proPlus"] },
  { key: "clubs", title: "features.items.clubs.title", desc: "features.items.clubs.desc", plans: ["pro", "proPlus"] },
    ],
  },
  {
    key: "tech",
    title: "features.categories.tech.title",
    blurb: "features.categories.tech.blurb",
    features: [
  { key: "cloud", title: "features.items.cloud.title", desc: "features.items.cloud.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "offline", title: "features.items.offline.title", desc: "features.items.offline.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "cbc", title: "features.items.cbc.title", desc: "features.items.cbc.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "multi-school", title: "features.items.multi-school.title", desc: "features.items.multi-school.desc", plans: ["proPlus"] },
  { key: "api", title: "features.items.api.title", desc: "features.items.api.desc", plans: ["pro", "proPlus"] },
    ],
  },
  {
    key: "support",
    title: "features.categories.support.title",
    blurb: "features.categories.support.blurb",
    features: [
  { key: "community", title: "features.items.community.title", desc: "features.items.community.desc", plans: ["standard"] },
  { key: "local-support", title: "features.items.local-support.title", desc: "features.items.local-support.desc", plans: ["standard", "pro", "proPlus"] },
  { key: "onboarding", title: "features.items.onboarding.title", desc: "features.items.onboarding.desc", plans: ["pro", "proPlus"] },
  { key: "account-manager", title: "features.items.account-manager.title", desc: "features.items.account-manager.desc", plans: ["proPlus"] },
  { key: "custom-training", title: "features.items.custom-training.title", desc: "features.items.custom-training.desc", plans: ["proPlus"] },
    ],
  },
];

const PLAN_COLORS: Record<PlanKey, string> = {
  standard: "bg-default-200/40 text-default-800 dark:text-default-100",
  pro: "bg-success-500/15 text-default-foreground",
  proPlus: "bg-primary-500/15 text-default-foreground",
};

// Collated top-level navigation (reduces options in the button group bar)
const TOP_GROUPS: TopGroup[] = [
  { key: "academics", title: "features.nav.academics", subkeys: ["student", "attendance", "exams"] },
  { key: "engagement", title: "features.nav.engagement", subkeys: ["portal", "communication"] },
  { key: "operations", title: "features.nav.operations", subkeys: ["finance", "staff", "advanced"] },
  { key: "insights", title: "features.nav.insights", subkeys: ["analytics"] },
  { key: "platform", title: "features.nav.platform", subkeys: ["tech", "support"] },
];

// Helpers for tags/status
type Status = "available" | "enterprise" | "beta" | "planned";
const STATUS_STYLES: Record<Status, string> = {
  available: "bg-success-500/15 text-success-600",
  enterprise: "bg-warning-500/15 text-warning-600",
  beta: "bg-primary-500/15 text-primary-600",
  planned: "bg-default-200/30 text-default-600",
};

function featureMeta(catTitle: string, f: Feature): { tags: string[]; status: Status } {
  const tags = [catTitle, ...f.plans.map((p) => PLAN_LABELS[p])];
  const status: Status = f.plans.length === 1 && f.plans[0] === "proPlus" ? "enterprise" : "available";
  return { tags, status };
}

export default function FeaturesPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<string>(TOP_GROUPS[0].key);

  // Scrollspy: track which section is in view
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observers: IntersectionObserver[] = [];

    TOP_GROUPS.forEach((g) => {
      const el = document.getElementById(g.key);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActive(g.key);
            }
          });
        },
        { root: null, rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.1, 0.25, 0.5] }
      );
      io.observe(el);
      observers.push(io);
    });

    // On mount, if there's a hash, align to that section smoothly
    const hash = window.location.hash?.replace('#', '');
    if (hash) {
      const target = document.getElementById(hash);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const onNavClick = (key: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(key);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Also update URL hash without jumping
    if (history.pushState) history.pushState(null, '', `#${key}`);
    setActive(key);
  };

  return (
    <DefaultLayout>
      <main className="flex flex-col items-center justify-center gap-6 px-6 sm:px-10">
        {/* Page header (consistent with Pricing) */}
        <section className="relative mt-1 flex w-full flex-col items-center">
          <div className="relative z-20 flex max-w-2xl flex-col text-center">
            <h2 className="text-primary-600 font-medium">{t("features.title")}</h2>
            <h1 className="text-3xl font-medium tracking-tight lg:text-5xl">{t("features.heading")}</h1>
            <h2 className="text-medium text-default-500 lg:text-large mt-2 lg:mt-4">{t("features.lead")}</h2>
          </div>
        </section>

        {/* Sticky category navigation */}
        <nav
          className="inline-flex max-w-[calc(100%-2rem)] sticky top-[70px] z-20 transition-[top] duration-300"
          aria-label="Categories"
        >
          <div className="flex p-1 h-fit gap-2 items-center flex-nowrap overflow-x-auto bg-background/60 border-medium border-default-200 shadow-xs rounded-full max-w-fit dark:bg-background/60 dark:border-white/5 backdrop-blur-md backdrop-saturate-150 supports-backdrop-filter:backdrop-blur-lg supports-backdrop-filter:backdrop-saturate-150">
            {TOP_GROUPS.map((g) => {
              const selected = active === g.key;
              return (
                <a
                  key={g.key}
                  href={`#${g.key}`}
                  onClick={onNavClick(g.key)}
                  aria-current={selected ? "true" : undefined}
                  className={`z-0 w-full px-3 py-1 flex relative justify-center items-center cursor-pointer transition-colors h-9 rounded-full text-small md:text-medium whitespace-nowrap ${
                    selected
                      ? "bg-background text-default-foreground shadow-small"
                      : "text-default-500 hover:text-default-700 dark:hover:text-default-300"
                  }`}
                >
                  {t(`features.nav.${g.key}`) || g.title}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Render collated sections with subheadings */}
        <div className="z-10 w-full px-4 md:px-6 max-w-7xl">
          {TOP_GROUPS.map((group) => (
            <section key={group.key} id={group.key} className="mt-10 mb-16 scroll-mt-28">
              <h2 className="text-foreground text-2xl font-semibold">{t(group.title)}</h2>
              {group.subkeys.map((sub) => {
                const cat = CATEGORIES.find((c) => c.key === sub);
                if (!cat) return null;
                return (
                  <div key={cat.key} className="mt-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground text-lg font-medium">{t(cat.title)}</h3>
                      {cat.badge ? (
                        <span className="px-2 h-6 text-tiny rounded-full bg-white/10 text-default-foreground">{cat.badge}</span>
                      ) : null}
                    </div>
                    {cat.blurb ? <p className="text-default-500 mt-1">{t(cat.blurb)}</p> : null}
                    <div className="relative grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 pt-4">
                      {cat.features.map((f) => {
                        const meta = featureMeta(cat.title, f);
                        return (
                          <article
                            key={f.key}
                            className="flex flex-col justify-between min-h-[180px] bg-background/60 border border-white/10 hover:border-white/15 rounded-xl shadow-medium transition-colors"
                          >
                            <div className="p-4 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="text-medium font-semibold truncate">{t(f.title)}</h4>
                                  <p className="text-default-500 text-sm mt-1 line-clamp-3">{t(f.desc)}</p>
                                </div>
                                <span className={`px-2 h-6 text-tiny rounded-full flex items-center ${STATUS_STYLES[meta.status]}`}>
                                  {t(`features.status.${meta.status}`)}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {meta.tags.map((tagKey) => (
                                  <span key={tagKey} className="px-2 py-0.5 rounded-full text-[11px] bg-default-200/40 text-default-700 dark:text-default-200">
                                    {t(tagKey)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                              <div className="flex gap-2 flex-wrap">
                                {f.plans.map((p) => (
                                  <span
                                    key={p}
                                    className={`inline-flex items-center px-2 h-6 text-tiny rounded-full ${PLAN_COLORS[p]}`}
                                    title={t('features.includedIn', { plan: t(PLAN_LABELS[p]) })}
                                  >
                                    {t(PLAN_LABELS[p])}
                                  </span>
                                ))}
                              </div>
                              {/* Kanban-style completion info */}
                              <div className="text-xs text-default-500">
                                {(() => {
                                  const label = meta.status === 'available' ? t('features.completionStatus.live') : meta.status === 'enterprise' ? t('features.completionStatus.onRequest') : meta.status === 'beta' ? t('features.completionStatus.beta') : t('features.completionStatus.tbd');
                                  return t('features.completion.label', { status: label });
                                })()}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </main>
    </DefaultLayout>
  );
}
