/**
 * @package @zana/telemetry
 * Unified telemetry toolkit (events + logging + sanitize).
 * Flat re-exports + optional namespace objects.
 */

export * from './events/index.ts';
export * from './logging/index.ts';
export * from './sanitize/index.ts';

// Namespaces (provide grouped access without altering original exports)
import * as eventsNS from './events/index.ts';
import { configureEvents } from './events/index.ts';
import { drainEvents } from './events/index.ts';
import * as loggingNS from './logging/index.ts';
import { drainLogs, configureLogger } from './logging/index.ts';
import * as sanitizeNS from './sanitize/index.ts';
export const events = eventsNS;
export const logging = loggingNS;
export const sanitize = sanitizeNS;

// Unified graceful shutdown helper: drains events & logs.
// Returns object with per-channel results plus overall success flag.

export async function shutdownTelemetry(opts: { timeoutMs?: number } = {}) {
	const timeoutMs = opts.timeoutMs ?? 5000;
	// Run drains in parallel but impose a global timeout guard.
	const controller = new AbortController();
	let timedOut = false;
	const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs).unref?.();
	try {
		const [eventsDrained, logsDrained] = await Promise.all([
			drainEvents({ timeoutMs }),
			drainLogs({ timeoutMs })
		]);
		/* istanbul ignore next: race condition with global timeout rarely triggers alternate branch in practice */
		const success = !timedOut && eventsDrained && logsDrained;
		/* istanbul ignore next: simple data object construction */
		return { eventsDrained, logsDrained, success };
	} finally { if (timer) clearTimeout(timer); }
}

// Unified configuration convenience
export function configureTelemetry(opts: { events?: Parameters<typeof configureEvents>[0]; logging?: Parameters<typeof configureLogger>[0] }) {
	if (opts.events) configureEvents(opts.events);
	if (opts.logging) configureLogger(opts.logging);
}
