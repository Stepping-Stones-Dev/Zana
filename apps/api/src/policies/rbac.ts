import { UserRoleSchema, type UserRole } from '@zana/shared';

export type { UserRole } from '@zana/shared';

export function isUserRole(value: unknown): value is UserRole {
  return UserRoleSchema.safeParse(value).success;
}

/**
 * Expands roles that imply other roles.
 *
 * Notes:
 * - This is a convenience layer for authorization checks.
 * - Row-level access is still enforced by relationship scoping in each handler.
 */
export function expandImpliedRoles(roles: readonly UserRole[]): UserRole[] {
  const set = new Set<UserRole>(roles);

  if (set.has('OWNER')) {
    return UserRoleSchema.options;
  }

  // ADMIN can generally do everything STAFF can.
  if (set.has('ADMIN')) set.add('STAFF');

  // These roles operate as teachers (at least within their scope).
  if (set.has('HEAD_TEACHER')) set.add('TEACHER');
  if (set.has('DEPARTMENT_HEAD')) set.add('TEACHER');
  if (set.has('CLASS_TEACHER')) set.add('TEACHER');

  return Array.from(set);
}

export function normalizeAllowedRoles(roles: readonly UserRole[]): ReadonlySet<UserRole> {
  return new Set(roles);
}
