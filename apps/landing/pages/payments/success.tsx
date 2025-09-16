import Link from "next/link";
import { useTranslation } from "@zana/i18n";

export default function PaymentSuccess() {
  const { t } = useTranslation();
  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">{t("pricing.success.title")}</h1>
      <p className="text-default-600 mb-6">{t("pricing.success.body")}</p>
      <div className="flex items-center justify-center gap-4">
        <Link className="text-primary underline" href="/dashboard">{t("pricing.success.goDashboard")}</Link>
        <Link className="text-default-600 underline" href="/">{t("pricing.success.goHome")}</Link>
      </div>
    </div>
  );
}
