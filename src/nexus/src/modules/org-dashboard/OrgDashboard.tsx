'use client';

import * as React from 'react';
import { usePostHog } from 'posthog-js/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useUser,
  useGroupCohorts,
  useCohort,
  useAppDispatch,
} from '@/shared/hooks';
import {
  useAnalyticsPreferences,
  useAnalyticsSiteCards,
} from '@/modules/analytics';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { normalizeCohortIds } from '@/shared/utils/cohortUtils';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { InfoBanner, WarningBanner, toast } from '@/shared/components/ui';
import { SuggestedLocations } from '@/modules/analytics/components/SuggestedLocations';
import { AqiLegend } from '@/modules/analytics';
import AddSavedLocations from '@/modules/location-insights/add-favorites';
import AddLocation from '@/modules/location-insights/add-location';
import MoreInsights from '@/modules/location-insights/more-insights';
import { openMoreInsights } from '@/shared/store/insightsSlice';
import { DashboardHeader } from './components/DashboardHeader';
import { FleetSummary } from './components/FleetSummary';
import { SavedLocationsGrid } from './components/SavedLocationsGrid';
import { TrendSection } from './components/TrendSection';
import { OrgDashboardSkeleton } from './components/OrgDashboardSkeleton';
import {
  getFriendlyErrorMessage,
  isReportableSiteCard,
} from './utils/measurements';
import type { SiteData } from '@/modules/analytics';
import type { PollutantType } from './types';
import { getAirQualityLevel } from '@/shared/utils/airQuality';

interface OrgDashboardProps {
  organizationSlug: string;
  className?: string;
}

/**
 * Organization dashboard — air-quality overview for the user's saved
 * locations (analytics preferences), reusing the exact same data services
 * and components used by analytics for the selected sites:
 *
 *   - Saved-location cards → GET /devices/readings/recent (useAnalyticsSiteCards)
 *   - Trend chart          → POST /analytics/dashboard/chart/d3/data (useAnalyticsChartData)
 *   - Fleet summary        → derived from the same site cards
 *
 * Data flow:
 *  1. Resolve the organization group from the URL slug (same pattern as the
 *     org map page); the primary cohort id is used only for the private-data
 *     visibility banner.
 *  2. Load the group-scoped user preferences. If the organization has saved
 *     sites → render the dashboard from exactly those preferences, while
 *     omitting locations that have no recent readings from cards and trends.
 *  3. No preferences yet → show SuggestedLocations so the organization can
 *     pick their sites (selection is saved as a group preference).
 *
 * All requests go through the token-authenticated server proxy
 * (createServerClient → /api/external). Keys are group-scoped and
 * AbortController-backed; the analytics hooks use a bounded retry policy.
 */
