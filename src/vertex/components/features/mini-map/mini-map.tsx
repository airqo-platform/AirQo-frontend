"use client";

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MiniMapProps {
  latitude: string;
  longitude: string;
  siteName: string;
  onCoordinateChange: (lat: string, lng: string) => void;
  onSiteNameChange: (name: string) => void;
  inputMode: 'siteName' | 'coordinates';
  onToggleInputMode: () => void;
}

const DEFAULT_CENTER: [number, number] = [32.2903, 1.3733];
const DEFAULT_ZOOM = 12;

// Reverse geocoding function
const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=place,locality,neighborhood,address`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      // Try to get a meaningful place name
      const feature = data.features[0];
      return feature.place_name || feature.text || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
  }
  return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

// Forward geocoding function
const geocode = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=1`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (error) {
    console.error('Geocoding failed:', error);
  }
  return null;
};

export function MiniMap({ 
  latitude, 
  longitude, 
  siteName, 
  onCoordinateChange, 
  onSiteNameChange, 
  inputMode, 
  onToggleInputMode 
}: MiniMapProps) {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Handle coordinate updates from map interaction
  const handleCoordinateUpdate = async (lat: number, lng: number) => {
    onCoordinateChange(lat.toString(), lng.toString());
    
    // If in siteName mode, reverse geocode to get place name
    if (inputMode === 'siteName') {
      setIsGeocoding(true);
      const placeName = await reverseGeocode(lng, lat);
      onSiteNameChange(placeName);
      setIsGeocoding(false);
    }
  };

  // Handle site name search
  const handleSiteNameSearch = async (name: string) => {
    onSiteNameChange(name);
    
    if (name.trim() && inputMode === 'siteName') {
      setIsGeocoding(true);
      const result = await geocode(name);
      if (result && mapInstance && markerRef.current) {
        onCoordinateChange(result.lat.toString(), result.lng.toString());
        markerRef.current.setLngLat([result.lng, result.lat]);
        mapInstance.setCenter([result.lng, result.lat]);
      }
      setIsGeocoding(false);
    }
  };

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
  }, [inputMode]); // Re-initialize when input mode changes

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
