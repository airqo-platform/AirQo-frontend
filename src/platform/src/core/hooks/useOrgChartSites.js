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

  // Get user preferences to check if user has manually selected sites
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences?.[0],
  );

  // Get current active group to track organization changes
  const activeGroup = useSelector((state) => state.groups?.activeGroup);
  // Fetch organization sites using the existing hook
  const {
    data: sitesSummaryData,
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMessage,
  } = useSitesSummary(organizationName?.toLowerCase(), {
    enabled: enabled && !!organizationName,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnVisibilityChange: false, // Prevent refetch when tab becomes visible again
  });

  // Clear chart sites when organization changes (before new data loads)
  useEffect(() => {
    if (enabled && organizationName) {
      // Clear chart sites immediately when organization changes
      // This prevents showing previous organization's data
      dispatch(setChartSites([]));
    }
  }, [dispatch, enabled, organizationName, activeGroup?._id]);
  // Effect to automatically set chart sites when organization sites are fetched
  useEffect(() => {
    if (
      enabled &&
      organizationName &&
      sitesSummaryData &&
      Array.isArray(sitesSummaryData) &&
      sitesSummaryData.length > 0
    ) {
      // Check if user has manually selected sites in their preferences
      const userSelectedSites = preferences?.selected_sites;

      if (userSelectedSites && userSelectedSites.length > 0) {
        // User has preferences - use their selected sites (limited to maxSites)
        const selectedSiteIds = userSelectedSites
          .slice(0, maxSites)
          .map((site) => site._id)
          .filter(Boolean);

        if (selectedSiteIds.length > 0) {
          dispatch(setChartSites(selectedSiteIds));
        }
      } else {
        // No user preferences - auto-select from available sites
        // Always set sites when we have org data to ensure proper updates during org switches

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

        // Always dispatch to ensure sites are set for the new organization
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
    maxSites,
    preferences, // Add preferences to trigger updates when user preferences change
    activeGroup?._id, // Include activeGroup ID to trigger updates on org changes
  ]);
  // Only clear chart sites when explicitly disabled or organization is completely removed
  useEffect(() => {
    if (!enabled && organizationName) {
      // Only clear if explicitly disabled
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
