import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
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
  setMapLoading,
} from '@/lib/store/services/map/MapSlice';
import allCountries from '../../data/countries.json';
import SearchField from '@/components/search/SearchField';
import LocationIcon from '@/icons/LocationIcon';
import CloseIcon from '@/icons/close_icon';
import ArrowLeftIcon from '@/icons/arrow_left.svg';
import Button from '@/components/Button';
import Toast from '../../../Toast';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import { dailyPredictionsApi } from '@/core/apis/predict';
import { capitalizeAllText } from '@/core/utils/strings';
import {
  fetchRecentMeasurementsData,
  clearMeasurementsData,
} from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';

// utils
import { useWindowSize } from '@/lib/windowSize';
import { getPlaceDetails } from '@/core/utils/getLocationGeomtry';
import { getAutocompleteSuggestions } from '@/core/utils/AutocompleteSuggestions';

// components
import LocationCards from './components/LocationCards';
import TabSelector from './components/TabSelector';
import CountryList from './components/CountryList';
import LocationAlertCard from './components/LocationAlertCard';
import WeekPrediction from './components/Predictions';
import PollutantCard from './components/PollutantCard';

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
      <div className="w-full flex justify-between items-center">
        <label className="font-medium text-xl text-gray-900">
          Air Quality Map
        </label>
        {isFocused && (
          <button
            onClick={handleHeaderClick}
            className="focus:outline-none border rounded-xl hover:cursor-pointer p-2 hidden md:block"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium w-auto mt-2">
        Navigate air quality analytics with precision and actionable tips.
      </p>
      {!isAdmin && (
        <TabSelector
          defaultTab="locations"
          tabs={['locations', 'sites']}
          setSelectedTab={setSelectedTab}
        />
      )}
    </div>
  );
};

// search results skeleton
const SearchResultsSkeleton = () => {
  const numElements = 6;
  return (
    <div className="flex flex-col gap-4 animate-pulse px-4 mt-5">
      {Array(numElements)
        .fill()
        .map((_, i) => (
          <div
            key={i}
            className="bg-secondary-neutral-dark-50 rounded-xl w-full h-16"
          />
        ))}
    </div>
  );
};

const index = ({ siteDetails, isAdmin }) => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const [isFocused, setIsFocused] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [selectedTab, setSelectedTab] = useState('locations');
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const openLocationDetailsSection = useSelector(
    (state) => state.map.showLocationDetails,
  );
  const selectedLocationDetails = useSelector(
    (state) => state.map.selectedLocation,
  );
  const mapLoading = useSelector((state) => state.map.mapLoading);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [weeklyPredictions, setWeeklyPredictions] = useState([]);
  const [showNoResultsMsg, setShowNoResultsMsg] = useState(false);
  const measurementsLoading = useSelector(
    (state) => state.recentMeasurements.status,
  );
  const [locationSearchPreferences, setLocationSearchPreferences] = useState({
    custom: [],
    nearMe: [],
  });
  const selectedWeeklyPrediction = useSelector(
    (state) => state.map.selectedWeeklyPrediction,
  );
  const reduxSearchTerm = useSelector(
    (state) => state.locationSearch.searchTerm,
  );
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

  // Sidebar loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setMapLoading(false));
    }, 2000);

    return () => clearTimeout(timer);
  }, [dispatch, selectedSite]);

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
        let countryDetails = allCountries?.find(
          (data) => data.country === site.country,
        );

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

  // Fetch weekly predictions
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

  // Fetch measurements
  useEffect(() => {
    if (selectedSite) {
      const { _id } = selectedSite;
      if (_id) {
        dispatch(setMapLoading(true));
        try {
          dispatch(fetchRecentMeasurementsData({ site_id: _id }));
          fetchWeeklyPredictions();
        } catch (error) {
          console.error(error.message);
        }
      }
    }
  }, [selectedSite]);

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

  // Handle selected tab
  const handleSelectedTab = (tab) => {
    setSelectedTab(tab);
  };

  // Handle location select
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
          latitude =
            data?.geometry?.coordinates[1] || data?.approximate_latitude;
          longitude =
            data?.geometry?.coordinates[0] || data?.approximate_longitude;
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

  /**
   * Search code
   * */
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
          const locations = await getLocationsDetails(predictions);
          setSearchResults([...locations]);
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

  const handleClearSearch = () => {
    handleExit();
  };

  useEffect(() => {
    if (reduxSearchTerm !== '') {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [reduxSearchTerm]);

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

  return (
    <div className="w-full h-dvh bg-white overflow-hidden">
      {/* Sidebar Header */}
      <div
        className={`${
          !isFocused && !showLocationDetails ? 'space-y-4' : 'hidden'
        } pt-4`}
      >
        <div className="px-4">
          <SidebarHeader
            selectedTab={selectedTab}
            handleSelectedTab={handleSelectedTab}
            isAdmin
          />
        </div>
        {!isAdmin && <hr />}
        <div className={`${isFocused || showLocationDetails ? 'hidden' : ''}`}>
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

      {/* section 1 */}
      <div className="sidebar-scroll-bar">
        {selectedSite && mapLoading ? (
          // show a loading skeleton
          <div className="flex flex-col gap-4 animate-pulse px-4 mt-5">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="bg-secondary-neutral-dark-50 rounded-xl w-full h-16"
              />
            ))}
          </div>
        ) : (
          <div
            className={`${isFocused || showLocationDetails ? 'hidden' : ''}`}
          >
            {selectedSites && selectedSites.length > 0 && (
              <>
                <div className="flex justify-between items-center px-4">
                  <div className="flex gap-1">
                    <div className="font-medium text-secondary-neutral-dark-400 text-sm">
                      Sort by:
                    </div>
                    <select className="rounded-md m-0 p-0 text-sm text-center font-medium text-secondary-neutral-dark-700 outline-none focus:outline-none border-none">
                      <option value="custom">Suggested</option>
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
                <LocationCards
                  searchResults={selectedSites}
                  isLoading={isLoading}
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
            <div className="border border-secondary-neutral-light-100 mt-8" />
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

          {isLoading && searchResults.length === 0 && measurementsLoading && (
            <SearchResultsSkeleton />
          )}

          {searchResults?.length === 0 && !isLoading ? (
            <div className="flex flex-col justify-center items-center h-full w-full pt-8 px-6">
              <div className="p-5 rounded-full bg-secondary-neutral-light-50 border border-secondary-neutral-light-25 mb-2.5">
                <LocationIcon fill="#9EA3AA" />
              </div>
              <div className="my-4">
                <div className="text-secondary-neutral-dark-700 text-base font-medium text-center mb-1">
                  No results found
                </div>
                <div className="text-center text-sm font-medium leading-tight text-secondary-neutral-dark-400 w-[244px]">
                  Please try again with a different location name
                </div>
              </div>
            </div>
          ) : (
            <LocationCards
              searchResults={searchResults}
              isLoading={isLoading}
              handleLocationSelect={handleLocationSelect}
            />
          )}
        </div>

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
              {/* Pollutant Card */}
              <PollutantCard
                selectedSite={selectedSite}
                selectedWeeklyPrediction={selectedWeeklyPrediction}
              />

              {/* Alert Card */}
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

export default index;
