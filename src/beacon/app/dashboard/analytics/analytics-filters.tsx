"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { airQloudService, type AirQloudBasic } from "@/services/airqloud.service"
import { deviceApiService } from "@/services/device-api.service"
import type { Device } from "@/types/api.types"

interface AnalyticsFiltersProps {
  onFilterChange?: (filters: FilterState) => void
}

export interface FilterState {
  filterType: "airqlouds" | "devices"
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

export default function AnalyticsFilters({ onFilterChange }: AnalyticsFiltersProps) {
  const [filterType, setFilterType] = useState<"airqlouds" | "devices">("airqlouds")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedItemsMap, setSelectedItemsMap] = useState<Map<string, SelectedItem>>(new Map())
  const [searchTerm, setSearchTerm] = useState("")
  const [includeTime, setIncludeTime] = useState(false)
  const [airqlouds, setAirqlouds] = useState<AirQloudBasic[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoadingAirqlouds, setIsLoadingAirqlouds] = useState(false)
  const [isLoadingDevices, setIsLoadingDevices] = useState(false)
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
    from: "12:00",
    to: "11:59",
  })

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
        try {
          setIsLoadingAirqlouds(true)
          const data = await airQloudService.getAirQloudsBasic({
            search: searchTerm || undefined,
            limit: 100,
          })
          setAirqlouds(data)
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
  }, [filterType, searchTerm])

  // Fetch Devices from API
  useEffect(() => {
    const fetchDevices = async () => {
      if (filterType === "devices") {
        try {
          setIsLoadingDevices(true)
          const response = await deviceApiService.getDevicesPaginated({
            network: "airqo",
            search: searchTerm || undefined,
            limit: 100,
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
  }, [filterType, searchTerm])

  const currentItems = filterType === "airqlouds" 
    ? airqlouds.map(aq => ({ id: aq.id, name: aq.name }))
    : devices.map(d => ({ id: d.device_id, name: d.device_name }))

  const handleFilterTypeChange = (value: "airqlouds" | "devices") => {
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
    type: "airqlouds" | "devices",
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

  // No need for client-side filtering since API handles search
  const filteredItems = currentItems

  return (
    <Card>
      <CardHeader>
        <CardTitle>Airqloud Uptime Analysis</CardTitle>
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
                  <SelectItem value="airqlouds">AirQlouds</SelectItem>
                  <SelectItem value="devices">Devices</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search and Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select {filterType === "airqlouds" ? "AirQlouds" : "Devices"}
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${filterType}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Items List */}
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {(isLoadingAirqlouds && filterType === "airqlouds") || (isLoadingDevices && filterType === "devices") ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-2 cursor-pointer hover:bg-accent transition-colors",
                        selectedItems.includes(item.id) && "bg-accent"
                      )}
                      onClick={() => handleItemSelect(item.id, item.name)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => {}}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No {filterType} found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Date and Time Selection */}
          <div className="space-y-4">
            {/* Date Range Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                {/* Date Range Picker - Half Width */}
                <Popover>
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
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                          <Button size="sm">
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

            {/* Selected Items Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selected {filterType === "airqlouds" ? "AirQlouds" : "Devices"} ({selectedItems.length})
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
                    No {filterType} selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button className="w-full mt-6">
          Analyse
        </Button>
      </CardContent>
    </Card>
  )
}
