"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sliders,
  Calendar,
  Layers,
  Thermometer,
  Droplets,
  Battery,
  MapPin,
  Sparkles,
  Check,
  Hash,
  Activity,
} from "lucide-react"
import type { ColumnMapping } from "@/lib/visualise/column-mapper"
import type { ParsedDataset } from "@/lib/visualise/data-parser"
import { toast } from "sonner"

interface ColumnMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dataset: ParsedDataset
  mapping: ColumnMapping
  onSaveMapping: (newMapping: ColumnMapping) => void
}

export function ColumnMappingDialog({
  open,
  onOpenChange,
  dataset,
  mapping,
  onSaveMapping,
}: ColumnMappingDialogProps) {
  const [current, setCurrent] = useState<ColumnMapping>(mapping)

  useEffect(() => {
    setCurrent(mapping)
  }, [mapping, open])

  const columns = dataset.columns
  const profiles = dataset.columnProfiles

  const numericCols = columns.filter((c) => profiles[c]?.type === "number")
  const dateCols = columns.filter((c) => profiles[c]?.type === "date")
  const allCols = ["__none__", ...columns]

  const handleUpdate = (field: keyof ColumnMapping, value: any) => {
    setCurrent((prev) => ({
      ...prev,
      [field]: value === "__none__" ? undefined : value,
    }))
  }

  const handleToggleMulti = (field: "tempCols" | "humidityCols", colName: string) => {
    setCurrent((prev) => {
      const list = prev[field] || []
      const exists = list.includes(colName)
      return {
        ...prev,
        [field]: exists ? list.filter((c) => c !== colName) : [...list, colName],
      }
    })
  }

  const handleSave = () => {
    onSaveMapping(current)
    onOpenChange(false)
    toast.success("Column semantic mappings updated successfully.")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sliders className="w-5 h-5 text-blue-600" />
            Semantic Column Mapping Wizard
          </DialogTitle>
          <DialogDescription>
            Map your dataset&apos;s columns to standard AirQo sensor semantics (Sensors, Devices, Battery, Temperature, Humidity, Coordinates).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* Section 1: Core Identifiers */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Time & Device Identifiers
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-700 block mb-1">Timestamp / Date-Time Column</Label>
                <Select
                  value={current.timestampCol || "__none__"}
                  onValueChange={(val) => handleUpdate("timestampCol", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select timestamp column" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__none__" className="text-xs text-slate-400">None</SelectItem>
                    {columns.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c} {profiles[c]?.type === "date" && "📅"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-700 block mb-1">Device Name / Identifier Column</Label>
                <Select
                  value={current.deviceCol || "__none__"}
                  onValueChange={(val) => handleUpdate("deviceCol", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select device column" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__none__" className="text-xs text-slate-400">None (Single Device)</SelectItem>
                    {columns.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Particulate Matter Sensors */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Dual-Channel Particulate Matter Sensors (PM2.5 & PM10)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-700 block mb-1">Sensor 1 PM2.5 (µg/m³)</Label>
                <Select
                  value={current.s1Pm25Col || "__none__"}
                  onValueChange={(val) => handleUpdate("s1Pm25Col", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select S1 PM2.5" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__none__" className="text-xs text-slate-400">None</SelectItem>
                    {numericCols.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-700 block mb-1">Sensor 2 PM2.5 (µg/m³)</Label>
                <Select
                  value={current.s2Pm25Col || "__none__"}
                  onValueChange={(val) => handleUpdate("s2Pm25Col", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select S2 PM2.5" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__none__" className="text-xs text-slate-400">None</SelectItem>
                    {numericCols.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-700 block mb-1">Sensor 1 PM10 (µg/m³)</Label>
                <Select
                  value={current.s1Pm10Col || "__none__"}
                  onValueChange={(val) => handleUpdate("s1Pm10Col", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select S1 PM10" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__none__" className="text-xs text-slate-400">None</SelectItem>
                    {numericCols.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-700 block mb-1">Sensor 2 PM10 (µg/m³)</Label>
                <Select
                  value={current.s2Pm10Col || "__none__"}
                  onValueChange={(val) => handleUpdate("s2Pm10Col", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select S2 PM10" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__none__" className="text-xs text-slate-400">None</SelectItem>
                    {numericCols.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 3: Environmental Telemetry (Multi-Temp & Multi-Humidity) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-600" />
              Environmental Telemetry (Multi-Temperature & Multi-Humidity)
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-slate-700">
                    Temperature Columns (Select all that apply)
                  </Label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {current.tempCols.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-lg max-h-28 overflow-y-auto">
                  {columns.map((col) => {
                    const isSelected = current.tempCols.includes(col)
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => handleToggleMulti("tempCols", col)}
                        className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-all ${
                          isSelected
                            ? "bg-amber-600 text-white font-medium shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <Thermometer className="w-3 h-3" />
                        <span className="truncate max-w-[170px]">{col}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-slate-700">
                    Humidity Columns (Select all that apply)
                  </Label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {current.humidityCols.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-lg max-h-28 overflow-y-auto">
                  {columns.map((col) => {
                    const isSelected = current.humidityCols.includes(col)
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => handleToggleMulti("humidityCols", col)}
                        className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white font-medium shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <Droplets className="w-3 h-3" />
                        <span className="truncate max-w-[170px]">{col}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Power & Geospatial Coordinates */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              Power & Geospatial Coordinates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-slate-700 block mb-1">Battery Voltage (V)</Label>
                <Select
                  value={current.batteryCol || "__none__"}
                  onValueChange={(val) => handleUpdate("batteryCol", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select battery" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__none__" className="text-xs text-slate-400">None</SelectItem>
                    {numericCols.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-700 block mb-1">Latitude</Label>
                <Select
                  value={current.latitudeCol || "__none__"}
                  onValueChange={(val) => handleUpdate("latitudeCol", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select latitude" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__none__" className="text-xs text-slate-400">None</SelectItem>
                    {numericCols.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-700 block mb-1">Longitude</Label>
                <Select
                  value={current.longitudeCol || "__none__"}
                  onValueChange={(val) => handleUpdate("longitudeCol", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Select longitude" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__none__" className="text-xs text-slate-400">None</SelectItem>
                    {numericCols.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <Check className="w-4 h-4" />
            Apply Semantic Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
