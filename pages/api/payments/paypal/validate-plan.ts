import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | { valid: true; plan: any }
  | { valid: false; reason: string; status?: number; debug_id?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") return res.status(405).json({ valid: false, reason: "Method not allowed", status: 405 });

  const planId = (req.query.planId as string) || "";
  if (!planId) return res.status(400).json({ valid: false, reason: "Missing planId", status: 400 });

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const env = (process.env.PAYPAL_ENV || "sandbox").toLowerCase();
  const base = env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  if (!clientId || !clientSecret) {
    return res.status(200).json({ valid: false, reason: "PayPal server credentials not configured" });
  }

  try {
    // 1) Get an access token
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
      return res.status(200).json({ valid: false, reason: `Failed to get PayPal token: ${tokenJson?.error_description || tokenJson?.error || tokenResp.statusText}`, status: tokenResp.status });
    }

    // 2) Fetch plan details
    const planResp = await fetch(`${base}/v1/billing/plans/${encodeURIComponent(planId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const planJson: any = await planResp.json();

    if (planResp.status === 404 || planJson?.name === "RESOURCE_NOT_FOUND") {
      return res.status(200).json({ valid: false, reason: "Plan not found in this PayPal environment/account", status: 404, debug_id: planJson?.debug_id });
    }
    if (!planResp.ok) {
      return res.status(200).json({ valid: false, reason: `PayPal plan lookup failed: ${planJson?.message || planResp.statusText}`, status: planResp.status, debug_id: planJson?.debug_id });
    }

    if (planJson?.status && planJson.status !== "ACTIVE") {
      return res.status(200).json({ valid: false, reason: `Plan is ${planJson.status}, expected ACTIVE`, status: 409 });
    }

    return res.status(200).json({ valid: true, plan: planJson });
  } catch (e: any) {
    return res.status(200).json({ valid: false, reason: e?.message || "Unexpected error validating PayPal plan" });
  }
}
