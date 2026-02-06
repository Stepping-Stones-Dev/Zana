import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';

import type { FastifyInstance, FastifyPluginAsync, preHandlerAsyncHookHandler } from 'fastify';

import { prisma } from './db';

import { normalizeAllowedRoles, type UserRole } from './policies/rbac';
import { resolveEffectiveRoles } from './modules/auth/resolveEffectiveRoles';

const plugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  const secret = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me';

  await app.register(jwt, {
    secret,
  });

  app.decorate('authenticate', (async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
  }) satisfies preHandlerAsyncHookHandler);

  app.decorate('requireRole', (roles: readonly UserRole[]) => {
    const allowed = normalizeAllowedRoles(roles);

    const handler: preHandlerAsyncHookHandler = async (req, reply) => {
      // authenticate() already responds; but requireRole can be used standalone.
      await app.authenticate(req, reply);
      if (reply.sent) return;

      const tenantId = (req.user as { tenantId?: unknown } | undefined)?.tenantId;
      const sub = (req.user as { sub?: unknown } | undefined)?.sub;
      if (typeof tenantId !== 'string' || typeof sub !== 'string') {
        return reply.code(403).send({ message: 'Forbidden' });
      }

      const dbUser = await prisma.user.findFirst({
        where: { id: sub, tenantId },
        select: { role: true, roleAssignments: { select: { role: true } } },
      });
      if (!dbUser) return reply.code(403).send({ message: 'Forbidden' });

      const email = (req.user as { email?: unknown } | undefined)?.email;
      const userRoles = await resolveEffectiveRoles(prisma, {
        tenantId,
        userId: sub,
        ...(typeof email === 'string' ? { email } : {}),
      });

      if (userRoles.includes('OWNER')) return;

      const ok = userRoles.some((r: UserRole) => allowed.has(r));
      if (!ok) return reply.code(403).send({ message: 'Forbidden' });
    };

    return handler;
  });
};

export const authPlugin = fp(plugin, {
  name: 'zana-auth',
});
