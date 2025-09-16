# Account Hub — Build Scope and Implementation Guide

This document outlines what we need to build in the Landing app (Account Hub) to realize the architecture: Adobe CC–style account hub with Firebase Auth, subscriptions, and multi-organization management, plus school-friendly SSO discovery.

## Goals
- Authenticate users with Firebase (and support school SSO discovery that redirects to Dashboard SSO where needed)
- Provide an account area to manage profile, organizations, memberships, and subscriptions
- Provision organizations and plans; deep-link to Dashboard Shell on subdomains
- Enable seamless cross-subdomain session via parent-domain cookie

## Core Deliverables

### Information Architecture (IA) — Where things live
- Global Navigation (header): Home, Features, Pricing, Account (when signed in)
- Auth surfaces:
	- Sign in / Join: `/auth` (HRD email-first) or modal on marketing pages
	- Sign out: account menu in the header
- Account Area (left nav inside Account):
	- Overview: `/account`
	- Profile: `/account/profile`
	- Organizations: `/organizations`
	- Subscriptions & Billing: `/account/subscriptions` (with deep links to checkout/portal)
	- Help & Support (optional later)

### 1) Auth Foundation
- Mount `AuthProvider` globally in `apps/landing/pages/_app.tsx`
- Sign-in UI: email-first HRD screen; options for Google; fallback to password/email
- Session cookie issuance API (parent-domain): set HttpOnly `.baseurl` cookie after login
- Sign-out clears both Firebase client session and parent-domain cookie

APIs
- POST `/api/auth/session` — exchange Firebase ID token → parent-domain session cookie
- POST `/api/auth/signout` — clear session cookie
- POST `/api/auth/discover` — email → `{ method, provider, redirectUrl | reason }`

### 2) Account Area (Pages)
- `/account` — overview: recent organizations, active subscription snapshot, quick actions
- `/account/profile` — profile edit (name, photo), security actions (sign-out)
- `/account/subscriptions` — plan, status, invoices; entry-point to checkout/portal

Components
- AccountLayout (nav + content)
- UserAvatar + ProfileForm
- SubscriptionCard + InvoicesList

Where to find it in the UI
- Overview widgets live on `/account` in a grid: "Your Organizations", "Billing Status", "Quick Actions"
- Profile edits on `/account/profile`, accessible from header avatar → "Profile"
- Subscriptions on `/account/subscriptions`, with prominent "Manage plan" and "View invoices"

### 3) Organizations Management
- `/organizations` — list organizations where user is owner/member; search/sort
- `/organizations/new` — create org: name + slug (validated, reserved list), plan selection (or defer to checkout)
- `/organizations/[orgId]` — details: rename, archive, slug management, members overview, billing shortcut
- Members management (could be a subpage in Dashboard later, but show overview here)

APIs
- POST `/api/orgs` — create organization + `orgSlugs` record; owner membership
- GET `/api/orgs` — list user’s orgs (by membership)
- PATCH `/api/orgs/:id` — rename/archive
- POST `/api/orgs/:id/slugs` — add/change primary slug (enforce uniqueness + reserved)

Validation Rules
- Slug regex: `^[a-z0-9-]{2,30}$`; lowercase; no leading/trailing hyphens; no doubles
- Reserved slugs: `www`, `app`, `api`, `admin`, `support`, `status`, `docs`, `cdn`

Where to find it in the UI
- Organizations index at `/organizations` from Account nav
- "New Organization" CTA at top-right of `/organizations` and shortcut card on `/account`
- Org details at `/organizations/[orgId]` with tabs or sections: General, Members, Slug & Domains, Billing

### 4) Payments & Provisioning
- Choose plan flow integrated into new org creation
- Checkout success webhook provisions subscription doc linked to `orgId`
- Post-payment redirect to `https://{orgslug}.app.baseurl/`

APIs
- POST `/api/billing/checkout` — start checkout for org/plan
- POST `/api/billing/webhook` — provider webhook → upsert subscription, invoices

