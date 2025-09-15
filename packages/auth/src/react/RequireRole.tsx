import React from "react";
import { useAuth } from "./AuthProvider.js";

export function RequireRole({ role, children }: { role: string; children: React.ReactNode }) {
  const { role: userRole, loading } = useAuth();
  if (loading) return null;
  if (userRole !== role) return <div>Access denied</div>;
  return <>{children}</>;
}
