import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCenter, setZoom, setLocation } from '@/lib/store/services/map/MapSlice';
import allCountries from './countries.json';
import SearchField from '@/components/search/SearchField';
import LocationIcon from '@/icons/LocationIcon';
import CloseIcon from '@/icons/close_icon';
import ArrowLeftIcon from '@/icons/arrow_left.svg';
import Button from '@/components/Button';
import Image from 'next/image';
import { getIcon, images } from './MapNodes';
import CustomDropdown from '../../Dropdowns/CustomDropdown';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import Calendar from '../../Calendar/Calendar';
import Datepicker from 'react-tailwindcss-datepicker';
import { format } from 'date-fns';

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
    return (
      <div className='flex gap-2 ml-2 animate-pulse'>
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
    <div className='map-scrollbar flex flex-col gap-4 my-5 px-4'>
      {visibleResults.map((grid) => (
        <div
          key={grid._id}
          className='flex flex-row justify-between items-center text-sm w-full hover:cursor-pointer hover:bg-blue-100 px-4 py-[14px] rounded-xl border border-secondary-neutral-light-100 shadow'
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
    <div className='flex flex-col justify-center items-center h-60 w-full px-6'>
      <div className='p-5 rounded-full bg-secondary-neutral-light-50 border border-secondary-neutral-light-25 mb-2.5'>
        <LocationIcon fill='#9EA3AA' />
      </div>
      <div className='my-4'>
        <div className='text-secondary-neutral-dark-700 text-base font-medium text-center mb-1'>
          No results found
        </div>
        <div className='text-center text-sm font-medium leading-tight text-secondary-neutral-dark-400 w-[244px]'>
          Please try again with a different location name
        </div>
      </div>
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

// Week prediction
const WeekPrediction = ({ siteDetails }) => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const airQualityReadings = [10, 2, 55, 25, 75, 90, null]; // Replace with actual air quality readings
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [value, setValue] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const handleDateValueChange = (value) => {
    setValue(new Date(value.start));
  };

  return (
    <div className='relative'>
      <div className='mb-5 relative'>
        <CustomDropdown
          trigger={
            <Button
              className='flex flex-row-reverse shadow rounded-lg text-sm text-secondary-neutral-light-600 font-medium leading-tight bg-white h-8'
              variant='outlined'
              Icon={ChevronDownIcon}
            >
              {format(value, 'MMM dd, yyyy')}
            </Button>
          }
          dropdownWidth='224px'
        >
          <Calendar
            handleValueChange={handleDateValueChange}
            closeDatePicker={() => setOpenDatePicker(false)}
            initialMonth1={new Date()}
            initialMonth2={new Date()}
            useRange={false}
          />
        </CustomDropdown>
      </div>
      <div className='flex justify-between items-center gap-2'>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`rounded-[40px] px-0.5 pt-1.5 pb-0.5 flex flex-col justify-center items-center gap-2 shadow ${
              day === currentDay ? 'bg-blue-600' : 'bg-secondary-neutral-dark-100'
            }`}
          >
            <div className='flex flex-col items-center justify-start gap-[3px]'>
              <div
                className={`text-center text-sm font-semibold leading-tight ${
                  day === currentDay ? 'text-primary-300' : 'text-secondary-neutral-dark-400'
                }`}
              >
                {day.charAt(0)}
              </div>
              <div
                className={`text-center text-sm font-medium leading-tight ${
                  day === currentDay ? 'text-white' : 'text-secondary-neutral-dark-200'
                }`}
              >
                {airQualityReadings[index] ? airQualityReadings[index] : '-'}
              </div>
            </div>
            <Image
              src={
                airQualityReadings[index] && getIcon(airQualityReadings[index])
                  ? images[getIcon(airQualityReadings[index])]
                  : images['Unknown']
              }
              alt='Air Quality Icon'
              width={32}
              height={32}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// search results skeleton
const SearchResultsSkeleton = () => (
  <div className='flex flex-col gap-4 animate-pulse px-4'>
    <div className='bg-secondary-neutral-dark-50 rounded-xl w-full h-16' />
    <div className='bg-secondary-neutral-dark-50 rounded-xl w-full h-16' />
    <div className='bg-secondary-neutral-dark-50 rounded-xl w-full h-16' />
    <div className='bg-secondary-neutral-dark-50 rounded-xl w-full h-16' />
    <div className='bg-secondary-neutral-dark-50 rounded-xl w-full h-16' />
    <div className='bg-secondary-neutral-dark-50 rounded-xl w-full h-16' />
  </div>
);

const Sidebar = ({ siteDetails, selectedSites, isAdmin, showSideBar, setShowSideBar }) => {
  const dispatch = useDispatch();
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTab, setSelectedTab] = useState('locations');
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showLocationDetails, setShowLocationDetails] = useState(false);

  const reduxSearchTerm = useSelector((state) => state.locationSearch.searchTerm);

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
    setShowLocationDetails(true);
    setIsFocused(false);
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
    <div className='absolute left-0 top-0 w-full h-full md:w-[340px] bg-white shadow-lg shadow-right z-50 overflow-y-auto map-scrollbar'>
      <div className={`${!isFocused && !showLocationDetails ? 'space-y-4' : 'hidden'} px-4 pt-4`}>
        <SidebarHeader selectedTab={selectedTab} handleSelectedTab={handleSelectedTab} isAdmin />
        {!isAdmin && <hr />}
      </div>
      {selectedTab === 'locations' && (
        <div>
          {/* section 1 */}
          <div className={`${isFocused || showLocationDetails ? 'hidden' : ''}`}>
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

              <div className='overflow-y-auto map-scrollbar'>
                <div className='flex justify-between items-center px-4'>
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
          <div
            className={`flex flex-col pt-4 w-auto ${
              isFocused && !showLocationDetails ? '' : 'hidden'
            }`}
          >
            <div className='flex flex-col gap-5 px-4'>
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
            </div>

            {reduxSearchTerm && (
              <div
                className={`border border-secondary-neutral-light-100 ${
                  reduxSearchTerm.length > 0 && 'mt-3 mb-5'
                }`}
              />
            )}

            {reduxSearchTerm &&
              reduxSearchTerm.length < 4 &&
              searchResults &&
              searchResults.length === 0 && <SearchResultsSkeleton />}
            {reduxSearchTerm.length > 3 && (
              <SectionCards
                searchResults={searchResults}
                handleLocationSelect={handleLocationSelect}
              />
            )}
          </div>

          {selectedSite && (
            <div>
              <div className='bg-secondary-neutral-dark-50 pt-6 pb-5'>
                <div className='flex items-center gap-2 text-black-800 mb-4 mx-4'>
                  <Button
                    paddingStyles='p-0'
                    onClick={() => {
                      setIsFocused(false);
                      setShowLocationDetails(false);
                      setSelectedSite(null);
                    }}
                  >
                    <ArrowLeftIcon />
                  </Button>
                  <h3 className='text-xl font-medium leading-7'>{selectedSite.name}</h3>
                </div>

                <div className='mx-4'>
                  <WeekPrediction siteDetails={selectedSite} />
                </div>
              </div>

              <div className='border border-secondary-neutral-light-100 my-5' />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
