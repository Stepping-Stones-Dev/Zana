# App Architecture Split

## Overview
The monorepo now distinguishes between:

| App | Path | Purpose | Auth Context | Deployment Notes |
|-----|------|---------|--------------|------------------|
| Landing | `apps/landing` | Public marketing, acquisition, SEO | None (stateless) | Can be aggressively cached / CDN |
| Dashboard Shell | `apps/dashboard-shell` | Authenticated tenant operations | `@sam/auth` + SAML | Requires session + stricter headers |

## Why Split?
- Faster iteration & deploy for marketing pages
- Smaller JS payload for public visitors
- Security boundary: no accidental leakage of internal components to public bundle
- Clear future path for domain micro-frontends

## Shared Packages
- `@sam/ui`: design primitives
- `@sam/i18n`: locale provider & hooks
- `@sam/auth`: Firebase + SAML integration (only in dashboard, optionally on landing login page)
- `@sam/payments`: (will attach where checkout occurs—likely landing or a dedicated billing app later)

## Auth Flows
### Landing
- Offers SAML button but does not mount global session context
- Redirect after SSO goes to Dashboard Shell domain/subpath

### Dashboard Shell
- Always mounts `AuthProvider` in `_app.tsx`
- Protects pages by rendering login CTA when `user` is null

## Environment Variables Separation
| Category | Landing | Dashboard |
|----------|---------|-----------|
| Public site URL | YES | YES |
| Firebase client keys | OPTIONAL (if signup) | YES |
| SAML secrets | NO | YES |
| PayPal/Pesapal secrets | NO | MAYBE (if billing UI) |

## Future Enhancements
- Route registry & dynamic nav
- Outbox/event bus for domain decoupling
- Domain packages (`packages/exams`, etc.) feeding shell
- Add analytics to landing (defer until consent) and audit logging to dashboard

## Migration Notes
- Pages previously under the single `web` app should be moved or retired
- Ensure DNS / hosting config splits marketing vs app (e.g., `www.` vs `app.`)

## Deployment Suggestion
- Build matrix in CI: `pnpm build --filter @sam/landing` and `pnpm build --filter @sam/dashboard-shell`
- Cache `node_modules/.pnpm` and turbo cache for speed

