import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebase-admin";
import { computePlanAmounts } from "@/lib/pricing";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!secret || !sk) return res.status(400).json({ error: "Stripe not configured" });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require("stripe");
  const stripe = new Stripe(sk, { apiVersion: "2024-06-20" });

  let event;
  try {
    const sig = req.headers["stripe-signature"] as string;
    const chunks: Uint8Array[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk) => chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
      req.on("end", () => resolve());
      req.on("error", reject);
    });
    const buf = Buffer.concat(chunks);
    event = stripe.webhooks.constructEvent(buf, sig, secret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = firestore();

  try {
    // Idempotency: skip if event already processed
    const eid = event.id as string;
    const processedRef = db.collection("webhookEvents").doc(eid);
    const processedSnap = await processedRef.get();
    if (processedSnap.exists) {
      return res.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        // Session has subscription id on completion
        const subscriptionId = session.subscription as string | undefined;
        const email = session.customer_details?.email || session.customer_email;
        const planId = session.metadata?.planId || "pro";
        const billing = (session.metadata?.billing as "monthly" | "yearly") || "monthly";
        if (subscriptionId && email) {
          // Fetch Stripe subscription to get accurate period dates
          const Stripe = require("stripe");
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : new Date().toISOString();
          const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const { amountKES } = computePlanAmounts(planId, billing);

          const id = `sub_${subscriptionId}`;
          await db.collection("subscriptions").doc(id).set(
            {
              id,
              email: String(email).toLowerCase(),
              planId,
              billing,
              method: "direct_debit",
              provider: "card",
              status: "active",
              mandateId: subscriptionId,
              amountKES,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string | undefined;
        const amount = invoice.amount_paid / 100;
        if (subscriptionId) {
          await db.collection("subscriptionCharges").doc(`${subscriptionId}_${invoice.id}`).set({
            subscriptionId,
            mandateId: subscriptionId,
            provider: "card",
            amount,
            status: "SUCCESS",
            createdAt: new Date().toISOString(),
          });
          // Optionally update subscription period based on invoice lines
          const lines = invoice.lines?.data?.[0];
          const period = lines?.period;
          if (period?.start && period?.end) {
            await db.collection("subscriptions").doc(`sub_${subscriptionId}`).set(
              {
                currentPeriodStart: new Date(period.start * 1000).toISOString(),
                currentPeriodEnd: new Date(period.end * 1000).toISOString(),
              },
              { merge: true }
            );
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string | undefined;
        const amount = invoice.amount_due / 100;
        if (subscriptionId) {
          await db.collection("subscriptionCharges").doc(`${subscriptionId}_${invoice.id}`).set({
            subscriptionId,
            mandateId: subscriptionId,
            provider: "card",
            amount,
            status: "FAILED",
            createdAt: new Date().toISOString(),
          });
        }
        break;
      }
      default:
        // no-op for other events
        break;
    }
  // Mark event as processed
  await processedRef.set({ id: event.id, type: event.type, at: new Date().toISOString(), provider: "stripe" });
  return res.json({ received: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
