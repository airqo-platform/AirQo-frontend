import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
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
    const controlsAddedRef = useRef(false);
    const mapInitializedRef = useRef(false);
    const timeoutRef = useRef(null);
    const prevNodeTypeRef = useRef(null);
    const prevStyleUrlRef = useRef(null);
    const isReloadingRef = useRef(false);

    const { width } = useWindowSize();
    const mapData = useSelector((state) => state.map);
    const { zoom: reduxZoom, center: reduxCenter } = mapData;

    // Overlay state
    const [layerModalOpen, setLayerModalOpen] = useState(false);
    const [nodeType, setNodeType] = useState('Emoji');
    const [styleUrl, setStyleUrl] = useState('');

    // Theme-based style URL
    const { theme, systemTheme } = useTheme();
    const isDarkMode = useMemo(
      () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
      [theme, systemTheme],
    );

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

    // Initialize styleUrl once
    useEffect(() => {
      if (!styleUrl) {
        setStyleUrl(defaultStyleUrl);
        prevStyleUrlRef.current = defaultStyleUrl;
      }
    }, [defaultStyleUrl, styleUrl]);

    // Callbacks for loading indicators
    const handleMainLoading = useCallback(
      (loading) => {
        onLoadingChange?.(loading);
      },
      [onLoadingChange],
    );

    const handleOthersLoading = useCallback(
      (loading) => {
        onLoadingOthersChange?.(loading);
      },
      [onLoadingOthersChange],
    );

    // Data hooks
    const { mapRef, fetchAndProcessData, clusterUpdate, updateMapData } =
      useMapData({
        NodeType: nodeType,
        pollutant,
        setLoading: handleMainLoading,
        setLoadingOthers: handleOthersLoading,
        isDarkMode,
      });

    // Add map controls function
    const addControls = useCallback(() => {
      const map = mapRef.current;
      if (!map) return;

      // Only check width restriction if explicitly needed
      if (width < 1024) return;

      // First remove any existing controls to avoid duplicates
      const existingControls = map._controls || [];
      [...existingControls].forEach((ctrl) => {
        if (
          ctrl instanceof GlobeControl ||
          ctrl instanceof CustomZoomControl ||
          ctrl instanceof CustomGeolocateControl
        ) {
          map.removeControl(ctrl);
        }
      });

      // Add controls
      try {
        map.addControl(new GlobeControl(), 'bottom-right');
        map.addControl(new CustomZoomControl(), 'bottom-right');
        map.addControl(
          new CustomGeolocateControl(onToastMessage),
          'bottom-right',
        );
        controlsAddedRef.current = true;
        console.log('Map controls added successfully');
      } catch (err) {
        console.error('Error adding map controls:', err);
        controlsAddedRef.current = false;
      }
    }, [onToastMessage, width]);

    // Ensure controls are added when map is ready
    const ensureControls = useCallback(() => {
      if (!controlsAddedRef.current && mapRef.current?.loaded()) {
        addControls();
      }
    }, [addControls]);

    // Handle URL params for center/zoom
    const urlParams = useMemo(() => {
      if (typeof window === 'undefined') return { valid: false };
      const p = new URLSearchParams(window.location.search);
      const lat = parseFloat(p.get('lat'));
      const lng = parseFloat(p.get('lng'));
      const zm = parseFloat(p.get('zm'));
      return { lat, lng, zm, valid: !isNaN(lat) && !isNaN(lng) && !isNaN(zm) };
    }, []);

    const initialCenter = useMemo(
      () =>
        urlParams.valid
          ? [urlParams.lng, urlParams.lat]
          : [reduxCenter.longitude, reduxCenter.latitude],
      [urlParams, reduxCenter],
    );

    const initialZoom = useMemo(
      () => (urlParams.valid ? urlParams.zm : reduxZoom),
      [urlParams, reduxZoom],
    );

    // Expose imperative methods
    const refreshMap = useRefreshMap(
      onToastMessage,
      mapRef,
      dispatch,
      mapData.selectedNode,
    );

    const shareLocation = useShareLocation(onToastMessage, mapRef);
    const captureScreenshot = useMapScreenshot(mapRef, onToastMessage);

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
        clearTimeout(timeoutRef.current);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        controlsAddedRef.current = false;
        mapInitializedRef.current = false;
        isReloadingRef.current = false;
      };
    }, [dispatch]);

    // Sync URL params to Redux
    useEffect(() => {
      if (urlParams.valid) {
        dispatch(
          setCenter({ latitude: urlParams.lat, longitude: urlParams.lng }),
        );
        dispatch(setZoom(urlParams.zm));
      }
    }, [dispatch, urlParams]);

    // Initialize map
    const initializeMap = useCallback(() => {
      if (!mapContainerRef.current || !styleUrl || isReloadingRef.current) {
        return;
      }

      // Store current values to detect changes
      prevNodeTypeRef.current = nodeType;
      prevStyleUrlRef.current = styleUrl;

      // Remove existing map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      controlsAddedRef.current = false;
      isReloadingRef.current = true;
      dispatch(setMapLoading(true));
      handleMainLoading(true);

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
        mapInitializedRef.current = true;

        map.resize();
        addControls();

        // Also set up a check a bit later to ensure controls are added
        setTimeout(() => {
          if (!controlsAddedRef.current) {
            addControls();
          }
        }, 500);

        fetchAndProcessData()
          .catch((err) => {
            console.error('Data fetch error:', err);
            onToastMessage?.({
              message: 'Failed to load map data',
              type: 'error',
              bgColor: 'bg-red-500',
            });
          })
          .finally(() => {
            handleMainLoading(false);
            dispatch(setMapLoading(false));
            isReloadingRef.current = false;
            ensureControls();
          });
      });

      map.on('zoomend', () => {
        if (!isReloadingRef.current) {
          clusterUpdate();
        }
      });

      map.on('idle', () => {
        // Ensure controls on idle state
        ensureControls();
      });

      map.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        handleMainLoading(false);
        dispatch(setMapLoading(false));
        isReloadingRef.current = false;
      });
    }, [
      mapboxApiAccessToken,
      initialCenter,
      initialZoom,
      nodeType,
      styleUrl,
      fetchAndProcessData,
      clusterUpdate,
      addControls,
      dispatch,
      handleMainLoading,
      onToastMessage,
      ensureControls,
    ]);

    // Handle map initialization and reinitialization
    useEffect(() => {
      if (!styleUrl) return;

      const needsReload =
        // First initialization
        (!mapInitializedRef.current && !isReloadingRef.current) ||
        // Style changed
        (prevStyleUrlRef.current !== styleUrl &&
          prevStyleUrlRef.current !== null);

      if (needsReload) {
        initializeMap();
      }
    }, [styleUrl, initializeMap]);

    // Handle nodeType changes
    useEffect(() => {
      if (
        !mapRef.current ||
        !mapInitializedRef.current ||
        isReloadingRef.current
      )
        return;

      if (
        prevNodeTypeRef.current !== nodeType &&
        prevNodeTypeRef.current !== null
      ) {
        // Update map's nodeType without full reload
        mapRef.current.nodeType = nodeType;
        prevNodeTypeRef.current = nodeType;
        clusterUpdate();
      }
    }, [nodeType, clusterUpdate]);

    // Periodically check if controls need to be added (as a fallback)
    useEffect(() => {
      if (!mapInitializedRef.current || !mapRef.current) return;

      const checkControls = () => {
        if (!controlsAddedRef.current && mapRef.current?.loaded()) {
          addControls();
        }
      };

      // Initial check
      checkControls();

      // Set up interval for periodic checks
      const interval = setInterval(checkControls, 2000);

      return () => clearInterval(interval);
    }, [addControls, mapInitializedRef.current]);

    // Style change handler
    const onStyleChange = useCallback(
      ({ url }) => {
        if (url === styleUrl || isReloadingRef.current) return;

        const map = mapRef.current;
        if (!map) {
          setStyleUrl(url);
          return;
        }

        // Save current viewport state
        const center = map.getCenter();
        const zoom = map.getZoom();

        // Set flag to prevent concurrent operations
        isReloadingRef.current = true;
        controlsAddedRef.current = false;
        handleMainLoading(true);

        setStyleUrl(url);
        map.setStyle(url);

        map.once('style.load', () => {
          // Restore viewport
          map.setCenter(center);
          map.setZoom(zoom);

          // Add controls and update data
          addControls();
          updateMapData([...mapData.mapReadingsData, ...mapData.waqData]);

          // Set a timeout to ensure controls are added
          setTimeout(() => {
            if (!controlsAddedRef.current) {
              addControls();
            }
          }, 500);

          // Reset flags
          handleMainLoading(false);
          isReloadingRef.current = false;
          prevStyleUrlRef.current = url;
        });
      },
      [styleUrl, mapData, updateMapData, addControls, handleMainLoading],
    );

    // Handle detail change
    const onMapDetail = useCallback(
      (detail) => {
        if (detail !== nodeType && !isReloadingRef.current) {
          setNodeType(detail);
        }
      },
      [nodeType],
    );

    // Fly to new center/zoom
    useEffect(() => {
      if (
        mapRef.current?.loaded() &&
        mapInitializedRef.current &&
        reduxCenter.latitude != null &&
        reduxCenter.longitude != null
      ) {
        mapRef.current.flyTo({
          center: [reduxCenter.longitude, reduxCenter.latitude],
          zoom: reduxZoom,
          essential: true,
        });
      }
    }, [reduxCenter, reduxZoom]);

    return (
      <ErrorBoundary name="AirQoMap" feature="AirQuality Map">
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className={customStyle}></div>
          <LayerModal
            isOpen={layerModalOpen}
            onClose={() => setLayerModalOpen(false)}
            mapStyles={mapStyles}
            mapDetails={mapDetails}
            disabled="Heatmap"
            onMapDetailsSelect={onMapDetail}
            onStyleSelect={onStyleChange}
            currentNodeType={nodeType}
            currentStyleUrl={styleUrl}
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
