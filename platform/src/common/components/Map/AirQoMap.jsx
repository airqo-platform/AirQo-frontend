// AirQoMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { useWindowSize } from '@/lib/windowSize';
import {
  setMapLoading,
  reSetMap,
  clearData,
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
} from './functions';

const AirQoMap = ({ customStyle, mapboxApiAccessToken, pollutant }) => {
  const dispatch = useDispatch();
  const mapContainerRef = useRef(null);
  const { width } = useWindowSize();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOthers, setLoadingOthers] = useState(false);
  const urls = new URL(window.location.href);
  const urlParams = new URLSearchParams(urls.search);
  const mapData = useSelector((state) => state.map);
  const selectedNode = useSelector((state) => state.map.selectedNode);
  const [toastMessage, setToastMessage] = useState({
    message: '',
    type: '',
    bgColor: '',
  });

  // Default node type is Emoji and default map style is streets
  const [NodeType, setNodeType] = useState('Emoji');
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/streets-v11',
  );

  const lat = urlParams.get('lat');
  const lng = urlParams.get('lng');
  const zm = urlParams.get('zm');

  // Clear data on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearData());
    };
  }, [dispatch]);

  // Stop loaders after 10 seconds
  useEffect(() => {
    if (loading) {
      const loaderTimer = setTimeout(() => {
        setLoading(false);
      }, 10000);
      return () => clearTimeout(loaderTimer);
    }
  }, [loading]);

  // Stop map loading skeleton after 2 seconds when a node is selected
  useEffect(() => {
    if (selectedNode) {
      const skeletonTimer = setTimeout(() => {
        dispatch(setMapLoading(false));
      }, 2000);
      return () => clearTimeout(skeletonTimer);
    }
  }, [dispatch, selectedNode]);

  // Clear map state if lat, lng, or zm params are missing
  useEffect(() => {
    if (!lat && !lng && !zm) {
      dispatch(reSetMap());
    }
  }, [lat, lng, zm, dispatch]);

  // Custom hook to fetch data and manage map data
  const { mapRef, fetchAndProcessData, clusterUpdate } = useMapData({
    NodeType,
    selectedNode,
    mapStyle,
    pollutant,
    refresh: null, // Pass any refresh dependencies if needed
    setLoading,
    setLoadingOthers,
  });

  // Use custom hooks for refreshing map and sharing location
  const refreshMap = useRefreshMap(
    setToastMessage,
    mapRef,
    dispatch,
    selectedNode,
  );
  const shareLocation = useShareLocation(setToastMessage, mapRef);

  // Initialize the map and add controls
  useEffect(() => {
    const initializeMap = async () => {
      try {
        mapboxgl.accessToken = mapboxApiAccessToken;
        const initialCenter = [
          lng ? parseFloat(lng) : mapData.center.longitude,
          lat ? parseFloat(lat) : mapData.center.latitude,
        ];
        const initialZoom = zm ? parseFloat(zm) : mapData.zoom;

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
        });
      } catch (error) {
        console.error('Error initializing the Map: ', error);
      }
    };

    initializeMap();

    // Cleanup map instance on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [
    mapStyle,
    NodeType,
    mapboxApiAccessToken,
    width,
    selectedNode,
    fetchAndProcessData,
    lat,
    lng,
    zm,
    mapData.center.latitude,
    mapData.center.longitude,
    mapData.zoom,
  ]);

  // Fly to new center and zoom when mapData changes
  useEffect(() => {
    if (mapRef.current && mapData.center && mapData.zoom) {
      const { latitude, longitude } = mapData.center;
      if (latitude && longitude) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: mapData.zoom,
          essential: true, // Ensures the transition happens only when necessary
        });
      }
    }
  }, [mapData.center, mapData.zoom]);

  // Update clusters whenever data changes
  useEffect(() => {
    if (mapRef.current) {
      clusterUpdate();
    }
  }, [clusterUpdate]);

  /**
   * Fetch location boundaries
   */
  useEffect(() => {
    const fetchLocationBoundaries = async () => {
      setLoading(true);
      const map = mapRef.current;

      if (!map) return;

      // Remove existing boundaries if any
      if (map.getLayer('location-boundaries')) {
        map.removeLayer('location-boundaries');
      }

      if (map.getSource('location-boundaries')) {
        map.removeSource('location-boundaries');
      }

      let queryString = mapData.location.country;
      if (mapData.location.city) {
        queryString = `${mapData.location.city}, ${queryString}`;
      }

      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: queryString,
              polygon_geojson: 1,
              format: 'json',
            },
          },
        );

        const data = response.data;

        if (data && data.length > 0) {
          const boundaryData = data[0].geojson;

          map.addSource('location-boundaries', {
            type: 'geojson',
            data: boundaryData,
          });

          map.addLayer({
            id: 'location-boundaries',
            type: 'fill',
            source: 'location-boundaries',
            paint: {
              'fill-color': '#0000FF',
              'fill-opacity': 0.2,
              'fill-outline-color': '#0000FF',
            },
          });

          const { lat: boundaryLat, lon: boundaryLon } = data[0];
          map.flyTo({
            center: [parseFloat(boundaryLon), parseFloat(boundaryLat)],
            zoom: mapData.location.city && mapData.location.country ? 10 : 5,
          });

          map.on('zoomend', function () {
            const zoom = map.getZoom();
            const opacity = zoom > 10 ? 0 : 0.2;
            map.setPaintProperty(
              'location-boundaries',
              'fill-opacity',
              opacity,
            );
          });
        }
      } catch (error) {
        console.error('Error fetching location boundaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationBoundaries();
  }, [mapData.location]);

  /**
   * Resize the map on window resize or when a node is selected/deselected
   */
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Trigger resize when selectedNode changes
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
          clearData={() => setToastMessage({ message: '', type: '' })}
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
