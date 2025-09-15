import DefaultLayout from "@/layouts/default";
import { useTranslation } from "@/providers/I18nProvider";

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <DefaultLayout>
      <main className="px-6 sm:px-10">
        <section className="relative mt-1 flex w-full flex-col items-center pb-12">
          <div className="relative z-20 flex max-w-2xl flex-col text-center">
            <h2 className="text-primary-600 font-medium">{t("common.nav.contact")}</h2>
            <h1 className="text-3xl font-medium tracking-tight lg:text-5xl">{t("contact.heading")}</h1>
            <h2 className="text-medium text-default-500 lg:text-large mt-2 lg:mt-4">{t("contact.lead")}</h2>
          </div>
        </section>
      </main>
    </DefaultLayout>
  );
}
