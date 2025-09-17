import { firestore } from "@zana/auth/server";
import { createSubscription } from "./subscriptions";
import { getProvider, makeAccountNumber, type ProviderName, type PlanId } from "../index";

export async function initiateDirectDebit(params: {
  email: string;
  phone?: string;
  planId: PlanId;
  billing: "monthly" | "yearly";
  provider?: ProviderName;
  locale?: string;
}) {
  const { email, phone, planId, billing, provider, locale } = params;
  const db = firestore!;
  const prov = getProvider(provider || "mobile_money");
  const mandate = await prov.initiateMandate({ email: email.toLowerCase(), phone, planId, billing, locale });

  if (mandate.hostedUrl && !mandate.mandateId) {
    try {
      const accountRef = makeAccountNumber(email, planId, billing);
      await db
        .collection("accountReferences")
        .doc(accountRef)
        .set(
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
    } catch {}
    return { hostedUrl: mandate.hostedUrl } as const;
  }

  const mandateId = mandate.mandateId as string;
  const sub = await createSubscription({ email, planId, billing, mandateId, method: "direct_debit", provider: prov.name });
  await db
    .collection("directDebitMandates")
    .doc(mandateId)
    .set({
      email: email.toLowerCase(),
      phone,
      provider: prov.name,
      status: "active",
      createdAt: new Date().toISOString(),
      subscriptionId: sub.id,
    });
  try {
    const accountRef = makeAccountNumber(email, planId, billing);
    await db.collection("accountReferences").doc(accountRef).set({
      subscriptionId: sub.id,
      email: email.toLowerCase(),
      planId,
      billing,
      provider: prov.name,
      createdAt: new Date().toISOString(),
    });
  } catch {}
  return { mandateId, subscriptionId: sub.id } as const;
}
