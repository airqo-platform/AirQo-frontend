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

import { useWindowSize } from '@/lib/windowSize';

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The id to validate
 * @returns {boolean} - Whether the id is valid
 */
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

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
  const [measurementsError, setMeasurementsError] = useState(null);

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

  // Only call useRecentMeasurements if we have a valid selectedLocation with a valid _id
  const { isLoading: measurementsLoading } = useRecentMeasurements(
    selectedLocation && isValidObjectId(selectedLocation._id)
      ? { site_id: selectedLocation._id }
      : null,
    {
      onError: (err) => {
        console.error('Failed to fetch measurements:', err);
        setMeasurementsError('Failed to load recent measurements');
        // Clear error after 5 seconds
        setTimeout(() => setMeasurementsError(null), 5000);
      },
    },
  );

  const fetchWeeklyPredictions = useCallback(async () => {
    if (!selectedLocation?._id || !isValidObjectId(selectedLocation._id)) {
      setWeeklyPredictions([]);
      return;
    }

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
      // Clear error after 5 seconds
      setTimeout(
        () => setError({ isError: false, message: '', type: '' }),
        5000,
      );
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
    if (selectedLocation && isValidObjectId(selectedLocation._id)) {
      fetchWeeklyPredictions();
    }
  }, [selectedLocation, fetchWeeklyPredictions]);

  // When a location is selected, update center/zoom without refetching data.
  const handleLocationSelect = useCallback(
    async (data, type = 'suggested') => {
      try {
        if (!data) {
          throw new Error('No location data provided');
        }

        let updated = data;
        let latitude, longitude;

        if (data?.place_id) {
          const details = await getPlaceDetails(data.place_id);
          if (!details?.latitude || !details?.longitude) {
            throw new Error('Geolocation details are missing');
          }
          updated = { ...data, ...details };
          ({ latitude, longitude } = details);
        } else {
          latitude =
            data?.geometry?.coordinates?.[1] || data?.approximate_latitude;
          longitude =
            data?.geometry?.coordinates?.[0] || data?.approximate_longitude;
        }

        if (!latitude || !longitude) {
          throw new Error('Location coordinates are missing');
        }

        dispatch(setCenter({ latitude, longitude }));
        dispatch(setZoom(11));

        if (type !== 'suggested') {
          dispatch(setSelectedLocation(updated));
        }
      } catch (err) {
        console.error('Location selection error:', err);
        setError({
          isError: true,
          message: 'Failed to select location',
          type: 'error',
        });
        // Clear error after 5 seconds
        setTimeout(
          () => setError({ isError: false, message: '', type: '' }),
          5000,
        );
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
      setError({
        isError: true,
        message: 'Search service not available',
        type: 'error',
      });
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
      setError({
        isError: true,
        message: 'Search failed. Please try again.',
        type: 'error',
      });
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

    if (Array.isArray(siteDetails) && siteDetails.length > 0) {
      const sorted = [...siteDetails]
        .filter((site) => site && site.name) // Ensure we have valid sites
        .sort((a, b) => a.name.localeCompare(b.name));

      dispatch(addSuggestedSites(sorted));
    }
  }, [dispatch, siteDetails]);

  const renderMainContent = useCallback(() => {
    // Show toast for any current errors
    if (error.isError || measurementsError) {
      return (
        <Toast
          message={error.isError ? error.message : measurementsError}
          clearData={() => {
            if (error.isError) {
              setError({ isError: false, message: '', type: '' });
            }
            if (measurementsError) {
              setMeasurementsError(null);
            }
          }}
          type={error.type || 'error'}
          timeout={5000}
          size="lg"
          position="bottom"
        />
      );
    }

    if (selectedLocation && !mapLoading) {
      const locationName = capitalizeAllText(
        selectedLocation?.description ||
          selectedLocation?.search_name ||
          selectedLocation?.location,
      )?.split(',')[0];

      return (
        <div className="px-3">
          <div className="pt-3 pb-2 flex items-center gap-2 mb-3">
            <Button
              paddingStyles="p-0"
              onClick={handleExit}
              variant="text"
              type="button"
              aria-label="Go back"
            >
              <GoArrowLeft
                className="text-gray-400 dark:text-white"
                size={25}
              />
            </Button>
            <h3 className="text-lg text-black-800 dark:text-white font-medium leading-6 truncate">
              {locationName || 'Location Details'}
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

    // Default view: show loading skeleton or suggested sites
    return mapLoading || !suggestedSites || suggestedSites.length === 0 ? (
      <LoadingSkeleton />
    ) : (
      <LocationCards
        searchResults={suggestedSites}
        isLoading={isLoading}
        handleLocationSelect={(data) => handleLocationSelect(data, 'suggested')}
      />
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
    measurementsError,
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
      <div className="h-full flex flex-col" data-testid="map-sidebar">
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
                aria-label="Show all locations"
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
