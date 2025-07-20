import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getGridsDataSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';
import { isDesktop } from '../utils/mapHelpers';

export function useMapPageState(width) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [loadingOthers, setLoadingOthers] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    message: '',
    type: '',
    bgColor: '',
  });
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [siteDetails, setSiteDetails] = useState([]);
  const [pollutant] = useState('pm2_5');

  // Redux selectors
  const rawGridsDataSummary = useSelector(
    (state) => state.grids.gridsDataSummary?.grids,
  );
  const gridsDataSummary = useMemo(
    () => rawGridsDataSummary || [],
    [rawGridsDataSummary],
  );
  const rawPreferences = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const preferences = useMemo(() => rawPreferences || [], [rawPreferences]);
  const selectedNode = useSelector((state) => state.map.selectedNode);

  // Derived state
  const isMobile = !isDesktop(width);
  const showLegendAndControls = isDesktop(width) || !selectedNode;

  // Layout classes
  const containerClassName = isMobile
    ? 'flex flex-col w-full h-full overflow-hidden'
    : 'flex flex-row w-full h-full pt-2 pr-2 pb-[0.4rem] pl-0 overflow-hidden';
  const sidebarClassName = isMobile
    ? 'transition-all duration-500 ease-in-out h-[60%] w-full sidebar-scroll-bar order-2'
    : 'transition-all duration-300 h-full min-w-[380px] lg:w-[470px]';
  const mapClassName = isMobile
    ? 'transition-all duration-500 ease-in-out h-[40%] w-full order-1'
    : 'transition-all duration-300 h-full w-full';

  // Fetch grids data summary on mount
  useEffect(() => {
    const fetchGrids = async () => {
      try {
        await dispatch(getGridsDataSummary());
      } catch {
        setToastMessage({
          message: 'Failed to load site data. Please try again.',
          type: 'error',
          bgColor: 'bg-red-500',
        });
      }
    };
    fetchGrids();
  }, [dispatch]);

  // Update site details when grid data changes
  useEffect(() => {
    if (gridsDataSummary.length) {
      const sites = gridsDataSummary.flatMap((grid) => grid.sites || []);
      setSiteDetails(sites);
    }
  }, [gridsDataSummary]);

  // Set suggested sites
  useEffect(() => {
    if (!siteDetails.length) return;
    const preferredSites = preferences.flatMap(
      (pref) => pref.selected_sites || [],
    );
    if (preferredSites.length) {
      dispatch(addSuggestedSites(preferredSites));
    } else {
      const uniqueSites = [
        ...new Map(siteDetails.map((site) => [site._id, site])).values(),
      ];
      const selectedSites = uniqueSites
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      dispatch(addSuggestedSites(selectedSites));
    }
  }, [preferences, siteDetails, dispatch]);

  // Save user's location (if not already saved)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      !localStorage.getItem('userLocation') &&
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem(
            'userLocation',
            JSON.stringify({
              lat: position.coords.latitude,
              long: position.coords.longitude,
            }),
          );
        },
        () => {
          // User denied geolocation permission - this is expected behavior
        },
      );
    }
  }, []);

  // Close mobile controls when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isControlsExpanded && !event.target.closest('.controls-container')) {
        setIsControlsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isControlsExpanded]);

  // Toast clear
  const clearToastMessage = useCallback(() => {
    setToastMessage({ message: '', type: '', bgColor: '' });
  }, []);

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
    containerClassName,
    sidebarClassName,
    mapClassName,
    isMobile,
    showLegendAndControls,
    width,
  };
}
