import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Gather env values (may be undefined during SSR build)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only initialize in the browser when required keys exist
let app: ReturnType<typeof initializeApp> | undefined = undefined;
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;
let auth: ReturnType<typeof getAuth> | undefined = undefined;

const hasClientEnv = typeof window !== "undefined" && firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId;

if (hasClientEnv) {
  app = !getApps().length ? initializeApp(firebaseConfig as any) : getApp();
  auth = getAuth(app);
  isSupported()
    .then((yes) => {
      if (yes && app) analytics = getAnalytics(app);
    })
    .catch(() => {});
}

// Export possibly undefined values; consumer must guard (AuthProvider already does)
export { app, analytics, auth };
