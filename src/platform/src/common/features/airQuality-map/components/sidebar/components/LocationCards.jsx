import React, { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import { capitalizeAllText } from '@/core/utils/strings';
import Button from '@/components/Button';
import Card from '@/components/CardWrapper';

const formatDescription = (description) => {
  if (!description) return '';
  const parts = description.split(',');
  return parts.length > 1 ? parts.slice(1).join(',').trim() : description;
};

const formatRegion = (region) => {
  if (!region) return '';
  const parts = region.split(',');
  return parts.length > 1 ? parts.slice(1).join(',').trim() : region;
};

const LocationCards = ({ searchResults, isLoading, handleLocationSelect }) => {
  if (
    !Array.isArray(searchResults) ||
    typeof handleLocationSelect !== 'function'
  ) {
    return null;
  }

  // ----------------------------
  // NEW: activeId to track selected card
  // ----------------------------
  const [activeId, setActiveId] = useState(null);

  // reset active state whenever the set of results changes
  useEffect(() => {
    setActiveId(null);
  }, [searchResults]);

  const [showAllResults, setShowAllResults] = useState(false);

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

  const handleShowMore = useCallback(() => {
    setShowAllResults(true);
  }, []);

  useEffect(() => {
    setShowAllResults(false);
  }, [searchResults]);

  if (visibleResults.length === 0 && !isLoading) {
    return (
      <p className="text-black dark:text-white text-center pt-8">
        No sites available.
      </p>
    );
  }

  return (
    <Card
      background="bg-transparent"
      bordered={false}
      className="pb-[350px] my-5"
      padding="px-4"
    >
      <div className="flex flex-col gap-4">
        {visibleResults.map((grid) => {
          const id = grid._id || grid.place_id;
          const isActive = id === activeId;
          const description = grid?.description
            ? capitalizeAllText(formatDescription(grid.description))
            : capitalizeAllText(formatRegion(grid.region));
          const title = capitalizeAllText(
            grid.place_id
              ? grid.description?.split(',')[0]
              : grid.search_name?.split(',')[0],
          );

          return (
            <Card
              key={id}
              padding="px-4 py-4"
              bordered
              // borderColor now depends on active state
              borderColor={
                isActive
                  ? 'border-2 border-primary/50 dark:border-primary/30'
                  : 'border-2 border-gray-200 dark:border-gray-700'
              }
              // background also toggles on active
              className={`cursor-pointer ${
                isActive ? ' dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
              }`}
              shadow="shadow"
              onClick={() => {
                setActiveId(id);
                handleLocationSelect(grid);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title || 'No Name'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {description || 'No Description'}
                  </span>
                </div>
                <div
                  className={`p-2 rounded-full ${
                    isActive
                      ? 'bg-blue-200 dark:bg-blue-800'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <LocationIcon />
                </div>
              </div>
            </Card>
          );
        })}

        {searchResults.length > 6 && !showAllResults && (
          <div className="flex justify-center my-4">
            <Button
              variant="text"
              className="text-sm font-medium"
              padding="p-0 shadow-none"
              onClick={handleShowMore}
            >
              Show More
            </Button>
          </div>
        )}
      </div>
    </Card>
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
