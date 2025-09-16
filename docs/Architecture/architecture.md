# App Architecture (Revised)

## Overview
We now split the product into two apps with clear responsibilities, modeled after Adobe Creative Cloud's public site + account hub + app shell pattern.

| App | Path | Purpose | Auth Context | Deployment Notes |
|-----|------|---------|--------------|------------------|
| Landing (Account Hub) | `apps/landing` | Public marketing, SEO, and the authenticated Account area responsible for user identity, subscriptions, and organizations (tenants) | `@zana/auth` (Firebase client); no SAML | Public marketing routes can be cached on CDN; authenticated account routes must be no-store/private |
| Dashboard Shell | `apps/dashboard-shell` | Authenticated tenant workspace (day-to-day operations inside a selected organization) | `@zana/auth` (server/client) + optional SAML for enterprise tenants | Requires session + stricter headers; receives selected organization/tenant context |

## Why This Shape?
- Clear funnel: market → sign up/login → pick/create organization → manage subscription → open tenant shell
- Security boundary: billing/account and tenant runtime are isolated apps
- Performance: cache public pages aggressively while keeping account and app dynamic
- Ownership clarity: account/subscriptions/orgs live in Landing; domain workflows live in Dashboard Shell

## Responsibilities

### Landing (Account Hub)
- Public marketing pages (home, features, pricing, contact)
- Firebase Authentication (email/password, Google, etc.)
- Account area for authenticated users:
	- Profile (name, email, avatar)
	- Subscriptions (view plan, status, invoices; start/cancel/upgrade)
	- Organizations CRUD (create multiple orgs, rename, archive)
	- Memberships (invite/remove members, roles)
- Checkout and billing via `@zana/payments`
- "Open in App" deep link to Dashboard Shell with selected organization context

### Dashboard Shell
- Operates within a single selected organization (tenant)
- Uses `@zana/auth` for session enforcement
- Optional enterprise SSO (SAML) at the tenant level
- Loads organization-bound data and modules (e.g., exams, operations)

## Auth & Identity

### Landing
- Mounts `AuthProvider` from `@zana/auth/react` globally (e.g., in `_app.tsx`)
- Primary login with Firebase (Google provider recommended for simplicity)
- After login, users land on Account Home listing their organizations and subscriptions
- Creating a new Organization invokes a plan selection and checkout flow; a successful payment provisions the tenant

### Dashboard Shell
- Requires organization context derived from the subdomain host (e.g., `orgslug.app.baseurl`)
- Validates the user's membership in the organization
- May initiate/require SAML within the organization for enterprise tenants; SAML secrets/config stay out of Landing

## Navigation & Routes

### Landing Routes
- Public: `/`, `/features`, `/pricing`, `/contact`, `/privacy`
- Account (auth required):
	- `/account` (Account Home: quick links + recent orgs)
	- `/account/profile`
	- `/account/subscriptions`
	- `/organizations` (list)
	- `/organizations/new`
	- `/organizations/[orgId]` (details, members, billing shortcut)
	- `/billing` (or provider-return pages like `/payments/success`, `/payments/canceled`)

### Dashboard Shell Routes
- Clean routes under each org subdomain (e.g., `/dashboard`, `/settings`, `/members`)
- Shell must reject access when membership is invalid or org cannot be resolved from host

## Data Model (high level)
- users: `{ uid, email, displayName, photoURL, createdAt }`
- organizations: `{ id, name, ownerUid, createdAt, archivedAt? }`
- memberships: `{ orgId, uid, role }` with roles like `owner|admin|member`
- subscriptions: `{ orgId, planId, status, provider, currentPeriodEnd, customerId }`

Notes:
- A single user can own or belong to multiple organizations
- Subscriptions are scoped to an organization (not the individual user)
- Billing contact ties to either the owner or a designated billing admin on the org

## Firestore Rules (directional)
- Authenticated users can read/write their own profile document
- Organization creation allowed for any authenticated user; updates restricted to owners/admins
- Membership reads for members; writes restricted to owners/admins
- Subscription documents readable by org members; writes restricted to billing role/owner and server functions

## Shared Packages
- `@zana/ui`: design primitives
- `@zana/i18n`: locale provider & hooks
- `@zana/auth`: Firebase client for Landing; server/client + SAML support for Dashboard Shell
- `@zana/payments`: integrated into Landing for checkout and subscription management
- domain packages (future): consumed by Dashboard Shell

