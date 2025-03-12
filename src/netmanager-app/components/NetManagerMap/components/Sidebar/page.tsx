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

import allCountries from '../../data/countries.json';
import SearchField from '@/components/search/SearchField';
import Button from '@/components/Button';
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
  isAdmin?: boolean;
}

const MapSidebar: React.FC<MapSidebarProps> = ({ siteDetails, isAdmin = false }) => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();

  const [isFocused, setIsFocused] = useState(false);
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

//   const openLocationDetails = useSelector((state: any) => state.map.showLocationDetails);
//   const selectedLocation = useSelector((state: any) => state.map.selectedLocation ?? null);
//   const mapLoading = useSelector((state: any) => state.map.mapLoading);
//   const measurementsLoading = useSelector((state: any) => state.recentMeasurements.status);
//   const selectedWeeklyPrediction = useSelector((state: any) => state.map.selectedWeeklyPrediction);
//   const reduxSearchTerm = useSelector((state: any) => state.locationSearch.searchTerm);
//   const suggestedSites = useSelector((state: any) => state.map.suggestedSites);

//   const isSearchFocused = isFocused || reduxSearchTerm.length > 0;
  const googleMapsLoaded = useGoogleMaps(process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY);

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
    <div className="w-full rounded-l-xl shadow-sm h-full bg-white overflow-y-auto lg:overflow-hidden">
      {/* Sidebar Header */}
      <SidebarHeader isAdmin={isAdmin} />
      <SearchField showSearchResultsNumber={false} focus={false} />
      <Button type="button" variant="filled" onClick={() => dispatch(reSetMap())}>
        All
      </Button>
      <CountryList data={countryData} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} siteDetails={siteDetails} />
      {error.isError && <Toast message={error.message} clearData={() => setError({ isError: false, message: '', type: '' })} type={error.type} timeout={3000} />}
      {/* {selectedLocation && <WeekPrediction selectedSite={selectedLocation} weeklyPredictions={weeklyPredictions} loading={isLoading} />} */}
    </div>
  );
};

export default MapSidebar;
