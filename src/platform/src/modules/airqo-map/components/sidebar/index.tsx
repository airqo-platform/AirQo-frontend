'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { MapHeader } from './MapHeader';
import { CountryList } from './CountryList';
import { LocationsList } from './LocationsList';

interface MapSidebarProps {
  children?: React.ReactNode;
  className?: string;
  onSearch?: (query: string) => void;
  onCountrySelect?: (countryCode: string) => void;
  onLocationSelect?: (locationId: string) => void;
  selectedCountry?: string;
  searchQuery?: string;
  loading?: boolean;
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
}) => {
  if (children) {
    // Backward compatibility - render children if provided
    return (
      <Card
        className={cn(
          'flex flex-col h-full md:max-w-[340px] rounded-none md:rounded-lg overflow-hidden',
          className
        )}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </Card>
    );
  }

  // New implementation with integrated components
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <Card
      className={cn(
        'flex flex-col h-full md:max-w-[340px] rounded-none md:rounded-lg overflow-hidden',
        className
      )}
    >
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
    </Card>
  );
};

// Export individual components
export { MapHeader } from './MapHeader';
export { CountryList } from './CountryList';
export { LocationsList } from './LocationsList';
export { LocationCard, LocationCardSkeleton } from './LocationCard';
