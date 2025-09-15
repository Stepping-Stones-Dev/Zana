import admin from "firebase-admin";

// Helper: parse service account from env (supports raw JSON or base64-encoded)
function parseServiceAccount(): admin.ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    // Try plain JSON first
    return JSON.parse(raw);
  } catch {
    try {
      // Maybe base64-encoded
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}

// Initialize Firebase Admin SDK once with multiple fallbacks, and ensure default app exists
if (!admin.apps.length) {
  try {
    const svc = parseServiceAccount();
    if (svc) {
      admin.initializeApp({
        credential: admin.credential.cert(svc),
        // databaseURL is optional for Firestore; include if provided for RTDB users
        databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.FIREBASE_DB_URL,
        projectId: (svc as any).project_id || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
      } as any);
      // eslint-disable-next-line no-console
      console.info("firebase-admin initialized with service account from env");
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIRESTORE_EMULATOR_HOST || process.env.GCLOUD_PROJECT) {
      // Application Default Credentials or emulator or explicit project
      admin.initializeApp({
        projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
      } as any);
      // eslint-disable-next-line no-console
      console.info("firebase-admin initialized with ADC/Emulator");
    } else {
      // Last-resort attempt: try ADC with minimal options
      admin.initializeApp();
      // eslint-disable-next-line no-console
      console.warn("firebase-admin initialized without explicit credentials. Provide FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATIONS_CREDENTIALS for production.");
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to init firebase-admin on first attempt", e);
    try {
      // Ensure a default app exists to avoid "default app does not exist" errors; may still fail later if creds are required.
      if (!admin.apps.length) admin.initializeApp();
    } catch (e2) {
      // eslint-disable-next-line no-console
      console.error("Fallback admin.initializeApp() also failed", e2);
    }
  }
}

// Accessors with lazy safety to ensure default app exists before usage
export const firestore = () => {
  if (!admin.apps.length) {
    // As a final guard in case module init ran before envs were available
    admin.initializeApp();
  }
  return admin.firestore();
};
export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
