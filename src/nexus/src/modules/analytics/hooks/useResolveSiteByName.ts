'use client';

import { useQuery } from '@tanstack/react-query';
import { deviceService } from '@/shared/services/deviceService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import {
  getSiteDisplayName,
  type RawSiteData,
} from '@/shared/utils/siteUtils';
import { toSiteSlug, siteSlugMatches } from '../utils/siteDetails';

const RESOLVE_STALE_TIME_MS = 1000 * 60 * 30;
const RESOLVE_GC_TIME_MS = 1000 * 60 * 60 * 12;
const RESOLVE_PAGE_SIZE = 80;

export interface ResolvedSite {
  siteId: string;
  displayName: string;
  site: RawSiteData | null;
}

/**
 * Resolves the real site id (and its display name) from the site's display
 * name in the background — the URL only ever carries the slugified name, so
 * the raw id is never exposed. Uses the same fleet-wide sites/summary source
 * as every map view, filtered by an exact slug match so a fuzzy search result
 * can never resolve to the wrong site. Abort-safe (react-query signal),
 * long-cached, and keyed by slug so revisits never re-fetch.
 */
export const useResolveSiteByName = (siteName: string) => {
  const trimmedName = siteName.trim();
  const slug = toSiteSlug(trimmedName);
  const shouldFetch = trimmedName.length > 0;

  return useQuery<ResolvedSite | null, Error>({
    queryKey: ['analytics', 'site-resolve-by-name', slug],
    queryFn: async ({ signal }) => {
      const response = await deviceService.getSitesSummaryAuthenticated(
        { search: trimmedName, limit: RESOLVE_PAGE_SIZE },
        signal
      );
      const sites = (response.sites ?? []) as RawSiteData[];
      const match = sites.find(site => {
        const id = String(site?._id ?? '');
        return id && siteSlugMatches(slug, getSiteDisplayName(site));
      });
      if (!match) return null;
      return {
        siteId: match._id,
        displayName: getSiteDisplayName(match),
        site: match,
      };
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
