# Security & Compliance Pipeline

This repository implements a layered security approach:

## Implemented Checks
| Layer | Tool | Trigger | Blocking |
|-------|------|---------|----------|
| Dependency Vulnerabilities | OSV Scanner | PR, push, nightly | HIGH+ (configurable) |
| SBOM (CycloneDX) | cyclonedx-npm | PR/push | No (artifact) |
| License Policy | license-checker script | Manually via `pnpm check:licenses` | Yes (forbidden licenses) |
| SAST (data-flow) | CodeQL | PR, push, weekly | Alerts (not gating yet) |
| SAST (pattern) | Semgrep curated rules | PR, push | Fail on ERROR severity |
| Secrets | Gitleaks | PR, push | Currently report (non-block) |

## Commands
```bash
pnpm security:scan   # SBOM + license policy
pnpm sbom            # Generate CycloneDX SBOM (sbom.json)
```

## Adding a License Exception
Edit `scripts/check-licenses.cjs`:
1. Add license to `REVIEW` (soft) or expand `ALLOWED` after legal approval.
2. Avoid adding to ALLOWED if stronger policy desired; prefer documenting justification.

## Roadmap (Optional)
- Add Trivy for container/IaC scanning.
- Introduce suppression expiry for Semgrep and OSV findings.
- Promote CodeQL HIGH findings to blocking once backlog low.
- Add SBOM diff gate (unexpected component detection).

## Suppression Guidance
- Prefer fixing vulnerable dependency via upgrade.
- If unavoidable, document CVE, reason, planned removal date (30–90 days) in a `SECURITY_SUPPRESSIONS.md` (not yet created).

## Updating Dependencies
Use Renovate or Dependabot (pending enablement) and re-run pipelines. Ensure `pnpm install --frozen-lockfile` remains green.

---
_Last updated: automated initial version._
