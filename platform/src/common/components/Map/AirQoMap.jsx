import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import Supercluster from 'supercluster';
import { useWindowSize } from '@/lib/windowSize';
import { getMapReadings } from '@/core/apis/DeviceRegistry';
import {
  setOpenLocationDetails,
  setSelectedLocation,
  setMapLoading,
  setCenter,
  setZoom,
  setSelectedNode,
  reSetMap,
  setSelectedWeeklyPrediction,
  setMapReadingsData,
  setWaqData,
  clearData,
} from '@/lib/store/services/map/MapSlice';
import {
  CustomGeolocateControl,
  CustomZoomControl,
} from './components/MapControls';
import LayerModal from './components/LayerModal';
import Loader from '@/components/Spinner';
import Toast from '../Toast';
import { AQI_FOR_CITIES } from './data/Cities';
import { AirQualityLegend } from './components/Legend';
import {
  createPopupHTML,
  createClusterNode,
  UnclusteredNode,
  getAQICategory,
  images,
} from './components/MapNodes';
import { mapStyles, mapDetails } from './data/constants';
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import PropTypes from 'prop-types';

const AirQoMap = ({ customStyle, mapboxApiAccessToken, pollutant }) => {
  const dispatch = useDispatch();
  const mapContainerRef = useRef(null);
  const { width } = useWindowSize();
  const markersRef = useRef([]);
  const mapRef = useRef();
  const indexRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOthers, setLoadingOthers] = useState(false);
  const urls = new URL(window.location.href);
  const urlParams = new URLSearchParams(urls.search);
  const mapData = useSelector((state) => state.map);
  const selectedNode = useSelector((state) => state.map.selectedNode);
  const mapReadingsData = useSelector((state) => state.map.mapReadingsData);
  const waqData = useSelector((state) => state.map.waqData);
  const [toastMessage, setToastMessage] = useState({
    message: '',
    type: '',
    bgColor: '',
  });

  // Default node type is Emoji and default map style is streets
  const [NodeType, setNodeType] = useState('Emoji');
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/streets-v11',
  );

  const lat = urlParams.get('lat');
  const lng = urlParams.get('lng');
  const zm = urlParams.get('zm');

  /**
   * Once user user leaves the map page when unmounting the component clear the data
   * @sideEffect
   * - Clear data on unmount
   * @returns {void}
   * */
  useEffect(() => {
    return () => {
      dispatch(clearData());
    };
  }, []);

  /**
   * Stop loaders after 10 seconds
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading, dispatch, loadingOthers]);

  /**
   * set sidebar skeleton loader to false after 2 seconds
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setMapLoading(false));
    }, 2000);

    return () => clearTimeout(timer);
  }, [dispatch, selectedNode]);

  /**
   * Clear data on unmount
   * @sideEffect
   * - Clear data on unmount when lat, lng and zm are not present
   * @returns {void}
   */
  useEffect(() => {
    if (!lat && !lng && !zm) {
      dispatch(reSetMap());
    }
  }, []);

  /**
   * Initialize the map
   * @sideEffect
   * - Initialize the map
   * - Add map controls
   * - Load data
   * - Update clusters
   * - Fetch location boundaries
   * @returns {void}
   */
  useEffect(() => {
    const initializeMap = async () => {
      try {
        mapboxgl.accessToken = mapboxApiAccessToken;
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: [
            lng || mapData.center.longitude,
            lat || mapData.center.latitude,
          ],
          zoom: zm || mapData.zoom,
        });

        mapRef.current = map;

        map.on('load', async () => {
          map.resize();

          // Check if the conditions for hiding controls are met
          if (!(width < 1024 && selectedNode)) {
            const zoomControl = new CustomZoomControl(dispatch);
            map.addControl(zoomControl, 'bottom-right');

            const geolocateControl = new CustomGeolocateControl(
              setToastMessage,
            );
            map.addControl(geolocateControl, 'bottom-right');
          }
        });
      } catch (error) {
        // console.error('Error initializing the Map: ', error);
        return;
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [
    mapStyle,
    NodeType,
    mapboxApiAccessToken,
    width < 1024 && selectedNode,
    width,
  ]);

  /**
   * Set the map center and zoom
   * when the mapData changes
   * @param {Object} mapData - Map data
   * @param {Object} mapRef - Map reference
   * @returns {void}
   * @sideEffect
   * - Fly to the new center and zoom
   */
  useEffect(() => {
    if (mapRef.current && mapData.center && mapData.zoom) {
      const { latitude, longitude } = mapData.center;
      if (latitude && longitude) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: mapData.zoom,
          essential: true,
        });
      }
    }
  }, [mapData.center, mapData.zoom, mapRef.current]);

  /**
   * Fetch data from the API
   * and process the data
   * update the clusters
   * @param {Array} cities - Array of cities
   * @returns {Promise<Array>} - Array of data
   * @returns {Promise<Array>} - Array of data
   */
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

  /**
   * Get the forecast for a pollutant
   * @param {Object} cityData - City data
   * */
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

  const fetchAndProcessWaqData = useCallback(
    async (cities) => {
      setLoadingOthers(true);
      const batchSize = 50; // Adjust this value based on API limits and performance
      const batches = [];

      for (let i = 0; i < cities.length; i += batchSize) {
        batches.push(cities.slice(i, i + batchSize));
      }

      try {
        const allData = await Promise.all(
          batches.map(async (batch) => {
            const batchResponses = await axios.get('/api/proxy', {
              params: { cities: batch.join(',') },
            });
            return batchResponses.data;
          }),
        );

        const processedData = allData
          .flat()
          .filter((cityData) => cityData?.data?.city)
          .map((cityData) => {
            const waqiPollutant = pollutant === 'pm2_5' ? 'pm25' : pollutant;
            const aqi = getAQICategory(
              pollutant,
              cityData.data.iaqi[waqiPollutant]?.v,
            );
            return createFeature(
              cityData.data.idx,
              cityData.data.city.name,
              [cityData.data.city.geo[1], cityData.data.city.geo[0]],
              aqi,
              cityData.data.iaqi.no2?.v,
              cityData.data.iaqi.pm10?.v,
              cityData.data.iaqi.pm25?.v,
              cityData.data.time.iso,
              getForecastForPollutant(cityData.data),
            );
          });

        return processedData;
      } catch (error) {
        console.error('Error fetching AQI data:', error);
        return [];
      } finally {
        setLoadingOthers(false);
      }
    },
    [pollutant, createFeature, getForecastForPollutant],
  );

  const processMapReadingsData = useCallback(
    (response) => {
      return response.measurements
        .filter(
          (item) => item.siteDetails && item.no2 && item.pm10 && item.pm2_5,
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
            item.no2.value,
            item.pm10.value,
            item.pm2_5.value,
            item.time,
            null,
          );
        });
    },
    [pollutant, createFeature],
  );

  const fetchAndProcessData = useCallback(async () => {
    setLoadingOthers(true);
    try {
      const [mapReadingsResponse, waqDataResponse] = await Promise.all([
        getMapReadings(),
        fetchAndProcessWaqData(AQI_FOR_CITIES),
      ]);

      const newMapReadingsData = processMapReadingsData(mapReadingsResponse);
      dispatch(setMapReadingsData(newMapReadingsData));

      dispatch(setWaqData(waqDataResponse));

      return [...newMapReadingsData, ...waqDataResponse];
    } catch (error) {
      console.error('Error fetching and processing data:', error);
      return [];
    } finally {
      setLoadingOthers(false);
    }
  }, [dispatch, processMapReadingsData, fetchAndProcessWaqData]);

  /**
   * Get the two most common AQIs in a cluster.
   * @param {Object} cluster - Cluster object
   */
  const getTwoMostCommonAQIs = useCallback((cluster) => {
    const leaves = indexRef.current.getLeaves(
      cluster.properties.cluster_id,
      Infinity,
    );
    const aqiCounts = leaves?.reduce((acc, leaf) => {
      const aqi = leaf.properties.airQuality;
      acc[aqi] = (acc[aqi] || 0) + 1;
      return acc;
    }, {});

    const sortedAQIs = Object.entries(aqiCounts).sort((a, b) => b[1] - a[1]);
    const mostCommonAQIs =
      sortedAQIs.length > 1
        ? sortedAQIs.slice(0, 2)
        : [sortedAQIs[0], sortedAQIs[0]];

    const leavesWithMostCommonAQIs = leaves?.filter((leaf) =>
      mostCommonAQIs.map((aqi) => aqi[0]).includes(leaf.properties.airQuality),
    );

    return leavesWithMostCommonAQIs.map((leaf) => ({
      aqi: leaf.properties.aqi,
      pm2_5: leaf.properties.pm2_5,
      pm10: leaf.properties.pm10,
      no2: leaf.properties.no2,
    }));
  }, []);

  const clusterUpdate = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Initialize Super cluster
    const index = new Supercluster({
      radius: NodeType === 'Emoji' ? 40 : NodeType === 'Node' ? 60 : 80,
    });

    // Assign the index instance to indexRef.current
    indexRef.current = index;

    const updateClusters = () => {
      try {
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        const bbox = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ];
        const clusters = index.getClusters(bbox, Math.floor(zoom));

        // Remove existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Add clusters and unclustered points as custom HTML markers
        clusters.forEach((feature) => {
          const el = document.createElement('div');
          el.style.cursor = 'pointer';

          const popup = new mapboxgl.Popup({
            offset: NodeType === 'Node' ? 35 : NodeType === 'Number' ? 42 : 58,
            closeButton: false,
            maxWidth: 'none',
            className: 'my-custom-popup hidden md:block',
          }).setHTML(createPopupHTML({ feature, images }));

          if (feature.properties.cluster) {
            // Clustered point
            el.className =
              'clustered flex justify-center items-center bg-white rounded-full p-2 shadow-md';
            el.innerHTML = createClusterNode({
              feature: {
                ...feature,
                properties: {
                  ...feature.properties,
                  aqi: getTwoMostCommonAQIs(feature),
                },
              },
              NodeType,
            });

            el.addEventListener('click', () => {
              map.flyTo({
                center: feature.geometry.coordinates,
                zoom: zoom + 2,
              });
            });
          } else {
            // Unclustered point
            el.style.zIndex = 1;
            el.innerHTML = UnclusteredNode({ feature, NodeType, selectedNode });

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
          }

          const marker = new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);

          if (!feature.properties.cluster) {
            marker.setPopup(popup);
          }

          markersRef.current.push(marker);
        });
      } catch (error) {
        console.error('Error updating clusters: ', error);
      }
    };

    map.on('zoomend', updateClusters);
    map.on('moveend', updateClusters);

    // Combine mapReadingsData and waqData
    const data = [...mapReadingsData, ...waqData];
    index.load(data);
    updateClusters();
  }, [
    selectedNode,
    NodeType,
    mapStyle,
    pollutant,
    refresh,
    waqData,
    mapReadingsData,
    width,
    dispatch,
    getTwoMostCommonAQIs,
    createClusterNode,
    UnclusteredNode,
    createPopupHTML,
    images,
  ]);

  useEffect(() => {
    fetchAndProcessData();
  }, [fetchAndProcessData]);

  useEffect(() => {
    clusterUpdate();
  }, [clusterUpdate]);

  /**
   * Resize the map
   * @sideEffect
   * - Resizes the map when the window is resized and side bar is closed
   */
  useEffect(() => {
    mapRef.current.resize();
  }, [window.innerWidth, window.innerHeight, selectedNode]);

  /**
   * Fetch location boundaries
   */
  useEffect(() => {
    const fetchLocationBoundaries = async () => {
      setLoading(true);
      const map = mapRef.current;

      if (!map) return;

      if (map.getLayer('location-boundaries')) {
        map.removeLayer('location-boundaries');
      }

      if (map.getSource('location-boundaries')) {
        map.removeSource('location-boundaries');
      }

      let queryString = mapData.location.country;
      if (mapData.location.city) {
        queryString = `${mapData.location.city}, ${queryString}`;
      }

      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: queryString,
              polygon_geojson: 1,
              format: 'json',
            },
          },
        );

        const data = response.data;

        if (data && data.length > 0) {
          const boundaryData = data[0].geojson;

          map.addSource('location-boundaries', {
            type: 'geojson',
            data: boundaryData,
          });

          map.addLayer({
            id: 'location-boundaries',
            type: 'fill',
            source: 'location-boundaries',
            paint: {
              'fill-color': '#0000FF',
              'fill-opacity': 0.2,
              'fill-outline-color': '#0000FF',
            },
          });

          const { lat, lon } = data[0];
          map.flyTo({
            center: [lon, lat],
            zoom: mapData.location.city && mapData.location.country ? 10 : 5,
          });

          map.on('zoomend', function () {
            const zoom = map.getZoom();
            const opacity = zoom > 10 ? 0 : 0.2;
            map.setPaintProperty(
              'location-boundaries',
              'fill-opacity',
              opacity,
            );
          });
        }
      } catch (error) {
        console.error('Error fetching location boundaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationBoundaries();
  }, [mapData.location]);

  /**
   * Refresh the map
   */
  const refreshMap = useCallback(() => {
    const map = mapRef.current;
    map.setStyle(map.getStyle());
    setRefresh((prev) => !prev);
    selectedNode && dispatch(setSelectedNode(null));
    dispatch(reSetMap());
    setToastMessage({
      message: 'Map refreshed successfully',
      type: 'success',
      bgColor: 'bg-blue-600',
    });
  }, [dispatch, selectedNode]);

  /**
   * Share location URL
   * @sideEffect
   * - Copy URL to clipboard
   * - Display toast notification
   * @returns {void}
   */
  const shareLocation = useCallback(() => {
    try {
      const map = mapRef.current;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const currentUrl = window.location.href;

      const url = new URL(currentUrl);
      url.searchParams.set('lat', center.lat.toFixed(4));
      url.searchParams.set('lng', center.lng.toFixed(4));
      url.searchParams.set('zm', zoom.toFixed(2));

      navigator.clipboard.writeText(url.toString());

      setToastMessage({
        message: 'Location URL copied to clipboard',
        type: 'success',
        bgColor: 'bg-blue-600',
      });
    } catch (error) {
      console.error('Error sharing location:', error);
      setToastMessage({
        message: 'Failed to copy location URL to clipboard',
        type: 'error',
      });
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className={customStyle} />

      <div
        className={`${
          width < 1024 && selectedNode
            ? 'hidden'
            : 'relative left-4 z-50 md:block'
        }`}
      >
        <div className="absolute bottom-2 z-[900]">
          <AirQualityLegend pollutant={pollutant} />
        </div>
      </div>

      <div
        className={`${
          width < 1024 && selectedNode
            ? 'hidden'
            : 'absolute top-4 right-0 z-40'
        }`}
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <div className="relative inline-block">
              <button
                onClick={() => setIsOpen(true)}
                title="Map Layers"
                className="inline-flex items-center justify-center p-2 md:p-3 mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
              >
                <LayerIcon />
              </button>
            </div>
          </div>
          <button
            onClick={refreshMap}
            title="Refresh Map"
            className="inline-flex items-center justify-center p-2 md:p-3 mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
          >
            <RefreshIcon />
          </button>
          <button
            onClick={shareLocation}
            title="Share Location"
            className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
          >
            <ShareIcon />
          </button>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-[10000]">
          <div className="bg-white w-[70px] h-[70px] flex justify-center items-center rounded-md shadow-md">
            <span className="ml-2">
              <Loader width={32} height={32} />
            </span>
          </div>
        </div>
      )}

      <LayerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mapStyles={mapStyles}
        mapDetails={mapDetails}
        disabled="Heatmap"
        onMapDetailsSelect={setNodeType}
        onStyleSelect={(style) => setMapStyle(style.url)}
      />

      {loadingOthers && (
        <div className="absolute bg-white rounded-md p-2 top-4 right-16 flex items-center justify-center z-50">
          <Loader width={20} height={20} />
          <span className="ml-2 text-sm">Loading AQI data...</span>
        </div>
      )}

      {toastMessage.message !== '' && (
        <Toast
          message={toastMessage.message}
          clearData={() => setToastMessage({ message: '', type: '' })}
          type={toastMessage.type}
          timeout={3000}
          dataTestId="map-toast"
          size="lg"
          bgColor={toastMessage.bgColor}
          position="bottom"
        />
      )}
    </div>
  );
};

AirQoMap.propTypes = {
  customStyle: PropTypes.object,
  mapboxApiAccessToken: PropTypes.string,
  pollutant: PropTypes.string,
};

export default React.memo(AirQoMap);
