import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import { CustomGeolocateControl, CustomZoomControl } from './components/MapControls';
import { clearData } from '@/lib/store/services/map/MapSlice';
import LayerModal from './components/LayerModal';
import MapImage from '@/images/map/dd1.png';
import Loader from '@/components/Spinner';
import axios from 'axios';
import Supercluster from 'supercluster';
import {
  createPopupHTML,
  createClusterNode,
  UnclusteredNode,
  getIcon,
  images,
} from './components/MapNodes';
import { getMapReadings } from '@/core/apis/DeviceRegistry';
import Toast from '../Toast';

const mapStyles = [
  { url: 'mapbox://styles/mapbox/streets-v11', name: 'Streets', image: MapImage },
  // { url: 'mapbox://styles/mapbox/outdoors-v11', name: 'Outdoors' },
  { url: 'mapbox://styles/mapbox/light-v10', name: 'Light', image: MapImage },
  { url: 'mapbox://styles/mapbox/dark-v10', name: 'Dark', image: MapImage },
  { url: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite', image: MapImage },
  // { url: 'mapbox://styles/mapbox/satellite-streets-v11', name: 'Satellite Streets' },
];

const AirQoMap = ({ customStyle, mapboxApiAccessToken, showSideBar }) => {
  const dispatch = useDispatch();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const dropdownRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  const [isOpen, setIsOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const urls = new URL(window.location.href);
  const urlParams = new URLSearchParams(urls.search);
  const mapData = useSelector((state) => state.map);
  const [toastMessage, setToastMessage] = useState(null);
  const [NodeType, setNodeType] = useState('Emoji');
  const [pollutant, setPollutant] = useState('pm2_5');
  const [selectedSite, setSelectedSite] = useState(null);

  const lat = urlParams.get('lat');
  const lng = urlParams.get('lng');
  const zm = urlParams.get('zm');

  useEffect(() => {
    dispatch(clearData());
  }, []);

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
  }, [mapData.center, mapData.zoom]);

  // Node data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getMapReadings();
      const data = response.measurements
        .filter((item) => item.siteDetails)
        .map((item) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              item.siteDetails.approximate_longitude,
              item.siteDetails.approximate_latitude,
            ],
          },
          properties: {
            _id: item.siteDetails._id,
            location: item.siteDetails.location_name,
            airQuality: item.aqi_category,
            no2: item.no2.value,
            pm10: item.pm10.value,
            pm2_5: item.pm2_5.value,
            createdAt: item.createdAt,
            time: item.time,
            aqi: getIcon(item[pollutant].value),
          },
        }));
      setLoading(false);
      return data;
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Init map
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

        let markers = []; // Store all markers

        map.on('load', async () => {
          map.resize();

          const zoomControl = new CustomZoomControl();
          map.addControl(zoomControl, 'bottom-right');

          const geolocateControl = new CustomGeolocateControl();
          map.addControl(geolocateControl, 'bottom-right');

          // Load all the images
          try {
            await Promise.all(
              Object.keys(images).map(
                (key) =>
                  new Promise((resolve, reject) => {
                    map.loadImage(images[key], (error, image) => {
                      if (error) {
                        console.error(`Failed to load image ${key}: `, error);
                        reject(error);
                      } else {
                        map.addImage(key, image);
                        resolve();
                      }
                    });
                  }),
              ),
            );
          } catch (error) {
            console.error('Error loading images: ', error);
          }

          // Load data
          let data;
          try {
            data = await fetchData();
            if (!data) {
              throw new Error('No data returned from fetchData');
            }
          } catch (error) {
            console.error('Error fetching data: ', error);
            return;
          }

          // Create a supercluster
          const index = new Supercluster({
            radius: 40,
            maxZoom: 16,
          });

          try {
            index.load(data);
          } catch (error) {
            console.error('Error loading data into Supercluster: ', error);
            return;
          }

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
              markers.forEach((marker) => marker.remove());
              markers = [];

              // Add unclustered points as custom HTML markers
              clusters.forEach((feature) => {
                const el = document.createElement('div');

                el.style.cursor = 'pointer';

                if (!feature.properties.cluster) {
                  // unclustered
                  el.innerHTML = UnclusteredNode({ feature, images, NodeType });

                  // Add popup to unclustered node
                  const popup = new mapboxgl.Popup({
                    offset: NodeType === 'Number' || NodeType === 'Node' ? 25 : 45,
                    closeButton: false,
                    maxWidth: 'none',
                    className: 'my-custom-popup',
                  }).setHTML(createPopupHTML({ feature, images }));

                  const marker = new mapboxgl.Marker(el)
                    .setLngLat(feature.geometry.coordinates)
                    .setPopup(popup)
                    .addTo(map);

                  // Show the popup when the user hovers over the node
                  el.addEventListener('mouseenter', () => {
                    marker.togglePopup(); // Open the popup
                  });
                  el.addEventListener('mouseleave', () => {
                    marker.togglePopup(); // Close the popup
                  });

                  // Set selectedSite when the user clicks on the node
                  el.addEventListener('click', () => {
                    setSelectedSite({
                      _id: feature.properties._id,
                      coordinates: {
                        lat: feature.geometry.coordinates[1],
                        lng: feature.geometry.coordinates[0],
                      },
                    });
                  });

                  markers.push(marker);
                } else {
                  // clustered
                  el.className =
                    'flex justify-center items-center bg-white rounded-full p-2 shadow-md';
                  el.innerHTML = createClusterNode({ feature, images, NodeType });
                  const marker = new mapboxgl.Marker(el)
                    .setLngLat(feature.geometry.coordinates)
                    .addTo(map);
                  markers.push(marker);
                }
              });
            } catch (error) {
              console.error('Error updating clusters: ', error);
            }
          };

          map.on('zoomend', updateClusters);
          map.on('moveend', updateClusters);
          updateClusters();
        });
      } catch (error) {
        console.error('Error initializing the Map: ', error);
      }
    };

    initializeMap();

    return () => {
      mapRef.current.remove();
    };
  }, [mapStyle, mapboxApiAccessToken, refresh, pollutant, NodeType]);

  // Boundaries for a country
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
            // Adjust fill opacity based on zoom level
            const opacity = zoom > 10 ? 0 : 0.2;
            map.setPaintProperty('location-boundaries', 'fill-opacity', opacity);
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

  // generate code to close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const refreshMap = () => {
    const map = mapRef.current;
    map.setStyle(map.getStyle());
    setRefresh(!refresh);
  };

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
      setToastMessage('Location URL copied to clipboard');
    } catch (error) {
      console.error('Error sharing location', error);
      setToastMessage('Error sharing location');
    }
  };

  return (
    <div className='relative w-auto h-auto'>
      {/* Map */}
      <div ref={mapContainerRef} className={customStyle} />
      {/* Loader */}
      {refresh ||
        (loading && (
          <div
            className={`absolute inset-0 flex items-center justify-center z-40 ${
              showSideBar ? 'ml-96' : ''
            }`}>
            <div className='bg-white w-[70px] h-[70px] flex justify-center items-center rounded-md shadow-md'>
              <span className='ml-2'>
                <Loader width={32} height={32} />
              </span>
            </div>
          </div>
        ))}
      {/* Map control buttons */}
      <div className='absolute top-4 right-0'>
        <div className='flex flex-col gap-4'>
          <div className='relative'>
            <div className='relative inline-block' ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                title='Map Layers'
                className='inline-flex items-center justify-center w-[50px] h-[50px] mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'>
                <LayerIcon />
              </button>
              <LayerModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                mapStyles={mapStyles}
                showSideBar={showSideBar}
                onMapDetailsSelect={(detail) => {
                  setNodeType(detail);
                }}
                onStyleSelect={(style) => {
                  setMapStyle(style.url);
                }}
              />
            </div>
          </div>
          <button
            onClick={refreshMap}
            title='Refresh Map'
            className='inline-flex items-center justify-center w-[50px] h-[50px] mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'>
            <RefreshIcon />
          </button>
          <button
            onClick={shareLocation}
            title='Share Location'
            className='inline-flex items-center justify-center w-[50px] h-[50px] text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'>
            <ShareIcon />
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          clearData={() => setToastMessage(null)}
          type='success'
          timeout={3000}
          dataTestId='map-toast'
          size='lg'
        />
      )}
    </div>
  );
};

export default AirQoMap;
