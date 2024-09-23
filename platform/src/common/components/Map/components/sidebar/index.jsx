import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCenter,
  setZoom,
  setOpenLocationDetails,
  setSelectedLocation,
  addSuggestedSites,
  reSetMap,
  setSelectedNode,
  setSelectedWeeklyPrediction,
  setMapLoading,
} from '@/lib/store/services/map/MapSlice';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import {
  fetchRecentMeasurementsData,
  clearMeasurementsData,
} from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';
import { dailyPredictionsApi } from '@/core/apis/predict';
import { capitalizeAllText } from '@/core/utils/strings';
import { useWindowSize } from '@/lib/windowSize';
import { getPlaceDetails } from '@/core/utils/getLocationGeomtry';
import { getAutocompleteSuggestions } from '@/core/utils/AutocompleteSuggestions';

import allCountries from '../../data/countries.json';
import SearchField from '@/components/search/SearchField';
import Button from '@/components/Button';
import Toast from '../../../Toast';
import LocationCards from './components/LocationCards';
import CountryList from './components/CountryList';
import LocationAlertCard from './components/LocationAlertCard';
import WeekPrediction from './components/Predictions';
import PollutantCard from './components/PollutantCard';

import LocationIcon from '@/icons/LocationIcon';
import ArrowLeftIcon from '@/icons/arrow_left.svg';
import SidebarHeader from './components/SidebarHeader';
import SearchResultsSkeleton from './components/SearchResultsSkeleton';

