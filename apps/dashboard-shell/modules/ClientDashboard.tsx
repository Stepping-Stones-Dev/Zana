import React from 'react';
import Link from 'next/link';

type SessionUser = { id?: string; email?: string; tenantId?: string; tenantDomain?: string } | null;

export function ClientDashboard() {
  const [user, setUser] = React.useState<SessionUser>(undefined as any);
  React.useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);
  if (user === undefined) return <main className="p-10">Loading session...</main>;
  if (!user) return (
    <main className="p-10 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>You are not authenticated.</p>
      <Link className="underline text-primary" href="/saml-login">Login with Google Workspace SSO</Link>
    </main>
  );
  return (
    <main className="p-10 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Welcome {user.email}</h1>
      <p className="text-default-500">Tenant: {user.tenantDomain || user.tenantId || 'N/A'}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-default-200">Exams (soon)</div>
        <div className="p-4 rounded-lg border border-default-200">Staff (soon)</div>
        <div className="p-4 rounded-lg border border-default-200">Inventory (soon)</div>
      </div>
    </main>
  );
}
