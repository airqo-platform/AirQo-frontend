"use client";

import { lazy, Suspense } from "react";
import { MapPin } from "lucide-react";

const MiniMap = lazy(() => import("@/components/features/mini-map/mini-map"));

interface DeviceLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  height?: string;
  zoom?: number;
}

export function DeviceLocationMap({
  latitude,
  longitude,
  height = "h-48",
  zoom = 13,
}: DeviceLocationMapProps) {
  const hasCoordinates = latitude !== null && longitude !== null;

  if (!hasCoordinates) {
    return (
      <div className={`${height} rounded-md border border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/30`}>
        <MapPin className="h-6 w-6 opacity-40" />
        <p className="text-sm text-center px-4">
          Location data is currently unavailable for this device
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className={`${height} rounded-md bg-muted animate-pulse`} />}>
      <MiniMap
        latitude={String(latitude)}
        longitude={String(longitude)}
        readOnly
        scrollZoom={false}
        height={height}
        zoom={zoom}
      />
    </Suspense>
  );
}
