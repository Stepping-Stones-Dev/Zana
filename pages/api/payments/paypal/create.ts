import type { NextApiRequest, NextApiResponse } from "next";

type Ok = { id: string; status: string; approve?: string };
type Err = { error: string; name?: string; debug_id?: string; details?: any };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { planId, email } = req.body || {};
  if (!planId) return res.status(400).json({ error: "Missing planId" });

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return res.status(500).json({ error: "PayPal not configured" });

  try {
    // Lazy import to keep it server-only
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const paypal = require("@paypal/checkout-server-sdk");
    const env = process.env.PAYPAL_ENV === "live"
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    const client = new paypal.core.PayPalHttpClient(env);

    const reqp = new paypal.subscriptions.SubscriptionsCreateRequest();
    reqp.requestBody({
      plan_id: planId,
      ...(email ? { subscriber: { email_address: email } } : {}),
      application_context: {
        brand_name: process.env.PUBLIC_BRAND || "SAM",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${process.env.PUBLIC_BASE_URL || "http://localhost:3000"}/payments/success`,
        cancel_url: `${process.env.PUBLIC_BASE_URL || "http://localhost:3000"}/payments/canceled`,
        shipping_preference: "NO_SHIPPING",
      },
    });

    const resp = await client.execute(reqp);
    const result = resp?.result || {};
    const approve = result?.links?.find((l: any) => l.rel === "approve")?.href;
    return res.status(200).json({ id: result?.id, status: result?.status, approve });
  } catch (e: any) {
    const data = e?.result || e;
    return res.status(200).json({ error: data?.message || e?.message || "PayPal create failed", name: data?.name, debug_id: data?.debug_id, details: data?.details });
  }
}
