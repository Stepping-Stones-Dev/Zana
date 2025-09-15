import { auth } from "../lib/firebase.js";
import { Button } from "@heroui/button";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useTranslation } from "@sam/i18n";
import { useEffect, useState } from "react";

export function LoginButton({ onLoginResult }: { onLoginResult?: (result: { success: boolean; user?: any; error?: string }) => void }) {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [toastUser, setToastUser] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      localStorage.setItem("justLoggedIn", "true");
    } catch (error: any) {
      if (onLoginResult) onLoginResult({ success: false, error: error.message });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        if (onLoginResult) onLoginResult({ success: true, user });
        if (localStorage.getItem("justLoggedIn") === "true") {
          setToastUser(user.email);
          setShowToast(true);
          localStorage.removeItem("justLoggedIn");
          setTimeout(() => setShowToast(false), 3000);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center gap-4">
      <Button isIconOnly aria-label="Login" onClick={handleLogin} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition" variant="light">
        {t("auth.loginWithGoogle")}
      </Button>
      {showToast && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50 transition-all duration-500 ease-in-out" style={{ opacity: showToast ? 1 : 0, transform: showToast ? "translate(-50%, 0)" : "translate(-50%, -40px)" }}>
          <div className="bg-green-500 text-white px-6 py-3 rounded shadow-lg">{t("auth.welcome", { user: toastUser || "" })}</div>
        </div>
      )}
    </div>
  );
}
