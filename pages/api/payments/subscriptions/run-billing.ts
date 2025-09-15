import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebase-admin";
import { listDueSubscriptions, rollSubscriptionPeriod, Subscription } from "@/lib/subscriptions";
import { getProvider } from "@/lib/payments";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }
  try {
    const db = firestore();
    const due = await listDueSubscriptions();
    const results: any[] = [];
    for (const sub of due) {
      try {
        if (sub.method !== "direct_debit" || !sub.mandateId) continue;
        const prov = getProvider(sub.provider || "mobile_money");
        const charge = await prov.charge({ mandateId: sub.mandateId, amount: sub.amountKES, reference: sub.id });
        await db.collection("subscriptionCharges").doc(`${sub.id}_${Date.now()}`).set({
          subscriptionId: sub.id,
          mandateId: sub.mandateId,
          provider: sub.provider || "mobile_money",
          amount: sub.amountKES,
          status: charge.simulated ? "SIMULATED_SUCCESS" : "SUCCESS",
          createdAt: new Date().toISOString(),
        });
        await rollSubscriptionPeriod(sub.id, sub.billing);
        results.push({ id: sub.id, ok: true });
      } catch (e: any) {
        await db.collection("subscriptionCharges").doc(`${sub.id}_${Date.now()}`).set({
          subscriptionId: sub.id,
          amount: sub.amountKES,
          status: "FAILED",
          error: e.message,
          createdAt: new Date().toISOString(),
        });
        results.push({ id: sub.id, ok: false, error: e.message });
      }
    }
    return res.status(200).json({ ok: true, processed: results.length, results });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Run billing failed" });
  }
}
