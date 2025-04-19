// useMapData.js
import { useCallback, useRef, useEffect, useState } from 'react';
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
  );

  const clusterUpdate = useCallback(() => {
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
      clearMarkers();
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
          el.style.zIndex = '444';
          el.className =
            'clustered flex justify-center items-center bg-white rounded-full p-2 shadow-md';
          const mostCommonAQIs = getTwoMostCommonAQIs(feature);
          feature.properties.aqi = mostCommonAQIs;
          el.innerHTML = createClusterNode({ feature, NodeType, isDarkMode });
          const marker = new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);
          el.addEventListener('click', () =>
            map.flyTo({ center: feature.geometry.coordinates, zoom: zoom + 2 }),
          );
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

  // Fetch and cache map readings; if already in store, reapply markers.
  const fetchMapReadings = useCallback(async () => {
    if (mapReadingsData?.length) {
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
      dispatch(setMapReadingsData(features));
      updateMapData(features);
      return features;
    } catch (error) {
      if (error.name !== 'AbortError')
        console.error('Error fetching map readings:', error);
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

  // Fetch WAQ data concurrently; update markers only when all data is available.
  const fetchWaqData = useCallback(
    async (cities) => {
      if (!cities?.length) return [];
      setIsWaqLoading(true);
      setLoadingOthers(true);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      try {
        const promises = cities.map((city) =>
          axios
            .get(`/api/proxy?city=${city}`, {
              signal: abortControllerRef.current.signal,
            })
            .then((response) => {
              const cityData = response.data?.data;
              if (!cityData?.city) return null;
              const key = pollutant === 'pm2_5' ? 'pm25' : pollutant;
              const aqi = getAQICategory(pollutant, cityData.iaqi[key]?.v);
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
              if (error.name !== 'AbortError')
                console.error(
                  `Failed to fetch WAQ data for city ${city}:`,
                  error.message,
                );
              return null;
            }),
        );
        const results = await Promise.all(promises);
        const validResults = results.filter(Boolean);
        dispatch(setWaqData(validResults));
        return validResults;
      } catch (error) {
        if (error.name !== 'AbortError')
          console.error('Error fetching WAQ data:', error);
        return [];
      } finally {
        setIsWaqLoading(false);
        setLoadingOthers(false);
      }
    },
    [createFeature, dispatch, getForecastForPollutant, pollutant],
  );

  // Main function: fetch map readings then WAQ data; update markers only once.
  const fetchAndProcessAllData = useCallback(async () => {
    try {
      const mapFeatures = await fetchMapReadings();
      if (mapFeatures.length) {
        const waqFeatures = await fetchWaqData(AQI_FOR_CITIES);
        updateMapData([...mapFeatures, ...waqFeatures]);
      }
    } catch (error) {
      console.error('Error in data processing:', error);
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
