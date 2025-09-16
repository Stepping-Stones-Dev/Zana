# @sam/dashboard-shell

Authenticated application shell for tenant users.

## Purpose
- Hosts secure routes & domain feature entry points (exams, staff, inventory, etc.)
- Centralizes layout (nav, sidebars, theming)
- Handles session + role acquisition via `@sam/auth`
- SAML (Google Workspace) sign-in flow

## Auth Flow (SAML)
1. User visits `/saml-login` (renders SAML button)
2. Button submits to `/api/auth/saml/login` (handled by backend passport-saml strategy)
3. IdP redirects to SAML callback -> sets `sam_session` cookie -> redirect to `/`
4. Client fetches `/api/auth/session` to hydrate minimal user state

## Environment Variables
```
SAML_ENTRY_POINT=...         # Google Workspace SSO URL
SAML_ISSUER=...              # SP Entity ID
SAML_CALLBACK_URL=...        # e.g. https://app.example.com/api/auth/saml/callback
# Firebase not required if SAML-only
```
(Plus any existing payment vars if these features surface here.)

## Development
```
pnpm --filter @sam/dashboard-shell dev
```

## Next Steps
- Add route registry + dynamic navigation
- Integrate domain packages (`@sam/exams`, etc.)
- Implement role-based permission gates
- Add webhook handling surfaces or move to dedicated API app
 - Sign/encrypt session cookie and add `/api/auth/logout`
 - Ensure DNS/host matches `SAML_CALLBACK_URL` domain
