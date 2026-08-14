'use client';

import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { MapSidebar, EnhancedMap } from '@/modules/airqo-map';
import { useMapReadings } from './hooks';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedLocation,
  clearSelectedLocation,
} from '../../shared/store/selectedLocationSlice';
import type { RootState } from '../../shared/store';
import type { AirQualityReading } from '@/modules/airqo-map/components/map/MapNodes';
import type { MapReading } from '../../shared/types/api';
import { normalizeMapReadings } from './utils/dataNormalization';
import {
  DATA_PROVIDER_ALL,
  extractDataProviders,
  getDataProviderDisplayLabel,
  readingMatchesDataProvider,
} from './utils/dataProviders';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';
import { hashId, trackEvent } from '@/shared/utils/analytics';
import {
  trackMapInteraction,
  trackFeatureUsage,
} from '@/shared/utils/enhancedAnalytics';
import { InfoBanner } from '@/shared/components/ui/banner';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { useCohort } from '@/shared/hooks';
import { AqAlertTriangle } from '@airqo/icons-react';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import type { PollutantType } from '@/shared/utils/airQuality';

interface MapPageProps {
  cohortId?: string;
  isOrganizationFlow?: boolean;
  /**
   * Height of the top navigation bar in pixels.
   * Used to compute the sidebar and map heights on desktop.
   * Defaults to 64px (standard AirQo nav height).
   */
  navHeight?: number;
}

// ─── Private org banner ───────────────────────────────────────────────────────

const PrivateOrgBanner: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`absolute top-28 left-4 right-4 z-[10000] md:top-16 ${className ?? ''}`}
  >
    <InfoBanner
      title="Map data unavailable"
      message={
        <>
          Your organization&apos;s information is set to private. Use{' '}
          <a
            href={getEnvironmentAwareUrl('https://vertex.airqo.net')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Vertex
          </a>{' '}
          to manage data visibility and make it public to view air quality
          measurements.
        </>
      }
      className="shadow-lg bg-white/95 backdrop-blur-sm border-blue-200"
    />
  </div>
);

const EmptyCohortBanner: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`absolute top-28 left-4 right-4 z-[10000] md:top-16 ${className ?? ''}`}
  >
    <InfoBanner
      title="No data available"
      message={<>This cohort contains no deployed devices yet.</>}
      className="shadow-lg bg-white/95 backdrop-blur-sm border-blue-200"
    />
  </div>
);

const NoPollutantDataBanner: React.FC<{
  pollutant: PollutantType;
  className?: string;
}> = ({ pollutant, className }) => (
  <div
    className={`absolute top-28 left-4 right-4 z-[10000] md:top-16 ${className ?? ''}`}
  >
    <InfoBanner
      title="No readings for this pollutant"
      message={
        <>
          This map has readings, but none are available for{' '}
          {pollutant === 'pm2_5' ? 'PM2.5' : 'PM10'} yet.
        </>
      }
      className="shadow-lg bg-white/95 backdrop-blur-sm border-amber-200"
    />
  </div>
);

const NoProviderDataBanner: React.FC<{
  provider: string;
  className?: string;
}> = ({ provider, className }) => (
  <div
    className={`absolute top-28 left-4 right-4 z-[10000] md:top-16 ${className ?? ''}`}
  >
    <InfoBanner
      title="No stations from this provider"
      message={
        <>
          No monitored stations report {getDataProviderDisplayLabel(provider)}{' '}
          data on this map.
        </>
      }
      className="shadow-lg bg-white/95 backdrop-blur-sm border-amber-200"
    />
  </div>
);

// ─── MapPage ──────────────────────────────────────────────────────────────────

