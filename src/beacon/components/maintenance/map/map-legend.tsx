"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp, Radio, CheckCircle2, AlertTriangle, AlertCircle, CircleOff, Info } from "lucide-react"

interface MapLegendProps {
  className?: string
  defaultCollapsed?: boolean
  showLoRaWAN?: boolean
}

export const MapLegend: React.FC<MapLegendProps> = ({
  className = "",
  defaultCollapsed = false,
  showLoRaWAN = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const legendItems = [
    {
      label: "Good / Optimal (≥85% Up, ≤10 Err)",
      color: "bg-emerald-500",
      ring: "border-emerald-400",
    },
    {
      label: "Moderate (50–85% Up, 10–20 Err)",
      color: "bg-amber-500",
      ring: "border-amber-400",
    },
    {
      label: "Critical (<50% Up, >20 Err)",
      color: "bg-red-500",
      ring: "border-red-400",
    },
    {
      label: "Offline / No Transmission",
      color: "bg-gray-400",
      ring: "border-gray-300",
    },
    ...(showLoRaWAN
      ? [
          {
            label: "LoRaWAN Gateway & RF Zones",
            icon: Radio,
            color: "bg-indigo-600 text-white",
            ring: "",
          },
        ]
      : []),
  ]

  return (
    <div
      className={`absolute bottom-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/70 dark:border-gray-800 z-[1000] transition-all duration-300 ${
        isCollapsed ? "w-10 h-10 rounded-full" : "w-64 p-3"
      } ${className}`}
    >
      {/* Toggle Button */}
      <div
        className={`flex items-center cursor-pointer ${
          isCollapsed ? "w-full h-full justify-center" : "justify-between mb-2 pb-1 border-b border-gray-100 dark:border-gray-800"
        }`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Map Legend</span>
          </div>
        )}
        <button
          type="button"
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
          title={isCollapsed ? "Expand legend" : "Collapse legend"}
        >
          {isCollapsed ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Expanded Legend List */}
      {!isCollapsed && (
        <div className="space-y-2 text-xs">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              {item.icon ? (
                <div
                  className={`w-4 h-4 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 shadow-xs`}
                >
                  <item.icon className="w-2.5 h-2.5" />
                </div>
              ) : (
                <div
                  className={`w-3.5 h-3.5 rounded-full ${item.color} border-2 ${item.ring} flex-shrink-0 shadow-xs`}
                />
              )}
              <span className="text-[11px] text-gray-700 dark:text-gray-300 leading-tight">
                {item.label}
              </span>
            </div>
          ))}

          <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 leading-normal">
            <span>Dot color: Uptime | Outer ring: Error margin</span>
          </div>
        </div>
      )}
    </div>
  )
}
