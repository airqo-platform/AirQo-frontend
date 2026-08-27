"use client"

import React, { useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
} from "recharts"
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Image as ImageIcon,
  FileCode,
  BarChart3,
  Calculator,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react"
import html2canvas from "html2canvas"
import { toast } from "sonner"
import type { ParsedDataset } from "@/lib/visualise/data-parser"
import {
  aggregateDataset,
  applyFilters,
  generateHistogramData,
  calculateCorrelation,
} from "@/lib/visualise/data-parser"
import type { ChartConfigState } from "./chart-controls"
import { COLOR_PALETTES } from "./chart-controls"

interface ChartCanvasProps {
  dataset: ParsedDataset
  config: ChartConfigState
  height?: number
}

export function ChartCanvas({ dataset, config, height = 480 }: ChartCanvasProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const chartCardRef = useRef<HTMLDivElement>(null)

  const paletteColors = useMemo(() => {
    return COLOR_PALETTES[config.colorPalette]?.colors || COLOR_PALETTES.airqo.colors
  }, [config.colorPalette])

  // Filter & process dataset according to active configuration
  const processedData = useMemo(() => {
    if (!dataset || dataset.data.length === 0) return []

    // 1. Apply user filters
    const filtered = applyFilters(dataset.data, config.filters)
    if (filtered.length === 0) return []

    // 2. Handle Histogram
    if (config.chartType === "histogram") {
      const targetCol = config.yColumns[0] || config.xColumn
      return generateHistogramData(filtered, targetCol, config.histogramBins)
    }

    // 3. Handle Pie Chart
    if (config.chartType === "pie") {
      const catCol = config.xColumn
      const valCol = config.yColumns[0]

      const map = new Map<string, number>()
      for (const row of filtered) {
        const catKey = String(row[catCol] ?? "Unknown")
        const val = valCol && typeof row[valCol] === "number" ? row[valCol] : 1
        map.set(catKey, (map.get(catKey) || 0) + val)
      }

      return Array.from(map.entries()).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
      }))
    }

    // 4. Handle Scatter Plot
    if (config.chartType === "scatter") {
      return filtered.slice(0, 3000)
    }

    // 5. Line, Area, and Bar charts with multi-metric / aggregation
    return aggregateDataset({
      data: filtered,
      xColumn: config.xColumn,
      yColumns: config.yColumns,
      aggregation: config.aggregation,
      groupByColumn: config.groupByColumn,
    })
  }, [dataset, config])

  // Scatter Correlation Statistics (R², slope, intercept, MAE)
  const correlationStats = useMemo(() => {
    if (config.chartType !== "scatter" || !config.xColumn || !config.yColumns[0]) return null
    return calculateCorrelation(processedData, config.xColumn, config.yColumns[0])
  }, [config.chartType, config.xColumn, config.yColumns, processedData])

  // Format X-axis tick values for dates or long strings
  const formatXAxisTick = (val: any) => {
    if (val === null || val === undefined) return ""
    const str = String(val)

    if (dataset.columnProfiles[config.xColumn]?.type === "date") {
      try {
        const d = new Date(str)
        if (!isNaN(d.getTime())) {
          return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${d.toLocaleTimeString(
            undefined,
            { hour: "2-digit", minute: "2-digit", hour12: false }
          )}`
        }
      } catch (e) {
        // Fallback
      }
    }

    if (str.length > 14) return `${str.substring(0, 12)}…`
    return str
  }

  // Format Tooltip Header
  const formatTooltipLabel = (label: any) => {
    if (label === null || label === undefined) return ""
    if (dataset.columnProfiles[config.xColumn]?.type === "date") {
      const d = new Date(label)
      if (!isNaN(d.getTime())) {
        return d.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      }
    }
    return String(label)
  }

  // Export as PNG
  const handleExportPNG = async () => {
    if (!chartCardRef.current) return
    setIsExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(chartCardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      })
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `${(config.title || "airqo_visualisation").toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.png`
      link.href = dataUrl
      link.click()
      toast.success("Chart exported as high-resolution PNG image.")
    } catch (err) {
      toast.error("Failed to export chart image.")
    } finally {
      setIsExporting(false)
    }
  }

  // Export as SVG
  const handleExportSVG = () => {
    if (!chartCardRef.current) return
    try {
      const svgElement = chartCardRef.current.querySelector("svg")
      if (!svgElement) {
        toast.error("No SVG chart found to export.")
        return
      }

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `${(config.title || "airqo_visualisation").toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.svg`
      link.href = url
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success("Chart exported as SVG vector.")
    } catch (err) {
      toast.error("Failed to export SVG.")
    }
  }

  // Display Title
  const autoTitle = useMemo(() => {
    if (config.title) return config.title
    if (config.chartType === "histogram") {
      return `Distribution of ${config.yColumns[0] || config.xColumn}`
    }
    if (config.chartType === "pie") {
      return `${config.yColumns[0] || "Count"} by ${config.xColumn}`
    }
    return `${config.yColumns.join(", ")} vs ${config.xColumn}`
  }, [config.title, config.chartType, config.xColumn, config.yColumns])

  const autoSubtitle = useMemo(() => {
    if (config.subtitle) return config.subtitle
    const rowStr = `${processedData.length.toLocaleString()} plotted points`
    const aggStr = config.aggregation !== "none" ? ` • ${config.aggregation.toUpperCase()} aggregation` : ""
    const filterStr = config.filters.length > 0 ? ` • ${config.filters.length} filter(s) active` : ""
    const sampleStr = dataset.isSampled && dataset.totalFileRows ? ` (Sampled from ~${dataset.totalFileRows.toLocaleString()} rows)` : ""
    return `${rowStr}${aggStr}${filterStr}${sampleStr}`
  }, [config.subtitle, processedData.length, config.aggregation, config.filters.length, dataset.isSampled, dataset.totalFileRows])

  // If no data
  if (!dataset || processedData.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-700">No Data to Display</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            The current column selection or filter conditions returned 0 data points. Try clearing filters or selecting different columns.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={chartCardRef}
      className={`border-slate-200 shadow-sm bg-white transition-all ${
        isFullscreen ? "fixed inset-4 z-50 overflow-auto shadow-2xl p-4 bg-white" : ""
      }`}
    >
      {/* Canvas Header & Toolbar */}
      <CardHeader className="pb-3 pt-5 px-6 flex flex-row items-start justify-between border-b border-slate-100">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="truncate max-w-lg">{autoTitle}</span>
            {config.aggregation !== "none" && (
              <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold text-blue-600 bg-blue-50">
                {config.aggregation}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">{autoSubtitle}</CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Actions */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportPNG}
            disabled={isExporting}
            className="h-8 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5 text-primary" />}
            PNG
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportSVG}
            className="h-8 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-600" />
            SVG
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {/* Correlation / Sensor QA Statistics Banner for Scatter Charts */}
      {config.chartType === "scatter" && correlationStats && (
        <div className="bg-slate-50/80 px-6 py-2.5 border-b border-slate-100 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-700">
          <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            <span>Linear Fit:</span>
            <span>y = {correlationStats.slope}x {correlationStats.intercept >= 0 ? `+ ${correlationStats.intercept}` : `- ${Math.abs(correlationStats.intercept)}`}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">R² =</span>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold text-xs">
              {correlationStats.r2}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">Pearson r =</span>
            <span className="font-semibold text-slate-800">{correlationStats.r}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">Mean Abs Error =</span>
            <span className="font-semibold text-slate-800">{correlationStats.mae}</span>
          </div>

          <div className="text-[11px] text-slate-400 ml-auto">
            {correlationStats.count.toLocaleString()} valid pairs analyzed
          </div>
        </div>
      )}

      {/* Main Chart Canvas Area */}
      <CardContent className="p-4 pt-6">
        <div style={{ width: "100%", height: isFullscreen ? "75vh" : height }} className="min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            {/* 1. Line Chart */}
            {config.chartType === "line" ? (
              <LineChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
                <XAxis
                  dataKey={config.xColumn}
                  tickFormatter={formatXAxisTick}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  axisLine={{ stroke: "#cbd5e1" }}
                />
                {config.showTooltip && (
                  <Tooltip
                    labelFormatter={formatTooltipLabel}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                )}
                {config.showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
                {config.yColumns.map((col, idx) => {
                  const color = paletteColors[idx % paletteColors.length]
                  return (
                    <Line
                      key={col}
                      type={config.smoothCurve ? "monotone" : "linear"}
                      dataKey={col}
                      stroke={color}
                      strokeWidth={2.2}
                      dot={config.showDots && processedData.length <= 150 ? { r: 3, fill: color } : false}
                      activeDot={{ r: 5 }}
                      name={col}
                    />
                  )
                })}
                {processedData.length > 25 && (
                  <Brush dataKey={config.xColumn} height={24} stroke="#94a3b8" fill="#f8fafc" />
                )}
              </LineChart>
            ) : config.chartType === "area" ? (
              /* 2. Area Chart */
              <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                <defs>
                  {config.yColumns.map((col, idx) => {
                    const color = paletteColors[idx % paletteColors.length]
                    return (
                      <linearGradient key={`grad_ycol_${idx}`} id={`grad_ycol_${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                      </linearGradient>
                    )
                  })}
                </defs>
                {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
                <XAxis
                  dataKey={config.xColumn}
                  tickFormatter={formatXAxisTick}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  dy={8}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                {config.showTooltip && (
                  <Tooltip
                    labelFormatter={formatTooltipLabel}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                )}
                {config.showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
                {config.yColumns.map((col, idx) => {
                  const color = paletteColors[idx % paletteColors.length]
                  return (
                    <Area
                      key={col}
                      type={config.smoothCurve ? "monotone" : "linear"}
                      dataKey={col}
                      stroke={color}
                      fillOpacity={1}
                      fill={`url(#grad_ycol_${idx})`}
                      strokeWidth={2}
                      name={col}
                    />
                  )
                })}
                {processedData.length > 25 && (
                  <Brush dataKey={config.xColumn} height={24} stroke="#94a3b8" fill="#f8fafc" />
                )}
              </AreaChart>
            ) : config.chartType === "bar" ? (
              /* 3. Bar Chart */
              <BarChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
                <XAxis
                  dataKey={config.xColumn}
                  tickFormatter={formatXAxisTick}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  dy={8}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                {config.showTooltip && (
                  <Tooltip
                    labelFormatter={formatTooltipLabel}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                )}
                {config.showLegend && <Legend verticalAlign="top" height={36} iconType="square" />}
                {config.yColumns.map((col, idx) => {
                  const color = paletteColors[idx % paletteColors.length]
                  return (
                    <Bar
                      key={col}
                      dataKey={col}
                      fill={color}
                      radius={[4, 4, 0, 0]}
                      name={col}
                    />
                  )
                })}
              </BarChart>
            ) : config.chartType === "scatter" ? (
              /* 4. Scatter Plot (Correlation & R²) */
              <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
                <XAxis
                  type="number"
                  dataKey={config.xColumn}
                  name={config.xColumn}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  label={{ value: config.xColumn, position: "insideBottom", offset: -10, fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  type="number"
                  dataKey={config.yColumns[0]}
                  name={config.yColumns[0]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  label={{ value: config.yColumns[0], angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                />
                {config.showTooltip && (
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                )}
                <Scatter
                  name={`${config.yColumns[0]} vs ${config.xColumn}`}
                  data={processedData}
                  fill={paletteColors[0]}
                />
              </ScatterChart>
            ) : config.chartType === "pie" ? (
              /* 5. Pie / Donut Chart */
              <PieChart>
                {config.showTooltip && (
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                )}
                {config.showLegend && <Legend verticalAlign="bottom" height={36} iconType="circle" />}
                <Pie
                  data={processedData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  label={({ name, percent }: any) => `${name} (${(((percent ?? 0) as number) * 100).toFixed(0)}%)`}
                >
                  {processedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={paletteColors[index % paletteColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              /* 6. Histogram Distribution */
              <BarChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
                <XAxis
                  dataKey="bin"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} label={{ value: "Frequency / Count", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }} />
                {config.showTooltip && (
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                )}
                <Bar dataKey="count" fill={paletteColors[0]} radius={[4, 4, 0, 0]} name="Record Count" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
