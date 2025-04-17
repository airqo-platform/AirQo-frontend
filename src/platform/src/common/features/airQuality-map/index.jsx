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
    const controlsAddedRef = useRef(false);
    const mapInitializedRef = useRef(false);
    const timeoutRef = useRef(null);

    const { width } = useWindowSize();
    const mapData = useSelector((state) => state.map);
    const { zoom: reduxZoom, center: reduxCenter } = mapData;

    // Overlay state
    const [showOverlay, setShowOverlay] = useState(true);
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

    // Initialize styleUrl
    useEffect(() => {
      setStyleUrl(defaultStyleUrl);
    }, [defaultStyleUrl]);

    // Overlay timeout: hide after 50s
    useEffect(() => {
      timeoutRef.current = setTimeout(() => {
        setShowOverlay(false);
      }, 50000);
      return () => clearTimeout(timeoutRef.current);
    }, []);

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
      setLoadingOthers: handleOthersLoading,
      isDarkMode,
    });

    // Add map controls once
    const addControls = useCallback(() => {
      const map = mapRef.current;
      if (!map || width < 1024 || controlsAddedRef.current) return;
      (map._controls || []).forEach((ctrl) => {
        if (
          ctrl instanceof GlobeControl ||
          ctrl instanceof CustomZoomControl ||
          ctrl instanceof CustomGeolocateControl
        ) {
          map.removeControl(ctrl);
        }
      });
      map.addControl(new GlobeControl(), 'bottom-right');
      map.addControl(new CustomZoomControl(), 'bottom-right');
      map.addControl(
        new CustomGeolocateControl(onToastMessage),
        'bottom-right',
      );
      controlsAddedRef.current = true;
    }, [onToastMessage, width]);

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
    useEffect(() => {
      if (mapInitializedRef.current || !mapContainerRef.current || !styleUrl) {
        return;
      }

      // Remove existing map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        controlsAddedRef.current = false;
      }

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
        map.resize();
        addControls();
        fetchAndProcessData()
          .then(() => setShowOverlay(false))
          .catch((err) => {
            console.error('Data fetch error:', err);
            setShowOverlay(false);
            onToastMessage?.({
              message: 'Failed to load map data',
              type: 'error',
              bgColor: 'bg-red-500',
            });
          })
          .finally(() => {
            handleMainLoading(false);
            dispatch(setMapLoading(false));
          });
      });

      map.on('zoomend', () => {
        clusterUpdate();
      });

      map.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        setShowOverlay(false);
        handleMainLoading(false);
        dispatch(setMapLoading(false));
      });

      mapInitializedRef.current = true;
    }, [
      mapboxApiAccessToken,
      styleUrl,
      initialCenter,
      initialZoom,
      nodeType,
      dispatch,
      handleMainLoading,
      fetchAndProcessData,
      addControls,
      clusterUpdate,
      onToastMessage,
    ]);

    // Style change handler
    const onStyleChange = useCallback(
      ({ url }) => {
        const map = mapRef.current;
        if (!map || url === styleUrl) return;
        setStyleUrl(url);
        controlsAddedRef.current = false;
        const center = map.getCenter();
        const zoom = map.getZoom();
        map.setStyle(url);
        map.once('style.load', () => {
          map.setCenter(center);
          map.setZoom(zoom);
          addControls();
          updateMapData([...mapData.mapReadingsData, ...mapData.waqData]);
        });
      },
      [styleUrl, mapData, updateMapData, addControls],
    );

    // Handle detail change
    const onMapDetail = useCallback(
      (detail) => {
        if (detail !== nodeType) {
          setNodeType(detail);
          const map = mapRef.current;
          if (map) {
            map.nodeType = detail;
            clusterUpdate();
          }
        }
      },
      [nodeType, clusterUpdate],
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
          <div ref={mapContainerRef} className={customStyle}>
            {showOverlay && <LoadingOverlay />}
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
