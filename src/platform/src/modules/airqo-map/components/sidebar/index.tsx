'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { MapHeader } from './MapHeader';
import { CountryList } from './CountryList';
import { LocationsList } from './LocationsList';
import { LocationDetailsPanel } from './LocationDetailsPanel';
import type { MapReading } from '../../../../shared/types/api';
import type { AirQualityReading } from '../map/MapNodes';
import type { PollutantType } from '@/shared/utils/airQuality';

interface LocationData {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapSidebarProps {
  children?: React.ReactNode;
  className?: string;
  onSearch?: (query: string) => void;
  onCountrySelect?: (countryCode: string) => void;
  onLocationSelect?: (
    locationId: string,
    locationData?: { latitude: number; longitude: number; name: string }
  ) => void;
  selectedCountry?: string;
  searchQuery?: string;
  selectedLocation?: LocationData | null;
  selectedMapReading?: MapReading | AirQualityReading | null;
  selectedLocationId?: string | null;
  onBackToList?: () => void;
  locationDetailsLoading?: boolean;
  selectedPollutant?: PollutantType;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  children,
  className,
  onSearch,
  onCountrySelect,
  onLocationSelect,
  selectedCountry = 'uganda',
  searchQuery = '',
  selectedLocation = null,
  selectedMapReading = null,
  selectedLocationId = null,
  onBackToList,
  locationDetailsLoading = false,
  selectedPollutant = 'pm2_5',
}) => {
  // Single Card wrapper for consistent styling
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <Card
      className={cn(
        'flex flex-col h-[calc(100vh-64px)] md:max-w-[340px] md:min-w-[340px] rounded-none md:rounded-lg overflow-hidden',
        className
      )}
    >
      {children ? (
        // Backward compatibility - render children if provided
        <div className="flex-1 overflow-x-hidden min-h-0">{children}</div>
      ) : selectedLocation || selectedMapReading ? (
        // Show location details
        <LocationDetailsPanel
          locationData={selectedLocation || undefined}
          mapReading={selectedMapReading || undefined}
          onBack={onBackToList}
          loading={locationDetailsLoading}
          selectedPollutant={selectedPollutant}
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
              selectedCountry={selectedCountry}
              onLocationSelect={onLocationSelect}
              searchQuery={searchQuery}
              selectedLocationId={
                selectedLocationId ||
                (selectedMapReading
                  ? 'site_id' in selectedMapReading
                    ? (selectedMapReading as MapReading).site_id
                    : (selectedMapReading as AirQualityReading).siteId
                  : undefined)
              }
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
export { LocationDetailsPanel } from './LocationDetailsPanel';
export { LocationDetailsSkeleton } from './LocationDetailsSkeleton';
export { SiteInsightsChart } from './SiteInsightsChart';
