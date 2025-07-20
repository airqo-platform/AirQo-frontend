import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Supercluster from 'supercluster';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { debounce } from 'lodash';
import { getMapReadings } from '@/core/apis/DeviceRegistry';
import {
  setOpenLocationDetails,
  setSelectedLocation,
  setSelectedNode,
  setSelectedWeeklyPrediction,
  setMapReadingsData,
  setWaqData,
} from '@/lib/store/services/map/MapSlice';
import { AQI_FOR_CITIES } from '../constants/Cities';
import {
  createPopupHTML,
  createClusterNode,
  UnclusteredNode,
  getAQICategory,
} from '../components/MapNodes';
import { images } from '../constants/mapConstants';

// Constants for better maintainability
const CONSTANTS = {
  CLUSTER_RADIUS: {
    EMOJI: 40,
    NODE: 60,
    DEFAULT: 80,
  },
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  DEBOUNCE_DELAY: 150,
  POPUP_OFFSET: {
    NODE: 35,
    NUMBER: 42,
    DEFAULT: 58,
  },
  BATCH_SIZE: 8, // Optimized batch size
  MAX_CONCURRENT_BATCHES: 2, // Reduced for better stability
  REQUEST_TIMEOUT: 10000, // 10 seconds
  BATCH_DELAY: 300, // ms between batches
  MIN_DESKTOP_WIDTH: 768,
};

