import Link from "next/link";
import { useTranslation } from "@/providers/I18nProvider";

export default function PaymentCanceled() {
  const { t } = useTranslation();
  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">{t("pricing.canceled.title")}</h1>
      <p className="text-default-600 mb-6">{t("pricing.canceled.body")}</p>
      <div className="flex items-center justify-center gap-4">
        <Link className="text-primary underline" href="/payments/checkout">{t("pricing.canceled.goCheckout")}</Link>
        <Link className="text-default-600 underline" href="/">{t("pricing.canceled.goHome")}</Link>
      </div>
    </div>
  );
}
