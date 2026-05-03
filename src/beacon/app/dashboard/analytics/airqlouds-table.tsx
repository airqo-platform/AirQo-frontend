"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Search, ArrowUpDown, ChevronRight, Loader2 } from "lucide-react"
import { airQloudService, type AirQloudWithPerformance } from "@/services/airqloud.service"

interface ProcessedAirQloud {
  id: string
  name: string
  uptime: number | null
  onlinePercentage: number | null
  numberOfDevices: number
  offlineDevices: number | null
  errorMargin: number | null
  correlation: number | null
  location: string
  uptimeHistory: Array<{ value: number; timestamp: string }>
  errorMarginHistory: Array<{ value: number; timestamp: string }>
  correlationHistory: Array<{ value: number; timestamp: string }>
}

interface AirQloudsTableProps {
  performanceDays?: number
}

// Pearson correlation coefficient between two numeric arrays of equal length.
// Returns null when correlation cannot be computed (insufficient data or zero variance).
const pearsonCorrelation = (xs: number[], ys: number[]): number | null => {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return null

  let sumX = 0
  let sumY = 0
  for (let i = 0; i < n; i++) {
    sumX += xs[i]
    sumY += ys[i]
  }
  const meanX = sumX / n
  const meanY = sumY / n

  let num = 0
  let denX = 0
  let denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }

  if (denX === 0 || denY === 0) return null
  return num / Math.sqrt(denX * denY)
}

// Compute uptime / error-margin / correlation summaries from the synced cohort data array.
// `airqloud.data` is hourly aggregated points: { datetime, "pm2.5 sensor1", "pm2.5 sensor2", ... }
const summarizeCohortData = (
  rows: any[],
  performanceDays: number,
): {
  averageUptime: number | null
  averageErrorMargin: number | null
  averageCorrelation: number | null
  uptimeHistory: Array<{ value: number; timestamp: string }>
  errorMarginHistory: Array<{ value: number; timestamp: string }>
  correlationHistory: Array<{ value: number; timestamp: string }>
} => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      averageUptime: null,
      averageErrorMargin: null,
      averageCorrelation: null,
      uptimeHistory: [],
      errorMarginHistory: [],
      correlationHistory: [],
    }
  }

  const dailyBuckets: Record<string, {
    hoursSet: Set<number>
    errorMargins: number[]
    s1: number[]
    s2: number[]
  }> = {}

  for (const row of rows) {
    if (!row?.datetime) continue
    const dt = new Date(row.datetime)
    if (Number.isNaN(dt.getTime())) continue
    const dateKey = dt.toISOString().slice(0, 10)
    const bucket = dailyBuckets[dateKey] ?? (dailyBuckets[dateKey] = {
      hoursSet: new Set<number>(),
      errorMargins: [],
      s1: [],
      s2: [],
    })
    bucket.hoursSet.add(dt.getUTCHours())

    const s1 = row['pm2.5 sensor1'] ?? row.s1_pm2_5
    const s2 = row['pm2.5 sensor2'] ?? row.s2_pm2_5
    const s1Num = s1 == null ? null : Number(s1)
    const s2Num = s2 == null ? null : Number(s2)

    if (s1Num != null && s2Num != null && !Number.isNaN(s1Num) && !Number.isNaN(s2Num)) {
      bucket.errorMargins.push(Math.abs(s1Num - s2Num))
      bucket.s1.push(s1Num)
      bucket.s2.push(s2Num)
    }
  }

  const sortedDates = Object.keys(dailyBuckets).sort()
  if (sortedDates.length === 0) {
    return {
      averageUptime: null,
      averageErrorMargin: null,
      averageCorrelation: null,
      uptimeHistory: [],
      errorMarginHistory: [],
      correlationHistory: [],
    }
  }

  const dailyUptimes: number[] = []
  const dailyErrorMargins: number[] = []
  const dailyCorrelations: number[] = []
  const uptimeHistoryAll: Array<{ value: number; timestamp: string }> = []
  const errorMarginHistoryAll: Array<{ value: number; timestamp: string }> = []
  const correlationHistoryAll: Array<{ value: number; timestamp: string }> = []

  for (const date of sortedDates) {
    const bucket = dailyBuckets[date]
    const uptimePct = Math.min(100, (bucket.hoursSet.size / 24) * 100)
    dailyUptimes.push(uptimePct)
    uptimeHistoryAll.push({ value: uptimePct, timestamp: date })

    if (bucket.errorMargins.length > 0) {
      const avgEm =
        bucket.errorMargins.reduce((a, b) => a + b, 0) / bucket.errorMargins.length
      dailyErrorMargins.push(avgEm)
      errorMarginHistoryAll.push({ value: avgEm, timestamp: date })
    }

    const r = pearsonCorrelation(bucket.s1, bucket.s2)
    if (r != null && !Number.isNaN(r)) {
      dailyCorrelations.push(r)
      correlationHistoryAll.push({ value: r, timestamp: date })
    }
  }

  const avg = (arr: number[]): number | null =>
    arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length

  return {
    averageUptime: avg(dailyUptimes),
    averageErrorMargin: avg(dailyErrorMargins),
    averageCorrelation: avg(dailyCorrelations),
    uptimeHistory: uptimeHistoryAll.slice(-performanceDays),
    errorMarginHistory: errorMarginHistoryAll.slice(-performanceDays),
    correlationHistory: correlationHistoryAll.slice(-performanceDays),
  }
}

