# Zana Monorepo

[![CI](https://github.com/Stepping-Stones-Dev/sam/actions/workflows/ci.yml/badge.svg)](https://github.com/Stepping-Stones-Dev/sam/actions/workflows/ci.yml)
[![Security Pipeline](https://github.com/Stepping-Stones-Dev/sam/actions/workflows/security.yml/badge.svg)](https://github.com/Stepping-Stones-Dev/sam/actions/workflows/security.yml)

Initial scaffolding per Architecture Blueprint Section 27 (Kickoff).

Current highlights:
- Unified telemetry package (`@zana/telemetry`) providing events, logging, sanitization utilities.
- 100% test coverage enforced via Jest thresholds.
- Consolidated security pipeline (OSV, CodeQL, Semgrep, Gitleaks, license policy, SBOM diff, pnpm audit, optional Trivy).
- CI targets Node 22+ only (dropped 18/20) with coverage comment.

## Quick Start
```bash
pnpm install
pnpm build --filter=@zana/events --filter=@zana/logging
```

## Packages
- `@zana/telemetry`: Unified events + logging + sanitize engine.

See `docs/SECURITY_PIPELINE.md` for security process and `packages/telemetry/README.md` for usage details.

## Next Steps
Refer to `docs/SECURITY_PIPELINE.md` and `Zana.md` Section 27.9 for strategic tasks.
