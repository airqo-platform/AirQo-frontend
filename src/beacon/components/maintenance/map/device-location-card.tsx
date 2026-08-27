"use client"

import React from "react"
import { MaintenanceMapItem } from "@/types/api.types"
import { MapPin, Radio, Signal, CheckCircle2, AlertTriangle, AlertCircle, CircleOff } from "lucide-react"
import { GatewayCoverageDeviceMapItem } from "@/types/lorawan.types"

interface DeviceLocationCardProps {
  device: MaintenanceMapItem
  isSelected?: boolean
  onClick?: () => void
  coverageInfo?: GatewayCoverageDeviceMapItem
  showLoRaWAN?: boolean
}

export const DeviceLocationCard: React.FC<DeviceLocationCardProps> = ({
  device,
  isSelected = false,
  onClick,
  coverageInfo,
  showLoRaWAN = false,
}) => {
  // Normalize uptime percentage
  const rawUptime = Number(device.uptime)
  const uptimePct = Number.isFinite(rawUptime) ? (rawUptime <= 1 ? rawUptime * 100 : rawUptime) : 0
  const isOffline = uptimePct === 0 || !device.last_active

  const em = Number(device.error_margin)
  const errorMarginStr = Number.isFinite(em) ? em.toFixed(1) : "–"

  // Uptime health styling
  let uptimeBadge = {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: `${uptimePct.toFixed(0)}%`,
    icon: CheckCircle2,
  }

  if (isOffline) {
    uptimeBadge = {
      bg: "bg-gray-100 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
      label: "Offline",
      icon: CircleOff,
    }
  } else if (uptimePct < 50) {
    uptimeBadge = {
      bg: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
      label: `${uptimePct.toFixed(0)}%`,
      icon: AlertCircle,
    }
  } else if (uptimePct < 85) {
    uptimeBadge = {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      label: `${uptimePct.toFixed(0)}%`,
      icon: AlertTriangle,
    }
  }

  // Location / Cohort summary
  const locationSummary =
    device.cohorts && device.cohorts.length > 0
      ? device.cohorts.join(", ")
      : device.grids && device.grids.length > 0
      ? device.grids.join(", ")
      : "Standard Deployment"

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer text-left shadow-xs select-none ${
        isSelected
          ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm"
          : "bg-white hover:bg-gray-50/90 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Device Name & Badges */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3
              className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate"
              title={device.device_name || device.device_id}
            >
              {device.device_name || device.device_id}
            </h3>
            {device.device_number != null && (
              <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.2 rounded font-semibold">
                #{device.device_number}
              </span>
            )}
          </div>

          <p
            className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5"
            title={locationSummary}
          >
            {locationSummary}
          </p>
        </div>

        {/* Pin marker icon container */}
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Metrics Row: Uptime %, Error Margin, LoRaWAN */}
      <div className="flex items-center gap-2 mt-2.5 flex-wrap text-[10px]">
        {/* Uptime Badge */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${uptimeBadge.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${uptimeBadge.dot}`} />
          <span>{uptimeBadge.label}</span>
        </div>

        {/* Error Margin Badge */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-600/60 font-medium">
          <span className="text-gray-400">Err:</span>
          <span>±{errorMarginStr}</span>
        </div>

        {/* LoRaWAN Signal Badge (only if showLoRaWAN is enabled) */}
        {showLoRaWAN && coverageInfo && (
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
              coverageInfo.signalQuality === "strong"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : coverageInfo.signalQuality === "moderate"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : coverageInfo.signalQuality === "weak"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
            title={`Nearest Gateway: ${coverageInfo.nearestGatewayName} (${coverageInfo.distanceKm} km, ${coverageInfo.estimatedRssiDbm} dBm)`}
          >
            <Radio className="w-2.5 h-2.5" />
            <span>
              {coverageInfo.signalQuality === "none"
                ? "Blindspot"
                : `${coverageInfo.distanceKm} km`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