Where to find it in the UI
- Plan selection step inside `/organizations/new` (or a dedicated modal)
- "Manage plan" on `/account/subscriptions` and from org details → Billing section

### 5) School SSO Discovery (HRD)
- Email-first screen triggers `/api/auth/discover`
- When mapped to SSO (Google/Microsoft/SAML), present "Continue with School SSO"
- Note: SSO happens in Dashboard Shell per-organization; Landing only discovers and forwards

Data
- `orgDomains`: `{ orgId, domain, verified, providerType, providerConfigId }`
- Discovery response cached briefly (e.g., 5 minutes) for UX

Where to find it in the UI
- Primary: `/auth` page with an Email field (also accessible via header "Sign in")
- Secondary: inline sign-in modal on marketing pages that renders the same HRD component
- After discovery: a provider-specific CTA (e.g., "Continue with School SSO") with the org name/domain surfaced for clarity

### 6) Cross-Subdomain Session
- After login in Landing (Firebase), call `/api/auth/session` to set parent-domain cookie
- Dashboard Shell reads cookie to establish app session; Landing ensures cookie refresh/rotation

Where to find it in the UI
- Invisible to users; ensure post-login redirect flashes a brief "Signing you in…" state while the cookie is set

### 7) Telemetry & Compliance
- Basic analytics on Landing (after consent)
- Audit log events for security-sensitive actions: org created/renamed, slug changed, session created/destroyed
- Error reporting (browser + server)

## Data Model (Account Hub Side)
- `users` — `{ uid, email, displayName, photoURL, createdAt }`
- `organizations` — `{ id, name, ownerUid, createdAt, archivedAt? }`
- `memberships` — `{ orgId, uid, role }`
- `orgSlugs` — `{ orgId, slug, isPrimary }`
- `orgDomains` — `{ orgId, domain, verified, providerType, providerConfigId }`
- `subscriptions` — `{ orgId, planId, status, provider, currentPeriodEnd, customerId }`

Notes
- Enforce uniqueness on `orgSlugs.slug`
- Maintain reserved slugs; verify domains before enabling SSO mapping

## UI/UX States
- Authenticated vs unauthenticated Landing navigation
- HRD: discovering, sso-found, sso-not-found
- Org create: validating slug, plan selection, checkout pending, success → open in app
- Subscriptions: trial/active/past_due/canceled

Empty and Error States
- No organizations yet → show “Create your first organization” with benefits and a clear CTA
- HRD unrecognized domain → offer fallback sign-in and a way to request domain onboarding
- Payment failure → show retry and support link; keep org draft until payment succeeds

## Firestore Rules (account-relevant)
- Users can read/write own profile
- Org create for any authenticated user; updates for owner/admin
- Membership read for members; writes owner/admin
- Subscriptions read for members; writes via server webhooks/admin

## Environment Variables
- Public Firebase config (Landing)
- Payment public keys; payment webhook secret
- Base URLs: `BASE_URL`, `APP_BASE_URL`, cookie domain

Default domains setup
- `BASE_URL=https://www.baseurl`
- `APP_BASE_URL=https://app.baseurl`
- Cookie domain: `.baseurl` for cross-subdomain session

## Testing Strategy
- Unit: validators (slug), discovery API (branching), API input schemas
- Integration: create org → checkout → webhook → subscription visible; session cookie issuance
- E2E happy path: sign-in → create org → open in app → session continues
- Edge cases: reserved slug, duplicate domain, webhook replay, cookie missing/expired

## Implementation Milestones
1) Auth foundation + session cookie API
2) Account pages + navigation
3) Organizations CRUD + slug validation
4) Checkout flow + webhook provisioning
5) HRD discovery + “Continue with School SSO” handoff
6) Telemetry + audit logs

## Out of Scope (Account Hub)
- SAML config/editing UI (lives in Dashboard Shell per org)
- Tenant runtime modules (exams, operations)

## Open Questions
- Do we allow creating an org without choosing a plan (trial)? If so, what trial limits?
- Do we need an org picker on `app.baseurl` for users with multiple orgs?

