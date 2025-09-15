import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

function suggestName(domain: string) {
  const base = domain.split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1) + " Workspace";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }
  const { email } = req.body || {};
  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  const domain = email.split("@")[1].toLowerCase();
  try {
  // @ts-ignore domain unique field available after prisma generate
  const tenant = await prisma.tenant.findUnique({ where: { domain } });
    const exists = !!tenant;
    return res.status(200).json({ domain, exists, suggestedName: suggestName(domain) });
  } catch (e: any) {
    return res.status(500).json({ error: "Lookup failed" });
  }
}
