"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar as CalendarIcon,
  Clock,
  Monitor,
  RotateCcw,
  Sliders,
  ChevronDown,
  Search,
  Check,
} from "lucide-react"
import { format, subDays, subHours } from "date-fns"

export interface TimePeriodState {
  preset: "all" | "24h" | "7d" | "14d" | "30d" | "90d" | "custom"
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  selectedDevices: string[] // [] or ["all"] or specific device names
  selectedDevice?: string // backward compatibility
  aggregation: "none" | "hourly" | "daily"
}

interface DateRangeFilterBarProps {
  periodState: TimePeriodState
  onChange: (newState: TimePeriodState) => void
  availableDevices: string[]
  minDate?: string
  maxDate?: string
  totalRecordsCount: number
  filteredRecordsCount: number
  onOpenColumnMapper: () => void
}

export function DateRangeFilterBar({
  periodState,
  onChange,
  availableDevices,
  minDate,
  maxDate,
  totalRecordsCount,
  filteredRecordsCount,
  onOpenColumnMapper,
}: DateRangeFilterBarProps) {
  const [deviceSearch, setDeviceSearch] = useState("")

  const update = <K extends keyof TimePeriodState>(key: K, value: TimePeriodState[K]) => {
    onChange({ ...periodState, [key]: value })
  }

  // Selected devices normalized
  const selectedDevices = useMemo(() => {
    if (periodState.selectedDevices && periodState.selectedDevices.length > 0) {
      return periodState.selectedDevices
    }
    if (periodState.selectedDevice && periodState.selectedDevice !== "all") {
      return [periodState.selectedDevice]
    }
    return []
  }, [periodState.selectedDevices, periodState.selectedDevice])

  const isAllSelected = selectedDevices.length === 0 || selectedDevices.includes("all") || selectedDevices.length === availableDevices.length

  const filteredDeviceList = useMemo(() => {
    if (!deviceSearch.trim()) return availableDevices
    const q = deviceSearch.toLowerCase()
    return availableDevices.filter((d) => d.toLowerCase().includes(q))
  }, [availableDevices, deviceSearch])

  const handleToggleDevice = (dev: string) => {
    let next: string[]
    if (isAllSelected) {
      // If previously all, selecting one unselects others
      next = [dev]
    } else if (selectedDevices.includes(dev)) {
      next = selectedDevices.filter((d) => d !== dev)
      if (next.length === 0) {
        next = [] // all
      }
    } else {
      next = [...selectedDevices, dev]
      if (next.length === availableDevices.length) {
        next = [] // all
      }
    }
    onChange({
      ...periodState,
      selectedDevices: next,
      selectedDevice: next.length === 1 ? next[0] : next.length === 0 ? "all" : "custom",
    })
  }

  const handleSelectAllDevices = () => {
    onChange({
      ...periodState,
      selectedDevices: [],
      selectedDevice: "all",
    })
  }

  const handleClearAllDevices = () => {
    if (availableDevices.length > 0) {
      onChange({
        ...periodState,
        selectedDevices: [availableDevices[0]],
        selectedDevice: availableDevices[0],
      })
    }
  }

  // Handle Preset Clicks
  const handlePresetSelect = (preset: TimePeriodState["preset"]) => {
    if (preset === "all") {
      onChange({
        ...periodState,
        preset: "all",
        startDate: undefined,
        endDate: undefined,
      })
      return
    }

    const referenceDate = maxDate ? new Date(maxDate) : new Date()
    let start: Date

    switch (preset) {
      case "24h":
        start = subHours(referenceDate, 24)
        break
      case "7d":
        start = subDays(referenceDate, 7)
        break
      case "14d":
        start = subDays(referenceDate, 14)
        break
      case "30d":
        start = subDays(referenceDate, 30)
        break
      case "90d":
        start = subDays(referenceDate, 90)
        break
      default:
        start = subDays(referenceDate, 7)
        break
    }

    onChange({
      ...periodState,
      preset,
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(referenceDate, "yyyy-MM-dd"),
    })
  }

  const pct = totalRecordsCount > 0
    ? ((filteredRecordsCount / totalRecordsCount) * 100).toFixed(0)
    : "100"

  const deviceButtonLabel = useMemo(() => {
    if (isAllSelected) return `All Devices (${availableDevices.length})`
    if (selectedDevices.length === 1) return selectedDevices[0]
    return `${selectedDevices.length} Devices Selected`
  }, [isAllSelected, selectedDevices, availableDevices.length])

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardContent className="p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Time Period Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
            Period:
          </span>

          {(["all", "24h", "7d", "14d", "30d", "90d"] as const).map((p) => {
            const isSelected = periodState.preset === p
            const labels = {
              all: "All Time",
              "24h": "Last 24h",
              "7d": "7 Days",
              "14d": "14 Days",
              "30d": "30 Days",
              "90d": "90 Days",
            }
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {labels[p]}
              </button>
            )
          })}

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-1 ml-1 text-xs">
            <Input
              type="date"
              value={periodState.startDate || ""}
              onChange={(e) => {
                onChange({
                  ...periodState,
                  preset: "custom",
                  startDate: e.target.value,
                })
              }}
              className="h-7 text-xs w-32 bg-slate-50 border-slate-200"
            />
            <span className="text-slate-400 text-xs">to</span>
            <Input
              type="date"
              value={periodState.endDate || ""}
              onChange={(e) => {
                onChange({
                  ...periodState,
                  preset: "custom",
                  endDate: e.target.value,
                })
              }}
              className="h-7 text-xs w-32 bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        {/* Right Side: Multi-Device Filter, Aggregation, & Column Mapper Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-Device Filter Popover */}
          {availableDevices.length > 1 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5 bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 max-w-[200px]"
                >
                  <Monitor className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{deviceButtonLabel}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0 ml-auto" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 text-xs" align="end">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold text-slate-800">Filter Devices</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSelectAllDevices}
                        className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                      >
                        All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearAllDevices}
                        className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {availableDevices.length > 5 && (
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                      <Input
                        placeholder="Search devices..."
                        value={deviceSearch}
                        onChange={(e) => setDeviceSearch(e.target.value)}
                        className="h-7 pl-6 text-xs bg-slate-50 border-slate-200"
                      />
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto space-y-1 py-1">
                    {filteredDeviceList.map((dev) => {
                      const checked = isAllSelected || selectedDevices.includes(dev)
                      return (
                        <label
                          key={dev}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs select-none"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => handleToggleDevice(dev)}
                          />
                          <span className="truncate flex-1 font-mono text-[11px]">{dev}</span>
                        </label>
                      )
                    })}
                    {filteredDeviceList.length === 0 && (
                      <p className="text-center text-slate-400 py-2 text-[11px]">No devices match</p>
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{isAllSelected ? "All devices active" : `${selectedDevices.length} of ${availableDevices.length} active`}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Time Bucketing Selector */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <Select
              value={periodState.aggregation}
              onValueChange={(val) => update("aggregation", val as any)}
            >
              <SelectTrigger className="h-7 text-xs w-28 bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">Raw Interval</SelectItem>
                <SelectItem value="hourly" className="text-xs">Hourly Avg</SelectItem>
                <SelectItem value="daily" className="text-xs">Daily Avg</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter count badge */}
          <Badge variant="outline" className="text-[11px] font-mono text-slate-600 bg-slate-50 h-7 px-2">
            {filteredRecordsCount.toLocaleString()} / {totalRecordsCount.toLocaleString()} ({pct}%)
          </Badge>

          {/* Open Column Mapping Wizard */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenColumnMapper}
            className="h-7 text-xs gap-1.5 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Sliders className="w-3.5 h-3.5 text-primary" />
            Map Columns
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
