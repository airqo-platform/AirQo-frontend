'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AirQoMap from '@/features/airQuality-map';
import Sidebar from '@/features/airQuality-map/components/sidebar';
import AirQualityLegend from '@/features/airQuality-map/components/Legend';
import Toast from '@/components/Toast';
import Loader from '@/components/Spinner';
import { getGridsDataSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { IconButton, LoadingOverlay } from '@/features/airQuality-map/hooks';
import { withUserAuth } from '@/core/HOC';

// Icons
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import CameraIcon from '@/icons/map/cameraIcon';
import DotsVerticalIcon from '@/icons/map/dotsVerticalIcon';

const MapPage = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const airqoMapRef = useRef(null);
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

  const gridsDataSummary =
    useSelector((state) => state.grids.gridsDataSummary?.grids) || [];
  const preferences =
    useSelector((state) => state.defaults.individual_preferences) || [];
  const selectedNode = useSelector((state) => state.map.selectedNode);

  // Fetch grids data summary on mount.
  useEffect(() => {
    const fetchGrids = async () => {
      try {
        await dispatch(getGridsDataSummary());
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch grids data:', error);
        setToastMessage({
          message: 'Failed to load site data. Please try again.',
          type: 'error',
          bgColor: 'bg-red-500',
        });
      }
    };
    fetchGrids();
  }, [dispatch]);

  // Update site details when grid data changes.
  useEffect(() => {
    if (gridsDataSummary.length) {
      const sites = gridsDataSummary.flatMap((grid) => grid.sites || []);
      setSiteDetails(sites);
    }
  }, [gridsDataSummary]);

  // Set suggested sites.
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

  // Save user's location (if not already saved).
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
        (error) => {
          // eslint-disable-next-line no-console
          console.error('Geolocation error:', error);
        },
      );
    }
  }, []);

  // Close mobile controls when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isControlsExpanded && !event.target.closest('.controls-container')) {
        setIsControlsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isControlsExpanded]);
  // Responsive layout classes based on screen size
  const isMobile = width < 1024;

  // Mobile layout: Map (40% height) on top, Sidebar (60% height) at bottom
  // Desktop layout: Sidebar on left, Map on right (full height for both)
  // Account for global topbar (3rem = 48px) in height calculations
  const containerClassName = isMobile
    ? 'flex flex-col w-full h-full overflow-hidden'
    : 'flex flex-row w-full h-full pt-2 pr-2 pb-2 pl-0 overflow-hidden';

  const sidebarClassName = isMobile
    ? 'transition-all duration-500 ease-in-out h-[60%] w-full sidebar-scroll-bar order-2'
    : 'transition-all duration-300 h-full min-w-[380px] lg:w-[470px]';

  const mapClassName = isMobile
    ? 'transition-all duration-500 ease-in-out h-[40%] w-full order-1'
    : 'transition-all duration-300 h-full w-full';

  // Map control actions.
  const handleControlAction = (action) => {
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
    if (isMobile) setIsControlsExpanded(false);
  };

  return (
    <>
      <div className={containerClassName}>
        <div className={sidebarClassName}>
          <Sidebar siteDetails={siteDetails} isAdmin={true} />
        </div>
        <div className={mapClassName}>
          <div className="relative w-full h-full">
            <AirQoMap
              ref={airqoMapRef}
              mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              customStyle="flex-grow h-full w-full relative dark:text-black-900"
              pollutant={pollutant}
              onToastMessage={setToastMessage}
              onLoadingChange={setLoading}
              onLoadingOthersChange={setLoadingOthers}
            />
            {loading && (
              <LoadingOverlay size={70}>
                <Loader width={32} height={32} />
              </LoadingOverlay>
            )}
            {/* Show legend only when appropriate */}
            {(width >= 1024 || !selectedNode) && (
              <div className="absolute left-4 bottom-2 z-[1000]">
                <AirQualityLegend pollutant={pollutant} />
              </div>
            )}
            {/* Map controls */}
            {(width >= 1024 || !selectedNode) && (
              <div
                className="absolute top-4 right-0 controls-container"
                style={{
                  zIndex: 10000,
                }}
              >
                {width >= 1024 ? (
                  <div className="flex flex-col gap-4">
                    <IconButton
                      onClick={() => handleControlAction('refresh')}
                      title="Refresh Map"
                      icon={<RefreshIcon />}
                    />
                    <IconButton
                      onClick={() => handleControlAction('share')}
                      title="Share Location"
                      icon={<ShareIcon />}
                    />
                    <IconButton
                      onClick={() => handleControlAction('capture')}
                      title="Capture Screenshot"
                      icon={<CameraIcon />}
                    />
                    <IconButton
                      onClick={() => handleControlAction('layers')}
                      title="Map Layers"
                      icon={<LayerIcon />}
                    />
                  </div>
                ) : (
                  <div className="relative controls-container">
                    <div className="flex items-center">
                      {isControlsExpanded && (
                        <div
                          className={`
                            absolute right-full mr-2 flex gap-2 z-[2000]
                            transform transition-all duration-200 ease-in-out
                            ${isControlsExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
                          `}
                        >
                          <IconButton
                            onClick={() => handleControlAction('refresh')}
                            title="Refresh Map"
                            icon={<RefreshIcon />}
                          />
                          <IconButton
                            onClick={() => handleControlAction('share')}
                            title="Share Location"
                            icon={<ShareIcon />}
                          />
                          <IconButton
                            onClick={() => handleControlAction('capture')}
                            title="Capture Screenshot"
                            icon={<CameraIcon />}
                          />
                        </div>
                      )}
                      <IconButton
                        onClick={() =>
                          setIsControlsExpanded(!isControlsExpanded)
                        }
                        title="Map Controls"
                        icon={<DotsVerticalIcon />}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {loadingOthers && (
              <div className="absolute bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md p-2 top-4 right-16 flex items-center z-50">
                <Loader width={20} height={20} />
                <span className="ml-2 text-sm">Loading global AQI data...</span>
              </div>
            )}
            {toastMessage.message && (
              <Toast
                message={toastMessage.message}
                clearData={() =>
                  setToastMessage({ message: '', type: '', bgColor: '' })
                }
                type={toastMessage.type}
                timeout={3000}
                bgColor={toastMessage.bgColor}
                position="bottom"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default withUserAuth(MapPage);
