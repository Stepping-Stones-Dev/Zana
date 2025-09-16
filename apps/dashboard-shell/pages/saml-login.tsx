import dynamic from 'next/dynamic';
const SamlLoginButton = dynamic(()=> import('@sam/auth').then(m=> m.SamlLoginButton), { ssr: false });

export default function SamlLoginPage() {
  return (
    <main className="p-10 max-w-md mx-auto flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Google Workspace SSO</h1>
      <p className="text-default-500">Use your organization account to sign in.</p>
      <SamlLoginButton />
    </main>
  );
}
