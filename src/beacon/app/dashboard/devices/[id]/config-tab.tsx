"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, RefreshCw, Save, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Edit, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getDeviceConfig, updateDeviceConfigs } from "@/services/device-api.service"
import { useToast } from "@/hooks/use-toast"

interface ConfigTabProps {
  deviceId: string
  deviceName: string
  channelId: number
}

interface ConfigHistoryItem {
  id: string
  device_id: string
  channel_id: number
  config1?: string
  config2?: string
  config3?: string
  config4?: string
  config5?: string
  config6?: string
  config7?: string
  config8?: string
  config9?: string
  config10?: string
  config_updated: boolean
  created_at: string
}

interface ConfigData {
  config1?: string
  config2?: string
  config3?: string
  config4?: string
  config5?: string
  config6?: string
  config7?: string
  config8?: string
  config9?: string
  config10?: string
}

export default function ConfigTab({ deviceId, deviceName, channelId }: ConfigTabProps) {
  const { toast } = useToast()
  const [configData, setConfigData] = useState<ConfigData>({})
  const [configHistory, setConfigHistory] = useState<ConfigHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const itemsPerPage = 10

  // Date filter state
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

  const fetchConfigHistory = async (page: number = 1) => {
    try {
      setHistoryLoading(true)
      setError(null)

      const skip = (page - 1) * itemsPerPage
      const params: any = {
        channel_id: channelId,
        skip,
        limit: itemsPerPage,
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

      const response = await getDeviceConfig(params)
      
      if (response.items && response.items.length > 0) {
        setConfigHistory(response.items)
        setTotalRecords(response.pagination?.total || 0)
        setTotalPages(response.pagination?.pages || 0)
        setCurrentPage(response.pagination?.current_page || 1)
        
        // Set the form with the latest config (first item) when opening dialog
        if (response.items.length > 0) {
          const latest = response.items[0]
          const configs: ConfigData = {}
          for (let i = 1; i <= 10; i++) {
            const key = `config${i}` as keyof ConfigData
            if (latest[key]) {
              configs[key] = latest[key]
            }
          }
          setConfigData(configs)
        }
      } else {
        setConfigHistory([])
        setTotalRecords(0)
        setTotalPages(0)
      }
    } catch (err: any) {
      console.error("Error fetching config history:", err)
      setError(err.message || "Failed to load configuration history")
      toast({
        title: "Error",
        description: "Failed to load configuration history",
        variant: "destructive",
      })
    } finally {
      setHistoryLoading(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (channelId) {
      fetchConfigHistory(1)
    }
  }, [channelId])

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
    setCurrentPage(1)
    fetchConfigHistory(1)
  }

  const handleClearFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    setTimeRange({ from: "00:00", to: "23:59" })
    setIncludeTime(false)
    setCurrentPage(1)
    setTimeout(() => fetchConfigHistory(1), 100)
  }

  const handleConfigChange = (key: keyof ConfigData, value: string) => {
    setConfigData(prev => ({
      ...prev,
      [key]: value,
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      await updateDeviceConfigs({
        device_ids: [deviceId],
        ...configData,
      })

      toast({
        title: "Success",
        description: "Device configuration updated successfully",
      })

      setHasChanges(false)
      setDialogOpen(false)
      
      // Refresh history to show new entry
      setTimeout(() => {
        fetchConfigHistory(1)
      }, 1000)
    } catch (err: any) {
      console.error("Error saving config:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDialog = () => {
    // Load latest config when opening dialog
    if (configHistory.length > 0) {
      const latest = configHistory[0]
      const configs: ConfigData = {}
      for (let i = 1; i <= 10; i++) {
        const key = `config${i}` as keyof ConfigData
        if (latest[key]) {
          configs[key] = latest[key]
        }
      }
      setConfigData(configs)
    }
    setHasChanges(false)
    setDialogOpen(true)
  }

  const handleReset = () => {
    // Reset to latest config from history
    if (configHistory.length > 0) {
      const latest = configHistory[0]
      const configs: ConfigData = {}
      for (let i = 1; i <= 10; i++) {
        const key = `config${i}` as keyof ConfigData
        if (latest[key]) {
          configs[key] = latest[key]
        }
      }
      setConfigData(configs)
    }
    setHasChanges(false)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchConfigHistory(newPage)
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuration History</CardTitle>
              <CardDescription>
                View and manage configuration for {deviceName}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchConfigHistory(currentPage)}
                disabled={historyLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${historyLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleOpenDialog}
                disabled={loading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Config
              </Button>
            </div>
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
                          id="includeTimeConfig"
                          checked={includeTime}
                          onCheckedChange={(checked) => handleIncludeTimeChange(checked as boolean)}
                        />
                        <Label htmlFor="includeTimeConfig" className="text-sm cursor-pointer">
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

              <Button onClick={handleApplyFilter}>
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
                <p className="text-sm font-medium text-red-800">Error loading history</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {historyLoading ? (
            <div className="text-center py-10">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
              <p className="text-gray-500">Loading history...</p>
            </div>
          ) : configHistory.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Settings className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>No configuration history available for this device.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Config 1</TableHead>
                      <TableHead>Config 2</TableHead>
                      <TableHead>Config 3</TableHead>
                      <TableHead>Config 4</TableHead>
                      <TableHead>Config 5</TableHead>
                      <TableHead>Config 6</TableHead>
                      <TableHead>Config 7</TableHead>
                      <TableHead>Config 8</TableHead>
                      <TableHead>Config 9</TableHead>
                      <TableHead>Config 10</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configHistory.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell className="text-sm">
                          {new Date(config.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.config_updated ? "default" : "secondary"}>
                            {config.config_updated ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Applied
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Pending
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{config.config1 || '-'}</TableCell>
                        <TableCell className="text-sm">{config.config2 || '-'}</TableCell>
                        <TableCell className="text-sm">{config.config3 || '-'}</TableCell>
                        <TableCell className="text-sm">{config.config4 || '-'}</TableCell>
                        <TableCell className="text-sm">{config.config5 || '-'}</TableCell>
                        <TableCell className="text-sm">{config.config6 || '-'}</TableCell>
                        <TableCell className="text-sm">{config.config7 || '-'}</TableCell>
                        <TableCell className="text-sm">{config.config8 || '-'}</TableCell>
                        <TableCell className="text-sm">{config.config9 || '-'}</TableCell>
                        <TableCell className="text-sm">{config.config10 || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {configHistory.length} of {totalRecords} records
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || historyLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || historyLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Update Configuration Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Configuration</DialogTitle>
            <DialogDescription>
              Modify configuration values for {deviceName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const key = `config${num}` as keyof ConfigData
              return (
                <div key={key}>
                  <Label htmlFor={key} className="capitalize">
                    Configuration {num}
                  </Label>
                  <Input
                    id={key}
                    type="text"
                    value={configData[key] || ''}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    placeholder={`Enter config ${num} value`}
                  />
                </div>
              )
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setHasChanges(false)
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
