'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { LocationCard, LocationCardSkeleton } from './LocationCard';
import { AqMarkerPin02 } from '@airqo/icons-react';

interface Location {
  id: string;
  title: string;
  location: string;
}

interface LocationsListProps {
  locations?: Location[];
  onLocationSelect?: (locationId: string) => void;
  className?: string;
  searchQuery?: string;
  loading?: boolean;
}

const defaultLocations: Location[] = [
  {
    id: '1',
    title: 'Kampala',
    location: 'Central, Uganda',
  },
  {
    id: '2',
    title: 'Kampala Road',
    location: 'Kampala, Uganda',
  },
  {
    id: '3',
    title: 'Kampala - Northern Bypa...',
    location: 'Ggaba Road, Kampala, Ugan...',
  },
  {
    id: '4',
    title: 'Kampala Old Taxi Pack',
    location: 'Burton Street, Kampala, Ugan...',
  },
  {
    id: '5',
    title: 'Kampala Old Taxi Pack',
    location: 'Burton Street, Kampala, Ugan...',
  },
  {
    id: '6',
    title: 'Kampala Old Taxi Pack',
    location: 'Burton Street, Kampala, Ugan...',
  },
  {
    id: '7',
    title: 'Kampala Old Taxi Pack',
    location: 'Burton Street, Kampala, Ugan...',
  },
];

export const LocationsList: React.FC<LocationsListProps> = ({
  locations = defaultLocations,
  onLocationSelect,
  className,
  searchQuery = '',
  loading = false,
}) => {
  // Filter locations based on search query
  const filteredLocations = locations.filter(
    location =>
      location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine if currently searching
  const isSearching = searchQuery.trim().length > 0;

  // Show only first 6 locations initially when not searching, show all when searching
  const displayedLocations = isSearching
    ? filteredLocations
    : filteredLocations.slice(0, 6);
  const hasMoreLocations = !isSearching && filteredLocations.length > 6;
  const hasNoResults = isSearching && filteredLocations.length === 0;

  return (
    <div className={cn('flex-1 flex flex-col', className)}>
      {/* Locations List */}
      <div className="flex-1 overflow-y-auto">
        {hasNoResults ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AqMarkerPin02 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No results
            </h3>
            <p className="text-sm text-muted-foreground">
              Please try again with a different location name
            </p>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex flex-col gap-3">
              {loading
                ? // Show loading skeletons
                  Array.from({ length: 6 }, (_, index) => (
                    <LocationCardSkeleton key={`skeleton-${index}`} />
                  ))
                : // Show actual location cards
                  displayedLocations.map(location => (
                    <LocationCard
                      key={location.id}
                      title={location.title}
                      location={location.location}
                      onClick={() => onLocationSelect?.(location.id)}
                    />
                  ))}
            </div>

            {/* Show more button - only when there are more than 6 locations and not searching and not loading */}
            {hasMoreLocations && !loading && (
              <div className="pt-4 text-center mt-4">
                <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                  Show more
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
