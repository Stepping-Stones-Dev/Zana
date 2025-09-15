import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const consumer_key = process.env.PESAPAL_CONSUMER_KEY;
    const consumer_secret = process.env.PESAPAL_CONSUMER_SECRET;
    const env = (process.env.PESAPAL_ENV || "sandbox").toLowerCase();
    const base = process.env.PESAPAL_BASE_URL || (env === "live" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3");

    if (!consumer_key || !consumer_secret) {
      return res.status(400).json({ ok: false, error: "Missing PESAPAL_CONSUMER_KEY or PESAPAL_CONSUMER_SECRET" });
    }

  const tokenResp = await fetch(`${base}/api/Auth/RequestToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consumer_key, consumer_secret }),
    });
    const contentType = tokenResp.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await tokenResp.json() : await tokenResp.text();
    const token = typeof body === "object" && body ? (body as any).token || (body as any).access_token : undefined;
    const mask = (v?: string) => (v ? `${v.slice(0, 3)}…${v.slice(-3)}` : undefined);
    return res.status(200).json({
      ok: !!token,
      status: tokenResp.status,
      env,
      base,
      keyPresent: !!consumer_key,
      secretPresent: !!consumer_secret,
      keyMask: mask(consumer_key),
      secretMask: mask(consumer_secret),
      hasToken: !!token,
      tokenPreview: token ? String(token).slice(0, 6) + "…" : undefined,
      raw: body,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
