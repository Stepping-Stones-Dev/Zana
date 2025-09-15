import type { NextApiRequest, NextApiResponse } from "next";

// Optional endpoint to fetch status from Pesapal for debugging
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { orderTrackingId } = req.query as { orderTrackingId?: string };
    if (!orderTrackingId) return res.status(400).json({ error: "orderTrackingId is required" });
    const env = (process.env.PESAPAL_ENV || "sandbox").toLowerCase();
    const base = process.env.PESAPAL_BASE_URL || (env === "live" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3");

    const tokenResp = await fetch(`${base}/api/Auth/RequestToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consumer_key: process.env.PESAPAL_CONSUMER_KEY, consumer_secret: process.env.PESAPAL_CONSUMER_SECRET }),
    });
    const tokenJson = await tokenResp.json();
    const accessToken = tokenJson?.token || tokenJson?.access_token;
    if (!accessToken) return res.status(500).json({ error: "Token failed" });

    const statusResp = await fetch(`${base}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const statusJson = await statusResp.json();
    return res.status(200).json({ ok: true, data: statusJson });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
