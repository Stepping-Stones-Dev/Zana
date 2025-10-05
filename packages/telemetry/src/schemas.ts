/* istanbul ignore file -- declarative schema definitions */
import { z } from 'zod';

// Core event payload schemas (initial subset – extend incrementally)
export const EventSchemas = {
  'session.issued': z.object({
    userId: z.string().min(1),
    orgId: z.string().min(1),
    capFingerprint: z.string().optional()
  }).passthrough(),
  'rate.limit.exceeded': z.object({
    keyHash: z.string(),
    endpoint: z.string(),
    windowSeconds: z.number().int().positive(),
    allowed: z.number().int().nonnegative(),
    blocked: z.number().int().positive()
  }).passthrough(),
  'app.registry.updated': z.object({
    diffHash: z.string(),
    changed: z.number().int().nonnegative(),
  }).passthrough(),
  'log.transport.failure': z.object({
    message: z.string(),
    namespace: z.string().optional(),
  }).passthrough(),
  'log.escalated': z.object({
    level: z.enum(['warn','error']),
    namespace: z.string().optional(),
    message: z.string(),
    correlationId: z.string().optional(),
    errorCode: z.string().optional(),
  }).passthrough()
} as const;

export type ZanaEventName = keyof typeof EventSchemas;
export type EventPayloadMap = { [K in ZanaEventName]: z.infer<(typeof EventSchemas)[K]> };

export function listSchemaNames() { return Object.keys(EventSchemas) as ZanaEventName[]; }
