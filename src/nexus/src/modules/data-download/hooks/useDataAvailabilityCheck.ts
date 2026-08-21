'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { analyticsService } from '@/shared/services/analyticsService';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { DateRange } from '@/shared/components/calendar/types';
import { resolveGridSitesForDownload } from '../utils/dataExportRequest';
import { TabType, TableItem } from '../types/dataExportTypes';

const AVAILABILITY_STALE_TIME_MS = 1000 * 60 * 2;
const AVAILABILITY_GC_TIME_MS = 1000 * 60 * 5;

/** Delay in ms before the query fires after the selection stabilises. */
const AVAILABILITY_DEBOUNCE_MS = 400;

export type SiteAvailabilityStatus = 'available' | 'stale' | 'no_data';

export interface SiteAvailabilityEntry {
  siteId: string;
  /** Human-readable display name resolved from siteNameMap, or the raw siteId. */
  siteName: string;
  status: SiteAvailabilityStatus;
  latestReadingDate: string | null;
}

export type AggregateAvailability = 'all_available' | 'partial' | 'none' | 'idle' | 'loading';

export interface DataAvailabilityResult {
  aggregateStatus: AggregateAvailability;
  totalSites: number;
  sitesWithData: number;
  sitesWithoutData: number;
  siteDetails: SiteAvailabilityEntry[];
}

/**
 * Resolves all selected site IDs from the current tab selection.
 */
function resolveAllSiteIds(
  activeTab: TabType,
  selectedSiteIds: string[],
  selectedDeviceIds: string[],
  selectedGridIds: string[],
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>,
  selectedDevicesCache: Record<string, TableItem>
): string[] {
  if (activeTab === 'sites') {
    return selectedSiteIds;
  }

  if (activeTab === 'devices') {
    // Resolve device IDs to their linked site IDs
    const siteIds = new Set<string>();
    selectedDeviceIds.forEach(deviceId => {
      const device = selectedDevicesCache[deviceId];
      const siteId = (device?.site_id ?? device?.siteId) as string | undefined;
      if (siteId && typeof siteId === 'string' && siteId.trim()) {
        siteIds.add(siteId.trim());
      }
    });
    return Array.from(siteIds);
  }

  // countries / cities: resolve grid → site IDs
  return resolveGridSitesForDownload(
    selectedGridIds,
    selectedGridSites,
    selectedGridSiteIds
  );
}

/**
 * Checks data availability for the current selection by calling the
 * lightweight `getRecentReadings` endpoint. Each selected site is classified
 * as:
 * - `available`: latest reading falls within the user's date range
 * - `stale`: latest reading exists but is outside the date range
 * - `no_data`: no recent reading found at all
 */
export const useDataAvailabilityCheck = (
  activeTab: TabType,
  selectedSiteIds: string[],
  selectedDeviceIds: string[],
  selectedGridIds: string[],
  selectedGridSites: Record<string, string[]>,
  selectedGridSiteIds: Record<string, string[]>,
  selectedDevicesCache: Record<string, TableItem>,
  dateRange: DateRange | undefined,
  siteNameMap?: Record<string, string>
): DataAvailabilityResult => {
  const resolvedSiteIds = useMemo(
    () =>
      resolveAllSiteIds(
        activeTab,
        selectedSiteIds,
        selectedDeviceIds,
        selectedGridIds,
        selectedGridSites,
        selectedGridSiteIds,
        selectedDevicesCache
      ),
    [
      activeTab,
      selectedSiteIds,
      selectedDeviceIds,
      selectedGridIds,
      selectedGridSites,
      selectedGridSiteIds,
      selectedDevicesCache,
    ]
  );

  // Debounce the resolved IDs so rapid selection changes don't trigger
  // repeated API calls. The query only fires after the selection has been
  // stable for AVAILABILITY_DEBOUNCE_MS.
  const debouncedSiteIds = useDebounce(resolvedSiteIds, AVAILABILITY_DEBOUNCE_MS);
  const shouldFetch = debouncedSiteIds.length > 0;

  const siteIdKey = [...debouncedSiteIds].sort().join(',');

  const { data: recentReadings, isLoading } = useQuery({
    queryKey: ['analytics', 'availability-check', siteIdKey],
    queryFn: async ({ signal }) => {
      const response = await analyticsService.getRecentReadings(
        { site_id: debouncedSiteIds.join(',') },
        signal
      );
      return response?.measurements ?? [];
    },
    enabled: shouldFetch,
    networkMode: 'online',
    staleTime: AVAILABILITY_STALE_TIME_MS,
    gcTime: AVAILABILITY_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...boundedRetryPolicy,
  });

  const siteDetails = useMemo(() => {
    if (!shouldFetch) return [];

    const readingBySite = new Map<string, { time: string }>();
    (recentReadings ?? []).forEach(reading => {
      if (reading.site_id) {
        const existing = readingBySite.get(reading.site_id);
        // Keep the most recent reading per site
        if (!existing || new Date(reading.time) > new Date(existing.time)) {
          readingBySite.set(reading.site_id, { time: reading.time });
        }
      }
    });

    const rangeFrom = dateRange?.from?.getTime();
    const rangeTo = dateRange?.to?.getTime();

    return debouncedSiteIds.map(siteId => {
      const reading = readingBySite.get(siteId);
      const siteName = siteNameMap?.[siteId] ?? siteId;

      if (!reading) {
        return {
          siteId,
          siteName,
          status: 'no_data' as SiteAvailabilityStatus,
          latestReadingDate: null,
        };
      }

      const readingTime = new Date(reading.time).getTime();
      const inRange =
        rangeFrom != null &&
        rangeTo != null &&
        readingTime >= rangeFrom &&
        readingTime <= rangeTo + 24 * 60 * 60 * 1000; // +1 day to cover the "to" date

      return {
        siteId,
        siteName,
        status: (inRange ? 'available' : 'stale') as SiteAvailabilityStatus,
        latestReadingDate: reading.time,
      };
    });
  }, [shouldFetch, recentReadings, debouncedSiteIds, dateRange?.from, dateRange?.to, siteNameMap]);

  const aggregateStatus = useMemo((): AggregateAvailability => {
    if (!shouldFetch) return 'idle';
    if (isLoading) return 'loading';
    if (siteDetails.length === 0) return 'idle';

    const sitesWithData = siteDetails.filter(
      d => d.status === 'available' || d.status === 'stale'
    ).length;

    if (sitesWithData === 0) return 'none';
    if (sitesWithData < siteDetails.length) return 'partial';
    return 'all_available';
  }, [shouldFetch, isLoading, siteDetails]);

  const sitesWithData = siteDetails.filter(
    d => d.status === 'available' || d.status === 'stale'
  ).length;

  return {
    aggregateStatus,
    totalSites: siteDetails.length,
    sitesWithData,
    sitesWithoutData: siteDetails.length - sitesWithData,
    siteDetails,
  };
};
