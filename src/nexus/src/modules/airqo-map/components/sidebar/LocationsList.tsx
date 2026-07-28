'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { LocationCard, LocationCardSkeleton } from './LocationCard';
import { AqMarkerPin02 } from '@airqo/icons-react';
import {
  getLatestPreferenceForGroup,
  useUserPreferencesList,
} from '@/shared/hooks/usePreferences';
import { useUser } from '@/shared/hooks/useUser';
import type { Site } from '@/shared/types/api';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';
import { useSitesByCountry } from '../../hooks';
import {
  usePhotonSearch,
  PhotonSearchResult,
} from '../../hooks/usePhotonSearch';
import { LoadingSpinner } from '../../../../shared/components/ui/loading-spinner';
import {
  filterLocations,
  limitLocationsForDisplay,
} from '../../utils/dataNormalization';

type SiteLike = Partial<Site> & {
  id?: string;
  site_id?: string;
  location_name?: string;
};

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
  cohort_id?: string;
}

const resolveSiteId = (site?: SiteLike | null): string => {
  const candidateIds = [site?._id, site?.id, site?.site_id];

  return (
    candidateIds
      .map(candidateId =>
        typeof candidateId === 'string' ? candidateId.trim() : ''
      )
      .find(Boolean) || ''
  );
};

const toCoordinate = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const getUsableCoordinates = (latitude?: number, longitude?: number) => {
  if (
    latitude === undefined ||
    longitude === undefined ||
    (latitude === 0 && longitude === 0)
  ) {
    return null;
  }

  return { latitude, longitude };
};

const getLocationSummary = (site?: SiteLike | null): string => {
  const parts = [site?.city, site?.region, site?.country]
    .map(part => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean);

  return (
    parts.join(', ') ||
    (typeof site?.location_name === 'string' && site.location_name.trim()) ||
    (typeof site?.country === 'string' && site.country.trim()) ||
    'Unknown Location'
  );
};

const buildLocationData = (site: SiteLike): LocationData | null => {
  const id = resolveSiteId(site);

  if (!id) {
    return null;
  }

  const latitude = toCoordinate(site.approximate_latitude ?? site.latitude);
  const longitude = toCoordinate(site.approximate_longitude ?? site.longitude);
  const coordinates = getUsableCoordinates(latitude, longitude);

  return {
    id,
    title: getSiteDisplayName({
      search_name: site.search_name,
      location_name: site.location_name,
      name: site.name,
      formatted_name: site.formatted_name,
    }),
    location: getLocationSummary(site),
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
  };
};

const normalizeFavoriteSites = (
  selectedSiteIds: string[],
  selectedSites: SiteLike[]
): SiteLike[] => {
  const favoriteSitesById = new Map<string, SiteLike>();

  selectedSites.forEach(selectedSite => {
    const siteId = resolveSiteId(selectedSite);

    if (!siteId) {
      return;
    }

    favoriteSitesById.set(siteId, {
      ...selectedSite,
      _id: siteId,
      search_name:
        selectedSite.search_name ||
        selectedSite.formatted_name ||
        selectedSite.generated_name ||
        selectedSite.name ||
        siteId,
    });
  });

  return selectedSiteIds.map(siteId => {
    const favoriteSite = favoriteSitesById.get(siteId);

    if (favoriteSite) {
      return favoriteSite;
    }

    return {
      _id: siteId,
      search_name: siteId,
      name: siteId,
    };
  });
};

