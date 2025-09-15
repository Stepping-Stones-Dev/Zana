import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { domain, name } = req.body || {};
    if (typeof domain !== "string" || typeof name !== "string" || !domain) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    try {
  // @ts-ignore domain unique field available after prisma generate
  const existing = await prisma.tenant.findUnique({ where: { domain } });
      if (existing) return res.status(200).json(existing);
  // @ts-ignore domain field after generate
  const created = await prisma.tenant.create({ data: { domain: domain.toLowerCase(), name } });
      return res.status(201).json(created);
    } catch (e: any) {
      return res.status(500).json({ error: "Create failed" });
    }
  }
  if (req.method === "GET") {
    try {
      const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "desc" } });
      return res.status(200).json(tenants);
    } catch (e: any) {
      return res.status(500).json({ error: "List failed" });
    }
  }
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
