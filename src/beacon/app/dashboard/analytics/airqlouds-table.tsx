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
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Search, ArrowUpDown, Download, ChevronRight } from "lucide-react"
import { airQloudService, type AirQloudWithPerformance } from "@/services/airqloud.service"

interface ProcessedAirQloud {
  id: string
  name: string
  uptime: number | null
  onlinePercentage: number | null
  numberOfDevices: number
  errorMargin: number | null
  location: string
  isActive: boolean
  uptimeHistory: Array<{ value: number; timestamp: string }> // Last 14 days of uptime values with dates
}

interface AirQloudsTableProps {
  performanceDays?: number
}

// Calculate average uptime, error margin, and uptime history from performance data
const processAirQloudData = (airqloud: AirQloudWithPerformance): ProcessedAirQloud => {
  const freq = airqloud.freq || []
  const errorMargin = airqloud.error_margin || []
  const timestamps = airqloud.timestamp || []
  
  // Calculate uptime percentage from freq (max 24) - limit to last 14 days
  const uptimeHistory = timestamps.map((timestamp, index) => ({
    value: (freq[index] / 24) * 100,
    timestamp
  })).slice(-14)
  
  const averageUptime = uptimeHistory.length > 0
    ? uptimeHistory.reduce((sum, item) => sum + item.value, 0) / uptimeHistory.length
    : null
  
  // Calculate average error margin
  const averageErrorMargin = errorMargin.length > 0
    ? errorMargin.reduce((sum, em) => sum + em, 0) / errorMargin.length
    : null
  
  return {
    id: airqloud.id,
    name: airqloud.name,
    uptime: averageUptime,
    onlinePercentage: null, // Can be null as per requirements
    numberOfDevices: airqloud.device_count || airqloud.number_of_devices || 0,
    errorMargin: averageErrorMargin,
    location: airqloud.country,
    isActive: airqloud.is_active,
    uptimeHistory
  }
}

export default function AirQloudsTable({ performanceDays = 14 }: AirQloudsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof ProcessedAirQloud>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [trackingFilter, setTrackingFilter] = useState<"tracked" | "untracked">("tracked")
  const [rawData, setRawData] = useState<AirQloudWithPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingAirQloud, setEditingAirQloud] = useState<ProcessedAirQloud | null>(null)
  const [editIsTracked, setEditIsTracked] = useState(false)
  const [editCountry, setEditCountry] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch data from API
  useEffect(() => {
    const fetchAirQlouds = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await airQloudService.getAirQlouds({
          include_performance: true,
          performance_days: performanceDays,
          search: searchTerm || undefined,
        })
        setRawData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch AirQlouds')
        console.error('Error fetching AirQlouds:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(() => {
      fetchAirQlouds()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, performanceDays])

  // Process raw data into display format
  const processedAirQlouds = useMemo(() => {
    return rawData.map(processAirQloudData)
  }, [rawData])

  // Filter and sort data
  const sortedData = useMemo(() => {
    // Filter by tracking status (active/inactive)
    const filtered = processedAirQlouds.filter(aq => 
      trackingFilter === "tracked" ? aq.isActive : !aq.isActive
    )
    
    const sorted = [...filtered]
    
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
  }, [processedAirQlouds, sortBy, sortOrder, trackingFilter])

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

  const openEditDialog = (e: React.MouseEvent, airqloud: ProcessedAirQloud) => {
    e.stopPropagation() // Prevent row click
    setEditingAirQloud(airqloud)
    setEditIsTracked(airqloud.isActive)
    setEditCountry(airqloud.location || "")
    setEditDialogOpen(true)
  }

  const handleUpdateAirQloud = async () => {
    if (!editingAirQloud) return
    
    setIsUpdating(true)
    try {
      await airQloudService.updateAirQloud(editingAirQloud.id, {
        is_active: editIsTracked,
        country: editCountry || null
      })
      // Refresh data after update
      const data = await airQloudService.getAirQlouds({
        include_performance: true,
        performance_days: performanceDays,
        search: searchTerm || undefined,
      })
      setRawData(data)
      setEditDialogOpen(false)
    } catch (err) {
      console.error('Error updating AirQloud:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (airqloud: ProcessedAirQloud) => {
    return airqloud.isActive ? (
      <Badge 
        className="bg-green-500 cursor-pointer hover:bg-green-600 transition-colors"
        onClick={(e) => openEditDialog(e, airqloud)}
      >
        Tracked
      </Badge>
    ) : (
      <Badge 
        variant="secondary" 
        className="cursor-pointer hover:bg-gray-300 transition-colors"
        onClick={(e) => openEditDialog(e, airqloud)}
      >
        Untracked
      </Badge>
    )
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

  const exportToCSV = () => {
    const headers = ["Name", "Location", "Uptime (%)", "Devices", "Error Margin (%)"]
    const rows = sortedData.map(aq => [
      aq.name,
      aq.location || "",
      aq.uptime !== null ? aq.uptime.toFixed(2) : "N/A",
      aq.numberOfDevices,
      aq.errorMargin !== null ? aq.errorMargin.toFixed(2) : "N/A",
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
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AirQlouds Performance</CardTitle>
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
          <CardTitle>AirQlouds Performance</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            {/* <Download className="mr-2 h-4 w-4" /> */}
            Last 14 Days
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search AirQlouds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Tabs value={trackingFilter} onValueChange={(value) => setTrackingFilter(value as "tracked" | "untracked")}>
            <TabsList>
              <TabsTrigger value="tracked">Tracked</TabsTrigger>
              <TabsTrigger value="untracked">Untracked</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No AirQlouds found</div>
        ) : (
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
                  <TableHead>Tracking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((airqloud) => {
                  const isInactive = !airqloud.isActive
                  const hasNoData = airqloud.uptime === null && airqloud.errorMargin === null
                  const showNoDataMessage = isInactive || hasNoData
                  
                  return (
                    <TableRow 
                      key={airqloud.id}
                      className={showNoDataMessage 
                        ? "opacity-60" 
                        : "cursor-pointer hover:bg-muted/50 transition-colors"
                      }
                      onClick={showNoDataMessage ? undefined : () => handleRowClick(airqloud.id)}
                    >
                      <TableCell>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{airqloud.name}</div>
                            {airqloud.location && (
                              <div className="text-sm text-muted-foreground">{airqloud.location}</div>
                            )}
                          </div>
                          {!showNoDataMessage && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isInactive ? (
                          <span className="text-muted-foreground italic">Inactive - Not tracked</span>
                        ) : hasNoData ? (
                          <span className="text-muted-foreground italic">Data loading...</span>
                        ) : (
                          <UptimeMiniGraph 
                            uptimeHistory={airqloud.uptimeHistory} 
                            averageUptime={airqloud.uptime} 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{airqloud.numberOfDevices}</Badge>
                      </TableCell>
                      <TableCell>
                        {isInactive ? (
                          <span className="text-muted-foreground italic">Inactive - Not tracked</span>
                        ) : hasNoData ? (
                          <span className="text-muted-foreground italic">Data loading...</span>
                        ) : airqloud.errorMargin !== null ? (
                          <span
                            className={`font-medium ${
                              airqloud.errorMargin <= 3
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
                      <TableCell>{getStatusBadge(airqloud)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit AirQloud Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit AirQloud</DialogTitle>
            <DialogDescription>
              Update tracking status and country for {editingAirQloud?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tracking-status" className="font-medium">
                  Tracking Status
                </Label>
                <p className="text-sm text-muted-foreground">
                  {editIsTracked ? "Currently tracking this AirQloud" : "Not tracking this AirQloud"}
                </p>
              </div>
              <Switch
                id="tracking-status"
                checked={editIsTracked}
                onCheckedChange={setEditIsTracked}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Enter country (optional)"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAirQloud} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
