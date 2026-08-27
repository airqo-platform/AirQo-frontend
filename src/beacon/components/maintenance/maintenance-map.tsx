"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"
import { MaintenanceMapItem } from "@/types/api.types"
import { calculateDistance, optimizeRoute, findDevicesAlongRoute, calculateCriticalityScore } from "@/utils/map-utils"
import { Coordinates } from "@/utils/routing-utils"
import { LoRaWANGateway, GatewayCoverageStats } from "@/types/lorawan.types"
import {
  getGatewayCoverageZones,
  calculateSignalAttenuation,
  computeGatewayCoverageStats,
  ENVIRONMENT_PROFILES,
} from "@/utils/lorawan-utils"
import { MAP_TILE_STYLES, MapTileStyle, MapStyleDialog } from "./map/map-style-dialog"
import { MapControls, MapTopControls, MapBottomControls } from "./map/map-controls"
import { MapLegend } from "./map/map-legend"

// Fix for Leaflet default icon paths in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

interface LatLngPoint {
  lat: number
  lng: number
}

// Ray-casting point-in-polygon algorithm
function isPointInPolygon(lat: number, lng: number, polygon: LatLngPoint[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat,
      yi = polygon[i].lng
    const xj = polygon[j].lat,
      yj = polygon[j].lng
    const intersect = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function escapeHtml(str: string): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

interface MaintenanceMapProps {
  data: MaintenanceMapItem[]
  loading?: boolean
  selectedDevice?: MaintenanceMapItem | null
  onDeviceSelect?: (device: MaintenanceMapItem | null) => void
  selectedDeviceIds?: string[]
  routePath?: MaintenanceMapItem[]
  homeLocation?: Coordinates & { name?: string }
  onPolygonSelect?: (devices: MaintenanceMapItem[]) => void
  gateways?: LoRaWANGateway[]
  showGateways?: boolean
  onToggleGateways?: (show: boolean) => void
  onOpenGatewayDialog?: () => void
  showDeviceNames?: boolean
  onToggleDeviceNames?: (show: boolean) => void
  onExportMap?: () => void
  onExportCSV?: () => void
  onToggleRoute?: () => void
  isRouting?: boolean
  highlightUncoveredDevices?: boolean
  onToggleHighlightUncovered?: (show: boolean) => void
  coverageFilter?: "all" | "inside_radius" | "outside_radius"
  onCoverageFilterChange?: (filter: "all" | "inside_radius" | "outside_radius") => void
  isSidebarCollapsed?: boolean
  onToggleSidebarCollapse?: () => void
  onRefreshData?: () => void
  isRefreshing?: boolean
  mapContainerId?: string
  flyToLocation?: { latitude: number; longitude: number; zoom?: number } | null
  topFilters?: React.ReactNode
}

type DeviceHealth = "good" | "moderate" | "critical" | "offline"

export default function MaintenanceMap({
  data,
  loading = false,
  selectedDevice = null,
  onDeviceSelect,
  selectedDeviceIds = [],
  routePath,
  homeLocation,
  onPolygonSelect,
  gateways = [],
  showGateways = false,
  onToggleGateways,
  onOpenGatewayDialog,
  showDeviceNames = false,
  onToggleDeviceNames,
  onExportMap,
  onExportCSV,
  onToggleRoute,
  isRouting = false,
  highlightUncoveredDevices = false,
  onToggleHighlightUncovered,
  coverageFilter = "all",
  onCoverageFilterChange,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  onRefreshData,
  isRefreshing = false,
  mapContainerId = "maintenance-map-container",
  flyToLocation,
  topFilters,
}: MaintenanceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const gatewayLayersRef = useRef<L.Layer[]>([])
  const routeLayerRef = useRef<L.Polyline | null>(null)
  const homeMarkerRef = useRef<L.Marker | null>(null)
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup())
  const drawControlRef = useRef<any>(null)
  const [currentStyle, setCurrentStyle] = useState<MapTileStyle>(MAP_TILE_STYLES[0])
  const [styleDialogOpen, setStyleDialogOpen] = useState(false)
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false)
  const [hasPolygon, setHasPolygon] = useState(false)
  const [zoom, setZoom] = useState(7)
  const onPolygonSelectRef = useRef(onPolygonSelect)

  // Invalidate map size when sidebar expands or collapses
  useEffect(() => {
    const timer = setTimeout(() => {
      if (map.current) {
        map.current.invalidateSize()
      }
    }, 320)
    return () => clearTimeout(timer)
  }, [isSidebarCollapsed])

  useEffect(() => {
    onPolygonSelectRef.current = onPolygonSelect
  }, [onPolygonSelect])

  // Calculate LoRaWAN coverage stats
  const coverageStats: GatewayCoverageStats = useMemo(() => {
    return computeGatewayCoverageStats(gateways, data)
  }, [gateways, data])

  const normalizeUptimePct = (uptime: number | null | undefined): number => {
    const n = Number(uptime)
    if (!Number.isFinite(n)) return 0
    return n <= 1 ? n * 100 : n
  }

  const getUptimeStatus = (uptimePct: number): DeviceHealth => {
    if (uptimePct === 0) return "offline"
    if (uptimePct >= 85) return "good"
    if (uptimePct >= 50) return "moderate"
    return "critical"
  }

  const getErrorStatus = (errorMargin: number): DeviceHealth => {
    if (errorMargin <= 10) return "good"
    if (errorMargin <= 20) return "moderate"
    return "critical"
  }

  // Create custom marker icons with name label beside it
  const createMarkerIcon = useCallback(
    (
      deviceName: string,
      uptimeStatus: DeviceHealth,
      errorStatus: DeviceHealth,
      isSelected: boolean,
      isUncovered: boolean = false
    ) => {
      const baseSize = Math.max(14, Math.min(28, 16 + (zoom - 7) * 1.5))
      const size = isSelected ? baseSize * 1.25 : baseSize

      let dotHtml = ""
      if (uptimeStatus === "offline") {
        const selectionRing = isSelected ? "ring-3 ring-blue-500 ring-offset-1 animate-pulse" : ""
        const uncoveredRing =
          isUncovered && highlightUncoveredDevices ? "ring-2 ring-red-500 animate-ping" : ""

        dotHtml = `
          <div style="width: ${size}px; height: ${size}px;" class="bg-gray-400 rounded-full border-2 border-gray-200 ${selectionRing} ${uncoveredRing} shadow-sm flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <span class="w-1.5 h-1.5 rounded-full bg-white opacity-80"></span>
          </div>
        `
      } else {
        let bgColorClass = "bg-emerald-500"
        if (uptimeStatus === "moderate") bgColorClass = "bg-amber-500"
        if (uptimeStatus === "critical") bgColorClass = "bg-red-500"

        let borderColorClass = "border-emerald-300"
        if (errorStatus === "moderate") borderColorClass = "border-amber-300"
        if (errorStatus === "critical") borderColorClass = "border-red-400"

        const selectionRing = isSelected ? "ring-3 ring-blue-500 ring-offset-1 scale-110 shadow-lg" : ""
        const uncoveredRing =
          isUncovered && highlightUncoveredDevices ? "ring-2 ring-red-500 animate-pulse" : ""

        dotHtml = `
          <div style="width: ${size}px; height: ${size}px;" class="${bgColorClass} rounded-full border-2 ${borderColorClass} ${selectionRing} ${uncoveredRing} shadow-sm flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <span class="w-1 h-1 rounded-full bg-white opacity-90"></span>
          </div>
        `
      }

      // Name label styling beside the dot
      let labelClasses =
        "bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 border-gray-200/90 dark:border-gray-700/90 shadow-xs"
      if (isSelected) {
        labelClasses =
          "bg-blue-600 text-white font-bold border-blue-500 shadow-md ring-2 ring-blue-300 dark:ring-blue-800"
      } else if (uptimeStatus === "offline") {
        labelClasses =
          "bg-gray-100/90 dark:bg-gray-800/90 text-gray-500 dark:text-gray-400 border-gray-200/80 dark:border-gray-700/80"
      }

      const shouldShowLabel = (showDeviceNames || isSelected) && Boolean(deviceName)
      const escapedName = escapeHtml(deviceName)

      return L.divIcon({
        className: "custom-device-marker bg-transparent",
        html: `
          <div class="flex items-center gap-1.5 cursor-pointer select-none group pointer-events-auto" style="transform: translate(-${size / 2}px, -${size / 2}px); width: max-content;">
            ${dotHtml}
            ${
              shouldShowLabel
                ? `<div class="px-1.5 py-0.5 rounded text-[11px] font-semibold leading-none whitespace-nowrap border backdrop-blur-xs transition-all duration-150 group-hover:scale-105 ${labelClasses}">
                    ${escapedName}
                  </div>`
                : ""
            }
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -size / 2],
      })
    },
    [zoom, highlightUncoveredDevices, showDeviceNames]
  )

  // Create LoRaWAN Gateway Tower icon
  const createGatewayTowerIcon = useCallback((gateway: LoRaWANGateway) => {
    const env = gateway.environment || "urban"
    const isRural = env === "rural"
    const isSuburban = env === "suburban"

    const bgClass = isRural ? "bg-emerald-600" : isSuburban ? "bg-blue-600" : "bg-indigo-600"
    const pingColor = isRural ? "bg-emerald-400" : isSuburban ? "bg-blue-400" : "bg-indigo-400"

    return L.divIcon({
      className: "custom-div-icon bg-transparent",
      html: `
        <div class="relative group cursor-pointer" title="${gateway.name} (${ENVIRONMENT_PROFILES[env].label})">
          <div class="w-8 h-8 rounded-full ${bgClass} border-2 border-white shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
              <circle cx="12" cy="12" r="2"/>
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
              <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
            </svg>
          </div>
          <span class="absolute -top-1 -right-1 flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 ${bgClass} border border-white"></span>
          </span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    })
  }, [])

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainer.current) return
    if (!map.current) {
      const initialMap = L.map(mapContainer.current, {
        preferCanvas: true,
        zoomControl: false, // We use our custom MapControls zoom
        attributionControl: false,
      }).setView([0.3476, 32.5825], 7)

      // Add default tile layer
      const initialLayer = L.tileLayer(MAP_TILE_STYLES[0].url, {
        attribution: MAP_TILE_STYLES[0].attribution,
        crossOrigin: true,
        maxZoom: 19,
      }).addTo(initialMap)

      tileLayerRef.current = initialLayer

      initialMap.on("zoomend", () => {
        setZoom(Math.round(initialMap.getZoom()))
      })

      // Add feature group for drawn polygons
      drawnItemsRef.current.addTo(initialMap)

      // Initialize Draw control
      const drawControl = new (L.Control as any).Draw({
        position: "topleft",
        draw: {
          polygon: {
            allowIntersection: false,
            shapeOptions: {
              color: "#2563eb",
              weight: 2.5,
              opacity: 0.85,
              fillColor: "#3b82f6",
              fillOpacity: 0.18,
            },
          },
          polyline: false,
          circle: false,
          rectangle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
          remove: true,
        },
      })

      // Hide default leaflet draw toolbar since we have our custom floating control
      initialMap.addControl(drawControl)
      drawControlRef.current = drawControl

      // Handle polygon drawn
      initialMap.on("draw:created" as any, (e: any) => {
        drawnItemsRef.current.clearLayers()
        const layer = e.layer
        drawnItemsRef.current.addLayer(layer)
        setHasPolygon(true)
        setIsDrawingPolygon(false)
        const polygonLatLngs: LatLngPoint[] = layer.getLatLngs()[0]
        initialMap.fire("polygon:select", { polygonLatLngs })
      })

      initialMap.on("draw:deleted" as any, () => {
        setHasPolygon(false)
        onPolygonSelectRef.current?.([])
      })

      initialMap.on("draw:drawstart" as any, () => setIsDrawingPolygon(true))
      initialMap.on("draw:drawstop" as any, () => setIsDrawingPolygon(false))

      map.current = initialMap

      // Invalidate map size after DOM mount
      setTimeout(() => {
        if (initialMap) {
          initialMap.invalidateSize()
        }
      }, 250)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Handle Tile Style change
  const handleSelectStyle = (style: MapTileStyle) => {
    if (!map.current) return
    setCurrentStyle(style)
    if (tileLayerRef.current) {
      tileLayerRef.current.remove()
    }
    const newLayer = L.tileLayer(style.url, {
      attribution: style.attribution,
      crossOrigin: true,
      maxZoom: 19,
    }).addTo(map.current)
    tileLayerRef.current = newLayer
  }

  // Handle Programmatic flyTo
  useEffect(() => {
    if (!map.current || !flyToLocation) return
    const lat = Number(flyToLocation.latitude)
    const lng = Number(flyToLocation.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    const targetZoom = Number.isFinite(Number(flyToLocation.zoom))
      ? Number(flyToLocation.zoom)
      : 14

    try {
      const currentCenter = map.current.getCenter()
      if (
        !currentCenter ||
        !Number.isFinite(currentCenter.lat) ||
        !Number.isFinite(currentCenter.lng)
      ) {
        map.current.setView([lat, lng], targetZoom)
        return
      }

      map.current.flyTo([lat, lng], targetZoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      })
    } catch {
      try {
        map.current.setView([lat, lng], targetZoom)
      } catch (err) {
        console.warn("Could not set map view:", err)
      }
    }
  }, [flyToLocation])

  // Render Markers, LoRaWAN Gateways & Route Polyline
  useEffect(() => {
    if (!map.current || !data) return

    // Clear previous markers & gateway layers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    gatewayLayersRef.current.forEach((l) => l.remove())
    gatewayLayersRef.current = []

    if (routeLayerRef.current) routeLayerRef.current.remove()
    if (homeMarkerRef.current) {
      homeMarkerRef.current.remove()
      homeMarkerRef.current = null
    }

    const bounds = L.latLngBounds([])

    // 1. PLOT LORAWAN GATEWAYS
    if (showGateways && gateways.length > 0) {
      gateways.forEach((gw) => {
        if (gw.enabled === false) return
        const gwLat = Number(gw.latitude)
        const gwLng = Number(gw.longitude)
        if (!Number.isFinite(gwLat) || !Number.isFinite(gwLng)) return

        const env = gw.environment || "urban"
        const zones = getGatewayCoverageZones(gw)

        // Draw concentric coverage circles
        const reversedZones = [...zones].reverse()
        reversedZones.forEach((zone) => {
          const circle = L.circle([gwLat, gwLng], {
            radius: zone.radiusKm * 1000,
            color: zone.borderColor,
            weight: zone.borderWidth,
            fillColor: zone.fillColor,
            fillOpacity: zone.fillOpacity,
            dashArray: zone.dashArray,
            interactive: false,
          }).addTo(map.current!)

          gatewayLayersRef.current.push(circle)
        })

        // Plot Tower Icon
        const towerIcon = createGatewayTowerIcon(gw)
        const gwMarker = L.marker([gwLat, gwLng], {
          icon: towerIcon,
          zIndexOffset: 500,
        }).bindPopup(`
          <div class="p-2 min-w-[220px]">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">LoRaWAN Tower</span>
              <span class="text-[10px] text-gray-500 font-mono">${gw.eui || gw.id}</span>
            </div>
            <h4 class="font-bold text-xs text-gray-900">${gw.name}</h4>
            <p class="text-[11px] text-gray-600 mb-2">${gw.description || "AirQo Gateway"}</p>
            <div class="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200">
              <div><span class="text-gray-500">Profile:</span> <span class="font-semibold capitalize text-indigo-900">${env}</span></div>
              <div><span class="text-gray-500">Antenna:</span> <span class="font-semibold">${gw.antenna_height_m || 25}m</span></div>
              <div><span class="text-gray-500">Inner:</span> <span class="font-semibold text-emerald-700">≤ ${gw.inner_strong_radius_km || 2} km</span></div>
              <div><span class="text-gray-500">Max Reach:</span> <span class="font-semibold text-red-700">≤ ${gw.max_range_km || 10} km</span></div>
            </div>
          </div>
        `)

        gwMarker.addTo(map.current!)
        gatewayLayersRef.current.push(gwMarker)
        bounds.extend([gwLat, gwLng])
      })
    }

    // 2. PLOT MAINTENANCE DEVICES
    data.forEach((device) => {
      const lat = Number(device.latitude)
      const lng = Number(device.longitude)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

      const isSelected = selectedDevice?.device_id === device.device_id
      const uptimePct = normalizeUptimePct(device.uptime)
      const uptimeStatus = getUptimeStatus(uptimePct)
      const errorStatus = getErrorStatus(device.error_margin)

      // LoRaWAN Coverage status (only active when LoRaWAN visibility is on)
      const cov = coverageStats.deviceCoverageMap[device.device_id]
      const isUncovered =
        showGateways &&
        highlightUncoveredDevices &&
        (!cov || cov.signalQuality === "none")

      // Coverage filter visibility check (only applies if showGateways is enabled)
      if (showGateways) {
        if (coverageFilter === "inside_radius" && (!cov || cov.signalQuality === "none")) return
        if (coverageFilter === "outside_radius" && cov && cov.signalQuality !== "none") return
      }

      const deviceName =
        device.device_name ||
        (device as any).name ||
        (device as any).deviceNumber ||
        device.device_id ||
        ""

      const icon = createMarkerIcon(deviceName, uptimeStatus, errorStatus, isSelected, isUncovered)
      const marker = L.marker([lat, lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 100,
      })

      marker.on("click", () => {
        onDeviceSelect?.(device)
        try {
          const currentCenter = map.current?.getCenter()
          if (
            !currentCenter ||
            !Number.isFinite(currentCenter.lat) ||
            !Number.isFinite(currentCenter.lng)
          ) {
            map.current?.setView([lat, lng], Math.max(zoom, 13))
            return
          }
          map.current?.flyTo([lat, lng], Math.max(zoom, 13), {
            duration: 0.8,
          })
        } catch {
          try {
            map.current?.setView([lat, lng], Math.max(zoom, 13))
          } catch (e) {
            console.warn("Could not set marker view:", e)
          }
        }
      })

      marker.addTo(map.current!)
      markersRef.current.push(marker)
      bounds.extend([lat, lng])
    })

    // 3. PLOT ROUTE PATH
    if (routePath && routePath.length > 0) {
      const hLat = Number(homeLocation?.latitude)
      const hLng = Number(homeLocation?.longitude)
      const hasHome = Number.isFinite(hLat) && Number.isFinite(hLng)

      if (hasHome) {
        const homeIcon = L.divIcon({
          className: "bg-transparent",
          html: `<div class="w-8 h-8 bg-slate-900 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
                  H
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
        homeMarkerRef.current = L.marker([hLat, hLng], {
          icon: homeIcon,
          zIndexOffset: 1200,
        })
          .bindPopup(homeLocation?.name || "Home Location")
          .addTo(map.current!)
      }

      const latlngs: [number, number][] = []
      if (hasHome) latlngs.push([hLat, hLng])

      routePath.forEach((d) => {
        const dLat = Number(d.latitude)
        const dLng = Number(d.longitude)
        if (Number.isFinite(dLat) && Number.isFinite(dLng)) {
          latlngs.push([dLat, dLng])
        }
      })

      if (hasHome) latlngs.push([hLat, hLng])

      if (latlngs.length >= 2) {
        routeLayerRef.current = L.polyline(latlngs, {
          color: "#2563eb",
          weight: 4.5,
          opacity: 0.85,
          lineCap: "round",
          dashArray: "8, 8",
        }).addTo(map.current!)
      }
    }
  }, [
    data,
    selectedDevice,
    zoom,
    routePath,
    homeLocation,
    gateways,
    showGateways,
    highlightUncoveredDevices,
    coverageStats,
    coverageFilter,
    createMarkerIcon,
    createGatewayTowerIcon,
    onDeviceSelect,
  ])

  // Polygon Selection Listener
  useEffect(() => {
    if (!map.current) return

    const handlePolygonSelect = (e: any) => {
      const polygonLatLngs: LatLngPoint[] = e.polygonLatLngs
      if (!polygonLatLngs || polygonLatLngs.length < 3) return

      const devicesInPolygon = data.filter((device) => {
        if (device.latitude == null || device.longitude == null) return false
        return isPointInPolygon(device.latitude, device.longitude, polygonLatLngs)
      })

      onPolygonSelectRef.current?.(devicesInPolygon)
    }

    map.current.on("polygon:select" as any, handlePolygonSelect)
    return () => {
      map.current?.off("polygon:select" as any, handlePolygonSelect)
    }
  }, [data])

  // Map Controls Actions
  const handleZoomIn = useCallback(() => map.current?.zoomIn(), [])
  const handleZoomOut = useCallback(() => map.current?.zoomOut(), [])

  const handleGeolocation = useCallback(() => {
    if (!("geolocation" in navigator) || !map.current) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude)
        const lng = Number(pos.coords.longitude)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
        try {
          map.current?.flyTo([lat, lng], 14, { duration: 1.5 })
        } catch {
          try {
            map.current?.setView([lat, lng], 14)
          } catch (e) {
            console.warn("Could not set geolocation view:", e)
          }
        }
      },
      (err) => console.error("Geolocation error:", err)
    )
  }, [])

  const handleResetView = useCallback(() => {
    if (!map.current) return
    try {
      if (data.length > 0) {
        const validPoints = data
          .filter((d) => Number.isFinite(Number(d.latitude)) && Number.isFinite(Number(d.longitude)))
          .map((d) => [Number(d.latitude), Number(d.longitude)] as [number, number])

        if (validPoints.length > 0) {
          map.current.fitBounds(L.latLngBounds(validPoints), { padding: [50, 50] })
          return
        }
      }
      map.current.setView([0.3476, 32.5825], 7)
    } catch {
      try {
        map.current.setView([0.3476, 32.5825], 7)
      } catch (e) {
        console.warn("Could not reset map view:", e)
      }
    }
  }, [data])

  const handleTogglePolygonDraw = () => {
    if (hasPolygon) {
      drawnItemsRef.current.clearLayers()
      setHasPolygon(false)
      onPolygonSelectRef.current?.([])
      return
    }
    // Trigger polygon draw mode
    new (L as any).Draw.Polygon(map.current!, drawControlRef.current?.options?.draw?.polygon).enable()
  }

  return (
    <div id={mapContainerId} className="relative w-full h-full overflow-hidden bg-gray-100">
      {/* Map DOM Canvas */}
      <div ref={mapContainer} className="absolute inset-0 z-0" />

      {/* Loading Overlay */}
      {(loading || isRefreshing) && (
        <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-xs transition-opacity">
          <div className="bg-white/95 dark:bg-gray-900/95 px-4 py-2 rounded-full shadow-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>Updating Map Data...</span>
          </div>
        </div>
      )}

      {/* Polygon Drawing Banner */}
      {isDrawingPolygon && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-xl text-xs font-semibold animate-pulse flex items-center gap-2">
          <span>Click to draw polygon vertices. Connect to first point to complete.</span>
        </div>
      )}

      {/* Unified Top Floating Navigation Bar (Non-Obstructing) */}
      <div className="absolute top-3 inset-x-3 z-[1000] flex items-start justify-between gap-2 pointer-events-none">
        {/* Left Section: Top Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1 pointer-events-auto pr-2">
          {topFilters}
        </div>

        {/* Right Section: Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0 pointer-events-auto ml-auto">
          <MapTopControls
            onResetView={handleResetView}
            onRefreshData={onRefreshData}
            isRefreshing={isRefreshing}
            onToggleStyleDialog={() => setStyleDialogOpen(true)}
            onOpenGatewaysDialog={onOpenGatewayDialog}
            gatewaysCount={gateways.length}
            showDeviceNames={showDeviceNames}
            onToggleDeviceNames={onToggleDeviceNames}
            showGateways={showGateways}
            onToggleGateways={onToggleGateways}
            highlightUncoveredDevices={highlightUncoveredDevices}
            onToggleHighlightUncovered={onToggleHighlightUncovered}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebarCollapse={onToggleSidebarCollapse}
            onExportMap={onExportMap}
            onExportCSV={onExportCSV}
            onToggleRoute={onToggleRoute}
            isRouting={isRouting}
            hasRoute={Boolean(routePath && routePath.length > 0)}
          />
        </div>
      </div>

      {/* Bottom-Left Floating Legend */}
      <MapLegend showLoRaWAN={showGateways} />

      {/* Bottom-Right Floating Controls: Geolocation, Zoom In & Zoom Out, Polygon */}
      <MapBottomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onGeolocation={handleGeolocation}
        onTogglePolygonDraw={handleTogglePolygonDraw}
        isDrawingPolygon={isDrawingPolygon}
        hasPolygon={hasPolygon}
      />

      {/* Map Style Dialog */}
      <MapStyleDialog
        open={styleDialogOpen}
        onOpenChange={setStyleDialogOpen}
        currentStyleId={currentStyle.id}
        onSelectStyle={handleSelectStyle}
      />
    </div>
  )
}
