import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import PropTypes from 'prop-types';
import SidebarHeader from './components/SidebarHeader';
import SearchResultsSkeleton from './components/SearchResultsSkeleton';

const MapSidebar = ({ siteDetails, isAdmin }) => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const [isFocused, setIsFocused] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [weeklyPredictions, setWeeklyPredictions] = useState([]);
  const [showNoResultsMsg, setShowNoResultsMsg] = useState(false);
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });

  const openLocationDetailsSection = useSelector(
    (state) => state.map.showLocationDetails,
  );
  const selectedLocationDetails = useSelector(
    (state) => state.map.selectedLocation,
  );
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
  const selectedSites = useSelector((state) => state.map.suggestedSites);

  const focus = isFocused || reduxSearchTerm.length > 0;

  const autoCompleteSessionToken = useMemo(
    () => new google.maps.places.AutocompleteSessionToken(),
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => dispatch(setMapLoading(false)), 2000);
    return () => clearTimeout(timer);
  }, [dispatch, selectedSite]);

  useEffect(() => {
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setIsFocused(false);
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(siteDetails) && siteDetails.length > 0) {
      const newCountryData = siteDetails.reduce((acc, site) => {
        const countryDetails = allCountries.find(
          (data) => data.country === site.country,
        );
        if (
          countryDetails &&
          !acc.some((item) => item.country === site.country)
        ) {
          acc.push({ ...site, ...countryDetails });
        }
        return acc;
      }, []);
      setCountryData(newCountryData);
    } else {
      console.error('Oops! Unable to load sites and show countries');
    }
  }, [siteDetails]);

  const fetchWeeklyPredictions = useCallback(async () => {
    if (!selectedSite?._id) {
      setWeeklyPredictions([]);
      return;
    }

    setLoading(true);
    try {
      if (selectedSite?.forecast && selectedSite.forecast.length > 0) {
        setWeeklyPredictions(selectedLocationDetails?.forecast);
      } else {
        const response = await dailyPredictionsApi(selectedSite._id);
        setWeeklyPredictions(response?.forecasts);
      }
    } catch (error) {
      console.error('Failed to fetch weekly predictions:', error);
      setIsError({
        isError: true,
        message: 'Failed to fetch weekly predictions',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSite, selectedLocationDetails]);

  useEffect(() => {
    if (selectedSite?._id) {
      dispatch(setMapLoading(true));
      dispatch(fetchRecentMeasurementsData({ site_id: selectedSite._id }))
        .unwrap()
        .then(() => fetchWeeklyPredictions())
        .catch((error) => {
          console.error('Failed to fetch recent measurements:', error);
          setIsError({
            isError: true,
            message: 'Failed to fetch recent measurements',
            type: 'error',
          });
        });
    }
  }, [selectedSite, dispatch, fetchWeeklyPredictions]);

  useEffect(() => {
    setShowLocationDetails(openLocationDetailsSection);
  }, [openLocationDetailsSection]);

  useEffect(() => {
    setSelectedSite(selectedLocationDetails);
  }, [selectedLocationDetails]);

  /**
   * Handle location select
   * */
  const handleLocationSelect = useCallback(
    async (data) => {
      dispatch(setOpenLocationDetails(true));
      setIsFocused(false);
      dispatch(clearMeasurementsData());
      setWeeklyPredictions([]);

      try {
        let newDataValue = data;
        let latitude, longitude;

        if (data?.place_id) {
          const placeDetails = await getPlaceDetails(data.place_id);
          if (placeDetails.latitude && placeDetails.longitude) {
            newDataValue = { ...newDataValue, ...placeDetails };
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
        dispatch(setSelectedLocation(newDataValue));
      } catch (error) {
        console.error('Failed to select location:', error);
        setIsError({
          isError: true,
          message: 'Failed to select location',
          type: 'error',
        });
      }
    },
    [dispatch],
  );

  /**
   * Handle search
   * */
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setIsFocused(true);

    if (reduxSearchTerm && reduxSearchTerm.length > 1) {
      try {
        const predictions = await getAutocompleteSuggestions(
          reduxSearchTerm,
          autoCompleteSessionToken,
        );
        if (predictions && predictions.length > 0) {
          const locations = await Promise.all(
            predictions.map((prediction) => ({
              description: prediction.description,
              place_id: prediction.place_id,
            })),
          );
          setSearchResults(locations);
          setShowNoResultsMsg(false);
        } else {
          setSearchResults([]);
          setShowNoResultsMsg(true);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setIsError({ isError: true, message: 'Search failed', type: 'error' });
        setSearchResults([]);
        setShowNoResultsMsg(true);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
      setShowNoResultsMsg(false);
      setLoading(false);
    }
  }, [reduxSearchTerm, autoCompleteSessionToken]);

  /**
   * Handle exit
   * */
  const handleExit = useCallback(() => {
    setIsFocused(false);
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setSearchResults([]);
    setShowNoResultsMsg(false);
    dispatch(setSelectedNode(null));
    dispatch(setSelectedWeeklyPrediction(null));
    dispatch(reSetMap());
  }, [dispatch]);

  /**
   * Handle all selection
   */
  const handleAllSelection = useCallback(() => {
    setSelectedCountry(null);
    dispatch(reSetMap());
    const selSites = siteDetails
      ? [...siteDetails].sort((a, b) => a.name.localeCompare(b.name))
      : [];
    dispatch(addSuggestedSites(selSites));
  }, [dispatch, siteDetails]);

  /**
   * This will show loading skeleton
   */
  const renderLoadingSkeleton = () => (
    <div className="flex flex-col gap-4 animate-pulse px-4 mt-5">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-secondary-neutral-dark-50 rounded-xl w-full h-16"
        />
      ))}
    </div>
  );

  /**
   * This will No results incase of error
   */
  const renderNoResults = () => (
    <div className="flex flex-col justify-center items-center h-full w-full pt-8 px-6">
      <div className="p-5 rounded-full bg-secondary-neutral-light-50 border border-secondary-neutral-light-25 mb-2.5">
        <LocationIcon fill="#9EA3AA" />
      </div>
      <div className="my-4 text-center">
        <div className="text-secondary-neutral-dark-700 text-base font-medium mb-1">
          No results found
        </div>
        <div className="text-sm font-medium leading-tight text-secondary-neutral-dark-400 w-[244px]">
          Please try again with a different location name
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full rounded-l-xl shadow-sm h-full bg-white overflow-hidden">
      {/* Sidebar Header */}
      <div
        className={`${
          !isFocused && !showLocationDetails ? 'space-y-4' : 'hidden'
        } pt-4`}
      >
        <div className="px-4">
          <SidebarHeader isAdmin={isAdmin} />
        </div>
        {!isAdmin && <hr />}
        <div className={isFocused || showLocationDetails ? 'hidden' : ''}>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="sidebar-scroll-bar">
        {selectedSite && mapLoading ? (
          renderLoadingSkeleton()
        ) : (
          <div className={isFocused || showLocationDetails ? 'hidden' : ''}>
            {selectedSites?.length > 0 && (
              <>
                <div className="flex justify-between items-center px-4">
                  <div className="flex gap-1">
                    <div className="font-medium text-secondary-neutral-dark-400 text-sm">
                      Sort by:
                    </div>
                    <select className="rounded-md m-0 p-0 text-sm text-center font-medium text-secondary-neutral-dark-700 outline-none focus:outline-none border-none">
                      <option value="custom">Suggested</option>
                    </select>
                  </div>
                </div>
                <LocationCards
                  searchResults={selectedSites}
                  isLoading={isLoading}
                  handleLocationSelect={handleLocationSelect}
                />
              </>
            )}
          </div>
        )}

        {/* Search Results Section */}
        <div
          className={`flex flex-col h-full pt-4 w-auto ${
            isFocused && !showLocationDetails ? '' : 'hidden'
          }`}
        >
          <div className="flex flex-col gap-5 px-4">
            <SidebarHeader
              isAdmin={isAdmin}
              isFocused={isFocused}
              handleHeaderClick={handleExit}
            />
            <SearchField
              onSearch={handleSearch}
              onClearSearch={handleExit}
              focus={focus}
              showSearchResultsNumber={true}
            />
          </div>

          {reduxSearchTerm === '' && (
            <div className="border border-secondary-neutral-light-100 mt-8" />
          )}

          {reduxSearchTerm && (
            <div
              className={`border border-secondary-neutral-light-100 ${
                reduxSearchTerm.length > 0 ? 'mt-3' : ''
              }`}
            />
          )}

          {isError.message && (
            <Toast
              message={isError.message}
              clearData={() =>
                setIsError({ message: '', type: '', isError: false })
              }
              type={isError.type}
              timeout={3000}
              dataTestId="sidebar-toast"
              size="lg"
              position="bottom"
            />
          )}

          {isLoading && searchResults.length === 0 && measurementsLoading ? (
            <SearchResultsSkeleton />
          ) : searchResults?.length === 0 && !isLoading ? (
            renderNoResults()
          ) : (
            <LocationCards
              searchResults={searchResults}
              isLoading={isLoading}
              handleLocationSelect={handleLocationSelect}
            />
          )}
        </div>

        {/* Selected Site Details */}
        {selectedSite && !mapLoading && (
          <div>
            <div className="bg-secondary-neutral-dark-50 pt-6 pb-5">
              <div className="flex items-center gap-2 text-black-800 mb-4 mx-4">
                <Button paddingStyles="p-0" onClick={handleExit}>
                  <ArrowLeftIcon />
                </Button>
                <h3 className="text-xl font-medium leading-7">
                  {
                    capitalizeAllText(
                      selectedSite?.description ||
                        selectedSite?.search_name ||
                        selectedSite?.location,
                    )?.split(',')[0]
                  }
                </h3>
              </div>

              <div className="mx-4">
                <WeekPrediction
                  selectedSite={selectedSite}
                  weeklyPredictions={weeklyPredictions}
                  loading={isLoading}
                />
              </div>
            </div>

            <div className="border border-secondary-neutral-light-100 my-5" />

            <div
              className={`mx-4 mb-5 ${
                width < 1024 ? 'sidebar-scroll-bar h-dvh' : ''
              } flex flex-col gap-4`}
            >
              <PollutantCard
                selectedSite={selectedSite}
                selectedWeeklyPrediction={selectedWeeklyPrediction}
              />
              <LocationAlertCard
                title="Air Quality Alerts"
                selectedSite={selectedSite}
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
  siteDetails: PropTypes.object,
  isAdmin: PropTypes.bool,
};

export default MapSidebar;
