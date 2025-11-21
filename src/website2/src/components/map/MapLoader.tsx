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
      <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse">
        {/* Map-like skeleton */}
        <div className="w-full h-full bg-gray-200 rounded-lg relative overflow-hidden">
          {/* Simulated map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400"></div>

          {/* Simulated roads/streets */}
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-400 opacity-60"></div>
          <div className="absolute top-1/2 left-1/4 right-0 h-0.5 bg-gray-400 opacity-50"></div>
          <div className="absolute top-3/4 left-0 right-1/3 h-1 bg-gray-400 opacity-60"></div>
          <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-gray-400 opacity-50"></div>
          <div className="absolute left-2/3 top-1/3 bottom-1/3 w-1 bg-gray-400 opacity-60"></div>

          {/* Simulated buildings/blocks */}
          <div className="absolute top-1/6 left-1/6 w-8 h-6 bg-gray-300 rounded opacity-70"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-8 bg-gray-300 rounded opacity-70"></div>
          <div className="absolute bottom-1/4 left-1/2 w-10 h-5 bg-gray-300 rounded opacity-70"></div>
          <div className="absolute bottom-1/3 right-1/6 w-7 h-7 bg-gray-300 rounded opacity-70"></div>

          {/* Loading text */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MapLoader;
