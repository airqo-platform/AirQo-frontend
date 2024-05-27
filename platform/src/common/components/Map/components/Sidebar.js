import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCenter,
  setZoom,
  setLocation,
  setOpenLocationDetails,
  setSelectedLocation,
  addSuggestedSites,
  clearData,
} from '@/lib/store/services/map/MapSlice';
import allCountries from './countries.json';
import SearchField from '@/components/search/SearchField';
import LocationIcon from '@/icons/LocationIcon';
import CloseIcon from '@/icons/close_icon';
import ArrowLeftIcon from '@/icons/arrow_left.svg';
import Button from '@/components/Button';
import Image from 'next/image';
import { getAQICategory, getAQIMessage, getAQIcon, getIcon, images } from './MapNodes';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import axios from 'axios';
import WindIcon from '@/icons/Common/wind.svg';
import Toast from '../../Toast';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import { dailyPredictionsApi } from '@/core/apis/predict';
import Spinner from '@/components/Spinner';
import { capitalizeAllText } from '@/core/utils/strings';

const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

/**
 * TabSelector
 * @description Tab selector component
 */
const TabSelector = ({ selectedTab, setSelectedTab }) => {
  if (typeof setSelectedTab !== 'function') {
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
const CountryList = ({ siteDetails, data, selectedCountry, setSelectedCountry }) => {
  const dispatch = useDispatch();

  // Check if data is not null or undefined
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className='flex gap-2 ml-2 animate-pulse mb-5'>
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
            onClick={() => handleClick(country)}
          >
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

/**
 * SectionCards
 * @description Section cards component
 */
const SectionCards = ({ searchResults, handleLocationSelect }) => {
  if (!Array.isArray(searchResults)) {
    return null;
  }

  if (typeof handleLocationSelect !== 'function') {
    return null;
  }

  const [showAllResults, setShowAllResults] = useState(false);

  const visibleResults = useMemo(() => {
    return showAllResults ? searchResults : searchResults.slice(0, 6);
  }, [showAllResults, searchResults]);

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
            key={grid.description || grid.name}
            className='flex flex-row justify-between items-center text-sm w-full hover:cursor-pointer hover:bg-blue-100 px-4 py-[14px] rounded-xl border border-secondary-neutral-light-100 shadow-sm'
            onClick={() => handleLocationSelect(grid)}
          >
            <div className='flex flex-col item-start w-full'>
              <span className='text-base font-medium text-black'>
                {capitalizeAllText(
                  grid && grid?.place_id
                    ? grid?.description?.split(',')[0]
                    : grid.search_name?.split(',')[0],
                )}
              </span>
              <span className='font-medium text-secondary-neutral-light-300 text-sm leading-tight'>
                {capitalizeAllText(
                  grid && grid?.place_id
                    ? grid?.description?.split(',').slice(1).join(',')
                    : grid.search_name?.split(',').slice(1).join(','),
                )}
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
const SidebarHeader = ({
  selectedTab,
  handleSelectedTab,
  isAdmin,
  isFocused,
  handleHeaderClick = () => {},
}) => {
  return (
    <div>
      <div className='w-full flex justify-between items-center'>
        <label className='font-medium text-xl text-gray-900'>Air Quality Map</label>
        {isFocused && (
          <button
            onClick={handleHeaderClick}
            className='focus:outline-none border rounded-xl hover:cursor-pointer p-2 hidden md:block'
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <p className='text-gray-500 text-sm font-medium w-auto mt-2'>
        Navigate air quality analytics with precision and actionable tips.
      </p>
      {!isAdmin && <TabSelector selectedTab={selectedTab} setSelectedTab={handleSelectedTab} />}
    </div>
  );
};

// Week prediction
const WeekPrediction = ({ currentDay, weeklyPredictions, weekDays, loading }) => {
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
      {/* <div className='mb-5 relative'>
        <Button
          className='flex flex-row-reverse shadow rounded-lg text-sm text-secondary-neutral-light-600 font-medium leading-tight bg-white h-8 my-1'
          variant='outlined'
          Icon={ChevronDownIcon}
          onClick={() => setOpenDatePicker(!openDatePicker)}
        >
          {format(value, 'MMM dd, yyyy')}
        </Button>

        {openDatePicker && (
          <div className='absolute z-[900]'>
            <Calendar
              handleValueChange={handleDateValueChange}
              closeDatePicker={() => setOpenDatePicker(false)}
              initialMonth1={new Date()}
              initialMonth2={new Date()}
              showTwoCalendars={false}
            />
          </div>
        )}
      </div> */}
      <div className='flex justify-between items-center gap-2'>
        {weeklyPredictions && weeklyPredictions.length > 0
          ? weeklyPredictions.map((prediction, index) => (
              <div
                key={index}
                className={`rounded-[40px] px-0.5 pt-1.5 pb-0.5 flex flex-col justify-center items-center gap-2 shadow ${
                  new Date(prediction.time).toLocaleDateString('en-US', { weekday: 'long' }) ===
                  currentDay
                    ? 'bg-blue-600'
                    : 'bg-secondary-neutral-dark-100'
                }`}
              >
                <div className='flex flex-col items-center justify-start gap-[3px]'>
                  <div
                    className={`text-center text-sm font-semibold leading-tight ${
                      new Date(prediction.time).toLocaleDateString('en-US', { weekday: 'long' }) ===
                      currentDay
                        ? 'text-primary-300'
                        : 'text-secondary-neutral-dark-400'
                    }`}
                  >
                    {new Date(prediction.time)
                      .toLocaleDateString('en-US', { weekday: 'long' })
                      .charAt(0)}
                  </div>
                  {loading ? (
                    <div className='mx-auto'>
                      <Spinner width={6} height={6} />
                    </div>
                  ) : (
                    <div
                      className={`text-center text-sm font-medium leading-tight ${
                        new Date(prediction.time).toLocaleDateString('en-US', {
                          weekday: 'long',
                        }) === currentDay
                          ? 'text-white'
                          : 'text-secondary-neutral-dark-200'
                      }`}
                    >
                      {prediction?.pm2_5?.toFixed(0)}
                    </div>
                  )}
                </div>
                <Image
                  src={
                    prediction.pm2_5 && getAQIcon('pm2_5', prediction.pm2_5)
                      ? images[getAQIcon('pm2_5', prediction.pm2_5)]
                      : images['Invalid']
                  }
                  alt='Air Quality Icon'
                  width={32}
                  height={32}
                />
              </div>
            ))
          : weekDays.map((day) => (
              <div
                className='rounded-[40px] px-0.5 pt-1.5 pb-0.5 flex flex-col justify-center items-center gap-2 shadow bg-secondary-neutral-dark-100'
                key={day}
              >
                <div className='flex flex-col items-center justify-start gap-[3px]'>
                  <div className='text-center text-sm font-semibold leading-tight text-secondary-neutral-dark-400'>
                    {day.charAt(0)}
                  </div>
                  {loading ? (
                    <div className='mx-auto'>
                      <Spinner width={6} height={6} />
                    </div>
                  ) : (
                    <div className='text-center text-sm font-medium leading-tight text-secondary-neutral-dark-200'>
                      --
                    </div>
                  )}
                </div>
                <Image src={images['Invalid']} alt='Air Quality Icon' width={32} height={32} />
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
const SearchResultsSkeleton = () => {
  const numElements = 6;
  return (
    <div className='flex flex-col gap-4 animate-pulse px-4 mt-5'>
      {Array(numElements)
        .fill()
        .map((_, i) => (
          <div key={i} className='bg-secondary-neutral-dark-50 rounded-xl w-full h-16' />
        ))}
    </div>
  );
};

const Sidebar = ({ siteDetails, isAdmin }) => {
  const dispatch = useDispatch();
  const [isFocused, setIsFocused] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [countryFlatList, setCountryFlatList] = useState([]);
  const [selectedTab, setSelectedTab] = useState('locations');
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const openLocationDetailsSection = useSelector((state) => state.map.showLocationDetails);
  const selectedLocationDetails = useSelector((state) => state.map.selectedLocation);
  const mapLoading = useSelector((state) => state.map.mapLoading);
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
  const [weeklyPredictions, setWeeklyPredictions] = useState([]);
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const reduxSearchTerm = useSelector((state) => state.locationSearch.searchTerm);

  const focus = isFocused || reduxSearchTerm.length > 0;
  const selectedSites = useSelector((state) => state.map.suggestedSites);

  useEffect(() => {
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setIsFocused(false);
  }, []);

  useEffect(() => {
    if (Array.isArray(siteDetails) && siteDetails.length > 0) {
      let newUniqueCountries = [];
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

      setCountryData(newCountryData);
      setCountryFlatList([...newUniqueCountries]);
    } else {
      console.error('Oops! Unable to load sites and show countries');
    }
  }, [siteDetails]);

  useEffect(() => {
    if (selectedSites) {
      setLocationSearchPreferences((prevLocationSearchPreferences) => ({
        ...prevLocationSearchPreferences,
        custom: selectedSites,
      }));
    }
  }, [selectedSites, isFocused]);

  useEffect(() => {
    setShowLocationDetails(openLocationDetailsSection);
  }, [openLocationDetailsSection]);

  useEffect(() => {
    setSelectedSite(selectedLocationDetails);
  }, [selectedLocationDetails]);

  const handleSelectedTab = (tab) => {
    setSelectedTab(tab);
  };

  const handleLocationSelect = useCallback(
    (data) => {
      dispatch(setOpenLocationDetails(true));
      setIsFocused(false);

      try {
        dispatch(
          setCenter({
            latitude: data?.geometry?.coordinates[1] || data?.latitude || 0,
            longitude: data?.geometry?.coordinates[0] || data?.longitude || 0,
          }),
        );
        dispatch(setZoom(11));
        dispatch(setSelectedLocation(data));
      } catch (error) {
        console.error('Failed to set location:', error);
      }
    },
    [dispatch],
  );

  const handleSearch = async () => {
    setLoading(true);
    setIsFocused(true);
    if (reduxSearchTerm && reduxSearchTerm.length >= 1) {
      try {
        // Create a new AutocompleteService instance
        const autocompleteService = new google.maps.places.AutocompleteService();

        // Call getPlacePredictions to retrieve autocomplete suggestions
        autocompleteService.getPlacePredictions(
          {
            input: reduxSearchTerm,
            types: ['establishment', 'geocode'],
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              // Filter predictions to include only those within the specified countries
              const filteredPredictions = predictions.filter((prediction) => {
                return countryFlatList.some((country) =>
                  prediction.description.toLowerCase().includes(country.toLowerCase()),
                );
              });

              // Retrieve the details of each prediction to get latitude and longitude
              const locationPromises = filteredPredictions.map((prediction) => {
                return new Promise((resolve, reject) => {
                  const placesService = new google.maps.places.PlacesService(
                    document.createElement('div'),
                  );
                  placesService.getDetails(
                    { placeId: prediction.place_id },
                    (place, placeStatus) => {
                      if (placeStatus === google.maps.places.PlacesServiceStatus.OK) {
                        resolve({
                          description: prediction.description,
                          latitude: place.geometry.location.lat(),
                          longitude: place.geometry.location.lng(),
                          place_id: prediction.place_id,
                        });
                      } else {
                        reject(
                          new Error(`Failed to retrieve details for ${prediction.description}`),
                        );
                      }
                    },
                  );
                });
              });

              // Resolve all location promises to get the latitude and longitude for each prediction
              Promise.all(locationPromises)
                .then((locations) => {
                  setSearchResults(locations);
                  setLoading(false);
                })
                .catch((error) => {
                  console.error('Failed to retrieve location details:', error);
                  setLoading(false);
                });
            } else {
              console.error('Autocomplete search failed with status:', status);
              if (status === 'ZERO_RESULTS') {
                setShowNoResultsMsg(true);
                setLoading(false);
                setSearchResults([]);
              }
              setLoading(false);
            }
          },
        );
      } catch (error) {
        console.error('Failed to search:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
      setLoading(false);
      setShowNoResultsMsg(false);
    }
  };

  const handleClearSearch = () => {
    handleHeaderClick();
  };

  useEffect(() => {
    if (reduxSearchTerm !== '') {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [reduxSearchTerm]);

  const handleHeaderClick = () => {
    setIsFocused(false);
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setSearchResults([]);
    setShowNoResultsMsg(false);
  };

  useEffect(() => {
    const fetchWeeklyPredictions = async () => {
      setLoading(true);
      if (selectedSite?._id) {
        try {
          const response = await dailyPredictionsApi(selectedSite._id);
          setWeeklyPredictions(response?.forecasts);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setWeeklyPredictions([]);
      }
    };

    fetchWeeklyPredictions();
  }, [selectedSite]);

  return (
    <div className='w-full min-w-[380px] lg:w-[470px] h-dvh bg-white sidebar-scroll-bar mb-4'>
      {/* Sidebar Header */}
      <div className={`${!isFocused && !showLocationDetails ? 'space-y-4' : 'hidden'} px-4 pt-4`}>
        <SidebarHeader selectedTab={selectedTab} handleSelectedTab={handleSelectedTab} isAdmin />
        {!isAdmin && <hr />}
      </div>

      <div className='h-dvh'>
        {/* section 1 */}
        {selectedSite && mapLoading ? (
          // show a loading skeleton
          <div className='flex flex-col gap-4 animate-pulse px-4 mt-5'>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className='bg-secondary-neutral-dark-50 rounded-xl w-full h-16' />
            ))}
          </div>
        ) : (
          <div className={`${isFocused || showLocationDetails ? 'hidden' : ''}`}>
            <div onClick={() => setIsFocused(true)} className='mt-5 px-4'>
              <SearchField showSearchResultsNumber={false} focus={false} />
            </div>
            <div>
              <div className='flex items-center mt-5 overflow-hidden px-4 transition-all duration-300 ease-in-out'>
                <button
                  onClick={() => {
                    dispatch(clearData());
                    const selSites = siteDetails
                      ? [...siteDetails].sort((a, b) => a.name.localeCompare(b.name))
                      : [];
                    dispatch(addSuggestedSites(selSites));
                    setSelectedCountry(null);
                  }}
                  className='py-[6px] px-[10px] rounded-full mb-3 bg-blue-500 text-white text-sm font-medium'
                >
                  All
                </button>
                <div className='country-scroll-bar'>
                  <CountryList
                    data={countryData}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    siteDetails={siteDetails}
                  />
                </div>
              </div>

              <div className='border border-secondary-neutral-light-100 my-5' />

              <div>
                {selectedSites && selectedSites.length > 0 && (
                  <>
                    <div className='flex justify-between items-center px-4'>
                      <div className='flex gap-1'>
                        <div className='font-medium text-secondary-neutral-dark-400 text-sm'>
                          Sort by:
                        </div>
                        <select className='rounded-md m-0 p-0 text-sm text-center font-medium text-secondary-neutral-dark-700 outline-none focus:outline-none border-none'>
                          <option value='custom'>Suggested</option>
                          {/* <option value='near_me'>Near me</option> */}
                        </select>
                      </div>
                      {/* <Button
                        className='text-sm font-medium'
                        paddingStyles='p-0'
                        variant='primaryText'
                        onClick={() => {}}>
                        Filters
                      </Button> */}
                    </div>
                    <SectionCards
                      searchResults={selectedSites}
                      handleLocationSelect={handleLocationSelect}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 2 */}
        <div
          className={`flex flex-col h-full pt-4 w-auto ${
            isFocused && !showLocationDetails ? '' : 'hidden'
          }`}
        >
          {/* Sidebar Header */}
          <div className={`flex flex-col gap-5 px-4`}>
            <SidebarHeader
              selectedTab={selectedTab}
              handleSelectedTab={handleSelectedTab}
              isAdmin
              isFocused={isFocused}
              handleHeaderClick={handleHeaderClick}
            />
            <SearchField
              onSearch={() => handleSearch()}
              onClearSearch={handleClearSearch}
              focus={focus}
              showSearchResultsNumber={true}
            />
          </div>

          {reduxSearchTerm === '' && (
            <div className='border border-secondary-neutral-light-100 mt-8' />
          )}

          {reduxSearchTerm && (
            <div
              className={`border border-secondary-neutral-light-100 ${
                reduxSearchTerm.length > 0 && 'mt-3'
              }`}
            />
          )}

          {isLoading && searchResults.length === 0 && <SearchResultsSkeleton />}

          {searchResults?.length === 0 && !isLoading && showNoResultsMsg ? (
            <div className='flex flex-col justify-center items-center h-full w-full px-6'>
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

        {selectedSite && !mapLoading && (
          <div>
            <div className='bg-secondary-neutral-dark-50 pt-6 pb-5'>
              <div className='flex items-center gap-2 text-black-800 mb-4 mx-4'>
                <Button
                  paddingStyles='p-0'
                  onClick={() => {
                    setIsFocused(false);
                    dispatch(setOpenLocationDetails(false));
                    dispatch(setSelectedLocation(null));
                    dispatch(addSearchTerm(''));
                    setSearchResults([]);
                    setShowNoResultsMsg(false);
                  }}
                >
                  <ArrowLeftIcon />
                </Button>
                <h3 className='text-xl font-medium leading-7'>
                  {
                    capitalizeAllText(
                      selectedSite?.description ||
                        (selectedSite?.name && selectedSite.name) ||
                        selectedSite?.search_name ||
                        selectedSite?.location,
                    )?.split(',')[0]
                  }
                </h3>
              </div>

              <div className='mx-4'>
                <WeekPrediction
                  currentDay={currentDay}
                  weeklyPredictions={weeklyPredictions}
                  weekDays={weekDays}
                  loading={isLoading}
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
                    {selectedSite?.pm2_5?.toFixed(2) || '-'}
                  </div>
                </div>
                <Image
                  src={
                    selectedSite?.pm2_5?.toFixed(2) &&
                    getAQIcon('pm2_5', selectedSite?.pm2_5?.toFixed(2))
                      ? images[getAQIcon('pm2_5', selectedSite?.pm2_5?.toFixed(2))]
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
                  selectedSite?.airQuality ? (
                    <p className='text-xl font-bold leading-7 text-secondary-neutral-dark-950'>
                      <span className='text-blue-500'>
                        {capitalizeAllText(
                          selectedSite?.description?.split(',')[0] ||
                            selectedSite?.name?.split(',')[0] ||
                            selectedSite?.search_name ||
                            selectedSite?.location,
                        )}
                        's
                      </span>{' '}
                      Air Quality is expected to be {selectedSite?.airQuality} today.{' '}
                      {getAQIMessage('pm2_5', selectedSite?.pm2_5?.toFixed(2))}
                    </p>
                  ) : (
                    <p className='text-xl font-bold leading-7 text-secondary-neutral-dark-950'>
                      No air quality for this place.
                    </p>
                  )
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
