import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Card from '@/components/CardWrapper';
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
  const sortedCountries = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return [...data].sort((a, b) => a.country.localeCompare(b.country));
  }, [data]);

  // Handle click event for country selection
  const handleCountryClick = useCallback(
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

  // Skeleton loader component for a single card
  const SkeletonCard = () => (
    <Card
      width="w-full"
      height="h-10"
      padding="px-5"
      contentClassName="flex items-center justify-center gap-2 h-full"
      background="bg-gray-200 dark:bg-gray-700"
    >
      <div className="flex items-center gap-2">
        <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-5 w-5" />
        <div className="bg-gray-200 dark:bg-gray-600 rounded w-16 h-4" />
      </div>
    </Card>
  );

  // Render skeleton placeholders if data is loading or empty
  if (sortedCountries.length === 0) {
    return (
      <div className="flex gap-2 ml-2 mb-2 animate-pulse">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-2 ml-2 mb-2">
      {sortedCountries.map((country, index) => {
        if (!country || !country.flag) {
          return (
            <div key={index} className="text-red-500">
              Country data is incomplete
            </div>
          );
        }

        // Check if current country is selected
        const isSelected = selectedCountry?.country === country.country;

        return (
          <Card
            key={index}
            onClick={() => handleCountryClick(country)}
            width="w-full"
            height="h-10"
            padding="px-5"
            radius="rounded-full"
            contentClassName="flex items-center justify-center gap-2 h-full"
            className={`cursor-pointer ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
            background="bg-secondary-neutral-dark-50 dark:bg-transparent"
          >
            <Image
              src={`https://flagsapi.com/${country.code.toUpperCase()}/flat/64.png`}
              alt={`${country.country} flag`}
              width={20}
              height={20}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/path-to-default-flag-image.png';
              }}
            />
            <span className="text-sm text-secondary-neutral-light-600 dark:text-white font-medium">
              {country.country}
            </span>
          </Card>
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
