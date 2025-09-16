
# Zana Monorepo

This monorepo contains all core apps and packages for the Zana platform.

## Structure

- `apps/` — Application frontends (e.g., landing, dashboard-shell)
- `packages/` — Shared libraries, UI, types, payments, i18n, etc.
- `docs/` — Documentation, architecture, and onboarding

## Getting Started

1. Install dependencies:
   ```sh
   pnpm install
   ```
2. Build all packages:
   ```sh
   pnpm build:all
   ```
3. Start development:
   ```sh
   pnpm dev
   ```

## Scripts

- `pnpm build:all` — Clean and build all packages/apps
- `pnpm dev` — Start development server(s)
- `pnpm lint` — Lint all packages/apps
- `pnpm format` — Format all packages/apps
- `pnpm test` — Run all tests
- `pnpm changeset` — Manage versioning and changelogs

## Contributing

Please see the [docs/Architecture](./docs/Architecture/) folder for architecture, onboarding, and integration details.

## License

Licensed under the MIT license.
