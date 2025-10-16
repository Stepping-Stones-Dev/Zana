/// <reference types="jest" />
/* eslint-env jest */
// @jest-environment node
import { emit, addTransport as addEventTransport, _resetEventsForTests, getEventsMetricsRegistry, setEventSampling } from './events/index.ts';
import { logger, addLogTransport, _resetLoggerForTests } from './logging/index.ts';

import { configureTelemetry, shutdownTelemetry, events, logging, configureEvents, configureLogger } from './index.ts';

// Utility sleep
const sleep = (ms: number) => new Promise(r=>setTimeout(r, ms));

describe('telemetry root aggregator & unified config', () => {
  beforeEach(()=>{ _resetEventsForTests(); _resetLoggerForTests(); });

  test('configureTelemetry applies both events & logging configs', () => {
    configureTelemetry({
      events: { samplingDefault: 0.25 },
      logging: { level: 'debug' }
    });
    // Set an event-level sampling to ensure override interaction still works
    setEventSampling('session.issued', 1);
    const cap: any[] = [];
    addEventTransport(e=>{ cap.push(e); });
    emit('session.issued', { userId:'u', orgId:'o' });
    expect(cap.length).toBe(1); // override ensured dispatch
    const entry = logger.debug('dbg');
    expect(entry?.level).toBe('debug');
  });

  test('shutdownTelemetry resolves success with draining async transports', async () => {
    const done: string[] = [];
    addEventTransport(async ()=>{ await sleep(20); done.push('e'); });
    addLogTransport(async ()=>{ await sleep(15); done.push('l'); });
    emit('session.issued', { userId:'u', orgId:'o' });
    logger.info('hello');
    const res = await shutdownTelemetry({ timeoutMs: 200 });
    expect(res.success).toBe(true);
    expect(done.sort()).toEqual(['e','l']);
  });

  test('shutdownTelemetry timeout path returns success=false when unresolved transports hang', async () => {
    addEventTransport(()=> new Promise(()=>{/* never resolves */}));
    emit('session.issued', { userId:'u', orgId:'o' });
    const res = await shutdownTelemetry({ timeoutMs: 30 });
    expect(res.success).toBe(false);
    expect(res.eventsDrained).toBe(false);
  });

  test('shutdownTelemetry default invocation (no args) drains successfully', async () => {
    // Fast resolving transports to avoid long waits while using default timeout
    const marks: string[] = [];
    addEventTransport(async () => { marks.push('e'); });
    addLogTransport(async () => { marks.push('l'); });
    emit('session.issued', { userId:'u', orgId:'o' });
    logger.info('root');
    // Call with no parameters to exercise default options path
    const res = await shutdownTelemetry();
    expect(res).toMatchObject({ success: true, eventsDrained: true, logsDrained: true });
    expect(marks.sort()).toEqual(['e','l']);
  });
});

describe('events oversize handling + depth', () => {
  beforeEach(()=>{ _resetEventsForTests(); });

  test('oversizeStrategy drop prevents dispatch', () => {
    const cap: any[] = [];
  addEventTransport(e=>{ cap.push(e); });
    configureEvents({ maxPayloadBytes: 10, oversizeStrategy: 'drop' });
    // Payload will exceed 10 bytes after serialization
    emit('session.issued', { userId:'toolongUser', orgId:'org' });
    expect(cap.length).toBe(0);
  });

  test('oversizeStrategy truncate replaces payload with truncated preview', () => {
    const cap: any[] = [];
  addEventTransport(e=>{ cap.push(e); });
    configureEvents({ maxPayloadBytes: 25, oversizeStrategy: 'truncate' });
    const ev = emit('session.issued', { userId:'veryLongUserIdentifier', orgId:'orgX' });
    expect(cap.length).toBe(1);
    expect((ev as any).payload.__truncated).toBe(true);
    expect((ev as any).payload.preview.length).toBeLessThanOrEqual(25);
  });

  test('maxDepth redaction truncates deep objects', () => {
    configureEvents({ maxDepth: 1 });
    const cap: any[] = [];
  addEventTransport(e=>{ cap.push(e); });
    emit('session.issued', { userId:'u', orgId:'o', deep: { a: { b: { c: 1 } } } });
    const json = JSON.stringify(cap[0]);
    // After redaction, deep becomes the marker string value in payload
    expect(json).toMatch(/"deep":"\[Truncated]/); // truncated marker at depth limit
  });
});

describe('transport timeout hooks (events & logging)', () => {
  beforeEach(()=>{ _resetEventsForTests(); _resetLoggerForTests(); });

  test('events transport timeout triggers onTransportError', async () => {
    const errs: any[] = [];
    configureEvents({ transportTimeoutMs: 25, onTransportError: (err)=>errs.push(err) });
    addEventTransport(()=> new Promise(()=>{/* never resolves */}));
    emit('session.issued', { userId:'u', orgId:'o' });
    await sleep(40);
    expect(errs.length).toBe(1);
    expect((errs[0] as Error).message).toMatch(/timeout/i);
  });

  test('logging transport timeout triggers onTransportError', async () => {
    const errs: any[] = [];
    configureLogger({ transportTimeoutMs: 25, onTransportError: (err)=>errs.push(err) });
    addLogTransport(()=> new Promise(()=>{/* never resolves */}));
    logger.info('entry');
    await sleep(40);
    expect(errs.length).toBe(1);
    expect((errs[0] as Error).message).toMatch(/timeout/i);
  });
});

describe('metrics oversize drop reason recorded', () => {
  beforeEach(()=>{ _resetEventsForTests(); });
  test('oversize drop increments events_dropped_total with reason oversize', async () => {
    configureEvents({ maxPayloadBytes: 5, oversizeStrategy: 'drop' });
    emit('session.issued', { userId:'U', orgId:'ORG' });
    const reg = getEventsMetricsRegistry();
    const metrics = await reg.metrics();
    expect(metrics).toMatch(/events_dropped_total{[^}]*reason="oversize"/);
  });
});

// Additional coverage: ensure configureTelemetry reconfiguration modifies depth & size simultaneously
describe('configureTelemetry multi-field update', () => {
  test('updates events maxDepth and logging level together', () => {
    configureTelemetry({ events: { maxDepth: 0 }, logging: { level: 'error' } });
    const e = emit('session.issued', { userId:'u', orgId:'o', nested:{ a: 1 } });
    // With maxDepth 0, nested should become truncated marker
    const json = JSON.stringify(e);
    expect(json).toMatch(/"nested":"\[Truncated]/);
    const info = logger.info('should drop');
    expect(info).toBeNull();
    const err = logger.error('should pass');
    expect(err).not.toBeNull();
  });
  
  test('shutdownTelemetry global timeout aborts while drains still pending', async () => {
    // Ensure clean state so pending sets start empty
    _resetEventsForTests();
    _resetLoggerForTests();
    // Force verbose logging so info passes level check
    configureLogger({ level: 'debug' });
    // Add hanging transports so drains would exceed timeout
    events.addTransport(()=> new Promise(()=>{/* never resolves */}));
    logging.addLogTransport(()=> new Promise(()=>{/* never resolves */}));
    // Emit at least one event and log to create pending promises
    emit('session.issued', { userId:'u', orgId:'o' });
    logger.info('pending');
    const res = await shutdownTelemetry({ timeoutMs: 40 });
    // With hanging transports and shorter timeout we expect failure
    expect(res.success).toBe(false);
    expect(res.eventsDrained === false || res.logsDrained === false).toBe(true);
  });
});
