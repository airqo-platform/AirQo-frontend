"use client";

import { useDeviceStatus } from "@/core/hooks/useDevices";
import { Loader2, ZoomIn, ZoomOut, Crosshair, Camera, Share2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const DEFAULT_CENTER: [number, number] = [32.2903, 1.3733];
const DEFAULT_ZOOM = 6;

const isValidCoordinate = (num: number) => {
  return typeof num === 'number' && !isNaN(num) && num !== 0;
};

// Custom map controls component
function MapControls({ map }: { map: mapboxgl.Map | null }) {
  const handleZoomIn = () => {
    if (!map) return;
    const currentZoom = map.getZoom();
    map.easeTo({
      zoom: currentZoom + 1,
      duration: 300
    });
  };

  const handleZoomOut = () => {
    if (!map) return;
    const currentZoom = map.getZoom();
    map.easeTo({
      zoom: currentZoom - 1,
      duration: 300
    });
  };

  const handleCenter = () => {
    if (!map) return;
    const center = map.getCenter();
    map.easeTo({
      center: center,
      duration: 300
    });
  };

  const handleReset = () => {
    if (!map) return;
    map.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      duration: 1000
    });
  };

  const handleScreenshot = async () => {
    if (!map) return;
    try {
      const canvas = map.getCanvas();
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'network-map.png';
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  };

  const handleShare = () => {
    if (!map) return;
    const center = map.getCenter();
    const zoom = map.getZoom();
    const url = `${window.location.origin}${window.location.pathname}?center=${center.lng},${center.lat}&zoom=${zoom}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('Map URL copied to clipboard!'))
      .catch(() => alert('Failed to copy URL to clipboard'));
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
          onClick={handleScreenshot}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Take screenshot"
        >
          <Camera className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Share map"
        >
          <Share2 className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

export function NetworkMap() {
  const { devices, isLoading } = useDeviceStatus();
  const [isClient, setIsClient] = useState(false);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the center calculation to prevent unnecessary recalculations
  const mapCenter = useMemo<[number, number]>(() => {
    if (!devices.length) return DEFAULT_CENTER;

    const validDevices = devices.filter(
      device => isValidCoordinate(device.latitude) && isValidCoordinate(device.longitude)
    );

    if (!validDevices.length) return DEFAULT_CENTER;

    const sum = validDevices.reduce(
      (acc, device) => {
        acc[0] += device.longitude;
        acc[1] += device.latitude;
        return acc;
      },
      [0, 0] as [number, number]
    );

    return [
      sum[0] / validDevices.length,
      sum[1] / validDevices.length
    ];
  }, [devices]);

  // First useEffect for map initialization
  useEffect(() => {
    if (!isClient || !mapContainerRef.current || !mapboxgl.accessToken) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: mapCenter,
      zoom: DEFAULT_ZOOM,
      maxZoom: 22
    });

    map.on('load', () => {
      setMapInstance(map);
    });

    return () => {
      if (currentPopupRef.current) {
        currentPopupRef.current.remove();
      }
      map.remove();
      setMapInstance(null);
    };
  }, [isClient]); // Remove mapCenter from dependencies

  // Second useEffect for updating map center when it changes
  useEffect(() => {
    if (!mapInstance?.loaded()) return;
    
    mapInstance.setCenter(mapCenter);
  }, [mapInstance, mapCenter]);

  // Separate effect for initializing map layers and data
  useEffect(() => {
    if (!mapInstance?.loaded()) return;

    // Create and add marker images
    const statuses = ['online', 'offline'];
    const maintenanceStatuses = ['good', 'due', 'overdue'];

    statuses.forEach(status => {
      maintenanceStatuses.forEach(maintenance => {
        const markerKey = `marker-${status}-${maintenance}`;
        if (mapInstance.hasImage(markerKey)) return;
        
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

        mapInstance.addImage(markerKey, {
          width: size,
          height: size,
          data: ctx.getImageData(0, 0, size, size).data,
        });
      });
    });

    // Add source if it doesn't exist
    if (!mapInstance.getSource('devices')) {
      mapInstance.addSource('devices', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add layers
      mapInstance.addLayer({
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

      mapInstance.addLayer({
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

      mapInstance.addLayer({
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
    }

    // Add event handlers
    const handleClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      const features = mapInstance.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const source = mapInstance.getSource('devices') as mapboxgl.GeoJSONSource;
      const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;
      
      source.getClusterExpansionZoom(
        clusterId as number,
        (err, zoom) => {
          if (err || typeof zoom !== 'number') return;

          mapInstance.easeTo({
            center: coordinates as [number, number],
            zoom: Math.min(zoom + 1, mapInstance.getMaxZoom()),
            duration: 500
          });
        }
      );
    };

    const handlePointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      const properties = feature.properties;
      if (!properties) return;

      if (currentPopupRef.current) {
        currentPopupRef.current.remove();
      }

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
        .addTo(mapInstance);

      currentPopupRef.current.on('close', () => {
        currentPopupRef.current = null;
      });
    };

    const handleMouseEnter = () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      mapInstance.getCanvas().style.cursor = '';
    };

    mapInstance.on('click', 'clusters', handleClusterClick);
    mapInstance.on('click', 'unclustered-point', handlePointClick);
    mapInstance.on('mouseenter', 'clusters', handleMouseEnter);
    mapInstance.on('mouseenter', 'unclustered-point', handleMouseEnter);
    mapInstance.on('mouseleave', 'clusters', handleMouseLeave);
    mapInstance.on('mouseleave', 'unclustered-point', handleMouseLeave);

    // Update the data
    const source = mapInstance.getSource('devices') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
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
      });
    }

    return () => {
      mapInstance.off('click', 'clusters', handleClusterClick);
      mapInstance.off('click', 'unclustered-point', handlePointClick);
      mapInstance.off('mouseenter', 'clusters', handleMouseEnter);
      mapInstance.off('mouseenter', 'unclustered-point', handleMouseEnter);
      mapInstance.off('mouseleave', 'clusters', handleMouseLeave);
      mapInstance.off('mouseleave', 'unclustered-point', handleMouseLeave);
    };
  }, [mapInstance, devices]);

  if (!isClient) {
    return null;
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
      <MapControls map={mapInstance} />
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading devices...</span>
          </div>
        </div>
      )}
    </div>
  );
} 