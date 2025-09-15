import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { firestore } from "@/lib/firebase-admin";

interface ProfilePayload {
  email: string;
  domain: string;
  name: string;
  role: string;
  phone: string;
  size: string;
  pains: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }
  const { email, domain, name, role, phone, size, pains } = req.body as ProfilePayload;
  if (!email || !domain || !name) return res.status(400).json({ error: "Missing required fields" });
  const normDomain = domain.toLowerCase();
  try {
    // Create tenant if not exists
    // @ts-ignore domain unique field after generate
    let tenant = await prisma.tenant.findUnique({ where: { domain: normDomain } });
    if (!tenant) {
      // @ts-ignore domain field present after generate
      tenant = await prisma.tenant.create({ data: { domain: normDomain, name: normDomain.split(".")[0] } });
    }
    // Store profile + trial in Firestore
    const db = firestore();
    const id = email.toLowerCase();
    const docRef = db.collection("onboardingProfiles").doc(id);
    const existing = await docRef.get();
    let trialEndsAt: string;
    if (existing.exists) {
      const data = existing.data() as any;
      trialEndsAt = data?.trial?.endsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await docRef.set(
        {
          email: id,
          domain: normDomain,
          tenantId: tenant.id,
          name,
            role,
            phone,
            size,
            pains: pains || [],
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } else {
      const trialEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      trialEndsAt = trialEnds.toISOString();
      await docRef.set(
        {
          email: id,
          domain: normDomain,
          tenantId: tenant.id,
          name,
          role,
          phone,
          size,
          pains: pains || [],
          trial: { startedAt: new Date().toISOString(), endsAt: trialEndsAt, status: "trial" },
          createdAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }
    return res.status(200).json({ ok: true, trialEndsAt });
  } catch (e: any) {
    return res.status(500).json({ error: "Profile save failed" });
  }
}
