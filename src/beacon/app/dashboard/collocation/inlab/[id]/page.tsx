"use client"

import React, { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Wifi, AlertTriangle, FlaskConical, CheckCircle2, Activity, FileText, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCategoryLabel } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useApiData } from "@/hooks/useApiData"
import { getBatchDetail } from "@/services/inlab.service"
import type { InlabBatchWithPerformance, InlabBatchDeviceWithPerformance, InlabDeviceDaily, InlabDeviceDataPoint } from "@/types/inlab.types"
import { toast } from "sonner"

// --- Helpers ---

function getMarginBadgeColor(margin: number) {
  if (margin <= 3) return "bg-green-100 text-green-700 hover:bg-green-200"
  if (margin <= 5) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
  return "bg-red-100 text-red-700 hover:bg-red-200"
}

function pearsonCorrelation(x: number[], y: number[]): number | null {
  const n = Math.min(x.length, y.length)
  if (n < 2) return null
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (let i = 0; i < n; i++) {
    sumX += x[i]; sumY += y[i]
    sumXY += x[i] * y[i]
    sumX2 += x[i] * x[i]; sumY2 += y[i] * y[i]
  }
  const num = n * sumXY - sumX * sumY
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  if (!den) return null
  return num / den
}

function computeDeviceCorrelation(data?: InlabDeviceDataPoint[]): number | null {
  if (!data || data.length === 0) return null
  const s1: number[] = []
  const s2: number[] = []
  for (const p of data) {
    const a = p["pm2.5 sensor1"]
    const b = p["pm2.5 sensor2"]
    if (a !== null && a !== undefined && b !== null && b !== undefined) {
      s1.push(a); s2.push(b)
    }
  }
  return pearsonCorrelation(s1, s2)
}

function getCorrelationBadgeColor(c: number | null) {
  if (c === null || isNaN(c)) return "bg-gray-100 text-gray-600"
  if (c >= 0.9) return "bg-green-100 text-green-700 hover:bg-green-200"
  if (c >= 0.7) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
  return "bg-red-100 text-red-700 hover:bg-red-200"
}

