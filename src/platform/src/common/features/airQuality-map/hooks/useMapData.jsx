import { useCallback, useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Supercluster from 'supercluster';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { getMapReadings } from '@/core/apis/DeviceRegistry';
import {
  setOpenLocationDetails,
  setSelectedLocation,
  setMapLoading,
  setCenter,
  setZoom,
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

  const dispatch = useDispatch();
  const mapReadingsData = useSelector((state) => state.map.mapReadingsData);
  const waqData = useSelector((state) => state.map.waqData);
  const selectedNode = useSelector((state) => state.map.selectedNode);

  const getClusterRadius = () => {
    return NodeType === 'Emoji' ? 40 : NodeType === 'Node' ? 60 : 80;
  };

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
        createdAt: time,
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
      const forecastKey = pollutant === 'pm2_5' ? 'pm25' : pollutant;
      const forecastData = cityData.forecast.daily[forecastKey];
      return forecastData?.map((data) => ({
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
    const aqiCounts = new Map();

    leaves.forEach((leaf) => {
      const aqi = leaf.properties.airQuality;
      if (aqi) {
        aqiCounts.set(aqi, (aqiCounts.get(aqi) || 0) + 1);
      }
    });

    const sortedAQIs = [...aqiCounts.entries()].sort((a, b) => b[1] - a[1]);
    if (sortedAQIs.length === 0) return [];

    const topCategories =
      sortedAQIs.length > 1
        ? [sortedAQIs[0][0], sortedAQIs[1][0]]
        : [sortedAQIs[0][0]];

    return leaves
      .filter((leaf) => topCategories.includes(leaf.properties.airQuality))
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

  const handleNodeSelection = useCallback(
    (feature) => {
      if (selectedNode === feature.properties._id) return;

      dispatch(setSelectedNode(feature.properties._id));
      dispatch(setSelectedWeeklyPrediction(null));
      dispatch(setMapLoading(true));
      dispatch(setOpenLocationDetails(true));
      dispatch(setSelectedLocation(feature.properties));
      dispatch(
        setCenter({
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        }),
      );
      dispatch(setZoom(15));
    },
    [dispatch, selectedNode],
  );

  const clusterUpdate = useCallback(() => {
    const map = mapRef.current;
    if (!map || !indexRef.current) return;

    try {
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];

      const clusters = indexRef.current.getClusters(bbox, Math.floor(zoom));
      clearMarkers();

      clusters.forEach((feature) => {
        const el = document.createElement('div');
        el.style.cursor = 'pointer';

        if (!feature.properties.cluster) {
          // Unclustered node
          el.style.zIndex = '1';
          el.innerHTML = UnclusteredNode({
            feature,
            NodeType,
            selectedNode,
            isDarkMode,
          });

          const popup = new mapboxgl.Popup({
            offset: NodeType === 'Node' ? 35 : NodeType === 'Number' ? 42 : 58,
            closeButton: false,
            maxWidth: 'none',
            className: 'my-custom-popup hidden md:block',
          }).setHTML(createPopupHTML({ feature, images, isDarkMode }));

          const marker = new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(popup)
            .addTo(map);

          el.addEventListener('mouseenter', () => {
            marker.togglePopup();
            el.style.zIndex = '9999';
          });

          el.addEventListener('mouseleave', () => {
            marker.togglePopup();
            el.style.zIndex = '1';
          });

          el.addEventListener('click', () => handleNodeSelection(feature));
          markersRef.current.push(marker);
        } else {
          // Clustered node
          el.style.zIndex = '444';
          el.className =
            'clustered flex justify-center items-center bg-white rounded-full p-2 shadow-md';

          const mostCommonAQIs = getTwoMostCommonAQIs(feature);
          feature.properties.aqi = mostCommonAQIs;
          el.innerHTML = createClusterNode({ feature, NodeType, isDarkMode });

          const marker = new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);

          el.addEventListener('click', () => {
            map.flyTo({
              center: feature.geometry.coordinates,
              zoom: zoom + 2,
            });
          });

          markersRef.current.push(marker);
        }
      });
    } catch (error) {
      console.error('Error updating clusters:', error);
    }
  }, [
    clearMarkers,
    getTwoMostCommonAQIs,
    handleNodeSelection,
    NodeType,
    selectedNode,
    isDarkMode,
  ]);

  // Initialize or update supercluster
  const initSupercluster = useCallback(() => {
    if (!indexRef.current) {
      indexRef.current = new Supercluster({
        radius: getClusterRadius(),
        maxZoom: 20,
      });
    }
  }, []);

  // Update map with data
  const updateMapData = useCallback(
    (data) => {
      if (!data || data.length === 0) return;

      initSupercluster();

      if (indexRef.current) {
        indexRef.current.load(data);
        clusterUpdate();
      }
    },
    [clusterUpdate, initSupercluster],
  );

  // Fetch map readings
  const fetchMapReadings = useCallback(async () => {
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      console.log('Fetching map readings data...');
      const response = await getMapReadings(abortControllerRef.current.signal);

      if (!response.success || !response.measurements?.length) {
        throw new Error('No valid map readings data found.');
      }

      const features = response.measurements
        .filter(
          (item) => item.siteDetails && item.no2 && item.pm10 && item.pm2_5,
        )
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

      console.log(`Loaded ${features.length} map readings`);
      dispatch(setMapReadingsData(features));

      // Immediately display these points on the map
      updateMapData(features);

      return features;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching map readings:', error);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch, createFeature, pollutant, setLoading, updateMapData]);

  // Fetch WAQ data
  const fetchWaqData = useCallback(
    async (cities, mapFeatures) => {
      if (!cities || cities.length === 0) return [];

      setIsWaqLoading(true);
      setLoadingOthers(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        console.log('Fetching WAQ data...');
        const batchSize = 5;
        let allWaqFeatures = [];
        let totalBatches = Math.ceil(cities.length / batchSize);

        for (let i = 0; i < cities.length; i += batchSize) {
          const batch = cities.slice(i, i + batchSize);
          const batchNumber = Math.floor(i / batchSize) + 1;

          console.log(`Fetching WAQ batch ${batchNumber}/${totalBatches}`);

          const promises = batch.map((city) =>
            axios
              .get(`/api/proxy?city=${city}`, {
                signal: abortControllerRef.current?.signal,
              })
              .then((response) => {
                const cityData = response.data?.data;
                if (!cityData?.city) return null;

                const waqiPollutant =
                  pollutant === 'pm2_5' ? 'pm25' : pollutant;
                const aqi = getAQICategory(
                  pollutant,
                  cityData.iaqi[waqiPollutant]?.v,
                );

                return createFeature(
                  cityData.idx,
                  cityData.city.name,
                  [cityData.city.geo[1], cityData.city.geo[0]],
                  aqi,
                  cityData.iaqi.no2?.v,
                  cityData.iaqi.pm10?.v,
                  cityData.iaqi.pm25?.v,
                  cityData.time.iso,
                  getForecastForPollutant(cityData),
                );
              })
              .catch((error) => {
                if (error.name !== 'AbortError') {
                  console.error(
                    `Failed to fetch WAQ data for city ${city}:`,
                    error.message,
                  );
                }
                return null;
              }),
          );

          const results = await Promise.all(promises);
          const validResults = results.filter(Boolean);

          if (validResults.length > 0) {
            allWaqFeatures = [...allWaqFeatures, ...validResults];

            // Update store with current batch
            dispatch(setWaqData(allWaqFeatures));

            // Immediately merge with map readings and update display
            if (mapFeatures && mapFeatures.length > 0) {
              const combinedData = [...mapFeatures, ...allWaqFeatures];
              updateMapData(combinedData);
            }

            console.log(
              `Batch ${batchNumber} complete. Total WAQ points: ${allWaqFeatures.length}`,
            );
          }
        }

        return allWaqFeatures;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching WAQI data:', error);
        }
        return [];
      } finally {
        console.log('WAQ data loading complete');
        setIsWaqLoading(false);
        setLoadingOthers(false);
      }
    },
    [
      dispatch,
      createFeature,
      getForecastForPollutant,
      pollutant,
      setLoadingOthers,
      updateMapData,
    ],
  );

  // Main function to fetch all data
  const fetchAndProcessData = useCallback(async () => {
    try {
      // First load map readings data
      const mapFeatures = await fetchMapReadings();

      if (mapFeatures.length > 0) {
        // Then fetch WAQ data and merge with map readings data
        fetchWaqData(AQI_FOR_CITIES, mapFeatures);
      }
    } catch (error) {
      console.error('Error in data processing:', error);
    }
  }, [fetchMapReadings, fetchWaqData]);

  // Set up map listeners and initial data
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Initialize supercluster
    initSupercluster();

    // Load any existing data
    const combinedData = [...(mapReadingsData || []), ...(waqData || [])];
    if (combinedData.length > 0) {
      updateMapData(combinedData);
    }

    // Set up map event listeners
    const handleZoomEnd = () => clusterUpdate();
    const handleMoveEnd = () => clusterUpdate();

    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMoveEnd);

    // Cleanup function
    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMoveEnd);
      clearMarkers();

      setIsWaqLoading(false);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [
    clearMarkers,
    clusterUpdate,
    updateMapData,
    mapReadingsData,
    waqData,
    initSupercluster,
  ]);

  // Update when NodeType changes
  useEffect(() => {
    if (indexRef.current) {
      // Reset the cluster with the new NodeType configuration
      indexRef.current = new Supercluster({
        radius: getClusterRadius(),
        maxZoom: 20,
      });

      const combinedData = [...(mapReadingsData || []), ...(waqData || [])];
      if (combinedData.length > 0) {
        updateMapData(combinedData);
      }
    }
  }, [NodeType, updateMapData, mapReadingsData, waqData]);

  return {
    mapRef,
    fetchAndProcessData,
    clusterUpdate,
    isWaqLoading,
  };
};

export default useMapData;
