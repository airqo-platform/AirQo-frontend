'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { usePostHog } from 'posthog-js/react';
import { QuickAccessCard, EmptyAnalyticsState, SuggestedLocations } from './';
import { ChartContainer } from '@/shared/components/charts';
import { DynamicChart } from '@/shared/components/charts';
import { LoadingState } from '@/shared/components/ui/loading-state';
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
import { useActiveGroupCohorts, useCohort } from '@/shared/hooks';
import { InfoBanner } from '@/shared/components/ui/banner';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';
import { useUser } from '@/shared/hooks/useUser';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
}) => {
  const dispatch = useDispatch();
  const posthog = usePostHog();
  const { activeGroup } = useUser();

  // Get filters from Redux
  const { filters } = useAnalytics();

  // Local state for UI preferences (doesn't trigger data reloads)
  const [showIcons, setShowIcons] = useState(true);
  const [isFavoritesDialogOpen, setIsFavoritesDialogOpen] = useState(false);

  // Get user preferences and selected sites (primary data - always fetch first)
  const {
    selectedSiteIds,
    selectedSites,
    isLoading: preferencesLoading,
  } = useAnalyticsPreferences();

  // Determine if we need to check for available sites (only when user has no selected sites)
  // This conditional loading prevents double loading and ensures proper sequencing
  const hasSelectedSites = selectedSiteIds.length > 0;
  const shouldCheckAvailableSites = !preferencesLoading && !hasSelectedSites;

  // Check if there are sites available in the organization (only when needed)
  // This is organization-specific via useActiveGroupCohortSites
  // Only enabled after preferences load and when user has no selected sites
  const { totalSites: availableSitesCount, isLoading: sitesCountLoading } =
    useSitesData({
      enabled: shouldCheckAvailableSites,
      initialPageSize: 1,
      maxLimit: 1,
    });

  // Get site cards data - only when user has selected sites
  const { siteCards, isLoading: siteCardsLoading } = useAnalyticsSiteCards();

  // Get chart data for line chart - only when user has selected sites
  const {
    chartData: lineChartData,
    refresh: refreshLineChart,
    isLoading: lineChartLoading,
  } = useAnalyticsChartData(filters, 'line');

  // Get chart data for bar chart - only when user has selected sites
  const {
    chartData: barChartData,
    refresh: refreshBarChart,
    isLoading: barChartLoading,
  } = useAnalyticsChartData(filters, 'bar');

  // Get active group cohorts to check visibility
  const { cohortIds } = useActiveGroupCohorts();

  // Get cohort details for the first cohort to check visibility
  const { data: cohortData } = useCohort(
    cohortIds.length > 0 ? cohortIds[0] : '',
    cohortIds.length > 0
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
    return refreshLineChart?.();
  };

  const handleRefreshBarChart = async () => {
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
  // Combined loading state - coordinated to show loading only once
  // When preferences are loading, we don't know if user has sites yet
  // Only check for available sites count after preferences are loaded
  const isInitialLoading =
    preferencesLoading || (shouldCheckAvailableSites && sitesCountLoading);

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

  // Determine what to show based on user's selected sites and available sites
  const hasSitesAvailable = availableSitesCount > 0;

  // Check if the active organization is AirQo (open group)
  const isAirQoGroup = activeGroup?.organizationSlug === 'airqo';

  // Case 1: User has NO selected sites - check if sites are available for their organization
  if (!hasSelectedSites) {
    return (
      <div className={`space-y-8 ${className}`}>
        {hasSitesAvailable ? (
          // Show suggested locations when sites are available in the organization
          <SuggestedLocations />
        ) : (
          // Show empty state banner ONLY when:
          // 1. Organization has no sites at all AND
          // 2. It's NOT the AirQo open group
          !isAirQoGroup && <EmptyAnalyticsState />
        )}

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
        <InfoBanner
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