// Derive per-day uptime / error_margin / correlation from raw hourly data.
// Used when the API doesn't return a `daily` summary array for the device.
function deriveDailyFromData(data?: InlabDeviceDataPoint[]): InlabDeviceDaily[] {
  if (!data || data.length === 0) return []
  const groups: Record<string, InlabDeviceDataPoint[]> = {}
  for (const p of data) {
    const date = new Date(p.datetime).toISOString().split("T")[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(p)
  }
  const dates = Object.keys(groups).sort()
  return dates.map((date) => {
    const pts = groups[date]
    // Uptime: fraction of expected hourly records present (24/day)
    const uptime = Math.min(100, (pts.length / 24) * 100)

    // Error margin: mean of |s1 - s2| / mean(s1,s2) * 100 for paired readings
    const s1: number[] = []
    const s2: number[] = []
    for (const p of pts) {
      const a = p["pm2.5 sensor1"]
      const b = p["pm2.5 sensor2"]
      if (a !== null && a !== undefined && b !== null && b !== undefined) {
        s1.push(a); s2.push(b)
      }
    }
    let errorMargin = 0
    if (s1.length > 0) {
      let sum = 0
      let cnt = 0
      for (let i = 0; i < s1.length; i++) {
        const mean = (s1[i] + s2[i]) / 2
        if (mean > 0) {
          sum += Math.abs(s1[i] - s2[i]) / mean * 100
          cnt++
        }
      }
      errorMargin = cnt > 0 ? sum / cnt : 0
    }

    const correlation = pearsonCorrelation(s1, s2)

    return {
      date,
      uptime: Math.round(uptime * 100) / 100,
      error_margin: Math.round(errorMargin * 10000) / 10000,
      correlation,
    }
  })
}

// --- Components ---

const ErrorMarginMiniGraph = ({ dailyData, averageMargin }: { dailyData?: InlabDeviceDaily[], averageMargin: number }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <Badge className={getMarginBadgeColor(averageMargin || 0)}>
        ±{averageMargin?.toFixed(2) || 0}
      </Badge>
    )
  }

  const values = dailyData.slice(-14)
  const maxMargin = Math.max(10, ...values.map((v) => v.error_margin))

  const getBarColor = (v: number) => {
    if (v <= 3) return "bg-green-500 hover:bg-green-600"
    if (v <= 5) return "bg-yellow-500 hover:bg-yellow-600"
    return "bg-red-500 hover:bg-red-600"
  }
  const getTipBg = (v: number) => {
    if (v <= 3) return "bg-green-600 border-green-700"
    if (v <= 5) return "bg-yellow-600 border-yellow-700"
    return "bg-red-600 border-red-700"
  }
  const getTextColor = (v: number) => {
    if (v <= 3) return "text-green-600"
    if (v <= 5) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className={`font-medium text-sm min-w-[55px] ${getTextColor(averageMargin)}`}>
          ±{averageMargin?.toFixed(2) || 0}
        </span>
        <div className="flex items-end gap-[2px] h-6">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1 rounded-t-sm ${getBarColor(item.error_margin)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.error_margin / maxMargin) * 24)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTipBg(item.error_margin)} text-white border-0`}>
                <div className="text-xs font-medium">
                  <div>{new Date(item.date).toLocaleDateString()}</div>
                  <div>Error Margin: ±{item.error_margin.toFixed(2)}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

const CorrelationDisplay = ({
  device,
}: {
  device: InlabBatchDeviceWithPerformance
}) => {
  // Prefer per-day correlation if available; otherwise compute from raw data
  const dailyCorr = device.daily?.filter(
    (d) => d.correlation !== null && d.correlation !== undefined
  ) || []

  let avg: number | null = null
  if (dailyCorr.length > 0) {
    avg = dailyCorr.reduce((a, d) => a + (d.correlation as number), 0) / dailyCorr.length
  } else if ((device as any).correlation !== undefined && (device as any).correlation !== null) {
    avg = (device as any).correlation
  } else {
    avg = computeDeviceCorrelation(device.data)
  }

  if (avg === null || isNaN(avg)) {
    return (
      <Badge className={getCorrelationBadgeColor(null)}>N/A</Badge>
    )
  }

  // If we have daily correlation history, render mini bars
  if (dailyCorr.length > 0) {
    const values = dailyCorr.slice(-14)
    const getBarColor = (v: number) => {
      if (v >= 0.9) return "bg-green-500 hover:bg-green-600"
      if (v >= 0.7) return "bg-yellow-500 hover:bg-yellow-600"
      return "bg-red-500 hover:bg-red-600"
    }
    const getTipBg = (v: number) => {
      if (v >= 0.9) return "bg-green-600 border-green-700"
      if (v >= 0.7) return "bg-yellow-600 border-yellow-700"
      return "bg-red-600 border-red-700"
    }

    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm min-w-[45px]">{avg.toFixed(2)}</span>
          <div className="flex items-end gap-[2px] h-6">
            {values.map((item, index) => {
              const v = item.correlation as number
              const heightVal = Math.max(0, Math.min(1, v))
              return (
                <Tooltip key={index} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-1 rounded-t-sm ${getBarColor(v)} transition-all cursor-pointer`}
                      style={{ height: `${Math.max(4, heightVal * 24)}px` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className={`${getTipBg(v)} text-white border-0`}>
                    <div className="text-xs font-medium">
                      <div>{new Date(item.date).toLocaleDateString()}</div>
                      <div>Correlation: {v.toFixed(3)}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <Badge className={getCorrelationBadgeColor(avg)}>{avg.toFixed(3)}</Badge>
  )
}

// --- Components ---

