'use client';

import React from 'react';
import { MapSidebar, EnhancedMap } from '@/modules/airqo-map';
import type {
  AirQualityReading,
  ClusterData,
} from '@/modules/airqo-map/components/map/MapNodes';

interface LocationData {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const MapPage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] =
    React.useState<LocationData | null>(null);
  const [locationDetailsLoading, setLocationDetailsLoading] =
    React.useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCountrySelect = (countryCode: string) => {
    console.log('Country selected:', countryCode);
  };

  const handleLocationSelect = async (locationId: string) => {
    console.log('Location selected from sidebar:', locationId);
    setLocationDetailsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock location data based on the images - this would normally come from an API
      const mockLocationData: LocationData = {
        _id: locationId,
        name: 'Kyebando',
        latitude: 0.347596,
        longitude: 32.58252,
      };

      setSelectedLocation(mockLocationData);
    } catch (error) {
      console.error('Error loading location details:', error);
    } finally {
      setLocationDetailsLoading(false);
    }
  };

  const handleNodeClick = async (reading: AirQualityReading) => {
    console.log('Node clicked:', reading);
    setLocationDetailsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Convert the reading data to LocationData format
      const locationData: LocationData = {
        _id: reading.id,
        name: reading.locationName || 'Unknown Location',
        latitude: reading.latitude,
        longitude: reading.longitude,
      };

      setSelectedLocation(locationData);
    } catch (error) {
      console.error('Error loading location details:', error);
    } finally {
      setLocationDetailsLoading(false);
    }
  };

  const handleClusterClick = (cluster: ClusterData) => {
    console.log('Cluster clicked:', cluster);
    // For clusters, we could show cluster summary or zoom in
    // For now, just log it
  };

  const handleBackToList = () => {
    setSelectedLocation(null);
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full overflow-hidden shadow rounded">
        {/* Left Sidebar */}
        <div className="flex-shrink-0 h-full">
          <MapSidebar
            onSearch={handleSearch}
            onCountrySelect={handleCountrySelect}
            onLocationSelect={handleLocationSelect}
            searchQuery={searchQuery}
            selectedLocation={selectedLocation}
            onBackToList={handleBackToList}
            locationDetailsLoading={locationDetailsLoading}
          />
        </div>

        {/* Right Map Area */}
        <div className="flex-1 min-w-0 h-full">
          <EnhancedMap
            onNodeClick={handleNodeClick}
            onClusterClick={handleClusterClick}
          />
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="flex flex-col h-full md:hidden">
        {/* Map Area - Top 1/3 */}
        <div className="h-1/2 flex-shrink-0">
          <EnhancedMap
            onNodeClick={handleNodeClick}
            onClusterClick={handleClusterClick}
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
            selectedLocation={selectedLocation}
            onBackToList={handleBackToList}
          />
        </div>
      </div>
    </>
  );
};

export default MapPage;
