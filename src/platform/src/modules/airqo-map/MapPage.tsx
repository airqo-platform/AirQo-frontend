'use client';

import React from 'react';
import { usePostHog } from 'posthog-js/react';
import { MapSidebar, EnhancedMap } from '@/modules/airqo-map';
import { useSitesByCountry, useMapReadings, useWAQICities } from './hooks';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedLocation,
  clearSelectedLocation,
} from '../../shared/store/selectedLocationSlice';
import type { RootState } from '../../shared/store';
import type { AirQualityReading } from '@/modules/airqo-map/components/map/MapNodes';
import type { MapReading } from '../../shared/types/api';
import { normalizeMapReadings } from './utils/dataNormalization';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';
import { hashId, trackEvent } from '@/shared/utils/analytics';
import {
  trackMapInteraction,
  trackFeatureUsage,
} from '@/shared/utils/enhancedAnalytics';
import { InfoBanner } from '@/shared/components/ui/banner';
import { useCohort } from '@/shared/hooks';

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
    className={`absolute top-4 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-2xl px-4 ${className ?? ''}`}
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
  const [selectedCountry, setSelectedCountry] = React.useState<string>(
    isOrganizationFlow ? '' : 'uganda'
  );
  const [locationDetailsLoading, setLocationDetailsLoading] =
    React.useState(false);
  const [flyToLocation, setFlyToLocation] = React.useState<
    { longitude: number; latitude: number; zoom?: number } | undefined
  >(undefined);
  const [selectedLocationId, setSelectedLocationId] = React.useState<
    string | null
  >(null);
  const [selectedPollutant, setSelectedPollutant] = React.useState<
    'pm2_5' | 'pm10'
  >('pm2_5');

  const flyToTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    return () => {
      if (flyToTimeoutRef.current) clearTimeout(flyToTimeoutRef.current);
    };
  }, []);

  // ── Analytics ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    posthog?.capture('map_viewed');
    trackEvent('map_viewed');
    trackFeatureUsage(posthog, 'map', 'view');
  }, [posthog]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { setCountry } = useSitesByCountry({
    country: selectedCountry,
    cohort_id: cohortId,
  });
  const {
    readings,
    isLoading: mapDataLoading,
    refetch,
  } = useMapReadings(cohortId);

  const firstCohortId = cohortId ? cohortId.split(',')[0] : '';
  const { data: cohortData } = useCohort(
    firstCohortId,
    isOrganizationFlow && !!firstCohortId
  );

  const hasNoMapData =
    isOrganizationFlow && cohortData?.cohorts[0]?.visibility === false;

  // WAQI disabled — wiring kept for future re-enablement
  const allCities = React.useMemo(() => [], []);
  const { citiesReadings: waqiReadings } = useWAQICities(allCities, 10, 500);

  const normalizedReadings = React.useMemo(() => {
    const airqoReadings = normalizeMapReadings(readings, selectedPollutant);
    if (isOrganizationFlow || cohortId) return airqoReadings;

    const seenIds = new Set<string>();
    return [...airqoReadings, ...waqiReadings].filter(r => {
      if (seenIds.has(r.id)) return false;
      seenIds.add(r.id);
      return true;
    });
  }, [readings, waqiReadings, selectedPollutant, cohortId, isOrganizationFlow]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = (query: string) => setSearchQuery(query);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setCountry(countryCode === 'all' ? undefined : countryCode);
  };

  const handlePollutantChange = (pollutant: 'pm2_5' | 'pm10') => {
    setSelectedPollutant(pollutant);
    trackMapInteraction(posthog, {
      action: 'filter_apply',
      filterType: 'pollutant',
      filterValue: pollutant,
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

  const handleClusterClick = () => setSelectedLocationId(null);
  const handleBackToList = () => dispatch(clearSelectedLocation());

  // ── Shared props ───────────────────────────────────────────────────────────
  const mapProps = {
    airQualityData: normalizedReadings,
    onNodeClick: handleNodeClick,
    onClusterClick: handleClusterClick,
    isLoading: mapDataLoading,
    onRefreshData: refetch,
    flyToLocation,
    selectedPollutant,
    onPollutantChange: handlePollutantChange,
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
   * Map pane:     height = 40dvh  (explicit, not relative to anything)
   * Sidebar pane: height = 60dvh  (explicit, not relative to anything)
   *               overflow: hidden (containment wall — nothing leaks out)
   *               MapSidebar reads var(--sidebar-height) = 60dvh
   *
   * CSS Custom Property approach:
   * We set --sidebar-height on the wrapper div that contains MapSidebar.
   * MapSidebar reads this via style={{ height: 'var(--sidebar-height, ...)' }}
   * This lets MapPage control the height without MapSidebar needing props for it.
   * ─────────────────────────────────────────────────────────────────────────
   */
  const contentHeight = `calc(100dvh - ${navHeight}px)`;

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
          {hasNoMapData && <PrivateOrgBanner />}
          <EnhancedMap {...mapProps} />
        </div>
      </div>

      {/* ── Mobile layout (< md) ─────────────────────────────────────────
       *
       *  Both panes use explicit dvh heights — independent of any parent.
       *  No wrapper needs a height. No h-full chains anywhere.
       *
       *  Map pane:  40dvh, overflow-hidden
       *    — map tiles/controls can't push the pane taller
       *
       *  Sidebar pane:  60dvh, overflow-hidden
       *    — this is the CONTAINMENT WALL
       *    — country list toggle: display change only, no height leak
       *    — accordion expansion: scrolls inside MapSidebar, can't escape
       *    — detail panel expansion: same
       *    — sets --sidebar-height: 60dvh so MapSidebar fills it exactly
       ──────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:hidden">
        {/* Map pane — 40dvh, absolutely fixed */}
        <div
          className="relative overflow-hidden flex-none"
          style={{ height: '40dvh' }}
        >
          {hasNoMapData && <PrivateOrgBanner className="text-sm" />}
          <EnhancedMap {...mapProps} />
        </div>

        {/* Sidebar pane — 60dvh, containment wall */}
        <div
          className="flex-none overflow-hidden"
          style={
            {
              height: '60dvh',
              '--sidebar-height': '60dvh',
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
