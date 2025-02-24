import { useCallback, useEffect, useRef } from 'react';
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
import { AQI_FOR_CITIES } from '../data/Cities';
import {
  createPopupHTML,
  createClusterNode,
  UnclusteredNode,
  getAQICategory,
  images,
} from '../components/MapNodes';
import { useWindowSize } from '@/lib/windowSize';

const useMapData = ({
  NodeType,
  mapStyle,
  pollutant,
  setLoading,
  setLoadingOthers,
}) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const indexRef = useRef(null);
  const dispatch = useDispatch();
  const mapReadingsData = useSelector((state) => state.map.mapReadingsData);
  const waqData = useSelector((state) => state.map.waqData);
  const { width } = useWindowSize();
  const selectedNode = useSelector((state) => state.map.selectedNode);

  // Helper to create a map feature
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

  // Helper to process forecast data
  const getForecastForPollutant = useCallback(
    (cityData) => {
      if (!cityData || !cityData.forecast?.daily) return null;
      const dailyForecast = cityData.forecast.daily;
      const forecastDataArray =
        pollutant === 'pm2_5' ? dailyForecast.pm25 : dailyForecast.pm10;
      return forecastDataArray?.map((forecastData) => ({
        [pollutant]: forecastData.avg,
        time: forecastData.day,
      }));
    },
    [pollutant],
  );

  // Fetch and process WAQ data
  const fetchAndProcessWaqData = useCallback(
    async (cities) => {
      setLoadingOthers(true);
      try {
        const responses = await Promise.allSettled(
          cities.map((city) => axios.get(`/api/proxy?city=${city}`)),
        );
        const fulfilledResponses = responses.filter(
          (response) =>
            response.status === 'fulfilled' && response.value?.data?.data?.city,
        );

        const waqFeatures = fulfilledResponses
          .map((response) => {
            const cityData = response.value.data.data;
            const waqiPollutant = pollutant === 'pm2_5' ? 'pm25' : pollutant;
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
          .filter(Boolean);

        dispatch(setWaqData(waqFeatures));
        return waqFeatures;
      } catch (error) {
        console.error('Error fetching WAQI data:', error);
        return [];
      } finally {
        setLoadingOthers(false);
      }
    },
    [
      dispatch,
      createFeature,
      getAQICategory,
      getForecastForPollutant,
      pollutant,
      setLoadingOthers,
    ],
  );

  // Fetch and process map readings data
  const fetchAndProcessMapReadings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMapReadings();

      if (!response.success || !response.measurements?.length) {
        throw new Error('No valid map readings data found.');
      }

      const readingsFeatures = response.measurements
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

      dispatch(setMapReadingsData(readingsFeatures));
      return readingsFeatures;
    } catch (error) {
      console.error('Error fetching map readings data:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch, createFeature, getAQICategory, pollutant, setLoading]);

  // Fetch and process all data
  const fetchAndProcessData = useCallback(async () => {
    try {
      // Fetch map readings data first
      await fetchAndProcessMapReadings();

      // Fetch WAQI data in parallel without blocking
      fetchAndProcessWaqData(AQI_FOR_CITIES);
    } catch (error) {
      console.error('Error processing data:', error);
    }
  }, [fetchAndProcessMapReadings, fetchAndProcessWaqData]);

  // Function to get two most common AQIs in a cluster
  const getTwoMostCommonAQIs = useCallback((cluster) => {
    const leaves = indexRef.current.getLeaves(
      cluster.properties.cluster_id,
      Infinity,
    );
    const aqiCounts = leaves.reduce((acc, leaf) => {
      const aqi = leaf.properties.airQuality;
      acc[aqi] = (acc[aqi] || 0) + 1;
      return acc;
    }, {});
    const sortedAQIs = Object.entries(aqiCounts).sort((a, b) => b[1] - a[1]);
    const mostCommonAQIs =
      sortedAQIs.length > 1
        ? sortedAQIs.slice(0, 2)
        : [sortedAQIs[0], sortedAQIs[0]];
    return leaves
      .filter((leaf) =>
        mostCommonAQIs
          .map((aqi) => aqi[0])
          .includes(leaf.properties.airQuality),
      )
      .map((leaf) => ({
        aqi: leaf.properties.aqi,
        pm2_5: leaf.properties.pm2_5,
        pm10: leaf.properties.pm10,
        no2: leaf.properties.no2,
      }));
  }, []);

  // Cluster update logic
  const clusterUpdate = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const clusters = indexRef.current.getClusters(bbox, Math.floor(zoom));

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    clusters.forEach((feature) => {
      const el =
        typeof document !== 'undefined' ? document.createElement('div') : null;
      el.style.cursor = 'pointer';

      if (!feature.properties.cluster) {
        el.style.zIndex = 1;
        el.innerHTML = UnclusteredNode({ feature, NodeType, selectedNode });
        const popup = new mapboxgl.Popup({
          offset: NodeType === 'Node' ? 35 : NodeType === 'Number' ? 42 : 58,
          closeButton: false,
          maxWidth: 'none',
          className: 'my-custom-popup hidden md:block',
        }).setHTML(createPopupHTML({ feature, images }));

        const marker = new mapboxgl.Marker(el)
          .setLngLat(feature.geometry.coordinates)
          .setPopup(popup)
          .addTo(map);

        el.addEventListener('mouseenter', () => {
          marker.togglePopup();
          el.style.zIndex = 9999;
        });
        el.addEventListener('mouseleave', () => {
          marker.togglePopup();
          el.style.zIndex = 1;
        });

        el.addEventListener('click', () => {
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
        });

        markersRef.current.push(marker);
      } else {
        el.zIndex = 444;
        el.className =
          'clustered flex justify-center items-center bg-white rounded-full p-2 shadow-md';
        const mostCommonAQIs = getTwoMostCommonAQIs(feature);
        feature.properties.aqi = mostCommonAQIs;

        el.innerHTML = createClusterNode({ feature, NodeType });
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
  }, [
    NodeType,
    createPopupHTML,
    UnclusteredNode,
    createClusterNode,
    getTwoMostCommonAQIs,
    selectedNode,
    dispatch,
    mapStyle,
    width,
  ]);

  // Initialize Supercluster and set up event listeners
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Initialize Supercluster
    const index = new Supercluster({
      radius: NodeType === 'Emoji' ? 40 : NodeType === 'Node' ? 60 : 80,
      maxZoom: 20,
    });
    indexRef.current = index;

    // Load initial data into Supercluster
    const loadData = () => {
      const combinedData = [...(mapReadingsData || []), ...(waqData || [])];
      index.load(combinedData);
      clusterUpdate();
    };

    loadData();

    // Event listeners for map movements
    map.on('zoomend', clusterUpdate);
    map.on('moveend', clusterUpdate);

    return () => {
      map.off('zoomend', clusterUpdate);
      map.off('moveend', clusterUpdate);
      markersRef.current.forEach((marker) => marker.remove());
    };
  }, [mapReadingsData, waqData, clusterUpdate, NodeType]);

  // Watch for data changes and update Supercluster
  useEffect(() => {
    if (!indexRef.current) return;

    const combinedData = [...(mapReadingsData || []), ...(waqData || [])];
    indexRef.current.load(combinedData);
    clusterUpdate();
  }, [mapReadingsData, waqData, clusterUpdate]);

  return {
    mapRef,
    fetchAndProcessData,
    clusterUpdate,
  };
};

export default useMapData;
