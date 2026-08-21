"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Calendar,
  Clock,
} from "lucide-react"
import type { StandardizedRecord } from "@/lib/visualise/column-mapper"

interface HeatmapAnalyticsViewProps {
  records: StandardizedRecord[]
}

export function HeatmapAnalyticsView({ records }: HeatmapAnalyticsViewProps) {
  const [heatmapMetric, setHeatmapMetric] = useState<"frequency" | "pm25" | "errorMargin">("frequency")

  // Process 24-hour x Date Grid
  const { dates, grid, maxFreq, maxPm25, maxError } = useMemo(() => {
    const dateMap = new Map<string, Map<number, { count: number; pm25Sum: number; pm25Count: number; errorSum: number; errorCount: number }>>()

    for (const r of records) {
      if (!r.timestamp) continue
      const d = r.timestamp
      const y = d.getUTCFullYear()
      const m = String(d.getUTCMonth() + 1).padStart(2, "0")
      const day = String(d.getUTCDate()).padStart(2, "0")
      const dateStr = `${y}-${m}-${day}`
      const hour = d.getUTCHours()

      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, new Map())
      }
      const hourMap = dateMap.get(dateStr)!
      if (!hourMap.has(hour)) {
        hourMap.set(hour, { count: 0, pm25Sum: 0, pm25Count: 0, errorSum: 0, errorCount: 0 })
      }
      const entry = hourMap.get(hour)!
      entry.count++
      if (r.pm25 !== null) {
        entry.pm25Sum += r.pm25
        entry.pm25Count++
      }
      if (r.errorMarginPm25 !== null) {
        entry.errorSum += r.errorMarginPm25
        entry.errorCount++
      }
    }

    const sortedDates = Array.from(dateMap.keys()).sort()
    let maxF = 1
    let maxP = 1
    let maxE = 1

    const matrix: { date: string; hours: { hour: number; count: number; pm25Sum: number; pm25Count: number; avgPm25: number | null; avgError: number | null }[] }[] = []

    for (const dt of sortedDates) {
      const hMap = dateMap.get(dt)!
      const hours = []
      for (let h = 0; h < 24; h++) {
        const item = hMap.get(h)
        const count = item ? item.count : 0
        const pm25Sum = item ? item.pm25Sum : 0
        const pm25Count = item ? item.pm25Count : 0
        const avgPm25 = item && item.pm25Count > 0 ? Number((item.pm25Sum / item.pm25Count).toFixed(1)) : null
        const avgError = item && item.errorCount > 0 ? Number((item.errorSum / item.errorCount).toFixed(1)) : null

        if (count > maxF) maxF = count
        if (avgPm25 !== null && avgPm25 > maxP) maxP = avgPm25
        if (avgError !== null && avgError > maxE) maxE = avgError

        hours.push({ hour: h, count, pm25Sum, pm25Count, avgPm25, avgError })
      }
      matrix.push({ date: dt, hours })
    }

    return { dates: sortedDates, grid: matrix, maxFreq: maxF, maxPm25: maxP, maxError: maxE }
  }, [records])

  // Get cell color based on metric with EPA 2024 AQI breakpoints
  const getCellColor = (cell: { count: number; avgPm25: number | null; avgError: number | null }) => {
    if (cell.count === 0) return "bg-slate-100"

    if (heatmapMetric === "frequency") {
      const ratio = cell.count / maxFreq
      if (ratio > 0.8) return "bg-blue-600"
      if (ratio > 0.6) return "bg-blue-500"
      if (ratio > 0.4) return "bg-blue-400"
      if (ratio > 0.2) return "bg-blue-300"
      return "bg-blue-200"
    }

    if (heatmapMetric === "pm25") {
      const val = cell.avgPm25
      if (val === null) return "bg-slate-100"
      if (val > 225.4) return "bg-[#5d4037]"
      if (val > 125.4) return "bg-[#8e24aa]"
      if (val > 55.4) return "bg-[#d32f2f]"
      if (val > 35.4) return "bg-[#ff9800]"
      if (val > 9.0) return "bg-[#e5cc16]"
      return "bg-[#45ae03]"
    }

    if (heatmapMetric === "errorMargin") {
      const err = cell.avgError
      if (err === null) return "bg-slate-100"
      if (err > 10.0) return "bg-rose-500"
      if (err > 5.0) return "bg-amber-400"
      return "bg-emerald-500"
    }

    return "bg-blue-500"
  }

  // Daily Summary Stats (record-weighted)
  const dailySummary = useMemo(() => {
    return grid.map((day) => {
      const activeHours = day.hours.filter((h) => h.count > 0).length
      const uptimePct = Number(((activeHours / 24) * 100).toFixed(1))
      const totalDayRecords = day.hours.reduce((s, h) => s + h.count, 0)
      const dayPm25Sum = day.hours.reduce((s, h) => s + h.pm25Sum, 0)
      const dayPm25Count = day.hours.reduce((s, h) => s + h.pm25Count, 0)
      const avgDayPm25 = dayPm25Count > 0
        ? Number((dayPm25Sum / dayPm25Count).toFixed(1))
        : null

      return {
        date: day.date,
        activeHours,
        uptimePct,
        totalDayRecords,
        avgDayPm25,
      }
    })
  }, [grid])

  if (dates.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-12 text-center text-slate-500 text-xs">
          No timestamp data available to construct heatmaps.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. 24-Hour x Date Grid Heatmap */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 pt-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Device Hourly Reporting Heatmap (24-Hour Grid)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Hourly distribution across the 24 hours of each day (UTC)
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Color by:</span>
            <Select
              value={heatmapMetric}
              onValueChange={(val) => setHeatmapMetric(val as any)}
            >
              <SelectTrigger className="h-8 text-xs w-44 bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frequency" className="text-xs">Data Frequency (Records/Hr)</SelectItem>
                <SelectItem value="pm25" className="text-xs">PM2.5 Intensity (µg/m³)</SelectItem>
                <SelectItem value="errorMargin" className="text-xs">Error Margin (|S1 - S2|)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-x-auto">
          <TooltipProvider delayDuration={50}>
            <div className="min-w-[700px] space-y-2">
              {/* Legend */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span>Legend:</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" /> 0
                    {heatmapMetric === "frequency" ? (
                      <>
                        <div className="w-3 h-3 rounded bg-blue-200" /> Low
                        <div className="w-3 h-3 rounded bg-blue-400" /> Med
                        <div className="w-3 h-3 rounded bg-blue-600" /> High ({maxFreq}/hr)
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 rounded bg-emerald-500" /> Good
                        <div className="w-3 h-3 rounded bg-amber-400" /> Moderate
                        <div className="w-3 h-3 rounded bg-red-600" /> Elevated
                      </>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-mono">{dates.length} days analyzed</span>
              </div>

              {/* Grid: 24 Rows (Hours) x Columns (Dates) */}
              <div className="space-y-1">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="flex items-center gap-1">
                    <span className="w-12 text-[11px] font-mono text-slate-400 text-right pr-2">
                      {String(hour).padStart(2, "0")}:00
                    </span>

                    <div className="flex items-center gap-1 flex-1">
                      {grid.map((day) => {
                        const cell = day.hours[hour]
                        return (
                          <Tooltip key={`${day.date}-${hour}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={`h-4 flex-1 min-w-[12px] max-w-[28px] rounded-xs cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 ${getCellColor(
                                  cell
                                )}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="text-xs p-2.5 font-mono">
                              <p className="font-bold text-slate-900 mb-1">{day.date} @ {String(hour).padStart(2, "0")}:00 UTC</p>
                              <p className="text-slate-600">Records: <span className="font-bold text-blue-600">{cell.count}</span></p>
                              {cell.avgPm25 !== null && (
                                <p className="text-slate-600">Avg PM2.5: <span className="font-bold text-emerald-600">{cell.avgPm25} µg/m³</span></p>
                              )}
                              {cell.avgError !== null && (
                                <p className="text-slate-600">Avg Error Margin: <span className="font-bold text-amber-600">±{cell.avgError}</span></p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis Date Labels */}
              <div className="flex items-center gap-1 pt-2">
                <span className="w-12" />
                <div className="flex items-center justify-between flex-1 text-[10px] text-slate-400 font-mono">
                  <span>{dates[0]}</span>
                  {dates.length > 5 && <span>{dates[Math.floor(dates.length / 2)]}</span>}
                  <span>{dates[dates.length - 1]}</span>
                </div>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* 2. Daily Uptime & Performance Calendar Summary */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 pt-4 px-6 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Daily Operational Uptime & Reporting Rate
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Daily breakdown of hours reported (out of 24h) and overall uptime percentage
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {dailySummary.map((d) => (
              <div
                key={d.date}
                className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-1 hover:border-blue-300 transition-all"
              >
                <span className="text-[11px] font-bold text-slate-700 truncate">{d.date}</span>
                <div className="flex items-baseline justify-between pt-1">
                  <span className={`text-sm font-extrabold ${d.uptimePct >= 75 ? "text-emerald-600" : d.uptimePct >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                    {d.uptimePct}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{d.activeHours}/24 hrs</span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5 border-t border-slate-200/60">
                  <span>{d.totalDayRecords.toLocaleString()} rows</span>
                  {d.avgDayPm25 !== null && <span>{d.avgDayPm25} µg/m³</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
