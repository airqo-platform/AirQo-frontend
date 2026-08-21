"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  BarChart3,
  AreaChart as AreaChartIcon,
  PieChart as PieChartIcon,
  ScatterChart as ScatterChartIcon,
  SlidersHorizontal,
  Plus,
  Trash2,
  Filter,
  Palette,
  Eye,
  Hash,
  Calendar,
  Layers,
  BarChart2,
  Zap,
  Clock,
} from "lucide-react"
import type {
  ParsedDataset,
  AggregationType,
  FilterCondition,
  FilterOperator,
} from "@/lib/visualise/data-parser"

export type ChartType = "line" | "area" | "bar" | "scatter" | "pie" | "histogram"

export interface ChartConfigState {
  chartType: ChartType
  title: string
  subtitle: string
  xColumn: string
  yColumns: string[]
  groupByColumn?: string
  aggregation: AggregationType
  colorPalette: string
  showGrid: boolean
  showLegend: boolean
  showTooltip: boolean
  showDots: boolean
  smoothCurve: boolean
  histogramBins: number
  filters: FilterCondition[]
}

export const COLOR_PALETTES: Record<string, { name: string; colors: string[] }> = {
  airqo: {
    name: "AirQo Palette",
    colors: ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"],
  },
  airquality: {
    name: "AQI Standards",
    colors: ["#45ae03", "#e5cc16", "#ff9800", "#d32f2f", "#8e24aa", "#5d4037"],
  },
  ocean: {
    name: "Ocean Breeze",
    colors: ["#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#0369a1"],
  },
  sunset: {
    name: "Sunset Vibrant",
    colors: ["#f43f5e", "#fb7185", "#fb923c", "#facc15", "#a855f7", "#ec4899"],
  },
  emerald: {
    name: "Emerald Forest",
    colors: ["#059669", "#10b981", "#34d399", "#6ee7b7", "#047857", "#065f46"],
  },
}

interface ChartControlsProps {
  dataset: ParsedDataset
  config: ChartConfigState
  onChange: (newConfig: ChartConfigState) => void
}

