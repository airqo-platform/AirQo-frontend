"use client";

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from 'react-redux';
import { setPolygon } from '@/core/redux/slices/gridsSlice';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { cn } from '@/lib/utils';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MiniMapProps {
  latitude?: string;
  longitude?: string;
  onCoordinateChange?: (lat: string, lng: string) => void;
  onSiteNameChange?: (name: string) => void;
  inputMode?: 'siteName' | 'coordinates';
  customSiteName?: string;
  mapMode?: 'marker' | 'polygon';
  center?: [number, number];
  zoom?: number;
  scrollZoom?: boolean;
  height?: string;
}

const DEFAULT_CENTER: [number, number] = [32.58252, 0.347596]; // Kampala
const DEFAULT_ZOOM = 10;

// Reverse geocoding function
const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
  if (!mapboxgl.accessToken) {
    console.error('❌ No Mapbox access token found!');
    return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=place,locality,neighborhood,address,poi`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('❌ Response not ok:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      // Priority order: place > locality > neighborhood > poi > address
      type MapboxFeature = {
        place_type?: string[];
        text?: string;
        place_name?: string;
      };

      const featuresByType = {
        place: data.features.find((f: MapboxFeature) => f.place_type?.includes('place')),
        locality: data.features.find((f: MapboxFeature) => f.place_type?.includes('locality')),
        neighborhood: data.features.find((f: MapboxFeature) => f.place_type?.includes('neighborhood')),
        poi: data.features.find((f: MapboxFeature) => f.place_type?.includes('poi')),
        address: data.features.find((f: MapboxFeature) => f.place_type?.includes('address'))
      };

      // Get the best available feature
      const bestFeature = featuresByType.place ||
        featuresByType.locality ||
        featuresByType.neighborhood ||
        featuresByType.poi ||
        featuresByType.address ||
        data.features[0];

      if (bestFeature) {
        let placeName;
        // For better naming, prefer text over place_name for certain types
        if (bestFeature.place_type?.includes('place') || bestFeature.place_type?.includes('locality')) {
          placeName = bestFeature.text || bestFeature.place_name;
        } else {
          placeName = bestFeature.place_name || bestFeature.text;
        }

        return placeName || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } else {
      console.log('⚠️ No features found in response');
    }
  } catch (error) {
    console.error('❌ Reverse geocoding failed:', error);
  }

  const fallbackName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  return fallbackName;
};

function MiniMap({
  latitude = '0',
  longitude = '0',
  onCoordinateChange,
  onSiteNameChange,
  customSiteName,
  mapMode = 'marker',
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  scrollZoom = true,
  height = 'h-72',
}: MiniMapProps) {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const dispatch = useDispatch();

  // Handle coordinate updates from map interaction
  const handleCoordinateUpdate = useCallback(async (lat: number, lng: number) => {
    if (onCoordinateChange) {
      onCoordinateChange(lat.toString(), lng.toString());
    }
    if (!onSiteNameChange) {
      return;
    }

    setIsGeocoding(true);
    try {
      const placeName = await reverseGeocode(lng, lat);
      if (placeName && !placeName.startsWith('Location at ')) {
        onSiteNameChange(placeName);
      } else {
        if (customSiteName && customSiteName.trim()) {
          onSiteNameChange(customSiteName);
        } else {
          onSiteNameChange(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      }
    } catch (error) {
      console.error('Failed to get place name:', error);
      if (customSiteName && customSiteName.trim()) {
        onSiteNameChange(customSiteName);
      } else {
        onSiteNameChange(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } finally {
      setIsGeocoding(false);
    }
  }, [onCoordinateChange, onSiteNameChange, customSiteName]);

  useEffect(() => {
    if (!mapContainerRef.current || !mapboxgl.accessToken) return;

    const currentCenter: [number, number] = (latitude && longitude && parseFloat(latitude) !== 0 && parseFloat(longitude) !== 0)
      ? [parseFloat(longitude), parseFloat(latitude)]
      : center;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: currentCenter,
      zoom: zoom,
      scrollZoom: scrollZoom,
    });

    map.addControl(new mapboxgl.NavigationControl());

    if (mapMode === 'marker') {
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat(currentCenter)
        .addTo(map);

      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current?.getLngLat();
        if (lngLat) {
          handleCoordinateUpdate(lngLat.lat, lngLat.lng);
        }
      });

      map.on('click', (event) => {
        const { lng, lat } = event.lngLat;
        markerRef.current?.setLngLat([lng, lat]);
        handleCoordinateUpdate(lat, lng);
      });
    } else if (mapMode === 'polygon') {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: 'draw_polygon',
      });
      map.addControl(draw);

      const updateArea = () => {
        const data = draw.getAll();
        if (data.features.length > 1) {
          const idsToDelete = data.features.slice(0, -1).map((f: { id?: string | number }) => f.id as string);
          draw.delete(idsToDelete);
          return;
        }

        if (data.features.length > 0) {
          const feature = data.features[0];
          const geoJson = feature.geometry as { type: string; coordinates: number[][][] };
          const transformedCoordinates = geoJson.coordinates.map((ring: number[][]) =>
            ring.map((point: number[]) => [point[1], point[0]] as [number, number])
          );
          dispatch(
            setPolygon({
              type: geoJson.type as "Polygon" | "MultiPolygon",
              coordinates: transformedCoordinates,
            })
          );
        } else {
          dispatch(setPolygon({ type: "Polygon", coordinates: null }));
        }
      };

      map.on('draw.create', updateArea);
      map.on('draw.update', updateArea);
      map.on('draw.delete', updateArea);
    }

    setMapInstance(map);

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapMode]);

  useEffect(() => {
    if (mapMode === 'marker' && latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (markerRef.current && mapInstance && !isNaN(lat) && !isNaN(lng)) {
        markerRef.current.setLngLat([lng, lat]);
        mapInstance.setCenter([lng, lat]);
      }
    }
  }, [latitude, longitude, mapInstance]);

  return (
    <div className="space-y-4">
      <div ref={mapContainerRef} className={cn("w-full rounded-md shadow-md", height)} />

      {isGeocoding && (
        <div className="text-sm text-muted-foreground text-center">
          Searching location...
        </div>
      )}
    </div>
  );
}

export default MiniMap;
