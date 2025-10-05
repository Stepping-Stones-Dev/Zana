

 
import { emit } from '../events/index.js';
import { buildRedactor } from '../sanitize/index.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LogEntryBase {
  level: LogLevel;
  msg: string;
  correlationId?: string;
  errorCode?: string;
  namespace?: string;
  timestamp?: string;
  [k: string]: unknown;
}

export interface ProcessedLogEntry extends Omit<LogEntryBase, 'timestamp'> {
  timestamp: string;
  namespace?: string;
  correlationId?: string;
  errorCode?: string;
  msg: string;
}
export type LogTransport = (log: ProcessedLogEntry) => void | Promise<void>;

interface SamplingConfig {
  debug: number;
  info: number;
  warn: number;
  error: number;
}
interface LoggerConfig {
  level: LogLevel;
  json: boolean;
  sampling: SamplingConfig;
  escalate: boolean;
  redactKeys: Set<string>;
  redactPatterns: RegExp[];
  correlationProvider?: () => { correlationId?: string } | undefined;
  maxDepth: number;
  transportTimeoutMs: number;
  onTransportError?: (error: unknown, entry: ProcessedLogEntry, transportIndex: number) => void;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  json: (process.env.ZANA_LOG_JSON || '').toLowerCase() === 'true',
  sampling: { debug: 1, info: 1, warn: 1, error: 1 },
  escalate: true,
  redactKeys: new Set([
    'password',
    'pass',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'authorization'
  ]),
  redactPatterns: [/bearer\s+[a-z0-9._-]+/i],
  maxDepth: 6,
  transportTimeoutMs: 5000
};

let CONFIG: LoggerConfig = { ...DEFAULT_CONFIG };

export function configureLogger(
  partial: Partial<Omit<LoggerConfig, 'redactKeys' | 'redactPatterns'>> & {
    addRedactKeys?: string[];
    addRedactPatterns?: (RegExp | string)[];
  }
) {
  if (partial.level) {
    CONFIG.level = partial.level;
  }
  if (typeof partial.json === 'boolean') {
    CONFIG.json = partial.json;
  }
  if (partial.sampling) {
    CONFIG.sampling = { ...CONFIG.sampling, ...partial.sampling };
  }
  if (typeof partial.escalate === 'boolean') {
    CONFIG.escalate = partial.escalate;
  }
  if (partial.correlationProvider) {
    CONFIG.correlationProvider = partial.correlationProvider;
  }
  if (typeof partial.maxDepth === 'number') {
    CONFIG.maxDepth = partial.maxDepth;
    redactorDirty = true;
  }
  if (typeof partial.transportTimeoutMs === 'number') {
    CONFIG.transportTimeoutMs = partial.transportTimeoutMs;
  }
  if (partial.onTransportError) {
    CONFIG.onTransportError = partial.onTransportError;
  }
  if (partial.addRedactKeys) {
    partial.addRedactKeys.forEach(k => CONFIG.redactKeys.add(k.toLowerCase()));
    redactorDirty = true;
  }
  if (partial.addRedactPatterns) {
    partial.addRedactPatterns.forEach(p =>
      CONFIG.redactPatterns.push(typeof p === 'string' ? new RegExp(p, 'i') : p)
    );
    redactorDirty = true;
  }
}

export function setLogLevel(level: LogLevel) {
  CONFIG.level = level;
}

export function getLoggerConfig(): Readonly<LoggerConfig> {
  return CONFIG;
}

const transports: LogTransport[] = [];
const _pendingLogs: Set<Promise<unknown>> = new Set();

export function addLogTransport(t: LogTransport) {
  if (!transports.includes(t)) {
    transports.push(t);
  } else {
    try {
      console.warn('[zana][logging] duplicate transport ignored');
    } catch {
      /* ignore */
    }
  }
}

export function clearLogTransports() {
  transports.length = 0;
}

export function listLogTransports() {
  return [...transports];
}

let redactorDirty = true;
let redactor = buildRedactor({
  redactKeys: CONFIG.redactKeys,
  patterns: CONFIG.redactPatterns,
  maxDepth: CONFIG.maxDepth
});

function refreshRedactor() {
  redactor = buildRedactor({
    redactKeys: CONFIG.redactKeys,
    patterns: CONFIG.redactPatterns,
    maxDepth: CONFIG.maxDepth
  });
  redactorDirty = false;
}

function shouldLog(level: LogLevel) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[CONFIG.level];
}

function sampleAllows(level: LogLevel) {
  const p = CONFIG.sampling[level];
  if (p >= 1) {
    return true;
  }
  if (p <= 0) {
    return false;
  }
  return Math.random() < p;
}

function toJSON(entry: ProcessedLogEntry) {
  return JSON.stringify(entry);
}

function emitEscalation(entry: ProcessedLogEntry) {
  if (!CONFIG.escalate) {
    return;
  }
  if (entry.level === 'error' || entry.level === 'warn') {
    emit(
      'log.escalated',
      {
        level: entry.level,
        namespace: entry.namespace as string | undefined,
        message: entry.msg as string,
        correlationId: entry.correlationId as string | undefined,
        errorCode: entry.errorCode as string | undefined
      },
      { correlationId: (entry.correlationId as string) || '' }
    );
  }
}

