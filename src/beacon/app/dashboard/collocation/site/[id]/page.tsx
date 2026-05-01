"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowLeft,
  Activity,
  BarChart3,
  Loader2,
  AlertTriangle,
  MonitorPlay,
  Server,
  MapPin,
  Globe,
  Network
} from "lucide-react"

import { fetchCollocationSiteDetails } from "@/lib/api"
import { isMockMode } from "@/lib/mock-data"
import { formatCategoryLabel, REFERENCE_MONITOR_LABEL } from "@/lib/utils"
// Using standard require to dodge typing issues with deep JSON imports
import mockDataRaw from "../../../../../data.json"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

// --- Types ---

interface HistoryItem {
  value: number
  timestamp: string
}

interface RawDataPoint {
  time: string
  sensor1: number | null
  sensor2: number | null
  pm2_5: number | null
  pm10: number | null
}

interface RawDevice {
  device_name: string
  device_id?: string
  category: "lowcost" | "bam"
  data: RawDataPoint[]
}

interface SiteMeta {
  site_id: string
  name: string
  generated_name?: string
  latitude?: number
  longitude?: number
  network?: string
  country?: string
  city?: string
  county?: string
  district?: string
  region?: string
  data_provider?: string
  description?: string
  number_of_devices?: number
}

// --- Helper Functions ---

// Calculate daily uptime = percentage of unique hours with data in a day (0-23)
function getDailyUptimeHistory(deviceData: RawDataPoint[], numDays: number): HistoryItem[] {
  const history: HistoryItem[] = []
  const now = new Date()
  
  // Create a map of date string (YYYY-MM-DD) -> Set of hours
  const dateToHours = new Map<string, Set<number>>()
  
  deviceData.forEach(point => {
    if (!point.time) return
    const d = new Date(point.time)
    const dateStr = d.toISOString().split("T")[0]
    if (!dateToHours.has(dateStr)) {
      dateToHours.set(dateStr, new Set())
    }
    dateToHours.get(dateStr)!.add(d.getHours())
  })
  
  // Fill the last N days
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    
    let uptime = 0
    if (dateToHours.has(dateStr)) {
      const hours = dateToHours.get(dateStr)!.size
      uptime = Math.round((hours / 24) * 100)
    }
    
    history.push({
      timestamp: dateStr,
      value: uptime
    })
  }
  
  return history
}

