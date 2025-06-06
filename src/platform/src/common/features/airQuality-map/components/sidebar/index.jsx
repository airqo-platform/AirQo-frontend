import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@/components/Button';
import SearchField from '@/components/search/SearchField';
import Toast from '@/components/Toast';
import Card from '@/components/CardWrapper';
import SearchResultsSkeleton from './components/SearchResultsSkeleton';
import SidebarHeader from './components/SidebarHeader';
import CountryList from './components/CountryList';
import LocationCards from './components/LocationCards';
import WeekPrediction from './components/Predictions';
import PollutantCard from './components/PollutantCard';
import LocationAlertCard from './components/LocationAlertCard';
import { GoArrowLeft } from 'react-icons/go';
import {
  setOpenLocationDetails,
  setSelectedLocation,
  addSuggestedSites,
  setSelectedNode,
  setSelectedWeeklyPrediction,
  setMapLoading,
  setZoom,
  setCenter,
  reSetMap,
} from '@/lib/store/services/map/MapSlice';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import useGoogleMaps from '@/core/hooks/useGoogleMaps';
import { useRecentMeasurements } from '@/core/hooks/analyticHooks';
import { dailyPredictionsApi } from '@/core/apis/predict';
import { capitalizeAllText } from '@/core/utils/strings';
import { getPlaceDetails } from '@/core/utils/getLocationGeomtry';
import { getAutocompleteSuggestions } from '@/core/utils/AutocompleteSuggestions';
import allCountries from '../../constants/countries.json';

import { useWindowSize } from '@/core/hooks/useWindowSize';

const SectionDivider = () => (
  <div className="border border-secondary-neutral-light-100 dark:border-gray-700 my-3" />
);

const NoResults = ({ hasSearched }) => (
  <Card contentClassName="flex flex-col items-center justify-center py-6">
    <h3 className="text-lg font-medium text-secondary-neutral-dark-700 dark:text-white text-center">
      {hasSearched
        ? 'No results found'
        : 'Search for a location to view air quality data'}
    </h3>
    <p className="text-sm text-secondary-neutral-light-900 dark:text-gray-300 mt-2 text-center">
      {hasSearched
        ? 'Try adjusting your search term or search for a different location'
        : 'Enter a location name to see air quality information and forecasts'}
    </p>
  </Card>
);

const LoadingSkeleton = () => (
  <Card className="animate-pulse" bordered={false}>
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
  </Card>
);

