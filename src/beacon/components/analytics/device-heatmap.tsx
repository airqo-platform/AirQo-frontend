"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface HourlyHeatmapPoint {
  date: string // ISO date (yyyy-MM-dd) or any date string parsable by Date
  hour: number // 0-23
  count: number // number of records in that hour
  errorMargin: number | null // average |s1 - s2| for that hour, or null if not computable
}

export interface HeatmapDevice {
  device_id: string
  device_name: string
  daily_uptime_percentage: number
  average_error_margin: number
  uptime_history: Array<{ value: number; timestamp: string }>
  error_margin_history: Array<{ value: number; timestamp: string }>
  // Optional hourly grid data used by DeviceHourHeatmaps
  hourly_data?: HourlyHeatmapPoint[]
}

type Metric = "uptime" | "errorMargin"

interface DeviceHeatmapProps {
  devices: HeatmapDevice[]
  metric: Metric
  title?: string
  description?: string
}

// Color thresholds aligned with the rest of the app
const getUptimeColor = (value: number): string => {
  if (value >= 75) return "bg-green-500 text-white"
  if (value >= 50) return "bg-orange-400 text-white"
  if (value > 0) return "bg-red-500 text-white"
  return "bg-red-500 text-white"
}

const getErrorMarginColor = (value: number): string => {
  // Lower is better for error margin
  if (value === 0) return "bg-gray-200 text-gray-700"
  if (value <= 6) return "bg-green-500 text-white"
  if (value <= 12) return "bg-orange-400 text-white"
  return "bg-red-500 text-white"
}

const getStatusFromUptime = (avg: number): { label: string; className: string } => {
  if (avg >= 75) return { label: "Good", className: "bg-green-100 text-green-800" }
  if (avg >= 50) return { label: "Moderate", className: "bg-gray-100 text-gray-800" }
  if (avg >= 30) return { label: "Poor", className: "bg-gray-100 text-gray-800" }
  return { label: "Critical", className: "bg-orange-100 text-orange-800" }
}

const getStatusFromErrorMargin = (avg: number): { label: string; className: string } => {
  if (avg === 0) return { label: "N/A", className: "bg-gray-100 text-gray-700" }
  if (avg <= 6) return { label: "Good", className: "bg-green-100 text-green-800" }
  if (avg <= 12) return { label: "Moderate", className: "bg-gray-100 text-gray-800" }
  if (avg <= 20) return { label: "Poor", className: "bg-gray-100 text-gray-800" }
  return { label: "Critical", className: "bg-orange-100 text-orange-800" }
}