// Map pre-computed summary data from the API response
const processAirQloudData = (airqloud: AirQloudWithPerformance, performanceDays: number = 14): ProcessedAirQloud => {
  const numberOfDevices = airqloud.numberOfDevices || (airqloud.devices ? airqloud.devices.length : (airqloud.device_count || 0));

  // Compute daily uptime / error-margin / correlation directly from the synced
  // hourly data array. Falls back to the API-provided cohort.uptime when no
  // data points are present.
  const summary = summarizeCohortData(airqloud.data || [], performanceDays)

  const fallbackUptime = airqloud.uptime != null ? airqloud.uptime * 100 : null
  const overallUptime = summary.averageUptime ?? fallbackUptime

  const fallbackErrorMargin =
    typeof airqloud.error_margin === 'number' ? airqloud.error_margin : (airqloud.sensor_error_margin ?? null)
  const overallErrorMargin = summary.averageErrorMargin ?? fallbackErrorMargin

  // Count offline devices: those whose last_active is before the start of yesterday
  let offlineDevices: number | null = null;
  if (airqloud.devices && Array.isArray(airqloud.devices)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Start of yesterday

    offlineDevices = airqloud.devices.filter((d: any) => {
      if (!d.last_active && !d.is_active) return true; // No data and not active = offline
      if (d.is_active === false) return true;
      if (!d.last_active) return false;
      return new Date(d.last_active).getTime() < yesterday.getTime();
    }).length;
  }

  return {
    id: airqloud.id || airqloud._id || airqloud.name,
    name: airqloud.name,
    uptime: overallUptime,
    onlinePercentage: overallUptime ?? 0,
    numberOfDevices: numberOfDevices,
    offlineDevices: offlineDevices,
    errorMargin: overallErrorMargin,
    correlation: summary.averageCorrelation,
    location: airqloud.country || "",
    uptimeHistory: summary.uptimeHistory,
    errorMarginHistory: summary.errorMarginHistory,
    correlationHistory: summary.correlationHistory,
  }
}

