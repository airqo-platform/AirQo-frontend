"use client"

import React, { Suspense, useEffect, useState, useMemo, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { getMaintenanceMapData, getMaintenanceSiteMapData, getSyncedGrids } from "@/services/device-api.service"
import {
  MAP_ITEM_NOUNS,
  countLabel,
  getDefaultMaintenanceMapView,
  hasMapCoordinates,
  isMaintenanceMapView,
  siteToMapItem,
  suggestRouteAdditions,
  type MaintenanceMapView,
  type RouteSuggestion,
} from "@/lib/maintenance-map"
import { ROUTES } from "@/lib/navigation"
import { GridAdminLevel, MaintenanceMapItem, SyncedGrid } from "@/types/api.types"
import { airQloudService, type AirQloudBasic } from "@/services/airqloud.service"
import { AqCopy01, AqLinkExternal01, AqMap01, AqShare01 } from "@airqo/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  GOOGLE_MAPS_MAX_WAYPOINTS,
  GOOGLE_MAPS_PHONE_MAX_WAYPOINTS,
  ROAD_ROUTING_ENABLED,
  buildGoogleMapsDirectionsLinks,
  isPhoneBrowser,
  calculateRoadRoute,
  type GoogleMapsLink,
  optimizeRoundTrip,
  getCurrentPosition,
  formatDistanceKm,
  formatDurationMin,
  Coordinates,
} from "@/utils/routing-utils"
import { useToast } from "@/hooks/use-toast"
import { useGroup } from "@/lib/group-context"
import { LoRaWANGatewayDialog } from "@/components/maintenance/lorawan-gateway-dialog"
import { MapExportDialog } from "@/components/maintenance/map-export-dialog"
import { MapSidebar } from "@/components/maintenance/map/map-sidebar"
import { MapTopFilters } from "@/components/maintenance/map/map-top-filters"
import { LoRaWANGateway } from "@/types/lorawan.types"
import {
  loadGatewaysFromStorage,
  saveGatewaysToStorage,
  computeGatewayCoverageStats,
  calculateDistance,
  calculateSignalAttenuation,
  KAMPALA_SAMPLE_GATEWAYS,
} from "@/utils/lorawan-utils"
import { CheckCircle2, ArrowRight, X, PanelLeftOpen, PanelLeftClose, Map as MapIcon, List, ChevronUp, ChevronDown, Navigation } from "lucide-react"

// Dynamically import Map component to avoid SSR issues with Leaflet
const MaintenanceMap = dynamic(() => import("@/components/maintenance/maintenance-map"), {
  loading: () => (
    <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-xs font-semibold">
      Loading Map Canvas...
    </div>
  ),
  ssr: false,
})

const DEFAULT_HOME_LOCATION = { latitude: 0.332078, longitude: 32.570473, name: "Head Office (Kampala)" }

/** "Start → stop 9" for a Google Maps link over [start, stops…, start]. */
function describeGoogleMapsLink(link: GoogleMapsLink, stopCount: number): string {
  const label = (position: number) =>
    position === 1 ? "Start" : position === stopCount + 2 ? "back to start" : `stop ${position - 1}`
  return `${label(link.from)} → ${label(link.to)}`
}

interface RouteLeg {
  distanceKm: number
  /** Driving time, known for road routes only */
  durationMin?: number
}

interface RouteSummary {
  distanceKm: number
  durationMin?: number
  legs: RouteLeg[]
  /** Road distances from OSRM, or straight lines while road routing is off */
  byRoad: boolean
  /** How the stops were put in order, as the PDF report names it */
  mode: string
}

const ROUTE_MODE_LABELS = {
  straightLine: "Nearest neighbour + 2-opt (straight lines)",
  "osrm-trip": "OSRM trip (roads)",
  "nearest-neighbour": "Nearest neighbour (roads)",
} as const

/** Arrow between itinerary stops, labelled with the leg's distance. */
function RouteLegArrow({ leg }: { leg?: RouteLeg }) {
  return (
    <div
      className="flex flex-col items-center flex-shrink-0 min-w-[28px]"
      title={
        leg ? `${formatDistanceKm(leg.distanceKm)}${leg.durationMin != null ? ` · ${formatDurationMin(leg.durationMin)}` : ""}` : undefined
      }
    >
      <ArrowRight className="w-3 h-3 text-gray-300" />
      {leg && (
        <span className="text-[8px] font-semibold text-gray-400 leading-none mt-0.5 whitespace-nowrap">
          {formatDistanceKm(leg.distanceKm)}
        </span>
      )}
    </div>
  )
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={null}>
      <MaintenancePageClient />
    </Suspense>
  )
}

