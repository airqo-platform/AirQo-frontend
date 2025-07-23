import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Card from '@/components/CardWrapper';
import {
  setLocation,
  addSuggestedSites,
} from '@/lib/store/services/map/MapSlice';

const CountryList = ({
  data,
  selectedCountry,
  setSelectedCountry,
  siteDetails = [],
}) => {
  const dispatch = useDispatch();

  // Memoize sorted data to avoid re-sorting on every render
  const sortedCountries = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return [...data].sort((a, b) => a.country.localeCompare(b.country));
  }, [data]);

  // Handle click event for country selection
  const handleSelect = React.useCallback(
    (country) => {
      const countryName = country.country;
      setSelectedCountry(countryName);
      dispatch(setLocation({ country: countryName, city: '' }));

      // Get sorted sites for the selected country
      const selectedSites = siteDetails
        .filter((site) => site.country === countryName)
        .sort((a, b) => a.name.localeCompare(b.name));

      dispatch(addSuggestedSites(selectedSites));
    },
    [dispatch, setSelectedCountry, siteDetails],
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
        const isSelected = selectedCountry === country.country;

        return (
          <Card
            key={index}
            onClick={() => handleSelect(country)}
            width="w-full"
            height="h-10"
            padding="px-5"
            radius="rounded-full"
            contentClassName="flex items-center justify-center gap-2 h-full"
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected
                ? 'ring-2 ring-primary border-primary bg-primary/10 dark:bg-primary/20 scale-105'
                : 'hover:ring-1 hover:ring-primary/30 hover:scale-[1.02]'
            }`}
            background={
              isSelected
                ? 'bg-white dark:bg-gray-800'
                : 'bg-secondary-neutral-dark-50 hover:bg-white dark:bg-transparent dark:hover:bg-gray-800'
            }
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
            <span
              className={`text-sm whitespace-nowrap font-medium ${
                isSelected
                  ? 'text-primary dark:text-primary/90'
                  : 'text-secondary-neutral-light-600 dark:text-white'
              }`}
            >
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
