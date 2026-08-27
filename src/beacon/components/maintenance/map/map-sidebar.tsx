"use client"

import React, { useState, useMemo } from "react"
import { MaintenanceMapItem } from "@/types/api.types"
import { GatewayCoverageStats } from "@/types/lorawan.types"
import { MapHeader } from "./map-header"
import { DeviceLocationCard } from "./device-location-card"
import { DeviceDetailsPanel } from "./device-details-panel"
import { PolygonAreaPanel } from "./polygon-area-panel"
import { Card } from "@/components/ui/card"
import { Pentagon, Layers, Radio, CheckCircle2, AlertTriangle, AlertCircle, CircleOff } from "lucide-react"

interface MapSidebarProps {
  devices: MaintenanceMapItem[]
  loading?: boolean
  selectedDevice: MaintenanceMapItem | null
  onSelectDevice: (device: MaintenanceMapItem | null) => void
  coverageStats?: GatewayCoverageStats
  showLoRaWAN?: boolean
  polygonDevices?: MaintenanceMapItem[]
  onClearPolygon?: () => void
  onSelectAllPolygonForRoute?: () => void
  onExportPolygonCSV?: () => void
  selectedDeviceIds?: string[]
  onToggleRouteDevice?: (device: MaintenanceMapItem) => void
  onFocusMapDevice?: (device: MaintenanceMapItem) => void
  onCollapse?: () => void
  className?: string
}

type QuickStatusFilter = "all" | "offline" | "critical" | "moderate" | "good"

