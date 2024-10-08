import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { capitalizeAllText } from '@/core/utils/strings';
import LocationIcon from '@/icons/LocationIcon';
import Button from '@/components/Button';

/**
 * LocationCards component
 * @description A component that displays location cards
 */
const LocationCards = ({ searchResults, isLoading, handleLocationSelect }) => {
  if (!Array.isArray(searchResults) || typeof handleLocationSelect !== 'function') {
    return null;
  }
  const [showAllResults, setShowAllResults] = useState(false);

  const visibleResults = useMemo(() => {
    const uniqueIds = new Set();

    // Filter out search results with duplicate ids
    const uniqueSearchResults = searchResults.filter((result) => {
      const id = result._id || result.place_id;
      if (uniqueIds.has(id)) {
        // If the id is already in the Set, filter out this result
        return false;
      }

      // If the id is not in the Set, add it and keep this result
      uniqueIds.add(id);
      return true;
    });

    // Slice the results if showAllResults is false
    return showAllResults ? uniqueSearchResults : uniqueSearchResults.slice(0, 6);
  }, [showAllResults, searchResults]);

  const handleShowMore = useCallback(() => {
    setShowAllResults(true);
  }, []);

  useEffect(() => {
    setShowAllResults(false);
  }, [searchResults]);

  if (visibleResults.length === 0 && !isLoading) {
    return <p className='text-black text-center pt-8'>No sites available.</p>;
  }

  return (
    visibleResults.length > 0 && (
      <div className='sidebar-scroll-bar pb-[350px] h-dvh flex flex-col gap-4 my-5 px-4'>
        {visibleResults.map((grid, index) => (
          <div
            key={grid?._id || grid?.place_id}
            className='flex flex-row justify-between items-center text-sm w-full hover:cursor-pointer hover:bg-blue-100 px-4 py-[14px] rounded-xl border border-secondary-neutral-light-100 shadow-sm'
            onClick={() => handleLocationSelect(grid)}>
            <div className='flex flex-col item-start w-full'>
              <span className='text-base font-medium text-black'>
                {capitalizeAllText(
                  grid?.place_id
                    ? grid?.description?.split(',')[0]
                    : grid.search_name?.split(',')[0],
                )}
              </span>
              <span className='font-medium text-secondary-neutral-light-300 text-sm leading-tight'>
                {capitalizeAllText(
                  grid?.place_id
                    ? grid?.description?.includes(',') &&
                      grid?.description?.split(',').slice(1).join('').trim()
                      ? grid?.description?.split(',').slice(1).join(',')
                      : grid?.description
                    : grid.region?.includes(',') && grid.region?.split(',').slice(1).join('').trim()
                    ? grid.region?.split(',').slice(1).join(',')
                    : grid.region,
                )}
              </span>
            </div>
            <div className='p-2 rounded-full bg-secondary-neutral-light-50'>
              <LocationIcon fill='#9EA3AA' />
            </div>
          </div>
        ))}
        {searchResults.length > 5 && !showAllResults && (
          <div className='flex justify-center my-4'>
            <Button
              variant='primaryText'
              className='text-sm font-medium'
              paddingStyles='py-4'
              onClick={handleShowMore}>
              Show More
            </Button>
          </div>
        )}
      </div>
    )
  );
};

export default LocationCards;
