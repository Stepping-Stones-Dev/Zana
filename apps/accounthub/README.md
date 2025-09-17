# Zana Account Hub

The Account Hub is a Next.js application that provides account management, organization management, and billing functionality for the Zana platform.

## Overview

The Account Hub handles:

- User authentication and account management
- Organization creation and management
- Billing and subscription management
- Team member invitations and role management
- Domain-based SSO discovery and configuration

## Architecture

### Structure

```
apps/accounthub/
├── components/          # React components
├── layouts/            # Page layouts
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   │   ├── auth/      # Authentication APIs
│   │   ├── billing/   # Billing and payment APIs
│   │   └── orgs/      # Organization management APIs
│   ├── account/       # Account management pages
│   ├── auth/          # Authentication pages
│   └── organizations/ # Organization management pages
├── styles/            # Global styles and CSS
└── config/            # Configuration files
```

### Key Features

#### Authentication
- Email-based Home Realm Discovery (HRD)
- Firebase Authentication integration
- SSO support (SAML/OIDC) via domain mapping
- Session management with HttpOnly cookies

#### Organizations
- Create and manage multiple organizations
- Custom slug assignment with validation
- Domain verification for SSO
- Role-based access control (owner/admin/member)

#### Billing
- Multiple payment providers (Stripe, PayPal, Pesapal)
- Subscription management
- Usage-based billing
- Invoice handling

### Data Model

The application uses the following main entities:

- **Users**: User profiles and authentication data
- **Organizations**: Organization metadata and settings
- **Memberships**: User-organization relationships with roles
- **OrgSlugs**: Organization slug mappings for routing
- **OrgDomains**: Domain verification and SSO configuration
- **Subscriptions**: Billing and subscription data

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Firebase project (for authentication and database)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following variables:
- Firebase configuration (client and admin)
- Payment provider credentials
- Base URLs and cookie domain

### Development

1. Start the development server:
```bash
pnpm run dev:accounthub
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing

Run tests:
```bash
pnpm run test:accounthub
```

Run tests with coverage:
```bash
pnpm run test:accounthub -- --coverage
```

### Building

Build for production:
```bash
pnpm run build:accounthub
```

## Environment Variables

### Required Variables

#### Firebase Configuration
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server-side Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

#### Base URLs
```env
BASE_URL=https://accounts.zana.dev
APP_BASE_URL=https://app.zana.dev
COOKIE_DOMAIN=.zana.dev
```

#### Payment Providers
```env
# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox

# Pesapal
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_NOTIFICATION_ID=
```

## API Routes

### Authentication
- `POST /api/auth/discover` - Email domain discovery for SSO
- `POST /api/auth/session` - Create session cookie from Firebase ID token
- `POST /api/auth/signout` - Clear session cookie

### Organizations
- `GET /api/orgs` - List user organizations
- `POST /api/orgs` - Create new organization
- `PATCH /api/orgs/:id` - Update organization
- `POST /api/orgs/:id/slugs` - Add/change organization slug

### Billing
- `POST /api/billing/checkout` - Start checkout session
- `POST /api/billing/webhook` - Handle payment provider webhooks

## Deployment

The Account Hub can be deployed to any platform that supports Next.js applications:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Self-hosted with Docker

### Environment Setup

1. Configure all required environment variables in your deployment platform
2. Set up Firebase project with proper security rules
3. Configure payment provider webhooks to point to your deployment
4. Set up domain DNS records for custom domains

## Security Considerations

- All API routes validate authentication state
- CSRF protection on state-changing operations
- Rate limiting on authentication and sensitive endpoints
- Input validation with Zod schemas
- Secure session cookies with HttpOnly and SameSite flags
- Domain verification before enabling SSO

## Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Ensure all security considerations are addressed

## Package Dependencies

The Account Hub uses the following internal packages:

- `@zana/auth` - Authentication utilities and Firebase integration
- `@zana/db` - Firestore helpers and database abstractions
- `@zana/payments` - Payment provider integrations
- `@zana/types` - Shared TypeScript types
- `@zana/ui` - Shared UI components
- `@zana/i18n` - Internationalization support

## Monitoring and Analytics

- Authentication events are logged for audit purposes
- Payment events are tracked for billing reconciliation
- Error tracking with structured logging
- Performance monitoring for critical user flows