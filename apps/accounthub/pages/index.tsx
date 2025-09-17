import { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@heroui/button';
import DefaultLayout from '@/layouts/default';
import { title, subtitle, floating, floatingTag, floatingCard, BuildingIcon, CreditCardIcon, ShieldIcon } from '@zana/ui';
import { Card, CardBody } from '@heroui/card';
import { useTranslation } from '@zana/i18n';

const HomePage: NextPage = () => {
  const { t } = useTranslation();
  
  return (
    <DefaultLayout>
      <main>
        {/* Hero Section */}
        <section className="relative flex w-full flex-nowrap justify-between items-center h-[calc(100vh_-_72px)] 2xl:h-[calc(84vh_-_64px)] overflow-hidden lg:overflow-visible px-6 sm:px-10">
          {/* Background pattern */}
          <div className="absolute -top-10 left-0 w-screen z-0 opacity-0 data-[mounted=true]:opacity-100 transition-opacity bg-left bg-no-repeat bg-hero-loops after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-[-1] after:bg-gradient-to-r after:from-transparent after:to-background dark:after:to-black" data-mounted="true" />

          {/* Left column */}
          <div className="relative z-20 flex flex-col w-full gap-6 lg:w-1/2 xl:mt-10">
            {/* Mobile badge */}
            <div className="flex justify-center w-full md:hidden">
              <Link href="/features" className="relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-2 h-7 text-small rounded-full text-primary-600 bg-default-200/50 border border-default-400/50">
                <span className="px-2 font-semibold text-foreground text-xs">{t('home.hero.tagline')}</span>
              </Link>
            </div>

            {/* Headline */}
            <div className="leading-8 text-center md:leading-10 md:text-left">
              <h1 className={`${title({})} tracking-tight font-semibold text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl`}>
                <span className={`${title({color: "blue" })}`}>{t('home.hero.headline1')}</span>&nbsp;
              </h1>
              <h1 className={`tracking-tight font-semibold text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl`}>
                <span className={`${title({color: "blue" })}`}>{t('home.hero.headline2')}</span>&nbsp;
              </h1>
              <h1 className={`tracking-tight font-semibold text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl`}>
                <span className={`${title({color: "blue" })}`}>{t('home.hero.headline3')}</span>
              </h1>
            </div>

            {/* Subheading */}
            <h2 className={`${subtitle()} w-full md:w-3/4 my-1 text-medium lg:text-large font-normal text-default-500 text-center md:text-left lg:pr-8`}>
              {t('home.hero.subheading')}
            </h2>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <Button
                as={Link}
                href="/auth"
                className="w-full md:w-auto md:h-11 h-12 rounded-full px-6 bg-primary text-primary-foreground"
                endContent={<span aria-hidden>→</span>}
              >
                {t('home.cta.getStarted')}
              </Button>

              <Link
                href="/features"
                className="md:hidden border-medium px-6 min-w-24 h-12 text-medium gap-3 rounded-full transition bg-transparent border-default text-foreground w-full inline-flex items-center justify-center"
              >
                {t('home.cta.learnMore')}
              </Link>
            </div>
          </div>

          {/* Right column - floating UI previews (desktop only) */}
          <div className="hidden lg:flex flex-col relative z-20 w-1/2">
            {/* Organization card */}
            <Card className={`${floatingCard()} ${floating({speed: "normal", delay: "d300"})} absolute left-[30px] -top-[80px] max-w-[300px] animate-float-slow`}>
              <CardBody className="p-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary ring-2 ring-primary/60 flex items-center justify-center">
                      <BuildingIcon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-default-600">{t('home.floating.organization.name')}</h4>
                      <h5 className="text-sm tracking-tight text-default-400">{t('home.floating.organization.domain')}</h5>
                    </div>
                  </div>
                  <Button size="sm" radius="full" className="bg-success text-success-foreground h-8">{t('home.floating.organization.status')}</Button>
                </div>
                <p className="text-sm text-default-400 mt-2">{t('home.floating.organization.users', {count: 25})} • {t('home.floating.organization.plan')} • {t('home.floating.organization.price')}</p>
                <div className="flex gap-4 mt-3">
                  <div className="flex gap-1 text-default-400 text-sm"><span className="font-semibold">6</span> {t('home.floating.organization.teams', {count: ''}).trim()}</div>
                  <div className="flex gap-1 text-default-400 text-sm"><span className="font-semibold">8</span> {t('home.floating.organization.apps', {count: ''}).trim()}</div>
                </div>
              </CardBody>
            </Card>

            {/* Billing card */}
            <Card className={`${floatingCard()} ${floating({speed: "slower", delay: "d900"})} absolute right-[-50px] top-[80px] max-w-[300px] animate-float-reverse`}>
              <CardBody className="p-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-warning ring-2 ring-warning/60 flex items-center justify-center">
                      <CreditCardIcon className="w-5 h-5 text-warning-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-default-600">{t('home.floating.billing.title')}</h4>
                      <h5 className="text-sm tracking-tight text-default-400">{t('home.floating.billing.dueDate')}</h5>
                    </div>
                  </div>
                  <Button size="sm" radius="full" className="bg-primary text-primary-foreground h-8">{t('home.floating.billing.payNow')}</Button>
                </div>
                <p className="text-sm text-default-400 mt-2">{t('home.floating.billing.amount')} • {t('home.floating.billing.autoPayment')} • {t('home.floating.billing.paymentMethod')}</p>
              </CardBody>
            </Card>

            {/* Floating feature tags */}
            <div className={`${floatingTag({color: "secondary"})} ${floating({speed: "normal", delay: "d1100"})} absolute left-[370px] top-[-200px] z-10 animate-bounce-gentle`}>
              {t('home.floating.tags.multiTenant')}
            </div>
            <div className={`${floatingTag({color: "success"})} ${floating({speed: "normal", delay: "d1400"})} absolute right-[40px] top-[280px] z-10 animate-pulse-gentle`}>
              {t('home.floating.tags.ssoReady')}
            </div>
            <div className={`${floatingTag({color: "warning"})} ${floating({speed: "normal", delay: "d1700"})} absolute left-[90px] top-[80px] z-10 animate-float-fast`}>
              {t('home.floating.tags.autoBilling')}
            </div>
          </div>
        </section>

      </main>
    </DefaultLayout>
  );
};

export default HomePage;