export function ChartControls({ dataset, config, onChange }: ChartControlsProps) {
  const columns = dataset.columns
  const profiles = dataset.columnProfiles

  const numericCols = columns.filter((c) => profiles[c]?.type === "number")
  const dateCols = columns.filter((c) => profiles[c]?.type === "date")
  const categoryCols = columns.filter((c) => profiles[c]?.type === "category" || profiles[c]?.type === "boolean")

  // Update single field
  const update = <K extends keyof ChartConfigState>(key: K, value: ChartConfigState[K]) => {
    onChange({ ...config, [key]: value })
  }

  // Toggle multi-select Y-column
  const handleToggleYColumn = (col: string) => {
    const isSelected = config.yColumns.includes(col)
    if (isSelected) {
      if (config.yColumns.length > 1) {
        update(
          "yColumns",
          config.yColumns.filter((c) => c !== col)
        )
      }
    } else {
      update("yColumns", [...config.yColumns, col])
    }
  }

  // Filter operations
  const handleAddFilter = () => {
    const newFilter: FilterCondition = {
      id: `filter_${Date.now()}`,
      column: columns[0] || "",
      operator: "eq",
      value: "",
    }
    update("filters", [...config.filters, newFilter])
  }

  const handleUpdateFilter = (id: string, field: keyof FilterCondition, val: any) => {
    const updated = config.filters.map((f) => (f.id === id ? { ...f, [field]: val } : f))
    update("filters", updated)
  }

  const handleRemoveFilter = (id: string) => {
    update(
      "filters",
      config.filters.filter((f) => f.id !== id)
    )
  }

  const getColumnIcon = (col: string) => {
    const type = profiles[col]?.type
    if (type === "number") return <Hash className="w-3 h-3 text-blue-500 mr-1.5" />
    if (type === "date") return <Calendar className="w-3 h-3 text-amber-500 mr-1.5" />
    return <Layers className="w-3 h-3 text-purple-500 mr-1.5" />
  }

  // AirQo Quick Preset Views
  const s1pm25 = columns.find((c) => /sensor1.*pm2\.?5/i.test(c))
  const s2pm25 = columns.find((c) => /sensor2.*pm2\.?5/i.test(c))
  const dateCol = dateCols[0] || columns.find((c) => /created|time|date/i.test(c))
  const batteryCol = columns.find((c) => /battery/i.test(c))
  const errorMarginCol = columns.find((c) => /error.*margin/i.test(c))

  return (
    <div className="space-y-5">
      {/* Quick Presets for AirQo Data */}
      {(s1pm25 && s2pm25) && (
        <Card className="border-blue-200 bg-blue-50/50 shadow-xs">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs uppercase font-semibold text-blue-800 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              AirQo Quick Analysis Presets
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex flex-wrap gap-1.5">
            {s1pm25 && s2pm25 && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...config,
                    chartType: "scatter",
                    title: "Sensor 1 vs Sensor 2 PM2.5 Correlation",
                    xColumn: s1pm25,
                    yColumns: [s2pm25],
                    aggregation: "none",
                  })
                }
                className="px-2 py-1 rounded bg-white border border-blue-200 text-[11px] font-medium text-blue-700 hover:bg-blue-100/70 transition-colors"
              >
                🔬 Sensor 1 vs Sensor 2 (R²)
              </button>
            )}

            {dateCol && s1pm25 && s2pm25 && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...config,
                    chartType: "line",
                    title: "Dual Sensor PM2.5 Time Series",
                    xColumn: dateCol,
                    yColumns: [s1pm25, s2pm25],
                    aggregation: dataset.rawRowCount > 5000 ? "hourly" : "none",
                  })
                }
                className="px-2 py-1 rounded bg-white border border-blue-200 text-[11px] font-medium text-blue-700 hover:bg-blue-100/70 transition-colors"
              >
                📈 S1 & S2 Time Series
              </button>
            )}

            {errorMarginCol && dateCol && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...config,
                    chartType: "area",
                    title: "Sensor Error Margin over Time",
                    xColumn: dateCol,
                    yColumns: [errorMarginCol],
                    aggregation: dataset.rawRowCount > 5000 ? "hourly" : "none",
                  })
                }
                className="px-2 py-1 rounded bg-white border border-blue-200 text-[11px] font-medium text-blue-700 hover:bg-blue-100/70 transition-colors"
              >
                ⚡ Error Margin Trend
              </button>
            )}

            {batteryCol && dateCol && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...config,
                    chartType: "line",
                    title: "Battery Voltage Monitor",
                    xColumn: dateCol,
                    yColumns: [batteryCol],
                    aggregation: "none",
                  })
                }
                className="px-2 py-1 rounded bg-white border border-blue-200 text-[11px] font-medium text-blue-700 hover:bg-blue-100/70 transition-colors"
              >
                🔋 Battery Voltage
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 1. Chart Type Selector */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-xs uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            Chart Type
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => update("chartType", "line")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                config.chartType === "line"
                  ? "border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <TrendingUp className="w-4 h-4 mb-1 text-blue-600" />
              Line
            </button>

            <button
              type="button"
              onClick={() => update("chartType", "area")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                config.chartType === "area"
                  ? "border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AreaChartIcon className="w-4 h-4 mb-1 text-indigo-600" />
              Area
            </button>

            <button
              type="button"
              onClick={() => update("chartType", "bar")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                config.chartType === "bar"
                  ? "border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <BarChart3 className="w-4 h-4 mb-1 text-emerald-600" />
              Bar
            </button>

            <button
              type="button"
              onClick={() => update("chartType", "scatter")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                config.chartType === "scatter"
                  ? "border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ScatterChartIcon className="w-4 h-4 mb-1 text-amber-600" />
              Scatter (R²)
            </button>

            <button
              type="button"
              onClick={() => update("chartType", "pie")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                config.chartType === "pie"
                  ? "border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <PieChartIcon className="w-4 h-4 mb-1 text-pink-600" />
              Pie
            </button>

            <button
              type="button"
              onClick={() => update("chartType", "histogram")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                config.chartType === "histogram"
                  ? "border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <BarChart2 className="w-4 h-4 mb-1 text-teal-600" />
              Histogram
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Axes & Mapping Configuration */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
            Dimensions & Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3.5">
          {/* X-Axis */}
          {config.chartType !== "histogram" && (
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                {config.chartType === "pie"
                  ? "Category Column (Slice Name)"
                  : config.chartType === "scatter"
                  ? "X-Axis Metric (Independent Variable)"
                  : "X-Axis (Dimension / Time)"}
              </label>
              <Select value={config.xColumn} onValueChange={(val) => update("xColumn", val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {(config.chartType === "scatter" ? numericCols : columns).map((col) => (
                    <SelectItem key={col} value={col} className="text-xs">
                      <div className="flex items-center">
                        {getColumnIcon(col)}
                        <span className="truncate max-w-[200px]">{col}</span>
                        <span className="ml-2 text-[10px] text-slate-400 font-mono">
                          ({profiles[col]?.type})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Y-Axis Metric(s) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                {config.chartType === "histogram"
                  ? "Numeric Metric (Distribution Target)"
                  : config.chartType === "pie"
                  ? "Value Metric (Slice Size)"
                  : config.chartType === "scatter"
                  ? "Y-Axis Metric (Dependent Variable)"
                  : "Y-Axis (Metrics to Plot)"}
              </label>
              {(config.chartType === "line" || config.chartType === "area" || config.chartType === "bar") && (
                <span className="text-[10px] text-slate-400 font-medium">Multi-select enabled</span>
              )}
            </div>

            {config.chartType === "line" || config.chartType === "area" || config.chartType === "bar" ? (
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                {numericCols.map((col) => {
                  const isSelected = config.yColumns.includes(col)
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => handleToggleYColumn(col)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Hash className="w-3 h-3" />
                      <span className="truncate max-w-[180px]">{col}</span>
                    </button>
                  )
                })}
                {numericCols.length === 0 && (
                  <p className="text-xs text-slate-400 p-1">No numeric columns detected.</p>
                )}
              </div>
            ) : (
              <Select
                value={config.yColumns[0] || ""}
                onValueChange={(val) => update("yColumns", [val])}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select numeric metric" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {numericCols.map((col) => (
                    <SelectItem key={col} value={col} className="text-xs">
                      <div className="flex items-center">
                        <Hash className="w-3 h-3 text-blue-500 mr-1.5" />
                        <span className="truncate max-w-[200px]">{col}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Group By (Optional) */}
          {config.chartType !== "pie" && config.chartType !== "histogram" && config.chartType !== "scatter" && (
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Segment / Group By (e.g. device_name)
              </label>
              <Select
                value={config.groupByColumn || "none"}
                onValueChange={(val) => update("groupByColumn", val === "none" ? undefined : val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="none" className="text-xs font-medium text-slate-500">
                    None (Single Series)
                  </SelectItem>
                  {categoryCols.map((col) => (
                    <SelectItem key={col} value={col} className="text-xs">
                      <div className="flex items-center">
                        <Layers className="w-3 h-3 text-purple-500 mr-1.5" />
                        <span className="truncate max-w-[200px]">{col}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Aggregation Function */}
          {config.chartType !== "scatter" && config.chartType !== "histogram" && (
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Aggregation & Time Bucketing
              </label>
              <Select
                value={config.aggregation}
                onValueChange={(val) => update("aggregation", val as AggregationType)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    Raw Data (No Aggregation)
                  </SelectItem>
                  <SelectItem value="hourly" className="text-xs">
                    🕒 Hourly Average (Time Series)
                  </SelectItem>
                  <SelectItem value="daily" className="text-xs">
                    📅 Daily Average (Time Series)
                  </SelectItem>
                  <SelectItem value="avg" className="text-xs">
                    Average (Mean by Category)
                  </SelectItem>
                  <SelectItem value="sum" className="text-xs">
                    Sum (Total)
                  </SelectItem>
                  <SelectItem value="min" className="text-xs">
                    Minimum
                  </SelectItem>
                  <SelectItem value="max" className="text-xs">
                    Maximum
                  </SelectItem>
                  <SelectItem value="count" className="text-xs">
                    Count Records
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Histogram Bin Count */}
          {config.chartType === "histogram" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Histogram Bins</label>
                <span className="text-xs font-mono text-slate-500">{config.histogramBins} bins</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={config.histogramBins}
                onChange={(e) => update("histogramBins", Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Filters Manager */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xs uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Data Filters ({config.filters.length})
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddFilter}
            className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Filter
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          {config.filters.length === 0 ? (
            <p className="text-xs text-slate-400 py-1">No active filters. Showing all records.</p>
          ) : (
            config.filters.map((f) => (
              <div key={f.id} className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                {/* Column */}
                <Select
                  value={f.column}
                  onValueChange={(val) => handleUpdateFilter(f.id, "column", val)}
                >
                  <SelectTrigger className="h-7 text-[11px] w-28 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {columns.map((col) => (
                      <SelectItem key={col} value={col} className="text-xs">
                        <span className="truncate max-w-[150px]">{col}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Operator */}
                <Select
                  value={f.operator}
                  onValueChange={(val) => handleUpdateFilter(f.id, "operator", val as FilterOperator)}
                >
                  <SelectTrigger className="h-7 text-[11px] w-24 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eq" className="text-xs">Equals (=)</SelectItem>
                    <SelectItem value="neq" className="text-xs">Not Equals (≠)</SelectItem>
                    <SelectItem value="gt" className="text-xs">Greater ({">"})</SelectItem>
                    <SelectItem value="gte" className="text-xs">GTE (≥)</SelectItem>
                    <SelectItem value="lt" className="text-xs">Less ({"<"})</SelectItem>
                    <SelectItem value="lte" className="text-xs">LTE (≤)</SelectItem>
                    <SelectItem value="contains" className="text-xs">Contains</SelectItem>
                    <SelectItem value="not_null" className="text-xs">Not Empty</SelectItem>
                  </SelectContent>
                </Select>

                {/* Value */}
                {f.operator !== "not_null" && (
                  <Input
                    type="text"
                    value={f.value}
                    onChange={(e) => handleUpdateFilter(f.id, "value", e.target.value)}
                    placeholder="Value..."
                    className="h-7 text-[11px] flex-1 bg-white"
                  />
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFilter(f.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 4. Visual Styles & Toggles */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-xs uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            Appearance & Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3.5">
          {/* Color Palette */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">Color Palette</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(COLOR_PALETTES).map(([key, palette]) => {
                const isSelected = config.colorPalette === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update("colorPalette", key)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-700">{palette.name}</span>
                    <div className="flex items-center gap-1">
                      {palette.colors.slice(0, 5).map((color, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <Label htmlFor="toggle-grid" className="text-xs font-medium text-slate-700 cursor-pointer">
                Show Gridlines
              </Label>
              <Switch
                id="toggle-grid"
                checked={config.showGrid}
                onCheckedChange={(val) => update("showGrid", val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="toggle-legend" className="text-xs font-medium text-slate-700 cursor-pointer">
                Show Legend
              </Label>
              <Switch
                id="toggle-legend"
                checked={config.showLegend}
                onCheckedChange={(val) => update("showLegend", val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="toggle-dots" className="text-xs font-medium text-slate-700 cursor-pointer">
                Show Data Points
              </Label>
              <Switch
                id="toggle-dots"
                checked={config.showDots}
                onCheckedChange={(val) => update("showDots", val)}
              />
            </div>

            {(config.chartType === "line" || config.chartType === "area") && (
              <div className="flex items-center justify-between">
                <Label htmlFor="toggle-smooth" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Smooth Curves
                </Label>
                <Switch
                  id="toggle-smooth"
                  checked={config.smoothCurve}
                  onCheckedChange={(val) => update("smoothCurve", val)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
