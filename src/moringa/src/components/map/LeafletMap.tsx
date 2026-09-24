"use client"

import "leaflet/dist/leaflet.css"
import type React from "react"
import { useEffect, useRef, useState, useMemo } from "react"
import ReactDOM from "react-dom/client"
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet"
import Image from "next/image"
import L from "leaflet"
import { GeoSearchControl } from "leaflet-geosearch"
import "leaflet-geosearch/dist/geosearch.css" 
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Cloud,
  CloudRain,
  Droplets,
  Gauge,
  LoaderCircle,
  Thermometer,
  Wind,
  X,
  type LucideIcon,
} from "lucide-react"

const markerIconUrl = "/leaflet/marker-icon.png"
const markerIconRetinaUrl = "/leaflet/marker-icon-2x.png"
const markerShadowUrl = "/leaflet/marker-shadow.png"
import {
  getSatelliteData,
  getMapNodes,
  getHeatmapData,
  getActiveFires,
  getDailyForecastCollection,
  getHourlyForecast,
  getSiteHistorical,
  type ActiveFire,
  type DailyForecastResponse,
  type HourlyForecastSite,
} from "@/services/apiService"
import {
  isBrowserApiCacheFresh,
  readBrowserApiCache,
  writeBrowserApiCache,
  type BrowserApiCacheEntry,
} from "@/lib/browserApiCache"
import { useSiteSettings } from "@/hooks/use-site-settings"
import { Switch } from "@/ui/switch"
import { MapLayerControl } from "./MapLayerControl"

const MAP_NODES_CACHE_KEY = "map-nodes"
const MAP_HEATMAPS_CACHE_KEY = "map-heatmaps"
const MAP_ACTIVE_FIRES_CACHE_KEY = "map-active-fires"
const MAP_FORECAST_CACHE_KEY = "map-daily-forecast"
const MAP_HOURLY_FORECAST_CACHE_KEY = "map-hourly-forecast"
const MAP_HOURLY_FORECAST_ENABLED_KEY = "map-hourly-forecast-enabled"
const MAP_API_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000
const MAP_ACTIVE_FIRES_CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000
const DAILY_FORECAST_REFRESH_HOUR_UTC = 3
const DEFAULT_MAP_CENTER: [number, number] = [1.5, 17.5]
const DEFAULT_MAP_ZOOM = 4

const isDailyForecastCacheCurrent = (
  cached: BrowserApiCacheEntry<DailyForecastResponse> | null | undefined,
): cached is BrowserApiCacheEntry<DailyForecastResponse> => {
  if (!cached?.cachedAt) return false

  const cachedAtMs = new Date(cached.cachedAt).getTime()
  if (!Number.isFinite(cachedAtMs)) return false

  const now = new Date()
  const refreshBoundary = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    DAILY_FORECAST_REFRESH_HOUR_UTC,
  )
  const currentCycleStartedAt =
    now.getTime() >= refreshBoundary ? refreshBoundary : refreshBoundary - MAP_API_CACHE_MAX_AGE_MS

  return cachedAtMs >= currentCycleStartedAt
}

// Create a custom MapboxProvider class since the import might not work directly
class MapboxProvider {
  constructor(options: { params: { access_token: string } }) {
    this.accessToken = options.params.access_token
  }

  private accessToken: string

  async search({ query }: { query: string }) {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query,
        )}.json?access_token=${this.accessToken}&limit=5`,
      )
      const data = await response.json()

      return data.features.map((feature: any) => ({
        x: feature.center[0], // longitude
        y: feature.center[1], // latitude
        label: feature.place_name,
        bounds: feature.bbox
          ? [
              [feature.bbox[1], feature.bbox[0]], // southwest
              [feature.bbox[3], feature.bbox[2]], // northeast
            ]
          : undefined,
        raw: feature,
      }))
    } catch (error) {
      console.error("Mapbox geocoding error:", error)
      return []
    }
  }
}

// Import air quality images from public directory
const GoodAir = "/images/GoodAir.png"
const Moderate = "/images/Moderate.png"
const UnhealthySG = "/images/UnhealthySG.png"
const Unhealthy = "/images/Unhealthy.png"
const VeryUnhealthy = "/images/VeryUnhealthy.png"
const Hazardous = "/images/Hazardous.png"
const Invalid = "/images/Invalid.png"

const getAqiImageByCategory = (aqiCategory?: string) => {
  switch ((aqiCategory || "").toLowerCase()) {
    case "good":
      return GoodAir
    case "moderate":
      return Moderate
    case "unhealthy for sensitive groups":
      return UnhealthySG
    case "unhealthy":
      return Unhealthy
    case "very unhealthy":
      return VeryUnhealthy
    case "hazardous":
      return Hazardous
    default:
      return Invalid
  }
}

// Set default icon for markers
const DefaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Update the interface to match the actual API response
interface SatelliteData {
  latitude: number
  longitude: number
  pm2_5_prediction: number
  timestamp: string
  date?: string
  aqi_category?: string
  aqi_color?: string
  data_source?: string
  disclaimer?: string
  requested_date?: string
  place_name?: string
  weather_date?: string
  weather_source?: string
  features?: {
    air_temperature?: number
    temperature?: number
    relative_humidity?: number
    humidity?: number
    weather_date?: string
    weather_source?: string
  }
}

const unwrapSatelliteData = (data: any): any => {
  let current = data

  for (let i = 0; i < 4; i += 1) {
    if (Array.isArray(current) && current.length === 1) {
      current = current[0]
      continue
    }
    break
  }

  return current
}

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// Add type guard for API response
const isSatelliteData = (data: any): data is SatelliteData => {
  return (
    data &&
    typeof data.latitude === "number" &&
    typeof data.longitude === "number" &&
    typeof data.pm2_5_prediction === "number" &&
    typeof data.timestamp === "string"
  )
}

// Update the air quality info function to handle invalid values
const getAirQualityInfo = (pm25: number | null) => {
  // Handle invalid or null PM2.5 values
  if (pm25 === null || isNaN(pm25)) {
    return {
      level: "Invalid Data",
      image: Invalid,
      color: "bg-white border-gray-200",
    }
  }

  if (pm25 <= 9)
    return {
      level: "Good",
      image: GoodAir,
      color: "bg-white border-green-200",
    }
  if (pm25 <= 35.4)
    return {
      level: "Moderate",
      image: Moderate,
      color: "bg-white border-yellow-200",
    }
  if (pm25 <= 55.4)
    return {
      level: "Unhealthy for Sensitive Groups",
      image: UnhealthySG,
      color: "bg-white border-orange-200",
    }
  if (pm25 <= 125.4)
    return {
      level: "Unhealthy",
      image: Unhealthy,
      color: "bg-white border-red-200",
    }
  if (pm25 <= 225.4)
    return {
      level: "Very Unhealthy",
      image: VeryUnhealthy,
      color: "bg-white border-purple-200",
    }
  return {
    level: "Hazardous",
    image: Hazardous,
    color: "bg-white border-red-300",
  }
}

// Create a component for the popup content
const PopupContent: React.FC<{
  label: string
  data: Partial<SatelliteData>
  onClose: () => void
}> = ({ label, data, onClose }) => {
  const { level, image, color } = getAirQualityInfo(data.pm2_5_prediction ?? null)
  const aqiCategory = data.aqi_category || level
  const isSatelliteEstimate = Boolean(data.data_source || data.disclaimer)
  const temperature = data.features?.air_temperature ?? data.features?.temperature
  const humidity = data.features?.relative_humidity ?? data.features?.humidity
  const weatherDate = data.weather_date || data.features?.weather_date
  const weatherSource = data.weather_source || data.features?.weather_source

  // Safely format timestamp
  const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleString() : "Unknown"

  return (
    <div className={`min-w-[200px] p-3 rounded-lg ${color} border`}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-12 h-12 relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={level}
            width={48}
            height={48}
            className="w-full h-full"
            quality={100}
            priority
          />
        </div>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          x
        </button>
      </div>
      <div className="text-sm font-semibold leading-tight text-slate-950">{label}</div>
      <AqiStatusLine
        pm25={data.pm2_5_prediction}
        category={aqiCategory}
        color={data.aqi_color}
        valueLabel="Estimated"
        className="mt-1"
      />
      {isSatelliteEstimate && (
        <div className="mt-2 rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
          Source: Satellite-based PM<sub>2.5</sub> estimate
        </div>
      )}
      {(typeof temperature === "number" || typeof humidity === "number") && (
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-md bg-sky-50 p-2 text-slate-700">
          {typeof temperature === "number" && (
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Temperature</div>
              <div className="text-sm font-semibold">{temperature.toFixed(1)} °C</div>
            </div>
          )}
          {typeof humidity === "number" && (
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Humidity</div>
              <div className="text-sm font-semibold">{humidity.toFixed(1)}%</div>
            </div>
          )}
        </div>
      )}
      {(weatherSource || weatherDate) && (
        <div className="mt-1 text-[10px] text-slate-500">
          Weather{weatherSource ? ` from ${weatherSource}` : ""}{weatherDate ? ` (${weatherDate})` : ""}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2">Updated {timestamp}</div>
    </div>
  )
}

// Create a loading popup component
const LoadingPopupContent: React.FC<{
  label: string
  onClose: () => void
}> = ({ label, onClose }) => (
  <div className="min-w-[220px] rounded-lg border bg-white p-3" role="status" aria-live="polite">
    <div className="flex items-center justify-between mb-2">
      <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
      <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close loading popup">
        x
      </button>
    </div>
    <div className="text-sm font-semibold leading-tight text-slate-950">{label}</div>
    <div className="mt-1 text-xs text-slate-500">Loading satellite PM<sub>2.5</sub> estimate…</div>
    <div className="mt-3 animate-pulse space-y-2">
      <div className="h-5 w-3/4 rounded bg-slate-200" />
      <div className="h-7 w-full rounded-md bg-slate-100" />
      <div className="grid grid-cols-2 gap-2 rounded-md bg-sky-50 p-2">
        <div className="space-y-2">
          <div className="h-2.5 w-16 rounded bg-slate-200" />
          <div className="h-4 w-12 rounded bg-slate-200" />
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-14 rounded bg-slate-200" />
          <div className="h-4 w-10 rounded bg-slate-200" />
        </div>
      </div>
      <div className="h-3 w-2/3 rounded bg-slate-100" />
    </div>
    <span className="sr-only">Satellite prediction is loading</span>
  </div>
)

// Create an error popup component
const ErrorPopupContent: React.FC<{
  label: string
  onClose: () => void
  onRetry?: () => void
  errorMessage?: string
}> = ({ label, onClose, onRetry, errorMessage = "Error loading air quality data" }) => (
  <div className="min-w-[200px] p-3 rounded-lg bg-gray-100 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <div className="w-12 h-12 relative">
        <Image
          src={Invalid || "/placeholder.svg"}
          alt="Error"
          width={48}
          height={48}
          className="w-full h-full"
          quality={100}
          priority
        />
      </div>
      <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
        x
      </button>
    </div>
    <div className="text-sm font-medium mb-2">{label}</div>
    <div className="text-sm text-gray-700">{errorMessage}</div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Try again
      </button>
    )}
  </div>
)

// Add this CSS class to override default Leaflet popup styles
const customPopupOptions = {
  className: "custom-popup",
  closeButton: false,
  maxWidth: 300,
  minWidth: 200,
  offset: [0, -20],
  autoPan: true,
}

// Component to add the search control to the map
const SearchControl: React.FC<{
  defaultCenter: [number, number]
  defaultZoom: number
}> = ({ defaultCenter, defaultZoom }) => {
  const map = useMap()
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    const provider = new MapboxProvider({
      params: {
        access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
      },
    })

    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      position: "topright",
    })

    map.addControl(searchControl)

    // Apply custom TailwindCSS styles to the search bar and add search icon
    const searchBar = document.querySelector(".leaflet-control-geosearch form")
    if (searchBar) {
      searchBar.classList.add("bg-white", "text-black", "border", "border-gray-400", "rounded-md", "relative")

      // Adjust the width and positioning
      const searchContainer = document.querySelector(".leaflet-control-geosearch")
      if (searchContainer) {
        // Position the search bar on the right side
        searchContainer.classList.add("!right-4", "!top-4", "!left-auto", "!transform-none", "!w-64")
      }

      // Create and add the search icon
      const searchIcon = document.createElement("div")
      searchIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      `
      searchIcon.className = "absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
      searchBar.appendChild(searchIcon)

      // Adjust the search input padding to accommodate the icon
      const searchInput = searchBar.querySelector("input")
      if (searchInput) {
        searchInput.style.paddingLeft = "2.5rem"
        // Add some additional styling to the input
        searchInput.classList.add(
          "w-full",
          "pl-10",
          "pr-4",
          "py-2",
          "rounded-md",
          "focus:outline-none",
          "focus:border-transparent",
        )
      }
    }

    const searchResults = document.querySelector(".leaflet-control-geosearch .results")
    if (searchResults) {
      searchResults.classList.add("bg-white", "text-black")
    }

    // Event listener to clear markers and reset the map when search is cleared
    const handleMarkerClear = () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map.setView(defaultCenter, defaultZoom)
    }
    map.on("geosearch/marker/clear", handleMarkerClear)

    // Event listener for when a location is found
    const handleShowLocation = async (result: any) => {
      try {
        const { x, y, label } = result.location

        if (typeof x !== "number" || typeof y !== "number" || !label) {
          throw new Error("Invalid location data")
        }

        // Center the map on the selected location with animation
        map.setView([y, x], 13, {
          animate: true,
          duration: 1,
        })

        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []

        const marker = L.marker([y, x], { icon: DefaultIcon }).addTo(map)
        markersRef.current.push(marker)

        // Create a container div for the popup
        const container = document.createElement("div")

        // Render loading state
        const root = ReactDOM.createRoot(container)
        root.render(
          <LoadingPopupContent
            label={label}
            onClose={() => {
              marker.closePopup()
              root.unmount()
            }}
          />,
        )

        marker.bindPopup(container, { ...customPopupOptions, offset: [0, 0] }).openPopup()

        const loadSatellitePrediction = async (): Promise<void> => {
          root.render(
            <LoadingPopupContent
              label={label}
              onClose={() => {
                marker.closePopup()
                root.unmount()
              }}
            />,
          )

          try {
            const response = await getSatelliteData({
              latitude: y,
              longitude: x,
              timestamp: getTodayDate(),
            })
            const prediction = unwrapSatelliteData(response)

            if (!prediction || !isSatelliteData(prediction)) {
              throw new Error("Invalid API response format")
            }

            root.render(
              <PopupContent
                label={prediction.place_name || label}
                data={prediction}
                onClose={() => {
                  marker.closePopup()
                  root.unmount()
                }}
              />,
            )
          } catch (error) {
            console.error("Error fetching air quality data:", error)
            const responseStatus =
              typeof error === "object" && error !== null && "response" in error
                ? (error as { response?: { status?: number } }).response?.status
                : undefined

            root.render(
              <ErrorPopupContent
                label={label}
                onClose={() => marker.closePopup()}
                onRetry={responseStatus === 401 ? () => void loadSatellitePrediction() : undefined}
                errorMessage={
                  responseStatus === 401
                    ? "The satellite request was not authorized."
                    : error instanceof Error
                      ? error.message
                      : "Failed to load air quality data"
                }
              />,
            )
          }
        }

        await loadSatellitePrediction()
      } catch (error) {
        console.error("Error handling location:", error)
        // Handle location processing errors
        const errorContainer = document.createElement("div")
        const errorRoot = ReactDOM.createRoot(errorContainer)
        errorRoot.render(
          <ErrorPopupContent label="Location Error" onClose={() => {}} errorMessage="Invalid location data received" />,
        )
      }
    }
    map.on("geosearch/showlocation", handleShowLocation)

    // Event listener for search input cancel or clear
    const searchInput = document.querySelector<HTMLInputElement>(".leaflet-control-geosearch input")
    const handleSearchInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (!target.value) {
        map.setView(defaultCenter, defaultZoom)
        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []
      }
    }
    if (searchInput) {
      searchInput.addEventListener("input", handleSearchInput)
    }

    return () => {
      map.off("geosearch/marker/clear", handleMarkerClear)
      map.off("geosearch/showlocation", handleShowLocation)
      searchInput?.removeEventListener("input", handleSearchInput)
      map.removeControl(searchControl)
    }
  }, [map, defaultCenter, defaultZoom])

  return null
}

