# Next.js & HeroUI Template

This is a template for creating applications using Next.js 14 (pages directory) and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/next-pages-template)

> Note: Since Next.js 14, the pages router is recommend migrating to the [new App Router](https://nextjs.org/docs/app) to leverage React's latest features
>
> Read more: [Pages Router](https://nextjs.org/docs/pages)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI](https://heroui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org)
- [Framer Motion](https://www.framer.com/motion)
- [next-themes](https://github.com/pacocoursey/next-themes)

## How to Use

To create a new project based on this template using `create-next-app`, run the following command:

```bash
npx create-next-app -e https://github.com/heroui-inc/next-pages-template
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## Expose Locally Running App Online with ngrok

To make your local app accessible online:

1. Install ngrok if you haven't:
   ```bash
   npm install -g ngrok
   ```
2. Start your Next.js dev server:
   ```bash
   npm run dev
   ```
3. Authenticate ngrok (only needed once):
   ```bash
   ngrok config add-authtoken <NGROK_AUTHTOKEN>
   ```
4. Expose your local server (default Next.js port is 3000):
   ```bash
   ngrok http 3000
   ```
5. Use the HTTPS URL shown in the ngrok output (e.g. `https://xxxx.ngrok-free.app`) as your public endpoint.

## ACS (Assertion Consumer Service) URL

If you are integrating with a SAML identity provider, your ACS URL is typically:

```
http://localhost:3000/api/auth/saml/callback
```

If you are exposing your app via ngrok, replace `localhost:3000` with your ngrok HTTPS URL. For example:

```
https://xxxx.ngrok-free.app/api/auth/saml/callback
```

If you have a reserved domain on ngrok, use your reserved domain in the ACS URL. For example, if your reserved domain is `myapp.ngrok.app`:

```
https://myapp.ngrok.app/api/auth/saml/callback

## Onboarding Flow (SAM Early Access)

Landing page drives a single primary CTA (Try It for Free) to `/onboarding`.

1. User enters work email (no account needed yet).
2. Backend (`POST /api/auth/initiate`) checks for existing workspace by domain.
   - If exists: show Sign in with Google button (SAML / Google SSO placeholder).
   - If not: suggest workspace name and allow quick create (`POST /api/tenants`).
3. After creation or detection user proceeds with Google sign-in (`/api/auth/saml/login`).
4. First creator will later be routed to setup dashboard (future enhancement).

Current implementation uses an in-memory store (dev only) until Prisma models are wired.

Planned enhancements (not yet implemented):

- SSO full enablement & metadata exchange UI.
- Directory sync (Google Admin, future MS Graph).
- Role editor & overrides.
- SCIM provisioning token.
- Assessment wizard growth loop.

## M-Pesa Integration (Scaffolding)

Set the following env variables for real STK push (otherwise simulation auto-activates trial):

```
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_lipa_na_mpesa_online_passkey
MPESA_SHORT_CODE=174379
MPESA_CALLBACK_URL=https://your-domain.example/api/payments/mpesa/callback
MPESA_ENV=sandbox  # or production
```

Endpoints:
- `POST /api/payments/mpesa/initiate` { email, phone, amount } → starts STK push (or simulates)
- `POST /api/payments/mpesa/callback` ← Safaricom callback (updates profile status)
- `GET /api/onboarding/status?email=...` → profile & trial status

Utility: `lib/mpesa.ts` handles token + STK request & phone normalization.


```

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-pages-template/blob/main/LICENSE).
