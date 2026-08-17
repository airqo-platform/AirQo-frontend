'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';
import { fetchAllSitesSummary } from '@/shared/services/siteSummary';

/**
 * One cached request to /devices/sites/summary (the site list every map view
 * uses) that builds siteId → display name for the WHOLE fleet
 * (search_name || location_name || name || formatted_name). Used as a
 * last-resort label source so charts/comparisons never show "Unknown
 * location" or raw ids when the picker sidecar or the recent-readings
 * endpoint isn't available. Long stale time — the fleet's names barely
 * change, and the page revalidates nothing else this heavy.
 */
const SITES_SUMMARY_STALE_MS = 1000 * 60 * 30;
const SITES_SUMMARY_GC_MS = 1000 * 60 * 60 * 12;
export const useSiteNamesFallback = (enabled = true) => {
  const { data, isLoading } = useQuery({
    queryKey: ['sites', 'site-names-fallback'],
    queryFn: ({ signal }) => fetchAllSitesSummary(signal),
    enabled,
    networkMode: 'online',
    retry: false,
    staleTime: SITES_SUMMARY_STALE_MS,
    gcTime: SITES_SUMMARY_GC_MS,
  });

  const names = useMemo(() => {
    const map = new Map<string, string>();
    (data ?? []).forEach(site => {
      const id = String(site?._id ?? '');
      const name = getSiteDisplayName(
        site as Parameters<typeof getSiteDisplayName>[0]
      );
      if (id && name) map.set(id, name);
    });
    return map;
  }, [data]);

  return { names, isLoading };
};

/**
 * Merges a fallback names map into a primary names map, filling ONLY gaps —
 * explicitly known names (picker/readings) always win.
 */
export const useMergeFallbackNames = (
  primary: Map<string, string>,
  fallback: Map<string, string>,
  onMerged: (merged: Map<string, string>) => void
) => {
  const lastFallbackRef = useRef<Map<string, string> | null>(null);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const primaryRef = useRef(primary);
  primaryRef.current = primary;

  const apply = useCallback(() => {
    const next = new Map(primaryRef.current);
    let added = 0;
    fallbackRef.current.forEach((name, siteId) => {
      if (!next.has(siteId) && name) {
        next.set(siteId, name);
        added++;
      }
    });
    if (added > 0) onMerged(next);
  }, [onMerged]);

  // Fill gaps once per new fallback snapshot (first load included). Later
  // primary arrivals override via the page's own name handlers.
  useEffect(() => {
    if (fallback === lastFallbackRef.current) return;
    lastFallbackRef.current = fallback;
    apply();
  }, [fallback, apply]);
};

export default useSiteNamesFallback;
