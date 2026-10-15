/**
 * Group utility functions
 * Helpers for checking group types and properties
 */

interface GroupLike {
  title?: string;
  organizationSlug?: string;
}

interface GroupIdentity {
  id?: string;
  organizationSlug?: string;
}

/**
 * Identity check for two groups. Matches by id when both ids are present and
 * equal. When ids are present but unequal, or either side lacks an id, falls
 * back to case-insensitive trimmed organizationSlug equality (slugs are the
 * canonical handle — the same org can appear under different id docs in the
 * membership list vs the discover endpoint). Returns false when neither
 * identifier is usable on both sides.
 */
export function isSameGroup(
  a: GroupIdentity | null | undefined,
  b: GroupIdentity | null | undefined
): boolean {
  if (!a || !b) return false;

  const aId = typeof a.id === 'string' ? a.id.trim() : '';
  const bId = typeof b.id === 'string' ? b.id.trim() : '';

  if (aId && bId && aId === bId) {
    return true;
  }

  const aSlug = (a.organizationSlug || '').trim().toLowerCase();
  const bSlug = (b.organizationSlug || '').trim().toLowerCase();

  return aSlug !== '' && bSlug !== '' && aSlug === bSlug;
}

/**
 * Merges the user's organization memberships with discoverable organizations
 * into a single list. Memberships come first (deduped, original order kept),
 * followed by discovered organizations that are not already memberships
 * (deduped). `isMember` reflects which side the entry came from, so consumers
 * can gate the request-access action to non-members only.
 */
export function mergeOrganizationOptions<
  T extends GroupIdentity
>(memberships: T[] | null | undefined, discovered: T[] | null | undefined): Array<{
  group: T;
  isMember: boolean;
}> {
  const result: Array<{ group: T; isMember: boolean }> = [];
  const pushUnique = (group: T, isMember: boolean) => {
    const isDuplicate = result.some(entry => isSameGroup(entry.group, group));
    if (!isDuplicate) {
      result.push({ group, isMember });
    }
  };

  if (Array.isArray(memberships)) {
    for (const group of memberships) {
      if (group) {
        pushUnique(group, true);
      }
    }
  }

  if (Array.isArray(discovered)) {
    for (const group of discovered) {
      if (group) {
        pushUnique(group, false);
      }
    }
  }

  return result;
}

/**
 * Checks if a group is the default AirQo organization
 * @param group - The group object to check
 * @returns true if it's the default AirQo group, false otherwise
 */
export function isDefaultAirQoGroup(
  group: GroupLike | null | undefined
): boolean {
  if (!group) return true; // Treat null/undefined as default AirQo group

  return (
    group.title?.toLowerCase() === 'airqo' ||
    group.organizationSlug?.toLowerCase() === 'airqo' ||
    !group.organizationSlug
  );
}

/**
 * Checks if currently in an organization context (not the default AirQo group)
 * @param group - The group object to check
 * @returns true if in an organization context, false if in default AirQo context
 */
export function isInOrganizationContext(
  group: GroupLike | null | undefined
): boolean {
  return !isDefaultAirQoGroup(group);
}
