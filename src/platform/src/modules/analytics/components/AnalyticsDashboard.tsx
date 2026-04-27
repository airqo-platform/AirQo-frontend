'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { usePostHog } from 'posthog-js/react';
import { QuickAccessCard, SuggestedLocations } from './';
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
import {
  useActiveGroupCohorts,
  useCohort,
  useGroupCohorts,
} from '@/shared/hooks';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';
import { useUser } from '@/shared/hooks/useUser';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { WarningBanner } from '@/shared/components/ui';
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

  const organizationGroup = React.useMemo(() => {
    if (!isOrganizationFlow || !normalizedOrganizationSlug) {
      return null;
    }

    return (
      groups?.find(
        group =>
          (group.organizationSlug || '').trim().toLowerCase() ===
          normalizedOrganizationSlug
      ) || null
    );
  }, [groups, isOrganizationFlow, normalizedOrganizationSlug]);

  const organizationGroupId = organizationGroup?.id || '';

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

  const hasSelectedSites = selectedSiteIds.length > 0;

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
  } = useAnalyticsChartData(filters, 'bar', selectedSiteIds, isOrgContextReady);

  const unresolvedOrganizationSlug =
    isOrganizationFlow &&
    !!normalizedOrganizationSlug &&
    !userContextLoading &&
    !organizationGroupId;

  // Get active group cohorts to check visibility in user flow.
  const { cohortIds: activeGroupCohortIds } = useActiveGroupCohorts();

  // In organization flow, fetch cohorts by org slug resolved group to avoid stale active-group lookups.
  const { data: organizationGroupCohorts } = useGroupCohorts(
    organizationGroupId,
    isOrganizationFlow && !!organizationGroupId
  );

  const cohortIds = React.useMemo(() => {
    const rawCohortIds = isOrganizationFlow
      ? organizationGroupCohorts?.data
      : activeGroupCohortIds;

    return normalizeCohortIds(rawCohortIds ?? []);
  }, [
    isOrganizationFlow,
    organizationGroupCohorts?.data,
    activeGroupCohortIds,
  ]);

  // Get cohort details for the first cohort to check visibility
  const firstCohortId = React.useMemo(
    () => cohortIds.find(Boolean) || '',
    [cohortIds]
  );
  const { data: cohortData } = useCohort(
    firstCohortId,
    !!firstCohortId && isOrgContextReady
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

  // Block the dashboard while the org group switch is still in flight.
  // Without this gate, isInitialLoading can be false before switchGroup runs
  // (because preferencesLoading=false when enabled=false), which causes
  // SuggestedLocations to render prematurely against the wrong group's cohorts.
  const isOrgSyncing =
    isOrganizationFlow &&
    !userContextLoading &&
    !unresolvedOrganizationSlug &&
    !isOrgContextReady;

  const isInitialLoading =
    userContextLoading || preferencesLoading || isOrgSyncing;

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

  // Case 1: User has NO selected sites - check if sites are available for their organization
  if (!hasSelectedSites) {
    let emptyStateContent: React.ReactNode = null;

    if (isOrganizationFlow) {
      // Show suggestions immediately for org flow and let that component
      // handle its own loading/error states.
      emptyStateContent = <SuggestedLocations favoriteSites={selectedSites} />;
    } else {
      // User flow should never show organization onboarding notice
      emptyStateContent = (
        <EmptyState
          title="No favorite locations yet"
          description={
            'Add locations to favorites to track trends and insights.'
          }
          action={{
            label: 'Add favorite',
            onClick: handleManageFavorites,
          }}
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
      {/* Favorite Locations Card */}
      <QuickAccessCard
        sites={siteCards}
        onManageFavorites={handleManageFavorites}
        selectedPollutant={filters.pollutant}
        onCardClick={handleCardClick}
        isLoading={siteCardsLoading}
        showIcon={showIcons}
        onShowIconsChange={setShowIcons}
        infoLine={
          isCohortPrivate
            ? 'Recent readings are unavailable while this organization is private.'
            : undefined
        }
        warningBanner={
          isCohortPrivate ? (
            <WarningBanner
              title="Location card data unavailable"
              message={
                <p>
                  Your organization&apos;s information is set to private. Use{' '}
                  <a
                    href={getEnvironmentAwareUrl('https://vertex.airqo.net/')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    AirQo Vertex
                  </a>{' '}
                  to manage data visibility and make it public to view air
                  quality measurements.
                </p>
              }
            />
          ) : undefined
        }
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
