'use client';

import * as React from 'react';
import { usePostHog } from 'posthog-js/react';
import { useUser } from '@/shared/hooks/useUser';
import { useGroupCohorts, useCohort } from '@/shared/hooks';
import { useAnalyticsPreferences } from '@/modules/analytics';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { normalizeCohortIds } from '@/shared/utils/cohortUtils';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { WarningBanner } from '@/shared/components/ui';
import { ErrorState } from '@/shared/components/ui/error-state';
import { SuggestedLocations } from '@/modules/analytics/components/SuggestedLocations';
import AddFavorites from '@/modules/location-insights/add-favorites';
import { DashboardHeader } from './components/DashboardHeader';
import { FleetSummary } from './components/FleetSummary';
import { SavedLocationsGrid } from './components/SavedLocationsGrid';
import { TrendSection } from './components/TrendSection';
import { AqiScaleLegend } from './components/AqiScaleLegend';
import { OrgDashboardSkeleton } from './components/OrgDashboardSkeleton';
import {
  useCohortRecentMeasurements,
  useSitesAverages,
} from './hooks/useOrgMeasurements';
import { isAbortError, latestMeasurementPerSite } from './utils/measurements';
import type { PollutantType } from './types';

interface OrgDashboardProps {
  organizationSlug: string;
  className?: string;
}

/**
 * Organization dashboard — fleet air-quality overview driven by the user's
 * saved locations (analytics preferences), powered by the measurements v2
 * endpoints:
 *
 *   - Live fleet snapshot  → GET /devices/measurements/cohorts/{id}/recent
 *   - Fleet trend series   → GET /devices/measurements/cohorts/{id}/historical
 *   - Location trend badge → GET /devices/measurements/sites/{id}/averages
 *
 * Data flow:
 *  1. Resolve the organization group from the URL slug (same pattern as the
 *     org map page) and its cohort ids; the primary cohort drives the
 *     measurements endpoints (they accept a single cohort id in the path).
 *  2. Load the group-scoped user preferences. If the organization has saved
 *     sites → render the full dashboard (fleet summary, saved-location cards,
 *     trend) for exactly those locations.
 *  3. No preferences yet → show SuggestedLocations so the organization can
 *     pick their sites (selection is saved as a group preference and the
 *     dashboard then renders for those locations).
 *
 * All measurement requests go through the token-authenticated server proxy
 * (createServerClient → /api/external), never the browser JWT, because the
 * backend rejects the Authorization header for these endpoints. Keys are
 * group-scoped and AbortController-backed; abort errors never surface.
 */
export const OrgDashboard: React.FC<OrgDashboardProps> = ({
  organizationSlug,
  className = '',
}) => {
  const posthog = usePostHog();
  const { activeGroup, groups, isLoading: userContextLoading } = useUser();
  const hasTrackedViewRef = React.useRef(false);

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

  // Cohort resolution — AbortController-backed hook, shared SWR key with
  // the org map page (['group/cohorts', groupId]).
  const { data: organizationGroupCohorts } = useGroupCohorts(
    organizationGroupId,
    !!organizationGroupId && isOrgContextReady
  );

  const cohortIds = React.useMemo(
    () => normalizeCohortIds(organizationGroupCohorts?.data ?? []),
    [organizationGroupCohorts?.data]
  );

  // The measurements cohort endpoints take a single cohort id in the path —
  // use the primary cohort, matching the org map page's primaryCohortId.
  const primaryCohortId = React.useMemo(
    () => cohortIds.find(Boolean) || null,
    [cohortIds]
  );

  // Live fleet snapshot — recent by cohort id.
  const {
    measurements: recentMeasurements,
    isLoading: recentLoading,
    error: recentError,
    refetch: refreshRecent,
  } = useCohortRecentMeasurements({
    cohortId: primaryCohortId,
    enabled: isOrgContextReady && hasSelectedSites && !!primaryCohortId,
  });

  const latestBySite = React.useMemo(
    () => latestMeasurementPerSite(recentMeasurements),
    [recentMeasurements]
  );

  // Per-location week-over-week averages for the saved-location cards.
  const { averagesBySite, isLoading: averagesLoading } = useSitesAverages({
    siteIds: selectedSiteIds,
    enabled: isOrgContextReady && hasSelectedSites,
  });

  // Visibility check for the private-cohort warning banner.
  const { data: cohortData } = useCohort(
    primaryCohortId || '',
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

  const readingsLoading = recentLoading || averagesLoading;
  const readingsError =
    !isAbortError(recentError) && recentError ? recentError : null;

  const handleRefresh = async () => {
    await refreshRecent();
  };

  const lastUpdatedAt = React.useMemo(() => {
    let latest: string | null = null;
    latestBySite.forEach(measurement => {
      if (measurement.time && (!latest || measurement.time > latest)) {
        latest = measurement.time;
      }
    });
    return latest;
  }, [latestBySite]);

  React.useEffect(() => {
    if (isInitialLoading || hasTrackedViewRef.current) return;
    hasTrackedViewRef.current = true;
    posthog?.capture('organization_dashboard_viewed', {
      organization_group_id: organizationGroup?.id,
      organization_group_name: organizationGroup?.title,
      selected_site_count: selectedSites.length,
      cohort_id: primaryCohortId,
      pollutant,
      fleet_site_count: latestBySite.size,
    });
  }, [
    isInitialLoading,
    organizationGroup?.id,
    organizationGroup?.title,
    selectedSites.length,
    primaryCohortId,
    pollutant,
    latestBySite.size,
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
        isRefreshing={readingsLoading}
        lastUpdatedAt={lastUpdatedAt}
        onRefresh={handleRefresh}
        mapHref={mapHref}
        onManageLocations={() => setIsManageLocationsOpen(true)}
      />

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

      {readingsError ? (
        <ErrorState
          title="Unable to load live readings"
          description={readingsError}
          retryAction={{
            label: 'Retry',
            onClick: () => void handleRefresh(),
          }}
        />
      ) : (
        <FleetSummary
          latestBySite={latestBySite}
          selectedSites={selectedSites}
          pollutant={pollutant}
          aqiConfig={selectedAqiConfig}
          isLoading={readingsLoading}
        />
      )}

      <SavedLocationsGrid
        selectedSites={selectedSites}
        latestBySite={latestBySite}
        averagesBySite={averagesBySite}
        pollutant={pollutant}
        aqiConfig={selectedAqiConfig}
        isLoading={readingsLoading}
        isRefreshing={recentLoading}
        errorMessage={readingsError}
        onRefresh={handleRefresh}
      />

      <TrendSection
        cohortId={primaryCohortId}
        selectedSites={selectedSites}
        pollutant={pollutant}
        onPollutantChange={setPollutant}
        aqiConfig={selectedAqiConfig}
        enabled={isOrgContextReady && !pollutantConfigLoading}
      />

      <AqiScaleLegend
        pollutant={pollutant}
        aqiConfig={selectedAqiConfig}
        className="pt-2"
      />

      <AddFavorites
        isOpen={isManageLocationsOpen}
        onClose={() => setIsManageLocationsOpen(false)}
      />
    </div>
  );
};
