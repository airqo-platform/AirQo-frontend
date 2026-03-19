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
  location: string
  uptimeHistory: Array<{ value: number; timestamp: string }>
}

interface AirQloudsTableProps {
  performanceDays?: number
}

// Map pre-computed summary data from the API response
const processAirQloudData = (airqloud: AirQloudWithPerformance, performanceDays: number = 14): ProcessedAirQloud => {
  const numberOfDevices = airqloud.numberOfDevices || (airqloud.devices ? airqloud.devices.length : (airqloud.device_count || 0));

  // Use pre-computed summary uptime and error_margin (API returns as 0-1 decimals)
  const overallUptime = airqloud.uptime != null ? airqloud.uptime * 100 : null;
  const rawErrorMargin = airqloud.error_margin;
  const overallErrorMargin = typeof rawErrorMargin === 'number' ? rawErrorMargin : null;

  // Count offline devices: those whose last_active is before the start of yesterday
  let offlineDevices: number | null = null;
  if (airqloud.devices && Array.isArray(airqloud.devices)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Start of yesterday

    offlineDevices = airqloud.devices.filter((d: any) => {
      if (!d.last_active) return true; // No data = offline
      return new Date(d.last_active).getTime() < yesterday.getTime();
    }).length;
  }

  // Build daily uptime history from summary data[] array
  let uptimeHistory: Array<{ value: number; timestamp: string }> = [];

  if (airqloud.data && Array.isArray(airqloud.data)) {
    uptimeHistory = airqloud.data
      .filter((d: any) => d.date && d.uptime != null)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-performanceDays)
      .map((d: any) => ({
        value: Math.min(100, d.uptime * 100),
        timestamp: d.date
      }));
  }

  return {
    id: airqloud.id || airqloud._id || airqloud.name,
    name: airqloud.name,
    uptime: overallUptime,
    onlinePercentage: overallUptime ?? 0,
    numberOfDevices: numberOfDevices,
    offlineDevices: offlineDevices,
    errorMargin: overallErrorMargin,
    location: airqloud.country || "",
    uptimeHistory: uptimeHistory
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
  const availableTags = ["hardware", "software", "test", "production"] // Hardcoded for now, could be fetched

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
      const skip = (page - 1) * pageSize

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - performanceDays)

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
      setTotalItems(meta.total)
      setTotalPages(meta.totalPages)
      setPage(meta.page)

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

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchAirQlouds()
    }, 300)

    return () => clearTimeout(timer)
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

  const handleExportCSV = async () => {
    // Helper to escape CSV values
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
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - performanceDays)

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

      const headers = ["Name", "Location", "Uptime (%)", "Devices", "Error Margin (%)"]
      const rows = dataToExport.map(aq => [
        escapeCSVValue(aq.name),
        escapeCSVValue(aq.location || ""),
        escapeCSVValue(aq.uptime !== null ? aq.uptime.toFixed(2) : "N/A"),
        escapeCSVValue(aq.numberOfDevices),
        escapeCSVValue(aq.errorMargin !== null ? aq.errorMargin.toFixed(2) : "N/A"),
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
                          ) : airqloud.errorMargin !== null ? (
                            <span
                              className={`font-medium ${airqloud.errorMargin <= 3
                                ? "text-green-600"
                                : airqloud.errorMargin <= 5
                                  ? "text-yellow-600"
                                  : "text-red-600"
                                }`}
                            >
                              ±{airqloud.errorMargin.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
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
