## @zana/template

Internal package scaffold for the Zana monorepo. This README is intentionally minimal so you can drop in real implementation details without stripping boilerplate.

### What You Get

- TypeScript (NodeNext) build + declaration output
- Pure ESM export surface (tree‑shake friendly, `sideEffects: false` by default)
- Opinionated config & validation pattern using Zod (add a `schemas.ts` when needed)
- Structured logging + events via `@zana/telemetry` (preferred over direct `console` usage)
- Redaction pattern support (follow telemetry sanitise helpers for sensitive fields)
- Ready for incremental build / type checking in the monorepo toolchain

### Intended Usage

1. Duplicate this folder (or generate a new package based on it).
2. Rename the package in `package.json` to `@zana/<package-name>`.
3. Define your public API only through the root `src/index.ts` (re‑export internal modules explicitly).
4. Add any configuration schemas in `src/schemas.ts` (co-locate domain specific parsing/normalisation).
5. Replace placeholder comments in source with concrete logic.

### Logging & Telemetry

Use `@zana/telemetry` for:

- Creating a logger instance (scoped by package name)
- Emitting structured events (follow existing event shape conventions)
- Applying sanitisation/redaction before emitting externally visible data

Do not introduce alternative logging libraries; consolidate through the telemetry package for consistency and pipeline enrichment.

### Configuration Pattern

- Keep runtime config minimal; validate eagerly at module load or first use.
- Use Zod schemas to normalise and narrow types.
- Prefer explicit environment variable mapping (no implicit passthrough of process.env).
- Centralise schema + derived settings in a single module so importing code only consumes typed objects.

### Testing

- Co-locate tests beside implementation (`*.test.ts`).
- Focus on contract behaviour (input/output, errors) not internal details.
- Avoid snapshot tests unless representing stable external formats.

### Publishing / Release Checklist

- [ ] Package renamed & description updated
- [ ] Public API reviewed (no unintended exports)
- [ ] Telemetry usage consistent (no stray console calls)
- [ ] Config validation present (if config exists)
- [ ] Tests added & passing
- [ ] No unused or extraneous dependencies
- [ ] Version bump handled via the repo release process

### Maintenance Guidelines

- Keep dependencies minimal; prefer existing internal utilities before adding new packages.
- Re-export shared domain types from a central `types.ts` if they are part of the public surface.
- Document any breaking changes in the monorepo changelog process.

### License
MIT
