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
    nextPage,
    prevPage,
  } = usePaginatedSitesSummary(groupTitle || 'airqo', {
    enableInfiniteScroll: false,
    initialLimit: 6,
    search: searchQuery,
    swrOptions: { revalidateOnMount: true },
  });

  const filteredSites = useMemo(() => {
    if (!Array.isArray(sitesSummaryData) || sitesSummaryData.length === 0) {
      return [];
    }

    // Check if any sites have the isOnline property
    if (sitesSummaryData.some((site) => 'isOnline' in site)) {
      // If the server page includes an `isOnline` flag, prefer showing
      // online sites first but keep the full page returned by the server.
      // Previously we filtered to only online sites which reduced the
      // visible rows (e.g. 4 instead of the server page size 6). To
      // preserve the server page length, sort the page so online sites
      // appear first but return the entire page array.
      return [...sitesSummaryData].sort(
        (a, b) => (b.isOnline === true ? 1 : 0) - (a.isOnline === true ? 1 : 0),
      );
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
    nextPage,
    prevPage,
    refresh,
  };
};
