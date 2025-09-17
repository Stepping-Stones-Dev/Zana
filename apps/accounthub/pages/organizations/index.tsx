import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@heroui/button';

const OrganizationsPage: NextPage = () => {
  // This would normally come from API
  const organizations = [
    {
      id: '1',
      name: 'Acme Corp',
      slug: 'acme',
      role: 'owner',
      memberCount: 12,
      plan: 'Professional',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Tech Startup',
      slug: 'techstartup',
      role: 'admin',
      memberCount: 5,
      plan: 'Starter',
      createdAt: '2024-03-20',
    },
  ];

  return (
    <>
      <Head>
        <title>Organizations - Zana</title>
        <meta name="description" content="Manage your organizations" />
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

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Organizations</h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage your organizations and their settings
              </p>
            </div>
            <Link href="/organizations/new">
              <Button color="primary" size="lg">
                Create Organization
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {organizations.map((org) => (
              <div key={org.id} className="glass-card p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{org.name}</h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          {org.slug}.zana.dev
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Role</div>
                        <div className="font-semibold capitalize">{org.role}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Members</div>
                        <div className="font-semibold">{org.memberCount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Plan</div>
                        <div className="font-semibold">{org.plan}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Created</div>
                        <div className="font-semibold">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/organizations/${org.id}`}>
                      <Button color="primary">Manage</Button>
                    </Link>
                    <Button variant="bordered">Open App</Button>
                  </div>
                </div>
              </div>
            ))}

            {organizations.length === 0 && (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-2xl font-bold mb-4">No organizations yet</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-8">
                  Create your first organization to get started with Zana
                </p>
                <Link href="/organizations/new">
                  <Button color="primary" size="lg">
                    Create Your First Organization
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationsPage;