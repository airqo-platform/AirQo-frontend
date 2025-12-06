"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Box, RefreshCw, CalendarIcon, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getDeviceMetadata } from "@/services/device-api.service"
import { useToast } from "@/hooks/use-toast"

interface MetadataTabProps {
  deviceId: string
  deviceName: string
}

interface MetadataEntry {
  entryID: any
  created_at: string
  [key: string]: any
}

interface MetadataResponse {
  metadata: MetadataEntry[]
  total: number
  skip: number
  limit: number
}

export default function MetadataTab({ deviceId, deviceName }: MetadataTabProps) {
  const { toast } = useToast()
  const [metadata, setMetadata] = useState<MetadataEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [timeRange, setTimeRange] = useState<{
    from: string
    to: string
  }>({
    from: "00:00",
    to: "23:59",
  })
  const [includeTime, setIncludeTime] = useState(false)

  const fetchMetadata = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        device_id: deviceId,
        skip,
        limit,
      }

      if (dateRange.from) {
        const fromDate = new Date(dateRange.from)
        if (includeTime) {
          const [hours, minutes] = timeRange.from.split(':')
          fromDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        }
        params.start_date = fromDate.toISOString()
      }
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to)
        if (includeTime) {
          const [hours, minutes] = timeRange.to.split(':')
          toDate.setHours(parseInt(hours), parseInt(minutes), 59, 999)
        } else {
          toDate.setHours(23, 59, 59, 999)
        }
        params.end_date = toDate.toISOString()
      }

      const response = await getDeviceMetadata(params)
      
      setMetadata(response.metadata || [])
      setTotal(response.total || 0)
    } catch (err: any) {
      console.error("Error fetching metadata:", err)
      setError(err.message || "Failed to load metadata")
      toast({
        title: "Error",
        description: "Failed to load device metadata",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetadata()
  }, [deviceId, skip, limit])

  const handleDateRangeChange = (newDateRange: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(newDateRange)
  }

  const handleTimeRangeChange = (type: "from" | "to", value: string) => {
    setTimeRange(prev => ({ ...prev, [type]: value }))
  }

  const handleIncludeTimeChange = (checked: boolean) => {
    setIncludeTime(checked)
  }

  const handleFilter = () => {
    setSkip(0) // Reset to first page when filtering
    fetchMetadata()
  }

  const handleClearFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    setTimeRange({ from: "00:00", to: "23:59" })
    setIncludeTime(false)
    setSkip(0)
    setTimeout(() => fetchMetadata(), 100)
  }

  const getMetadataKeys = (entry: MetadataEntry): string[] => {
    return Object.keys(entry).filter(key => !['entryID', 'created_at', 'device_id', 'channel_id'].includes(key))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Device Metadata</CardTitle>
            <CardDescription>
              View device metadata like battery level, signal strength, etc.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetadata}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
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
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
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
                  {/* Date Display */}
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
                    
                    {/* Time Inputs - Only show when includeTime is true */}
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
                    
                    {/* Include Time Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeTime"
                        checked={includeTime}
                        onCheckedChange={(checked) => handleIncludeTimeChange(checked as boolean)}
                      />
                      <Label htmlFor="includeTime" className="text-sm cursor-pointer">
                        Include Time
                      </Label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Quick Select Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  Quick Select
                </Button>
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
                      const today = new Date()
                      const yesterday = new Date(today)
                      yesterday.setDate(yesterday.getDate() - 1)
                      handleDateRangeChange({ from: yesterday, to: yesterday })
                    }}
                  >
                    Yesterday
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const lastWeek = new Date(today)
                      lastWeek.setDate(lastWeek.getDate() - 7)
                      handleDateRangeChange({ from: lastWeek, to: today })
                    }}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const lastMonth = new Date(today)
                      lastMonth.setDate(lastMonth.getDate() - 30)
                      handleDateRangeChange({ from: lastMonth, to: today })
                    }}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const last90Days = new Date(today)
                      last90Days.setDate(last90Days.getDate() - 90)
                      handleDateRangeChange({ from: last90Days, to: today })
                    }}
                  >
                    Last 90 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                      handleDateRangeChange({ from: firstDay, to: today })
                    }}
                  >
                    This month
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={handleFilter}>
              Apply Filter
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error loading metadata</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <RefreshCw className="h-10 w-10 mx-auto mb-2 text-gray-400 animate-spin" />
            <p className="text-gray-500">Loading metadata...</p>
          </div>
        ) : metadata.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Box className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p>No metadata available for this device.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {skip + 1} - {Math.min(skip + limit, total)} of {total} records
            </div>
            <div className="space-y-4">
              {metadata.map((entry, index) => {
                const keys = getMetadataKeys(entry)
                return (
                  <div key={entry.entryID || index} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">Entry #{skip + index + 1}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {keys.map((key) => (
                        <div key={key}>
                          <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-medium">{entry[key]?.toString() || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {Math.floor(skip / limit) + 1} of {Math.ceil(total / limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => setSkip(skip + limit)}
                disabled={skip + limit >= total}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
