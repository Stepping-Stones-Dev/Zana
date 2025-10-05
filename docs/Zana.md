# AccountHub Rearchitecture & Monorepo Scalability Blueprint
_Last updated: 2025-10-04_

This document consolidates the redesigned AccountHub architecture, external corporate identity integration strategy, and a scalable monorepo refactor plan across all main apps.

> NOTE (Greenfield Directive): This blueprint assumes a **fresh implementation**. Legacy migration / incremental refactor steps are intentionally de‑scoped per explicit instruction. Any prior references to dual-write, phased migration, or backward compatibility should be treated as historical context only and are replaced here by clean-slate build phases.

---
## 0. Assumptions & Explicit Clarifications
These assumptions are adopted as binding unless later amended in a versioned update.

| Domain | Assumption | Rationale / Impact |
|--------|------------|--------------------|
| Runtime | Next.js (App Router) + Node (serverful) for auth endpoints | Needed for crypto libs & predictable cold starts |
| Identity Providers (Phase 1) | Google Workspace OIDC only | Simplifies first corporate rollout; adapters pluggable |
| Future IdPs (Phase 2+) | Azure AD, Okta, generic SAML | Abstraction layer in `@zana/identity` prevents rewrites |
| Email Normalization | Lowercase full address; no Unicode local-part variant handling initially | Deterministic user lookup; revisit for i18n |
| Primary Key (User) | Random UUID v7 (NOT email) | Supports email change & multiple emails |
| Multiple Emails | Stored in `emails[]`, first element canonical | Enables alias capture without separate table |
| Group Claims | Read directly from IdP token; **never persisted in raw form** | Minimizes PII footprint & sync overhead |
| Role Mapping Policy | Deterministic precedence list (first match wins) | Simplifies auditing & snapshot testing |
| Capability Engine | Pure function; stateless; sorted deterministic output | Enables fingerprint hashing & diff alerts |
| Session Access Token TTL | 20 minutes default | Balance between security & UX |
| Refresh Token TTL | 30 days rolling with rotation | Industry standard; allows long-lived sessions |
| Rotation Enforcement | Single-use refresh (rotating opaque token) | Mitigates replay if stolen |
| Storage (DB) | Firestore (scalable baseline) | Already adopted in ecosystem |
| Caching Layer | In-memory first; optional Redis later | Avoid premature infra cost |
| Rate Limiting | Sliding window in-memory (dev) / pluggable later | Interface-driven; low switching cost |
| Invitation Token Length | 32 chars raw (256 bits entropy pre-hash) | Prevent brute force enumeration |
| Invitation Hash | SHA-256 | Deterministic & widely available |
| SSO State Expiry | 10 minutes | Balances user delay tolerance with replay risk |
| Clock Skew Tolerance | ±120 seconds | Standard for OIDC | 
| Downgrade Policy (Initial) | `soft` (log + flag, no immediate removal) | Reduces surprise access loss during early adoption |
| Ownership Auto-Assign | Disabled by default | Prevent privilege escalation via mis-grouping |
| Domain Policy Modes | `auto-join`, `review`, `sso-only` | Maps directly to journey codes |
| Public Email Domains | Always subscriber path; never SSO required | Eliminates corporate policy confusion |
| Feature Flags | Org-level only (no per-user overrides initially) | Reduces complexity surface |
| Audit Retention | Logs forwarded to central sink (cloud logging); no tamper-evident chain v1 | Faster delivery; chain can be added later |
| Accessibility | WCAG 2.1 AA baseline | Corporate procurement expectation |
| Theming | Light & dark via CSS variables at :root + data-theme | Low-cost multi-app consistency |
| CSS Strategy | Tailwind + design tokens (semantic layer) | Rapid iteration with consistent spacing/typography |

Non-goals (v1): SCIM provisioning, SAML advanced attribute transforms, dynamic policy DSL, cross-device session continuity, multi-factor ownership recovery.

---
## 1A. Sign-In & Discovery UX Specification

### Primary Entry Points
| Context | URL (Suggested) | Purpose |
|---------|-----------------|---------|
| General landing | `/auth` | Unified discovery (email capture) |
| Direct invite link | `/invite/:token` → pre-fills invite token | Shortcut to acceptance flow |
| SSO enforced domain deep-link | `/auth?sso=1&domain=acme.com` | Bypass email input if domain known |
| Session refresh (silent) | Background endpoint only | No UI; token lifecycle |

### Discovery Screen (Email Capture)
Layout Guidance:
1. **Left panel (40%)**: Marketing / trust messaging (SOC2 badge, security tagline).
2. **Right panel (60%)**: Auth card (max width 480px) with:
  - Product logo (top-left or centered)
  - Title: “Sign in or create your organization”
  - Email input (auto-focus)
  - Optional: “Use Single Sign-On” button only after classification response = `SSO_REQUIRED` (avoid pre-guessing)
  - Fine print: “By continuing you agree to Terms & Privacy”

Validation & Feedback:
| Stage | UI Pattern |
|-------|-----------|
| Typing | Debounced local validation; no network call |
| Submit | Disable button + spinner within button (not global overlay) |
| Error (400) | Inline under input with icon; no toast |
| Rate Limited | Inline message with retry countdown |
| Unknown Domain | Show path to create new org (NEW_SUBSCRIBER CTA) |

### Journey Response → UI Mapping
| Journey Code | UI Action |
|--------------|-----------|
| `NEW_SUBSCRIBER` | Show org creation form (org name, subdomain) |
| `INVITED_MEMBER` | Show invitation acceptance summary (org name, role, accept CTA) |
| `GUEST_INVITE` | Same as invite; explicit limited access banner |
| `DOMAIN_CLAIMED_AUTOJOIN` | Auto-call autojoin endpoint → redirect spinner |
| `DOMAIN_CLAIMED_REVIEW` | Show applicant form with status explanation (“Pending approval”) |
| `SSO_REQUIRED` | Render provider button(s) (Google first) – primary action becomes “Continue with Google” |
| `SSO_POST_ASSERT` | JIT provisioning result page (1–2s success state) → redirect |
| `MULTI_ORG_USER` | Org selection list (radio list or cards) + “Continue” |
| `ORG_TRANSFER_REQUIRED` | Ownership claim explanation + initiate verification CTA |

### Visual Hierarchy & Styling
| Element | Spec |
|---------|------|
| Primary Button | 44px height, medium weight, brand gradient or solid accent |
| Secondary Button | Neutral border, hover elevation + subtle background |
| Inputs | 12px radius, neutral outline → brand glow on focus |
| Error State | 1px solid #E54848 + small alert icon left |
| Guest Banner | Subtle amber background (#FFF8E1) with lock icon |
| Loading Overlay (redirect) | Minimal center spinner + caption (“Securing your session…”) |

### SSO Button Style (Google Example)
| Part | Spec |
|------|------|
| Icon | 20x20 left-aligned |
| Label | “Continue with Google” |
| Background | White, 1px neutral border, shadow on hover |
| Focus Ring | 2px brand outline offset 2px |

### Accessibility & Interactions
| Concern | Approach |
|---------|---------|
| Focus order | Linear: logo → heading → email input → primary action → alt links |
| Skip link | Provide skip to main content before card |
| Keyboard shortcuts | Enter submits; ESC closes modals |
| Reduced motion | No large scale animations; fade/translate ≤ 100ms |

### Error & Edge UX
| Scenario | Display |
|----------|--------|
| Invalid Invite | Red inline error + CTA to retry email discovery |
| Expired Invite | Offer request new invite flow |
| State/Nonce Failure | Generic “Session expired. Please restart.” (avoid leaking specifics) |
| Network Failure | Passive retry link + exponential backoff (3 attempts) |

### Multi-Org Selection
| UI Element | Guidance |
|-----------|----------|
| Org List | Card or radio with org name + subdomain + role badge |
| Search (future) | Only if > 8 orgs |
| Default focus | First org or previously-used (store in localStorage) |

### Ownership Claim (Stub UX)
Step layout: Explanation → verification method selection (email OTP initially) → success state → redirect.

### Theming & Dark Mode
| Layer | Source |
|-------|--------|
| Color tokens | `--color-bg-surface`, `--color-text-primary`, `--color-accent` |
| Dark mode trigger | `data-theme="dark"` on html root |
| Token override mechanism | Single CSS file shipped via `@zana/ui` |

---

---
## 1. Core Objectives
| Objective | Description |
|-----------|-------------|
| External identity authority | Treat IdP / workspace directory as source of truth for identity & entitlements. |
| Just-In-Time (JIT) provisioning | Create/update user membership at session issuance; avoid bulk sync. |
| Minimal local persistence | Store only identity link + membership + session metadata (no raw group duplication). |
| Deterministic authorization | Pure role+feature → capabilities engine with reproducible outputs & fingerprint. |
| Multi-tenant isolation | Domain/organization policy drives allowed providers & join methods. |
| Observability & audit | Structured events with correlationId, sessionId, provenance hash—ready for SIEM. |
| Extensibility & modularity | Pluggable providers (OIDC/SAML), policy mappings, capability engine. |
| Security-first hardening | Signature validation, nonce/state, single-use invitations, downgrade handling. |
| Incremental migration | Strangler approach—no big bang rewrite required. |

---
## 2. High-Level Architecture Overview
```
[ Client / Workspace / Browser ]
        ↓ (discover / token / sso)
[ Edge/API Layer (Next.js routes) ]
        ↓ (validated DTOs + correlationId)
[ Auth Orchestrator ]
  ├─ Journey Classification Service
  ├─ Identity Verification (OIDC/SAML Adapters)
  ├─ Group / Claims Resolver
  ├─ RBAC Mapping & Capability Engine
  ├─ Membership Service (idempotent)
  ├─ Domain Policy Service
  ├─ Invitation Service
  ├─ Session Service (JWT + refresh)
  ├─ Ownership & Recovery Service
  └─ Event / Audit Emitter → (Logs / Queue / SIEM)
```

---
## 3. Package / Module Decomposition (Target)
| Package | Responsibility | Key Exports |
|---------|----------------|-------------|
| `@zana/auth-core` | Session issuance, token signing, refresh rotation | `issueSession`, `verifySession`, `rotateRefresh` |
| `@zana/identity` | OIDC discovery, JWKS caching, SAML validation | `verifyOidcToken`, `verifySamlAssertion` |
| `@zana/policy` | Domain + organization policy evaluation & caching | `evaluateDomainPolicy`, `getProviderConstraints` |
| `@zana/membership` | Users, memberships (flat collection), upgrades/downgrades | `ensureUser`, `ensureMembership`, `applyRoleChange` |
| `@zana/capabilities` | Role→capabilities derivation & fingerprint | `resolveCapabilities` |
| `@zana/invitations` | Token creation, hashing, expiration & consumption | `createInvite`, `consumeInvite` |
| `@zana/journey` | Deterministic journey classification | `classifyJourney` |
| `@zana/events` | Event constants + structured emitter | `Events`, `emit` |
| `@zana/rate-limit` | Distributed limiter abstraction | `rateLimit` |
| `@zana/audit` (optional) | Append-only tamper-aware audit store | `recordAudit` |
| `@zana/platform` | Firestore, cache, secrets, queue adapters | `db`, `cache`, `secrets` |
| `@zana/testing` | Shared test helpers & fixtures | `createTestUser`, `mockToken` |
| `@zana/ui` | Design system (no domain logic) | Components, tokens |

Apps only import from packages; no app→app imports.

---
## 4. Data Model (Refined)
| Collection | Key | Core Fields | Notes |
|------------|-----|-------------|-------|
| `users/{uid}` | UUID | `email`, `emails[]`, `primaryProviderId`, `externalIdentities[]`, `createdAt` | Decouple from email. |
| `memberships/{orgId}_{uid}` | Composite | `orgId`, `uid`, `lastRole`, `source`, `lastVerifiedAt`, `provenanceHash`, `staleHigherRole?` | Flat for cross-org queries. |
| `organizations/{orgId}` | UUID | `name`, `subdomain`, `domainPolicy`, `features`, `owners[]` | Domain policy drives flows. |
| `invitations/{id}` | Random | `orgId`, `email`, `role`, `kind`, `tokenHash`, `expiresAt`, `consumedAt` | Raw token never stored. |
| `sessions/{sessionId}` | Random | `uid`, `orgId`, `role`, `capFingerprint`, `expiresAt`, `revoked?`, `providerId`, `policyVersion` | Supports revocation & fingerprint diff. |
| `ssoProviders/{providerId}` | Slug | `issuer`, `clientId`, `groupClaim`, `roleMapping[]`, `defaultRole`, `downgradeMode` | Policy for mapping. |
| `ssoStates/{stateId}` | UUID | `nonce`, `providerId`, `expiresAt`, `consumed` | Interactive SSO CSRF defense. |
| `applicants/{id}` | UUID | `orgId`, `email`, `providerId`, `status` | Review path. |
| `policyVersions/{scope}` | Scope | `version`, `updatedAt` | Force capability re-eval. |

No persistent storage of full group arrays—only hashed provenance.

---
## 5. Journey Classification (Pure Logic)
Input: `{ email, inviteToken? }`
Steps:
1. Normalize email & derive domain.
2. Load (cached) domain policy.
3. Optional hashed invite lookup.
4. Fetch user’s memberships (flat query) if exists.
5. Emit decision tree → `journeyCode` + `next.action`.
Return payload is snapshot-tested.

Journey Codes (canonical):
`NEW_SUBSCRIBER`, `INVITED_MEMBER`, `GUEST_INVITE`, `DOMAIN_CLAIMED_AUTOJOIN`, `DOMAIN_CLAIMED_REVIEW`, `SSO_REQUIRED`, `SSO_POST_ASSERT`, `MULTI_ORG_USER`, `ORG_TRANSFER_REQUIRED`.

---
## 6. Identity Verification (OIDC Focus)
Pipeline:
1. Discovery (issuer → metadata) cached 15m.
2. JWKS per `kid` cached; rotate on failure.
3. Validate iss, aud, exp/nbf (± skew), nonce (interactive only), token age.
4. Extract `email`, `email_verified`, `groups`, optional `orgClaim`.
5. Emit `sso.token.verified`.
6. Fail closed on metadata / signature issues.

SAML adapter later: parallel interface returning same normalized shape.

---
## 7. RBAC & Capability Engine
Role mapping policy example:
```
roleMapping: [
  { match: 'zana-owners', role: 'owner', precedence: 10, upgradeAllowed: true },
  { match: 'zana-admins', role: 'admin', precedence: 20 },
  { match: '.*-guest$', role: 'guest', precedence: 80 },
  { match: '*', role: 'member', precedence: 100 }
]
downgradeMode: 'soft'  # or 'hard'
allowOwnerAutoAssign: false
```
Resolution:
- Normalize groups → evaluate ordered rules → first match.
- If existing role higher & downgradeMode=soft → keep + mark `staleHigherRole=true`.
- Capabilities = role baseline + org features + provider augments.
- Compute `capFingerprint = SHA256(sortedCaps.join('|'))`.

Events: `auth.role.resolved`, `membership.upgraded`, `membership.downgrade.softheld`.

---
## 8. Session Lifecycle
| Concern | Approach |
|---------|----------|
| Token size | Embed only essentials (`uid`, `activeOrgId`, `role`, `capFingerprint`, `policyVersion`). |
| Rotation | Short-lived access (15–30m) + refresh rotation (single-use). |
| Revocation | Session doc flag + optional LRU in-memory cache. |
| Capability change detection | Recompute on refresh if `policyVersion` or `fingerprint` mismatch. |
| Org switching | Issue new JWT or ephemeral org-switch token. |

---
## 9. Invitations & Domain Paths
| Flow | Key Security Points |
|------|--------------------|
| Invitation Accept | Hashed lookup, single-use consumption, expiry event. |
| Domain Auto-Join | Verify domain policy; enforce email verified (future). |
| Domain Review | Create applicant; membership only after approval. |
| Ownership Transfer | Step-up MFA + DNS/email proof (future). |

---
## 10. Rate Limiting & Abuse Controls
| Endpoint | Key Dimensions | Limit Suggestion |
|----------|----------------|------------------|
| `/auth/discover` | email+IP | 10/min sliding |
| `/auth/sso/oidc/token` | providerId+email | 5/min |
| `/auth/invitations/accept` | tokenHash | 5/15min |
| `/auth/domain/apply` | email+domain | 3/hour |
| Refresh | uid | 20/hour |

Emit anomalies: `rate.limit.exceeded`.

---
## 11. Observability & Events
Canonical Events (subset):
```
auth.journey.decided
sso.token.received
sso.token.verified
sso.token.verification_failed
auth.role.resolved
membership.created
membership.upgraded
membership.downgrade.softheld
invite.accepted
invite.expired
session.issued
session.refreshed
capabilities.fingerprint.changed
```
Each: `{ timestamp, event, correlationId, userId?, orgId?, providerId?, role?, capFingerprint? }`.

Metrics:
- `sessions_issued_total{provider}`
- `journey_decision_total{journeyCode}`
- `membership_upgrades_total`
- `token_verification_latency_ms` (histogram)
- `role_downgrade_softheld_total`

---
## 12. Testing Strategy
| Layer | Tests |
|-------|-------|
| Journey | Snapshot permutations (invite vs domain vs multi-org) |
| Identity | Tampered signature, wrong aud, expired, nonce mismatch |
| RBAC | Precedence, fallback, upgrade, soft downgrade |
| Capabilities | Role x features matrix snapshot |
| Invitations | Accept → reuse fails → expired emits event |
| Sessions | Rotation reuse blocked, revocation enforced |
| Rate Limiting | Exceed thresholds returns 429 |
| Ownership (later) | Orphan claim happy + rejection |

CI gates: must pass snapshot diff & boundary lint.

---
## 13. Main Apps Evolution
| App | Target Role |
|-----|------------|
| AccountHub | Auth / onboarding API + minimal UI (optional) |
| Dashboard Shell | Layout, org + session context provider, navigation |
| HR | Pure vertical; relies on capabilities & feature flags |
| Future Verticals | Plug into shell via federated/dynamic modules |

Shared context: `SessionContext` (single source). No per-app token parsing.

---
## 14. Greenfield Build Phases (No Migration Assumed)
| Phase | Focus | Deliverables | Exit Criteria |
|-------|-------|-------------|---------------|
| 0 | Foundations | Repo skeleton, packages scaffolding (`events`, `auth-core`, `capabilities`) | Lint + type pass; empty tests run |
| 1 | Identity Core | OIDC verification (Google), session issuance, journey classifier | Valid token → session; snapshot tests for journeys |
| 2 | Membership & RBAC | Flat memberships, role mapping policy engine, capability fingerprints | Role & capability logs stable; upgrade path tested |
| 3 | Invitations & Domain | Hashed invites, auto-join, review applicants | All invite paths tested (accept, expired) |
| 4 | Refresh & Rotation | Refresh token store + rotation & revocation handling | Token reuse test fails expectedly |
| 5 | Downgrade Handling | Soft downgrade logic + stale marker events | Events show backlog metric |
| 6 | Ownership & Review | Ownership claim (OTP), applicant approval UI | Ownership flow test suite green |
| 7 | Hardening & Rate Limits | Rate limiting, anomaly logs, cap diff alert | p95 targets met; alerts configured |
| 8 | Extended Providers | Azure AD adapter, abstraction solidification | Multi-provider smoke tests pass |
| 9 | Pre-GA Audit | Security checklist, performance bench, A11y audit | Sign-off matrix complete |

---
## 15. Performance Guidelines
| Operation | Target p95 |
|-----------|-------------|
| Journey classification | < 25 ms (warm) |
| OIDC verification (cached) | < 80 ms |
| Invitation accept | < 60 ms |
| Session issuance | < 40 ms |
| Refresh token (rotation) | < 50 ms |

Firestore reads per successful SSO login ≤ 4 (user, membership, org, provider config/domain policy).

---
## 16. Security Hardening Checklist
- [ ] OIDC signature + aud/iss validation
- [ ] Nonce/state enforced (interactive)
- [ ] Invitation hashing + single-use complete
- [ ] UID decoupled from email (migration run)
- [ ] Capability fingerprint logged
- [ ] Refresh rotation + revocation list
- [ ] Soft downgrade events monitored
- [ ] Owner auto-assign disabled by default
- [ ] Rate limit coverage (discover, token, invite, apply)
- [ ] Expired invitation sweeper + events

---
## 17. Failure Modes & Responses
| Failure | Response | Event |
|---------|----------|-------|
| JWKS fetch fail | 503 fail closed | `sso.token.verification_failed` |
| Nonce mismatch | 400 | `sso.nonce.mismatch` |
| Replay state | 400 | `sso.state.replay_detected` |
| Downgrade (soft) | Keep old role, mark stale | `membership.downgrade.softheld` |
| No role match | DefaultRole fallback | `auth.role.resolved.default` |
| Directory group absent & policy requires | 400 secure fail | `sso.group.resolution.failed` |

---
## 18. Governance & Dependency Rules
- Apps must not import other apps.
- Packages export only through root index files.
- Lint rule: disallow deep internal imports (`packages/*/src/internal/*`).
- CI boundary check (e.g., depcruise / madge) fails on violations.

---
## 19. Incremental KPIs
| KPI | Baseline | Target Post-Phase 6 |
|-----|----------|---------------------|
| Verification failure (non-user) | — | < 0.5% |
| Soft-held downgrades / active sessions | — | < 1% |
| Avg Firestore reads / login | (TBD) | ≤ 4 |
| Journey misclassification bugs | (TBD) | 0 after snapshots |
| Capability drift incidents | — | 0 |

---
## 20. Future Enhancements
| Feature | Benefit |
|---------|---------|
| SCIM provisioning | Pre-provision + deprovision automation |
| Policy DSL / OPA lite | Complex conditional access |
| Device posture checks | Zero trust posture alignment |
| Tamper-evident audit chain | Forensics & compliance |
| Real-time revocation push | Near-instant access removal |
| Attribute-based entitlements | Fine-grained capability gating |

---
## 21. Initial Action Checklist (Greenfield)
- [ ] Initialize monorepo scaffolding (packages + empty apps)
- [ ] Implement `@zana/events` emitter + constants
- [ ] Implement `@zana/auth-core` basic `issueSession/verifySession`
- [ ] Implement `@zana/journey` with snapshot tests
- [ ] Implement `@zana/identity` (Google OIDC only) + JWKS cache
- [ ] Implement `@zana/capabilities` with baseline roles
- [ ] Implement `@zana/membership` with flat collection schema
- [ ] Build `/api/auth/discover` using new modules
- [ ] Build `/api/auth/sso/oidc/token` (token acceptance path)
- [ ] Build `/api/auth/invitations/accept` (hashed; single-use)
- [ ] Add rate limiting wrapper for discover & token endpoints
- [ ] Add capability fingerprint emission in session issuance
- [ ] Add logs + structured events for end-to-end SSO flow
- [ ] Add test coverage: journeys, token verify, invite accept

---
## 22. Application Registry & Progressive App Enablement

### 22.1 Purpose
Provide a single authoritative source describing which applications (vertical modules, internal tools, partner integrations) exist, their availability (plan gating, region, feature flags), required capabilities, and UI metadata (icon, grouping, marketing blurbs). This enables dynamic dashboard composition without hard‑coding navigation.

### 22.2 Core Concepts
| Concept | Definition |
|---------|------------|
| App | A self-contained vertical/product surface (e.g., HR, Analytics, Payments) exposed to end-users. |
| App Variant | Plan-specific or region-specific variation (e.g., HR-lite vs HR-enterprise). |
| Capability Requirement | Minimal capability (or set) required to see/launch the app. |
| Availability Rule | Evaluated conditions (plan, features, beta flag, region, org size) gating app visibility. |
| Presentation Slot | Where and how the app appears (main nav, launcher grid, spotlight carousel). |
| Launch Mode | `embedded` (within shell route) or `external` (separate domain / partner iframe). |

### 22.3 Data Model (Registry)
Collection: `appRegistry/{appId}`
```jsonc
{
  "id": "hr",
  "name": "HR",
  "slug": "hr",
  "version": 1,
  "status": "active",               // active | deprecated | hidden
  "category": "people",             // grouping for catalog UI
  "icon": { "type": "asset", "ref": "icons/hr.svg" },
  "description": "Manage employees and roles",
  "launch": { "mode": "embedded", "entryPath": "/hr" },
  "capabilitiesRequired": ["hr.access"],
  "plans": {                        // gating
    "free": { "available": false, "upsellMessage": "Upgrade for HR" },
    "pro": { "available": true },
    "enterprise": { "available": true, "features": ["hr.policies", "hr.audit"] }
  },
  "featureFlags": ["hr_beta_scheduler"],
  "regionsAllowed": ["us", "eu"],
  "minOrgSize": 1,
  "maxOrgSize": null,
  "beta": false,
  "sortPriority": 30,
  "visibilityStrategy": "capability_and_plan", // or capability_only | plan_only | always
  "tags": ["core", "people"],
  "createdAt": "2025-10-04T00:00:00.000Z",
  "updatedAt": "2025-10-04T00:00:00.000Z"
}
```

Optional subcollection for variants:
`appRegistry/{appId}/variants/{variantId}` containing differentiators (e.g. region-specific provider config, localized names).

### 22.4 Resolution Algorithm (Per Org, Per User)
Inputs:
```
org.plan, org.features, org.region, org.memberCount,
user.capabilities[], user.role, featureFlagsRuntime,
appRegistryEntry
```
Steps:
1. Rule Pre-Filter: `status === active`.
2. Region Gate: if `regionsAllowed` and org.region not in → exclude.
3. Plan Gate: use `plans[org.plan].available` (fallback to false if undefined).
4. Capability Gate: ensure all `capabilitiesRequired` ∈ user.capabilities.
5. Beta Flag: if `app.beta === true` ensure org or user has beta entitlement.
6. Feature Flags: if listed in `featureFlags` ensure runtime flag active.
7. Org Size Gate: if `minOrgSize` / `maxOrgSize` violated → exclude or mark upsell.
8. Assemble result object with `visibility: visible|upsell|hidden`.

Output Example:
```json
{
  "id": "hr",
  "visible": true,
  "launchPath": "/hr",
  "upsell": false,
  "reasonCodes": []
}
```
If excluded for plan but potentially upgradable → `visible=false, upsell=true, reasonCodes=["plan_gate"]`.

### 22.5 UI Presentation Patterns
| Surface | Purpose | Behavior |
|---------|---------|----------|
| App Launcher Grid (primary) | Quick access to enabled apps | Show enabled first, upsell tiles after divider |
| Sidebar Navigation | High-frequency apps | Only enabled (no upsell clutter) |
| App Catalog Page (`/apps`) | Discovery & expansion | Includes search, categories, upsell CTA cards |
| Spotlight / Quick Switch (cmd+k) | Power user switching | Filters to enabled only; optionally show locked with lock icon when searched |
| Inline Upsell Modules | Contextual cross-sell (e.g., “Need HR policies? Enable HR”) | Trigger modal with plan upgrade action |

Styling Conventions:
| State | Visual |
|-------|--------|
| Enabled | Standard card with accent icon |
| Upsell | Desaturated icon + badge “Upgrade” |
| Beta | Pill badge “Beta” (amber) |
| Deprecated | Faded + tooltip “Deprecated soon” (not shown to new orgs) |

### 22.6 Capability & Plan Interplay
- Capability gates are **authoritative**: even if plan includes app, no capability → hidden.
- Plan upgrades may grant capabilities indirectly (ownership triggers recomputation + session refresh).
- Upon plan change: emit `plan.changed` → downstream invalidation of cached app resolution.

### 22.7 Caching Strategy
| Layer | Cache Key | TTL | Invalidation |
|-------|-----------|-----|-------------|
| App Registry Entries | `app-registry:v1` | 5m | Manual bump on registry update |
| Per-User App Visibility | `app-vis:{orgId}:{userId}:{fingerprint}` | 5m (sliding) | On capability fingerprint change / plan change |
| Plan Metadata | `plan-meta` | 30m | On pricing deploy |

`fingerprint = SHA256(sortedCapabilities + plan + region + featureFlagVersion)` ensures deterministic invalidation.

### 22.8 Governance & Operations
| Concern | Approach |
|---------|---------|
| Safe App Removal | Mark `status=hidden` → remove references → delete after retention period |
| Audit on Registry Change | Emit `app.registry.updated` with diff hash |
| Misconfiguration Guard | Validate on write: required keys, plan matrix completeness |
| Testing | Snapshot test registry shape vs schema + plan gating permutation tests |

### 22.9 Authoring Workflow
1. Engineer adds JSON (or TS config) file for new app.
2. Pre-commit schema validation (Zod / JSON schema).
3. CI generates typed export package (`@zana/app-registry`).
4. Frontend consumes typed registry; no dynamic Firestore read on critical path (build-time or edge-cached fetch).

### 22.10 Progressive Rollout Strategy
| Stage | Strategy |
|-------|----------|
| Internal | `status=hidden`, capability limited to internal test users |
| Beta | `beta=true`, show only to opted orgs (feature flag) |
| Public Limited | Enabled for Pro & Enterprise tiers |
| General Availability | All qualifying plans; upsell tile appears in Free |

### 22.11 Security & Isolation Notes
- No dynamic loading of arbitrary remote modules without signature (when/if micro-frontend introduced).
- Apps flagged `external` require allowlisted domains & CSP adjustments.
- Capability check replicated server-side per API call (UI gating is advisory only).

### 22.12 Telemetry
Events:
```
app.visibility.resolved { appId, visible, upsell, reasonCodes, correlationId }
app.launch.clicked { appId, source: 'launcher'|'sidebar'|'catalog' }
app.upsell.clicked { appId, plan, userId }
plan.changed { orgId, oldPlan, newPlan }
```
KPIs:
- App launch frequency (DAU per app)
- Upsell CTA → conversion rate
- Time from org creation → first secondary app adoption

### 22.13 Example Resolution Output (Batch)
```json
[
  { "id": "hr", "visible": true, "launchPath": "/hr", "upsell": false },
  { "id": "analytics", "visible": false, "upsell": true, "reason": ["plan_gate"] },
  { "id": "payments", "visible": true, "upsell": false },
  { "id": "experiments", "visible": false, "upsell": true, "reason": ["beta", "flag_missing"] }
]
```

### 22.14 UI Integration Sequence
1. Fetch app registry (cached) at shell bootstrap.
2. Compute per-user resolution in memory.
3. Render sidebar (enabled only) + launcher (enabled + upsell section).
4. Attach telemetry listeners for clicks.
5. On capability fingerprint or plan change event → recompute & diff; animate card entry/exit.

### 22.15 Future Extensions
| Idea | Benefit |
|------|---------|
| App Usage Scoring | Intelligent surfacing / pinning |
| Personal Favorites | User-level pinned apps ahead of default order |
| Conditional Badges (alerts) | Show pending tasks or anomalies (e.g., “2 pending approvals”) |
| Dynamic Micro-Frontend Loading | Independent deployment cadence for large verticals |
| Marketplace (3rd-party) | Ecosystem expansion; needs security review & sandbox |

---
## 23. Change Log
| Date | Change |
|------|--------|
| 2025-10-04 | Initial consolidated rearchitecture blueprint created |
| 2025-10-04 | Added greenfield assumptions, UX spec, and App Registry section |
| 2025-10-04 | Added Serverless Deployment & Explicit Requirements narrative sections |
| 2025-10-04 | Added Monorepo Implementation Kickoff & School Management scaffolding section |

---
## 24. Serverless Deployment & Operational Model (Narrative)

This section explicitly defines how the AccountHub platform SHALL operate in a serverless (functions + edge) environment, the required behaviors of each functional surface, and the non-functional guarantees expected for production readiness.

### 24.1 Architectural Positioning
The platform SHALL adopt a serverless-first execution model for all stateless, request/response and scheduled tasks. Components requiring durable connections or long-running streaming (e.g., real-time collaboration) are explicitly out-of-scope for v1 and SHALL be revisited if/when new use cases justify a complementary long-lived service.

### 24.2 Function Classes
| Class | Description | Examples |
|-------|-------------|----------|
| Edge Functions | Ultra-low latency, no privileged admin SDK | Journey classification (public data), App registry resolution |
| Standard Auth Functions | Require Firestore Admin & crypto libraries | OIDC token exchange, invitation accept, auto-join, session refresh |
| Scheduled Functions | Time-based maintenance | Invitation expiry sweeper, stale SSO state cleanup |
| Event Consumers (Optional Future) | Queue / PubSub triggered | Audit persistence, capability drift analyzer |

### 24.3 Deployment Constraints
1. Each function MUST be independently deployable without requiring redeployment of unrelated routes.
2. All secrets (service account credentials, signing keys) MUST be injected via environment configuration, never embedded in code or VCS.
3. Infrastructure MUST support per-function IAM scoping (least privilege principle) such that an invitation function cannot administer billing or ownership documents.

### 24.4 Cold Start & Latency Goals
| Operation | Warm p95 Target | Cold p95 Target | Notes |
|-----------|-----------------|-----------------|-------|
| Journey classification | < 25 ms | < 120 ms | Edge-friendly; cached domain policy |
| OIDC token verification | < 90 ms | < 250 ms | JWKS cached in-memory; single network fetch on cold |
| Invitation accept | < 70 ms | < 180 ms | ≤ 2 reads + 2 writes |
| Session refresh | < 60 ms | < 150 ms | JWT verify + single read (revocation) |

### 24.5 Caching Policy
| Cache Item | Location | TTL | Invalidation Trigger |
|------------|----------|-----|----------------------|
| JWKS keys | In-memory per instance | 15m | Kid mismatch or verification failure |
| Domain policy | In-memory / edge KV | 60s | Org domain policy update event |
| App registry manifest | CDN / static asset | 5m (revalidate) | Registry publish pipeline |
| Rate limit counters | Distributed store (Redis/KV) | Window-dependent | Automatic expiry |
| Capability fingerprint | JWT claim | N/A | Token refresh only |

### 24.6 State & Persistence Requirements
1. Functions MUST NOT rely on in-memory state for correctness (only performance). If a cache misses, correctness MUST still hold.
2. All writes MUST be idempotent or guarded by unique identifiers (e.g., membership composite key, consumed hashes for invitations, consumed flag for SSO states).
3. Expirable documents (invitations, SSO states) MUST include ISO timestamps and be eligible for scheduled cleanup to limit storage and reduce replay windows.

### 24.7 Security Requirements (Serverless Context)
1. Each function MUST validate input payloads using a schema (e.g., Zod) and reject invalid data with 400 responses.
2. OIDC token functions MUST validate `iss`, `aud`, `exp`, `nbf`, and signature using cached JWKS; failure MUST emit an `sso.token.verification_failed` event.
3. State/nonce pairs for interactive flows MUST be single-use; re-use MUST produce a 400 with a generic error message (no sensitive leak) and emit `sso.state.replay_detected`.
4. All sensitive responses MUST include a correlation ID header for traceability.
5. Session issuance MUST NEVER include raw group lists; only derived role, capabilities, and fingerprint.

### 24.8 Observability & Logging
1. Every function invocation MUST log a structured entry with: `timestamp`, `event`, `functionName`, `correlationId`, `latencyMs`, and outcome (`success|error`).
2. Errors MUST include machine-readable `errorCode` fields (e.g., `invite_consumed`, `oidc_invalid_aud`).
3. Latency histograms SHOULD be published for mission critical endpoints (token exchange, classification).
4. Rate limit rejections MUST emit an explicit `rate.limit.exceeded` event including the limiting key hash and window.

### 24.9 Rate Limiting Specification
| Endpoint | Scope Key | Limit Policy |
|----------|-----------|--------------|
| `/api/auth/discover` | email+IP | 10 requests / 60s sliding window |
| `/api/auth/sso/oidc/token` | providerId+email | 5 requests / 60s |
| `/api/auth/invitations/accept` | tokenHash | 5 / 15m |
| `/api/auth/domain/apply` | domain+email | 3 / hour |
| Refresh tokens | userId | 20 / hour (soft) |

All limit breaches MUST return 429 with a `retryAfterSeconds` hint where feasible.

### 24.10 Deployment Fitness Checklist
The system SHALL NOT be considered production‑ready until ALL checklist items are satisfied:
| Category | Requirement | Status (initially TBD) |
|----------|-------------|------------------------|
| Token Verification | JWKS cache with eviction + retry backoff | TBD |
| Structured Logging | Unified logger wrapper used in all functions | TBD |
| Correlation IDs | Present in 100% responses (sample check) | TBD |
| Rate Limits | All endpoints enforced & unit tested | TBD |
| Invitation Security | Hash-only + consumed flag enforced | TBD |
| SSO State | Single-use + expiry cleanup job | TBD |
| Capability Drift Alert | Fingerprint diff event implemented | TBD |
| Error Codes | Catalog documented & returned | TBD |
| Latency SLIs | p95 panels live in monitoring | TBD |
| Secrets Management | No secrets in source tree | TBD |
| Pen Test Pre-flight | Minimum security review executed | TBD |

### 24.11 Failure & Degradation Behavior
| Failure Event | System Behavior | SLA Impact |
|---------------|-----------------|------------|
| JWKS endpoint unreachable | Fail closed; instruct user to retry; exponential backoff | Increased auth latency |
| Rate limit store degraded | Fail with conservative default denies for sensitive endpoints; allow low-risk classification with reduced frequency | Potential false denials |
| Firestore partial outage | Retry with jitter (max 3) then fail; never fallback to stale membership for role-critical decisions | Elevated error rate |
| Cache stampede (JWKS) | Single-flight lock recommended (future optimization) | Avoids thundering herd |

### 24.12 Vendor Neutrality Principles
1. No function MUST depend on provider-specific proprietary APIs beyond storage, queue, and key management.
2. Abstractions for rate limiting, queue publish, and secret retrieval SHOULD accept swappable implementations.

### 24.13 Capacity & Scaling Assumptions
| Dimension | v1 Assumption | Justification |
|-----------|--------------|---------------|
| Peak classification requests | 100 req/min early stage | Launch ramp scenario |
| Peak token exchanges | 30 req/min | SSO adoption slower initially |
| Average invites per org/day | 20 | Early team formation |
| Average active sessions / org | 5–50 | SME / mid-market sizing |

These assumptions MUST be revisited quarterly; breach thresholds SHOULD trigger capacity planning review.

### 24.14 Compliance Considerations
1. Logs MUST exclude raw PII beyond email hash where possible (retain plain email only where essential for diagnostics).
2. Sensitive configuration changes (SSO provider add, ownership transfer) MUST emit explicit audit events with hashed actor + timestamp.

### 24.15 Non-Goals (Serverless Scope)
1. Real-time presence or streaming updates.
2. In-function ML inference or large batch analytics.
3. Stateful multi-step orchestrations (delegated to future workflow engine if needed).

---
## 25. Explicit Requirements Specification (Narrative)

This section restates the system design as explicit, unambiguous requirements suitable for reuse in isolation (e.g., a new context prompt). Each statement uses RFC‑style normative language.

### 25.1 Authentication & Identity Verification
1. The system SHALL support OIDC token verification with issuer, audience, expiry, not-before, and signature validation.
2. The system SHALL reject tokens older than their declared expiry and MUST NOT accept tokens with clock skew beyond ±120 seconds.
3. The system SHALL support a single initial provider (Google Workspace) and MUST be designed to add future providers without modifying existing verification logic signatures.
4. The system SHALL NOT store raw group claim arrays; only hashed provenance MAY be stored.

### 25.2 Journey Classification
1. Journey classification SHALL accept `email` and optional `inviteToken` and SHALL return one canonical `journeyCode`.
2. The classification function SHALL be pure (side-effect free) except for logging.
3. Public email domains SHALL always map to `NEW_SUBSCRIBER`.
4. Invitation presence with valid hash SHALL override domain policy for classification (INVITED / GUEST precedence).

### 25.3 Subscriber (Tenant Creation) Flow
1. A new subscriber SHALL provide org name and subdomain in a single step.
2. Org creation MUST create both organization record and owner membership atomically (or rollback on partial failure).
3. The system SHALL issue a session with owner role capabilities immediately upon successful creation.

### 25.4 Invitations
1. Invitations MUST store only a SHA-256 token hash (never the raw token) and an expiry timestamp.
2. Invitation acceptance MUST mark the invitation as consumed and MUST be idempotent (second attempt returns a 400 error).
3. Expired invitations MUST emit an `invite.expired` event when detected.

### 25.5 Domain Policy & SSO
1. Domain policy modes SHALL include: `auto-join`, `review`, `sso-only`.
2. SSO-only domains MUST NOT expose password or invite flows.
3. Users on review domains SHALL NOT obtain a membership until an applicant record transitions to approved.

### 25.6 Membership & RBAC
1. Memberships SHALL be stored in a flat collection keyed by composite `orgId_userId`.
2. Role upgrades MUST emit `membership.upgraded`; soft downgrades MUST emit `membership.downgrade.softheld`.
3. Owner role assignment MUST require explicit configuration (no implicit upgrade from group mapping if `allowOwnerAutoAssign=false`).

### 25.7 Capabilities & Authorization
1. Capabilities SHALL be derived deterministically from role + feature flags.
2. Capability vectors MUST be sorted and deduplicated before fingerprinting.
3. Each session token MUST include a capability fingerprint; APIs MUST validate capability presence for protected operations.

### 25.8 Sessions & Tokens
1. Access tokens SHALL have a maximum TTL of 20 minutes in v1.
2. Refresh tokens SHALL be single-use and rotated upon refresh.
3. Revoked sessions MUST NOT successfully refresh; attempts SHOULD emit a `session.refresh.denied` event.

### 25.9 App Registry
1. Each application entry MUST define gating rules (plan availability, required capabilities, region list).
2. App visibility resolution MUST produce a structured result indicating `visible`, `upsell`, or `hidden`.
3. Registry changes MUST emit `app.registry.updated` with hash diff metadata.

### 25.10 Tenant Management
1. Tenant management UI visibility MUST be driven by capabilities (not raw roles).
2. Ownership transfer MUST require at least one form of verified challenge (v1: email OTP).
3. Feature toggles MUST alter capability derivation only after subsequent session issuance or refresh.

### 25.11 Logging, Events & Auditing
1. Every critical action (invitation consumed, session issued, token verified) MUST emit a structured event with a correlation ID.
2. Logs MUST avoid storing raw secrets or full JWTs; only truncated IDs or hashes are permitted.
3. Audit events MUST be immutable once persisted (no in-place edit semantics).

### 25.12 Performance Requirements
1. Journey classification median latency SHALL be under 15 ms and p95 under 25 ms (warm).
2. OIDC verification p95 SHALL be under 90 ms with a warmed JWKS cache.
3. Invitation acceptance p95 SHALL be under 120 ms.

### 25.13 Reliability & Availability
1. Core auth endpoints (discover, token exchange, invitation accept) SHALL target 99.9% monthly availability (excluding third-party IdP outages).
2. JWKS retrieval failures MUST degrade gracefully (fail closed) without partial acceptances.

### 25.14 Security Requirements
1. All inputs MUST pass schema validation before any database access.
2. Replay attempts (state/nonce reuse) MUST be blocked and logged.
3. Role escalation beyond configured mapping MUST be disallowed.
4. Sensitive operations MUST require a valid correlation ID for traceability.

### 25.15 Privacy & Data Minimization
1. The system SHALL NOT store external group names verbatim at rest (optional hashed provenance only).
2. PII used solely for classification (email domain detection) SHALL NOT be duplicated across collections.

### 25.16 Observability & Telemetry
1. Latency histograms MUST be collected for token exchange, classification, and session refresh.
2. Endpoint error rate thresholds SHALL trigger alerts when crossing 2% (non-user errors) over 10 minutes.

### 25.17 Rate Limiting & Abuse Prevention
1. Every externally accessible endpoint in auth scope MUST have a defined limit policy.
2. Rate limit rejections MUST include a human-readable and machine code in the response body.

### 25.18 User Experience (UX) Requirements
1. All destructive or irreversible actions (ownership transfer, role removal) MUST require explicit confirmation.
2. Logged-in users visiting the marketing root MUST see a “Return to Workspace” CTA instead of a forced redirect.
3. Multi-org users MUST be presented with a clear org selection step when no active org context exists.

### 25.19 Accessibility
1. All actionable elements MUST have visible focus states and ARIA labels where applicable.
2. Color usage MUST maintain a minimum contrast ratio of 4.5:1 for normal text.

### 25.20 Extensibility
1. Provider adapters MUST implement a common interface returning normalized claims.
2. Capability derivation MUST NOT depend on provider-specific logic.

### 25.21 Non-Goals (Explicit)
1. Real-time session revocation push notifications (v1). 
2. SCIM provisioning (v1). 
3. Tamper-evident audit hash chain (v1). 
4. Attribute-based fine-grained dynamic policies beyond role+feature (v1). 

---
## 26. Development, Build, Security & Logging Operational Requirements

This section defines normative requirements for: local development environment setup, linting & build process controls, Firebase usage and security constraints, secret protection & rotation, encryption & hashing practices, vulnerability mitigation, and log externalization hooks. All MUST / SHALL statements are binding for the greenfield implementation.

### 26.1 Local Development Environment
| Area | Requirement |
|------|-------------|
| Node Version | MUST use an active LTS (define e.g. Node 20.x) pinned via `.nvmrc` or `.tool-versions`. |
| Package Manager | MUST use `pnpm` (lockfile committed) with `--frozen-lockfile` in CI. |
| Workspace Integrity | MUST disallow `npm install` at app root without updating `pnpm-lock.yaml`. |
| Type Checking | MUST run `pnpm typecheck` (or `tsc -b`) before any build packaging. |
| Emulators | Firestore & Auth emulator SHOULD be available via `pnpm dev:emulators` for offline work (no production data). |
| Env Files | Local `.env.local` MUST NOT be committed; sanitized example `.env.example` MUST be maintained. |
| Scripts | MUST provide: `dev`, `build`, `lint`, `test`, `test:watch`, `format`, `typecheck`. |
| Pre-commit | SHOULD run staged lint + typecheck (using `lint-staged`), MUST block commit on errors. |
| Pre-push | MUST run unit tests for touched packages (affected set) before pushing (configurable skip via explicit flag). |
| Port Collisions | Dev server ports SHOULD be deterministic (e.g. 3000 for shell, 3100 for AccountHub API). |
| Feature Flags | MUST support local overriding with a simple JSON file fallback. |

### 26.2 Linting & Code Quality
1. ESLint MUST run with a single root config that extends per-package overrides (no divergent rule duplication).
2. TypeScript MUST be configured with `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
3. Lint MUST include import boundary rules: apps cannot import other apps; only packages.
4. Commit MUST fail if any high-severity ESLint error remains.
5. Style consistency MUST be enforced by Prettier (run in CI) but Prettier changes alone SHOULD NOT block merge unless conflicting.
6. Circular dependency detection MUST run at least nightly (e.g., `madge --circular`).
7. Dead code detection SHOULD occur weekly (e.g., dependency-cruiser unused exports) producing a report.

### 26.3 Build & Packaging Requirements
| Requirement | Detail |
|-------------|--------|
| Determinism | Builds MUST be reproducible; if lockfile unchanged, output hash SHOULD remain stable. |
| Incremental Builds | TypeScript project references MUST be used to avoid full rebuilds unnecessarily. |
| Env Injection | Build MUST NOT inline secrets—only refer to runtime environment variables (whitelist safe public vars). |
| Tree Shaking | Packages MUST mark side-effectful files appropriately ("sideEffects": false except specific entries) to enable dead code elimination. |
| Bundle Budget | Each app MUST declare a JS initial load budget (e.g. < 250KB gzip) with CI fail threshold. |
| Source Maps | MUST generate in non-production (dev/staging) for debugging; production maps SHOULD be upload-protected. |
| CI Cache | Remote build cache (turborepo) SHOULD be configured to cut incremental build time. |
| License Compliance | Dependency license check MUST run in CI (deny unapproved licenses). |

### 26.4 Firebase Usage & Security Requirements
1. Admin SDK MUST only initialize in server environments (never in client bundles); detection enforced via environment guard.
2. Firestore security rules MUST enforce:
  - Client read/write limited to non-sensitive collections (if any direct client access introduced later).
  - Admin operations exclusively through server (no bypass of rules for privileged data).
3. Service account key material MUST NOT be baked into code; use env var `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string) or secret manager reference.
4. Emulator usage MUST be the default for local dev if `NODE_ENV=development` and `USE_EMULATORS=true`.
5. Firestore indexes for high-usage queries (invitations by `tokenHash`, memberships by composite key) MUST be declared and documented.
6. Collections storing ephemeral items (SSO state, invitations) MUST set TTL indices (if provider supports) or scheduled cleanup tasks.
7. Firestore read/write counts SHOULD be monitored to identify high-churn queries for optimization.

### 26.5 Secrets Protection & Rotation
| Aspect | Requirement |
|--------|-------------|
| Storage | Secrets MUST be stored in a managed secret manager (not plaintext env in CI) except local dev. |
| Rotation Interval | Keys & tokens MUST be rotated at least every 90 days (document rotation runbook). |
| Emergency Rotation | Process MUST allow revoking a compromised key within 15 minutes (script + re-deploy). |
| Access Control | Principle of least privilege: CI runtime roles MUST NOT list or decrypt all secrets globally. |
| Audit | Secret access (fetch/decrypt) SHOULD be auditable (cloud provider logs). |
| Static Scanning | Repository MUST use secret scanning (pre-commit regex + CI scanning). |
| Encryption Keys | If using KMS, envelope encryption MUST wrap any custom encryption keys. |

### 26.6 Encryption, Hashing & Cryptographic Practices
1. Invitation tokens MUST be generated with cryptographically secure randomness (32 bytes) and hashed with SHA-256 before storage.
2. Session signing MUST use standard JWT HS256/RS256/ES256 algorithms; no custom cryptography.
3. Any stored opaque refresh tokens MUST be hashed (SHA-256 or Argon2id if user secret context available) before persistence.
4. Sensitive string comparisons (token hashes, state nonce) MUST use constant-time comparison utilities where language libs do not guarantee timing safety.
5. Deterministic identifiers (e.g., userId) MUST NOT be derived from raw email hash alone; use UUID v7.
6. If field-level encryption becomes necessary (future), MUST adopt envelope encryption (KMS key -> data key -> ciphertext) with rotation metadata.
7. Pseudorandom generation MUST prefer Node `crypto.randomBytes` (never `Math.random`).
8. Hash algorithms MUST be from vetted libraries; home-rolled implementations are prohibited.

### 26.7 Security Vulnerability Controls
| Control | Requirement |
|---------|-------------|
| Dependency Scanning | MUST run (e.g., `npm audit` or Snyk) on CI; CVSS >= High blocks merge unless waived. |
| SAST | Static analysis (e.g., Semgrep rules) SHOULD run daily and on PRs. |
| Input Validation | ALL external inputs MUST pass schema validation (Zod) before DB access. |
| Output Encoding | UI templating MUST escape dynamic content (Next.js default) – any raw HTML injection must be justified. |
| Rate Limiting | MUST enforce per-endpoint rules (Section 24.9). |
| SSRF | Server functions MUST disallow arbitrary outbound fetch except allowlisted domains (OIDC JWKS, provider metadata). |
| XSS | Disallow `dangerouslySetInnerHTML` except in sanitized, documented cases. |
| CSRF | Prefer stateless tokens (Authorization header). If cookies used, SameSite=Strict & CSRF token required for state-changing POST. |
| Clickjacking | Set `X-Frame-Options: DENY` (or CSP frame-ancestors) except for explicitly allowed embedding contexts. |
| Open Redirects | Validate redirect URLs against allowlist for post-auth flows. |
| Logging PII Minimization | MUST exclude full tokens, secrets, raw group arrays; log truncated IDs (first 6 chars + last 4). |
| Vulnerability Disclosure | Provide internal security contact & triage SLA (document separately). |

