import Link from "next/link";
import DefaultLayout from "@/layouts/default";
import { title, subtitle, floating, floatingTag, floatingCard, pillContainer, SearchIcon } from "@zana/ui";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Snippet } from "@heroui/snippet";
import { Switch } from "@heroui/switch";
import { Card, CardBody } from "@heroui/react";
// SearchIcon now imported directly from @zana/ui above
import { Kbd } from "@heroui/kbd";
import { useTranslation } from "@zana/i18n";

interface Stat { label: string; value: string }

const stats: Stat[] = [
  { label: "Setup time", value: "<10m" },
  { label: "Weekly hours saved", value: "25+" },
  { label: "Manual tasks removed", value: "150+" },
  { label: "Access clarity", value: "High" },
];

const features = [
  { title: "People Directory", desc: "Staff, teachers, aides & students—always current." },
  { title: "Access & Roles", desc: "Simple roles. Safer systems." },
  { title: "Task Automation", desc: "Cut repeats: enroll, transfer, offboard." },
  { title: "Change Log", desc: "Who changed what & when." },
];

const schoolOps = [
  { title: "Transport", desc: "Routes, riders & driver updates." },
  { title: "Inventory", desc: "Devices, books, lab kits tracked." },
  { title: "Homework", desc: "Assign, submit, follow up." },
  { title: "Attendance", desc: "Daily marks & alerts." },
  { title: "Safeguarding", desc: "Escalate & audit actions." },
  { title: "Parent Comms", desc: "One clear channel." },
];

const steps = [
  { title: "Assess", desc: "5 quick questions." },
  { title: "Setup", desc: "Create workspace." },
  { title: "Connect", desc: "Google sign‑in & groups." },
  { title: "Run", desc: "Onboard & track." },
];

