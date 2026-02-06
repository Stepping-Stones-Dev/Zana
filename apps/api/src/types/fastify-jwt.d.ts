import type { UserRole } from '@zana/shared';
import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      role: UserRole;
      roles: UserRole[];
      tenantId: string;
      tenantSlug: string;
    };
    user: {
      sub: string;
      email: string;
      role: UserRole;
      roles: UserRole[];
      tenantId: string;
      tenantSlug: string;
    };
  }
}
