"use client"

import React, { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Monitor,
  Layers,
  RotateCcw,
  Sliders,
} from "lucide-react"
import { format, subDays, subHours } from "date-fns"

export interface TimePeriodState {
  preset: "all" | "24h" | "7d" | "14d" | "30d" | "90d" | "custom"
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  selectedDevice: string // "all" or specific device_name
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
  const update = <K extends keyof TimePeriodState>(key: K, value: TimePeriodState[K]) => {
    onChange({ ...periodState, [key]: value })
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

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardContent className="p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Time Period Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
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
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
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

        {/* Right Side: Device Filter, Aggregation, & Column Mapper Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Device Filter (if multiple devices) */}
          {availableDevices.length > 1 && (
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              <Select
                value={periodState.selectedDevice}
                onValueChange={(val) => update("selectedDevice", val)}
              >
                <SelectTrigger className="h-7 text-xs w-36 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All Devices" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all" className="text-xs font-semibold">
                    All Devices ({availableDevices.length})
                  </SelectItem>
                  {availableDevices.map((dev) => (
                    <SelectItem key={dev} value={dev} className="text-xs">
                      <span className="truncate max-w-[180px]">{dev}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            className="h-7 text-xs gap-1.5 border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            Map Columns
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
