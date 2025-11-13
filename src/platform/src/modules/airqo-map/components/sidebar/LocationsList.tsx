'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { LocationCard, LocationCardSkeleton } from './LocationCard';
import { AqMarkerPin02 } from '@airqo/icons-react';
import { useSitesByCountry } from '../../hooks';
import {
  usePhotonSearch,
  PhotonSearchResult,
} from '../../hooks/usePhotonSearch';
import { LoadingSpinner } from '../../../../shared/components/ui/loading-spinner';
import {
  normalizeLocations,
  filterLocations,
  limitLocationsForDisplay,
} from '../../utils/dataNormalization';

interface LocationData {
  id: string;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  isPhotonResult?: boolean;
  photonData?: PhotonSearchResult;
}

interface LocationsListProps {
  selectedCountry?: string;
  onLocationSelect?: (
    locationId: string,
    locationData?: { latitude: number; longitude: number; name: string }
  ) => void;
  className?: string;
  searchQuery?: string;
  selectedLocationId?: string;
}

export const LocationsList: React.FC<LocationsListProps> = ({
  selectedCountry,
  onLocationSelect,
  className,
  searchQuery = '',
  selectedLocationId,
}) => {
  const { sites, isLoading, isLoadingMore, loadMore, hasNextPage } =
    useSitesByCountry({
      country: selectedCountry === 'all' ? undefined : selectedCountry,
    });

  const { results: photonResults, isLoading: isPhotonLoading } =
    usePhotonSearch(searchQuery, searchQuery.length > 0);

  // Transform sites data to Location format using utility function
  const locations = React.useMemo(() => {
    return normalizeLocations(sites);
  }, [sites]);

  // Filter locations based on search query using utility function (only for internal sites)
  const filteredLocations = React.useMemo(() => {
    return filterLocations(locations, searchQuery);
  }, [locations, searchQuery]);

  // Determine if currently searching
  const isSearching = searchQuery.trim().length > 0;

  // Use Photon results if searching and has results, otherwise use filtered internal locations
  const displayLocations = React.useMemo(() => {
    if (isSearching && photonResults.length > 0) {
      // Convert Photon results to location format
      return photonResults.map((result) => ({
        id: result.properties.osm_id
          ? `photon-osm-${result.properties.osm_id}`
          : `photon-coord-${result.geometry.coordinates[0]}-${result.geometry.coordinates[1]}`,
        title: result.properties.name || 'Unknown Location',
        location: formatPhotonLocation(result),
        latitude: result.geometry.coordinates[1],
        longitude: result.geometry.coordinates[0],
        isPhotonResult: true,
        photonData: result,
      }));
    }
    return filteredLocations;
  }, [isSearching, photonResults, filteredLocations]);

  // Limit locations for display using utility function
  const { displayed: displayedLocations } = React.useMemo(() => {
    return limitLocationsForDisplay(
      displayLocations,
      isSearching || hasNextPage,
      6
    );
  }, [displayLocations, isSearching, hasNextPage]);

  const hasNoResults =
    isSearching && displayLocations.length === 0 && !isPhotonLoading;
  const hasNoSites = !isSearching && !isLoading && sites.length === 0;

  const handleLocationClick = (location: LocationData) => {
    if (location.isPhotonResult && location.photonData) {
      // Photon result
      onLocationSelect?.(`photon-${location.photonData.properties.osm_id}`, {
        latitude: location.latitude!,
        longitude: location.longitude!,
        name: location.title,
      });
    } else {
      // Internal site
      const siteData = sites.find(site => site._id === location.id);
      onLocationSelect?.(
        location.id,
        siteData
          ? {
              latitude: siteData.approximate_latitude as number,
              longitude: siteData.approximate_longitude as number,
              name: location.title,
            }
          : undefined
      );
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Scrollable Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto overflow-x-hidden min-h-0">
        {hasNoResults ? (
          // Empty state for search results
          <div className="flex flex-col items-center justify-center h-full text-center">
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
        ) : hasNoSites ? (
          // Empty state for no sites available
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AqMarkerPin02 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No locations available
            </h3>
            <p className="text-sm text-muted-foreground">
              There are currently no monitoring sites in this country
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {(isLoading && !isSearching) || (isPhotonLoading && isSearching)
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
                      onClick={() => handleLocationClick(location)}
                      isSelected={location.id === selectedLocationId}
                    />
                  ))}
            </div>

            {/* Load more button or loading spinner */}
            {hasNextPage && !isSearching && !isLoading && !isLoadingMore && (
              <div className="pt-4 text-center">
                <button
                  onClick={loadMore}
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  Show more
                </button>
              </div>
            )}

            {/* Loading spinner for load more */}
            {isLoadingMore && (
              <div className="pt-4 text-center">
                <div className="flex items-center justify-center">
                  <LoadingSpinner size={16} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to format Photon location
function formatPhotonLocation(result: PhotonSearchResult): string {
  const props = result.properties;
  const parts = [];

  if (props.city) parts.push(props.city);
  if (props.state && props.state !== props.city) parts.push(props.state);
  if (props.country) parts.push(props.country);

  return parts.join(', ') || 'Unknown Location';
}
