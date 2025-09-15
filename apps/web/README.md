# @sam/web

Next.js app extracted from the root project.

- Config: tailwind/postcss/next/tsconfig are colocated here
- Imports: use `@/*` which maps to the app root
- Run: from repo root, use `pnpm --filter @sam/web dev` (after we move code and declare deps)

This is a staging spot before fully moving the existing app files into `apps/web`.
