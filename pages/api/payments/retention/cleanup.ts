import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebase-admin";

// Purge FAILED charges older than 180 days to reduce PII retention
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  try {
    const db = firestore();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 180);
    const snap = await db.collection("subscriptionCharges").where("status", "==", "FAILED").get();
    let removed = 0;
    for (const doc of snap.docs) {
      const d = doc.data();
      const createdAt = d.createdAt ? new Date(d.createdAt) : null;
      if (createdAt && createdAt < cutoff) {
        await doc.ref.delete();
        removed++;
      }
    }
    return res.status(200).json({ ok: true, removed });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
