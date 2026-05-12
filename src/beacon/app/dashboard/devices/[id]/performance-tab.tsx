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
import { DeviceHourHeatmaps, type HeatmapDevice } from "@/components/analytics/device-heatmap"
import { useGroup } from "@/lib/group-context"
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
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
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
  sensor_error_margin: number | null
  raw_data: RawDataPoint[]
}

interface DeviceSummary {
  deviceId: string
  deviceName: string
  avgFrequency: number
  avgErrorMargin: number | null
  avgUptime: number
  avgBatteryVoltage: number
}

export default function PerformanceTab({ deviceId, deviceName }: Readonly<PerformanceTabProps>) {
  const { toast } = useToast()
  const { activeGroup, loading: groupLoading } = useGroup()
  const searchParams = useSearchParams()
  const isMock = searchParams?.get('mock') === 'true'
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
    if (!isMock && !isMockMode() && (groupLoading || !activeGroup)) {
      return
    }

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
        group: activeGroup ?? undefined,
      })

      // response is already unwrapped to the data array by the service
      const data = Array.isArray(response) ? response : []
      // Normalize: API returns data points under `data` with keys like
      // "pm2.5 sensor1" / "pm2.5 sensor2" / "battery". Map them to the shape
      // the component already consumes via `raw_data`.
      const toNum = (v: any): number | null => {
        if (v == null) return null
        const n = typeof v === "number" ? v : Number(v)
        return Number.isFinite(n) ? n : null
      }
      const normalized: PerformanceData[] = data.map((device: any) => {
        const sourcePoints: any[] = Array.isArray(device.raw_data) && device.raw_data.length > 0
          ? device.raw_data
          : Array.isArray(device.data) ? device.data : []

        const raw_data: RawDataPoint[] = sourcePoints.map((p: any) => ({
          datetime: p.datetime,
          device_name: p.device_name ?? device.device_name,
          frequency: p.frequency,
          humidity: toNum(p.humidity),
          temperature: toNum(p.temperature),
          pm2_5: toNum(p.pm2_5 ?? p["pm2.5"]),
          pm10: toNum(p.pm10),
          s1_pm2_5: toNum(p.s1_pm2_5 ?? p["pm2.5 sensor1"]),
          s2_pm2_5: toNum(p.s2_pm2_5 ?? p["pm2.5 sensor2"]),
          s1_pm10: toNum(p.s1_pm10 ?? p["pm10 sensor1"]),
          s2_pm10: toNum(p.s2_pm10 ?? p["pm10 sensor2"]),
          battery_voltage: toNum(p.battery_voltage ?? p.battery),
          longitude: p.longitude,
          latitude: p.latitude,
          network: p.network,
          site_name: p.site_name,
        }))

        return {
          device_name: device.device_name,
          uptime: device.uptime ?? 0,
          data_completeness: device.data_completeness ?? 0,
          sensor_error_margin: device.sensor_error_margin ?? null,
          raw_data,
        } as PerformanceData
      })

      if (normalized.length > 0 && normalized.some(d => d.raw_data.length > 0)) {
        setPerformanceData(normalized)
      } else {
        setPerformanceData(normalized)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, activeGroup, groupLoading])

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
  const [sensorHealthMode, setSensorHealthMode] = useState<"error" | "sensors" | "correlation">("correlation")

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
        s1Pm25: number[]
        s2Pm25: number[]
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
            s1Pm25: [],
            s2Pm25: [],
            count: 0,
          }
        }

        hourlyBuckets[hourKey].count++

        // Compute inter-sensor error margin
        if (point.s1_pm2_5 != null && point.s2_pm2_5 != null) {
          hourlyBuckets[hourKey].errorMargins.push(Math.abs(point.s1_pm2_5 - point.s2_pm2_5))
        }

        if (point.s1_pm2_5 != null) {
          hourlyBuckets[hourKey].s1Pm25.push(point.s1_pm2_5)
        }
        if (point.s2_pm2_5 != null) {
          hourlyBuckets[hourKey].s2Pm25.push(point.s2_pm2_5)
        }

        if (point.battery_voltage != null) {
          hourlyBuckets[hourKey].batteryVoltages.push(point.battery_voltage)
        }
      }

      const avg = (arr: number[]) =>
        arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null

      // Convert buckets to sorted chart data
      const chartData = Object.values(hourlyBuckets)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((bucket) => ({
          timestamp: bucket.timestamp,
          formattedTime: format(new Date(bucket.timestamp), "MMM dd HH:mm"),
          freq: bucket.count, // number of entries in this hour
          error_margin: avg(bucket.errorMargins),
          s1_pm2_5: avg(bucket.s1Pm25),
          s2_pm2_5: avg(bucket.s2Pm25),
          battery_voltage: avg(bucket.batteryVoltages),
        }))

      // Per-point pairs for sensor-correlation scatter (s1 vs s2)
      const correlationData = device.raw_data
        .filter((p) => p.s1_pm2_5 != null && p.s2_pm2_5 != null)
        .map((p) => ({ s1: p.s1_pm2_5 as number, s2: p.s2_pm2_5 as number }))

      return {
        deviceId: device.device_name,
        deviceName: device.device_name,
        chartData,
        correlationData,
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

      // Build the full list of expected days for the selected window so that
      // days where the device produced no records contribute 0% uptime to
      // the average instead of being silently dropped from the denominator.
      const expectedKeys: string[] = []
      const fromDate = dateRange.from
      const toDate = dateRange.to
      if (fromDate && toDate) {
        const start = new Date(fromDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(toDate)
        end.setHours(0, 0, 0, 0)
        for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
          expectedKeys.push(format(d, "yyyy-MM-dd"))
        }
      } else {
        // Fallback: just use whatever we observed.
        expectedKeys.push(...Object.keys(dailyData).sort((a, b) => a.localeCompare(b)))
      }

      const dailyUptimeData = expectedKeys.map((key) => {
        const entry = dailyData[key]
        const hours = entry ? entry.hoursWithData.size : 0
        const date = entry ? entry.date : format(new Date(`${key}T00:00:00`), "MMM dd, yyyy")
        return {
          date,
          uptimePercentage: ((hours / 24) * 100).toFixed(1),
        }
      })

      return {
        deviceId: device.device_name,
        deviceName: device.device_name,
        dailyUptimeData,
      }
    })
  }, [performanceData, dateRange])

  // Build per-device hourly heatmap data (date+hour buckets)
  const heatmapDevices = useMemo<HeatmapDevice[]>(() => {
    return performanceData.map((device) => {
      const buckets: Record<string, { date: string; hour: number; count: number; errorMargins: number[] }> = {}

      for (const point of device.raw_data) {
        const dt = new Date(point.datetime)
        const dateKey = format(dt, "yyyy-MM-dd")
        const hour = dt.getHours()
        const key = `${dateKey}|${hour}`
        if (!buckets[key]) {
          buckets[key] = { date: dateKey, hour, count: 0, errorMargins: [] }
        }
        // Honor API-provided `record_count` (already-aggregated hourly bucket);
        // otherwise fall back to counting raw entries.
        const rc = (point as any).record_count
        buckets[key].count += typeof rc === "number" ? rc : 1
        if (point.s1_pm2_5 != null && point.s2_pm2_5 != null) {
          buckets[key].errorMargins.push(Math.abs(point.s1_pm2_5 - point.s2_pm2_5))
        }
      }

      const hourly_data = Object.values(buckets).map((b) => ({
        date: b.date,
        hour: b.hour,
        count: b.count,
        errorMargin: b.errorMargins.length > 0
          ? b.errorMargins.reduce((a, b2) => a + b2, 0) / b.errorMargins.length
          : null,
      }))

      return {
        device_id: device.device_name,
        device_name: device.device_name,
        daily_uptime_percentage: device.uptime,
        average_error_margin: device.sensor_error_margin ?? 0,
        uptime_history: [],
        error_margin_history: [],
        hourly_data,
      } satisfies HeatmapDevice
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

      // Prefer API-provided sensor_error_margin; otherwise compute the
      // canonical |mean(s1_pm2_5) - mean(s2_pm2_5)| across raw data points
      // (skipping nulls independently for each sensor).
      let avgErrorMargin: number | null = device.sensor_error_margin ?? null
      if (avgErrorMargin == null) {
        const s1Vals = device.raw_data
          .map(p => p.s1_pm2_5)
          .filter((v): v is number => v != null)
        const s2Vals = device.raw_data
          .map(p => p.s2_pm2_5)
          .filter((v): v is number => v != null)
        const meanS1 = s1Vals.length > 0
          ? s1Vals.reduce((a, b) => a + b, 0) / s1Vals.length
          : undefined
        const meanS2 = s2Vals.length > 0
          ? s2Vals.reduce((a, b) => a + b, 0) / s2Vals.length
          : undefined
        avgErrorMargin = meanS1 != null && meanS2 != null
          ? Math.abs(meanS1 - meanS2)
          : null
      }

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
                      <p className="text-lg font-bold text-orange-600">{summary.avgErrorMargin != null ? summary.avgErrorMargin.toFixed(2) : "N/A"}</p>
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
                            name="Uptime %"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          >
                            {deviceUptime.dailyUptimeData.map((entry, index) => {
                              const v = Number.parseFloat(entry.uptimePercentage)
                              const fill = v >= 75 ? "#22c55e" : v >= 50 ? "#f97316" : "#ef4444"
                              return <Cell key={`uptime-cell-${index}`} fill={fill} />
                            })}
                          </Bar>
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

                {/* 3. Sensor Health Chart (toggle: error margin / sensors / correlation) */}
                {devicesChartData.map((deviceData) => (
                  <Card key={`sensor-health-${deviceData.deviceId}`} className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="border-b bg-gray-50/50 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          <CardTitle className="text-sm font-medium text-gray-700">Sensor Health</CardTitle>
                        </div>
                        <div className="inline-flex rounded-md border bg-white p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setSensorHealthMode("error")}
                            className={cn(
                              "px-2 py-1 rounded-sm transition-colors",
                              sensorHealthMode === "error"
                                ? "bg-orange-100 text-orange-700 font-medium"
                                : "text-gray-500 hover:text-gray-700"
                            )}
                          >
                            Error Margin
                          </button>
                          <button
                            type="button"
                            onClick={() => setSensorHealthMode("sensors")}
                            className={cn(
                              "px-2 py-1 rounded-sm transition-colors",
                              sensorHealthMode === "sensors"
                                ? "bg-orange-100 text-orange-700 font-medium"
                                : "text-gray-500 hover:text-gray-700"
                            )}
                          >
                            Sensors
                          </button>
                          <button
                            type="button"
                            onClick={() => setSensorHealthMode("correlation")}
                            className={cn(
                              "px-2 py-1 rounded-sm transition-colors",
                              sensorHealthMode === "correlation"
                                ? "bg-orange-100 text-orange-700 font-medium"
                                : "text-gray-500 hover:text-gray-700"
                            )}
                          >
                            Correlation
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={250}>
                        {sensorHealthMode === "correlation" ? (
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              type="number"
                              dataKey="s1"
                              name="Sensor 1 PM2.5"
                              tick={{ fontSize: 10, fill: "#6b7280" }}
                              axisLine={false}
                              tickLine={false}
                              label={{ value: "Sensor 1 PM2.5", position: "insideBottom", offset: -2, fontSize: 10, fill: "#6b7280" }}
                            />
                            <YAxis
                              type="number"
                              dataKey="s2"
                              name="Sensor 2 PM2.5"
                              tick={{ fontSize: 10, fill: "#6b7280" }}
                              axisLine={false}
                              tickLine={false}
                              label={{ value: "Sensor 2 PM2.5", angle: -90, position: "insideLeft", fontSize: 10, fill: "#6b7280" }}
                            />
                            <ZAxis range={[30, 30]} />
                            <Tooltip
                              cursor={{ strokeDasharray: "3 3" }}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: any, name: any) => [Number(value).toFixed(2), name === "s1" ? "Sensor 1" : "Sensor 2"]}
                            />
                            <Scatter
                              data={deviceData.correlationData}
                              fill="#ea580c"
                              fillOpacity={0.6}
                            />
                          </ScatterChart>
                        ) : (
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
                            {sensorHealthMode === "sensors" && (
                              <Legend wrapperStyle={{ fontSize: 11 }} iconType="line" />
                            )}
                            {sensorHealthMode === "error" && (
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
                            )}
                            {sensorHealthMode === "sensors" && (
                              <>
                                <Line
                                  type="monotone"
                                  dataKey="s1_pm2_5"
                                  stroke="#3b82f6"
                                  name="Sensor 1"
                                  strokeWidth={2}
                                  connectNulls
                                  dot={false}
                                  activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="s2_pm2_5"
                                  stroke="#a855f7"
                                  name="Sensor 2"
                                  strokeWidth={2}
                                  connectNulls
                                  dot={false}
                                  activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                              </>
                            )}
                          </LineChart>
                        )}
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

              {/* Sensor Health Heatmap (Day × Hour) */}
              <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader className="border-b bg-gray-50/50 py-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <CardTitle className="text-sm font-medium text-gray-700">Sensor Health Heatmap</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Hourly view across the selected period. Toggle between data presence (Uptime) and average sensor error margin (|s1 − s2|).
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <DeviceHourHeatmaps devices={heatmapDevices} />
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