export const LocationsList: React.FC<LocationsListProps> = ({
  selectedCountry,
  onLocationSelect,
  className,
  searchQuery = '',
  selectedLocationId,
  cohort_id,
}) => {
  const { user, activeGroup, isLoading: userLoading } = useUser();
  const isSearching = searchQuery.trim().length > 0;
  const shouldResolveInitialFavorites =
    !isSearching && selectedCountry === undefined;
  const hasPreferenceContext = Boolean(user?.id && activeGroup?.id);
  const shouldFetchPreferences =
    shouldResolveInitialFavorites && hasPreferenceContext;

  const { data: preferencesData, isLoading: preferencesLoading } =
    useUserPreferencesList(
      shouldFetchPreferences ? user?.id || '' : '',
      shouldFetchPreferences ? activeGroup?.id || '' : ''
    );

  const currentPreference = React.useMemo(() => {
    return getLatestPreferenceForGroup(
      preferencesData?.preferences,
      activeGroup?.id
    );
  }, [activeGroup?.id, preferencesData?.preferences]);

  const favoriteSiteIds = React.useMemo(() => {
    if (!currentPreference) {
      return [];
    }

    const canonicalSiteIds = Array.isArray(currentPreference.site_ids)
      ? currentPreference.site_ids
      : [];
    const fallbackSiteIds = Array.isArray(currentPreference.selected_sites)
      ? currentPreference.selected_sites.map(resolveSiteId)
      : [];

    return Array.from(
      new Set(
        [...canonicalSiteIds, ...fallbackSiteIds]
          .map(siteId => (typeof siteId === 'string' ? siteId.trim() : ''))
          .filter(Boolean)
      )
    );
  }, [currentPreference]);

  const favoriteSites = React.useMemo(() => {
    if (!currentPreference) {
      return [];
    }

    return normalizeFavoriteSites(
      favoriteSiteIds,
      Array.isArray(currentPreference.selected_sites)
        ? currentPreference.selected_sites
        : []
    );
  }, [currentPreference, favoriteSiteIds]);

  const favoriteLocations = React.useMemo(() => {
    return favoriteSites
      .map(buildLocationData)
      .filter((location): location is LocationData => location !== null);
  }, [favoriteSites]);

  const isWaitingForFavoriteDecision =
    shouldResolveInitialFavorites &&
    (userLoading || (hasPreferenceContext && preferencesLoading));
  const shouldUseFavoriteLocations =
    shouldResolveInitialFavorites &&
    !isWaitingForFavoriteDecision &&
    favoriteLocations.length > 0;
  const shouldFetchSites =
    isSearching ||
    selectedCountry !== undefined ||
    (!shouldResolveInitialFavorites && !isSearching) ||
    (!isWaitingForFavoriteDecision &&
      (!hasPreferenceContext || favoriteLocations.length === 0));

  const { sites, isLoading, isLoadingMore, loadMore, hasNextPage } =
    useSitesByCountry({
      country: selectedCountry === 'all' ? undefined : selectedCountry,
      cohort_id,
      enabled: shouldFetchSites,
    });

  const { results: photonResults, isLoading: isPhotonLoading } =
    usePhotonSearch(searchQuery, searchQuery.length > 0);

  const locations = React.useMemo(() => {
    return sites
      .map(site => buildLocationData(site as SiteLike))
      .filter((location): location is LocationData => location !== null);
  }, [sites]);

  // Filter locations based on search query using utility function (only for internal sites)
  const filteredLocations = React.useMemo(() => {
    return filterLocations(locations, searchQuery);
  }, [locations, searchQuery]);

  // Use Photon results if searching and has results, otherwise use filtered internal locations
  const displayLocations = React.useMemo(() => {
    if (isSearching && photonResults.length > 0) {
      // Convert Photon results to location format
      return photonResults.map(result => ({
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

    if (shouldUseFavoriteLocations) {
      return favoriteLocations;
    }

    return filteredLocations;
  }, [
    favoriteLocations,
    filteredLocations,
    isSearching,
    photonResults,
    shouldUseFavoriteLocations,
  ]);

  const hasActivePagination = shouldUseFavoriteLocations ? false : hasNextPage;

  // Limit locations for display using utility function
  const { displayed: displayedLocations } = React.useMemo(() => {
    return limitLocationsForDisplay(
      displayLocations,
      isSearching || hasActivePagination,
      6
    );
  }, [displayLocations, hasActivePagination, isSearching]);

  const isSearchFallbackLoading =
    isSearching && photonResults.length === 0 && shouldFetchSites && isLoading;
  const showLoadingSkeletons =
    (!isSearching &&
      (isWaitingForFavoriteDecision || (shouldFetchSites && isLoading))) ||
    (isSearching && (isPhotonLoading || isSearchFallbackLoading));

  const hasNoResults =
    isSearching && displayLocations.length === 0 && !showLoadingSkeletons;
  const hasNoSites =
    !isSearching && !showLoadingSkeletons && displayLocations.length === 0;

  const handleLocationClick = (location: LocationData) => {
    if (location.isPhotonResult && location.photonData) {
      // Photon result — use the same ID format as the display list
      onLocationSelect?.(location.id, {
        latitude: location.latitude!,
        longitude: location.longitude!,
        name: location.title,
      });
    } else {
      const coordinates = getUsableCoordinates(
        location.latitude,
        location.longitude
      );

      onLocationSelect?.(
        location.id,
        coordinates
          ? {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              name: location.title,
            }
          : undefined
      );
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Scrollable Content */}
      <div className="flex-1 p-2 space-y-4 overflow-y-auto overflow-x-hidden min-h-0">
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
              There are currently no monitoring sites for this selection.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {showLoadingSkeletons
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
            {hasActivePagination &&
              !isSearching &&
              !isLoading &&
              !isLoadingMore && (
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
            {!shouldUseFavoriteLocations && isLoadingMore && (
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
