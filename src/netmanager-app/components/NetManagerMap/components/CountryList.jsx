import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import Button from './Button'
import {
  setLocation,
  addSuggestedSites,
} from '@/lib/map/MapSlice';

/**
 * CountryList
 * @description Optimized Country list component
 */
const CountryList = ({
  siteDetails,
  data,
  selectedCountry,
  setSelectedCountry,
}) => {
  const dispatch = useDispatch();

  // Memoize sorted data to prevent re-sorting on each render
  const sortedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    return [...data].sort((a, b) => a.country.localeCompare(b.country));
  }, [data]);

  // Handle click event for country selection
  const handleClick = useCallback(
    (country) => {
      if (!country) return; // Guard clause for invalid country data

      setSelectedCountry(country);

      // Update selected location in the Redux store
      dispatch(setLocation({ country: country.country, city: '' }));

      // Filter and sort siteDetails based on the selected country
      const selectedSites = siteDetails
        .filter((site) => site.country === country.country)
        .sort((a, b) => a.name.localeCompare(b.name));

      // Dispatch filtered sites to the Redux store
      dispatch(addSuggestedSites(selectedSites));
    },
    [dispatch, siteDetails, setSelectedCountry],
  );

  // Show loading skeleton if no data
  if (!sortedData.length) {
    return (
      <div className="flex gap-2 ml-2 animate-pulse mb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-secondary-neutral-dark-50 px-4 py-[14px] w-28 h-9 rounded-full dark:bg-gray-700"
          >
                ...
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-2 ml-2 mb-2 ">
      {sortedData.map((country, index) => {
        // Check if country and flag properties exist
        if (!country || !country.flag) {
          return (
            <div key={index} className="text-red-500">
              Country data is incomplete
            </div>
          );
        }

        return (
                <button
                key={index}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 min-w-max transition-all ${
                  selectedCountry?.country === country.country ? 'border-2 border-blue-400' : ''
                }`}
                onClick={() => handleClick(country)}
              >
                <img
                  src={`https://flagsapi.com/${country.code.toUpperCase()}/flat/64.png`}
                  alt={country.country}
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/path-to-default-flag-image.png';
                  }}
                />
                <span className="pr-2 text-sm text-gray-700 font-medium   whitespace-nowrap">
                  {country.country}
                </span>
              </button>

        );
      })}
    </div>
  );
};

export default CountryList;
