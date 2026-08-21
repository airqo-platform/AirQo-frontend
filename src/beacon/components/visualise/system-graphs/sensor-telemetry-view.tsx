"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  Thermometer,
  Droplets,
  Battery,
  Zap,
  Eye,
  EyeOff,
  SlidersHorizontal,
} from "lucide-react"
import type { StandardizedRecord } from "@/lib/visualise/column-mapper"

interface SensorTelemetryViewProps {
  records: StandardizedRecord[]
  aggregation?: "none" | "hourly" | "daily"
}

export function SensorTelemetryView({ records, aggregation = "none" }: SensorTelemetryViewProps) {
  // PM2.5 Series Visibility Controls
  const [pm25Visibility, setPm25Visibility] = useState({
    s1: true,
    s2: true,
    errorMargin: true,
    avg: false,
  })

  // PM10 Series Visibility Controls
  const [pm10Visibility, setPm10Visibility] = useState({
    s1: true,
    s2: true,
    avg: false,
  })

  // Environmental Telemetry Visibility Controls (Temperature & Humidity)
  const [envVisibility, setEnvVisibility] = useState({
    temp: true,
    humidity: true,
  })

  // Battery Visibility Controls
  const [batteryVisible, setBatteryVisible] = useState(true)

  // Aggregate or downsample records for smooth charting
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return []

    // Sort by timestamp ascending
    const sorted = [...records].sort((a, b) => {
      const ta = a.timestamp?.getTime() || 0
      const tb = b.timestamp?.getTime() || 0
      return ta - tb
    })

    if (aggregation === "none") {
      // Downsample if more than 3000 points
      const step = sorted.length > 3000 ? Math.ceil(sorted.length / 3000) : 1
      const result = []

      for (let i = 0; i < sorted.length; i += step) {
        const r = sorted[i]
        result.push({
          time: r.timestampStr || "N/A",
          s1Pm25: r.s1Pm25,
          s2Pm25: r.s2Pm25,
          pm25: r.pm25,
          errorMarginPm25: r.errorMarginPm25,
          s1Pm10: r.s1Pm10,
          s2Pm10: r.s2Pm10,
          pm10: r.pm10,
          battery: r.battery,
          primaryTemp: r.primaryTemp,
          primaryHumidity: r.primaryHumidity,
          ...r.temperatures,
          ...r.humidities,
        })
      }
      return result
    }

    // Hourly or daily bucket aggregation
    const map = new Map<
      string,
      {
        time: string
        count: number
        s1Pm25Arr: number[]
        s2Pm25Arr: number[]
        errorMarginArr: number[]
        pm25Arr: number[]
        s1Pm10Arr: number[]
        s2Pm10Arr: number[]
        batteryArr: number[]
        tempArr: number[]
        rhArr: number[]
      }
    >()

    for (const r of sorted) {
      if (!r.timestamp) continue
      const d = r.timestamp
      const y = d.getUTCFullYear()
      const m = String(d.getUTCMonth() + 1).padStart(2, "0")
      const day = String(d.getUTCDate()).padStart(2, "0")
      const bucketKey =
        aggregation === "daily"
          ? `${y}-${m}-${day}`
          : `${y}-${m}-${day} ${String(d.getUTCHours()).padStart(2, "0")}:00`

      if (!map.has(bucketKey)) {
        map.set(bucketKey, {
          time: bucketKey,
          count: 0,
          s1Pm25Arr: [],
          s2Pm25Arr: [],
          errorMarginArr: [],
          pm25Arr: [],
          s1Pm10Arr: [],
          s2Pm10Arr: [],
          batteryArr: [],
          tempArr: [],
          rhArr: [],
        })
      }
      const b = map.get(bucketKey)!
      b.count++
      if (r.s1Pm25 !== null) b.s1Pm25Arr.push(r.s1Pm25)
      if (r.s2Pm25 !== null) b.s2Pm25Arr.push(r.s2Pm25)
      if (r.errorMarginPm25 !== null) b.errorMarginArr.push(r.errorMarginPm25)
      if (r.pm25 !== null) b.pm25Arr.push(r.pm25)
      if (r.s1Pm10 !== null) b.s1Pm10Arr.push(r.s1Pm10)
      if (r.s2Pm10 !== null) b.s2Pm10Arr.push(r.s2Pm10)
      if (r.battery !== null) b.batteryArr.push(r.battery)
      if (r.primaryTemp !== null) b.tempArr.push(r.primaryTemp)
      if (r.primaryHumidity !== null) b.rhArr.push(r.primaryHumidity)
    }

    return Array.from(map.values()).map((b) => {
      const avg = (arr: number[]) =>
        arr.length > 0
          ? Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(2))
          : null
      return {
        time: b.time,
        s1Pm25: avg(b.s1Pm25Arr),
        s2Pm25: avg(b.s2Pm25Arr),
        errorMarginPm25: avg(b.errorMarginArr),
        pm25: avg(b.pm25Arr),
        s1Pm10: avg(b.s1Pm10Arr),
        s2Pm10: avg(b.s2Pm10Arr),
        battery: avg(b.batteryArr),
        primaryTemp: avg(b.tempArr),
        primaryHumidity: avg(b.rhArr),
      }
    })
  }, [records, aggregation])

  const formatTick = (timeStr: string) => {
    try {
      const d = new Date(timeStr)
      if (!isNaN(d.getTime())) {
        return `${d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })} ${d.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`
      }
    } catch {
      // fallback
    }
    return timeStr.substring(0, 16)
  }

  const hasPm25 = chartData.some((d) => d.s1Pm25 !== null || d.s2Pm25 !== null)
  const hasPm10 = chartData.some((d) => d.s1Pm10 !== null || d.s2Pm10 !== null)
  const hasTemp = chartData.some((d) => d.primaryTemp !== null)
  const hasHumidity = chartData.some((d) => d.primaryHumidity !== null)
  const hasBattery = chartData.some((d) => d.battery !== null)

  return (
    <div className="space-y-6">
      {/* 1. PM2.5 Dual-Sensor Timeseries + Error Margin */}
      {hasPm25 && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 pt-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Particulate Matter PM2.5 (Sensor 1 vs Sensor 2 & Error Margin)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Dual-channel PM2.5 concentrations alongside inter-sensor error margin (|S1 - S2|) in µg/m³
              </CardDescription>
            </div>

            {/* Interactive Toggle Pills to Gray Out Series */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                Toggle:
              </span>

              {/* Sensor 1 Pill */}
              <button
                type="button"
                onClick={() =>
                  setPm25Visibility((prev) => ({ ...prev, s1: !prev.s1 }))
                }
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  pm25Visibility.s1
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-200/80 text-slate-400 line-through opacity-70"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    pm25Visibility.s1 ? "bg-white" : "bg-slate-400"
                  }`}
                />
                Sensor 1
              </button>

              {/* Sensor 2 Pill */}
              <button
                type="button"
                onClick={() =>
                  setPm25Visibility((prev) => ({ ...prev, s2: !prev.s2 }))
                }
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  pm25Visibility.s2
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-200/80 text-slate-400 line-through opacity-70"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    pm25Visibility.s2 ? "bg-white" : "bg-slate-400"
                  }`}
                />
                Sensor 2
              </button>

              {/* Error Margin Pill */}
              <button
                type="button"
                onClick={() =>
                  setPm25Visibility((prev) => ({
                    ...prev,
                    errorMargin: !prev.errorMargin,
                  }))
                }
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  pm25Visibility.errorMargin
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-200/80 text-slate-400 line-through opacity-70"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    pm25Visibility.errorMargin ? "bg-white" : "bg-slate-400"
                  }`}
                />
                Error Margin (|S1 - S2|)
              </button>

              {/* Sensor Average Pill */}
              <button
                type="button"
                onClick={() =>
                  setPm25Visibility((prev) => ({ ...prev, avg: !prev.avg }))
                }
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  pm25Visibility.avg
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-200/80 text-slate-400 opacity-70"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    pm25Visibility.avg ? "bg-white" : "bg-slate-400"
                  }`}
                />
                Average PM2.5
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-5">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatTick}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    dy={6}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    label={{
                      value: "PM2.5 (µg/m³)",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend verticalAlign="top" height={32} iconType="circle" />

                  {/* Sensor 1 PM2.5 */}
                  {pm25Visibility.s1 && (
                    <Line
                      type="monotone"
                      dataKey="s1Pm25"
                      stroke="#2563eb"
                      strokeWidth={2.2}
                      dot={false}
                      name="Sensor 1 PM2.5"
                    />
                  )}

                  {/* Sensor 2 PM2.5 */}
                  {pm25Visibility.s2 && (
                    <Line
                      type="monotone"
                      dataKey="s2Pm25"
                      stroke="#10b981"
                      strokeWidth={2.2}
                      dot={false}
                      name="Sensor 2 PM2.5"
                    />
                  )}

                  {/* Error Margin (|S1 - S2|) */}
                  {pm25Visibility.errorMargin && (
                    <Line
                      type="monotone"
                      dataKey="errorMarginPm25"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      name="Error Margin (|S1 - S2|)"
                    />
                  )}

                  {/* Average PM2.5 */}
                  {pm25Visibility.avg && (
                    <Line
                      type="monotone"
                      dataKey="pm25"
                      stroke="#8b5cf6"
                      strokeWidth={1.8}
                      strokeDasharray="2 2"
                      dot={false}
                      name="Sensor Average PM2.5"
                    />
                  )}

                  {chartData.length > 30 && (
                    <Brush
                      dataKey="time"
                      height={20}
                      stroke="#94a3b8"
                      fill="#f8fafc"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Temperature & Relative Humidity (With Gray-out Toggles) */}
      {(hasTemp || hasHumidity) && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 pt-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-600" />
                Environmental Telemetry (Temperature & Humidity)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Dual-axis environmental telemetry. Click the buttons to gray out either Temperature or Humidity.
              </CardDescription>
            </div>

            {/* Interactive Toggle Pills to Gray Out Temp or Humidity */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                Toggle:
              </span>

              {/* Temperature Pill */}
              <button
                type="button"
                onClick={() =>
                  setEnvVisibility((prev) => ({ ...prev, temp: !prev.temp }))
                }
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  envVisibility.temp
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-200/80 text-slate-400 line-through opacity-70"
                }`}
              >
                <Thermometer className="w-3 h-3" />
                <span>Temperature (°C)</span>
                {envVisibility.temp ? (
                  <Eye className="w-3 h-3 ml-0.5" />
                ) : (
                  <EyeOff className="w-3 h-3 ml-0.5" />
                )}
              </button>

              {/* Humidity Pill */}
              <button
                type="button"
                onClick={() =>
                  setEnvVisibility((prev) => ({
                    ...prev,
                    humidity: !prev.humidity,
                  }))
                }
                className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  envVisibility.humidity
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-200/80 text-slate-400 line-through opacity-70"
                }`}
              >
                <Droplets className="w-3 h-3" />
                <span>Relative Humidity (%)</span>
                {envVisibility.humidity ? (
                  <Eye className="w-3 h-3 ml-0.5" />
                ) : (
                  <EyeOff className="w-3 h-3 ml-0.5" />
                )}
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-5">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatTick}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    dy={6}
                  />

                  {/* Left Axis for Temperature */}
                  {envVisibility.temp ? (
                    <YAxis
                      yAxisId="temp"
                      orientation="left"
                      tick={{ fontSize: 11, fill: "#d97706" }}
                      label={{
                        value: "Temp (°C)",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 11,
                        fill: "#d97706",
                      }}
                    />
                  ) : (
                    <YAxis yAxisId="temp" hide />
                  )}

                  {/* Right Axis for Humidity */}
                  {envVisibility.humidity ? (
                    <YAxis
                      yAxisId="rh"
                      orientation="right"
                      tick={{ fontSize: 11, fill: "#0284c7" }}
                      label={{
                        value: "Humidity (%)",
                        angle: 90,
                        position: "insideRight",
                        fontSize: 11,
                        fill: "#0284c7",
                      }}
                      domain={[0, 100]}
                    />
                  ) : (
                    <YAxis yAxisId="rh" hide />
                  )}

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend verticalAlign="top" height={32} iconType="circle" />

                  {/* Temperature Curve */}
                  {envVisibility.temp && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="primaryTemp"
                      stroke="#d97706"
                      strokeWidth={2.2}
                      dot={false}
                      name="Temperature (°C)"
                    />
                  )}

                  {/* Humidity Curve */}
                  {envVisibility.humidity && (
                    <Line
                      yAxisId="rh"
                      type="monotone"
                      dataKey="primaryHumidity"
                      stroke="#0284c7"
                      strokeWidth={2.2}
                      dot={false}
                      name="Relative Humidity (%)"
                    />
                  )}

                  {chartData.length > 30 && (
                    <Brush
                      dataKey="time"
                      height={20}
                      stroke="#94a3b8"
                      fill="#f8fafc"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Battery Voltage & Charging Profile */}
      {hasBattery && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 pt-4 px-6 flex flex-row items-center justify-between border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-600" />
                Battery Voltage & Power Profile
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Battery charge/discharge voltage across time (V)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBatteryVisible(!batteryVisible)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  batteryVisible
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-200 text-slate-400 line-through opacity-70"
                }`}
              >
                <Battery className="w-3 h-3" />
                Battery (V)
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatTick}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    dy={6}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    domain={["dataMin - 0.2", "dataMax + 0.2"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend verticalAlign="top" height={32} iconType="circle" />
                  {batteryVisible && (
                    <Area
                      type="monotone"
                      dataKey="battery"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#batteryGrad)"
                      name="Battery Voltage (V)"
                    />
                  )}
                  {chartData.length > 30 && (
                    <Brush
                      dataKey="time"
                      height={20}
                      stroke="#94a3b8"
                      fill="#f8fafc"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
