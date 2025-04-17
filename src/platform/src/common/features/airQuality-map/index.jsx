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
  setCenter,
  setZoom,
  clearData,
} from '@/lib/store/services/map/MapSlice';
import {
  useMapData,
  CustomZoomControl,
  CustomGeolocateControl,
  GlobeControl,
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
import LoadingOverlay from './components/LoadingOverlay';

const AirQoMap = forwardRef(
  (
    {
      customStyle = 'w-full h-full',
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
    const timeoutRef = useRef(null);
    const mapInitializedRef = useRef(false);

    // Redux state
    const mapData = useSelector((state) => state.map);
    const { zoom: reduxZoom, center: reduxCenter } = mapData;
    const selectedNode = mapData.selectedNode;

    // Local state
    const [layerModalOpen, setLayerModalOpen] = useState(false);
    const [nodeType, setNodeType] = useState('Emoji');
    const [showOverlay, setShowOverlay] = useState(true);
    const [styleUrl, setStyleUrl] = useState('');

    const { theme, systemTheme } = useTheme();
    const isDarkMode = useMemo(
      () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
      [theme, systemTheme],
    );

    // Get default style URL based on theme
    const defaultStyleUrl = useMemo(() => {
      if (!Array.isArray(mapStyles)) {
        const light = mapStyles.light?.url;
        const dark = mapStyles.dark?.url;
        const fallback = Object.values(mapStyles)[0]?.url;
        return isDarkMode
          ? dark || light || fallback
          : light || dark || fallback;
      }
      const key = isDarkMode ? 'dark' : 'light';
      const found = mapStyles.find((s) => s.id === key || s.key === key);
      return found?.url || mapStyles[0]?.url;
    }, [isDarkMode]);

    // Set style URL only once on initial render or when isDarkMode changes
    useEffect(() => {
      if (!styleUrl) {
        setStyleUrl(defaultStyleUrl);
      }
    }, [defaultStyleUrl, styleUrl]);

    // URL parameters for initial map position
    const urlParams = useMemo(() => {
      try {
        if (typeof window === 'undefined') return { valid: false };
        const p = new URLSearchParams(window.location.search);
        const lat = parseFloat(p.get('lat'));
        const lng = parseFloat(p.get('lng'));
        const zm = parseFloat(p.get('zm'));
        return {
          lat,
          lng,
          zm,
          valid: !isNaN(lat) && !isNaN(lng) && !isNaN(zm),
        };
      } catch {
        return { valid: false };
      }
    }, []);

    const initialCenter = useMemo(
      () =>
        urlParams.valid
          ? [urlParams.lng, urlParams.lat]
          : [reduxCenter.longitude, reduxCenter.latitude],
      [urlParams, reduxCenter.longitude, reduxCenter.latitude],
    );

    const initialZoom = useMemo(
      () => (urlParams.valid ? urlParams.zm : reduxZoom),
      [urlParams, reduxZoom],
    );

    // Safe callbacks for loading indicators
    const handleMainLoading = useCallback(
      (loading) => {
        if (onLoadingChange) onLoadingChange(loading);
      },
      [onLoadingChange],
    );

    const handleWaqLoading = useCallback(
      (loading) => {
        if (onLoadingOthersChange) onLoadingOthersChange(loading);
      },
      [onLoadingOthersChange],
    );

    // Initialize map data hooks
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

    // Setup overlay timeout
    useEffect(() => {
      // Only set timeout if overlay is showing
      if (showOverlay) {
        timeoutRef.current = setTimeout(() => {
          setShowOverlay(false);
        }, 50000); // 50 seconds timeout
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }, [showOverlay]);

    // Check for loaded nodes and hide overlay when they appear
    useEffect(() => {
      const hasNodes =
        [...mapData.mapReadingsData, ...mapData.waqData].length > 0;
      if (hasNodes && showOverlay) {
        setShowOverlay(false);
      }
    }, [mapData.mapReadingsData, mapData.waqData, showOverlay]);

    // Track WAQ loading state
    useEffect(() => {
      handleWaqLoading(isWaqLoading);
    }, [isWaqLoading, handleWaqLoading]);

    // Initialize imperative APIs
    const refreshMap = useRefreshMap(
      onToastMessage,
      mapRef,
      dispatch,
      selectedNode,
    );

    const shareLocation = useShareLocation(onToastMessage, mapRef);
    const captureScreenshot = useMapScreenshot(mapRef, onToastMessage);

    // Add map controls
    const addControls = useCallback(() => {
      const map = mapRef.current;
      if (!map || width < 1024 || controlsAddedRef.current) return;

      // Remove existing controls if any
      (map._controls || []).slice().forEach((ctrl) => {
        if (
          ctrl instanceof GlobeControl ||
          ctrl instanceof CustomZoomControl ||
          ctrl instanceof CustomGeolocateControl
        ) {
          map.removeControl(ctrl);
        }
      });

      // Add new controls
      map.addControl(new GlobeControl(), 'bottom-right');
      map.addControl(new CustomZoomControl(), 'bottom-right');
      map.addControl(
        new CustomGeolocateControl(onToastMessage),
        'bottom-right',
      );

      controlsAddedRef.current = true;
    }, [onToastMessage, width]);

    // Handle map node type change
    const onMapDetail = useCallback(
      (detail) => {
        if (detail !== nodeType) {
          setNodeType(detail);
          if (mapRef.current) {
            mapRef.current.nodeType = detail;
            clusterUpdate();
          }
        }
      },
      [clusterUpdate, nodeType],
    );

    // Handle map style change
    const onStyleChange = useCallback(
      ({ url }) => {
        const map = mapRef.current;
        if (!map || url === styleUrl) return;

        setStyleUrl(url);
        controlsAddedRef.current = false;

        // Store current state
        const center = map.getCenter();
        const zoom = map.getZoom();

        // Apply new style
        map.setStyle(url);

        // Restore state and data when style loads
        map.once('style.load', () => {
          map.setCenter(center);
          map.setZoom(zoom);
          addControls();
          updateMapData([...mapData.mapReadingsData, ...mapData.waqData]);
        });
      },
      [
        styleUrl,
        mapData.mapReadingsData,
        mapData.waqData,
        updateMapData,
        addControls,
      ],
    );

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        refreshMap,
        shareLocation,
        captureScreenshot,
        openLayerModal: () => setLayerModalOpen(true),
        closeLayerModal: () => setLayerModalOpen(false),
      }),
      [refreshMap, shareLocation, captureScreenshot],
    );

    // Clean up on unmount
    useEffect(() => {
      return () => {
        dispatch(clearData());
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        controlsAddedRef.current = false;
        mapInitializedRef.current = false;
      };
    }, [dispatch]);

    // Sync URL parameters to Redux
    useEffect(() => {
      if (urlParams.valid) {
        dispatch(
          setCenter({ latitude: urlParams.lat, longitude: urlParams.lng }),
        );
        dispatch(setZoom(urlParams.zm));
      }
    }, [dispatch, urlParams.valid, urlParams.lat, urlParams.lng, urlParams.zm]);

    // Initialize map
    useEffect(() => {
      // Skip if already initialized or no container
      if (mapInitializedRef.current || !mapContainerRef.current || !styleUrl) {
        return;
      }

      // Clean up existing map if any
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      controlsAddedRef.current = false;

      const initMap = async () => {
        handleMainLoading(true);
        dispatch(setMapLoading(true));

        try {
          mapboxgl.accessToken = mapboxApiAccessToken;
          const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: styleUrl,
            projection: 'mercator',
            center: initialCenter,
            zoom: initialZoom,
            preserveDrawingBuffer: true,
          });

          mapRef.current = map;
          map.nodeType = nodeType;

          map.on('load', () => {
            map.resize();
            addControls();
            fetchAndProcessData().catch((err) => {
              console.error('Failed to fetch map data:', err);
              setShowOverlay(false);
              onToastMessage?.({
                message: 'Failed to load map data',
                type: 'error',
                bgColor: 'bg-red-500',
              });
            });
            handleMainLoading(false);
            dispatch(setMapLoading(false));
          });

          map.on('zoomend', () => {
            if (mapRef.current) clusterUpdate();
          });

          map.on('error', (e) => {
            console.error('Mapbox error:', e.error);
            handleMainLoading(false);
            dispatch(setMapLoading(false));
            setShowOverlay(false);
          });

          mapInitializedRef.current = true;
        } catch (err) {
          console.error('Map init error:', err);
          onToastMessage?.({
            message: 'Failed to load map',
            type: 'error',
            bgColor: 'bg-red-500',
          });
          handleMainLoading(false);
          dispatch(setMapLoading(false));
          setShowOverlay(false);
          mapInitializedRef.current = false;
        }
      };

      initMap();

      // No cleanup here - we handle it in the main unmount effect
    }, [
      mapboxApiAccessToken,
      styleUrl,
      initialCenter,
      initialZoom,
      nodeType,
      dispatch,
      handleMainLoading,
      addControls,
      fetchAndProcessData,
      onToastMessage,
      clusterUpdate,
    ]);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        if (mapRef.current?.loaded()) {
          mapRef.current.resize();
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update controls when width changes
    useEffect(() => {
      if (
        mapRef.current?.loaded() &&
        !controlsAddedRef.current &&
        width >= 1024
      ) {
        addControls();
      }
    }, [width, addControls]);

    // Fly to location when Redux center/zoom changes
    useEffect(() => {
      const { latitude, longitude } = reduxCenter;
      if (
        mapRef.current?.loaded() &&
        latitude != null &&
        longitude != null &&
        mapInitializedRef.current
      ) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: reduxZoom,
          essential: true,
        });
      }
    }, [reduxCenter.latitude, reduxCenter.longitude, reduxZoom]);

    return (
      <ErrorBoundary name="AirQoMap" feature="AirQuality Map">
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className={customStyle}>
            {showOverlay && <LoadingOverlay showOverlay={showOverlay} />}
          </div>

          {isWaqLoading && (
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow z-10 text-sm flex items-center">
              <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-blue-700 dark:text-blue-300">
                Loading additional city data...
              </span>
            </div>
          )}

          <LayerModal
            isOpen={layerModalOpen}
            onClose={() => setLayerModalOpen(false)}
            mapStyles={mapStyles}
            mapDetails={mapDetails}
            disabled="Heatmap"
            onMapDetailsSelect={onMapDetail}
            onStyleSelect={onStyleChange}
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
