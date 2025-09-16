import type { NextApiRequest, NextApiResponse } from "next";
import { paypalValidatePlan } from "@zana/payments/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ valid: false, reason: "Method Not Allowed" });
  }
  try {
    const planId = (req.query.planId as string) || "";
    const result = await paypalValidatePlan(planId);
    if (result.valid) return res.status(200).json(result);
    const status = result.status && typeof result.status === "number" ? result.status : 400;
    return res.status(status).json(result);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("paypal validate-plan error", e);
    return res.status(500).json({ valid: false, reason: e?.message || "Unexpected server error" });
  }
}
