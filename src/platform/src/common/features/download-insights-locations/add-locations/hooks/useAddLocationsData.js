import { useMemo } from 'react';
import { useSitesSummary } from '@/core/hooks/analyticHooks';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { useSelector } from 'react-redux';

/**
 * Returns all data needed by AddLocations.
 */
export const useAddLocationsData = () => {
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
  } = useSitesSummary((groupTitle || 'AirQo').toLowerCase(), {});

  const filteredSites = useMemo(() => {
    if (!Array.isArray(sitesSummaryData) || sitesSummaryData.length === 0) {
      return [];
    }
    if ('isOnline' in sitesSummaryData[0]) {
      const online = sitesSummaryData.filter((s) => s.isOnline === true);
      return online.length > 0 ? online : sitesSummaryData;
    }
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
  };
};
