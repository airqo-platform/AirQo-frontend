"use client";

import { useDeviceStatus } from "@/core/hooks/useDevices";
import { AqRefreshCw05, AqMark, AqPlus, AqMinus } from "@airqo/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LoadingOverlay } from "./loading-overlay";

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const DEFAULT_CENTER: [number, number] = [32.2903, 1.3733];
const DEFAULT_ZOOM = 6;

const isValidCoordinate = (num: number | string | null | undefined) => {
  if (typeof num === "number") {
    return !isNaN(num) && num !== 0;
  }
  if (typeof num === "string") {
    const parsed = parseFloat(num);
    return !isNaN(parsed) && parsed !== 0;
  }
  return false;
};

// Custom map controls component
function MapControls({ map }: { map: mapboxgl.Map | null }) {
  const handleZoomIn = () => {
    if (!map) return;
    const currentZoom = map.getZoom();
    map.easeTo({
      zoom: currentZoom + 1,
      duration: 300,
    });
  };

  const handleZoomOut = () => {
    if (!map) return;
    const currentZoom = map.getZoom();
    map.easeTo({
      zoom: currentZoom - 1,
      duration: 300,
    });
  };

  const handleCenter = () => {
    if (!map) return;
    const center = map.getCenter();
    map.easeTo({
      center: center,
      duration: 300,
    });
  };

  const handleReset = () => {
    if (!map) return;
    map.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      duration: 1000,
    });
  };

  // const handleScreenshot = async () => {
  //   if (!map) return;
  //   try {
  //     const canvas = map.getCanvas();
  //     const dataURL = canvas.toDataURL("image/png");
  //     const link = document.createElement("a");
  //     link.download = "network-map.png";
  //     link.href = dataURL;
  //     link.click();
  //   } catch (error) {
  //     console.error("Failed to take screenshot:", error);
  //   }
  // };

  // const handleShare = () => {
  //   if (!map) return;
  //   const center = map.getCenter();
  //   const zoom = map.getZoom();
  //   const url = `${window.location.origin}${window.location.pathname}?center=${center.lng},${center.lat}&zoom=${zoom}`;
  //   navigator.clipboard
  //     .writeText(url)
  //     .then(() => alert("Map URL copied to clipboard!"))
  //     .catch(() => alert("Failed to copy URL to clipboard"));
  // };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[1000]">
      <div className="flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Zoom in"
        >
          <AqPlus className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Zoom out"
        >
          <AqMinus className="h-5 w-5 text-gray-700" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleCenter}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Center map"
        >
          <AqMark className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Reset view"
        >
          <AqRefreshCw05 className="h-5 w-5 text-gray-700" />
        </button>
      </div>
      {/* <div className="flex flex-col gap-2">
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
      </div> */}
    </div>
  );
}