const MapPage: React.FC<MapPageProps> = ({
  cohortId,
  isOrganizationFlow = false,
  navHeight = 64,
}) => {
  const dispatch = useDispatch();
  const posthog = usePostHog();

  // ── Redux ──────────────────────────────────────────────────────────────────
  const selectedLocation = useSelector(
    (state: RootState): MapReading | AirQualityReading | null => {
      const reading = state.selectedLocation.selectedReading;
      if (
        reading &&
        'lastUpdated' in reading &&
        typeof reading.lastUpdated === 'string'
      ) {
        return {
          ...reading,
          lastUpdated: new Date(reading.lastUpdated),
        } as AirQualityReading;
      }
      return reading as MapReading | AirQualityReading | null;
    }
  );

  // ── Local state ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState<
    string | undefined
  >(undefined);
  const [locationDetailsLoading, setLocationDetailsLoading] =
    React.useState(false);
  const [flyToLocation, setFlyToLocation] = React.useState<
    { longitude: number; latitude: number; zoom?: number } | undefined
  >(undefined);
  const [selectedLocationId, setSelectedLocationId] = React.useState<
    string | null
  >(null);
  const [selectedPollutant, setSelectedPollutant] =
    React.useState<PollutantType>('pm2_5');
  const [selectedDataProvider, setSelectedDataProvider] =
    React.useState<string>(DATA_PROVIDER_ALL);
  const {
    config: selectedAqiConfig,
    isLoading: pollutantConfigLoading,
    error: pollutantConfigError,
  } = useAqiConfig(selectedPollutant);

  const flyToTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const primaryCohortId = React.useMemo(() => {
    if (!cohortId) {
      return '';
    }

    return (
      cohortId
        .split(',')
        .map(id => id.trim())
        .find(Boolean) ?? ''
    );
  }, [cohortId]);

  const selectionContextKey = React.useMemo(
    () => `${isOrganizationFlow ? 'org' : 'user'}:${primaryCohortId || 'none'}`,
    [isOrganizationFlow, primaryCohortId]
  );

  // ── Cleanup ────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    return () => {
      if (flyToTimeoutRef.current) clearTimeout(flyToTimeoutRef.current);
    };
  }, []);

  React.useEffect(() => {
    dispatch(clearSelectedLocation());
    setSelectedLocationId(null);
    setFlyToLocation(undefined);
    setSelectedCountry(undefined);
    setSelectedDataProvider(DATA_PROVIDER_ALL);
    setLocationDetailsLoading(false);

    return () => {
      dispatch(clearSelectedLocation());
    };
  }, [dispatch, selectionContextKey]);

  // Read lat/lng/zoom from URL search params (e.g. analytics site details →
  // map). Declared AFTER the reset effect above so the reset runs first —
  // effects run in declaration order, and the reset would otherwise wipe the
  // URL target before the map ever sees it.
  const searchParams = useSearchParams();
  React.useEffect(() => {
    const lat = parseFloat(searchParams.get('lat') ?? '');
    const lng = parseFloat(searchParams.get('lng') ?? '');
    const zoom = parseFloat(searchParams.get('zoom') ?? '');
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setFlyToLocation({
        latitude: lat,
        longitude: lng,
        zoom: Number.isFinite(zoom) && zoom > 0 ? zoom : undefined,
      });
      scheduleFlyToClear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Analytics ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    posthog?.capture('map_viewed');
    trackEvent('map_viewed');
    trackFeatureUsage(posthog, 'map', 'view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Data ───────────────────────────────────────────────────────────────────
  const mapCohortFilter = isOrganizationFlow
    ? primaryCohortId || null
    : undefined;
  const {
    readings,
    isLoading: mapDataLoading,
    refetch,
  } = useMapReadings(mapCohortFilter);
  const {
    data: cohortData,
    isLoading: cohortLoading,
    error: cohortError,
    mutate: refetchCohort,
  } = useCohort(primaryCohortId, isOrganizationFlow && !!primaryCohortId);

  const isCohortFetchCanceled = React.useMemo(() => {
    if (!cohortError) {
      return false;
    }

    const candidate = cohortError as {
      name?: string;
      code?: string;
      message?: string;
    };

    return (
      candidate.name === 'AbortError' ||
      candidate.name === 'CanceledError' ||
      candidate.code === 'ERR_CANCELED' ||
      candidate.message === 'canceled'
    );
  }, [cohortError]);

  const normalizedReadings = React.useMemo(() => {
    const airqoReadings = normalizeMapReadings(readings, selectedPollutant);
    const dedupedReadings = new Map<string, (typeof airqoReadings)[number]>();

    airqoReadings.forEach(reading => {
      const dedupeKey = reading.siteId || reading.id;
      const existingReading = dedupedReadings.get(dedupeKey);

      if (
        !existingReading ||
        (!existingReading.isPrimary && reading.isPrimary)
      ) {
        dedupedReadings.set(dedupeKey, reading);
      }
    });

    return Array.from(dedupedReadings.values());
  }, [readings, selectedPollutant]);

  // Data-provider filter options are derived from the loaded readings (never
  // hard-coded), and filtering happens client-side — no extra API requests.
  const dataProviders = React.useMemo(
    () => extractDataProviders(normalizedReadings),
    [normalizedReadings]
  );

  const providerFilteredReadings = React.useMemo(() => {
    if (selectedDataProvider === DATA_PROVIDER_ALL) {
      return normalizedReadings;
    }
    return normalizedReadings.filter(reading =>
      readingMatchesDataProvider(reading, selectedDataProvider)
    );
  }, [normalizedReadings, selectedDataProvider]);

  const hasCohortError = Boolean(cohortError && !isCohortFetchCanceled);

  const hasNoMapData =
    !cohortLoading &&
    !hasCohortError &&
    isOrganizationFlow &&
    cohortData?.cohorts?.[0]?.visibility === false;

  const showEmptyCohortState =
    !cohortLoading &&
    !hasCohortError &&
    isOrganizationFlow &&
    !!primaryCohortId &&
    !mapDataLoading &&
    !pollutantConfigLoading &&
    readings.length === 0 &&
    !hasNoMapData;

  const showNoPollutantDataState =
    !mapDataLoading &&
    !pollutantConfigLoading &&
    readings.length > 0 &&
    normalizedReadings.length === 0;

  const showNoProviderDataState =
    !mapDataLoading &&
    selectedDataProvider !== DATA_PROVIDER_ALL &&
    normalizedReadings.length > 0 &&
    providerFilteredReadings.length === 0;

  const contentHeight = `calc(100dvh - ${navHeight}px)`;
  const isMdUp = useMediaQuery({ minWidth: 768 });

  if (hasCohortError) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center p-6">
        <EmptyState
          title="Unable to load cohort"
          description={
            cohortError instanceof Error
              ? cohortError.message
              : 'We could not load this cohort. Please try again.'
          }
          icon={<AqAlertTriangle size={48} />}
          action={{
            label: 'Retry',
            onClick: () => void refetchCohort(),
          }}
          className="min-h-[400px]"
        />
      </div>
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = (query: string) => setSearchQuery(query);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
  };

  const handlePollutantChange = (pollutant: 'pm2_5' | 'pm10') => {
    setSelectedPollutant(pollutant);
    trackMapInteraction(posthog, {
      action: 'filter_apply',
      filterType: 'pollutant',
      filterValue: pollutant,
    });
  };

  const handleDataProviderChange = (provider: string) => {
    setSelectedDataProvider(provider);
    trackMapInteraction(posthog, {
      action: 'filter_apply',
      filterType: 'data_provider',
      filterValue: provider,
    });
  };

  const scheduleFlyToClear = () => {
    if (flyToTimeoutRef.current) clearTimeout(flyToTimeoutRef.current);
    flyToTimeoutRef.current = setTimeout(() => {
      setFlyToLocation(undefined);
      flyToTimeoutRef.current = null;
    }, 1100);
  };

  const handleLocationSelect = async (
    locationId: string,
    locationData?: { latitude: number; longitude: number; name: string }
  ) => {
    try {
      posthog?.capture('map_location_selected', {
        location_id_hashed: hashId(locationId),
      });
      trackEvent('map_location_selected', {
        location_id_hashed: hashId(locationId),
      });

      setSelectedLocationId(locationId);

      const coords = locationData
        ? { longitude: locationData.longitude, latitude: locationData.latitude }
        : (() => {
            const reading = readings.find(
              r => r.site_id === locationId || r._id === locationId
            );
            if (!reading?.siteDetails) return null;
            return {
              longitude: reading.siteDetails.approximate_longitude,
              latitude: reading.siteDetails.approximate_latitude,
            };
          })();

      if (coords) {
        setFlyToLocation({ ...coords, zoom: 10 });
        scheduleFlyToClear();
      }

      dispatch(clearSelectedLocation());
    } catch (error) {
      console.error('Error flying to location:', error);
    }
  };

  const handleNodeClick = async (reading: AirQualityReading) => {
    setLocationDetailsLoading(true);
    try {
      dispatch(
        setSelectedLocation({
          ...reading,
          lastUpdated:
            reading.lastUpdated instanceof Date
              ? reading.lastUpdated.toISOString()
              : reading.lastUpdated,
        })
      );
      setSelectedLocationId(null);
    } catch (error) {
      console.error('Error loading location details:', error);
    } finally {
      setLocationDetailsLoading(false);
    }
  };

  const handleClusterClick = () => {
    setSelectedLocationId(null);
    dispatch(clearSelectedLocation());
  };
  const handleBackToList = () => dispatch(clearSelectedLocation());

  // ── Shared props ───────────────────────────────────────────────────────────
  const mapProps = {
    airQualityData: providerFilteredReadings,
    onNodeClick: handleNodeClick,
    onClusterClick: handleClusterClick,
    isLoading: mapDataLoading,
    onRefreshData: refetch,
    flyToLocation,
    selectedPollutant,
    aqiConfig: selectedAqiConfig,
    isAqiConfigLoading: pollutantConfigLoading,
    aqiConfigError: pollutantConfigError,
    onPollutantChange: handlePollutantChange,
    dataProviders,
    selectedDataProvider,
    onDataProviderChange: handleDataProviderChange,
    selectionContextKey,
    enableHoverTooltip: isMdUp,
  };

  const sidebarProps = {
    onSearch: handleSearch,
    onCountrySelect: handleCountrySelect,
    onLocationSelect: handleLocationSelect,
    searchQuery,
    selectedCountry,
    selectedMapReading: selectedLocation,
    selectedLocationId,
    onBackToList: handleBackToList,
    locationDetailsLoading,
    selectedPollutant,
    isPollutantLoading: pollutantConfigLoading,
    aqiConfig: selectedAqiConfig,
    cohort_id: cohortId,
    isOrganizationFlow,
  };

  /**
   * HEIGHT STRATEGY
   * ─────────────────────────────────────────────────────────────────────────
   * We set explicit dvh-based heights via inline styles on every container.
   * This breaks the h-full chain problem entirely — no element needs to
   * know what its parent's height is.
   *
   * dvh (dynamic viewport height) accounts for mobile browser chrome
   * (address bar, bottom nav) appearing/disappearing. It's equivalent to
   * vh on desktop but correct on mobile too.
   *
   * DESKTOP
   * ───────
   * The overall layout container: height = 100dvh - navHeight
   * Map column: fills 100% of the layout container (position absolute/fill)
   * Sidebar: height = 100dvh - navHeight (matches layout, set via CSS var
   *          on the wrapper so MapSidebar can read var(--sidebar-height))
   *
   * MOBILE
   * ──────
   * The overall layout container: height = 100dvh - navHeight (matches desktop)
   * Map pane:     height = 55%  of the container (majority for map usability)
   * Sidebar pane: height = 45%  of the container (scrollable location list)
   *               overflow: hidden (containment wall — nothing leaks out)
   *               MapSidebar reads var(--sidebar-height) = 100% of the pane
   *
   * Using percentages (not dvh) on mobile keeps map + sidebar + nav exactly
   * viewport-height — no 64px overflow below the fold.
   *
   * CSS Custom Property approach:
   * We set --sidebar-height on the wrapper div that contains MapSidebar.
   * MapSidebar reads this via style={{ height: 'var(--sidebar-height, ...)' }}
   * This lets MapPage control the height without MapSidebar needing props for it.
   * ─────────────────────────────────────────────────────────────────────────
   */
  return (
    <>
      {/* ── Desktop layout (md+) ─────────────────────────────────────────
       *
       *  Outer container: explicit height via inline style.
       *  No h-full chains — this element knows its own height from the viewport.
       *
       *  Sidebar wrapper: sets --sidebar-height CSS var so MapSidebar
       *  can size itself without needing an explicit height prop.
       *
       *  Map wrapper: position relative + explicit height so EnhancedMap
       *  (which is likely position:absolute fill internally) renders correctly.
       ──────────────────────────────────────────────────────────────────── */}
      <div
        className="hidden md:flex shadow rounded overflow-hidden"
        style={{ height: contentHeight }}
      >
        {/* Sidebar wrapper — sets CSS custom property for MapSidebar */}
        <div
          className="flex-none md:ml-2"
          style={
            {
              '--sidebar-height': contentHeight,
            } as React.CSSProperties
          }
        >
          <MapSidebar {...sidebarProps} />
        </div>

        {/* Map wrapper — fills remaining width, clips map overflow */}
        <div className="flex-1 min-w-0 relative overflow-hidden">
          {hasNoMapData ? (
            <PrivateOrgBanner />
          ) : showEmptyCohortState ? (
            <EmptyCohortBanner />
          ) : showNoPollutantDataState ? (
            <NoPollutantDataBanner pollutant={selectedPollutant} />
          ) : showNoProviderDataState ? (
            <NoProviderDataBanner provider={selectedDataProvider} />
          ) : null}
          {isMdUp && <EnhancedMap {...mapProps} />}
        </div>
      </div>

      {/* ── Mobile layout (< md) ─────────────────────────────────────────
       *
       *  Map pane:  55% of viewport minus nav (majority for map usability)
       *  Sidebar pane:  45% of viewport minus nav (scrollable location list)
       ──────────────────────────────────────────────────────────────────── */}
      <div
        className="flex flex-col md:hidden"
        style={{ height: contentHeight }}
      >
        {/* Map pane — 55% of remaining viewport space, explicitly fixed */}
        <div
          className="relative overflow-hidden flex-none min-w-0"
          style={{ height: '55%' }}
        >
          {hasNoMapData ? (
            <PrivateOrgBanner className="text-sm" />
          ) : showEmptyCohortState ? (
            <EmptyCohortBanner className="text-sm" />
          ) : showNoPollutantDataState ? (
            <NoPollutantDataBanner
              className="text-sm"
              pollutant={selectedPollutant}
            />
          ) : showNoProviderDataState ? (
            <NoProviderDataBanner
              className="text-sm"
              provider={selectedDataProvider}
            />
          ) : null}
          {!isMdUp && <EnhancedMap {...mapProps} />}
        </div>

        {/* Sidebar pane — 45% of remaining viewport space, containment wall */}
        <div
          className="flex-none overflow-hidden min-w-0"
          style={
            {
              height: '45%',
              '--sidebar-height': '100%',
            } as React.CSSProperties
          }
        >
          <MapSidebar {...sidebarProps} className="rounded-none" />
        </div>
      </div>
    </>
  );
};

export default MapPage;
