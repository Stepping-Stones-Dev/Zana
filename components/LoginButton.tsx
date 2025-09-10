import { auth } from "@/lib/firebase";
import { Button } from "@heroui/button";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

// Define allowed domains for tenancy
const ALLOWED_DOMAINS = ["company.com", "anothercompany.com"];

export function LoginButton({ onLoginResult }: { onLoginResult?: (result: { success: boolean; user?: any; error?: string }) => void }) {
  const [tenant, setTenant] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastUser, setToastUser] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Mark login as fresh
      localStorage.setItem("justLoggedIn", "true");
    } catch (error: any) {
      if (onLoginResult) onLoginResult({ success: false, error: error.message });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const domain = user.email.split("@")[1];
        // Check with backend if this domain is a valid tenant
        const res = await fetch(`/api/tenant?domain=${domain}`);
        if (res.ok) {
          const tenantConfig = await res.json();
          setTenant(tenantConfig);
          if (onLoginResult) onLoginResult({ success: true, user });

          // Only show toast if just logged in
          if (localStorage.getItem("justLoggedIn") === "true") {
            setToastUser(user.email);
            setShowToast(true);
            localStorage.removeItem("justLoggedIn");
            // Hide toast after 3s
            setTimeout(() => setShowToast(false), 3000);
          }
        } else {
          alert("Access denied: your workspace is not allowed.");
          auth.signOut();
          if (onLoginResult) onLoginResult({ success: false, error: "Access denied: your workspace is not allowed." });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center gap-4">
      <Button
        isIconOnly
        aria-label="Toggle theme"
        onClick={handleLogin}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        variant="light"
      >
        Login with Google Workspace
      </Button>
      {showToast && (
        <div
          className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50 transition-all duration-500 ease-in-out"
          style={{
            opacity: showToast ? 1 : 0,
            transform: showToast
              ? "translate(-50%, 0)"
              : "translate(-50%, -40px)",
          }}
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded shadow-lg">
            Welcome, {toastUser}!
          </div>
        </div>
      )}
    </div>
  );
}
