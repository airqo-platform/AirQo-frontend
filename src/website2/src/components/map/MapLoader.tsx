'use client';

import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    mapboxgl: any;
  }
}

interface MapLoaderProps {
  children: React.ReactNode;
}

const MapLoader: React.FC<MapLoaderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.mapboxgl) {
      setIsLoaded(true);
      return;
    }

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!MAPBOX_TOKEN) {
      setError('Mapbox access token is not configured');
      console.error(
        'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set in environment variables',
      );
      return;
    }

    // Load Mapbox GL JS CSS - check if already exists
    let link = document.querySelector(
      'link[href*="mapbox-gl.css"]',
    ) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
      document.head.appendChild(link);
    }

    // Load Mapbox GL JS - check if already exists
    let script = document.querySelector(
      'script[src*="mapbox-gl.js"]',
    ) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // If script is already loaded, set token immediately
    if (window.mapboxgl) {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      setIsLoaded(true);
    } else {
      // Set up event handlers for newly created script
      script.onload = () => {
        if (window.mapboxgl) {
          window.mapboxgl.accessToken = MAPBOX_TOKEN;
          setIsLoaded(true);
        } else {
          setError('Failed to load Mapbox GL JS');
        }
      };

      script.onerror = () => {
        setError('Failed to load Mapbox GL JS library');
      };
    }

    // No cleanup needed - Mapbox GL is a global resource
    // that should persist for the lifetime of the page
    return () => {
      // Cleanup removed - global resources should persist
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-8">
          <p className="text-red-600 font-semibold mb-2">Map Loading Error</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MapLoader;
