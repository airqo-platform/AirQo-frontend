import { isDefaultAirQoGroup } from '@/shared/utils/groupUtils';

/**
 * Pure helpers for System → Organizations detail.
 *
 * Kept free of React/SDK imports so they can be unit-tested directly and
 * reused by the detail page and its dialogs.
 */

/** Minimal shape needed to recognise the protected default organization. */
interface ProtectedOrganizationLike {
  grp_title?: string;
  organization_slug?: string | null;
}

/**
 * True for the default AirQo organization: title/slug equal to `airqo`
 * (case-insensitive) or a group with no slug at all.
 *
 * `isDefaultAirQoGroup` treats a missing group as the default (it guards
 * "which org is active" flows); here a missing group carries no identity, so
 * it is never reported as protected — callers only pass a loaded group.
 */
export const isProtectedOrganization = (
  group: ProtectedOrganizationLike | null | undefined
): boolean => {
  if (!group) return false;

  return isDefaultAirQoGroup({
    title: group.grp_title,
    organizationSlug: group.organization_slug ?? undefined,
  });
};

/**
 * Selection ids that may actually be unassigned: the organization manager is
 * filtered out (removing the manager from the group is not allowed) and
 * duplicates are dropped. Ids are normalized to strings because the unassign
 * endpoint takes `user_ids: string[]`. Nullable entries are tolerated and
 * dropped at runtime — table selections can carry stray nulls.
 */
export const getRemovableMemberIds = (
  selectedIds:
    | ReadonlyArray<string | number | null | undefined>
    | null
    | undefined,
  managerId?: string | null
): string[] => {
  const managerKey = managerId ? String(managerId) : '';
  const seen = new Set<string>();
  const removable: string[] = [];

  for (const id of selectedIds ?? []) {
    if (id === null || id === undefined) continue;
    const key = String(id).trim();
    if (!key) continue;
    if (managerKey && key === managerKey) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    removable.push(key);
  }

  return removable;
};

/** Canonical route for the System → Organizations list page. */
export const ORGANIZATIONS_PATH = '/system/organizations';

/** Up to two uppercase initials for the organization avatar fallback. */
export const getOrganizationInitials = (title: string): string => {
  const words = (title ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return words
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
};
