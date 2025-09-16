# @zana/landing

Public marketing & acquisition Next.js app.

## Purpose
- Fast static/ISR pages (home, features, pricing, contact)
- Minimal JS, no authenticated data required
- Entry points for signup / SSO redirect only

## Tech
- Next.js 15 (Pages router for now)
- Tailwind (shared config pattern)
- `@zana/i18n` for translations
- `@zana/ui` shared design primitives

## Auth Stance
No persistent auth context is mounted here to keep bundle lean. SAML button posts to `/api/auth/saml/login` (served by backend / dashboard environment). If you later add Firebase email onboarding, mount a lightweight provider only on those routes.

## Environment Variables (public)
```
NEXT_PUBLIC_SITE_URL=https://example.com
```
Avoid leaking private payment or SAML secrets.

## Development
From repo root:
```
pnpm --filter @zana/landing dev
```

## Next Steps
- Replace placeholder content
- Add JSON-LD schema for SEO
- Add analytics (defer until consent model defined)
- Integrate pricing plan IDs (read-only) if needed
