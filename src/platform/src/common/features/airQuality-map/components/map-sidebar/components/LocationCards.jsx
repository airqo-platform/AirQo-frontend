import React, { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import { capitalizeAllText } from '@/core/utils/strings';
import Button from '@/components/Button';
import Card from '@/components/CardWrapper';

// ------------------------------------------------------------------
// Pure helpers
// ------------------------------------------------------------------
const formatDescription = (description = '') => {
  const parts = description.split(',').map((s) => s.trim());
  return parts.length > 1 ? parts.slice(1).join(', ') : description;
};

const formatRegion = (region = '') => {
  const parts = region.split(',').map((s) => s.trim());
  return parts.length > 1 ? parts.slice(1).join(', ') : region;
};

const getCardId = (item) => item._id || item.place_id;

// ------------------------------------------------------------------
const LocationCards = ({ searchResults, isLoading, handleLocationSelect }) => {
  /* ----------------------------------------------------------------
   * 1. Hooks must be called unconditionally
   * ---------------------------------------------------------------- */
  const [activeId, setActiveId] = useState(null);
  const [showAllResults, setShowAllResults] = useState(false);

  const handleSelect = useCallback(
    (item) => {
      const id = getCardId(item);
      setActiveId(id);
      if (typeof handleLocationSelect === 'function') {
        handleLocationSelect(item);
      }
    },
    [handleLocationSelect],
  );

  const handleShowMore = useCallback(() => setShowAllResults(true), []);

  // Reset local state when the result set changes
  useEffect(() => {
    setActiveId(null);
    setShowAllResults(false);
  }, [searchResults]);

  /* ----------------------------------------------------------------
   * 2. Derived data
   * ---------------------------------------------------------------- */
  const visibleResults = useMemo(() => {
    if (!Array.isArray(searchResults)) return [];

    const seen = new Set();
    const unique = searchResults.filter((item) => {
      const id = getCardId(item);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return showAllResults ? unique : unique.slice(0, 6);
  }, [searchResults, showAllResults]);

  // Guard: after all hooks have been called and data is processed
  if (!Array.isArray(searchResults)) return null;

  /* ----------------------------------------------------------------
   * 3. Render states
   * ---------------------------------------------------------------- */
  if (isLoading) return null;

  if (!visibleResults.length) {
    return (
      <p className="text-black dark:text-white text-center pt-8">
        No sites available.
      </p>
    );
  }

  /* ----------------------------------------------------------------
   * 4. Render list
   * ---------------------------------------------------------------- */
  return (
    <div className="pb-[350px] px-4 my-5">
      <ul className="flex flex-col gap-4">
        {visibleResults.map((item) => {
          const id = getCardId(item);
          const isActive = id === activeId;

          const title = capitalizeAllText(
            item.place_id
              ? formatDescription(item.description).split(',')[0]
              : formatDescription(item.search_name).split(',')[0],
          );
          const description = capitalizeAllText(
            formatDescription(item.description) || formatRegion(item.region),
          );

          return (
            <li key={id}>
              <Card
                as="button"
                padding="px-4 py-4"
                bordered
                borderColor={
                  isActive
                    ? 'border-2 border-primary/50 dark:border-primary/30'
                    : 'border-2 border-gray-200 dark:border-gray-700'
                }
                className={`w-full cursor-pointer transition-colors ${
                  isActive ? 'dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                }`}
                shadow="shadow-none"
                onClick={() => handleSelect(item)}
                aria-pressed={isActive}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col text-left">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title || 'No Name'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {description || 'No Description'}
                    </span>
                  </div>

                  <div
                    aria-hidden="true"
                    className={`p-2 rounded-full transition-colors ${
                      isActive
                        ? 'bg-blue-200 dark:bg-blue-800'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <LocationIcon />
                  </div>
                </div>
              </Card>
            </li>
          );
        })}

        {searchResults.length > 6 && !showAllResults && (
          <li className="flex justify-center my-4">
            <Button
              variant="text"
              className="text-sm font-medium"
              padding="p-0 shadow-none"
              onClick={handleShowMore}
            >
              Show More
            </Button>
          </li>
        )}
      </ul>
    </div>
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
