import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBILqvUpVYI-VHdJ2yST7pgnCeEnzYkHOQ",
  authDomain: "school-administration-manager.firebaseapp.com",
  databaseURL: "https://school-administration-manager-default-rtdb.firebaseio.com",
  projectId: "school-administration-manager",
  storageBucket: "school-administration-manager.firebasestorage.app",
  messagingSenderId: "623198266118",
  appId: "1:623198266118:web:aaffe90c636fabbb323487",
  measurementId: "G-D2C1JS8ENW"
};

// Prevent re-initialization during hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics only works in the browser
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

const auth = getAuth(app);

export { app, analytics, auth };
