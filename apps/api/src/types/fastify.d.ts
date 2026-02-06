import type { preHandlerAsyncHookHandler } from 'fastify';
import 'fastify';
import type { UserRole } from '@zana/shared';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: preHandlerAsyncHookHandler;
    requireRole: (roles: readonly UserRole[]) => preHandlerAsyncHookHandler;
  }
}
