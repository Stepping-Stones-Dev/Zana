import type { FastifyPluginAsync } from 'fastify';

import { prisma } from '../../db';
import type { MeResponse } from '../../contracts/auth';
import { resolveEffectiveRoles } from '../../modules/auth/resolveEffectiveRoles';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.get('/auth/me', { preHandler: app.authenticate }, async (req): Promise<MeResponse> => {
    const { sub, email, role, tenantId, tenantSlug } = req.user;

    const roles = await resolveEffectiveRoles(prisma, {
      tenantId,
      userId: sub,
      email,
    });

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, slug: tenantSlug },
      select: { id: true, name: true, slug: true },
    });

    return {
      user: {
        sub,
        email,
        role,
        roles,
        tenantId,
        tenantSlug,
      },
      tenant,
    };
  });
};
