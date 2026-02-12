'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { usePostHog } from 'posthog-js/react';
import { QuickAccessCard, EmptyAnalyticsState, SuggestedLocations } from './';
import { ChartContainer } from '@/shared/components/charts';
import { DynamicChart } from '@/shared/components/charts';
import { InfoBanner } from '@/shared/components/ui/banner';
import Link from 'next/link';
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
import { getEnvironmentAwareUrl } from '@/shared/utils/url';
import { useSitesData } from '@/shared/hooks/useSitesData';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
}) => {
  const dispatch = useDispatch();
  const posthog = usePostHog();

  // Get filters from Redux
  const { filters } = useAnalytics();

  // Local state for UI preferences (doesn't trigger data reloads)
  const [showIcons, setShowIcons] = useState(true);

  // Get user preferences and selected sites
  const {
    selectedSiteIds,
    selectedSites,
    isLoading: preferencesLoading,
  } = useAnalyticsPreferences();

  // Get site cards data
  const { siteCards, isLoading: siteCardsLoading } = useAnalyticsSiteCards();

  // Get chart data for line chart
  const {
    chartData: lineChartData,
    refresh: refreshLineChart,
    isLoading: lineChartLoading,
  } = useAnalyticsChartData(filters, 'line');

  // Get chart data for bar chart
  const {
    chartData: barChartData,
    refresh: refreshBarChart,
    isLoading: barChartLoading,
  } = useAnalyticsChartData(filters, 'bar');

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

  // State for manage favorites dialog
  const [isFavoritesDialogOpen, setIsFavoritesDialogOpen] = useState(false);

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

  // Handle refresh data for line chart
  const handleRefreshLineChart = async () => {
    return refreshLineChart?.();
  };

  // Handle refresh data for bar chart
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
    // Prepare data for the specific site
    const selectedSite = {
      _id: siteData._id,
      name: siteData.name,
      search_name: siteData.name,
      country: siteData.location,
    };

    dispatch(openMoreInsights({ sites: [selectedSite] }));
  };

  // Fetch sites data to check if suggestions are available
  const { totalSites: availableSitesCount, isLoading: sitesLoading } =
    useSitesData({
      enabled: true,
      initialPageSize: 1, // Just need to check if sites exist
      maxLimit: 1,
    });

  // Combined loading state for initial data
  const isInitialLoading = preferencesLoading || siteCardsLoading;

  // Show suggested locations if no favorites are selected but sites are available
  if (!isInitialLoading && selectedSiteIds.length === 0) {
    // Check if there are sites available for suggestions
    const hasSitesAvailable = !sitesLoading && availableSitesCount > 0;

    return (
      <div className={`space-y-8 ${className}`}>
        {hasSitesAvailable ? (
          // Show suggested locations when sites are available
          <SuggestedLocations />
        ) : (
          // Show empty state when no sites are available
          <EmptyAnalyticsState onAddFavorites={handleManageFavorites} />
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

  // Check if all site cards have no data (organization info is private)
  const hasNoDataForAllSites =
    !isInitialLoading &&
    siteCards.length > 0 &&
    siteCards.every(card => card.status === 'no-value');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Info Banner for Private Organization Data */}
      {hasNoDataForAllSites && (
        <InfoBanner
          title="Location card data unavailable"
          message={
            <>
              Your organization&apos;s data is private. Update visibility
              settings in{' '}
              <Link
                href={getEnvironmentAwareUrl('https://vertex.airqo.net')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Vertex
              </Link>{' '}
              to view measurements.
            </>
          }
          className="mb-4"
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
