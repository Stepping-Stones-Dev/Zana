import type { NextApiRequest, NextApiResponse } from "next";
import passport from "passport";
import jwt from "jsonwebtoken";
import "@/lib/passport-saml-setup";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }
  // Example CSRF token check (replace with real CSRF protection in production)
  // if (req.body.csrf !== process.env.CSRF_TOKEN) return res.status(403).json({ error: "CSRF token invalid" });

  passport.authenticate(
    "saml",
    { failureRedirect: "/login?error=saml", session: false },
    (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error", details: err?.message });
      }
      if (!user) {
        return res.redirect("/login?error=saml");
      }
      try {
        const token = jwt.sign(
          {
            email: user.email || user.nameID,
            name: user.displayName || user.cn || user.givenName,
            domain: user.email ? user.email.split("@")[1] : undefined,
            saml: true,
          },
          JWT_SECRET,
          { expiresIn: "2h" }
        );
        res.setHeader("Set-Cookie", `token=${token}; Path=/; Max-Age=7200`);
        res.redirect(`/`);
      } catch (e: any) {
        res.status(500).json({ error: "SAML callback failed", details: e.message });
      }
    }
  )(req, res);
}

