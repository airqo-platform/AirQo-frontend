'use client';

import React from 'react';
import { MapSidebar, EnhancedMap } from '@/modules/airqo-map';
import { useSitesByCountry, useMapReadings, useWAQICities } from './hooks';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedLocation,
  clearSelectedLocation,
} from '../../shared/store/selectedLocationSlice';
import type { RootState } from '../../shared/store';
import type {
  AirQualityReading,
  ClusterData,
} from '@/modules/airqo-map/components/map/MapNodes';
import type { MapReading } from '../../shared/types/api';
import { normalizeMapReadings } from './utils/dataNormalization';
import citiesData from './data/cities.json';

const MapPage = () => {
  const dispatch = useDispatch();
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
  const [selectedCountry, setSelectedCountry] =
    React.useState<string>('uganda');
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

  // Ref to store timeout ID for flyToLocation cleanup
  const flyToTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (flyToTimeoutRef.current) {
        clearTimeout(flyToTimeoutRef.current);
      }
    };
  }, []);

  const handlePollutantChange = (pollutant: 'pm2_5' | 'pm10') => {
    setSelectedPollutant(pollutant);
  };

  // Use the new hooks
  const { setCountry } = useSitesByCountry({
    country: selectedCountry,
  });
  const { readings, isLoading: mapDataLoading, refetch } = useMapReadings();

  // WAQI data for major cities - progressive loading to optimize performance
  const allCities = React.useMemo(() => {
    return citiesData.map(city => city.toLowerCase().replace(/\s+/g, ' '));
  }, []);

  const { citiesReadings: waqiReadings } = useWAQICities(allCities, 10, 500); // Load 10 cities per batch with 500ms delay

  // Normalize map readings - prioritize AirQo data
  const normalizedReadings = React.useMemo(() => {
    const airqoReadings = normalizeMapReadings(readings, selectedPollutant);
    const combined = [...airqoReadings, ...waqiReadings];
    // Remove duplicates based on ID to prevent React key conflicts
    const seenIds = new Set<string>();
    return combined.filter(reading => {
      if (seenIds.has(reading.id)) {
        return false;
      }
      seenIds.add(reading.id);
      return true;
    });
  }, [readings, waqiReadings, selectedPollutant]);

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
      setSelectedLocationId(locationId);

      if (locationData) {
        setFlyToLocation({
          longitude: locationData.longitude,
          latitude: locationData.latitude,
          zoom: 14,
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
            zoom: 14,
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
    console.log('Node clicked:', reading);
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

  const handleClusterClick = (cluster: ClusterData) => {
    console.log('Cluster clicked:', cluster);
    setSelectedLocationId(null);
  };

  const handleBackToList = () => {
    dispatch(clearSelectedLocation());
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full overflow-visible shadow rounded">
        {/* Left Sidebar */}
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
          />
        </div>

        {/* Right Map Area */}
        <div className="flex-1 min-w-0 h-full">
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

      {/* Mobile/Tablet Layout */}
      <div className="flex flex-col h-full md:hidden">
        {/* Map Area - Top 1/3 */}
        <div className="h-1/2 flex-shrink-0">
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

        {/* Sidebar Area - Bottom 2/3 */}
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
          />
        </div>
      </div>
    </>
  );
};

export default MapPage;
