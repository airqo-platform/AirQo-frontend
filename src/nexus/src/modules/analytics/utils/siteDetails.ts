import type { RecentReading } from '@/shared/types/api';

/**
 * Shared helpers for the location detail page (site name resolution,
 * freshness formatting, pollutant extraction) so every card on the page
 * resolves the same values from the same reading.
 */

/** Resolve a display name from site details using the standard fallback
 *  chain: search_name → name → location_name → formatted_name. */
export const resolveReadingSiteName = (
  reading: RecentReading | null | undefined
): string | undefined => {
  const details = reading?.siteDetails;
  return (
    details?.search_name?.trim() ||
    details?.name?.trim() ||
    details?.location_name?.trim() ||
    details?.formatted_name?.trim() ||
    undefined
  );
};

/**
 * Normalizes a display name into a URL-safe slug (diacritics folded,
 * non-alphanumerics collapsed to dashes). The detail-page route
 * (`analytics/sites/[siteSlug]`) uses this so the raw site id never leaks
 * into the URL.
 */
export const normalizeSiteNameForSlug = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** URL-safe slug for a site's display name (search_name || location_name). */
export const toSiteSlug = (name: string): string =>
  normalizeSiteNameForSlug(name) || 'location';

/** Case/separator-insensitive comparison between a slug and a display name. */
export const siteSlugMatches = (slug: string, name: string): boolean =>
  normalizeSiteNameForSlug(name) === slug;

/** Pollutant value extraction (both pollutant keys carry `{ value }`). */
export const getReadingPollutantValue = (
  reading: RecentReading | null | undefined,
  pollutant: 'pm2_5' | 'pm10'
): number | null => {
  if (!reading) return null;
  const value = reading[pollutant]?.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

/** "Updated 5 minutes ago" style freshness label for a reading timestamp. */
export const formatReadingFreshness = (
  time: string | undefined | null
): string => {
  if (!time) return '';
  const parsed = new Date(time);
  if (Number.isNaN(parsed.getTime())) return '';

  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 0) return 'Updated just now';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
};

/** Compact timestamp for tooltips / captions, e.g. "Aug 14, 06:00". */
export const formatReadingTime = (
  time: string | undefined | null
): string => {
  if (!time) return '';
  const parsed = new Date(time);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
