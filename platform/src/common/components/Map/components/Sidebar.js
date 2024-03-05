import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCenter, setZoom, setLocation } from '@/lib/store/services/map/MapSlice';
import allCountries from './countries.json';
import SearchField from '@/components/search/SearchField';
import LocationIcon from '@/icons/LocationIcon';
import CloseIcon from '@/icons/close_icon';

/**
 * TabSelector
 * @description Tab selector component
 */
const TabSelector = ({ selectedTab, setSelectedTab }) => {
  if (typeof setSelectedTab !== 'function') {
    console.error('Invalid prop: setSelectedTab must be a function');
    return null;
  }
  return (
    <div className='mt-6'>
      <div className='flex flex-row justify-center items-center bg-secondary-neutral-light-25 rounded-md border border-secondary-neutral-light-50 p-1'>
        <div
          onClick={() => setSelectedTab('locations')}
          className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
            selectedTab === 'locations' ? 'border rounded-md bg-white shadow-sm' : ''
          }`}>
          Locations
        </div>
        <div
          onClick={() => setSelectedTab('sites')}
          className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
            selectedTab === 'sites' ? 'border rounded-md bg-white shadow-sm' : ''
          }`}>
          Sites
        </div>
      </div>
    </div>
  );
};

/**
 * CountryList
 * @description Country list component
 */
const CountryList = ({ data, selectedCountry, setSelectedCountry }) => {
  const dispatch = useDispatch();

  // Check if data is not null or undefined
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className='w-full text-center'>No data available</div>;
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => a.country.localeCompare(b.country));

  // Handle click event
  const handleClick = (country) => {
    setSelectedCountry(country);
    dispatch(setLocation({ country: country.country }));
  };

  return (
    <div className='flex space-x-4 overflow-x-auto py-4 ml-4 map-scrollbar'>
      {sortedData.map((country, index) => {
        // Check if country and flag properties exist
        if (!country || !country.flag) {
          return <div key={index}>Country data is incomplete</div>;
        }

        return (
          <div
            key={index}
            className={`flex items-center cursor-pointer rounded-full bg-gray-100 hover:bg-gray-200 p-2  min-w-max space-x-2 m-0 ${
              selectedCountry?.country === country.country ? 'border-2 border-blue-400' : ''
            }`}
            onClick={() => handleClick(country)}>
            <img src={country.flag} alt={country.country} width={20} height={20} />
            <span>{country.country}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * SectionCards
 * @description Section cards component
 */
const SectionCards = ({ searchResults, handleLocationSelect }) => {
  if (!Array.isArray(searchResults)) {
    console.error('Invalid prop: searchResults must be an array');
    return null;
  }

  if (typeof handleLocationSelect !== 'function') {
    console.error('Invalid prop: handleLocationSelect must be a function');
    return null;
  }

  return searchResults.length > 0 ? (
    <div className='space-y-2 mt-4 map-scrollbar'>
      <hr />
      {searchResults.map((grid) => (
        <div
          key={grid._id}
          className='flex flex-row justify-start items-center mb-0.5 text-sm w-full hover:cursor-pointer hover:bg-blue-100 p-2 rounded-lg'
          onClick={() => handleLocationSelect(grid)}>
          <div className='p-2 rounded-full bg-gray-100'>
            <LocationIcon />
          </div>
          <div className='ml-3 flex flex-col item-start border-b w-full'>
            <span className='font-normal text-black capitalize text-lg'>{grid.name}</span>
            <span className='font-normal text-gray-500 capitalize text-sm mb-2'>
              {grid.region + ',' + grid.country}
            </span>
          </div>
        </div>
      ))}
      <hr />
    </div>
  ) : (
    <div className='flex justify-center items-center h-80'>
      <p className='text-gray-500 text-sm font-normal'>No results found</p>
    </div>
  );
};

/**
 * Sidebar
 * @description Sidebar component
 */
const Sidebar = ({ siteDetails, selectedSites, isAdmin, showSideBar, setShowSideBar }) => {
  const dispatch = useDispatch();
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTab, setSelectedTab] = useState('locations');
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  let uniqueCountries = [];
  let countryData = [];

  if (Array.isArray(siteDetails) && siteDetails.length > 0) {
    siteDetails.forEach((site) => {
      if (!uniqueCountries.includes(site.country)) {
        uniqueCountries.push(site.country);

        let countryDetails = allCountries?.find((data) => data.country === site.country);

        if (countryDetails) {
          countryData.push({ ...site, ...countryDetails });
        }
      }
    });
  } else {
    console.error('Invalid data: siteDetails must be an array');
  }

  const handleSelectedTab = (tab) => {
    setSelectedTab(tab);
  };

  const handleLocationSelect = (data) => {
    const { country, city } = data || {};
    if (country && city) {
      try {
        dispatch(setLocation({ country, city }));
        setSelectedSite(data);
      } catch (error) {
        console.error('Failed to set location:', error);
      }
    } else {
      console.error('Invalid data:', data);
    }
  };

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  return (
    <div
      className='absolute left-0 top-0 w-full h-full md:max-w-[400px] bg-white shadow-lg shadow-right space-y-4 z-50 overflow-y-auto map-scrollbar'
      style={{
        zIndex: 1000,
      }}>
      <div className={!isFocused ? 'space-y-4' : 'hidden'}>
        <div className='px-4 pt-4'>
          <div className='w-full flex justify-between items-center'>
            <label className='font-medium text-xl'>Map</label>
            <button
              onClick={() => setShowSideBar(false)}
              className='focus:outline-none border rounded-md hover:cursor-pointer block md:hidden'>
              <CloseIcon />
            </button>
          </div>
          <p className='text-gray-500 text-sm font-normal w-auto mt-6'>
            Navigate, Explore, and Understand Air Quality Data with Precision, Right Down to Your
            Neighborhood
          </p>
          {!isAdmin && <TabSelector selectedTab={selectedTab} setSelectedTab={handleSelectedTab} />}
        </div>
        {!isAdmin && <hr />}
      </div>
      {selectedTab === 'locations' && (
        <div>
          {/* section 1 */}
          <div className={`px-4 space-y-4 ${isFocused ? 'hidden' : ''}`}>
            <div onMouseDown={() => setIsFocused(true)}>
              <SearchField />
            </div>
            <div className='flex justify-between items-center'>
              <button
                onClick={() => {
                  dispatch(setCenter({ latitude: 16.1532, longitude: 13.1691 }));
                  dispatch(setZoom(1.5));
                  setShowSideBar(false);
                  setSelectedSite(null);
                }}
                className='px-4 py-2 rounded-full bg-blue-500 text-white'>
                All
              </button>
              <CountryList
                data={countryData}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
              />
            </div>
            <div className='space-y-4 overflow-y-auto map-scrollbar'>
              <label className='font-medium text-gray-600 text-sm'>Suggestions</label>
              <SectionCards
                searchResults={selectedSites}
                handleLocationSelect={handleLocationSelect}
              />
            </div>
          </div>
          {/* Section 2 */}
          <div className={`px-4 pt-4 w-auto ${isFocused ? '' : 'hidden'}`}>
            <div className='w-full flex justify-start items-center'>
              <button
                onClick={() => setIsFocused(false)}
                className='font-medium text-xl focus:outline-none mb-2'>
                Back
              </button>
            </div>
            <SearchField
              data={siteDetails}
              onSearch={handleSearch}
              searchKeys={['city', 'village', 'country']}
            />
            <SectionCards
              searchResults={searchResults}
              handleLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
