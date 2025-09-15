import type { NextApiRequest, NextApiResponse } from "next";
import { cancelSubscription } from "@/lib/subscriptions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: "Missing id" });
  try {
    await cancelSubscription(id);
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Cancel failed" });
  }
}
