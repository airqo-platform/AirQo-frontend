import { useCallback, useRef, useEffect, useState } from 'react';
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
  images,
} from '../components/MapNodes';

const useMapData = ({
  NodeType,
  pollutant,
  setLoading,
  setLoadingOthers,
  isDarkMode,
}) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const indexRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [isWaqLoading, setIsWaqLoading] = useState(false);

  // Add caching for better performance
  const mapDataCacheRef = useRef(new Map());
  const lastFetchTimeRef = useRef(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  const dispatch = useDispatch();
  const mapReadingsData = useSelector((state) => state.map.mapReadingsData);
  const waqData = useSelector((state) => state.map.waqData);
  const selectedNode = useSelector((state) => state.map.selectedNode);

  const getClusterRadius = () =>
    NodeType === 'Emoji' ? 40 : NodeType === 'Node' ? 60 : 80;

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

  const getForecastForPollutant = useCallback(
    (cityData) => {
      if (!cityData?.forecast?.daily) return null;
      const key = pollutant === 'pm2_5' ? 'pm25' : pollutant;
      return cityData.forecast.daily[key]?.map((data) => ({
        [pollutant]: data.avg,
        time: data.day,
      }));
    },
    [pollutant],
  );

  const getTwoMostCommonAQIs = useCallback((cluster) => {
    if (!indexRef.current) return [];
    const leaves = indexRef.current.getLeaves(
      cluster.properties.cluster_id,
      Infinity,
    );
    const counts = new Map();
    leaves.forEach((leaf) => {
      const aqi = leaf.properties.airQuality;
      if (aqi) counts.set(aqi, (counts.get(aqi) || 0) + 1);
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return [];
    const tops =
      sorted.length > 1 ? [sorted[0][0], sorted[1][0]] : [sorted[0][0]];
    return leaves
      .filter((leaf) => tops.includes(leaf.properties.airQuality))
      .map((leaf) => ({
        aqi: leaf.properties.aqi,
        pm2_5: leaf.properties.pm2_5,
        pm10: leaf.properties.pm10,
        no2: leaf.properties.no2,
      }));
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  }, []);

  // Use flyTo with zoom 16 when a marker is selected.
  const handleNodeSelection = useCallback(
    (feature) => {
      if (selectedNode === feature.properties._id) return;
      dispatch(setSelectedNode(feature.properties._id));
      dispatch(setSelectedWeeklyPrediction(null));
      dispatch(setOpenLocationDetails(true));
      dispatch(setSelectedLocation(feature.properties));
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: feature.geometry.coordinates,
          zoom: 16,
          speed: 0.8,
          curve: 1.5,
          easing: (t) => t,
        });
      }
    },
    [dispatch, selectedNode],
  ); // Optimized cluster update with debouncing and performance improvements
  const clusterUpdate = useCallback(
    debounce(() => {
      const map = mapRef.current;
      if (!map || !indexRef.current) return;

      try {
        const zoom = map.getZoom();
        const bbox = [
          map.getBounds().getWest(),
          map.getBounds().getSouth(),
          map.getBounds().getEast(),
          map.getBounds().getNorth(),
        ];
        const clusters = indexRef.current.getClusters(bbox, Math.floor(zoom));

        // Clear existing markers efficiently
        clearMarkers();

        const newMarkers = [];

        clusters.forEach((feature) => {
          const el = document.createElement('div');
          el.style.cursor = 'pointer';

          if (!feature.properties.cluster) {
            el.style.zIndex = '1';
            el.innerHTML = UnclusteredNode({
              feature,
              NodeType,
              selectedNode,
              isDarkMode,
            });

            // Only create popup for desktop to improve performance
            let popup = null;
            if (typeof window !== 'undefined' && window.innerWidth > 768) {
              popup = new mapboxgl.Popup({
                offset:
                  NodeType === 'Node' ? 35 : NodeType === 'Number' ? 42 : 58,
                closeButton: false,
                maxWidth: 'none',
                className: 'my-custom-popup hidden md:block',
              }).setHTML(createPopupHTML({ feature, images, isDarkMode }));
            }

            const marker = new mapboxgl.Marker(el).setLngLat(
              feature.geometry.coordinates,
            );

            if (popup) marker.setPopup(popup);
            marker.addTo(map);

            // Use passive event listeners for better performance
            el.addEventListener(
              'mouseenter',
              () => {
                if (popup) marker.togglePopup();
                el.style.zIndex = '9999';
              },
              { passive: true },
            );

            el.addEventListener(
              'mouseleave',
              () => {
                if (popup) marker.togglePopup();
                el.style.zIndex = '1';
              },
              { passive: true },
            );

            el.addEventListener('click', () => handleNodeSelection(feature), {
              passive: true,
            });
            newMarkers.push(marker);
          } else {
            el.style.zIndex = '444';
            el.className =
              'clustered flex justify-center items-center bg-white rounded-full p-2 shadow-md';
            const mostCommonAQIs = getTwoMostCommonAQIs(feature);
            feature.properties.aqi = mostCommonAQIs;
            el.innerHTML = createClusterNode({ feature, NodeType, isDarkMode });

            const marker = new mapboxgl.Marker(el)
              .setLngLat(feature.geometry.coordinates)
              .addTo(map);

            el.addEventListener(
              'click',
              () =>
                map.flyTo({
                  center: feature.geometry.coordinates,
                  zoom: zoom + 2,
                }),
              { passive: true },
            );
            newMarkers.push(marker);
          }
        });

        markersRef.current = newMarkers;
      } catch (error) {
        console.error('Error updating clusters:', error);
      }
    }, 150), // Debounce cluster updates by 150ms
    [
      clearMarkers,
      getTwoMostCommonAQIs,
      handleNodeSelection,
      NodeType,
      selectedNode,
      isDarkMode,
    ],
  );

  const initSupercluster = useCallback(() => {
    if (!indexRef.current) {
      indexRef.current = new Supercluster({
        radius: getClusterRadius(),
        maxZoom: 20,
      });
    }
  }, [NodeType]);

  const updateMapData = useCallback(
    (data) => {
      if (!data?.length || !mapRef.current) return;
      initSupercluster();
      indexRef.current.load(data);
      clusterUpdate();
    },
    [clusterUpdate, initSupercluster],
  );
  // Optimized fetch and cache map readings with performance improvements
  const fetchMapReadings = useCallback(async () => {
    // Check if we have cached data and it's still fresh
    const now = Date.now();
    const cacheKey = `mapReadings_${pollutant}`;

    if (
      mapReadingsData?.length &&
      now - lastFetchTimeRef.current < CACHE_DURATION
    ) {
      const combined = [...mapReadingsData, ...waqData];
      updateMapData(combined);
      return combined;
    }

    setLoading(true);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const response = await getMapReadings(abortControllerRef.current.signal);
      if (!response.success || !response.measurements?.length) {
        throw new Error('No valid map readings data found.');
      }

      // Filter and process data more efficiently
      const features = response.measurements
        .filter((item) => {
          // More efficient filtering with early returns
          if (!item.siteDetails) return false;
          if (!item[pollutant]?.value) return false;
          if (
            !item.siteDetails.approximate_longitude ||
            !item.siteDetails.approximate_latitude
          )
            return false;
          return true;
        })
        .map((item) => {
          const aqi = getAQICategory(pollutant, item[pollutant]?.value);
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

      // Cache the results
      lastFetchTimeRef.current = now;
      mapDataCacheRef.current.set(cacheKey, features);

      dispatch(setMapReadingsData(features));
      updateMapData(features);
      return features;
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Try to use cached data as fallback
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
    CACHE_DURATION,
    lastFetchTimeRef,
    mapDataCacheRef,
  ]); // Optimized WAQ data fetching with better performance
  const fetchWaqData = useCallback(
    async (cities) => {
      if (!cities?.length) return [];

      setIsWaqLoading(true);
      setLoadingOthers(true);

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        // Increase batch size and optimize concurrent processing
        const BATCH_SIZE = 10; // Increased from 5 to 10
        const results = [];
        const MAX_CONCURRENT_BATCHES = 3; // Process multiple batches concurrently

        // Process cities in chunks with concurrent batching
        for (
          let i = 0;
          i < cities.length;
          i += BATCH_SIZE * MAX_CONCURRENT_BATCHES
        ) {
          const chunks = [];

          // Create multiple batches to process concurrently
          for (let j = 0; j < MAX_CONCURRENT_BATCHES; j++) {
            const startIndex = i + j * BATCH_SIZE;
            const endIndex = Math.min(startIndex + BATCH_SIZE, cities.length);

            if (startIndex < cities.length) {
              const batch = cities.slice(startIndex, endIndex);
              chunks.push(batch);
            }
          }

          // Process all chunks concurrently
          const chunkPromises = chunks.map(async (batch) => {
            const batchPromises = batch.map((city) =>
              axios
                .get(`/api/waqi?city=${encodeURIComponent(city)}`, {
                  signal: abortControllerRef.current.signal,
                  timeout: 12000, // Increased timeout to 12 seconds
                })
                .then((response) => {
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
                })
                .catch((error) => {
                  if (error.name !== 'AbortError') {
                    // Silently handle errors to prevent console spam
                    // Only log critical errors
                    if (
                      error.code !== 'ECONNABORTED' &&
                      error.response?.status !== 404
                    ) {
                      // Could add error reporting here if needed
                    }
                  }
                  return null;
                }),
            );

            return Promise.all(batchPromises);
          });

          const chunkResults = await Promise.all(chunkPromises);
          const flatResults = chunkResults.flat().filter(Boolean);
          results.push(...flatResults);

          // Shorter delay between chunk groups
          if (i + BATCH_SIZE * MAX_CONCURRENT_BATCHES < cities.length) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        }

        dispatch(setWaqData(results));
        return results;
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Only log critical errors
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
  // Memoized and optimized main data processing function
  const fetchAndProcessAllData = useCallback(async () => {
    try {
      // Start both operations concurrently for better performance
      const [mapFeatures, waqFeatures] = await Promise.allSettled([
        fetchMapReadings(),
        fetchWaqData(AQI_FOR_CITIES), // Load ALL cities, not just first 20
      ]);

      const mapResult =
        mapFeatures.status === 'fulfilled' ? mapFeatures.value : [];
      const waqResult =
        waqFeatures.status === 'fulfilled' ? waqFeatures.value : [];

      if (mapResult.length || waqResult.length) {
        updateMapData([...mapResult, ...waqResult]);
      }
    } catch {
      // Handle errors gracefully without breaking the map
    }
  }, [fetchMapReadings, fetchWaqData, updateMapData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    initSupercluster();
    const combined = [...(mapReadingsData || []), ...(waqData || [])];
    if (combined.length) updateMapData(combined);
    const onMoveOrZoom = () => clusterUpdate();
    map.on('zoomend', onMoveOrZoom);
    map.on('moveend', onMoveOrZoom);
    return () => {
      map.off('zoomend', onMoveOrZoom);
      map.off('moveend', onMoveOrZoom);
      clearMarkers();
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

  useEffect(() => {
    if (indexRef.current) {
      indexRef.current = new Supercluster({
        radius: getClusterRadius(),
        maxZoom: 20,
      });
      const combined = [...(mapReadingsData || []), ...(waqData || [])];
      if (combined.length) updateMapData(combined);
    }
  }, [NodeType, mapReadingsData, waqData, updateMapData]);

  return {
    mapRef,
    fetchAndProcessData: fetchAndProcessAllData,
    clusterUpdate,
    isWaqLoading,
    updateMapData,
  };
};

export default useMapData;
