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
import {
  normalizeMapReadings,
  DEFAULT_POLLUTANT,
} from './utils/dataNormalization';

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

  // Use the new hooks
  const { setCountry } = useSitesByCountry({
    country: selectedCountry,
  });
  const { readings, isLoading: mapDataLoading, refetch } = useMapReadings();

  // WAQI data for major cities - memoize to prevent infinite re-renders
  const majorCities = React.useMemo(
    () => [
      // Europe
      'london',
      'paris',
      'berlin',
      'madrid',
      'rome',
      'amsterdam',
      'vienna',
      // America
      'new york',
      'los angeles',
      'chicago',
      'houston',
      'phoenix',
      'philadelphia',
      // Asia
      'tokyo',
      'delhi',
      'shanghai',
      'mumbai',
      'beijing',
      'seoul',
      'bangkok',
    ],
    []
  );
  const { citiesReadings: waqiReadings, isLoading: waqiLoading } =
    useWAQICities(majorCities);

  // Normalize map readings for display
  const normalizedReadings = React.useMemo(() => {
    const airqoReadings = normalizeMapReadings(readings, DEFAULT_POLLUTANT);
    // Combine AirQo and WAQI readings
    return [...airqoReadings, ...waqiReadings];
  }, [readings, waqiReadings]);

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
      // Set the selected location ID for active state
      setSelectedLocationId(locationId);

      // Fly to the location on the map
      if (locationData) {
        setFlyToLocation({
          longitude: locationData.longitude,
          latitude: locationData.latitude,
          zoom: 14, // Good zoom level for individual locations
        });

        // Clear the flyToLocation after animation completes
        setTimeout(() => {
          setFlyToLocation(undefined);
        }, 1100); // Slightly longer than animation duration
      } else {
        // Fallback: try to find in readings (for backward compatibility)
        const reading = readings.find(
          r => r.site_id === locationId || r._id === locationId
        );
        if (reading && reading.siteDetails) {
          setFlyToLocation({
            longitude: reading.siteDetails.approximate_longitude,
            latitude: reading.siteDetails.approximate_latitude,
            zoom: 14,
          });

          setTimeout(() => {
            setFlyToLocation(undefined);
          }, 1100);
        }
      }

      // Clear any selected location from Redux (we don't need details panel)
      dispatch(clearSelectedLocation());
    } catch (error) {
      console.error('Error flying to location:', error);
    }
  };

  const handleNodeClick = async (reading: AirQualityReading) => {
    console.log('Node clicked:', reading);
    setLocationDetailsLoading(true);

    try {
      // Create a serializable version of the reading
      const serializableReading: AirQualityReading = {
        ...reading,
        lastUpdated:
          reading.lastUpdated instanceof Date
            ? reading.lastUpdated.toISOString()
            : reading.lastUpdated,
      };

      // Clear the selected location ID from sidebar when clicking on map node
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
    // Clear the selected location ID from sidebar when clicking on cluster
    setSelectedLocationId(null);
    // For clusters, we could show cluster summary or zoom in
    // For now, just log it
  };

  const handleBackToList = () => {
    dispatch(clearSelectedLocation());
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full overflow-visible shadow rounded">
        {/* Left Sidebar */}
        <div className="flex-shrink-0 h-full">
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
          />
        </div>

        {/* Right Map Area */}
        <div className="flex-1 min-w-0 h-full">
          <EnhancedMap
            airQualityData={normalizedReadings}
            onNodeClick={handleNodeClick}
            onClusterClick={handleClusterClick}
            isLoading={mapDataLoading || waqiLoading}
            onRefreshData={refetch}
            flyToLocation={flyToLocation}
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
            isLoading={mapDataLoading || waqiLoading}
            onRefreshData={refetch}
            flyToLocation={flyToLocation}
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
          />
        </div>
      </div>
    </>
  );
};

export default MapPage;
