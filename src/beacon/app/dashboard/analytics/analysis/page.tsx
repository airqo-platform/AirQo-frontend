"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, Wifi, AlertTriangle, BarChart3, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { airQloudService, type AirQloudPerformanceData } from "@/services/airqloud.service"

interface DateRange {
  from: string
  to: string
}

// Device performance from AirQloud API (nested structure)
interface DevicePerformanceRaw {
  device_id: string
  device_name: string
  performance: {
    freq: number[]
    error_margin: number[]
    timestamp: string[]
  }
}

// Device performance from Device API (flat structure)
interface DevicePerformanceFlat {
  id: string
  name: string
  freq: number[]
  error_margin: (number | null)[]
  timestamp: string[]
}

interface ProcessedDeviceData {
  device_id: string
  device_name: string
  daily_uptime_percentage: number
  average_error_margin: number
  data_points: number
  uptime_history: Array<{ value: number; timestamp: string }>
  error_margin_history: Array<{ value: number; timestamp: string }>
}

interface AirQloudDetailData {
  id: string
  name: string
  device_performance: DevicePerformanceRaw[]
}

// Process device performance data from AirQloud API (nested structure)
const processDevicePerformance = (device: DevicePerformanceRaw): ProcessedDeviceData => {
  const { freq, error_margin, timestamp } = device.performance
  
  return processPerformanceData(device.device_id, device.device_name, freq, error_margin, timestamp)
}

// Process device performance data from Device API (flat structure)
const processDevicePerformanceFlat = (device: DevicePerformanceFlat): ProcessedDeviceData => {
  return processPerformanceData(device.id, device.name, device.freq, device.error_margin, device.timestamp)
}

// Common processing function for performance data
const processPerformanceData = (
  deviceId: string,
  deviceName: string,
  freq: number[],
  error_margin: (number | null)[],
  timestamp: string[]
): ProcessedDeviceData => {
  
  // Group data by date (since timestamps are hourly)
  const dailyData: { [date: string]: { hours: number; errorMargins: number[] } } = {}
  
  timestamp.forEach((ts, index) => {
    const date = new Date(ts).toDateString() // Group by date only
    
    if (!dailyData[date]) {
      dailyData[date] = { hours: 0, errorMargins: [] }
    }
    
    // Count unique hours per day (freq represents hours with data)
    if (freq[index] && freq[index] > 0) {
      dailyData[date].hours += 1
    }
    
    // Collect error margins for this day
    if (error_margin[index] !== undefined && error_margin[index] !== null) {
      dailyData[date].errorMargins.push(error_margin[index])
    }
  })
  
  // Convert to arrays for history graphs
  const dates = Object.keys(dailyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).slice(-14) // Sort chronologically and take last 14 days
  
  const uptimeHistory = dates.map(date => ({
    value: (dailyData[date].hours / 24) * 100, // Percentage of 24 hours
    timestamp: date
  }))
  
  const errorMarginHistory = dates.map(date => ({
    value: dailyData[date].errorMargins.length > 0 
      ? dailyData[date].errorMargins.reduce((sum, em) => sum + em, 0) / dailyData[date].errorMargins.length 
      : 0,
    timestamp: date
  }))
  
  // Calculate overall averages
  const totalUniqueHours = Object.values(dailyData).reduce((sum, day) => sum + day.hours, 0)
  const totalDays = Object.keys(dailyData).length
  const dailyUptimePercentage = totalDays > 0 ? (totalUniqueHours / (totalDays * 24)) * 100 : 0
  
  const allErrorMargins = Object.values(dailyData).flatMap(day => day.errorMargins)
  const avgErrorMargin = allErrorMargins.length > 0
    ? allErrorMargins.reduce((sum, em) => sum + em, 0) / allErrorMargins.length
    : 0
  
  return {
    device_id: deviceId,
    device_name: deviceName,
    daily_uptime_percentage: Math.min(dailyUptimePercentage, 100), // Cap at 100%
    average_error_margin: avgErrorMargin,
    data_points: timestamp.length, // Total hourly data points
    uptime_history: uptimeHistory,
    error_margin_history: errorMarginHistory
  }
}

