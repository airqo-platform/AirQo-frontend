import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useGoogleMaps from '@/core/hooks/useGoogleMaps';
import { getAutocompleteSuggestions } from '@/core/utils/AutocompleteSuggestions';
import { getPlaceDetails } from '@/core/utils/getLocationGeomtry';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';
import {
  setCenter,
  setZoom,
  setSelectedLocation,
  reSetMap,
  setSelectedNode,
  setSelectedWeeklyPrediction,
  addSuggestedSites,
} from '@/lib/store/services/map/MapSlice';

export default function useAutocomplete(siteDetails) {
  const dispatch = useDispatch();
  const reduxSearchTerm = useSelector((s) => s.locationSearch.searchTerm);

  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ isError: false, message: '', type: '' });

  const googleMapsLoaded = useGoogleMaps(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  );
  const sessionToken = useMemo(() => {
    if (
      !googleMapsLoaded ||
      !window.google?.maps?.places?.AutocompleteSessionToken
    )
      return null;
    return new window.google.maps.places.AutocompleteSessionToken();
  }, [googleMapsLoaded]);

  /* ------------- search ------------- */
  const handleSearch = useCallback(async () => {
    if (!reduxSearchTerm || reduxSearchTerm.length <= 1) {
      setSearchResults([]);
      return;
    }
    if (!sessionToken) return;
    setIsLoading(true);
    try {
      const predictions = await getAutocompleteSuggestions(
        reduxSearchTerm,
        sessionToken,
      );
      setSearchResults(
        predictions.map((p) => ({
          description: p.description,
          place_id: p.place_id,
        })),
      );
    } catch {
      setError({ isError: true, message: 'Search failed', type: 'error' });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [reduxSearchTerm, sessionToken]);

  useEffect(() => {
    const t = setTimeout(handleSearch, 300);
    return () => clearTimeout(t);
  }, [handleSearch]);

  /* ------------- location pick ------------- */
  const handleLocationSelect = useCallback(
    async (data, type = 'suggested') => {
      try {
        let updated = data;
        let lat, lng;
        if (data.place_id) {
          const details = await getPlaceDetails(data.place_id);
          if (!details?.latitude || !details?.longitude)
            throw new Error('Missing geometry');
          lat = details.latitude;
          lng = details.longitude;
          updated = { ...data, ...details };
        } else {
          lat = data.geometry?.coordinates?.[1] ?? data.approximate_latitude;
          lng = data.geometry?.coordinates?.[0] ?? data.approximate_longitude;
        }
        if (!lat || !lng) throw new Error('Missing coordinates');
        dispatch(setCenter({ latitude: lat, longitude: lng }));
        dispatch(setZoom(11));
        if (type !== 'suggested') dispatch(setSelectedLocation(updated));
      } catch {
        setError({
          isError: true,
          message: 'Could not select location',
          type: 'error',
        });
      }
    },
    [dispatch],
  );

  /* ------------- reset / all ------------- */
  const handleExit = useCallback(() => {
    dispatch(reSetMap());
    dispatch(addSearchTerm(''));
    dispatch(setSelectedNode(null));
    dispatch(setSelectedWeeklyPrediction(null));
    setIsFocused(false);
    setSearchResults([]);
  }, [dispatch]);

  const handleAllSelection = useCallback(() => {
    dispatch(reSetMap());
    const sorted = siteDetails
      ?.slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    dispatch(addSuggestedSites(sorted));
  }, [dispatch, siteDetails]);

  const clearError = () => setError({ isError: false, message: '', type: '' });

  return {
    isSearchFocused: isFocused || reduxSearchTerm.length > 0,
    searchResults,
    isLoading,
    error,
    clearError,
    handleSearch,
    handleExit,
    handleLocationSelect,
    handleAllSelection,
    setIsFocused,
  };
}
