'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDownloadData } from '@/shared/hooks/useAnalytics';
import {
  getLatestPreferenceForGroup,
  useUserPreferencesList,
} from '@/shared/hooks/usePreferences';
import { useUser } from '@/shared/hooks/useUser';
import { normalizeAirQualityData } from '@/shared/components/charts/utils';
import { analyticsService } from '@/shared/services/analyticsService';
import type { ChartData } from '../types';
import type {
  ChartDataPoint,
  DataDownloadRequest,
  Site,
} from '@/shared/types/api';
import {
  buildDownloadFileContent,
  DownloadFileTransformOptions,
} from '@/modules/data-download/utils/dataExportFile';

export { useChartManagement, type UseChartManagementResult } from './useChartManagement';

type PreferenceSite = Partial<Site> & {
  id?: string;
  site_id?: string;
};

const EMPTY_SELECTED_SITE_IDS: string[] = [];

const ANALYTICS_QUERY_STALE_TIME_MS = 1000 * 60 * 5;
const ANALYTICS_QUERY_GC_TIME_MS = 1000 * 60 * 60 * 12;

const resolvePreferenceSiteId = (site?: PreferenceSite | null): string => {
  const candidateIds = [site?._id, site?.id, site?.site_id];

  return (
    candidateIds
      .map(candidateId =>
        typeof candidateId === 'string' ? candidateId.trim() : ''
      )
      .find(Boolean) || ''
  );
};

const normalizePreferenceSelectedSites = (
  selectedSiteIds: string[],
  selectedSites: PreferenceSite[]
): Site[] => {
  const normalizedSitesById = new Map<string, Site>();

  selectedSites.forEach(selectedSite => {
    const siteId = resolvePreferenceSiteId(selectedSite);

    if (!siteId) {
      return;
    }

    normalizedSitesById.set(siteId, {
      search_name:
        selectedSite.search_name ||
        selectedSite.formatted_name ||
        selectedSite.generated_name ||
        selectedSite.name ||
        siteId,
      ...selectedSite,
      _id: siteId,
    });
  });

  return selectedSiteIds.map(siteId => {
    const existingSite = normalizedSitesById.get(siteId);

    if (existingSite) {
      return existingSite;
    }

    return {
      _id: siteId,
      search_name: siteId,
      name: siteId,
    };
  });
};

interface AnalyticsPreferencesOptions {
  groupId?: string;
  userId?: string;
  enabled?: boolean;
}

// Hook for managing analytics preferences and selected sites
export const useAnalyticsPreferences = (
  options?: AnalyticsPreferencesOptions
) => {
  const { user, activeGroup, isLoading: userLoading } = useUser();
  const resolvedUserId = options?.userId ?? user?.id ?? '';
  const resolvedGroupId = options?.groupId ?? activeGroup?.id ?? '';
  const isEnabled = options?.enabled ?? true;

  // Only fetch preferences if both userId and groupId are available
  const shouldFetchPreferences =
    isEnabled && !!(resolvedUserId && resolvedGroupId);

  const {
    data: preferencesData,
    error,
    isLoading: preferencesLoading,
  } = useUserPreferencesList(
    shouldFetchPreferences ? resolvedUserId : '',
    shouldFetchPreferences ? resolvedGroupId : ''
  );

  // Get the most recent preference from the list
  const currentPreference = useMemo(() => {
    return getLatestPreferenceForGroup(
      preferencesData?.preferences,
      resolvedGroupId
    );
  }, [preferencesData?.preferences, resolvedGroupId]);

  // Extract selected sites IDs
  const selectedSiteIds = useMemo(() => {
    // While the current group's preferences are loading, avoid showing stale data.
    if (!currentPreference || preferencesLoading) {
      return [];
    }

    const canonicalSiteIds = Array.isArray(currentPreference.site_ids)
      ? currentPreference.site_ids
      : [];
    const fallbackSiteIds = Array.isArray(currentPreference.selected_sites)
      ? currentPreference.selected_sites.map(resolvePreferenceSiteId)
      : [];

    const normalizedSiteIds = Array.from(
      new Set(
        [...canonicalSiteIds, ...fallbackSiteIds]
          .map(siteId => (typeof siteId === 'string' ? siteId.trim() : ''))
          .filter(Boolean)
      )
    );

    if (normalizedSiteIds.length === 0) {
      return [];
    }

    return normalizedSiteIds;
  }, [currentPreference, preferencesLoading]);

  // Get full selected sites data
  const selectedSites = useMemo(() => {
    // While the current group's preferences are loading, avoid showing stale data.
    if (!currentPreference || preferencesLoading) {
      return [];
    }

    return normalizePreferenceSelectedSites(
      selectedSiteIds,
      currentPreference?.selected_sites || []
    );
  }, [currentPreference, preferencesLoading, selectedSiteIds]);

  // Combined loading state - only show loading if we should fetch and are actually loading
  const isWaitingForGroup = isEnabled && !resolvedGroupId;
  const isLoading =
    userLoading ||
    isWaitingForGroup ||
    (shouldFetchPreferences && preferencesLoading);

  return {
    selectedSiteIds,
    selectedSites,
    preferences: currentPreference || null,
    isLoading,
    error,
    // Additional debug info
    hasUser: !!user,
    hasActiveGroup: !!activeGroup,
    hasPreferencesData: !!preferencesData,
    shouldFetchPreferences,
    userLoading,
    preferencesLoading,
  };
};

