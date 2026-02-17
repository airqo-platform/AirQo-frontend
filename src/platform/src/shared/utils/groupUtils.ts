/**
 * Group utility functions
 * Helpers for checking group types and properties
 */

interface GroupLike {
  title?: string;
  organizationSlug?: string;
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
