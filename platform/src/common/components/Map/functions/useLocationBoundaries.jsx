import { useEffect } from 'react';
import axios from 'axios';
import { BOUNDARY_URL } from '../data/constants';

const useLocationBoundaries = ({ mapRef, mapData, setLoading }) => {
  useEffect(() => {
    const fetchLocationBoundaries = async () => {
      setLoading(true);
      const map = mapRef.current;

      if (!map) return;

      // Remove existing boundaries if any
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
        const response = await axios.get(BOUNDARY_URL, {
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

          const { lat: boundaryLat, lon: boundaryLon } = data[0];
          map.flyTo({
            center: [parseFloat(boundaryLon), parseFloat(boundaryLat)],
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
  }, [mapRef, mapData, setLoading]);
};

export default useLocationBoundaries;