## Environment Variables

| Category | Landing | Dashboard |
|----------|---------|-----------|
| Public site URL | YES | YES |
| Firebase client keys | YES | YES (for client bits) |
| Firebase admin/service account | NO | YES (server-side) |
| SAML secrets | NO | YES (tenant/enterprise only) |
| Payments public keys | YES | MAYBE (if in-tenant billing surfaces) |
| Payments secret keys (server) | YES (API routes only) | MAYBE |
| Analytics (deferred until consent) | YES | YES |

Caching:
- Landing public pages: CDN, cache-friendly
- Landing account pages: no-store/private
- Dashboard Shell: no-store/private

## Flows

1) Sign up/Login on Landing → Firebase session established
2) Account Home → Create Organization → Choose Plan → Checkout → Provision tenant
3) From Organization card → "Open in App" → redirect to Dashboard Shell at `https://{orgslug}.app.baseurl/`
4) Dashboard Shell bootstraps org context, validates membership, and loads modules
5) Optional: Organization admins enable SAML in Dashboard (enterprise), not in Landing

## Migration Notes
- Move account- and billing-related UI to Landing under `/account`, `/organizations`, `/billing`
- Keep SAML and tenant runtime in Dashboard Shell
- Ensure DNS/hosting split (e.g., `www.` → Landing, `app.` → Dashboard)

## Deployment
- CI matrix: `pnpm build --filter @zana/landing` and `pnpm build --filter @zana/dashboard-shell`
- Cache `node_modules/.pnpm` and turbo cache for speed
- Set environment per app (Firebase keys, payment keys, SAML only on Dashboard)

## Future Enhancements
- Route registry & dynamic nav in Dashboard Shell
- Outbox/event bus for decoupling tenant domain events from billing/account
- Domain packages (`packages/exams`, etc.) feeding the shell
- Analytics on Landing (gated by consent) and audit logging in Dashboard

## Organization-specific Routing (Draft)

We will support organization-specific routing via subdomains, e.g., `https://{orgSlug}.app.baseurl/...`. This mirrors modern SaaS tenancy patterns and cleanly separates tenant context.

### Chosen Pattern
- Subdomain-per-org (primary)
	- URL: `https://orgslug.app.baseurl/...` (and later optional vanity domains)
	- Pros: clean URLs, easier enterprise SSO mapping, clear tenant branding
	- Cons: requires cross-subdomain auth strategy and wildcard DNS

### DNS and Hosting
- Configure wildcard DNS: `*.app.baseurl` → Dashboard Shell
- Keep `www.baseurl` → Landing; `app.baseurl` → org-picker or last-used org redirect

### Host Resolution Flow
In Dashboard Shell middleware:
1) Read Host header (strip port). If host is `app.baseurl` → org picker
2) If host matches `{slug}.app.baseurl`, look up `slug` → `orgId`
3) If host doesn’t match base but is a known custom domain, resolve via `orgDomains`
4) If unresolved, return 404 or helpful “org not found” page
5) Attach `orgId` and `org` metadata to request context for downstream handlers

### Routing Contract
- Keep routes "clean" on tenant subdomains (e.g., `/dashboard`, `/settings`, `/members`)
- Internally, use the resolved `orgId` for all data access; never trust slug alone
- Optionally rewrite to hidden path like `/_org/{orgId}/...` for internal server routing while preserving the subdomain URL (not exposed)

### Auth Across Subdomains
- Account Hub (Landing) uses Firebase client auth. Dashboard Shell needs seamless auth when arriving from `www.baseurl` → `orgslug.app.baseurl`
- Recommended: set Firebase session cookies at the parent domain (`Domain=.baseurl; HttpOnly; SameSite=Lax`) via a Landing API route after login. Dashboard Shell accepts this cookie to establish the user session.
- Alternative: accept an extra login on first arrival to the subdomain (worse UX).

### SAML/SSO
- SAML is configured per organization in Dashboard Shell. ACS endpoints like `https://orgslug.app.baseurl/saml/acs` are supported.
- SAML secrets/config do NOT live in Landing.

### Data Structures
- `orgSlugs`: `{ orgId, slug, isPrimary }` (globally unique)
- `orgDomains`: `{ orgId, domain, type: 'primary'|'alias', verified }`
- `organizations`: as defined above

