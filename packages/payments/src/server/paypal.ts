type Ok = { id: string; status: string; approve?: string };
type Err = { error: string; name?: string; debug_id?: string; details?: any };

export async function paypalCreateSubscription(params: { planId: string; email?: string }): Promise<Ok | Err> {
  const { planId, email } = params;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { error: "PayPal not configured" };
  try {
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
    return { id: result?.id, status: result?.status, approve };
  } catch (e: any) {
    const data = e?.result || e;
    return { error: data?.message || e?.message || "PayPal create failed", name: data?.name, debug_id: data?.debug_id, details: data?.details };
  }
}

export async function paypalValidatePlan(planId: string): Promise<
  | { valid: true; plan: any }
  | { valid: false; reason: string; status?: number; debug_id?: string }
> {
  if (!planId) return { valid: false, reason: "Missing planId", status: 400 };
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const env = (process.env.PAYPAL_ENV || "sandbox").toLowerCase();
  const base = env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  if (!clientId || !clientSecret) {
    return { valid: false, reason: "PayPal server credentials not configured" };
  }
  try {
    const tokenResp = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    });
    const tokenJson: any = await tokenResp.json();
    const accessToken = tokenJson?.access_token;
    if (!tokenResp.ok || !accessToken) {
      return { valid: false, reason: `Failed to get PayPal token: ${tokenJson?.error_description || tokenJson?.error || tokenResp.statusText}`, status: tokenResp.status };
    }
    const planResp = await fetch(`${base}/v1/billing/plans/${encodeURIComponent(planId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const planJson: any = await planResp.json();
    if (planResp.status === 404 || planJson?.name === "RESOURCE_NOT_FOUND") {
      return { valid: false, reason: "Plan not found in this PayPal environment/account", status: 404, debug_id: planJson?.debug_id };
    }
    if (!planResp.ok) {
      return { valid: false, reason: `PayPal plan lookup failed: ${planJson?.message || planResp.statusText}`, status: planResp.status, debug_id: planJson?.debug_id };
    }
    if (planJson?.status && planJson.status !== "ACTIVE") {
      return { valid: false, reason: `Plan is ${planJson.status}, expected ACTIVE`, status: 409 };
    }
    return { valid: true, plan: planJson };
  } catch (e: any) {
    return { valid: false, reason: e?.message || "Unexpected error validating PayPal plan" };
  }
}
