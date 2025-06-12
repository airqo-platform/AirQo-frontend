/**
 * Custom hook to manage chart sites for organizations
 * This hook fetches organization sites and populates the chart sites state
 * Similar to how individual users get their sites from preferences
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setChartSites } from '@/lib/store/services/charts/ChartSlice';
import { useSitesSummary } from '@/core/hooks/analyticHooks';

/**
 * Hook to automatically fetch and set chart sites for organization context
 * @param {string} organizationName - The organization name/slug
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether the hook should be active
 * @param {number} options.maxSites - Maximum number of sites to select (default: 10)
 * @returns {Object} - Object with loading state, error, and site information
 */
export const useOrgChartSites = (organizationName, options = {}) => {
  const { enabled = true, maxSites = 10 } = options;
  const dispatch = useDispatch();

  // Get current chart sites from Redux
  const chartSites = useSelector((state) => state.chart.chartSites);

  // Fetch organization sites using the existing hook
  const {
    data: sitesSummaryData,
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMessage,
  } = useSitesSummary(organizationName?.toLowerCase(), {
    enabled: enabled && !!organizationName,
  });

  // Effect to automatically set chart sites when organization sites are fetched
  useEffect(() => {
    if (
      enabled &&
      organizationName &&
      sitesSummaryData &&
      Array.isArray(sitesSummaryData) &&
      sitesSummaryData.length > 0
    ) {
      // Only set sites if chartSites is currently empty to avoid overriding user selections
      if (!chartSites || chartSites.length === 0) {
        // Filter for online sites first, fallback to all sites if no online sites
        const onlineSites = sitesSummaryData.filter(
          (site) => site.isOnline === true,
        );
        const sitesToUse =
          onlineSites.length > 0 ? onlineSites : sitesSummaryData;

        // Take up to maxSites sites and extract their IDs
        const selectedSiteIds = sitesToUse
          .slice(0, maxSites)
          .map((site) => site._id)
          .filter(Boolean);

        if (selectedSiteIds.length > 0) {
          dispatch(setChartSites(selectedSiteIds));
        }
      }
    }
  }, [
    dispatch,
    enabled,
    organizationName,
    sitesSummaryData,
    chartSites,
    maxSites,
  ]);

  // Effect to clear chart sites when organization changes or is cleared
  useEffect(() => {
    if (!enabled || !organizationName) {
      dispatch(setChartSites([]));
    }
  }, [dispatch, enabled, organizationName]);

  return {
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMessage,
    sitesData: sitesSummaryData || [],
    chartSites,
    hasSites: Array.isArray(sitesSummaryData) && sitesSummaryData.length > 0,
    totalSites: Array.isArray(sitesSummaryData) ? sitesSummaryData.length : 0,
    onlineSites: Array.isArray(sitesSummaryData)
      ? sitesSummaryData.filter((site) => site.isOnline === true).length
      : 0,
  };
};

export default useOrgChartSites;
