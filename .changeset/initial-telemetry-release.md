---
"@zana/telemetry": minor
---

feat(telemetry): initial public release 0.1.0

Adds unified telemetry module combining events, logging, and sanitize subsystems:
- Event emission with Zod validation, sampling, redaction, oversize handling (truncate/drop)
- Structured logging with escalation and transport timeouts
- Redaction engine (keys + patterns, depth + circular safety)
- Metrics (emitted / dropped reasons)
- Graceful shutdown draining async transports
- Dev console transport (non-production)

Includes 100% test coverage across all modules.