const MapSidebar = ({ siteDetails, isAdmin }) => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();

  // Local States
  const [isFocused, setIsFocused] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [weeklyPredictions, setWeeklyPredictions] = useState([]);
  const [error, setError] = useState({ isError: false, message: '', type: '' });

  // Redux Selectors
  const openLocationDetails = useSelector(
    (state) => state.map.showLocationDetails,
  );
  const selectedLocation = useSelector((state) => state.map.selectedLocation);
  const mapLoading = useSelector((state) => state.map.mapLoading);
  const measurementsLoading = useSelector(
    (state) => state.recentMeasurements.status,
  );
  const selectedWeeklyPrediction = useSelector(
    (state) => state.map.selectedWeeklyPrediction,
  );
  const reduxSearchTerm = useSelector(
    (state) => state.locationSearch.searchTerm,
  );
  const suggestedSites = useSelector((state) => state.map.suggestedSites);

  const isSearchFocused = isFocused || reduxSearchTerm.length > 0;

  // Memoized Autocomplete Session Token
  const autoCompleteSessionToken = useMemo(
    () => new google.maps.places.AutocompleteSessionToken(),
    [],
  );

  /**
   * Fetch Weekly Predictions
   */
  const fetchWeeklyPredictions = useCallback(async () => {
    if (!selectedLocation?._id) {
      setWeeklyPredictions([]);
      return;
    }

    setLoading(true);
    try {
      if (selectedLocation?.forecast && selectedLocation.forecast.length > 0) {
        setWeeklyPredictions(selectedLocation.forecast);
      } else {
        const response = await dailyPredictionsApi(selectedLocation._id);
        setWeeklyPredictions(response?.forecasts || []);
      }
    } catch (error) {
      console.error('Failed to fetch weekly predictions:', error);
      setError({
        isError: true,
        message: 'Failed to fetch weekly predictions',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  /**
   * Initialize Country Data
   */
  useEffect(() => {
    if (Array.isArray(siteDetails) && siteDetails.length > 0) {
      const uniqueCountries = siteDetails.reduce((acc, site) => {
        const country = allCountries.find((c) => c.country === site.country);
        if (country && !acc.some((item) => item.country === site.country)) {
          acc.push({ ...site, ...country });
        }
        return acc;
      }, []);
      setCountryData(uniqueCountries);
    } else {
      console.error('Oops! Unable to load sites and show countries');
    }
  }, [siteDetails]);

  /**
   * Reset Map on Mount
   */
  useEffect(() => {
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setIsFocused(false);
  }, [dispatch]);

  /**
   * Handle Map Loading Indicator
   */
  useEffect(() => {
    const timer = setTimeout(() => dispatch(setMapLoading(false)), 2000);
    return () => clearTimeout(timer);
  }, [dispatch, selectedLocation]);

  /**
   * Update Selected Site and Fetch Measurements & Predictions
   */
  useEffect(() => {
    if (selectedLocation) {
      dispatch(fetchRecentMeasurementsData({ site_id: selectedLocation._id }))
        .unwrap()
        .then(() => fetchWeeklyPredictions())
        .catch((error) => {
          console.error('Failed to fetch recent measurements:', error);
          setError({
            isError: true,
            message: 'Failed to fetch recent measurements',
            type: 'error',
          });
        });
    }
  }, [selectedLocation, dispatch, fetchWeeklyPredictions]);

  /**
   * Handle Location Selection
   */
  const handleLocationSelect = useCallback(
    async (data) => {
      dispatch(setOpenLocationDetails(true));
      setIsFocused(false);
      dispatch(clearMeasurementsData());
      setWeeklyPredictions([]);

      try {
        let updatedData = data;
        let latitude, longitude;

        if (data?.place_id) {
          const placeDetails = await getPlaceDetails(data.place_id);
          if (placeDetails.latitude && placeDetails.longitude) {
            updatedData = { ...updatedData, ...placeDetails };
            ({ latitude, longitude } = placeDetails);
          }
        } else {
          latitude =
            data?.geometry?.coordinates[1] || data?.approximate_latitude;
          longitude =
            data?.geometry?.coordinates[0] || data?.approximate_longitude;
        }

        dispatch(setCenter({ latitude, longitude }));
        dispatch(setZoom(11));
        dispatch(setSelectedLocation(updatedData));
      } catch (error) {
        console.error('Failed to select location:', error);
        setError({
          isError: true,
          message: 'Failed to select location',
          type: 'error',
        });
      }
    },
    [dispatch],
  );

  /**
   * Handle Search Functionality
   */
  const handleSearch = useCallback(async () => {
    // When search term is empty, show the default message
    if (!reduxSearchTerm || reduxSearchTerm.length <= 1) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setIsFocused(true);

    try {
      const predictions = await getAutocompleteSuggestions(
        reduxSearchTerm,
        autoCompleteSessionToken,
      );
      if (predictions && predictions.length > 0) {
        const locations = predictions.map((prediction) => ({
          description: prediction.description,
          place_id: prediction.place_id,
        }));
        setSearchResults(locations);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [reduxSearchTerm, autoCompleteSessionToken]);

  /**
   * Handle Exit from Search or Details
   */
  const handleExit = useCallback(() => {
    setIsFocused(false);
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setSearchResults([]);
    dispatch(setSelectedNode(null));
    dispatch(setSelectedWeeklyPrediction(null));
    dispatch(reSetMap());
  }, [dispatch]);

  /**
   * Handle Selection of All Sites
   */
  const handleAllSelection = useCallback(() => {
    setSelectedCountry(null);
    dispatch(reSetMap());
    const sortedSites = siteDetails
      ? [...siteDetails].sort((a, b) => a.name.localeCompare(b.name))
      : [];
    dispatch(addSuggestedSites(sortedSites));
  }, [dispatch, siteDetails]);

  /**
   * Render Default Search Message
   */
  const renderDefaultSearchMessage = () => (
    <div className="flex flex-col justify-center items-center h-full w-full pt-8 px-6">
      <div className="p-5 rounded-full bg-secondary-neutral-light-50 border border-secondary-neutral-light-25 mb-2.5">
        <LocationIcon fill="#9EA3AA" />
      </div>
      <div className="my-4 text-center">
        <div className="text-secondary-neutral-dark-700 text-base font-medium mb-1">
          Your search results will appear here
        </div>
        <div className="text-sm font-medium leading-tight text-secondary-neutral-dark-400 w-[244px]">
          Start by typing a location name to see matching results.
        </div>
      </div>
    </div>
  );

  /**
   * Render Loading Skeleton
   */
  const renderLoadingSkeleton = () => (
    <div className="flex flex-col gap-4 animate-pulse px-4 mt-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-secondary-neutral-dark-50 rounded-xl w-full h-16"
        />
      ))}
    </div>
  );

  /**
   * Render No Results Message
   */
  const renderNoResults = (hasSearched = false) => (
    <div className="flex flex-col justify-center items-center h-full w-full pt-8 px-6">
      <div className="p-5 rounded-full bg-secondary-neutral-light-50 border border-secondary-neutral-light-25 mb-2.5">
        <LocationIcon fill="#9EA3AA" />
      </div>
      <div className="my-4 text-center">
        {hasSearched ? (
          <>
            <div className="text-secondary-neutral-dark-700 text-base font-medium mb-1">
              No results found
            </div>
            <div className="text-sm font-medium leading-tight text-secondary-neutral-dark-400 w-[244px]">
              Please try again with a different location name.
            </div>
          </>
        ) : (
          <>
            <div className="text-secondary-neutral-dark-700 text-base font-medium mb-1">
              Your search results will appear here
            </div>
            <div className="text-sm font-medium leading-tight text-secondary-neutral-dark-400 w-[244px]">
              Start by typing a location name to see matching results.
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full rounded-l-xl shadow-sm h-full bg-white overflow-y-auto lg:overflow-hidden">
      {/* Sidebar Header Section */}
      <div
        className={`${!isSearchFocused && !openLocationDetails ? 'space-y-4' : 'hidden'} pt-4`}
      >
        <div className="px-4">
          <SidebarHeader isAdmin={isAdmin} />
        </div>
        {!isAdmin && <hr />}
        {!isSearchFocused && !openLocationDetails && (
          <>
            <div onClick={() => setIsFocused(true)} className="mt-5 px-4">
              <SearchField showSearchResultsNumber={false} focus={false} />
            </div>
            <div className="flex items-center mt-5 overflow-hidden px-4 transition-all duration-300 ease-in-out">
              <button
                onClick={handleAllSelection}
                className="py-[6px] px-[10px] rounded-full mb-3 bg-blue-500 text-white text-sm font-medium"
              >
                All
              </button>
              <div className="country-scroll-bar">
                <CountryList
                  data={countryData}
                  selectedCountry={selectedCountry}
                  setSelectedCountry={setSelectedCountry}
                  siteDetails={siteDetails}
                />
              </div>
            </div>
            <div className="border border-secondary-neutral-light-100 my-5" />
          </>
        )}
      </div>

      <div className="sidebar-scroll-bar">
        {/* Suggested locations */}
        {mapLoading || !suggestedSites || suggestedSites.length === 0
          ? renderLoadingSkeleton()
          : !isSearchFocused &&
            !openLocationDetails &&
            suggestedSites.length > 0 && (
              <>
                <div className="flex justify-between items-center mt-4 px-4">
                  <div className="flex gap-1">
                    <span className="font-medium text-secondary-neutral-dark-400 text-sm">
                      Sort by:
                    </span>
                    <select className="rounded-md m-0 p-0 text-sm text-center font-medium text-secondary-neutral-dark-700 outline-none focus:outline-none border-none">
                      <option value="custom">Suggested</option>
                    </select>
                  </div>
                </div>
                <LocationCards
                  searchResults={suggestedSites}
                  isLoading={isLoading}
                  handleLocationSelect={handleLocationSelect}
                />
              </>
            )}

        {/* Search Results Section */}
        {isSearchFocused && !openLocationDetails && (
          <div className="flex flex-col h-dvh pt-4 w-auto">
            <div className="flex flex-col gap-5 px-4">
              <SidebarHeader
                isAdmin={isAdmin}
                isFocused={isSearchFocused}
                handleHeaderClick={handleExit}
              />
              <SearchField
                onSearch={handleSearch}
                onClearSearch={handleExit}
                focus={isSearchFocused}
                showSearchResultsNumber={true}
              />
            </div>

            {reduxSearchTerm === '' && (
              <div className="border border-secondary-neutral-light-100 mt-8" />
            )}

            {reduxSearchTerm && (
              <div
                className={`border border-secondary-neutral-light-100 ${reduxSearchTerm.length > 0 ? 'mt-3' : ''}`}
              />
            )}

            {reduxSearchTerm === '' ? (
              renderDefaultSearchMessage()
            ) : error.isError ? (
              <Toast
                message={error.message}
                clearData={() =>
                  setError({ isError: false, message: '', type: '' })
                }
                type={error.type}
                timeout={3000}
                dataTestId="sidebar-toast"
                size="lg"
                position="bottom"
              />
            ) : isLoading &&
              searchResults.length === 0 &&
              measurementsLoading ? (
              <SearchResultsSkeleton />
            ) : searchResults.length === 0 && !isLoading ? (
              renderNoResults(true)
            ) : (
              <LocationCards
                searchResults={searchResults}
                isLoading={isLoading}
                handleLocationSelect={handleLocationSelect}
              />
            )}
          </div>
        )}

        {/* Selected Site Details */}
        {selectedLocation && !mapLoading && (
          <div>
            <div className="pt-6 pb-5">
              <div className="flex items-center gap-2 text-black-800 mb-4 mx-4">
                <Button paddingStyles="p-0" onClick={handleExit}>
                  <ArrowLeftIcon />
                </Button>
                <h3 className="text-xl font-medium leading-7">
                  {
                    capitalizeAllText(
                      selectedLocation?.description ||
                        selectedLocation?.search_name ||
                        selectedLocation?.location,
                    )?.split(',')[0]
                  }
                </h3>
              </div>

              <div className="mx-4">
                <WeekPrediction
                  selectedSite={selectedLocation}
                  weeklyPredictions={weeklyPredictions}
                  loading={isLoading}
                />
              </div>
            </div>

            <div className="border border-secondary-neutral-light-100 my-5" />

            <div
              className={`mx-4 mb-5 ${width < 1024 ? 'sidebar-scroll-bar h-dvh' : ''} flex flex-col gap-4`}
            >
              <PollutantCard
                selectedSite={selectedLocation}
                selectedWeeklyPrediction={selectedWeeklyPrediction}
              />
              <LocationAlertCard
                title="Air Quality Alerts"
                selectedSite={selectedLocation}
                selectedWeeklyPrediction={selectedWeeklyPrediction}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MapSidebar.propTypes = {
  siteDetails: PropTypes.arrayOf(PropTypes.object).isRequired,
  isAdmin: PropTypes.bool,
};

MapSidebar.defaultProps = {
  isAdmin: false,
};

export default MapSidebar;
