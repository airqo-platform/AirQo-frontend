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

    // Local state: LayerModal, node type and map style.
    // If in dark mode use Mapbox’s dark style.
    const [layerModalOpen, setLayerModalOpen] = useState(false);
    const [nodeType, setNodeType] = useState('Emoji');
    const defaultMapStyle = isDarkMode
      ? 'mapbox://styles/mapbox/dark-v10'
      : 'mapbox://styles/mapbox/streets-v11';
    const [currentMapStyle, setCurrentMapStyle] = useState(defaultMapStyle);

    // Loader callbacks
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

    // Initialize map data hook with dark mode flag passed in
    const { mapRef, fetchAndProcessData, clusterUpdate } = useMapData({
      NodeType: nodeType,
      mapStyle: currentMapStyle,
      pollutant,
      setLoading,
      setLoadingOthers,
      isDarkMode,
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

    // When user selects a different node type
    const handleMapDetailsSelect = (detailName) => {
      setNodeType(detailName);
      if (mapRef.current) {
        mapRef.current.nodeType = detailName;
        fetchAndProcessData();
        clusterUpdate();
      }
    };

    // Change map style (reset controls and re-add data layers)
    const handleStyleSelect = (style) => {
      if (style.url !== currentMapStyle) {
        setCurrentMapStyle(style.url);
        if (mapRef.current) {
          controlsAddedRef.current = false;
          const currentCenter = mapRef.current.getCenter();
          const currentZoom = mapRef.current.getZoom();
          mapRef.current.setStyle(style.url);
          mapRef.current.once('style.load', () => {
            mapRef.current.setCenter(currentCenter);
            mapRef.current.setZoom(currentZoom);
            addControlsIfNeeded();
            fetchAndProcessData();
            clusterUpdate();
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

    // Initialize the map instance only once
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
          mapRef.current.nodeType = nodeType;
          mapInstance.on('load', () => {
            try {
              mapInstance.resize();
              addControlsIfNeeded();
              fetchAndProcessData();
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
      isDarkMode,
    ]);

    // Fallback loader timeout
    useEffect(() => {
      const loaderTimer = setTimeout(() => {
        setLoading(false);
      }, 10000);
      return () => clearTimeout(loaderTimer);
    }, []);

    // If a selected node exists, update UI state without reloading the map
    useEffect(() => {
      if (selectedNode) {
        const skeletonTimer = setTimeout(() => {
          dispatch(setMapLoading(false));
          setLoading(false);
        }, 1000);
        return () => clearTimeout(skeletonTimer);
      }
    }, [selectedNode, dispatch]);

    // Use location boundaries hook
    useLocationBoundaries({
      mapRef,
      mapData,
      setLoading,
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

    return (
      <div className="relative w-full h-full">
        <div ref={mapContainerRef} className={customStyle} />
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