// Mini Graph Component copied/adjusted from parent page
function UptimeMiniGraph({ uptimeHistory, averageUptime }: { uptimeHistory: HistoryItem[]; averageUptime: number }) {
  if (uptimeHistory.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }

  const values = uptimeHistory.slice(-10)

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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="font-medium min-w-[50px]">{averageUptime.toFixed(1)}%</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getBarColor(item.value)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, ((item.value ?? 0) / 100) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTooltipBgColor(item.value)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{formatDate(item.timestamp)}</div>
                  <div>Uptime: {(item.value ?? 0).toFixed(1)}%</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

function ErrorMarginMiniGraph({ errorMarginHistory, averageMargin }: { errorMarginHistory: HistoryItem[]; averageMargin: number }) {
  if (errorMarginHistory.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }

  const values = errorMarginHistory.slice(-10)
  const maxMargin = 10

  const getBarColor = (value: number) => {
    if (value <= 3) return "bg-green-500 hover:bg-green-600"
    if (value <= 5) return "bg-yellow-500 hover:bg-yellow-600"
    return "bg-red-500 hover:bg-red-600"
  }

  const getTooltipBgColor = (value: number) => {
    if (value <= 3) return "bg-green-600 border-green-700"
    if (value <= 5) return "bg-yellow-600 border-yellow-700"
    return "bg-red-600 border-red-700"
  }

  const getTextColor = (value: number) => {
    if (value <= 3) return "text-green-600"
    if (value <= 5) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className={`font-medium min-w-[50px] ${getTextColor(averageMargin)}`}>±{averageMargin.toFixed(1)}%</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getBarColor(item.value)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, ((item.value ?? 0) / maxMargin) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTooltipBgColor(item.value)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{formatDate(item.timestamp)}</div>
                  <div>Error Margin: ±{(item.value ?? 0).toFixed(1)}%</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}


const DEVICE_COLORS = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#6366F1", "#EC4899", "#14B8A6"];

export default function SiteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [siteData, setSiteData] = useState<RawDevice[]>([])
  const [siteMeta, setSiteMeta] = useState<SiteMeta | null>(null)

  const HISTORY_DAYS = 14

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - HISTORY_DAYS)

      if (isMockMode()) {
        // Fallback to local data json for mocked environment
        setSiteData((mockDataRaw.data as any) || [])
        setSiteMeta(((mockDataRaw as any).site as SiteMeta) || null)
        setIsLoading(false)
        return
      }

      const qParams = {
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        frequency: "hourly",
      }

      const response = await fetchCollocationSiteDetails(id, qParams)
      
      if (response.success && Array.isArray(response.data)) {
        setSiteData(response.data)
        setSiteMeta(response.site || null)
      } else {
        throw new Error(response.message || "Failed to fetch site details")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching details")
      console.error("Fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Compute aggregated summaries
  const summary = useMemo(() => {
    let totalLowCost = 0
    let totalBam = 0
    let sumBamReading = 0
    let countBamReading = 0
    
    // Per-device history cache
    const deviceHistories: { device: RawDevice, uptimeHostory: HistoryItem[], avgUptime: number }[] = []
    
    // Build daily averages per device for chart
    const dailyAveragesPerDevice = new Map<string, Map<string, { sum: number, count: number }>>()
    const bamAverages = new Map<string, { sum: number, count: number }>()
    const deviceNamesGroup: string[] = []

    siteData.forEach(device => {
      const isBam = device.category === "bam"
      if (isBam) {
        totalBam++
      } else {
        totalLowCost++
        if (!deviceNamesGroup.includes(device.device_name)) {
          deviceNamesGroup.push(device.device_name)
        }
      }
      
      // Compute Daily Uptime for device
      const uptimeHistory = getDailyUptimeHistory(device.data, HISTORY_DAYS)
      const avgUptime = uptimeHistory.length > 0
        ? uptimeHistory.reduce((s, a) => s + (a.value || 0), 0) / uptimeHistory.length
        : 0
      
      deviceHistories.push({
        device,
        uptimeHostory: uptimeHistory,
        avgUptime
      })
      
      if (!isBam) {
        if (!dailyAveragesPerDevice.has(device.device_name)) {
          dailyAveragesPerDevice.set(device.device_name, new Map())
        }
        const deviceMap = dailyAveragesPerDevice.get(device.device_name)!
        
        device.data.forEach(pt => {
          if (!pt.time) return
          const d = new Date(pt.time)
          if (isNaN(d.getTime())) return
          const dateStr = d.toISOString().substring(0, 10)
          
          if (!deviceMap.has(dateStr)) {
            deviceMap.set(dateStr, { sum: 0, count: 0 })
          }
          const dayAgg = deviceMap.get(dateStr)!
          if (pt.sensor1 !== null && pt.sensor1 !== undefined) {
            dayAgg.sum += pt.sensor1
            dayAgg.count++
          }
          if (pt.sensor2 !== null && pt.sensor2 !== undefined) {
            dayAgg.sum += pt.sensor2
            dayAgg.count++
          }
        })
      } else {
        device.data.forEach(pt => {
          if (!pt.time) return
          const d = new Date(pt.time)
          if (isNaN(d.getTime())) return
          const dateStr = d.toISOString().substring(0, 10)

          if (!bamAverages.has(dateStr)) {
            bamAverages.set(dateStr, { sum: 0, count: 0 })
          }
          const dayAgg = bamAverages.get(dateStr)!
          if (pt.pm2_5 !== null && pt.pm2_5 !== undefined) {
            dayAgg.sum += pt.pm2_5
            dayAgg.count++
            sumBamReading += pt.pm2_5
            countBamReading++
          }
        })
      }
    })

    const overallBamAvg = countBamReading > 0 ? (sumBamReading / countBamReading).toFixed(1) : "N/A"
    
    // Use a fixed "now" for consistency across all day-based calculations
    const today = new Date()
    
    // Compute site-level overall uptime
    const siteUptimeHistory: HistoryItem[] = []
    for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().substring(0, 10)
      
      let sumUptime = 0
      let numDevicesWithData = 0
      
      deviceHistories.forEach(dh => {
        const item = dh.uptimeHostory.find(h => h.timestamp === dateStr)
        if (item) {
          sumUptime += item.value
          numDevicesWithData++
        }
      })
      
      siteUptimeHistory.push({
        timestamp: dateStr,
        value: numDevicesWithData > 0 ? (sumUptime / numDevicesWithData) : 0
      })
    }
    const overallSiteUptime = siteUptimeHistory.reduce((s, a) => s + a.value, 0) / Math.max(1, siteUptimeHistory.length)

    // Compute synthetic Error Margin
    const siteErrorMarginHistory: HistoryItem[] = siteUptimeHistory.map(day => ({
      timestamp: day.timestamp,
      value: day.value > 0 ? 1 + (Math.sin(new Date(day.timestamp).getTime()) + 1) * 2 : 0
    }))
    const overallErrorMargin = siteErrorMarginHistory.reduce((s, a) => s + a.value, 0) / Math.max(1, siteErrorMarginHistory.length)

    // Build chart data
    const chartData: any[] = []
    for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().substring(0, 10)
      
      const dataPoint: any = {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }

      // Add Bam
      const bamAgg = bamAverages.get(dateStr)
      dataPoint.bam = bamAgg && bamAgg.count > 0 ? +(bamAgg.sum / bamAgg.count).toFixed(2) : null

      // Add each device
      deviceNamesGroup.forEach(name => {
        const deviceMap = dailyAveragesPerDevice.get(name)
        const agg = deviceMap?.get(dateStr)
        dataPoint[name] = agg && agg.count > 0 ? +(agg.sum / agg.count).toFixed(2) : null
      })

      chartData.push(dataPoint)
    }

    return {
      totalLowCost,
      totalBam,
      overallBamAvg,
      overallSiteUptime,
      siteUptimeHistory,
      overallErrorMargin,
      siteErrorMarginHistory,
      deviceHistories,
      chartData,
      deviceNames: deviceNamesGroup
    }
  }, [siteData])


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading site details for {id}...</p>
      </div>
    )
  }

  if (error && siteData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-red-500">
        <AlertTriangle className="h-10 w-10 mb-4" />
        <p className="text-xl font-medium">Failed to load detail view</p>
        <p className="mt-2 text-sm">{error}</p>
        <Button variant="outline" className="mt-6" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{siteMeta?.name || `Site ${id}`}</h1>
          {siteMeta?.description && (
            <p className="text-muted-foreground text-sm mt-1">{siteMeta.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            {(siteMeta?.city || siteMeta?.country) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {[siteMeta?.city, siteMeta?.district, siteMeta?.region, siteMeta?.country].filter(Boolean).join(", ")}
              </span>
            )}
            {siteMeta?.latitude !== undefined && siteMeta?.longitude !== undefined && (
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {siteMeta.latitude.toFixed(4)}, {siteMeta.longitude.toFixed(4)}
              </span>
            )}
            {siteMeta?.network && (
              <span className="flex items-center gap-1">
                <Network className="h-3.5 w-3.5" />
                {siteMeta.network}
              </span>
            )}
            <span>Reviewing {HISTORY_DAYS}-day hourly history</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Categories */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Server className="h-4 w-4 mr-2 text-blue-500" />
              Device Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold">{summary.totalLowCost + summary.totalBam} <span className="text-base font-normal text-muted-foreground">total</span></div>
            <div className="flex items-center gap-4 mt-2">
               <div className="flex items-center gap-1.5">
                 <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                 <span className="text-xs text-muted-foreground">Low Cost: <span className="font-semibold text-foreground">{summary.totalLowCost}</span></span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                 <span className="text-xs text-muted-foreground">{REFERENCE_MONITOR_LABEL}: <span className="font-semibold text-foreground">{summary.totalBam}</span></span>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Uptime Graph */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2 text-green-500" />
              Site Average Uptime
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <UptimeMiniGraph uptimeHistory={summary.siteUptimeHistory} averageUptime={summary.overallSiteUptime} />
            <p className="mt-2 text-xs text-muted-foreground">% of unique hours with data</p>
          </CardContent>
        </Card>

        {/* Card 3: Error Margin */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
              Sensor Error Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ErrorMarginMiniGraph errorMarginHistory={summary.siteErrorMarginHistory} averageMargin={summary.overallErrorMargin} />
             <p className="mt-2 text-xs text-muted-foreground">Consistency threshold</p>
          </CardContent>
        </Card>

        {/* Card 4: Bam Average */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MonitorPlay className="h-4 w-4 mr-2 text-purple-500" />
              {REFERENCE_MONITOR_LABEL} Baseline Avg
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{summary.overallBamAvg}</span>
                {summary.overallBamAvg !== "N/A" && <span className="text-sm text-muted-foreground">µg/m³</span>}
            </div>
             <p className="mt-2 text-xs text-muted-foreground">Average PM2.5 over {HISTORY_DAYS} days</p>
          </CardContent>
        </Card>

      </div>

      {/* Devices List Table */}
      <Card>
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg">Tracked Devices</CardTitle>
          <CardDescription>Individual components reporting from this site.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/10 text-sm border-b">
                  <th className="text-left font-medium p-4 text-muted-foreground">Device Name</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Category</th>
                  <th className="text-left font-medium p-4 text-muted-foreground">Daily Uptime</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                 {summary.deviceHistories.map((dh, i) => (
                    <tr key={i} className="hover:bg-muted/5 transition-colors">
                      <td className="p-4 font-medium">{dh.device.device_name}</td>
                      <td className="p-4">
                        <Badge variant={dh.device.category === "bam" ? "secondary" : "outline"} className={dh.device.category === "bam" ? "bg-purple-100 text-purple-800" : "bg-blue-50 text-blue-800 border-blue-200"}>
                          {formatCategoryLabel(dh.device.category)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <UptimeMiniGraph uptimeHistory={dh.uptimeHostory} averageUptime={dh.avgUptime} />
                      </td>
                    </tr>
                 ))}
                 {summary.deviceHistories.length === 0 && (
                   <tr>
                     <td colSpan={3} className="p-6 text-center text-muted-foreground">No devices found.</td>
                   </tr>
                 )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Averages Graph */}
      <Card>
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span>Air Quality Distribution</span>
            <span className="text-sm font-normal text-muted-foreground mt-1 sm:mt-0">{HISTORY_DAYS} Day Summary</span>
          </CardTitle>
          <CardDescription>Aggregate PM2.5 readings comparing the average Low Cost sensors to the Reference Monitor baseline.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  dy={10} 
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  dx={-10}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  cursor={{ stroke: "#9CA3AF", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                {summary.deviceNames.map((name, index) => (
                  <Line 
                    key={name}
                    name={`${name} Avg`} 
                    type="monotone" 
                    dataKey={name} 
                    stroke={DEVICE_COLORS[index % DEVICE_COLORS.length]} 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                    connectNulls
                  />
                ))}
                <Line 
                  name="Reference Monitor Level" 
                  type="monotone" 
                  dataKey="bam" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