### 26.8 Logging & Externalization Hooks
1. Logging library MUST support a pluggable transport interface (e.g., `addTransport(fn)`), enabling simultaneous console + external aggregator forwarding.
2. All structured log events MUST include: `timestamp`, `level`, `event`, `correlationId`, and context-specific keys (`orgId`, `userId`, `sessionId`).
3. A redaction layer MUST scrub fields matching configured patterns (e.g., `token`, `secret`, `password`) before emitting to transports.
4. Log transport failures MUST fail open (do not block request) but SHOULD emit a `log.transport.failure` telemetry event.
5. Event emission API MUST return immediately (fire-and-forget) to avoid coupling request latency to external sinks.
6. External sink integration (e.g., Datadog, Cloud Logging) MUST be configured exclusively via environment (no code constant).
7. Correlation ID MUST be stable across boundary hops (incoming request -> internal service calls -> response) and regenerated only if absent.
8. Logging levels MUST default to `info` in production; `debug` logs gated by feature flag.
9. High-volume events (e.g., rate limit hits) SHOULD be sampled (configurable rate) to control cost while preserving statistical power.

### 26.9 Testing & Verification of Operational Controls
| Area | Test |
|------|------|
| Lint Gate | Simulate intentionally broken import; CI must fail |
| Secret Leak | Add dummy secret pattern; scanner must detect & block |
| Rate Limit | Force > limit calls; expect 429 with code & correlationId |
| Invitation Hashing | Assert DB never contains raw token substring |
| OIDC Fail Path | Use token with wrong audience; expect verification failure event |
| Logging Redaction | Emit event with `token=...`; transport output inspected; token removed/truncated |
| Refresh Reuse | Replay old refresh token after rotation; expect denial event |