// Add interface for map nodes
interface MapNode {
  _id: string
  site_id: string
  time: string
  aqi_category: string
  aqi_color: string
  pm2_5: { value: number | null }
  averages?: {
    percentageDifference?: number
    weeklyAverages?: {
      currentWeek?: number
      previousWeek?: number
    }
  }
  siteDetails: {
    location_name?: string
    name?: string
    approximate_latitude: number
    approximate_longitude: number
    formatted_name?: string
  }
}

// Add loading state interface
interface LoadingState {
  isLoading: boolean
  error: string | null
}

interface DailyForecastItem {
  time: string
  pm2_5: number | null
  aqi_label?: string
  pm2_5_low?: number | null
  pm2_5_high?: number | null
  pm2_5_max?: number | null
  forecast_confidence?: number | null
  air_temperature?: number | null
  relative_humidity?: number | null
  air_pressure_at_sea_level?: number | null
  precipitation_amount?: number | null
  cloud_area_fraction?: number | null
  wind_speed?: number | null
  wind_direction_compass?: string
  aqi_category?: string
  aqi_color?: string
  aqi_color_name?: string
  created_at?: string
}

interface ForecastState {
  isLoading: boolean
  error: string | null
  collection: DailyForecastResponse | null
}

interface HourlyForecastState {
  isLoading: boolean
  error: string | null
  site: HourlyForecastSite | null
}

interface HourlyForecastCollectionState {
  isLoading: boolean
  error: string | null
  requestedSiteId: string | null
  site: HourlyForecastSite | null
}

interface HourlyForecastRequest {
  siteId: string
}

type HistoricalPoint = { date: Date; pm25: number }

type HistoricalSeriesPoint = { x: Date; pm25: number }
type HistoricalSeriesMode = "daily" | "hourly"

const extractHistoricalTime = (row: any): string | null => {
  if (!row) return null
  const t = row.time || row.timestamp || row.datetime
  return typeof t === "string" ? t : null
}

const extractHistoricalPm25 = (row: any): number | null => {
  if (!row) return null
  const pm = row.pm2_5
  if (typeof pm === "number") return Number.isFinite(pm) ? pm : null
  if (pm && typeof pm === "object" && typeof pm.value === "number") return Number.isFinite(pm.value) ? pm.value : null
  if (typeof row.pm2_5_calibrated_value === "number") return Number.isFinite(row.pm2_5_calibrated_value) ? row.pm2_5_calibrated_value : null
  if (typeof row.pm2_5_raw_value === "number") return Number.isFinite(row.pm2_5_raw_value) ? row.pm2_5_raw_value : null
  return null
}

const buildHourlySeries = (rows: any[]): HistoricalSeriesPoint[] => {
  const points: HistoricalSeriesPoint[] = []
  rows.forEach((row) => {
    const time = extractHistoricalTime(row)
    const pm25 = extractHistoricalPm25(row)
    if (!time || typeof pm25 !== "number") return
    const dt = new Date(time)
    if (Number.isNaN(dt.getTime())) return
    points.push({ x: dt, pm25 })
  })
  points.sort((a, b) => a.x.getTime() - b.x.getTime())
  return points
}

const toIsoUtc = (d: Date) => {
  const dt = new Date(d)
  return dt.toISOString()
}

const getLastNDaysRangeIso = (days: number) => {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  return { startIso: toIsoUtc(start), endIso: toIsoUtc(end) }
}

const buildLast7DaysDailyAverage = (rows: any[]): HistoricalPoint[] => {
  const byDay = new Map<string, { date: Date; sum: number; count: number }>()

  rows.forEach((row) => {
    const time = extractHistoricalTime(row)
    const pm25 = extractHistoricalPm25(row)
    if (!time || typeof pm25 !== "number") return

    const dt = new Date(time)
    if (Number.isNaN(dt.getTime())) return

    const key = dt.toISOString().slice(0, 10) // yyyy-mm-dd (UTC)
    const bucket = byDay.get(key) || { date: new Date(key), sum: 0, count: 0 }
    bucket.sum += pm25
    bucket.count += 1
    byDay.set(key, bucket)
  })

  return Array.from(byDay.values())
    .map((b) => ({ date: b.date, pm25: b.count ? b.sum / b.count : 0 }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

const uniqueDayCount = (rows: any[]): number => {
  const set = new Set<string>()
  rows.forEach((row) => {
    const time = extractHistoricalTime(row)
    if (!time) return
    const dt = new Date(time)
    if (Number.isNaN(dt.getTime())) return
    set.add(dt.toISOString().slice(0, 10))
  })
  return set.size
}

// Create a loading indicator component
const LoadingIndicator: React.FC<LoadingState> = ({ isLoading, error }) => {
  if (!isLoading && !error) return null

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-3">
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          <span className="text-sm text-gray-600">Loading map data...</span>
        </div>
      ) : error ? (
        <div className="flex items-center space-x-2 text-red-500">
          <span className="text-sm">{error}</span>
        </div>
      ) : null}
    </div>
  )
}

const parseForecastTime = (time: string) => {
  const raw = (time || "").trim()
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw)
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)
  const withTimeSeparator = raw.includes(" ") ? raw.replace(" ", "T") : raw
  const normalized = isDateOnly ? `${raw}T00:00:00` : hasTimezone ? withTimeSeparator : `${withTimeSeparator}Z`
  const dt = new Date(normalized)
  return Number.isNaN(dt.getTime()) ? null : dt
}

const formatLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const formatForecastMetric = (value: number | null | undefined, digits = 1, suffix = "") =>
  typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(digits)}${suffix}` : "N/A"

const PM25_UNIT_TEXT = "&micro;g/m³"

const formatForecastMetricWithUnit = (
  value: number | null | undefined,
  digits = 1,
  unit = "",
) => {
  const formatted = formatForecastMetric(value, digits)
  return formatted === "N/A" || !unit ? formatted : `${formatted} ${unit}`
}

const hasForecastMetricValue = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value)

const getForecastNumber = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : null

const getDynamicChartAxis = (values: number[]) => {
  if (!values.length) return { domain: [0, 1] as [number, number], ticks: [0, 1] }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const spread = Math.max(max - min, 1)
  const padding = spread * 0.15
  const rawMin = Math.max(0, min - padding)
  const rawMax = max + padding
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(rawMax - rawMin, 1)))
  const step = Math.max(1, Math.ceil((rawMax - rawMin) / 4 / magnitude) * magnitude)
  const axisMin = Math.max(0, Math.floor(rawMin / step) * step)
  const axisMax = Math.max(axisMin + step, Math.ceil(rawMax / step) * step)
  const mid = axisMin + (axisMax - axisMin) / 2

  return {
    domain: [axisMin, axisMax] as [number, number],
    ticks: [axisMin, mid, axisMax],
  }
}

const getStartOfLocalDayMs = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

function Pm25Label() {
  return (
    <>
      PM<sub className="align-sub text-[0.7em] leading-none">2.5</sub>
    </>
  )
}

function Pm25Unit() {
  return (
    <>
      &micro;g/m<sup className="align-super text-[0.7em] leading-none">3</sup>
    </>
  )
}

function AqiStatusLine({
  pm25,
  category,
  color,
  valueLabel = "Current",
  className = "",
}: {
  pm25?: number | null
  category?: string | null
  color?: string | null
  valueLabel?: string
  className?: string
}) {
  const badgeStyle = getAqiBadgeStyle(category, normalizeHexColor(color))
  const displayCategory = category || "Unknown"

  return (
    <div className={["flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-700", className].join(" ")}>
      <span className="whitespace-nowrap font-medium text-slate-600">
        {valueLabel} <Pm25Label />: <span className="font-semibold text-slate-950">{formatForecastMetric(pm25, 0)}</span> <Pm25Unit />
      </span>
      <span className="relative h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inset-0 rounded-full opacity-60 animate-ping" style={{ backgroundColor: badgeStyle.dotColor }} />
        <span className="absolute inset-0 rounded-full" style={{ backgroundColor: badgeStyle.dotColor }} />
      </span>
      <span
        className="inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-normal text-white shadow-sm"
        style={{ backgroundColor: badgeStyle.dotColor }}
        title={displayCategory}
      >
        <span className="min-w-0 truncate">{displayCategory}</span>
      </span>
    </div>
  )
}

const normalizeHexColor = (value?: string | null, fallback = "#E4B84A") => {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return fallback
  return raw.startsWith("#") ? raw : `#${raw}`
}

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = normalizeHexColor(hex).replace("#", "")
  const value = normalized.length === 3 ? normalized.split("").map((char) => `${char}${char}`).join("") : normalized

  if (value.length !== 6) return `rgba(228, 184, 74, ${alpha})`

  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const getAqiBadgeStyle = (category?: string | null, fallbackColor = "#E4B84A") => {
  const normalized = (category || "").toLowerCase()
  const styles: Record<string, { borderColor: string; backgroundColor: string; color: string; dotColor: string }> = {
    good: {
      borderColor: "#BBF7D0",
      backgroundColor: "#F0FDF4",
      color: "#166534",
      dotColor: "#22C55E",
    },
    moderate: {
      borderColor: "#FDE68A",
      backgroundColor: "#FFFBEB",
      color: "#92400E",
      dotColor: "#F59E0B",
    },
    "unhealthy for sensitive groups": {
      borderColor: "#FED7AA",
      backgroundColor: "#FFF7ED",
      color: "#9A3412",
      dotColor: "#F97316",
    },
    unhealthy: {
      borderColor: "#FECACA",
      backgroundColor: "#FEF2F2",
      color: "#991B1B",
      dotColor: "#EF4444",
    },
    "very unhealthy": {
      borderColor: "#E9D5FF",
      backgroundColor: "#FAF5FF",
      color: "#6B21A8",
      dotColor: "#A855F7",
    },
    hazardous: {
      borderColor: "#FBCFE8",
      backgroundColor: "#FDF2F8",
      color: "#9D174D",
      dotColor: "#DB2777",
    },
  }

  return (
    styles[normalized] || {
      borderColor: hexToRgba(fallbackColor, 0.28),
      backgroundColor: hexToRgba(fallbackColor, 0.1),
      color: "#334155",
      dotColor: fallbackColor,
    }
  )
}

const getAqiColorByPm25 = (
  _pm25: number | null | undefined,
  category?: string | null,
  fallbackColor?: string | null,
) => getAqiBadgeStyle(category, normalizeHexColor(fallbackColor)).dotColor

const ForecastStatusBadge: React.FC<{ forecastState: ForecastState }> = ({ forecastState }) => {
  if (!forecastState.isLoading && !forecastState.error) return null

  return (
    <div className="absolute left-4 top-4 z-[1000] max-w-[260px] rounded-md border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
      {forecastState.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <LoaderCircle className="h-4 w-4 animate-spin text-blue-600" />
          <span>Loading forecast coverage...</span>
        </div>
      ) : forecastState.error ? (
        <div className="text-sm text-rose-700">{forecastState.error}</div>
      ) : null}
    </div>
  )
}

const ForecastDayPill: React.FC<{
  item: DailyForecastItem
  isActive: boolean
  onClick: () => void
}> = ({ item, isActive, onClick }) => {
  const dt = parseForecastTime(item.time)
  const weekday = dt ? dt.toLocaleDateString(undefined, { weekday: "short" }) : (item.time || "?").slice(0, 3)
  const dayNum = dt ? String(dt.getDate()) : "--"
  const imageSrc = getAqiImageByCategory(item.aqi_category)
  const accentColor = normalizeHexColor(item.aqi_color)

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-[104px] w-[56px] shrink-0 items-center justify-center rounded-[28px] border text-center shadow-sm transition-all duration-200",
        isActive
          ? "border-transparent bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)]"
          : "bg-white text-slate-700 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
      style={isActive ? undefined : { borderColor: "#EBCF90" }}
      aria-label={`Forecast for ${weekday} ${dayNum}`}
    >
      <div className="flex h-full flex-col items-center justify-between px-1 py-3">
        <div className={["text-[11px] font-semibold leading-none", isActive ? "text-white/90" : "text-slate-500"].join(" ")}>
          {weekday}
        </div>
        <div className={["text-[23px] font-semibold leading-none", isActive ? "text-white" : "text-slate-900"].join(" ")}>{dayNum}</div>
        <div className="flex flex-col items-center gap-1">
          <div
            className={[
              "relative flex h-6 w-6 items-center justify-center rounded-full border",
              isActive ? "border-white/30 bg-white/20" : "bg-[#FFF8E7]",
            ].join(" ")}
            style={isActive ? undefined : { borderColor: hexToRgba(accentColor, 0.28) }}
            title={item.aqi_color_name || item.aqi_category || "Unknown"}
          >
            <Image src={imageSrc} alt={item.aqi_category || "Unknown"} fill className="object-contain p-[3px]" />
          </div>
          <div className={["text-[10px] font-semibold leading-none", isActive ? "text-white/80" : "text-slate-400"].join(" ")}>
            {typeof item.pm2_5 === "number" ? item.pm2_5.toFixed(0) : "--"}
          </div>
        </div>
      </div>
    </button>
  )
}

