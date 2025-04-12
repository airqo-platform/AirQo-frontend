import React, { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import LocationIcon from '@/icons/LocationIcon';
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
      className="pb-[350px] h-dvh my-5"
      padding="p-4"
    >
      <div className="flex flex-col gap-4">
        {visibleResults.map((grid) => {
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
              key={grid._id || grid.place_id}
              padding="px-4 py-4"
              bordered
              borderColor="border-2 border-gray-200 dark:border-blue-500"
              className="cursor-pointer bg-white dark:bg-gray-800"
              shadow="shadow"
              onClick={() => handleLocationSelect(grid)}
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
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  <LocationIcon fill="#3B82F6" />
                </div>
              </div>
            </Card>
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
