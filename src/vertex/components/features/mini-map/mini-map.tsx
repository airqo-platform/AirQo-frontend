"use client";

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState, useCallback } from "react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MiniMapProps {
  latitude: string;
  longitude: string;
  onCoordinateChange: (lat: string, lng: string) => void;
  onSiteNameChange: (name: string) => void;
  inputMode: 'siteName' | 'coordinates';
  customSiteName?: string; // Add custom site name as fallback
}

const DEFAULT_CENTER: [number, number] = [32.2903, 1.3733];
const DEFAULT_ZOOM = 12;

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

export function MiniMap({ 
  latitude, 
  longitude, 
  onCoordinateChange, 
  onSiteNameChange, 
  inputMode,
  customSiteName,
}: MiniMapProps) {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Handle coordinate updates from map interaction
  const handleCoordinateUpdate = useCallback(async (lat: number, lng: number) => {
    onCoordinateChange(lat.toString(), lng.toString());
    
    // Always try to reverse geocode to get place name from Mapbox
    setIsGeocoding(true);
    try {
      const placeName = await reverseGeocode(lng, lat);
      // Check if we got a meaningful place name (not the generic fallback)
      if (placeName && !placeName.startsWith('Location at ')) {
        onSiteNameChange(placeName);
      } else {
        // If reverse geocoding failed, use custom site name if available
        if (customSiteName && customSiteName.trim()) {
          onSiteNameChange(customSiteName);
        } else {
          // Final fallback to generic location name
          onSiteNameChange(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      }
    } catch (error) {
      console.error('Failed to get place name:', error);
      // If reverse geocoding failed, use custom site name if available
      if (customSiteName && customSiteName.trim()) {
        onSiteNameChange(customSiteName);
      } else {
        // Final fallback to generic location name
        onSiteNameChange(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } finally {
      setIsGeocoding(false);
    }
  }, [onCoordinateChange, onSiteNameChange, customSiteName]);

  useEffect(() => {
    if (!mapContainerRef.current || !mapboxgl.accessToken) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat(DEFAULT_CENTER)
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

    setMapInstance(map);

    return () => {
      markerRef.current?.remove();
      map.remove();
    };
  }, [inputMode, handleCoordinateUpdate]); // Re-initialize when input mode changes

  useEffect(() => {
    if (latitude && longitude) {
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
      
      <div ref={mapContainerRef} className="w-full h-64 rounded-md shadow-md" />
      
      {isGeocoding && (
        <div className="text-sm text-muted-foreground text-center">
          Searching location...
        </div>
      )}
    </div>
  );
}
