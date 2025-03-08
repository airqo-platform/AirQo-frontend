import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@/components/Button';
import {
  setLocation,
  addSuggestedSites,
} from '@/lib/store/services/map/MapSlice';

const CountryList = ({
  siteDetails,
  data,
  selectedCountry,
  setSelectedCountry,
}) => {
  const dispatch = useDispatch();

  // Memoize sorted data to avoid re-sorting on every render
  const sortedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return [...data].sort((a, b) => a.country.localeCompare(b.country));
  }, [data]);

  // Handle click event for country selection
  const handleClick = useCallback(
    (country) => {
      if (!country) return;

      setSelectedCountry(country);
      dispatch(setLocation({ country: country.country, city: '' }));

      const selectedSites = siteDetails
        .filter((site) => site.country === country.country)
        .sort((a, b) => a.name.localeCompare(b.name));

      dispatch(addSuggestedSites(selectedSites));
    },
    [dispatch, siteDetails, setSelectedCountry],
  );

  if (sortedData.length === 0) {
    return (
      <div className="flex gap-2 ml-2 animate-pulse mb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-secondary-neutral-dark-50 px-4 py-[14px] w-28 h-9 rounded-full dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-2 ml-2 mb-2">
      {sortedData.map((country, index) => {
        if (!country || !country.flag) {
          return (
            <div key={index} className="text-red-500">
              Country data is incomplete
            </div>
          );
        }
        return (
          <Button
            key={index}
            type="button"
            className={`flex items-center cursor-pointer rounded-full bg-gray-100 hover:bg-gray-200 py-[6px] px-[10px] min-w-max space-x-2 m-0 ${
              selectedCountry?.country === country.country
                ? 'border-2 border-blue-400'
                : ''
            }`}
            variant="outline"
            onClick={() => handleClick(country)}
          >
            <img
              src={`https://flagsapi.com/${country.code.toUpperCase()}/flat/64.png`}
              alt={country.country}
              width={20}
              height={20}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/path-to-default-flag-image.png';
              }}
            />
            <span className="text-sm text-secondary-neutral-light-600 font-medium">
              {country.country}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

CountryList.propTypes = {
  siteDetails: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  selectedCountry: PropTypes.object,
  setSelectedCountry: PropTypes.func.isRequired,
};

export default CountryList;
