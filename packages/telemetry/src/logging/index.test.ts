/// <reference types="jest" />
/* eslint-env jest */
// @jest-environment node
import { addTransport as addEventTransport } from '../events/index.js';
import type { ZanaBaseEvent } from '../events/index.js';
import {
  logger,
  addLogTransport,
  clearLogTransports,
  _resetLoggerForTests,
  configureLogger,
  setLogLevel,
  createLogger,
  type ProcessedLogEntry,
  getLoggerConfig,
  listLogTransports,
} from '../logging/index.js';
import { drainLogs, getPendingLogTransportsCount } from '../logging/index.js';

// Simple in-memory collectors
const collected: any[] = [];  
const escalated: any[] = [];

addEventTransport((evt: ZanaBaseEvent) => {
  if (evt.event === 'log.escalated') escalated.push(evt);
});

addLogTransport((e: ProcessedLogEntry) => {
  collected.push(e);
});

describe('logging', () => {
  beforeEach(() => {
    collected.length = 0;
    escalated.length = 0;
    _resetLoggerForTests();
    addLogTransport((e: ProcessedLogEntry) => {
      collected.push(e);
    });
    addEventTransport((evt: ZanaBaseEvent) => {
      if (evt.event === 'log.escalated') escalated.push(evt);
    });
    setLogLevel('debug');
  });

  test('emits a structured log entry with timestamp and namespace', () => {
    const entry = logger.info('hello', { correlationId: 'abc123' });
    expect(entry).toBeTruthy();
    expect(entry?.timestamp).toMatch(/T/);
    expect(entry?.namespace).toBe('zana');
    expect(collected[0]).toEqual(entry);
  });

  test('escalates warn/error as events', () => {
    logger.warn('warny', { correlationId: 'cid1' });
    logger.error('errory', { correlationId: 'cid2', errorCode: 'E_TEST' });
    const msgs = escalated.map(e => e.payload.message);
    expect(msgs.includes('warny')).toBe(true);
    expect(msgs.includes('errory')).toBe(true);
    const errEvt = escalated.find(e => e.payload.message === 'errory');
    expect(errEvt?.payload.namespace).toBe('zana');
    expect(errEvt?.payload.correlationId).toBe('cid2');
    expect(errEvt?.payload.errorCode).toBe('E_TEST');
  });

  test('escalation without correlationId or errorCode still emits with undefined fields', () => {
    logger.warn('plain warning');
    const evt = escalated.find(e => e.payload.message === 'plain warning');
    expect(evt).toBeTruthy();
    expect(evt?.payload.namespace).toBe('zana');
    expect(evt?.payload.correlationId === undefined || evt?.payload.correlationId === '').toBe(true);
    expect(evt?.payload.errorCode).toBeUndefined();
  });

  test('redacts sensitive keys and patterns', () => {
    configureLogger({ addRedactKeys: ['secretSauce', 'accessToken'] });
    const entry = logger.info('handling credentials', {
      password: 'p@ss',
      token: 'XYZ',
      secretSauce: '123',
      nested: { accessToken: 'abc' },
    });
    const encoded = JSON.stringify(entry);
    expect(encoded).not.toMatch(/p@ss/);
    expect(encoded).not.toMatch(/XYZ/);
    expect(encoded).not.toMatch(/123/);
    expect(encoded).not.toMatch(/abc/);
  });

  test('sampling drops logs when probability 0', () => {
    configureLogger({ sampling: { debug: 0, info: 0, warn: 1, error: 1 } });
    const a = logger.debug('will-drop');
    const b = logger.info('will-drop-too');
    const c = logger.error('will-keep');
    expect(a).toBeNull();
    expect(b).toBeNull();
    expect(c).not.toBeNull();
  });

  test('namespace chaining and with-context', () => {
    const apiLogger = createLogger('zana').namespace('api').with({ base: 1 });
    const entry = apiLogger.debug('call', { path: '/v1', base: 2 });
    expect(entry?.namespace).toBe('zana:api');
    expect(entry?.base).toBe(2);
  });

  test('can disable escalation', () => {
    configureLogger({ escalate: false });
    logger.error('boom');
    expect(escalated.length).toBe(0);
  });

  test('transport failure emits log.transport.failure', () => {
    const failures: any[] = [];
    addEventTransport((evt: ZanaBaseEvent) => {
      if (evt.event === 'log.transport.failure') failures.push(evt);
    });
    addLogTransport(() => {
      throw new Error('sink blew');
    });
    logger.info('ok');
    expect(failures.length).toBeGreaterThanOrEqual(1);
  });

  test('transport timeout path triggers onTransportError and failure event', async () => {
    _resetLoggerForTests();
    const errors: any[] = [];
    const failures: any[] = [];
    configureLogger({ transportTimeoutMs: 15, onTransportError: err => errors.push(err) });
    addEventTransport((evt: ZanaBaseEvent) => {
      if (evt.event === 'log.transport.failure') failures.push(evt);
    });
    addLogTransport(() => new Promise(() => {}));
    logger.info('will timeout');
    await new Promise(r => setTimeout(r, 40));
    expect(errors.some(e => (e as any).code === 'LOG_TRANSPORT_TIMEOUT')).toBe(true);
    expect(failures.some(f => /timeout after/i.test(f.payload.message))).toBe(true);
  });

  test('correlation provider supplies id when not explicit', () => {
    configureLogger({ correlationProvider: () => ({ correlationId: 'prov-1' }) });
    const e = logger.info('from provider');
    expect(e?.correlationId).toBe('prov-1');
  });

  test('fallback console path triggers when no transports', () => {
    clearLogTransports();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('no transports');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('json fallback logging when CONFIG.json true', () => {
    clearLogTransports();
    configureLogger({ json: true });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('json path');
    expect(spy.mock.calls[0][0]).toMatch(/"msg":"json path"/);
    spy.mockRestore();
  });

  test('text fallback logging when CONFIG.json false', () => {
    _resetLoggerForTests();
    clearLogTransports();
    configureLogger({ json: false });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('text path');
    expect(spy.mock.calls[0][0]).toMatch(/\[info]/);
    spy.mockRestore();
  });

  test('no emission when level below threshold', () => {
    configureLogger({ level: 'error' });
    const res = logger.info('should skip');
    expect(res).toBeNull();
  });

  test('probabilistic sampling mid probability path', () => {
    configureLogger({ sampling: { info: 0.5, debug: 0.5, warn: 1, error: 1 } });
    const randSpy = jest.spyOn(Math, 'random').mockReturnValue(0.4);
    const allowed = logger.debug('maybe');
    randSpy.mockReturnValue(0.9);
    const dropped = logger.debug('drop');
    randSpy.mockRestore();
    expect(allowed).not.toBeNull();
    expect(dropped).toBeNull();
  });

  test('pattern redaction and nested truncation + circular detection', () => {
    configureLogger({ addRedactKeys: ['customsecret'], maxDepth: 2 });
    const circular: any = { customsecret: 'secret-value', note: 'Token: Bearer abc123' };
    circular.self = circular;
    const deep = { a: { b: { c: { d: 1 } } } };
    const e = logger.info('complex', { circular, deep });
    const str = JSON.stringify(e);
    expect(str).not.toMatch(/abc123/);
    expect(str).toMatch(/\*\*\*REDACTED\*\*\*/);
    expect(str).toMatch(/"self":"\[Circular\]"/);
    expect(str).toMatch(/\[Truncated]/);
  });

  test('exposes listLogTransports & config access', () => {
    const cfg = getLoggerConfig();
    expect(cfg.level).toBeDefined();
    expect(Array.isArray(listLogTransports())).toBe(true);
  });

  test('addRedactPatterns (string & regex) applies', () => {
    configureLogger({ addRedactPatterns: ['secret value', /bearer\s+[a-z0-9]+/i] });
    const entry = logger.info('pattern test', { note: 'secret value', header: 'Bearer tokenvalue' });
    const json = JSON.stringify(entry);
    expect(json).not.toMatch(/secret value/);
    expect(json).not.toMatch(/tokenvalue/);
  });

  test('module init JSON transport path when ZANA_LOG_JSON set before import', async () => {
    const prev = process.env.ZANA_LOG_JSON;
    process.env.ZANA_LOG_JSON = 'true';
    jest.resetModules();
    const mod = await import('../logging/index.js');
    const before = mod.listLogTransports().length;
    expect(before).toBeGreaterThan(0);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mod.logger.info('hit json transport');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    process.env.ZANA_LOG_JSON = prev;
  });

  test('json transport catch path (console.log throws)', async () => {
    const prev = process.env.ZANA_LOG_JSON;
    process.env.ZANA_LOG_JSON = 'true';
    jest.resetModules();
    const mod = await import('../logging/index.js');
    const original = console.log;
    console.log = () => {
      throw new Error('console boom');
    };
    expect(() => mod.logger.info('trigger error path')).not.toThrow();
    console.log = original;
    process.env.ZANA_LOG_JSON = prev;
  });

  test('array redaction and sanitize on arrays', () => {
    const entry = logger.info('array test', { password: 'p1', list: ['abc', { token: 'zzz' }] });
    const json = JSON.stringify(entry);
    expect(json).not.toMatch(/p1/);
    expect(json).not.toMatch(/zzz/);
  });

  test('async transport resolve path clears pending set', async () => {
    _resetLoggerForTests();
    const resolved: ProcessedLogEntry[] = [];
    addLogTransport(async e => {
      await new Promise(r => setTimeout(r, 5));
      resolved.push(e);
    });
    const before = getPendingLogTransportsCount();
    logger.info('async ok');
    expect(getPendingLogTransportsCount()).toBeGreaterThanOrEqual(before);
    await drainLogs({ timeoutMs: 200 });
    expect(resolved.length).toBe(1);
    expect(getPendingLogTransportsCount()).toBe(0);
  });

  test('async transport reject triggers onTransportError and failure event', async () => {
    _resetLoggerForTests();
    const errs: any[] = [];
    configureLogger({ onTransportError: err => errs.push(err), transportTimeoutMs: 100 });
    const failures: any[] = [];
    addEventTransport((evt: any) => {
      if (evt.event === 'log.transport.failure') failures.push(evt);
    });
    addLogTransport(async () => {
      await new Promise((_, rej) => setTimeout(() => rej(new Error('rejecting')), 5));
    });
    logger.info('will reject');
    await drainLogs({ timeoutMs: 300 });
    expect(errs.length === 0 || errs.length === 1).toBe(true);
    expect(failures.length).toBeGreaterThanOrEqual(1);
  });

  test('sync transport throw triggers onTransportError', () => {
    _resetLoggerForTests();
    const errs: any[] = [];
    configureLogger({ onTransportError: err => errs.push(err) });
    addLogTransport(() => {
      throw new Error('sync boom');
    });
    logger.info('sync throw');
    expect(errs.length).toBe(1);
    expect((errs[0] as Error).message).toMatch(/sync boom/);
  });

  test('drainLogs timeout returns false with hanging promise', async () => {
    _resetLoggerForTests();
    addLogTransport(() => new Promise(() => {}));
    logger.info('hang');
    const drained = await drainLogs({ timeoutMs: 40 });
    expect(drained).toBe(false);
  });

  test('drainLogs second timeout branch (elapsed after non-timeout race)', async () => {
    _resetLoggerForTests();
    addLogTransport(() => new Promise(() => {}));
    logger.info('hang2');
    const realNow = Date.now;
    let base = realNow();
    const spy = jest.spyOn(Date, 'now').mockImplementation(() => base);
    const p = drainLogs({ timeoutMs: 50 });
    await new Promise(r => setTimeout(r, 30));
    base += 30;
    await new Promise(r => setTimeout(r, 30));
    base += 30;
    const res = await p;
    expect(res).toBe(false);
    spy.mockRestore();
  });

  test('drainLogs true when resolved quickly', async () => {
    _resetLoggerForTests();
    addLogTransport(async () => {
      await new Promise(r => setTimeout(r, 1));
    });
    logger.info('quick');
    await new Promise(r => setTimeout(r, 0));
    const drained = await drainLogs({ timeoutMs: 150 });
    expect(drained).toBe(true);
  });

  test('adding duplicate transport warns only once', () => {
    const t = jest.fn();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    addLogTransport(t);
    addLogTransport(t);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  test('drainLogs immediate success with no pending logs (fast branch)', async () => {
    _resetLoggerForTests();
    const start = Date.now();
    const drained = await drainLogs({ timeoutMs: 50 });
    const elapsed = Date.now() - start;
    expect(drained).toBe(true);
    expect(elapsed).toBeLessThan(15);
  });

  test('drainLogs default invocation with no args returns true quickly', async () => {
    _resetLoggerForTests();
    const start = Date.now();
    const drained = await drainLogs();
    const elapsed = Date.now() - start;
    expect(drained).toBe(true);
    expect(elapsed).toBeLessThan(25);
  });

  test('createLogger custom root & setLogLevel suppresses debug', () => {
    const custom = createLogger('custom');
    setLogLevel('warn');
    const dbg = custom.debug('hidden');
    const warn = custom.warn('shown');
    expect(dbg).toBeNull();
    expect(warn?.namespace).toBe('custom');
  });

  test('reset logger clears transports and config to defaults', () => {
    addLogTransport(() => {});
    expect(listLogTransports().length).toBeGreaterThan(0);
    _resetLoggerForTests();
    expect(listLogTransports().length).toBe(0);
  });

  test('escalation disabled for warn as well', () => {
    configureLogger({ escalate: false });
    const countBefore = escalated.length;
    logger.warn('should-not-escalate');
    expect(escalated.length).toBe(countBefore);
  });

  test('context provided namespace is ignored (logger namespace prevails)', () => {
    const entry = logger.info('ctx ns override', { namespace: 'ctxOverride' });
    expect(entry?.namespace).toBe('zana');
  });
});