export const MapSidebar: React.FC<MapSidebarProps> = ({
  devices = [],
  loading = false,
  selectedDevice,
  onSelectDevice,
  coverageStats,
  showLoRaWAN = false,
  polygonDevices = [],
  onClearPolygon,
  onSelectAllPolygonForRoute,
  onExportPolygonCSV,
  selectedDeviceIds = [],
  onToggleRouteDevice,
  onFocusMapDevice,
  onCollapse,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [quickStatus, setQuickStatus] = useState<QuickStatusFilter>("all")
  const [showPolygonView, setShowPolygonView] = useState(false)

  // Filter devices based on search query and quick status
  const filteredDevices = useMemo(() => {
    let list = devices

    // Quick status filter
    if (quickStatus !== "all") {
      list = list.filter((device) => {
        const raw = Number(device.uptime)
        const uptimePct = Number.isFinite(raw) ? (raw <= 1 ? raw * 100 : raw) : 0
        const isOffline = uptimePct === 0 || !device.last_active

        switch (quickStatus) {
          case "offline":
            return isOffline
          case "critical":
            return !isOffline && uptimePct < 50
          case "moderate":
            return !isOffline && uptimePct >= 50 && uptimePct < 85
          case "good":
            return !isOffline && uptimePct >= 85
          default:
            return true
        }
      })
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((device) => {
        const name = (device.device_name || "").toLowerCase()
        const id = (device.device_id || "").toLowerCase()
        const num = String(device.device_number ?? (device as any).deviceNumber ?? "").toLowerCase()
        const cohorts = (device.cohorts || []).join(" ").toLowerCase()
        const grids = (device.grids || []).join(" ").toLowerCase()

        return (
          name.includes(q) ||
          id.includes(q) ||
          num.includes(q) ||
          cohorts.includes(q) ||
          grids.includes(q)
        )
      })
    }

    return list
  }, [devices, quickStatus, searchQuery])

  // Count by status for quick pills
  const statusCounts = useMemo(() => {
    let offline = 0
    let critical = 0
    let moderate = 0
    let good = 0

    devices.forEach((d) => {
      const raw = Number(d.uptime)
      const pct = Number.isFinite(raw) ? (raw <= 1 ? raw * 100 : raw) : 0
      if (pct === 0 || !d.last_active) offline++
      else if (pct < 50) critical++
      else if (pct < 85) moderate++
      else good++
    })

    return { total: devices.length, offline, critical, moderate, good }
  }, [devices])

  return (
    <Card
      className={`flex flex-col overflow-hidden w-full md:w-80 lg:w-96 min-w-[300px] md:max-w-[380px] rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg ${className}`}
      style={
        {
          height: "var(--sidebar-height, 100%)",
        } as React.CSSProperties
      }
    >
      {/* View 1: Device Details View */}
      {selectedDevice ? (
        <DeviceDetailsPanel
          device={selectedDevice}
          onBack={() => onSelectDevice(null)}
          coverageInfo={coverageStats?.deviceCoverageMap[selectedDevice.device_id]}
          showLoRaWAN={showLoRaWAN}
          isDeviceInRoute={selectedDeviceIds.includes(selectedDevice.device_id)}
          onToggleRoute={onToggleRouteDevice}
          onFocusMap={onFocusMapDevice}
        />
      ) : showPolygonView && polygonDevices.length > 0 ? (
        /* View 2: Polygon Area Selection Panel */
        <PolygonAreaPanel
          devices={polygonDevices}
          onClose={() => setShowPolygonView(false)}
          onClearArea={() => {
            onClearPolygon?.()
            setShowPolygonView(false)
          }}
          onSelectAllForRoute={onSelectAllPolygonForRoute}
          onExportCSV={onExportPolygonCSV}
          onDeviceClick={(dev) => {
            onSelectDevice(dev)
            onFocusMapDevice?.(dev)
          }}
          selectedDeviceIds={selectedDeviceIds}
        />
      ) : (
        /* View 3: Device List & Search View */
        <>
          {/* Header with Search */}
          <MapHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery("")}
            totalCount={devices.length}
            filteredCount={filteredDevices.length}
            onCollapse={onCollapse}
          />

          {/* Quick Filter Status Pills */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex-none overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-max">
              {/* All */}
              <button
                onClick={() => setQuickStatus("all")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  quickStatus === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                All ({statusCounts.total})
              </button>

              {/* Offline */}
              <button
                onClick={() => setQuickStatus(quickStatus === "offline" ? "all" : "offline")}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  quickStatus === "offline"
                    ? "bg-gray-800 text-white shadow-xs font-bold"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <CircleOff className="w-3 h-3 text-gray-500" />
                Offline ({statusCounts.offline})
              </button>

              {/* Critical */}
              <button
                onClick={() => setQuickStatus(quickStatus === "critical" ? "all" : "critical")}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  quickStatus === "critical"
                    ? "bg-red-600 text-white shadow-xs font-bold"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                <AlertCircle className="w-3 h-3 text-red-500" />
                Crit ({statusCounts.critical})
              </button>

              {/* Moderate */}
              <button
                onClick={() => setQuickStatus(quickStatus === "moderate" ? "all" : "moderate")}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  quickStatus === "moderate"
                    ? "bg-amber-500 text-white shadow-xs font-bold"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Mod ({statusCounts.moderate})
              </button>

              {/* Good */}
              <button
                onClick={() => setQuickStatus(quickStatus === "good" ? "all" : "good")}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  quickStatus === "good"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Good ({statusCounts.good})
              </button>
            </div>
          </div>

          {/* Polygon Active Banner (if polygon exists) */}
          {polygonDevices.length > 0 && (
            <div className="px-3 pt-2.5 pb-1 flex-none">
              <button
                onClick={() => setShowPolygonView(true)}
                className="w-full p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between text-xs text-blue-800 dark:text-blue-200 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Pentagon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold">Area Selected:</span>
                  <span>{polygonDevices.length} devices</span>
                </div>
                <span className="text-[10px] underline font-semibold">View Area</span>
              </button>
            </div>
          )}

          {/* Scrollable Device Cards List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-2">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  No devices found
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Try clearing your search or adjusting filters.
                </p>
                {(searchQuery || quickStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setQuickStatus("all")
                    }}
                    className="mt-2 text-xs text-blue-600 underline font-medium"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              filteredDevices.map((device) => (
                <DeviceLocationCard
                  key={device.device_id}
                  device={device}
                  isSelected={selectedDevice?.device_id === device.device_id}
                  onClick={() => {
                    onSelectDevice(device)
                    onFocusMapDevice?.(device)
                  }}
                  coverageInfo={coverageStats?.deviceCoverageMap[device.device_id]}
                  showLoRaWAN={showLoRaWAN}
                />
              ))
            )}
          </div>
        </>
      )}
    </Card>
  )
}
