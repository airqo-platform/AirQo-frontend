import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCenter, setZoom, setLocation } from '@/lib/store/services/map/MapSlice';
import allCountries from './countries.json';
import SearchField from '@/components/search/SearchField';
import LocationIcon from '@/icons/LocationIcon';
import CloseIcon from '@/icons/close_icon';
import Button from '@/components/Button';

// tab selector
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
          }`}
        >
          Locations
        </div>
        <div
          onClick={() => setSelectedTab('sites')}
          className={`px-3 py-2 flex justify-center items-center w-full hover:cursor-pointer text-sm font-medium text-secondary-neutral-light-600${
            selectedTab === 'sites' ? 'border rounded-md bg-white shadow-sm' : ''
          }`}
        >
          Sites
        </div>
      </div>
    </div>
  );
};

// country list
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
    <div className='flex space-x-2 ml-2'>
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
            onClick={() => handleClick(country)}
          >
            <img src={country.flag} alt={country.country} width={20} height={20} />
            <span className='text-sm text-secondary-neutral-light-600 font-medium'>
              {country.country}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Search area
const SectionCards = ({ searchResults, handleLocationSelect }) => {
  if (!Array.isArray(searchResults)) {
    console.error('Invalid prop: searchResults must be an array');
    return null;
  }

  if (typeof handleLocationSelect !== 'function') {
    console.error('Invalid prop: handleLocationSelect must be a function');
    return null;
  }

  const [showAllResults, setShowAllResults] = useState(false);

  const visibleResults = showAllResults ? searchResults : searchResults.slice(0, 6);

  const handleShowMore = () => {
    setShowAllResults(true);
  };

  useEffect(() => {
    setShowAllResults(false);
  }, [searchResults]);

  return visibleResults.length > 0 ? (
    <div className='mt-4 map-scrollbar'>
      {visibleResults.map((grid) => (
        <div
          key={grid._id}
          className='flex flex-row justify-between items-center mb-4 text-sm w-full hover:cursor-pointer hover:bg-blue-100 px-4 py-[14px] rounded-xl border border-secondary-neutral-light-100 shadow'
          onClick={() => handleLocationSelect(grid)}
        >
          <div className='flex flex-col item-start w-full'>
            <span className='text-base font-medium text-black capitalize'>{grid.name}</span>
            <span className='font-medium text-secondary-neutral-light-300 capitalize text-sm leading-tight'>
              {grid.region + ',' + grid.country}
            </span>
          </div>
          <div className='p-2 rounded-full bg-secondary-neutral-light-50'>
            <LocationIcon fill='#9EA3AA' />
          </div>
        </div>
      ))}
      {searchResults.length > 4 && !showAllResults && (
        <div className='flex justify-center my-4'>
          <Button
            variant='primaryText'
            className='text-sm font-medium'
            paddingStyles='py-4'
            onClick={handleShowMore}
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  ) : (
    <div className='flex justify-center items-center h-80'>
      <p className='text-gray-500 text-sm font-normal'>No results found</p>
    </div>
  );
};

// Sidebar header
const SidebarHeader = ({ selectedTab, handleSelectedTab, isAdmin }) => (
  <div>
    <div className='w-full'>
      <label className='font-medium text-xl text-gray-900'>Air Quality Map</label>
    </div>
    <p className='text-gray-500 text-sm font-medium w-auto mt-2'>
      Navigate air quality analytics with precision and actionable tips.
    </p>
    {!isAdmin && <TabSelector selectedTab={selectedTab} setSelectedTab={handleSelectedTab} />}
  </div>
);

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

  const handleClearSearch = () => {
    setIsFocused(false);
  };

  return (
    <div className='absolute left-0 top-0 w-full h-full md:max-w-[400px] bg-white shadow-lg shadow-right space-y-4 z-50 overflow-y-auto map-scrollbar'>
      <div className={`${!isFocused ? 'space-y-4' : 'hidden'} px-4 pt-4`}>
        <SidebarHeader selectedTab={selectedTab} handleSelectedTab={handleSelectedTab} isAdmin />
        {!isAdmin && <hr />}
      </div>
      {selectedTab === 'locations' && (
        <div>
          {/* section 1 */}
          <div className={`${isFocused ? 'hidden' : ''}`}>
            <div onMouseDown={() => setIsFocused(true)} className='mt-5 px-4'>
              <SearchField />
            </div>
            <div>
              <div className='flex justify-between items-center mt-5 overflow-x-auto map-scrollbar custom-scrollbar px-4'>
                <button
                  onClick={() => {
                    dispatch(setCenter({ latitude: 16.1532, longitude: 13.1691 }));
                    dispatch(setZoom(1.5));
                    setShowSideBar(false);
                    setSelectedSite(null);
                  }}
                  className='py-[6px] px-[10px] rounded-full bg-blue-500 text-white text-sm font-medium'
                >
                  All
                </button>
                <CountryList
                  data={countryData}
                  selectedCountry={selectedCountry}
                  setSelectedCountry={setSelectedCountry}
                />
              </div>

              <div className='border border-secondary-neutral-light-100 my-5' />

              <div className='overflow-y-auto map-scrollbar px-4'>
                <div className='flex justify-between items-center'>
                  <div className='flex gap-1'>
                    <div className='font-medium text-secondary-neutral-dark-400 text-sm'>
                      Sort by:
                    </div>
                    <select className='rounded-md m-0 p-0 text-sm font-medium text-secondary-neutral-dark-700 outline-none focus:outline-none border-none'>
                      <option value=''>Near me</option>
                    </select>
                  </div>
                  <Button
                    className='text-sm font-medium'
                    paddingStyles='p-0'
                    variant='primaryText'
                    onClick={() => {}}
                  >
                    Filters
                  </Button>
                </div>
                <SectionCards
                  searchResults={selectedSites}
                  handleLocationSelect={handleLocationSelect}
                />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className={`flex flex-col gap-5 px-4 pt-4 w-auto ${isFocused ? '' : 'hidden'}`}>
            <SidebarHeader
              selectedTab={selectedTab}
              handleSelectedTab={handleSelectedTab}
              isAdmin
            />
            <SearchField
              data={siteDetails}
              onSearch={handleSearch}
              onClearSearch={handleClearSearch}
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
