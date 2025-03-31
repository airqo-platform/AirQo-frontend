import { useEffect, useRef } from 'react';
import axios from 'axios';
import { BOUNDARY_URL } from '../data/constants';

const useLocationBoundaries = ({ mapRef, mapData, setLoading }) => {
  const zoomHandlerRef = useRef(null);
  const activeRequestRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !mapData.location?.country) return;

    const map = mapRef.current;

    // Cancel any previous request
    if (activeRequestRef.current) {
      activeRequestRef.current.cancel('New boundary request initiated');
    }

    // Clean up previous event listener
    if (zoomHandlerRef.current) {
      map.off('zoomend', zoomHandlerRef.current);
      zoomHandlerRef.current = null;
    }

    const fetchLocationBoundaries = async () => {
      setLoading(true);

      // Remove existing boundaries
      ['location-boundaries'].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });

      if (map.getSource('location-boundaries')) {
        map.removeSource('location-boundaries');
      }

      // Prepare query string
      const queryString = mapData.location.city
        ? `${mapData.location.city}, ${mapData.location.country}`
        : mapData.location.country;

      // Create cancelation token
      activeRequestRef.current = axios.CancelToken.source();

      try {
        const response = await axios.get(BOUNDARY_URL, {
          params: {
            q: queryString,
            polygon_geojson: 1,
            format: 'json',
          },
          cancelToken: activeRequestRef.current.token,
        });

        const data = response.data;
        if (!data?.length || !data[0]?.geojson) {
          throw new Error('No boundary data found');
        }

        // Add boundary to map
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

        // Fly to boundary location
        const { lat, lon } = data[0];
        if (lat && lon) {
          map.flyTo({
            center: [parseFloat(lon), parseFloat(lat)],
            zoom: mapData.location.city ? 10 : 5,
            essential: true,
          });
        }

        // Add zoom handler to adjust opacity
        const zoomHandler = () => {
          const zoom = map.getZoom();
          const opacity = zoom > 10 ? 0 : 0.2;
          if (map.getLayer('location-boundaries')) {
            map.setPaintProperty(
              'location-boundaries',
              'fill-opacity',
              opacity,
            );
          }
        };

        zoomHandlerRef.current = zoomHandler;
        map.on('zoomend', zoomHandler);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Boundary fetch error:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLocationBoundaries();

    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.cancel('Component unmounted');
      }

      if (map && zoomHandlerRef.current) {
        map.off('zoomend', zoomHandlerRef.current);
      }

      if (map && map.getLayer('location-boundaries')) {
        map.removeLayer('location-boundaries');
        if (map.getSource('location-boundaries')) {
          map.removeSource('location-boundaries');
        }
      }
    };
  }, [mapData.location, mapRef, setLoading]);
};

export default useLocationBoundaries;
