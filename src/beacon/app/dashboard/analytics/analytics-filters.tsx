"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, subDays } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { airQloudService, type AirQloudBasic } from "@/services/airqloud.service"
import { deviceApiService } from "@/services/device-api.service"
import type { Device } from "@/types/api.types"
import { useGroup } from "@/lib/group-context"
import { useSyncActions, SyncToolbar } from "@/components/analytics/sync-toolbar"

type AnalyticsFilterType = "airqlouds" | "devices" | "grids"

interface AnalyticsFiltersProps {
  initialFilterType?: AnalyticsFilterType
  onFilterChange?: (filters: FilterState) => void
  onAnalyse?: (filters: FilterState) => void
  isAnalysing?: boolean
  hideDateRange?: boolean
}

export interface FilterState {
  filterType: AnalyticsFilterType
  selectedItems: string[]
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  timeRange?: {
    from: string
    to: string
  }
  includeTime: boolean
}

interface SelectedItem {
  id: string
  name: string
}

function getDefaultCohortTag(activeGroup: string | null): string {
  return activeGroup?.toLowerCase() === "airqo" ? "hardware" : "organizational"
}

export default function AnalyticsFilters({ 
  initialFilterType = "airqlouds", 
  onFilterChange, 
  onAnalyse, 
  isAnalysing,
  hideDateRange = false
}: AnalyticsFiltersProps) {
  const { activeGroup, loading: groupLoading } = useGroup()
  const syncActions = useSyncActions()
  const [filterType, setFilterType] = useState<AnalyticsFilterType>(initialFilterType)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedItemsMap, setSelectedItemsMap] = useState<Map<string, SelectedItem>>(new Map())
  const [searchTerm, setSearchTerm] = useState("")
  const [includeTime, setIncludeTime] = useState(false)
  const [airqlouds, setAirqlouds] = useState<AirQloudBasic[]>([])
  const [grids, setGrids] = useState<AirQloudBasic[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoadingAirqlouds, setIsLoadingAirqlouds] = useState(false)
  const [isLoadingGrids, setIsLoadingGrids] = useState(false)
  const [isLoadingDevices, setIsLoadingDevices] = useState(false)

  // Cohort Tags State
  const [cohortTags, setCohortTags] = useState<string[]>([getDefaultCohortTag(activeGroup)])
  const availableTags = ["hardware", "duplicate", "organizational", "inlab", "misc"] // Hardcoded for now, could be fetched
  const lastSuccessfulCohortTagRef = useRef<string>(getDefaultCohortTag(activeGroup))

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>(() => {
    if (hideDateRange) {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const from = subDays(today, 13)
      from.setHours(0, 0, 0, 0)
      return { from, to: today }
    }
    return {
      from: undefined,
      to: undefined,
    }
  })
  const [timeRange, setTimeRange] = useState<{
    from: string
    to: string
  }>({
    from: "12:00",
    to: "11:59",
  })

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  useEffect(() => {
    if (groupLoading) return
    setCohortTags([getDefaultCohortTag(activeGroup)])
  }, [activeGroup, groupLoading])

  useEffect(() => {
    if (filterType === initialFilterType) return

    setFilterType(initialFilterType)
    setSearchTerm("")
    notifyFilterChange(initialFilterType, [], dateRange, timeRange, includeTime)
    // selectedItems and selectedItemsMap will be loaded from localStorage via the filterType effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilterType])

  // Load selected items from localStorage on mount
  useEffect(() => {
    const storageKey = `analytics-selected-${filterType}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed: SelectedItem[] = JSON.parse(stored)
        const map = new Map(parsed.map(item => [item.id, item]))
        setSelectedItemsMap(map)
        setSelectedItems(parsed.map(item => item.id))
      } catch (error) {
        console.error('Error loading selected items from localStorage:', error)
      }
    } else {
      setSelectedItemsMap(new Map())
      setSelectedItems([])
    }
  }, [filterType])

  // Save selected items to localStorage whenever they change
  useEffect(() => {
    const storageKey = `analytics-selected-${filterType}`
    const itemsArray = Array.from(selectedItemsMap.values())
    localStorage.setItem(storageKey, JSON.stringify(itemsArray))
  }, [selectedItemsMap, filterType])

  // Fetch AirQlouds from API
  useEffect(() => {
    const fetchAirqlouds = async () => {
      if (filterType === "airqlouds") {
        if (groupLoading || !activeGroup) return

        try {
          setIsLoadingAirqlouds(true)
          const normalizeAirqlouds = (response: any): AirQloudBasic[] => {
            if (Array.isArray(response)) return response
            return response.airqlouds || []
          }

          const fetchByTags = async (tags: string[]) => {
            return airQloudService.getAirQloudsBasic({
              search: searchTerm || undefined,
              tags: tags.length > 0 ? tags.join(",") : undefined,
              limit: 100,
              group: activeGroup,
            })
          }

          let effectiveTags = cohortTags
          let response = await fetchByTags(effectiveTags)
          let resolvedAirqlouds = normalizeAirqlouds(response)

          if (resolvedAirqlouds.length > 0 && effectiveTags.length === 1) {
            lastSuccessfulCohortTagRef.current = effectiveTags[0]
          }

          const canFallback = resolvedAirqlouds.length === 0 && !searchTerm.trim()
          if (canFallback) {
            const fallbackTags = [
              lastSuccessfulCohortTagRef.current,
              "hardware",
              "organizational",
              "duplicate",
              "inlab",
              "misc",
            ].filter((tag, index, arr) => Boolean(tag) && arr.indexOf(tag) === index && !effectiveTags.includes(tag))

            for (const fallbackTag of fallbackTags) {
              const fallbackResponse = await fetchByTags([fallbackTag])
              const fallbackAirqlouds = normalizeAirqlouds(fallbackResponse)
              if (fallbackAirqlouds.length > 0) {
                resolvedAirqlouds = fallbackAirqlouds
                effectiveTags = [fallbackTag]
                lastSuccessfulCohortTagRef.current = fallbackTag
                setCohortTags([fallbackTag])
                break
              }
            }
          }

          setAirqlouds(resolvedAirqlouds)
        } catch (error) {
          console.error('Error fetching airqlouds:', error)
        } finally {
          setIsLoadingAirqlouds(false)
        }
      }
    }

    const timer = setTimeout(() => {
      fetchAirqlouds()
    }, 300)

    return () => clearTimeout(timer)
  }, [filterType, searchTerm, cohortTags, activeGroup, groupLoading])

  // Fetch Grids from API
  useEffect(() => {
    const fetchGrids = async () => {
      if (filterType === "grids") {
        if (groupLoading || !activeGroup) return

        try {
          setIsLoadingGrids(true)
          const response = await airQloudService.getGridsBasic({
            search: searchTerm || undefined,
            limit: 100,
            group: activeGroup,
          })

          setGrids((response as any).airqlouds || [])
        } catch (error) {
          console.error('Error fetching grids:', error)
        } finally {
          setIsLoadingGrids(false)
        }
      }
    }

    const timer = setTimeout(() => {
      fetchGrids()
    }, 300)

    return () => clearTimeout(timer)
  }, [filterType, searchTerm, activeGroup, groupLoading])

  // Fetch Devices from API
  useEffect(() => {
    const fetchDevices = async () => {
      if (filterType === "devices") {
        if (groupLoading || !activeGroup) return

        try {
          setIsLoadingDevices(true)
          const response = await deviceApiService.getDevicesPaginated({
            network: activeGroup,
            search: searchTerm || undefined,
            limit: 100,
            group: activeGroup,
          })
          setDevices(response.devices)
        } catch (error) {
          console.error('Error fetching devices:', error)
        } finally {
          setIsLoadingDevices(false)
        }
      }
    }

    const timer = setTimeout(() => {
      fetchDevices()
    }, 300)

    return () => clearTimeout(timer)
  }, [filterType, searchTerm, activeGroup, groupLoading])

  let currentItems: Array<{ id: string; name: string }>
  if (filterType === "airqlouds") {
    currentItems = airqlouds.map((aq: AirQloudBasic) => ({ id: aq.id, name: aq.name || '' }))
  } else if (filterType === "grids") {
    currentItems = grids.map((grid: AirQloudBasic) => ({ id: grid.id, name: grid.name || '' }))
  } else {
    currentItems = devices.map((d: Device) => ({ id: d.name || d.device_name || '', name: d.name || d.device_name || '' }))
  }

  const filterTypeLabel = filterType === "airqlouds" ? "Cohorts" : filterType === "grids" ? "Grids" : "Devices"
  const isLoadingItems = (isLoadingAirqlouds && filterType === "airqlouds") || (isLoadingGrids && filterType === "grids") || (isLoadingDevices && filterType === "devices")

  const handleFilterTypeChange = (value: AnalyticsFilterType) => {
    setFilterType(value)
    setSearchTerm("")
    // selectedItems and selectedItemsMap will be loaded from localStorage via useEffect
    notifyFilterChange(value, [], dateRange, timeRange, includeTime)
  }

  const handleItemSelect = (itemId: string, itemName: string) => {
    let newMap = new Map(selectedItemsMap)
    let newSelection: string[]

    if (selectedItems.includes(itemId)) {
      // Remove item
      newMap.delete(itemId)
      newSelection = selectedItems.filter(id => id !== itemId)
    } else {
      // Add item
      newMap.set(itemId, { id: itemId, name: itemName })
      newSelection = [...selectedItems, itemId]
    }

    setSelectedItemsMap(newMap)
    setSelectedItems(newSelection)
    notifyFilterChange(filterType, newSelection, dateRange, timeRange, includeTime)
  }

  const handleDateRangeChange = (newDateRange: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(newDateRange)
    notifyFilterChange(filterType, selectedItems, newDateRange, timeRange, includeTime)
  }

  const handleTimeRangeChange = (type: "from" | "to", value: string) => {
    const newTimeRange = { ...timeRange, [type]: value }
    setTimeRange(newTimeRange)
    notifyFilterChange(filterType, selectedItems, dateRange, newTimeRange, includeTime)
  }

  const handleIncludeTimeChange = (checked: boolean) => {
    setIncludeTime(checked)
    notifyFilterChange(filterType, selectedItems, dateRange, timeRange, checked)
  }

  const notifyFilterChange = (
    type: AnalyticsFilterType,
    items: string[],
    range: { from: Date | undefined; to: Date | undefined },
    time: { from: string; to: string },
    includeTimeValue: boolean
  ) => {
    if (onFilterChange) {
      onFilterChange({
        filterType: type,
        selectedItems: items,
        dateRange: range,
        timeRange: includeTimeValue ? time : undefined,
        includeTime: includeTimeValue,
      })
    }
  }

  const removeItem = (itemId: string) => {
    const newMap = new Map(selectedItemsMap)
    newMap.delete(itemId)
    const newSelection = selectedItems.filter(id => id !== itemId)

    setSelectedItemsMap(newMap)
    setSelectedItems(newSelection)
    notifyFilterChange(filterType, newSelection, dateRange, timeRange, includeTime)
  }

  const toggleTag = (tag: string) => {
    setCohortTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // No need for client-side filtering since API handles search
  const filteredItems = currentItems

  // Helper to check if a date is today or in the future
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Analysis</CardTitle>
          <div className="flex items-center gap-2">
            <SyncToolbar {...syncActions} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: AirQlouds/Devices Selection */}
          <div className="space-y-4">
            {/* Filter Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter By</label>
              <Select value={filterType} onValueChange={handleFilterTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="airqlouds">Cohorts</SelectItem>
                  <SelectItem value="grids">Grids</SelectItem>
                  <SelectItem value="devices">Devices</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search and Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Select {filterTypeLabel}
                </label>
              </div>

              {/* Tag Filters for Cohorts */}
              {filterType === "airqlouds" && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={cohortTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${filterTypeLabel.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Items List */}
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {isLoadingItems ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map(item => {
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "p-2 cursor-pointer hover:bg-accent transition-colors",
                          selectedItems.includes(item.id || '') && "bg-accent"
                        )}
                        onClick={() => handleItemSelect(item.id || '', item.name || 'Unknown')}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id || '')}
                            onChange={() => { }}
                            className="cursor-pointer"
                          />
                          <span className="text-sm flex-1">
                            {item.name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No {filterTypeLabel.toLowerCase()} found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Date and Time Selection */}
          <div className="space-y-4">
            {/* Date Range Selection */}
            {!hideDateRange && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                {/* Date Range Picker - Half Width */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
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
                  <PopoverContent className="w-auto p-0" align="end">
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
                            onCheckedChange={handleIncludeTimeChange}
                          />
                          <Label htmlFor="includeTime" className="text-sm cursor-pointer">
                            Include Time
                          </Label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCalendarOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setIsCalendarOpen(false)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Quick Select Popover - Half Width */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
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
              </div>
            </div>
            )}

            {/* Selected Items Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selected {filterTypeLabel} ({selectedItems.length})
              </label>
              <div className="border rounded-md p-3 min-h-[100px] max-h-[150px] overflow-y-auto">
                {selectedItems.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.map(itemId => {
                      const item = selectedItemsMap.get(itemId)
                      return item ? (
                        <Badge key={itemId} variant="secondary" className="cursor-pointer">
                          {item.name}
                          <button
                            onClick={() => removeItem(itemId)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No {filterTypeLabel.toLowerCase()} selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button
          className="w-full mt-6"
          onClick={() => onAnalyse?.({
            filterType,
            selectedItems,
            dateRange,
            timeRange: includeTime ? timeRange : undefined,
            includeTime,
          })}
          disabled={isAnalysing || selectedItems.length === 0}
        >
          {isAnalysing ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Analysing...
            </>
          ) : (
            'Analyse'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