const formatDateShort = (ts: string) => {
  const d = new Date(ts)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const buildTooltipValueLabel = (
  isUptime: boolean,
  hasValue: boolean,
  value: number,
): string => {
  if (!hasValue) {
    return isUptime ? "Uptime: No data" : "Error Margin: No data"
  }
  return isUptime
    ? `Uptime: ${value.toFixed(2)}%`
    : `Error Margin: ±${value.toFixed(2)}`
}

export function DeviceHeatmap({ devices, metric, title, description }: Readonly<DeviceHeatmapProps>) {
  // Union of all date timestamps across devices, sorted ascending
  const allDates = useMemo(() => {
    const set = new Set<string>()
    devices.forEach((d) => {
      const history = metric === "uptime" ? d.uptime_history : d.error_margin_history
      history.forEach((h) => set.add(h.timestamp))
    })
    return Array.from(set).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  }, [devices, metric])

  // Build a quick lookup per device
  const lookup = useMemo(() => {
    const map: Record<string, Record<string, number>> = {}
    devices.forEach((d) => {
      const history = metric === "uptime" ? d.uptime_history : d.error_margin_history
      const inner: Record<string, number> = {}
      history.forEach((h) => {
        inner[h.timestamp] = h.value
      })
      map[d.device_id] = inner
    })
    return map
  }, [devices, metric])

  // Sort devices by their average for this metric
  const sortedDevices = useMemo(() => {
    const list = [...devices]
    if (metric === "uptime") {
      list.sort((a, b) => a.daily_uptime_percentage - b.daily_uptime_percentage)
    } else {
      list.sort((a, b) => b.average_error_margin - a.average_error_margin)
    }
    return list
  }, [devices, metric])

  if (devices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  const isUptime = metric === "uptime"

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-[2px] text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-background text-left px-3 py-2 font-medium text-muted-foreground min-w-[160px]">
                    Device
                  </th>
                  {allDates.map((d) => (
                    <th
                      key={d}
                      className="px-1 py-2 font-medium text-muted-foreground text-center whitespace-nowrap"
                    >
                      {formatDateShort(d)}
                    </th>
                  ))}
                  <th className="px-2 py-2 font-medium text-muted-foreground text-center bg-muted/40">
                    Avg
                  </th>
                  <th className="px-2 py-2 font-medium text-muted-foreground text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDevices.map((device) => {
                  const avg = isUptime
                    ? device.daily_uptime_percentage
                    : device.average_error_margin
                  const status = isUptime
                    ? getStatusFromUptime(avg)
                    : getStatusFromErrorMargin(avg)

                  return (
                    <tr key={device.device_id}>
                      <td className="sticky left-0 bg-background px-3 py-1 font-medium whitespace-nowrap">
                        {device.device_name}
                      </td>
                      {allDates.map((date) => {
                        const value = lookup[device.device_id]?.[date]
                        const hasValue = value !== undefined
                        const numericValue = hasValue ? value : 0
                        const colorClass = isUptime
                          ? getUptimeColor(numericValue)
                          : getErrorMarginColor(numericValue)

                        return (
                          <td key={date} className="p-0">
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "flex items-center justify-center text-center font-medium rounded-sm cursor-default min-w-[44px] h-7 px-1",
                                    hasValue ? colorClass : "bg-gray-100 text-gray-400"
                                  )}
                                >
                                  {hasValue ? numericValue.toFixed(2) : "—"}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div className="font-medium">{device.device_name}</div>
                                  <div>{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                                  <div>{buildTooltipValueLabel(isUptime, hasValue, numericValue)}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        )
                      })}
                      <td className="px-2 py-1 text-center font-semibold bg-muted/40 rounded-sm">
                        {isUptime ? `${avg.toFixed(2)}` : `±${avg.toFixed(2)}`}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-xs font-medium",
                            status.className
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium">Legend:</span>
            {isUptime ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> ≥ 75%
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-orange-400" /> 50 – 75%
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> &lt; 50%
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> ≤ 6
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-orange-400" /> 6 – 12
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> &gt; 12
                </div>
              </>
            )}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

interface DevicePerformanceHeatmapsProps {
  devices: HeatmapDevice[]
}

/**
 * Combined component rendering both Uptime and Error Margin heatmaps.
 * Use inside a "Heatmap" tab.
 */
export default function DevicePerformanceHeatmaps({
  devices,
}: Readonly<DevicePerformanceHeatmapsProps>) {
  return (
    <div className="space-y-6">
      <DeviceHeatmap
        devices={devices}
        metric="uptime"
        title="Daily Uptime Heatmap"
        description="Daily uptime percentage per device. Cells are colored by performance — green is good, orange is moderate, red indicates poor uptime."
      />
      <DeviceHeatmap
        devices={devices}
        metric="errorMargin"
        title="Daily Error Margin Heatmap"
        description="Daily average sensor error margin (|s1 − s2| PM2.5) per device. Lower is better — green ≤ 6, orange 6–12, red > 12."
      />
    </div>
  )
}

// =====================================================================
// Day × Hour heatmap (one per device)
// =====================================================================

type HourMetric = "uptime" | "errorMargin"

interface DeviceHourHeatmapProps {
  device: HeatmapDevice
  metric: HourMetric
}

const HOURS = Array.from({ length: 24 }, (_, h) => h)

const getHourUptimeColor = (count: number): string => {
  if (count <= 0) return "bg-gray-100 text-gray-400"
  // Any data in the hour is "good"; richer counts get a slightly stronger shade
  if (count >= 4) return "bg-green-600 text-white"
  if (count >= 2) return "bg-green-500 text-white"
  return "bg-green-400 text-white"
}

function DeviceHourHeatmap({ device, metric }: Readonly<DeviceHourHeatmapProps>) {
  const points = device.hourly_data ?? []

  // Distinct dates ascending
  const dates = useMemo(() => {
    const set = new Set<string>()
    points.forEach((p) => set.add(p.date))
    return Array.from(set).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  }, [points])

  // lookup[date][hour] -> point
  const lookup = useMemo(() => {
    const map: Record<string, Record<number, HourlyHeatmapPoint>> = {}
    points.forEach((p) => {
      if (!map[p.date]) map[p.date] = {}
      map[p.date][p.hour] = p
    })
    return map
  }, [points])

  const isUptime = metric === "uptime"

  if (dates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{device.device_name}</CardTitle>
          <CardDescription>No hourly data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{device.device_name}</CardTitle>
        <CardDescription>
          {isUptime
            ? "Hourly data presence — green cells indicate the device reported data in that hour."
            : "Hourly average sensor error margin (|s1 − s2| PM2.5)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-[2px] text-[10px]">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-background text-left px-2 py-1 font-medium text-muted-foreground min-w-[100px]">
                    Date
                  </th>
                  {HOURS.map((h) => (
                    <th
                      key={h}
                      className="px-1 py-1 font-medium text-muted-foreground text-center"
                    >
                      {h.toString().padStart(2, "0")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dates.map((date) => (
                  <tr key={date}>
                    <td className="sticky left-0 bg-background px-2 py-1 font-medium whitespace-nowrap">
                      {formatDateShort(date)}
                    </td>
                    {HOURS.map((h) => {
                      const point = lookup[date]?.[h]
                      const count = point?.count ?? 0
                      const em = point?.errorMargin ?? null

                      let cellClass: string
                      let label: string
                      if (isUptime) {
                        cellClass = getHourUptimeColor(count)
                        label = count > 0 ? `${count}` : "—"
                      } else if (em == null) {
                        cellClass = "bg-gray-100 text-gray-400"
                        label = "—"
                      } else {
                        cellClass = getErrorMarginColor(em)
                        label = em.toFixed(1)
                      }

                      return (
                        <td key={`${date}-${h}`} className="p-0">
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "flex items-center justify-center text-center font-medium rounded-sm cursor-default w-7 h-6",
                                  cellClass
                                )}
                              >
                                {label}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-medium">{device.device_name}</div>
                                <div>
                                  {new Date(date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}{" "}
                                  · {h.toString().padStart(2, "0")}:00
                                </div>
                                <div>Records: {count}</div>
                                <div>
                                  Error Margin:{" "}
                                  {em == null ? "No data" : `±${em.toFixed(2)}`}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

interface DeviceHourHeatmapsProps {
  devices: HeatmapDevice[]
}

/**
 * Renders a Day × Hour heatmap for every device. A toggle at the top switches
 * between "Uptime" (was data reported in that hour) and "Error Margin"
 * (average |s1 − s2| PM2.5 for that hour).
 */
export function DeviceHourHeatmaps({ devices }: Readonly<DeviceHourHeatmapsProps>) {
  const [metric, setMetric] = useState<HourMetric>("uptime")

  if (devices.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">Hourly Activity per Device</h3>
          <p className="text-xs text-muted-foreground">
            Each row is a day, each column an hour of the day (00–23).
          </p>
        </div>
        <div className="inline-flex rounded-md border bg-white p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMetric("uptime")}
            className={cn(
              "px-3 py-1 rounded-sm transition-colors",
              metric === "uptime"
                ? "bg-green-100 text-green-700 font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Uptime
          </button>
          <button
            type="button"
            onClick={() => setMetric("errorMargin")}
            className={cn(
              "px-3 py-1 rounded-sm transition-colors",
              metric === "errorMargin"
                ? "bg-orange-100 text-orange-700 font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Error Margin
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {devices.map((device) => (
          <DeviceHourHeatmap key={device.device_id} device={device} metric={metric} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
        <span className="font-medium">Legend:</span>
        {metric === "uptime" ? (
          <>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-green-600" /> ≥ 4 records
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> 2–3 records
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-green-400" /> 1 record
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-gray-100 border" /> No data
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> ≤ 6
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-orange-400" /> 6 – 12
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> &gt; 12
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-gray-100 border" /> No data
            </div>
          </>
        )}
      </div>
    </div>
  )
}
