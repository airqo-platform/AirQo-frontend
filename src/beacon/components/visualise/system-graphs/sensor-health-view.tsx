"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
} from "recharts"
import {
  Activity,
  Calculator,
  Zap,
  TrendingUp,
  Table as TableIcon,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import type { StandardizedRecord } from "@/lib/visualise/column-mapper"
import { calculateCorrelation } from "@/lib/visualise/data-parser"

interface SensorHealthViewProps {
  records: StandardizedRecord[]
}

export function SensorHealthView({ records }: SensorHealthViewProps) {
  // Scatter points (S1 vs S2)
  const scatterPoints = useMemo(() => {
    return records
      .filter((r) => r.s1Pm25 !== null && r.s2Pm25 !== null)
      .slice(0, 3000)
      .map((r) => ({
        s1: r.s1Pm25,
        s2: r.s2Pm25,
        time: r.timestampStr,
      }))
  }, [records])

  // Correlation Stats
  const stats = useMemo(() => {
    const valid = records.filter((r) => r.s1Pm25 !== null && r.s2Pm25 !== null)
    if (valid.length < 2) return null

    const dataObjs = valid.map((r) => ({ s1: r.s1Pm25, s2: r.s2Pm25 }))
    return calculateCorrelation(dataObjs, "s1", "s2")
  }, [records])

  // Error Margin timeline
  const errorMarginData = useMemo(() => {
    return records
      .filter((r) => r.errorMarginPm25 !== null)
      .slice(0, 3000)
      .map((r) => ({
        time: r.timestampStr || "N/A",
        errorMargin: r.errorMarginPm25,
      }))
  }, [records])

  // Pairwise Correlation Matrix between all numeric telemetry
  const matrix = useMemo(() => {
    const metrics: { key: string; label: string; values: (number | null)[] }[] = [
      { key: "s1Pm25", label: "S1 PM2.5", values: records.map((r) => r.s1Pm25) },
      { key: "s2Pm25", label: "S2 PM2.5", values: records.map((r) => r.s2Pm25) },
      { key: "pm10", label: "PM10", values: records.map((r) => r.pm10) },
      { key: "temp", label: "Temperature", values: records.map((r) => r.primaryTemp) },
      { key: "rh", label: "Humidity", values: records.map((r) => r.primaryHumidity) },
      { key: "battery", label: "Battery", values: records.map((r) => r.battery) },
    ].filter((m) => m.values.some((v) => v !== null))

    const grid: { row: string; cells: { col: string; r: number | null }[] }[] = []

    for (const rowMetric of metrics) {
      const cells = []
      for (const colMetric of metrics) {
        if (rowMetric.key === colMetric.key) {
          cells.push({ col: colMetric.label, r: 1.0 })
          continue
        }

        // Calculate correlation between rowMetric and colMetric
        const validPairs = []
        for (let i = 0; i < records.length; i++) {
          const v1 = rowMetric.values[i]
          const v2 = colMetric.values[i]
          if (v1 !== null && v2 !== null) {
            validPairs.push({ a: v1, b: v2 })
          }
        }

        if (validPairs.length < 3) {
          cells.push({ col: colMetric.label, r: null })
        } else {
          const res = calculateCorrelation(validPairs, "a", "b")
          cells.push({ col: colMetric.label, r: res ? res.r : null })
        }
      }
      grid.push({ row: rowMetric.label, cells })
    }

    return { metrics: metrics.map((m) => m.label), grid }
  }, [records])

  const formatTick = (timeStr: string) => {
    try {
      const d = new Date(timeStr)
      if (!isNaN(d.getTime())) {
        return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${d.toLocaleTimeString(
          undefined,
          { hour: "2-digit", minute: "2-digit", hour12: false }
        )}`
      }
    } catch {
      // fallback
    }
    return timeStr.substring(0, 16)
  }

  const getCorrColor = (r: number | null) => {
    if (r === null) return "bg-slate-100 text-slate-400"
    if (r >= 0.8) return "bg-emerald-100 text-emerald-900 font-bold"
    if (r >= 0.5) return "bg-emerald-50 text-emerald-800"
    if (r >= 0.2) return "bg-blue-50 text-blue-700"
    if (r >= -0.2) return "bg-slate-50 text-slate-600"
    if (r >= -0.5) return "bg-amber-50 text-amber-800"
    return "bg-rose-100 text-rose-900 font-bold"
  }

  return (
    <div className="space-y-6">
      {/* 1. S1 vs S2 Scatter Plot & Linear Regression */}
      {scatterPoints.length > 0 && stats && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 pt-4 px-6 flex flex-row items-center justify-between border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Inter-Sensor Agreement (Sensor 1 vs Sensor 2 PM2.5)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Linear regression and scatter correlation for collocation validation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold text-xs">
                R² = {stats.r2}
              </Badge>
              <Badge variant="outline" className="text-xs text-blue-600 font-mono">
                r = {stats.r}
              </Badge>
            </div>
          </CardHeader>

          {/* Quick Metrics Bar */}
          <div className="bg-slate-50 px-6 py-2 border-b border-slate-100 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-700">
            <span className="font-semibold text-blue-700">
              Fit: y = {stats.slope}x {stats.intercept >= 0 ? `+ ${stats.intercept}` : `- ${Math.abs(stats.intercept)}`}
            </span>
            <span>MAE: ±{stats.mae} µg/m³</span>
            <span>{stats.count.toLocaleString()} valid pairs</span>
            {stats.r2 >= 0.85 ? (
              <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Agreement (Passed)
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Moderate/Low Agreement
              </span>
            )}
          </div>

          <CardContent className="p-4 pt-5">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="s1"
                    name="Sensor 1 PM2.5"
                    unit=" µg/m³"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    label={{ value: "Sensor 1 PM2.5 (µg/m³)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="s2"
                    name="Sensor 2 PM2.5"
                    unit=" µg/m³"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    label={{ value: "Sensor 2 PM2.5 (µg/m³)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Scatter name="S1 vs S2" data={scatterPoints} fill="#2563eb" opacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Sensor PM2.5 Error Margin Timeline */}
      {errorMarginData.length > 0 && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 pt-4 px-6 flex flex-row items-center justify-between border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Sensor Error Margin Timeline (|S1 - S2|)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Absolute difference between sensor 1 and sensor 2 PM2.5 readings over time
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-amber-600 bg-amber-50">
              Error Margin (µg/m³)
            </Badge>
          </CardHeader>
          <CardContent className="p-4 pt-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={errorMarginData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" tickFormatter={formatTick} tick={{ fontSize: 11, fill: "#64748b" }} dy={6} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="errorMargin" stroke="#f59e0b" strokeWidth={2} fill="url(#errorGrad)" name="Error Margin (|S1 - S2|)" />
                  {errorMarginData.length > 30 && <Brush dataKey="time" height={20} stroke="#94a3b8" fill="#f8fafc" />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Multi-Variable Correlation Matrix */}
      {matrix.grid.length > 1 && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 pt-4 px-6 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-purple-600" />
              Pairwise Correlation Matrix (Pearson r)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Inter-variable linear dependency matrix between particulate matter, environmental conditions, and power
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-2 text-left text-slate-500 font-semibold">Variable</th>
                    {matrix.metrics.map((m) => (
                      <th key={m} className="p-2 font-semibold text-slate-700 whitespace-nowrap">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.grid.map((row) => (
                    <tr key={row.row} className="border-b border-slate-100">
                      <td className="p-2 text-left font-semibold text-slate-800 whitespace-nowrap">{row.row}</td>
                      {row.cells.map((cell, idx) => (
                        <td key={idx} className="p-2">
                          <div className={`py-1 px-2 rounded font-mono text-xs ${getCorrColor(cell.r)}`}>
                            {cell.r !== null ? cell.r.toFixed(2) : "—"}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
