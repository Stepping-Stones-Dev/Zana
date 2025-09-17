import { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@heroui/button';
import DefaultLayout from '@/layouts/default';
import { title, subtitle } from '@zana/ui';
import { Card, CardBody } from '@heroui/card';
import { useTranslation } from '@zana/i18n';

// Import icons from the built UI package
import { BuildingIcon, UsersIcon, ShieldIcon, CreditCardIcon, RocketIcon, BarChartIcon } from '@zana/ui';

const FeaturesPage: NextPage = () => {
  const { t } = useTranslation();
  
  // Icon mapping for features
  const getFeatureIcon = (index: number) => {
    const icons = [BuildingIcon, UsersIcon, ShieldIcon, CreditCardIcon, RocketIcon, BarChartIcon];
    return icons[index % icons.length];
  };
  
  const features = [
    {
      title: 'Organization Management',
      description: 'Create and manage multiple organizations with custom slugs and domains.',
      details: [
        'Unlimited organizations',
        'Custom subdomain routing',
        'Domain verification',
        'Organization-level settings',
      ],
    },
    {
      title: 'Team Collaboration',
      description: 'Invite team members and manage roles and permissions across your organizations.',
      details: [
        'Role-based access control',
        'Team member invitations',
        'Permission management',
        'Activity tracking',
      ],
    },
    {
      title: 'Enterprise Security',
      description: 'Advanced security features including SSO integration and domain-based authentication.',
      details: [
        'SAML/OIDC SSO',
        'Domain-based discovery',
        'Multi-factor authentication',
        'Audit logging',
      ],
    },
    {
      title: 'Flexible Billing',
      description: 'Transparent pricing with multiple payment options and detailed usage tracking.',
      details: [
        'Multiple payment methods',
        'Usage-based billing',
        'Invoice management',
        'Cost allocation',
      ],
    },
    {
      title: 'Developer Ready',
      description: 'Built with modern technologies and developer-friendly APIs.',
      details: [
        'REST APIs',
        'Webhook integrations',
        'SDK libraries',
        'Comprehensive documentation',
      ],
    },
    {
      title: 'Analytics & Reporting',
      description: 'Detailed insights into usage, performance, and team productivity.',
      details: [
        'Usage analytics',
        'Performance metrics',
        'Custom reports',
        'Data export',
      ],
    },
  ];

  return (
    <DefaultLayout>
      <main className="px-6 sm:px-10">
        <section className="relative mt-1 flex w-full flex-col items-center pb-24">
          <div className="relative z-20 flex max-w-2xl flex-col text-center">
            <h2 className="text-primary-600 font-medium">Features</h2>
            <h1 className={`${title({})} text-3xl font-medium tracking-tight lg:text-5xl`}>
              <span className={`${title({color: "blue" })}`}>Powerful</span> Features for Modern Teams
            </h1>
            <h2 className={`${subtitle()} text-medium text-default-500 lg:text-large mt-2 lg:mt-4`}>
              Discover all the features that make Zana the perfect choice for your organization
            </h2>
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            {features.map((feature, index) => {
              const IconComponent = getFeatureIcon(index);
              return (
                <Card key={feature.title} className="shadow-medium rounded-large backdrop-blur-md bg-background/80 border-small p-3">
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-default-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-default-600 mb-4 leading-relaxed">
                          {feature.description}
                        </p>
                        <ul className="space-y-2">
                          {feature.details.map((detail) => (
                            <li key={detail} className="flex items-center gap-2 text-sm text-default-500">
                              <svg
                                aria-hidden="true"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                className="text-primary flex-none"
                              >
                                <path
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="m6 12 4.243 4.243 8.484-8.486"
                                />
                              </svg>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <section className="mt-16 text-center">
            <h3 className={`${title({})} text-2xl font-semibold mb-4`}>Ready to get started?</h3>
            <p className={`${subtitle()} text-default-500 mb-6`}>Join thousands of teams already using Zana to streamline their operations.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                href="/auth"
                color="primary"
                size="lg"
                className="px-8 rounded-full"
                endContent={<span aria-hidden>→</span>}
              >
                Start Free Trial
              </Button>
              <Button
                as={Link}
                href="/pricing"
                variant="bordered"
                size="lg"
                className="px-8 rounded-full"
              >
                View Pricing
              </Button>
            </div>
          </section>
        </section>
      </main>
    </DefaultLayout>
  );
};

export default FeaturesPage;