import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

// UI Components
import Button from '@/components/Button';
import SearchField from '@/components/search/SearchField';
import Toast from '@/components/Toast';
import Card from '@/components/CardWrapper';
import SearchResultsSkeleton from './components/SearchResultsSkeleton';

// Child Components / Utils
import SidebarHeader from './components/SidebarHeader';
import CountryList from './components/CountryList';
import LocationCards from './components/LocationCards';
import WeekPrediction from './components/Predictions';
import PollutantCard from './components/PollutantCard';
import LocationAlertCard from './components/LocationAlertCard';

// Icons & Assets
import ArrowLeftIcon from '@/icons/arrow_left.svg';

// Hooks & Redux
import {
  setOpenLocationDetails,
  setSelectedLocation,
  addSuggestedSites,
  reSetMap,
  setSelectedNode,
  setSelectedWeeklyPrediction,
  setMapLoading,
  setCenter,
  setZoom,
} from '@/lib/store/services/map/MapSlice';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import useGoogleMaps from '@/core/hooks/useGoogleMaps';
import { useRecentMeasurements } from '@/core/hooks/analyticHooks';

// APIs & Utils
import { dailyPredictionsApi } from '@/core/apis/predict';
import { capitalizeAllText } from '@/core/utils/strings';
import { getPlaceDetails } from '@/core/utils/getLocationGeomtry';
import { getAutocompleteSuggestions } from '@/core/utils/AutocompleteSuggestions';
import allCountries from '../../constants/countries.json';

// Section Components
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
  <Card className="mx-2 animate-pulse">
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
  </Card>
);

