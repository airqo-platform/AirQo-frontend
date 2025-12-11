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
// import citiesData from './data/cities.json';
import { hashId, trackEvent } from '@/shared/utils/analytics';
import { InfoBanner } from '@/shared/components/ui/banner';

interface MapPageProps {
  cohortId?: string;
  isOrganizationFlow?: boolean;
}

const MapPage: React.FC<MapPageProps> = ({
  cohortId,
  isOrganizationFlow = false,
}) => {
  const dispatch = useDispatch();
  const posthog = usePostHog();
  const selectedLocation = useSelector(
    (state: RootState): MapReading | AirQualityReading | null => {
      const reading = state.selectedLocation.selectedReading;
      if (
        reading &&
        'lastUpdated' in reading &&
        typeof reading.lastUpdated === 'string'
      ) {
        // Convert string back to Date for AirQualityReading
        return {
          ...reading,
          lastUpdated: new Date(reading.lastUpdated),
        } as AirQualityReading;
      }
      return reading as MapReading | AirQualityReading | null;
    }
  );

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState<string>(
    // For user flow: default to 'uganda', for org flow: wait for dynamic selection
    isOrganizationFlow ? '' : 'uganda'
  );
  const [locationDetailsLoading, setLocationDetailsLoading] =
    React.useState(false);
  const [flyToLocation, setFlyToLocation] = React.useState<
    | {
        longitude: number;
        latitude: number;
        zoom?: number;
      }
    | undefined
  >(undefined);
  const [selectedLocationId, setSelectedLocationId] = React.useState<
    string | null
  >(null);
  const [selectedPollutant, setSelectedPollutant] = React.useState<
    'pm2_5' | 'pm10'
  >('pm2_5');

  const flyToTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (flyToTimeoutRef.current) {
        clearTimeout(flyToTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    posthog?.capture('map_viewed');
    trackEvent('map_viewed');
  }, [posthog]);

  const handlePollutantChange = (pollutant: 'pm2_5' | 'pm10') => {
    setSelectedPollutant(pollutant);
  };

  const { setCountry } = useSitesByCountry({
    country: selectedCountry,
    cohort_id: cohortId,
  });
  const {
    readings,
    isLoading: mapDataLoading,
    refetch,
  } = useMapReadings(cohortId);

  // Check if map data is completely empty (organization info is private)
  const hasNoMapData =
    !mapDataLoading && readings.length === 0 && isOrganizationFlow;

  // Disable WAQI data loading - keep logic for future enablement
  const allCities = React.useMemo(() => {
    // Temporarily disabled WAQI data loading
    // if (isOrganizationFlow) return [];
    // if (cohortId) return [];
    // return citiesData.map(city => city.toLowerCase().replace(/\s+/g, ' '));
    return [];
  }, []);

  const { citiesReadings: waqiReadings } = useWAQICities(allCities, 10, 500);

  const normalizedReadings = React.useMemo(() => {
    const airqoReadings = normalizeMapReadings(readings, selectedPollutant);

    if (isOrganizationFlow) {
      return airqoReadings;
    }

    if (cohortId) {
      return airqoReadings;
    }

    const combined = [...airqoReadings, ...waqiReadings];
    const seenIds = new Set<string>();
    return combined.filter(reading => {
      if (seenIds.has(reading.id)) {
        return false;
      }
      seenIds.add(reading.id);
      return true;
    });
  }, [readings, waqiReadings, selectedPollutant, cohortId, isOrganizationFlow]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCountrySelect = (countryCode: string) => {
    const countryName = countryCode === 'all' ? undefined : countryCode;
    setSelectedCountry(countryCode);
    setCountry(countryName);
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

      if (locationData) {
        setFlyToLocation({
          longitude: locationData.longitude,
          latitude: locationData.latitude,
          zoom: 10,
        });

        if (flyToTimeoutRef.current) {
          clearTimeout(flyToTimeoutRef.current);
        }
        flyToTimeoutRef.current = setTimeout(() => {
          setFlyToLocation(undefined);
          flyToTimeoutRef.current = null;
        }, 1100);
      } else {
        const reading = readings.find(
          r => r.site_id === locationId || r._id === locationId
        );
        if (reading && reading.siteDetails) {
          setFlyToLocation({
            longitude: reading.siteDetails.approximate_longitude,
            latitude: reading.siteDetails.approximate_latitude,
            zoom: 10,
          });

          if (flyToTimeoutRef.current) {
            clearTimeout(flyToTimeoutRef.current);
          }
          flyToTimeoutRef.current = setTimeout(() => {
            setFlyToLocation(undefined);
            flyToTimeoutRef.current = null;
          }, 1100);
        }
      }

      dispatch(clearSelectedLocation());
    } catch (error) {
      console.error('Error flying to location:', error);
    }
  };

  const handleNodeClick = async (reading: AirQualityReading) => {
    setLocationDetailsLoading(true);

    try {
      const serializableReading: AirQualityReading = {
        ...reading,
        lastUpdated:
          reading.lastUpdated instanceof Date
            ? reading.lastUpdated.toISOString()
            : reading.lastUpdated,
      };

      setSelectedLocationId(null);
      dispatch(setSelectedLocation(serializableReading));
    } catch (error) {
      console.error('Error loading location details:', error);
    } finally {
      setLocationDetailsLoading(false);
    }
  };

  const handleClusterClick = () => {
    setSelectedLocationId(null);
  };

  const handleBackToList = () => {
    dispatch(clearSelectedLocation());
  };

  return (
    <>
      <div className="hidden md:flex h-full overflow-visible shadow rounded">
        <div className="flex-shrink-0 md:ml-2 h-full">
          <MapSidebar
            onSearch={handleSearch}
            onCountrySelect={handleCountrySelect}
            onLocationSelect={handleLocationSelect}
            searchQuery={searchQuery}
            selectedCountry={selectedCountry}
            selectedMapReading={selectedLocation}
            selectedLocationId={selectedLocationId}
            onBackToList={handleBackToList}
            locationDetailsLoading={locationDetailsLoading}
            selectedPollutant={selectedPollutant}
            cohort_id={cohortId}
            isOrganizationFlow={isOrganizationFlow}
          />
        </div>

        <div className="flex-1 min-w-0 h-full relative">
          {/* Info Banner for Private Organization Data */}
          {hasNoMapData && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[10000] w-full max-w-2xl px-4">
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
                    to manage data visibility and make it public to view air
                    quality measurements.
                  </>
                }
                className="shadow-lg bg-white/95 backdrop-blur-sm z-[10000] border-blue-200"
              />
            </div>
          )}
          <EnhancedMap
            airQualityData={normalizedReadings}
            onNodeClick={handleNodeClick}
            onClusterClick={handleClusterClick}
            isLoading={mapDataLoading}
            onRefreshData={refetch}
            flyToLocation={flyToLocation}
            selectedPollutant={selectedPollutant}
            onPollutantChange={handlePollutantChange}
          />
        </div>
      </div>

      <div className="flex flex-col h-full md:hidden">
        <div className="h-1/2 flex-shrink-0 relative">
          {/* Info Banner for Private Organization Data */}
          {hasNoMapData && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[10000] w-full px-4">
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
                    to manage data visibility and make it public to view air
                    quality measurements.
                  </>
                }
                className="shadow-lg bg-white/95 backdrop-blur-sm border-blue-200 text-sm"
              />
            </div>
          )}
          <EnhancedMap
            airQualityData={normalizedReadings}
            onNodeClick={handleNodeClick}
            onClusterClick={handleClusterClick}
            isLoading={mapDataLoading}
            onRefreshData={refetch}
            flyToLocation={flyToLocation}
            selectedPollutant={selectedPollutant}
            onPollutantChange={handlePollutantChange}
          />
        </div>

        <div className="flex-1 min-h-0">
          <MapSidebar
            className="h-full rounded-none"
            onSearch={handleSearch}
            onCountrySelect={handleCountrySelect}
            onLocationSelect={handleLocationSelect}
            searchQuery={searchQuery}
            selectedCountry={selectedCountry}
            selectedMapReading={selectedLocation}
            selectedLocationId={selectedLocationId}
            onBackToList={handleBackToList}
            selectedPollutant={selectedPollutant}
            cohort_id={cohortId}
            isOrganizationFlow={isOrganizationFlow}
          />
        </div>
      </div>
    </>
  );
};

export default MapPage;
