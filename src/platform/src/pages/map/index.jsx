import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AirQoMap from '@/features/airQuality-map';
import Sidebar from '@/features/airQuality-map/components/sidebar';
import AirQualityLegend from '@/features/airQuality-map/components/Legend';
import LayerModal from '@/features/airQuality-map/components/LayerModal';
import Toast from '@/components/Toast';
import Loader from '@/components/Spinner';
import { getGridsDataSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import { useWindowSize } from '@/lib/windowSize';
import {
  useRefreshMap,
  useShareLocation,
  useMapScreenshot,
  IconButton,
  LoadingOverlay,
} from '@/features/airQuality-map/hooks';
import {
  mapStyles,
  mapDetails,
} from '@/features/airQuality-map/constants/constants';

// Import icons
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import CameraIcon from '@/icons/map/cameraIcon';
import DotsVerticalIcon from '@/icons/map/dotsVerticalIcon';

const Index = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const mapConfigRef = useRef({ mapRef: null });
  const controlsRef = useRef(null);

  // States
  const [isOpen, setIsOpen] = useState(false);
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

  // Handle map ready event
  const handleMapReady = useCallback((config) => {
    mapConfigRef.current = config;
  }, []);

  // Custom map hooks - They need mapRef from the config
  const refreshMap = useCallback(() => {
    const { mapRef } = mapConfigRef.current;
    if (!mapRef?.current) return;

    const refreshHook = useRefreshMap(
      setToastMessage,
      mapRef,
      dispatch,
      selectedNode,
    );
    refreshHook();
  }, [dispatch, selectedNode]);

  const shareLocation = useCallback(() => {
    const { mapRef } = mapConfigRef.current;
    if (!mapRef?.current) return;

    const shareHook = useShareLocation(setToastMessage, mapRef);
    shareHook();
  }, []);

  const captureScreenshot = useCallback(() => {
    const { mapRef } = mapConfigRef.current;
    if (!mapRef?.current) return;

    const screenshotHook = useMapScreenshot(mapRef, setToastMessage);
    screenshotHook();
  }, []);

  // Fetch grid data summary
  useEffect(() => {
    dispatch(getGridsDataSummary()).catch((error) => {
      console.error('Failed to fetch grids data:', error);
    });
  }, [dispatch]);

  // Set site details when grid data summary changes
  useEffect(() => {
    if (Array.isArray(gridsDataSummary) && gridsDataSummary.length > 0) {
      setSiteDetails(gridsDataSummary.flatMap((grid) => grid.sites || []));
    }
  }, [gridsDataSummary]);

  // Set suggested sites based on user preferences or randomly selected sites
  useEffect(() => {
    const preferencesSelectedSitesData = preferences.flatMap(
      (pref) => pref.selected_sites || [],
    );

    if (preferencesSelectedSitesData.length > 0) {
      dispatch(addSuggestedSites(preferencesSelectedSitesData));
    } else if (siteDetails.length > 0) {
      // Get random unique sites
      const uniqueSites = siteDetails.filter(
        (site, index, self) =>
          self.findIndex((s) => s._id === site._id) === index,
      );
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
      !localStorage.getItem('userLocation')
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

  // Handle clicks outside controls
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setIsControlsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Responsive layout classes
  const sidebarClassName =
    width < 1024
      ? `${selectedNode ? 'h-[70%]' : 'h-full w-full sidebar-scroll-bar'}`
      : 'h-full min-w-[380px] lg:w-[470px]';

  const mapClassName =
    width < 1024
      ? `${selectedNode ? 'h-[30%]' : 'h-full w-full'}`
      : 'h-full w-full';

  return (
    <Layout noTopNav={width < 1024}>
      <div className="relative flex flex-col-reverse lg:flex-row w-full h-dvh pt-2 pr-2 pb-2 pl-0 transition-all duration-500 ease-in-out">
        {/* Sidebar */}
        <div
          className={`${sidebarClassName} transition-all duration-500 ease-in-out`}
        >
          <Sidebar siteDetails={siteDetails} isAdmin={true} />
        </div>

        {/* Map Container */}
        <div
          className={`${mapClassName} transition-all duration-500 ease-in-out`}
        >
          <div className="relative w-full h-full">
            {/* Main Map Component */}
            <AirQoMap
              mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              customStyle="flex-grow h-full w-full relative bg-[#e6e4e0]"
              pollutant={pollutant}
              onMapReady={handleMapReady}
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
              <div className="absolute left-4 bottom-2 z-[10000]">
                <AirQualityLegend pollutant={pollutant} />
              </div>
            )}

            {/* Map Controls */}
            {(width >= 1024 || !selectedNode) && (
              <div className="absolute top-4 right-0 z-40">
                {width >= 1024 ? (
                  // Desktop view - vertical stack
                  <div className="flex flex-col gap-4">
                    <IconButton
                      onClick={() => setIsOpen(true)}
                      title="Map Layers"
                      icon={<LayerIcon />}
                    />
                    <IconButton
                      onClick={refreshMap}
                      title="Refresh Map"
                      icon={<RefreshIcon />}
                    />
                    <IconButton
                      onClick={shareLocation}
                      title="Share Location"
                      icon={<ShareIcon />}
                    />
                    <IconButton
                      onClick={captureScreenshot}
                      title="Capture Screenshot"
                      icon={<CameraIcon />}
                    />
                  </div>
                ) : (
                  // Mobile view - controls expand to the left
                  <div className="relative" ref={controlsRef}>
                    <div className="flex items-center">
                      {isControlsExpanded && (
                        <div
                          className={`
                          absolute right-full mr-2 rounded-lg shadow-lg p-2 flex gap-2 z-[20000]
                          transform transition-all duration-200 ease-in-out
                          ${isControlsExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
                        `}
                        >
                          <IconButton
                            onClick={() => {
                              setIsOpen(true);
                              setIsControlsExpanded(false);
                            }}
                            title="Map Layers"
                            icon={<LayerIcon />}
                          />
                          <IconButton
                            onClick={() => {
                              refreshMap();
                              setIsControlsExpanded(false);
                            }}
                            title="Refresh Map"
                            icon={<RefreshIcon />}
                          />
                          <IconButton
                            onClick={() => {
                              shareLocation();
                              setIsControlsExpanded(false);
                            }}
                            title="Share Location"
                            icon={<ShareIcon />}
                          />
                          <IconButton
                            onClick={() => {
                              captureScreenshot();
                              setIsControlsExpanded(false);
                            }}
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
              <div className="absolute bg-white rounded-md p-2 top-4 right-16 flex items-center z-50">
                <Loader width={20} height={20} />
                <span className="ml-2 text-sm">Loading global AQI data...</span>
              </div>
            )}

            {/* Layer Modal */}
            <LayerModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              mapStyles={mapStyles}
              mapDetails={mapDetails}
              disabled="Heatmap"
              onMapDetailsSelect={(type) => {
                if (mapConfigRef.current?.setNodeType) {
                  mapConfigRef.current.setNodeType(type);
                }
              }}
              onStyleSelect={(style) => {
                if (mapConfigRef.current?.setMapStyle) {
                  mapConfigRef.current.setMapStyle(style.url);
                }
              }}
            />

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
