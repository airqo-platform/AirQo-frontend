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
import { generateTrend, getAirQualityLevel } from '../utils';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';
import { useAnalytics } from './useAnalytics';
import { analyticsService } from '@/shared/services/analyticsService';
import type { SiteData, ChartData } from '../types';
import type {
  ChartDataPoint,
  DataDownloadRequest,
  Site,
} from '@/shared/types/api';
import {
  buildDownloadFileContent,
  DownloadFileTransformOptions,
} from '@/modules/data-download/utils/dataExportFile';

interface AnalyticsSelections {
  selectedSiteIds: string[];
  selectedSites: Site[];
  enabled?: boolean;
}

const EMPTY_SELECTED_SITE_IDS: string[] = [];

const ANALYTICS_QUERY_STALE_TIME_MS = 1000 * 60 * 5;
const ANALYTICS_QUERY_GC_TIME_MS = 1000 * 60 * 60 * 12;
const SITE_CARD_LOOKBACK_WINDOW_MS = 1000 * 60 * 60 * 24;

const buildNoValueSiteCard = (
  selectedSite: Site,
  pollutant: string
): SiteData => ({
  _id: selectedSite._id,
  name: getSiteDisplayName(selectedSite),
  location: selectedSite.country || 'Unknown Country',
  value: 0,
  status: 'no-value',
  pollutant,
  unit: 'μg/m³',
  trend: 'stable',
  percentageDifference: 0,
});

const buildSiteCardLocation = (selectedSite: Site) => {
  return (
    [selectedSite.city, selectedSite.region, selectedSite.country]
      .filter(Boolean)
      .join(', ') ||
    selectedSite.country ||
    'Unknown Country'
  );
};

const createLatestSiteCardDateRange = () => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - SITE_CARD_LOOKBACK_WINDOW_MS);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