const MapSidebar = ({ siteDetails, isAdmin }) => {
  const dispatch = useDispatch();
  const contentRef = useRef(null);

  // Local state
  const [isFocused, setIsFocused] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [weeklyPredictions, setWeeklyPredictions] = useState([]);
  const [error, setError] = useState({ isError: false, message: '', type: '' });
  const [contentOverflows, setContentOverflows] = useState(false);

  // Redux selectors
  const openLocationDetails = useSelector(
    (state) => state.map.showLocationDetails,
  );
  const selectedLocation = useSelector(
    (state) => state.map.selectedLocation ?? null,
  );
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

  // Google Maps session token for auto-complete
  const autoCompleteSessionToken = useMemo(() => {
    if (googleMapsLoaded && window.google) {
      return new window.google.maps.places.AutocompleteSessionToken();
    }
    return null;
  }, [googleMapsLoaded]);

  const { isLoading: measurementsLoading } = useRecentMeasurements(
    selectedLocation ? { site_id: selectedLocation._id } : null,
  );

  /**
   * Check if content overflows using window resize event
   */
  useEffect(() => {
    if (contentRef.current) {
      const checkOverflow = () => {
        const hasOverflow =
          contentRef.current.scrollHeight > contentRef.current.clientHeight;
        setContentOverflows(hasOverflow);
      };

      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }
  }, [selectedLocation, searchResults, suggestedSites]);

  /**
   * Fetch weekly predictions for the selected location
   */
  const fetchWeeklyPredictions = useCallback(async () => {
    if (!selectedLocation?._id) {
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
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  /**
   * Initialize country data from siteDetails
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
    }
  }, [siteDetails]);

  /**
   * Reset map on mount
   */
  useEffect(() => {
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setIsFocused(false);

    return () => {
      // Cleanup on unmount
      dispatch(reSetMap());
    };
  }, [dispatch]);

  /**
   * Map loading indicator
   */
  useEffect(() => {
    const timer = setTimeout(() => dispatch(setMapLoading(false)), 2000);
    return () => clearTimeout(timer);
  }, [dispatch, selectedLocation]);

  /**
   * When a location is selected, fetch weekly predictions
   */
  useEffect(() => {
    if (selectedLocation) {
      fetchWeeklyPredictions();
    }
  }, [selectedLocation, fetchWeeklyPredictions]);

  /**
   * Handle location selection
   */
  const handleLocationSelect = useCallback(
    async (data) => {
      try {
        let updatedData = data;
        let latitude, longitude;

        if (data?.place_id) {
          const placeDetails = await getPlaceDetails(data.place_id);
          if (placeDetails.latitude && placeDetails.longitude) {
            updatedData = { ...updatedData, ...placeDetails };
            ({ latitude, longitude } = placeDetails);
          } else {
            throw new Error('Geolocation details are missing');
          }
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
        dispatch(setSelectedLocation(updatedData));
      } catch (err) {
        console.error('Failed to select location:', err);
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
   * Handle search functionality
   */
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

  /**
   * Handle exit from search or details view
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
   * Handle selection of all sites
   */
  const handleAllSelection = useCallback(() => {
    setSelectedCountry(null);
    dispatch(reSetMap());

    const sortedSites = siteDetails
      ? [...siteDetails].sort((a, b) => a.name.localeCompare(b.name))
      : [];

    dispatch(addSuggestedSites(sortedSites));
  }, [dispatch, siteDetails]);

  // Render the main sidebar section based on current state
  const renderMainContent = () => {
    // Location Details View
    if (selectedLocation && !mapLoading) {
      return (
        <div className="px-3">
          <div className="pt-3 pb-2">
            <div className="flex items-center gap-2 text-black-800 mb-3">
              <Button
                paddingStyles="p-0"
                onClick={handleExit}
                variant="text"
                type="button"
              >
                <ArrowLeftIcon />
              </Button>
              <h3 className="text-lg font-medium leading-6 truncate">
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
          </div>

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

    // Search Results View
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

          <>
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
                dataTestId="sidebar-toast"
                size="lg"
                position="bottom"
              />
            ) : isLoading &&
              searchResults.length === 0 &&
              measurementsLoading ? (
              <div className="px-3 pt-3">
                <SearchResultsSkeleton />
              </div>
            ) : searchResults.length === 0 && !isLoading ? (
              <div className="px-3 pt-3">
                <NoResults hasSearched={true} />
              </div>
            ) : (
              <LocationCards
                searchResults={searchResults}
                isLoading={isLoading}
                handleLocationSelect={handleLocationSelect}
              />
            )}
          </>
        </div>
      );
    }

    // Suggested Sites View
    return (
      <>
        {mapLoading || !suggestedSites || suggestedSites.length === 0 ? (
          <LoadingSkeleton />
        ) : suggestedSites.length > 0 ? (
          <>
            <div className="px-1">
              <Card className="mt-3" bordered={false}>
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <span className="font-medium text-secondary-neutral-dark-400 text-sm">
                      Sort by:
                    </span>
                    <select className="rounded-md m-0 p-0 text-sm font-medium text-secondary-neutral-dark-700 outline-none focus:outline-none border-none">
                      <option value="custom">Suggested</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
            <LocationCards
              searchResults={suggestedSites}
              isLoading={isLoading}
              handleLocationSelect={handleLocationSelect}
            />
          </>
        ) : (
          <NoResults hasSearched={false} />
        )}
      </>
    );
  };

  return (
    <Card
      className="relative w-full h-full rounded-l-xl shadow-sm text-left"
      padding="p-0"
      overflow={true}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar Header Section - only shown in main view */}
        {!isSearchFocused && !openLocationDetails && (
          <div className="pt-3 px-3 space-y-3 flex-shrink-0">
            <SidebarHeader isAdmin={isAdmin} />

            {!isAdmin && <hr className="my-2" />}

            <div onClick={() => setIsFocused(true)}>
              <SearchField showSearchResultsNumber={false} focus={false} />
            </div>

            <div className="flex py-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 hide-scrollbar">
              <Button
                type="button"
                variant="filled"
                onClick={handleAllSelection}
                style={{
                  borderRadius: '9999px',
                }}
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

        {/* Content Area with conditional scrolling */}
        <div
          ref={contentRef}
          className={`sidebar-content-wrapper flex-grow ${
            contentOverflows
              ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
              : 'overflow-hidden'
          }`}
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

MapSidebar.defaultProps = {
  isAdmin: false,
};

export default MapSidebar;
