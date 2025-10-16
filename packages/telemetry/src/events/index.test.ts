/// <reference types="jest" />
/* eslint-env jest */
// @jest-environment node
import {
    emit,
    addTransport,
    removeTransport,
    clearTransports,
    listRegisteredTransports,
    configureEvents,
    registerEventDefinition,
    setEventSampling,
    getEventsConfig,
    _resetEventsForTests,
    getEventsMetricsRegistry,
    getPendingEventTransportsCount,
    drainEvents,
    serializeEvent,
    listEventDefinitions
} from './index.ts';

describe('emit structure', () => {
    it('emits a structured session.issued event with expected shape', () => {
        const captured: any[] = [];
        const transport = (evt: any) => {
            captured.push(evt);
        };
        addTransport(transport);
        const result = emit(
            'session.issued',
            { userId: 'u1', orgId: 'o1' },
            { correlationId: 'cid123', level: 'info' }
        );

        expect(result).toMatchObject({
            event: 'session.issued',
            payload: { userId: 'u1', orgId: 'o1' },
            correlationId: 'cid123',
            level: 'info'
        });
        expect(typeof result.timestamp).toBe('string');
        expect(result.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);

        expect(captured.length).toBe(1);
        const transported = captured[0];
        expect(transported).toMatchObject({
            event: 'session.issued',
            payload: { userId: 'u1', orgId: 'o1' },
            correlationId: 'cid123',
            level: 'info'
        });
        expect(transported.timestamp).toBe(result.timestamp);

        const allowedKeys = ['event', 'payload', 'timestamp', 'correlationId', 'level'];
        expect(Object.keys(result).sort()).toEqual(allowedKeys.sort());

        expect(listRegisteredTransports().length).toBeGreaterThan(0);
    });
});

