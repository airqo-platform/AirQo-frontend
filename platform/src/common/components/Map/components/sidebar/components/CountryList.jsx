import React from 'react';
import { useDispatch } from 'react-redux';
import { setLocation, addSuggestedSites } from '@/lib/store/services/map/MapSlice';

/**
 * CountryList
 * @description Country list component
 */
const CountryList = ({ siteDetails, data, selectedCountry, setSelectedCountry }) => {
  const dispatch = useDispatch();

  // Check if data is not null or undefined
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className='flex gap-2 ml-2 animate-pulse mb-2'>
        <div className='bg-secondary-neutral-dark-50 px-4 py-[14px] w-28 h-9 rounded-full dark:bg-gray-700' />
        <div className='bg-secondary-neutral-dark-50 px-4 py-[14px] w-28 h-9 rounded-full dark:bg-gray-700' />
        <div className='bg-secondary-neutral-dark-50 px-4 py-[14px] w-28 h-9 rounded-full dark:bg-gray-700' />
        <div className='bg-secondary-neutral-dark-50 px-4 py-[14px] w-28 h-9 rounded-full dark:bg-gray-700' />
      </div>
    );
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => a.country.localeCompare(b.country));

  // Handle click event
  const handleClick = (country) => {
    setSelectedCountry(country);
    dispatch(setLocation({ country: country.country }));
    // sort the siteDetails by country and set them as selected Sites
    const selectedSites = siteDetails.filter((site) => site.country === country.country) || [];
    if (selectedSites.length > 0) {
      selectedSites.sort((a, b) => a.name.localeCompare(b.name));
    }
    dispatch(addSuggestedSites(selectedSites));
  };

  return (
    <div className='flex space-x-2 ml-2 mb-2'>
      {sortedData.map((country, index) => {
        // Check if country and flag properties exist
        if (!country || !country.flag) {
          return <div key={index}>Country data is incomplete</div>;
        }

        return (
          <div
            key={index}
            className={`flex items-center cursor-pointer rounded-full bg-gray-100 hover:bg-gray-200 py-[6px] px-[10px]  min-w-max space-x-2 m-0 ${
              selectedCountry?.country === country.country ? 'border-2 border-blue-400' : ''
            }`}
            onClick={() => handleClick(country)}>
            <img
              src={`https://flagsapi.com/${country.code.toUpperCase()}/flat/64.png`}
              alt={country.country}
              width={20}
              height={20}
            />
            <span className='text-sm text-secondary-neutral-light-600 font-medium'>
              {country.country}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CountryList;