### 26.10 Runbooks (Minimum Required)
Runbooks MUST exist (in `/docs/runbooks/`) for:
1. Secret Rotation (schedule, commands, revocation fallback).
2. Invitation Replay / Abuse Response.
3. OIDC Provider Outage Response (fallback messaging, status page updates).
4. Rate Limit Threshold Adjustment.
5. Ownership Claim Dispute Handling.
6. Data Export Request (compliance / user data). 

### 26.11 CI / CD Pipeline Requirements
| Stage | Required Checks |
|-------|-----------------|
| Install | `pnpm install --frozen-lockfile` |
| Lint | ESLint + boundary validation |
| Type | `pnpm typecheck` |
| Unit Tests | Jest (min coverage threshold per core package e.g., 85%) |
| Security | Dependency scan + secret scan |
| Build | Production build for impacted apps; verify bundle budget |
| Artifact Integrity | Check sum of built artifact directory (optional) |

### 26.12 Explicit Non-Functional Guarantees (Phase 1)
| Attribute | Guarantee |
|----------|-----------|
| Availability | 99.9% auth critical routes (excluding IdP upstream) |
| Security Updates | Critical dependency vulnerabilities patched ≤ 7 days |
| Mean Time to Detect (MTTD) anomalous spikes | < 10 minutes via metrics alerting |
| Mean Time to Recovery (MTTR) for function deployment rollback | < 15 minutes |
| P95 Latency (classification) | < 25 ms warm |
| P95 Latency (token verify) | < 90 ms warm |

