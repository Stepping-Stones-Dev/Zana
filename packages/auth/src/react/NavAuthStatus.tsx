import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Cookies from "js-cookie";
import { auth } from "../lib/firebase.js";
import { useTranslation } from "@sam/i18n";
import { SamlLoginButton } from "./SamlLoginButton.js";

export default function NavAuthStatus() {
  const { t } = useTranslation();
  const [loginResult, setLoginResult] = useState<{ success: boolean; message: string } | null>(null);
  const [jwtUser, setJwtUser] = useState<{ email?: string; name?: string; picture?: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setLoginResult({ success: true, message: t("auth.loginSuccess") });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const token = Cookies.get("token");
    const samlLoginShown = typeof window !== "undefined" ? localStorage.getItem("samlLoginShown") : null;
    if (token && !samlLoginShown) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setJwtUser({ email: payload.email, name: payload.name, picture: payload.picture });
        setLoginResult({ success: true, message: t("auth.loggedIn") });
        if (typeof window !== "undefined") localStorage.setItem("samlLoginShown", "true");
      } catch {
        setJwtUser(null);
      }
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setJwtUser({ email: payload.email, name: payload.name, picture: payload.picture });
      } catch {
        setJwtUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (loginResult) {
      const t = setTimeout(() => setLoginResult(null), 3000);
      return () => clearTimeout(t);
    }
  }, [loginResult]);

  return (
    <>
      <div className="hidden md:flex">
        {jwtUser ? (
          <span className="flex items-center gap-2 text-sm text-green-700 font-medium">
            {jwtUser.picture ? (
              <img src={jwtUser.picture} alt={jwtUser.name || jwtUser.email} className="w-8 h-8 rounded-full border border-gray-300" referrerPolicy="no-referrer" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {(jwtUser.name || jwtUser.email || "?")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            )}
          </span>
        ) : (
          <SamlLoginButton />
        )}
      </div>

      {loginResult && (
        <div
          className={`fixed left-0 right-0 top-[56px] z-50 transition-transform duration-300 ${loginResult.success ? "bg-green-500 text-white" : "bg-red-500 text-white"} px-4 py-0 text-center shadow-md`}
          style={{ transform: loginResult ? "translateY(0)" : "translateY(-100%)" }}
        >
          {loginResult.message}
        </div>
      )}
    </>
  );
}
