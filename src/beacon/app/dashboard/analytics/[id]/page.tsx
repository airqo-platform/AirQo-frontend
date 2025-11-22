"use client"

import { useState, useEffect } from "react"
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
import AirQloudPerformanceTab from "./AirQloudPerformanceTab"

interface AirQloudDetailData {
  id: string
  name: string
  country: string
  visibility: boolean | null
  is_active: boolean
  created_at: string
  device_count: number
  freq: number[]
  error_margin: number[]
  timestamp: string[]
  device_performance: Array<{
    device_id: string
    device_name: string
    performance: {
      freq: number[]
      error_margin: number[]
      timestamp: string[]
    }
  }>
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

const processDevicePerformance = (device: AirQloudDetailData['device_performance'][0]): ProcessedDeviceData => {
  const { freq, error_margin, timestamp } = device.performance
  
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
  const dates = Object.keys(dailyData).sort().slice(-14) // Last 14 days
  
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
    device_id: device.device_id,
    device_name: device.device_name,
    daily_uptime_percentage: Math.min(dailyUptimePercentage, 100), // Cap at 100%
    average_error_margin: avgErrorMargin,
    data_points: timestamp.length, // Total hourly data points
    uptime_history: uptimeHistory,
    error_margin_history: errorMarginHistory
  }
}

const formatChartData = (freq: number[], errorMargin: number[], timestamps: string[]) => {
  return timestamps.map((timestamp, index) => ({
    date: new Date(timestamp).toLocaleDateString(),
    uptime: ((freq[index] || 0) / 24) * 100,
    errorMargin: errorMargin[index] || 0,
    timestamp
  })).slice(-14) // Last 14 days
}

export default function AirQloudDetailPage() {
  const params = useParams()
  const airqloudId = params?.id as string
  
  const [data, setData] = useState<AirQloudDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAirQloudDetail = async () => {
      if (!airqloudId) {
        setError('AirQloud ID is required')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await airQloudService.getAirQloudById(airqloudId, 14)
        setData(response as AirQloudDetailData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch AirQloud details')
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
  const averageUptime = data.freq.length > 0 
    ? (data.freq.reduce((sum, f) => sum + f, 0) / (data.freq.length * 24)) * 100
    : 0

  const averageErrorMargin = data.error_margin.length > 0
    ? data.error_margin.reduce((sum, em) => sum + em, 0) / data.error_margin.length
    : 0

  const chartData = formatChartData(data.freq, data.error_margin, data.timestamp)
  const processedDevices = data.device_performance ? data.device_performance.map(processDevicePerformance) : []

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

  // Mini bar graph component for uptime history
  const UptimeMiniGraph = ({ uptimeHistory, averageUptime }: { 
    uptimeHistory: Array<{ value: number; timestamp: string }>, 
    averageUptime: number 
  }) => {
    if (uptimeHistory.length === 0) {
      return <span className="text-muted-foreground">N/A</span>
    }

    const values = uptimeHistory.slice(-14)
    
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
                    style={{ height: `${Math.max(4, (item.value / 100) * 32)}px` }}
                  />
                </TooltipTrigger>
                <TooltipContent className={`${getTooltipBgColor(item.value)} text-white border`}>
                  <div className="text-xs font-medium">
                    <div>{formatDate(item.timestamp)}</div>
                    <div>Uptime: {item.value.toFixed(1)}%</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Mini bar graph component for error margin history
  const ErrorMarginMiniGraph = ({ errorMarginHistory, averageErrorMargin }: { 
    errorMarginHistory: Array<{ value: number; timestamp: string }>, 
    averageErrorMargin: number 
  }) => {
    if (errorMarginHistory.length === 0) {
      return <span className="text-muted-foreground">N/A</span>
    }

    const values = errorMarginHistory.slice(-14)
    const maxValue = Math.max(...values.map(v => v.value), 1)
    
    const getBarColor = (value: number) => {
      if (value <= 6) return "bg-green-500 hover:bg-green-600"
      if (value <= 12) return "bg-orange-500 hover:bg-orange-600"
      return "bg-red-500 hover:bg-red-600"
    }

    const getTooltipBgColor = (value: number) => {
      if (value <= 6) return "bg-green-600 border-green-700"
      if (value <= 12) return "bg-orange-600 border-orange-700"
      return "bg-red-600 border-red-700"
    }

    const formatDate = (timestamp: string) => {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <span className="font-medium min-w-[50px]">±{averageErrorMargin.toFixed(1)}</span>
          <div className="flex items-end gap-[2px] h-8">
            {values.map((item, index) => (
              <Tooltip key={index} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className={`w-1.5 rounded-t-full ${getBarColor(item.value)} transition-all cursor-pointer`}
                    style={{ height: `${Math.max(4, (item.value / maxValue) * 32)}px` }}
                  />
                </TooltipTrigger>
                <TooltipContent className={`${getTooltipBgColor(item.value)} text-white border`}>
                  <div className="text-xs font-medium">
                    <div>{formatDate(item.timestamp)}</div>
                    <div>Error Margin: ±{item.value.toFixed(2)}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </TooltipProvider>
    )
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
              Created {new Date(data.created_at).toLocaleDateString()}
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
            <div className="text-2xl font-bold">{data.freq.length}</div>
            {/* <div className="text-sm text-muted-foreground">Last 14 days</div> */}
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
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Uptime']}
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
                    formatter={(value: number) => [value.toFixed(2), 'Error Margin']}
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
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}