---

---
_End of Document_
<!-- APPENDIX BELOW: Implementation Kickoff Addendum -->

---
## 27. Monorepo Implementation Kickoff (Immediate Actions)

This appendix makes explicit the INITIAL implementation order and root-level scaffolding decisions so contributors can begin coding without revisiting architectural deliberations. The priority is to establish folder boundaries and lightweight UI/UX components early (low architectural risk) while core auth modules iterate in parallel.

### 27.1 Root Folder Canonical Children (v1 Greenfield)
The repository root SHALL contain only these top-level directories (some already present) – additions beyond this list require architectural review:

```
apps/                # Deployable Next.js or service apps (AccountHub, Dashboard Shell, verticals, school modules)
packages/            # Reusable domain & infrastructural libraries (no side effects at import time)
docs/                # Architecture, runbooks, decision records
scripts/             # One-off or maintenance scripts (idempotent where possible)
config/ (optional)   # Centralized lint, tsconfig, tailwind tokens if not already under packages/config
tooling/ (future)    # Custom build / codegen utilities (deferred)
```

No ad-hoc feature directories SHALL be created at the root (e.g., avoid `utils/`, `lib/` at root—must live inside a package).

### 27.2 Initial Package Scaffolding (Creation Order)
Create minimal stub packages with `package.json`, `tsconfig.build.json`, and an `src/index.ts` exporting placeholder functions/constants. Each stub MUST compile and pass lint before feature code is added.

