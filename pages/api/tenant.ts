import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import jwt from "jsonwebtoken";

// Example tenant configs
const TENANTS: Record<string, any> = {
  "school1.com": { name: "School 1", theme: "blue", features: ["a", "b"] },
  "school2.edu": { name: "School 2", theme: "green", features: ["c"] },
  "gmail.com": { name: "Gmail", theme: "red", features: ["d"] },
  // ...add more schools here...
};

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export async function getWorkspaceUsers(domain: string): Promise<any[]> {
  // This requires a service account with domain-wide delegation
  // and the credentials JSON file path in GOOGLE_APPLICATION_CREDENTIALS env var
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
  });
  const admin = google.admin({ version: "directory_v1", auth });
  // Replace with the super admin email for the domain
  const adminEmail = process.env.GSUITE_SUPERADMIN_EMAIL as string;

  const client = await auth.getClient();
  // Impersonate the admin
  (client as any).subject = adminEmail;

  const res = await admin.users.list({
    customer: "my_customer",
    domain,
    maxResults: 100,
    orderBy: "email",
  });
  return res.data.users || [];
}

// Validate if a user exists in the workspace and return JWT if valid
async function validateUserInWorkspace(domain: string, email: string) {
  const users = await getWorkspaceUsers(domain);
  const found = users.find((u) => u.primaryEmail?.toLowerCase() === email.toLowerCase());
  if (!found) return null;
  // Only include minimal user info in JWT
  const token = jwt.sign(
    { email: found.primaryEmail, domain, name: found.name?.fullName },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
  return token;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { domain } = req.query;
  if (typeof domain !== "string" || !TENANTS[domain]) {
    res.status(403).json({ error: "Tenant not found" });
    return;
  }
  if (req.method === "GET" && req.query.users === "1" && typeof domain === "string") {
    try {
      const users = await getWorkspaceUsers(domain);
      res.status(200).json(users);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch users", details: e.message });
    }
    return;
  }

  // User validation endpoint: POST /api/tenant/validate { domain, email }
  if (req.method === "POST" && req.url?.endsWith("/validate")) {
    const { domain, email } = req.body;
    if (typeof domain !== "string" || typeof email !== "string" || !TENANTS[domain]) {
      res.status(403).json({ error: "Invalid domain or email" });
      return;
    }
    try {
      const token = await validateUserInWorkspace(domain, email);
      if (!token) {
        res.status(403).json({ error: "User not found in workspace" });
        return;
      }
      res.status(200).json({ token });
    } catch (e: any) {
      res.status(500).json({ error: "Validation failed", details: e.message });
    }
    return;
  }

  res.status(200).json(TENANTS[domain]);
}
