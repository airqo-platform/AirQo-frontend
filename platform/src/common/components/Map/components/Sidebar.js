import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCenter, setZoom, setLocation } from '@/lib/store/services/map/MapSlice';
import allCountries from './countries.json';
import SearchField from '@/components/search/SearchField';
import LocationIcon from '@/icons/LocationIcon';
import CloseIcon from '@/icons/close_icon';
import ArrowLeftIcon from '@/icons/arrow_left.svg';
import Button from '@/components/Button';
import Image from 'next/image';
import { getAQIcon, getIcon, images } from './MapNodes';
import CustomDropdown from '../../Dropdowns/CustomDropdown';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import Calendar from '../../Calendar/Calendar';
import Datepicker from 'react-tailwindcss-datepicker';
import { format } from 'date-fns';
import axios from 'axios';
import WindIcon from '@/icons/Common/wind.svg';
import Toast from '../../Toast';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';

const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

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

/**
 * CountryList
 * @description Country list component
 */
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

  const [showAllResults, setShowAllResults] = useState(false);

  const visibleResults = showAllResults ? searchResults : searchResults.slice(0, 6);

  const handleShowMore = () => {
    setShowAllResults(true);
  };

  useEffect(() => {
    setShowAllResults(false);
  }, [searchResults]);

  return (
    visibleResults.length > 0 && (
      <div className='map-scrollbar flex flex-col gap-4 my-5 px-4'>
        {visibleResults.map((grid) => (
          <div
            key={grid._id || grid.id}
            className='flex flex-row justify-between items-center text-sm w-full hover:cursor-pointer hover:bg-blue-100 px-4 py-[14px] rounded-xl border border-secondary-neutral-light-100 shadow'
            onClick={() => handleLocationSelect(grid)}
          >
            <div className='flex flex-col item-start w-full'>
              <span className='text-base font-medium text-black capitalize'>
                {grid && grid.place_name
                  ? grid.place_name.split(',')[0]
                  : grid.name && grid.name.split(',')[0]}
              </span>
              <span className='font-medium text-secondary-neutral-light-300 capitalize text-sm leading-tight'>
                {grid && grid.place_name
                  ? grid.place_name.split(',').slice(1).join(',')
                  : (grid.name && grid.name.split(',').slice(1).join(',')) || grid.search_name}
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
    )
  );
};

// Sidebar header
const SidebarHeader = ({ selectedTab, handleSelectedTab, isAdmin, setShowSideBar }) => (
  <div>
    <div className='w-full flex justify-between items-center'>
      <label className='font-medium text-xl text-gray-900'>Air Quality Map</label>
      <button
        onClick={() => setShowSideBar(false)}
        className='focus:outline-none border rounded-md hover:cursor-pointer block md:hidden'
      >
        <CloseIcon />
      </button>
    </div>
    <p className='text-gray-500 text-sm font-medium w-auto mt-2'>
      Navigate air quality analytics with precision and actionable tips.
    </p>
    {!isAdmin && <TabSelector selectedTab={selectedTab} setSelectedTab={handleSelectedTab} />}
  </div>
);

// Week prediction
const WeekPrediction = ({ siteDetails, currentDay, airQualityReadings, weekDays }) => {
  const [value, setValue] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const dropdownRef = useRef(null);

  const handleDateValueChange = (value) => {
    setValue(new Date(value.start));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <div className='mb-5 relative'>
        <Button
          className='flex flex-row-reverse shadow rounded-lg text-sm text-secondary-neutral-light-600 font-medium leading-tight bg-white h-8 my-1'
          variant='outlined'
          Icon={ChevronDownIcon}
          onClick={() => setOpenDatePicker(!openDatePicker)}
        >
          {format(value, 'MMM dd, yyyy')}
        </Button>

        {openDatePicker && (
          <Calendar
            handleValueChange={handleDateValueChange}
            closeDatePicker={() => setOpenDatePicker(false)}
            initialMonth1={new Date()}
            initialMonth2={new Date()}
            useRange={false}
          />
        )}
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
                airQualityReadings[index] && getAQIcon('pm2_5', airQualityReadings[index])
                  ? images[getAQIcon('pm2_5', airQualityReadings[index])]
                  : images['Invalid']
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

const LocationDetailItem = ({ title, children, isCollapsed = true }) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  return (
    <div className='p-3 bg-white rounded-lg shadow border border-secondary-neutral-dark-100 flex-col justify-center items-center'>
      <div
        className={`flex justify-between items-center ${collapsed && 'mb-2'} cursor-pointer`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className='flex justify-start items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-secondary-neutral-dark-50 p-2 flex items-center justify-center text-xl font-bold'>
            🚨
          </div>
          <h3 className='text-lg font-medium leading-relaxed text-secondary-neutral-dark-950'>
            {title}
          </h3>
        </div>
        <div className='w-7 h-7 rounded-full flex items-center justify-center bg-white'>
          <ChevronDownIcon className='text-secondary-neutral-dark-950 w-4 h-4' />
        </div>
      </div>

      {collapsed && children}
    </div>
  );
};

// search results skeleton
const SearchResultsSkeleton = () => (
  <div className='flex flex-col gap-4 animate-pulse px-4 mt-5'>
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
  const [countryData, setCountryData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [selectedTab, setSelectedTab] = useState('locations');
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [showNoResultsMsg, setShowNoResultsMsg] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    message: '',
    type: '',
    bgColor: '',
  });
  const [locationSearchPreferences, setLocationSearchPreferences] = useState({
    custom: [],
    nearMe: [],
  });
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const airQualityReadings = [10, 2, 55, 25, 75, 90, null]; // Replace with actual air quality readings
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const reduxSearchTerm = useSelector((state) => state.locationSearch.searchTerm);

  useEffect(() => {
    if (Array.isArray(siteDetails) && siteDetails.length > 0) {
      const newUniqueCountries = [];
      const newCountryData = [];

      siteDetails.forEach((site) => {
        let countryDetails = allCountries?.find((data) => data.country === site.country);

        if (countryDetails) {
          if (!newUniqueCountries.includes(site.country)) {
            newUniqueCountries.push(site.country);
            newCountryData.push({ ...site, ...countryDetails });
          }
        }
      });

      setUniqueCountries(newUniqueCountries);
      setCountryData(newCountryData);
    } else {
      setToastMessage({
        message: 'Oops! Server down',
        type: 'error',
      });
    }
  }, [siteDetails]);

  useEffect(() => {
    if (selectedSites) {
      setLocationSearchPreferences((prevLocationSearchPreferences) => ({
        ...prevLocationSearchPreferences,
        custom: selectedSites,
      }));
      setSearchResults(selectedSites);
    }
  }, [selectedSites, isFocused]);

  const handleSelectedTab = (tab) => {
    setSelectedTab(tab);
  };

  const handleLocationSelect = (data) => {
    setShowLocationDetails(true);
    setIsFocused(false);

    try {
      dispatch(
        setCenter({
          latitude: data?.geometry?.coordinates[1] || data?.latitude || 0,
          longitude: data?.geometry?.coordinates[0] || data?.longitude || 0,
        }),
      );
      dispatch(setZoom(11));
      setSelectedSite(data);
    } catch (error) {
      console.error('Failed to set location:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    if (reduxSearchTerm && reduxSearchTerm.length > 3) {
      try {
        const response = await axios.get(
          `${MAPBOX_URL}/${reduxSearchTerm}.json?fuzzyMatch=true&limit=8&proximity=32.5638%2C0.3201&autocomplete=true&access_token=${MAPBOX_TOKEN}`,
        );

        if (response.data && response.data.features) {
          setSearchResults(response.data.features);
          if (response.data.features.length === 0) {
            setShowNoResultsMsg(true);
          }
        } else {
          setShowNoResultsMsg(true);
        }
      } catch (error) {
        console.error('Failed to search:', error);
      }
      setLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleClearSearch = () => {
    setIsFocused(false);
    setSearchResults([]);
    setShowNoResultsMsg(false);
  };

  useEffect(() => {
    if (reduxSearchTerm !== '' && reduxSearchTerm.length < 4) {
      setLoading(true);
    }
  }, [reduxSearchTerm]);

  return (
    <div
      className={`${
        window.innerWidth < 768 ? 'absolute left-0 top-0' : 'relative'
      } w-full md:w-[340px] bg-white shadow-lg shadow-right z-50 overflow-x-hidden ${
        searchResults && searchResults.length > 0
          ? 'overflow-y-auto map-scrollbar h-full'
          : 'h-screen overflow-y-hidden'
      }`}
    >
      <div className={`${!isFocused && !showLocationDetails ? 'space-y-4' : 'hidden'} px-4 pt-4`}>
        <SidebarHeader
          selectedTab={selectedTab}
          handleSelectedTab={handleSelectedTab}
          isAdmin
          setShowSideBar={setShowSideBar}
        />
        {!isAdmin && <hr />}
      </div>
      <div>
        {/* section 1 */}
        <div className={`${isFocused || showLocationDetails ? 'hidden' : ''}`}>
          <div onClick={() => setIsFocused(true)} className='mt-5 px-4'>
            <SearchField focus={false} />
          </div>
          <div>
            <div
              className={`flex items-center mt-5 ${
                countryData ? 'overflow-x-auto map-scrollbar custom-scrollbar' : 'overflow-x-hidden'
              } px-4`}
            >
              <button
                onClick={() => {
                  dispatch(setCenter({ latitude: 16.1532, longitude: 13.1691 }));
                  dispatch(setZoom(1.5));
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
                    <option value='custom'>Suggested</option>
                    {/* <option value='near_me'>Near me</option> */}
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
              {selectedSites && selectedSites.length > 0 ? (
                <SectionCards
                  searchResults={selectedSites}
                  handleLocationSelect={handleLocationSelect}
                />
              ) : (
                <SearchResultsSkeleton />
              )}
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div
          className={`flex flex-col pt-4 w-auto ${
            isFocused && !showLocationDetails ? '' : 'hidden'
          }`}
        >
          <div className={`flex flex-col gap-5 px-4`}>
            <SidebarHeader
              selectedTab={selectedTab}
              handleSelectedTab={handleSelectedTab}
              isAdmin
              setShowSideBar={setShowSideBar}
            />
            <SearchField onSearch={handleSearch} onClearSearch={handleClearSearch} focus={true} />
          </div>

          {reduxSearchTerm && (
            <div
              className={`border border-secondary-neutral-light-100 ${
                reduxSearchTerm.length > 0 && 'mt-3'
              }`}
            />
          )}

          {isLoading && <SearchResultsSkeleton />}

          {showNoResultsMsg && searchResults && searchResults.length === 0 ? (
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
          ) : (
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
                    setSearchResults(selectedSites);
                    dispatch(addSearchTerm(''));
                  }}
                >
                  <ArrowLeftIcon />
                </Button>
                <h3 className='text-xl font-medium leading-7 capitalize'>
                  {selectedSite.place_name ||
                    (selectedSite.name && selectedSite.name) ||
                    selectedSite.search_name}
                </h3>
              </div>

              <div className='mx-4'>
                <WeekPrediction
                  siteDetails={selectedSite}
                  weekDays={weekDays}
                  currentDay={currentDay}
                  airQualityReadings={airQualityReadings}
                />
              </div>
            </div>

            <div className='border border-secondary-neutral-light-100 my-5' />

            <div className='mx-4 mb-5 flex flex-col gap-4'>
              <div className='px-3 pt-3 pb-4 bg-secondary-neutral-dark-50 rounded-lg shadow border border-secondary-neutral-dark-100 flex justify-between items-center'>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-1'>
                    <div className='w-4 h-4 rounded-lg bg-secondary-neutral-dark-100 flex items-center justify-center'>
                      <WindIcon />
                    </div>
                    <p className='text-sm font-medium leading-tight text-secondary-neutral-dark-300'>
                      PM2.5
                    </p>
                  </div>
                  <div
                    className={`text-2xl font-extrabold leading-normal text-secondary-neutral-light-800`}
                  >
                    {airQualityReadings[3] ? airQualityReadings[3] : '-'}
                  </div>
                </div>
                <Image
                  src={
                    airQualityReadings[3] && getAQIcon('pm2_5', airQualityReadings[3])
                      ? images[getAQIcon('pm2_5', airQualityReadings[3])]
                      : images['Invalid']
                  }
                  alt='Air Quality Icon'
                  width={80}
                  height={80}
                />
              </div>

              <LocationDetailItem
                title='Air Quality Alerts'
                isCollapsed
                children={
                  <p className='text-xl font-bold leading-7 text-secondary-neutral-dark-950'>
                    <span className='text-blue-500 capitalize'>
                      {selectedSite.place_name ||
                        selectedSite.name.split(',')[0] ||
                        selectedSite.search_name}
                      's
                    </span>{' '}
                    Air Quality is expected to be Good today. Enjoy the day with confidence in the
                    clean air around you.
                  </p>
                }
              />
            </div>
          </div>
        )}
      </div>
      {toastMessage.message !== '' && (
        <Toast
          message={toastMessage.message}
          clearData={() => setToastMessage({ message: '', type: '' })}
          type={toastMessage.type}
          timeout={3000}
          dataTestId='sidebar-toast'
          size='lg'
          position='bottom'
        />
      )}
    </div>
  );
};

export default Sidebar;
