"use client"

import React, { useEffect, useState, useRef } from "react"
import { MaintenanceMapItem } from "@/types/api.types"
import { GatewayCoverageDeviceMapItem, LoRaWANGateway } from "@/types/lorawan.types"
import { getDevicePerformanceData } from "@/services/device-api.service"
import { useGroup } from "@/lib/group-context"
import {
  ChevronLeft,
  X,
  Radio,
  Clock,
  Activity,
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
import { useToast } from "@/hooks/use-toast"

interface DeviceDetailsPanelProps {
  device: MaintenanceMapItem
  onBack: () => void
  coverageInfo?: GatewayCoverageDeviceMapItem
  showLoRaWAN?: boolean
  isDeviceInRoute?: boolean
  onToggleRoute?: (device: MaintenanceMapItem) => void
  onFocusMap?: (device: MaintenanceMapItem) => void
}

interface DailyPoint {
  value: number
  timestamp: string
}

interface MiniHistory {
  uptime: DailyPoint[]
  error: DailyPoint[]
  correlation: DailyPoint[]
  loaded: boolean
  loading: boolean
  failed?: boolean
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
  const { activeGroup, loading: groupLoading } = useGroup()
  const [history, setHistory] = useState<MiniHistory>({
    uptime: [],
    error: [],
    correlation: [],
    loaded: false,
    loading: true,
  })
  const [copied, setCopied] = useState(false)

  // Normalize uptime %
  const rawUptime = Number(device.uptime)
  const uptimePct = Number.isFinite(rawUptime) ? (rawUptime <= 1 ? rawUptime * 100 : rawUptime) : 0
  const isOffline = uptimePct === 0 || !device.last_active

  const em = Number(device.error_margin)
  const errorMarginStr = Number.isFinite(em) ? em.toFixed(2) : "N/A"

  // Fetch 14-day history
  useEffect(() => {
    let cancelled = false

    const toNum = (v: any): number | null => {
      if (v == null) return null
      const n = typeof v === "number" ? v : Number(v)
      return Number.isFinite(n) ? n : null
    }

    const computeMiniHistory = (
      rawPoints: any[]
    ): { uptime: DailyPoint[]; error: DailyPoint[]; correlation: DailyPoint[] } => {
      const buckets: Record<
        string,
        { hours: Set<number>; errs: number[]; s1: number[]; s2: number[] }
      > = {}
      for (const p of rawPoints) {
        if (!p?.datetime) continue
        const dt = new Date(p.datetime)
        if (isNaN(dt.getTime())) continue
        const dayKey = dt.toISOString().slice(0, 10)
        if (!buckets[dayKey]) buckets[dayKey] = { hours: new Set(), errs: [], s1: [], s2: [] }
        buckets[dayKey].hours.add(dt.getUTCHours())
        const s1 = toNum(p.s1_pm2_5 ?? p["pm2.5 sensor1"])
        const s2 = toNum(p.s2_pm2_5 ?? p["pm2.5 sensor2"])
        if (s1 != null && s2 != null) {
          buckets[dayKey].errs.push(Math.abs(s1 - s2))
          buckets[dayKey].s1.push(s1)
          buckets[dayKey].s2.push(s2)
        }
      }
      const days = Object.keys(buckets).sort()
      const uptime: DailyPoint[] = []
      const error: DailyPoint[] = []
      const correlation: DailyPoint[] = []
      const pearson = (xs: number[], ys: number[]): number | null => {
        const n = xs.length
        if (n < 2) return null
        const mx = xs.reduce((a, b) => a + b, 0) / n
        const my = ys.reduce((a, b) => a + b, 0) / n
        let num = 0,
          dx = 0,
          dy = 0
        for (let i = 0; i < n; i++) {
          const ex = xs[i] - mx
          const ey = ys[i] - my
          num += ex * ey
          dx += ex * ex
          dy += ey * ey
        }
        const den = Math.sqrt(dx * dy)
        return den === 0 ? null : num / den
      }
      for (const d of days) {
        const b = buckets[d]
        const ts = `${d}T00:00:00.000Z`
        uptime.push({ timestamp: ts, value: (b.hours.size / 24) * 100 })
        if (b.errs.length > 0)
          error.push({ timestamp: ts, value: b.errs.reduce((a, c) => a + c, 0) / b.errs.length })
        const r = pearson(b.s1, b.s2)
        if (r != null) correlation.push({ timestamp: ts, value: r })
      }
      return { uptime, error, correlation }
    }

    const loadHistory = async () => {
      if (groupLoading || !activeGroup || !device.device_name) return
      setHistory((prev) => ({ ...prev, loading: true }))

      try {
        const end = new Date()
        const start = new Date(end.getTime() - 14 * 86400000)
        const resp = await getDevicePerformanceData({
          start: start.toISOString(),
          end: end.toISOString(),
          deviceNames: [device.device_name],
          group: activeGroup,
        })
        if (cancelled) return

        const arr = Array.isArray(resp) ? resp : []
        const dev = arr[0] ?? {}
        const points: any[] =
          Array.isArray(dev.raw_data) && dev.raw_data.length > 0
            ? dev.raw_data
            : Array.isArray(dev.data)
            ? dev.data
            : []
        const computed = computeMiniHistory(points)
        setHistory({ ...computed, loaded: true, loading: false })
      } catch (err) {
        if (!cancelled) {
          setHistory({
            uptime: [],
            error: [],
            correlation: [],
            loaded: false,
            loading: false,
            failed: true,
          })
        }
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [device.device_name, activeGroup, groupLoading])

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

  // Render mini bars
  const renderBars = (
    points: DailyPoint[],
    opts: {
      label: string
      avgFormat: (v: number) => string
      format: (v: number) => string
      barColor: (v: number) => string
      normalize: (v: number, all: number[]) => number
    }
  ) => {
    if (points.length === 0) {
      return <div className="text-[10px] text-gray-400">No {opts.label.toLowerCase()} data</div>
    }
    const values = points.slice(-14)
    const avg = values.reduce((a, b) => a + b.value, 0) / values.length
    const all = values.map((v) => v.value)

    return (
      <div className="bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
            {opts.label}
          </span>
          <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
            {opts.avgFormat(avg)} avg
          </span>
        </div>
        <div className="flex items-end gap-[3px] h-8 pt-1">
          {values.map((v, i) => {
            const ratio = Math.max(0.08, Math.min(1, opts.normalize(v.value, all)))
            const h = Math.max(4, Math.round(ratio * 26))
            const date = new Date(v.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
            return (
              <div
                key={i}
                title={`${date}: ${opts.format(v.value)}`}
                style={{ height: `${h}px` }}
                className={`flex-1 rounded-t-xs transition-all hover:opacity-80 ${opts.barColor(
                  v.value
                )}`}
              />
            )
          })}
        </div>
      </div>
    )
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
        {showLoRaWAN && (
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
        )}

        {/* 14-Day Historical Mini-Trends */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              14-Day Performance History
            </span>
          </div>

          {history.loading ? (
            <div className="space-y-2">
              <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ) : history.failed ? (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs text-center">
              Unable to load historical trends for this device.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Uptime Trend */}
              {renderBars(history.uptime, {
                label: "Uptime History",
                avgFormat: (v) => `${v.toFixed(0)}%`,
                format: (v) => `${v.toFixed(1)}%`,
                barColor: (v) => (v >= 80 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-red-500"),
                normalize: (v) => v / 100,
              })}

              {/* Error Margin Trend */}
              {renderBars(history.error, {
                label: "Sensor Error Drift",
                avgFormat: (v) => `±${v.toFixed(1)}`,
                format: (v) => `±${v.toFixed(2)} µg/m³`,
                barColor: (v) => (v <= 5 ? "bg-emerald-500" : v <= 15 ? "bg-amber-500" : "bg-red-500"),
                normalize: (v, all) => v / Math.max(10, ...all),
              })}

              {/* Dual Sensor Correlation */}
              {renderBars(history.correlation, {
                label: "Dual Sensor Correlation (r)",
                avgFormat: (v) => v.toFixed(2),
                format: (v) => v.toFixed(3),
                barColor: (v) => (v >= 0.9 ? "bg-emerald-500" : v >= 0.75 ? "bg-amber-500" : "bg-red-500"),
                normalize: (v) => Math.max(0, v),
              })}
            </div>
          )}
        </div>

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
            href={`/dashboard/analytics/${device.device_name || device.device_id}`}
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
