import { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Supercluster from 'supercluster';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
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

// Enhanced constants for better performance
const CONSTANTS = {
  CLUSTER_RADIUS: {
    EMOJI: 40,
    NODE: 60,
    DEFAULT: 80,
  },
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  DEBOUNCE_DELAY: 100,
  POPUP_OFFSET: {
    NODE: 35,
    NUMBER: 42,
    DEFAULT: 58,
  },
  MAP_READINGS: {
    TIMEOUT: 8000,
    RETRY_ATTEMPTS: 2,
  },
  WAQ_API: {
    BATCH_SIZE: 8,
    MAX_CONCURRENT_BATCHES: 3,
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 1,
  },
  MIN_DESKTOP_WIDTH: 768,
};

const useMapData = (params = {}) => {
  const {
    pollutant = 'pm2_5',
    isDarkMode = false,
    onMapReadingLoadingChange,
    onWaqiLoadingChange,
  } = params;

  // Parameter validation
  if (!params || typeof params !== 'object') {
    console.warn('useMapData: Invalid parameters provided, using defaults');
  }

  // Enhanced loading states
  const [mapReadingLoading, setMapReadingLoading] = useState(false);
  const [waqiLoading, setWaqiLoading] = useState(false);
  const [errors, setErrors] = useState({
    mapReading: null,
    waqi: null,
  });

  // Notify parent about loading state changes
  useEffect(() => {
    onMapReadingLoadingChange?.(mapReadingLoading);
  }, [mapReadingLoading, onMapReadingLoadingChange]);

  useEffect(() => {
    onWaqiLoadingChange?.(waqiLoading);
  }, [waqiLoading, onWaqiLoadingChange]);

  // Performance optimized refs
  const mapRef = useRef(null);
  const markersRef = useRef(new Set());
  const indexRef = useRef(null);
  const abortControllersRef = useRef({
    mapReading: null,
    waqi: null,
  });
  const cacheRef = useRef({
    mapReadings: { data: null, timestamp: 0 },
    waqData: { data: null, timestamp: 0 },
  });
  const cleanupFunctionsRef = useRef(new Set());
  const clusterUpdateTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Add ref to track current combined data
  const currentCombinedDataRef = useRef([]);

  // Redux
  const dispatch = useDispatch();
  const { mapReadingsData, waqData, selectedNode, nodeType } = useSelector(
    (state) => ({
      mapReadingsData: state.map.mapReadingsData,
      waqData: state.map.waqData,
      selectedNode: state.map.selectedNode,
      nodeType: state.map.nodeType || 'Emoji', // Default to Emoji
    }),
  );

  // Use nodeType from Redux store instead of prop
  const NodeType = nodeType;

  // Memoized computed values with proper validation
  const clusterRadius = useMemo(() => {
    if (!NodeType || typeof NodeType !== 'string') {
      console.warn('useMapData: Invalid NodeType, using default');
      return CONSTANTS.CLUSTER_RADIUS.DEFAULT;
    }

    const radiusMap = {
      Emoji: CONSTANTS.CLUSTER_RADIUS.EMOJI,
      Node: CONSTANTS.CLUSTER_RADIUS.NODE,
    };
    return radiusMap[NodeType] || CONSTANTS.CLUSTER_RADIUS.DEFAULT;
  }, [NodeType]);

  const isDesktop = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      window.innerWidth > CONSTANTS.MIN_DESKTOP_WIDTH
    );
  }, []);

  // Enhanced error handling
  const handleError = useCallback((type, error) => {
    console.error(`${type} error:`, error);
    setErrors((prev) => ({ ...prev, [type]: error.message }));
  }, []);

  // Optimized feature creation with validation
  const createFeature = useCallback(
    (id, name, coordinates, aqi, no2, pm10, pm2_5, time, forecast) => {
      if (
        !id ||
        !name ||
        !Array.isArray(coordinates) ||
        coordinates.length !== 2
      ) {
        return null;
      }

      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates },
        properties: {
          _id: id,
          location: name,
          airQuality: aqi?.category,
          no2: no2 || null,
          pm10: pm10 || null,
          pm2_5: pm2_5 || null,
          time: time || null,
          aqi: aqi || 'undefined',
          forecast: forecast || null,
        },
      };
    },
    [],
  );

  // Enhanced forecast extraction with error handling
  const getForecastForPollutant = useCallback(
    (cityData) => {
      try {
        if (!cityData?.forecast?.daily || !pollutant) return null;

        if (typeof pollutant !== 'string') {
          console.warn('useMapData: Invalid pollutant type');
          return null;
        }

        const key = pollutant === 'pm2_5' ? 'pm25' : pollutant;
        const dailyData = cityData.forecast.daily[key];

        if (!Array.isArray(dailyData)) return null;

        return dailyData
          .filter((data) => data && typeof data === 'object')
          .map((data) => ({
            [pollutant]: data.avg,
            time: data.day,
          }));
      } catch (error) {
        console.warn('Error extracting forecast:', error);
        return null;
      }
    },
    [pollutant],
  );

  // Optimized cluster AQI calculation with WeakMap caching
  const clusterAQICache = useRef(new WeakMap());
  const getTwoMostCommonAQIs = useCallback((cluster) => {
    if (!indexRef.current) return [];

    if (clusterAQICache.current.has(cluster)) {
      return clusterAQICache.current.get(cluster);
    }

    try {
      const leaves = indexRef.current.getLeaves(
        cluster.properties.cluster_id,
        Infinity,
      );
      const aqiCounts = new Map();

      for (const leaf of leaves) {
        const aqi = leaf.properties.airQuality;
        if (aqi) {
          aqiCounts.set(aqi, (aqiCounts.get(aqi) || 0) + 1);
        }
      }

      if (aqiCounts.size === 0) return [];

      const sortedAQIs = [...aqiCounts.entries()]
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([aqi]) => aqi);

      const result = leaves
        .filter((leaf) => sortedAQIs.includes(leaf.properties.airQuality))
        .map((leaf) => ({
          aqi: leaf.properties.aqi,
          pm2_5: leaf.properties.pm2_5,
          pm10: leaf.properties.pm10,
          no2: leaf.properties.no2,
        }));

      clusterAQICache.current.set(cluster, result);
      return result;
    } catch (error) {
      console.warn('Error calculating cluster AQI:', error);
      return [];
    }
  }, []);

  // Enhanced marker cleanup
  const clearMarkers = useCallback(() => {
    if (markersRef.current.size === 0) return;

    const markers = [...markersRef.current];
    markersRef.current.clear();

    const cleanup = (deadline) => {
      while (markers.length > 0 && deadline.timeRemaining() > 1) {
        const marker = markers.pop();
        try {
          if (marker) {
            marker.remove();
          }
        } catch (error) {
          console.warn('Marker cleanup error:', error);
        }
      }

      if (markers.length > 0) {
        requestIdleCallback(cleanup);
      }
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(cleanup);
    } else {
      requestAnimationFrame(() => {
        markers.forEach((marker) => {
          try {
            if (marker) {
              marker.remove();
            }
          } catch (error) {
            console.warn('Marker cleanup error:', error);
          }
        });
      });
    }
  }, []);

  // Enhanced node selection
  const handleNodeSelection = useCallback(
    (feature) => {
      if (!feature?.properties?._id || selectedNode === feature.properties._id)
        return;

      requestAnimationFrame(() => {
        dispatch(setSelectedNode(feature.properties._id));
        dispatch(setSelectedWeeklyPrediction(null));
        dispatch(setOpenLocationDetails(true));
        dispatch(setSelectedLocation(feature.properties));
      });

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: feature.geometry.coordinates,
          zoom: 16,
          speed: 0.8,
          curve: 1.2,
          easing: (t) => t * (2 - t),
        });
      }
    },
    [dispatch, selectedNode],
  );

  // Enhanced marker creation
  const createUnclusteredMarker = useCallback(
    (el, feature, map) => {
      try {
        if (!el || !feature || !map) {
          console.warn('createUnclusteredMarker: Missing required parameters');
          return null;
        }

        el.style.zIndex = '1';
        el.innerHTML = UnclusteredNode({
          feature,
          NodeType: NodeType || 'Node',
          selectedNode,
          isDarkMode: isDarkMode || false,
        });

        let popup = null;
        if (isDesktop) {
          const offset =
            CONSTANTS.POPUP_OFFSET[NodeType] || CONSTANTS.POPUP_OFFSET.DEFAULT;
          popup = new mapboxgl.Popup({
            offset,
            closeButton: false,
            maxWidth: 'none',
            className: 'my-custom-popup hidden md:block',
          }).setHTML(
            createPopupHTML({
              feature,
              images,
              isDarkMode: isDarkMode || false,
            }),
          );
        }

        const marker = new mapboxgl.Marker(el)
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);

        if (popup) {
          marker.setPopup(popup);
        }

        const handleMouseEnter = () => {
          if (popup && !popup.isOpen()) {
            popup.addTo(map);
          }
          el.style.zIndex = '9999';
        };

        const handleMouseLeave = () => {
          if (popup && popup.isOpen()) {
            popup.remove();
          }
          el.style.zIndex = '1';
        };

        const handleClick = () => {
          handleNodeSelection(feature);
        };

        el.addEventListener('mouseenter', handleMouseEnter, { passive: true });
        el.addEventListener('mouseleave', handleMouseLeave, { passive: true });
        el.addEventListener('click', handleClick, { passive: true });

        const cleanup = () => {
          el.removeEventListener('mouseenter', handleMouseEnter);
          el.removeEventListener('mouseleave', handleMouseLeave);
          el.removeEventListener('click', handleClick);
        };
        cleanupFunctionsRef.current.add(cleanup);

        return marker;
      } catch (error) {
        console.error('Error creating unclustered marker:', error);
        return null;
      }
    },
    [NodeType, selectedNode, isDarkMode, isDesktop, handleNodeSelection],
  );

  const createClusteredMarker = useCallback(
    (el, feature, map, zoom) => {
      try {
        if (!el || !feature || !map) {
          console.warn('createClusteredMarker: Missing required parameters');
          return null;
        }

        el.style.zIndex = '444';
        el.className =
          'clustered flex justify-center items-center bg-white rounded-full p-2 shadow-md';

        const mostCommonAQIs = getTwoMostCommonAQIs(feature);
        feature.properties.aqi = mostCommonAQIs;
        el.innerHTML = createClusterNode({
          feature,
          NodeType: NodeType || 'Node',
          isDarkMode: isDarkMode || false,
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);

        const handleClick = () => {
          map.flyTo({
            center: feature.geometry.coordinates,
            zoom: Math.min((zoom || 10) + 2, 20),
          });
        };

        el.addEventListener('click', handleClick, { passive: true });

        const cleanup = () => {
          el.removeEventListener('click', handleClick);
        };
        cleanupFunctionsRef.current.add(cleanup);

        return marker;
      } catch (error) {
        console.error('Error creating clustered marker:', error);
        return null;
      }
    },
    [getTwoMostCommonAQIs, NodeType, isDarkMode],
  );

  // Enhanced cluster update with better debouncing
  const clusterUpdate = useCallback(() => {
    if (clusterUpdateTimeoutRef.current) {
      clearTimeout(clusterUpdateTimeoutRef.current);
    }

    clusterUpdateTimeoutRef.current = setTimeout(() => {
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
        clearMarkers();

        const createMarkersInBatch = (startIndex = 0) => {
          const batchSize = 10;
          const endIndex = Math.min(startIndex + batchSize, clusters.length);

          for (let i = startIndex; i < endIndex; i++) {
            const feature = clusters[i];
            const el = document.createElement('div');
            el.style.cursor = 'pointer';

            let marker = null;
            if (!feature.properties.cluster) {
              marker = createUnclusteredMarker(el, feature, map);
            } else {
              marker = createClusteredMarker(el, feature, map, zoom);
            }

            if (marker) {
              markersRef.current.add(marker);
            }
          }

          if (endIndex < clusters.length) {
            requestAnimationFrame(() => createMarkersInBatch(endIndex));
          }
        };

        createMarkersInBatch();
      } catch (error) {
        console.error('Error updating clusters:', error);
      }
    }, CONSTANTS.DEBOUNCE_DELAY);
  }, [createUnclusteredMarker, createClusteredMarker, clearMarkers]);

  // Initialize Supercluster
  const initSupercluster = useCallback(() => {
    try {
      if (!indexRef.current) {
        indexRef.current = new Supercluster({
          radius: clusterRadius,
          maxZoom: 20,
          minPoints: 2,
        });
      }
    } catch (error) {
      console.error('Error initializing Supercluster:', error);
    }
  }, [clusterRadius]);

  // FIXED: Enhanced update map data that always preserves existing data
  const updateMapData = useCallback(
    (newData, replaceAll = false) => {
      if (!mapRef.current) return;

      try {
        initSupercluster();

        let finalData = [];

        if (replaceAll) {
          // Complete replacement - use new data as is
          finalData = Array.isArray(newData) ? newData : [];
        } else {
          // Merge mode - preserve existing data and add new data
          const existingData = currentCombinedDataRef.current || [];
          const newDataArray = Array.isArray(newData) ? newData : [];

          // Create a Map to avoid duplicates based on _id
          const dataMap = new Map();

          // Add existing data first
          existingData.forEach((feature) => {
            if (feature?.properties?._id) {
              dataMap.set(feature.properties._id, feature);
            }
          });

          // Add or update with new data
          newDataArray.forEach((feature) => {
            if (feature?.properties?._id) {
              dataMap.set(feature.properties._id, feature);
            }
          });

          finalData = Array.from(dataMap.values());
        }

        // Validate features
        const validFeatures = finalData.filter(
          (feature) =>
            feature &&
            feature.type === 'Feature' &&
            feature.geometry &&
            feature.properties &&
            feature.properties._id,
        );

        // Update the current combined data reference
        currentCombinedDataRef.current = validFeatures;

        if (validFeatures.length > 0) {
          indexRef.current.load(validFeatures);
          clusterUpdate();
        }
      } catch (error) {
        console.error('Error updating map data:', error);
      }
    },
    [clusterUpdate, initSupercluster],
  );

  // Enhanced map readings fetch
  const fetchMapReadings = useCallback(async () => {
    const cacheKey = 'mapReadings';
    const now = Date.now();

    // Check cache first
    if (
      cacheRef.current[cacheKey].data &&
      now - cacheRef.current[cacheKey].timestamp < CONSTANTS.CACHE_DURATION
    ) {
      const cachedData = cacheRef.current[cacheKey].data;
      return cachedData;
    }

    setMapReadingLoading(true);
    setErrors((prev) => ({ ...prev, mapReading: null }));

    // Cancel previous request
    if (abortControllersRef.current.mapReading) {
      abortControllersRef.current.mapReading.abort();
    }
    abortControllersRef.current.mapReading = new AbortController();

    let retryCount = 0;
    const maxRetries = CONSTANTS.MAP_READINGS.RETRY_ATTEMPTS;

    const attemptFetch = async () => {
      try {
        const response = await Promise.race([
          getMapReadings(abortControllersRef.current.mapReading.signal),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Request timeout')),
              CONSTANTS.MAP_READINGS.TIMEOUT,
            ),
          ),
        ]);

        if (!response?.success || !response.measurements?.length) {
          throw new Error('Invalid response data');
        }

        const features = response.measurements.reduce((acc, item) => {
          if (
            !item?.siteDetails ||
            !pollutant ||
            item[pollutant]?.value === undefined ||
            !item.siteDetails.approximate_longitude ||
            !item.siteDetails.approximate_latitude
          ) {
            return acc;
          }

          const aqi = getAQICategory(pollutant, item[pollutant].value);
          const feature = createFeature(
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

          if (feature) {
            acc.push(feature);
          }
          return acc;
        }, []);

        // Update cache
        cacheRef.current[cacheKey] = { data: features, timestamp: now };
        dispatch(setMapReadingsData(features));

        return features;
      } catch (error) {
        if (error.name === 'AbortError') {
          return [];
        }

        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(
            `Map readings fetch failed, retrying (${retryCount}/${maxRetries}):`,
            error.message,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount),
          );
          return attemptFetch();
        }

        handleError('mapReading', error);

        // Try to use cached data as fallback
        const cachedData = cacheRef.current[cacheKey].data;
        if (cachedData?.length) {
          return cachedData;
        }

        return [];
      }
    };

    try {
      return await attemptFetch();
    } finally {
      setMapReadingLoading(false);
    }
  }, [createFeature, dispatch, pollutant, handleError]);

  // Enhanced city data fetch
  const fetchCityData = useCallback(
    async (city, signal) => {
      try {
        const response = await Promise.race([
          axios.get(`/api/waqi?city=${encodeURIComponent(city)}`, { signal }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Request timeout')),
              CONSTANTS.WAQ_API.TIMEOUT,
            ),
          ),
        ]);

        const cityData = response.data?.data;
        if (
          !cityData?.city?.geo ||
          !cityData.iaqi ||
          !Array.isArray(cityData.city.geo) ||
          !pollutant
        ) {
          return null;
        }

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
        return null; // Silent fail for individual cities
      }
    },
    [createFeature, getForecastForPollutant, pollutant],
  );

  // FIXED: Enhanced WAQ data fetching - fetch ALL data first, then update map once
  const fetchWaqData = useCallback(
    async (cities) => {
      if (!Array.isArray(cities) || cities.length === 0) return [];

      setWaqiLoading(true);
      setErrors((prev) => ({ ...prev, waqi: null }));

      // Cancel previous requests
      if (abortControllersRef.current.waqi) {
        abortControllersRef.current.waqi.abort();
      }
      abortControllersRef.current.waqi = new AbortController();

      try {
        const allResults = [];
        const { BATCH_SIZE, MAX_CONCURRENT_BATCHES } = CONSTANTS.WAQ_API;

        console.log('Starting WAQ data fetch for', cities.length, 'cities');

        // Process all cities in batches but collect ALL results before updating map
        for (
          let i = 0;
          i < cities.length;
          i += BATCH_SIZE * MAX_CONCURRENT_BATCHES
        ) {
          const chunks = [];

          // Create concurrent batches
          for (let j = 0; j < MAX_CONCURRENT_BATCHES; j++) {
            const startIndex = i + j * BATCH_SIZE;
            const endIndex = Math.min(startIndex + BATCH_SIZE, cities.length);
            if (startIndex < cities.length) {
              chunks.push(cities.slice(startIndex, endIndex));
            }
          }

          // Process chunks concurrently
          const chunkPromises = chunks.map(async (batch) => {
            const batchPromises = batch.map((city) =>
              fetchCityData(city, abortControllersRef.current.waqi.signal),
            );

            try {
              const settled = await Promise.allSettled(batchPromises);
              return settled
                .filter(
                  (result) => result.status === 'fulfilled' && result.value,
                )
                .map((result) => result.value);
            } catch (error) {
              console.warn('Batch processing error:', error);
              return [];
            }
          });

          try {
            const chunkResults = await Promise.all(chunkPromises);
            const validResults = chunkResults.flat();
            allResults.push(...validResults);

            console.log(
              `Processed batch ${i / (BATCH_SIZE * MAX_CONCURRENT_BATCHES) + 1}, got ${validResults.length} results. Total so far: ${allResults.length}`,
            );

            // Small delay between batches to prevent overwhelming the API
            if (i + BATCH_SIZE * MAX_CONCURRENT_BATCHES < cities.length) {
              await new Promise((resolve) => setTimeout(resolve, 200));
            }
          } catch (error) {
            console.warn('Error processing chunks:', error);
          }
        }

        console.log(
          'WAQ data fetch completed. Total valid results:',
          allResults.length,
        );

        // Update Redux store with ALL WAQ data
        dispatch(setWaqData(allResults));

        return allResults;
      } catch (error) {
        if (error.name !== 'AbortError') {
          handleError('waqi', error);
        }
        return [];
      } finally {
        setWaqiLoading(false);
      }
    },
    [dispatch, fetchCityData, handleError],
  );

  // FIXED: Enhanced main data processing - fetch all data first, then combine and update map once
  const fetchAndProcessAllData = useCallback(async () => {
    try {
      console.log('Starting data fetch process...');

      // Fetch both data sources concurrently but wait for both to complete
      const [mapResult, waqResult] = await Promise.allSettled([
        fetchMapReadings(),
        fetchWaqData(AQI_FOR_CITIES),
      ]);

      const mapFeatures =
        mapResult.status === 'fulfilled' ? mapResult.value : [];
      const waqFeatures =
        waqResult.status === 'fulfilled' ? waqResult.value : [];

      console.log('Data fetch completed:', {
        mapFeatures: mapFeatures.length,
        waqFeatures: waqFeatures.length,
      });

      // Combine all data and update map ONCE with complete dataset
      const allFeatures = [...mapFeatures, ...waqFeatures];

      if (allFeatures.length > 0) {
        console.log('Updating map with', allFeatures.length, 'total features');
        updateMapData(allFeatures, true); // Use replaceAll=true to ensure clean state
      }

      isInitialLoadRef.current = false;
    } catch (error) {
      console.error('Error processing all data:', error);
    }
  }, [fetchMapReadings, fetchWaqData, updateMapData]);

  // Enhanced map event listeners
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    initSupercluster();

    // Load existing data if available
    const combined = [...(mapReadingsData || []), ...(waqData || [])];
    if (combined.length) {
      updateMapData(combined, true);
    }

    const handleMapEvent = () => {
      clusterUpdate();
    };

    map.on('zoomend', handleMapEvent);
    map.on('moveend', handleMapEvent);

    return () => {
      map.off('zoomend', handleMapEvent);
      map.off('moveend', handleMapEvent);

      clearMarkers();

      cleanupFunctionsRef.current.forEach((cleanup) => {
        cleanup();
      });
      cleanupFunctionsRef.current.clear();

      Object.values(abortControllersRef.current).forEach((controller) => {
        if (controller) {
          controller.abort();
        }
      });

      if (clusterUpdateTimeoutRef.current) {
        clearTimeout(clusterUpdateTimeoutRef.current);
        clusterUpdateTimeoutRef.current = null;
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

  // Handle NodeType changes efficiently
  useEffect(() => {
    if (indexRef.current) {
      clusterAQICache.current = new WeakMap();

      indexRef.current = new Supercluster({
        radius: clusterRadius,
        maxZoom: 20,
        minPoints: 2,
      });

      const combined = [...(mapReadingsData || []), ...(waqData || [])];
      if (combined.length) {
        updateMapData(combined, true);
      }
    }
  }, [clusterRadius, mapReadingsData, waqData, updateMapData]);

  // Enhanced cleanup function
  const cleanup = useCallback(() => {
    Object.entries(abortControllersRef.current).forEach(([key, controller]) => {
      if (controller) {
        controller.abort();
        abortControllersRef.current[key] = null;
      }
    });

    if (clusterUpdateTimeoutRef.current) {
      clearTimeout(clusterUpdateTimeoutRef.current);
      clusterUpdateTimeoutRef.current = null;
    }

    clearMarkers();
    cleanupFunctionsRef.current.forEach((cleanupFn) => {
      cleanupFn();
    });
    cleanupFunctionsRef.current.clear();

    // Clear caches
    cacheRef.current = {
      mapReadings: { data: null, timestamp: 0 },
      waqData: { data: null, timestamp: 0 },
    };
    clusterAQICache.current = new WeakMap();
    currentCombinedDataRef.current = [];

    // Reset loading states
    setMapReadingLoading(false);
    setWaqiLoading(false);
    setErrors({ mapReading: null, waqi: null });
  }, [clearMarkers]);

  // Helper function to clear errors
  const clearErrors = useCallback(() => {
    setErrors({ mapReading: null, waqi: null });
  }, []);

  return {
    mapRef,
    fetchAndProcessData: fetchAndProcessAllData,
    clusterUpdate,
    updateMapData,
    cleanup,
    // Enhanced loading states
    mapReadingLoading,
    waqiLoading,
    isLoading: mapReadingLoading || waqiLoading,
    errors,
    // Helper methods
    clearErrors,
  };
};

export default useMapData;
