import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import { setMapLoading } from '@/lib/store/services/map/MapSlice';
import { createMapboxConfig } from '../utils/mapConfig';
import { createDebouncer } from '../utils/mapHelpers';
import { MAP_CONFIG } from '../constants/mapConstants';

/**
 * Hook for map initialization and event handling
 */
export const useMapInitialization = ({
  mapContainerRef,
  mapRef,
  styleUrl,
  initialCenter,
  initialZoom,
  nodeType,
  mapboxApiAccessToken,
  fetchAndProcessData,
  clusterUpdate,
  addControls,
  ensureControls,
  handleMainLoading,
  onToastMessage,
}) => {
  const dispatch = useDispatch();
  const mapInitializedRef = useRef(false);
  const isReloadingRef = useRef(false);
  const prevNodeTypeRef = useRef(null);
  const prevStyleUrlRef = useRef(null);

  const debouncedClusterUpdate = createDebouncer(
    clusterUpdate,
    MAP_CONFIG.TIMEOUTS.ZOOM_DEBOUNCE,
  );

  const initializeMapFeatures = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    map.resize();
    addControls();

    setTimeout(() => {
      fetchAndProcessData()
        .catch(() => {
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
    }, MAP_CONFIG.TIMEOUTS.DATA_FETCH_DELAY);
  }, [
    mapRef,
    addControls,
    fetchAndProcessData,
    handleMainLoading,
    dispatch,
    ensureControls,
    onToastMessage,
  ]);

  const setupMapEventHandlers = useCallback(
    (map) => {
      map.on('load', () => {
        mapInitializedRef.current = true;

        if (window.requestIdleCallback) {
          window.requestIdleCallback(initializeMapFeatures, {
            timeout: MAP_CONFIG.TIMEOUTS.IDLE_CALLBACK_TIMEOUT,
          });
        } else {
          initializeMapFeatures();
        }
      });

      map.on('zoomend', () => {
        if (!isReloadingRef.current) {
          debouncedClusterUpdate();
        }
      });

      map.on('idle', ensureControls);

      map.on('error', () => {
        handleMainLoading(false);
        dispatch(setMapLoading(false));
        isReloadingRef.current = false;
      });
    },
    [
      initializeMapFeatures,
      debouncedClusterUpdate,
      ensureControls,
      handleMainLoading,
      dispatch,
    ],
  );

  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || !styleUrl || isReloadingRef.current) {
      return;
    }

    // Store current values
    prevNodeTypeRef.current = nodeType;
    prevStyleUrlRef.current = styleUrl;

    // Remove existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    isReloadingRef.current = true;
    dispatch(setMapLoading(true));
    handleMainLoading(true);

    mapboxgl.accessToken = mapboxApiAccessToken;

    const mapConfig = createMapboxConfig(
      mapContainerRef.current,
      styleUrl,
      initialCenter,
      initialZoom,
      mapboxApiAccessToken,
    );

    const map = new mapboxgl.Map(mapConfig);
    mapRef.current = map;
    map.nodeType = nodeType;

    setupMapEventHandlers(map);
  }, [
    mapContainerRef,
    styleUrl,
    nodeType,
    mapboxApiAccessToken,
    initialCenter,
    initialZoom,
    dispatch,
    handleMainLoading,
    setupMapEventHandlers,
    mapRef,
  ]);

  return {
    initializeMap,
    mapInitializedRef,
    isReloadingRef,
    prevNodeTypeRef,
    prevStyleUrlRef,
  };
};
