"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"
import { MaintenanceMapItem } from "@/types/api.types"
import { calculateDistance, optimizeRoute, findDevicesAlongRoute, calculateCriticalityScore } from "@/utils/map-utils"
import { Coordinates } from "@/utils/routing-utils"
import { getDevicePerformanceData } from "@/services/device-api.service"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Map as MapIcon,
  Navigation,
  Info,
  AlertTriangle,
  CheckCircle,
  CircleDot,
  Pentagon,
  Trash2,
  Radio,
  Download,
  Layers,
  Signal,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  X
} from "lucide-react"
import { useGroup } from "@/lib/group-context"
import { LoRaWANGateway, GatewayCoverageStats } from "@/types/lorawan.types"
import {
  getGatewayCoverageZones,
  calculateSignalAttenuation,
  computeGatewayCoverageStats,
  ENVIRONMENT_PROFILES,
} from "@/utils/lorawan-utils"

// Fix for default marker icons in Next.js/Leaflet
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

// Ray-casting algorithm for point-in-polygon test
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

interface MaintenanceMapProps {
  data: MaintenanceMapItem[]
  loading?: boolean
  onDeviceSelect?: (deviceId: string) => void
  onSelectionChange?: (ids: string[]) => void
  selectedDeviceIds?: string[]
  routePath?: MaintenanceMapItem[] // Pre-calculated route path
  homeLocation?: Coordinates & { name?: string } // Start/End location
  onPolygonSelect?: (devices: MaintenanceMapItem[]) => void
  gateways?: LoRaWANGateway[]
  showGateways?: boolean
  onToggleGateways?: () => void
  onOpenGatewayDialog?: () => void
  onExportMap?: () => void
  highlightUncoveredDevices?: boolean
  onToggleHighlightUncovered?: () => void
  coverageFilter?: 'all' | 'inside_radius' | 'outside_radius'
  onCoverageFilterChange?: (filter: 'all' | 'inside_radius' | 'outside_radius') => void
  mapContainerId?: string
}

type DeviceHealth = "good" | "moderate" | "critical" | "offline"

