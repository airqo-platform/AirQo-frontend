// AirQoMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import { useWindowSize } from '@/lib/windowSize';
import {
  setMapLoading,
  reSetMap,
  clearData,
  setCenter,
  setZoom,
} from '@/lib/store/services/map/MapSlice';
import LayerModal from './components/LayerModal';
import Loader from '@/components/Spinner';
import Toast from '../Toast';
import AirQualityLegend from './components/Legend';
import { mapStyles, mapDetails } from './data/constants';
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import CameraIcon from '@/icons/map/cameraIcon';
import DotsVerticalIcon from '@/icons/map/dotsVerticalIcon';
import PropTypes from 'prop-types';
import {
  useMapData,
  useRefreshMap,
  useShareLocation,
  CustomZoomControl,
  CustomGeolocateControl,
  IconButton,
  LoadingOverlay,
  useLocationBoundaries,
  useMapScreenshot,
} from './functions';

const AirQoMap = ({ customStyle, mapboxApiAccessToken, pollutant }) => {
  const dispatch = useDispatch();
  const mapContainerRef = useRef(null);
  const { width } = useWindowSize();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOthers, setLoadingOthers] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    message: '',
    type: '',
    bgColor: '',
  });
  const [NodeType, setNodeType] = useState('Emoji');
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/streets-v11',
  );
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);

  // Parse and validate URL parameters
  let latParam, lngParam, zmParam;
  let hasValidParams = false;
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      latParam = parseFloat(urlParams.get('lat'));
      lngParam = parseFloat(urlParams.get('lng'));
      zmParam = parseFloat(urlParams.get('zm'));
      hasValidParams = !isNaN(latParam) && !isNaN(lngParam) && !isNaN(zmParam);
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      hasValidParams = false;
    }
  }

  // Redux Selectors
  const mapData = useSelector((state) => state.map);
  const selectedNode = useSelector((state) => state.map.selectedNode);

  // Custom Hooks
  const { mapRef, fetchAndProcessData, clusterUpdate } = useMapData({
    NodeType,
    mapStyle,
    pollutant,
    setLoading,
    setLoadingOthers,
  });
  const refreshMap = useRefreshMap(
    setToastMessage,
    mapRef,
    dispatch,
    selectedNode,
  );
  const shareLocation = useShareLocation(setToastMessage, mapRef);
  const captureScreenshot = useMapScreenshot(mapRef, setToastMessage);

  // Clear data on unmount
  useEffect(() => {
    return () => {
      dispatch(clearData());
    };
  }, [dispatch]);

  // Set center and zoom based on URL parameters or reset map
  useEffect(() => {
    if (hasValidParams) {
      dispatch(setCenter({ latitude: latParam, longitude: lngParam }));
      dispatch(setZoom(zmParam));
    } else {
      dispatch(reSetMap());
    }
  }, [hasValidParams, latParam, lngParam, zmParam, dispatch]);

  // Initialize the map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        mapboxgl.accessToken = mapboxApiAccessToken;
        const initialCenter = hasValidParams
          ? [lngParam, latParam]
          : [mapData.center.longitude, mapData.center.latitude];
        const initialZoom = hasValidParams ? zmParam : mapData.zoom;

        if (!mapContainerRef.current) return;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: initialCenter,
          zoom: initialZoom,
          preserveDrawingBuffer: true,
        });

        mapRef.current = map;

        map.on('load', () => {
          try {
            map.resize();

            // Conditionally add controls
            if (!(width < 1024 && selectedNode)) {
              map.addControl(new CustomZoomControl(), 'bottom-right');
              map.addControl(
                new CustomGeolocateControl(setToastMessage),
                'bottom-right',
              );
            }

            // Fetch data after the map is loaded
            fetchAndProcessData();
            setLoading(false);
            dispatch(setMapLoading(false));
          } catch (err) {
            console.error('Error during map load event:', err);
          }
        });

        map.on('error', (e) => {
          console.error('Mapbox error:', e.error);
        });
      } catch (error) {
        console.error('Error initializing the map:', error);
        setToastMessage({
          message: 'Failed to initialize the map.',
          type: 'error',
          bgColor: 'bg-red-500',
        });
        setLoading(false);
      }
    };

    if (!mapRef.current) {
      initializeMap();
    } else {
      try {
        mapRef.current.setStyle(mapStyle);
        mapRef.current.flyTo({
          center: hasValidParams
            ? [lngParam, latParam]
            : [mapData.center.longitude, mapData.center.latitude],
          zoom: hasValidParams ? zmParam : mapData.zoom,
          essential: true,
        });
      } catch (error) {
        console.error('Error updating map style:', error);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapStyle, NodeType, mapboxApiAccessToken, width]);

  // Manage loading state timeout
  useEffect(() => {
    if (loading) {
      const loaderTimer = setTimeout(() => {
        if (!mapRef.current || mapRef.current.isStyleLoaded()) {
          setLoading(false);
        }
      }, 10000);
      return () => clearTimeout(loaderTimer);
    }
  }, [loading]);

  // Handle node selection loading
  useEffect(() => {
    if (selectedNode) {
      const skeletonTimer = setTimeout(() => {
        dispatch(setMapLoading(false));
        setLoading(false);
      }, 2000);
      return () => clearTimeout(skeletonTimer);
    }
  }, [dispatch, selectedNode]);

  // Handle location boundaries with improved error handling in the hook
  useLocationBoundaries({
    mapRef,
    mapData,
    setLoading,
  });

  // Fly to new center and zoom when map data changes
  useEffect(() => {
    if (mapRef.current && mapData.center && mapData.zoom) {
      const { latitude, longitude } = mapData.center;
      if (latitude && longitude) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: mapData.zoom,
          essential: true,
        });
      }
    }
  }, [
    mapData.center,
    mapData.zoom,
    hasValidParams,
    latParam,
    lngParam,
    zmParam,
  ]);

  // Update clusters when data changes
  useEffect(() => {
    if (mapRef.current) {
      try {
        clusterUpdate();
      } catch (error) {
        console.error('Cluster update failed:', error);
      }
    }
  }, [clusterUpdate]);

  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      try {
        if (mapRef.current && mapRef.current.isStyleLoaded()) {
          mapRef.current.resize();
        }
      } catch (error) {
        console.error('Error handling window resize:', error);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [selectedNode]);

  // Add this useEffect
  useEffect(() => {
    function handleClickOutside(event) {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setIsControlsExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add ref to the controls container
  const controlsRef = useRef(null);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapContainerRef} className={customStyle} />

      {/* Air Quality Legend */}
      {(width >= 1024 || !selectedNode) && (
        <div className="relative left-4 z-50 md:block">
          <div className="absolute bottom-2 z-[900]">
            <AirQualityLegend pollutant={pollutant} />
          </div>
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
                  onClick={() => setIsControlsExpanded(!isControlsExpanded)}
                  title="Map Controls"
                  icon={<DotsVerticalIcon />}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <LoadingOverlay size={70}>
          <Loader width={32} height={32} />
        </LoadingOverlay>
      )}

      {/* Layer Modal */}
      <LayerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mapStyles={mapStyles}
        mapDetails={mapDetails}
        disabled="Heatmap"
        onMapDetailsSelect={setNodeType}
        onStyleSelect={(style) => setMapStyle(style.url)}
      />

      {/* Loading Other Data */}
      {loadingOthers && (
        <div className="absolute bg-white rounded-md p-2 top-4 right-16 flex items-center z-50">
          <Loader width={20} height={20} />
          <span className="ml-2 text-sm">Loading AQI data...</span>
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
  );
};

AirQoMap.propTypes = {
  customStyle: PropTypes.string,
  mapboxApiAccessToken: PropTypes.string.isRequired,
  pollutant: PropTypes.string.isRequired,
};

export default React.memo(AirQoMap);
