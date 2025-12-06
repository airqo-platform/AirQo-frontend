"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, RefreshCw, CalendarIcon, AlertCircle, TrendingUp, BarChart3, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format, subDays } from "date-fns"
import { getDevicePerformanceData } from "@/services/device-api.service"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface PerformanceTabProps {
  deviceId: string
  deviceName: string
}

interface PerformanceData {
  id: string
  name: string
  freq: number[]
  error_margin: (number | null)[]
  timestamp: string[]
}

interface DeviceSummary {
  deviceId: string
  deviceName: string
  avgFrequency: number
  avgErrorMargin: number
  avgUptime: number
}

export default function PerformanceTab({ deviceId, deviceName }: Readonly<PerformanceTabProps>) {
  const { toast } = useToast()
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Default date range: last 14 days ending yesterday
  const yesterday = subDays(new Date(), 1)
  const fourteenDaysAgo = subDays(yesterday, 13)
  
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: fourteenDaysAgo,
    to: yesterday,
  })
  const [timeRange, setTimeRange] = useState<{
    from: string
    to: string
  }>({
    from: "00:00",
    to: "23:59",
  })
  const [includeTime, setIncludeTime] = useState(false)

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!dateRange.from || !dateRange.to) {
        toast({
          title: "Date range required",
          description: "Please select a date range to view performance data",
          variant: "destructive",
        })
        return
      }

      const startDate = new Date(dateRange.from)
      const endDate = new Date(dateRange.to)
      
      if (includeTime) {
        const [startHours, startMinutes] = timeRange.from.split(':')
        startDate.setHours(Number.parseInt(startHours), Number.parseInt(startMinutes), 0, 0)
        
        const [endHours, endMinutes] = timeRange.to.split(':')
        endDate.setHours(Number.parseInt(endHours), Number.parseInt(endMinutes), 59, 999)
      } else {
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
      }

      const response = await getDevicePerformanceData({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        ids: [deviceId],
      })
      
      if (response && response.length > 0) {
        setPerformanceData(response)
      } else {
        setPerformanceData([])
        toast({
          title: "No data",
          description: "No performance data available for the selected period",
        })
      }
    } catch (err: any) {
      console.error("Error fetching performance data:", err)
      setError(err.message || "Failed to load performance data")
      toast({
        title: "Error",
        description: "Failed to load device performance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformanceData()
  }, [deviceId])

  const handleDateRangeChange = (newDateRange: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(newDateRange)
  }

  const handleTimeRangeChange = (type: "from" | "to", value: string) => {
    setTimeRange(prev => ({ ...prev, [type]: value }))
  }

  const handleIncludeTimeChange = (checked: boolean) => {
    setIncludeTime(checked)
  }

  const handleApplyFilter = () => {
    fetchPerformanceData()
  }

  const handleClearFilters = () => {
    setDateRange({ from: fourteenDaysAgo, to: yesterday })
    setTimeRange({ from: "00:00", to: "23:59" })
    setIncludeTime(false)
    setTimeout(() => fetchPerformanceData(), 100)
  }

  // Process data for each device
  const devicesChartData = useMemo(() => {
    return performanceData.map((device) => ({
      deviceId: device.id,
      deviceName: device.name,
      chartData: device.timestamp.map((time, index) => ({
        timestamp: time,
        formattedTime: format(new Date(time), "MMM dd HH:mm"),
        freq: device.freq[index] || 0,
        error_margin: device.error_margin[index],
      })),
    }))
  }, [performanceData])

  // Calculate daily uptime for each device
  const devicesUptimeData = useMemo(() => {
    return performanceData.map((device) => {
      const dailyData: Record<string, { date: string; hoursWithData: number; totalHours: number }> = {}

      for (let index = 0; index < device.timestamp.length; index++) {
        const time = device.timestamp[index]
        const date = format(new Date(time), "yyyy-MM-dd")
        
        if (!dailyData[date]) {
          dailyData[date] = {
            date: format(new Date(time), "MMM dd, yyyy"),
            hoursWithData: 0,
            totalHours: 24,
          }
        }

        // Count hour if freq is not 0 or error_margin is not null
        if (device.freq[index] > 0 || device.error_margin[index] !== null) {
          dailyData[date].hoursWithData++
        }
      }

      return {
        deviceId: device.id,
        deviceName: device.name,
        dailyUptimeData: Object.values(dailyData).map(day => ({
          date: day.date,
          uptimePercentage: ((day.hoursWithData / day.totalHours) * 100).toFixed(1),
        })),
      }
    })
  }, [performanceData])

  // Calculate summary statistics for each device
  const devicesSummary = useMemo((): DeviceSummary[] => {
    return performanceData.map((device) => {
      const validFreq = device.freq.filter(f => f > 0)
      const validErrorMargin = device.error_margin.filter((e): e is number => e !== null)

      const uptimeData = devicesUptimeData.find(d => d.deviceId === device.id)?.dailyUptimeData || []
      const avgUptime = uptimeData.length > 0
        ? uptimeData.reduce((sum, d) => sum + Number.parseFloat(d.uptimePercentage), 0) / uptimeData.length
        : 0

      return {
        deviceId: device.id,
        deviceName: device.name,
        avgFrequency: validFreq.length > 0 ? validFreq.reduce((a, b) => a + b, 0) / validFreq.length : 0,
        avgErrorMargin: validErrorMargin.length > 0 ? validErrorMargin.reduce((a, b) => a + b, 0) / validErrorMargin.length : 0,
        avgUptime,
      }
    })
  }, [performanceData, devicesUptimeData])

  const isSingleDevice = performanceData.length === 1

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Device Performance</CardTitle>
              <CardDescription>
                View performance metrics for {deviceName}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPerformanceData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Date Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {!dateRange.from && <span>Pick a date range</span>}
                    {dateRange.from && !dateRange.to && format(dateRange.from, "MMM dd, yyyy")}
                    {dateRange.from && dateRange.to && (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to,
                      }}
                      onSelect={(range) => {
                        handleDateRangeChange({
                          from: range?.from,
                          to: range?.to,
                        })
                      }}
                      numberOfMonths={2}
                    />
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          value={dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : ""}
                          readOnly
                          placeholder="Start date"
                        />
                        <Input
                          type="text"
                          value={dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : ""}
                          readOnly
                          placeholder="End date"
                        />
                      </div>
                      
                      {includeTime && (
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="time"
                            value={timeRange.from}
                            onChange={(e) => handleTimeRangeChange("from", e.target.value)}
                          />
                          <Input
                            type="time"
                            value={timeRange.to}
                            onChange={(e) => handleTimeRangeChange("to", e.target.value)}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeTimePerformance"
                          checked={includeTime}
                          onCheckedChange={(checked) => handleIncludeTimeChange(checked as boolean)}
                        />
                        <Label htmlFor="includeTimePerformance" className="text-sm cursor-pointer">
                          Include Time
                        </Label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Quick Select</Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="grid gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date()
                        handleDateRangeChange({ from: today, to: today })
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const yday = subDays(new Date(), 1)
                        handleDateRangeChange({ from: yday, to: yday })
                      }}
                    >
                      Yesterday
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date()
                        const lastWeek = subDays(today, 7)
                        handleDateRangeChange({ from: lastWeek, to: today })
                      }}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const yday = subDays(new Date(), 1)
                        const fourteenDays = subDays(yday, 13)
                        handleDateRangeChange({ from: fourteenDays, to: yday })
                      }}
                    >
                      Last 14 days (default)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date()
                        const lastMonth = subDays(today, 30)
                        handleDateRangeChange({ from: lastMonth, to: today })
                      }}
                    >
                      Last 30 days
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button onClick={handleApplyFilter}>Apply Filter</Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error loading performance data</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-10">
              <RefreshCw className="h-10 w-10 mx-auto mb-2 text-gray-400 animate-spin" />
              <p className="text-gray-500">Loading performance data...</p>
            </div>
          )}
          
          {!loading && performanceData.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <Activity className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>No performance data available for this device.</p>
              <p className="text-sm mt-2">Try selecting a different date range.</p>
            </div>
          )}

          {!loading && performanceData.length > 0 && (
            <div className="space-y-6">
              {/* Top Row: Summary Stats Card and Uptime Chart */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Summary Stats Card */}
                <Card className="bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-base">Summary Statistics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {devicesSummary.map((summary) => (
                      <div key={summary.deviceId} className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Device Name</p>
                          <p className="font-semibold text-lg">{summary.deviceName}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Avg Frequency</p>
                            <p className="text-2xl font-bold text-blue-600">{summary.avgFrequency.toFixed(1)}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Avg Error Margin</p>
                            <p className="text-2xl font-bold text-orange-600">{summary.avgErrorMargin.toFixed(2)}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Avg Daily Uptime</p>
                            <p className="text-2xl font-bold text-green-600">{summary.avgUptime.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Daily Uptime Chart */}
                {devicesUptimeData.map((deviceUptime) => (
                  <Card key={`uptime-${deviceUptime.deviceId}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-base">Daily Uptime Percentage</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={deviceUptime.dailyUptimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 9 }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            tick={{ fontSize: 10 }}
                            label={{ value: 'Uptime %', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${value}%`, 'Uptime']}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar 
                            dataKey="uptimePercentage" 
                            fill="#22c55e" 
                            name="Uptime %"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Bottom Row: Data Frequency and Error Margin */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Data Frequency Chart */}
                {devicesChartData.map((deviceData) => (
                  <Card key={`freq-${deviceData.deviceId}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">Data Frequency</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={deviceData.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="formattedTime" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 9 }}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Line 
                            type="monotone" 
                            dataKey="freq" 
                            stroke="#3b82f6" 
                            name="Frequency"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}

                {/* Error Margin Chart */}
                {devicesChartData.map((deviceData) => (
                  <Card key={`error-${deviceData.deviceId}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                        <CardTitle className="text-base">Error Margin</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={deviceData.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="formattedTime" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 9 }}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Line 
                            type="monotone" 
                            dataKey="error_margin" 
                            stroke="#ea580c" 
                            name="Error Margin"
                            strokeWidth={2}
                            connectNulls
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