// Hook for fetching and managing chart data
export interface ChartDataFilters {
  frequency: string;
  startDate: string;
  endDate: string;
  pollutant: string;
}

/**
 * The React Query key for a chart-data request. Exported so consumers can
 * read cached chart data without re-fetching (e.g. saved-chart sparklines).
 */
export const buildChartDataQueryKey = (
  userId: string | undefined,
  activeGroupId: string | undefined,
  chartType: 'line' | 'bar',
  selectedSiteIds: string[],
  filters: ChartDataFilters
): unknown[] => [
  'analytics',
  'chart-data',
  userId ?? 'anonymous',
  activeGroupId ?? 'no-active-group',
  chartType,
  selectedSiteIds.join(','),
  filters.startDate,
  filters.endDate,
  filters.frequency,
  filters.pollutant,
];

export const useAnalyticsChartData = (
  filters: ChartDataFilters,
  chartType: 'line' | 'bar' = 'line',
  selectedSiteIds: string[] = EMPTY_SELECTED_SITE_IDS,
  enabled = true
) => {
  const { user, activeGroup } = useUser();

  // Calculate date range based on filters
  const dateRange = useMemo(() => {
    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
  }, [filters.startDate, filters.endDate]);

  const shouldFetch = enabled && selectedSiteIds.length > 0;

  const chartQueryKey = useMemo(
    () =>
      buildChartDataQueryKey(
        user?.id,
        activeGroup?.id,
        chartType,
        selectedSiteIds,
        {
          frequency: filters.frequency,
          startDate: filters.startDate,
          endDate: filters.endDate,
          pollutant: filters.pollutant,
        }
      ),
    [
      chartType,
      filters.endDate,
      filters.startDate,
      filters.frequency,
      filters.pollutant,
      selectedSiteIds,
      user?.id,
      activeGroup?.id,
    ]
  );
  const currentRequestKey = useMemo(
    () => JSON.stringify(chartQueryKey),
    [chartQueryKey]
  );
  const lastSettledRequestKeyRef = useRef(currentRequestKey);

  const query = useQuery<ChartData[], Error>({
    queryKey: chartQueryKey,
    queryFn: async ({ signal }) => {
      const response = await analyticsService.getChartData(
        {
          sites: selectedSiteIds,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          chartType,
          frequency: filters.frequency,
          pollutant: filters.pollutant.toLowerCase().replace('.', '_'),
          organisation_name: '',
        },
        signal
      );

      if (!response?.data || response.data.length === 0) {
        return [];
      }

      return transformChartData(response.data);
    },
    enabled: shouldFetch,
    networkMode: 'online',
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: ANALYTICS_QUERY_STALE_TIME_MS,
    gcTime: ANALYTICS_QUERY_GC_TIME_MS,
    placeholderData: previousData => previousData,
  });

  useEffect(() => {
    if (!shouldFetch) {
      lastSettledRequestKeyRef.current = currentRequestKey;
      return;
    }

    if (!query.isFetching && (query.isSuccess || query.isError)) {
      lastSettledRequestKeyRef.current = currentRequestKey;
    }
  }, [
    currentRequestKey,
    query.isError,
    query.isFetching,
    query.isSuccess,
    shouldFetch,
  ]);

  const isFilterTransitionLoading =
    shouldFetch &&
    query.isFetching &&
    currentRequestKey !== lastSettledRequestKeyRef.current;

  const refreshChartData = useCallback(async () => {
    if (!shouldFetch) {
      return;
    }

    await query.refetch();
  }, [query, shouldFetch]);

  return {
    chartData: shouldFetch ? (query.data ?? []) : [],
    isLoading: shouldFetch
      ? query.isLoading || isFilterTransitionLoading
      : false,
    isRefreshing: shouldFetch ? query.isFetching : false,
    error: shouldFetch ? (query.error?.message ?? null) : null,
    refetch: refreshChartData,
    refresh: refreshChartData,
  };
};

// Hook for downloading data
export const useDataDownload = () => {
  const { trigger, isMutating, error } = useDownloadData();

  const downloadData = useCallback(
    async (
      request: DataDownloadRequest,
      customFilename?: string,
      transformOptions?: DownloadFileTransformOptions
    ) => {
      try {
        const response = await trigger(request);
        const { content, mimeType, extension } = buildDownloadFileContent(
          response,
          request.downloadType,
          transformOptions?.selectedColumnKeys
        );

        // Generate default filename if not provided
        const defaultFilename = `air-quality-data-${request.startDateTime.split('T')[0]}-to-${request.endDateTime.split('T')[0]}`;
        const baseFilename = customFilename || defaultFilename;

        // Ensure filename has correct extension
        const filename = baseFilename.endsWith(`.${extension}`)
          ? baseFilename
          : `${baseFilename}.${extension}`;

        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true };
      } catch (err) {
        // Log the message only — the raw error object can carry the
        // Authorization header (AGENTS.md: tokens never reach logs).
        console.error(
          'Download failed:',
          err instanceof Error ? err.message : err
        );
        throw err; // Re-throw the error so it can be caught by the caller
      }
    },
    [trigger]
  );

  return {
    downloadData,
    isDownloading: isMutating,
    error,
  };
};

// Helper function to transform API data to chart format
export const transformChartData = (apiData: ChartDataPoint[]): ChartData[] => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }

  // Use shared normalizeAirQualityData function - this returns NormalizedChartData[]
  return normalizeAirQualityData(apiData);
};