function dispatch(entry: ProcessedLogEntry) {
  for (let i = 0; i < transports.length; i++) {
    const t = transports[i];
    try {
      const r = t(entry);
      if (r && typeof (r as Promise<unknown>).then === 'function') {
        const original = r as Promise<unknown>;
        const timeoutMs = CONFIG.transportTimeoutMs;
  let timer: ReturnType<typeof setTimeout> | undefined;
        const raced = new Promise(resolve => {
          timer = setTimeout(() => {
            const err = new Error(`Log transport ${i} timeout after ${timeoutMs}ms`);
            (err as any).code = 'LOG_TRANSPORT_TIMEOUT';
            try {
              CONFIG.onTransportError?.(err, entry, i);
            } catch { /* ignore */ }
            try {
              emit('log.transport.failure', {
                message: err.message,
                namespace: entry.namespace as string | undefined
              });
            } catch { /* ignore */ }
            resolve(undefined);
          }, timeoutMs).unref?.();
          original.then(
            () => {
              if (timer) {
                clearTimeout(timer);
              }
              resolve(undefined);
            },
            err => {
              if (timer) {
                clearTimeout(timer);
              }
              try {
                emit('log.transport.failure', {
                  message: (err as Error).message,
                  namespace: entry.namespace as string | undefined
                });
              } catch { /* ignore */ }
              resolve(undefined);
            }
          );
        });
        _pendingLogs.add(raced);
        raced.finally(() => {
          _pendingLogs.delete(raced);
        });
      }
    } catch (_err) {
      try {
        CONFIG.onTransportError?.(_err, entry, i);
      } catch { /* ignore */ }
      try {
        emit('log.transport.failure', {
          message: (_err as Error).message,
          namespace: entry.namespace as string | undefined
        });
      } catch { /* ignore */ }
    }
  }
  if (!transports.length && typeof console !== 'undefined') {
    if (CONFIG.json) {
      console.log(toJSON(entry));
    } else {
      console.log(
        `[${entry.level}] ${entry.namespace} ${entry.msg}`,
        { cid: entry.correlationId, code: entry.errorCode }
      );
    }
  }
}

function base(
  level: LogLevel,
  msg: string,
  context?: Omit<LogEntryBase, 'level' | 'msg'>
) {
  if (!shouldLog(level) || !sampleAllows(level)) {
    return null;
  }
  const correlationFromProvider = CONFIG.correlationProvider?.();
  
  /* istanbul ignore next */
  const namespace = (context?.namespace as string | undefined) || 'zana';
  const merged = { ...context } as Record<string, unknown>;
  const entryObj: LogEntryBase = {
    ...merged,
    level,
    msg,
    namespace,
    correlationId:
      (context?.correlationId as string | undefined) ||
      correlationFromProvider?.correlationId ||
      '',
    errorCode: context?.errorCode as string | undefined
  };
  if (redactorDirty) {
    refreshRedactor();
  }
  const sanitized = redactor.redact(entryObj) as Required<LogEntryBase>;
  const processed: ProcessedLogEntry = {
    ...(sanitized as any),
    timestamp: new Date().toISOString()
  } as ProcessedLogEntry;
  emitEscalation(processed);
  dispatch(processed);
  return processed;
}

export interface Logger {
  debug: (msg: string, ctx?: Omit<LogEntryBase, 'level' | 'msg'>) => ProcessedLogEntry | null;
  info: (msg: string, ctx?: Omit<LogEntryBase, 'level' | 'msg'>) => ProcessedLogEntry | null;
  warn: (msg: string, ctx?: Omit<LogEntryBase, 'level' | 'msg'>) => ProcessedLogEntry | null;
  error: (msg: string, ctx?: Omit<LogEntryBase, 'level' | 'msg'>) => ProcessedLogEntry | null;
  namespace: (child: string) => Logger;
  with: (ctx: Record<string, unknown>) => Logger;
}

function buildLogger(
  ns: string,
  bound: Record<string, unknown> = {}
): Logger {
  const wrap =
    (lvl: LogLevel) =>
    (m: string, ctx?: Record<string, unknown>) =>
      base(lvl, m, { ...bound, ...ctx, namespace: ns });
  return {
    debug: wrap('debug'),
    info: wrap('info'),
    warn: wrap('warn'),
    error: wrap('error'),
    namespace: (child: string) => buildLogger(`${ns}:${child}`, bound),
    with: (ctx: Record<string, unknown>) => buildLogger(ns, { ...bound, ...ctx })
  };
}

export const logger = buildLogger('zana');
export const createLogger = (namespace: string) => buildLogger(namespace);

if (CONFIG.json && typeof console !== 'undefined') {
  addLogTransport(e => {
    try {
       
      console.log(toJSON(e));
    } catch { /* ignore */ }
  });
}

export function _resetLoggerForTests() {
  CONFIG = { ...DEFAULT_CONFIG };
  clearLogTransports();
  // Clear any pending async transports from prior tests to avoid cross-test interference
  ;(_pendingLogs as Set<Promise<unknown>>).clear();
}

export async function drainLogs(opts: { timeoutMs?: number } = {}): Promise<boolean> {
  const timeoutMs = opts.timeoutMs ?? 5000;
  const start = Date.now();
  while (_pendingLogs.size) {
    const slice = Promise.allSettled(Array.from(_pendingLogs));
    const race = await Promise.race([
      slice,
      new Promise<'timeout'>(res => setTimeout(() => res('timeout'), 25))
    ]);
    /* istanbul ignore next: first timeout branch hard to isolate deterministically */
    if (race === 'timeout' && Date.now() - start > timeoutMs) {
      return false;
    }
    /* istanbul ignore next: second guard identical logic */
    if (Date.now() - start > timeoutMs) {
      return false;
    }
  }
  return true;
}

export function getPendingLogTransportsCount() {
  return _pendingLogs.size;
}
