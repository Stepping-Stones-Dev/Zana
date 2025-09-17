import { firestore } from "@zana/auth/server";

export async function handleMpesaCallback(payload: any) {
  const db = firestore!;
  const id = `cb_${Date.now()}`;
  await db.collection("mpesaCallbacks").doc(id).set({ payload, receivedAt: new Date().toISOString() });
  const resultCode = payload?.Body?.stkCallback?.ResultCode;
  const msisdn = payload?.Body?.stkCallback?.CallbackMetadata?.Item?.find((i: any) => i.Name === "PhoneNumber")?.Value;
  if (resultCode === 0 && msisdn) {
    const profiles = await db
      .collection("onboardingProfiles")
      .where("phone", "==", String(msisdn))
      .limit(1)
      .get();
    if (!profiles.empty) {
      await profiles.docs[0].ref.set(
        { trial: { status: "active", activatedAt: new Date().toISOString() } },
        { merge: true }
      );
    }
  }
  return { ok: true } as const;
}
