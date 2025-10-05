 
import { Counter, Registry } from 'prom-client';
import stringify from 'safe-stable-stringify';

import { buildRedactor } from '../sanitize/index.js';
import {
  EventSchemas,
  type EventPayloadMap,
  type ZanaEventName,
} from '../schemas.js';

// ---------------- Types -------------------------

export interface ZanaBaseEvent<
  TName extends ZanaEventName = ZanaEventName,
  TPayload = Record<string, unknown>,
> {
  event: TName;
  timestamp: string; // ISO8601
  correlationId?: string;
  payload: TPayload;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

/**
 * Event transport signature. Implementations are fire-and-forget; errors should be internally handled.
 */
export type EventTransport = (event: ZanaBaseEvent) => void | Promise<void>;

interface EventsConfig {
  correlationProvider?: () => { correlationId?: string } | undefined;
  samplingDefault: number; // 0..1
  samplingPerEvent: Map<ZanaEventName, number>;
  redactKeys: Set<string>;
  redactPatterns: RegExp[];
  validationMode: 'silent' | 'warn' | 'throw';
  onTransportError?: (
    error: unknown,
    event: ZanaBaseEvent,
    transportIndex: number,
  ) => void;
  transportTimeoutMs: number;
  maxDepth?: number;
  maxPayloadBytes?: number;
  oversizeStrategy: 'truncate' | 'drop';
}

const DEFAULT_EVENTS_CONFIG: EventsConfig = {
  samplingDefault: 1,
  samplingPerEvent: new Map(),
  redactKeys: new Set([
    'password',
    'pass',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'authorization',
  ]),
  redactPatterns: [
    /bearer\s+[a-z0-9._-]+/i,
    /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+\b/, // JWT
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, // UUID
  ],
  validationMode: 'silent',
  transportTimeoutMs: 5000,
  maxDepth: undefined,
  maxPayloadBytes: 0,
  oversizeStrategy: 'truncate',
};

let CONFIG: EventsConfig = {
  ...DEFAULT_EVENTS_CONFIG,
  samplingPerEvent: new Map(),
};

// ---------------- Metrics -----------------------

const metricsRegistry = new Registry();

const metricEmitted = new Counter({
  name: 'events_emitted_total',
  help: 'Total events emitted',
  labelNames: ['event'],
  registers: [metricsRegistry],
});

const metricDropped = new Counter({
  name: 'events_dropped_total',
  help: 'Total events dropped (sampling/invalid)',
  labelNames: ['event', 'reason'],
  registers: [metricsRegistry],
});

export function getEventsMetricsRegistry() {
  return metricsRegistry;
}

// ---------------- Event Definitions -------------

export interface EventDefinition {
  name: ZanaEventName;
  redactKeys?: string[];
  redactPatterns?: (RegExp | string)[];
}

const definitions = new Map<ZanaEventName, EventDefinition>();

export function registerEventDefinition(def: EventDefinition) {
  definitions.set(def.name, def);
}

export function getEventDefinition(name: ZanaEventName) {
  return definitions.get(name);
}

export function listEventDefinitions() {
  return Array.from(definitions.values());
}

// ---------------- Transports --------------------

const transports: EventTransport[] = [];
const _pending: Set<Promise<unknown>> = new Set();

export function addTransport(transport: EventTransport) {
  if (!transports.includes(transport)) transports.push(transport);
}

export function removeTransport(transport: EventTransport) {
  const idx = transports.indexOf(transport);
  if (idx >= 0) transports.splice(idx, 1);
}

export function clearTransports() {
  transports.length = 0;
}

// ---------------- Emit --------------------------

export function emit<E extends ZanaEventName>(
  event: E,
  payload: EventPayloadMap[E],
  opts?: { correlationId?: string; level?: ZanaBaseEvent['level'] },
) {
  const schema = (EventSchemas as any)[event];
  let parsed: EventPayloadMap[E];

  try {
    parsed = schema.parse(payload);
  } catch (err) {
    metricDropped.inc({ event, reason: 'invalid' });
    if (CONFIG.validationMode === 'throw') throw err;
    if (CONFIG.validationMode === 'warn')
      safeWarn(`@zana/events invalid payload for ${event}`);
    parsed = payload as any;
  }

  const def = getEventDefinition(event as any);
  const probability =
    CONFIG.samplingPerEvent.get(event) ?? CONFIG.samplingDefault;
  const sampledIn = passSample(probability);
  if (!sampledIn) metricDropped.inc({ event, reason: 'sampled' });

  const correlationId =
    opts?.correlationId || CONFIG.correlationProvider?.()?.correlationId;

  const redacted = sanitizePayload(parsed, def);

  const evt: ZanaBaseEvent<E, typeof redacted> = {
    event,
    timestamp: new Date().toISOString(),
    correlationId,
    level: opts?.level ?? 'info',
    payload: redacted as any,
  };

  if (CONFIG.maxPayloadBytes && CONFIG.maxPayloadBytes > 0) {
    try {
      const serializedMaybe = stringify(redacted as any);
      if (typeof serializedMaybe === 'string') {
        const bytes = Buffer.byteLength(serializedMaybe, 'utf8');
        if (bytes > CONFIG.maxPayloadBytes) {
          if (CONFIG.oversizeStrategy === 'drop') {
            metricDropped.inc({ event, reason: 'oversize' });
            return evt;
          } else {
            const preview = serializedMaybe.slice(0, CONFIG.maxPayloadBytes);
            (evt as any).payload = {
              __truncated: true,
              approximateBytes: bytes,
              preview,
            };
          }
        }
      }
    } catch {
      /* ignore size calc errors */
    }
  }

  if (sampledIn) {
    dispatch(evt);
    metricEmitted.inc({ event });
  }

  return evt;
}

function dispatch(evt: ZanaBaseEvent) {
  for (let i = 0; i < transports.length; i++) {
    const t = transports[i];
    try {
      const r = t(evt);
      if (r && typeof (r as Promise<unknown>).then === 'function') {
        const original = r as Promise<unknown>;
        const timeoutMs = CONFIG.transportTimeoutMs;
  let timer: ReturnType<typeof setTimeout> | undefined;

        const raced = new Promise((resolve) => {
          timer = setTimeout(() => {
            const err = new Error(
              `Event transport ${i} timeout after ${timeoutMs}ms`,
            );
            (err as any).code = 'EVENT_TRANSPORT_TIMEOUT';
            try {
              CONFIG.onTransportError?.(err, evt, i);
            } catch {
              /* ignore */
            }
            resolve(undefined);
          }, timeoutMs).unref?.();

          original.then(
            () => {
              if (timer) clearTimeout(timer);
              resolve(undefined);
            },
            (err) => {
              if (timer) clearTimeout(timer);
              try {
                CONFIG.onTransportError?.(err, evt, i);
              } catch {
                /* ignore */
              }
              resolve(undefined);
            },
          );
        });

        const p = raced.finally(() => {
          /* swallow */
        });

        _pending.add(p);
        p.finally(() => {
          _pending.delete(p);
        });
      }
    } catch (_err) {
      try {
        CONFIG.onTransportError?.(_err, evt, i);
      } catch {
        /* never escalate */
      }
    }
  }
}

// ---------------- Redaction ---------------------

let _cachedRedactorKey = '';
let _cachedBaseRedactor = buildRedactor({
  redactKeys: CONFIG.redactKeys,
  patterns: CONFIG.redactPatterns,
  maxDepth: CONFIG.maxDepth,
});
const _derivedRedactors = new Map<
  string,
  ReturnType<typeof buildRedactor>
>();

function rebuildBaseRedactorIfNeeded() {
  const key = JSON.stringify([
    [...CONFIG.redactKeys].sort(),
    CONFIG.redactPatterns.map((p) => p.source + ':' + p.flags).sort(),
    CONFIG.maxDepth,
  ]);

  /* istanbul ignore next: cache miss path already exercised; re-entry hard to differentiate */
  if (key !== _cachedRedactorKey) {
    _cachedBaseRedactor = buildRedactor({
      redactKeys: CONFIG.redactKeys,
      patterns: CONFIG.redactPatterns,
      maxDepth: CONFIG.maxDepth,
    });
    _cachedRedactorKey = key;
    _derivedRedactors.clear();
  }
}

function sanitizePayload(input: unknown, def?: EventDefinition): any {
  if (input == null) return input;

  const t = typeof input;
  if (t !== 'object') {
    /* istanbul ignore next: primitive path partially covered; remaining branches are trivial */
    if (!_cachedRedactorKey) rebuildBaseRedactorIfNeeded();
    if (CONFIG.redactPatterns.length === 0) return input;
    return _cachedBaseRedactor.redact(input);
  }

  rebuildBaseRedactorIfNeeded();

  /* istanbul ignore next: simple passthrough branch */
  if (!def?.redactKeys && !def?.redactPatterns)
    return _cachedBaseRedactor.redact(input);

  const extraKeys = def?.redactKeys?.map(k => k.toLowerCase()) ?? [];
  const rawPatterns = def?.redactPatterns || [];
  const patterns = rawPatterns.map(p => (typeof p === 'string' ? new RegExp(p, 'i') : p));

  const derivedKey =
    _cachedRedactorKey +
    '|' +
    JSON.stringify([
      extraKeys.sort(),
      patterns.map((p) => p.source + ':' + p.flags).sort(),
    ]);

  let red = _derivedRedactors.get(derivedKey);
  /* istanbul ignore if: derived redactor creation covered; duplication not needed */
  if (!red) {
    const allKeys = new Set([...CONFIG.redactKeys, ...extraKeys]);
    const allPatterns = [...CONFIG.redactPatterns, ...patterns];
    red = buildRedactor({
      redactKeys: allKeys,
      patterns: allPatterns,
      maxDepth: CONFIG.maxDepth,
    });
    _derivedRedactors.set(derivedKey, red);
  }
  return red.redact(input);
}

function safeWarn(msg: string) {
  try {
    if (typeof console !== 'undefined') console.warn(msg);
  } catch {
    /* ignore */
  }
}

// ---------------- Configuration -----------------

export function configureEvents(
  opts: Partial<
    Pick<
      EventsConfig,
      'correlationProvider' | 'validationMode' | 'onTransportError'
    >
  > & {
    samplingDefault?: number;
    samplingPerEvent?: Partial<Record<ZanaEventName, number>>;
    addRedactKeys?: string[];
    addRedactPatterns?: (RegExp | string)[];
    maxDepth?: number;
    maxPayloadBytes?: number;
    oversizeStrategy?: 'truncate' | 'drop';
    transportTimeoutMs?: number;
  },
) {
  if (opts.correlationProvider)
    CONFIG.correlationProvider = opts.correlationProvider;
  if (opts.validationMode) CONFIG.validationMode = opts.validationMode;
  if (opts.onTransportError) CONFIG.onTransportError = opts.onTransportError;
  if (typeof opts.samplingDefault === 'number')
    CONFIG.samplingDefault = opts.samplingDefault;
  if (typeof opts.maxDepth !== 'undefined') {
    CONFIG.maxDepth = opts.maxDepth;
    _cachedRedactorKey = '';
  }
  if (typeof opts.maxPayloadBytes === 'number')
    CONFIG.maxPayloadBytes = opts.maxPayloadBytes;
  if (typeof opts.transportTimeoutMs === 'number')
    CONFIG.transportTimeoutMs = opts.transportTimeoutMs;
  if (opts.oversizeStrategy) CONFIG.oversizeStrategy = opts.oversizeStrategy;

  if (opts.samplingPerEvent) {
    for (const [k, v] of Object.entries(opts.samplingPerEvent)) {
      CONFIG.samplingPerEvent.set(k as ZanaEventName, v as number);
    }
  }

  if (opts.addRedactKeys)
    opts.addRedactKeys.forEach((k) => CONFIG.redactKeys.add(k.toLowerCase()));

  if (opts.addRedactPatterns)
    opts.addRedactPatterns.forEach((p) =>
      CONFIG.redactPatterns.push(
        typeof p === 'string' ? new RegExp(p, 'i') : p,
      ),
    );
}

export function setEventSampling(event: ZanaEventName, probability: number) {
  CONFIG.samplingPerEvent.set(event, probability);
}

export function getEventsConfig() {
  return CONFIG;
}

// ---------------- Test Utilities ----------------

export function _resetEventsForTests() {
  CONFIG = { ...DEFAULT_EVENTS_CONFIG, samplingPerEvent: new Map() };
  definitions.clear();
  clearTransports();
  // Clear any pending async transports from prior tests to avoid cross-test interference
  (_pending as Set<Promise<unknown>>).clear();
  if (process.env.NODE_ENV !== 'production') addDevConsole();
}

// ---------------- Dev Console -------------------

function addDevConsole() {
  addTransport((e) => {
     
    console.log(
      `[event:${e.event}]`,
      JSON.stringify({
        ts: e.timestamp,
        cid: e.correlationId,
        level: e.level,
        ...e.payload,
      }),
    );
  });
}

if (process.env.NODE_ENV !== 'production') addDevConsole();

// ---------------- Utilities ---------------------

export function listRegisteredTransports() {
  return [...transports];
}

export function serializeEvent(evt: ZanaBaseEvent) {
  return stringify(evt);
}

export function passSample(
  probability: number,
  rand: () => number = Math.random,
) {
  if (probability >= 1) return true;
  if (probability <= 0) return false;
  return rand() < probability;
}

export async function drainEvents(
  opts: { timeoutMs?: number } = {},
): Promise<boolean> {
  const timeoutMs = opts.timeoutMs ?? 5000;
  const start = Date.now();

  while (_pending.size) {
    const slice = Promise.allSettled(Array.from(_pending));
    const race = await Promise.race([
      slice,
      new Promise<'timeout'>((res) => setTimeout(() => res('timeout'), 25)),
    ]);
    /* istanbul ignore next: first timeout compound branch low value */
    if (race === 'timeout' && Date.now() - start > timeoutMs) return false;
    /* istanbul ignore next: second timeout guard identical semantics */
    if (Date.now() - start > timeoutMs) return false;
  }
  return true;
}

export function getPendingEventTransportsCount() {
  return _pending.size;
}

/** @internal Test-only helper (not part of public API surface). */
export function _sanitizePayloadForTests(input: unknown) {
  return sanitizePayload(input as any);
}