export default function AirQloudsTable({ performanceDays = 14 }: AirQloudsTableProps) { //14days
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof ProcessedAirQloud>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [processedData, setProcessedData] = useState<ProcessedAirQloud[]>([])

  // Cohort Tags State
  const [cohortTags, setCohortTags] = useState<string[]>(["hardware"])
  const availableTags = ["hardware", "duplicate", "organizational", "inlab", "misc"] // Hardcoded for now, could be fetched

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Fetch data from API
  const fetchAirQlouds = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const safePage = Number.isFinite(page) && page > 0 ? page : 1
      const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 5
      const skip = (safePage - 1) * safePageSize

      const endDate = new Date()
      endDate.setDate(endDate.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)

      const startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - performanceDays + 1)
      startDate.setHours(0, 0, 0, 0)

      const response = await airQloudService.getAirQlouds({
        includePerformance: true,
        summary: true,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        frequency: 'hourly',
        search: searchTerm || undefined,
        limit: pageSize,
        skip: skip,
        tags: cohortTags.length > 0 ? cohortTags.join(",") : undefined
      })

      const { airqlouds, meta } = response

      setProcessedData(airqlouds.map(aq => processAirQloudData(aq, performanceDays)))
      const total = Number.isFinite(meta?.total) ? meta.total : airqlouds.length
      setTotalItems(total)
      setTotalPages(
        Number.isFinite(meta?.totalPages) && meta.totalPages > 0
          ? meta.totalPages
          : Math.max(1, Math.ceil(total / safePageSize))
      )
      // NOTE: do NOT sync `page` from `meta.page` here. The synced endpoint's
      // meta.page does not reflect the skip/limit we sent, so syncing it would
      // snap the user back to page 1 right after clicking "Next".

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Cohorts')
      console.error('Error fetching AirQlouds:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Reset page to 1 when search changes
    setPage(1)
  }, [searchTerm])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchAirQlouds()
    }, 300)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, performanceDays, page, pageSize, cohortTags])

  // Sort data (client-side sorting for current page)
  const sortedData = useMemo(() => {
    const sorted = [...processedData]

    sorted.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      // Handle null values
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return 1
      if (bValue === null) return -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return sorted
  }, [processedData, sortBy, sortOrder])

  const handleSort = (column: keyof ProcessedAirQloud) => {
    if (column === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleRowClick = (airqloudId: string) => {
    router.push(`/dashboard/analytics/${airqloudId}`)
  }

  // Mini bar graph component for uptime history
  const UptimeMiniGraph = ({ uptimeHistory, averageUptime }: { uptimeHistory: Array<{ value: number; timestamp: string }>, averageUptime: number | null }) => {
    if (averageUptime === null || uptimeHistory.length === 0) {
      return <span className="text-muted-foreground">N/A</span>
    }

    // Take last 14 values max
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

  // Generic mini bar graph for any per-day metric (error margin, correlation, etc.)
  const MetricMiniGraph = ({
    history,
    average,
    formatAverage,
    formatValue,
    valueLabel,
    getBarColor,
    getTooltipBgColor,
    normalize,
  }: {
    history: Array<{ value: number; timestamp: string }>
    average: number | null
    formatAverage: (v: number) => string
    formatValue: (v: number) => string
    valueLabel: string
    getBarColor: (v: number) => string
    getTooltipBgColor: (v: number) => string
    normalize: (v: number, all: number[]) => number // returns 0..1
  }) => {
    if (average === null || history.length === 0) {
      return <span className="text-muted-foreground">N/A</span>
    }

    const values = history.slice(-14)
    const allValues = values.map(v => v.value)

    const formatDate = (timestamp: string) => {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <span className="font-medium min-w-[50px]">{formatAverage(average)}</span>
          <div className="flex items-end gap-[2px] h-8">
            {values.map((item) => {
              const ratio = Math.max(0, Math.min(1, normalize(item.value, allValues)))
              return (
                <Tooltip key={item.timestamp} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-1.5 rounded-t-full ${getBarColor(item.value)} transition-all cursor-pointer`}
                      style={{ height: `${Math.max(4, ratio * 32)}px` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className={`${getTooltipBgColor(item.value)} text-white border`}>
                    <div className="text-xs font-medium">
                      <div>{formatDate(item.timestamp)}</div>
                      <div>{valueLabel}: {formatValue(item.value)}</div>
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

  const handleExportCSV = async () => {
    const escapeCSVValue = (value: string | number): string => {
      const str = String(value)
      // Escape values that could be interpreted as formulas
      if (/^[=+\-@]/.test(str)) {
        return `"'${str.replace(/"/g, '""')}"`
      }
      // Wrap in quotes if contains comma, quote, or newline
      if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    try {
      setIsExporting(true)

      // Fetch all data matching current filters
      const limit = totalItems > 0 ? totalItems : 1000

      const endDate = new Date()
      endDate.setDate(endDate.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)

      const startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - performanceDays + 1)
      startDate.setHours(0, 0, 0, 0)

      const response = await airQloudService.getAirQlouds({
        includePerformance: true,
        summary: true,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        frequency: 'hourly',
        search: searchTerm || undefined,
        limit: limit,
        skip: 0,
        tags: cohortTags.length > 0 ? cohortTags.join(",") : undefined
      })

      const { airqlouds } = response
      const dataToExport = airqlouds.map(aq => processAirQloudData(aq, performanceDays))

      // Sort data to match current view
      dataToExport.sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]

        if (aValue === null && bValue === null) return 0
        if (aValue === null) return 1
        if (bValue === null) return -1

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        }

        return 0
      })

      const headers = ["Name", "Location", "Uptime (%)", "Devices", "Error Margin (µg/m³)", "Correlation"]
      const rows = dataToExport.map(aq => [
        escapeCSVValue(aq.name),
        escapeCSVValue(aq.location || ""),
        escapeCSVValue(aq.uptime !== null ? aq.uptime.toFixed(2) : "N/A"),
        escapeCSVValue(aq.numberOfDevices),
        escapeCSVValue(aq.errorMargin !== null ? aq.errorMargin.toFixed(2) : "N/A"),
        escapeCSVValue(aq.correlation !== null ? aq.correlation.toFixed(3) : "N/A"),
      ])

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `airqlouds-analytics-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url) // Clean up to prevent memory leak
    } catch (err) {
      console.error("Failed to export CSV:", err)
    } finally {
      setIsExporting(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cohorts Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Error loading data: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cohorts Performance</CardTitle>
          <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Export csv
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Cohorts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {availableTags.map(tag => (
            <Badge
              key={tag}
              variant={cohortTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => {
                setCohortTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                )
                setPage(1) // Reset page on filter change
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No Cohorts found</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="hover:bg-transparent p-0 h-auto font-semibold"
                      >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("uptime")}
                        className="hover:bg-transparent p-0 h-auto font-semibold"
                      >
                        Uptime
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("numberOfDevices")}
                        className="hover:bg-transparent p-0 h-auto font-semibold"
                      >
                        Devices
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("errorMargin")}
                        className="hover:bg-transparent p-0 h-auto font-semibold"
                      >
                        Error Margin
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("correlation")}
                        className="hover:bg-transparent p-0 h-auto font-semibold"
                      >
                        Correlation
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((airqloud) => {
                    const hasNoData = airqloud.uptime === null && airqloud.errorMargin === null

                    return (
                      <TableRow
                        key={airqloud.id}
                        className={hasNoData
                          ? "opacity-60"
                          : "cursor-pointer hover:bg-muted/50 transition-colors"
                        }
                        onClick={hasNoData ? undefined : () => handleRowClick(airqloud.id)}
                      >
                        <TableCell>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{airqloud.name}</div>
                              {airqloud.location && (
                                <div className="text-sm text-muted-foreground">{airqloud.location}</div>
                              )}
                            </div>
                            {!hasNoData && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasNoData ? (
                            <span className="text-muted-foreground italic">Data loading...</span>
                          ) : (
                            <UptimeMiniGraph
                              uptimeHistory={airqloud.uptimeHistory}
                              averageUptime={airqloud.uptime}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {airqloud.offlineDevices != null ? (
                              <>
                                <Badge variant="outline">{airqloud.numberOfDevices - airqloud.offlineDevices}/{airqloud.numberOfDevices}</Badge>
                                {airqloud.offlineDevices > 0 && (
                                  <span className="text-xs text-red-500">{airqloud.offlineDevices} offline</span>
                                )}
                              </>
                            ) : (
                              <Badge variant="outline">{airqloud.numberOfDevices}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasNoData ? (
                            <span className="text-muted-foreground italic">Data loading...</span>
                          ) : (
                            <MetricMiniGraph
                              history={airqloud.errorMarginHistory}
                              average={airqloud.errorMargin}
                              valueLabel="Error margin"
                              formatAverage={(v) => `±${v.toFixed(1)}`}
                              formatValue={(v) => `±${v.toFixed(2)} µg/m³`}
                              getBarColor={(v) => {
                                if (v <= 3) return "bg-green-500 hover:bg-green-600"
                                if (v <= 5) return "bg-yellow-500 hover:bg-yellow-600"
                                return "bg-red-500 hover:bg-red-600"
                              }}
                              getTooltipBgColor={(v) => {
                                if (v <= 3) return "bg-green-600 border-green-700"
                                if (v <= 5) return "bg-yellow-600 border-yellow-700"
                                return "bg-red-600 border-red-700"
                              }}
                              normalize={(v, all) => {
                                const ceiling = Math.max(10, ...all)
                                return v / ceiling
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {hasNoData ? (
                            <span className="text-muted-foreground italic">Data loading...</span>
                          ) : (
                            <MetricMiniGraph
                              history={airqloud.correlationHistory}
                              average={airqloud.correlation}
                              valueLabel="Correlation"
                              formatAverage={(v) => v.toFixed(2)}
                              formatValue={(v) => v.toFixed(3)}
                              getBarColor={(v) => {
                                if (v >= 0.9) return "bg-green-500 hover:bg-green-600"
                                if (v >= 0.75) return "bg-yellow-500 hover:bg-yellow-600"
                                return "bg-red-500 hover:bg-red-600"
                              }}
                              getTooltipBgColor={(v) => {
                                if (v >= 0.9) return "bg-green-600 border-green-700"
                                if (v >= 0.75) return "bg-yellow-600 border-yellow-700"
                                return "bg-red-600 border-red-700"
                              }}
                              normalize={(v) => Math.max(0, v)}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value))
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  showInfo={true}
                  totalItems={totalItems}
                  itemsPerPage={pageSize}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
