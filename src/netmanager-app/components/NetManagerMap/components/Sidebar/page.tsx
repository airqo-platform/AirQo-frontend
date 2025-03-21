import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useAppSelector } from '@/core/redux/hooks';
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
} from '@/lib/map/MapSlice';
import { addSearchTerm } from '@/lib/services/search/LocationSearchSlice';
import {
  fetchRecentMeasurementsData,
  // clearMeasurementsData,
} from '@/lib/services/deviceRegistry/RecentMeasurementsSlice';
import { dailyPredictionsApi } from '@/core/apis/predict';
import { capitalizeAllText } from '@/utils/strings';
import { useWindowSize } from '@/lib/windowSize';
import { getPlaceDetails } from '@/utils/getLocationGeomtry';
import { getAutocompleteSuggestions } from '@/utils/AutocompleteSuggestions';
import {FetchSuggestions } from '@/core/apis/MapData';
import allCountries from '../../data/countries.json';
import SearchField from '@/components/search/SearchField';
import Button from '../Button';
import Toast from '../../../Toast';
import LocationCards from './components/LocationCards';
import CountryList from '../CountryList';
import LocationAlertCard from './components/LocationAlertCard';
import WeekPrediction from './components/Predictions';
import PollutantCard from './components/PollutantCard';
import {
  renderNoResults,
  renderLoadingSkeleton,
  renderDefaultMessage,
} from './components/Sections';

import ArrowLeftIcon from '@/public/icons/arrow_left.svg';
import SidebarHeader from './components/SidebarHeader';
import SearchResultsSkeleton from './components/SearchResultsSkeleton';
import useGoogleMaps from '@/core/hooks/useGoogleMaps';
import { Value } from '@radix-ui/react-select';

interface SiteDetails {
  _id: string;
  name: string;
  country: string;
  forecast?: any[];
  description?: string;
  search_name?: string;
  location?: string;
}

interface MapSidebarProps {
  siteDetails: SiteDetails[];
  isAdmin: boolean;
  token?:string,
sessionToken?:string,
reset: () => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
         siteDetails, 
         isAdmin,
         token,
        sessionToken,
        reset  }) => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();

  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [locationId,setlocationId] =useState("")
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<SiteDetails[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<SiteDetails | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [weeklyPredictions, setWeeklyPredictions] = useState<any[]>([]);
  const [error, setError] = useState<{ isError: boolean; message: string; type: string }>({
    isError: false,
    message: '',
    type: '',
  });

//   const openLocationDetails = useAppSelector((state: any) => state.map.showLocationDetails);
//   const selectedLocation = useAppSelector((state: any) => state. .map.selectedLocation ?? null);
//   const mapLoading = useSelector((state: any) => state.map.mapLoading);
//   const measurementsLoading = useSelector((state: any) => state.recentMeasurements.status);
//   const selectedWeeklyPrediction = useSelector((state: any) => state.map.selectedWeeklyPrediction);
//   const reduxSearchTerm = useSelector((state: any) => state.locationSearch.searchTerm);
//   const suggestedSites = useSelector((state: any) => state.map.suggestedSites);

  const isSearchFocused = isFocused
//   ||  reduxSearchTerm.length > 0;
  const googleMapsLoaded = useGoogleMaps(process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY);
  const handleAllSelection = useCallback(() => {
        setSelectedCountry(null);
        dispatch(reSetMap());
        const sortedSites = siteDetails
          ? [...siteDetails].sort((a, b) => a.name.localeCompare(b.name))
          : [];
        dispatch(addSuggestedSites(sortedSites));
      }, [dispatch, siteDetails]);

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
      

//       Handle Search Functionality
const SearchSuggestions=(e: React.ChangeEvent<HTMLInputElement>)=>{
        const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setSuggestions([]);
      reset()
      return;
    }
    const GetSuggestions=(latitude?: number, longitude?: number)=>{
        if (!token || !sessionToken) {
          console.error('Missing required tokens');
                 return;
        }
        FetchSuggestions(value, sessionToken, latitude, longitude)
          .then(data => {
            if (data) {
              console.log(data)
              setSuggestions(data);
            }
            console.log("Number of Suggesstions", suggestions.length)
          })
          .catch(error => {
            console.error("Error fetching suggestions:", error);
          });
    }
    const fetchUserLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              console.log("User Location:", latitude, longitude);
              GetSuggestions(latitude, longitude);
            },
            (error) => {
              console.error("Error getting user location:", error);
              GetSuggestions(); 
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
          GetSuggestions(); 
        }
      };
      fetchUserLocation();

  }

  const autoCompleteSessionToken = useMemo(() => {
    if (googleMapsLoaded && window.google) {
      return new window.google.maps.places.AutocompleteSessionToken();
    }
    return null;
  }, [googleMapsLoaded]);

  useEffect(() => {
    if (Array.isArray(siteDetails) && siteDetails.length > 0) {
      const uniqueCountries = siteDetails.reduce<SiteDetails[]>((acc, site) => {
        const country = allCountries.find((c) => c.country === site.country);
        if (country && !acc.some((item) => item.country === site.country)) {
          acc.push({ ...site, ...country });
        }
        return acc;
      }, []);
      setCountryData(uniqueCountries);
    }
  }, [siteDetails]);

  useEffect(() => {
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
    setIsFocused(false);
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => dispatch(setMapLoading(false)), 2000);
    return () => clearTimeout(timer);
  }, [dispatch, 
        // selectedLocation
]);

