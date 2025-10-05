# Security & Compliance Overview

This document summarizes the security controls integrated into the repo and how to use locally.

## Pipelines & Automation
- SBOM: `pnpm sbom` (CycloneDX JSON) with caching and summary. `sbom-summary.json` if `--summary json`.
- License Policy: `pnpm check:licenses`.
- Composite Scan: `pnpm security:scan` (SBOM + license + pnpm audit + OSV (soft)).
- CI Security Workflow: `.github/workflows/security.yml` runs SCA (OSV, pnpm audit, Trivy), SAST (CodeQL, Semgrep), secrets (Gitleaks), license checks, SBOM diff, and gating.
- Signing: SBOM + optional container images signed with cosign (keyless if OIDC available).

## Local Developer Checks
- Pre-commit (husky) performs: secrets scan (gitleaks), lint, type check, tests (changed packages only).
- Run full severity-gated scan locally: `pnpm security:scan --fail-on high --summary json`.
- Force SBOM regeneration: `pnpm sbom --refresh`.

## PR Template Expectations
When opening a PR fill in: security impact, data classification, threat model delta, test evidence.

## Adding New Packages
- Ensure license is permissive (MIT/BSD/Apache) or add justification before merging.
- Run `pnpm security:scan` to update SBOM and validate policy.

## Threat Modeling (Lightweight)
For features affecting auth, data boundaries, or sensitive flows: add a short section in the PR describing trust boundaries and primary threats (STRIDE is acceptable). Update diagrams if structural change.

## Vulnerability Severity Threshold
High / Critical findings block CI (OSV, audit, Trivy). Moderate/Low are logged for triage.

## SBOM Signing
`node scripts/sign-artifacts.cjs --sbom sbom.json` produces detached signature `sbom.json.sig`. In CI this runs automatically.

## Extending
Potential next steps (not yet implemented):
- Add ZAP baseline DAST job.
- Aggregate CodeQL + Semgrep SARIF metrics.
- Vulnerability SLA tracking job.
- Fuzz tests (`fast-check`) for input-heavy modules.

## Contact / Escalation
Create an issue with label `security` or contact the maintainers privately for sensitive disclosures.