export default function IndexPage() {
  const { t } = useTranslation();
  return (
    <DefaultLayout>
      <main>
        {/* Hero - emulating provided layout with floating UI bits */}
        <section className="relative flex w-full flex-nowrap justify-between items-center h-[calc(100vh_-_72px)] 2xl:h-[calc(84vh_-_64px)] overflow-hidden lg:overflow-visible px-6 sm:px-10">
          {/* Background pattern */}
          <div className="absolute -top-10 left-0 w-screen z-0 opacity-0 data-[mounted=true]:opacity-100 transition-opacity bg-left bg-no-repeat bg-hero-loops after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-[-1] after:bg-gradient-to-r after:from-transparent after:to-background dark:after:to-black" data-mounted="true" />

          {/* Left column */}
          <div className="relative z-20 flex flex-col w-full gap-6 lg:w-1/2 xl:mt-10">
            {/* Mobile badge */}
            <div className="flex justify-center w-full md:hidden">
              <Link href="/landing/features" className="relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-2 h-7 text-small rounded-full text-primary-600 bg-default-200/50 border border-default-400/50">
                <span className="px-2 font-semibold text-foreground text-xs">Zana v0.1&nbsp;🔥</span>
              </Link>
            </div>

            {/* Headline */}
            <div className="leading-8 text-center md:leading-10 md:text-left">
              <h1 className={`${title({})} tracking-tight font-semibold text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl`}>
                <span className={`${title({color: "blue" })}`}>{t("home.hero.smart")}</span>&nbsp;{t("home.hero.line1Rest")}&nbsp;
              </h1>
              <h1 className={`tracking-tight font-semibold text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl`}>
                <span className={`${title({color: "blue" })}`}>{t("home.hero.empower")}</span>&nbsp;{t("home.hero.line2Rest")}
              </h1>
            </div>

            {/* Subheading */}
            <h2 className={`${subtitle()} w-full md:w-3/4 my-1 text-medium lg:text-large font-normal text-default-500 text-center md:text-left lg:pr-8`}>
              {t("home.subheading")}
            </h2>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <Button
                as={Link}
                href="/landing/pricing"
                className="w-full md:w-auto md:h-11 h-12 rounded-full px-6 bg-primary text-primary-foreground"
                endContent={<span aria-hidden>→</span>}
              >
                {t("home.cta.freeTrial")}
              </Button>

              <Link
                href="https://github.com/Stepping-Stones-Dev/zana"
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden border-medium px-6 min-w-24 h-12 text-medium gap-3 rounded-full transition bg-transparent border-default text-foreground w-full inline-flex items-center justify-center"
              >
                {t("home.cta.github")}
              </Link>
            </div>
          </div>

          {/* Right column - floating UI previews (desktop only) */}
          <div className="hidden lg:flex flex-col relative z-20 w-1/2">
            {/* Search */}
            <div className={`${floating({speed: "normal", delay: "d120"})} absolute -top-[60px] -right-[100px]`}>
              <div className="mt-3 w-[330px]">
                <Input defaultValue={t("home.search.example")} size="sm" className="shadow-xs" startContent={
                   <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
                  }
                   endContent={
                    <Kbd className="hidden lg:inline-block" keys={["command"]}>
                      K
                    </Kbd>
                  }
                  type="search"/>
              </div>
            </div>

            {/* Tabs preview */}
            <div className={`${floating({speed: "slower", delay: "d420"})} inline-flex absolute left-[170px] -top-[160px] h-10`}>
              <ul className={`${pillContainer()} max-w-[440px]`}>
                {[t("home.tabs.inventory"), t("home.tabs.transport"), t("home.tabs.timetables"), t("home.tabs.reports")].map((txt,i)=> (
                  <li key={txt} className={`px-3 py-2 h-8 text-tiny rounded-full ${i===2 ? 'bg-background shadow-small text-foreground' : 'text-default-500'}`}>{txt}</li>
                ))}
              </ul>
            </div>

            {/* Profile card */}
            <Card className={`${floatingCard()} ${floating({speed: "normal", delay: "d300"})} absolute left-[30px] -top-[80px] max-w-[300px]`}>
              <CardBody className="p-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-default ring-2 ring-default/60" />
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-default-600">Lily Kitala</h4>
                      <h5 className="text-sm tracking-tight text-default-400">@lilykitala</h5>
                    </div>
                  </div>
                  <Button size="sm" radius="full" className="bg-primary text-primary-foreground h-8">{t("home.profile.follow")}</Button>
                </div>
                <p className="text-sm text-default-400 mt-2">Zana has streamlined onboarding for our school, and improved our customer experience. #steppingstones #admins 🎉</p>
                <div className="flex gap-4 mt-3">
                  <div className="flex gap-1 text-default-400 text-sm"><span className="font-semibold">4</span> {t("home.profile.following")}</div>
                  <div className="flex gap-1 text-default-400 text-sm"><span className="font-semibold">97.1K</span> {t("home.profile.followers")}</div>
                </div>
              </CardBody>
            </Card>
            
            
                
            {/* Additional profile card (different position) */}
            <Card className={`${floatingCard()} ${floating({speed: "slower", delay: "d900"})} absolute right-[-50px] top-[80px] max-w-[300px]`}>
              <CardBody className="p-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-default ring-2 ring-default/60" />
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-default-600">Brian Otieno</h4>
                      <h5 className="text-sm tracking-tight text-default-400">@brianotieno</h5>
                    </div>
                  </div>
                  <Button size="sm" radius="full" className="bg-primary text-primary-foreground h-8">{t("home.profile.follow")}</Button>
                </div>
                <p className="text-sm text-default-400 mt-2">Thats about 50 less emails to read every day! #thingsmadesimple #progress</p>
                <div className="flex gap-4 mt-3">
                  <div className="flex gap-1 text-default-400 text-sm"><span className="font-semibold">12</span> {t("home.profile.following")}</div>
                  <div className="flex gap-1 text-default-400 text-sm"><span className="font-semibold">100</span> {t("home.profile.followers")}</div>
                </div>
              </CardBody>
            </Card>

            {/* Floating feature tags (separate, colored, offset) */}
            <div className={`${floatingTag({color: "secondary"})} ${floating({speed: "normal", delay: "d1100"})} absolute left-[370px] top-[-200px] z-10`}>
              {t("home.floating.manageInventory")}
            </div>
            <div className={`${floatingTag({color: "success"})} ${floating({speed: "normal", delay: "d1400"})} absolute right-[40px] top-[280px] z-10`}>
              {t("home.floating.onboardStudents")}
            </div>
            <div className={`${floatingTag({color: "warning"})} ${floating({speed: "normal", delay: "d1700"})} absolute left-[90px] top-[80px] z-10`}>
              {t("home.floating.trackProgress")}
            </div>
          </div>
        </section>

      </main>
    </DefaultLayout>
  );
}
