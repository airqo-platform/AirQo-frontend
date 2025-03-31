import { useEffect, useRef } from 'react';
import axios from 'axios';
import { BOUNDARY_URL } from '../data/constants';

const useLocationBoundaries = ({ mapRef, mapData, setLoading }) => {
  const zoomHandlerRef = useRef(null);
  const activeRequestRef = useRef(null);
  const hasLayerRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current || !mapData.location?.country) return;

    const map = mapRef.current;

    // Safely check if a layer exists
    const layerExists = (layerId) => {
      try {
        return map.isStyleLoaded() && map.getLayer(layerId);
      } catch (err) {
        console.error('Error checking layer existence:', err);
        return false;
      }
    };

    // Safely check if a source exists
    const sourceExists = (sourceId) => {
      try {
        return map.isStyleLoaded() && map.getSource(sourceId);
      } catch (err) {
        console.error('Error checking source existence:', err);
        return false;
      }
    };

    // Safely remove existing boundaries
    const removeBoundaries = () => {
      try {
        if (layerExists('location-boundaries')) {
          map.removeLayer('location-boundaries');
        }

        if (sourceExists('location-boundaries')) {
          map.removeSource('location-boundaries');
        }

        hasLayerRef.current = false;
      } catch (err) {
        console.error('Error removing boundaries:', err);
      }
    };

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
      removeBoundaries();

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

        // Wait for style to be loaded before adding layers
        const waitForStyleLoaded = () => {
          return new Promise((resolve) => {
            if (map.isStyleLoaded()) {
              resolve();
              return;
            }

            const styleDataListener = () => {
              if (map.isStyleLoaded()) {
                map.off('styledata', styleDataListener);
                resolve();
              }
            };

            map.on('styledata', styleDataListener);
          });
        };

        await waitForStyleLoaded();

        // Double-check map is still valid
        if (!mapRef.current) return;

        // Add boundary to map
        const boundaryData = data[0].geojson;

        // Only add source if it doesn't already exist
        if (!sourceExists('location-boundaries')) {
          map.addSource('location-boundaries', {
            type: 'geojson',
            data: boundaryData,
          });
        }

        // Only add layer if it doesn't already exist
        if (!layerExists('location-boundaries')) {
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

          hasLayerRef.current = true;
        }

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
          try {
            const zoom = map.getZoom();
            const opacity = zoom > 10 ? 0 : 0.2;

            if (layerExists('location-boundaries')) {
              map.setPaintProperty(
                'location-boundaries',
                'fill-opacity',
                opacity,
              );
            }
          } catch (err) {
            console.error('Error in zoom handler:', err);
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

    // Handle style changes
    const handleStyleData = () => {
      // If we had a layer before the style changed and the style is now loaded,
      // we need to re-add our layer
      if (hasLayerRef.current && map.isStyleLoaded()) {
        // Delay slightly to ensure style is fully processed
        setTimeout(() => {
          if (mapRef.current) {
            fetchLocationBoundaries();
          }
        }, 100);
      }
    };

    // Listen for style changes
    map.on('styledata', handleStyleData);

    // Initial fetch
    fetchLocationBoundaries();

    // Cleanup
    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.cancel('Component unmounted');
      }

      if (mapRef.current) {
        mapRef.current.off('styledata', handleStyleData);

        if (zoomHandlerRef.current) {
          mapRef.current.off('zoomend', zoomHandlerRef.current);
        }

        removeBoundaries();
      }
    };
  }, [mapData.location, mapRef, setLoading]);
};

export default useLocationBoundaries;
