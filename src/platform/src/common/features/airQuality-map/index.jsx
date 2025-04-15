// AirQoMap.js
import React, {
  useEffect,
  useRef,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';
import { useWindowSize } from '@/lib/windowSize';
import {
  setMapLoading,
  clearData,
  setCenter,
  setZoom,
} from '@/lib/store/services/map/MapSlice';
import {
  useMapData,
  CustomZoomControl,
  CustomGeolocateControl,
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
    const { theme, systemTheme } = useTheme();
    const isDarkMode = useMemo(
      () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
      [theme, systemTheme],
    );

    const mapData = useSelector((state) => state.map);
    const selectedNode = useSelector((state) => state.map.selectedNode);
    // Local state used for modal and to store a node configuration.
    const [layerModalOpen, setLayerModalOpen] = useState(false);
    const [nodeType, setNodeType] = useState('Emoji');
    const defaultMapStyle = isDarkMode
      ? 'mapbox://styles/mapbox/dark-v10'
      : 'mapbox://styles/mapbox/streets-v11';
    const [currentMapStyle, setCurrentMapStyle] = useState(defaultMapStyle);

    // Update parent loading handlers.
    const handleMainLoading = useCallback(
      (isLoading) => onLoadingChange && onLoadingChange(isLoading),
      [onLoadingChange],
    );
    const handleWaqLoading = useCallback(
      (isLoading) => onLoadingOthersChange && onLoadingOthersChange(isLoading),
      [onLoadingOthersChange],
    );

    // Parse URL parameters for initial view.
    const urlParams = useMemo(() => {
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

    // Get map data and related functions from our custom hook.
    const {
      mapRef,
      fetchAndProcessData,
      clusterUpdate,
      isWaqLoading,
      updateMapData,
    } = useMapData({
      NodeType: nodeType,
      pollutant,
      setLoading: handleMainLoading,
      setLoadingOthers: handleWaqLoading,
      isDarkMode,
    });

    // Update WAQ loading state.
    useEffect(() => {
      handleWaqLoading(isWaqLoading);
    }, [isWaqLoading, handleWaqLoading]);

    // Map action hooks.
    const refreshMapFn = useRefreshMap(
      onToastMessage,
      mapRef,
      dispatch,
      selectedNode,
    );
    const shareLocationFn = useShareLocation(onToastMessage, mapRef);
    const captureScreenshotFn = useMapScreenshot(mapRef, onToastMessage);

    // Function to add map controls only once. (Avoid re‑adding on location change.)
    const addControlsIfNeeded = useCallback(() => {
      if (mapRef.current && !controlsAddedRef.current && width >= 1024) {
        try {
          (mapRef.current._controls || []).forEach((control) => {
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
    }, [onToastMessage, width]);

    // Define handleMapDetailsSelect to update the node type and then re-run clustering.
    const handleMapDetailsSelect = useCallback(
      (detailName) => {
        setNodeType(detailName);
        if (mapRef.current) {
          mapRef.current.nodeType = detailName;
          clusterUpdate();
        }
      },
      [clusterUpdate],
    );

    // Define handleStyleSelect to update the map style without re-fetching data.
    const handleStyleSelect = useCallback(
      (style) => {
        if (style.url !== currentMapStyle && mapRef.current) {
          setCurrentMapStyle(style.url);
          controlsAddedRef.current = false;
          const currentCenter = mapRef.current.getCenter();
          const currentZoom = mapRef.current.getZoom();
          mapRef.current.setStyle(style.url);
          mapRef.current.once('style.load', () => {
            mapRef.current.setCenter(currentCenter);
            mapRef.current.setZoom(currentZoom);
            addControlsIfNeeded();
            const combined = [
              ...(mapData.mapReadingsData || []),
              ...(mapData.waqData || []),
            ];
            if (combined.length) updateMapData(combined);
          });
        }
      },
      [
        currentMapStyle,
        mapData.mapReadingsData,
        mapData.waqData,
        updateMapData,
        addControlsIfNeeded,
      ],
    );

    useImperativeHandle(ref, () => ({
      refreshMap: refreshMapFn,
      shareLocation: shareLocationFn,
      captureScreenshot: captureScreenshotFn,
      openLayerModal: () => setLayerModalOpen(true),
      closeLayerModal: () => setLayerModalOpen(false),
    }));

    // Clear Redux map state on unmount.
    useEffect(() => () => dispatch(clearData()), [dispatch]);

    // Set initial view using URL parameters.
    useEffect(() => {
      if (urlParams.valid) {
        dispatch(
          setCenter({ latitude: urlParams.lat, longitude: urlParams.lng }),
        );
        dispatch(setZoom(urlParams.zm));
      }
    }, [dispatch, urlParams]);

    // Initialize the map instance only once.
    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return;
      const initializeMap = async () => {
        handleMainLoading(true);
        dispatch(setMapLoading(true));
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
            mapInstance.resize();
            addControlsIfNeeded();
            // Fetch data only once. Subsequent location selections only trigger fly-to.
            fetchAndProcessData();
            handleMainLoading(false);
            dispatch(setMapLoading(false));
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
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          controlsAddedRef.current = false;
        }
      };
    }, [mapboxApiAccessToken, addControlsIfNeeded]);

    // Resize the map on window changes.
    useEffect(() => {
      const handleResize = () => mapRef.current?.resize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // On window resize, update controls (do not re-add on each location change).
    useEffect(() => {
      if (mapRef.current && mapRef.current.loaded()) {
        addControlsIfNeeded();
      }
    }, [width, addControlsIfNeeded]);

    // When Redux center/zoom changes, fly to that view.
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
