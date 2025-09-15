import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebase-admin";

// Pesapal IPN can be GET or POST. We accept both and normalize.
// Respond with required JSON: { orderNotificationType, orderTrackingId, orderMerchantReference, status }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
  const payload = req.method === "GET" ? req.query : req.body || {};
  const orderTrackingId = String((payload as any).OrderTrackingId || (payload as any).orderTrackingId || "");
  const orderMerchantReference = String((payload as any).OrderMerchantReference || (payload as any).orderMerchantReference || "");
  const orderNotificationType = String((payload as any).OrderNotificationType || (payload as any).orderNotificationType || "");

    const db = firestore();
    await db.collection("pesapalIPN").doc(orderTrackingId || `ipn_${Date.now()}`).set({
      method: req.method,
      payload,
      receivedAt: new Date().toISOString(),
    });

    // Fetch transaction status from Pesapal for detailed info
    let statusJson: any = null;
    try {
      const env = (process.env.PESAPAL_ENV || "sandbox").toLowerCase();
      const base = process.env.PESAPAL_BASE_URL || (env === "live" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3");
      const tokenResp = await fetch(`${base}/api/Auth/RequestToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consumer_key: process.env.PESAPAL_CONSUMER_KEY, consumer_secret: process.env.PESAPAL_CONSUMER_SECRET }),
      });
      const tokenJson = await tokenResp.json();
      const accessToken = tokenJson?.token || tokenJson?.access_token;
      if (accessToken && orderTrackingId) {
        const statusResp = await fetch(`${base}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        statusJson = await statusResp.json();
      }
    } catch {}

    // Map recurring subscription info
    const subInfo = statusJson?.subscription_transaction_info || null;
    const amount = statusJson?.amount || subInfo?.amount || null;
    const accountRef = subInfo?.account_reference || orderMerchantReference || null;
    const success = (statusJson?.status_code === 1 || String(statusJson?.payment_status_description || "").toLowerCase() === "completed");

    // Link recurring charge to your subscription via account reference mapping
    if (accountRef) {
      // Lookup any subscription by stored account reference
      const refDocRef = db.collection("accountReferences").doc(accountRef);
      const mapDoc = await refDocRef.get();
      const mapped = mapDoc.exists ? (mapDoc.data() as any) : null;
      let subscriptionId = mapped?.subscriptionId || null;

      // On first successful payment, create a subscription if not present
      if (!subscriptionId && success && mapped?.email && mapped?.planId && mapped?.billing) {
        try {
          const { createSubscription } = require("@/lib/subscriptions");
          const sub = await createSubscription({
            email: mapped.email,
            planId: mapped.planId,
            billing: mapped.billing,
            mandateId: orderTrackingId || accountRef,
            method: "direct_debit",
            provider: "mobile_money",
          });
          subscriptionId = sub.id;
          await refDocRef.set({ subscriptionId, status: "active", updatedAt: new Date().toISOString() }, { merge: true });
        } catch {}
      }

      if (subscriptionId) {
        await db.collection("subscriptionCharges").doc(`${subscriptionId}_${Date.now()}`).set({
          subscriptionId,
          provider: "mobile_money",
          amount,
          status: success ? "SUCCESS" : "FAILED",
          raw: statusJson,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return res.status(200).json({
      orderNotificationType: orderNotificationType || "RECURRING",
      orderTrackingId,
      orderMerchantReference,
      status: 200,
    });
  } catch (e: any) {
    return res.status(200).json({
      orderNotificationType: "RECURRING",
      orderTrackingId: "",
      orderMerchantReference: "",
      status: 500,
    });
  }
}
