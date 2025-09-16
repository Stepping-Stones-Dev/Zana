# Account Hub Scaffolding — App, Packages, and Workflows

This guide defines the structure we need to deliver the new Account Hub app and the shared capabilities in a scalable monorepo.

## Overview
- Apps: UI entry points deployed separately (Account Hub)
- Packages: shared logic (auth, db, payments, i18n, ui, types)
- Separation of concerns: account/billing live in Account Hub; tenant runtime and SSO live in the Dashboard Shell (not in scope here)
- Fresh start: Account Hub is a new app. Use the existing `apps/landing` as a design reference only; do not carry over legacy code.

## Folder Layout

        apps/
            landing/
                // Will be archived; use as visual/design reference only (HERO UI, components).
            accounthub/
                // New Account Hub implementation with the desired architecture (clean slate).
                pages/
                    index.tsx
                    pricing.tsx
                    features.tsx
                    auth/
                        index.tsx
                    account/
                        index.tsx
                        profile.tsx
                        subscriptions.tsx
                    organizations/
                        index.tsx
                        new.tsx
                        [orgId].tsx
                    api/
                        auth/
                            session.ts
                            signout.ts
                            discover.ts
                        billing/
                            checkout.ts
                            webhook.ts
                        orgs/
                            index.ts
                            [id].ts
                            [id]/slugs.ts
                components/
                layouts/
                styles/
                config/

        packages/
            auth/
                src/
                    client.ts
                    server.ts
                    react/
                        AuthProvider.tsx
                        useAuth.ts
                    lib/
                        firebase.ts
                        firebase-admin.ts
                        passport-saml-setup.ts
                // Exports client hooks for Account Hub; server/client + SAML helpers are used by Dashboard (out of scope here)

            db/
                src/index.ts // Firestore helpers, converters, collection refs

            payments/
                src/
                    index.ts
                    pricing.ts // shared plan config
                    server/
                        checkout.ts // start checkout
                        webhooks.ts // handle provider events
                    react/
                        useCheckout.ts

            i18n/
                src/index.ts
                locales/en/*
                locales/sw/*

            ui/
                src/react/* // component library used by apps

            types/
                src/index.ts // shared types (User, Organization, Membership, Subscription, etc.)

            config/
                eslint.config.mjs
                tailwind.config.cjs
                postcss.config.cjs
                tsconfig.base.json

## Key Boundaries
- Account Hub: Firebase client auth, account pages, org CRUD, pricing/checkout, assisted onboarding, HRD discovery (email → provider mapping)
- Dashboard Shell: tenant runtime and SSO live there; referenced only to clarify that configuration and ACS endpoints are handled in Dashboard (out of scope here)
- Shared packages: only pure code (no app-specific routing). Avoid circular deps.

## Routing and Navigation (Account Hub)
- All Account Hub routes remain origin-based (no org subdomains here)
- HRD lives at `/auth` (email-first). After discovery, we forward to the appropriate provider or show local login
- "Open in App" deep-links target the Dashboard Shell at `https://{orgslug}.app.baseurl/` (for context only)

## APIs and Contracts (Account Hub)
- Auth
  - POST /api/auth/session → set parent-domain cookie from Firebase ID token
  - POST /api/auth/signout → clear cookie
  - POST /api/auth/discover → HRD (email → SSO mapping)
- Orgs
  - POST /api/orgs → create org (+ slug + owner membership)
  - GET /api/orgs → list user orgs
  - PATCH /api/orgs/:id → update org
  - POST /api/orgs/:id/slugs → add/change primary slug (enforce reserved & uniqueness)
- Billing
  - POST /api/billing/checkout → start checkout for plan/org
  - POST /api/billing/webhook → upsert subscription, invoices
- Note on SSO: tenant SSO setup (OIDC/SAML) is configured per organization in the Dashboard Shell; Account Hub only performs discovery and forwards users to the right flow

## Data Model Summary
- users: { uid, email, displayName, photoURL, createdAt }
- organizations: { id, name, ownerUid, createdAt, archivedAt? }
- memberships: { orgId, uid, role }
- orgSlugs: { orgId, slug, isPrimary }
- orgDomains: { orgId, domain, verified, providerType, providerConfigId }
- subscriptions: { orgId, planId, status, provider, currentPeriodEnd, customerId }

## Environment Variables (Account Hub)
- Firebase client config (public)
- Payment public keys
- BASE_URL (Account Hub origin), APP_BASE_URL (Dashboard Shell origin)
- COOKIE_DOMAIN (parent domain for session cookie)

## Workflows
- Build: build the new Account Hub app (e.g., workspace filter for `apps/accounthub` once created)
- Dev: standard Next.js dev for Account Hub; use subdomain simulation only to test deep-linked redirects to Dashboard
- CI: cache pnpm and turbo, run tests per package

## Testing & TDD

Philosophy
- Favor a TDD loop: write a failing test → implement minimal code → refactor with confidence.
- Keep fast feedback: unit/component tests run in under a few seconds; heavier integration/E2E run in CI.

Test Pyramid (Account Hub focus)
- Unit (Jest):
    - Pure functions (slug validators, plan math, formatters)
    - React components with Testing Library (@testing-library/react)
    - Hooks (e.g., auth hooks, useCheckout)
- Integration (Jest + Node):
    - Next.js API routes (auth/session, discover, orgs, billing/checkout, webhook) using a minimal test harness
    - Data access against a mocked Firestore layer or emulator in CI-only mode
- Visual/Interaction (Storybook):
    - Stories per component/state; interaction tests via @storybook/test and Test Runner
    - Optional visual regression via Chromatic (recommended) or Loki

Structure
- Co-locate tests next to code: `*.test.ts`/`*.test.tsx` alongside sources
- Stories alongside components: `*.stories.tsx`
- Shared test utils under each package/app: `src/test/*`

Jest Setup (Monorepo)
- Root `jest.config.js` uses projects to point at apps and packages so each can customize transformers:
    - Account Hub app: use `next/jest` for correct Next.js config
    - Packages: use `ts-jest` or `@swc/jest` for TypeScript
- Add a per-project `setupTests.ts` to install Testing Library and jest-dom

Coverage
- Global thresholds (target): statements 90%, branches 85%, functions 90%, lines 90%
- Exclude barrels (`index.ts`), generated types (`*.d.ts`), and story files from coverage
- Fail CI when coverage drops below thresholds, with a short grace window for initial scaffolding

Mocking & Fixtures
- Firebase client: mock `firebase/app` and friends at module level; for deeper tests, prefer lightweight wrappers in `@zana/auth`
- Payments: mock network (MSW) for checkout; unit-test server logic separately
- Time: use fake timers for date math; freeze time in subscription/billing tests
- Data factories: `@faker-js/faker` for realistic test data

Integration Tests
- API routes: test with minimal Next.js API harness; validate status codes, cookies, and payloads
- Firestore: default to mocked adapters; optionally run emulator in CI for a nightly job

Storybook
- Maintain stories for UI components in `packages/ui` and critical Account Hub screens (empty/error/loading states)
- Add accessibility checks via `@storybook/addon-a11y`
- Interaction tests with `@storybook/test`
- Visual regression (choose one):
    - Chromatic (hosted, zero-config, recommended)
    - Loki (self-hosted snapshots)

CI Integration (Turbo)
- Pipeline: lint → typecheck → test (jest) → build → storybook:test (and optional chromatic)
- Cache via Turbo and pnpm; run affected tests only on PRs; full suite on main/nightly
- Artifacts: coverage reports in CI; publish Storybook preview if available

Suggested Command Targets (optional)
- `pnpm -w test` (root orchestrated) → runs Jest projects
- `pnpm --filter @zana/accounthub test` → tests for Account Hub only
- `pnpm --filter @zana/ui storybook` and `storybook:test` → run Storybook and its test runner

## Optional Extras
- scripts/seed.ts for dev data
- storybook in `packages/ui` for component dev
- `@zana/feature-flags` package later for gradual releases

## Security & Privacy (Account Hub)

Threat model
- Account Hub manages person-level identity, organization creation, plan selection, and billing. Risks include account takeover, billing abuse, HRD (email-domain discovery) spoofing, webhook forgery, PII leakage, and misconfiguration.

Authentication & session
- Firebase client auth; after login, issue a parent-domain session cookie: HttpOnly, Secure, SameSite=Lax, Domain=.baseurl, short TTL with rotation
- Validate ID tokens when issuing/refreshing; support token revocation
- CSRF: require CSRF tokens for state-changing POSTs (/api/orgs, /api/billing/checkout); SameSite helps but is not sufficient alone
- Rate-limit login, discovery, checkout, and org-creation endpoints

Authorization & Firestore rules
- Server-side RBAC: owners/admins mutate orgs; members read as permitted
- Mirror constraints in Firestore rules: users write only their profile; org docs gated by memberships; subscription writes via webhooks/server only
- Never trust client-supplied orgId; resolve via authenticated user and server lookups

Input validation & output encoding
- Validate all API payloads with schemas (e.g., zod) and return typed errors
- Slug constraints (regex + reserved list) and normalization
- Avoid rendering untrusted HTML; prefer framework escaping defaults

Secrets & configuration
- Secrets via environment/secret manager; never commit
- Separate local .env from production; least-privilege access to Firebase/Payments creds
- Keep webhook secrets, cookie keys, and any service accounts server-only

Payments security
- Maintain PCI SAQ-A by using provider-hosted checkout/fields
- Verify webhook signatures and timestamps; implement idempotency on updates
- Do not allow client-initiated subscription state changes; always mediate via server

HRD safety
- Require domain verification before enabling discovery mapping; block public domains (e.g., gmail.com) from auto-mapping
- Show org/domain context on SSO CTAs to reduce phishing
- Log/rate-limit discovery calls; detect enumeration

Headers, caching, and transport
- HTTPS everywhere; HSTS (includeSubDomains, preload) when ready
- Secure headers: CSP (default-src 'self'; frame-ancestors 'none'; script-src with nonces as needed), X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy minimal
- Cache-control: account pages `no-store, private`; marketing pages cacheable

Privacy & compliance
- Data minimization: collect only necessary profile and billing fields
- Consent: enable analytics only after explicit consent; store preferences
- Data subject rights: export/delete request workflow or support channel
- Kenya Data Protection Act (2019): lawful basis, retention schedules, designate contact for DP queries; review data residency if required by clients

Logging & audit
- Emit audit events for: login, session issue/revoke, org create/rename, slug changes, billing updates
- Structured logs with correlation IDs; avoid PII in logs

Storybook & previews
- Do not expose Storybook publicly in production; require auth or use private preview links
- Use mock data; no real secrets in stories