export default function MaintenanceMap({
  data,
  loading,
  onDeviceSelect,
  onSelectionChange,
  selectedDeviceIds = [],
  routePath,
  homeLocation,
  onPolygonSelect,
  gateways = [],
  showGateways = false,
  onToggleGateways,
  onOpenGatewayDialog,
  onExportMap,
  highlightUncoveredDevices = false,
  onToggleHighlightUncovered,
  coverageFilter = 'all',
  onCoverageFilterChange,
  mapContainerId = "maintenance-map-container",
}: MaintenanceMapProps) {
  const { activeGroup, loading: groupLoading } = useGroup()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const gatewayLayersRef = useRef<any[]>([])
  const routeLayerRef = useRef<any>(null)
  const homeMarkerRef = useRef<any>(null)
  const suggestionMarkersRef = useRef<any[]>([])
  const drawControlRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(new (L as any).FeatureGroup())
  const [hasPolygon, setHasPolygon] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const onPolygonSelectRef = useRef(onPolygonSelect)

  // Local state for routing if not controlled fully by parent yet
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedDeviceIds)
  const [isRouteMode, setIsRouteMode] = useState(false)
  const [routeStats, setRouteStats] = useState({ distance: 0, stops: 0, criticality: 0 })

  const [suggestions, setSuggestions] = useState<MaintenanceMapItem[]>([])
  const [zoom, setZoom] = useState(7)
  const [lorawanPanelOpen, setLorawanPanelOpen] = useState(false)

  // Calculate LoRaWAN coverage stats
  const coverageStats: GatewayCoverageStats = useMemo(() => {
    return computeGatewayCoverageStats(gateways, data)
  }, [gateways, data])

  // Sync props to local state if needed
  useEffect(() => {
    setLocalSelectedIds(selectedDeviceIds)
  }, [selectedDeviceIds])

  // Keep onPolygonSelect ref fresh so we don't need it in effect deps
  useEffect(() => {
    onPolygonSelectRef.current = onPolygonSelect
  }, [onPolygonSelect])

  // Normalize raw `uptime` to a 0-100 percentage.
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

  // Create custom device icon
  const createMarkerIcon = (
    uptimeStatus: DeviceHealth,
    errorStatus: DeviceHealth,
    isSelected: boolean,
    isSuggestion: boolean = false,
    isUncovered: boolean = false
  ) => {
    // If device is offline (uptime = 0), render fully gray
    if (uptimeStatus === "offline") {
      let baseSize = Math.max(14, Math.min(48, 16 + (zoom - 7) * 3))
      let size = isSelected ? baseSize * 1.4 : baseSize
      const selectionRing = isSelected ? "ring-2 ring-blue-600 ring-offset-2" : ""
      const uncoveredRing = isUncovered && highlightUncoveredDevices ? "ring-2 ring-red-500 ring-offset-2 animate-pulse" : ""
      return L.divIcon({
        className: "custom-div-icon bg-transparent",
        html: `<div style="width: ${size}px; height: ${size}px;" class="bg-gray-400 rounded-full border-[3px] border-gray-300 ${selectionRing} ${uncoveredRing} shadow-sm mx-auto transition-all duration-300"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
      })
    }

    // Dot Color (Uptime)
    let bgColorClass = "bg-green-500"
    if (uptimeStatus === "moderate") bgColorClass = "bg-yellow-500"
    if (uptimeStatus === "critical") bgColorClass = "bg-red-500"

    // Ring Color (Error Margin)
    let borderColorClass = "border-green-400"
    if (errorStatus === "moderate") borderColorClass = "border-yellow-400"
    if (errorStatus === "critical") borderColorClass = "border-red-400"

    let baseSize = Math.max(14, Math.min(48, 16 + (zoom - 7) * 3))
    let size = isSelected ? baseSize * 1.4 : baseSize
    if (isSuggestion) {
      size = baseSize * 0.8
      bgColorClass += " opacity-70"
    }

    const selectionRing = isSelected ? "ring-2 ring-blue-600 ring-offset-2" : ""
    const uncoveredRing = isUncovered && highlightUncoveredDevices ? "ring-2 ring-red-500 ring-offset-2 animate-pulse" : ""
    const borderStyle = `border-[3px] ${borderColorClass}`

    return L.divIcon({
      className: "custom-div-icon bg-transparent",
      html: `<div style="width: ${size}px; height: ${size}px;" class="${bgColorClass} rounded-full ${borderStyle} ${selectionRing} ${uncoveredRing} shadow-sm mx-auto transition-all duration-300"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    })
  }

  // Create custom LoRaWAN Gateway Tower Icon
  const createGatewayTowerIcon = (gateway: LoRaWANGateway) => {
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
  }

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return
    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        preferCanvas: true,
      }).setView([0.3476, 32.5825], 7)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        crossOrigin: true,
      }).addTo(map.current)

      map.current.on("zoomend", () => {
        setZoom(Math.round(map.current!.getZoom()))
      })

      // Add the drawn items layer
      drawnItemsRef.current.addTo(map.current)

      // Add LoRaWAN control button directly in topleft toolbar (above draw control)
      const LorawanControl = (L.Control as any).extend({
        options: { position: "topleft" },
        onAdd: function () {
          const container = L.DomUtil.create("div", "leaflet-bar leaflet-control")
          const btn = L.DomUtil.create("a", "leaflet-control-lorawan", container)
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin: auto; display: block;"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>`
          btn.title = "LoRaWAN RF Layer & Gateway Coverage"
          btn.href = "#"
          btn.style.width = "30px"
          btn.style.height = "30px"
          btn.style.display = "flex"
          btn.style.alignItems = "center"
          btn.style.justifyContent = "center"
          btn.style.backgroundColor = "#ffffff"
          btn.style.cursor = "pointer"

          L.DomEvent.disableClickPropagation(container)
          L.DomEvent.on(btn, "click", (e: any) => {
            L.DomEvent.stop(e)
            map.current?.fire("lorawan:toggle-panel")
          })
          return container
        },
      })
      const lorawanControl = new LorawanControl()
      lorawanControl.addTo(map.current)

      map.current.on("lorawan:toggle-panel" as any, () => {
        setLorawanPanelOpen((prev) => !prev)
      })

      // Add draw control (polygon only)
      const drawControl = new (L.Control as any).Draw({
        position: "topleft",
        draw: {
          polygon: {
            allowIntersection: false,
            drawError: {
              color: "#e1e100",
              message: "<strong>Polygon edges cannot cross!</strong>",
            },
            shapeOptions: {
              color: "#3b82f6",
              weight: 2,
              opacity: 0.8,
              fillColor: "#3b82f6",
              fillOpacity: 0.15,
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
      drawControl.addTo(map.current)
      drawControlRef.current = drawControl

      // Handle polygon created
      map.current.on("draw:created" as any, (e: any) => {
        drawnItemsRef.current.clearLayers()
        const layer = e.layer
        drawnItemsRef.current.addLayer(layer)
        setHasPolygon(true)
        setIsDrawing(false)
        const polygonLatLngs: LatLngPoint[] = layer.getLatLngs()[0]
        map.current?.fire("polygon:select", { polygonLatLngs })
      })

      // Handle polygon deleted
      map.current.on("draw:deleted" as any, () => {
        setHasPolygon(false)
        onPolygonSelectRef.current?.([])
      })

      map.current.on("draw:drawstart" as any, () => setIsDrawing(true))
      map.current.on("draw:drawstop" as any, () => setIsDrawing(false))
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Auto-fit bounds when data changes or route mode toggles
  useEffect(() => {
    if (!map.current || !data || data.length === 0) return

    const hasActiveRoute = routePath && routePath.length > 0

    const timer = setTimeout(() => {
      if (hasActiveRoute && routeLayerRef.current) {
        map.current?.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] })
      } else if (markersRef.current.length > 0) {
        const points = data
          .filter((d) => d.latitude != null && d.longitude != null)
          .map((d) => [d.latitude, d.longitude] as [number, number])

        if (points.length > 0) {
          const bounds = L.latLngBounds(points)
          if (bounds.isValid()) {
            map.current?.fitBounds(bounds, { padding: [50, 50] })
          }
        }
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [data, isRouteMode, routePath])

  // Mini-history cache
  interface DailyPoint {
    value: number
    timestamp: string
  }
  interface MiniHistory {
    uptime: DailyPoint[]
    error: DailyPoint[]
    correlation: DailyPoint[]
    loaded: boolean
    loading: boolean
    failed?: boolean
  }
  const miniHistoryCache = useRef<Record<string, MiniHistory>>({})

  const toNum = (v: any): number | null => {
    if (v == null) return null
    const n = typeof v === "number" ? v : Number(v)
    return Number.isFinite(n) ? n : null
  }

  const computeMiniHistory = (
    rawPoints: any[]
  ): { uptime: DailyPoint[]; error: DailyPoint[]; correlation: DailyPoint[] } => {
    const buckets: Record<string, { hours: Set<number>; errs: number[]; s1: number[]; s2: number[] }> = {}
    for (const p of rawPoints) {
      if (!p?.datetime) continue
      const dt = new Date(p.datetime)
      if (isNaN(dt.getTime())) continue
      const dayKey = dt.toISOString().slice(0, 10)
      if (!buckets[dayKey]) buckets[dayKey] = { hours: new Set(), errs: [], s1: [], s2: [] }
      buckets[dayKey].hours.add(dt.getUTCHours())
      const s1 = toNum(p.s1_pm2_5 ?? p["pm2.5 sensor1"])
      const s2 = toNum(p.s2_pm2_5 ?? p["pm2.5 sensor2"])
      if (s1 != null && s2 != null) {
        buckets[dayKey].errs.push(Math.abs(s1 - s2))
        buckets[dayKey].s1.push(s1)
        buckets[dayKey].s2.push(s2)
      }
    }
    const days = Object.keys(buckets).sort()
    const uptime: DailyPoint[] = []
    const error: DailyPoint[] = []
    const correlation: DailyPoint[] = []
    const pearson = (xs: number[], ys: number[]): number | null => {
      const n = xs.length
      if (n < 2) return null
      const mx = xs.reduce((a, b) => a + b, 0) / n
      const my = ys.reduce((a, b) => a + b, 0) / n
      let num = 0,
        dx = 0,
        dy = 0
      for (let i = 0; i < n; i++) {
        const ex = xs[i] - mx
        const ey = ys[i] - my
        num += ex * ey
        dx += ex * ex
        dy += ey * ey
      }
      const den = Math.sqrt(dx * dy)
      return den === 0 ? null : num / den
    }
    for (const d of days) {
      const b = buckets[d]
      const ts = `${d}T00:00:00.000Z`
      uptime.push({ timestamp: ts, value: (b.hours.size / 24) * 100 })
      if (b.errs.length > 0) error.push({ timestamp: ts, value: b.errs.reduce((a, c) => a + c, 0) / b.errs.length })
      const r = pearson(b.s1, b.s2)
      if (r != null) correlation.push({ timestamp: ts, value: r })
    }
    return { uptime, error, correlation }
  }

  const renderMiniBars = (
    history: DailyPoint[],
    opts: {
      label: string
      barColor: (v: number) => string
      format: (v: number) => string
      avgFormat: (v: number) => string
      normalize: (v: number, all: number[]) => number
    }
  ): string => {
    if (history.length === 0) return `<div class="text-[10px] text-gray-400">No ${opts.label.toLowerCase()} data</div>`
    const values = history.slice(-14)
    const avg = values.reduce((a, b) => a + b.value, 0) / values.length
    const all = values.map((v) => v.value)
    const bars = values
      .map((v) => {
        const ratio = Math.max(0.05, Math.min(1, opts.normalize(v.value, all)))
        const h = Math.max(3, Math.round(ratio * 24))
        const date = new Date(v.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        return `<div title="${date}: ${opts.format(v.value)}" style="height:${h}px" class="w-[3px] rounded-t-sm ${opts.barColor(v.value)}"></div>`
      })
      .join("")
    return `
      <div>
        <div class="flex items-center justify-between mb-0.5">
          <span class="text-[10px] font-medium text-gray-600">${opts.label}</span>
          <span class="text-[10px] font-bold text-gray-700">${opts.avgFormat(avg)}</span>
        </div>
        <div class="flex items-end gap-[2px] h-6">${bars}</div>
      </div>
    `
  }

  const renderMiniGraphsHtml = (h: {
    uptime: DailyPoint[]
    error: DailyPoint[]
    correlation: DailyPoint[]
  }): string => {
    const uptimeHtml = renderMiniBars(h.uptime, {
      label: "Uptime",
      avgFormat: (v) => `${v.toFixed(0)}%`,
      format: (v) => `${v.toFixed(1)}%`,
      barColor: (v) => (v >= 75 ? "bg-green-500" : v >= 50 ? "bg-orange-500" : "bg-red-500"),
      normalize: (v) => v / 100,
    })
    const errorHtml = renderMiniBars(h.error, {
      label: "Error margin",
      avgFormat: (v) => `\u00b1${v.toFixed(1)}`,
      format: (v) => `\u00b1${v.toFixed(2)} \u00b5g/m\u00b3`,
      barColor: (v) => (v <= 3 ? "bg-green-500" : v <= 5 ? "bg-yellow-500" : "bg-red-500"),
      normalize: (v, all) => v / Math.max(10, ...all),
    })
    const corrHtml = renderMiniBars(h.correlation, {
      label: "Correlation",
      avgFormat: (v) => v.toFixed(2),
      format: (v) => v.toFixed(3),
      barColor: (v) => (v >= 0.9 ? "bg-green-500" : v >= 0.75 ? "bg-yellow-500" : "bg-red-500"),
      normalize: (v) => Math.max(0, v),
    })
    return `<div class="space-y-1.5 mt-2 pt-2 border-t border-gray-100">${uptimeHtml}${errorHtml}${corrHtml}</div>`
  }

  const loadMiniGraphsForDevice = async (device: MaintenanceMapItem) => {
    if (groupLoading || !activeGroup) return
    const containerId = `mini-graphs-${device.device_id}`
    const container = document.getElementById(containerId)
    if (!container) return
    const cached = miniHistoryCache.current[device.device_id]
    if (cached?.loaded) {
      container.innerHTML = renderMiniGraphsHtml(cached)
      return
    }
    if (cached?.loading) return
    miniHistoryCache.current[device.device_id] = {
      uptime: [],
      error: [],
      correlation: [],
      loaded: false,
      loading: true,
    }
    container.innerHTML = `<div class="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">Loading 14-day history\u2026</div>`
    try {
      const end = new Date()
      const start = new Date(end.getTime() - 14 * 86400000)
      const resp = await getDevicePerformanceData({
        start: start.toISOString(),
        end: end.toISOString(),
        deviceNames: [device.device_name],
        group: activeGroup,
      })
      const arr = Array.isArray(resp) ? resp : []
      const dev = arr[0] ?? {}
      const points: any[] =
        Array.isArray(dev.raw_data) && dev.raw_data.length > 0
          ? dev.raw_data
          : Array.isArray(dev.data)
          ? dev.data
          : []
      const computed = computeMiniHistory(points)
      miniHistoryCache.current[device.device_id] = { ...computed, loaded: true, loading: false }
      const stillThere = document.getElementById(containerId)
      if (stillThere) stillThere.innerHTML = renderMiniGraphsHtml(computed)
    } catch (err) {
      console.error("[MaintenanceMap] mini-graph fetch failed:", err)
      miniHistoryCache.current[device.device_id] = {
        uptime: [],
        error: [],
        correlation: [],
        loaded: false,
        loading: false,
        failed: true,
      }
      const stillThere = document.getElementById(containerId)
      if (stillThere)
        stillThere.innerHTML = `<div class="text-[10px] text-red-500 mt-2 pt-2 border-t border-gray-100">Failed to load history</div>`
    }
  }

  // Render Markers, LoRaWAN Gateways, Coverage Circles & Route
  useEffect(() => {
    if (!map.current || !data) return

    // Clear previous device markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Clear previous gateway layers (markers + concentric circles)
    gatewayLayersRef.current.forEach((l) => l.remove())
    gatewayLayersRef.current = []

    suggestionMarkersRef.current.forEach((m) => m.remove())
    suggestionMarkersRef.current = []

    if (routeLayerRef.current) routeLayerRef.current.remove()
    if (homeMarkerRef.current) {
      homeMarkerRef.current.remove()
      homeMarkerRef.current = null
    }

    const bounds = L.latLngBounds([])

    // -------------------------------------------------------------
    // 1. PLOT LORAWAN GATEWAYS & CONCENTRIC SIGNAL ATTENUATION ZONES
    // -------------------------------------------------------------
    if (showGateways && gateways && gateways.length > 0) {
      gateways.forEach((gw) => {
        if (gw.enabled === false || gw.latitude == null || gw.longitude == null) return

        const env = gw.environment || "urban"
        const profile = ENVIRONMENT_PROFILES[env]
        const zones = getGatewayCoverageZones(gw)

        // Draw concentric coverage circles (outer to inner for proper click layering)
        const reversedZones = [...zones].reverse()
        reversedZones.forEach((zone) => {
          const circle = L.circle([gw.latitude, gw.longitude], {
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

        // Count devices in zones for this specific gateway
        let gwStrongDevices = 0
        let gwModerateDevices = 0
        let gwWeakDevices = 0

        data.forEach((d) => {
          if (d.latitude == null || d.longitude == null) return
          const dist = calculateDistance(d.latitude, d.longitude, gw.latitude, gw.longitude)
          const att = calculateSignalAttenuation(dist, gw)
          if (att.quality === "strong") gwStrongDevices++
          else if (att.quality === "moderate") gwModerateDevices++
          else if (att.quality === "weak") gwWeakDevices++
        })

        const totalCoveredByGw = gwStrongDevices + gwModerateDevices + gwWeakDevices

        // Plot Gateway Tower Marker
        const towerIcon = createGatewayTowerIcon(gw)
        const gwMarker = L.marker([gw.latitude, gw.longitude], { icon: towerIcon, zIndexOffset: 500 })
          .bindPopup(`
            <div class="p-2.5 min-w-[240px]">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="p-1 rounded bg-indigo-50 text-indigo-700 font-bold text-xs">LoRaWAN Tower</span>
                <span class="text-[11px] text-gray-500 font-mono">${gw.eui || gw.id}</span>
              </div>
              <h3 class="font-bold text-sm text-gray-900 mb-0.5">${gw.name}</h3>
              <p class="text-xs text-gray-600 mb-2">${gw.description || profile.label}</p>

              <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded border border-slate-200 mb-2">
                <div><span class="text-gray-500">Environment:</span> <span class="font-semibold capitalize text-indigo-900">${env}</span></div>
                <div><span class="text-gray-500">Antenna Ht:</span> <span class="font-semibold">${gw.antenna_height_m || 25} m</span></div>
                <div><span class="text-gray-500">Strong Radius:</span> <span class="font-semibold text-emerald-700">≤ ${(gw.inner_strong_radius_km ?? profile.strongRadiusKm).toFixed(1)} km</span></div>
                <div><span class="text-gray-500">Max Reach:</span> <span class="font-semibold text-red-700">≤ ${(gw.max_range_km ?? profile.maxRadiusKm).toFixed(1)} km</span></div>
              </div>

              <div class="text-xs font-semibold text-gray-700 mb-1">AirQo Devices in Coverage:</div>
              <div class="grid grid-cols-3 gap-1 text-[11px] text-center mb-2">
                <div class="bg-emerald-50 text-emerald-800 p-1 rounded border border-emerald-200 font-bold">${gwStrongDevices} Strong</div>
                <div class="bg-amber-50 text-amber-800 p-1 rounded border border-amber-200 font-bold">${gwModerateDevices} Mod</div>
                <div class="bg-red-50 text-red-800 p-1 rounded border border-red-200 font-bold">${gwWeakDevices} Fringe</div>
              </div>

              <div class="text-[10px] text-gray-500 border-t border-gray-100 pt-1.5">
                ${
                  env === "urban"
                    ? "⚠️ Concrete obstructions in Kampala reduce range to 2–5 km."
                    : env === "rural"
                    ? "🌲 Open layout allows long-range reach up to 10 km."
                    : "🏡 Suburban spread with moderate multi-path attenuation."
                }
              </div>
            </div>
          `)

        gwMarker.addTo(map.current!)
        gatewayLayersRef.current.push(gwMarker)
        bounds.extend([gw.latitude, gw.longitude])
      })
    }

    // -------------------------------------------------------------
    // 2. PLOT AIRQO MAINTENANCE DEVICES
    // -------------------------------------------------------------
    data.forEach((device) => {
      if (device.latitude == null || device.longitude == null) return

      const isSelected = localSelectedIds.includes(device.device_id)
      const uptimePct = normalizeUptimePct(device.uptime)
      const uptimeStatus = getUptimeStatus(uptimePct)
      const errorStatus = getErrorStatus(device.error_margin)

      // LoRaWAN Coverage status for this device
      const cov = coverageStats.deviceCoverageMap[device.device_id]
      const isUncovered = !cov || cov.signalQuality === "none"

      // Radius Visibility Filtering:
      // If user selected inside_radius, devices out of the radius are NOT visible on the map
      if (coverageFilter === "inside_radius" && isUncovered) return
      // If user selected outside_radius (blindspots), in-radius devices are NOT visible on the map
      if (coverageFilter === "outside_radius" && !isUncovered) return

      const icon = createMarkerIcon(uptimeStatus, errorStatus, isSelected, false, isUncovered)

      let uptimeColorClass = "text-green-600"
      if (uptimeStatus === "moderate") uptimeColorClass = "text-yellow-600"
      if (uptimeStatus === "critical") uptimeColorClass = "text-red-600"
      if (uptimeStatus === "offline") uptimeColorClass = "text-gray-400"

      let errorColorClass = "text-green-600"
      if (errorStatus === "moderate") errorColorClass = "text-yellow-600"
      if (errorStatus === "critical") errorColorClass = "text-red-600"

      let signalBadgeHtml = `<div class="text-xs text-gray-400">No LoRaWAN gateway configured</div>`
      if (gateways.length > 0 && cov) {
        if (cov.signalQuality === "strong") {
          signalBadgeHtml = `
            <div class="bg-emerald-50 border border-emerald-200 rounded p-1.5 mb-2 text-xs">
              <div class="flex items-center justify-between text-emerald-800 font-bold">
                <span>📶 LoRaWAN Strong (SF7)</span>
                <span>${cov.estimatedRssiDbm} dBm</span>
              </div>
              <div class="text-[10px] text-emerald-700 mt-0.5">${cov.distanceKm} km from ${cov.nearestGatewayName}</div>
            </div>`
        } else if (cov.signalQuality === "moderate") {
          signalBadgeHtml = `
            <div class="bg-amber-50 border border-amber-200 rounded p-1.5 mb-2 text-xs">
              <div class="flex items-center justify-between text-amber-800 font-bold">
                <span>📶 LoRaWAN Moderate (SF9-10)</span>
                <span>${cov.estimatedRssiDbm} dBm</span>
              </div>
              <div class="text-[10px] text-amber-700 mt-0.5">${cov.distanceKm} km from ${cov.nearestGatewayName}</div>
            </div>`
        } else if (cov.signalQuality === "weak") {
          signalBadgeHtml = `
            <div class="bg-red-50 border border-red-200 rounded p-1.5 mb-2 text-xs">
              <div class="flex items-center justify-between text-red-800 font-bold">
                <span>📶 LoRaWAN Fringe (SF12)</span>
                <span>${cov.estimatedRssiDbm} dBm</span>
              </div>
              <div class="text-[10px] text-red-700 mt-0.5">${cov.distanceKm} km from ${cov.nearestGatewayName} (Signal Drop Risk)</div>
            </div>`
        } else {
          signalBadgeHtml = `
            <div class="bg-red-100 border border-red-300 rounded p-1.5 mb-2 text-xs text-red-800">
              <div class="font-bold flex items-center gap-1">
                <span>⚠️ Signal Drop / No Gateway Coverage</span>
              </div>
              <div class="text-[10px] text-red-700 mt-0.5">Nearest gateway is ${cov.distanceKm} km away (outside 2-10 km range)</div>
            </div>`
        }
      }

      const marker = L.marker([device.latitude, device.longitude], { icon }).bindPopup(`
        <div class="p-2 min-w-[210px]">
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-bold text-sm text-gray-900">${device.device_name}</h3>
          </div>
          <p class="text-xs text-gray-600 mb-2">${device.cohorts?.length ? device.cohorts.join(", ") : "No cohorts"}</p>
          
          ${signalBadgeHtml}

          <div class="grid grid-cols-2 gap-2 text-xs mb-2">
            <div><span class="font-medium text-gray-500">Uptime:</span> <span class="font-bold ${uptimeColorClass}">${uptimePct.toFixed(0)}%</span></div>
            <div><span class="font-medium text-gray-500">Error:</span> <span class="font-bold ${errorColorClass}">${(device.error_margin ?? 0).toFixed(1)}</span></div>
          </div>
          <div class="text-xs text-gray-500 mb-2"><span class="font-medium">Last Post:</span> ${device.last_active ? new Date(device.last_active).toLocaleString() : "N/A"}</div>
          <div id="mini-graphs-${device.device_id}"></div>
          <button 
            id="btn-select-${device.device_id}" 
            class="w-full text-xs bg-blue-50 text-blue-600 py-1.5 rounded font-medium hover:bg-blue-100 transition-colors mt-2"
          >
            ${isSelected ? "Deselect from Route" : "Add to Route"}
          </button>
        </div>
      `)

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-select-${device.device_id}`)
        if (btn) {
          btn.onclick = () => {
            handleToggleSelect(device.device_id)
            marker.closePopup()
          }
        }
        loadMiniGraphsForDevice(device)
      })

      marker.addTo(map.current!)
      markersRef.current.push(marker)
      bounds.extend([device.latitude, device.longitude])
    })

    // -------------------------------------------------------------
    // 3. ROUTE LOGIC
    // -------------------------------------------------------------
    if (isRouteMode && localSelectedIds.length > 1) {
      const selectedDevices = data.filter((d) => localSelectedIds.includes(d.device_id))
      const optimizedRoute = optimizeRoute(selectedDevices, {
        weightDistance: 0.6,
        weightCriticality: 0.3,
        weightAirQloud: 0.1,
      })

      const latlngs = optimizedRoute.map((d) => [d.latitude, d.longitude] as [number, number])
      routeLayerRef.current = L.polyline(latlngs, {
        color: "#3b82f6",
        weight: 3,
        opacity: 0.7,
        dashArray: "5, 10",
      }).addTo(map.current!)

      let dist = 0
      let crit = 0
      for (let i = 0; i < optimizedRoute.length - 1; i++) {
        dist += calculateDistance(
          optimizedRoute[i].latitude,
          optimizedRoute[i].longitude,
          optimizedRoute[i + 1].latitude,
          optimizedRoute[i + 1].longitude
        )
      }
      optimizedRoute.forEach((d) => (crit += calculateCriticalityScore(d)))
      setRouteStats({
        distance: Math.round(dist),
        stops: optimizedRoute.length,
        criticality: Math.round(crit / optimizedRoute.length),
      })

      const opps = findDevicesAlongRoute(optimizedRoute, data, 10)
      setSuggestions(opps)

      opps.forEach((device) => {
        const uptimePct = normalizeUptimePct(device.uptime)
        const uptimeStatus = getUptimeStatus(uptimePct)
        const errorStatus = getErrorStatus(device.error_margin)

        const icon = createMarkerIcon(uptimeStatus, errorStatus, false, true)
        const marker = L.marker([device.latitude, device.longitude], { icon, opacity: 0.8 }).bindPopup(`
          <div class="p-2 min-w-[180px]">
            <h3 class="font-bold text-xs text-purple-600">Suggested Stop! (+${calculateCriticalityScore(device).toFixed(0)} score)</h3>
            <div class="font-medium text-sm mt-1 mb-1">${device.device_name}</div>
            <div class="text-xs text-gray-500 mb-2">This device is along your route and needs attention.</div>
            <button 
              id="btn-suggest-${device.device_id}" 
              class="w-full text-xs bg-purple-50 text-purple-600 py-1 rounded hover:bg-purple-100 transition-colors"
            >
              Add to Route
            </button>
          </div>
        `)
        marker.on("popupopen", () => {
          const btn = document.getElementById(`btn-suggest-${device.device_id}`)
          if (btn)
            btn.onclick = () => {
              handleToggleSelect(device.device_id)
              marker.closePopup()
            }
        })
        marker.addTo(map.current!)
        suggestionMarkersRef.current.push(marker)
      })
    } else if (routePath && routePath.length > 0) {
      if (homeLocation) {
        const homeIcon = L.divIcon({
          className: "bg-transparent",
          html: `<div class="w-8 h-8 bg-slate-800 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
        homeMarkerRef.current = L.marker([homeLocation.latitude, homeLocation.longitude], { icon: homeIcon })
          .bindPopup(homeLocation.name || "Home Location")
          .addTo(map.current!)
      }

      const latlngs: [number, number][] = []
      if (homeLocation) latlngs.push([homeLocation.latitude, homeLocation.longitude])

      routePath.forEach((d) => {
        if (d.latitude != null && d.longitude != null) latlngs.push([d.latitude, d.longitude])
      })

      if (homeLocation) latlngs.push([homeLocation.latitude, homeLocation.longitude])

      routeLayerRef.current = L.polyline(latlngs, {
        color: "#2563eb",
        weight: 4,
        opacity: 0.8,
        lineCap: "round",
      }).addTo(map.current!)

      let dist = 0
      for (let i = 0; i < latlngs.length - 1; i++) {
        dist += calculateDistance(latlngs[i][0], latlngs[i][1], latlngs[i + 1][0], latlngs[i + 1][1])
      }

      let crit = 0
      routePath.forEach((d) => (crit += calculateCriticalityScore(d)))

      setRouteStats({
        distance: Math.round(dist),
        stops: routePath.length,
        criticality: routePath.length > 0 ? Math.round(crit / routePath.length) : 0,
      })
    } else {
      setRouteStats({ distance: 0, stops: localSelectedIds.length, criticality: 0 })
      setSuggestions([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, localSelectedIds, isRouteMode, zoom, routePath, homeLocation, gateways, showGateways, highlightUncoveredDevices, coverageStats, coverageFilter])

  // Polygon selection listener
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

  const handleToggleSelect = (id: string) => {
    let newIds
    if (localSelectedIds.includes(id)) {
      newIds = localSelectedIds.filter((item) => item !== id)
    } else {
      newIds = [...localSelectedIds, id]
    }
    setLocalSelectedIds(newIds)
    onDeviceSelect?.(id)
    onSelectionChange?.(newIds)
  }

  const clearSelection = () => {
    setLocalSelectedIds([])
    onSelectionChange?.([])
  }

  const clearPolygon = () => {
    drawnItemsRef.current.clearLayers()
    setHasPolygon(false)
    setIsDrawing(false)
    onPolygonSelectRef.current?.([])
  }

  return (
    <div
      id={mapContainerId}
      className="relative w-full h-[800px] rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100 group"
    >
      <div ref={mapContainer} className="absolute inset-0 z-0" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <span className="text-gray-900 font-medium animate-pulse">Loading Map Data...</span>
        </div>
      )}

      {/* Polygon Drawing Indicator */}
      {isDrawing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-pulse">
          Click on the map to draw polygon vertices. Click the first point to close.
        </div>
      )}

      {/* TOP-LEFT SLIDE-OUT PANEL (TRIGGERED BY LORAWAN TOOLBAR BUTTON) */}
      {lorawanPanelOpen && (
        <div className="absolute top-[80px] left-[50px] z-[400] transition-all duration-200">
          <Card className="p-3 shadow-xl bg-white/95 backdrop-blur border-slate-200 min-w-[245px] animate-in fade-in slide-in-from-left-2 duration-150">
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-gray-900">LoRaWAN RF Layer</span>
              </div>
              <div className="flex items-center gap-1">
                {gateways.length > 0 && (
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-semibold px-1.5 py-0">
                    {coverageStats.activeGateways} Active
                  </Badge>
                )}
                <button
                  onClick={() => setLorawanPanelOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {onToggleGateways && (
                <Button
                  variant={showGateways ? "default" : "outline"}
                  size="sm"
                  className={`w-full justify-start text-xs h-7 ${
                    showGateways ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "text-gray-700"
                  }`}
                  onClick={onToggleGateways}
                >
                  {showGateways ? <Eye className="w-3.5 h-3.5 mr-1.5" /> : <EyeOff className="w-3.5 h-3.5 mr-1.5" />}
                  {showGateways ? "Hide Gateway Radii" : "Show Gateway Radii"}
                </Button>
              )}

              {onOpenGatewayDialog && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-7 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 border-indigo-200"
                  onClick={() => {
                    setLorawanPanelOpen(false)
                    onOpenGatewayDialog()
                  }}
                >
                  <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  {gateways.length === 0 ? "Import Gateways JSON" : `Manage Gateways (${gateways.length})`}
                </Button>
              )}
            </div>

            {/* Radius Visibility Filter */}
            {gateways.length > 0 && onCoverageFilterChange && (
              <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                  <span>Device Visibility:</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {coverageFilter === 'inside_radius' ? 'Out-of-radius hidden' : coverageFilter === 'outside_radius' ? 'In-radius hidden' : 'All visible'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-md text-[10px]">
                  <button
                    onClick={() => onCoverageFilterChange('all')}
                    className={`py-1 rounded font-medium transition-colors ${
                      coverageFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All ({data.length})
                  </button>
                  <button
                    onClick={() => onCoverageFilterChange('inside_radius')}
                    className={`py-1 rounded font-medium transition-colors ${
                      coverageFilter === 'inside_radius' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                    title="Only show devices inside gateway radius (hide out-of-radius devices)"
                  >
                    In Radius ({coverageStats.coveredDevices})
                  </button>
                  <button
                    onClick={() => onCoverageFilterChange('outside_radius')}
                    className={`py-1 rounded font-medium transition-colors ${
                      coverageFilter === 'outside_radius' ? 'bg-red-600 text-white shadow-xs font-bold' : 'text-red-700 hover:text-red-900'
                    }`}
                    title="Only show blindspots (hide in-radius devices)"
                  >
                    Blindspots ({coverageStats.uncoveredDevices})
                  </button>
                </div>
              </div>
            )}

            {gateways.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                <div className="flex justify-between font-medium">
                  <span>Coverage:</span>
                  <span className="font-bold text-gray-900">{coverageStats.coveragePercentage}% of devices</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {coverageStats.coveredDevices} in radius • {coverageStats.uncoveredDevices} out of radius
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TOP-RIGHT CONTROLS: ROUTE & EXPORT & LEGEND */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 transition-transform duration-200 max-h-[90%] overflow-y-auto">
        <Card className="p-2 shadow-lg bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-slate-200">
          <div className="flex flex-col gap-2">
            {onExportMap && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-8 bg-white hover:bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                onClick={onExportMap}
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                Export Map (PNG / PDF)
              </Button>
            )}

            {!routePath && (
              <Button
                variant={isRouteMode ? "default" : "outline"}
                size="sm"
                className={`w-full justify-start text-xs h-8 ${isRouteMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                onClick={() => setIsRouteMode(!isRouteMode)}
              >
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                {isRouteMode ? "Route Mode Active" : "Start Route Planning"}
              </Button>
            )}

            {(isRouteMode || routePath) && (
              <div className="flex flex-col gap-2 mt-1 animate-in fade-in zoom-in-95 duration-200 p-2 bg-slate-50 rounded-md">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Route Stats</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-400">Distance</div>
                    <div className="text-sm font-bold text-gray-700">{routeStats.distance} km</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-400">Stops</div>
                    <div className="text-sm font-bold text-gray-700">{routeStats.stops}</div>
                  </div>
                  <div className="col-span-2 bg-white p-2 rounded border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-400">Avg. Criticality</div>
                    <div className="text-sm font-bold text-gray-700 flex items-center">
                      {routeStats.criticality} / 100
                      {routeStats.criticality > 50 && <AlertTriangle className="w-3 h-3 text-red-500 ml-2" />}
                    </div>
                  </div>
                </div>

                {suggestions.length > 0 && (
                  <div className="mt-1">
                    <div className="text-xs text-purple-600 font-medium flex items-center">
                      <CircleDot className="w-3 h-3 mr-1" />
                      {suggestions.length} Suggested Stops
                    </div>
                  </div>
                )}

                {!routePath && (
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="flex-1 h-6 px-2 text-xs text-gray-500"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Legend */}
        <Card className="p-3 shadow-lg bg-white/95 backdrop-blur border-slate-200 w-[205px]">
          <div className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wider">Map Legend</div>

          {/* Device Health */}
          <div className="mb-2">
            <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Dot — Uptime</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-gray-300 flex-shrink-0" />
                <span className="text-xs text-gray-600">≥ 85% — Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-gray-300 flex-shrink-0" />
                <span className="text-xs text-gray-600">50–84% — Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-gray-300 flex-shrink-0" />
                <span className="text-xs text-gray-600">&lt; 50% — Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-gray-300 flex-shrink-0" />
                <span className="text-xs text-gray-600">0% — Offline</span>
              </div>
            </div>
          </div>

          {/* LoRaWAN Coverage Legend (if gateways enabled) */}
          {showGateways && gateways.length > 0 && (
            <div className="pt-2 border-t border-gray-100 mb-2">
              <div className="text-[10px] font-semibold text-indigo-700 uppercase mb-1">LoRaWAN RF Coverage</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 border border-white flex items-center justify-center text-white text-[8px] flex-shrink-0">
                    📡
                  </div>
                  <span className="text-xs text-gray-700 font-medium">Gateway Tower</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-600 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Strong (≤ 2 km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-600 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Moderate (2–5 km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-dashed border-red-600 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Max Reach (≤ 10 km)</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Margin Ring */}
          <div className="pt-2 border-t border-gray-100">
            <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Ring — Error Margin</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-green-400 flex-shrink-0" />
                <span className="text-xs text-gray-600">≤ 10 — Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-yellow-400 flex-shrink-0" />
                <span className="text-xs text-gray-600">11–20 — Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-red-400 flex-shrink-0" />
                <span className="text-xs text-gray-600">&gt; 20 — Critical</span>
              </div>
            </div>
          </div>

          {(isRouteMode || routePath) && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 opacity-60 flex-shrink-0" />
              <span className="text-xs text-purple-600 italic">Suggested Stop</span>
            </div>
          )}
          {routePath && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 flex-shrink-0" />
              <span className="text-xs text-gray-600 italic">Home / Depot</span>
            </div>
          )}
        </Card>

        {/* Polygon Selection Controls */}
        {hasPolygon && (
          <Card className="p-2 shadow-lg bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs"
              onClick={() => {
                drawnItemsRef.current.clearLayers()
                setHasPolygon(false)
                onPolygonSelectRef.current?.([])
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Polygon
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
