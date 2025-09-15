import { useState } from "react";
import { useTranslation } from "@sam/i18n";

type Props = {
  email: string;
  planId: string;
  billing: "monthly" | "yearly";
  locale?: string;
  color?: "black" | "white";
  label?: string; // localized fallback used if not provided
  disabled?: boolean;
};

export function PesapalButton({ email, planId, billing, locale, color = "black", label, disabled }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const resolvedLabel = label ?? t("pricing.checkout.pesapalButton") ?? "Pay with Pesapal";

  async function startCheckout() {
    setUiError(null);
    setLoading(true);
    try {
      const resp = await fetch("/api/payments/direct-debit/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, planId, billing, provider: "mobile_money", locale }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed to initiate Pesapal checkout");
      const url = data?.hostedUrl;
      if (url) {
        window.location.assign(url);
        return;
      }
      // Fallback note if we didn't get a hosted URL
      setUiError("Hosted checkout link not returned by server.");
    } catch (e: any) {
      setUiError(e?.message || "Pesapal checkout failed");
    } finally {
      setLoading(false);
    }
  }

  const baseClasses = "inline-flex items-center justify-center rounded-md px-4 py-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2";
  const colorClasses =
    color === "white"
      ? "bg-white text-black hover:bg-white/90 focus-visible:ring-black focus-visible:ring-offset-black"
      : "bg-black text-white hover:bg-black/90 focus-visible:ring-black focus-visible:ring-offset-white";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={startCheckout}
        disabled={disabled || loading || !email}
        className={`${baseClasses} ${colorClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Pay with Pesapal"
      >
        {/* Simple brand mark "P" in a circle + text to mimic branded button styling without external assets */}
        <span
          aria-hidden
          className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-white text-black text-xs font-bold"
        >
          P
        </span>
        <span className="text-base font-semibold">{loading ? "Redirecting…" : resolvedLabel}</span>
      </button>
      {uiError ? <div className="text-sm text-red-600">{uiError}</div> : null}
    </div>
  );
}
