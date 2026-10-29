"use client"

import React from "react"
import { Radio } from "lucide-react"
import { GatewayCoverageDeviceMapItem } from "@/types/lorawan.types"

/** Nearest LoRaWAN gateway and signal estimate for a map item, shown in its details panel. */
export const LoRaWANCoverageCard: React.FC<{ coverageInfo?: GatewayCoverageDeviceMapItem }> = ({ coverageInfo }) => (
  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800 text-xs">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
        <Radio className="w-3.5 h-3.5" />
        LoRaWAN Coverage
      </div>
      {coverageInfo && (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            coverageInfo.signalQuality === "strong"
              ? "bg-emerald-100 text-emerald-800"
              : coverageInfo.signalQuality === "moderate"
              ? "bg-amber-100 text-amber-800"
              : coverageInfo.signalQuality === "weak"
              ? "bg-red-100 text-red-800"
              : "bg-red-100 text-red-700"
          }`}
        >
          {coverageInfo.signalQuality.toUpperCase()}
        </span>
      )}
    </div>

    {coverageInfo ? (
      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-gray-500">Nearest Gateway:</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {coverageInfo.nearestGatewayName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Gateway Distance:</span>
          <span className="font-semibold text-indigo-700 dark:text-indigo-400">
            {coverageInfo.distanceKm} km
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Estimated RSSI:</span>
          <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
            {coverageInfo.estimatedRssiDbm} dBm
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Coverage Status:</span>
          <span
            className={`font-semibold ${
              coverageInfo.signalQuality !== "none" ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {coverageInfo.signalQuality !== "none" ? "Inside Radius" : "Outside (Blindspot)"}
          </span>
        </div>
      </div>
    ) : (
      <p className="text-[10px] text-gray-500">No active LoRaWAN gateway in range.</p>
    )}
  </div>
)
