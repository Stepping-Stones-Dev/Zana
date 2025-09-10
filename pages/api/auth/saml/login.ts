import type { NextApiRequest, NextApiResponse } from "next";
import passport from "passport";
import "@/lib/passport-saml-setup";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end("Method Not Allowed");
  }
  // Example CSRF token check (replace with real CSRF protection in production)
  // if (req.query.csrf !== process.env.CSRF_TOKEN) return res.status(403).json({ error: "CSRF token invalid" });

  return passport.authenticate("saml", { failureRedirect: "/login?error=saml" })(req, res);
}
