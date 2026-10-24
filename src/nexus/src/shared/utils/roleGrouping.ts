import type { User } from '@/shared/types/api';

/** One selectable group/organization bucket for the group-scoped role pickers. */
export interface RoleGroupOption {
  id: string;
  title: string;
  slug?: string;
  roleCount: number;
}

/**
 * Structural shape of a role as it arrives from the roles endpoints.
 *
 * Runtime payloads are looser than the `UserRoleSummary` type declares: roles
 * such as `ORG_SUPER_ADMIN` come back with no `group` at all, and group
 * documents may omit `organization_slug`. Keeping every group field optional
 * lets the pure helpers accept any of those shapes without casting.
 */
export interface RoleWithGroup {
  _id: string;
  role_name: string;
  role_status: string;
  role_description?: string;
  group?: {
    _id?: string;
    grp_title?: string;
    organization_slug?: string;
  } | null;
}

/**
 * One option per distinct group owning at least one role.
 *
 * Roles without a group id are skipped — they cannot be assigned through a
 * group-scoped picker — and the result is sorted by title.
 */
export function getRoleGroupOptions(
  roles: readonly RoleWithGroup[]
): RoleGroupOption[] {
  const optionsById = new Map<string, RoleGroupOption>();
  // Roles summary pages can overlap, so the same role id may arrive twice for
  // one group. Count each role id once per group so duplicates cannot inflate
  // `roleCount`.
  const countedRoleIdsByGroup = new Map<string, Set<string>>();

  for (const role of roles) {
    const groupId = role.group?._id;
    if (!groupId) continue;

    let countedIds = countedRoleIdsByGroup.get(groupId);
    if (!countedIds) {
      countedIds = new Set<string>();
      countedRoleIdsByGroup.set(groupId, countedIds);
    }
    if (countedIds.has(role._id)) continue;
    countedIds.add(role._id);

    const existing = optionsById.get(groupId);
    if (existing) {
      existing.roleCount += 1;
      continue;
    }

    optionsById.set(groupId, {
      id: groupId,
      title: role.group?.grp_title ?? '',
      slug: role.group?.organization_slug,
      roleCount: 1,
    });
  }

  return Array.from(optionsById.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

/**
 * The roles assignable inside one group, sorted by role name.
 * Returns a new array — `roles` itself is never mutated. Duplicated role ids
 * (overlapping summary pages) are collapsed to their first occurrence.
 */
export function getRolesForGroup<T extends RoleWithGroup>(
  roles: readonly T[],
  groupId: string
): T[] {
  if (!groupId) return [];
  const seenRoleIds = new Set<string>();
  return roles
    .filter(role => {
      if (role.group?._id !== groupId || seenRoleIds.has(role._id)) {
        return false;
      }
      seenRoleIds.add(role._id);
      return true;
    })
    .sort((a, b) => a.role_name.localeCompare(b.role_name));
}

/** The role name this user holds inside `groupId`, or null when there is none. */
export function getCurrentRoleNameForGroup(
  user: Pick<User, 'groups'> | null | undefined,
  groupId: string
): string | null {
  if (!groupId) return null;
  const membership = user?.groups?.find(group => group?._id === groupId);
  return membership?.role?.role_name ?? null;
}

/** Whether the user is a member of `groupId` at all. */
export function hasGroupMembership(
  user: Pick<User, 'groups'> | null | undefined,
  groupId: string
): boolean {
  if (!groupId) return false;
  return Boolean(user?.groups?.some(group => group?._id === groupId));
}

/**
 * Group preselected when the assignment dialog opens: the group of the user's
 * first role membership when that role is group-scoped, otherwise the first
 * available group. `roleId` is always empty so the admin picks the role
 * explicitly, and both ids are empty strings when nothing is available.
 */
export function resolveInitialRoleSelection(
  user: Pick<User, 'groups'> | null | undefined,
  roles: readonly RoleWithGroup[]
): { groupId: string; roleId: string } {
  const empty = { groupId: '', roleId: '' };

  const groupOptions = getRoleGroupOptions(roles);
  if (groupOptions.length === 0) return empty;

  const membership = user?.groups?.find(group => group?.role?._id);
  const membershipRoleId = membership?.role?._id;
  if (membershipRoleId) {
    const mappedGroupId = roles.find(
      role => role._id === membershipRoleId && role.group?._id
    )?.group?._id;
    if (mappedGroupId) return { groupId: mappedGroupId, roleId: '' };
  }

  return { groupId: groupOptions[0].id, roleId: '' };
}
