import React, { useEffect, useMemo, useState } from 'react';
import { capitalizeAllText } from '@/core/utils/strings';
import LocationIcon from '@/icons/LocationIcon';

/**
 * LocationCards component
 * @description A component that displays location cards
 */
const LocationCards = ({ searchResults, handleLocationSelect }) => {
  // Early return if searchResults is not an array or handleLocationSelect is not a function
  if (!Array.isArray(searchResults) || typeof handleLocationSelect !== 'function') {
    return null;
  }

  const [showAllResults, setShowAllResults] = useState(false);

  const visibleResults = useMemo(() => {
    return showAllResults ? searchResults : searchResults.slice(0, 6);
  }, [showAllResults, searchResults]);

  const handleShowMore = () => {
    setShowAllResults(true);
  };

  useEffect(() => {
    setShowAllResults(false);
  }, [searchResults]);

  return (
    visibleResults.length > 0 && (
      <div className='sidebar-scroll-bar mb-[200px] flex flex-col gap-4 my-5 px-4'>
        {visibleResults.map((grid, index) => (
          <div
            key={grid._id || index} // Use grid._id or index as the key
            className='flex flex-row justify-between items-center text-sm w-full hover:cursor-pointer hover:bg-blue-100 px-4 py-[14px] rounded-xl border border-secondary-neutral-light-100 shadow-sm'
            onClick={() => handleLocationSelect(grid)}>
            <div className='flex flex-col item-start w-full'>
              <span className='text-base font-medium text-black'>
                {capitalizeAllText(
                  grid && grid?.place_id
                    ? grid?.description?.split(',')[0]
                    : grid.search_name?.split(',')[0],
                )}
              </span>
              <span className='font-medium text-secondary-neutral-light-300 text-sm leading-tight'>
                {capitalizeAllText(
                  grid && grid?.place_id
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
        {searchResults.length > 4 && !showAllResults && (
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
