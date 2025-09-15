import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebase-admin";
import { createSubscription } from "@/lib/subscriptions";
import { getProvider, ProviderName } from "@/lib/payments";
import { PlanId } from "@/lib/pricing";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }
  const { email, phone, planId, billing, provider, locale } = req.body as { email?: string; phone?: string; planId?: PlanId; billing?: "monthly" | "yearly"; provider?: ProviderName; locale?: string };
  if (!email || !planId || !billing) return res.status(400).json({ error: "Missing fields" });
  try {
    const db = firestore();
    const prov = getProvider(provider || "mobile_money");
  const mandate = await prov.initiateMandate({ email: email.toLowerCase(), phone, planId, billing, locale });
    // If provider uses a hosted onboarding page, persist account reference mapping and return its URL without creating a subscription yet
    if (mandate.hostedUrl && !mandate.mandateId) {
      try {
        const payments = require("@/lib/payments");
        if (payments.makeAccountNumber) {
          const accountRef = payments.makeAccountNumber(email, planId, billing);
          await db.collection("accountReferences").doc(accountRef).set(
            {
              email: email.toLowerCase(),
              planId,
              billing,
              provider: prov.name,
              status: "initiated",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch {}
      return res.status(200).json({ ok: true, hostedUrl: mandate.hostedUrl });
    }
  const mandateId = mandate.mandateId as string;
  const sub = await createSubscription({ email, planId, billing, mandateId, method: "direct_debit", provider: prov.name });
  await db.collection("directDebitMandates").doc(mandateId).set({
      email: email.toLowerCase(),
      phone,
      provider: prov.name,
      status: "active",
      createdAt: new Date().toISOString(),
      subscriptionId: sub.id,
    });
  // Persist account reference mapping for providers that use it (e.g., Pesapal)
  try {
    // Lazy import to avoid circular
    const payments = require("@/lib/payments");
    if (payments.makeAccountNumber) {
      const accountRef = payments.makeAccountNumber(email, planId, billing);
      await db.collection("accountReferences").doc(accountRef).set({
        subscriptionId: sub.id,
        email: email.toLowerCase(),
        planId,
        billing,
        provider: prov.name,
        createdAt: new Date().toISOString(),
      });
    }
  } catch {}
  return res.status(200).json({ ok: true, mandateId, subscriptionId: sub.id });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Mandate initiation failed" });
  }
}