const buildSiteCardsFromChartPoints = (
  chartPoints: ChartDataPoint[],
  selectedSites: Site[],
  pollutant: string
): SiteData[] => {
  if (!Array.isArray(chartPoints) || chartPoints.length === 0) {
    return selectedSites.map(selectedSite =>
      buildNoValueSiteCard(selectedSite, pollutant)
    );
  }

  const pointsBySiteId = new Map<string, ChartDataPoint[]>();

  chartPoints.forEach(point => {
    if (!point?.site_id) {
      return;
    }

    const sitePoints = pointsBySiteId.get(point.site_id) ?? [];
    sitePoints.push(point);
    pointsBySiteId.set(point.site_id, sitePoints);
  });

  return selectedSites.map(selectedSite => {
    const sortedPoints = [...(pointsBySiteId.get(selectedSite._id) ?? [])].sort(
      (left, right) =>
        new Date(right.time).getTime() - new Date(left.time).getTime()
    );
    const latestPoint = sortedPoints[0];
    const previousPoint = sortedPoints[1];
    const latestValue = Number(latestPoint?.value);
    const previousValue = Number(previousPoint?.value);

    if (!latestPoint || !Number.isFinite(latestValue)) {
      return buildNoValueSiteCard(selectedSite, pollutant);
    }

    const percentageDifference =
      Number.isFinite(previousValue) && previousValue !== 0
        ? ((latestValue - previousValue) / Math.abs(previousValue)) * 100
        : undefined;
    const displayName = getSiteDisplayName(selectedSite);

    return {
      _id: selectedSite._id,
      name: displayName,
      search_name: displayName,
      location: buildSiteCardLocation(selectedSite),
      country: selectedSite.country,
      city: selectedSite.city,
      region: selectedSite.region,
      value: latestValue,
      status: getAirQualityLevel(latestValue, pollutant),
      pollutant,
      unit: 'μg/m³',
      trend: generateTrend(latestValue, previousValue),
      percentageDifference,
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

    if (!currentPreference?.selected_sites) {
      return [];
    }
    return currentPreference.selected_sites.map((site: Site) => site._id);
  }, [currentPreference, preferencesLoading]);

  // Get full selected sites data
  const selectedSites = useMemo(() => {
    // While the current group's preferences are loading, avoid showing stale data.
    if (!currentPreference || preferencesLoading) {
      return [];
    }

    return currentPreference?.selected_sites || [];
  }, [currentPreference, preferencesLoading]);

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
export const useAnalyticsChartData = (
  filters: {
    frequency: string;
    startDate: string;
    endDate: string;
    pollutant: string;
  },
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

  const selectedSiteIdsKey = useMemo(
    () => selectedSiteIds.join(','),
    [selectedSiteIds]
  );
  const activeGroupKey = activeGroup?.id ?? 'no-active-group';
  const shouldFetch = enabled && selectedSiteIds.length > 0;

  const chartQueryKey = useMemo(
    () => [
      'analytics',
      'chart-data',
      user?.id ?? 'anonymous',
      activeGroupKey,
      chartType,
      selectedSiteIdsKey,
      dateRange.startDate,
      dateRange.endDate,
      filters.frequency,
      filters.pollutant,
    ],
    [
      chartType,
      dateRange.endDate,
      dateRange.startDate,
      user?.id,
      activeGroupKey,
      filters.frequency,
      filters.pollutant,
      selectedSiteIdsKey,
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

// Hook for managing site cards data
export const useAnalyticsSiteCards = ({
  selectedSiteIds,
  selectedSites,
  enabled = true,
}: AnalyticsSelections) => {
  const { filters } = useAnalytics();
  const { user, activeGroup } = useUser();
  const selectedSiteIdsKey = useMemo(
    () => selectedSiteIds.join(','),
    [selectedSiteIds]
  );
  const activeGroupKey = activeGroup?.id ?? 'no-active-group';

  const shouldFetch = enabled && selectedSiteIds.length > 0;
  const queryKey = useMemo(
    () => [
      'analytics',
      'site-cards',
      user?.id ?? 'anonymous',
      activeGroupKey,
      selectedSiteIdsKey,
      filters.pollutant,
    ],
    [activeGroupKey, filters.pollutant, selectedSiteIdsKey, user?.id]
  );
  const currentRequestKey = useMemo(() => JSON.stringify(queryKey), [queryKey]);
  const lastSettledRequestKeyRef = useRef(currentRequestKey);

  const query = useQuery<SiteData[], Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const latestDateRange = createLatestSiteCardDateRange();
      const response = await analyticsService.getChartData(
        {
          sites: selectedSiteIds,
          startDate: latestDateRange.startDate,
          endDate: latestDateRange.endDate,
          chartType: 'line',
          frequency: 'hourly',
          pollutant: filters.pollutant.toLowerCase().replace('.', '_'),
          organisation_name: '',
        },
        signal
      );

      return buildSiteCardsFromChartPoints(
        response?.data ?? [],
        selectedSites,
        filters.pollutant
      );
    },
    enabled: shouldFetch,
    networkMode: 'online',
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: ANALYTICS_QUERY_STALE_TIME_MS,
    gcTime: ANALYTICS_QUERY_GC_TIME_MS,
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

  const isTransitionLoading =
    shouldFetch &&
    query.isFetching &&
    currentRequestKey !== lastSettledRequestKeyRef.current;

  const siteCards = useMemo(() => {
    if (!shouldFetch) {
      return [];
    }

    return query.data ?? [];
  }, [query.data, shouldFetch]);

  const refetchSiteCards = useCallback(async () => {
    if (!shouldFetch) {
      return;
    }

    await query.refetch();
  }, [query, shouldFetch]);

  return {
    siteCards,
    isLoading: shouldFetch ? query.isLoading || isTransitionLoading : false,
    isRefreshing: shouldFetch
      ? query.isFetching && !isTransitionLoading
      : false,
    error: shouldFetch ? (query.error?.message ?? null) : null,
    refetch: refetchSiteCards,
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
        console.error('Download failed:', err);
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
const transformChartData = (apiData: ChartDataPoint[]): ChartData[] => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }

  // Use shared normalizeAirQualityData function - this returns NormalizedChartData[]
  return normalizeAirQualityData(apiData);
};
