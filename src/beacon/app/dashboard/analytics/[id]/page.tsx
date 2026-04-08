"use client"

import React, { useState, useEffect, memo } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Wifi, AlertTriangle } from "lucide-react"
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
import { airQloudService } from "@/services/airqloud.service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import AirQloudPerformanceTab from "./airqloud-performance-tab"

interface AirQloudDetailData {
  id: string
  name: string
  country: string
  visibility: boolean | null
  is_active: boolean
  createdAt: string
  device_count: number
  uptime?: number | null
  data_completeness?: number | null
  sensor_error_margin?: number | null
  data?: any[]
  devices: Array<{
    _id?: string
    name: string
    long_name: string
    uptime?: number | null
    data_completeness?: number | null
    sensor_error_margin?: number | null
    lastActive?: string
    lastRawData?: string
    data?: any[]
  }>
}

interface ProcessedDeviceData {
  device_id: string
  device_name: string
  daily_uptime_percentage: number
  average_error_margin: number
  data_points: number
  last_active: string | null
  uptime_history: Array<{ value: number; timestamp: string }>
  error_margin_history: Array<{ value: number; timestamp: string }>
}

const processDevicePerformance = (device: AirQloudDetailData['devices'][0]): ProcessedDeviceData => {
  // Group data by date
  const dailyData: { [date: string]: { hoursSet: Set<number>; errorMargins: number[] } } = {}

  const deviceData = device.data || []

  deviceData.forEach((d: any) => {
    const dt = new Date(d.datetime)
    const date = dt.toDateString() // Group by date only

    if (!dailyData[date]) {
      dailyData[date] = { hoursSet: new Set(), errorMargins: [] }
    }

    // Track distinct hours per day
    dailyData[date].hoursSet.add(dt.getHours())

    // Collect error margins for this day
    if (d.s1_pm2_5 != null && d.s2_pm2_5 != null) {
      dailyData[date].errorMargins.push(Math.abs(d.s1_pm2_5 - d.s2_pm2_5))
    }
  })

  // Convert to arrays for history graphs
  const dates = Object.keys(dailyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).slice(-14) // Sort chronologically and take last 14 days

  const uptimeHistory = dates.map(date => ({
    value: Math.min(100, (Math.min(24, dailyData[date].hoursSet.size) / 24) * 100), // Percentage of 24 hours
    timestamp: date
  }))

  const errorMarginHistory = dates.map(date => ({
    value: dailyData[date].errorMargins.length > 0
      ? dailyData[date].errorMargins.reduce((sum, em) => sum + em, 0) / dailyData[date].errorMargins.length
      : 0,
    timestamp: date
  }))

  return {
    device_id: device._id || device.name,
    device_name: device.long_name || device.name,
    daily_uptime_percentage: (device.uptime || 0) * 100,
    average_error_margin: device.sensor_error_margin || 0,
    data_points: deviceData.length,
    last_active: device.lastRawData || device.lastRawData || null,
    uptime_history: uptimeHistory,
    error_margin_history: errorMarginHistory
  }
}

// Props interfaces for mini graph components
interface UptimeMiniGraphProps {
  uptimeHistory: Array<{ value: number; timestamp: string }>
  averageUptime: number
}

interface ErrorMarginMiniGraphProps {
  errorMarginHistory: Array<{ value: number; timestamp: string }>
  averageErrorMargin: number
}

// Helper functions for bar colors
const getUptimeBarColor = (value: number) => {
  if (value >= 75) return "bg-green-500 hover:bg-green-600"
  if (value >= 50) return "bg-orange-500 hover:bg-orange-600"
  return "bg-red-500 hover:bg-red-600"
}

const getUptimeTooltipBgColor = (value: number) => {
  if (value >= 75) return "bg-green-600 border-green-700"
  if (value >= 50) return "bg-orange-600 border-orange-700"
  return "bg-red-600 border-red-700"
}

const getErrorMarginBarColor = (value: number) => {
  if (value <= 6) return "bg-green-500 hover:bg-green-600"
  if (value <= 12) return "bg-orange-500 hover:bg-orange-600"
  return "bg-red-500 hover:bg-red-600"
}

const getErrorMarginTooltipBgColor = (value: number) => {
  if (value <= 6) return "bg-green-600 border-green-700"
  if (value <= 12) return "bg-orange-600 border-orange-700"
  return "bg-red-600 border-red-700"
}

const formatDateForTooltip = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Mini bar graph component for uptime history - moved outside render scope
const UptimeMiniGraph = memo(function UptimeMiniGraph({ uptimeHistory, averageUptime }: UptimeMiniGraphProps) {
  if (uptimeHistory.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }

  const values = uptimeHistory.slice(-14) // Earliest to latest

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="font-medium min-w-[50px]">{averageUptime.toFixed(1)}%</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getUptimeBarColor(item.value)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.value / 100) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getUptimeTooltipBgColor(item.value)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{formatDateForTooltip(item.timestamp)}</div>
                  <div>Uptime: {item.value.toFixed(1)}%</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
})

// Mini bar graph component for error margin history - moved outside render scope
const ErrorMarginMiniGraph = memo(function ErrorMarginMiniGraph({ errorMarginHistory, averageErrorMargin }: ErrorMarginMiniGraphProps) {
  if (errorMarginHistory.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }

  const values = errorMarginHistory.slice(-14) // Earliest to latest
  const maxValue = Math.max(...values.map(v => v.value), 1)

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="font-medium min-w-[50px]">±{averageErrorMargin.toFixed(1)}</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getErrorMarginBarColor(item.value)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.value / maxValue) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getErrorMarginTooltipBgColor(item.value)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{formatDateForTooltip(item.timestamp)}</div>
                  <div>Error Margin: ±{item.value.toFixed(2)}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
})

