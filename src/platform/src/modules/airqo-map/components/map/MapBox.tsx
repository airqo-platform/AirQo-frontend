'use client';

import * as React from 'react';
import Map from 'react-map-gl/mapbox';
import { cn } from '@/shared/lib/utils';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapBoxProps {
  className?: string;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  style?: React.CSSProperties;
}

export const MapBox: React.FC<MapBoxProps> = ({
  className,
  initialViewState = {
    longitude: 32.5825, // Default to Kampala, Uganda (AirQo HQ)
    latitude: 0.3476,
    zoom: 10,
  },
  style,
}) => {
  // SECURITY NOTE: Mapbox access token must be client-side accessible
  // because react-map-gl requires it for map initialization and API calls.
  // Token security is managed through Mapbox dashboard restrictions.
  // See docs/MAPBOX_SECURITY.md for security best practices.
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxAccessToken) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-muted rounded-lg',
          className
        )}
      >
        <div className="text-center">
          <p className="text-muted-foreground">
            MapBox access token not configured
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('h-full w-full overflow-visible', className)}
      style={style}
    >
      <Map
        mapboxAccessToken={mapboxAccessToken}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        attributionControl={false}
      />
    </div>
  );
};
