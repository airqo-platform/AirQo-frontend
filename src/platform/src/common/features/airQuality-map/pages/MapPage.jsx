'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { getGridsDataSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';

// Components
import AirQoMap from '../components/AirQoMap';
import MapControls from '../components/MapControls';
import MapSidebar from '../components/map-sidebar';
import AirQualityLegend from '../components/Legend';
import Toast from '@/components/Toast';
import Loader from '@/components/Spinner';
import { LoadingOverlay } from '../hooks';

// Utils and constants
import { isDesktop } from '../utils/mapHelpers';
import { TOAST_CONFIG } from '../constants/mapConstants';

const MapPage = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const airqoMapRef = useRef(null);

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
  const [pollutant] = useState('pm2_5');

  // Redux selectors
  const rawGridsDataSummary = useSelector(
    (state) => state.grids.gridsDataSummary?.grids,
  );
  const gridsDataSummary = React.useMemo(
    () => rawGridsDataSummary || [],
    [rawGridsDataSummary],
  );
  const rawPreferences = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const preferences = React.useMemo(
    () => rawPreferences || [],
    [rawPreferences],
  );
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

  // Map control actions
  const handleControlAction = useCallback(
    (action) => {
      if (!airqoMapRef.current) return;

      switch (action) {
        case 'refresh':
          airqoMapRef.current.refreshMap();
          break;
        case 'share':
          airqoMapRef.current.shareLocation();
          break;
        case 'capture':
          airqoMapRef.current.captureScreenshot();
          break;
        case 'layers':
          airqoMapRef.current.openLayerModal();
          break;
        default:
          break;
      }

      if (isMobile) {
        setIsControlsExpanded(false);
      }
    },
    [isMobile],
  );

  // Clear toast message
  const clearToastMessage = useCallback(() => {
    setToastMessage({ message: '', type: '', bgColor: '' });
  }, []);

  return (
    <div className={containerClassName}>
      <div className={`md:overflow-hidden md:rounded-l-xl ${sidebarClassName}`}>
        <MapSidebar siteDetails={siteDetails} isAdmin={true} />
      </div>

      <div className={mapClassName}>
        <div className="relative w-full h-full md:overflow-hidden md:rounded-r-xl">
          <AirQoMap
            ref={airqoMapRef}
            mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            customStyle="flex-grow h-full w-full relative dark:text-black-900"
            pollutant={pollutant}
            onToastMessage={setToastMessage}
            onLoadingChange={setLoading}
            onLoadingOthersChange={setLoadingOthers}
          />

          {/* Loading overlay */}
          {loading && (
            <LoadingOverlay size={70}>
              <Loader width={32} height={32} />
            </LoadingOverlay>
          )}

          {/* Legend */}
          {showLegendAndControls && (
            <div className="absolute left-4 bottom-2 z-50">
              <AirQualityLegend pollutant={pollutant} />
            </div>
          )}

          {/* Map controls */}
          <MapControls
            isDesktop={isDesktop(width)}
            isControlsExpanded={isControlsExpanded}
            setIsControlsExpanded={setIsControlsExpanded}
            onControlAction={handleControlAction}
            show={showLegendAndControls}
          />

          {/* Loading indicator for additional data */}
          {loadingOthers && (
            <div className="absolute bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md p-2 top-4 right-16 flex items-center z-50">
              <Loader width={20} height={20} />
              <span className="ml-2 text-sm">
                Loading global AQI data from 80+ cities...
              </span>
            </div>
          )}

          {/* Toast notifications */}
          {toastMessage.message && (
            <Toast
              message={toastMessage.message}
              clearData={clearToastMessage}
              type={toastMessage.type}
              timeout={TOAST_CONFIG.TIMEOUT}
              bgColor={toastMessage.bgColor}
              position={TOAST_CONFIG.POSITION}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
