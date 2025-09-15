import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  try {
    const event = req.body || {};
    const db = firestore();
    // Example payload: { type: 'mandate.updated'|'charge.succeeded'|'charge.failed', mandateId, subscriptionId, status, amount }
    const { type, mandateId, subscriptionId, status, amount, error } = event;
    if (type?.startsWith("mandate.")) {
      await db.collection("directDebitMandates").doc(mandateId).set({ status }, { merge: true });
    }
    if (type?.startsWith("charge.")) {
      await db.collection("subscriptionCharges").doc(`${subscriptionId}_${Date.now()}`).set({
        subscriptionId,
        mandateId,
        provider: "mobile_money",
        amount,
        status: status === 'succeeded' ? 'SUCCESS' : 'FAILED',
        error: error || null,
        createdAt: new Date().toISOString(),
      });
    }
    return res.status(200).json({ received: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
