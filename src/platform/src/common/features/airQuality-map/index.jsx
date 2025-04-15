import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';
import { useWindowSize } from '@/lib/windowSize';
import {
  setMapLoading,
  reSetMap,
  clearData,
  setCenter,
  setZoom,
} from '@/lib/store/services/map/MapSlice';
import {
  useMapData,
  CustomZoomControl,
  CustomGeolocateControl,
  useLocationBoundaries,
  useRefreshMap,
  useShareLocation,
  useMapScreenshot,
} from './hooks';
import LayerModal from '@/features/airQuality-map/components/LayerModal';
import {
  mapStyles,
  mapDetails,
} from '@/features/airQuality-map/constants/constants';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';
import ErrorBoundary from '@/components/ErrorBoundary';

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
    const controlsAddedRef = useRef(false);

    // Dark mode support using custom hook
    const { theme, systemTheme } = useTheme();
    const isDarkMode = useMemo(
      () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
      [theme, systemTheme],
    );

    // Redux state
    const mapData = useSelector((state) => state.map);
    const selectedNode = useSelector((state) => state.map.selectedNode);

    // Local state
    const [layerModalOpen, setLayerModalOpen] = useState(false);
    const [nodeType, setNodeType] = useState('Emoji');
    const [mapInitialized, setMapInitialized] = useState(false);

    const defaultMapStyle = isDarkMode
      ? 'mapbox://styles/mapbox/dark-v10'
      : 'mapbox://styles/mapbox/streets-v11';
    const [currentMapStyle, setCurrentMapStyle] = useState(defaultMapStyle);

    // Handle loading states
    const handleMainLoading = (isLoading) => {
      if (onLoadingChange) {
        onLoadingChange(isLoading);
      }
    };

    const handleWaqLoading = (isLoading) => {
      if (onLoadingOthersChange) {
        onLoadingOthersChange(isLoading);
      }
    };

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

    // Initialize map data hook
    const { mapRef, fetchAndProcessData, clusterUpdate, isWaqLoading } =
      useMapData({
        NodeType: nodeType,
        pollutant,
        setLoading: handleMainLoading,
        setLoadingOthers: handleWaqLoading,
        isDarkMode,
      });

    // Update WAQ loading indicator when hook reports changes
    useEffect(() => {
      handleWaqLoading(isWaqLoading);
    }, [isWaqLoading]);

    // Utility functions
    const refreshMapFn = useRefreshMap(
      onToastMessage,
      mapRef,
      dispatch,
      selectedNode,
    );
    const shareLocationFn = useShareLocation(onToastMessage, mapRef);
    const captureScreenshotFn = useMapScreenshot(mapRef, onToastMessage);

    // Add map controls
    const addControlsIfNeeded = () => {
      if (
        mapRef.current &&
        !controlsAddedRef.current &&
        !(width < 1024 && selectedNode)
      ) {
        try {
          const existingControls = mapRef.current._controls || [];
          existingControls.forEach((control) => {
            if (
              control instanceof CustomZoomControl ||
              control instanceof CustomGeolocateControl
            ) {
              mapRef.current.removeControl(control);
            }
          });

          mapRef.current.addControl(new CustomZoomControl(), 'bottom-right');
          mapRef.current.addControl(
            new CustomGeolocateControl((msg) => onToastMessage?.(msg)),
            'bottom-right',
          );

          controlsAddedRef.current = true;
        } catch (error) {
          console.error('Error adding controls:', error);
        }
      }
    };

    // Handle node type change
    const handleMapDetailsSelect = (detailName) => {
      setNodeType(detailName);
      if (mapRef.current) {
        mapRef.current.nodeType = detailName;
        clusterUpdate();
      }
    };

    // Handle map style change
    const handleStyleSelect = (style) => {
      if (style.url !== currentMapStyle) {
        setCurrentMapStyle(style.url);

        if (mapRef.current) {
          controlsAddedRef.current = false;

          // Save current view state
          const currentCenter = mapRef.current.getCenter();
          const currentZoom = mapRef.current.getZoom();

          // Apply new style
          mapRef.current.setStyle(style.url);

          // Restore view and data after style loads
          mapRef.current.once('style.load', () => {
            mapRef.current.setCenter(currentCenter);
            mapRef.current.setZoom(currentZoom);
            addControlsIfNeeded();

            if (mapInitialized) {
              // Reload data to apply to new style
              fetchAndProcessData();
            }
          });
        }
      }
    };

    // Expose functions to parent via ref
    useImperativeHandle(ref, () => ({
      refreshMap: refreshMapFn,
      shareLocation: shareLocationFn,
      captureScreenshot: captureScreenshotFn,
      openLayerModal: () => setLayerModalOpen(true),
      closeLayerModal: () => setLayerModalOpen(false),
    }));

    // Clear Redux data on unmount
    useEffect(() => {
      return () => {
        dispatch(clearData());
      };
    }, [dispatch]);

    // Handle URL parameter changes
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

    // Initialize the map instance
    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const initializeMap = async () => {
        handleMainLoading(true);
        dispatch(setMapLoading(true));

        try {
          mapboxgl.accessToken = mapboxApiAccessToken;

          // Set initial view from URL params or Redux state
          const initialCenter = urlParams.valid
            ? [urlParams.lng, urlParams.lat]
            : [mapData.center.longitude, mapData.center.latitude];

          const initialZoom = urlParams.valid ? urlParams.zm : mapData.zoom;

          // Create map instance
          const mapInstance = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: currentMapStyle,
            center: initialCenter,
            zoom: initialZoom,
            preserveDrawingBuffer: true,
          });

          mapRef.current = mapInstance;
          mapRef.current.nodeType = nodeType;

          // Set up event handlers
          mapInstance.on('load', () => {
            try {
              console.log('Map loaded, initializing data...');
              mapInstance.resize();
              addControlsIfNeeded();

              // Fetch data after map is ready
              fetchAndProcessData();
              setMapInitialized(true);
              handleMainLoading(false);
              dispatch(setMapLoading(false));
            } catch (err) {
              console.error('Map load error:', err);
              handleMainLoading(false);
              dispatch(setMapLoading(false));

              onToastMessage?.({
                message: 'Error loading map data. Please try again.',
                type: 'error',
                bgColor: 'bg-red-500',
              });
            }
          });

          mapInstance.on('error', (e) => {
            console.error('Mapbox error:', e.error);
            handleMainLoading(false);
            dispatch(setMapLoading(false));
          });
        } catch (error) {
          console.error('Map initialization error:', error);
          onToastMessage?.({
            message: 'Failed to initialize the map.',
            type: 'error',
            bgColor: 'bg-red-500',
          });
          handleMainLoading(false);
          dispatch(setMapLoading(false));
        }
      };

      initializeMap();

      // Cleanup function
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          controlsAddedRef.current = false;
          setMapInitialized(false);
        }
      };
    }, [
      mapboxApiAccessToken,
      mapData.center,
      mapData.zoom,
      currentMapStyle,
      urlParams,
      dispatch,
      nodeType,
      isDarkMode,
    ]);

    // Fallback timeout to ensure loader doesn't get stuck
    useEffect(() => {
      const loaderTimer = setTimeout(() => {
        handleMainLoading(false);
        dispatch(setMapLoading(false));
      }, 15000); // 15 seconds timeout

      return () => clearTimeout(loaderTimer);
    }, [dispatch]);

    // If a selected node exists, finish loading
    useEffect(() => {
      if (selectedNode) {
        const skeletonTimer = setTimeout(() => {
          dispatch(setMapLoading(false));
          handleMainLoading(false);
        }, 1000);
        return () => clearTimeout(skeletonTimer);
      }
    }, [selectedNode, dispatch]);

    // Use location boundaries hook
    useLocationBoundaries({
      mapRef,
      mapData,
      setLoading: handleMainLoading,
    });

    // Fly to a new center/zoom on Redux state change
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

    // Handle window resize events
    useEffect(() => {
      const handleResize = () => {
        try {
          mapRef.current?.resize();
        } catch (error) {
          console.error('Resize error:', error);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Re-add controls when screen size or node selection changes
    useEffect(() => {
      if (mapRef.current && mapRef.current.loaded()) {
        controlsAddedRef.current = false;
        addControlsIfNeeded();
      }
    }, [width, selectedNode]);

    // Create a data status indicator component
    const DataLoadingIndicator = () => {
      if (!isWaqLoading) return null;

      return (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-md z-10 text-sm flex items-center">
          <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-blue-700 dark:text-blue-300">
            Loading additional city data...
          </span>
        </div>
      );
    };

    return (
      <ErrorBoundary name="AirQoMap" feature="AirQuality Map">
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className={customStyle} />

          {/* WAQ Data loading indicator */}
          <DataLoadingIndicator />

          <LayerModal
            isOpen={layerModalOpen}
            onClose={() => setLayerModalOpen(false)}
            mapStyles={mapStyles}
            mapDetails={mapDetails}
            disabled="Heatmap"
            onMapDetailsSelect={handleMapDetailsSelect}
            onStyleSelect={handleStyleSelect}
          />
        </div>
      </ErrorBoundary>
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