const UptimeMiniGraph = ({ dailyData, averageUptime }: { dailyData?: InlabDeviceDaily[], averageUptime: number }) => {
  if (!dailyData || dailyData.length === 0) {
    return <span className="text-muted-foreground text-sm font-medium">{averageUptime?.toFixed(1) || 0}%</span>
  }

  const values = dailyData.slice(-14)

  const getBarColor = (value: number) => {
    if (value >= 75) return "bg-green-500 hover:bg-green-600"
    if (value >= 50) return "bg-orange-500 hover:bg-orange-600"
    return "bg-red-500 hover:bg-red-600"
  }

  const getTooltipBgColor = (value: number) => {
    if (value >= 75) return "bg-green-600 border-green-700"
    if (value >= 50) return "bg-orange-600 border-orange-700"
    return "bg-red-600 border-red-700"
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm min-w-[45px]">{averageUptime?.toFixed(1) || 0}%</span>
        <div className="flex items-end gap-[2px] h-6">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1 rounded-t-sm ${getBarColor(item.uptime)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.uptime / 100) * 24)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTooltipBgColor(item.uptime)} text-white border-0`}>
                <div className="text-xs font-medium">
                  <div>{new Date(item.date).toLocaleDateString()}</div>
                  <div>Uptime: {item.uptime.toFixed(1)}%</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

const PerformanceAnalysis = ({ devices }: { devices: InlabBatchDeviceWithPerformance[] }) => {
  // Colors for different devices
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe", 
    "#00c49f", "#ffbb28", "#ff8042", "#a4de6c", "#d0ed57"
  ]

  // We need to group dailyData by timestamp
  // We extract all unique dates from all devices' daily array or data array
  // If we don't have daily array, we use data array to compute daily PM2.5 at least
  
  // Build a per-device daily summary map (use API-provided daily if any, else derive from raw data)
  const deviceDailyMap = new Map<string, InlabDeviceDaily[]>()
  devices.forEach(d => {
    const daily = d.daily && d.daily.length > 0 ? d.daily : deriveDailyFromData(d.data)
    deviceDailyMap.set(d.device_id, daily)
  })

  const allDates = new Set<string>()
  devices.forEach(d => {
    const daily = deviceDailyMap.get(d.device_id) || []
    daily.forEach(item => allDates.add(item.date))
    if (d.data) {
      d.data.forEach(item => {
        // extract just the date part
        const dateStr = new Date(item.datetime).toISOString().split('T')[0]
        allDates.add(dateStr)
      })
    }
  })

  const sortedDates = Array.from(allDates).sort()

  const combinedData = sortedDates.map(ts => {
    const entry: any = { timestamp: ts }
    let totalPm = 0
    let pmCount = 0

    devices.forEach(device => {
      // Find daily data for error_margin and correlation
      const deviceDaily = deviceDailyMap.get(device.device_id) || []
      const dayDaily = deviceDaily.find(d => d.date === ts)
      
      // Find data points for this day for PM2.5
      // If frequency was daily, datetime might just be the day
      const dayDataList = device.data?.filter(d => new Date(d.datetime).toISOString().split('T')[0] === ts) || []
      
      let avgPmForDevice: number | null = null
      if (dayDataList.length > 0) {
        let sum = 0
        let count = 0
        dayDataList.forEach(p => {
          const s1 = p['pm2.5 sensor1']
          const s2 = p['pm2.5 sensor2']
          if (s1 !== null && s2 !== null) {
            sum += (s1 + s2) / 2
            count++
          } else if (s1 !== null) {
            sum += s1
            count++
          } else if (s2 !== null) {
            sum += s2
            count++
          }
        })
        if (count > 0) avgPmForDevice = sum / count
      }

      if (avgPmForDevice !== null) {
        entry[`pm_${device.device_name}`] = avgPmForDevice
        totalPm += avgPmForDevice
        pmCount++
      }

      if (dayDaily) {
        entry[`err_${device.device_name}`] = dayDaily.error_margin
        entry[`corr_${device.device_name}`] = dayDaily.correlation
      }
    })

    if (pmCount > 0) {
      entry.averagePm = Math.round((totalPm / pmCount) * 10) / 10
    }
    return entry
  })

  return (
    <div className="space-y-6 mt-4">
      {/* Sensor Error Margin Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Sensor Error Margin (All Devices)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-white p-2">
            {combinedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    fontSize={12} 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis fontSize={12} />
                  <RechartsTooltip 
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  {devices.map((device, index) => (
                    <Line 
                      key={device.device_id}
                      type="monotone"
                      dataKey={`err_${device.device_name}`}
                      name={device.device_name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No historical error margin data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mean Daily PM2.5 Readings Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Mean Daily PM2.5 Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-white p-2">
            {combinedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    fontSize={12} 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis fontSize={12} unit=" µg/m³" />
                  <RechartsTooltip 
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  {devices.map((device, index) => (
                    <Line 
                      key={device.device_id}
                      type="monotone"
                      dataKey={`pm_${device.device_name}`}
                      name={device.device_name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={1.5}
                      strokeOpacity={0.6}
                      dot={false}
                    />
                  ))}
                  <Line 
                    type="monotone"
                    dataKey="averagePm"
                    name="BATCH AVERAGE"
                    stroke="#000000"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#000000" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No PM2.5 data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Correlation Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-purple-500" />
            Inter-sensor Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-white p-2">
            {combinedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    fontSize={12} 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis fontSize={12} domain={['auto', 'auto']} />
                  <RechartsTooltip 
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  {devices.map((device, index) => (
                    <Line 
                      key={device.device_id}
                      type="monotone"
                      dataKey={`corr_${device.device_name}`}
                      name={device.device_name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No correlation data available
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            This graph shows the correlation factor of PM2.5 readings across all devices in the batch.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const ReportTab = ({ data }: { data: InlabBatchWithPerformance }) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      if (!data || !data.devices || data.devices.length === 0) {
        throw new Error("No data available for PDF generation")
      }

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Add Logo or Header
      doc.setFontSize(22)
      doc.setTextColor(63, 63, 63)
      doc.text("Device Test Report", pageWidth / 2, 20, { align: "center" })

      // Add Batch Name
      doc.setFontSize(16)
      doc.text(data.name, pageWidth / 2, 30, { align: "center" })

      // Report Metadata
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40)
      doc.text(`Period: ${data.start_date ? new Date(data.start_date).toLocaleDateString() : 'N/A'} to ${data.end_date ? new Date(data.end_date).toLocaleDateString() : 'N/A'}`, 14, 45)

      // Summary Section
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text("Performance Summary", 14, 55)

      // Calculate averages
      const avgUptime = data.devices.reduce((acc, d) => acc + (d.uptime || 0), 0) / data.devices.length
      const avgError = data.devices.reduce((acc, d) => acc + (d.error_margin || 0), 0) / data.devices.length

      const summaryData = [
        ["Metric", "Value", "Status"],
        ["Average Uptime", `${avgUptime.toFixed(1)}%`, avgUptime >= 90 ? "PASSED" : "REVIEW"],
        ["Mean Error Margin", `±${avgError.toFixed(2)}`, avgError <= 10 ? "PASSED" : "FAILED"],
        ["Total Devices", data.device_count.toString(), "ACTIVE"],
      ]

      autoTable(doc, {
        startY: 60,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: "striped",
        headStyles: { fillColor: 200, textColor: 0 },
      })

      let currentY = (doc as any).lastAutoTable.finalY + 15

      // Build per-device daily summaries (fall back to derived if API didn't provide them)
      const deviceDailyMap = new Map<string, InlabDeviceDaily[]>()
      data.devices.forEach(d => {
        const daily = d.daily && d.daily.length > 0 ? d.daily : deriveDailyFromData(d.data)
        deviceDailyMap.set(d.device_id, daily)
      })

      // Extract unique dates for daily tables
      const allDates = new Set<string>()
      data.devices.forEach(d => {
        const daily = deviceDailyMap.get(d.device_id) || []
        daily.forEach(item => allDates.add(item.date))
        if (d.data) d.data.forEach(item => allDates.add(new Date(item.datetime).toISOString().split('T')[0]))
      })
      const timestamps = Array.from(allDates).sort()

      // 1. Sensor Error Margin Table
      doc.setFontSize(14)
      doc.text("Daily Sensor Error Margin", 14, currentY)
      
      const errorMarginHeaders = ["Date", ...data.devices.map(d => d.device_name)]
      const errorMarginRows = timestamps.map(ts => {
        const row = [new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })]
        data.devices.forEach(device => {
          const dayData = (deviceDailyMap.get(device.device_id) || []).find(d => d.date === ts)
          row.push(dayData ? `±${dayData.error_margin.toFixed(2)}` : "-")
        })
        return row
      })

      autoTable(doc, {
        startY: currentY + 5,
        head: [errorMarginHeaders],
        body: errorMarginRows,
        theme: "grid",
        headStyles: { fillColor: 200, textColor: 0, fontSize: 8 },
        styles: { fontSize: 7 },
      })

      currentY = (doc as any).lastAutoTable.finalY + 15

      // 2. Mean Daily PM2.5 Readings Table
      if (currentY + 40 > pageHeight - 20) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(14)
      doc.text("Mean Daily PM2.5 Readings (µg/m³)", 14, currentY)

      const pm25Headers = ["Date", ...data.devices.map(d => d.device_name), "Batch Avg"]
      const pm25Rows = timestamps.map(ts => {
        const row = [new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })]
        let totalPm = 0
        let count = 0
        data.devices.forEach(device => {
          const dayDataList = device.data?.filter(d => new Date(d.datetime).toISOString().split('T')[0] === ts) || []
          let avgPmForDevice: number | null = null
          if (dayDataList.length > 0) {
            let sum = 0
            let pcount = 0
            dayDataList.forEach(p => {
              const s1 = p['pm2.5 sensor1']
              const s2 = p['pm2.5 sensor2']
              if (s1 !== null && s2 !== null) { sum += (s1 + s2) / 2; pcount++; }
              else if (s1 !== null) { sum += s1; pcount++; }
              else if (s2 !== null) { sum += s2; pcount++; }
            })
            if (pcount > 0) avgPmForDevice = sum / pcount
          }

          if (avgPmForDevice !== null) {
            row.push(avgPmForDevice.toFixed(2))
            totalPm += avgPmForDevice
            count++
          } else {
            row.push("-")
          }
        })
        row.push(count > 0 ? (totalPm / count).toFixed(2) : "-")
        return row
      })

      autoTable(doc, {
        startY: currentY + 5,
        head: [pm25Headers],
        body: pm25Rows,
        theme: "grid",
        headStyles: { fillColor: 200, textColor: 0, fontSize: 8 },
        styles: { fontSize: 7 },
      })

      currentY = (doc as any).lastAutoTable.finalY + 15

      // 4. Device Details Section
      if (currentY + 40 > pageHeight - 20) {
        doc.addPage()
        currentY = 20
      }
      
      doc.setFontSize(14)
      doc.text("Device Details", 14, currentY)

      const deviceRows = data.devices.map(device => [
        device.device_name,
        device.category,
        device.data?.[0]?.channel_id || "N/A",
        `${device.uptime?.toFixed(1) || 0}%`,
        `±${device.error_margin?.toFixed(2) || 0}`,
        (device.error_margin || 0) < 5 ? "Excellent" : "Good"
      ])

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Device Name", "Category", "Channel ID", "Uptime", "Error Margin", "Rating"]],
        body: deviceRows,
        theme: "grid",
        headStyles: { fillColor: 100, textColor: 0 },
      })

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `AirQo Collocation - Internal Use Only - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        )
      }

      doc.save(`${data.name.replace(/\s+/g, "_")}_Report.pdf`)
      setIsGenerating(false)
    } catch (error: any) {
      console.error("Failed to generate PDF:", error)
      toast.error("Failed to generate PDF: " + error.message)
      setIsGenerating(false)
    }
  }

  // Calculate averages for summary view
  const avgUptime = data.devices.length ? data.devices.reduce((acc, d) => acc + (d.uptime || 0), 0) / data.devices.length : 0
  const avgError = data.devices.length ? data.devices.reduce((acc, d) => acc + (d.error_margin || 0), 0) / data.devices.length : 0

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Automated Batch Report
            </CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              Download a comprehensive PDF report containing all performance metrics and device data.
            </div>
          </div>
          <Button onClick={generatePDF} disabled={isGenerating} className="flex items-center gap-2">
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-full max-w-2xl bg-white shadow-md rounded-sm p-12 space-y-8 pointer-events-none select-none overflow-hidden h-[500px] relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 pointer-events-none" />
              {/* Report Preview Header */}
              <div className="text-center space-y-2 border-b pb-6">
                <div className="text-2xl font-bold text-gray-800">Device Test Report</div>
                <div className="text-lg text-gray-600 uppercase tracking-wide">{data.name}</div>
              </div>

              {/* Report Preview Summary */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Summary</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Avg Uptime:</span>
                      <span className="font-medium">{avgUptime.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Avg Error Margin:</span>
                      <span className="font-medium">±{avgError.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Devices:</span>
                      <span className="font-medium">{data.device_count}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Batch Info</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Start:</span>
                      <span className="font-medium">{data.start_date ? new Date(data.start_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">End:</span>
                      <span className="font-medium">{data.end_date ? new Date(data.end_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Preview Table */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Device Metrics</div>
                <div className="w-full border rounded-sm overflow-hidden">
                  <div className="bg-gray-50 border-b px-4 py-2 flex text-[10px] font-bold text-gray-500 uppercase">
                    <div className="w-1/3">Device</div>
                    <div className="w-1/3 text-center">Uptime</div>
                    <div className="w-1/3 text-right">Margin</div>
                  </div>
                  {data.devices.slice(0, 5).map((d, i) => (
                    <div key={i} className="px-4 py-2 flex text-[10px] border-b last:border-0">
                      <div className="w-1/3 text-gray-700">{d.device_name}</div>
                      <div className="w-1/3 text-center text-gray-600">{d.uptime?.toFixed(1)}%</div>
                      <div className="w-1/3 text-right text-gray-600">±{d.error_margin?.toFixed(2)}</div>
                    </div>
                  ))}
                  {data.devices.length > 5 && (
                    <div className="px-4 py-2 text-[10px] text-center text-gray-400 italic bg-gray-50">
                      + {data.devices.length - 5} more devices...
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6 italic">Click &quot;Download PDF&quot; to get the full multi-page report.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CollocationBatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params?.id as string

  // Fetch Batch Details (requesting daily frequency to get history data)
  const { data: responseData, loading, error, refetch } = useApiData(
    () => getBatchDetail(batchId, { frequency: 'daily' }),
    [batchId]
  )

  const data = responseData?.batch

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-md border border-red-200">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <h2 className="text-lg font-semibold">Error Loading Batch</h2>
          <p className="text-sm mt-1">{error?.message || "Batch not found or failed to load."}</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Calculate batch overall averages
  const avgUptime = data.devices.length ? data.devices.reduce((acc, d) => acc + (d.uptime || 0), 0) / data.devices.length : 0
  const avgError = data.devices.length ? data.devices.reduce((acc, d) => acc + (d.error_margin || 0), 0) / data.devices.length : 0

  // Average correlation across devices (uses precomputed if present, else computed from data)
  const correlationValues = data.devices
    .map((d) => {
      if ((d as any).correlation !== undefined && (d as any).correlation !== null) return (d as any).correlation as number
      return computeDeviceCorrelation(d.data)
    })
    .filter((v): v is number => v !== null && !isNaN(v))
  const avgCorrelation = correlationValues.length
    ? correlationValues.reduce((a, b) => a + b, 0) / correlationValues.length
    : null

  let daysRemaining = 0
  if (data.end_date) {
    daysRemaining = Math.max(0, Math.ceil((new Date(data.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {data.start_date ? new Date(data.start_date).toLocaleDateString() : 'N/A'} - {data.end_date ? new Date(data.end_date).toLocaleDateString() : 'N/A'}
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {data.device_count} Devices
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={refetch}>
            <Activity className="h-4 w-4" />
            Live Data
          </Button>
          <Button className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Complete Analysis
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{avgUptime.toFixed(1)}%</div>
            <Progress value={avgUptime} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Error Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">±{avgError.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">Target: &lt; 10%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg Correlation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {avgCorrelation !== null ? avgCorrelation.toFixed(3) : "N/A"}
            </div>
            <div className="text-xs text-gray-500 mt-1">Sensor1 vs Sensor2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.device_count}</div>
            <div className="text-xs text-gray-500 mt-1">Currently in batch</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Remaining Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {daysRemaining}
            </div>
            <div className="text-xs text-gray-500 mt-1">Until scheduled end</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="devices" className="w-full">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Device Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Channel ID</TableHead>
                      <TableHead>Network ID</TableHead>
                      <TableHead>Firmware</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Error Margin</TableHead>
                      <TableHead>Correlation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.devices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No devices found in this batch.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.devices.map((device) => {
                        const dailyData = device.daily && device.daily.length > 0
                          ? device.daily
                          : deriveDailyFromData(device.data)
                        const deviceWithDaily = { ...device, daily: dailyData }
                        return (
                        <TableRow key={device.device_id}>
                          <TableCell className="font-medium">{device.device_name}</TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{formatCategoryLabel(device.category)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{device.data?.[0]?.channel_id || "N/A"}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700">{device.network_id || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gray-100 text-gray-700">{device.firmware_version || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>
                            <UptimeMiniGraph
                              dailyData={dailyData}
                              averageUptime={device.uptime}
                            />
                          </TableCell>
                          <TableCell>
                            <ErrorMarginMiniGraph
                              dailyData={dailyData}
                              averageMargin={device.error_margin}
                            />
                          </TableCell>
                          <TableCell>
                            <CorrelationDisplay device={deviceWithDaily} />
                          </TableCell>
                        </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceAnalysis devices={data.devices} />
        </TabsContent>

        <TabsContent value="report">
          <ReportTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
