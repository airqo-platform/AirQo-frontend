import { useMemo } from 'react';
import { usePaginatedSitesSummary } from '@/core/hooks/usePaginatedData';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { useSelector } from 'react-redux';

/**
 * Returns all data needed by AddLocations with search support.
 */
export const useAddLocationsData = (searchQuery = '') => {
  const { id: activeGroupId, title: groupTitle, userID } = useGetActiveGroup();

  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  const selectedSiteIds = useMemo(() => {
    const first = preferencesData?.[0];
    return Array.isArray(first?.selected_sites)
      ? first.selected_sites.map((s) => s._id)
      : [];
  }, [preferencesData]);

  const {
    data: sitesSummaryData,
    isLoading,
    isError,
    error,
    meta,
    hasNextPage,
    loadMore,
    canLoadMore,
    refresh,
  } = usePaginatedSitesSummary(groupTitle || 'AirQo', {
    enableInfiniteScroll: true,
    search: searchQuery,
  });

  const filteredSites = useMemo(() => {
    if (!Array.isArray(sitesSummaryData) || sitesSummaryData.length === 0) {
      return [];
    }

    // Check if any sites have the isOnline property
    if (sitesSummaryData.some((site) => 'isOnline' in site)) {
      const onlineSites = sitesSummaryData.filter((s) => s.isOnline === true);
      // If there are online sites, return them; otherwise return all sites
      // This prevents showing empty data when all sites are offline
      return onlineSites.length > 0 ? onlineSites : sitesSummaryData;
    }

    // If no isOnline property, return all sites
    return sitesSummaryData;
  }, [sitesSummaryData]);

  return {
    activeGroupId,
    groupTitle,
    userID,
    selectedSiteIds,
    filteredSites,
    isLoading,
    isError,
    error,
    meta,
    hasNextPage,
    loadMore,
    canLoadMore,
    refresh,
  };
};
