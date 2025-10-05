## @zana/telemetry

Unified structured telemetry for Zana applications: events, structured logging, payload redaction, sampling, metrics, graceful shutdown.

> Design: Singleton configuration (global mutable state). For multi-tenant isolation wrap in a factory; current API favors simplicity and low overhead.

### Features
- Events: Zod validation, per-event/default sampling, redaction, oversize handling (truncate/drop), async transport timeouts.
- Logging: leveled JSON/text logging with pluggable transports; optional escalation of warn/error to events.
- Redaction: key + regex pattern redaction, depth limiting, circular safe serialization.
- Metrics: Prometheus counters for emitted & dropped (invalid | sampled | oversize).
- Graceful Shutdown: drains event & log transports with a global timeout.
- Hooks: `onTransportError`, `onRedactionError`.
- Dev Experience: Dev console transport auto-added outside production.

---

### Install
```bash
pnpm add @zana/telemetry
```

### Quick Start
```ts
import { configureTelemetry, logger, emit, shutdownTelemetry } from '@zana/telemetry';

configureTelemetry({
	events: {
		validationMode: 'warn',
		correlationProvider: () => ({ correlationId: 'req-42' }),
		samplingDefault: 1,
		addRedactKeys: ['sessionSecret'],
		maxPayloadBytes: 8_000,
		oversizeStrategy: 'truncate'
	},
	logging: { json: true }
});

const log = logger('auth');
log.info({ userId: 'u1', action: 'login' });
emit('session.issued', { userId: 'u1', ip: '127.0.0.1' });

await shutdownTelemetry({ timeoutMs: 5000 });
```

### Events API
```ts
import { emit, configureEvents, addTransport, registerEventDefinition, setEventSampling } from '@zana/telemetry/events';

configureEvents({ transportTimeoutMs: 3000, addRedactPatterns: [/secret/i] });
registerEventDefinition({ name: 'session.issued', redactKeys: ['token'] });
setEventSampling('session.issued', 0.25);
emit('session.issued', { userId: 'u1', token: 'abc' });
```

### Logging API
```ts
import { configureLogger, logger, addLogTransport } from '@zana/telemetry/logging';
configureLogger({ json: true });
const log = logger('billing');
log.info({ invoiceId: 'inv_1' });
addLogTransport(entry => { /* forward */ });
```

### Sanitize Utility
```ts
import { buildRedactor } from '@zana/telemetry/sanitize';
buildRedactor({ redactKeys: new Set(['password']) }).redact({ password: 'p', ok: true });
```

### Oversize Payloads
Configure `maxPayloadBytes` & `oversizeStrategy`:
- `truncate`: payload replaced with `{ __truncated: true, approximateBytes, preview }`.
- `drop`: event not dispatched (dropped metric incremented).

### Metrics
```ts
import { getEventsMetricsRegistry } from '@zana/telemetry/events';
console.log(await getEventsMetricsRegistry().metrics());
```
Counters:
- `events_emitted_total{event}`
- `events_dropped_total{event,reason}`

### Shutdown
```ts
import { shutdownTelemetry } from '@zana/telemetry';
await shutdownTelemetry({ timeoutMs: 4000 });
```

### Redaction Defaults
Keys (case-insensitive): password, pass, token, accessToken, refreshToken, secret, apiKey, authorization

Extend:
```ts
import { configureEvents } from '@zana/telemetry/events';
configureEvents({ addRedactPatterns: [/bearer\s+[a-z0-9._-]+/i] });
```

### Dev Console Transport
Active when `NODE_ENV !== 'production'`. Disable:
```ts
import { clearTransports } from '@zana/telemetry/events';
clearTransports();
```

### Testing Helpers
`_resetEventsForTests()` resets global state. `_sanitizePayloadForTests` is `@internal`.

### Production Guidance
- Keep event cardinality low.
- Wrap network-heavy transports with a concurrency limiter.
- Validate custom regex patterns for performance.
- Use sampling to protect hot paths.

### Roadmap
- LRU for derived redactors.
- Per-transport timeout overrides.
- Optional concurrency limiter helper.

### License
MIT
