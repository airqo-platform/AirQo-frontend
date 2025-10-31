'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { MapHeader } from './MapHeader';
import { CountryList } from './CountryList';
import { LocationsList } from './LocationsList';
import { CollapsibleCard } from './collapsible-card';
import { CurrentAirQualityCard } from './CurrentAirQualityCard';
import { WeeklyForecastCard } from './WeeklyForecastCard';

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
        'flex flex-col h-full md:max-w-[340px] md:min-w-[340px] rounded-none md:rounded-lg overflow-y-auto',
        className
      )}
    >
      {children ? (
        // Backward compatibility - render children if provided
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      ) : selectedLocation ? (
        // Show location details
        <>
          {/* Header with location name and close button */}
          <CardHeader className="flex-shrink-0 p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {selectedLocation.name}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedLocation.location ||
                    `${selectedLocation.city}, ${selectedLocation.country}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToList}
                className="p-1 h-8 w-8 ml-2 flex-shrink-0"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </CardHeader>

          {/* Main content */}
          <CardContent className="flex-1 p-4 space-y-4 min-h-0">
            {/* Weekly Forecast */}
            <WeeklyForecastCard />

            {/* Current Air Quality */}
            <CurrentAirQualityCard locationData={selectedLocation} />

            {/* Health Alerts */}
            <CollapsibleCard title="Health Alerts" defaultExpanded={false}>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  {selectedLocation.name}&apos;s Air Quality is Good for
                  breathing. Enjoy your day with confidence in clean air around
                  you.
                </p>
              </div>
            </CollapsibleCard>

            {/* More Insights */}
            <CollapsibleCard title="More Insights" defaultExpanded={false}>
              {/* PM2.5 Chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">PM2.5</span>
                  <span className="text-xs text-primary">
                    {selectedLocation.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>20</span>
                  <span>15</span>
                  <span>10</span>
                  <span>5</span>
                  <span>00</span>
                </div>

                {/* Simple chart representation */}
                <div className="h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded relative overflow-hidden">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 40"
                    className="absolute inset-0"
                  >
                    <path
                      d="M 0 30 Q 20 20 40 25 T 80 15 T 100 20"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="70" cy="15" r="2" fill="#3B82F6" />
                  </svg>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Apr 10</span>
                  <span>Apr 14</span>
                  <span>Apr 16</span>
                </div>
              </div>
            </CollapsibleCard>
          </CardContent>
        </>
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
          <LocationsList
            onLocationSelect={onLocationSelect}
            searchQuery={searchQuery}
            loading={loading}
          />
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
