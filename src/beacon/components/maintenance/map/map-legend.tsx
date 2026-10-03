"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp, Radio, CheckCircle2, AlertTriangle, AlertCircle, CircleOff, Info } from "lucide-react"
import { FULL_RADIUS_KM, MAX_RADIUS_KM, HeatmapMode, heatmapGradientCss } from "./device-heatmap-layer"

interface MapLegendProps {
  className?: string
  defaultCollapsed?: boolean
  showLoRaWAN?: boolean
  heatmapMode?: HeatmapMode
}

export const MapLegend: React.FC<MapLegendProps> = ({
  className = "",
  defaultCollapsed = false,
  showLoRaWAN = false,
  heatmapMode = "off",
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

          {heatmapMode !== "off" && (
            <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800 space-y-1">
              <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                {heatmapMode === "uptime" ? "Uptime heatmap" : heatmapMode === "sensor" ? "Sensor error margin heatmap" : "Coverage heatmap"}
              </div>
              <div className="h-2 rounded-full" style={{ background: heatmapGradientCss(heatmapMode) }} />
              {heatmapMode === "coverage" ? (
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                  <span>Edge of reach</span>
                  <span>Fully covered</span>
                </div>
              ) : (
                // Labels sit at the colour stops (0, 50, 85, 100), which are not evenly spaced.
                <div className="relative h-3.5 text-[10px] text-gray-500 dark:text-gray-400">
                  {(heatmapMode === "uptime"
                    ? [[0, "0%"], [50, "50%"], [85, "85%"], [100, "100%"]]
                    : [[0, "±40+"], [50, "±20"], [85, "±10"], [100, "±0"]]
                  ).map(([at, label]) => (
                    <span
                      key={label}
                      className="absolute top-0 whitespace-nowrap"
                      style={{
                        left: `${at}%`,
                        transform: at === 0 ? "none" : at === 100 ? "translateX(-100%)" : "translateX(-50%)",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-gray-400 leading-snug">
                {heatmapMode === "uptime"
                  ? `Whether a place still gets data: an offline device next to an online one stays green; red means no working device reaches it. Nearby devices back each other up. Fades out beyond ${MAX_RADIUS_KM} km.`
                  : heatmapMode === "sensor"
                  ? `Quality of the data that arrives, from the error margins of online devices (offline devices deliver nothing, so they don't count). A bad sensor counts up to 3× because it lowers the area's data. Devices without an error margin are left out.`
                  : `Full within ${FULL_RADIUS_KM} km of any installed device (online or not), fading to none at ${MAX_RADIUS_KM} km. Overlapping devices add up.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
