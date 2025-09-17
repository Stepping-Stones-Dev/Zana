import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@heroui/button';

const AccountPage: NextPage = () => {
  // This would normally come from auth context
  const user = {
    displayName: 'John Doe',
    email: 'john@example.com',
    photoURL: null,
  };

  const organizations = [
    {
      id: '1',
      name: 'Acme Corp',
      slug: 'acme',
      role: 'owner',
    },
    {
      id: '2',
      name: 'Tech Startup',
      slug: 'techstartup',
      role: 'admin',
    },
  ];

  return (
    <>
      <Head>
        <title>My Account - Zana</title>
        <meta name="description" content="Manage your Zana account" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Navigation */}
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-white/20 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-gradient">
                Zana
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/account">
                  <Button variant="light">Account</Button>
                </Link>
                <Link href="/organizations">
                  <Button variant="light">Organizations</Button>
                </Link>
                <Button variant="light">Sign Out</Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Account</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage your profile and account settings
            </p>
          </div>

          <div className="grid gap-8">
            {/* Profile Section */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-6">Profile</h2>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{user.displayName || 'No name set'}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link href="/account/profile">
                  <Button color="primary">Edit Profile</Button>
                </Link>
                <Button variant="bordered">Change Password</Button>
              </div>
            </div>

            {/* Organizations Section */}
            <div className="glass-card p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Organizations</h2>
                <Link href="/organizations/new">
                  <Button color="primary">Create Organization</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {organizations.map((org) => (
                  <div key={org.id} className="flex justify-between items-center p-4 bg-white/40 dark:bg-slate-800/40 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{org.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {org.slug} • {org.role}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/organizations/${org.id}`}>
                        <Button size="sm" variant="bordered">Manage</Button>
                      </Link>
                      <Button size="sm" variant="light">Open App</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Section */}
            <div className="glass-card p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Billing</h2>
                <Link href="/account/subscriptions">
                  <Button variant="bordered">Manage Subscriptions</Button>
                </Link>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                View and manage your billing information and subscriptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountPage;