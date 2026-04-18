'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { usePostHog } from 'posthog-js/react';
import { QuickAccessCard, EmptyAnalyticsState, SuggestedLocations } from './';
import { ChartContainer } from '@/shared/components/charts';
import { DynamicChart } from '@/shared/components/charts';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { EmptyState } from '@/shared/components/ui/empty-state';
import {
  useAnalyticsSiteCards,
  useAnalyticsPreferences,
  useAnalyticsChartData,
} from '../hooks';
import { getPollutantLabel } from '@/shared/components/charts/utils';
import { useAnalytics } from '../hooks/useAnalytics';
import AddFavorites from '@/modules/location-insights/add-favorites';
import MoreInsights from '@/modules/location-insights/more-insights';
import AddLocation from '@/modules/location-insights/add-location';
import type { SiteData } from '../types';
import { openMoreInsights } from '@/shared/store/insightsSlice';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import { trackEvent } from '@/shared/utils/analytics';
import { useSitesData } from '@/shared/hooks/useSitesData';
import {
  useActiveGroupCohorts,
  useCohort,
  useGroupCohorts,
} from '@/shared/hooks';
import { WarningBanner } from '@/shared/components/ui/banner';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';
import { useUser } from '@/shared/hooks/useUser';
import logger from '@/shared/lib/logger';
import { AccessDenied } from '@/shared/components/AccessDenied';
import {
  trackChartInteraction,
  trackFeatureUsage,
} from '@/shared/utils/enhancedAnalytics';
import { normalizeCohortIds } from '@/shared/utils/cohortUtils';

interface AnalyticsDashboardProps {
  className?: string;
  isOrganizationFlow: boolean;
  organizationSlug?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  isOrganizationFlow,
  organizationSlug,
}) => {
  const dispatch = useDispatch();
  const posthog = usePostHog();
  const { activeGroup, groups, isLoading: userContextLoading } = useUser();

  // Get filters from Redux
  const { filters } = useAnalytics();

  // Local state for UI preferences (doesn't trigger data reloads)
  const [showIcons, setShowIcons] = useState(true);
  const [isFavoritesDialogOpen, setIsFavoritesDialogOpen] = useState(false);
  const hasTrackedDashboardViewRef = useRef(false);

  // Get user preferences and selected sites (primary data - always fetch first)
  const normalizedOrganizationSlug = React.useMemo(
    () => (organizationSlug || '').trim().toLowerCase(),
    [organizationSlug]
  );

  const organizationGroupId = React.useMemo(() => {
    if (!isOrganizationFlow || !normalizedOrganizationSlug) {
      return '';
    }

    return (
      groups?.find(
        group =>
          (group.organizationSlug || '').trim().toLowerCase() ===
          normalizedOrganizationSlug
      )?.id || ''
    );
  }, [groups, isOrganizationFlow, normalizedOrganizationSlug]);

  const isOrgContextReady =
    !isOrganizationFlow ||
    (!!organizationGroupId && activeGroup?.id === organizationGroupId);

  const {
    selectedSiteIds,
    selectedSites,
    isLoading: preferencesLoading,
  } = useAnalyticsPreferences({
    groupId: isOrganizationFlow ? organizationGroupId || undefined : undefined,
    enabled: isOrgContextReady,
  });

  // Determine if we need to check for available sites (only when user has no selected sites)
  // This conditional loading prevents double loading and ensures proper sequencing
  const hasSelectedSites = selectedSiteIds.length > 0;
  const shouldCheckAvailableSites =
    isOrgContextReady && !preferencesLoading && !hasSelectedSites;

  // Check if there are sites available in the organization (only when needed)
  // This is organization-specific via useActiveGroupCohortSites
  // Only enabled after preferences load and when user has no selected sites
  const {
    totalSites: availableSitesCount,
    isLoading: sitesCountLoading,
    error: sitesCountError,
    retry: retrySitesCountFetch,
  } = useSitesData({
    enabled: shouldCheckAvailableSites,
    initialPageSize: 1,
    maxLimit: 1,
  });

  // Get site cards data - only when user has selected sites
  const { siteCards, isLoading: siteCardsLoading } = useAnalyticsSiteCards({
    selectedSiteIds,
    selectedSites,
    enabled: isOrgContextReady,
  });

  // Get chart data for line chart - only when user has selected sites
  const {
    chartData: lineChartData,
    refresh: refreshLineChart,
    isLoading: lineChartLoading,
  } = useAnalyticsChartData(
    filters,
    'line',
    selectedSiteIds,
    isOrgContextReady
  );

  // Get chart data for bar chart - only when user has selected sites
  const {
    chartData: barChartData,
    refresh: refreshBarChart,
    isLoading: barChartLoading,
  } = useAnalyticsChartData(
    filters,
    'bar',
    selectedSiteIds,
    isOrgContextReady
  );

  const unresolvedOrganizationSlug =
    isOrganizationFlow &&
    !!normalizedOrganizationSlug &&
    !userContextLoading &&
    !organizationGroupId;

  // Get active group cohorts to check visibility in user flow.
  const {
    cohortIds: activeGroupCohortIds,
    isLoading: activeGroupCohortsLoading,
  } = useActiveGroupCohorts();

  // In organization flow, fetch cohorts by org slug resolved group to avoid stale active-group lookups.
  const {
    data: organizationGroupCohorts,
    isLoading: organizationCohortsLoading,
  } = useGroupCohorts(
    organizationGroupId,
    isOrganizationFlow && !!organizationGroupId
  );

  const cohortIds = React.useMemo(() => {
    const rawCohortIds = isOrganizationFlow
      ? organizationGroupCohorts?.data
      : activeGroupCohortIds;

    return normalizeCohortIds(rawCohortIds ?? []);
  }, [isOrganizationFlow, organizationGroupCohorts?.data, activeGroupCohortIds]);

  const cohortsLoading = isOrganizationFlow
    ? organizationCohortsLoading ||
      (!!normalizedOrganizationSlug &&
        !organizationGroupId &&
        userContextLoading)
    : activeGroupCohortsLoading;

  // Get cohort details for the first cohort to check visibility
  const firstCohortId = React.useMemo(
    () => cohortIds.find(Boolean) || '',
    [cohortIds]
  );
  const { data: cohortData } = useCohort(
    firstCohortId,
    !!firstCohortId && !cohortsLoading && isOrgContextReady
  );

  // Helper function to extract unique sites from chart data
  const extractSitesFromChartData = (chartData: NormalizedChartData[]) => {
    if (!chartData || !Array.isArray(chartData)) return [];

    const uniqueSiteIds = new Set<string>();

    // Collect unique site IDs from chart data
    chartData.forEach(point => {
      if (point.site_id) {
        uniqueSiteIds.add(point.site_id);
      }
    });

    // Match with selectedSites to get complete site information
    return Array.from(uniqueSiteIds)
      .map(siteId => {
        const siteData = selectedSites.find(site => site._id === siteId);
        return {
          _id: siteId,
          name:
            siteData?.name ||
            siteData?.formatted_name ||
            siteData?.generated_name ||
            'Unknown Site',
          search_name: siteData?.search_name,
          country: siteData?.country,
        };
      })
      .filter(site => site._id); // Remove any invalid entries
  };

  // Handle manage favorites
  const handleManageFavorites = () => {
    posthog?.capture('manage_favorites_clicked');
    trackEvent('manage_favorites_clicked');
    setIsFavoritesDialogOpen(true);
  };

  // Handle close favorites dialog
  const handleCloseFavoritesDialog = () => {
    setIsFavoritesDialogOpen(false);
  };

  // Handle refresh data for charts
  const handleRefreshLineChart = async () => {
    trackChartInteraction(posthog, {
      chartType: 'line',
      pollutant: filters.pollutant,
      timeRange: `${filters.startDate}_${filters.endDate}`,
      locationCount: selectedSites.length,
      action: 'refresh',
    });
    trackFeatureUsage(posthog, 'analytics_dashboard', 'refresh_line_chart', {
      pollutant: filters.pollutant,
      location_count: selectedSites.length,
    });
    return refreshLineChart?.();
  };

  const handleRefreshBarChart = async () => {
    trackChartInteraction(posthog, {
      chartType: 'bar',
      pollutant: filters.pollutant,
      timeRange: `${filters.startDate}_${filters.endDate}`,
      locationCount: selectedSites.length,
      action: 'refresh',
    });
    trackFeatureUsage(posthog, 'analytics_dashboard', 'refresh_bar_chart', {
      pollutant: filters.pollutant,
      location_count: selectedSites.length,
    });
    return refreshBarChart?.();
  };

  // Handle more insights
  const handleMoreInsights = (
    sites?: Array<{
      _id: string;
      name: string;
      search_name?: string;
      country?: string;
    }>
  ) => {
    posthog?.capture('more_insights_clicked', {
      source: 'analytics_dashboard',
      sites_count: sites?.length ?? selectedSites.length,
    });

    trackEvent('more_insights_clicked', {
      source: 'analytics_dashboard',
      sites_count: sites?.length ?? selectedSites.length,
    });

    // Use provided sites from chart, or fall back to selectedSites with proper data
    const sitesToUse =
      sites ||
      selectedSites.map(site => ({
        _id: site._id,
        name:
          site.name ||
          site.formatted_name ||
          site.generated_name ||
          'Unknown Site',
        search_name: site.search_name,
        country: site.country,
      }));

    dispatch(openMoreInsights({ sites: sitesToUse }));
  };

  // Handle individual card click - open more insights for specific site
  const handleCardClick = (siteData: SiteData) => {
    const selectedSite = {
      _id: siteData._id,
      name: siteData.name,
      search_name: siteData.name,
      country: siteData.location,
    };

    dispatch(openMoreInsights({ sites: [selectedSite] }));
  };
  // Determine if cohort data is private (not visible)
  const isCohortPrivate = cohortData?.cohorts[0]?.visibility === false;

  useEffect(() => {
    if (!sitesCountError) return;

    logger.warn(
      '[AnalyticsDashboard] Failed to fetch available sites count for empty state',
      {
        activeGroupId: activeGroup?.id ?? 'unknown',
        errorType: typeof sitesCountError,
      }
    );

    if (process.env.NODE_ENV === 'development') {
      logger.debug(
        '[AnalyticsDashboard] Sites count fetch error details',
        sitesCountError
      );
    }
  }, [sitesCountError, activeGroup?.id]);

  // Combined loading state - coordinated to show loading only once
  // When preferences are loading, we don't know if user has sites yet
  // Only check for available sites count after preferences are loaded
  const isInitialLoading =
    userContextLoading ||
    (isOrganizationFlow && !!organizationGroupId && !isOrgContextReady) ||
    preferencesLoading ||
    cohortsLoading ||
    (shouldCheckAvailableSites && sitesCountLoading);

  useEffect(() => {
    if (isInitialLoading) {
      return;
    }

    if (hasTrackedDashboardViewRef.current) {
      return;
    }

    hasTrackedDashboardViewRef.current = true;

    posthog?.capture('analytics_dashboard_viewed', {
      active_group_id: activeGroup?.id,
      active_group_name: activeGroup?.title,
      selected_site_count: selectedSites.length,
      selected_pollutant: filters.pollutant,
      frequency: filters.frequency,
      start_date: filters.startDate,
      end_date: filters.endDate,
    });

    trackFeatureUsage(posthog, 'analytics_dashboard', 'view', {
      selected_site_count: selectedSites.length,
      selected_pollutant: filters.pollutant,
      frequency: filters.frequency,
    });
  }, [
    activeGroup?.id,
    activeGroup?.title,
    filters.endDate,
    filters.frequency,
    filters.pollutant,
    filters.startDate,
    isInitialLoading,
    posthog,
    selectedSites.length,
  ]);

  // Show single, coordinated loading state
  if (isInitialLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        <LoadingState text="Loading dashboard..." />
      </div>
    );
  }

  if (unresolvedOrganizationSlug) {
    return (
      <div className={`min-h-[400px] ${className}`}>
        <AccessDenied
          title="Organization not found"
          message="We could not resolve that organization slug or you do not have access to it."
          showBackButton={false}
        />
      </div>
    );
  }

  // Determine what to show based on user's selected sites and available sites
  const hasSitesAvailable = availableSitesCount > 0;

  // Case 1: User has NO selected sites - check if sites are available for their organization
  if (!hasSelectedSites) {
    let emptyStateContent: React.ReactNode = null;
    const hasSitesCountError = Boolean(sitesCountError);

    if (hasSitesAvailable) {
      // Show suggested locations when sites are available in the active group
      emptyStateContent = <SuggestedLocations />;
    } else if (isOrganizationFlow) {
      // When the location refresh fails, show only the recovery state so we
      // do not stack it with the onboarding banner and create conflicting UI.
      emptyStateContent = hasSitesCountError ? (
        <EmptyState
          title="Unable to refresh available locations"
          description="We couldn't refresh your organization locations right now. Retry to check available locations again."
          action={{
            label: 'Retry',
            onClick: retrySitesCountFetch,
          }}
          compact
        />
      ) : (
        <EmptyAnalyticsState />
      );
    } else {
      // User flow should never show organization onboarding notice
      emptyStateContent = (
        <EmptyState
          title="No favorite locations yet"
          description={
            hasSitesCountError
              ? 'We could not verify available locations right now. Add locations to favorites to track trends and insights, or retry.'
              : 'Add locations to favorites to track trends and insights.'
          }
          action={
            hasSitesCountError
              ? {
                  label: 'Retry',
                  onClick: retrySitesCountFetch,
                }
              : {
                  label: 'Add favorite',
                  onClick: handleManageFavorites,
                }
          }
        />
      );
    }

    return (
      <div className={`space-y-8 ${className}`}>
        {emptyStateContent}

        {/* Add Favorites Dialog */}
        <AddFavorites
          isOpen={isFavoritesDialogOpen}
          onClose={handleCloseFavoritesDialog}
        />

        {/* More Insights Dialog */}
        <MoreInsights />

        {/* Add Location Dialog */}
        <AddLocation />
      </div>
    );
  }

  // Case 2: User HAS selected sites - show analytics dashboard with cards and charts
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Show banner if cohort data is private */}
      {isCohortPrivate && (
        <WarningBanner
          title="Location card data unavailable"
          message={
            <>
              Your organization&apos;s information is set to private. Use{' '}
              <a
                href={getEnvironmentAwareUrl('https://vertex.airqo.net/')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                AirQo Vertex
              </a>{' '}
              to manage data visibility and make it public to view air quality
              measurements.
            </>
          }
        />
      )}

      {/* Favorite Locations Card */}
      <QuickAccessCard
        sites={siteCards}
        onManageFavorites={handleManageFavorites}
        selectedPollutant={filters.pollutant}
        onCardClick={handleCardClick}
        isLoading={siteCardsLoading}
        showIcon={showIcons}
        onShowIconsChange={setShowIcons}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Air Pollution Trends Over Time */}
        <ChartContainer
          title={`Air Pollution Trends Over Time`}
          subtitle={`${getPollutantLabel(filters.pollutant)} levels over time`}
          exportOptions={{
            enablePDF: true,
            enablePNG: true,
            filename: 'air-pollution-trends',
          }}
          onRefresh={handleRefreshLineChart}
          onMoreInsights={handleMoreInsights}
          currentSites={extractSitesFromChartData(lineChartData)}
          loading={lineChartLoading}
        >
          <DynamicChart
            data={lineChartData}
            config={{
              type: 'line',
              showGrid: true,
              showTooltip: true,
              showLegend: true,
              height: 400,
            }}
            pollutant={filters.pollutant}
            frequency={filters.frequency}
            showReferenceLines={true}
            autoSelectType={false}
          />
        </ChartContainer>

        {/* Air Pollution Levels Distribution */}
        <ChartContainer
          title={`Air Pollution Levels Distribution`}
          subtitle={`Distribution of ${getPollutantLabel(filters.pollutant)} air quality levels`}
          exportOptions={{
            enablePDF: true,
            enablePNG: true,
            filename: 'air-pollution-distribution',
          }}
          onRefresh={handleRefreshBarChart}
          onMoreInsights={handleMoreInsights}
          currentSites={extractSitesFromChartData(barChartData)}
          loading={barChartLoading}
        >
          <DynamicChart
            data={barChartData}
            config={{
              type: 'bar',
              showGrid: true,
              showTooltip: true,
              showLegend: true,
              height: 400,
            }}
            pollutant={filters.pollutant}
            frequency={filters.frequency}
            autoSelectType={false}
          />
        </ChartContainer>
      </div>

      {/* Add Favorites Dialog */}
      <AddFavorites
        isOpen={isFavoritesDialogOpen}
        onClose={handleCloseFavoritesDialog}
      />

      {/* More Insights Dialog */}
      <MoreInsights />

      {/* Add Location Dialog */}
      <AddLocation />
    </div>
  );
};
