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
} from '@/core/redux/slices/mapslice';
import { addSearchTerm } from '@/lib/services/search/LocationSearchSlice';
import {
  fetchRecentMeasurementsData,clearMeasurementsData,} from '@/core/redux/slices/RecentMeasurementsSlice';
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

  const openLocationDetails = useAppSelector((state: any) => state.map.showLocationDetails);
  const selectedLocation = useAppSelector((state: any) => state.map.selectedLocation ?? null);
  const mapLoading = useAppSelector((state: any) => state.map.mapLoading);
  const measurementsLoading = useAppSelector((state: any) => state.recentMeasurementReducer.status);
  const selectedWeeklyPrediction = useAppSelector((state: any) => state.map.selectedWeeklyPrediction);
  const reduxSearchTerm = useAppSelector((state: any) => state.locationSearch.searchTerm);
  const suggestedSites = useAppSelector((state: any) => state.map.suggestedSites);
  console.log("Suggested Sites",suggestedSites)
  const storedToken = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2FjYjIwZGU3NTVlMzAwMTNhMzYxNzUiLCJmaXJzdE5hbWUiOiJBa2F0d2lqdWthIiwibGFzdE5hbWUiOiJFbGlhIiwidXNlck5hbWUiOiJlbGlhYWtqdHJucUBnbWFpbC5jb20iLCJlbWFpbCI6ImVsaWFha2p0cm5xQGdtYWlsLmNvbSIsIm9yZ2FuaXphdGlvbiI6ImFpcnFvIiwibG9uZ19vcmdhbml6YXRpb24iOiJhaXJxbyIsInByaXZpbGVnZSI6InVzZXIiLCJjb3VudHJ5IjpudWxsLCJwcm9maWxlUGljdHVyZSI6bnVsbCwicGhvbmVOdW1iZXIiOm51bGwsImNyZWF0ZWRBdCI6IjIwMjUtMDItMTIgMTQ6Mzc6MDEiLCJ1cGRhdGVkQXQiOiIyMDI1LTAyLTEyIDE0OjM3OjAxIiwicmF0ZUxpbWl0IjpudWxsLCJsYXN0TG9naW4iOiIyMDI1LTAyLTE3VDAzOjM5OjM5LjQwNVoiLCJpYXQiOjE3Mzk3NjM1Nzl9.HQPoN-SKm2wq6wVLEGBp1aa-1gJEoI2oRODFnUlp-Zg";

  const isSearchFocused = isFocused ||  reduxSearchTerm.length > 0;
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
      
        const handleLocationSelect = useCallback(
          async (data: { place_id: any; geometry: { coordinates: any[]; }; approximate_latitude: any; approximate_longitude: any; }) => {
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


  const autoCompleteSessionToken = useMemo(() => {
    if (googleMapsLoaded && window.google) {
      return new window.google.maps.places.AutocompleteSessionToken();
    }
    return null;
  }, [googleMapsLoaded]);

  //       Handle Search Functionality
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
          const predictions = await FetchSuggestions( reduxSearchTerm,
                sessionToken=storedToken
          );
          console.log("SUGS",predictions)
    
          if (predictions?.length) {
            setSearchResults(
              predictions.map(({ description, place_id }: { description: string; place_id: string }) => ({
                description,
                place_id,
              })),
            );
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      }, [reduxSearchTerm, autoCompleteSessionToken, googleMapsLoaded]);

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
        selectedLocation
]);

  useEffect(() => {
    if (selectedLocation) {
      dispatch(fetchRecentMeasurementsData({ site_id: selectedLocation._id }))
        .unwrap()
        .then(() => fetchWeeklyPredictions())
        .catch((error: any) => {
          setError({ isError: true, message: 'Failed to fetch recent measurements', type: 'error' });
        });
    }
  }, [
        selectedLocation,
         dispatch]);

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
      setError({ isError: true, message: 'Failed to fetch weekly predictions', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [
        selectedLocation
]);

  return (
    <div className="  w-full rounded-l-xl shadow-sm h-full  left-0  overflow-y-auto lg:overflow-hidden">
      {/* Sidebar Header */}
        <div
              className={` pt-4 `}
            >
                {!isSearchFocused &&(
                        <div className="px-4">
                        <SidebarHeader isAdmin={isAdmin} isFocused={isFocused} />
                      </div>
                )}
              
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
                                {isSearchFocused &&  !openLocationDetails && (
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
                          searchResults.length === 0 &&
                            measurementsLoading ? (
                            <SearchResultsSkeleton />
                          ) : searchResults.length === 0 && !isLoading ? (
                            renderNoResults(true)
                          ) : (
                            <LocationCards
                              searchResults={searchResults}
                              isLoading={isLoading}
                              handleLocationSelect={(location) => {
                                const adaptedLocation = {
                                  place_id: location.place_id,
                                  geometry: { coordinates: [] },
                                  approximate_latitude: null,
                                  approximate_longitude: null,
                                  ...location,
                                };
                                handleLocationSelect(adaptedLocation);
                              }}
                            />
                          )}
                        </div>
                      )}

              <div className="sidebar-scroll-bar">
                    {/* Suggested locations */}
                    { !suggestedSites || suggestedSites.length === 0 ?(
                      renderLoadingSkeleton()
                    )  : !isSearchFocused &&
                    !openLocationDetails &&
                    suggestedSites.length > 0 ?  (
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
                          searchResults={searchResults}
                          isLoading={isLoading}
                          handleLocationSelect={()=>{handleLocationSelect}}
                        />
                      </>
                    ) : (
                      !isSearchFocused && !openLocationDetails && renderDefaultMessage()
                    )}
            

            
                    {/* Selected Site Details */}
                    {selectedLocation && !mapLoading && (
                      <div>
                        <div className="pt-6 pb-5">
                          <div className="flex items-center gap-2 text-black-800 mb-4 mx-4">
                            <Button
                              paddingStyles="p-0"
                              onClick={handleExit}
                              variant="text"
                              type="button"
                            >
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

                      
      {/* {selectedLocation && <WeekPrediction selectedSite={selectedLocation} weeklyPredictions={weeklyPredictions} loading={isLoading} />} */}
    </div>
  );
};

export default MapSidebar;
