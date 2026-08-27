"use client"

import React from "react"
import { MaintenanceMapItem } from "@/types/api.types"
import { Pentagon, X, Download, CheckSquare, Trash2, MapPin } from "lucide-react"

interface PolygonAreaPanelProps {
  devices: MaintenanceMapItem[]
  onClose: () => void
  onClearArea: () => void
  onSelectAllForRoute?: () => void
  onExportCSV?: () => void
  onDeviceClick?: (device: MaintenanceMapItem) => void
  selectedDeviceIds?: string[]
}

export const PolygonAreaPanel: React.FC<PolygonAreaPanelProps> = ({
  devices,
  onClose,
  onClearArea,
  onSelectAllForRoute,
  onExportCSV,
  onDeviceClick,
  selectedDeviceIds = [],
}) => {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-none p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
            <Pentagon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100">
              Area Selection
            </h2>
            <span className="text-[10px] text-gray-400">
              {devices.length} {devices.length === 1 ? "device" : "devices"} enclosed
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="p-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5 bg-gray-50/70 dark:bg-gray-800/40">
        {onSelectAllForRoute && (
          <button
            onClick={onSelectAllForRoute}
            className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <CheckSquare className="w-3 h-3" />
            Select All
          </button>
        )}

        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className="py-1.5 px-2.5 bg-white hover:bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
            title="Export enclosed devices to CSV"
          >
            <Download className="w-3 h-3 text-gray-500" />
            Export CSV
          </button>
        )}

        <button
          onClick={onClearArea}
          className="py-1.5 px-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
          title="Clear polygon"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Table of Enclosed Devices */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-600 dark:text-gray-300 text-[11px]">
                Device
              </th>
              <th className="text-center px-2 py-2 font-semibold text-gray-600 dark:text-gray-300 text-[11px]">
                Uptime
              </th>
              <th className="text-center px-2 py-2 font-semibold text-gray-600 dark:text-gray-300 text-[11px]">
                Error
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {devices.map((device) => {
              const raw = Number(device.uptime)
              const uptimePct = Number.isFinite(raw) ? (raw <= 1 ? raw * 100 : raw) : 0
              const isOffline = uptimePct === 0 || !device.last_active
              const uptimeColor = isOffline
                ? "text-gray-400"
                : uptimePct >= 85
                ? "text-emerald-600 font-bold"
                : uptimePct >= 50
                ? "text-amber-600 font-bold"
                : "text-red-600 font-bold"

              const em = Number(device.error_margin)
              const errorColor = !Number.isFinite(em)
                ? "text-gray-400"
                : em <= 10
                ? "text-emerald-600"
                : em <= 20
                ? "text-amber-600"
                : "text-red-600 font-bold"

              const isSelected = selectedDeviceIds.includes(device.device_id)

              return (
                <tr
                  key={device.device_id}
                  onClick={() => onDeviceClick?.(device)}
                  className={`hover:bg-blue-50/50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50/80 dark:bg-blue-950/40" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[130px]">
                      {device.device_name || device.device_id}
                    </div>
                    {device.cohorts && device.cohorts[0] && (
                      <div className="text-[10px] text-gray-400 truncate">
                        {device.cohorts[0]}
                      </div>
                    )}
                  </td>
                  <td className={`px-2 py-2 text-center text-[11px] ${uptimeColor}`}>
                    {isOffline ? "0%" : `${uptimePct.toFixed(0)}%`}
                  </td>
                  <td className={`px-2 py-2 text-center text-[11px] ${errorColor}`}>
                    {Number.isFinite(em) ? `±${em.toFixed(1)}` : "–"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
