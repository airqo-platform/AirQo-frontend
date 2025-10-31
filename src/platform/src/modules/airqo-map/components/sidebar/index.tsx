'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { MapHeader } from './MapHeader';
import { CountryList } from './CountryList';
import { LocationsList } from './LocationsList';
import { LocationDetailsPanel } from './LocationDetailsPanel';

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

interface MapSidebarProps {
  children?: React.ReactNode;
  className?: string;
  onSearch?: (query: string) => void;
  onCountrySelect?: (countryCode: string) => void;
  onLocationSelect?: (locationId: string, locationData?: LocationData) => void;
  selectedCountry?: string;
  searchQuery?: string;
  loading?: boolean;
  selectedLocation?: LocationData | null;
  onBackToList?: () => void;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  children,
  className,
  onSearch,
  onCountrySelect,
  onLocationSelect,
  selectedCountry = 'all',
  searchQuery = '',
  loading = false,
  selectedLocation = null,
  onBackToList,
}) => {
  // Single Card wrapper for consistent styling
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <Card
      className={cn(
        'flex flex-col h-full md:max-w-[340px] md:min-w-[340px] rounded-none md:rounded-lg',
        className
      )}
    >
      {children ? (
        // Backward compatibility - render children if provided
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {children}
        </div>
      ) : selectedLocation ? (
        // Show location details
        <LocationDetailsPanel
          locationData={selectedLocation}
          onBack={onBackToList}
        />
      ) : (
        // Show location list
        <>
          <MapHeader
            onSearch={onSearch}
            showSearchHeader={hasSearch}
            searchQuery={searchQuery}
          />
          {!hasSearch && (
            <CountryList
              selectedCountry={selectedCountry}
              onCountrySelect={onCountrySelect}
            />
          )}
          <div className="flex-1 min-h-0">
            <LocationsList
              onLocationSelect={onLocationSelect}
              searchQuery={searchQuery}
              loading={loading}
            />
          </div>
        </>
      )}
    </Card>
  );
};

// Export individual components
export { MapHeader } from './MapHeader';
export { CountryList } from './CountryList';
export { LocationsList } from './LocationsList';
export { LocationCard, LocationCardSkeleton } from './LocationCard';