export function NetworkMap() {
  const { devices, isLoading } = useDeviceStatus();
  const [isClient, setIsClient] = useState(false);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
  const isFirstLoad = useRef(true);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force map resize when container dimensions change
  const handleResize = useCallback(() => {
    if (mapInstance && mapLoaded && mapInstance.getContainer()) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        try {
          if (mapInstance && mapInstance.getContainer()) {
            mapInstance.resize();
          }
        } catch (error) {
          console.warn("Map resize failed:", error);
        }
      }, 100);
    }
  }, [mapInstance, mapLoaded]);

  // Set up ResizeObserver for container size changes
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstance) return;

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(mapContainerRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [mapInstance, handleResize]);

  // Map initialization effect
  useEffect(() => {
    if (!isClient || !mapContainerRef.current || !mapboxgl.accessToken) return;

    // Ensure container has dimensions before initializing map
    const containerRect = mapContainerRef.current.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) {
      // Retry after a short delay if container has no dimensions
      const timeout = setTimeout(() => {
        if (mapContainerRef.current) {
          const newRect = mapContainerRef.current.getBoundingClientRect();
          if (newRect.width > 0 && newRect.height > 0) {
            initializeMap();
          }
        }
      }, 100);
      return () => clearTimeout(timeout);
    }

    initializeMap();

    function initializeMap() {
      if (!mapContainerRef.current) return;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/standard",
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        maxZoom: 22,
        projection: "mercator",
        // Add these options for better initial rendering
        preserveDrawingBuffer: true,
        antialias: true,
      });

      // Initialize map layers and sources on load
      map.on("load", () => {
        setMapLoaded(true);

        // Force resize after load to ensure proper dimensions
        setTimeout(() => {
          try {
            if (map && map.getContainer()) {
              map.resize();
            }
          } catch (error) {
            console.warn("Initial map resize failed:", error);
          }
        }, 100);

        // Create and add marker images
        const statuses = ["online", "offline"];
        const maintenanceStatuses = ["good", "due", "overdue"];

        statuses.forEach((status) => {
          maintenanceStatuses.forEach((maintenance) => {
            const markerKey = `marker-${status}-${maintenance}`;
            if (map.hasImage(markerKey)) return;

            const size = 24;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Draw outer circle (maintenance status)
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 10, 0, Math.PI * 2);
            ctx.strokeStyle =
              maintenance === "good"
                ? "#22c55e"
                : maintenance === "due"
                ? "#eab308"
                : maintenance === "overdue"
                ? "#ef4444"
                : "#94a3b8";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw inner circle (online status)
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 6, 0, Math.PI * 2);
            ctx.fillStyle = status === "online" ? "#22c55e" : "#ef4444";
            ctx.fill();

            map.addImage(markerKey, {
              width: size,
              height: size,
              data: ctx.getImageData(0, 0, size, size).data,
            });
          });
        });

        // Add source and layers
        map.addSource("devices", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "devices",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#4F46E5",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              5,
              25,
              10,
              30,
            ],
            "circle-opacity": 0.8,
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "devices",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        map.addLayer({
          id: "unclustered-point",
          type: "symbol",
          source: "devices",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": [
              "concat",
              "marker-",
              ["get", "status"],
              "-",
              ["get", "maintenance_status"],
            ],
            "icon-size": 1,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
        });

        // Add event handlers
        const handleClusterClick = (
          e: mapboxgl.MapMouseEvent & {
            features?: mapboxgl.MapboxGeoJSONFeature[];
          }
        ) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          if (!features.length) return;

          const clusterId = features[0].properties?.cluster_id;
          const source = map.getSource("devices") as mapboxgl.GeoJSONSource;
          const coordinates = (features[0].geometry as GeoJSON.Point)
            .coordinates;

          source.getClusterExpansionZoom(clusterId as number, (err, zoom) => {
            if (err || typeof zoom !== "number") return;

            map.easeTo({
              center: coordinates as [number, number],
              zoom: Math.min(zoom + 1, map.getMaxZoom()),
              duration: 500,
            });
          });
        };

        const handlePointClick = (
          e: mapboxgl.MapMouseEvent & {
            features?: mapboxgl.MapboxGeoJSONFeature[];
          }
        ) => {
          if (!e.features?.length) return;
          const feature = e.features[0];

          const coordinates = (
            feature.geometry as GeoJSON.Point
          ).coordinates.slice() as [number, number];
          const properties = feature.properties;
          if (!properties) return;

          if (currentPopupRef.current) {
            currentPopupRef.current.remove();
          }

          currentPopupRef.current = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
          })
            .setLngLat(coordinates)
            .setHTML(
              `
              <div class="p-2">
                <h3 class="font-semibold">${properties.name}</h3>
                <div class="text-sm space-y-1 mt-2">
                  <p>Status: <span class="${
                    properties.status === "online"
                      ? "text-green-600"
                      : "text-red-600"
                  }">${properties.status}</span></p>
                  <p>Maintenance: <span class="${
                    properties.maintenance_status === "good"
                      ? "text-green-600"
                      : properties.maintenance_status === "due"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }">${properties.maintenance_status}</span></p>
                  <p>Power Source: ${properties.powerType}</p>
                  ${
                    properties.nextMaintenance
                      ? `
                    <p>Next Maintenance: ${new Date(
                      properties.nextMaintenance
                    ).toLocaleDateString()}</p>
                  `
                      : ""
                  }
                </div>
              </div>
            `
            )
            .addTo(map);

          currentPopupRef.current.on("close", () => {
            currentPopupRef.current = null;
          });
        };

        const handleMouseEnter = () => {
          map.getCanvas().style.cursor = "pointer";
        };

        const handleMouseLeave = () => {
          map.getCanvas().style.cursor = "";
        };

        map.on("click", "clusters", handleClusterClick);
        map.on("click", "unclustered-point", handlePointClick);
        map.on("mouseenter", "clusters", handleMouseEnter);
        map.on("mouseenter", "unclustered-point", handleMouseEnter);
        map.on("mouseleave", "clusters", handleMouseLeave);
        map.on("mouseleave", "unclustered-point", handleMouseLeave);

        // Set map instance after everything is set up
        setMapInstance(map);
      });

      // Handle resize events
      map.on("resize", () => {
        try {
          // Force redraw after resize
          if (map && map.getCanvas()) {
            map.getCanvas().focus();
          }
        } catch (error) {
          console.warn("Map resize event handler failed:", error);
        }
      });
    }

    return () => {
      setMapLoaded(false);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (currentPopupRef.current) {
        currentPopupRef.current.remove();
        currentPopupRef.current = null;
      }
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (error) {
          console.warn("Map cleanup failed:", error);
        }
        setMapInstance(null);
      }
    };
  }, [isClient, mapInstance]);

  // Separate effect for updating device data
  useEffect(() => {
    if (!mapInstance?.loaded() || !mapLoaded) return;

    const source = mapInstance.getSource("devices") as mapboxgl.GeoJSONSource;
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features: devices
        .filter(
          (device) =>
            isValidCoordinate(device.latitude) &&
            isValidCoordinate(device.longitude)
        )
        .map((device) => {
          const lng =
            typeof device.longitude === "string"
              ? parseFloat(device.longitude)
              : device.longitude;
          const lat =
            typeof device.latitude === "string"
              ? parseFloat(device.latitude)
              : device.latitude;
          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [lng, lat] as [number, number],
            },
            properties: {
              id: device._id,
              name: device.name,
              status: (typeof device.status === "string"
                ? device.status
                : "offline"
              ).toLowerCase(),
              maintenance_status: (typeof device.maintenance_status === "string"
                ? device.maintenance_status
                : "good"
              ).toLowerCase(),
              powerType: device.powerType,
              nextMaintenance: device.nextMaintenance || undefined,
            },
          };
        }),
    });

    // Only fit bounds on first load with data
    if (isFirstLoad.current && devices.length > 0) {
      const validDevices = devices.filter(
        (device) =>
          isValidCoordinate(device.latitude) &&
          isValidCoordinate(device.longitude)
      );

      if (validDevices.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validDevices.forEach((device) => {
          const lng =
            typeof device.longitude === "string"
              ? parseFloat(device.longitude)
              : device.longitude;
          const lat =
            typeof device.latitude === "string"
              ? parseFloat(device.latitude)
              : device.latitude;
          bounds.extend([lng as number, lat as number]);
        });

        mapInstance.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
        });
        isFirstLoad.current = false;
      }
    }
  }, [mapInstance, mapLoaded, devices]);

  if (!isClient) {
    return <div className="h-full w-full bg-gray-100 animate-pulse" />;
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
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .mapboxgl-canvas {
          width: 100% !important;
          height: 100% !important;
          outline: none;
          border: none;
        }
        .mapboxgl-map {
          width: 100% !important;
          height: 100% !important;
          outline: none;
          border: none;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        className="flex-grow h-full w-full relative dark:text-black-900 outline-none"
      />
      <MapControls map={mapInstance} />
      {(isLoading || !mapLoaded) && <LoadingOverlay />}
    </div>
  );
}
