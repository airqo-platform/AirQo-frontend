"use client";

import { useDevices } from "@/core/hooks/useDevices";
import { Loader2, ZoomIn, ZoomOut, Crosshair, Camera, Share2, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";

// Custom map controls component
function MapControls() {
  const map = useMap();

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <button
          onClick={() => map.zoomIn()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="h-6 w-6" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="h-6 w-6" />
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <button
          onClick={() => map.setView(map.getCenter(), map.getZoom())}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Center map"
        >
          <Crosshair className="h-6 w-6" />
        </button>
        <button
          onClick={() => map.setView(DEFAULT_CENTER, 7)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Reset view"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Take screenshot"
        >
          <Camera className="h-6 w-6" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Share map"
        >
          <Share2 className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

// Dynamically import react-leaflet components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const DeviceMarker = dynamic(
  () => import("./device-marker").then((mod) => mod.DeviceMarker),
  { ssr: false }
);
const MapLegend = dynamic(
  () => import("./map-legend").then((mod) => mod.MapLegend),
  { ssr: false }
);

const DEFAULT_CENTER: [number, number] = [0.347596, 32.58252]; // Uganda coordinates

const isValidCoordinate = (num: number) => {
  return typeof num === 'number' && !isNaN(num) && num !== 0;
};

export function NetworkMap() {
  const { devices, isLoading } = useDevices();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate map center based on device locations
  const center = devices.length > 0
    ? devices.reduce(
        (acc, device) => {
          if (isValidCoordinate(device.latitude) && isValidCoordinate(device.longitude)) {
            acc[0] += device.latitude;
            acc[1] += device.longitude;
            acc[2]++; // Counter for valid coordinates
          }
          return acc;
        },
        [0, 0, 0] // [latSum, lngSum, count]
      ).map((val, index) => index === 2 ? val : val / (devices.length || 1))
    : DEFAULT_CENTER;

  // If no valid coordinates were found, use default center
  const mapCenter: [number, number] = center[2] === 0 ? DEFAULT_CENTER : [center[0], center[1]];

  if (!isClient) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full">
      <style jsx global>{`
        .leaflet-control-container .leaflet-control {
          display: none !important;
        }
        .leaflet-container {
          z-index: 0;
        }
      `}</style>
      <MapContainer
        center={mapCenter}
        zoom={7}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {devices.map((device) => (
          isValidCoordinate(device.latitude) && isValidCoordinate(device.longitude) ? (
            <DeviceMarker key={device._id} device={device} />
          ) : null
        ))}
        <MapLegend />
        <MapControls />
      </MapContainer>
    </div>
  );
} 