// Mini bar graph component for uptime visualization
const UptimeMiniGraph = ({
  data,
}: {
  data: { value: number; timestamp: string }[]
}) => {
  const maxHeight = 24
  const barWidth = 6

  return (
    <TooltipProvider>
      <div
        className="flex items-end gap-[2px]"
        style={{ height: maxHeight + 4 }}
      >
        {data.map((day, index) => {
          const height = Math.max(2, (day.value / 100) * maxHeight)
          const color =
            day.value >= 75
              ? "bg-green-500"
              : day.value >= 50
                ? "bg-yellow-500"
                : "bg-red-500"

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={`${color} rounded-sm cursor-pointer hover:opacity-80 transition-opacity`}
                  style={{
                    width: barWidth,
                    height: height,
                    minHeight: 2,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {new Date(day.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  : {day.value.toFixed(1)}%
                </p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

// Mini bar graph component for error margin visualization
const ErrorMarginMiniGraph = ({
  data,
}: {
  data: { value: number; timestamp: string }[]
}) => {
  const maxHeight = 24
  const barWidth = 6
  const maxMargin = Math.max(...data.map((d) => d.value), 10)

  return (
    <TooltipProvider>
      <div
        className="flex items-end gap-[2px]"
        style={{ height: maxHeight + 4 }}
      >
        {data.map((day, index) => {
          const height = Math.max(2, (day.value / maxMargin) * maxHeight)
          const color =
            day.value <= 5
              ? "bg-green-500"
              : day.value <= 10
                ? "bg-yellow-500"
                : "bg-red-500"

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={`${color} rounded-sm cursor-pointer hover:opacity-80 transition-opacity`}
                  style={{
                    width: barWidth,
                    height: height,
                    minHeight: 2,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {new Date(day.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  : ±{day.value.toFixed(2)}
                </p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

// Calculate summary stats for an AirQloud
const calculateStats = (airqloud: AirQloudPerformanceData) => {
  const avgUptime = airqloud.freq.length > 0
    ? (airqloud.freq.reduce((sum, f) => sum + f, 0) / (airqloud.freq.length * 24)) * 100
    : 0
  
  const avgErrorMargin = airqloud.error_margin.length > 0
    ? airqloud.error_margin.reduce((sum, em) => sum + em, 0) / airqloud.error_margin.length
    : 0
  
  return {
    avgUptime: Math.min(avgUptime, 100),
    avgErrorMargin,
    daysOfData: airqloud.freq.length,
  }
}

// Get status badge based on uptime
const getStatusBadge = (uptime: number) => {
  if (uptime >= 75) {
    return <Badge variant="default" className="bg-green-500">Good</Badge>
  } else if (uptime >= 50) {
    return <Badge variant="secondary" className="bg-yellow-500 text-black">Fair</Badge>
  } else {
    return <Badge variant="destructive">Poor</Badge>
  }
}

// Get status badge for device status string
const getDeviceStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "good":
    case "online":
      return <Badge variant="default" className="bg-green-500">Good</Badge>
    case "fair":
    case "warning":
      return <Badge variant="secondary" className="bg-yellow-500 text-black">Fair</Badge>
    case "poor":
    case "offline":
      return <Badge variant="destructive">Poor</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function AnalysisResultsPage() {
  const [data, setData] = useState<AirQloudPerformanceData[] | null>(null)
  const [deviceData, setDeviceData] = useState<DevicePerformanceFlat[] | null>(null)
  const [analysisType, setAnalysisType] = useState<"airqlouds" | "devices">("airqlouds")
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<string>("")
  
  // State for device performance data per AirQloud
  const [deviceDataCache, setDeviceDataCache] = useState<Record<string, AirQloudDetailData | null>>({})
  const [loadingDeviceData, setLoadingDeviceData] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Load data from sessionStorage
    const storedData = sessionStorage.getItem('analysisData')
    const storedDateRange = sessionStorage.getItem('analysisDateRange')
    const storedAnalysisType = sessionStorage.getItem('analysisType') as "airqlouds" | "devices" | null
    
    if (storedData && storedDateRange) {
      try {
        const parsedDateRange = JSON.parse(storedDateRange) as DateRange
        setDateRange(parsedDateRange)
        setAnalysisType(storedAnalysisType || "airqlouds")
        
        if (storedAnalysisType === "devices") {
          // Device analysis - data is array of device performance (flat structure)
          const parsedData = JSON.parse(storedData) as DevicePerformanceFlat[]
          setDeviceData(parsedData)
        } else {
          // AirQloud analysis
          const parsedData = JSON.parse(storedData) as AirQloudPerformanceData[]
          setData(parsedData)
          
          // Set the first tab as selected
          if (parsedData.length > 0) {
            setSelectedTab(parsedData[0].id)
          }
        }
      } catch (error) {
        console.error('Error parsing stored data:', error)
      }
    }
    
    setIsLoading(false)
  }, [])

  // Fetch device performance data when tab changes
  useEffect(() => {
    if (!selectedTab || deviceDataCache[selectedTab] !== undefined) {
      return
    }

    const fetchDeviceData = async () => {
      setLoadingDeviceData(prev => ({ ...prev, [selectedTab]: true }))
      
      try {
        const response = await airQloudService.getAirQloudById(selectedTab, 14)
        // Cast the response to match our expected interface
        const deviceData: AirQloudDetailData = {
          id: response.id,
          name: response.name,
          device_performance: (response.device_performance || []) as DevicePerformanceRaw[]
        }
        setDeviceDataCache(prev => ({ ...prev, [selectedTab]: deviceData }))
      } catch (error) {
        console.error('Error fetching device data:', error)
        setDeviceDataCache(prev => ({ ...prev, [selectedTab]: null }))
      } finally {
        setLoadingDeviceData(prev => ({ ...prev, [selectedTab]: false }))
      }
    }

    fetchDeviceData()
  }, [selectedTab, deviceDataCache])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if we have no data for either type
  const hasNoData = analysisType === "devices" 
    ? (!deviceData || deviceData.length === 0)
    : (!data || data.length === 0)

  if (hasNoData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/analytics">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No analysis data found. Please go back and run an analysis.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Device Analysis View
  if (analysisType === "devices" && deviceData) {
    const processedDevices = deviceData.map(device => processDevicePerformanceFlat(device))
    
    // Calculate overall stats for devices
    const overallAvgUptime = processedDevices.length > 0
      ? processedDevices.reduce((sum, d) => sum + d.daily_uptime_percentage, 0) / processedDevices.length
      : 0
    
    const overallAvgErrorMargin = processedDevices.length > 0
      ? processedDevices.reduce((sum, d) => sum + d.average_error_margin, 0) / processedDevices.length
      : 0

    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/analytics">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analytics
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Device Analysis Results</h1>
              {dateRange && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {deviceData.length} Device{deviceData.length !== 1 ? 's' : ''} analysed
          </Badge>
        </div>

        {/* Overall Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deviceData.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAvgUptime.toFixed(1)}%</div>
              <Progress value={overallAvgUptime} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Error Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">±{overallAvgErrorMargin.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Analysis Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedDevices[0]?.uptime_history.length || 0} days
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Performance Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Device Performance Summary
            </CardTitle>
            <CardDescription>
              Individual device performance over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Daily Uptime
                        <span className="text-xs text-muted-foreground ml-1">
                          (last 14 days)
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Error Margin
                        <span className="text-xs text-muted-foreground ml-1">
                          (last 14 days)
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>Data Points</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedDevices.map((device) => {
                    const status = device.daily_uptime_percentage >= 75 
                      ? "Good" 
                      : device.daily_uptime_percentage >= 50 
                        ? "Fair" 
                        : "Poor"
                    
                    return (
                      <TableRow key={device.device_id}>
                        <TableCell className="font-medium">
                          {device.device_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UptimeMiniGraph data={device.uptime_history} />
                            <span className="text-sm text-muted-foreground">
                              {device.daily_uptime_percentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ErrorMarginMiniGraph data={device.error_margin_history} />
                            <span className="text-sm text-muted-foreground">
                              ±{device.average_error_margin.toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{device.data_points.toLocaleString()}</TableCell>
                        <TableCell>
                          {getDeviceStatusBadge(status)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // AirQloud Analysis View (existing code)
  if (!data) return null

  // Calculate overall summary stats
  const summaryStats = data.map(aq => ({
    ...aq,
    stats: calculateStats(aq),
  }))

  const overallAvgUptime = summaryStats.length > 0
    ? summaryStats.reduce((sum, aq) => sum + aq.stats.avgUptime, 0) / summaryStats.length
    : 0

  const overallAvgErrorMargin = summaryStats.length > 0
    ? summaryStats.reduce((sum, aq) => sum + aq.stats.avgErrorMargin, 0) / summaryStats.length
    : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/analytics">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analysis Results</h1>
            {dateRange && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
              </div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {data.length} AirQloud{data.length !== 1 ? 's' : ''} (Cohort{data.length !== 1 ? 's' : ''}) analysed
        </Badge>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total AirQlouds (Cohorts)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAvgUptime.toFixed(1)}%</div>
            <Progress value={overallAvgUptime} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Error Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">±{overallAvgErrorMargin.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Analysis Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats[0]?.stats.daysOfData || 0} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AirQloud (Cohort) Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AirQloud (Cohort) Name</TableHead>
                  <TableHead>Average Uptime</TableHead>
                  <TableHead>Error Margin</TableHead>
                  <TableHead>Days of Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryStats.map((aq) => (
                  <TableRow key={aq.id}>
                    <TableCell className="font-medium">{aq.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={aq.stats.avgUptime} className="w-20" />
                        <span>{aq.stats.avgUptime.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>±{aq.stats.avgErrorMargin.toFixed(2)}</TableCell>
                    <TableCell>{aq.stats.daysOfData}</TableCell>
                    <TableCell>{getStatusBadge(aq.stats.avgUptime)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Individual AirQloud Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Individual AirQloud (Cohort) Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="flex flex-wrap h-auto gap-1">
              {data.map((aq) => (
                <TabsTrigger 
                  key={aq.id} 
                  value={aq.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {aq.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {data.map((aq) => {
              const stats = calculateStats(aq)
              const deviceData = deviceDataCache[aq.id]
              const isLoadingDevices = loadingDeviceData[aq.id]
              const processedDevices: ProcessedDeviceData[] = deviceData?.device_performance 
                ? deviceData.device_performance.map(device => processDevicePerformance(device))
                : []

              return (
                <TabsContent key={aq.id} value={aq.id} className="mt-6">
                  <div className="space-y-6">
                    {/* AirQloud Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{aq.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {aq.id}</p>
                      </div>
                      {getStatusBadge(stats.avgUptime)}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wifi className="h-4 w-4" />
                            Average Uptime
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.avgUptime.toFixed(1)}%</div>
                          <Progress value={stats.avgUptime} className="mt-2" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Error Margin
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">±{stats.avgErrorMargin.toFixed(2)}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Data Points
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.daysOfData}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Device Performance Summary Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Device Performance Summary</CardTitle>
                        <CardDescription>
                          Individual device performance over the last 14 days
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingDevices ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Loading device data...</span>
                          </div>
                        ) : processedDevices.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Device Name</TableHead>
                                  <TableHead>
                                    <div className="flex items-center gap-1">
                                      Daily Uptime
                                      <span className="text-xs text-muted-foreground ml-1">
                                        (last 14 days)
                                      </span>
                                    </div>
                                  </TableHead>
                                  <TableHead>
                                    <div className="flex items-center gap-1">
                                      Error Margin
                                      <span className="text-xs text-muted-foreground ml-1">
                                        (last 14 days)
                                      </span>
                                    </div>
                                  </TableHead>
                                  <TableHead>Data Points</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {processedDevices.map((device) => {
                                  // Determine status based on uptime
                                  const status = device.daily_uptime_percentage >= 75 
                                    ? "Good" 
                                    : device.daily_uptime_percentage >= 50 
                                      ? "Fair" 
                                      : "Poor"
                                  
                                  return (
                                    <TableRow key={device.device_id}>
                                      <TableCell className="font-medium">
                                        {device.device_name}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <UptimeMiniGraph data={device.uptime_history} />
                                          <span className="text-sm text-muted-foreground">
                                            {device.daily_uptime_percentage.toFixed(1)}%
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <ErrorMarginMiniGraph data={device.error_margin_history} />
                                          <span className="text-sm text-muted-foreground">
                                            ±{device.average_error_margin.toFixed(2)}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>{device.data_points.toLocaleString()}</TableCell>
                                      <TableCell>
                                        {getDeviceStatusBadge(status)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-8 text-muted-foreground">
                            No device performance data available for this AirQloud.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
