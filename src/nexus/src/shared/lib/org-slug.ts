import type { NormalizedGroup } from '@/shared/utils/userUtils';

/**
 * Convert a group title to an org slug using the same rule Vertex uses
 * for fallback link generation: trim, lowercase, replace runs of
 * whitespace / underscores with a single hyphen.
 */
export function titleToOrgSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');
}

/**
 * Find the group matching a URL org-path slug.
 *
 * Resolution order:
 *  1. Exact match on `organizationSlug` (both sides trimmed & lowercased).
 *  2. Fallback: convert each group's title via `titleToOrgSlug` and compare.
 *
 * Returns `null` when no group matches.
 */
export function findGroupByOrgPathSlug(
  groups: NormalizedGroup[],
  slug: string | null | undefined
): NormalizedGroup | null {
  if (!slug) return null;

  const normalisedSlug = slug.trim().toLowerCase();
  if (!normalisedSlug) return null;

  // 1. Exact match on organizationSlug (fast path). Both sides are trimmed
  //    and lowercased — stored slugs may carry stray whitespace or casing.
  const exactMatch = groups.find(
    g =>
      !!g.organizationSlug &&
      g.organizationSlug.trim().toLowerCase() === normalisedSlug
  );
  if (exactMatch) return exactMatch;

  // 2. Title-derived fallback.
  const fallbackMatch = groups.find(g => {
    if (!g.title) return false;
    return titleToOrgSlug(g.title) === normalisedSlug;
  });

  return fallbackMatch ?? null;
}

/**
 * The slug that canonically represents a group in `/org/` URLs: the stored
 * `organizationSlug` when non-empty, otherwise the title-derived slug.
 *
 * Groups can carry an empty `organizationSlug` (title-only groups), and URL
 * construction must never emit `/org//...`, so every org-path comparison and
 * redirect builds on this derived value instead of the raw stored field.
 */
export function effectiveOrgSlug(group: NormalizedGroup): string {
  return group.organizationSlug?.trim() || titleToOrgSlug(group.title || '');
}

/**
 * Canonical `/org/<slug>/data-export` path for a group, or `null` when the
 * group has neither an `organizationSlug` nor a usable title — callers must
 * skip the redirect rather than emit `/org//data-export`.
 */
export function buildOrgDataExportPath(group: NormalizedGroup): string | null {
  const slug = effectiveOrgSlug(group);
  return slug ? `/org/${slug}/data-export` : null;
}
