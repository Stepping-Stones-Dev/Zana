import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase.js";
import { onAuthStateChanged, type User } from "firebase/auth";

export type Role = "admin" | "manager" | "employee" | "guest";

interface AuthContextProps {
  user: User | null;
  role: Role;
  loading: boolean;
  tenantDomain: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  role: "guest",
  loading: true,
  tenantDomain: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("guest");
  const [loading, setLoading] = useState(true);
  const [tenantDomain, setTenantDomain] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && firebaseUser.email) {
        const domain = firebaseUser.email.split("@")[1];
        // Check with backend if this domain is a valid tenant
        const res = await fetch(`/api/tenant?domain=${domain}`);
        if (res.ok) {
          setTenantDomain(domain);
          setRole("employee");
        } else {
          setTenantDomain(null);
          setRole("guest");
          auth.signOut();
        }
      } else {
        setTenantDomain(null);
        setRole("guest");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, tenantDomain }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
