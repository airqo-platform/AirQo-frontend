"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts"
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Trophy,
  ShieldCheck,
  Search,
  ArrowUpDown,
  Sliders,
  TrendingDown,
  Clock,
  Gauge,
} from "lucide-react"
import type { StandardizedRecord } from "@/lib/visualise/column-mapper"

interface CohortSummaryViewProps {
  records: StandardizedRecord[]
}

interface DeviceHealthMetric {
  device: string
  count: number
  activeHours: number
  totalSpanHours: number
  uptimePct: number
  avgError: number | null
  maxError: number | null
  avgPm25: number | null
  avgPm10: number | null
  avgBattery: number | null
  minBattery: number | null
  avgTemp: number | null
  avgHumidity: number | null
  healthStatus: "Optimal" | "Degraded" | "Critical"
  healthReason: string
}

const HEALTH_COLORS = {
  Optimal: "#10b981", // Emerald
  Degraded: "#f59e0b", // Amber
  Critical: "#ef4444", // Rose
}

export function CohortSummaryView({ records }: CohortSummaryViewProps) {
  const [tableSearch, setTableSearch] = useState("")
  const [sortField, setSortField] = useState<keyof DeviceHealthMetric>("uptimePct")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Compute Device Health & Performance Aggregations
  const deviceHealthData = useMemo(() => {
    if (records.length === 0) return []

    // 1. Group records by device
    const map = new Map<
      string,
      {
        device: string
        count: number
        timestamps: number[]
        hourSet: Set<string>
        errorArr: number[]
        pm25Arr: number[]
        pm10Arr: number[]
        batteryArr: number[]
        tempArr: number[]
        humArr: number[]
      }
    >()

    // Global time span across dataset
    let globalMinTime = Number.MAX_SAFE_INTEGER
    let globalMaxTime = 0

    for (const r of records) {
      if (!map.has(r.deviceName)) {
        map.set(r.deviceName, {
          device: r.deviceName,
          count: 0,
          timestamps: [],
          hourSet: new Set(),
          errorArr: [],
          pm25Arr: [],
          pm10Arr: [],
          batteryArr: [],
          tempArr: [],
          humArr: [],
        })
      }

      const item = map.get(r.deviceName)!
      item.count++

      if (r.timestamp) {
        const t = r.timestamp.getTime()
        if (!isNaN(t)) {
          item.timestamps.push(t)
          if (t < globalMinTime) globalMinTime = t
          if (t > globalMaxTime) globalMaxTime = t

          const hourKey = `${r.timestamp.getUTCFullYear()}-${r.timestamp.getUTCMonth()}-${r.timestamp.getUTCDate()}-${r.timestamp.getUTCHours()}`
          item.hourSet.add(hourKey)
        }
      }

      if (r.errorMarginPm25 !== null) item.errorArr.push(r.errorMarginPm25)
      if (r.pm25 !== null) item.pm25Arr.push(r.pm25)
      if (r.pm10 !== null) item.pm10Arr.push(r.pm10)
      if (r.battery !== null) item.batteryArr.push(r.battery)
      if (r.primaryTemp !== null) item.tempArr.push(r.primaryTemp)
      if (r.primaryHumidity !== null) item.humArr.push(r.primaryHumidity)
    }

    const totalSpanHours =
      globalMaxTime > globalMinTime
        ? Math.max(1, Math.ceil((globalMaxTime - globalMinTime) / (1000 * 60 * 60)))
        : 1

    const avg = (arr: number[]) =>
      arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : null
    const max = (arr: number[]) =>
      arr.length > 0 ? Number(Math.max(...arr).toFixed(1)) : null
    const min = (arr: number[]) =>
      arr.length > 0 ? Number(Math.min(...arr).toFixed(1)) : null

    return Array.from(map.values()).map((d): DeviceHealthMetric => {
      const activeHours = d.hourSet.size
      const uptimePct = Math.min(100, Number(((activeHours / totalSpanHours) * 100).toFixed(1)))
      const avgError = avg(d.errorArr)
      const maxError = max(d.errorArr)
      const avgPm25 = avg(d.pm25Arr)
      const avgPm10 = avg(d.pm10Arr)
      const avgBattery = avg(d.batteryArr)
      const minBattery = min(d.batteryArr)
      const avgTemp = avg(d.tempArr)
      const avgHumidity = avg(d.humArr)

      // Determine Health Status
      let healthStatus: "Optimal" | "Degraded" | "Critical" = "Optimal"
      const reasons: string[] = []

      if (avgError !== null && avgError > 10.0) {
        healthStatus = "Critical"
        reasons.push("High Inter-Sensor Error (>10 µg/m³)")
      } else if (uptimePct < 40) {
        healthStatus = "Critical"
        reasons.push("Severe Downtime (<40%)")
      } else if (minBattery !== null && minBattery < 3.4) {
        healthStatus = "Critical"
        reasons.push("Critical Battery Voltage (<3.4V)")
      } else if (avgError !== null && avgError > 5.0) {
        healthStatus = "Degraded"
        reasons.push("Moderate Sensor Discrepancy (>5 µg/m³)")
      } else if (uptimePct < 75) {
        healthStatus = "Degraded"
        reasons.push("Intermittent Uptime (<75%)")
      } else if (minBattery !== null && minBattery < 3.6) {
        healthStatus = "Degraded"
        reasons.push("Low Battery Range (<3.6V)")
      }

      const healthReason = reasons.length > 0 ? reasons.join(", ") : "All metrics within healthy calibration thresholds"

      return {
        device: d.device,
        count: d.count,
        activeHours,
        totalSpanHours,
        uptimePct,
        avgError,
        maxError,
        avgPm25,
        avgPm10,
        avgBattery,
        minBattery,
        avgTemp,
        avgHumidity,
        healthStatus,
        healthReason,
      }
    })
  }, [records])

  // Fleet Overview Totals
  const fleetSummary = useMemo(() => {
    if (deviceHealthData.length === 0) return null

    const totalDevices = deviceHealthData.length
    const avgUptime = Number(
      (deviceHealthData.reduce((s, d) => s + d.uptimePct, 0) / totalDevices).toFixed(1)
    )

    const devicesWithError = deviceHealthData.filter((d) => d.avgError !== null)
    const fleetAvgError =
      devicesWithError.length > 0
        ? Number(
            (
              devicesWithError.reduce((s, d) => s + (d.avgError || 0), 0) /
              devicesWithError.length
            ).toFixed(1)
          )
        : null

    const criticalCount = deviceHealthData.filter((d) => d.healthStatus === "Critical").length
    const degradedCount = deviceHealthData.filter((d) => d.healthStatus === "Degraded").length
    const optimalCount = deviceHealthData.filter((d) => d.healthStatus === "Optimal").length

    return {
      totalDevices,
      avgUptime,
      fleetAvgError,
      criticalCount,
      degradedCount,
      optimalCount,
    }
  }, [deviceHealthData])

  // Top & Bottom Rankings
  const rankings = useMemo(() => {
    if (deviceHealthData.length === 0) return { bestUptime: [], worstUptime: [], bestError: [], worstError: [] }

    const byUptime = [...deviceHealthData].sort((a, b) => b.uptimePct - a.uptimePct)
    const byError = [...deviceHealthData]
      .filter((d) => d.avgError !== null)
      .sort((a, b) => a.avgError! - b.avgError!)

    return {
      bestUptime: byUptime.slice(0, 5),
      worstUptime: [...byUptime].reverse().slice(0, 5),
      bestError: byError.slice(0, 5),
      worstError: [...byError].reverse().slice(0, 5),
    }
  }, [deviceHealthData])

  // Health Status Donut Distribution
  const healthDistribution = useMemo(() => {
    if (!fleetSummary) return []
    return [
      { name: "Optimal Health", value: fleetSummary.optimalCount, color: HEALTH_COLORS.Optimal },
      { name: "Degraded / Warning", value: fleetSummary.degradedCount, color: HEALTH_COLORS.Degraded },
      { name: "Critical / Needs Action", value: fleetSummary.criticalCount, color: HEALTH_COLORS.Critical },
    ].filter((d) => d.value > 0)
  }, [fleetSummary])

  // Filtered & Sorted Table Data
  const sortedTableData = useMemo(() => {
    let list = deviceHealthData

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase()
      list = list.filter((d) => d.device.toLowerCase().includes(q) || d.healthReason.toLowerCase().includes(q))
    }

    return [...list].sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]

      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA
      }

      const strA = String(valA).toLowerCase()
      const strB = String(valB).toLowerCase()
      return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA)
    })
  }, [deviceHealthData, tableSearch, sortField, sortDirection])

  const handleSort = (field: keyof DeviceHealthMetric) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  if (records.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-12 text-center text-slate-500 text-xs">
          No records available to compute fleet health diagnostics.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Fleet Health KPI Summary Cards */}
      {fleetSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monitored Fleet</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{fleetSummary.totalDevices} Devices</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{records.length.toLocaleString()} total data packets</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Gauge className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fleet Avg Uptime</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{fleetSummary.avgUptime}%</h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  {fleetSummary.optimalCount} of {fleetSummary.totalDevices} stations optimal
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inter-Sensor Error</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {fleetSummary.fleetAvgError !== null ? `±${fleetSummary.fleetAvgError} µg/m³` : "N/A"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Mean |S1 - S2| collocation delta</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Alerts</p>
                <h3 className={`text-2xl font-bold mt-1 ${fleetSummary.criticalCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {fleetSummary.criticalCount + fleetSummary.degradedCount} Devices
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {fleetSummary.criticalCount} critical, {fleetSummary.degradedCount} warning
                </p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${fleetSummary.criticalCount > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                {fleetSummary.criticalCount > 0 ? <AlertOctagon className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Best & Worst Performance Highlights (4 Leaderboard Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Best Uptime */}
        <Card className="border-emerald-200 bg-emerald-50/30 shadow-xs">
          <CardHeader className="pb-2 pt-3.5 px-4 border-b border-emerald-100">
            <CardTitle className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                Best Uptime Leaders
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-100/80 text-emerald-800 border-emerald-300 font-mono">
                Top 5
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {rankings.bestUptime.map((d, i) => (
              <div key={d.device} className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-100 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 truncate max-w-[120px]">{d.device}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="font-bold text-emerald-700">{d.uptimePct}%</span>
                  <span className="text-slate-400 text-[10px]">({d.activeHours}h)</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 2. Lowest Uptime (Downtime Risks) */}
        <Card className="border-amber-200 bg-amber-50/30 shadow-xs">
          <CardHeader className="pb-2 pt-3.5 px-4 border-b border-amber-100">
            <CardTitle className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                Lowest Uptime / Intermittent
              </span>
              <Badge variant="outline" className="text-[10px] bg-amber-100/80 text-amber-800 border-amber-300 font-mono">
                Needs Check
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {rankings.worstUptime.map((d, i) => (
              <div key={d.device} className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-100 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 truncate max-w-[120px]">{d.device}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className={`font-bold ${d.uptimePct < 50 ? "text-rose-600" : "text-amber-700"}`}>{d.uptimePct}%</span>
                  <span className="text-slate-400 text-[10px]">({d.activeHours}h)</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Best Sensor Agreement (Lowest Error Margin) */}
        <Card className="border-blue-200 bg-blue-50/30 shadow-xs">
          <CardHeader className="pb-2 pt-3.5 px-4 border-b border-blue-100">
            <CardTitle className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Best Sensor Agreement
              </span>
              <Badge variant="outline" className="text-[10px] bg-blue-100/80 text-blue-800 border-blue-300 font-mono">
                |S1 - S2| Min
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {rankings.bestError.map((d, i) => (
              <div key={d.device} className="flex items-center justify-between p-2 rounded-lg bg-white border border-blue-100 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 truncate max-w-[120px]">{d.device}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="font-bold text-blue-700">±{d.avgError} µg/m³</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 4. Highest Error Margin (Sensor Drift / Discrepancy) */}
        <Card className="border-rose-200 bg-rose-50/30 shadow-xs">
          <CardHeader className="pb-2 pt-3.5 px-4 border-b border-rose-100">
            <CardTitle className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Sensor Drift / Discrepancy
              </span>
              <Badge variant="outline" className="text-[10px] bg-rose-100/80 text-rose-800 border-rose-300 font-mono">
                Highest Delta
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {rankings.worstError.map((d, i) => (
              <div key={d.device} className="flex items-center justify-between p-2 rounded-lg bg-white border border-rose-100 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 truncate max-w-[120px]">{d.device}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className={`font-bold ${d.avgError && d.avgError > 10 ? "text-rose-700" : "text-amber-700"}`}>
                    ±{d.avgError} µg/m³
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 3. Visual Health Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Inter-Sensor Error Margin by Device Bar Chart */}
        <div className="lg:col-span-8">
          <Card className="border-slate-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-3 pt-4 px-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    Inter-Sensor Collocation Error (|S1 - S2| Delta)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Mean absolute discrepancy between Channel 1 and Channel 2 PM2.5 sensors (Lower is better, &le;5 µg/m³ threshold)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...deviceHealthData].sort((a, b) => (b.avgError || 0) - (a.avgError || 0))}
                    margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="device"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={50}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      label={{ value: "Error Delta (µg/m³)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`±${val} µg/m³`, "Avg |S1 - S2| Error"]}
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <ReferenceLine y={5.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "5.0 µg/m³ Threshold", position: "right", fill: "#d97706", fontSize: 10 }} />
                    <Bar dataKey="avgError" name="Avg Error Delta (µg/m³)" radius={[4, 4, 0, 0]}>
                      {deviceHealthData.map((entry, index) => {
                        const err = entry.avgError || 0
                        const fill = err > 10.0 ? "#ef4444" : err > 5.0 ? "#f59e0b" : "#10b981"
                        return <Cell key={`cell-${index}`} fill={fill} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart 2: Fleet Health Classification Donut */}
        <div className="lg:col-span-4">
          <Card className="border-slate-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-3 pt-4 px-6 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Fleet Health Status Breakdown
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Overall health status combining uptime, error margin, and power
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-6 flex flex-col items-center justify-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Legend verticalAlign="bottom" height={40} iconType="circle" />
                    <Pie
                      data={healthDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {healthDistribution.map((entry, index) => (
                        <Cell key={`health-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Comprehensive Fleet Health Leaderboard Table */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 pt-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Fleet Health & Reliability Diagnostics Table
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Complete device-level sensor collocation, uptime, and battery telemetry audit
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              placeholder="Search station or flag..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort("device")}>
                  <div className="flex items-center gap-1">
                    <span>Station / Device</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort("healthStatus")}>
                  <div className="flex items-center gap-1">
                    <span>Health Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600 text-right" onClick={() => handleSort("uptimePct")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Uptime %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600 text-right" onClick={() => handleSort("avgError")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg Error (|S1 - S2|)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600 text-right" onClick={() => handleSort("maxError")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Max Error</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600 text-right" onClick={() => handleSort("avgBattery")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Battery (Avg/Min)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Packets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {sortedTableData.map((d) => (
                <tr key={d.device} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    <div>
                      <span>{d.device}</span>
                      <p className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-[200px]">
                        {d.healthReason}
                      </p>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-sans">
                    {d.healthStatus === "Optimal" ? (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Optimal
                      </Badge>
                    ) : d.healthStatus === "Degraded" ? (
                      <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-semibold gap-1">
                        <AlertTriangle className="w-3 h-3" /> Warning
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-rose-50 text-rose-800 border-rose-200 text-[10px] font-semibold gap-1">
                        <AlertOctagon className="w-3 h-3" /> Critical
                      </Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold">
                    <span className={d.uptimePct >= 80 ? "text-emerald-600" : d.uptimePct >= 50 ? "text-amber-600" : "text-rose-600"}>
                      {d.uptimePct}%
                    </span>
                    <span className="text-slate-400 text-[10px] block">({d.activeHours}h)</span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {d.avgError !== null ? (
                      <span className={`font-bold ${d.avgError > 10 ? "text-rose-600" : d.avgError > 5 ? "text-amber-600" : "text-slate-700"}`}>
                        ±{d.avgError} µg/m³
                      </span>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500">
                    {d.maxError !== null ? `±${d.maxError}` : "—"}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-600">
                    {d.avgBattery !== null ? (
                      <span>
                        {d.avgBattery}V <span className="text-slate-400 text-[10px]">({d.minBattery}V min)</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500">
                    {d.count.toLocaleString()}
                  </td>
                </tr>
              ))}
              {sortedTableData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-sans">
                    No devices match your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
