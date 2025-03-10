// useLocationBoundaries.jsx
import { useEffect } from 'react';
import axios from 'axios';
import { BOUNDARY_URL } from '../data/constants';

const useLocationBoundaries = ({ mapRef, mapData, setLoading }) => {
  useEffect(() => {
    const source = axios.CancelToken.source();
    const fetchLocationBoundaries = async () => {
      if (!mapRef.current) return;
      const map = mapRef.current;
      setLoading(true);

      // Remove existing boundaries safely
      if (map.getLayer('location-boundaries')) {
        try {
          map.removeLayer('location-boundaries');
        } catch (err) {
          console.error('Error removing layer:', err);
        }
      }
      if (map.getSource('location-boundaries')) {
        try {
          map.removeSource('location-boundaries');
        } catch (err) {
          console.error('Error removing source:', err);
        }
      }

      let queryString = mapData.location.country;
      if (mapData.location.city) {
        queryString = `${mapData.location.city}, ${queryString}`;
      }

      try {
        const response = await axios.get(BOUNDARY_URL, {
          params: {
            q: queryString,
            polygon_geojson: 1,
            format: 'json',
          },
          cancelToken: source.token,
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

          const { lat: boundaryLat, lon: boundaryLon } = data[0];
          map.flyTo({
            center: [parseFloat(boundaryLon), parseFloat(boundaryLat)],
            zoom: mapData.location.city ? 10 : 5,
          });

          // Ensure the zoomend event is attached only once
          const zoomHandler = () => {
            const zoom = map.getZoom();
            const opacity = zoom > 10 ? 0 : 0.2;
            map.setPaintProperty(
              'location-boundaries',
              'fill-opacity',
              opacity,
            );
          };
          map.on('zoomend', zoomHandler);

          // Cleanup the event listener on unmount
          return () => {
            map.off('zoomend', zoomHandler);
          };
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Boundary fetch cancelled');
        } else {
          console.error('Error fetching location boundaries:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    const cleanup = fetchLocationBoundaries();

    return () => {
      source.cancel('Component unmounted, cancelling request.');
      if (cleanup instanceof Function) cleanup();
    };
  }, [mapData.location, mapRef, setLoading]);
};

export default useLocationBoundaries;
