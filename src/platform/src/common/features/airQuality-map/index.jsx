import React, {
  useEffect,
  useRef,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react';
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
import PropTypes from 'prop-types';
import {
  useMapData,
  CustomZoomControl,
  CustomGeolocateControl,
  useLocationBoundaries,
  useRefreshMap,
  useShareLocation,
  useMapScreenshot,
} from './hooks';

const AirQoMap = forwardRef(
  (
    {
      customStyle,
      mapboxApiAccessToken,
      pollutant,
      onToastMessage,
      onLoadingChange,
      onLoadingOthersChange,
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    const mapContainerRef = useRef(null);
    const { width } = useWindowSize();

    // Redux state
    const mapData = useSelector((state) => state.map);
    const selectedNode = useSelector((state) => state.map.selectedNode);

    // Parse URL parameters
    const urlParams = useMemo(() => {
      if (typeof window === 'undefined') return { valid: false };

      try {
        const params = new URLSearchParams(window.location.search);
        const lat = parseFloat(params.get('lat'));
        const lng = parseFloat(params.get('lng'));
        const zm = parseFloat(params.get('zm'));

        return {
          lat,
          lng,
          zm,
          valid: !isNaN(lat) && !isNaN(lng) && !isNaN(zm),
        };
      } catch (error) {
        console.error('Error parsing URL parameters:', error);
        return { valid: false };
      }
    }, []);

    // Helper to update loading states
    const setLoading = (value) => onLoadingChange?.(value);
    const setLoadingOthers = (value) => onLoadingOthersChange?.(value);

    // Custom hook for map initialization and data handling
    const { mapRef, fetchAndProcessData, clusterUpdate } = useMapData({
      NodeType: 'Emoji',
      mapStyle: 'mapbox://styles/mapbox/streets-v11',
      pollutant,
      setLoading,
      setLoadingOthers,
    });

    // Initialize refresh, share, and screenshot hooks
    const refreshMapFn = useRefreshMap(
      onToastMessage,
      mapRef,
      dispatch,
      selectedNode,
    );
    const shareLocationFn = useShareLocation(onToastMessage, mapRef);
    const captureScreenshotFn = useMapScreenshot(mapRef, onToastMessage);

    // Expose imperative methods so parent components can trigger these functionalities
    useImperativeHandle(ref, () => ({
      refreshMap: () => {
        if (mapRef.current) {
          refreshMapFn();
        }
      },
      shareLocation: () => {
        if (mapRef.current) {
          shareLocationFn();
        }
      },
      captureScreenshot: () => {
        if (mapRef.current) {
          captureScreenshotFn();
        }
      },
    }));

    // Clear data on unmount
    useEffect(() => {
      return () => {
        dispatch(clearData());
      };
    }, [dispatch]);

    // Set center and zoom based on URL parameters or reset map
    useEffect(() => {
      if (urlParams.valid) {
        dispatch(
          setCenter({ latitude: urlParams.lat, longitude: urlParams.lng }),
        );
        dispatch(setZoom(urlParams.zm));
      } else {
        dispatch(reSetMap());
      }
    }, [dispatch, urlParams]);

    // Initialize the map
    useEffect(() => {
      if (mapContainerRef.current && !mapRef.current) {
        const initializeMap = async () => {
          try {
            mapboxgl.accessToken = mapboxApiAccessToken;

            const initialCenter = urlParams.valid
              ? [urlParams.lng, urlParams.lat]
              : [mapData.center.longitude, mapData.center.latitude];

            const initialZoom = urlParams.valid ? urlParams.zm : mapData.zoom;

            const map = new mapboxgl.Map({
              container: mapContainerRef.current,
              style: 'mapbox://styles/mapbox/streets-v11',
              center: initialCenter,
              zoom: initialZoom,
              preserveDrawingBuffer: true,
            });

            mapRef.current = map;

            map.on('load', () => {
              try {
                map.resize();

                // Add controls if space available
                if (!(width < 1024 && selectedNode)) {
                  map.addControl(new CustomZoomControl(), 'bottom-right');
                  map.addControl(
                    new CustomGeolocateControl((msg) => onToastMessage?.(msg)),
                    'bottom-right',
                  );
                }

                // Fetch data after map loads
                fetchAndProcessData();
                setLoading(false);
                dispatch(setMapLoading(false));
              } catch (err) {
                console.error('Map load error:', err);
              }
            });

            map.on('error', (e) => {
              console.error('Mapbox error:', e.error);
            });
          } catch (error) {
            console.error('Map initialization error:', error);
            onToastMessage?.({
              message: 'Failed to initialize the map.',
              type: 'error',
              bgColor: 'bg-red-500',
            });
            setLoading(false);
          }
        };

        initializeMap();
      }

      // Cleanup map instance on unmount
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }, [
      mapboxApiAccessToken,
      width,
      urlParams,
      selectedNode,
      mapData.center,
      mapData.zoom,
    ]);

    // Set loading timeout
    useEffect(() => {
      const loaderTimer = setTimeout(() => {
        if (!mapRef.current || mapRef.current.isStyleLoaded()) {
          setLoading(false);
        }
      }, 10000);
      return () => clearTimeout(loaderTimer);
    }, []);

    // Node selection loading handling
    useEffect(() => {
      if (selectedNode) {
        const skeletonTimer = setTimeout(() => {
          dispatch(setMapLoading(false));
          setLoading(false);
        }, 2000);
        return () => clearTimeout(skeletonTimer);
      }
    }, [dispatch, selectedNode]);

    // Location boundaries
    useLocationBoundaries({
      mapRef,
      mapData,
      setLoading,
    });

    // Fly to new center when map data changes
    useEffect(() => {
      if (mapRef.current && mapData.center) {
        const { latitude, longitude } = mapData.center;
        if (latitude && longitude) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: mapData.zoom,
            essential: true,
          });
        }
      }
    }, [mapData.center, mapData.zoom]);

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

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        try {
          if (mapRef.current && mapRef.current.isStyleLoaded()) {
            mapRef.current.resize();
          }
        } catch (error) {
          console.error('Resize error:', error);
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => window.removeEventListener('resize', handleResize);
    }, [selectedNode]);

    return (
      <div className="relative w-full h-full">
        <div ref={mapContainerRef} className={customStyle} />
      </div>
    );
  },
);

AirQoMap.displayName = 'AirQoMap';

AirQoMap.propTypes = {
  customStyle: PropTypes.string,
  mapboxApiAccessToken: PropTypes.string.isRequired,
  pollutant: PropTypes.string.isRequired,
  onToastMessage: PropTypes.func,
  onLoadingChange: PropTypes.func,
  onLoadingOthersChange: PropTypes.func,
};

export default React.memo(AirQoMap);
