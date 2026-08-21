"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "recharts"
import {
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react"
import type { StandardizedRecord } from "@/lib/visualise/column-mapper"
import { getAQICategory } from "@/lib/visualise/column-mapper"

interface CohortSummaryViewProps {
  records: StandardizedRecord[]
}

const AQI_COLORS: Record<string, string> = {
  Good: "#45ae03",
  Moderate: "#e5cc16",
  Sensitive: "#ff9800",
  Unhealthy: "#d32f2f",
  "Very Unhealthy": "#8e24aa",
  Hazardous: "#5d4037",
  Unknown: "#94a3b8",
}

export function CohortSummaryView({ records }: CohortSummaryViewProps) {
  // Device Comparison Aggregations
  const deviceStats = useMemo(() => {
    const map = new Map<
      string,
      {
        deviceName: string
        count: number
        pm25Arr: number[]
        pm10Arr: number[]
        batteryArr: number[]
        errorArr: number[]
      }
    >()

    for (const r of records) {
      if (!map.has(r.deviceName)) {
        map.set(r.deviceName, {
          deviceName: r.deviceName,
          count: 0,
          pm25Arr: [],
          pm10Arr: [],
          batteryArr: [],
          errorArr: [],
        })
      }
      const item = map.get(r.deviceName)!
      item.count++
      if (r.pm25 !== null) item.pm25Arr.push(r.pm25)
      if (r.pm10 !== null) item.pm10Arr.push(r.pm10)
      if (r.battery !== null) item.batteryArr.push(r.battery)
      if (r.errorMarginPm25 !== null) item.errorArr.push(r.errorMarginPm25)
    }

    const avg = (arr: number[]) => (arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0)

    return Array.from(map.values()).map((d) => ({
      device: d.deviceName,
      records: d.count,
      avgPm25: avg(d.pm25Arr),
      avgPm10: avg(d.pm10Arr),
      avgBattery: avg(d.batteryArr),
      avgError: avg(d.errorArr),
    }))
  }, [records])

  // AQI Severity Distribution
  const aqiDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      Good: 0,
      Moderate: 0,
      Sensitive: 0,
      Unhealthy: 0,
      "Very Unhealthy": 0,
      Hazardous: 0,
    }

    for (const r of records) {
      if (r.pm25 !== null) {
        const cat = getAQICategory(r.pm25).category
        if (counts[cat] !== undefined) {
          counts[cat]++
        }
      }
    }

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: AQI_COLORS[name] || "#94a3b8",
      }))
  }, [records])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Device Average PM2.5 & PM10 Comparison Bar Chart */}
        <div className="lg:col-span-8">
          <Card className="border-slate-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-3 pt-4 px-6 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Device PM2.5 & PM10 Average Comparison
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Mean particulate matter concentrations across monitored stations / devices
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceStats} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="device"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} label={{ value: "µg/m³", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Legend verticalAlign="top" height={32} />
                    <Bar dataKey="avgPm25" fill="#2563eb" name="Avg PM2.5 (µg/m³)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgPm10" fill="#0ea5e9" name="Avg PM10 (µg/m³)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. AQI Severity Distribution Donut Chart */}
        <div className="lg:col-span-4">
          <Card className="border-slate-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-3 pt-4 px-6 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                AQI Category Proportions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Air quality index severity breakdown
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
                      data={aqiDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {aqiDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
