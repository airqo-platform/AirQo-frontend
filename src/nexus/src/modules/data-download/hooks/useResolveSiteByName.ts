'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { deviceService } from '@/shared/services/deviceService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import { getSiteDisplayName, type RawSiteData } from '@/shared/utils/siteUtils';
import { toSiteSlug, siteSlugMatches } from '../utils/siteDetails';
import { fetchAllSitesSummary } from '@/shared/services/siteSummary';

const RESOLVE_STALE_TIME_MS = 1000 * 60 * 30;
const RESOLVE_GC_TIME_MS = 1000 * 60 * 60 * 12;
const RESOLVE_PAGE_SIZE = 80;

/** Shared react-query key with the analytics name fallback (30-min cache). */
const FLEET_SITES_QUERY_KEY = ['sites', 'site-names-fallback'] as const;
const FLEET_SITES_STALE_TIME_MS = 1000 * 60 * 30;

/**
 * LocalStorage index mapping a site's URL slug → its real data, written when
 * the user clicks a row in the explore table (the exact site id, name and
 * coordinates are already in hand). Direct links/bookmarks fall back to the
 * fleet summary.
 */
const SLUG_INDEX_STORAGE_KEY = 'nexus:site-slug-index';
const SLUG_INDEX_MAX_ENTRIES = 400;

export interface SiteSlugIndexEntry {
  siteId: string;
  displayName: string;
  latitude?: number | null;
  longitude?: number | null;
}

const readSlugIndex = (): Record<string, SiteSlugIndexEntry> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SLUG_INDEX_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SiteSlugIndexEntry>) : {};
  } catch {
    return {};
  }
};

/** Stores a slug → site mapping so detail-page navigation never re-resolves. */
export const rememberSiteSlug = (
  slug: string,
  entry: SiteSlugIndexEntry
): void => {
  if (typeof window === 'undefined' || !slug || !entry.siteId) return;
  try {
    const index = readSlugIndex();
    index[slug] = entry;
    const keys = Object.keys(index);
    if (keys.length > SLUG_INDEX_MAX_ENTRIES) {
      // Drop the oldest entries to keep the index small.
      keys
        .slice(0, keys.length - SLUG_INDEX_MAX_ENTRIES)
        .forEach(key => delete index[key]);
    }
    window.localStorage.setItem(SLUG_INDEX_STORAGE_KEY, JSON.stringify(index));
  } catch {
    // Storage unavailable/full — the mapping is best-effort.
  }
};

const asFiniteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/**
 * Coordinates the map should center on. Map nodes are rendered at the
 * site's APPROXIMATE coordinates (the map readings/locations use them), so
 * those are preferred — flying to the exact lat/lng can land the marker
 * hundreds of metres off-center.
 */
const extractCoordinates = (
  site: RawSiteData | undefined | null
): { latitude: number | null; longitude: number | null } => {
  if (!site) return { latitude: null, longitude: null };
  return {
    latitude:
      asFiniteNumber(site.approximate_latitude) ??
      asFiniteNumber(site.latitude),
    longitude:
      asFiniteNumber(site.approximate_longitude) ??
      asFiniteNumber(site.longitude),
  };
};

export interface ResolvedSite {
  siteId: string;
  displayName: string;
  site: RawSiteData | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Resolves the real site id (and its display name) from the site's display
 * name in the background — the URL only ever carries the slugified name, so
 * the raw id is never exposed. Resolution order:
 *
 * 1. The slug index (written when the user clicked the row in the explore
 *    table) — instant, exact, zero network.
 * 2. A single summary search (fast path for simple names).
 * 3. The complete fleet list (shared 30-min cache with the name-fallback
 *    hook) — covers names the backend search can't match (accents,
 *    diacritics, long names), keyed by an exact slug match so a fuzzy
 *    result can never resolve to the wrong site.
 */
export const useResolveSiteByName = (siteName: string) => {
  const trimmedName = siteName.trim();
  const slug = toSiteSlug(trimmedName);
  const shouldFetch = trimmedName.length > 0;
  const queryClient = useQueryClient();

  return useQuery<ResolvedSite | null, Error>({
    queryKey: ['analytics', 'site-resolve-by-name', slug],
    queryFn: async ({ signal }) => {
      const remembered = readSlugIndex()[slug];
      if (remembered?.siteId) {
        return {
          siteId: remembered.siteId,
          displayName: remembered.displayName,
          site: null,
          latitude: remembered.latitude,
          longitude: remembered.longitude,
        };
      }

      // Fast path: single summary search for the slug (works for most names).
      const response = await deviceService.getSitesSummaryAuthenticated(
        { search: trimmedName, limit: RESOLVE_PAGE_SIZE },
        signal
      );
      const searchMatch = ((response.sites ?? []) as RawSiteData[]).find(
        site => {
          const id = String(site?._id ?? '');
          return id && siteSlugMatches(slug, getSiteDisplayName(site));
        }
      );
      if (searchMatch) {
        const { latitude, longitude } = extractCoordinates(searchMatch);
        const displayName = getSiteDisplayName(searchMatch);
        rememberSiteSlug(slug, {
          siteId: searchMatch._id,
          displayName,
          latitude,
          longitude,
        });
        return {
          siteId: searchMatch._id,
          displayName,
          site: searchMatch,
          latitude,
          longitude,
        };
      }

      // Complete fallback: match against the full fleet list (cached 30 min,
      // shared with the analytics page). Handles accents/long names that the
      // backend search can't match.
      const fleet = await queryClient.ensureQueryData({
        queryKey: [...FLEET_SITES_QUERY_KEY],
        queryFn: ({ signal: fleetSignal }) => fetchAllSitesSummary(fleetSignal),
        staleTime: FLEET_SITES_STALE_TIME_MS,
      });
      const fleetMatch = (fleet as RawSiteData[]).find(site => {
        const id = String(site?._id ?? '');
        return id && siteSlugMatches(slug, getSiteDisplayName(site));
      });
      if (fleetMatch) {
        const { latitude, longitude } = extractCoordinates(fleetMatch);
        const displayName = getSiteDisplayName(fleetMatch);
        rememberSiteSlug(slug, {
          siteId: fleetMatch._id,
          displayName,
          latitude,
          longitude,
        });
        return {
          siteId: fleetMatch._id,
          displayName,
          site: fleetMatch,
          latitude,
          longitude,
        };
      }

      return null;
    },
    enabled: shouldFetch,
    networkMode: 'online',
    staleTime: RESOLVE_STALE_TIME_MS,
    gcTime: RESOLVE_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...boundedRetryPolicy,
  });
};

export default useResolveSiteByName;
