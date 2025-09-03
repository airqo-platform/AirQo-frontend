import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getGridsSummaryDetails } from '@/core/apis/DeviceRegistry';
import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';
import { isDesktop } from '../utils/mapHelpers';

// Constants for better performance and maintainability
const CONSTANTS = {
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_SUGGESTED_SITES: 4,
  REQUEST_TIMEOUT: 10000, // 10 seconds
  DEFAULT_POLLUTANT: 'pm2_5',
};

export function useMapPageState(width) {
  const dispatch = useDispatch();

  // Performance optimizations with refs
  const abortControllerRef = useRef(null);
  const cacheRef = useRef({ data: null, timestamp: 0 });
  const isUnmountedRef = useRef(false);

  // State management
  const [loading, setLoading] = useState(true);
  const [loadingOthers, setLoadingOthers] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    message: '',
    type: '',
    bgColor: '',
  });
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [siteDetails, setSiteDetails] = useState([]);
  const [gridsDataSummary, setGridsDataSummary] = useState([]);
  const [pollutant] = useState(CONSTANTS.DEFAULT_POLLUTANT);

  // Optimized Redux selectors with shallow comparison
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences || [],
    (prev, next) => {
      // Use proper deep equality check with fallback to JSON comparison
      if (prev === next) return true;
      if (!prev || !next) return false;
      if (prev.length !== next.length) return false;

      // Check array elements for deep equality
      for (let i = 0; i < prev.length; i++) {
        if (typeof prev[i] === 'object' && typeof next[i] === 'object') {
          if (JSON.stringify(prev[i]) !== JSON.stringify(next[i])) return false;
        } else if (prev[i] !== next[i]) {
          return false;
        }
      }
      return true;
    },
  );
  const selectedNode = useSelector((state) => state.map.selectedNode);

  // Derived state with memoization
  const isMobile = useMemo(() => !isDesktop(width), [width]);
  const showLegendAndControls = useMemo(
    () => isDesktop(width) || !selectedNode,
    [width, selectedNode],
  );

  // Layout classes with memoization
  const layoutClasses = useMemo(
    () => ({
      containerClassName: isMobile
        ? 'flex flex-col w-full h-full overflow-hidden'
        : 'flex flex-row w-full h-full pt-2 pr-2 pb-[0.4rem] pl-0 overflow-hidden',
      sidebarClassName: isMobile
        ? 'transition-all duration-500 ease-in-out h-[60%] w-full sidebar-scroll-bar order-2'
        : 'transition-all duration-300 h-full min-w-[380px] lg:w-[470px]',
      mapClassName: isMobile
        ? 'transition-all duration-500 ease-in-out h-[40%] w-full order-1'
        : 'transition-all duration-300 h-full w-full',
    }),
    [isMobile],
  );

  // Optimized fetch grids data function
  const fetchGridsData = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (
      cacheRef.current.data &&
      now - cacheRef.current.timestamp < CONSTANTS.CACHE_DURATION
    ) {
      setGridsDataSummary(cacheRef.current.data);
      return cacheRef.current.data;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const response = await Promise.race([
        getGridsSummaryDetails(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout')),
            CONSTANTS.REQUEST_TIMEOUT,
          ),
        ),
      ]);

      if (isUnmountedRef.current) return;

      if (response?.success && response?.grids) {
        const gridsData = response.grids;

        // Update cache
        cacheRef.current = {
          data: gridsData,
          timestamp: now,
        };

        setGridsDataSummary(gridsData);
        return gridsData;
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      if (isUnmountedRef.current) return;

      if (error.name !== 'AbortError') {
        // Silently handle error
        setToastMessage({
          message: 'Failed to load site data. Please try again.',
          type: 'error',
          bgColor: 'bg-red-500',
        });
      }

      // Try to use cached data as fallback
      if (cacheRef.current.data) {
        setGridsDataSummary(cacheRef.current.data);
        return cacheRef.current.data;
      }

      return [];
    } finally {
      if (!isUnmountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Update site details when grid data changes
  const updateSiteDetails = useCallback((gridsData) => {
    if (!Array.isArray(gridsData) || gridsData.length === 0) {
      setSiteDetails([]);
      return;
    }

    const sites = gridsData.reduce((acc, grid) => {
      if (grid?.sites && Array.isArray(grid.sites)) {
        acc.push(...grid.sites);
      }
      return acc;
    }, []);

    // Remove duplicates based on _id
    const uniqueSites = sites.filter(
      (site, index, arr) => arr.findIndex((s) => s._id === site._id) === index,
    );

    setSiteDetails(uniqueSites);
  }, []);

  // Set suggested sites based on preferences
  const setSuggestedSites = useCallback(
    (sites, userPreferences) => {
      if (!Array.isArray(sites) || sites.length === 0) return;

      const preferredSites = userPreferences.reduce((acc, pref) => {
        if (pref?.selected_sites && Array.isArray(pref.selected_sites)) {
          acc.push(...pref.selected_sites);
        }
        return acc;
      }, []);

      if (preferredSites.length > 0) {
        // Use user's preferred sites
        const validPreferredSites = preferredSites.filter((prefSite) =>
          sites.some((site) => site._id === prefSite._id),
        );
        dispatch(
          addSuggestedSites(
            validPreferredSites.slice(0, CONSTANTS.MAX_SUGGESTED_SITES),
          ),
        );
      } else {
        // Use random selection of unique sites
        const uniqueSites = Array.from(
          new Map(sites.map((site) => [site._id, site])).values(),
        );

        const selectedSites = uniqueSites
          .sort(() => 0.5 - Math.random())
          .slice(0, CONSTANTS.MAX_SUGGESTED_SITES);

        dispatch(addSuggestedSites(selectedSites));
      }
    },
    [dispatch],
  );

  // Fetch grids data on mount
  useEffect(() => {
    fetchGridsData();

    return () => {
      isUnmountedRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchGridsData]);

  // Update site details when grids data changes
  useEffect(() => {
    updateSiteDetails(gridsDataSummary);
  }, [gridsDataSummary, updateSiteDetails]);

  // Set suggested sites when preferences or site details change
  useEffect(() => {
    if (siteDetails.length > 0) {
      setSuggestedSites(siteDetails, preferences);
    }
  }, [preferences, siteDetails, setSuggestedSites]);

  // Save user's location (optimized with error handling)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      !localStorage.getItem('userLocation') &&
      navigator.geolocation
    ) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            localStorage.setItem(
              'userLocation',
              JSON.stringify({
                lat: position.coords.latitude,
                long: position.coords.longitude,
                timestamp: Date.now(),
              }),
            );
          } catch {
            // Storage quota exceeded or other storage error - fail silently
          }
        },
        () => {
          // User denied geolocation permission - this is expected behavior
        },
        options,
      );
    }
  }, []);

  // Close mobile controls when clicking outside (optimized)
  useEffect(() => {
    if (!isMobile || !isControlsExpanded) return;

    const handleClickOutside = (event) => {
      if (!event.target.closest('.controls-container')) {
        setIsControlsExpanded(false);
      }
    };

    // Use passive listener for better performance
    document.addEventListener('mousedown', handleClickOutside, {
      passive: true,
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isControlsExpanded, isMobile]);

  // Toast clear function
  const clearToastMessage = useCallback(() => {
    setToastMessage({ message: '', type: '', bgColor: '' });
  }, []);

  // Expose refresh function for manual data refresh
  const refreshData = useCallback(() => {
    // Clear cache to force fresh data
    cacheRef.current = { data: null, timestamp: 0 };
    return fetchGridsData();
  }, [fetchGridsData]);

  return {
    loading,
    setLoading,
    loadingOthers,
    setLoadingOthers,
    toastMessage,
    setToastMessage,
    clearToastMessage,
    isControlsExpanded,
    setIsControlsExpanded,
    siteDetails,
    pollutant,
    gridsDataSummary,
    refreshData,
    containerClassName: layoutClasses.containerClassName,
    sidebarClassName: layoutClasses.sidebarClassName,
    mapClassName: layoutClasses.mapClassName,
    isMobile,
    showLegendAndControls,
    width,
  };
}