export default function AirQloudDetailPage() {
  const params = useParams()
  const airqloudId = params?.id as string

  const [data, setData] = useState<AirQloudDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAirQloudDetail = async () => {
      if (!airqloudId) {
        setError('Cohort ID is required')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const endDate = new Date()
        endDate.setDate(endDate.getDate() - 1)
        endDate.setHours(23, 59, 59, 999)

        const startDate = new Date(endDate)
        startDate.setDate(endDate.getDate() - 13) // 14 days total including yesterday
        startDate.setHours(0, 0, 0, 0)

        const response = await airQloudService.getAirQloudById(
          airqloudId,
          startDate.toISOString(),
          endDate.toISOString()
        )
        setData(response as unknown as AirQloudDetailData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Cohort details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAirQloudDetail()
  }, [airqloudId])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/analytics">
              <ArrowLeft className="h-4 w-4" />
              Back to Analytics
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return null
  }

  // Calculate summary statistics
  const averageUptime = (data.uptime || 0) * 100

  const averageErrorMargin = data.sensor_error_margin || 0

  const processedDevices = data.devices ? data.devices.map(processDevicePerformance) : []

  const chartData = []

  if (data) {
    const dailyCohort: { [date: string]: { deviceCount: number, totalUptime: number, totalError: number, errorCount: number } } = {}

    processedDevices.forEach(device => {
      device.uptime_history.forEach(u => {
        if (!dailyCohort[u.timestamp]) dailyCohort[u.timestamp] = { deviceCount: 0, totalUptime: 0, totalError: 0, errorCount: 0 }
        dailyCohort[u.timestamp].deviceCount += 1
        dailyCohort[u.timestamp].totalUptime += u.value
      })
      device.error_margin_history.forEach(e => {
        if (e.value > 0) {
          dailyCohort[e.timestamp].totalError += e.value
          dailyCohort[e.timestamp].errorCount += 1
        }
      })
    })

    const chartArr = Object.keys(dailyCohort)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-14)
      .map(date => {
        const day = dailyCohort[date]
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          uptime: day.deviceCount > 0 ? day.totalUptime / day.deviceCount : 0,
          errorMargin: day.errorCount > 0 ? day.totalError / day.errorCount : 0,
          timestamp: date
        }
      })

    chartData.push(...chartArr)
  }

  const chartConfig = {
    uptime: {
      label: "Uptime %",
      color: "#10b981",
    },
    errorMargin: {
      label: "Error Margin",
      color: "#ef4444",
    },
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/analytics">
            <ArrowLeft className="h-4 w-4" />
            Back to Analytics
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {data.country}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {new Date(data.createdAt || new Date()).toLocaleDateString()}
            </div>
            <Badge variant={data.is_active ? "default" : "secondary"}>
              {data.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.device_count}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageUptime.toFixed(1)}%</div>
                <Progress value={averageUptime} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Error Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageErrorMargin.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">± margin</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Days of Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chartData.length}</div>
                <div className="text-sm text-muted-foreground">Days captured</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Daily Uptime Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: any) => [typeof value === 'number' ? `${value.toFixed(1)}%` : '0%', 'Uptime']}
                      />
                      <Line
                        type="monotone"
                        dataKey="uptime"
                        stroke="var(--color-uptime)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Margin Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : '0', 'Error Margin']}
                      />
                      <Bar
                        dataKey="errorMargin"
                        fill="var(--color-errorMargin)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Device Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Device Performance Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Individual device performance over the last 14 days
              </p>
            </CardHeader>
            <CardContent>
              {processedDevices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No device performance data available
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device Name</TableHead>
                        <TableHead>Daily Uptime</TableHead>
                        <TableHead>Error Margin</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Data Points</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedDevices.map((device) => (
                        <TableRow key={device.device_id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{device.device_name}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {device.device_id.length > 20
                                  ? `${device.device_id.slice(0, 10)}...${device.device_id.slice(-10)}`
                                  : device.device_id
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <UptimeMiniGraph
                              uptimeHistory={device.uptime_history}
                              averageUptime={device.daily_uptime_percentage}
                            />
                          </TableCell>
                          <TableCell>
                            <ErrorMarginMiniGraph
                              errorMarginHistory={device.error_margin_history}
                              averageErrorMargin={device.average_error_margin}
                            />
                          </TableCell>
                          <TableCell>
                            {device.last_active ? (() => {
                              const lastActiveDate = new Date(device.last_active)
                              const now = new Date()
                              const hoursAgo = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60))
                              const daysAgo = Math.floor(hoursAgo / 24)
                              const colorClass = hoursAgo < 24 ? 'text-green-600' : daysAgo < 3 ? 'text-yellow-600' : 'text-red-600'
                              const timeAgo = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${daysAgo}d ago`
                              return (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span className={`text-sm font-medium ${colorClass}`}>{timeAgo}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">{lastActiveDate.toLocaleString()}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )
                            })() : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{device.data_points}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                device.daily_uptime_percentage > 80
                                  ? "default"
                                  : device.daily_uptime_percentage > 50
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {device.daily_uptime_percentage > 80
                                ? "Good"
                                : device.daily_uptime_percentage > 50
                                  ? "Fair"
                                  : "Poor"
                              }
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <AirQloudPerformanceTab
            airqloudId={airqloudId}
            airqloudName={data.name}
            initialData={data}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}