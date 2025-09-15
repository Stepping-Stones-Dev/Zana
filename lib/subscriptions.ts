import { firestore } from "@/lib/firebase-admin";
import { PlanId, getPlanById, computePlanAmounts } from "@/lib/pricing";
import type { ProviderName } from "@/lib/payments";

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete";

export type Subscription = {
  id: string; // sub_*
  email: string;
  planId: PlanId;
  billing: "monthly" | "yearly";
  method: "direct_debit" | "mpesa" | "card" | "paypal";
  provider: ProviderName; // which processor is used for direct debit
  status: SubscriptionStatus;
  amountKES: number;
  currentPeriodStart: string; // ISO
  currentPeriodEnd: string; // ISO
  mandateId?: string; // for direct debit
  createdAt: string; // ISO
  canceledAt?: string; // ISO
};

export function nextPeriodStartEnd(now: Date, billing: "monthly" | "yearly") {
  const start = new Date(now);
  const end = new Date(now);
  if (billing === "monthly") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function createSubscription(params: {
  email: string;
  planId: PlanId;
  billing: "monthly" | "yearly";
  method: "direct_debit";
  mandateId: string;
  provider: ProviderName;
}) {
  const plan = getPlanById(params.planId);
  if (!plan) throw new Error("Invalid plan");
  const { amountKES } = computePlanAmounts(params.planId, params.billing);
  const now = new Date();
  const { start, end } = nextPeriodStartEnd(now, params.billing);
  const db = firestore();
  const id = `sub_${Date.now()}`;
  const rec: Subscription = {
    id,
    email: params.email.toLowerCase(),
    planId: params.planId,
    billing: params.billing,
    method: "direct_debit",
  provider: params.provider,
    status: "active",
    amountKES,
    currentPeriodStart: start,
    currentPeriodEnd: end,
    mandateId: params.mandateId,
    createdAt: now.toISOString(),
  };
  await db.collection("subscriptions").doc(id).set(rec);
  return rec;
}

export async function cancelSubscription(id: string) {
  const db = firestore();
  await db.collection("subscriptions").doc(id).set({ status: "canceled", canceledAt: new Date().toISOString() }, { merge: true });
}

export async function listDueSubscriptions(now = new Date()) {
  const db = firestore();
  const snap = await db
    .collection("subscriptions")
    .where("status", "==", "active")
    .get();
  const res: Subscription[] = [];
  snap.forEach((doc) => {
    const d = doc.data() as Subscription;
    if (new Date(d.currentPeriodEnd) <= now) res.push(d);
  });
  return res;
}

export async function rollSubscriptionPeriod(id: string, billing: "monthly" | "yearly") {
  const now = new Date();
  const { start, end } = nextPeriodStartEnd(now, billing);
  const db = firestore();
  await db.collection("subscriptions").doc(id).set(
    {
      currentPeriodStart: start,
      currentPeriodEnd: end,
    },
    { merge: true }
  );
}
