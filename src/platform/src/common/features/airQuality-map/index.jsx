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

    // Redux state
    const mapData = useSelector((state) => state.map);
    const { zoom: reduxZoom, center: reduxCenter } = mapData;
    const selectedNode = mapData.selectedNode;

    const { theme, systemTheme } = useTheme();
    const isDarkMode = useMemo(
      () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
      [theme, systemTheme],
    );

    // Style URL
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
    const [currentMapStyle, setCurrentMapStyle] = useState(defaultStyleUrl);
    useEffect(() => setCurrentMapStyle(defaultStyleUrl), [defaultStyleUrl]);

    // Local state
    const [layerModalOpen, setLayerModalOpen] = useState(false);
    const [nodeType, setNodeType] = useState('Emoji');
    const [showOverlay, setShowOverlay] = useState(true);

    const handleMainLoading = useCallback(
      (loading) => onLoadingChange?.(loading),
      [onLoadingChange],
    );
    const handleWaqLoading = useCallback(
      (loading) => onLoadingOthersChange?.(loading),
      [onLoadingOthersChange],
    );

    // URL override
    const urlParams = useMemo(() => {
      try {
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
      [urlParams, reduxCenter],
    );
    const initialZoom = useMemo(
      () => (urlParams.valid ? urlParams.zm : reduxZoom),
      [urlParams, reduxZoom],
    );

    // Data hook
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

    // Overlay
    useEffect(
      () => handleWaqLoading(isWaqLoading),
      [isWaqLoading, handleWaqLoading],
    );
    useEffect(() => {
      const t = setTimeout(() => setShowOverlay(false), 40000);
      return () => clearTimeout(t);
    }, []);
    useEffect(() => {
      if ([...mapData.mapReadingsData, ...mapData.waqData].length)
        setShowOverlay(false);
    }, [mapData.mapReadingsData, mapData.waqData]);

    // Imperative APIs
    const refreshMap = useRefreshMap(
      onToastMessage,
      mapRef,
      dispatch,
      selectedNode,
    );
    const shareLocation = useShareLocation(onToastMessage, mapRef);
    const captureScreenshot = useMapScreenshot(mapRef, onToastMessage);

    // Controls: Globe, Zoom In, Geolocate
    const addControls = useCallback(() => {
      const map = mapRef.current;
      if (map && width >= 1024 && !controlsAddedRef.current) {
        (map._controls || []).slice().forEach((ctrl) => {
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
      }
    }, [onToastMessage, width]);

    const onMapDetail = useCallback(
      (detail) => {
        setNodeType(detail);
        if (mapRef.current) {
          mapRef.current.nodeType = detail;
          clusterUpdate();
        }
      },
      [clusterUpdate],
    );

    const onStyleChange = useCallback(
      ({ url }) => {
        const map = mapRef.current;
        if (map && url !== currentMapStyle) {
          setCurrentMapStyle(url);
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
        }
      },
      [currentMapStyle, mapData, updateMapData, addControls],
    );

    useImperativeHandle(ref, () => ({
      refreshMap,
      shareLocation,
      captureScreenshot,
      openLayerModal: () => setLayerModalOpen(true),
      closeLayerModal: () => setLayerModalOpen(false),
    }));

    // clear on unmount
    useEffect(() => () => dispatch(clearData()), [dispatch]);

    // URL sync
    useEffect(() => {
      if (urlParams.valid) {
        dispatch(
          setCenter({ latitude: urlParams.lat, longitude: urlParams.lng }),
        );
        dispatch(setZoom(urlParams.zm));
      }
    }, [dispatch, urlParams]);

    // Init/cleanup
    useEffect(() => {
      if (mapRef.current) {
        mapRef.current.remove();
        controlsAddedRef.current = false;
        mapRef.current = null;
      }
      const container = mapContainerRef.current;
      if (!container) return;
      const init = async () => {
        handleMainLoading(true);
        dispatch(setMapLoading(true));
        try {
          mapboxgl.accessToken = mapboxApiAccessToken;
          const map = new mapboxgl.Map({
            container,
            style: currentMapStyle,
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
            fetchAndProcessData();
            handleMainLoading(false);
            dispatch(setMapLoading(false));
          });
          map.on('zoomend', () => clusterUpdate());
          map.on('error', (e) => {
            console.error('Mapbox error:', e.error);
            handleMainLoading(false);
            dispatch(setMapLoading(false));
          });
        } catch (err) {
          console.error('Map init error:', err);
          onToastMessage?.({
            message: 'Failed to load map',
            type: 'error',
            bgColor: 'bg-red-500',
          });
          handleMainLoading(false);
          dispatch(setMapLoading(false));
        }
      };
      init();
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          controlsAddedRef.current = false;
          mapRef.current = null;
        }
      };
    }, [mapboxApiAccessToken, addControls]);

    // Resize
    useEffect(() => {
      const onResize = () => mapRef.current?.resize();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);
    useEffect(() => {
      if (mapRef.current?.loaded()) addControls();
    }, [width]);

    // FlyTo
    useEffect(() => {
      const { latitude, longitude } = reduxCenter;
      if (mapRef.current && latitude != null && longitude != null) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: reduxZoom,
          essential: true,
        });
      }
    }, [reduxCenter, reduxZoom]);

    return (
      <ErrorBoundary name="AirQoMap" feature="AirQuality Map">
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className={customStyle} />
          {isWaqLoading && (
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow z-10 text-sm flex items-center">
              <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-blue-700 dark:text-blue-300">
                Loading additional city data...
              </span>
            </div>
          )}
          {showOverlay && <LoadingOverlay showOverlay={showOverlay} />}
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
