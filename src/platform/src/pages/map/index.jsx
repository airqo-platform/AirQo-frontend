import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AirQoMap from '@/features/airQuality-map';
import Sidebar from '@/features/airQuality-map/components/sidebar';
import AirQualityLegend from '@/features/airQuality-map/components/Legend';
import Toast from '@/components/Toast';
import Loader from '@/components/Spinner';
import { getGridsDataSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import { useWindowSize } from '@/lib/windowSize';
import { IconButton, LoadingOverlay } from '@/features/airQuality-map/hooks';

// Import icons
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import CameraIcon from '@/icons/map/cameraIcon';
import DotsVerticalIcon from '@/icons/map/dotsVerticalIcon';

const Index = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const airqoMapRef = useRef(null);

  // States
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
  const gridsDataSummary =
    useSelector((state) => state.grids.gridsDataSummary?.grids) || [];
  const preferences =
    useSelector((state) => state.defaults.individual_preferences) || [];
  const selectedNode = useSelector((state) => state.map.selectedNode);

  // Fetch grid data summary only once on mount
  useEffect(() => {
    const fetchGrids = async () => {
      try {
        await dispatch(getGridsDataSummary());
      } catch (error) {
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

  // Update site details when grids data summary changes
  useEffect(() => {
    if (Array.isArray(gridsDataSummary) && gridsDataSummary.length > 0) {
      const sites = gridsDataSummary.flatMap((grid) => grid.sites || []);
      setSiteDetails(sites);
    }
  }, [gridsDataSummary]);

  // Set suggested sites based on preferences or random selection
  useEffect(() => {
    // Wait until we have site data
    if (siteDetails.length === 0) return;

    const preferencesSelectedSitesData = preferences.flatMap(
      (pref) => pref.selected_sites || [],
    );

    if (preferencesSelectedSitesData.length > 0) {
      dispatch(addSuggestedSites(preferencesSelectedSitesData));
    } else {
      // Get random unique sites
      const uniqueSites = [
        ...new Map(siteDetails.map((site) => [site._id, site])).values(),
      ];

      const selectedSites = uniqueSites
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      dispatch(addSuggestedSites(selectedSites));
    }
  }, [preferences, siteDetails, dispatch]);

  // Get user's current location
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
        (error) => console.error('Geolocation error:', error),
      );
    }
  }, []);

  // Handle clicks outside controls (for mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isControlsExpanded &&
        event.target.closest('.controls-container') === null
      ) {
        setIsControlsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isControlsExpanded]);

  // Responsive layout classes with smooth transitions
  const sidebarClassName =
    width < 1024
      ? `transition-all duration-500 ease-in-out ${
          selectedNode ? 'h-[70%]' : 'h-full w-full sidebar-scroll-bar'
        }`
      : 'transition-all duration-300 h-full min-w-[380px] lg:w-[470px]';

  const mapClassName =
    width < 1024
      ? `transition-all duration-500 ease-in-out ${
          selectedNode ? 'h-[30%]' : 'h-full w-full'
        }`
      : 'transition-all duration-300 h-full w-full';

  // Handler for map controls
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

    // Close mobile controls after action
    if (width < 1024) {
      setIsControlsExpanded(false);
    }
  };

  return (
    <Layout noTopNav={width < 1024}>
      <div className="relative flex flex-col-reverse lg:flex-row w-full h-dvh pt-2 pr-2 pb-2 pl-0 overflow-hidden">
        {/* Sidebar */}
        <div className={sidebarClassName}>
          <Sidebar siteDetails={siteDetails} isAdmin={true} />
        </div>

        {/* Map Container */}
        <div className={mapClassName}>
          <div className="relative w-full h-full">
            {/* Main Map Component */}
            <AirQoMap
              ref={airqoMapRef}
              mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              customStyle="flex-grow h-full w-full relative dark:text-black-900"
              pollutant={pollutant}
              onToastMessage={setToastMessage}
              onLoadingChange={setLoading}
              onLoadingOthersChange={setLoadingOthers}
            />

            {/* Map loading overlay */}
            {loading && (
              <LoadingOverlay size={70}>
                <Loader width={32} height={32} />
              </LoadingOverlay>
            )}

            {/* Air Quality Legend */}
            {(width >= 1024 || !selectedNode) && (
              <div className="absolute left-4 bottom-2 z-[1000]">
                <AirQualityLegend pollutant={pollutant} />
              </div>
            )}

            {/* Map Controls */}
            {(width >= 1024 || !selectedNode) && (
              <div className="absolute top-4 right-0 z-40 controls-container">
                {width >= 1024 ? (
                  // Desktop view – vertical stack of buttons
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
                  // Mobile view – controls expand to the left
                  <div className="relative controls-container">
                    <div className="flex items-center">
                      {isControlsExpanded && (
                        <div
                          className={`
                            absolute right-full mr-2 rounded-lg shadow-lg p-2 bg-white flex gap-2 z-[2000]
                            transform transition-all duration-200 ease-in-out
                            ${isControlsExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
                          `}
                        >
                          <IconButton
                            onClick={() => handleControlAction('layers')}
                            title="Map Layers"
                            icon={<LayerIcon />}
                          />
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

            {/* Secondary loading indicator for WAQ data */}
            {loadingOthers && (
              <div className="absolute bg-white dark:text-black-900 rounded-md p-2 top-4 right-16 flex items-center z-50">
                <Loader width={20} height={20} />
                <span className="ml-2 text-sm">Loading global AQI data...</span>
              </div>
            )}

            {/* Toast Notification */}
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
    </Layout>
  );
};

export default withAuth(Index);