//   useEffect(() => {
//     if (selectedLocation) {
//       dispatch(fetchRecentMeasurementsData({ site_id: selectedLocation._id }))
//         .unwrap()
//         .then(() => fetchWeeklyPredictions())
//         .catch((error) => {
//           setError({ isError: true, message: 'Failed to fetch recent measurements', type: 'error' });
//         });
//     }
//   }, [
//         // selectedLocation,
//          dispatch]);

//   const fetchWeeklyPredictions = useCallback(async () => {
//     if (!selectedLocation?._id) {
//       setWeeklyPredictions([]);
//       return;
//     }
//     setLoading(true);
//     try {
//       if (selectedLocation?.forecast && selectedLocation.forecast.length > 0) {
//         setWeeklyPredictions(selectedLocation.forecast);
//       } else {
//         const response = await dailyPredictionsApi(selectedLocation._id);
//         setWeeklyPredictions(response?.forecasts || []);
//       }
//     } catch (error) {
//       setError({ isError: true, message: 'Failed to fetch weekly predictions', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   }, [
//         // selectedLocation
// ]);

  return (
    <div className="  w-full rounded-l-xl shadow-sm h-full  left-0  overflow-y-auto lg:overflow-hidden">
      {/* Sidebar Header */}
        <div
              className={` pt-4 `}
            >
              <div className="px-4">
                <SidebarHeader isAdmin={isAdmin} isFocused={isFocused} />
              </div>
              {!isAdmin && <hr />}
              {!isSearchFocused && (
                <>
                  <div onClick={() => setIsFocused(true)} className="mt-5 px-4">
                    <SearchField showSearchResultsNumber={false} focus={false} />
                  </div>
                  <div className="flex items-center mt-5 overflow-hidden px-4 py-2 transition-all duration-300 ease-in-out">
                    <Button
                      type="button"
                      variant="filled"
                      onClick={handleAllSelection}
                      className="py-[6px] px-[10px] border-none rounded-full mb-3 text-sm font-medium"
                    >
                      All
                    </Button>
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
                      {/* Search Results Section */}
                      {isSearchFocused && (
                        <div className="flex flex-col h-dvh pt-4 w-auto">
                          <div className="flex flex-col gap-5 px-4">
                            <SidebarHeader
                              isAdmin={isAdmin}
                              isFocused={isSearchFocused}
                              handleHeaderClick={handleExit}
                            />
                            <SearchField
                            value={query}
                              onSearch={SearchSuggestions}
                              onClearSearch={handleExit}
                              focus={isSearchFocused}
                              showSearchResultsNumber={true}
                            />
                          </div>
              
              
                          {suggestions && (
                            <div
                              className={`border border-secondary-neutral-light-100 ${suggestions.length > 0 ? 'mt-3' : ''}`}
                            />
                          )}
              
                          {suggestions === '' ? (
                            renderNoResults(false)
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
                          suggestions.length === 0 &&
                            measurementsLoading ? (
                            <SearchResultsSkeleton />
                          ) : suggestions.length === 0 && !isLoading ? (
                            renderNoResults(true)
                          ) : (
                            <LocationCards
                              searchResults={suggestions}
                              isLoading={isLoading}
                              handleLocationSelect={handleLocationSelect}
                            />
                          )}
                        </div>
                      )}
      {/* {selectedLocation && <WeekPrediction selectedSite={selectedLocation} weeklyPredictions={weeklyPredictions} loading={isLoading} />} */}
    </div>
  );
};

export default MapSidebar;
