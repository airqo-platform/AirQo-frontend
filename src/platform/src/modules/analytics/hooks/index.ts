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
import {
  generateTrend,
  getAirQualityLevel,
  normalizeRecentReadingsToSiteData,
} from '../utils';
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

type PreferenceSite = Partial<Site> & {
  id?: string;
  site_id?: string;
};

const EMPTY_SELECTED_SITE_IDS: string[] = [];

const ANALYTICS_QUERY_STALE_TIME_MS = 1000 * 60 * 5;
const ANALYTICS_QUERY_GC_TIME_MS = 1000 * 60 * 60 * 12;
const SITE_CARD_LOOKBACK_WINDOW_MS = 1000 * 60 * 60 * 24;

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

const buildSiteCardLocation = (selectedSite: Site) => {
  return (
    [selectedSite.city, selectedSite.region, selectedSite.country]
      .filter(Boolean)
      .join(', ') ||
    selectedSite.country ||
    'Unknown Country'
  );
};

const buildNoValueSiteCard = (
  selectedSite: Site,
  pollutant: string
): SiteData => ({
  _id: selectedSite._id,
  name: getSiteDisplayName(selectedSite),
  search_name: getSiteDisplayName(selectedSite),
  location: buildSiteCardLocation(selectedSite),
  country: selectedSite.country,
  city: selectedSite.city,
  region: selectedSite.region,
  value: 0,
  status: 'no-value',
  pollutant,
  unit: 'μg/m³',
  trend: 'stable',
  percentageDifference: 0,
});

const buildSiteCardsFromRecentReadings = (
  siteCards: SiteData[],
  selectedSites: Site[],
  pollutant: 'pm2_5' | 'pm10'
): SiteData[] => {
  if (!Array.isArray(siteCards) || siteCards.length === 0) {
    return selectedSites.map(selectedSite =>
      buildNoValueSiteCard(selectedSite, pollutant)
    );
  }

  const siteCardsById = new Map(
    siteCards.map(siteCard => [siteCard._id, siteCard] as const)
  );

  return selectedSites.map(selectedSite => {
    const siteCard = siteCardsById.get(selectedSite._id);

    if (!siteCard) {
      return buildNoValueSiteCard(selectedSite, pollutant);
    }

    const fallbackDisplayName = getSiteDisplayName(selectedSite);
    const apiDisplayName = getSiteDisplayName(siteCard);

    return {
      ...siteCard,
      _id: selectedSite._id,
      name: apiDisplayName || fallbackDisplayName,
      search_name:
        siteCard.search_name || apiDisplayName || fallbackDisplayName,
      location: siteCard.location || buildSiteCardLocation(selectedSite),
      country: siteCard.country ?? selectedSite.country,
      city: siteCard.city ?? selectedSite.city,
      region: siteCard.region ?? selectedSite.region,
      pollutant,
    };
  });
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
  pollutant: 'pm2_5' | 'pm10'
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

const isRecentReadingsCompatibilityFallbackError = (
  error: unknown
): boolean => {
  const status = (error as { response?: { status?: number } } | null)?.response
    ?.status;

  return status === 404 || status === 405;
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
  const selectedSitesKey = useMemo(
    () =>
      selectedSites
        .map(site =>
          [
            site._id,
            getSiteDisplayName(site),
            site.city ?? '',
            site.region ?? '',
            site.country ?? '',
          ].join(':')
        )
        .join('|'),
    [selectedSites]
  );
  const activeGroupKey = activeGroup?.id ?? 'no-active-group';

  const shouldFetch =
    enabled && selectedSiteIds.length > 0 && selectedSites.length > 0;
  const queryKey = useMemo(
    () => [
      'analytics',
      'site-cards',
      user?.id ?? 'anonymous',
      activeGroupKey,
      selectedSiteIdsKey,
      selectedSitesKey,
      filters.pollutant,
    ],
    [
      activeGroupKey,
      filters.pollutant,
      selectedSiteIdsKey,
      selectedSitesKey,
      user?.id,
    ]
  );
  const currentRequestKey = useMemo(() => JSON.stringify(queryKey), [queryKey]);
  const lastSettledRequestKeyRef = useRef(currentRequestKey);

  const query = useQuery<SiteData[], Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const activePollutant: 'pm2_5' | 'pm10' =
        filters.pollutant === 'pm10' ? 'pm10' : 'pm2_5';

      try {
        const response = await analyticsService.getRecentReadings(
          {
            site_id: selectedSiteIds.join(','),
          },
          signal
        );

        return buildSiteCardsFromRecentReadings(
          normalizeRecentReadingsToSiteData(
            response?.measurements ?? [],
            activePollutant
          ),
          selectedSites,
          activePollutant
        );
      } catch (error) {
        if (
          signal.aborted ||
          !isRecentReadingsCompatibilityFallbackError(error)
        ) {
          throw error;
        }

        const latestDateRange = createLatestSiteCardDateRange();
        const fallbackResponse = await analyticsService.getChartData(
          {
            sites: selectedSiteIds,
            startDate: latestDateRange.startDate,
            endDate: latestDateRange.endDate,
            chartType: 'line',
            frequency: 'hourly',
            pollutant: activePollutant,
            organisation_name: '',
          },
          signal
        );

        return buildSiteCardsFromChartPoints(
          fallbackResponse?.data ?? [],
          selectedSites,
          activePollutant
        );
      }
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
