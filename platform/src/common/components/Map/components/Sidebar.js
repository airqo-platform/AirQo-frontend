import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCenter,
  setZoom,
  setLocation,
  setOpenLocationDetails,
  setSelectedLocation,
  addSuggestedSites,
  reSetMap,
  setSelectedNode,
  setSelectedWeeklyPrediction,
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
import { isValid, parseISO, isToday, isTomorrow, isThisWeek, format, isSameDay } from 'date-fns';
import Calendar from '@/components/Calendar/Calendar';
import useOutsideClick from '@/core/utils/useOutsideClick';
import { useWindowSize } from '@/lib/windowSize';
import { getPlaceDetails } from '@/core/utils/getLocationGeomtry';
import { getAutocompleteSuggestions } from '@/core/utils/AutocompleteSuggestions';

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
  // Early return if searchResults is not an array or handleLocationSelect is not a function
  if (!Array.isArray(searchResults) || typeof handleLocationSelect !== 'function') {
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
      <div className='sidebar-scroll-bar mb-[200px] flex flex-col gap-4 my-5 px-4'>
        {visibleResults.map((grid, index) => (
          <div
            key={grid._id || index} // Use grid._id or index as the key
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
                    ? grid?.description?.includes(',') &&
                      grid?.description?.split(',').slice(1).join('').trim()
                      ? grid?.description?.split(',').slice(1).join(',')
                      : grid?.description
                    : grid.region?.includes(',') && grid.region?.split(',').slice(1).join('').trim()
                    ? grid.region?.split(',').slice(1).join(',')
                    : grid.region,
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
const WeekPrediction = ({
  selectedSite,
  selectedWeeklyPrediction,
  currentDay,
  weeklyPredictions,
  weekDays,
  loading,
}) => {
  const dispatch = useDispatch();
  // Ensure the initial value is a valid date object
  const [value, setValue] = useState(selectedSite?.time ? new Date(selectedSite.time) : new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const dropdownRef = useRef(null);

  const handleDateValueChange = (newValue) => {
    // Ensure the new value is a valid date object
    const date = newValue.start ? new Date(newValue.start) : new Date();
    setValue(date);
  };

  useOutsideClick(dropdownRef, () => {
    setOpenDatePicker(false);
  });

  const isActive = (prediction) => {
    const predictionDay = new Date(prediction.time).toLocaleDateString('en-US', {
      weekday: 'long',
    });
    return selectedWeeklyPrediction
      ? prediction.time === selectedWeeklyPrediction.time
      : predictionDay === currentDay;
  };

  // Helper function to safely format the date
  const safeFormatDate = (date) => {
    return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date';
  };

  return (
    <div className='relative'>
      <div className='mb-5 relative'>
        <Button
          className='flex flex-row-reverse shadow rounded-md text-sm text-secondary-neutral-light-600 font-medium leading-tight bg-white h-8 my-1'
          variant='outlined'
          // onClick={() => setOpenDatePicker(!openDatePicker)}
        >
          {safeFormatDate(value)}
        </Button>

        {openDatePicker && (
          <div className='absolute z-[900]' ref={dropdownRef}>
            <Calendar
              handleValueChange={handleDateValueChange}
              closeDatePicker={() => setOpenDatePicker(false)}
              initialMonth1={new Date()}
              initialMonth2={new Date()}
              showTwoCalendars={false}
            />
          </div>
        )}
      </div>
      <div className='flex justify-between items-center gap-2'>
        {weeklyPredictions && weeklyPredictions.length > 0
          ? weeklyPredictions.map((prediction, index) => (
              <div
                key={index}
                onClick={() => dispatch(setSelectedWeeklyPrediction(prediction))}
                className={`rounded-[40px] px-0.5 pt-1.5 pb-0.5 flex flex-col justify-center items-center gap-2 shadow ${
                  isActive(prediction) ? 'bg-blue-600' : 'bg-secondary-neutral-dark-100'
                }`}
              >
                <div className='flex flex-col items-center justify-start gap-[3px]'>
                  <div
                    className={`text-center text-sm font-semibold leading-tight ${
                      isActive(prediction) ? 'text-primary-300' : 'text-secondary-neutral-dark-400'
                    }`}
                  >
                    {new Date(prediction.time)
                      .toLocaleDateString('en-US', { weekday: 'long' })
                      .charAt(0)}
                  </div>
                  {loading ? (
                    <Spinner width={6} height={6} />
                  ) : (
                    <div
                      className={`text-center text-sm font-medium leading-tight ${
                        isActive(prediction) ? 'text-white' : 'text-secondary-neutral-dark-200'
                      }`}
                    >
                      {new Date(prediction.time).toLocaleDateString('en-US', {
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
                {isSameDay(new Date(selectedSite.time), new Date(prediction.time)) ? (
                  <Image
                    src={
                      selectedSite.pm2_5 && getAQIcon('pm2_5', selectedSite.pm2_5)
                        ? images[getAQIcon('pm2_5', selectedSite.pm2_5)]
                        : images['Invalid']
                    }
                    alt='Air Quality Icon'
                    width={32}
                    height={32}
                  />
                ) : (
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
                )}
              </div>
            ))
          : weekDays.map((day) => (
              <div
                className={`rounded-[40px] px-0.5 pt-1.5 pb-0.5 flex flex-col justify-center items-center gap-2 shadow ${
                  day === currentDay ? 'bg-blue-600' : 'bg-secondary-neutral-dark-100'
                }`}
                key={day}
              >
                <div className='flex flex-col items-center justify-start gap-[3px]'>
                  <div className='text-center text-sm font-semibold leading-tight text-secondary-neutral-dark-400'>
                    {day.charAt(0)}
                  </div>
                  {loading ? (
                    <Spinner width={6} height={6} />
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
  const { width } = useWindowSize();
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
  const gridsSummaryData = useSelector((state) => state.grids.gridsSummary);
  const [showNoResultsMsg, setShowNoResultsMsg] = useState(false);
  const [locationSearchPreferences, setLocationSearchPreferences] = useState({
    custom: [],
    nearMe: [],
  });
  const [weeklyPredictions, setWeeklyPredictions] = useState([]);
  const selectedWeeklyPrediction = useSelector((state) => state.map.selectedWeeklyPrediction);
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const reduxSearchTerm = useSelector((state) => state.locationSearch.searchTerm);
  const focus = isFocused || reduxSearchTerm.length > 0;
  const selectedSites = useSelector((state) => state.map.suggestedSites);
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const autoCompleteSessionToken = useMemo(
    () => new google.maps.places.AutocompleteSessionToken(),
    [google.maps.places.AutocompleteSessionToken],
  );

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
    } else {
      console.error('Oops! Unable to load sites and show countries');
    }
  }, [siteDetails]);

  useEffect(() => {
    if (gridsSummaryData && gridsSummaryData.length > 0) {
      // Check if selected grid admin_level is country
      const countryNames = gridsSummaryData
        .filter((grid) => grid.admin_level.toLowerCase() === 'country')
        .map((country) => country.name.toLowerCase());

      setCountryFlatList(countryNames);
    }
  }, [gridsSummaryData]);

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
    async (data) => {
      dispatch(setOpenLocationDetails(true));
      setIsFocused(false);
      try {
        let newDataValue = data;

        let latitude, longitude;

        if (data?.place_id) {
          try {
            const placeDetails = await getPlaceDetails(data.place_id);
            if (placeDetails.latitude && placeDetails.longitude) {
              newDataValue = { ...newDataValue, ...placeDetails };
              latitude = newDataValue?.latitude;
              longitude = newDataValue?.longitude;
            }
          } catch (error) {
            console.error(error.message);
            return;
          }
        } else {
          latitude = data?.geometry?.coordinates[1];
          longitude = data?.geometry?.coordinates[0];
        }

        dispatch(setCenter({ latitude, longitude }));
        dispatch(setZoom(11));
        dispatch(setSelectedLocation(newDataValue));
      } catch (error) {
        setIsError({
          isError: true,
          message: error.message,
          type: 'error',
        });
      }
    },
    [dispatch],
  );

  const filterPredictions = (predictions) => {
    return predictions.filter((prediction) => {
      return countryFlatList.some((country) =>
        prediction.description.toLowerCase().includes(country.toLowerCase()),
      );
    });
  };

  const getLocationsDetails = (predictions) => {
    const locationPromises = predictions.map((prediction) => {
      return new Promise((resolve) => {
        resolve({
          description: prediction.description,
          place_id: prediction.place_id,
        });
      });
    });

    return Promise.all(locationPromises);
  };

  const handleSearchError = (error) => {
    if (error.message === 'ZERO_RESULTS') {
      setShowNoResultsMsg(true);
      setSearchResults([]);
    } else {
      console.error(error.message);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setIsFocused(true);
    if (reduxSearchTerm && reduxSearchTerm.length > 1) {
      try {
        const predictions = await getAutocompleteSuggestions(
          reduxSearchTerm,
          autoCompleteSessionToken,
        );
        if (predictions && predictions.length > 0) {
          const filteredLocations = filterPredictions(predictions);
          const locations = await getLocationsDetails(filteredLocations);
          setSearchResults(locations);
        }
      } catch (error) {
        handleSearchError(error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
      setLoading(false);
      setShowNoResultsMsg(false);
    }
  };

  useEffect(() => {
    if (reduxSearchTerm !== '') {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [reduxSearchTerm]);

  useEffect(() => {
    const fetchWeeklyPredictions = async () => {
      setLoading(true);
      if (selectedSite?._id) {
        try {
          // Predictions for waq locations
          if (selectedSite?.forecast && selectedSite?.forecast.length > 0) {
            setWeeklyPredictions(selectedLocationDetails?.forecast);
          } else {
            const response = await dailyPredictionsApi(selectedSite._id);
            setWeeklyPredictions(response?.forecasts);
          }
        } catch (error) {
          console.error(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setWeeklyPredictions([]);
        setLoading(false);
      }
    };

    fetchWeeklyPredictions();
  }, [selectedSite]);

  /**
   * Handle exit
   * */
  const handleExit = () => {
    setIsFocused(false);
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setSearchResults([]);
    setShowNoResultsMsg(false);
    dispatch(setSelectedNode(null));
    dispatch(setSelectedWeeklyPrediction(null));
    dispatch(reSetMap());
  };

  /**
   * Handle all selection
   */
  const handleAllSelection = () => {
    setSelectedCountry(null);
    dispatch(reSetMap());
    const selSites = siteDetails
      ? [...siteDetails].sort((a, b) => a.name.localeCompare(b.name))
      : [];
    dispatch(addSuggestedSites(selSites));
  };

  /**
   * Handle clear search
   */
  const handleClearSearch = () => {
    handleExit();
  };

  // Helper function to insert space before capital letters
  const addSpacesToCategory = (category) => {
    return category.split('').reduce((result, char, index) => {
      if (index > 0 && char === char.toUpperCase()) {
        return result + ' ' + char;
      }
      return result + char;
    }, '');
  };

  // Helper function to format the date message
  const formatDateMessage = (date) => {
    if (isToday(date)) {
      return 'today';
    } else if (isTomorrow(date)) {
      return 'tomorrow';
    } else if (isThisWeek(date)) {
      return 'this week';
    } else {
      return format(date, 'MMMM do');
    }
  };

  return (
    <div className='w-full h-dvh bg-white overflow-hidden mb-4'>
      {/* Sidebar Header */}
      <div className={`${!isFocused && !showLocationDetails ? 'space-y-4' : 'hidden'} pt-4`}>
        <div className='px-4'>
          <SidebarHeader selectedTab={selectedTab} handleSelectedTab={handleSelectedTab} isAdmin />
        </div>
        {!isAdmin && <hr />}
        <div className={`${isFocused || showLocationDetails ? 'hidden' : ''}`}>
          <div onClick={() => setIsFocused(true)} className='mt-5 px-4'>
            <SearchField showSearchResultsNumber={false} focus={false} />
          </div>
          <div className='flex items-center mt-5 overflow-hidden px-4 transition-all duration-300 ease-in-out'>
            <button
              onClick={handleAllSelection}
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
        </div>
      </div>

      {/* section 1 */}
      <div className='h-dvh sidebar-scroll-bar'>
        {selectedSite && mapLoading ? (
          // show a loading skeleton
          <div className='flex flex-col gap-4 animate-pulse px-4 mt-5'>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className='bg-secondary-neutral-dark-50 rounded-xl w-full h-16' />
            ))}
          </div>
        ) : (
          <div className={`${isFocused || showLocationDetails ? 'hidden' : ''}`}>
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
              handleHeaderClick={handleExit}
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
          {isError.message !== '' && (
            <Toast
              message={isError.message}
              clearData={() => setIsError({ message: '', type: '', isError: false })}
              type={isError.type}
              timeout={3000}
              dataTestId='sidebar-toast'
              size='lg'
              position='bottom'
            />
          )}

          {isLoading && searchResults.length === 0 && <SearchResultsSkeleton />}

          {searchResults?.length === 0 && !isLoading ? (
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
                <Button paddingStyles='p-0' onClick={handleExit}>
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
                  selectedSite={selectedSite}
                  selectedWeeklyPrediction={selectedWeeklyPrediction}
                  currentDay={currentDay}
                  weeklyPredictions={weeklyPredictions}
                  weekDays={weekDays}
                  loading={isLoading}
                />
              </div>
            </div>

            <div className='border border-secondary-neutral-light-100 my-5' />

            <div
              className={`mx-4 mb-5 ${
                width < 1024 ? 'sidebar-scroll-bar h-dvh' : ''
              } flex flex-col gap-4`}
            >
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
                    {selectedWeeklyPrediction
                      ? isSameDay(
                          new Date(selectedSite.time),
                          new Date(selectedWeeklyPrediction.time),
                        )
                        ? selectedSite.pm2_5?.toFixed(2)
                        : selectedWeeklyPrediction.pm2_5?.toFixed(2)
                      : selectedSite?.pm2_5?.toFixed(2) || '-'}
                  </div>
                </div>
                <Image
                  src={
                    selectedWeeklyPrediction
                      ? isSameDay(
                          new Date(selectedSite.time),
                          new Date(selectedWeeklyPrediction.time),
                        )
                        ? images[getAQIcon('pm2_5', selectedSite.pm2_5)]
                        : images[getAQIcon('pm2_5', selectedWeeklyPrediction.pm2_5)]
                      : images[getAQIcon('pm2_5', selectedSite.pm2_5)] || images['Invalid']
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
                  (selectedWeeklyPrediction && selectedWeeklyPrediction.airQuality) ||
                  selectedSite?.airQuality ? (
                    <p className='text-xl font-bold leading-7 text-secondary-neutral-dark-950'>
                      <span className='text-blue-500'>
                        {capitalizeAllText(
                          selectedWeeklyPrediction && selectedWeeklyPrediction.description
                            ? selectedWeeklyPrediction.description.split(',')[0]
                            : selectedSite?.description?.split(',')[0] ||
                                selectedSite?.name?.split(',')[0] ||
                                selectedSite?.search_name ||
                                selectedSite?.location,
                        )}
                        's
                      </span>{' '}
                      Air Quality is expected to be{' '}
                      {selectedWeeklyPrediction
                        ? isSameDay(
                            new Date(selectedSite.time),
                            new Date(selectedWeeklyPrediction.time),
                          )
                          ? addSpacesToCategory(
                              getAQICategory('pm2_5', selectedSite.pm2_5).category,
                            )
                          : addSpacesToCategory(
                              getAQICategory('pm2_5', selectedWeeklyPrediction.pm2_5).category,
                            )
                        : addSpacesToCategory(
                            getAQICategory('pm2_5', selectedSite.pm2_5).category,
                          )}{' '}
                      {formatDateMessage(
                        selectedWeeklyPrediction
                          ? isSameDay(
                              new Date(selectedSite.time),
                              new Date(selectedWeeklyPrediction.time),
                            )
                            ? new Date(selectedSite.time)
                            : new Date(selectedWeeklyPrediction.time)
                          : new Date(selectedSite.time),
                      )}
                      .{' '}
                      {getAQIMessage(
                        'pm2_5',
                        formatDateMessage(
                          selectedWeeklyPrediction
                            ? isSameDay(
                                new Date(selectedSite.time),
                                new Date(selectedWeeklyPrediction.time),
                              )
                              ? new Date(selectedSite.time)
                              : new Date(selectedWeeklyPrediction.time)
                            : new Date(selectedSite.time),
                        ),
                        selectedWeeklyPrediction
                          ? selectedWeeklyPrediction.pm2_5.toFixed(2)
                          : selectedSite?.pm2_5?.toFixed(2),
                      )}
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
    </div>
  );
};

export default Sidebar;
