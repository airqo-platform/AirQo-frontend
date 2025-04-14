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
import LayerModal from '@/features/airQuality-map/components/LayerModal';
import {
  mapStyles,
  mapDetails,
} from '@/features/airQuality-map/constants/constants';

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

    // Redux state
    const mapData = useSelector((state) => state.map);
    const selectedNode = useSelector((state) => state.map.selectedNode);

    // Internal states for the LayerModal, node type, and map style
    const [layerModalOpen, setLayerModalOpen] = useState(false);
    const [nodeType, setNodeType] = useState('Emoji');
    const [currentMapStyle, setCurrentMapStyle] = useState(
      'mapbox://styles/mapbox/streets-v11',
    );

    // Loader state management
    const setLoading = (val) => onLoadingChange?.(val);
    const setLoadingOthers = (val) => onLoadingOthersChange?.(val);

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

    // Custom hook for data operations
    const { mapRef, fetchAndProcessData, clusterUpdate } = useMapData({
      NodeType: nodeType,
      mapStyle: currentMapStyle,
      pollutant,
      setLoading,
      setLoadingOthers,
    });

    // Hook-based utility functions
    const refreshMapFn = useRefreshMap(
      onToastMessage,
      mapRef,
      dispatch,
      selectedNode,
    );
    const shareLocationFn = useShareLocation(onToastMessage, mapRef);
    const captureScreenshotFn = useMapScreenshot(mapRef, onToastMessage);

    // Centralized function to add controls once
    const addControlsIfNeeded = () => {
      // Only add controls if they haven't been added yet and map is ready
      if (
        mapRef.current &&
        !controlsAddedRef.current &&
        !(width < 1024 && selectedNode)
      ) {
        try {
          // First check if controls already exist and remove them
          const existingControls = mapRef.current._controls || [];
          existingControls.forEach((control) => {
            if (
              control instanceof CustomZoomControl ||
              control instanceof CustomGeolocateControl
            ) {
              mapRef.current.removeControl(control);
            }
          });

          // Add our controls
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

    // Change node type (map details) for markers
    const handleMapDetailsSelect = (detailName) => {
      setNodeType(detailName);
      if (mapRef.current) {
        // Store the type in a custom property on the map
        mapRef.current.nodeType = detailName;

        // Don't reload the entire map, just refresh markers
        fetchAndProcessData();
        clusterUpdate();
      }
    };

    // Change map style without duplicating controls
    const handleStyleSelect = (style) => {
      // Only change if it's actually different
      if (style.url !== currentMapStyle) {
        setCurrentMapStyle(style.url);

        if (mapRef.current) {
          // Reset controls flag
          controlsAddedRef.current = false;

          // Store current state
          const currentCenter = mapRef.current.getCenter();
          const currentZoom = mapRef.current.getZoom();

          // Apply new style
          mapRef.current.setStyle(style.url);

          // After style loads, restore markers and controls
          mapRef.current.once('style.load', () => {
            // Restore position
            mapRef.current.setCenter(currentCenter);
            mapRef.current.setZoom(currentZoom);

            // Re-add controls
            addControlsIfNeeded();

            // Re-add data layers
            fetchAndProcessData();
            clusterUpdate();
          });
        }
      }
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      refreshMap: refreshMapFn,
      shareLocation: shareLocationFn,
      captureScreenshot: captureScreenshotFn,
      openLayerModal: () => setLayerModalOpen(true),
      closeLayerModal: () => setLayerModalOpen(false),
    }));

    // Cleanup: clear Redux data on unmount
    useEffect(() => {
      return () => {
        dispatch(clearData());
      };
    }, [dispatch]);

    // Handle URL parameters
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

    // Initialize map only once
    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const initializeMap = async () => {
        try {
          mapboxgl.accessToken = mapboxApiAccessToken;
          const initialCenter = urlParams.valid
            ? [urlParams.lng, urlParams.lat]
            : [mapData.center.longitude, mapData.center.latitude];
          const initialZoom = urlParams.valid ? urlParams.zm : mapData.zoom;

          const mapInstance = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: currentMapStyle,
            center: initialCenter,
            zoom: initialZoom,
            preserveDrawingBuffer: true,
          });

          mapRef.current = mapInstance;

          // Store nodeType on the map instance for persistence
          mapRef.current.nodeType = nodeType;

          mapInstance.on('load', () => {
            try {
              mapInstance.resize();

              // Add controls on initial load
              addControlsIfNeeded();

              // Fetch data once map loads
              fetchAndProcessData();

              // Stop main loader
              setLoading(false);
              dispatch(setMapLoading(false));
            } catch (err) {
              console.error('Map load error:', err);
              setLoading(false);
            }
          });

          mapInstance.on('error', (e) => {
            console.error('Mapbox error:', e.error);
            setLoading(false);
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

      // Cleanup map instance on unmount
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          controlsAddedRef.current = false;
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
    ]);

    // Loader timeout fallback
    useEffect(() => {
      const loaderTimer = setTimeout(() => {
        setLoading(false);
      }, 10000);
      return () => clearTimeout(loaderTimer);
    }, []);

    // Handle selected node state
    useEffect(() => {
      if (selectedNode) {
        // Don't reload the map for a selected node, just update the UI state
        const skeletonTimer = setTimeout(() => {
          dispatch(setMapLoading(false));
          setLoading(false);
        }, 1000);
        return () => clearTimeout(skeletonTimer);
      }
    }, [selectedNode, dispatch]);

    // Use the location boundaries hook
    useLocationBoundaries({
      mapRef,
      mapData,
      setLoading,
    });

    // Fly to new center/zoom when Redux changes (without reloading)
    useEffect(() => {
      if (mapRef.current && mapData.center) {
        const { latitude, longitude } = mapData.center;
        if (latitude && longitude) {
          // Use flyTo for smooth transitions
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: mapData.zoom,
            essential: true,
          });
        }
      }
    }, [mapData.center, mapData.zoom]);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        try {
          if (mapRef.current && mapRef.current.resize) {
            mapRef.current.resize();
          }
        } catch (error) {
          console.error('Resize error:', error);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update controls based on screen size and node selection
    useEffect(() => {
      if (mapRef.current && mapRef.current.loaded()) {
        // Reset controls flag when screen size or selection changes
        controlsAddedRef.current = false;
        addControlsIfNeeded();
      }
    }, [width, selectedNode]);

    return (
      <div className="relative w-full h-full">
        <div ref={mapContainerRef} className={customStyle} />

        {/* LayerModal for selecting map details and styles */}
        <LayerModal
          isOpen={layerModalOpen}
          onClose={() => setLayerModalOpen(false)}
          mapStyles={mapStyles}
          mapDetails={mapDetails}
          disabled="Heatmap" // You could make this dynamic if needed
          onMapDetailsSelect={handleMapDetailsSelect}
          onStyleSelect={handleStyleSelect}
        />
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
