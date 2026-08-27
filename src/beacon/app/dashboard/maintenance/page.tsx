"use client"

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { getMaintenanceMapData, getSyncedGrids } from "@/services/device-api.service"
import { GridAdminLevel, MaintenanceMapItem, SyncedGrid } from "@/types/api.types"
import { airQloudService, type AirQloudBasic } from "@/services/airqloud.service"
import { calculateNearestNeighborRoute, Coordinates } from "@/utils/routing-utils"
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
import { CheckCircle2, ArrowRight, X, PanelLeftOpen, PanelLeftClose, Map as MapIcon, List, ChevronUp, ChevronDown } from "lucide-react"

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

export default function MaintenancePage() {
  const { toast } = useToast()
  const { activeGroup, loading: groupLoading } = useGroup()

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
  const [homeLocation] = useState<Coordinates & { name?: string }>(DEFAULT_HOME_LOCATION)

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

  // Fetch Maintenance Map Data
  const fetchMapData = useCallback(async () => {
    if (groupLoading || !activeGroup) return null
    setLoadingMap(true)
    try {
      const tagsParam = selectedTags.length > 0 ? selectedTags.join(",") : undefined
      const response = await getMaintenanceMapData(selectedDays, tagsParam, activeGroup)
      return response
    } catch (error) {
      console.error("Failed to fetch Map data", error)
      return null
    } finally {
      setLoadingMap(false)
    }
  }, [selectedDays, selectedTags, activeGroup, groupLoading])

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

  // Route calculation
  const calculateRoute = (devices?: MaintenanceMapItem[]) => {
    const source = devices || (selectedDeviceIds.length > 0
      ? filteredMapData.filter((d) => selectedDeviceIds.includes(d.device_id))
      : filteredMapData)

    if (!source || source.length === 0) {
      toast({
        title: "Routing Error",
        description: "No devices available to plan a route.",
        variant: "destructive",
      })
      return
    }

    setIsRouting(true)
    const validDevices = source.filter(
      (item) => item.latitude != null && item.longitude != null
    )

    if (validDevices.length === 0) {
      setIsRouting(false)
      toast({
        title: "Routing Error",
        description: "No devices with valid coordinates found in this view.",
        variant: "destructive",
      })
      return
    }

    const routePoints = validDevices.map((d) => ({
      ...d,
      id: d.device_id,
      latitude: d.latitude!,
      longitude: d.longitude!,
    }))

    const optimized = calculateNearestNeighborRoute(homeLocation, routePoints)
    setRoutePath(optimized as unknown as MaintenanceMapItem[])

    toast({
      title: "Route Optimized",
      description: `Optimized itinerary generated for ${optimized.length} stops.`,
    })
  }

  const clearRoute = () => {
    setIsRouting(false)
    setRoutePath([])
  }

  const handleToggleRouteDevice = (device: MaintenanceMapItem) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(device.device_id)
        ? prev.filter((id) => id !== device.device_id)
        : [...prev, device.device_id]
    )
  }

  const handleFocusMapDevice = (device: MaintenanceMapItem) => {
    const lat = Number(device.latitude)
    const lng = Number(device.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setFlyToLocation({
        latitude: lat,
        longitude: lng,
        zoom: 14,
      })
    }
  }

  const handleSelectAllPolygon = () => {
    const ids = polygonSelectedDevices.map((d) => d.device_id)
    setSelectedDeviceIds((prev) => Array.from(new Set([...prev, ...ids])))
    toast({
      title: "Devices Selected",
      description: `${ids.length} area devices added to route selection.`,
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
        description: "No devices available to export.",
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
      "Device Name",
      "Device Number",
      "Device ID",
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

      return [
        escapeCSV(device.device_name || device.device_id || ""),
        escapeCSV(device.device_number ?? (device as any).deviceNumber ?? ""),
        escapeCSV(device.device_id || ""),
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
    a.download = `maintenance-devices-${new Date().toISOString().split("T")[0]}.csv`
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      a.remove()
    }, 0)

    toast({
      title: "CSV Exported",
      description: `Exported ${targetDevices.length} devices to CSV.`,
    })
  }

  // Fetch map data on filter update
  useEffect(() => {
    let cancelled = false
    setIsRouting(false)
    setRoutePath([])
    fetchMapData().then((res) => {
      if (!cancelled && res) setMapData(res)
    })
    return () => {
      cancelled = true
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
            homeLocation={homeLocation}
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
            onRefreshData={fetchMapData}
            isRefreshing={loadingMap}
            flyToLocation={flyToLocation}
            topFilters={
              <>
                {/* Floating Expand Sidebar Button (when sidebar is collapsed) */}
                {isSidebarCollapsed && (
                  <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full shadow-md border border-gray-200/80 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-all flex-shrink-0"
                    title="Show Device List & Search Sidebar"
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Devices</span>
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
                </div>
                <button
                  onClick={clearRoute}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600"
                  title="Close route"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <div className="flex flex-col items-center min-w-[55px] flex-shrink-0">
                  <span className="text-[9px] font-bold text-gray-400 mb-0.5">START</span>
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    H
                  </div>
                </div>

                <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />

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
                      <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}

                <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                <div className="flex flex-col items-center min-w-[55px] flex-shrink-0">
                  <span className="text-[9px] font-bold text-gray-400 mb-0.5">END</span>
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    H
                  </div>
                </div>
              </div>
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
            homeLocation={homeLocation}
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
            onRefreshData={fetchMapData}
            isRefreshing={loadingMap}
            flyToLocation={flyToLocation}
          />
        </div>

        {/* Mobile View Mode Switcher Divider */}
        <div className="flex-none bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 px-3 py-1.5 flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{filteredMapData.length} Devices</span>
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
        gateways={gateways}
        routePath={routePath}
        selectedCohort={selectedAirQloud === "all" ? "All Cohorts" : selectedAirQloud}
        selectedGrid={selectedGridLabel}
        periodDays={selectedDays}
      />
    </div>
  )
}
