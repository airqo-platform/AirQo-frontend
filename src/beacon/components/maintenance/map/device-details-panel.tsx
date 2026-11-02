"use client"

import React, { useState } from "react"
import { MaintenanceMapItem } from "@/types/api.types"
import { GatewayCoverageDeviceMapItem, LoRaWANGateway } from "@/types/lorawan.types"
import {
  ChevronLeft,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  MapPin,
  Route,
  Signal,
  Copy,
  Check,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { formatCompactNumber } from "@/lib/utils"
import { DeviceIssuesSummary } from "@/components/diagnostics/DeviceIssuesSummary"
import { LoRaWANCoverageCard } from "./lorawan-coverage-card"
import { PerformanceHistory, usePerformanceHistory } from "./performance-history"

interface DeviceDetailsPanelProps {
  device: MaintenanceMapItem
  onBack: () => void
  coverageInfo?: GatewayCoverageDeviceMapItem
  showLoRaWAN?: boolean
  isDeviceInRoute?: boolean
  onToggleRoute?: (device: MaintenanceMapItem) => void
  onFocusMap?: (device: MaintenanceMapItem) => void
}

export const DeviceDetailsPanel: React.FC<DeviceDetailsPanelProps> = ({
  device,
  onBack,
  coverageInfo,
  showLoRaWAN = false,
  isDeviceInRoute = false,
  onToggleRoute,
  onFocusMap,
}) => {
  const { toast } = useToast()
  const pathname = usePathname()
  const history = usePerformanceHistory([device.device_name])
  const [copied, setCopied] = useState(false)

  // Normalize uptime %
  const rawUptime = Number(device.uptime)
  const uptimePct = Number.isFinite(rawUptime) ? (rawUptime <= 1 ? rawUptime * 100 : rawUptime) : 0
  const isOffline = uptimePct === 0 || !device.last_active

  const em = Number(device.error_margin)
  const errorMarginStr = Number.isFinite(em) ? formatCompactNumber(em, 2) : "N/A"

  const handleCopyCoords = () => {
    if (device.latitude != null && device.longitude != null) {
      navigator.clipboard.writeText(`${device.latitude}, ${device.longitude}`)
      setCopied(true)
      toast({
        title: "Coordinates Copied",
        description: `${device.latitude}, ${device.longitude}`,
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-none p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            title="Back to device list"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2
              className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate"
              title={device.device_name || device.device_id}
            >
              {device.device_name || device.device_id}
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              {device.device_number != null && <span>#{device.device_number}</span>}
              {device.device_number != null && <span>•</span>}
              <span>{device.device_id}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5">
        {/* Key Health Metrics (Grid) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Uptime Card */}
          <div
            className={`p-3 rounded-lg border flex flex-col justify-between ${
              isOffline
                ? "bg-gray-50 border-gray-200 text-gray-600"
                : uptimePct >= 85
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                : uptimePct >= 50
                ? "bg-amber-50/70 border-amber-200 text-amber-800"
                : "bg-red-50/70 border-red-200 text-red-800"
            }`}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Uptime
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-xl font-black">{uptimePct.toFixed(0)}%</span>
            </div>
            <span className="text-[10px] font-medium">
              {isOffline
                ? "Offline"
                : uptimePct >= 85
                ? "Optimal Health"
                : uptimePct >= 50
                ? "Moderate Issues"
                : "Critical Failure"}
            </span>
          </div>

          {/* Error Margin Card */}
          <div
            className={`p-3 rounded-lg border flex flex-col justify-between ${
              !Number.isFinite(em)
                ? "bg-gray-50 border-gray-200 text-gray-600"
                : em <= 10
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                : em <= 20
                ? "bg-amber-50/70 border-amber-200 text-amber-800"
                : "bg-red-50/70 border-red-200 text-red-800"
            }`}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Error Margin
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-xl font-black">±{errorMarginStr}</span>
              <span className="text-[10px] font-normal text-gray-400">µg/m³</span>
            </div>
            <span className="text-[10px] font-medium">
              {em <= 10 ? "Accurate" : em <= 20 ? "Acceptable Drift" : "High Sensor Discrepancy"}
            </span>
          </div>
        </div>

        {/* Location & Last Active Details */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-800 text-xs space-y-2">
          {/* Cohorts / Grids */}
          {device.cohorts && device.cohorts.length > 0 && (
            <div>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Cohorts:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {device.cohorts.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Last Seen Timestamp */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Last Data Post:
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {device.last_active ? new Date(device.last_active).toLocaleString() : "Never / No data"}
            </span>
          </div>

          {/* Coordinates */}
          {(() => {
            const lat = Number(device.latitude)
            const lng = Number(device.longitude)
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
            return (
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  Coordinates:
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-gray-600 dark:text-gray-300">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                  <button
                    onClick={handleCopyCoords}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600"
                    title="Copy coordinates"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            )
          })()}
        </div>

        {/* LoRaWAN RF Signal Diagnostics (only if showLoRaWAN is enabled) */}
        {showLoRaWAN && <LoRaWANCoverageCard coverageInfo={coverageInfo} />}

        {/* 14-Day Historical Mini-Trends */}
        <PerformanceHistory history={history} subject="device" />

        {/* Latest daily diagnosis and reported status codes */}
        <DeviceIssuesSummary deviceId={device.device_id} />

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          {onToggleRoute && (
            <button
              onClick={() => onToggleRoute(device)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isDeviceInRoute
                  ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              {isDeviceInRoute ? "Remove from Route" : "Add to Route Itinerary"}
            </button>
          )}

          {onFocusMap && (
            <button
              onClick={() => onFocusMap(device)}
              className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Center on Map
            </button>
          )}

          <Link
            href={`/dashboard/devices/${encodeURIComponent(device.device_id)}?tab=diagnostics&returnTo=${encodeURIComponent(pathname || "/dashboard/maintenance")}`}
            className="w-full py-2 px-3 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open Full Diagnostics</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  )
}