export const OrgDashboard: React.FC<OrgDashboardProps> = ({
  organizationSlug,
  className = '',
}) => {
  const posthog = usePostHog();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { activeGroup, groups, isLoading: userContextLoading } = useUser();
  const hasTrackedViewRef = React.useRef(false);
  const isRefreshingRef = React.useRef(false);
  const [isDashboardRefreshing, setIsDashboardRefreshing] =
    React.useState(false);

  const [pollutant, setPollutant] = React.useState<PollutantType>('pm2_5');
  const [isManageLocationsOpen, setIsManageLocationsOpen] =
    React.useState(false);
  const { config: selectedAqiConfig, isLoading: pollutantConfigLoading } =
    useAqiConfig(pollutant);

  const normalizedSlug = React.useMemo(
    () => (organizationSlug || '').trim().toLowerCase(),
    [organizationSlug]
  );

  const organizationGroup = React.useMemo(() => {
    return (
      groups?.find(
        group =>
          (group.organizationSlug || '').trim().toLowerCase() === normalizedSlug
      ) || null
    );
  }, [groups, normalizedSlug]);

  const organizationGroupId = organizationGroup?.id || '';
  const isOrgContextReady =
    !!organizationGroupId && activeGroup?.id === organizationGroupId;

  const unresolvedOrganizationSlug =
    !!normalizedSlug && !userContextLoading && !organizationGroupId;

  const {
    selectedSiteIds,
    selectedSites,
    isLoading: preferencesLoading,
  } = useAnalyticsPreferences({
    groupId: organizationGroupId || undefined,
    enabled: isOrgContextReady,
  });

  const hasSelectedSites = selectedSiteIds.length > 0;

  // Saved-location cards — GET /devices/readings/recent, the same service
  // the saved-locations view uses. Group-scoped, partial-failure tolerant, and
  // independent of the cohort endpoints.
  const {
    siteCards,
    isLoading: siteCardsLoading,
    isRefreshing: siteCardsRefreshing,
    error: siteCardsError,
    refetch: refetchSiteCards,
  } = useAnalyticsSiteCards({
    selectedSiteIds,
    selectedSites,
    enabled: isOrgContextReady,
    aqiConfig: selectedAqiConfig,
  });

  // Re-classify each card's AQI status with the loaded config. The hooks
  // may have processed readings while aqiConfig was still null, which
  // classifies every value as 'no-value'. This step ensures the cards
  // always reflect the live config once it loads.
  const classifiedCards = React.useMemo(() => {
    if (!selectedAqiConfig || siteCards.length === 0) return siteCards;
    return siteCards.map(card => {
      // Missing readings use value 0 as a placeholder. Never classify that
      // placeholder as Good after the AQI configuration becomes available.
      if (card.status === 'no-value') return card;

      return {
        ...card,
        status: getAirQualityLevel(
          card.value,
          card.pollutant as 'pm2_5' | 'pm10',
          selectedAqiConfig
        ),
      };
    });
  }, [siteCards, selectedAqiConfig]);

  // Keep saved locations in preferences as the source of truth, but only
  // show locations with recent readings in the cards and trend chart.
  const reportingCards = React.useMemo(
    () => classifiedCards.filter(isReportableSiteCard),
    [classifiedCards]
  );
  const reportingSiteIds = React.useMemo(
    () => reportingCards.map(card => card._id),
    [reportingCards]
  );
  const reportingSiteIdSet = React.useMemo(
    () => new Set(reportingSiteIds),
    [reportingSiteIds]
  );
  const reportingSites = React.useMemo(
    () => selectedSites.filter(site => reportingSiteIdSet.has(site._id)),
    [reportingSiteIdSet, selectedSites]
  );
  const missingRecentReadingCount = Math.max(
    0,
    selectedSites.length - reportingSiteIds.length
  );

  // Visibility check for the private-cohort warning banner (primary cohort).
  const { data: organizationGroupCohorts } = useGroupCohorts(
    organizationGroupId,
    !!organizationGroupId && isOrgContextReady
  );
  const cohortIds = React.useMemo(
    () => normalizeCohortIds(organizationGroupCohorts?.data ?? []),
    [organizationGroupCohorts?.data]
  );
  const primaryCohortId = React.useMemo(
    () => cohortIds.find(Boolean) || '',
    [cohortIds]
  );
  const { data: cohortData } = useCohort(
    primaryCohortId,
    !!primaryCohortId && isOrgContextReady
  );
  const isCohortPrivate = cohortData?.cohorts[0]?.visibility === false;

  // Block rendering while the org group switch is still in flight — without
  // this gate SuggestedLocations could render against the wrong group's
  // cohorts during an org switch.
  const isOrgSyncing =
    !userContextLoading && !unresolvedOrganizationSlug && !isOrgContextReady;

  const isInitialLoading =
    userContextLoading || preferencesLoading || isOrgSyncing;

  const mapHref = `/org/${encodeURIComponent(normalizedSlug)}/map`;

  const readingsError = React.useMemo(
    () => getFriendlyErrorMessage(siteCardsError),
    [siteCardsError]
  );

  const handleRefresh = React.useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsDashboardRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ['analytics'],
        refetchType: 'active',
      });
      await queryClient.invalidateQueries({
        queryKey: ['org-dashboard'],
        refetchType: 'active',
      });
      toast.success('Data refreshed', 'The dashboard has been updated.');
    } catch {
      toast.error('Refresh failed', 'We could not refresh the dashboard.');
    } finally {
      isRefreshingRef.current = false;
      setIsDashboardRefreshing(false);
    }
  }, [queryClient]);

  const handleCardClick = React.useCallback(
    (siteData: SiteData) => {
      const displayName = siteData.name || siteData.location || 'Location';
      dispatch(
        openMoreInsights({
          sites: [
            {
              _id: siteData._id,
              name: displayName,
              search_name: displayName,
              country: siteData.country,
              city: siteData.city,
              region: siteData.region,
            },
          ],
        })
      );
    },
    [dispatch]
  );

  React.useEffect(() => {
    if (isInitialLoading || hasTrackedViewRef.current) return;
    hasTrackedViewRef.current = true;
    posthog?.capture('organization_dashboard_viewed', {
      organization_group_id: organizationGroup?.id,
      organization_group_name: organizationGroup?.title,
      selected_site_count: selectedSites.length,
      cohort_id: primaryCohortId || null,
      pollutant,
      fleet_site_count: siteCards.length,
    });
  }, [
    isInitialLoading,
    organizationGroup?.id,
    organizationGroup?.title,
    selectedSites.length,
    primaryCohortId,
    pollutant,
    siteCards.length,
    posthog,
  ]);

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

  if (isInitialLoading) {
    return <OrgDashboardSkeleton className={className} />;
  }

  // No preferences yet — onboard the organization with suggested locations.
  if (!hasSelectedSites) {
    return (
      <div className={`space-y-8 ${className}`}>
        <DashboardHeader
          organizationTitle={organizationGroup?.title ?? 'Organization'}
          selectedSiteCount={0}
          mapHref={mapHref}
        />
        <SuggestedLocations favoriteSites={selectedSites} />
      </div>
    );
  }

  return (
    <div className={`space-y-5 ${className}`}>
      <DashboardHeader
        organizationTitle={organizationGroup?.title ?? 'Organization'}
        selectedSiteCount={selectedSites.length}
        isRefreshing={isDashboardRefreshing}
        onRefresh={handleRefresh}
        mapHref={mapHref}
        onManageLocations={() => setIsManageLocationsOpen(true)}
      />

      {missingRecentReadingCount > 0 && !siteCardsLoading && !readingsError && (
        <InfoBanner
          title="Some saved locations may not appear below"
          message={`We only show locations with recent readings in the cards and trend chart. ${missingRecentReadingCount} saved location${missingRecentReadingCount === 1 ? ' has' : 's have'} not reported recently, so it may be hidden for now. We will include it again when new data arrives.`}
        />
      )}

      {isCohortPrivate && (
        <WarningBanner
          title="Location data unavailable"
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
              to manage data visibility and make it public to view air quality
              measurements.
            </p>
          }
        />
      )}

      <FleetSummary
        siteCards={classifiedCards}
        pollutant={pollutant}
        aqiConfig={selectedAqiConfig}
        isLoading={siteCardsLoading}
        onRetry={() => void refetchSiteCards()}
      />

      <SavedLocationsGrid
        siteCards={reportingCards}
        pollutant={pollutant}
        aqiConfig={selectedAqiConfig}
        isLoading={siteCardsLoading}
        isRefreshing={siteCardsRefreshing}
        errorMessage={readingsError}
        onRefresh={() => void refetchSiteCards()}
        onCardClick={handleCardClick}
        onAddLocation={() => setIsManageLocationsOpen(true)}
      />

      <TrendSection
        siteIds={reportingSiteIds}
        selectedSites={reportingSites}
        pollutant={pollutant}
        onPollutantChange={setPollutant}
        aqiConfig={selectedAqiConfig}
        enabled={isOrgContextReady && !pollutantConfigLoading}
      />

      <AqiLegend aqiConfig={selectedAqiConfig} className="pt-2" />

      <AddSavedLocations
        isOpen={isManageLocationsOpen}
        onClose={() => setIsManageLocationsOpen(false)}
      />
      <AddLocation />
      <MoreInsights />
    </div>
  );
};
