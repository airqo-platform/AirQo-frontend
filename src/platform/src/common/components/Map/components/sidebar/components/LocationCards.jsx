import React, { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { capitalizeAllText } from '@/core/utils/strings';
import LocationIcon from '@/icons/LocationIcon';
import Button from '@/components/Button';

/**
 * Helper function to format description
 */
const formatDescription = (description) => {
  if (!description) return '';
  const parts = description.split(',');
  return parts.length > 1 ? parts.slice(1).join(',').trim() : description;
};

/**
 * Helper function to format region
 */
const formatRegion = (region) => {
  if (!region) return '';
  const parts = region.split(',');
  return parts.length > 1 ? parts.slice(1).join(',').trim() : region;
};

/**
 * LocationCards component
 * @description A component that displays location cards
 */
const LocationCards = ({ searchResults, isLoading, handleLocationSelect }) => {
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
      const id = result._id || result.place_id;
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
          const description = grid?.description
            ? capitalizeAllText(formatDescription(grid?.description))
            : capitalizeAllText(formatRegion(grid?.region));
          const title = capitalizeAllText(
            grid?.place_id
              ? grid.description?.split(',')[0]
              : grid?.search_name?.split(',')[0],
          );

          return (
            <div
              key={grid?._id || grid?.place_id}
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
                <LocationIcon fill="#9EA3AA" />
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

LocationCards.propTypes = {
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      place_id: PropTypes.string,
      description: PropTypes.string,
      search_name: PropTypes.string,
      region: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  handleLocationSelect: PropTypes.func.isRequired,
};

export default LocationCards;
