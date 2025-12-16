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

export default function AirQloudPerformanceTab({ airqloudId, airqloudName }: Readonly<AirQloudPerformanceTabProps>) {
  const { toast } = useToast()
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
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

      // Calculate days for the airqloud API
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      // Fetch airqloud details with device performance
      const response = await airQloudService.getAirQloudById(airqloudId, days)
      
      if (Array.isArray(response?.device_performance) && response.device_performance.length > 0) {
        // Transform the data to match PerformanceData interface
        const transformedData: PerformanceData[] = response.device_performance.map((device) => ({
          id: device.device_id,
          name: (device as any).device_name || device.device_id,
          freq: device.performance.freq,
          error_margin: device.performance.error_margin,
          timestamp: device.performance.timestamp,
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
        description: "Failed to load AirQloud (Cohort) performance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformanceData()
  }, [airqloudId])

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
    setDateRange(getDefaultDateRange())
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
              <CardTitle>AirQloud (Cohort) Performance</CardTitle>
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
              <p>No performance data available for this AirQloud (Cohort).</p>
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
