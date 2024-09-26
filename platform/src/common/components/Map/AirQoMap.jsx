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
import { AirQualityLegend } from './components/Legend';
import { mapStyles, mapDetails } from './data/constants';
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
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

  // Parse and Validate URL Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const latParam = parseFloat(urlParams.get('lat'));
  const lngParam = parseFloat(urlParams.get('lng'));
  const zmParam = parseFloat(urlParams.get('zm'));
  const hasValidParams =
    !isNaN(latParam) && !isNaN(lngParam) && !isNaN(zmParam);

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

  // Clear Data on Unmount
  useEffect(() => {
    return () => {
      dispatch(clearData());
    };
  }, [dispatch]);

  // Set Center and Zoom Based on URL Params or Reset Map
  useEffect(() => {
    if (hasValidParams) {
      dispatch(setCenter({ latitude: latParam, longitude: lngParam }));
      dispatch(setZoom(zmParam));
    } else {
      dispatch(reSetMap());
    }
  }, [hasValidParams, latParam, lngParam, zmParam, dispatch]);

  // Initialize Map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        mapboxgl.accessToken = mapboxApiAccessToken;
        const initialCenter = hasValidParams
          ? [lngParam, latParam]
          : [mapData.center.longitude, mapData.center.latitude];
        const initialZoom = hasValidParams ? zmParam : mapData.zoom;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: initialCenter,
          zoom: initialZoom,
        });

        mapRef.current = map;

        // Add map controls once map is loaded
        map.on('load', () => {
          map.resize();

          // Add controls if the width is above 1024 or no node is selected
          if (!(width < 1024 && selectedNode)) {
            const zoomControl = new CustomZoomControl(dispatch);
            const geolocateControl = new CustomGeolocateControl(
              setToastMessage,
            );
            map.addControl(zoomControl, 'bottom-right');
            map.addControl(geolocateControl, 'bottom-right');
          }

          // Fetch and process data once the map is loaded
          fetchAndProcessData();

          // Stop initial loading
          setLoading(false);
          dispatch(setMapLoading(false));
        });

        // Handle map errors
        map.on('error', (e) => {
          console.error('Mapbox error:', e.error);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing the Map: ', error);
        setToastMessage({
          message: 'Failed to initialize the map.',
          type: 'error',
          bgColor: 'bg-red-500',
        });
        setLoading(false);
      }
    };

    // Initialize the map only once
    if (!mapRef.current) {
      initializeMap();
    } else {
      // If map is already initialized, update its style and other properties
      mapRef.current.setStyle(mapStyle);
      const newCenter = hasValidParams
        ? [lngParam, latParam]
        : [mapData.center.longitude, mapData.center.latitude];
      const newZoom = hasValidParams ? zmParam : mapData.zoom;
      mapRef.current.flyTo({
        center: newCenter,
        zoom: newZoom,
        essential: true,
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapStyle, NodeType, mapboxApiAccessToken, width]);

  // Manage Loading State Timeout
  useEffect(() => {
    if (loading) {
      const loaderTimer = setTimeout(() => {
        setLoading(false);
      }, 10000);

      return () => clearTimeout(loaderTimer);
    }
  }, [loading]);

  // Handle Node Selection Loading
  useEffect(() => {
    if (selectedNode) {
      const skeletonTimer = setTimeout(() => {
        dispatch(setMapLoading(false));
        setLoading(false);
      }, 2000);

      return () => clearTimeout(skeletonTimer);
    }
  }, [dispatch, selectedNode]);

  // Handle Location Boundaries
  useLocationBoundaries({
    mapRef,
    mapData,
    setLoading,
  });

  // Fly to New Center and Zoom When Map Data Changes
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

  // Update Clusters When Data Changes
  useEffect(() => {
    if (mapRef.current) {
      clusterUpdate();
    }
  }, [clusterUpdate]);

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedNode]);

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
        <div className="absolute top-4 right-0 z-40 flex flex-col gap-4">
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
  customStyle: PropTypes.string, // Assuming customStyle is a string of class names
  mapboxApiAccessToken: PropTypes.string.isRequired,
  pollutant: PropTypes.string.isRequired,
};

export default React.memo(AirQoMap);
