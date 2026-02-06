import type { UserRole } from '@zana/shared';

export type MeResponse = {
  user: {
    sub: string;
    email: string;
    role: UserRole;
    roles: UserRole[];
    tenantId: string;
    tenantSlug: string;
  };
  tenant: { id: string; name: string; slug: string } | null;
};
