"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, RefreshCw, CalendarIcon, AlertCircle, TrendingUp, BarChart3, Clock, ChevronDown, ChevronUp, Battery } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format, subDays } from "date-fns"
import { getDevicePerformanceData } from "@/services/device-api.service"
import { isMockMode } from "@/lib/mock-data"
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

interface RawDataPoint {
  site_name?: string
  humidity: number | null
  pm10: number | null
  s2_pm2_5: number | null
  s1_pm2_5: number | null
  s1_pm10: number | null
  s2_pm10: number | null
  longitude?: number
  latitude?: number
  pm2_5: number | null
  temperature: number | null
  datetime: string
  network?: string
  device_name?: string
  frequency?: string
  battery_voltage?: number | null
}

interface PerformanceData {
  device_name: string
  uptime: number
  data_completeness: number
  sensor_error_margin: number
  raw_data: RawDataPoint[]
}

interface DeviceSummary {
  deviceId: string
  deviceName: string
  avgFrequency: number
  avgErrorMargin: number
  avgUptime: number
  avgBatteryVoltage: number
}

export default function PerformanceTab({ deviceId, deviceName }: Readonly<PerformanceTabProps>) {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const isMock = searchParams.get('mock') === 'true'
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

      if (isMock || isMockMode()) {
        // Provide dummy performance data
        const mockRawData: RawDataPoint[] = []
        const start = dateRange.from || fourteenDaysAgo
        const end = dateRange.to || yesterday
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
        
        for (let i = 0; i < days; i++) {
          const date = new Date(start)
          date.setDate(date.getDate() + i)
          mockRawData.push({
            datetime: date.toISOString(),
            pm2_5: 10 + Math.random() * 20,
            pm10: 15 + Math.random() * 25,
            s1_pm2_5: 11 + Math.random() * 19,
            s2_pm2_5: 9 + Math.random() * 21,
            s1_pm10: 16 + Math.random() * 24,
            s2_pm10: 14 + Math.random() * 26,
            temperature: 22 + Math.random() * 8,
            humidity: 50 + Math.random() * 30,
            battery_voltage: 3.8 + Math.random() * 0.4,
            device_name: deviceName,
          })
        }

        const mockPerformance: PerformanceData = {
          device_name: deviceName,
          uptime: 95.5,
          data_completeness: 98.2,
          sensor_error_margin: 2.4,
          raw_data: mockRawData,
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setPerformanceData([mockPerformance])
        setLoading(false)
        return
      }

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
        deviceNames: [deviceId],
      })

      // response is already unwrapped to the data array by the service
      const data = Array.isArray(response) ? response : []
      if (data.length > 0) {
        setPerformanceData(data)
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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleApplyFilter = () => {
    setIsCalendarOpen(false)
    fetchPerformanceData()
  }

  const handleClearFilters = () => {
    setDateRange({ from: fourteenDaysAgo, to: yesterday })
    setTimeRange({ from: "00:00", to: "23:59" })
    setIncludeTime(false)
    setTimeout(() => fetchPerformanceData(), 100)
    setIsCalendarOpen(false)
  }

  // Aggregate raw data into hourly buckets for each device
  const devicesChartData = useMemo(() => {
    return performanceData.map((device) => {
      // Group raw_data by hour bucket
      const hourlyBuckets: Record<string, {
        timestamp: string
        errorMargins: number[]
        batteryVoltages: number[]
        count: number
      }> = {}

      for (const point of device.raw_data) {
        const dt = new Date(point.datetime)
        // Create an hour-level key like "2026-01-26T08:00:00.000Z"
        const hourDate = new Date(dt)
        hourDate.setMinutes(0, 0, 0)
        const hourKey = hourDate.toISOString()

        if (!hourlyBuckets[hourKey]) {
          hourlyBuckets[hourKey] = {
            timestamp: hourKey,
            errorMargins: [],
            batteryVoltages: [],
            count: 0,
          }
        }

        hourlyBuckets[hourKey].count++

        // Compute inter-sensor error margin
        if (point.s1_pm2_5 != null && point.s2_pm2_5 != null) {
          hourlyBuckets[hourKey].errorMargins.push(Math.abs(point.s1_pm2_5 - point.s2_pm2_5))
        }

        if (point.battery_voltage != null) {
          hourlyBuckets[hourKey].batteryVoltages.push(point.battery_voltage)
        }
      }

      // Convert buckets to sorted chart data
      const chartData = Object.values(hourlyBuckets)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((bucket) => ({
          timestamp: bucket.timestamp,
          formattedTime: format(new Date(bucket.timestamp), "MMM dd HH:mm"),
          freq: bucket.count, // number of entries in this hour
          error_margin: bucket.errorMargins.length > 0
            ? bucket.errorMargins.reduce((a, b) => a + b, 0) / bucket.errorMargins.length
            : null,
          battery_voltage: bucket.batteryVoltages.length > 0
            ? bucket.batteryVoltages.reduce((a, b) => a + b, 0) / bucket.batteryVoltages.length
            : null,
        }))

      return {
        deviceId: device.device_name,
        deviceName: device.device_name,
        chartData,
      }
    })
  }, [performanceData])

  // Calculate daily uptime for each device
  const devicesUptimeData = useMemo(() => {
    return performanceData.map((device) => {
      const dailyData: Record<string, { date: string; hoursWithData: Set<number>; totalHours: number }> = {}

      for (const point of device.raw_data) {
        const dt = new Date(point.datetime)
        const dateKey = format(dt, "yyyy-MM-dd")

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            date: format(dt, "MMM dd, yyyy"),
            hoursWithData: new Set<number>(),
            totalHours: 24,
          }
        }

        // Track unique hours that have data
        dailyData[dateKey].hoursWithData.add(dt.getHours())
      }

      return {
        deviceId: device.device_name,
        deviceName: device.device_name,
        dailyUptimeData: Object.values(dailyData).map(day => ({
          date: day.date,
          uptimePercentage: ((day.hoursWithData.size / day.totalHours) * 100).toFixed(1),
        })),
      }
    })
  }, [performanceData])

  // Calculate summary statistics for each device
  const devicesSummary = useMemo((): DeviceSummary[] => {
    return performanceData.map((device) => {
      // Average of the daily uptime percentages
      const uptimeData = devicesUptimeData.find(d => d.deviceId === device.device_name)?.dailyUptimeData || []
      const avgUptime = uptimeData.length > 0
        ? uptimeData.reduce((sum, d) => sum + Number.parseFloat(d.uptimePercentage), 0) / uptimeData.length
        : 0
      const avgErrorMargin = device.sensor_error_margin

      // Compute avg frequency: average entries per hour (from hourly buckets)
      const chartData = devicesChartData.find(d => d.deviceId === device.device_name)?.chartData || []
      const avgFrequency = chartData.length > 0
        ? chartData.reduce((sum, h) => sum + h.freq, 0) / chartData.length
        : 0

      // Compute avg battery voltage from raw_data if available
      const validBatteryVoltage = device.raw_data
        .map(p => p.battery_voltage)
        .filter((v): v is number => v != null)

      return {
        deviceId: device.device_name,
        deviceName: device.device_name,
        avgFrequency,
        avgErrorMargin,
        avgUptime,
        avgBatteryVoltage: validBatteryVoltage.length > 0 ? validBatteryVoltage.reduce((a, b) => a + b, 0) / validBatteryVoltage.length : 0,
      }
    })
  }, [performanceData, devicesChartData, devicesUptimeData])

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
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                      disabled={(date) => date >= new Date(new Date().setHours(0, 0, 0, 0))}
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
              {/* Summary Stats - Single Filled Line */}
              {devicesSummary.map((summary) => (
                <div key={`summary-${summary.deviceId}`} className="bg-slate-50 border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Device</p>
                      <p className="text-sm font-semibold text-gray-900">{summary.deviceName}</p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg Frequency</p>
                      <p className="text-lg font-bold text-blue-600">{summary.avgFrequency.toFixed(1)}</p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg Error Margin</p>
                      <p className="text-lg font-bold text-orange-600">{summary.avgErrorMargin.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg Uptime</p>
                      <p className="text-lg font-bold text-green-600">{summary.avgUptime.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                      <Battery className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg Battery</p>
                      <p className="text-lg font-bold text-teal-600">{summary.avgBatteryVoltage.toFixed(2)}V</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Charts Grid - 2x2 */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Daily Uptime Chart */}
                {devicesUptimeData.map((deviceUptime) => (
                  <Card key={`uptime-${deviceUptime.deviceId}`} className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b bg-gray-50/50 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <CardTitle className="text-sm font-medium text-gray-700">Daily Uptime</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={deviceUptime.dailyUptimeData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(new Date(value), "MMM dd")}
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f3f4f6' }}
                            formatter={(value: any) => [`${value}%`, 'Uptime']}
                          />
                          <Bar
                            dataKey="uptimePercentage"
                            fill="#22c55e"
                            name="Uptime %"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}

                {/* 2. Data Frequency Chart */}
                {devicesChartData.map((deviceData) => (
                  <Card key={`freq-${deviceData.deviceId}`} className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b bg-gray-50/50 py-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <CardTitle className="text-sm font-medium text-gray-700">Data Frequency</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={deviceData.chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis
                            dataKey="formattedTime"
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                            interval="preserveStartEnd"
                            minTickGap={30}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="freq"
                            stroke="#3b82f6"
                            name="Frequency"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}

                {/* 3. Error Margin Chart */}
                {devicesChartData.map((deviceData) => (
                  <Card key={`error-${deviceData.deviceId}`} className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b bg-gray-50/50 py-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <CardTitle className="text-sm font-medium text-gray-700">Error Margin</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={deviceData.chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis
                            dataKey="formattedTime"
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                            interval="preserveStartEnd"
                            minTickGap={30}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="error_margin"
                            stroke="#ea580c"
                            name="Error Margin"
                            strokeWidth={2}
                            connectNulls
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}

                {/* 4. Battery Voltage Chart (New) */}
                {devicesChartData.map((deviceData) => (
                  <Card key={`battery-${deviceData.deviceId}`} className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b bg-gray-50/50 py-3">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-teal-600" />
                        <CardTitle className="text-sm font-medium text-gray-700">Battery Voltage</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={deviceData.chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis
                            dataKey="formattedTime"
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                            interval="preserveStartEnd"
                            minTickGap={30}
                          />
                          <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}V`}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [`${value}V`, 'Voltage']}
                          />
                          <Line
                            type="monotone"
                            dataKey="battery_voltage"
                            stroke="#0d9488"
                            name="Voltage"
                            strokeWidth={2}
                            connectNulls
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
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
