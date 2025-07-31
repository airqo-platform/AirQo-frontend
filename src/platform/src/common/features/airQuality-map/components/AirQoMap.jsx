'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useMemo,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { clearData } from '@/lib/store/services/map/MapSlice';
import {
  useMapData,
  useRefreshMap,
  useShareLocation,
  useMapScreenshot,
  useMapStyles,
  useMapViewport,
  useMapControls,
  useMapInitialization,
} from '../hooks';
import LayerModal from '@/common/features/airQuality-map/components/LayerModal';
import ErrorBoundary from '@/common/components/ErrorBoundary';
import { mapStyles, mapDetails } from '../constants/mapConstants';

// Constants for better maintainability
const CONSTANTS = {
  DEFAULT_NODE_TYPE: 'Emoji',
  MIN_CENTER_CHANGE: 0.0001, // Minimum change to trigger map update
  MIN_ZOOM_CHANGE: 0.1,
  CONTROL_CHECK_INTERVAL: 5000, // 5 seconds
  STYLE_LOAD_FALLBACK_TIMEOUT: 1000, // 1 second
};

const AirQoMap = forwardRef(
  (
    {
      customStyle = 'w-full h-full',
      mapboxApiAccessToken,
      pollutant,
      onToastMessage,
      onMapReadingLoadingChange,
      onWaqiLoadingChange,
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    // Refs for performance and cleanup
    const mapContainerRef = useRef(null);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);
    const isUnmountingRef = useRef(false);
    const lastViewportUpdateRef = useRef({ center: null, zoom: null });

    // Redux state with optimized selector to prevent unnecessary re-renders
    const mapData = useSelector(
      (state) => ({
        mapReadingsData: state.map.mapReadingsData,
        waqData: state.map.waqData,
        selectedNode: state.map.selectedNode,
        nodeType: state.map.nodeType || CONSTANTS.DEFAULT_NODE_TYPE,
      }),
      // Shallow comparison optimization
      (prev, next) =>
        prev.mapReadingsData === next.mapReadingsData &&
        prev.waqData === next.waqData &&
        prev.selectedNode === next.selectedNode &&
        prev.nodeType === next.nodeType,
    );

    // Extract nodeType from Redux state
    const { nodeType } = mapData;
    // Separate viewport selector for better performance
    const viewportData = useSelector(
      (state) => ({
        reduxCenter: state.map.center || { latitude: null, longitude: null },
        reduxZoom: state.map.zoom || 10,
      }),
      (prev, next) =>
        prev.reduxCenter?.latitude === next.reduxCenter?.latitude &&
        prev.reduxCenter?.longitude === next.reduxCenter?.longitude &&
        prev.reduxZoom === next.reduxZoom,
    );
    // Local state
    const [layerModalOpen, setLayerModalOpen] = useState(false);
    // Custom hooks with memoization
    const { styleUrl, setStyleUrl, isDarkMode } = useMapStyles(mapStyles);
    const { initialCenter, initialZoom } = useMapViewport();

    // Data management hook - Pass the loading callbacks to parent
    const {
      mapRef,
      fetchAndProcessData,
      clusterUpdate,
      updateMapData,
      cleanup: cleanupMapDataHook,
    } = useMapData({
      pollutant,
      isDarkMode,
      onMapReadingLoadingChange,
      onWaqiLoadingChange,
    });
    // Controls management
    const {
      addControls,
      ensureControls,
      resetControlsState,
      controlsAddedRef,
    } = useMapControls(mapRef, onToastMessage);
    // Map initialization
    const {
      initializeMap,
      mapInitializedRef,
      isReloadingRef,
      prevNodeTypeRef,
      prevStyleUrlRef,
    } = useMapInitialization({
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
      onToastMessage,
    });
    // Memoized combined map data to prevent unnecessary recalculations
    const combinedMapData = useMemo(() => {
      return [...(mapData.mapReadingsData || []), ...(mapData.waqData || [])];
    }, [mapData.mapReadingsData, mapData.waqData]);
    // Imperative methods with stable references
    const refreshMap = useRefreshMap(
      onToastMessage,
      mapRef,
      dispatch,
      mapData.selectedNode,
    );
    const shareLocation = useShareLocation(onToastMessage, mapRef);
    const captureScreenshot = useMapScreenshot(mapRef, onToastMessage);
    // Modal handlers with useCallback to prevent re-renders
    const openLayerModal = useCallback(() => setLayerModalOpen(true), []);
    const closeLayerModal = useCallback(() => setLayerModalOpen(false), []);
    // Imperative handle with stable references
    useImperativeHandle(
      ref,
      () => ({
        refreshMap,
        shareLocation,
        captureScreenshot,
        openLayerModal,
        closeLayerModal,
      }),
      [
        refreshMap,
        shareLocation,
        captureScreenshot,
        openLayerModal,
        closeLayerModal,
      ],
    );
    // Optimized style change handler
    const onStyleChange = useCallback(
      ({ url }) => {
        if (
          url === styleUrl ||
          isReloadingRef.current ||
          isUnmountingRef.current
        )
          return;
        const map = mapRef.current;
        if (!map) {
          setStyleUrl(url);
          return;
        }
        // Store current map state
        const center = map.getCenter();
        const zoom = map.getZoom();
        isReloadingRef.current = true;
        resetControlsState();
        setStyleUrl(url);
        map.setStyle(url);
        // Handle style load with error handling
        const handleStyleLoad = () => {
          if (isUnmountingRef.current) return;
          try {
            // Restore map state
            map.setCenter(center);
            map.setZoom(zoom);
            // Add controls
            addControls();
            // Update map data if available
            if (combinedMapData.length > 0) {
              updateMapData(combinedMapData);
            }
            // Fallback control addition with cleanup
            const fallbackTimeout = setTimeout(() => {
              if (!controlsAddedRef.current && !isUnmountingRef.current) {
                addControls();
              }
            }, CONSTANTS.STYLE_LOAD_FALLBACK_TIMEOUT);
            // Store timeout for cleanup
            timeoutRef.current = fallbackTimeout;
            isReloadingRef.current = false;
            prevStyleUrlRef.current = url;
          } catch (error) {
            console.error('Error handling style load:', error);
            isReloadingRef.current = false;
          }
        };
        // Add event listeners with error handling
        map.once('style.load', handleStyleLoad);
        map.once('error', () => {
          console.error('Error loading map style');
          isReloadingRef.current = false;
        });
      },
      [
        styleUrl,
        combinedMapData,
        updateMapData,
        addControls,
        resetControlsState,
        controlsAddedRef,
      ],
    );
    // Optimized viewport change handler
    const handleViewportChange = useCallback(() => {
      const map = mapRef.current;
      const { reduxCenter, reduxZoom } = viewportData;
      if (
        !map?.loaded() ||
        !mapInitializedRef.current ||
        reduxCenter.latitude == null ||
        reduxCenter.longitude == null ||
        isUnmountingRef.current
      ) {
        return;
      }
      const lastUpdate = lastViewportUpdateRef.current;
      // Check if the change is significant enough to warrant an update
      const centerChanged =
        !lastUpdate.center ||
        Math.abs(lastUpdate.center.latitude - reduxCenter.latitude) >
          CONSTANTS.MIN_CENTER_CHANGE ||
        Math.abs(lastUpdate.center.longitude - reduxCenter.longitude) >
          CONSTANTS.MIN_CENTER_CHANGE;
      const zoomChanged =
        !lastUpdate.zoom ||
        Math.abs(lastUpdate.zoom - reduxZoom) > CONSTANTS.MIN_ZOOM_CHANGE;
      if (centerChanged || zoomChanged) {
        map.flyTo({
          center: [reduxCenter.longitude, reduxCenter.latitude],
          zoom: reduxZoom,
          essential: true,
          speed: 0.8,
          curve: 1.2,
        });
        // Update last viewport reference
        lastViewportUpdateRef.current = {
          center: { ...reduxCenter },
          zoom: reduxZoom,
        };
      }
    }, [viewportData, mapInitializedRef]);
    // Optimized controls checker
    const checkControls = useCallback(() => {
      if (
        !mapInitializedRef.current ||
        !mapRef.current ||
        controlsAddedRef.current ||
        isUnmountingRef.current
      )
        return;
      if (mapRef.current.loaded()) {
        addControls();
      }
    }, [addControls, mapInitializedRef, controlsAddedRef]);
    // Cleanup effect - runs on unmount
    useEffect(() => {
      return () => {
        isUnmountingRef.current = true;
        // Clear all timeouts and intervals
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Clean up Redux state
        dispatch(clearData());
        // Clean up map data hook (abort controllers, timeouts)
        cleanupMapDataHook();
        // Clean up map instance
        if (mapRef.current) {
          try {
            mapRef.current.remove();
            mapRef.current = null;
          } catch (error) {
            console.warn('Error removing map:', error);
          }
        }
        // Reset state
        resetControlsState();
        mapInitializedRef.current = false;
        isReloadingRef.current = false;
      };
    }, [dispatch, resetControlsState, cleanupMapDataHook]);

    // Map initialization effect with dependency optimization
    useEffect(() => {
      if (!styleUrl || isUnmountingRef.current) return;
      const needsReload =
        (!mapInitializedRef.current && !isReloadingRef.current) ||
        (prevStyleUrlRef.current !== styleUrl &&
          prevStyleUrlRef.current !== null);
      if (needsReload) {
        initializeMap();
      }
    }, [styleUrl, initializeMap]);

    // NodeType change effect with optimization
    useEffect(() => {
      if (
        !mapRef.current ||
        !mapInitializedRef.current ||
        isReloadingRef.current ||
        isUnmountingRef.current
      )
        return;
      if (
        prevNodeTypeRef.current !== nodeType &&
        prevNodeTypeRef.current !== null
      ) {
        mapRef.current.nodeType = nodeType;
        prevNodeTypeRef.current = nodeType;
        // Debounce cluster update to prevent excessive calls
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          if (!isUnmountingRef.current) {
            clusterUpdate();
          }
        }, 100);
      }
    }, [nodeType, clusterUpdate]);

    // Controls check effect with cleanup
    useEffect(() => {
      if (
        !mapInitializedRef.current ||
        !mapRef.current ||
        isUnmountingRef.current
      )
        return;
      // Initial check
      checkControls();
      // Set up periodic checks
      intervalRef.current = setInterval(
        checkControls,
        CONSTANTS.CONTROL_CHECK_INTERVAL,
      );
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [checkControls, mapInitializedRef.current]);

    // Viewport changes effect
    useEffect(() => {
      handleViewportChange();
    }, [handleViewportChange]);

    return (
      <ErrorBoundary name="AirQoMap" feature="AirQuality Map">
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className={customStyle} />
          <LayerModal
            isOpen={layerModalOpen}
            onClose={closeLayerModal}
            mapStyles={mapStyles}
            mapDetails={mapDetails}
            disabled={['Heatmap', 'Number', 'Node']}
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
  onMapReadingLoadingChange: PropTypes.func,
  onWaqiLoadingChange: PropTypes.func,
};

export default React.memo(AirQoMap);
