import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

// This file is now obsolete. Use /api/auth/saml/login and /api/auth/saml/callback instead.

const handler = nextConnect<NextApiRequest, NextApiResponse>();

// Error handler
handler.use((err: any, req: NextApiRequest, res: NextApiResponse, next: any) => {
  res.status(500).json({ error: "Internal server error", details: err?.message });
});

export default handler;
