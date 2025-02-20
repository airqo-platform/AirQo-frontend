import React from 'react';
import LocationIcon from '@/icons/LocationIcon';

/**
 * Render Loading Skeleton
 */
export const renderLoadingSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse px-4 mt-5">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="bg-secondary-neutral-dark-50 rounded-xl w-full h-16"
      />
    ))}
  </div>
);

/**
 * Render No Results Message
 */
export const renderNoResults = (hasSearched = false) => (
  <div className="flex flex-col justify-start items-center h-full w-full pt-8 px-6">
    <div className="p-5 rounded-full bg-secondary-neutral-light-50 border border-secondary-neutral-light-25 mb-2.5">
      <LocationIcon fill="#9EA3AA" />
    </div>
    <div className="my-4 text-center">
      {hasSearched ? (
        <>
          <div className="text-secondary-neutral-dark-700 text-base font-medium mb-1">
            No results found
          </div>
          <div className="text-sm font-medium leading-tight text-secondary-neutral-dark-400 w-[244px]">
            Please try again with a different location name.
          </div>
        </>
      ) : (
        <>
          <div className="text-secondary-neutral-dark-700 text-base font-medium mb-1">
            Your search results will appear here
          </div>
          <div className="text-sm font-medium leading-tight text-secondary-neutral-dark-400 w-[244px]">
            Start by typing a location name to see matching results.
          </div>
        </>
      )}
    </div>
  </div>
);

/**
 * Render Default
 */
export const renderDefaultMessage = () => (
  <div className="flex flex-col justify-center items-center h-full w-full pt-8 px-6">
    <div className="p-5 rounded-full bg-secondary-neutral-light-50 border border-secondary-neutral-light-25 mb-2.5">
      <LocationIcon fill="#9EA3AA" />
    </div>
    <div className="my-4 text-center">
      <div className="text-secondary-neutral-dark-700 text-base font-medium mb-1">
        No results found
      </div>
    </div>
  </div>
);