const MapSidebar = ({ siteDetails, isAdmin }) => {
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [weeklyPredictions, setWeeklyPredictions] = useState([]);
  const [error, setError] = useState({ isError: false, message: '', type: '' });

  const { width } = useWindowSize();

  const openLocationDetails = useSelector(
    (state) => state.map.showLocationDetails,
  );
  const selectedLocation = useSelector((state) => state.map.selectedLocation);
  const mapLoading = useSelector((state) => state.map.mapLoading);
  const reduxSearchTerm = useSelector(
    (state) => state.locationSearch.searchTerm,
  );
  const suggestedSites = useSelector((state) => state.map.suggestedSites);
  const selectedWeeklyPrediction = useSelector(
    (state) => state.map.selectedWeeklyPrediction,
  );

  const isSearchFocused = isFocused || reduxSearchTerm.length > 0;
  const googleMapsLoaded = useGoogleMaps(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  );
  const autoCompleteSessionToken = useMemo(() => {
    if (googleMapsLoaded && window.google)
      return new window.google.maps.places.AutocompleteSessionToken();
    return null;
  }, [googleMapsLoaded]);

  // Fix for the site_id issue
  const measurementsParams = useMemo(() => {
    if (!selectedLocation || !selectedLocation._id) return null;

    // Ensure site_id is a valid MongoDB ObjectId (usually 24 hex chars)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(selectedLocation._id);

    if (!isValidObjectId) {
      console.warn(
        `Invalid ObjectId format for site_id: ${selectedLocation._id}`,
      );
      return null;
    }

    return { site_id: selectedLocation._id };
  }, [selectedLocation]);

  const { isLoading: measurementsLoading } =
    useRecentMeasurements(measurementsParams);

  // Keeping the original forecast implementation
  const fetchWeeklyPredictions = useCallback(async () => {
    if (!selectedLocation?._id) return setWeeklyPredictions([]);

    setLoading(true);
    try {
      if (selectedLocation?.forecast?.length > 0) {
        setWeeklyPredictions(selectedLocation.forecast);
      } else {
        const response = await dailyPredictionsApi(selectedLocation._id);
        setWeeklyPredictions(response?.forecasts || []);
      }
    } catch (err) {
      console.error('Failed to fetch weekly predictions:', err);
      setError({
        isError: true,
        message: 'Failed to fetch weekly predictions',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (Array.isArray(siteDetails) && siteDetails.length > 0) {
      const unique = siteDetails.reduce((acc, site) => {
        const country = allCountries.find((c) => c.country === site.country);
        if (country && !acc.some((item) => item.country === site.country)) {
          acc.push({ ...site, ...country });
        }
        return acc;
      }, []);
      setCountryData(unique);
    }
  }, [siteDetails]);

  // On mount, reset sidebar search state without resetting the map.
  useEffect(() => {
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setIsFocused(false);
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => dispatch(setMapLoading(false)), 2000);
    return () => clearTimeout(timer);
  }, [dispatch, selectedLocation]);

  useEffect(() => {
    if (selectedLocation) fetchWeeklyPredictions();
  }, [selectedLocation, fetchWeeklyPredictions]);

  // When a location is selected, update center/zoom without refetching data.
  const handleLocationSelect = useCallback(
    async (data, type = 'suggested') => {
      try {
        let updated = data,
          latitude,
          longitude;
        if (data?.place_id) {
          const details = await getPlaceDetails(data.place_id);
          if (!details?.latitude || !details?.longitude)
            throw new Error('Geolocation details are missing');
          updated = { ...data, ...details };
          ({ latitude, longitude } = details);
        } else {
          latitude =
            data?.geometry?.coordinates?.[1] || data?.approximate_latitude;
          longitude =
            data?.geometry?.coordinates?.[0] || data?.approximate_longitude;
        }
        if (!latitude || !longitude)
          throw new Error('Location coordinates are missing');
        dispatch(setCenter({ latitude, longitude }));
        dispatch(setZoom(11));
        if (type !== 'suggested') dispatch(setSelectedLocation(updated));
      } catch (err) {
        console.error('Location selection error:', err);
        setError({
          isError: true,
          message: 'Failed to select location',
          type: 'error',
        });
      }
    },
    [dispatch],
  );

  const handleSearch = useCallback(async () => {
    if (!reduxSearchTerm || reduxSearchTerm.length <= 1) {
      setSearchResults([]);
      return;
    }
    if (!googleMapsLoaded || !autoCompleteSessionToken) {
      console.error('Google Maps API is not loaded yet.');
      return;
    }
    setLoading(true);
    setIsFocused(true);
    try {
      const predictions = await getAutocompleteSuggestions(
        reduxSearchTerm,
        autoCompleteSessionToken,
      );
      setSearchResults(
        predictions?.length
          ? predictions.map(({ description, place_id }) => ({
              description,
              place_id,
            }))
          : [],
      );
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [reduxSearchTerm, autoCompleteSessionToken, googleMapsLoaded]);

  const handleExit = useCallback(() => {
    setIsFocused(false);
    dispatch(reSetMap());
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setSearchResults([]);
    dispatch(setSelectedNode(null));
    dispatch(setSelectedWeeklyPrediction(null));
  }, [dispatch]);

  const handleAllSelection = useCallback(() => {
    dispatch(reSetMap());
    setSelectedCountry(null);
    const sorted = siteDetails
      ?.slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    dispatch(addSuggestedSites(sorted));
  }, [dispatch, siteDetails]);

  const renderMainContent = useCallback(() => {
    if (selectedLocation && !mapLoading) {
      return (
        <div className="px-3">
          <div className="pt-3 pb-2 flex items-center gap-2 mb-3">
            <Button
              padding="p-0"
              onClick={handleExit}
              variant="text"
              type="button"
            >
              <GoArrowLeft
                className="text-gray-400 dark:text-white"
                size={25}
              />
            </Button>
            <h3 className="text-lg text-black-800 dark:text-white font-medium leading-6 truncate">
              {
                capitalizeAllText(
                  selectedLocation?.description ||
                    selectedLocation?.search_name ||
                    selectedLocation?.location,
                )?.split(',')[0]
              }
            </h3>
          </div>
          <WeekPrediction
            selectedSite={selectedLocation}
            weeklyPredictions={weeklyPredictions}
            loading={isLoading}
          />
          <SectionDivider />
          <div className="mb-3 flex flex-col gap-3">
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
      );
    }
    if (isSearchFocused) {
      return (
        <div className="flex flex-col w-full">
          <div className="flex flex-col gap-3 px-3 pt-3">
            <SidebarHeader
              isAdmin={isAdmin}
              isFocused={isSearchFocused}
              handleHeaderClick={handleExit}
            />
            <SearchField
              onSearch={handleSearch}
              onClearSearch={handleExit}
              focus={isSearchFocused}
              showSearchResultsNumber
            />
          </div>
          {reduxSearchTerm === '' && <SectionDivider />}
          {reduxSearchTerm && (
            <div className="border border-secondary-neutral-light-100 mt-2" />
          )}
          {reduxSearchTerm === '' ? (
            <div className="px-3 pt-3">
              <NoResults hasSearched={false} />
            </div>
          ) : error.isError ? (
            <Toast
              message={error.message}
              clearData={() =>
                setError({ isError: false, message: '', type: '' })
              }
              type={error.type}
              timeout={3000}
              size="lg"
              position="bottom"
            />
          ) : isLoading && searchResults.length === 0 && measurementsLoading ? (
            <div className="px-3 pt-3">
              <SearchResultsSkeleton />
            </div>
          ) : searchResults.length === 0 && !isLoading ? (
            <div className="px-3 pt-3">
              <NoResults hasSearched />
            </div>
          ) : (
            <LocationCards
              searchResults={searchResults}
              isLoading={isLoading}
              handleLocationSelect={(data) => handleLocationSelect(data)}
            />
          )}
        </div>
      );
    }
    return mapLoading || !suggestedSites || suggestedSites.length === 0 ? (
      <LoadingSkeleton />
    ) : (
      <>
        <LocationCards
          searchResults={suggestedSites}
          isLoading={isLoading}
          handleLocationSelect={(data) =>
            handleLocationSelect(data, 'suggested')
          }
        />
      </>
    );
  }, [
    isSearchFocused,
    mapLoading,
    selectedLocation,
    weeklyPredictions,
    isLoading,
    selectedWeeklyPrediction,
    reduxSearchTerm,
    error,
    measurementsLoading,
    searchResults,
    suggestedSites,
    isAdmin,
    handleExit,
    handleSearch,
    handleLocationSelect,
  ]);

  return (
    <Card
      className="relative w-full h-full shadow-sm text-left"
      rounded={false}
      padding="p-0"
      overflow={true}
    >
      <div className="h-full flex flex-col">
        {!isSearchFocused && !openLocationDetails && (
          <div className="pt-3 flex flex-col gap-3 flex-shrink-0">
            <SidebarHeader isAdmin={isAdmin} />
            {!isAdmin && <hr className="my-2" />}
            <div className="px-3" onClick={() => setIsFocused(true)}>
              <SearchField showSearchResultsNumber={false} focus={false} />
            </div>
            <div className="flex pl-3 py-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 hide-scrollbar">
              <Button
                type="button"
                variant="filled"
                onClick={handleAllSelection}
                style={{ borderRadius: '9999px' }}
                className="px-3 border-none text-md font-medium h-10 flex items-center"
              >
                All
              </Button>
              <div className="flex space-x-2">
                <CountryList
                  data={countryData}
                  selectedCountry={selectedCountry}
                  setSelectedCountry={setSelectedCountry}
                  siteDetails={siteDetails}
                />
              </div>
            </div>
            <SectionDivider />
          </div>
        )}
        <div
          ref={contentRef}
          style={{
            paddingBottom: width > 1024 ? '0' : '100px',
          }}
        >
          {renderMainContent()}
        </div>
      </div>
    </Card>
  );
};

MapSidebar.propTypes = {
  siteDetails: PropTypes.arrayOf(PropTypes.object).isRequired,
  isAdmin: PropTypes.bool,
};

MapSidebar.defaultProps = { isAdmin: false };

export default MapSidebar;
