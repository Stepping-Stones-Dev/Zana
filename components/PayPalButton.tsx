import { useEffect, useRef, useState } from "react";

type Props = {
  planId: string;
  onApproved: (subscriptionId: string) => void;
  subscriberEmail?: string;
  currency?: string; // optional; omit to use plan's currency
  color?: "gold" | "blue" | "silver" | "black" | "white";
  label?: "subscribe" | "paypal" | "checkout" | "pay" | "buynow" | "installment";
};

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalButton({ planId, onApproved, subscriberEmail, currency, color = "black", label = "subscribe" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [validPlan, setValidPlan] = useState<boolean | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId || !planId) return;

    // Validate plan before loading SDK to surface clearer errors
    (async () => {
      try {
        const resp = await fetch(`/api/payments/paypal/validate-plan?planId=${encodeURIComponent(planId)}`);
        const data = await resp.json();
        if (data?.valid) {
          setValidPlan(true);
        } else {
          setValidPlan(false);
          // eslint-disable-next-line no-console
          console.error("PayPal plan validation failed:", data);
        }
      } catch (e) {
        setValidPlan(false);
      }
    })();

    // If SDK already present, just mark loaded
    if (window.paypal) {
      setLoaded(true);
      return;
    }

    // Avoid injecting multiple scripts if StrictMode/re-mount happens
    const existing = document.querySelector<HTMLScriptElement>('script[src^="https://www.paypal.com/sdk/js?"]');
    if (existing) {
      existing.addEventListener("load", () => setLoaded(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    const params = new URLSearchParams({
      "client-id": clientId,
      intent: "subscription",
      vault: "true",
    });
    if (currency) params.set("currency", currency);
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => setLoaded(false);
    document.body.appendChild(script);
    return () => {
      // don't remove SDK in case other components use it
    };
  }, [planId, currency]);

  useEffect(() => {
    if (!loaded || !window.paypal || !containerRef.current || validPlan === false) return;
    if (renderedRef.current) return; // guard against double render
    try {
      window.paypal
        .Buttons({
          style: { shape: "rect", color, layout: "horizontal", label },
          createSubscription: (_data: any, actions: any) => actions.subscription.create({ plan_id: planId }),
          onApprove: (data: any) => {
            const subId = data?.subscriptionID || data?.subscriptionId || data?.id;
            if (subId) onApproved(subId);
          },
          onCancel: () => {
            // eslint-disable-next-line no-console
            console.warn("PayPal subscription cancelled by user");
          },
          onError: (err: any) => {
            // Surface errors to help diagnose invalid plan IDs or env mismatches
            // eslint-disable-next-line no-console
            console.error("PayPal subscription error", err);
            setUiError(err?.message || "PayPal subscription failed");
          },
        })
        .render(containerRef.current);
      renderedRef.current = true;
    } catch {
      // ignore
    }
  }, [loaded, planId, color, label, onApproved, validPlan]);

  // Reset render guard if planId changes (e.g., switching tiers)
  useEffect(() => {
    renderedRef.current = false;
    if (containerRef.current) containerRef.current.innerHTML = "";
  }, [planId]);

  if (validPlan === false) {
    return <div className="text-sm text-red-600">PayPal plan not found or inactive for this environment. Check NEXT_PUBLIC_PAYPAL_PLAN_* and PayPal account.</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} />
      {uiError ? <div className="text-sm text-red-600">{uiError}</div> : null}
    </div>
  );
}
