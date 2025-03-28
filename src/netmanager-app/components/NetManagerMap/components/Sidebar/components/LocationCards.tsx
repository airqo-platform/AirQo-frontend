import React, { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { capitalizeAllText } from '@/utils/strings';
import LocationIcon from '@/public/icons/LocationIcon';
import Button from '@/components/NetManagerMap/components/Button';

/**
 * Helper function to format description
 */
const formatDescription = (description: string) => {
  if (!description) return '';
  const parts = description.split(',');
  return parts.length > 1 ? parts.slice(1).join(',').trim() : description;
};

/**
 * Helper function to format region
 */
const formatRegion = (region: string) => {
  if (!region) return '';
  const parts = region.split(',');
  return parts.length > 1 ? parts.slice(1).join(',').trim() : region;
};

/**
 * LocationCards component
 * @description A component that displays location cards
 */
interface LocationCardProps {
  searchResults: Array<{
    _id?: string;
    mapbox_id?: string;
    full_address?: string;
    name?: string;
    region?: string;
    address?:string;
    place_formatted?:string;
  }>;
  isLoading: boolean;
  handleLocationSelect: (location: {
    _id?: string;
    mapbox_id?: string;
    description?: string;
    search_name?: string;
    region?: string;
  }) => void;
}

const LocationCards: React.FC<LocationCardProps> = ({ searchResults, isLoading, handleLocationSelect }) => {
  // Ensure the required data and functions are valid
  if (
    !Array.isArray(searchResults) ||
    typeof handleLocationSelect !== 'function'
  ) {
    return null;
  }

  const [showAllResults, setShowAllResults] = useState(false);

  // Filter out duplicates and handle "show more" functionality
  const visibleResults = useMemo(() => {
    const uniqueIds = new Set();
    const uniqueSearchResults = searchResults.filter((result) => {
      const id = result._id || result.mapbox_id;
      if (!id || uniqueIds.has(id)) return false;
      uniqueIds.add(id);
      return true;
    });

    return showAllResults
      ? uniqueSearchResults
      : uniqueSearchResults.slice(0, 6);
  }, [showAllResults, searchResults]);

  // Show more results handler
  const handleShowMore = useCallback(() => {
    setShowAllResults(true);
  }, []);

  // Reset showing all results when search results change
  useEffect(() => {
    setShowAllResults(false);
  }, [searchResults]);

  // Handle the case where no results are available
  if (visibleResults.length === 0 && !isLoading) {
    return <p className="text-black text-center pt-8">No sites available.</p>;
  }

  return (
    visibleResults.length > 0 && (
      <div className="sidebar-scroll-bar pb-[350px] h-dvh flex flex-col gap-4 my-5 px-4">
        {visibleResults.map((grid) => {
          const description = grid?.place_formatted?capitalizeAllText(formatDescription(grid?.place_formatted)): capitalizeAllText(formatRegion(grid?.place_formatted || ''));

          const title = capitalizeAllText(grid?.name?.split(',')[0],
          );

          return (
            <div
              key={grid?._id || grid?.mapbox_id}
              className="flex justify-between items-center text-sm w-full hover:bg-blue-100 px-4 py-[14px] rounded-xl border border-secondary-neutral-light-100 shadow-sm cursor-pointer"
              onClick={() => handleLocationSelect(grid)}
            >
              <div className="flex flex-col w-full">
                <span className="text-base font-medium text-black">
                  {title || 'No Name'}
                </span>
                <span className="font-medium text-secondary-neutral-light-300 text-sm leading-tight">
                  {description || 'No Description'}
                </span>
              </div>
              <div className="p-2 rounded-full bg-secondary-neutral-light-50">
                <LocationIcon fill="#9EA3AA" width={20} height={20} strokeWidth={undefined} />
              </div>
            </div>
          );
        })}
        {searchResults.length > 6 && !showAllResults && (
          <div className="flex justify-center my-4">
            <Button
              variant="primaryText"
              className="text-sm font-medium"
              paddingStyles="py-4"
              onClick={handleShowMore}
            >
              Show More
            </Button>
          </div>
        )}
      </div>
    )
  );
};

export default LocationCards;