const ForecastPanel: React.FC<{
  selectedNode: MapNode | null
  forecastState: ForecastState
  hourlyForecastState: HourlyForecastCollectionState
  hourlyForecastEnabled: boolean
  onHourlyForecastEnabledChange: (enabled: boolean) => void
  onHourlyForecastRequest: (request: HourlyForecastRequest) => void
  onClose: () => void
}> = ({
  selectedNode,
  forecastState,
  hourlyForecastState,
  hourlyForecastEnabled,
  onHourlyForecastEnabledChange,
  onHourlyForecastRequest,
  onClose,
}) => {
  const selectedSiteForecast = useMemo(() => {
    const siteId = selectedNode?.site_id
    if (!siteId || !forecastState.collection?.forecasts?.length) return null

    return forecastState.collection.forecasts.find((site) => site.site_details?.site_id === siteId) || null
  }, [forecastState.collection, selectedNode?.site_id])

  const hourlyState = useMemo<HourlyForecastState>(() => {
    const siteId = selectedNode?.site_id
    if (!siteId || !hourlyForecastEnabled) {
      return { isLoading: false, error: null, site: null }
    }

    const site = hourlyForecastState.requestedSiteId === siteId ? hourlyForecastState.site : null

    if (site?.forecasts?.length) {
      return { isLoading: false, error: null, site }
    }

    if (hourlyForecastState.isLoading) {
      return { isLoading: true, error: null, site: null }
    }

    return {
      isLoading: false,
      error: hourlyForecastState.error || "No hourly forecast returned for this site.",
      site: null,
    }
  }, [
    hourlyForecastEnabled,
    hourlyForecastState.site,
    hourlyForecastState.error,
    hourlyForecastState.isLoading,
    hourlyForecastState.requestedSiteId,
    selectedNode?.site_id,
  ])

  const selectedForecasts = useMemo<DailyForecastItem[] | null>(() => {
    if (!selectedSiteForecast?.forecasts?.length) return null

    return selectedSiteForecast.forecasts.map((item) => ({
      time: item.date,
      pm2_5: typeof item.forecast.pm2_5_mean === "number" ? item.forecast.pm2_5_mean : item.aqi.aqi_value,
      pm2_5_low: item.forecast.pm2_5_low,
      pm2_5_high: item.forecast.pm2_5_high,
      pm2_5_max: item.forecast.pm2_5_max,
      forecast_confidence: item.forecast.forecast_confidence,
      air_temperature: item.met?.air_temperature ?? null,
      relative_humidity: item.met?.relative_humidity ?? null,
      air_pressure_at_sea_level: item.met?.air_pressure_at_sea_level ?? null,
      precipitation_amount: item.met?.precipitation_amount ?? null,
      cloud_area_fraction: item.met?.cloud_area_fraction ?? null,
      wind_speed: item.met?.wind_speed ?? null,
      wind_direction_compass: item.met?.wind_direction_compass,
      aqi_label: item.aqi.label,
      aqi_category: item.aqi.aqi_category,
      aqi_color: item.aqi.aqi_color,
      aqi_color_name: item.aqi.aqi_color_name,
      created_at: item.created_at,
    }))
  }, [selectedSiteForecast])

  const title =
    selectedSiteForecast?.site_details?.site_name ||
    selectedNode?.siteDetails?.name ||
    selectedNode?.siteDetails?.formatted_name ||
    selectedNode?.siteDetails?.location_name ||
    "Select a site"
  const currentPm25 =
    typeof selectedNode?.pm2_5?.value === "number" && Number.isFinite(selectedNode.pm2_5.value)
      ? selectedNode.pm2_5.value
      : selectedForecasts?.[0]?.pm2_5 ?? null
  const currentAqiCategory = selectedNode?.aqi_category || selectedForecasts?.[0]?.aqi_category
  const currentAqiColor = selectedNode?.aqi_color || selectedForecasts?.[0]?.aqi_color

  return (
    <aside className="flex h-full w-[448px] flex-col border-l bg-white/92 backdrop-blur-xl">
      <div className="border-b bg-white/70 backdrop-blur-xl">
        <div className="flex items-start gap-3 px-5 py-4">
          <div className="min-w-0 order-last flex-1">
            <div className="truncate text-lg font-semibold text-gray-900">{title}</div>
            <AqiStatusLine
              pm25={currentPm25}
              category={currentAqiCategory}
              color={currentAqiColor}
              className="mt-1"
            />
            {selectedNode?.site_id ? (
              <div className="mt-1 truncate text-xs text-gray-500">{selectedNode.site_id}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="order-first shrink-0 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close forecast panel"
          >
            x
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        {!selectedNode ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
            Click a site on the map to load the next days&apos; forecast.
          </div>
        ) : forecastState.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            Loading forecast...
          </div>
        ) : forecastState.error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {forecastState.error}
          </div>
        ) : !selectedForecasts?.length ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">No daily forecast data.</div>
            <HourlyForecastToggle
              enabled={hourlyForecastEnabled}
              onEnabledChange={onHourlyForecastEnabledChange}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <ForecastContent
              selectedNode={selectedNode}
              forecasts={selectedForecasts}
              hourlyState={hourlyState}
              hourlyForecastEnabled={hourlyForecastEnabled}
              onHourlyForecastEnabledChange={onHourlyForecastEnabledChange}
              onHourlyForecastRequest={onHourlyForecastRequest}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        .forecast-strip::-webkit-scrollbar {
          height: 10px;
        }
        .forecast-strip::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 999px;
        }
        .forecast-strip::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 999px;
        }
        .forecast-strip {
          scrollbar-color: #6b7280 #e5e7eb;
          scrollbar-width: thin;
        }
      `}</style>
    </aside>
  )
}

function HourlyForecastPanel({
  hourlyState,
  dailyForecasts,
  initialDateKey,
  onClose,
}: {
  hourlyState: HourlyForecastState
  dailyForecasts?: DailyForecastItem[]
  initialDateKey?: string
  onClose?: () => void
}) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [visualization, setVisualization] = useState<"line" | "calendar" | "sundial" | "bars">("line")
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(new Date())
    updateCurrentTime()
    const intervalId = window.setInterval(updateCurrentTime, 30_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const chartData = useMemo(() => {
    const rows = hourlyState.site?.forecasts || []
    return rows
      .map((item) => {
        const dt = parseForecastTime(item.timestamp)
        if (!dt) return null
        const met = item.met
        const hasMetValue =
          !!met &&
          [
            met.air_temperature,
            met.relative_humidity,
            met.air_pressure_at_sea_level,
            met.precipitation_amount,
            met.cloud_area_fraction,
            met.wind_speed,
            met.wind_from_direction,
          ].some((value) => typeof value === "number" && Number.isFinite(value))
        return {
          time: dt.getTime(),
          label: dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
          dayLabel: dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
          dateKey: formatLocalDateKey(dt),
          hour: dt.getHours(),
          dayName: dt.toLocaleDateString(undefined, { weekday: "short" }),
          dayNumber: dt.toLocaleDateString(undefined, { day: "2-digit" }),
          fullDateLabel: dt.toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short" }),
          createdAt: item.created_at ? parseForecastTime(item.created_at)?.getTime() ?? null : null,
          pm25: getForecastNumber(item.forecast.pm2_5_mean),
          q10: getForecastNumber(item.forecast.pm2_5_q10),
          q90: getForecastNumber(item.forecast.pm2_5_q90),
          confidence: getForecastNumber(item.forecast.forecast_confidence),
          aqiLabel: item.aqi.label,
          aqiCategory: item.aqi.aqi_category,
          aqiColor: normalizeHexColor(item.aqi.aqi_color),
          metAvailable: hasMetValue,
          air_temperature: getForecastNumber(met?.air_temperature),
          relative_humidity: getForecastNumber(met?.relative_humidity),
          precipitation_amount: getForecastNumber(met?.precipitation_amount),
          wind_speed: getForecastNumber(met?.wind_speed),
          air_pressure_at_sea_level: getForecastNumber(met?.air_pressure_at_sea_level),
          cloud_area_fraction: getForecastNumber(met?.cloud_area_fraction),
          windDirection: met?.wind_direction_compass,
          precipitationBar: getForecastNumber(met?.precipitation_amount) ?? 0,
        }
      })
      .filter((item): item is NonNullable<typeof item> => !!item)
      .sort((a, b) => a.time - b.time)
      .slice(0, 168)
  }, [hourlyState.site])
  const [hoveredPm25Point, setHoveredPm25Point] = useState<(typeof chartData)[number] | null>(null)

  const dailyForecastByDateKey = useMemo(() => {
    const forecastMap = new Map<string, DailyForecastItem>()

    dailyForecasts?.forEach((forecast) => {
      const dt = parseForecastTime(forecast.time)
      if (dt) {
        forecastMap.set(formatLocalDateKey(dt), forecast)
      }
    })

    return forecastMap
  }, [dailyForecasts])

  const dailyGroups = useMemo(() => {
    const grouped = new Map<string, typeof chartData>()
    chartData.forEach((item) => {
      const current = grouped.get(item.dateKey) || []
      current.push(item)
      grouped.set(item.dateKey, current)
    })

    if (dailyForecasts?.length) {
      return dailyForecasts
        .map((forecast) => {
          const dt = parseForecastTime(forecast.time)
          if (!dt) return null
          const dateKey = formatLocalDateKey(dt)
          const rows = grouped.get(dateKey) || []
          return { dateKey, rows, dailyForecast: forecast }
        })
        .filter((group): group is NonNullable<typeof group> => !!group)
    }

    return Array.from(grouped.entries()).map(([dateKey, rows]) => ({ dateKey, rows }))
  }, [chartData, dailyForecasts])

  useEffect(() => {
    if (selectedDayIndex > Math.max(dailyGroups.length - 1, 0)) {
      setSelectedDayIndex(0)
    }
  }, [dailyGroups.length, selectedDayIndex])

  useEffect(() => {
    if (!initialDateKey || !dailyGroups.length) return
    const matchingIndex = dailyGroups.findIndex((group) => group.dateKey === initialDateKey)
    if (matchingIndex >= 0) {
      setSelectedDayIndex(matchingIndex)
    }
  }, [dailyGroups, initialDateKey])

  const selectedDay = dailyGroups[selectedDayIndex] || dailyGroups[0]
  const dayRows = selectedDay?.rows || []
  const todayDateKey = currentTime ? formatLocalDateKey(currentTime) : null
  const isSelectedDayToday = !!todayDateKey && selectedDay?.dateKey === todayDateKey
  const lineRows =
    selectedDay?.dateKey === todayDateKey && dayRows.length
      ? chartData
          .filter((row) => row.time >= dayRows[0].time)
          .slice(0, Math.max(dayRows.length, 12))
      : dayRows
  const selectedDailyForecast =
    selectedDay && "dailyForecast" in selectedDay
      ? (selectedDay as { dailyForecast: DailyForecastItem }).dailyForecast
      : null
  const selectedDailyForecastDate = selectedDailyForecast ? parseForecastTime(selectedDailyForecast.time) : null
  const selectedDayLabel = selectedDailyForecastDate
    ? selectedDailyForecastDate.toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short" })
    : dayRows[0]?.fullDateLabel || "Hourly breakdown"
  const pm25Values = dayRows.map((d) => d.pm25).filter((v): v is number => typeof v === "number")
  const pm25Axis = getDynamicChartAxis(pm25Values)
  const linePm25Values = lineRows.map((d) => d.pm25).filter((v): v is number => typeof v === "number")
  const linePm25Axis = getDynamicChartAxis(linePm25Values)
  const peakPm25Point = dayRows.reduce<(typeof dayRows)[number] | null>((highest, row) => {
    if (typeof row.pm25 !== "number") return highest
    if (!highest || typeof highest.pm25 !== "number" || row.pm25 > highest.pm25) return row
    return highest
  }, null)
  const currentPm25Point =
    currentTime && dayRows.length
      ? (() => {
          const targetTime = new Date(dayRows[0].time)
          targetTime.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0)
          return dayRows.reduce<(typeof dayRows)[number] | null>((nearest, row) => {
            if (typeof row.pm25 !== "number") return nearest
            if (!nearest) return row
            return Math.abs(row.time - targetTime.getTime()) < Math.abs(nearest.time - targetTime.getTime())
              ? row
              : nearest
          }, null)
        })()
      : null
  const currentCalendarPoint =
    currentTime && chartData.length
      ? chartData.reduce<(typeof chartData)[number] | null>((nearest, row) => {
          if (typeof row.pm25 !== "number") return nearest
          if (!nearest) return row
          return Math.abs(row.time - currentTime.getTime()) < Math.abs(nearest.time - currentTime.getTime())
            ? row
            : nearest
        }, null)
      : null
  const activePm25Point =
    hoveredPm25Point &&
    (
      visualization === "calendar"
        ? chartData
        : visualization === "line" || visualization === "bars"
          ? lineRows
          : dayRows
    ).some((row) => row.time === hoveredPm25Point.time)
      ? hoveredPm25Point
      : null
  const displayedPm25Point =
    activePm25Point ||
    (visualization === "sundial"
      ? isSelectedDayToday
        ? currentPm25Point
        : null
      : peakPm25Point)
  const sundialAqiImage = getAqiImageByCategory(displayedPm25Point?.aqiCategory)
  const sundialAqiColor = getAqiColorByPm25(
    displayedPm25Point?.pm25,
    displayedPm25Point?.aqiCategory,
    displayedPm25Point?.aqiColor,
  )
  const metRows = lineRows
  const tempValues = metRows.map((d) => d.air_temperature).filter((v): v is number => typeof v === "number")
  const humidityValues = metRows.map((d) => d.relative_humidity).filter((v): v is number => typeof v === "number")
  const precipitationValues = metRows
    .map((d) => d.precipitation_amount)
    .filter((v): v is number => typeof v === "number")
  const precipitationRows = metRows
    .slice(0, 24)
    .filter((d) => typeof d.precipitation_amount === "number")
  const windRows = metRows
    .slice(0, 24)
    .filter((d) => typeof d.wind_speed === "number" || !!d.windDirection)
  const maxRain = Math.max(...metRows.map((d) => d.precipitationBar), 0)
  const hasCompleteMetWindow = metRows.length > 0 && metRows.every((d) => d.metAvailable)
  const hasTemperatureOrHumidity = hasCompleteMetWindow && (tempValues.length > 0 || humidityValues.length > 0)
  const hasWindData = hasCompleteMetWindow && windRows.length > 0
  const hasPrecipitationData = hasCompleteMetWindow && precipitationValues.length > 0
  const sundialMaxPm25 = Math.max(...pm25Values, 1)
  const hourlyAqiGradientStops = lineRows.map((row, index) => ({
    offset: lineRows.length > 1 ? `${(index / (lineRows.length - 1)) * 100}%` : "0%",
    color: getAqiColorByPm25(row.pm25, row.aqiCategory, row.aqiColor),
  }))
  const currentHourAngle = currentTime
    ? ((currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60)) * Math.PI * 2 - Math.PI / 2
    : null
  const currentMinuteAngle = currentTime
    ? ((currentTime.getMinutes() * 60 + currentTime.getSeconds()) / 3600) * Math.PI * 2 - Math.PI / 2
    : null
  const visualizationOptions = [
    { id: "line", label: "Line", icon: Activity },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "sundial", label: "Sundial", icon: Clock3 },
    { id: "bars", label: "Bars", icon: BarChart3 },
  ] as const

  const updateHoveredPm25Point = (state: any) => {
    const pm25Payload = state?.activePayload?.find((item: any) => item?.dataKey === "pm25")
    const point = pm25Payload?.payload
    setHoveredPm25Point(point && typeof point.pm25 === "number" ? point : null)
  }

  useEffect(() => {
    setHoveredPm25Point(null)
  }, [selectedDayIndex])

  const compassDegrees: Record<string, number> = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  }

  return (
    <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-blue-50 text-blue-700">
              <Clock3 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-950">Hourly Forecast</div> 
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hourlyState.isLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-blue-600" /> : null}
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close hourly forecast"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-white">
        {hourlyState.error ? (
          <div className="m-4 rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{hourlyState.error}</div>
        ) : hourlyState.isLoading ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-slate-600">Loading hourly forecast...</div>
        ) : !chartData.length ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-slate-600">No hourly forecast data.</div>
        ) : (
          <div>
            <div className="forecast-strip flex gap-2 overflow-x-auto border-b border-slate-200 bg-[#F7F8FB] px-3 py-2">
              {dailyGroups.map((group, index) => {
                const first = group.rows[0]
                const preview = group.rows.find((item) => item.pm25 !== null) || first
                const dailyPreview =
                  "dailyForecast" in group
                    ? (group as { dailyForecast: DailyForecastItem }).dailyForecast
                    : dailyForecastByDateKey.get(group.dateKey)
                const dailyPreviewDate = dailyPreview ? parseForecastTime(dailyPreview.time) : null
                const isSelected = index === selectedDayIndex
                const previewColor = dailyPreview?.aqi_color || preview?.aqiColor
                const dayName = dailyPreviewDate
                  ? dailyPreviewDate.toLocaleDateString(undefined, { weekday: "short" })
                  : first?.dayName
                const dayNumber = dailyPreviewDate
                  ? dailyPreviewDate.toLocaleDateString(undefined, { day: "2-digit" })
                  : first?.dayNumber
                return (
                  <button
                    key={group.dateKey}
                    type="button"
                    onClick={() => setSelectedDayIndex(index)}
                    className={[
                      "flex h-12 min-w-[62px] shrink-0 items-center justify-center gap-1 rounded-full border px-2 text-xs font-semibold transition-colors",
                      isSelected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                    ].join(" ")}
                    title={
                      dailyPreviewDate
                        ? dailyPreviewDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
                        : first?.dayLabel
                    }
                  >
                    <span>{dayName}</span>
                    <span>{dayNumber}</span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: normalizeHexColor(previewColor, "#F59E0B") }}
                    />
                  </button>
                )
              })}
            </div>

            <div className="px-3 py-3">
              <div className="mb-3 grid grid-cols-4 gap-1 rounded-[8px] bg-slate-100 p-1">
                {visualizationOptions.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setVisualization(id)}
                    className={[
                      "flex min-w-0 items-center justify-center gap-1 rounded-[6px] px-1.5 py-1.5 text-[10px] font-semibold transition-colors",
                      visualization === id
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                    ].join(" ")}
                    aria-pressed={visualization === id}
                    title={`${label} visualization`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>

              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-950">{selectedDayLabel}</div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase text-slate-500">
                    <Pm25Label /> hourly concentration
                  </div>
                </div>
                
              </div>

              {visualization === "calendar" ? (
                <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-2">
                  <div className="mb-1 grid grid-cols-[34px_repeat(24,minmax(7px,1fr))] gap-[2px] text-[7px] text-slate-500">
                    <span />
                    {Array.from({ length: 24 }, (_, hour) => (
                      <span key={`calendar-hour-${hour}`} className="text-center">{hour % 6 === 0 ? hour : ""}</span>
                    ))}
                  </div>
                  <div className="space-y-[3px]">
                    {dailyGroups.map((group, index) => {
                      const rowsByHour = new Map(group.rows.map((row) => [row.hour, row]))
                      return (
                        <button
                          key={`calendar-${group.dateKey}`}
                          type="button"
                          onClick={() => setSelectedDayIndex(index)}
                          className="grid w-full grid-cols-[34px_repeat(24,minmax(7px,1fr))] gap-[2px]"
                          aria-label={`Select ${group.rows[0]?.fullDateLabel || group.dateKey}`}
                        >
                          <span className={`truncate pr-1 text-left text-[8px] font-semibold ${index === selectedDayIndex ? "text-blue-700" : "text-slate-600"}`}>
                            {group.rows[0]?.dayName || group.dateKey.slice(5)}
                          </span>
                          {Array.from({ length: 24 }, (_, hour) => {
                            const row = rowsByHour.get(hour)
                            const isCurrent =
                              !!row && !!currentCalendarPoint && row.time === currentCalendarPoint.time
                            return (
                              <span
                                key={`${group.dateKey}-${hour}`}
                                className={[
                                  "relative h-3 rounded-[2px]",
                                  index === selectedDayIndex ? "ring-1 ring-blue-600/40" : "",
                                  isCurrent
                                    ? "z-10 scale-125 ring-2 ring-slate-950 ring-offset-1 ring-offset-slate-50 shadow-md"
                                    : "",
                                ].join(" ")}
                                style={{ backgroundColor: row ? getAqiColorByPm25(row.pm25, row.aqiCategory, row.aqiColor) : "#E2E8F0" }}
                                title={row ? `${row.label}: ${formatForecastMetricWithUnit(row.pm25, 1, PM25_UNIT_TEXT)}` : `${hour}:00: no data`}
                                onMouseEnter={() => setHoveredPm25Point(row && typeof row.pm25 === "number" ? row : null)}
                                onMouseLeave={() => setHoveredPm25Point(null)}
                              />
                            )
                          })}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[8px] text-slate-500">
                    <span>Midnight</span><span>Hour of day</span><span>23:00</span>
                  </div>
                </div>
              ) : visualization === "sundial" ? (
                <div className="relative mx-auto h-[190px] max-w-[260px]">
                  <svg viewBox="0 0 220 190" className="h-full w-full" role="img" aria-label={`${selectedDayLabel} PM2.5 sundial`}>
                    <circle
                      cx="110"
                      cy="96"
                      r="70"
                      fill={hexToRgba(sundialAqiColor, 0.16)}
                      stroke={sundialAqiColor}
                      strokeOpacity="0.48"
                    />
                    <defs>
                      <clipPath id="sundialClockFace">
                        <circle cx="110" cy="96" r="68" />
                      </clipPath>
                    </defs>
                    <image
                      href={sundialAqiImage}
                      x="55"
                      y="41"
                      width="110"
                      height="110"
                      opacity="0.2"
                      preserveAspectRatio="xMidYMid meet"
                      clipPath="url(#sundialClockFace)"
                    />
                    <circle cx="110" cy="96" r="47" fill="none" stroke="#E2E8F0" strokeDasharray="3 3" />
                    {Array.from({ length: 24 }, (_, hour) => {
                      const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2
                      return <line key={`dial-tick-${hour}`} x1={110 + Math.cos(angle) * 64} y1={96 + Math.sin(angle) * 64} x2={110 + Math.cos(angle) * (hour % 6 === 0 ? 75 : 70)} y2={96 + Math.sin(angle) * (hour % 6 === 0 ? 75 : 70)} stroke="#94A3B8" strokeWidth={hour % 6 === 0 ? 1.5 : 0.7} />
                    })}
                    {isSelectedDayToday && currentHourAngle !== null && currentMinuteAngle !== null ? (
                      <g>
                        <line
                          x1="110"
                          y1="96"
                          x2={110 + Math.cos(currentHourAngle) * 42}
                          y2={96 + Math.sin(currentHourAngle) * 42}
                          stroke="#0F172A"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <line
                          x1="110"
                          y1="96"
                          x2={110 + Math.cos(currentMinuteAngle) * 58}
                          y2={96 + Math.sin(currentMinuteAngle) * 58}
                          stroke="#2563EB"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <title>
                          {`Current time: ${currentTime?.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`}
                        </title>
                      </g>
                    ) : null}
                    {dayRows.map((row) => {
                      const angle = (row.hour / 24) * Math.PI * 2 - Math.PI / 2
                      const radius = 22 + ((row.pm25 ?? 0) / sundialMaxPm25) * 45
                      return (
                        <circle
                          key={`dial-point-${row.time}`}
                          cx={110 + Math.cos(angle) * radius}
                          cy={96 + Math.sin(angle) * radius}
                          r="4"
                          fill={getAqiColorByPm25(row.pm25, row.aqiCategory, row.aqiColor)}
                          stroke="white"
                          strokeWidth="1.5"
                          onMouseEnter={() => setHoveredPm25Point(row)}
                          onMouseLeave={() => setHoveredPm25Point(null)}
                        >
                          <title>{`${row.label}: ${formatForecastMetricWithUnit(row.pm25, 1, PM25_UNIT_TEXT)}`}</title>
                        </circle>
                      )
                    })}
                    {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => {
                      const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2
                      return (
                        <text
                          key={`dial-label-${hour}`}
                          x={110 + Math.cos(angle) * 84}
                          y={99 + Math.sin(angle) * 84}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="600"
                          fill="#475569"
                        >
                          {hour}
                        </text>
                      )
                    })}
                    {isSelectedDayToday && currentTime ? (
                      <circle cx="110" cy="96" r="3.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                    ) : null}
                    {displayedPm25Point ? (
                      <>
                        <text x="110" y="92" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0F172A">
                          {formatForecastMetricWithUnit(displayedPm25Point.pm25, 1, PM25_UNIT_TEXT)}
                        </text>
                        <text x="110" y="106" textAnchor="middle" fontSize="8" fill="#64748B">
                          {displayedPm25Point.label}
                        </text>
                      </>
                    ) : null}
                  </svg>
                </div>
              ) : (
                <div className="h-[178px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {visualization === "bars" ? (
                      <BarChart data={lineRows} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} onMouseMove={updateHoveredPm25Point} onMouseLeave={() => setHoveredPm25Point(null)}>
                        <CartesianGrid stroke="#D7DEE8" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="time"
                          type="number"
                          scale="time"
                          domain={["dataMin", "dataMax"]}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                          tick={{ fontSize: 8, fill: "#334155" }}
                          tickFormatter={(value: any) => {
                            const date = new Date(value)
                            return date.getHours() === 0
                              ? date.toLocaleDateString(undefined, { weekday: "short" })
                              : date.toLocaleTimeString(undefined, { hour: "2-digit" })
                          }}
                        />
                        <YAxis domain={linePm25Axis.domain} ticks={linePm25Axis.ticks} tickLine={false} axisLine={false} tick={{ fontSize: 8, fill: "#334155" }} />
                        <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} formatter={(value: any) => [`${Number(value).toFixed(1)} ${PM25_UNIT_TEXT}`, <Pm25Label key="pm25" />]} labelFormatter={(value: any) => new Date(value).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })} />
                        <Bar dataKey="pm25" radius={[3, 3, 0, 0]}>
                          {lineRows.map((row) => <Cell key={`bar-${row.time}`} fill={getAqiColorByPm25(row.pm25, row.aqiCategory, row.aqiColor)} />)}
                        </Bar>
                      </BarChart>
                    ) : (
                      <AreaChart data={lineRows} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} onMouseMove={updateHoveredPm25Point} onMouseLeave={() => setHoveredPm25Point(null)}>
                        <defs>
                          <linearGradient id="hourlyPm25Fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#64748B" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#CBD5E1" stopOpacity={0.08} />
                          </linearGradient>
                          <linearGradient id="hourlyPm25Stroke" x1="0" y1="0" x2="1" y2="0">
                            {hourlyAqiGradientStops.map((stop, index) => <stop key={`aqi-stop-${index}`} offset={stop.offset} stopColor={stop.color} />)}
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#D7DEE8" strokeDasharray="3 3" vertical />
                        <XAxis
                          dataKey="time"
                          type="number"
                          scale="time"
                          domain={["dataMin", "dataMax"]}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                          tick={{ fontSize: 8, fill: "#334155" }}
                          tickFormatter={(value: any) => {
                            const date = new Date(value)
                            return date.getHours() === 0
                              ? date.toLocaleDateString(undefined, { weekday: "short" })
                              : date.toLocaleTimeString(undefined, { hour: "2-digit" })
                          }}
                        />
                        <YAxis domain={linePm25Axis.domain} ticks={linePm25Axis.ticks} tickLine={false} axisLine={false} tick={{ fontSize: 8, fill: "#334155" }} />
                        <Tooltip contentStyle={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }} cursor={{ stroke: "rgba(15, 23, 42, 0.18)", strokeWidth: 1 }} labelFormatter={(value: any) => new Date(value).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })} formatter={(value: any) => typeof value === "number" ? [`${value.toFixed(1)} ${PM25_UNIT_TEXT}`, <Pm25Label key="pm25" />] : [value, <Pm25Label key="pm25" />]} />
                        <Area
                          type="monotone"
                          dataKey="pm25"
                          stroke="url(#hourlyPm25Stroke)"
                          fill="url(#hourlyPm25Fill)"
                          strokeWidth={2.5}
                          dot={(props: any) => {
                            const row = props.payload
                            return row && typeof row.pm25 === "number"
                              ? <circle cx={props.cx} cy={props.cy} r={2.5} fill={getAqiColorByPm25(row.pm25, row.aqiCategory, row.aqiColor)} stroke="#FFFFFF" strokeWidth={1} />
                              : <g />
                          }}
                        />
                        <Line type="monotone" dataKey="q10" stroke="#94A3B8" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                        <Line type="monotone" dataKey="q90" stroke="#94A3B8" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}

              {displayedPm25Point?.aqiLabel ? (
                <div
                  className="mt-3 rounded-[8px] border px-3 py-2 text-xs leading-relaxed text-slate-700"
                  style={{
                    borderColor: hexToRgba(
                      getAqiColorByPm25(
                        displayedPm25Point.pm25,
                        displayedPm25Point.aqiCategory,
                        displayedPm25Point.aqiColor,
                      ),
                      0.3,
                    ),
                    backgroundColor: hexToRgba(
                      getAqiColorByPm25(
                        displayedPm25Point.pm25,
                        displayedPm25Point.aqiCategory,
                        displayedPm25Point.aqiColor,
                      ),
                      0.08,
                    ),
                  }}
                >
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                    Health guidance
                  </div>
                  {displayedPm25Point.aqiLabel}
                </div>
              ) : null}

              {hasTemperatureOrHumidity ? (
                <div className="mt-3 h-[94px] border-t border-slate-200 pt-2">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-slate-700">
                    {tempValues.length ? <span>Temperature (C)</span> : <span />}
                    {humidityValues.length ? <span>Relative Humidity (%)</span> : null}
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={metRows} margin={{ top: 2, right: -10, left: -24, bottom: 0 }}>
                      <XAxis dataKey="time" type="number" scale="time" domain={["dataMin", "dataMax"]} hide />
                      <YAxis yAxisId="temp" hide domain={tempValues.length ? ["dataMin - 2", "dataMax + 2"] : [0, 40]} />
                      <YAxis yAxisId="humidity" hide orientation="right" domain={humidityValues.length ? [0, 100] : [0, 100]} />
                      <Tooltip
                        labelFormatter={(value: any) =>
                          new Date(value).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })
                        }
                        formatter={(value: any, name: any) => {
                          if (typeof value !== "number") return [value, name]
                          return name === "air_temperature" ? [`${value.toFixed(1)} C`, "Temperature"] : [`${value.toFixed(0)}%`, "Humidity"]
                        }}
                      />
                      {humidityValues.length ? (
                        <Area yAxisId="humidity" type="monotone" dataKey="relative_humidity" stroke="#06B6D4" fill="#BAE6FD" fillOpacity={0.55} dot={false} strokeWidth={1.6} />
                      ) : null}
                      {tempValues.length ? (
                        <Line yAxisId="temp" type="monotone" dataKey="air_temperature" stroke="#EA580C" dot={false} strokeWidth={1.8} />
                      ) : null}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : null}

              {hasWindData ? (
                <div className="mt-3 border-t border-slate-200 pt-2">
                  <div className="mb-1 text-[10px] font-semibold text-slate-700">Wind</div>
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(windRows.length, 1)}, minmax(10px, 1fr))` }}>
                    {windRows.map((item) => {
                      const degrees = compassDegrees[(item.windDirection || "").toUpperCase()] ?? 0
                      return (
                        <div key={`wind-${item.time}`} className="flex min-w-0 flex-col items-center gap-0.5 text-[9px] text-slate-600">
                          <span className="inline-block leading-none text-slate-800" style={{ transform: `rotate(${degrees}deg)` }}>^</span>
                          {typeof item.wind_speed === "number" ? <span>{item.wind_speed.toFixed(0)}</span> : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {hasPrecipitationData ? (
                <div className="mt-3 border-t border-slate-200 pt-2">
                  <div className="mb-1 text-[10px] font-semibold text-slate-700">Precipitation</div>
                  <div className="grid h-8 items-end gap-1 border-b border-slate-200" style={{ gridTemplateColumns: `repeat(${Math.max(precipitationRows.length, 1)}, minmax(10px, 1fr))` }}>
                    {precipitationRows.map((item) => (
                      <div
                        key={`rain-${item.time}`}
                        className="min-h-[2px] rounded-t bg-blue-500"
                        style={{ height: `${maxRain > 0 ? Math.max(2, (item.precipitationBar / maxRain) * 28) : 2}px`, opacity: item.precipitationBar > 0 ? 0.8 : 0.25 }}
                        title={`${item.label}: ${formatForecastMetricWithUnit(item.precipitation_amount, 1, "mm")}`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HourlyForecastToggle({
  enabled,
  onEnabledChange,
}: {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}) {
  return (
    <div
      className={[
        "rounded-[8px] border px-3 py-2 transition-colors",
        enabled ? "border-blue-500 bg-blue-600" : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="hourly-forecast-toggle" className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-blue-50 text-blue-700">
            <Clock3 className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className={["block text-sm font-semibold", enabled ? "text-white" : "text-slate-950"].join(" ")}>
              Hourly forecast
            </span>
            <span className={["block text-xs", enabled ? "text-blue-50" : "text-slate-500"].join(" ")}>
              {enabled ? "Daily cards open hourly details" : "Daily cards only change the selected day"}
            </span>
          </span>
        </label>
        <Switch
          id="hourly-forecast-toggle"
          checked={enabled}
          onCheckedChange={onEnabledChange}
          className="rounded-full border-amber-400 bg-amber-400 focus-visible:ring-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:border-amber-400 data-[state=unchecked]:bg-amber-400 [&>span]:rounded-full [&>span]:bg-white [&>span]:shadow-sm"
          aria-label="Toggle hourly forecast"
        />
      </div>
    </div>
  )
}

function ForecastContent({
  selectedNode,
  forecasts,
  hourlyState,
  hourlyForecastEnabled,
  onHourlyForecastEnabledChange,
  onHourlyForecastRequest,
}: {
  selectedNode: MapNode | null
  forecasts: DailyForecastItem[]
  hourlyState: HourlyForecastState
  hourlyForecastEnabled: boolean
  onHourlyForecastEnabledChange: (enabled: boolean) => void
  onHourlyForecastRequest: (request: HourlyForecastRequest) => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [hourlyOpen, setHourlyOpen] = useState(false)
  const [hourlyDateKey, setHourlyDateKey] = useState<string | undefined>(undefined)
  const [historicalState, setHistoricalState] = useState<{
    isLoading: boolean
    error: string | null
    mode: HistoricalSeriesMode
    points: HistoricalSeriesPoint[] | null
    stats: null | {
      samples: number
      days: number
      avg: number
      min: number
      max: number
      latestTime: Date | null
      latestPm25: number | null
    }
  }>({
    isLoading: false,
    error: null,
    mode: "daily",
    points: null,
    stats: null,
  })

  useEffect(() => {
    setActiveIndex(0)
    setInsightsOpen(false)
    setHourlyOpen(false)
    setHourlyDateKey(undefined)
    setHistoricalState({ isLoading: false, error: null, mode: "daily", points: null, stats: null })
  }, [selectedNode?.site_id])

  useEffect(() => {
    const siteId = selectedNode?.site_id
    if (!insightsOpen || !siteId) return

    let isActive = true
    setHistoricalState({ isLoading: true, error: null, mode: "daily", points: null, stats: null })

    const { startIso, endIso } = getLastNDaysRangeIso(7)

    getSiteHistorical(siteId, startIso, endIso)
      .then((rows) => {
        if (!isActive) return
        if (!rows?.length) {
          setHistoricalState({ isLoading: false, error: "No historical data returned for this site.", mode: "daily", points: null, stats: null })
          return
        }

        const samples = rows.length
        const days = uniqueDayCount(rows)

        const values = rows
          .map((r) => extractHistoricalPm25(r))
          .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
        const min = values.length ? Math.min(...values) : 0
        const max = values.length ? Math.max(...values) : 0

        const sortedHourly = buildHourlySeries(rows)
        const latest = sortedHourly.length ? sortedHourly[sortedHourly.length - 1] : null

        const mode: HistoricalSeriesMode = days >= 3 ? "daily" : "hourly"
        const points: HistoricalSeriesPoint[] =
          mode === "daily"
            ? buildLast7DaysDailyAverage(rows).map((p) => ({ x: p.date, pm25: p.pm25 }))
            : sortedHourly

        if (!points.length) {
          setHistoricalState({ isLoading: false, error: "No historical data returned for this site.", mode, points: null, stats: null })
          return
        }

        setHistoricalState({
          isLoading: false,
          error: null,
          mode,
          points,
          stats: {
            samples,
            days,
            avg,
            min,
            max,
            latestTime: latest?.x ?? null,
            latestPm25: latest?.pm25 ?? null,
          },
        })
      })
      .catch((error) => {
        if (!isActive) return
        console.error(error)
        setHistoricalState({ isLoading: false, error: "Failed to load historical data.", mode: "daily", points: null, stats: null })
      })

    return () => {
      isActive = false
    }
  }, [insightsOpen, selectedNode?.site_id])

  const percentChange = selectedNode?.averages?.percentageDifference

  const percentText =
    typeof percentChange === "number" && Number.isFinite(percentChange)
      ? `${percentChange > 0 ? "+" : ""}${percentChange.toFixed(1)}%`
      : "N/A"
  const percentClass =
    typeof percentChange === "number" && Number.isFinite(percentChange)
      ? percentChange > 0
        ? "text-red-600"
        : percentChange < 0
          ? "text-green-600"
          : "text-gray-600"
      : "text-gray-600"

  const active = forecasts[activeIndex] || forecasts[0]
  const dt = active ? parseForecastTime(active.time) : null
  const activeLabel = dt ? dt.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) : ""
  const hourlySpikePoint = useMemo(() => {
    if (!dt || !hourlyState.site?.forecasts?.length) return null

    const dayStart = getStartOfLocalDayMs(dt)
    const dayEnd = dayStart + 24 * 60 * 60 * 1000

    return hourlyState.site.forecasts.reduce<{ time: Date; pm25: number } | null>((highest, forecast) => {
      const forecastTime = parseForecastTime(forecast.timestamp)
      const pm25 = getForecastNumber(forecast.forecast.pm2_5_mean)

      if (!forecastTime || pm25 === null) return highest
      const timestamp = forecastTime.getTime()
      if (timestamp < dayStart || timestamp >= dayEnd) return highest
      if (!highest || pm25 > highest.pm25) return { time: forecastTime, pm25 }

      return highest
    }, null)
  }, [dt, hourlyState.site])
  const hourlySpikeTimeText = hourlySpikePoint
    ? hourlySpikePoint.time.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : null
  const activeAccentColor = normalizeHexColor(active?.aqi_color)
  const activeBadgeStyle = getAqiBadgeStyle(active?.aqi_category, activeAccentColor)
  const activeAqiCategory = active?.aqi_category || "Unknown"
  const activeDateFontSize = activeLabel.length > 18 ? "11px" : "12px"
  const activeAqiFontSize = activeAqiCategory.length > 28 ? "9.5px" : activeAqiCategory.length > 20 ? "10.5px" : "12px"
  const createdAt = active?.created_at ? parseForecastTime(active.created_at) : null
  const rangeLow = typeof active?.pm2_5_low === "number" && Number.isFinite(active.pm2_5_low) ? active.pm2_5_low : null
  const rangeHigh = typeof active?.pm2_5_high === "number" && Number.isFinite(active.pm2_5_high) ? active.pm2_5_high : null
  const rangeMaxValue = Math.max(
    typeof active?.pm2_5_max === "number" && Number.isFinite(active.pm2_5_max) ? active.pm2_5_max : 0,
    typeof active?.pm2_5 === "number" && Number.isFinite(active.pm2_5) ? active.pm2_5 : 0,
    rangeHigh ?? 0,
    10,
  )
  const lowPosition = rangeLow === null ? 0 : clampNumber((rangeLow / rangeMaxValue) * 100, 0, 100)
  const highPosition = rangeHigh === null ? lowPosition : clampNumber((rangeHigh / rangeMaxValue) * 100, 0, 100)
  const rangeStart = Math.min(lowPosition, highPosition)
  const rangeWidth = Math.max(Math.abs(highPosition - lowPosition), 6)
  const meanPosition =
    typeof active?.pm2_5 === "number" && Number.isFinite(active.pm2_5)
      ? clampNumber((active.pm2_5 / rangeMaxValue) * 100, 0, 100)
      : null
  const confidenceRaw =
    typeof active?.forecast_confidence === "number" && Number.isFinite(active.forecast_confidence)
      ? active.forecast_confidence
      : null
  const confidencePercent =
    confidenceRaw === null ? null : clampNumber(confidenceRaw <= 1 ? confidenceRaw * 100 : confidenceRaw, 0, 100)
  const confidenceText = confidencePercent === null ? "N/A" : `${confidencePercent.toFixed(0)}%`
  const pm25MeanText = formatForecastMetric(active?.pm2_5, 1)
  const confidenceRangeText =
    rangeLow !== null && rangeHigh !== null
      ? `${formatForecastMetric(Math.min(rangeLow, rangeHigh), 1)} - ${formatForecastMetric(
          Math.max(rangeLow, rangeHigh),
          1,
        )} ${PM25_UNIT_TEXT}`
      : null
  const metricCards: Array<{ label: string; value: string; Icon: LucideIcon; span?: string }> = []

  const openHourlyForecast = (forecast: DailyForecastItem, index: number) => {
    const forecastDate = parseForecastTime(forecast.time)
    const dateKey = forecastDate ? formatLocalDateKey(forecastDate) : undefined
    setActiveIndex(index)
    setHourlyDateKey(dateKey)
    if (hourlyForecastEnabled && selectedNode?.site_id && dateKey) {
      onHourlyForecastRequest({ siteId: selectedNode.site_id })
      setHourlyOpen(true)
    }
  }

  useEffect(() => {
    if (!hourlyForecastEnabled) {
      setHourlyOpen(false)
    }
  }, [hourlyForecastEnabled])

  if (hasForecastMetricValue(active?.air_temperature)) {
    metricCards.push({
      label: "Temperature",
      value: formatForecastMetricWithUnit(active?.air_temperature, 1, "°C"),
      Icon: Thermometer,
    })
  }

  if (hasForecastMetricValue(active?.precipitation_amount)) {
    metricCards.push({
      label: "Rain",
      value: formatForecastMetricWithUnit(active?.precipitation_amount, 1, "mm"),
      Icon: CloudRain,
    })
  }

  if (hasForecastMetricValue(active?.relative_humidity)) {
    metricCards.push({
      label: "Humidity",
      value: formatForecastMetric(active?.relative_humidity, 0, "%"),
      Icon: Droplets,
    })
  }

  if (hasForecastMetricValue(active?.air_pressure_at_sea_level)) {
    metricCards.push({
      label: "Sea-level pressure",
      value: formatForecastMetricWithUnit(active?.air_pressure_at_sea_level, 0, "hPa"),
      Icon: Gauge,
    })
  }

  if (hasForecastMetricValue(active?.cloud_area_fraction)) {
    metricCards.push({
      label: "Cloud cover",
      value: formatForecastMetric(active?.cloud_area_fraction, 0, "%"),
      Icon: Cloud,
    })
  }

  if (hasForecastMetricValue(active?.wind_speed)) {
    metricCards.push({
      label: "Wind",
      Icon: Wind,
      value: `${formatForecastMetric(active?.wind_speed, 1)} m/s${
        active?.wind_direction_compass ? ` ${active.wind_direction_compass}` : ""
      }`,
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">7 days forecast outlook</div>
        </div>
        <div className="mb-3">
          <HourlyForecastToggle
            enabled={hourlyForecastEnabled}
            onEnabledChange={onHourlyForecastEnabledChange}
          />
        </div>
        <div className="forecast-strip flex gap-3 overflow-x-auto rounded-[8px] bg-[#F6F7FB] px-2 py-3 pb-4">
          {forecasts.slice(0, 14).map((f, idx) => (
            <ForecastDayPill
              key={`${f.time}-${idx}`}
              item={f}
              isActive={idx === activeIndex}
              onClick={() => openHourlyForecast(f, idx)}
            />
          ))}
        </div>
      </div>

      {hourlyOpen ? (
        <div className="fixed inset-0 z-[1300] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[8px] bg-white shadow-2xl sm:max-w-[430px] sm:rounded-[8px]">
            <HourlyForecastPanel
              hourlyState={hourlyState}
              dailyForecasts={forecasts}
              initialDateKey={hourlyDateKey}
              onClose={() => setHourlyOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {active ? (
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5">
              <div
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium leading-none text-slate-600"
                style={{ fontSize: activeDateFontSize }}
              >
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{activeLabel}</span>
              </div>
              <div
                className="inline-flex min-w-0 items-center justify-self-end gap-1.5 rounded-full border px-2.5 py-1.5 font-semibold leading-none shadow-sm"
                style={{
                  borderColor: activeBadgeStyle.borderColor,
                  backgroundColor: activeBadgeStyle.backgroundColor,
                  color: activeBadgeStyle.color,
                  fontSize: activeAqiFontSize,
                }}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activeBadgeStyle.dotColor }} />
                <span className="min-w-0 truncate whitespace-nowrap">{activeAqiCategory}</span>
              </div>
            </div>
            {active.aqi_label ? (
              <div
                className="rounded-[8px] border px-3 py-2 text-xs leading-relaxed text-slate-700"
                style={{
                  borderColor: hexToRgba(activeBadgeStyle.dotColor, 0.3),
                  backgroundColor: hexToRgba(activeBadgeStyle.dotColor, 0.08),
                }}
              >
                <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                  Health guidance
                </div>
                {active.aqi_label}
              </div>
            ) : null}
            <div className="grid grid-cols-[minmax(4.8rem,1.15fr)_minmax(5.45rem,1.2fr)_minmax(4.7rem,0.9fr)_minmax(4.45rem,0.85fr)] gap-x-2 gap-y-2">
              <div className="min-w-0">
                <div className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-500 sm:text-[11px]">
                  Average <br></br> <Pm25Label />
                </div>
                <div className="mt-1 whitespace-nowrap text-[clamp(0.75rem,2.7vw,0.875rem)] font-semibold text-slate-950">{pm25MeanText}</div>
                <div className="text-xs font-medium text-slate-500"><Pm25Unit /></div>
              </div>
              <div className="min-w-0">
                <div className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-500 sm:text-[11px]">Expected <br></br> Range</div>
                <div className="mt-1 whitespace-nowrap text-[clamp(0.75rem,2.7vw,0.875rem)] font-semibold text-slate-950">
                  {formatForecastMetric(active.pm2_5_low, 1)} - {formatForecastMetric(active.pm2_5_high, 1)}
                </div>
                <div className="text-xs font-medium text-slate-500"><Pm25Unit /></div>
              </div>
              <div className="min-w-0">
                <div className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-500 sm:text-[11px]">Expected <br></br> Peak </div>
                <div className="mt-1 whitespace-nowrap text-[clamp(0.75rem,2.7vw,0.875rem)] font-semibold text-slate-950">{formatForecastMetric(active.pm2_5_max, 1)}</div>
                <div className="text-xs font-medium text-slate-500"><Pm25Unit /></div>
              </div>
              <div className="min-w-0">
                <div className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.04em] text-slate-500 sm:text-[11px]">WEEKLY <br></br> Change</div>
                <div className={["mt-1 whitespace-nowrap text-[clamp(0.75rem,2.7vw,0.875rem)] font-semibold", percentClass].join(" ")}>{percentText}</div>
              </div>
            </div>
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                    Forecast confidence
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-slate-600">
                    Probability <Pm25Label /> remains within {confidenceRangeText ?? "the forecast range"}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-950">{confidenceText}</div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${confidencePercent ?? 0}%`,
                    backgroundColor: activeBadgeStyle.dotColor,
                  }}
                />
              </div>
            </div>
            {createdAt ? (
              <div className="text-[11px] font-medium text-slate-200">
                Updated {createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at{" "}
                {createdAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {active && metricCards.length ? (
        <div className="rounded-[8px] border border-slate-200 bg-[#F8FAFC] p-3">
          <div className="mb-2 text-xs font-semibold text-slate-900">Meteorological conditions</div>
          <div className="forecast-strip flex gap-1.5 overflow-x-auto pb-1">
            {metricCards.map((metric) => (
              <div
                key={metric.label}
                className="w-[58px] shrink-0 rounded-[8px] border border-slate-200 bg-white px-1.5 py-1.5"
                aria-label={`${metric.label}: ${metric.value}`}
                title={metric.label}
              >
                <div className="flex items-center justify-center">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-[5px] bg-slate-100 text-slate-600">
                    <metric.Icon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="sr-only">{metric.label}</span>
                </div>
                <div className="mt-1 min-w-0 break-words text-center text-[clamp(8px,2.2vw,10px)] font-semibold leading-tight text-slate-950">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-[8px] border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setInsightsOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3"
          aria-expanded={insightsOpen}
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Wind className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-gray-900">
              <Pm25Label /> Trend
            </span>
          </div>
          {insightsOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </button>

        {insightsOpen ? (
          <div className="border-t px-4 py-4">
            {historicalState.stats ? (
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-[8px] bg-slate-50 px-3 py-2">
                  <div className="text-xs font-medium text-slate-500">7-day avg</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">{historicalState.stats.avg.toFixed(1)} <Pm25Unit /></div>
                </div>
                <div className="rounded-[8px] bg-slate-50 px-3 py-2">
                  <div className="text-xs font-medium text-slate-500">Observed range</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">
                    {historicalState.stats.min.toFixed(1)} - {historicalState.stats.max.toFixed(1)}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="text-xs text-gray-500">
              <Pm25Label /> (<Pm25Unit />)
            </div>
            <div className="mt-2 h-[170px]">
              {historicalState.isLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-600">Loading...</div>
              ) : historicalState.error ? (
                <div className="flex h-full items-center justify-center text-sm text-red-700">{historicalState.error}</div>
              ) : !historicalState.points?.length ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-600">No data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {(() => {
                    const yValues = historicalState.points
                      ?.map((p) => p.pm25)
                      .filter((v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 500) // clamp to realistic PM2.5 range
                    const max = yValues?.length ? Math.max(...yValues) : 0
                    const yMax = Math.max(10, Math.ceil(max / 5) * 5)

                    return (
                      <AreaChart data={historicalState.points} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pm25Fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="x"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={(d: any) => {
                        const dt = d instanceof Date ? d : new Date(d)
                        return historicalState.mode === "hourly"
                          ? dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
                          : dt.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickMargin={8}
                      width={44}
                      domain={[0, yMax]}
                      tickCount={5}
                      tickFormatter={(v: any) => (typeof v === "number" ? v.toFixed(0) : v)}
                    />
                    <Tooltip
                      formatter={(v: any) => [`${typeof v === "number" ? v.toFixed(1) : v}`, <Pm25Label key="pm25" />]}
                      labelFormatter={(d: any) => {
                        const dt = d instanceof Date ? d : new Date(d)
                        return historicalState.mode === "hourly"
                          ? dt.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pm25"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#pm25Fill)"
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                      </AreaChart>
                    )
                  })()}
                </ResponsiveContainer>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// Create a component for the map nodes
const MapNodes: React.FC<{
  onLoadingChange: (state: LoadingState) => void
  showEmojis: boolean
  onNodeSelect: (node: MapNode) => void
}> = ({ onLoadingChange, showEmojis, onNodeSelect }) => {
  const map = useMap()
  const [nodes, setNodes] = useState<MapNode[]>([])
  const markersRef = useRef<L.Marker[]>([])
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Validate node data
  const isValidNode = (node: MapNode): boolean => {
    return !!(
      node &&
      node.siteDetails?.approximate_latitude &&
      node.siteDetails?.approximate_longitude &&
      node.siteDetails?.name &&
      node.pm2_5?.value !== undefined
    )
  }

  useEffect(() => {
    let isActive = true

    const fetchNodes = async () => {
      let hasUsableCachedNodes = false

      try {
        onLoadingChange({ isLoading: true, error: null })

        const cached = await readBrowserApiCache<BrowserApiCacheEntry<MapNode[]>>(MAP_NODES_CACHE_KEY)
        if (isActive && isBrowserApiCacheFresh(cached, MAP_API_CACHE_MAX_AGE_MS) && cached.data.length) {
          const validCachedNodes = cached.data.filter(isValidNode)
          if (validCachedNodes.length) {
            hasUsableCachedNodes = true
            setNodes(validCachedNodes)
            onLoadingChange({ isLoading: false, error: null })
          }
        }

        const data = (await getMapNodes()) as MapNode[] | null
        if (!isActive) return

        if (data) {
          const validNodes = data.filter(isValidNode)
          if (validNodes.length === 0) {
            if (!hasUsableCachedNodes) {
              onLoadingChange({
                isLoading: false,
                error: "No valid data points found",
              })
            }
            return
          }
          setNodes(validNodes)
          writeBrowserApiCache(MAP_NODES_CACHE_KEY, data).catch((error) => {
            console.warn("Unable to cache map nodes:", error)
          })
          onLoadingChange({ isLoading: false, error: null })
        } else {
          onLoadingChange(
            hasUsableCachedNodes
              ? { isLoading: false, error: null }
              : {
                  isLoading: false,
                  error: "Failed to load map data",
                },
          )
        }
      } catch (error) {
        if (!isActive) return
        console.error("Error fetching nodes:", error)
        onLoadingChange(
          hasUsableCachedNodes
            ? { isLoading: false, error: null }
            : {
                isLoading: false,
                error: "Error loading map data",
              },
        )
      }
    }

    fetchNodes()

    return () => {
      isActive = false
      markersRef.current.forEach((marker) => marker.remove())
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [map, onLoadingChange])

  useEffect(() => {
    if (!nodes.length) return

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      if (showEmojis) {
        nodes.forEach((node) => {
          try {
            const latitude = node?.siteDetails?.approximate_latitude
            const longitude = node?.siteDetails?.approximate_longitude
            const siteName =
              node?.siteDetails?.name ||
              node?.siteDetails?.formatted_name ||
              node?.siteDetails?.location_name ||
              "Unknown Location"
            const pm25Value = node?.pm2_5?.value
            const timestamp = node?.time
            const aqiCategory = node?.aqi_category ?? "Unknown"

            if (
              typeof latitude !== "number" ||
              !Number.isFinite(latitude) ||
              typeof longitude !== "number" ||
              !Number.isFinite(longitude) ||
              pm25Value === undefined
            ) {
              console.warn("Skipping node due to missing data:", node._id)
              return
            }

            // Create custom icon for the marker
            const customIcon = getCustomIcon(aqiCategory)
            const marker = L.marker([latitude, longitude], {
              icon: customIcon,
              opacity: 1, // Ensure emoji is always visible
            }).addTo(map)

            // Create a container for the popup
            const container = document.createElement("div")
            const root = ReactDOM.createRoot(container)
            let isRootUnmountScheduled = false

            const scheduleRootUnmount = () => {
              if (isRootUnmountScheduled) return
              isRootUnmountScheduled = true

              window.setTimeout(() => {
                root.unmount()
              }, 0)
            }

            // Bind popup but don't open it automatically
            root.render(
              <PopupContent
                label={siteName}
                data={{
                  pm2_5_prediction: pm25Value ?? undefined,
                  timestamp: timestamp ?? undefined,
                  aqi_category: aqiCategory,
                  aqi_color: node?.aqi_color,
                }}
                onClose={() => {
                  marker.closePopup()
                }}
              />,
            )

            marker.bindPopup(container, {
              ...customPopupOptions,
              offset: L.point(0, -20),
            })

            // Leaflet emits "remove" synchronously, so wait until React finishes
            // the current render before releasing this independently-created root.
            marker.once("remove", scheduleRootUnmount)

            // Handle click to open popup
            marker.on("click", (e: any) => {
              try {
                L.DomEvent.stopPropagation(e)
              } catch {}
              onNodeSelect(node)

              // Zoom in and center on the selected site
              try {
                const currentZoom = map.getZoom()
                const targetZoom = Math.max(currentZoom, 11)
                map.flyTo([latitude, longitude], targetZoom, { animate: true, duration: 0.8 })
              } catch (error) {
                console.error("Error centering map on selected site:", error)
              }

              // Close other popups
              markersRef.current.forEach((m) => {
                if (m !== marker) {
                  m.closePopup()
                }
              })
              marker.openPopup()
            })

            // Handle hover to open popup and ensure emoji visibility
            marker.on("mouseover", () => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
                hoverTimeoutRef.current = null
              }
              marker.setOpacity(1) // Ensure emoji stays visible
              // Close other popups
              markersRef.current.forEach((m) => {
                if (m !== marker) {
                  m.closePopup()
                }
              })
              marker.openPopup()
            })

            // Handle mouseout to close popup with a delay
            marker.on("mouseout", () => {
              hoverTimeoutRef.current = setTimeout(() => {
                marker.closePopup()
              }, 100) // Small delay to prevent flickering
            })

            // Handle popup events to manage hover behavior
            marker.on("popupopen", () => {
              const popup = marker.getPopup()
              if (popup) {
                const popupElement = popup.getElement()
                if (popupElement) {
                  popupElement.addEventListener("mouseenter", () => {
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current)
                      hoverTimeoutRef.current = null
                    }
                    marker.setOpacity(1) // Keep emoji visible
                  })
                  popupElement.addEventListener("mouseleave", () => {
                    hoverTimeoutRef.current = setTimeout(() => {
                      marker.closePopup()
                    }, 100)
                  })
                }
              }
            })

            markersRef.current.push(marker)
          } catch (error) {
            console.error("Error creating marker for node:", node._id, error)
          }
        })
      }
    } catch (error) {
      console.error("Error updating markers:", error)
      onLoadingChange({
        isLoading: false,
        error: "Error displaying map markers",
      })
    }
  }, [nodes, map, onLoadingChange, showEmojis])

  return null
}

const ClearSelectionOnMapClick: React.FC<{ onClear: () => void }> = ({ onClear }) => {
  useMapEvents({
    click: () => {
      onClear()
    },
  })
  return null
}

const createFireIcon = () =>
  L.divIcon({
    className: "active-fire-marker",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #dc2626;
        background: rgba(255,255,255,0.94);
        border: 2px solid #fdba74;
        border-radius: 9999px;
        box-shadow: 0 2px 8px rgba(127,29,29,0.35);
      ">
        <svg
          aria-hidden="true"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="#f97316"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 22c4.97 0 8-3.58 8-8 0-3.5-2-6.5-5-9 .5 3-1 5-3 6-1-3-3-5-5-7 .5 4-3 6.5-3 10 0 4.42 3.03 8 8 8Z" />
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -13],
  })

const getFireGridSize = (zoom: number) => {
  if (zoom <= 4) return 140
  if (zoom === 5) return 105
  if (zoom === 6) return 75
  if (zoom === 7) return 50
  if (zoom === 8) return 32
  if (zoom === 9) return 20
  return 0
}

const ActiveFireMarkers: React.FC<{ showFires: boolean }> = ({ showFires }) => {
  const map = useMap()
  const [fires, setFires] = useState<ActiveFire[]>([])
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    let isActive = true

    const loadFires = async () => {
      const cached = await readBrowserApiCache<BrowserApiCacheEntry<ActiveFire[]>>(MAP_ACTIVE_FIRES_CACHE_KEY)
      const cachedFires = Array.isArray(cached?.data) ? cached.data : []
      if (
        isActive &&
        isBrowserApiCacheFresh(cached, MAP_ACTIVE_FIRES_CACHE_MAX_AGE_MS) &&
        cachedFires.length
      ) {
        setFires(cachedFires)
      }

      const data = await getActiveFires()
      if (!isActive || !data) return

      setFires(data)
      writeBrowserApiCache(MAP_ACTIVE_FIRES_CACHE_KEY, data).catch((error) => {
        console.warn("Unable to cache active-fire data:", error)
      })
    }

    loadFires()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    const clearMarkers = () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }

    const renderMarkers = () => {
      clearMarkers()
      if (!showFires || !fires.length) return

      const bounds = map.getBounds()
      const zoom = map.getZoom()
      const gridSize = getFireGridSize(zoom)
      const visibleFires = fires
        .filter((fire) => bounds.contains([fire.latitude, fire.longitude]))
        .sort((a, b) => (b.frp ?? 0) - (a.frp ?? 0))

      const selectedFires =
        gridSize === 0
          ? visibleFires
          : Array.from(
              visibleFires
                .reduce((cells, fire) => {
                  const point = map.latLngToContainerPoint([fire.latitude, fire.longitude])
                  const cellKey = `${Math.floor(point.x / gridSize)}:${Math.floor(point.y / gridSize)}`
                  if (!cells.has(cellKey)) cells.set(cellKey, fire)
                  return cells
                }, new Map<string, ActiveFire>())
                .values(),
            )

      const fireIcon = createFireIcon()

      selectedFires.forEach((fire) => {
        const marker = L.marker([fire.latitude, fire.longitude], {
          icon: fireIcon,
          keyboard: true,
          title: `Active fire detected ${fire.acquisition_datetime || fire.acquisition_date}`,
        }).addTo(map)

        const popup = document.createElement("div")
        popup.style.minWidth = "190px"

        const title = document.createElement("div")
        title.textContent = "Active fire detection"
        title.style.fontWeight = "700"
        title.style.color = "#b91c1c"
        title.style.marginBottom = "6px"
        popup.appendChild(title)

        const details = [
          ["Detected", fire.acquisition_datetime || fire.acquisition_date],
          ["Satellite", fire.satellite],
          ["Instrument", fire.instrument],
          ["FRP", fire.frp == null ? null : `${fire.frp} MW`],
          ["Confidence", fire.confidence],
          ["Day/Night", fire.daynight],
        ]

        details.forEach(([label, value]) => {
          if (value == null || value === "") return
          const row = document.createElement("div")
          row.style.fontSize = "12px"
          row.style.marginTop = "3px"

          const labelElement = document.createElement("strong")
          labelElement.textContent = `${label}: `
          row.appendChild(labelElement)
          row.appendChild(document.createTextNode(String(value)))
          popup.appendChild(row)
        })

        marker.bindPopup(popup, { maxWidth: 260 })
        markersRef.current.push(marker)
      })
    }

    renderMarkers()
    map.on("zoomend moveend", renderMarkers)

    return () => {
      map.off("zoomend moveend", renderMarkers)
      clearMarkers()
    }
  }, [fires, map, showFires])

  return null
}

interface HeatmapData {
  bounds: [[number, number], [number, number]]
  city: string
  id: string
  image: string
  message: string
}

// Combined Map Controls Component
const MapControls: React.FC<{
  showHeatmaps: boolean
  setShowHeatmaps: (value: boolean) => void
  showEmojis: boolean
  setShowEmojis: (value: boolean) => void
  showFires: boolean
  setShowFires: (value: boolean) => void
  heatmapEnabled: boolean
  captureViewEnabled: boolean
}> = ({
  showHeatmaps,
  setShowHeatmaps,
  showEmojis,
  setShowEmojis,
  showFires,
  setShowFires,
  heatmapEnabled,
  captureViewEnabled,
}) => {
  const map = useMap()

  const captureMapView = async () => {
    try {
      const mapContainer = map.getContainer()
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `map-view-${new Date().toISOString().split("T")[0]}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }, "image/png")
    } catch (error) {
      console.error("Error capturing map view:", error)
      alert("Failed to capture map view. Please try again.")
    }
  }

  useEffect(() => {
    const MapControls = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create("div", "leaflet-control leaflet-bar")
        container.style.backgroundColor = "white"
        container.style.padding = "7px"
        container.style.borderRadius = "7px"
        container.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
        container.style.cursor = "pointer"
        container.style.userSelect = "none"
        container.style.display = "flex"
        container.style.flexDirection = "column"
        container.style.gap = "5px"
        container.style.alignItems = "center"
        container.style.marginTop = "128px"

        const iconSvg = (paths: string) => `
          <svg
            aria-hidden="true"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            ${paths}
          </svg>
        `

        const styleIconButton = (button: HTMLButtonElement) => {
          button.type = "button"
          button.style.width = "32px"
          button.style.height = "32px"
          button.style.border = "none"
          button.style.display = "flex"
          button.style.alignItems = "center"
          button.style.justifyContent = "center"
          button.style.padding = "0"
          button.style.borderRadius = "6px"
          button.style.cursor = "pointer"
          button.style.transition = "all 0.2s"
        }

        if (heatmapEnabled) {
          const heatmapButton = L.DomUtil.create("button", "", container)
          heatmapButton.innerHTML = iconSvg(`
            <circle cx="6" cy="6" r="1.8" fill="currentColor" stroke="none" opacity="0.35" />
            <circle cx="12" cy="5" r="2.2" fill="currentColor" stroke="none" opacity="0.55" />
            <circle cx="18" cy="7" r="1.6" fill="currentColor" stroke="none" opacity="0.3" />
            <circle cx="7" cy="13" r="2.4" fill="currentColor" stroke="none" opacity="0.65" />
            <circle cx="13" cy="12" r="3.4" fill="currentColor" stroke="none" opacity="0.95" />
            <circle cx="18" cy="14" r="2" fill="currentColor" stroke="none" opacity="0.5" />
            <circle cx="5" cy="19" r="1.4" fill="currentColor" stroke="none" opacity="0.25" />
            <circle cx="12" cy="19" r="2" fill="currentColor" stroke="none" opacity="0.45" />
            <circle cx="19" cy="19" r="1.5" fill="currentColor" stroke="none" opacity="0.28" />
          `)
          styleIconButton(heatmapButton)
          heatmapButton.style.background = showHeatmaps ? "#dbeafe" : "transparent"
          heatmapButton.style.color = showHeatmaps ? "#1d4ed8" : "#374151"
          heatmapButton.title = showHeatmaps ? "Hide Heatmap" : "Show Heatmap"
          heatmapButton.setAttribute("aria-label", showHeatmaps ? "Hide heatmap" : "Show heatmap")
          heatmapButton.setAttribute("aria-pressed", String(showHeatmaps))

          L.DomEvent.on(heatmapButton, "click", (e) => {
            L.DomEvent.stopPropagation(e)
            setShowHeatmaps(!showHeatmaps)
          })
        }

        // Emoji toggle button
        const emojiButton = L.DomUtil.create("button", "", container)
        emojiButton.innerHTML = iconSvg(`
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <path d="M9 9h.01" />
          <path d="M15 9h.01" />
        `)
        styleIconButton(emojiButton)
        emojiButton.style.background = showEmojis ? "#dcfce7" : "transparent"
        emojiButton.style.color = showEmojis ? "#166534" : "#374151"
        emojiButton.title = showEmojis ? "Hide Emojis" : "Show Emojis"
        emojiButton.setAttribute("aria-label", showEmojis ? "Hide emoji markers" : "Show emoji markers")
        emojiButton.setAttribute("aria-pressed", String(showEmojis))

        L.DomEvent.on(emojiButton, "click", (e) => {
          L.DomEvent.stopPropagation(e)
          setShowEmojis(!showEmojis)
        })

        const fireButton = L.DomUtil.create("button", "", container)
        fireButton.innerHTML = iconSvg(`
          <path d="M12 22c4.97 0 8-3.58 8-8 0-3.5-2-6.5-5-9 .5 3-1 5-3 6-1-3-3-5-5-7 .5 4-3 6.5-3 10 0 4.42 3.03 8 8 8Z" />
        `)
        styleIconButton(fireButton)
        fireButton.style.background = showFires ? "#ffedd5" : "transparent"
        fireButton.style.color = showFires ? "#c2410c" : "#374151"
        fireButton.title = showFires ? "Hide active fires" : "Show active fires"
        fireButton.setAttribute("aria-label", showFires ? "Hide active fires" : "Show active fires")
        fireButton.setAttribute("aria-pressed", String(showFires))

        L.DomEvent.on(fireButton, "click", (e) => {
          L.DomEvent.stopPropagation(e)
          setShowFires(!showFires)
        })

        if (captureViewEnabled) {
          const downloadMapButton = L.DomUtil.create("button", "", container)
          downloadMapButton.innerHTML = iconSvg(`
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
            <circle cx="12" cy="13" r="3" />
          `)
          styleIconButton(downloadMapButton)
          downloadMapButton.style.background = "#f3e8ff"
          downloadMapButton.style.color = "#7c3aed"
          downloadMapButton.title = "Capture current map view as image"
          downloadMapButton.setAttribute("aria-label", "Capture current map view as image")

          L.DomEvent.on(downloadMapButton, "click", (e) => {
            L.DomEvent.stopPropagation(e)
            captureMapView()
          })
        }

        return container
      },
    })

    const mapControls = new MapControls({ position: "topright" })
    map.addControl(mapControls)

    return () => {
      map.removeControl(mapControls)
    }
  }, [
    map,
    showHeatmaps,
    setShowHeatmaps,
    showEmojis,
    setShowEmojis,
    showFires,
    setShowFires,
    heatmapEnabled,
    captureViewEnabled,
  ])

  return null
}

const HeatmapOverlays: React.FC<{
  onLoadingChange: (state: LoadingState) => void
  showHeatmaps: boolean
  setShowHeatmaps: (value: boolean) => void
  showEmojis: boolean
  setShowEmojis: (value: boolean) => void
  showFires: boolean
  setShowFires: (value: boolean) => void
  heatmapEnabled: boolean
  captureViewEnabled: boolean
}> = ({
  onLoadingChange,
  showHeatmaps,
  setShowHeatmaps,
  showEmojis,
  setShowEmojis,
  showFires,
  setShowFires,
  heatmapEnabled,
  captureViewEnabled,
}) => {
  const map = useMap()
  const [heatmaps, setHeatmaps] = useState<HeatmapData[]>([])
  const overlaysRef = useRef<L.ImageOverlay[]>([])

  useEffect(() => {
    if (!showHeatmaps) {
      onLoadingChange({ isLoading: false, error: null })
      return
    }

    let isActive = true

    const fetchHeatmaps = async () => {
      let hasUsableCachedHeatmaps = false

      try {
        onLoadingChange({ isLoading: true, error: null })

        const cached = await readBrowserApiCache<BrowserApiCacheEntry<HeatmapData[]>>(MAP_HEATMAPS_CACHE_KEY)
        if (isActive && isBrowserApiCacheFresh(cached, MAP_API_CACHE_MAX_AGE_MS) && cached.data.length) {
          hasUsableCachedHeatmaps = true
          setHeatmaps(cached.data)
          onLoadingChange({ isLoading: false, error: null })
        }

        const data = await getHeatmapData()
        if (!isActive) return

        if (data && Array.isArray(data)) {
          setHeatmaps(data)
          writeBrowserApiCache(MAP_HEATMAPS_CACHE_KEY, data).catch((error) => {
            console.warn("Unable to cache heatmap data:", error)
          })
          onLoadingChange({ isLoading: false, error: null })
        } else {
          onLoadingChange(
            hasUsableCachedHeatmaps
              ? { isLoading: false, error: null }
              : {
                  isLoading: false,
                  error: "No heatmap data available",
                },
          )
        }
      } catch (error) {
        if (!isActive) return
        console.error("Error fetching heatmap data:", error)
        onLoadingChange(
          hasUsableCachedHeatmaps
            ? { isLoading: false, error: null }
            : {
                isLoading: false,
                error: "Error loading heatmap data",
              },
        )
      }
    }

    fetchHeatmaps()

    return () => {
      isActive = false
    }
  }, [onLoadingChange, showHeatmaps])

  useEffect(() => {
    if (!heatmaps.length) return

    overlaysRef.current.forEach((overlay) => overlay.remove())
    overlaysRef.current = []

    if (showHeatmaps) {
      heatmaps.forEach((heatmap) => {
        try {
          if (!heatmap.bounds || !Array.isArray(heatmap.bounds) || heatmap.bounds.length !== 2) {
            console.warn(`Invalid bounds for heatmap ${heatmap.city}:`, heatmap.bounds)
            return
          }

          const [[south, west], [north, east]] = heatmap.bounds

          if (
            typeof south !== "number" ||
            typeof west !== "number" ||
            typeof north !== "number" ||
            typeof east !== "number"
          ) {
            console.warn(`Invalid coordinate values for heatmap ${heatmap.city}`)
            return
          }

          const imageOverlay = L.imageOverlay(
            heatmap.image,
            [
              [south, west],
              [north, east],
            ],
            {
              opacity: 0.7,
              interactive: true,
              alt: `Heatmap for ${heatmap.city}`,
            },
          ).addTo(map)

          overlaysRef.current.push(imageOverlay)
        } catch (error) {
          console.error(`Error creating overlay for ${heatmap.city}:`, error)
        }
      })
    }

    return () => {
      overlaysRef.current.forEach((overlay) => overlay.remove())
    }
  }, [heatmaps, showHeatmaps, map])

  return (
    <MapControls
      showHeatmaps={showHeatmaps}
      setShowHeatmaps={setShowHeatmaps}
      showEmojis={showEmojis}
      setShowEmojis={setShowEmojis}
      showFires={showFires}
      setShowFires={setShowFires}
      heatmapEnabled={heatmapEnabled}
      captureViewEnabled={captureViewEnabled}
    />
  )
}

// Update the Legend component with better tooltip styling
const Legend: React.FC = () => {
  const pollutantLevels = useMemo(
    () => [
      {
        range: `0.0 ${PM25_UNIT_TEXT} - 9.0 ${PM25_UNIT_TEXT}`,
        label: "Air Quality is Good",
        image: GoodAir,
      },
      {
        range: `9.1 ${PM25_UNIT_TEXT} - 35.4 ${PM25_UNIT_TEXT}`,
        label: "Air Quality is Moderate",
        image: Moderate,
      },
      {
        range: `35.5 ${PM25_UNIT_TEXT} - 55.4 ${PM25_UNIT_TEXT}`,
        label: "Air Quality is Unhealthy for Sensitive Groups",
        image: UnhealthySG,
      },
      {
        range: `55.5 ${PM25_UNIT_TEXT} - 125.4 ${PM25_UNIT_TEXT}`,
        label: "Air Quality is Unhealthy",
        image: Unhealthy,
      },
      {
        range: `125.5 ${PM25_UNIT_TEXT} - 225.4 ${PM25_UNIT_TEXT}`,
        label: "Air Quality is Very Unhealthy",
        image: VeryUnhealthy,
      },
      {
        range: `225.5+ ${PM25_UNIT_TEXT}`,
        label: "Air Quality is Hazardous",
        image: Hazardous,
      },
    ],
    [],
  )

  return (
    <div className="leaflet-bottom leaflet-left z-[1000] m-4">
      <div className="leaflet-control bg-white p-2 rounded-full shadow-md">
        <div className="flex flex-col gap-2">
          {pollutantLevels.map((level, index) => (
            <div key={index} className="flex items-center gap-2 group relative">
              <div className="w-8 h-8 relative cursor-pointer">
                <Image src={level.image || "/placeholder.svg"} alt={level.label} fill className="object-contain" />
                <div className="opacity-0 group-hover:opacity-100 absolute left-full ml-2 bg-white text-gray-800 text-xs rounded-lg px-3 py-2 whitespace-nowrap transition-opacity duration-200 shadow-lg border border-gray-200 min-w-[200px]">
                  <div className="font-semibold mb-1">{level.label}</div>
                  <div className="text-gray-600">{level.range}</div>
                  <div className="absolute w-2 h-2 left-0 top-1/2 -ml-1 -mt-1 bg-white border-l border-t border-gray-200 transform -rotate-45"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Map Layer Control Component
const MapLayerButton: React.FC = () => {
  const map = useMap()
  const [currentStyle, setCurrentStyle] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mapStyle") || "streets"
    }
    return "streets"
  })

  const mapStyles = {
    streets: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
    satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
    dark: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
    light: `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
    outdoors: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
    navigation: `https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
  }

  const handleStyleChange = (style: string) => {
    console.log("Changing map style to:", style)
    setCurrentStyle(style)

    if (typeof window !== "undefined") {
      localStorage.setItem("mapStyle", style)
    }

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    L.tileLayer(mapStyles[style as keyof typeof mapStyles], {
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(map)
  }

  return (
    <div className="leaflet-top leaflet-right z-[1000] mt-16 mr-4">
      <div className="leaflet-control">
        <MapLayerControl onStyleChange={handleStyleChange} currentStyle={currentStyle} />
      </div>
    </div>
  )
}

// Update the LeafletMap component
const LeafletMap: React.FC = () => {
  const siteSettings = useSiteSettings()
  const heatmapEnabled = siteSettings.features.find((feature) => feature.id === "heatmap")?.enabled ?? true
  const captureViewEnabled =
    siteSettings.features.find((feature) => feature.id === "capture-view")?.enabled ?? true
  const defaultCenter = DEFAULT_MAP_CENTER
  const defaultZoom = DEFAULT_MAP_ZOOM
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  })
  const [showEmojis, setShowEmojis] = useState(true)
  const [showHeatmaps, setShowHeatmaps] = useState(false)
  const [showFires, setShowFires] = useState(true)
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null)
  const [hourlyForecastEnabled, setHourlyForecastEnabled] = useState(false)
  const [hourlyForecastPreferenceLoaded, setHourlyForecastPreferenceLoaded] = useState(false)
  const [forecastState, setForecastState] = useState<ForecastState>({
    isLoading: false,
    error: null,
    collection: null,
  })
  const [hourlyForecastState, setHourlyForecastState] = useState<HourlyForecastCollectionState>({
    isLoading: false,
    error: null,
    requestedSiteId: null,
    site: null,
  })
  const [hourlyForecastRequest, setHourlyForecastRequest] = useState<HourlyForecastRequest | null>(null)

  useEffect(() => {
    if (!heatmapEnabled) setShowHeatmaps(false)
  }, [heatmapEnabled])

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!mapboxToken) {
    console.warn("Mapbox token is not set in environment variables. Map functionality may be limited.")
  }

  const initialMapStyle = typeof window !== "undefined" ? localStorage.getItem("mapStyle") || "streets" : "streets"

  const mapStyles = {
    streets: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
    satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
    dark: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
    light: `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
    outdoors: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
    navigation: `https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
  }

  useEffect(() => {
    let isActive = true
    let hasUsableCachedForecast = false

    const loadForecast = async () => {
      setForecastState((current) =>
        current.collection ? current : { isLoading: true, error: null, collection: null },
      )

      const cached = await readBrowserApiCache<BrowserApiCacheEntry<DailyForecastResponse>>(MAP_FORECAST_CACHE_KEY)
      if (isActive && isDailyForecastCacheCurrent(cached) && cached.data.forecasts?.length) {
        hasUsableCachedForecast = true
        setForecastState({ isLoading: false, error: null, collection: cached.data })
      }

      try {
        const collection = await getDailyForecastCollection()
        if (!isActive) return
        if (!collection?.forecasts?.length) {
          if (!hasUsableCachedForecast) {
            setForecastState({ isLoading: false, error: "No forecast coverage was returned.", collection: null })
          }
          return
        }

        setForecastState({ isLoading: false, error: null, collection })
        writeBrowserApiCache(MAP_FORECAST_CACHE_KEY, collection).catch((error) => {
          console.warn("Unable to cache forecast coverage:", error)
        })
      } catch (error) {
        if (!isActive) return
        console.error(error)
        if (!hasUsableCachedForecast) {
          setForecastState({ isLoading: false, error: "Failed to load forecast coverage.", collection: null })
        }
      }
    }

    loadForecast()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    // Default hourly forecast to off, regardless of any previously stored preference.
    setHourlyForecastEnabled(false)
    setHourlyForecastPreferenceLoaded(true)
  }, [])

  useEffect(() => {
    if (!hourlyForecastPreferenceLoaded) return
    window.localStorage.setItem(MAP_HOURLY_FORECAST_ENABLED_KEY, String(hourlyForecastEnabled))
  }, [hourlyForecastEnabled, hourlyForecastPreferenceLoaded])

  const handleHourlyForecastEnabledChange = (enabled: boolean) => {
    setHourlyForecastEnabled(enabled)
    if (!enabled) {
      setHourlyForecastRequest(null)
      setHourlyForecastState({ isLoading: false, error: null, requestedSiteId: null, site: null })
    }
  }

  const handleHourlyForecastRequest = (request: HourlyForecastRequest) => {
    setHourlyForecastRequest({ ...request })
  }

  useEffect(() => {
    setHourlyForecastRequest(null)
    setHourlyForecastState({ isLoading: false, error: null, requestedSiteId: null, site: null })
  }, [selectedNode?.site_id])

  useEffect(() => {
    if (!hourlyForecastPreferenceLoaded) return

    const selectedSiteId = selectedNode?.site_id
    const request = hourlyForecastRequest

    if (!hourlyForecastEnabled || !request || request.siteId !== selectedSiteId) {
      setHourlyForecastState({ isLoading: false, error: null, requestedSiteId: null, site: null })
      return
    }

    const { siteId } = request
    let isActive = true
    let hasUsableCachedForecast = false
    const cacheKey = `${MAP_HOURLY_FORECAST_CACHE_KEY}:${siteId}`

    const loadHourlyForecast = async () => {
      setHourlyForecastState({ isLoading: true, error: null, requestedSiteId: siteId, site: null })

      const cached = await readBrowserApiCache<BrowserApiCacheEntry<HourlyForecastSite>>(cacheKey)
      const cachedAt = cached?.cachedAt ? new Date(cached.cachedAt) : null
      const cachedForecasts = Array.isArray(cached?.data?.forecasts) ? cached.data.forecasts : []
      const cachedToday =
        cachedAt &&
        !Number.isNaN(cachedAt.getTime()) &&
        formatLocalDateKey(cachedAt) === formatLocalDateKey(new Date())

      if (
        isActive &&
        cachedToday &&
        isBrowserApiCacheFresh(cached, MAP_API_CACHE_MAX_AGE_MS) &&
        cachedForecasts.length
      ) {
        hasUsableCachedForecast = true
        setHourlyForecastState({ isLoading: false, error: null, requestedSiteId: siteId, site: cached.data })
      }

      try {
        const site = await getHourlyForecast(siteId)
        if (!isActive) return
        if (!site?.forecasts?.length) {
          if (!hasUsableCachedForecast) {
            setHourlyForecastState({ isLoading: false, error: "No hourly forecast returned for this site.", requestedSiteId: siteId, site: null })
          }
          return
        }

        setHourlyForecastState({ isLoading: false, error: null, requestedSiteId: siteId, site })
        writeBrowserApiCache(cacheKey, site).catch((error) => {
          console.warn("Unable to cache hourly forecast:", error)
        })
      } catch (error) {
        if (!isActive) return
        console.error(error)
        if (!hasUsableCachedForecast) {
          setHourlyForecastState({ isLoading: false, error: "Failed to load hourly forecast.", requestedSiteId: siteId, site: null })
        }
      }
    }

    loadHourlyForecast()

    return () => {
      isActive = false
    }
  }, [hourlyForecastEnabled, hourlyForecastPreferenceLoaded, hourlyForecastRequest, selectedNode?.site_id])

  const isPanelOpen = !!selectedNode

  return (
    <div className="h-full w-full">
      <div className="flex h-full w-full">
        <div className="relative flex-1">
          <LoadingIndicator isLoading={loadingState.isLoading} error={loadingState.error} />
          <ForecastStatusBadge forecastState={forecastState} />
          <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url={mapStyles[initialMapStyle as keyof typeof mapStyles]}
              attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              tileSize={512}
              zoomOffset={-1}
            />
            <SearchControl defaultCenter={defaultCenter} defaultZoom={defaultZoom} />
            <ClearSelectionOnMapClick onClear={() => setSelectedNode(null)} />
            <MapNodes onLoadingChange={setLoadingState} showEmojis={showEmojis} onNodeSelect={setSelectedNode} />
            <ActiveFireMarkers showFires={showFires} />
            <HeatmapOverlays
              onLoadingChange={setLoadingState}
              showHeatmaps={heatmapEnabled && showHeatmaps}
              setShowHeatmaps={setShowHeatmaps}
              showEmojis={showEmojis}
              setShowEmojis={setShowEmojis}
              showFires={showFires}
              setShowFires={setShowFires}
              heatmapEnabled={heatmapEnabled}
              captureViewEnabled={captureViewEnabled}
            />
            <Legend />
            <MapLayerButton />
          </MapContainer>
        </div>

        <div
          className={[
            "h-full overflow-hidden transition-[width] duration-300 ease-out",
            isPanelOpen ? "w-[448px]" : "w-0",
          ].join(" ")}
          aria-hidden={!isPanelOpen}
        >
          {isPanelOpen ? (
            <ForecastPanel
              selectedNode={selectedNode}
              forecastState={forecastState}
              hourlyForecastState={hourlyForecastState}
              hourlyForecastEnabled={hourlyForecastEnabled}
              onHourlyForecastEnabledChange={handleHourlyForecastEnabledChange}
              onHourlyForecastRequest={handleHourlyForecastRequest}
              onClose={() => setSelectedNode(null)}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Create a custom icon based on AQI category
const getCustomIcon = (aqiCategory: string) => {
  const imageSrc = getAqiImageByCategory(aqiCategory)

  return L.icon({
    iconUrl: imageSrc,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })
}

export default LeafletMap

