import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import { CustomGeolocateControl, CustomZoomControl } from './components/MapControls';
import { getMapReadings } from '@/core/apis/DeviceRegistry';
import {
  setOpenLocationDetails,
  setSelectedLocation,
  setMapLoading,
  setCenter,
  setZoom,
  setSelectedNode,
  reSetMap,
} from '@/lib/store/services/map/MapSlice';
import LayerModal from './components/LayerModal';
import Loader from '@/components/Spinner';
import axios from 'axios';
import Supercluster from 'supercluster';
import {
  createPopupHTML,
  createClusterNode,
  UnclusteredNode,
  getAQICategory,
  images,
} from './components/MapNodes';
import Toast from '../Toast';
import { AQI_FOR_CITIES } from './components/Cities';
import { AirQualityLegend } from './components/Legend';

// Images
import Node from '@/images/map/Node.webp';
import Emoji from '@/images/map/Emoji.webp';
import Heatmap from '@/images/map/Heatmap.webp';
import Node_Number from '@/images/map/Node_number.webp';

import DarkMode from '@/images/map/dark.webp';
import LightMode from '@/images/map/light.webp';
import SatelliteMode from '@/images/map/satellite.webp';
import StreetsMode from '@/images/map/street.webp';
import { useWindowSize } from '@/lib/windowSize';