| Order | Package | Purpose (Stub) | Minimal Export |
|-------|---------|----------------|----------------|
| 1 | `@zana/events` | Central event constants + emit API | `emit(event, payload)` (no-op logger) |
| 2 | `@zana/capabilities` | Static role→cap mapping seed | `resolveCapabilities(role, features)` returns empty array initially |
| 3 | `@zana/journey` | Pure classification function | `classifyJourney({ email, inviteToken? })` returning placeholder `{ journeyCode: 'NEW_SUBSCRIBER' }` |
| 4 | `@zana/identity` | OIDC verification placeholder | `verifyOidc(idToken)` throws `NotImplemented` |
| 5 | `@zana/auth-core` | Session issue/verify primitives | `issueSession(claims)`, `verifySession(token)` returning mock struct |
| 6 | `@zana/membership` | User + membership ensuring | `ensureUser(email)`, `ensureMembership(orgId, userId)` no-op stubs |
| 7 | `@zana/app-registry` | Static registry loader | `getRegistry()` returns empty list |
| 8 | `@zana/platform` | Firestore/admin adapters (thin) | `db` placeholder + `init()` guard |
| 9 | `@zana/testing` | Shared test helpers | `createTestEmail()` |

Stubs MUST include JSDoc with TODO markers referencing section numbers (e.g., `TODO(Section 5): Implement real journey tree`).

### 27.3 UI-First Components (Fast Win Set)
Focus initial UI effort on low-risk, purely presentational primitives to unblock UX iteration while backend logic matures.

| Component | Location (suggested) | Notes |
|-----------|----------------------|-------|
| `AuthLayout` | `packages/ui/src/layouts/AuthLayout.tsx` | Implements left marketing / right form panel as per Section 1A. |
| `EmailCaptureForm` | `packages/ui/src/auth/EmailCaptureForm.tsx` | Controlled input + submit; emits `onSubmit(email)` only. |
| `JourneyContainer` | `packages/ui/src/auth/JourneyContainer.tsx` | Switches child form based on provided `journeyCode`. No network calls. |
| `SSOProviderButton` | `packages/ui/src/auth/SSOProviderButton.tsx` | Generic button w/ provider icon slot. |
| `OrgCreationForm` | `packages/ui/src/org/OrgCreationForm.tsx` | Basic fields (org name, subdomain). Validation local only. |
| `InviteAcceptanceCard` | `packages/ui/src/invite/InviteAcceptanceCard.tsx` | Displays org + role; Accept button stub. |
| `OrgSelectionList` | `packages/ui/src/org/OrgSelectionList.tsx` | Pure list; receives array of org summaries. |

All above MUST avoid embedding fetch logic; data flows via props to maintain testability and separation.

### 27.4 Implementation Order Rationale
1. Events & Capabilities stabilize naming + shape for downstream packages.
2. Journey stub enables frontend wiring of conditional views before backend classification is real.
3. UI primitives unblock styling, theming, and accessibility audit early.
4. Auth-core & identity can iterate without blocking UI because tokens will be mocked behind a dev flag.

### 27.5 Temporary Mock Layer (Development Convenience)
Add a lightweight `apps/accounthub/dev-mocks/` module exporting mock implementations of `verifyOidc`, `issueSession`, and `classifyJourney` behind an environment toggle `USE_DEV_MOCKS=1`. This MUST NOT be imported in production builds (enforced via simple runtime assert + lint rule if feasible).

### 27.6 School Management System (SMS) Future App Scaffolding
The architecture MUST anticipate additional educational vertical applications not yet fully defined. Scaffold placeholders to reserve namespaces and prevent later naming collisions.

Planned School Management apps (placeholders as empty Next.js apps under `apps/`):

| App Id | Working Name | Initial Scope (Placeholder) | Future Capabilities (Illustrative) |
|--------|--------------|-----------------------------|------------------------------------|
| `sms-admin` | School Admin Console | Basic page with “School Admin Coming Soon” | Manage institutions, academic years, campus config |
| `sms-student` | Student Portal | Placeholder dashboard page | View timetable, assignments, grades |
| `sms-teacher` | Teacher Portal | Placeholder dashboard page | Class rosters, attendance, grading workflows |
| `sms-parent` | Parent Portal | Placeholder dashboard page | Student progress, announcements, billing |
| `sms-lms` | Learning Module (LMS) | Placeholder page | Course content delivery, modules, quizzes |

Each placeholder MUST include:
1. Minimal `package.json` with `name: "@zana/<app-id>"`, `private: true`.
2. `next.config.js`, `tsconfig.json`, basic `pages/index.tsx` with accessible heading.
3. A README documenting its reserved purpose and referencing this section (27.6).

### 27.7 School Management Capability Namespace Reservation
Reserve future capability prefixes to avoid collisions:
```
sms.admin.*, sms.student.*, sms.teacher.*, sms.parent.*, sms.lms.*
```
Do NOT implement resolution logic yet; stubs in `@zana/capabilities` MAY export an enum or constant list marked `// RESERVED`.

### 27.8 App Registry Seed Entries (Deferred Activation)
Add inactive (status=`hidden`) seed records in `@zana/app-registry` for each SMS app with minimal metadata and `beta=true` set to false. This ensures early test coverage of hidden/upsell filtering logic.

### 27.9 Immediate Task List (Executable within Day 1)
Checked boxes indicate tasks to complete BEFORE writing complex business logic.

- [ ] Create stub packages per 27.2 with passing type build.
- [ ] Add UI primitives per 27.3 with Storybook or simple preview page (optional stretch: set up `apps/ui-playground`).
- [ ] Scaffold SMS placeholder apps (27.6) with README + basic index page.
- [ ] Reserve capability constants (27.7) in `@zana/capabilities`.
- [ ] Add hidden registry seed entries (27.8).
- [ ] Implement dev mock layer toggle (27.5).
- [ ] Update root README with quick start referencing Section 27.

### 27.10 Definition of Done (Kickoff Phase)
The kickoff is COMPLETE when:
| Criterion | Verification |
|----------|--------------|
| All stub packages build | `pnpm build` completes with no TS errors |
| UI primitives render | Manual smoke in Storybook or test app |
| SMS placeholders boot | Navigate to each app root returns 200 w/ heading |
| Capability reservations present | Exported constants verified in code review |
| Registry seeds present | `getRegistry()` returns entries with `status=hidden` |
| Dev mocks toggle | Setting `USE_DEV_MOCKS=1` swaps implementations (log confirmation) |

### 27.11 Guardrails During Kickoff
- DO NOT prematurely optimize (no DB writes in stubs).
- DO NOT introduce cross-app imports—only packages.
- DO annotate all TODOs with section references (e.g., `// TODO(24.7): Enforce nonce`) to preserve traceability.
- DO keep public exports minimal to reduce future breaking change surface.

### 27.12 Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| UI divergence before real data flows | Keep prop contracts narrow; snapshot example props |
| Over-expansion of placeholder scope | README explicitly forbids feature logic until enabling phase |
| Forgotten mock removal | Lint rule or build-time warning when `USE_DEV_MOCKS` set in production mode |
| Capability namespace collision | Central reservation constants reviewed in PR |

---

End Appendix 27