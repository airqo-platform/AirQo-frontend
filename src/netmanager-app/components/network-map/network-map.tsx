"use client";

import { useDevices } from "@/core/hooks/useDevices";
import { Loader2, ZoomIn, ZoomOut, Crosshair, Camera, Share2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

// Custom map controls component
function MapControls() {
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleCenter = () => {
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: map.getCenter(),
        zoom: map.getZoom(),
        essential: true
      });
    }
  };

  const handleReset = () => {
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        essential: true
      });
    }
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[1000]">
      <div className="flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="h-5 w-5 text-gray-700" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleCenter}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Center map"
        >
          <Crosshair className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Reset view"
        >
          <RotateCcw className="h-5 w-5 text-gray-700" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <button
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Take screenshot"
        >
          <Camera className="h-5 w-5 text-gray-700" />
        </button>
        <button
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Share map"
        >
          <Share2 className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

const DEFAULT_CENTER: [number, number] = [32.2903, 1.3733];
const DEFAULT_ZOOM = 6;

const isValidCoordinate = (num: number) => {
  return typeof num === 'number' && !isNaN(num) && num !== 0;
};

export function NetworkMap() {
  const { devices, isLoading } = useDevices();
  const [isClient, setIsClient] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate map center based on device locations
  const center = devices.length > 0
    ? devices.reduce(
        (acc, device) => {
          if (isValidCoordinate(device.latitude) && isValidCoordinate(device.longitude)) {
            acc[0] += device.longitude;
            acc[1] += device.latitude;
            acc[2]++;
          }
          return acc;
        },
        [0, 0, 0] as [number, number, number]
      ).map((val, index) => index === 2 ? val : val / (devices.length || 1))
    : DEFAULT_CENTER;

  const mapCenter = useMemo<[number, number]>(() => 
    center[2] === 0 ? DEFAULT_CENTER : [center[0], center[1]]
  , [center]);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current || mapRef.current || !mapboxgl.accessToken) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: mapCenter,
      zoom: DEFAULT_ZOOM,
      maxZoom: 22
    });

    mapRef.current = map;

    // Wait for map style to load before adding layers
    map.on('style.load', () => {
      // Create and add all marker images first
      const statuses = ['online', 'offline'];
      const maintenanceStatuses = ['good', 'due', 'overdue'];

      // Create marker images
      statuses.forEach(status => {
        maintenanceStatuses.forEach(maintenance => {
          const markerKey = `marker-${status}-${maintenance}`;
          
          const size = 24;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Draw outer circle (maintenance status)
          ctx.beginPath();
          ctx.arc(size/2, size/2, 10, 0, Math.PI * 2);
          ctx.strokeStyle = maintenance === "good" ? "#22c55e" :
                         maintenance === "due" ? "#eab308" :
                         maintenance === "overdue" ? "#ef4444" :
                         "#94a3b8";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw inner circle (online status)
          ctx.beginPath();
          ctx.arc(size/2, size/2, 6, 0, Math.PI * 2);
          ctx.fillStyle = status === "online" ? "#22c55e" : "#ef4444";
          ctx.fill();

          map.addImage(markerKey, {
            width: size,
            height: size,
            data: ctx.getImageData(0, 0, size, size).data,
          });
        });
      });

      // Add source for device locations
      map.addSource('devices', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: devices
            .filter(device => isValidCoordinate(device.latitude) && isValidCoordinate(device.longitude))
            .map(device => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [device.longitude, device.latitude]
              },
              properties: {
                id: device._id,
                name: device.name,
                status: (typeof device.status === 'string' ? device.status : 'offline').toLowerCase(),
                maintenance_status: (typeof device.maintenance_status === 'string' ? device.maintenance_status : 'good').toLowerCase(),
                powerType: device.powerType,
                nextMaintenance: device.nextMaintenance?.$date
              }
            }))
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add cluster circles layer (bottom layer)
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'devices',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#4F46E5',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            5,
            25,
            10,
            30
          ],
          'circle-opacity': 0.8
        }
      });

      // Add cluster count layer
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'devices',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Add unclustered point layer (individual markers)
      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'devices',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'concat',
            'marker-',
            ['get', 'status'],
            '-',
            ['get', 'maintenance_status']
          ],
          'icon-size': 1,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });

      // Handle cluster click
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;

        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource('devices') as mapboxgl.GeoJSONSource;
        const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;
        
        source.getClusterExpansionZoom(
          clusterId as number,
          (err, zoom) => {
            if (err || typeof zoom !== 'number') return;

            map.easeTo({
              center: coordinates as [number, number],
              zoom: Math.min(zoom + 1, map.getMaxZoom()),
              duration: 500
            });
          }
        );
      });

      // Handle individual marker click
      map.on('click', 'unclustered-point', (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        const properties = feature.properties;
        if (!properties) return;

        // Close the previous popup if it exists
        if (currentPopupRef.current) {
          currentPopupRef.current.remove();
        }

        // Create and store the new popup
        currentPopupRef.current = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: false
        })
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${properties.name}</h3>
              <div class="text-sm space-y-1 mt-2">
                <p>Status: <span class="${properties.status === "online" ? "text-green-600" : "text-red-600"}">${properties.status}</span></p>
                <p>Maintenance: <span class="${
                  properties.maintenance_status === "good" ? "text-green-600" :
                  properties.maintenance_status === "due" ? "text-yellow-600" :
                  "text-red-600"
                }">${properties.maintenance_status}</span></p>
                <p>Power Source: ${properties.powerType}</p>
                ${properties.nextMaintenance ? `
                  <p>Next Maintenance: ${new Date(properties.nextMaintenance).toLocaleDateString()}</p>
                ` : ''}
              </div>
            </div>
          `)
          .addTo(map);

        // Add event listener to clear the ref when popup is manually closed
        currentPopupRef.current.on('close', () => {
          currentPopupRef.current = null;
        });
      });

      // Change cursor on hover
      map.on('mouseenter', ['clusters', 'unclustered-point'], () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', ['clusters', 'unclustered-point'], () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
      // Clean up popup when component unmounts
      if (currentPopupRef.current) {
        currentPopupRef.current.remove();
      }
      map.remove();
      mapRef.current = null;
    };
  }, [isClient, devices, mapCenter]);

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
    <div className="h-full w-full relative">
      <style jsx global>{`
        .mapboxgl-ctrl-bottom-left,
        .mapboxgl-ctrl-bottom-right,
        .mapboxgl-ctrl-top-left,
        .mapboxgl-ctrl-top-right {
          display: none !important;
        }
        .mapboxgl-popup-content {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
      <div ref={mapContainerRef} className="h-full w-full" />
      <MapControls />
    </div>
  );
} 