### Dev and Local Testing
- Use wildcard dev hostnames like `lvh.me` or `127.0.0.1.nip.io` to simulate subdomains:
  - Example: `org1.127.0.0.1.nip.io:3000`
- Ensure middleware correctly parses host and strips ports

### Security and SEO
- Always enforce membership on the server for every org request
- Mark tenant subdomains as `noindex`
- Maintain a reserved list of forbidden slugs: `www`, `app`, `api`, `admin`, etc.

## Authentication Separation: Account Hub vs Tenant Users

Yes—the Account Hub’s authentication is independent from tenant user authentication. The separation is intentional:

- Account Hub (Landing): authenticates natural persons who manage their own profile, create organizations, and handle billing/subscriptions. This uses Firebase Auth directly in the Landing app.
- Tenant Users (Dashboard Shell): are members within an organization. They may be provisioned by the org owner/admin, via email invites, bulk import, or enterprise SSO (SAML). Their access is scoped by memberships and roles within each org.

Implications:
- A person can have an Account Hub identity and also be a tenant user for multiple orgs (owner/admin/member) using the same email, but the authorization contexts are distinct.
- Provisioning an org in the Account Hub creates the initial membership (owner) for that org in the Dashboard Shell.
- Enterprise SSO is enabled and configured per org in the Dashboard Shell; it does not affect the Account Hub’s login.
- Billing and subscription management live in the Account Hub and are tied to organizations, not individual tenant sessions.

## School SSO Mapping (Email-based Discovery)

To pair sign-in with school email setups, we’ll use email-domain discovery (Home Realm Discovery) to route users to the appropriate SSO for their organization.

### Discovery Flow
1) On Landing, prompt for email first.
2) Call `/api/auth/discover` with the email.
3) If the domain is verified and mapped to an org/provider, respond with the SSO method and redirect URL; otherwise, default to Firebase login.

### Supported Providers per Organization
- Google Workspace OIDC
	- Use domain hints and validate the `hd` claim; only accept tokens for verified org domains.
- Microsoft Entra ID (Azure AD) OIDC
	- Use `domain_hint`/`login_hint` and validate against the org’s accepted domains/tenant.
- SAML (Okta/ADFS/OneLogin/ClassLink/Clever)
	- Per-org metadata and ACS endpoint (e.g., `https://{orgslug}.app.baseurl/saml/acs`).
- Education IdPs (Clever/ClassLink)
	- Start with SSO; optionally add rostering later.

### Data Model Additions
- `orgDomains`: `{ orgId, domain, verified, providerType: 'oidc-google'|'oidc-microsoft'|'saml', providerConfigId }`
- `orgSlugs`: `{ orgId, slug, isPrimary }` (global uniqueness enforced)

### API Contract (Draft)
- POST `/api/auth/discover` → `{ method: 'sso'|'password', provider?: 'google'|'microsoft'|'saml', redirectUrl?: string, reason?: string }`
- Guardrails: never auto-map `gmail.com` (personal). Require domain verification before enabling SSO mapping.

### Provisioning & Roles
- Just-in-Time provisioning: allow creation of user/membership on first SSO sign-in if domain is verified and org policy permits.
- Optional group-to-role mapping via IdP claims (e.g., teacher/student/admin).

### Session Continuity
- After successful login (Firebase or SSO callback), issue a parent-domain Firebase session cookie to enable seamless navigation to `orgslug.app.baseurl` without re-auth.

## Implementation Outline (High-Level)

1) Landing
	- Mount `AuthProvider` and issue a parent-domain Firebase session cookie on sign-in
	- Account pages: `/account`, `/organizations`, `/billing`, etc.
	- Create Organization: collect name → create `organization`, `orgSlugs` → choose plan → checkout → on success, provision default membership (owner)
	- "Open in App" link computes `https://{slug}.app.baseurl/`

2) Dashboard Shell
	- Middleware resolves `orgId` from host
	- Validate session via parent-domain cookie; if missing → prompt login
	- Enforce membership for each route/API; load org context in a provider
	- Optional SAML: per-org configuration and ACS endpoints

3) Firestore Rules
	- Users manage their profile docs
	- Org writes restricted to owners/admins; member reads allowed
	- Subscription docs readable by org members; writes via server

4) Ops
	- Wildcard DNS + CDN rules
	- No-store headers for tenant subdomains
	- Reserved slug enforcement and validation at creation time