const mapStyles = [
  { url: 'mapbox://styles/mapbox/streets-v11', name: 'Streets', image: StreetsMode },
  { url: 'mapbox://styles/mapbox/light-v10', name: 'Light', image: LightMode },
  { url: 'mapbox://styles/mapbox/dark-v10', name: 'Dark', image: DarkMode },
  { url: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite', image: SatelliteMode },
];

const mapDetails = [
  {
    name: 'Emoji',
    image: Emoji,
  },
  {
    name: 'Heatmap',
    image: Heatmap,
  },
  {
    name: 'Node',
    image: Node,
  },
  {
    name: 'Number',
    image: Node_Number,
  },
];

const AirQoMap = ({ customStyle, mapboxApiAccessToken, pollutant }) => {
  const dispatch = useDispatch();
  const mapContainerRef = useRef(null);
  const { width } = useWindowSize();
  const markersRef = useRef([]);
  const mapRef = useRef();
  const indexRef = useRef();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOthers, setLoadingOthers] = useState(false);
  const urls = new URL(window.location.href);
  const urlParams = new URLSearchParams(urls.search);
  const mapData = useSelector((state) => state.map);
  const selectedNode = useSelector((state) => state.map.selectedNode);
  const [toastMessage, setToastMessage] = useState({
    message: '',
    type: '',
    bgColor: '',
  });

  // Default node type is Emoji and default map style is streets
  const [NodeType, setNodeType] = useState('Emoji');
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  const [mapReadingsData, setMapReadingsData] = useState([]);
  const [waqData, setWaqData] = useState([]);

  const lat = urlParams.get('lat');
  const lng = urlParams.get('lng');
  const zm = urlParams.get('zm');

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
          center: [lng || mapData.center.longitude, lat || mapData.center.latitude],
          zoom: zm || mapData.zoom,
        });

        mapRef.current = map;

        map.on('load', async () => {
          map.resize();

          // Check if the conditions for hiding controls are met
          if (!(width < 1024 && selectedNode)) {
            const zoomControl = new CustomZoomControl(dispatch);
            map.addControl(zoomControl, 'bottom-right');

            const geolocateControl = new CustomGeolocateControl(setToastMessage);
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
  }, [mapStyle, NodeType, mapboxApiAccessToken, width < 1024 && selectedNode, width]);

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
  const createFeature = (id, name, coordinates, aqi, no2, pm10, pm2_5, time) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
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
    },
  });

  const fetchAndProcessWaqData = async (cities) => {
    setLoadingOthers(true);
    try {
      const responses = await Promise.allSettled(
        cities.map(async (city) => {
          const response = await axios.get(`/api/proxy?city=${city}`);
          if (!response.data) {
            console.error(`No data returned for city: ${city}`);
            return null;
          }
          return { city, data: response.data };
        }),
      );

      return responses
        .filter(
          (response) =>
            response.status === 'fulfilled' &&
            response.value.data &&
            response.value.data.data &&
            response.value.data.data.city,
        )
        .map((response) => {
          const cityData = response.value.data.data;
          const waqiPollutant = pollutant === 'pm2_5' ? 'pm25' : pollutant;
          const aqi = getAQICategory(pollutant, cityData.iaqi[waqiPollutant]?.v);
          return createFeature(
            cityData.idx,
            cityData.city.name,
            [cityData.city.geo[1], cityData.city.geo[0]],
            aqi,
            cityData.iaqi.no2?.v,
            cityData.iaqi.pm10?.v,
            cityData.iaqi.pm25?.v,
            cityData.time.s,
          );
        });
    } catch (error) {
      console.error('Error fetching AQI data: ', error);
      return [];
    } finally {
      setLoadingOthers(false);
    }
  };

  const processMapReadingsData = (response) => {
    return response.measurements
      .filter((item) => item.siteDetails && item.no2 && item.pm10 && item.pm2_5)
      .map((item) => {
        const aqi = getAQICategory(pollutant, item[pollutant].value);
        return createFeature(
          item.siteDetails._id,
          item.siteDetails.name,
          [item.siteDetails.approximate_longitude, item.siteDetails.approximate_latitude],
          aqi,
          item.no2.value,
          item.pm10.value,
          item.pm2_5.value,
          item.time,
        );
      });
  };

  const fetchAndProcessMapReadings = async () => {
    try {
      const response = await getMapReadings();
      return processMapReadingsData(response);
    } catch (error) {
      console.error('Error fetching map readings data: ', error);
      return [];
    }
  };

  // Fetch and process data
  const fetchAndProcessData = useCallback(async () => {
    // Only fetch new data if the state variables are empty
    if (mapReadingsData.length === 0) {
      const newMapReadingsData = await fetchAndProcessMapReadings();
      setMapReadingsData(newMapReadingsData);
    }

    if (waqData.length === 0) {
      const newWaqData = await fetchAndProcessWaqData(AQI_FOR_CITIES);
      setWaqData(newWaqData);
    }
  }, [mapReadingsData, waqData]);

  const clusterUpdate = useCallback(async () => {
    const map = mapRef.current;

    // Initialize Super cluster
    const index = new Supercluster({
      radius: 40,
      maxZoom: 16,
    });

    // Assign the index instance to indexRef.current
    indexRef.current = index;

    map.on('zoomend', updateClusters);
    map.on('moveend', updateClusters);

    // Use state variables instead of fetching new data
    if (mapReadingsData.length > 0) {
      try {
        index.load(mapReadingsData);
        updateClusters();
      } catch (error) {
        // console.error('Error loading map readings data into Supercluster: ', error);
        return;
      }
    }

    if (waqData.length > 0) {
      try {
        // Combine mapReadingsData and waqData
        const data = [...mapReadingsData, ...waqData];
        index.load(data);
        updateClusters();
      } catch (error) {
        // console.error('Error loading AQI data into Supercluster: ', error);
        return;
      }
    }
  }, [selectedNode, NodeType, mapStyle, pollutant, refresh, waqData, mapReadingsData, width]);

  /**
   * Get the two most common AQIs in a cluster.
   * @param {Object} cluster - Cluster object
   */
  const getTwoMostCommonAQIs = useCallback((cluster) => {
    // Get all original points in the cluster
    const leaves = indexRef.current.getLeaves(cluster.properties.cluster_id, Infinity);

    // Create an object to count the occurrences of each AQI
    const aqiCounts = leaves?.reduce((acc, leaf) => {
      const aqi = leaf.properties.airQuality;
      acc[aqi] = (acc[aqi] || 0) + 1;
      return acc;
    }, {});

    // Sort the AQIs by their counts in descending order
    const sortedAQIs = Object.entries(aqiCounts).sort((a, b) => b[1] - a[1]);

    // Get the two AQIs with the highest counts
    let mostCommonAQIs =
      sortedAQIs.length > 1 ? sortedAQIs.slice(0, 2) : [sortedAQIs[0], sortedAQIs[0]];
    mostCommonAQIs = mostCommonAQIs.map((aqi) => aqi[0]);

    // Find the leaves with the most common AQIs
    const leavesWithMostCommonAQIs = leaves?.filter((leaf) =>
      mostCommonAQIs.includes(leaf.properties.airQuality),
    );

    // Return the most common AQIs along with their associated properties
    return leavesWithMostCommonAQIs.map((leaf) => ({
      aqi: leaf.properties.aqi,
      pm2_5: leaf.properties.pm2_5,
      pm10: leaf.properties.pm10,
      no2: leaf.properties.no2,
    }));
  }, []);

  /**
   * Update the clusters on the map
   */
  const updateClusters = useCallback(() => {
    try {
      const zoom = mapRef.current.getZoom();
      const bounds = mapRef.current.getBounds();
      const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
      const clusters = indexRef.current.getClusters(bbox, Math.floor(zoom));

      // Remove existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add unclustered points as custom HTML markers
      clusters.forEach((feature) => {
        const el = document.createElement('div');
        el.style.cursor = 'pointer';

        if (!feature.properties.cluster) {
          // unclustered
          el.style.zIndex = 1;
          el.innerHTML = UnclusteredNode({ feature, NodeType, selectedNode });

          // Add popup to unclustered node
          const popup = new mapboxgl.Popup({
            offset: NodeType === 'Node' ? 35 : NodeType === 'Number' ? 42 : 58,
            closeButton: false,
            maxWidth: 'none',
            className: 'my-custom-popup',
          }).setHTML(createPopupHTML({ feature, images }));

          const marker = new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(popup)
            .addTo(mapRef.current);

          // Show the popup when the user hovers over the node
          el.addEventListener('mouseenter', () => {
            marker.togglePopup();
            el.style.zIndex = 9999;
          });
          el.addEventListener('mouseleave', () => {
            marker.togglePopup();
            el.style.zIndex = 1;
          });

          // Set selectedSite when the user clicks on the node
          el.addEventListener('click', () => {
            // If the selected node is the same as the previously selected node, return early
            if (selectedNode === feature.properties._id) {
              return;
            }

            dispatch(setSelectedNode(feature.properties._id));
            dispatch(setMapLoading(true));
            dispatch(setOpenLocationDetails(true));
            dispatch(setSelectedLocation(feature.properties));

            // set the lat,lng and zoom in the URL
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
          // clustered
          el.zIndex = 444;
          el.className =
            'clustered flex justify-center items-center bg-white rounded-full p-2 shadow-md';

          // Get the two most common AQIs in the cluster
          const mostCommonAQIs = getTwoMostCommonAQIs(feature);

          // Include the most common AQIs in the properties of the cluster feature
          feature.properties.aqi = mostCommonAQIs;

          el.innerHTML = createClusterNode({ feature, NodeType });
          const marker = new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .addTo(mapRef.current);

          // Add click event to zoom in when a user clicks on a cluster
          el.addEventListener('click', () => {
            mapRef.current.flyTo({ center: feature.geometry.coordinates, zoom: zoom + 2 });
          });

          markersRef.current.push(marker);
        }
      });
    } catch (error) {
      // console.error('Error updating clusters: ', error);
      return;
    }
  }, [clusterUpdate]);

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
    const map = mapRef.current;

    if (!map) return;

    const fetchLocationBoundaries = async () => {
      setLoading(true);
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
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: queryString,
            polygon_geojson: 1,
            format: 'json',
          },
        });

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

          // Add zoomend event listener
          map.on('zoomend', function () {
            const zoom = map.getZoom();
            const opacity = zoom > 10 ? 0 : 0.2;
            map.setPaintProperty('location-boundaries', 'fill-opacity', opacity);
          });
        }
      } catch (error) {
        // console.error('Error fetching location boundaries:', error);
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchLocationBoundaries();
  }, [mapData.location]);

  /**
   * Refresh the map
   */
  const refreshMap = () => {
    const map = mapRef.current;
    map.setStyle(map.getStyle());
    setRefresh(!refresh);
    selectedNode && dispatch(setSelectedNode(null));
    dispatch(reSetMap());
    setToastMessage({
      message: 'Map refreshed successfully',
      type: 'success',
      bgColor: 'bg-blue-600',
    });
  };

  /**
   * Share location URL
   * @sideEffect
   * - Copy URL to clipboard
   * - Display toast notification
   * @returns {void}
   */
  const shareLocation = () => {
    try {
      const map = mapRef.current;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const currentUrl = window.location.href;

      // Construct URL with labeled parameters
      const url = new URL(currentUrl);
      url.searchParams.set('lat', center.lat.toFixed(4));
      url.searchParams.set('lng', center.lng.toFixed(4));
      url.searchParams.set('zm', zoom.toFixed(2));

      navigator.clipboard.writeText(url.toString());

      // Display toast notification
      setToastMessage({
        message: 'Location URL copied to clipboard',
        type: 'success',
        bgColor: 'bg-blue-600',
      });
    } catch (error) {
      setToastMessage({
        message: 'Failed to copy location URL to clipboard',
        type: 'error',
      });
    }
  };

  return (
    <div className='relative w-full h-full'>
      {/* Map */}
      <div ref={mapContainerRef} className={customStyle} />

      {/* Legend */}
      <div
        className={`${width < 1024 && selectedNode ? 'hidden' : 'relative left-4 z-50 md:block'}`}>
        <div className={`absolute bottom-2 z-[900]`} style={{ zIndex: 900 }}>
          <AirQualityLegend pollutant={pollutant} />
        </div>
      </div>

      {/* Map control buttons */}
      <div className={`${width < 1024 && selectedNode ? 'hidden' : 'absolute top-4 right-0 z-40'}`}>
        <div className='flex flex-col gap-4'>
          <div className='relative'>
            <div className='relative inline-block' ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(true)}
                title='Map Layers'
                className='inline-flex items-center justify-center p-2 md:p-3 mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'>
                <LayerIcon />
              </button>
            </div>
          </div>
          <button
            onClick={refreshMap}
            title='Refresh Map'
            className='inline-flex items-center justify-center p-2 md:p-3 mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'>
            <RefreshIcon />
          </button>
          <button
            onClick={shareLocation}
            title='Share Location'
            className='inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'>
            <ShareIcon />
          </button>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className='absolute inset-0 flex items-center justify-center z-[10000]'>
          <div className='bg-white w-[70px] h-[70px] flex justify-center items-center rounded-md shadow-md'>
            <span className='ml-2'>
              <Loader width={32} height={32} />
            </span>
          </div>
        </div>
      )}

      {/* Layer modal */}
      <LayerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mapStyles={mapStyles}
        mapDetails={mapDetails}
        disabled='Heatmap'
        onMapDetailsSelect={(detail) => {
          setNodeType(detail);
        }}
        onStyleSelect={(style) => {
          setMapStyle(style.url);
        }}
      />

      {/* Loading AQI data */}
      {loadingOthers && (
        <div className='absolute bg-white rounded-md p-2 top-4 right-16 flex items-center justify-center z-50'>
          <Loader width={20} height={20} />
          <span className='ml-2 text-sm'>Loading AQI data...</span>
        </div>
      )}

      {/* Toast */}
      {toastMessage.message !== '' && (
        <Toast
          message={toastMessage.message}
          clearData={() => setToastMessage({ message: '', type: '' })}
          type={toastMessage.type}
          timeout={3000}
          dataTestId='map-toast'
          size='lg'
          bgColor={toastMessage.bgColor}
          position='bottom'
        />
      )}
    </div>
  );
};

export default AirQoMap;
