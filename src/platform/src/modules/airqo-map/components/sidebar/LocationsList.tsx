'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { LocationCard } from './LocationCard';

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
}) => {
  // Filter locations based on search query
  const filteredLocations = locations.filter(
    location =>
      location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show only first 6 locations initially
  const displayedLocations = filteredLocations.slice(0, 6);
  const hasMoreLocations = filteredLocations.length > 6;

  return (
    <div className={cn('flex-1 p-4 flex flex-col', className)}>
      {/* Locations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {displayedLocations.map(location => (
            <LocationCard
              key={location.id}
              title={location.title}
              location={location.location}
              onClick={() => onLocationSelect?.(location.id)}
            />
          ))}
        </div>

        {/* Show more button - only when there are more than 6 locations */}
        {hasMoreLocations && (
          <div className="p-4 text-center border-t border-primary/10">
            <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
