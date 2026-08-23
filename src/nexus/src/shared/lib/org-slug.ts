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

  // 1. Exact match on organizationSlug (fast path).
  const exactMatch = groups.find(
    g => g.organizationSlug && g.organizationSlug === normalisedSlug
  );
  if (exactMatch) return exactMatch;

  // 2. Title-derived fallback.
  const fallbackMatch = groups.find(g => {
    if (!g.title) return false;
    return titleToOrgSlug(g.title) === normalisedSlug;
  });

  return fallbackMatch ?? null;
}
