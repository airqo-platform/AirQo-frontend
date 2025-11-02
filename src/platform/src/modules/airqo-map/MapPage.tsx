'use client';

import React from 'react';
import { MapSidebar, EnhancedMap } from '@/modules/airqo-map';

interface LocationData {
  _id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  pm25Value?: number;
  airQuality?: string;
  monitor?: string;
  pollutionSource?: string;
  pollutant?: string;
  time?: string;
  city?: string;
  country?: string;
}

const MapPage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] =
    React.useState<LocationData | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCountrySelect = (countryCode: string) => {
    console.log('Country selected:', countryCode);
  };

  const handleLocationSelect = (locationId: string) => {
    console.log('Location selected:', locationId);

    // Mock location data based on the images - this would normally come from an API
    const mockLocationData: LocationData = {
      _id: locationId,
      name: 'Kyebando',
      location: 'Central, Uganda',
      latitude: 0.347596,
      longitude: 32.58252,
      pm25Value: 8.63,
      airQuality: 'Good for everyone!',
      monitor: 'AQG5231',
      pollutionSource: 'Factory, Dusty road',
      pollutant: 'PM2.5',
      time: '1:28PM',
      city: 'Kampala',
      country: 'Uganda',
    };

    setSelectedLocation(mockLocationData);
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
          />
        </div>

        {/* Right Map Area */}
        <div className="flex-1 min-w-0 h-full">
          <EnhancedMap />
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="flex flex-col h-full md:hidden">
        {/* Map Area - Top 1/3 */}
        <div className="h-1/2 flex-shrink-0">
          <EnhancedMap />
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
