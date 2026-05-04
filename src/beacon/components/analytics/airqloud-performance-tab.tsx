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
import { airQloudService } from "@/services/airqloud.service"
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

interface AirQloudPerformanceTabProps {
  airqloudId: string
  airqloudName: string
  initialData?: {
    devices: Array<{
      _id?: string
      name: string
      long_name: string
      uptime?: number | null
      data_completeness?: number | null
      sensor_error_margin?: number | null
      data?: any[]
    }>
  }
}

interface PerformanceData {
  id: string
  name: string
  uptime: number
  data_completeness: number
  sensor_error_margin: number
  backendData: any[]
}

interface DeviceSummary {
  deviceId: string
  deviceName: string
  avgFrequency: number
  avgErrorMargin: number
  avgUptime: number
}

export default function AirQloudPerformanceTab({ airqloudId, airqloudName, initialData }: Readonly<AirQloudPerformanceTabProps>) {
  const { toast } = useToast()
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  // Default date range getter: last 14 days ending yesterday
  const getDefaultDateRange = () => {
    const yesterday = subDays(new Date(), 1)
    const fourteenDaysAgo = subDays(yesterday, 13)
    return { from: fourteenDaysAgo, to: yesterday }
  }

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>(getDefaultDateRange())
  const [timeRange, setTimeRange] = useState<{
    from: string
    to: string
  }>({
    from: "00:00",
    to: "23:59",
  })
  const [includeTime, setIncludeTime] = useState(false)

  // Collapsible sections state
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [uptimeExpanded, setUptimeExpanded] = useState(false)
  const [frequencyExpanded, setFrequencyExpanded] = useState(false)
  const [errorMarginExpanded, setErrorMarginExpanded] = useState(false)

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!dateRange.from || !dateRange.to) {
        setLoading(false)
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

      // Fetch airqloud details with device performance
      const response = await airQloudService.getAirQloudById(
        airqloudId,
        startDate.toISOString(),
        endDate.toISOString()
      )

      if (response && Array.isArray(response.devices) && response.devices.length > 0) {
        // Transform the data to match PerformanceData interface
        const transformedData: PerformanceData[] = response.devices.map((device) => ({
          id: device._id || device.name,
          name: device.long_name || device.name,
          uptime: device.uptime || 0,
          data_completeness: device.data_completeness || 0,
          sensor_error_margin: device.sensor_error_margin || 0,
          backendData: device.data || [],
        }))

        setPerformanceData(transformedData)
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
        description: "Failed to load Cohort performance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // If initialData is provided from the overview tab, use it instead of fetching
    if (initialData) {
      const devices = initialData.devices || []
      if (devices.length > 0) {
        const transformedData: PerformanceData[] = devices.map((device) => ({
          id: device._id || device.name,
          name: device.long_name || device.name,
          uptime: device.uptime || 0,
          data_completeness: device.data_completeness || 0,
          sensor_error_margin: device.sensor_error_margin || 0,
          backendData: device.data || [],
        }))
        setPerformanceData(transformedData)
      } else {
        setPerformanceData([])
      }
      setLoading(false)
      return
    }

    // Only fetch if no initialData was provided
    fetchPerformanceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airqloudId, initialData])

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

  // Helper to check if a date is today or in the future
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  const handleApplyFilter = () => {
    setIsCalendarOpen(false)
    fetchPerformanceData()
  }

  const handleClearFilters = () => {
    setDateRange(getDefaultDateRange())
    setTimeRange({ from: "00:00", to: "23:59" })
    setIncludeTime(false)
    setTimeout(() => fetchPerformanceData(), 100)
    setIsCalendarOpen(false)
  }

  // Process data for each device
  const devicesChartData = useMemo(() => {
    return performanceData.map((device) => ({
      deviceId: device.id,
      deviceName: device.name,
      chartData: device.backendData.map((d: any) => ({
        timestamp: d.datetime,
        formattedTime: format(new Date(d.datetime), "MMM dd HH:mm"),
        freq: 1,
        error_margin: (d.s1_pm2_5 != null && d.s2_pm2_5 != null) ? Math.abs(d.s1_pm2_5 - d.s2_pm2_5) : null,
      })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    }))
  }, [performanceData])

  // Calculate daily uptime for each device
  const devicesUptimeData = useMemo(() => {
    return performanceData.map((device) => {
      const dailyData: Record<string, { date: string; hoursWithData: number; totalHours: number }> = {}

      device.backendData.forEach((d: any) => {
        const dateKey = format(new Date(d.datetime), "yyyy-MM-dd")

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            date: format(new Date(d.datetime), "MMM dd, yyyy"),
            hoursWithData: 0,
            totalHours: 24, // Assuming hourly data
          }
        }

        dailyData[dateKey].hoursWithData++
      })

      return {
        deviceId: device.id,
        deviceName: device.name,
        dailyUptimeData: Object.keys(dailyData).sort().map(key => ({
          date: dailyData[key].date,
          uptimePercentage: Math.min(100, (dailyData[key].hoursWithData / dailyData[key].totalHours) * 100).toFixed(1),
        })),
      }
    })
  }, [performanceData])

  // Calculate summary statistics for each device
  const devicesSummary = useMemo((): DeviceSummary[] => {
    return performanceData.map((device) => ({
      deviceId: device.id,
      deviceName: device.name,
      avgFrequency: device.data_completeness * 100, // Represented as percentage
      avgErrorMargin: device.sensor_error_margin,
      avgUptime: device.uptime * 100,
    }))
  }, [performanceData])

  const isSingleDevice = performanceData.length === 1

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cohort Performance</CardTitle>
              <CardDescription>
                View performance metrics for {airqloudName}
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
                          id="includeTimeAirQloud"
                          checked={includeTime}
                          onCheckedChange={(checked) => handleIncludeTimeChange(checked as boolean)}
                        />
                        <Label htmlFor="includeTimeAirQloud" className="text-sm cursor-pointer">
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
              <p>No performance data available for this Cohort.</p>
              <p className="text-sm mt-2">Try selecting a different date range.</p>
            </div>
          )}

          {!loading && performanceData.length > 0 && (
            <div className="space-y-8">
              {/* Summary Stats Table - Collapsible */}
              <div>
                <button
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                  className="flex items-center gap-2 mb-4 w-full hover:opacity-70 transition-opacity"
                  type="button"
                  aria-expanded={summaryExpanded}
                >
                  {summaryExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                  <Activity className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Summary Statistics</h3>
                </button>
                {summaryExpanded && (
                  <Card>
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Device Name</TableHead>
                            <TableHead className="text-right">Avg Frequency</TableHead>
                            <TableHead className="text-right">Avg Error Margin</TableHead>
                            <TableHead className="text-right">Avg Daily Uptime</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {devicesSummary.map((summary) => (
                            <TableRow key={summary.deviceId}>
                              <TableCell className="font-medium">{summary.deviceName}</TableCell>
                              <TableCell className="text-right">{summary.avgFrequency.toFixed(1)}</TableCell>
                              <TableCell className="text-right">{summary.avgErrorMargin.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{summary.avgUptime.toFixed(1)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Daily Uptime Charts - Collapsible */}
              <div>
                <button
                  onClick={() => setUptimeExpanded(!uptimeExpanded)}
                  className="flex items-center gap-2 mb-4 w-full hover:opacity-70 transition-opacity"
                  type="button"
                  aria-expanded={uptimeExpanded}
                >
                  {uptimeExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                  <Clock className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Daily Uptime Percentage</h3>
                </button>
                {uptimeExpanded && (
                  <div className={`grid gap-4 ${isSingleDevice ? 'md:grid-cols-2' : 'lg:grid-cols-2'}`}>
                    {devicesUptimeData.map((deviceUptime) => (
                      <Card key={`uptime-${deviceUptime.deviceId}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{deviceUptime.deviceName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
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
                )}
              </div>

              {/* Data Frequency Charts - Collapsible */}
              <div>
                <button
                  onClick={() => setFrequencyExpanded(!frequencyExpanded)}
                  className="flex items-center gap-2 mb-4 w-full hover:opacity-70 transition-opacity"
                  type="button"
                  aria-expanded={frequencyExpanded}
                >
                  {frequencyExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Data Frequency</h3>
                </button>
                {frequencyExpanded && (
                  <div className={`grid gap-4 ${isSingleDevice ? 'md:grid-cols-2' : 'lg:grid-cols-2'}`}>
                    {devicesChartData.map((deviceData) => (
                      <Card key={`freq-${deviceData.deviceId}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{deviceData.deviceName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
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
                  </div>
                )}
              </div>

              {/* Error Margin Charts - Collapsible */}
              <div>
                <button
                  onClick={() => setErrorMarginExpanded(!errorMarginExpanded)}
                  className="flex items-center gap-2 mb-4 w-full hover:opacity-70 transition-opacity"
                  type="button"
                  aria-expanded={errorMarginExpanded}
                >
                  {errorMarginExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Error Margin</h3>
                </button>
                {errorMarginExpanded && (
                  <div className={`grid gap-4 ${isSingleDevice ? 'md:grid-cols-2' : 'lg:grid-cols-2'}`}>
                    {devicesChartData.map((deviceData) => (
                      <Card key={`error-${deviceData.deviceId}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{deviceData.deviceName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
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
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
