import { firestore } from "@zana/auth/server";

export async function retentionCleanupFailedCharges(days = 180) {
  const db = firestore();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
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
  return { ok: true, removed } as const;
}