const useMapData = ({
  NodeType,
  pollutant,
  setLoading,
  setLoadingOthers,
  isDarkMode,
}) => {
  // Refs for performance optimization
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const indexRef = useRef(null);
  const abortControllerRef = useRef(null);
  const mapDataCacheRef = useRef(new Map());
  const lastFetchTimeRef = useRef(0);
  const cleanupFunctionsRef = useRef([]);

  // State
  const [isWaqLoading, setIsWaqLoading] = useState(false);

  // Redux
  const dispatch = useDispatch();
  const { mapReadingsData, waqData, selectedNode } = useSelector((state) => ({
    mapReadingsData: state.map.mapReadingsData,
    waqData: state.map.waqData,
    selectedNode: state.map.selectedNode,
  }));

  // Memoized values
  const clusterRadius = useMemo(() => {
    switch (NodeType) {
      case 'Emoji':
        return CONSTANTS.CLUSTER_RADIUS.EMOJI;
      case 'Node':
        return CONSTANTS.CLUSTER_RADIUS.NODE;
      default:
        return CONSTANTS.CLUSTER_RADIUS.DEFAULT;
    }
  }, [NodeType]);

  const isDesktop = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      window.innerWidth > CONSTANTS.MIN_DESKTOP_WIDTH
    );
  }, []);

  // Optimized feature creation
  const createFeature = useCallback(
    (id, name, coordinates, aqi, no2, pm10, pm2_5, time, forecast) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates },
      properties: {
        _id: id,
        location: name,
        airQuality: aqi?.category,
        no2,
        pm10,
        pm2_5,
        time,
        aqi: aqi || 'undefined',
        forecast,
      },
    }),
    [],
  );

  // Optimized forecast extraction
  const getForecastForPollutant = useCallback(
    (cityData) => {
      if (!cityData?.forecast?.daily) return null;

      const key = pollutant === 'pm2_5' ? 'pm25' : pollutant;
      const dailyData = cityData.forecast.daily[key];

      return (
        dailyData?.map((data) => ({
          [pollutant]: data.avg,
          time: data.day,
        })) || null
      );
    },
    [pollutant],
  );

  // Optimized cluster AQI calculation
  const getTwoMostCommonAQIs = useCallback((cluster) => {
    if (!indexRef.current) return [];

    const leaves = indexRef.current.getLeaves(
      cluster.properties.cluster_id,
      Infinity,
    );
    const aqiCounts = new Map();

    // Count AQI categories efficiently
    for (const leaf of leaves) {
      const aqi = leaf.properties.airQuality;
      if (aqi) {
        aqiCounts.set(aqi, (aqiCounts.get(aqi) || 0) + 1);
      }
    }

    if (aqiCounts.size === 0) return [];

    // Get top 2 most common AQIs
    const sortedAQIs = Array.from(aqiCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([aqi]) => aqi);

    return leaves
      .filter((leaf) => sortedAQIs.includes(leaf.properties.airQuality))
      .map((leaf) => ({
        aqi: leaf.properties.aqi,
        pm2_5: leaf.properties.pm2_5,
        pm10: leaf.properties.pm10,
        no2: leaf.properties.no2,
      }));
  }, []);

  // Optimized marker cleanup
  const clearMarkers = useCallback(() => {
    if (markersRef.current.length === 0) return;

    // Batch marker removal for better performance
    const markers = markersRef.current;
    markersRef.current = [];

    // Use requestAnimationFrame for non-blocking cleanup
    requestAnimationFrame(() => {
      markers.forEach((marker) => {
        try {
          marker.remove();
        } catch (error) {
          console.warn('Error removing marker:', error);
        }
      });
    });
  }, []);

  // Optimized node selection
  const handleNodeSelection = useCallback(
    (feature) => {
      if (selectedNode === feature.properties._id) return;

      // Batch Redux updates
      dispatch(setSelectedNode(feature.properties._id));
      dispatch(setSelectedWeeklyPrediction(null));
      dispatch(setOpenLocationDetails(true));
      dispatch(setSelectedLocation(feature.properties));

      // Smooth map transition
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: feature.geometry.coordinates,
          zoom: 16,
          speed: 0.8,
          curve: 1.5,
          easing: (t) => t * (2 - t), // Smooth easing
        });
      }
    },
    [dispatch, selectedNode],
  );

  // Optimized cluster update with improved debouncing
  const clusterUpdate = useCallback(
    debounce(() => {
      const map = mapRef.current;
      if (!map || !indexRef.current) return;

      try {
        const zoom = Math.floor(map.getZoom());
        const bounds = map.getBounds();
        const bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ];

        const clusters = indexRef.current.getClusters(bbox, zoom);

        // Clear existing markers
        clearMarkers();

        // Create markers efficiently
        const newMarkers = clusters
          .map((feature) => {
            const el = document.createElement('div');
            el.style.cursor = 'pointer';

            if (!feature.properties.cluster) {
              return createUnclusteredMarker(el, feature, map);
            } else {
              return createClusteredMarker(el, feature, map, zoom);
            }
          })
          .filter(Boolean);

        markersRef.current = newMarkers;
      } catch (error) {
        console.error('Error updating clusters:', error);
      }
    }, CONSTANTS.DEBOUNCE_DELAY),
    [clearMarkers, NodeType, selectedNode, isDarkMode, isDesktop],
  );

  // Helper function for creating unclustered markers
  const createUnclusteredMarker = useCallback(
    (el, feature, map) => {
      el.style.zIndex = '1';
      el.innerHTML = UnclusteredNode({
        feature,
        NodeType,
        selectedNode,
        isDarkMode,
      });

      // Create popup only for desktop
      let popup = null;
      if (isDesktop) {
        const offset =
          NodeType === 'Node'
            ? CONSTANTS.POPUP_OFFSET.NODE
            : NodeType === 'Number'
              ? CONSTANTS.POPUP_OFFSET.NUMBER
              : CONSTANTS.POPUP_OFFSET.DEFAULT;

        popup = new mapboxgl.Popup({
          offset,
          closeButton: false,
          maxWidth: 'none',
          className: 'my-custom-popup hidden md:block',
        }).setHTML(createPopupHTML({ feature, images, isDarkMode }));
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);

      if (popup) marker.setPopup(popup);

      // Add event listeners with passive option
      const handleMouseEnter = () => {
        if (popup) marker.togglePopup();
        el.style.zIndex = '9999';
      };

      const handleMouseLeave = () => {
        if (popup) marker.togglePopup();
        el.style.zIndex = '1';
      };

      const handleClick = () => handleNodeSelection(feature);

      el.addEventListener('mouseenter', handleMouseEnter, { passive: true });
      el.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      el.addEventListener('click', handleClick, { passive: true });

      // Store cleanup functions
      cleanupFunctionsRef.current.push(() => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('click', handleClick);
      });

      return marker;
    },
    [NodeType, selectedNode, isDarkMode, isDesktop, handleNodeSelection],
  );

  // Helper function for creating clustered markers
  const createClusteredMarker = useCallback(
    (el, feature, map, zoom) => {
      el.style.zIndex = '444';
      el.className =
        'clustered flex justify-center items-center bg-white rounded-full p-2 shadow-md';

      const mostCommonAQIs = getTwoMostCommonAQIs(feature);
      feature.properties.aqi = mostCommonAQIs;
      el.innerHTML = createClusterNode({ feature, NodeType, isDarkMode });

      const marker = new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);

      const handleClick = () => {
        map.flyTo({
          center: feature.geometry.coordinates,
          zoom: zoom + 2,
        });
      };

      el.addEventListener('click', handleClick, { passive: true });

      cleanupFunctionsRef.current.push(() => {
        el.removeEventListener('click', handleClick);
      });

      return marker;
    },
    [getTwoMostCommonAQIs, NodeType, isDarkMode],
  );

  // Initialize Supercluster
  const initSupercluster = useCallback(() => {
    if (!indexRef.current) {
      indexRef.current = new Supercluster({
        radius: clusterRadius,
        maxZoom: 20,
        minPoints: 2,
      });
    }
  }, [clusterRadius]);

  // Update map data
  const updateMapData = useCallback(
    (data) => {
      if (!Array.isArray(data) || data.length === 0 || !mapRef.current) return;

      initSupercluster();
      indexRef.current.load(data);
      clusterUpdate();
    },
    [clusterUpdate, initSupercluster],
  );

  // Optimized map readings fetch
  const fetchMapReadings = useCallback(async () => {
    const now = Date.now();
    const cacheKey = `mapReadings_${pollutant}`;

    // Check cache first
    if (
      mapReadingsData?.length &&
      now - lastFetchTimeRef.current < CONSTANTS.CACHE_DURATION
    ) {
      const combined = [...mapReadingsData, ...waqData];
      updateMapData(combined);
      return combined;
    }

    setLoading(true);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await getMapReadings(abortControllerRef.current.signal);

      if (!response?.success || !response.measurements?.length) {
        throw new Error('Invalid response data');
      }

      // Process data efficiently
      const features = response.measurements
        .filter(
          (item) =>
            item?.siteDetails &&
            item[pollutant]?.value !== undefined &&
            item.siteDetails.approximate_longitude &&
            item.siteDetails.approximate_latitude,
        )
        .map((item) => {
          const aqi = getAQICategory(pollutant, item[pollutant].value);
          return createFeature(
            item.siteDetails._id,
            item.siteDetails.name,
            [
              item.siteDetails.approximate_longitude,
              item.siteDetails.approximate_latitude,
            ],
            aqi,
            item.no2?.value,
            item.pm10?.value,
            item.pm2_5?.value,
            item.time,
            null,
          );
        });

      // Update cache
      lastFetchTimeRef.current = now;
      mapDataCacheRef.current.set(cacheKey, features);

      dispatch(setMapReadingsData(features));
      updateMapData(features);
      return features;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching map readings:', error);

        // Try cached data as fallback
        const cachedData = mapDataCacheRef.current.get(cacheKey);
        if (cachedData?.length) {
          updateMapData(cachedData);
          return cachedData;
        }
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [
    createFeature,
    dispatch,
    pollutant,
    setLoading,
    mapReadingsData,
    waqData,
    updateMapData,
  ]);

  // Optimized WAQ data fetching
  const fetchWaqData = useCallback(
    async (cities) => {
      if (!Array.isArray(cities) || cities.length === 0) return [];

      setIsWaqLoading(true);
      setLoadingOthers(true);

      // Cancel previous requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const results = [];

        // Process cities in optimized batches
        for (
          let i = 0;
          i < cities.length;
          i += CONSTANTS.BATCH_SIZE * CONSTANTS.MAX_CONCURRENT_BATCHES
        ) {
          const chunks = [];

          // Create concurrent batches
          for (let j = 0; j < CONSTANTS.MAX_CONCURRENT_BATCHES; j++) {
            const startIndex = i + j * CONSTANTS.BATCH_SIZE;
            const endIndex = Math.min(
              startIndex + CONSTANTS.BATCH_SIZE,
              cities.length,
            );

            if (startIndex < cities.length) {
              chunks.push(cities.slice(startIndex, endIndex));
            }
          }

          // Process chunks concurrently
          const chunkPromises = chunks.map(async (batch) => {
            const batchPromises = batch.map((city) =>
              fetchCityData(city, abortControllerRef.current.signal),
            );
            return Promise.allSettled(batchPromises);
          });

          const chunkResults = await Promise.all(chunkPromises);
          const validResults = chunkResults
            .flat()
            .filter((result) => result.status === 'fulfilled' && result.value)
            .map((result) => result.value);

          results.push(...validResults);

          // Add delay between batch groups to prevent rate limiting
          if (
            i + CONSTANTS.BATCH_SIZE * CONSTANTS.MAX_CONCURRENT_BATCHES <
            cities.length
          ) {
            await new Promise((resolve) =>
              setTimeout(resolve, CONSTANTS.BATCH_DELAY),
            );
          }
        }

        dispatch(setWaqData(results));
        return results;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching WAQ data:', error);
        }
        return [];
      } finally {
        setIsWaqLoading(false);
        setLoadingOthers(false);
      }
    },
    [
      createFeature,
      dispatch,
      getForecastForPollutant,
      pollutant,
      setLoadingOthers,
    ],
  );

  // Helper function for fetching individual city data
  const fetchCityData = useCallback(
    async (city, signal) => {
      try {
        const response = await axios.get(
          `/api/waqi?city=${encodeURIComponent(city)}`,
          {
            signal,
            timeout: CONSTANTS.REQUEST_TIMEOUT,
          },
        );

        const cityData = response.data?.data;
        if (!cityData?.city?.geo || !cityData.iaqi) return null;

        const key = pollutant === 'pm2_5' ? 'pm25' : pollutant;
        const pollutantValue = cityData.iaqi[key]?.v;

        if (pollutantValue === undefined) return null;

        const aqi = getAQICategory(pollutant, pollutantValue);
        return createFeature(
          cityData.idx,
          cityData.city.name,
          [cityData.city.geo[1], cityData.city.geo[0]],
          aqi,
          cityData.iaqi.no2?.v,
          cityData.iaqi.pm10?.v,
          cityData.iaqi.pm25?.v,
          cityData.time?.iso,
          getForecastForPollutant(cityData),
        );
      } catch {
        // Silent fail for individual cities to prevent spam
        return null;
      }
    },
    [createFeature, getForecastForPollutant, pollutant],
  );

  // Main data processing function
  const fetchAndProcessAllData = useCallback(async () => {
    try {
      const [mapResult, waqResult] = await Promise.allSettled([
        fetchMapReadings(),
        fetchWaqData(AQI_FOR_CITIES),
      ]);

      const mapFeatures =
        mapResult.status === 'fulfilled' ? mapResult.value : [];
      const waqFeatures =
        waqResult.status === 'fulfilled' ? waqResult.value : [];

      if (mapFeatures.length || waqFeatures.length) {
        updateMapData([...mapFeatures, ...waqFeatures]);
      }
    } catch (error) {
      console.error('Error processing all data:', error);
    }
  }, [fetchMapReadings, fetchWaqData, updateMapData]);

  // Setup map event listeners
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    initSupercluster();

    const combined = [...(mapReadingsData || []), ...(waqData || [])];
    if (combined.length) {
      updateMapData(combined);
    }

    const handleMapEvent = () => clusterUpdate();

    map.on('zoomend', handleMapEvent);
    map.on('moveend', handleMapEvent);

    return () => {
      map.off('zoomend', handleMapEvent);
      map.off('moveend', handleMapEvent);
      clearMarkers();

      // Clean up event listeners
      cleanupFunctionsRef.current.forEach((cleanup) => cleanup());
      cleanupFunctionsRef.current = [];

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [
    clusterUpdate,
    mapReadingsData,
    waqData,
    updateMapData,
    initSupercluster,
    clearMarkers,
  ]);

  // Handle NodeType changes
  useEffect(() => {
    if (indexRef.current) {
      indexRef.current = new Supercluster({
        radius: clusterRadius,
        maxZoom: 20,
        minPoints: 2,
      });

      const combined = [...(mapReadingsData || []), ...(waqData || [])];
      if (combined.length) {
        updateMapData(combined);
      }
    }
  }, [clusterRadius, mapReadingsData, waqData, updateMapData]);

  return {
    mapRef,
    fetchAndProcessData: fetchAndProcessAllData,
    clusterUpdate,
    isWaqLoading,
    updateMapData,
  };
};

export default useMapData;