function MaintenancePageClient() {
  const { toast } = useToast()
  const { activeGroup, loading: groupLoading } = useGroup()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Devices or sites, kept in `?view=` so it survives reloads; without it AirQo opens on
  // devices and other organisations on sites
  const viewParam = searchParams?.get("view")
  const mapView: MaintenanceMapView = isMaintenanceMapView(viewParam)
    ? viewParam
    : getDefaultMaintenanceMapView(activeGroup)
  const itemNoun = MAP_ITEM_NOUNS[mapView]
  const handleMapViewChange = (view: MaintenanceMapView) => {
    if (view !== mapView) router.replace(`${ROUTES.MAINTENANCE}?view=${view}`, { scroll: false })
  }

  // --- FILTER STATE ---
  const [selectedDays, setSelectedDays] = useState(14)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [offlineDaysFilter, setOfflineDaysFilter] = useState<number | null>(null)
  const [uptimeFilter, setUptimeFilter] = useState<"all" | "good" | "moderate" | "critical" | "offline">("all")
  const [errorMarginFilter, setErrorMarginFilter] = useState<"all" | "good" | "moderate" | "critical">("all")
  const [selectedAirQloud, setSelectedAirQloud] = useState<string>("all")
  const [selectedGrid, setSelectedGrid] = useState<string>("all")

  // --- COHORT & GRID LISTS ---
  const [cohorts, setCohorts] = useState<AirQloudBasic[]>([])
  const [loadingAirQlouds, setLoadingAirQlouds] = useState(false)
  const [cohortSearch, setCohortSearch] = useState("")

  const [grids, setGrids] = useState<SyncedGrid[]>([])
  const [loadingGrids, setLoadingGrids] = useState(false)
  const [gridSearch, setGridSearch] = useState("")
  const [gridAdminLevelFilter, setGridAdminLevelFilter] = useState<"all" | GridAdminLevel>("all")

  // --- DATA & SELECTION STATE ---
  const [mapData, setMapData] = useState<MaintenanceMapItem[] | null>(null)
  const [loadingMap, setLoadingMap] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<MaintenanceMapItem | null>(null)
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [flyToLocation, setFlyToLocation] = useState<{ latitude: number; longitude: number; zoom?: number } | null>(null)

  // --- ROUTING STATE ---
  const [routePath, setRoutePath] = useState<MaintenanceMapItem[]>([])
  const [isRouting, setIsRouting] = useState(false)
  const [routeStartMode, setRouteStartMode] = useState<"office" | "current">("office")
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null)
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null)
  const routeAbortRef = useRef<AbortController | null>(null)
  // The route as it is now, for a step that carries on after an await
  const routePathRef = useRef(routePath)
  useEffect(() => {
    routePathRef.current = routePath
  }, [routePath])

  // The route starts (and ends) at the head office unless the user opted to start from their own position.
  const homeLocation = useMemo<Coordinates & { name?: string }>(
    () =>
      routeStartMode === "current" && currentLocation
        ? { ...currentLocation, name: "My Location" }
        : DEFAULT_HOME_LOCATION,
    [routeStartMode, currentLocation]
  )

  // --- POLYGON SELECTION STATE ---
  const [polygonSelectedDevices, setPolygonSelectedDevices] = useState<MaintenanceMapItem[]>([])

  // --- LORAWAN GATEWAYS & EXPORT STATE ---
  const [gateways, setGateways] = useState<LoRaWANGateway[]>([])
  const [showGateways, setShowGateways] = useState(false)
  const [showDeviceNames, setShowDeviceNames] = useState(false)
  const [highlightUncoveredDevices, setHighlightUncoveredDevices] = useState(false)
  const [coverageFilter, setCoverageFilter] = useState<"all" | "inside_radius" | "outside_radius">("all")
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // --- COLLAPSE & VIEW MODE STATE ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileViewMode, setMobileViewMode] = useState<"split" | "map-expanded" | "list-expanded">("split")

  // Load gateways on mount
  useEffect(() => {
    const loaded = loadGatewaysFromStorage()
    const isOldSampleSeed =
      loaded &&
      loaded.length === 8 &&
      loaded.some((g) => g.id === "gw-mak-01" || g.id === "gw-kol-02")

    if (loaded && loaded.length > 0 && !isOldSampleSeed) {
      setGateways(loaded)
    } else {
      setGateways(KAMPALA_SAMPLE_GATEWAYS)
      saveGatewaysToStorage(KAMPALA_SAMPLE_GATEWAYS)
    }
  }, [])

  const handleGatewaysChange = (updated: LoRaWANGateway[]) => {
    setGateways(updated)
    saveGatewaysToStorage(updated)
  }

  const handleToggleGateways = (visible: boolean) => {
    setShowGateways(visible)
    if (!visible) {
      setCoverageFilter("all")
      setHighlightUncoveredDevices(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Fetch Cohorts
  useEffect(() => {
    let cancelled = false
    const fetchCohorts = async () => {
      if (groupLoading || !activeGroup) return
      setLoadingAirQlouds(true)
      try {
        const tagsParam = selectedTags.length > 0 ? selectedTags.join(",") : undefined
        const response = await airQloudService.getAirQloudsBasic({
          search: cohortSearch || undefined,
          tags: tagsParam,
          limit: 100,
          group: activeGroup,
        })
        if (!cancelled) {
          const items = Array.isArray(response) ? response : (response as any).airqlouds || []
          setCohorts(items)
        }
      } catch (error) {
        console.error("Failed to fetch cohorts", error)
      } finally {
        if (!cancelled) setLoadingAirQlouds(false)
      }
    }

    const timer = setTimeout(fetchCohorts, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [selectedTags, cohortSearch, activeGroup, groupLoading])

  // Fetch Grids
  useEffect(() => {
    let cancelled = false
    const fetchGrids = async () => {
      if (groupLoading || !activeGroup) return
      setLoadingGrids(true)
      try {
        const items = await getSyncedGrids({
          skip: 0,
          limit: 20,
          search: gridSearch || undefined,
          admin_level: gridAdminLevelFilter === "all" ? undefined : gridAdminLevelFilter,
          group: activeGroup,
        })
        if (!cancelled) setGrids(items)
      } catch (error) {
        console.error("Failed to fetch grids", error)
      } finally {
        if (!cancelled) setLoadingGrids(false)
      }
    }

    const timer = setTimeout(fetchGrids, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [gridSearch, gridAdminLevelFilter, activeGroup, groupLoading])

  // Fetch Maintenance Map Data. Only the latest request's result counts: a refresh still
  // pending when the view or a filter changes resolves to null rather than the old view's items.
  const mapRequestRef = useRef(0)
  // Tags only filter devices, so in the sites view a tag change neither refetches nor drops the route
  const deviceTagsParam = mapView === "devices" && selectedTags.length > 0 ? selectedTags.join(",") : undefined
  const fetchMapData = useCallback(async () => {
    if (groupLoading || !activeGroup) return null
    const requestId = ++mapRequestRef.current
    setLoadingMap(true)
    try {
      let items: MaintenanceMapItem[]
      if (mapView === "sites") {
        const sites = await getMaintenanceSiteMapData(selectedDays, activeGroup)
        items = sites.map(siteToMapItem)
      } else {
        items = await getMaintenanceMapData(selectedDays, deviceTagsParam, activeGroup)
      }
      return requestId === mapRequestRef.current ? items : null
    } catch (error) {
      console.error("Failed to fetch Map data", error)
      return null
    } finally {
      if (requestId === mapRequestRef.current) setLoadingMap(false)
    }
  }, [mapView, selectedDays, deviceTagsParam, activeGroup, groupLoading])

  // A selection, area or route from one view means nothing in the other
  useEffect(() => {
    setMapData(null)
    setSelectedDevice(null)
    setSelectedDeviceIds([])
    setPolygonSelectedDevices([])
    setRouteGeometry(null)
    setRouteSummary(null)
  }, [mapView])

  // Filtered Map Data (computes active items based on active filters)
  const filteredMapData = useMemo(() => {
    if (!mapData) return []

    let filtered = mapData

    // 1. Cohort Filter
    if (selectedAirQloud !== "all") {
      filtered = filtered.filter((d) => d.cohorts && d.cohorts.includes(selectedAirQloud))
    }

    // 2. Grid Filter
    if (selectedGrid !== "all") {
      filtered = filtered.filter((device) => {
        const deviceGrids = Array.isArray(device.grids) ? device.grids : []
        return deviceGrids.some((grid) => String(grid).toLowerCase() === selectedGrid.toLowerCase())
      })
    }

    // 3. Offline Days Filter
    if (offlineDaysFilter !== null) {
      const now = Date.now()
      const thresholdMs = offlineDaysFilter * 86400000
      filtered = filtered.filter((device) => {
        if (!device.last_active) return true
        const offlineDuration = now - new Date(device.last_active).getTime()
        return offlineDuration >= thresholdMs
      })
    }

    // 4. Uptime Filter
    if (uptimeFilter !== "all") {
      filtered = filtered.filter((device) => {
        const raw = Number(device.uptime)
        let pct = 0
        if (Number.isFinite(raw)) {
          pct = raw <= 1 ? raw * 100 : raw
        }
        switch (uptimeFilter) {
          case "offline":
            return pct === 0
          case "good":
            return pct >= 85
          case "moderate":
            return pct >= 50 && pct < 85
          case "critical":
            return pct > 0 && pct < 50
          default:
            return true
        }
      })
    }

    // 5. Error Margin Filter
    if (errorMarginFilter !== "all") {
      filtered = filtered.filter((device) => {
        const em = Number(device.error_margin)
        if (!Number.isFinite(em)) return false
        switch (errorMarginFilter) {
          case "good":
            return em <= 10
          case "moderate":
            return em > 10 && em <= 20
          case "critical":
            return em > 20
          default:
            return true
        }
      })
    }

    // 6. LoRaWAN Radius Coverage Filter
    if (coverageFilter !== "all" && gateways.length > 0) {
      filtered = filtered.filter((device) => {
        if (device.latitude == null || device.longitude == null) return false
        let isCovered = false
        for (const gw of gateways) {
          if (gw.enabled === false || gw.latitude == null || gw.longitude == null) continue
          const dist = calculateDistance(device.latitude, device.longitude, gw.latitude, gw.longitude)
          const att = calculateSignalAttenuation(dist, gw)
          if (att.quality !== "none") {
            isCovered = true
            break
          }
        }
        if (coverageFilter === "inside_radius") return isCovered
        if (coverageFilter === "outside_radius") return !isCovered
        return true
      })
    }

    return filtered
  }, [
    mapData,
    offlineDaysFilter,
    selectedAirQloud,
    selectedGrid,
    uptimeFilter,
    errorMarginFilter,
    coverageFilter,
    gateways,
  ])

  // Coverage statistics computed against filtered map items
  const coverageStats = useMemo(() => {
    return computeGatewayCoverageStats(gateways, filteredMapData)
  }, [gateways, filteredMapData])

  // Route calculation: orders stops and draws the path along real roads (OSRM),
  // falling back to straight-line nearest neighbour when the road service is unavailable.
  /** `startAt` overrides the start mode, for re-planning right after it changes. */
  const calculateRoute = async (devices?: MaintenanceMapItem[], startAt?: Coordinates & { name?: string }) => {
    const source = devices || (selectedDeviceIds.length > 0
      ? filteredMapData.filter((d) => selectedDeviceIds.includes(d.device_id))
      : filteredMapData)

    if (!source || source.length === 0) {
      toast({
        title: "Routing Error",
        description: `No ${itemNoun.plural} available to plan a route.`,
        variant: "destructive",
      })
      return
    }

    const validDevices = source.filter(hasMapCoordinates)

    if (validDevices.length === 0) {
      toast({
        title: "Routing Error",
        description: `No ${itemNoun.plural} with valid coordinates found in this view.`,
        variant: "destructive",
      })
      return
    }

    routeAbortRef.current?.abort()
    const controller = new AbortController()
    routeAbortRef.current = controller
    setIsRouting(true)

    // Resolve the start point
    let start: Coordinates & { name?: string } = startAt ?? DEFAULT_HOME_LOCATION
    if (!startAt && routeStartMode === "current") {
      try {
        const pos = await getCurrentPosition()
        setCurrentLocation(pos)
        start = { ...pos, name: "My Location" }
      } catch (err) {
        toast({
          title: "Location unavailable",
          description: `${err instanceof Error ? err.message : "Could not get your location"}. Starting from ${DEFAULT_HOME_LOCATION.name} instead.`,
          variant: "destructive",
        })
        setRouteStartMode("office")
      }
    }

    const routePoints = validDevices.map((d) => ({
      ...d,
      id: d.device_id,
      latitude: Number(d.latitude),
      longitude: Number(d.longitude),
    }))

    // Straight-line round trip: the route itself while road routing is off, the fallback otherwise
    const routeInStraightLines = (reason?: string) => {
      const trip = optimizeRoundTrip(start, routePoints)
      setRoutePath(trip.order as unknown as MaintenanceMapItem[])
      setRouteGeometry(null)
      setRouteSummary({ distanceKm: trip.distanceKm, legs: trip.legs, byRoad: false, mode: ROUTE_MODE_LABELS.straightLine })
      toast({
        title: "Route Optimized",
        description: `${reason ? `${reason} ` : ""}${trip.order.length} stops, ordered to keep the trip short. Open it in Google Maps for directions.`,
      })
    }

    // Cancelled while the location was being read
    if (controller.signal.aborted) return

    try {
      if (!ROAD_ROUTING_ENABLED) {
        routeInStraightLines()
        return
      }
      const road = await calculateRoadRoute(start, routePoints, controller.signal)
      if (controller.signal.aborted) return
      setRoutePath(road.order as unknown as MaintenanceMapItem[])
      setRouteGeometry(road.geometry)
      setRouteSummary({
        distanceKm: road.distanceKm,
        durationMin: road.durationMin,
        legs: road.legs,
        byRoad: true,
        mode: ROUTE_MODE_LABELS[road.planner],
      })
      toast({
        title: "Route Optimized",
        description: `${road.order.length} stops · ${formatDistanceKm(road.distanceKm)} · about ${formatDurationMin(road.durationMin)} driving.`,
      })
    } catch (err) {
      if (controller.signal.aborted) return
      console.warn("Road routing unavailable, using straight-line route:", err)
      routeInStraightLines("Road routing service unreachable.")
    } finally {
      if (!controller.signal.aborted) setIsRouting(false)
    }
  }

  const clearRoute = () => {
    routeAbortRef.current?.abort()
    setIsRouting(false)
    setRoutePath([])
    setRouteGeometry(null)
    setRouteSummary(null)
  }

  // Items close to the route that need a visit, from everything in this view whatever the filters
  const routeSuggestions = useMemo<RouteSuggestion[]>(
    () => (routePath.length > 0 ? suggestRouteAdditions(homeLocation, routePath, mapData ?? []) : []),
    [routePath, mapData, homeLocation]
  )

  // Leg distances are shown for road routes only
  const roadLegs = routeSummary?.byRoad ? routeSummary.legs : undefined

  // The route as Google Maps driving directions: start, the stops in order, back to the start.
  // Links opened here take as many stops as Google Maps allows on this device. Copied or shared
  // links are mostly opened on a phone, whose browser takes 3, so they keep to that.
  const onPhone = useMemo(() => isPhoneBrowser(), [])
  const googleMapsWaypoints = onPhone ? GOOGLE_MAPS_PHONE_MAX_WAYPOINTS : GOOGLE_MAPS_MAX_WAYPOINTS
  const routeTripPoints = useMemo(
    () => [
      homeLocation,
      ...routePath.map((stop) => ({ latitude: Number(stop.latitude), longitude: Number(stop.longitude) })),
      homeLocation,
    ],
    [homeLocation, routePath]
  )
  const googleMapsLinks = useMemo(
    () => buildGoogleMapsDirectionsLinks(routeTripPoints, googleMapsWaypoints),
    [routeTripPoints, googleMapsWaypoints]
  )
  const sharedGoogleMapsLinks = useMemo(
    () => buildGoogleMapsDirectionsLinks(routeTripPoints, GOOGLE_MAPS_PHONE_MAX_WAYPOINTS),
    [routeTripPoints]
  )
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  const routeShareText = () =>
    [
      `Maintenance route: ${countLabel(routePath.length, itemNoun)} from ${homeLocation.name ?? "the start"}`,
      ...routePath.map((stop, i) => `${i + 1}. ${stop.device_name || stop.device_id}`),
      "",
      ...sharedGoogleMapsLinks.map((link, i) =>
        sharedGoogleMapsLinks.length > 1
          ? `Google Maps part ${i + 1} (${describeGoogleMapsLink(link, routePath.length)}): ${link.url}`
          : `Google Maps: ${link.url}`
      ),
    ].join("\n")

  const handleCopyRoute = async () => {
    try {
      await navigator.clipboard.writeText(routeShareText())
      toast({ title: "Route copied", description: "The stops and Google Maps links are on your clipboard." })
    } catch {
      toast({ title: "Couldn't copy the route", variant: "destructive" })
    }
  }

  const handleShareRoute = async () => {
    try {
      await navigator.share({ title: "Maintenance route", text: routeShareText() })
    } catch (err) {
      // Closing the share sheet rejects with AbortError; that's not a failure
      if (!(err instanceof DOMException && err.name === "AbortError")) handleCopyRoute()
    }
  }

  const handleAddSuggestion = (item: MaintenanceMapItem) => {
    const stops = [...routePath, item]
    setSelectedDeviceIds(stops.map((stop) => stop.device_id))
    calculateRoute(stops)
  }

  // Switching to My Location asks for it straight away, so a refusal shows now rather than at
  // the next Optimize; a route on the map is re-planned from the new start
  const toggleRouteStartMode = async () => {
    if (routeStartMode === "current") {
      setRouteStartMode("office")
      if (routePath.length > 0) calculateRoute(routePath, DEFAULT_HOME_LOCATION)
      return
    }
    try {
      const pos = await getCurrentPosition()
      setCurrentLocation(pos)
      setRouteStartMode("current")
      // Replan the route as it is now: a view switch or filter change while the location was
      // looked up dropped the one this click saw
      const route = routePathRef.current
      if (route.length > 0) calculateRoute(route, { ...pos, name: "My Location" })
    } catch (err) {
      toast({
        title: "Location unavailable",
        description: `${err instanceof Error ? err.message : "Could not get your location"}. Routes still start from ${DEFAULT_HOME_LOCATION.name}.`,
        variant: "destructive",
      })
    }
  }

  const handleToggleRouteDevice = (device: MaintenanceMapItem) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(device.device_id)
        ? prev.filter((id) => id !== device.device_id)
        : [...prev, device.device_id]
    )
  }

  const handleFocusMapDevice = (device: MaintenanceMapItem) => {
    if (hasMapCoordinates(device)) {
      setFlyToLocation({
        latitude: Number(device.latitude),
        longitude: Number(device.longitude),
        zoom: 14,
      })
    }
  }

  const handleSelectAllPolygon = () => {
    const ids = polygonSelectedDevices.map((d) => d.device_id)
    setSelectedDeviceIds((prev) => Array.from(new Set([...prev, ...ids])))
    toast({
      title: `${itemNoun.plural[0].toUpperCase()}${itemNoun.plural.slice(1)} selected`,
      description: `${countLabel(ids.length, itemNoun)} in the area added to the route selection.`,
    })
  }

  const handleClearPolygon = () => {
    setPolygonSelectedDevices([])
  }

  // Export CSV Helper
  const handleExportCSV = (devicesToExport?: MaintenanceMapItem[]) => {
    const targetDevices =
      devicesToExport ||
      (polygonSelectedDevices.length > 0 ? polygonSelectedDevices : filteredMapData)

    if (!targetDevices || targetDevices.length === 0) {
      toast({
        title: "Export Error",
        description: `No ${itemNoun.plural} available to export.`,
        variant: "destructive",
      })
      return
    }

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""'
      let str = String(val)
      if (/^[=+\-@]/.test(str)) str = `'${str}`
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const headers = [
      ...(mapView === "sites" ? ["Site Name", "Site ID", "Devices"] : ["Device Name", "Device Number", "Device ID"]),
      "Latitude",
      "Longitude",
      "Uptime (%)",
      "Error Margin",
      "Nearest LoRaWAN Gateway",
      "Distance to Gateway (km)",
      "LoRaWAN Signal Quality",
      "Coverage Status",
      "Estimated RSSI (dBm)",
    ]

    const rows = targetDevices.map((device) => {
      const rawUptime = Number(device.uptime)
      const uptimePct = Number.isFinite(rawUptime)
        ? rawUptime <= 1
          ? rawUptime * 100
          : rawUptime
        : 0
      const em = Number(device.error_margin)
      const errorMarginStr = Number.isFinite(em) ? em.toFixed(2) : "N/A"
      const cov = coverageStats.deviceCoverageMap[device.device_id]

      const identity = device.site
        ? [device.site.site_name, device.site.generated_name ?? "", device.site.number_of_devices]
        : [device.device_name || device.device_id || "", device.device_number ?? (device as any).deviceNumber ?? "", device.device_id || ""]

      return [
        ...identity.map(escapeCSV),
        escapeCSV(device.latitude ?? ""),
        escapeCSV(device.longitude ?? ""),
        escapeCSV(uptimePct.toFixed(1)),
        escapeCSV(errorMarginStr),
        escapeCSV(cov?.nearestGatewayName || "None"),
        escapeCSV(cov ? `${cov.distanceKm.toFixed(2)} km` : "N/A"),
        escapeCSV(cov ? cov.signalQuality.toUpperCase() : "NONE"),
        escapeCSV(cov && cov.signalQuality !== "none" ? "Inside Radius" : "Blindspot"),
        escapeCSV(cov ? `${cov.estimatedRssiDbm} dBm` : "N/A"),
      ]
    })

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `maintenance-${itemNoun.plural}-${new Date().toISOString().split("T")[0]}.csv`
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      a.remove()
    }, 0)

    toast({
      title: "CSV Exported",
      description: `Exported ${countLabel(targetDevices.length, itemNoun)} to CSV.`,
    })
  }

  // Fetch map data on filter update, or a switch between devices and sites. A route planned
  // for the previous items is dropped, along with any road request still planning one.
  useEffect(() => {
    let cancelled = false
    routeAbortRef.current?.abort()
    setIsRouting(false)
    setRoutePath([])
    fetchMapData().then((res) => {
      if (!cancelled && res) setMapData(res)
    })
    return () => {
      cancelled = true
    }
  }, [fetchMapData])

  const handleRefreshData = useCallback(async () => {
    const res = await fetchMapData()
    if (res) {
      setMapData(res)
    }
  }, [fetchMapData])

  const selectedGridItem = grids.find((item) => item.name === selectedGrid)
  const selectedGridLabel =
    selectedGrid === "all"
      ? "All Grids"
      : selectedGridItem?.long_name || selectedGridItem?.name || selectedGrid

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Desktop Layout (md+) */}
      <div className="hidden md:flex gap-3 overflow-hidden h-full flex-1">
        {/* Left Floating Sidebar */}
        <div
          className={`flex-none transition-all duration-300 ease-in-out ${
            isSidebarCollapsed
              ? "w-0 opacity-0 -translate-x-4 pointer-events-none overflow-hidden"
              : "w-80 lg:w-96 opacity-100 translate-x-0"
          }`}
          style={
            {
              "--sidebar-height": "100%",
            } as React.CSSProperties
          }
        >
          <MapSidebar
            devices={filteredMapData}
            view={mapView}
            onViewChange={handleMapViewChange}
            itemNoun={itemNoun}
            loading={loadingMap}
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
            coverageStats={coverageStats}
            showLoRaWAN={showGateways}
            polygonDevices={polygonSelectedDevices}
            onClearPolygon={handleClearPolygon}
            onSelectAllPolygonForRoute={handleSelectAllPolygon}
            onExportPolygonCSV={() => handleExportCSV(polygonSelectedDevices)}
            selectedDeviceIds={selectedDeviceIds}
            onToggleRouteDevice={handleToggleRouteDevice}
            onClearRouteSelection={() => setSelectedDeviceIds([])}
            onFocusMapDevice={handleFocusMapDevice}
            onCollapse={() => setIsSidebarCollapsed(true)}
          />
        </div>

        {/* Map Canvas & Floating Overlays */}
        <div className="flex-1 min-w-0 relative h-full rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-800 shadow-md">
          {/* Leaflet Map Component with Unified Top Controls */}
          <MaintenanceMap
            data={filteredMapData}
            loading={loadingMap}
            selectedDevice={selectedDevice}
            onDeviceSelect={setSelectedDevice}
            selectedDeviceIds={selectedDeviceIds}
            routePath={routePath}
            routeGeometry={routeGeometry}
            homeLocation={homeLocation}
            routeStartMode={routeStartMode}
            onToggleRouteStartMode={toggleRouteStartMode}
            onPolygonSelect={setPolygonSelectedDevices}
            gateways={gateways}
            showGateways={showGateways}
            onToggleGateways={handleToggleGateways}
            showDeviceNames={showDeviceNames}
            onToggleDeviceNames={setShowDeviceNames}
            onOpenGatewayDialog={() => setGatewayDialogOpen(true)}
            onExportMap={() => setExportDialogOpen(true)}
            onExportCSV={() => handleExportCSV()}
            onToggleRoute={isRouting || routePath.length > 0 ? clearRoute : () => calculateRoute()}
            isRouting={isRouting}
            highlightUncoveredDevices={highlightUncoveredDevices}
            onToggleHighlightUncovered={setHighlightUncoveredDevices}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            coverageFilter={coverageFilter}
            onCoverageFilterChange={setCoverageFilter}
            onRefreshData={handleRefreshData}
            isRefreshing={loadingMap}
            flyToLocation={flyToLocation}
            resetKey={mapView}
            topFilters={
              <>
                {/* Floating Expand Sidebar Button (when sidebar is collapsed) */}
                {isSidebarCollapsed && (
                  <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full shadow-md border border-gray-200/80 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-all flex-shrink-0"
                    title={`Show the ${itemNoun.singular} list`}
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span className="capitalize">{itemNoun.plural}</span>
                    <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold">
                      {filteredMapData.length}
                    </span>
                  </button>
                )}

                {/* Top Filter Toolbar */}
                <MapTopFilters
                  selectedDays={selectedDays}
                  onDaysChange={setSelectedDays}
                  offlineDaysFilter={offlineDaysFilter}
                  onOfflineDaysChange={setOfflineDaysFilter}
                  uptimeFilter={uptimeFilter}
                  onUptimeChange={(val) => {
                    setUptimeFilter(val)
                    clearRoute()
                  }}
                  errorMarginFilter={errorMarginFilter}
                  onErrorMarginChange={(val) => {
                    setErrorMarginFilter(val)
                    clearRoute()
                  }}
                  selectedCohort={selectedAirQloud}
                  onCohortChange={(val) => {
                    setSelectedAirQloud(val)
                    clearRoute()
                  }}
                  cohorts={cohorts}
                  loadingCohorts={loadingAirQlouds}
                  cohortSearch={cohortSearch}
                  onCohortSearchChange={setCohortSearch}
                  selectedGrid={selectedGrid}
                  onGridChange={(val) => {
                    setSelectedGrid(val)
                    clearRoute()
                  }}
                  grids={grids}
                  loadingGrids={loadingGrids}
                  gridSearch={gridSearch}
                  onGridSearchChange={setGridSearch}
                  gridAdminLevelFilter={gridAdminLevelFilter}
                  onGridAdminLevelChange={setGridAdminLevelFilter}
                  selectedTags={selectedTags}
                  onToggleTag={toggleTag}
                  onClearTags={() => setSelectedTags([])}
                  coverageFilter={coverageFilter}
                  onCoverageFilterChange={setCoverageFilter}
                  totalCount={mapData?.length}
                  filteredCount={filteredMapData.length}
                  hasGateways={gateways.length > 0}
                  showLoRaWAN={showGateways}
                  coveragePercentage={coverageStats.coveragePercentage}
                  itemNoun={itemNoun}
                />
              </>
            }
          />

          {/* Route Itinerary Bottom Strip */}
          {routePath.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-3 animate-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    Route Itinerary ({routePath.length} stops)
                  </span>
                  {/* Road distance and time only; straight-line figures don't match how people travel */}
                  {routeSummary?.byRoad && routeSummary.durationMin != null && (
                    <span className="hidden sm:inline text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                      {formatDistanceKm(routeSummary.distanceKm)} · ~{formatDurationMin(routeSummary.durationMin)} by road
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-[10px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="Open or share this route in Google Maps"
                    >
                      <AqMap01 className="w-3.5 h-3.5 text-blue-600" />
                      Google Maps
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 z-[1100]">
                    {googleMapsLinks.length > 1 && (
                      <DropdownMenuLabel className="text-[10px] font-normal text-muted-foreground">
                        Google Maps takes up to {googleMapsWaypoints} stops per link{onPhone ? " in a phone's browser" : ""}, so this route is in {googleMapsLinks.length} parts
                      </DropdownMenuLabel>
                    )}
                    {googleMapsLinks.map((link, i) => (
                      <DropdownMenuItem key={link.url} onSelect={() => window.open(link.url, "_blank", "noopener,noreferrer")}>
                        <AqLinkExternal01 className="w-3.5 h-3.5 mr-2" />
                        {googleMapsLinks.length > 1
                          ? `Part ${i + 1}: ${describeGoogleMapsLink(link, routePath.length)}`
                          : "Open in Google Maps"}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleCopyRoute}>
                      <AqCopy01 className="w-3.5 h-3.5 mr-2" />
                      Copy stops and links
                    </DropdownMenuItem>
                    {canShare && (
                      <DropdownMenuItem onSelect={handleShareRoute}>
                        <AqShare01 className="w-3.5 h-3.5 mr-2" />
                        Share…
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  onClick={clearRoute}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600"
                  title="Close route"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <div className="flex flex-col items-center min-w-[55px] flex-shrink-0" title={homeLocation.name}>
                  <span className="text-[9px] font-bold text-gray-400 mb-0.5">START</span>
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {routeStartMode === "current" ? <Navigation className="w-3 h-3" /> : "H"}
                  </div>
                </div>

                <RouteLegArrow leg={roadLegs?.[0]} />

                {routePath.map((stop, idx) => (
                  <React.Fragment key={stop.device_id}>
                    <div
                      onClick={() => handleFocusMapDevice(stop)}
                      className="flex flex-col items-center min-w-[80px] max-w-[100px] flex-shrink-0 cursor-pointer group"
                    >
                      <span className="text-[9px] font-bold text-gray-400 mb-0.5">
                        STOP {idx + 1}
                      </span>
                      <div className="w-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-md px-1.5 py-1 text-center group-hover:bg-blue-100 transition-colors">
                        <div
                          className="text-[10px] font-bold text-blue-700 dark:text-blue-300 truncate"
                          title={stop.device_name || stop.device_id}
                        >
                          {stop.device_name || stop.device_id}
                        </div>
                      </div>
                    </div>
                    {idx < routePath.length - 1 && (
                      <RouteLegArrow leg={roadLegs?.[idx + 1]} />
                    )}
                  </React.Fragment>
                ))}

                <RouteLegArrow leg={roadLegs?.[routePath.length]} />
                <div className="flex flex-col items-center min-w-[55px] flex-shrink-0" title={homeLocation.name}>
                  <span className="text-[9px] font-bold text-gray-400 mb-0.5">END</span>
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {routeStartMode === "current" ? <Navigation className="w-3 h-3" /> : "H"}
                  </div>
                </div>
              </div>

              {/* Worth adding: close to the route and needing a visit */}
              {routeSuggestions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Close to this route and needing a visit
                  </div>
                  <div className="flex items-stretch gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {routeSuggestions.map(({ item, nearStopName, reasons, severity }) => (
                      <div
                        key={item.device_id}
                        className={`flex items-center gap-2 flex-shrink-0 max-w-[240px] rounded-md border px-2 py-1 ${
                          severity >= 3
                            ? "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                            : "border-red-200 bg-red-50/60 dark:bg-red-950/30 dark:border-red-900"
                        }`}
                      >
                        <button
                          onClick={() => handleFocusMapDevice(item)}
                          className="min-w-0 text-left"
                          title={`Show ${item.device_name} on the map`}
                        >
                          <div className="text-[10px] font-bold text-gray-800 dark:text-gray-200 truncate">
                            {item.device_name || item.device_id}
                          </div>
                          <div className="text-[9px] text-gray-500 dark:text-gray-400 truncate">
                            {reasons.join(" · ")} · near {nearStopName}
                          </div>
                        </button>
                        <button
                          onClick={() => handleAddSuggestion(item)}
                          disabled={isRouting}
                          className="flex-shrink-0 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold hover:bg-blue-700 disabled:opacity-50"
                          title={`Add ${item.device_name} to the route`}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout (< md) */}
      <div className="flex flex-col md:hidden h-full">
        {/* Map Pane on Top */}
        <div
          className="relative overflow-hidden flex-none transition-all duration-300 ease-in-out"
          style={{
            height:
              mobileViewMode === "map-expanded"
                ? "78dvh"
                : mobileViewMode === "list-expanded"
                ? "18dvh"
                : "40dvh",
          }}
        >
          <MaintenanceMap
            data={filteredMapData}
            loading={loadingMap}
            selectedDevice={selectedDevice}
            onDeviceSelect={setSelectedDevice}
            selectedDeviceIds={selectedDeviceIds}
            routePath={routePath}
            routeGeometry={routeGeometry}
            homeLocation={homeLocation}
            routeStartMode={routeStartMode}
            onToggleRouteStartMode={toggleRouteStartMode}
            onPolygonSelect={setPolygonSelectedDevices}
            gateways={gateways}
            showGateways={showGateways}
            onToggleGateways={handleToggleGateways}
            showDeviceNames={showDeviceNames}
            onToggleDeviceNames={setShowDeviceNames}
            onOpenGatewayDialog={() => setGatewayDialogOpen(true)}
            onExportMap={() => setExportDialogOpen(true)}
            onExportCSV={() => handleExportCSV()}
            onToggleRoute={isRouting || routePath.length > 0 ? clearRoute : () => calculateRoute()}
            isRouting={isRouting}
            highlightUncoveredDevices={highlightUncoveredDevices}
            onToggleHighlightUncovered={setHighlightUncoveredDevices}
            coverageFilter={coverageFilter}
            onCoverageFilterChange={setCoverageFilter}
            onRefreshData={handleRefreshData}
            isRefreshing={loadingMap}
            flyToLocation={flyToLocation}
            resetKey={mapView}
          />
        </div>

        {/* Mobile View Mode Switcher Divider */}
        <div className="flex-none bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 px-3 py-1.5 flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="capitalize">{countLabel(filteredMapData.length, itemNoun)}</span>
          </div>

          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-full text-[11px] font-semibold">
            <button
              onClick={() => setMobileViewMode("map-expanded")}
              className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                mobileViewMode === "map-expanded"
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setMobileViewMode("split")}
              className={`px-2.5 py-0.5 rounded-full transition-all ${
                mobileViewMode === "split"
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setMobileViewMode("list-expanded")}
              className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                mobileViewMode === "list-expanded"
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <List className="w-3 h-3" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Sidebar Pane on Bottom */}
        <div
          className="flex-none overflow-hidden transition-all duration-300 ease-in-out"
          style={
            {
              height:
                mobileViewMode === "map-expanded"
                  ? "18dvh"
                  : mobileViewMode === "list-expanded"
                  ? "78dvh"
                  : "56dvh",
              "--sidebar-height":
                mobileViewMode === "map-expanded"
                  ? "18dvh"
                  : mobileViewMode === "list-expanded"
                  ? "78dvh"
                  : "56dvh",
            } as React.CSSProperties
          }
        >
          <MapSidebar
            devices={filteredMapData}
            view={mapView}
            onViewChange={handleMapViewChange}
            itemNoun={itemNoun}
            loading={loadingMap}
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
            coverageStats={coverageStats}
            showLoRaWAN={showGateways}
            polygonDevices={polygonSelectedDevices}
            onClearPolygon={handleClearPolygon}
            onSelectAllPolygonForRoute={handleSelectAllPolygon}
            onExportPolygonCSV={() => handleExportCSV(polygonSelectedDevices)}
            selectedDeviceIds={selectedDeviceIds}
            onToggleRouteDevice={handleToggleRouteDevice}
            onClearRouteSelection={() => setSelectedDeviceIds([])}
            onFocusMapDevice={handleFocusMapDevice}
            className="rounded-none border-x-0 border-b-0"
          />
        </div>
      </div>

      {/* LoRaWAN Gateway Dialog */}
      <LoRaWANGatewayDialog
        open={gatewayDialogOpen}
        onOpenChange={setGatewayDialogOpen}
        gateways={gateways}
        onGatewaysChange={handleGatewaysChange}
      />

      {/* Map Export Dialog */}
      <MapExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        mapElementId="maintenance-map-container"
        devices={filteredMapData || []}
        itemNoun={itemNoun}
        gateways={gateways}
        routePath={routePath}
        routeMode={routeSummary?.mode}
        selectedCohort={selectedAirQloud === "all" ? "All Cohorts" : selectedAirQloud}
        selectedGrid={selectedGridLabel}
        periodDays={selectedDays}
      />
    </div>
  )
}
