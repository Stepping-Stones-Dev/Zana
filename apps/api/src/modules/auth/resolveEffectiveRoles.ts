import type { PrismaClient } from '@prisma/client';
import type { UserRole } from '@zana/shared';

import { expandImpliedRoles, isUserRole } from '../../policies/rbac';

export type ResolveEffectiveRolesInput = {
  tenantId: string;
  userId: string;
  email?: string;
};

/**
 * Computes the effective roles for a user inside a tenant.
 *
 * This is intentionally isolated from HTTP so it can be reused by:
 * - auth preHandlers (RequireRoles)
 * - /auth/me
 * - background jobs (later)
 */
export async function resolveEffectiveRoles(
  prisma: PrismaClient,
  input: ResolveEffectiveRolesInput,
): Promise<UserRole[]> {
  const dbUser = await prisma.user.findFirst({
    where: { id: input.userId, tenantId: input.tenantId },
    select: { role: true, roleAssignments: { select: { role: true } } },
  });

  if (!dbUser) return [];

  const baseRoles: UserRole[] = [dbUser.role, ...dbUser.roleAssignments.map((ra) => ra.role)].filter(
    (r): r is UserRole => isUserRole(r),
  );

  let roles = expandImpliedRoles(Array.from(new Set(baseRoles)));
  if (roles.includes('OWNER')) return roles;

  // Derived permissions: if a user is assigned as a stream class teacher or head class teacher,
  // treat them as CLASS_TEACHER even if their base role is TEACHER.
  if (!roles.includes('CLASS_TEACHER')) {
    const email = input.email?.toLowerCase();
    const teacher = await prisma.teacher.findFirst({
      where: {
        tenantId: input.tenantId,
        OR: [{ userId: input.userId }, ...(email ? [{ email }] : [])],
      },
      select: { id: true },
    });

    if (teacher) {
      const assigned = await prisma.stream.findFirst({
        where: {
          tenantId: input.tenantId,
          OR: [{ classTeacherId: teacher.id }, { class: { headTeacherId: teacher.id } }],
        },
        select: { id: true },
      });

      if (assigned) {
        roles = expandImpliedRoles(Array.from(new Set([...roles, 'CLASS_TEACHER'])));
      }
    }
  }

  return roles;
}
