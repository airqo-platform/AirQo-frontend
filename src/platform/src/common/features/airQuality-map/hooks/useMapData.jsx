import { useCallback, useRef, useEffect } from 'react';
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
import { useWindowSize } from '@/lib/windowSize';

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
  const dispatch = useDispatch();
  const mapReadingsData = useSelector((state) => state.map.mapReadingsData);
  const waqData = useSelector((state) => state.map.waqData);
  const { width } = useWindowSize();
  const selectedNode = useSelector((state) => state.map.selectedNode);

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
      if (!cityData || !cityData.forecast?.daily) return null;
      const forecastDataArray =
        pollutant === 'pm2_5'
          ? cityData.forecast.daily.pm25
          : cityData.forecast.daily.pm10;
      return forecastDataArray?.map((forecastData) => ({
        [pollutant]: forecastData.avg,
        time: forecastData.day,
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
    const aqiCounts = {};
    leaves.forEach((leaf) => {
      const aqi = leaf.properties.airQuality;
      aqiCounts[aqi] = (aqiCounts[aqi] || 0) + 1;
    });
    const sortedAQIs = Object.entries(aqiCounts).sort((a, b) => b[1] - a[1]);
    const mostCommonAQIs =
      sortedAQIs.length > 1
        ? sortedAQIs.slice(0, 2)
        : [sortedAQIs[0], sortedAQIs[0]];
    const topAQICategories = mostCommonAQIs.map((aqi) => aqi[0]);
    return leaves
      .filter((leaf) => topAQICategories.includes(leaf.properties.airQuality))
      .map((leaf) => ({
        aqi: leaf.properties.aqi,
        pm2_5: leaf.properties.pm2_5,
        pm10: leaf.properties.pm10,
        no2: leaf.properties.no2,
      }));
  }, []);

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
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
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
    NodeType,
    getTwoMostCommonAQIs,
    selectedNode,
    dispatch,
    width,
    isDarkMode,
  ]);

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
  }, [dispatch, createFeature, pollutant, setLoading]);

  const fetchAndProcessWaqData = useCallback(
    async (cities) => {
      if (!cities || !cities.length) return [];
      setLoadingOthers(true);
      try {
        const batchSize = 5;
        const batches = [];
        let allWaqFeatures = [];
        for (let i = 0; i < cities.length; i += batchSize) {
          batches.push(cities.slice(i, i + batchSize));
        }
        for (const batch of batches) {
          const batchPromises = batch.map((city) =>
            axios
              .get(`/api/proxy?city=${city}`)
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
                console.error(
                  `Failed to fetch WAQ data for city: ${error.message}`,
                );
                return null;
              }),
          );
          const batchResults = await Promise.all(batchPromises);
          const validResults = batchResults.filter(Boolean);
          if (validResults.length > 0) {
            allWaqFeatures = [...allWaqFeatures, ...validResults];
          }
        }
        if (allWaqFeatures.length > 0) {
          dispatch(setWaqData(allWaqFeatures));
          if (indexRef.current) {
            const combinedData = [
              ...(mapReadingsData || []),
              ...allWaqFeatures,
            ];
            indexRef.current.load(combinedData);
            clusterUpdate();
          }
        }
        return allWaqFeatures;
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
      getForecastForPollutant,
      pollutant,
      setLoadingOthers,
      mapReadingsData,
      clusterUpdate,
    ],
  );

  const fetchAndProcessData = useCallback(async () => {
    try {
      const readingsData = await fetchAndProcessMapReadings();
      if (readingsData.length > 0 && indexRef.current) {
        indexRef.current.load(readingsData);
        clusterUpdate();
      }
      fetchAndProcessWaqData(AQI_FOR_CITIES);
    } catch (error) {
      console.error('Error processing data:', error);
    }
  }, [fetchAndProcessMapReadings, fetchAndProcessWaqData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const index = new Supercluster({
      radius: NodeType === 'Emoji' ? 40 : NodeType === 'Node' ? 60 : 80,
      maxZoom: 20,
    });
    indexRef.current = index;
    const combinedData = [...(mapReadingsData || []), ...(waqData || [])];
    if (combinedData.length > 0) {
      index.load(combinedData);
      clusterUpdate();
    }
    const handleZoomEnd = () => clusterUpdate();
    const handleMoveEnd = () => clusterUpdate();
    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMoveEnd);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [mapReadingsData, waqData, clusterUpdate, NodeType]);

  return {
    mapRef,
    fetchAndProcessData,
    clusterUpdate,
  };
};

export default useMapData;
