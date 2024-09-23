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
  IconButton,
  LoadingOverlay,
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

  // Clear data on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearData());
    };
  }, [dispatch]);

  // Stop loaders after 10 seconds
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setLoading(false);
    }, 10000);

    // Cleanup the timer when component unmounts or dependencies change
    return () => clearTimeout(loaderTimer);
  }, [loading]);

  // Stop map loading skeleton after 2 seconds
  useEffect(() => {
    const skeletonTimer = setTimeout(() => {
      dispatch(setMapLoading(false));
    }, 2000);

    // Cleanup the timer when component unmounts or dependencies change
    return () => clearTimeout(skeletonTimer);
  }, [dispatch, selectedNode]);

  // Clear map state if lat, lng, or zm params are missing
  useEffect(() => {
    if (!lat && !lng && !zm) {
      dispatch(reSetMap());
    }
  }, [lat, lng, zm, dispatch]);

  // Initialize the map and add controls
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

        // Add map controls once map is loaded
        map.on('load', () => {
          map.resize();

          // Add controls if the width is above 1024 or no node is selected
          if (!(width < 1024 && selectedNode)) {
            const zoomControl = new CustomZoomControl(dispatch);
            const geolocateControl = new CustomGeolocateControl(
              setToastMessage,
            );
            map.addControl(zoomControl, 'bottom-right');
            map.addControl(geolocateControl, 'bottom-right');
          }
        });
      } catch (error) {
        console.error('Error initializing the Map: ', error);
      }
    };

    initializeMap();

    // Cleanup map instance on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [mapStyle, NodeType, mapboxApiAccessToken, width, selectedNode]);

  // Fly to new center and zoom when mapData changes
  useEffect(() => {
    if (mapRef.current && mapData.center && mapData.zoom) {
      const { latitude, longitude } = mapData.center;
      if (latitude && longitude) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: mapData.zoom,
          essential: true, // Ensures the transition happens only when necessary
        });
      }
    }
  }, [mapData.center, mapData.zoom, mapRef.current]);

  /**
   * Handling data section
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

  // Forecast data
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

  // formatting waq data
  const fetchAndProcessWaqData = useCallback(
    async (cities) => {
      setLoadingOthers(true);
      try {
        const responses = await Promise.allSettled(
          cities.map((city) => axios.get(`/api/proxy?city=${city}`)),
        );

        return responses
          .filter(
            (response) =>
              response.status === 'fulfilled' &&
              response.value?.data?.data?.city,
          )
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
      } catch (error) {
        console.error('Error fetching AQI data:', error);
        return [];
      } finally {
        setLoadingOthers(false);
      }
    },
    [pollutant, createFeature, getForecastForPollutant],
  );

  // formatting readings data
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

  // fetching map readings data
  const fetchAndProcessMapReadings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMapReadings();
      return processMapReadingsData(response);
    } catch (error) {
      console.error('Error fetching map readings data:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [processMapReadingsData]);

  const fetchAndProcessData = useCallback(async () => {
    if (!mapReadingsData.length) {
      const newMapReadingsData = await fetchAndProcessMapReadings();
      dispatch(setMapReadingsData(newMapReadingsData));
    }

    if (!waqData.length) {
      const newWaqData = await fetchAndProcessWaqData(AQI_FOR_CITIES);
      dispatch(setWaqData(newWaqData));
    }
  }, [
    dispatch,
    fetchAndProcessMapReadings,
    fetchAndProcessWaqData,
    mapReadingsData,
    waqData,
  ]);

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

  const clusterUpdate = useCallback(async () => {
    const map = mapRef.current;

    const index = new Supercluster({
      radius: NodeType === 'Emoji' ? 40 : NodeType === 'Node' ? 60 : 80,
    });

    indexRef.current = index;

    const handleClusterUpdate = () => {
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

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        clusters.forEach((feature) => {
          const el = document.createElement('div');
          el.style.cursor = 'pointer';

          if (!feature.properties.cluster) {
            el.style.zIndex = 1;
            el.innerHTML = UnclusteredNode({ feature, NodeType, selectedNode });

            const popup = new mapboxgl.Popup({
              offset:
                NodeType === 'Node' ? 35 : NodeType === 'Number' ? 42 : 58,
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
      } catch (error) {
        console.error('Error updating clusters: ', error);
      }
    };

    map.on('zoomend', handleClusterUpdate);
    map.on('moveend', handleClusterUpdate);

    if (mapReadingsData?.length > 0) {
      try {
        index.load(mapReadingsData);
        handleClusterUpdate();
      } catch (error) {
        console.error(
          'Error loading map readings data into Supercluster: ',
          error,
        );
      }
    }

    if (waqData?.length > 0) {
      try {
        const data = [...mapReadingsData, ...waqData];
        index.load(data);
        handleClusterUpdate();
      } catch (error) {
        console.error('Error loading AQI data into Supercluster: ', error);
      }
    }

    return () => {
      map.off('zoomend', handleClusterUpdate);
      map.off('moveend', handleClusterUpdate);
    };
  }, [
    selectedNode,
    NodeType,
    mapStyle,
    pollutant,
    refresh,
    waqData,
    mapReadingsData,
    width,
    getTwoMostCommonAQIs,
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
      {/* Map Container */}
      <div ref={mapContainerRef} className={customStyle} />

      {/* Air Quality Legend */}
      {width >= 1024 || !selectedNode ? (
        <div className="relative left-4 z-50 md:block">
          <div className="absolute bottom-2 z-[900]">
            <AirQualityLegend pollutant={pollutant} />
          </div>
        </div>
      ) : null}

      {/* Map Controls */}
      {width >= 1024 || !selectedNode ? (
        <div className="absolute top-4 right-0 z-40 flex flex-col gap-4">
          <IconButton
            onClick={() => setIsOpen(true)}
            title="Map Layers"
            icon={<LayerIcon />}
          />
          <IconButton
            onClick={refreshMap}
            title="Refresh Map"
            icon={<RefreshIcon />}
          />
          <IconButton
            onClick={shareLocation}
            title="Share Location"
            icon={<ShareIcon />}
          />
        </div>
      ) : null}

      {/* Loading Overlay */}
      {loading && (
        <LoadingOverlay size={70}>
          <Loader width={32} height={32} />
        </LoadingOverlay>
      )}

      {/* Layer Modal */}
      <LayerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mapStyles={mapStyles}
        mapDetails={mapDetails}
        disabled="Heatmap"
        onMapDetailsSelect={setNodeType}
        onStyleSelect={(style) => setMapStyle(style.url)}
      />

      {/* Loading Other Data */}
      {loadingOthers && (
        <div className="absolute bg-white rounded-md p-2 top-4 right-16 flex items-center z-50">
          <Loader width={20} height={20} />
          <span className="ml-2 text-sm">Loading AQI data...</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage.message && (
        <Toast
          message={toastMessage.message}
          clearData={() => setToastMessage({ message: '', type: '' })}
          type={toastMessage.type}
          timeout={3000}
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
