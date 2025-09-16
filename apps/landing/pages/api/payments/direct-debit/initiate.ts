import type { NextApiRequest, NextApiResponse } from "next";
import { initiateDirectDebit } from "@zana/payments/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { email, phone, planId, billing, provider, locale } = req.body || {};
    if (!email || !planId || !billing) {
      return res.status(400).json({ error: "Missing required fields: email, planId, billing" });
    }
    const result = await initiateDirectDebit({ email, phone, planId, billing, provider, locale });
    return res.status(200).json(result);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("direct-debit initiate error", e);
    const message = e?.message || "Failed to initiate direct debit";
    return res.status(500).json({ error: message });
  }
}
