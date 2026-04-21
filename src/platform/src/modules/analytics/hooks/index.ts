'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useGetChartData, useDownloadData } from '@/shared/hooks/useAnalytics';
import { useUserPreferencesList } from '@/shared/hooks/usePreferences';
import { useUser } from '@/shared/hooks/useUser';
import { normalizeAirQualityData } from '@/shared/components/charts/utils';
import { normalizeRecentReadingsToSiteData } from '../utils';
import { useAnalytics } from './useAnalytics';
import { analyticsService } from '@/shared/services/analyticsService';
import type { SiteData, ChartData } from '../types';
import type {
  ChartDataPoint,
  DataDownloadRequest,
  Site,
} from '@/shared/types/api';

interface AnalyticsSelections {
  selectedSiteIds: string[];
  selectedSites: Site[];
  enabled?: boolean;
}

const EMPTY_SELECTED_SITE_IDS: string[] = [];

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
    if (
      !preferencesData?.preferences ||
      preferencesData.preferences.length === 0
    ) {
      return null;
    }
    // Sort by lastAccessed date (most recent first) and take the first one
    return [...preferencesData.preferences].sort(
      (a, b) =>
        new Date(b.lastAccessed || b.updatedAt).getTime() -
        new Date(a.lastAccessed || a.updatedAt).getTime()
    )[0];
  }, [preferencesData?.preferences]);

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
  const isLoading =
    userLoading || (shouldFetchPreferences && preferencesLoading);

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
  // Calculate date range based on filters
  const dateRange = useMemo(() => {
    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
  }, [filters.startDate, filters.endDate]);

  const { trigger, error, isMutating } = useGetChartData([
    Array.isArray(selectedSiteIds)
      ? selectedSiteIds.join(',')
      : selectedSiteIds,
    dateRange.startDate,
    dateRange.endDate,
    chartType,
    filters.frequency,
    filters.pollutant,
  ]);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch chart data
  const fetchChartData = useCallback(
    async (isRefresh = false) => {
      if (!enabled) {
        setChartData([]);
        setIsLoading(false);
        return;
      }
      // If no selected sites, we still want to show empty charts (not return early)
      // The UI will show appropriate empty states
      const sitesToUse = selectedSiteIds.length > 0 ? selectedSiteIds : [];

      if (!isRefresh) {
        setIsLoading(true);
      }

      // Only fetch data if we have sites to fetch for
      if (sitesToUse.length === 0) {
        setChartData([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await trigger({
          sites: sitesToUse,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          chartType: chartType,
          frequency: filters.frequency,
          pollutant: filters.pollutant.toLowerCase().replace('.', '_'),
          organisation_name: '',
        });

        if (response?.data && response.data.length > 0) {
          // Transform API data to chart format
          const transformed = transformChartData(response.data);
          setChartData(transformed);
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    },
    // Use specific filter fields instead of the whole filters object to avoid
    // re-creating fetchChartData (and re-running the effect) on every Redux dispatch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedSiteIds,
      dateRange,
      filters.frequency,
      filters.pollutant,
      trigger,
      chartType,
      enabled,
    ]
  );

  // Separate refresh function that doesn't trigger main loading
  const refreshChartData = useCallback(async () => {
    return fetchChartData(true);
  }, [fetchChartData]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return {
    chartData,
    isLoading: enabled ? isLoading || isMutating : false,
    error: enabled ? error : null,
    refetch: fetchChartData,
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
  const { user } = useUser();

  const [siteCards, setSiteCards] = useState<SiteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedSitesRef = useRef(selectedSites);
  const selectedSiteIdsRef = useRef(selectedSiteIds);
  const pollutantRef = useRef(filters.pollutant);
  const enabledRef = useRef(enabled);
  const requestAbortRef = useRef<AbortController | null>(null);
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    selectedSitesRef.current = selectedSites;
  }, [selectedSites]);

  useEffect(() => {
    selectedSiteIdsRef.current = selectedSiteIds;
  }, [selectedSiteIds]);

  useEffect(() => {
    pollutantRef.current = filters.pollutant;
  }, [filters.pollutant]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    return () => {
      requestAbortRef.current?.abort();
    };
  }, [user?.id]);

  const selectedSiteIdsKey = useMemo(
    () => selectedSiteIds.join(','),
    [selectedSiteIds]
  );

  // Fetch real site data using recent readings API
  const fetchSiteCards = useCallback(async () => {
    const localSelectedSites = selectedSitesRef.current;
    const localSelectedSiteIds = selectedSiteIdsRef.current;
    const localPollutant = pollutantRef.current;

    if (!enabledRef.current) {
      setIsLoading(false);
      setSiteCards([]);
      return;
    }

    requestAbortRef.current?.abort();
    const controller = new AbortController();
    requestAbortRef.current = controller;
    const requestId = ++requestSequenceRef.current;

    // If no selected sites, show empty cards instead of returning early
    if (!localSelectedSiteIds.length) {
      setIsLoading(false);
      setSiteCards([]);
      if (requestAbortRef.current === controller) {
        requestAbortRef.current = null;
      }
      return;
    }

    setIsLoading(true);

    try {
      const siteIdsParam = localSelectedSiteIds.join(',');

      const response = await analyticsService.getRecentReadings(
        {
          site_id: siteIdsParam,
          user_id: user?.id,
        },
        controller.signal
      );

      if (
        controller.signal.aborted ||
        requestSequenceRef.current !== requestId
      ) {
        return;
      }

      const cards: SiteData[] = localSelectedSites.map(selectedSite => {
        const measurement = response?.measurements?.find(
          m => m.site_id === selectedSite._id
        );

        if (measurement) {
          const normalized = normalizeRecentReadingsToSiteData(
            [measurement],
            localPollutant as 'pm2_5' | 'pm10'
          );
          return normalized[0];
        } else {
          // Create a "no data" card for sites without measurements
          return {
            _id: selectedSite._id,
            name:
              selectedSite.name ||
              selectedSite.formatted_name ||
              selectedSite.generated_name ||
              'Unknown Site',
            location: selectedSite.country || 'Unknown Country',
            value: 0,
            status: 'no-value' as const,
            pollutant: localPollutant as 'pm2_5' | 'pm10',
            unit: 'μg/m³',
            trend: 'stable' as const,
            percentageDifference: 0,
          };
        }
      });

      setSiteCards(cards);
    } catch (err) {
      if (
        controller.signal.aborted ||
        requestSequenceRef.current !== requestId
      ) {
        return;
      }

      console.error('Error fetching recent readings:', err);

      const cards: SiteData[] = localSelectedSites.map(selectedSite => {
        return {
          _id: selectedSite._id,
          name:
            selectedSite.name ||
            selectedSite.formatted_name ||
            selectedSite.generated_name ||
            'Unknown Site',
          location: selectedSite.country || 'Unknown Country',
          value: 0,
          status: 'no-value' as const,
          pollutant: localPollutant as 'pm2_5' | 'pm10',
          unit: 'μg/m³',
          trend: 'stable' as const,
          percentageDifference: 0,
        };
      });
      setSiteCards(cards);
    } finally {
      if (requestSequenceRef.current === requestId) {
        setIsLoading(false);
      }

      if (requestAbortRef.current === controller) {
        requestAbortRef.current = null;
      }
    }
  }, [user?.id]);

  // Auto-fetch when selectedSiteIds or pollutant changes
  useEffect(() => {
    if (!enabled) {
      requestAbortRef.current?.abort();
      setIsLoading(false);
      setSiteCards([]);
      return;
    }
    fetchSiteCards();
  }, [fetchSiteCards, selectedSiteIdsKey, filters.pollutant, enabled]);

  const refetchSiteCards = useCallback(async () => {
    await fetchSiteCards();
  }, [fetchSiteCards]);

  return {
    siteCards,
    isLoading,
    error: null, // TODO: handle error from API
    refetch: refetchSiteCards,
  };
};

// Hook for downloading data
export const useDataDownload = () => {
  const { trigger, isMutating, error } = useDownloadData();

  const downloadData = useCallback(
    async (request: DataDownloadRequest, customFilename?: string) => {
      try {
        const response = await trigger(request);

        // Generate default filename if not provided
        const defaultFilename = `air-quality-data-${request.startDateTime.split('T')[0]}-to-${request.endDateTime.split('T')[0]}`;
        const baseFilename = customFilename || defaultFilename;

        // Ensure filename has correct extension
        const extension = request.downloadType;
        const filename = baseFilename.endsWith(`.${extension}`)
          ? baseFilename
          : `${baseFilename}.${extension}`;

        if (request.downloadType === 'csv') {
          // Handle CSV download
          const csvData = response as string;
          const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else if (request.downloadType === 'json') {
          // Handle JSON download
          const jsonData =
            response as import('@/shared/types/api').DataDownloadResponse;
          const dataStr = JSON.stringify(jsonData, null, 2);
          const blob = new Blob([dataStr], {
            type: 'application/json;charset=utf-8;',
          });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }

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