describe('event configuration behaviors: validation warning, redaction patterns, and sampling logic', () => {
    beforeEach(() => {
        _resetEventsForTests();
    });

    test('samplingPerEvent map population path & warn on schema parse', () => {
        configureEvents({ validationMode: 'warn', samplingPerEvent: { 'session.issued': 1 } });
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        emit('rate.limit.exceeded', { bogus: true } as any);
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    test('multiple redact patterns applied sequentially', () => {
        configureEvents({ addRedactPatterns: [/fooBAR/i, 'bazToken'] });
        const payload = { userId: 'u', orgId: 'o', note: 'xx foobar and BAZTOKEN present' } as any;
        const evt = emit('session.issued', payload);
        const json = JSON.stringify(evt);
        expect(json).not.toMatch(/foobar|BAZTOKEN/i);
        expect(json).toMatch(/REDACTED/);
    });

    test('samplingPerEvent specific probability mid-range & boundary', () => {
        configureEvents({ samplingDefault: 1 });
        setEventSampling('session.issued', 0.3);
        const rand = jest.spyOn(Math, 'random').mockReturnValue(0.5);
        emit('session.issued', { userId: 'u', orgId: 'o' });
        rand.mockReturnValue(0.1);
        emit('session.issued', { userId: 'u2', orgId: 'o2' });
        rand.mockRestore();
    });
});

describe('events system features: correlation, sampling, redaction, validation, transports, metrics', () => {
    beforeEach(() => {
        _resetEventsForTests();
    });

    test('correlation provider supplies id when not overridden', () => {
        configureEvents({ correlationProvider: () => ({ correlationId: 'prov-abc' }) });
        const e = emit('session.issued', { userId: 'u1', orgId: 'o1' });
        expect(e.correlationId).toBe('prov-abc');
    });

    test('explicit correlation overrides provider', () => {
        configureEvents({ correlationProvider: () => ({ correlationId: 'prov-abc' }) });
        const e = emit(
            'session.issued',
            { userId: 'u1', orgId: 'o1' },
            { correlationId: 'explicit' }
        );
        expect(e.correlationId).toBe('explicit');
    });

    test('sampling drops events when probability 0', () => {
        setEventSampling('session.issued', 0);
        const t: any[] = [];
        addTransport(evt => {
            t.push(evt);
        });
        emit('session.issued', { userId: 'u', orgId: 'o' });
        expect(t.length).toBe(0);
    });

    test('sampling passes when probability 1', () => {
        setEventSampling('session.issued', 1);
        const t: any[] = [];
        addTransport(evt => {
            t.push(evt);
        });
        emit('session.issued', { userId: 'u', orgId: 'o' });
        expect(t.length).toBe(1);
    });

    test('redaction global + per-definition keys & patterns', () => {
        registerEventDefinition({
            name: 'session.issued',
            redactKeys: ['customSecret'],
            redactPatterns: ['SensitiveXYZ']
        });
        configureEvents({
            addRedactKeys: ['mytoken'],
            addRedactPatterns: [/secret-value/i]
        });
        const ev = emit('session.issued', {
            userId: 'u',
            orgId: 'o',
            password: 'p',
            customSecret: 'abc',
            deep: { myToken: 'zzz' },
            note: 'Contains SensitiveXYZ and secret-value'
        });
        const json = JSON.stringify(ev);
        expect(json).toMatch(/\*\*\*REDACTED\*\*\*/);
        expect(json).not.toMatch(/abc|zzz|SensitiveXYZ|secret-value/);
    });

    test('removeTransport removes only specified transport', () => {
        const a: any[] = [];
        const b: any[] = [];
        const ta = (e: any) => {
            a.push(e);
        };
        const tb = (e: any) => {
            b.push(e);
        };
        addTransport(ta);
        addTransport(tb);
        removeTransport(ta);
        emit('session.issued', { userId: 'u', orgId: 'o' });
        expect(a.length).toBe(0);
        expect(b.length).toBe(1);
    });

    test('clearTransports empties list', () => {
        addTransport(() => {});
        expect(listRegisteredTransports().length).toBeGreaterThan(0);
        clearTransports();
        expect(listRegisteredTransports().length).toBe(0);
    });

    test('circular payload redaction safe', () => {
        const c: any = { token: 'abc' };
        c.self = c;
        configureEvents({ addRedactKeys: ['token'] });
        const e = emit('session.issued', { userId: 'u', orgId: 'o', c });
        const json = JSON.stringify(e);
        expect(json).toMatch(/\[Circular]/);
        expect(json).not.toMatch(/abc/);
    });

    test('getEventsConfig exposes live config', () => {
        const cfg = getEventsConfig();
        expect(typeof cfg.samplingDefault).toBe('number');
    });

    test('sampling mid probability allow & drop', () => {
        configureEvents({ samplingDefault: 0.5 });
        const t: any[] = [];
        clearTransports();
        addTransport(e => {
            t.push(e);
        });
        const rand = jest.spyOn(Math, 'random').mockReturnValue(0.4);
        emit('session.issued', { userId: 'u', orgId: 'o1' });
        rand.mockReturnValue(0.9);
        emit('session.issued', { userId: 'u', orgId: 'o2' });
        rand.mockRestore();
        expect(t.length).toBe(1);
    });

    test('event-level sampling override', () => {
        configureEvents({ samplingDefault: 1 });
        setEventSampling('session.issued', 0);
        const t: any[] = [];
        clearTransports();
        addTransport(e => {
            t.push(e);
        });
        emit('session.issued', { userId: 'u', orgId: 'o' });
        expect(t.length).toBe(0);
    });

    test('duplicate transport only once', () => {
        const capture: any[] = [];
        const tx = (e: any) => {
            capture.push(e);
        };
        clearTransports();
        addTransport(tx);
        addTransport(tx);
        emit('session.issued', { userId: 'u', orgId: 'o' });
        expect(capture.length).toBe(1);
    });

    test('array payload redaction nested elements', () => {
        configureEvents({ addRedactKeys: ['secret'] });
        const t: any[] = [];
        clearTransports();
        addTransport(e => {
            t.push(e);
        });
        emit('session.issued', {
            userId: 'u',
            orgId: 'o',
            list: [{ token: 'abc', nested: { secret: 'sauce' } }, 'Bearer value123']
        });
        const json = JSON.stringify(t[0]);
        expect(json).not.toMatch(/abc|sauce|value123/);
    });

    test('dispatch swallow errors', () => {
        clearTransports();
        const ok: any[] = [];
        addTransport(() => {
            throw new Error('boom');
        });
        addTransport(e => {
            ok.push(e);
        });
        expect(() => emit('session.issued', { userId: 'u', orgId: 'o' })).not.toThrow();
        expect(ok.length).toBe(1);
    });

    test('listEventDefinitions includes registered', () => {
        registerEventDefinition({ name: 'session.issued' });
        const list = listEventDefinitions();
        expect(list.find((d: any) => d.name === 'session.issued')).toBeTruthy();
    });

    test('sampling probability >=1 dispatch', () => {
        configureEvents({ samplingDefault: 1 });
        clearTransports();
        const t: any[] = [];
        addTransport(e => {
            t.push(e);
        });
        emit('session.issued', { userId: 'u', orgId: 'o' });
        expect(t.length).toBe(1);
    });

    test('metrics counters emitted/invalid/sampled + serialize', async () => {
        const reg = getEventsMetricsRegistry();
        configureEvents({ samplingDefault: 0 });
        emit('rate.limit.exceeded', { bogus: true } as any);
        emit('rate.limit.exceeded', {
            keyHash: 'abc',
            endpoint: '/x',
            windowSeconds: 60,
            allowed: 10,
            blocked: 11
        });
        setEventSampling('session.issued', 1);
        emit('session.issued', { userId: 'u1', orgId: 'o1' });
        const ev = emit('session.issued', { userId: 'u2', orgId: 'o2' });
        const json = serializeEvent(ev as any);
        expect(json).toMatch(/"event":"session.issued"/);
        const m = await reg.metrics();
        expect(m).toMatch(/events_emitted_total/);
    });

    describe('onTransportError hook, drainEvents, expanded redaction patterns', () => {
        beforeEach(() => {
            _resetEventsForTests();
        });

        test('onTransportError invoked when transport throws sync', () => {
            const errs: any[] = [];
            configureEvents({ onTransportError: (err, evt, idx) => { errs.push({ err, evt, idx }); } });
            addTransport(() => {
                throw new Error('boom-sync');
            });
            emit('session.issued', { userId: 'u', orgId: 'o' });
            expect(errs.length).toBe(1);
            expect(errs[0].err).toBeInstanceOf(Error);
        });

        test('onTransportError invoked when async transport rejects', async () => {
            const errs: any[] = [];
            configureEvents({ onTransportError: err => { errs.push(err); } });
            addTransport(async () => {
                throw new Error('boom-async');
            });
            emit('session.issued', { userId: 'u', orgId: 'o' });
            await new Promise(r => setTimeout(r, 10));
            expect(errs.length).toBe(1);
        });

        test('drainEvents resolves true when pending async transports settle', async () => {
            _resetEventsForTests();
            const done: string[] = [];
            addTransport(async () => {
                await new Promise(r => setTimeout(r, 20));
                done.push('a');
            });
            addTransport(async () => {
                await new Promise(r => setTimeout(r, 5));
                done.push('b');
            });
            emit('session.issued', { userId: 'u', orgId: 'o' });
            const drained = await drainEvents({ timeoutMs: 200 });
            expect(drained).toBe(true);
            expect(done.sort()).toEqual(['a', 'b']);
        });

        test('drainEvents times out with false when transports exceed timeout', async () => {
            _resetEventsForTests();
            addTransport(async () => {
                await new Promise(r => setTimeout(r, 60));
            });
            emit('session.issued', { userId: 'u', orgId: 'o' });
            const drained = await drainEvents({ timeoutMs: 25 });
            expect(drained).toBe(false);
        });

        test('default patterns redact JWT and UUID', () => {
            const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.def';
            const uuid = '123e4567-e89b-12d3-a456-426614174000';
            const e = emit('session.issued', { userId: 'u', orgId: 'o', jwt, uuid });
            const json = JSON.stringify(e);
            expect(json).not.toMatch(jwt);
            expect(json).not.toMatch(uuid);
            expect(json).toMatch(/REDACTED/);
        });

        test('getPendingEventTransportsCount reflects resolving async transports', async () => {
            _resetEventsForTests();
            const done: string[] = [];
            addTransport(async () => {
                await new Promise(r => setTimeout(r, 15));
                done.push('x');
            });
            emit('session.issued', { userId: 'u', orgId: 'o' });
            expect(getPendingEventTransportsCount()).toBeGreaterThanOrEqual(1);
            const drained = await drainEvents({ timeoutMs: 200 });
            expect(drained).toBe(true);
            expect(done.length).toBe(1);
            expect(getPendingEventTransportsCount()).toBe(0);
        });

        test('getPendingEventTransportsCount with hanging transport after timeout', async () => {
            _resetEventsForTests();
            addTransport(() => new Promise(() => {}));
            emit('session.issued', { userId: 'u', orgId: 'o' });
            expect(getPendingEventTransportsCount()).toBe(1);
            const drained = await drainEvents({ timeoutMs: 40 });
            expect(drained).toBe(false);
            expect(getPendingEventTransportsCount()).toBe(1);
        });

        test('drainEvents default invocation with no args returns true quickly', async () => {
            _resetEventsForTests();
            const start = Date.now();
            const drained = await drainEvents();
            const elapsed = Date.now() - start;
            expect(drained).toBe(true);
            expect(elapsed).toBeLessThan(25);
        });
    });
});

describe('sanitizePayload object key iteration (redacted + non‑redacted branches)', () => {
    beforeEach(() => {
        _resetEventsForTests();
    });

    test('redacts configured sensitive keys while leaving other keys intact (mixed object)', () => {
        configureEvents({});
        const evt = emit('session.issued', {
            password: 'superSecret',
            userId: 'uX',
            orgId: 'oX',
            nested: { token: 'abc', keep: 'val' }
        });
        const json = JSON.stringify(evt);
        expect(json).toMatch(/"password":"\*\*\*REDACTED\*\*\*"/);
        expect(json).toMatch(/"token":"\*\*\*REDACTED\*\*\*"/);
        expect(json).toMatch(/"userId":"uX"/);
        expect(json).toMatch(/"orgId":"oX"/);
        expect(json).toMatch(/"keep":"val"/);
    });

    test('skips redaction path when no sensitive keys are present (all assignments)', () => {
        const evt = emit('session.issued', { userId: 'uY', orgId: 'oY', info: 'plainText' });
        const json = JSON.stringify(evt);
        expect(json).toMatch(/"info":"plainText"/);
        expect(json).not.toMatch(/REDACTED/);
    });
});

describe('schema validation throw mode', () => {
    beforeEach(() => {
        _resetEventsForTests();
    });
    test('throws on invalid payload when validationMode=throw (schema parse)', () => {
        configureEvents({ validationMode: 'throw' });
        expect(() => emit('rate.limit.exceeded', { keyHash: 123 } as any)).toThrow();
    });
});

describe('dev console branch production mode', () => {
    const ORIGINAL_ENV = process.env.NODE_ENV;
    beforeAll(() => {
        process.env.NODE_ENV = 'production';
    });
    afterAll(() => {
        process.env.NODE_ENV = ORIGINAL_ENV;
    });
    test('importing events in production does not throw', () => {
        const key = require.resolve('./index.ts');
        delete require.cache[key];
        expect(() => {
            require('./index.ts');
        }).not.toThrow();
    });
});

describe('primitive sanitize & drainEvents secondary timeout branch', () => {
    beforeEach(() => {
        _resetEventsForTests();
    });

    test('primitive string payload early-return when no patterns configured', () => {
        configureEvents({ addRedactPatterns: [] });
        registerEventDefinition({ name: 'session.issued' });
        getEventsConfig().redactPatterns.length = 0;
        const evt = emit('session.issued', 'SimpleStringPayload' as any);
        expect((evt as any).payload).toBe('SimpleStringPayload');
    });

    test('primitive string payload triggers rebuild when cache key empty', () => {
        configureEvents({ maxDepth: 3 });
        const evt = emit('session.issued', 'Bearer abc123token' as any);
        const payload = (evt as any).payload;
        expect(typeof payload).toBe('string');
        expect(payload).toMatch(/abc123token/);
    });

    test('primitive string payload with patterns triggers redactor path', () => {
        configureEvents({ addRedactPatterns: [/secretword/i] });
        const evt = emit('session.issued', 'Contains SecretWord inside' as any);
        const payload = (evt as any).payload;
        expect(typeof payload).toBe('string');
        expect(payload).not.toMatch(/SecretWord/i);
    });

    test('drainEvents secondary timeout branch (elapsed check after non-timeout race)', async () => {
        addTransport(() => new Promise(() => {}));
        emit('session.issued', { userId: 'u', orgId: 'o' });
        const realNow = Date.now;
        let base = realNow();
        const spy = jest.spyOn(Date, 'now').mockImplementation(() => base);
        const p = drainEvents({ timeoutMs: 40 });
        await new Promise(r => setTimeout(r, 30));
        base += 30;
        await new Promise(r => setTimeout(r, 30));
        base += 20;
        const res = await p;
        expect(res).toBe(false);
        spy.mockRestore();
    });

    test('redactor cache rebuild and derived redactor creation branches', () => {
        _resetEventsForTests();
        registerEventDefinition({
            name: 'session.issued',
            redactKeys: ['SpecialKey'],
            redactPatterns: ['SensitiveADD']
        });
        configureEvents({ addRedactKeys: ['AnotherKey'], addRedactPatterns: [/SecretPlus/i] });
        const first = emit(
            'session.issued',
            {
                userId: 'u',
                orgId: 'o',
                specialKey: 'v1',
                anotherKey: 'v2',
                note: 'SensitiveADD and SecretPlus tokens'
            } as any
        );
        const json1 = JSON.stringify(first);
        expect(json1).not.toMatch(/v1|v2|SensitiveADD|SecretPlus/i);
        const second = emit(
            'session.issued',
            {
                userId: 'u2',
                orgId: 'o2',
                specialKey: 'v3',
                anotherKey: 'v4',
                note: 'SensitiveADD SecretPlus'
            } as any
        );
        const json2 = JSON.stringify(second);
        expect(json2).not.toMatch(/v3|v4/);
    });

    test('definition-level patterns mapping covers string and regex branches', () => {
        _resetEventsForTests();
        registerEventDefinition({
            name: 'session.issued',
            redactKeys: ['CustomSecret', 'AnotherToken'],
            redactPatterns: ['SensitiveValue', /fooBAR/i]
        });
        const evt = emit('session.issued', {
            userId: 'u',
            orgId: 'o',
            customSecret: 'alpha',
            anotherToken: 'beta',
            note: 'Contains FoObAr and SensitiveValue together'
        } as any);
        const json = JSON.stringify(evt);
        expect(json).not.toMatch(/alpha|beta/);
        expect(json).not.toMatch(/FoObAr/i);
        expect(json).not.toMatch(/SensitiveValue/);
    });

    test('definition-level patterns mapping regex-only branch', () => {
        _resetEventsForTests();
        registerEventDefinition({ name: 'session.issued', redactPatterns: [/OnlyRegex123/i] });
        const evt = emit('session.issued', {
            userId: 'u',
            orgId: 'o',
            tag: 'onlyregex123 present'
        } as any);
        const json = JSON.stringify(evt);
        expect(json).not.toMatch(/onlyregex123/i);
    });

    test('definition-level keys only (no patterns) still executes mapping over empty patterns array', () => {
        _resetEventsForTests();
        registerEventDefinition({ name: 'session.issued', redactKeys: ['SpecialOnlyKey'] });
        const evt = emit('session.issued', {
            userId: 'u',
            orgId: 'o',
            specialOnlyKey: 'secretish'
        } as any);
        const json = JSON.stringify(evt);
        expect(json).not.toMatch(/secretish/);
    });

    test('sanitizePayload early-return for null and undefined', () => {
        _resetEventsForTests();
        const { _sanitizePayloadForTests } = require('./index.ts');
        expect(_sanitizePayloadForTests(null)).toBeNull();
        expect(_sanitizePayloadForTests(undefined)).toBeUndefined();
    });
});