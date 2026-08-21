"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Table as TableIcon,
  UploadCloud,
  FileSpreadsheet,
  Activity,
  MapPin,
  Clock,
  Sliders,
  PieChart as PieChartIcon,
  Calculator,
} from "lucide-react"
import { DataUploader } from "@/components/visualise/data-uploader"
import type { ChartConfigState } from "@/components/visualise/chart-controls"
import { DataTablePreview } from "@/components/visualise/data-table-preview"
import { KpiSummary } from "@/components/visualise/kpi-summary"
import { ColumnMappingDialog } from "@/components/visualise/column-mapping-dialog"
import { DateRangeFilterBar, type TimePeriodState } from "@/components/visualise/date-range-filter-bar"

import { SensorTelemetryView } from "@/components/visualise/system-graphs/sensor-telemetry-view"
import { SensorHealthView } from "@/components/visualise/system-graphs/sensor-health-view"
import { HeatmapAnalyticsView } from "@/components/visualise/system-graphs/heatmap-analytics-view"
import { GeospatialMapView } from "@/components/visualise/system-graphs/geospatial-map-view"
import { CohortSummaryView } from "@/components/visualise/system-graphs/cohort-summary-view"

import type { ParsedDataset } from "@/lib/visualise/data-parser"
import {
  autoDetectColumnMapping,
  standardizeData,
  type ColumnMapping,
} from "@/lib/visualise/column-mapper"

export default function VisualisePage() {
  const [dataset, setDataset] = useState<ParsedDataset | null>(null)
  const [activeTab, setActiveTab] = useState("telemetry")
  const [showUploaderModal, setShowUploaderModal] = useState(false)
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false)

  // Column Semantic Mapping
  const [mapping, setMapping] = useState<ColumnMapping>({
    tempCols: [],
    humidityCols: [],
  })

  // Date and Device Filter State
  const [periodState, setPeriodState] = useState<TimePeriodState>({
    preset: "all",
    startTime: "00:00",
    endTime: "23:59",
    selectedDevice: "all",
    aggregation: "none",
  })

  // Custom Studio Chart Configuration State
  const [chartConfig, setChartConfig] = useState<ChartConfigState>({
    chartType: "line",
    title: "",
    subtitle: "",
    xColumn: "",
    yColumns: [],
    groupByColumn: undefined,
    aggregation: "none",
    colorPalette: "airqo",
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    showDots: true,
    smoothCurve: true,
    histogramBins: 10,
    filters: [],
  })

  // When a new dataset is loaded
  const handleDatasetLoaded = useCallback((newDataset: ParsedDataset) => {
    setDataset(newDataset)
    setShowUploaderModal(false)

    // 1. Auto-detect semantic column mapping
    const detected = autoDetectColumnMapping(newDataset.columns, newDataset.data.slice(0, 10))
    setMapping(detected)

    // 2. Configure defaults for custom studio
    const profiles = newDataset.columnProfiles
    const cols = newDataset.columns
    const dateCol = cols.find((c) => profiles[c]?.type === "date") || detected.timestampCol || cols[0]
    const numCols = cols.filter((c) => profiles[c]?.type === "number")
    const initialY = numCols.slice(0, 2)

    setChartConfig({
      chartType: "line",
      title: `${newDataset.name} Analysis`,
      subtitle: "",
      xColumn: dateCol,
      yColumns: initialY.length > 0 ? initialY : [cols[0]],
      groupByColumn: undefined,
      aggregation: "none",
      colorPalette: "airqo",
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      showDots: newDataset.data.length <= 100,
      smoothCurve: true,
      histogramBins: 10,
      filters: [],
    })

    setPeriodState((prev) => ({
      ...prev,
      preset: "all",
      startDate: undefined,
      endDate: undefined,
      selectedDevice: "all",
    }))
  }, [])

  // Standardize raw data with current column mapping
  const standardizedRecords = useMemo(() => {
    if (!dataset || dataset.data.length === 0) return []
    return standardizeData(dataset.data, mapping)
  }, [dataset, mapping])

  // Extract unique devices
  const availableDevices = useMemo(() => {
    const set = new Set<string>()
    standardizedRecords.forEach((r) => {
      if (r.deviceName && r.deviceName !== "Default Device") {
        set.add(r.deviceName)
      }
    })
    return Array.from(set)
  }, [standardizedRecords])

  // Min / Max dates
  const { minDateStr, maxDateStr } = useMemo(() => {
    const timestamps = standardizedRecords
      .map((r) => r.timestamp?.getTime())
      .filter((t): t is number => typeof t === "number" && !isNaN(t))
      .sort((a, b) => a - b)

    if (timestamps.length === 0) return {}
    return {
      minDateStr: new Date(timestamps[0]).toISOString().split("T")[0],
      maxDateStr: new Date(timestamps[timestamps.length - 1]).toISOString().split("T")[0],
    }
  }, [standardizedRecords])

  // Filter records by selected period & selected device (with time-of-day support)
  const filteredRecords = useMemo(() => {
    if (standardizedRecords.length === 0) return []

    const hasDateFilter = Boolean(periodState.startDate || periodState.endDate)
    const startTimeStr = periodState.startTime || "00:00"
    const endTimeStr = periodState.endTime || "23:59"

    let startTimestamp: number | null = null
    let endTimestamp: number | null = null

    if (periodState.startDate) {
      const parsed = new Date(`${periodState.startDate}T${startTimeStr}:00Z`).getTime()
      if (!isNaN(parsed)) startTimestamp = parsed
    }
    if (periodState.endDate) {
      const parsed = new Date(`${periodState.endDate}T${endTimeStr}:59Z`).getTime()
      if (!isNaN(parsed)) endTimestamp = parsed
    }

    return standardizedRecords.filter((r) => {
      // 1. Device filter
      if (periodState.selectedDevice !== "all" && r.deviceName !== periodState.selectedDevice) {
        return false
      }

      // 2. Date Range and Time-of-Day filter
      if (hasDateFilter) {
        if (!r.timestamp) return false
        const rTime = r.timestamp.getTime()

        if (startTimestamp !== null && rTime < startTimestamp) return false
        if (endTimestamp !== null && rTime > endTimestamp) return false
      }

      return true
    })
  }, [standardizedRecords, periodState])

  // Filtered raw records for table preview and export
  const filteredRawRecords = useMemo(() => {
    return filteredRecords.map((r) => r.raw)
  }, [filteredRecords])

  return (
    <div className="space-y-5 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visualise</h1>
              <p className="text-sm text-slate-500">
                Universal air quality data exploration, multi-sensor calibration, heatmaps, maps, and custom graphs
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {dataset && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMappingDialogOpen(true)}
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Sliders className="w-4 h-4 text-purple-600" />
                Map Columns
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUploaderModal(!showUploaderModal)}
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <UploadCloud className="w-4 h-4 text-blue-600" />
                {showUploaderModal ? "Hide Uploader" : "Upload New Dataset"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Clean Initial Upload State (if no dataset loaded) */}
      {!dataset && (
        <div className="py-4">
          <DataUploader
            onDatasetLoaded={handleDatasetLoaded}
          />
        </div>
      )}

      {/* Dataset Loaded View */}
      {dataset && (
        <div className="space-y-5">
          {/* Uploader Dropzone Toggle (when dataset is already loaded) */}
          {showUploaderModal && (
            <div className="transition-all animate-in fade-in duration-200">
              <DataUploader
                onDatasetLoaded={handleDatasetLoaded}
                currentDatasetName={dataset.name}
              />
            </div>
          )}

          {/* KPI Overview Summary */}
          <KpiSummary
            dataset={dataset}
            selectedYColumn={chartConfig.yColumns[0]}
            activeFilterCount={chartConfig.filters.length}
          />

          {/* Interactive Date & Device Filter Bar */}
          <DateRangeFilterBar
            periodState={periodState}
            onChange={setPeriodState}
            availableDevices={availableDevices}
            minDate={minDateStr}
            maxDate={maxDateStr}
            totalRecordsCount={standardizedRecords.length}
            filteredRecordsCount={filteredRecords.length}
            onOpenColumnMapper={() => setIsMappingDialogOpen(true)}
          />

          {/* Analysis Modes & System Graphs Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
              <TabsList className="bg-slate-100 p-1 flex-wrap h-auto">
                {/* 1. Telemetry Timeseries */}
                <TabsTrigger value="telemetry" className="gap-1.5 text-xs font-semibold">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Telemetry Timeseries
                </TabsTrigger>

                {/* 2. Sensor Health & Correlation */}
                <TabsTrigger value="health" className="gap-1.5 text-xs font-semibold">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  Sensor QA & Correlation
                </TabsTrigger>

                {/* 3. Reporting Heatmaps */}
                <TabsTrigger value="heatmaps" className="gap-1.5 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Uptime Heatmaps
                </TabsTrigger>

                {/* 4. Geospatial Map */}
                <TabsTrigger value="map" className="gap-1.5 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  Geospatial Map
                </TabsTrigger>

                {/* 5. Cohort & AQI Breakdown */}
                <TabsTrigger value="cohort" className="gap-1.5 text-xs font-semibold">
                  <PieChartIcon className="w-3.5 h-3.5 text-pink-600" />
                  Cohort & AQI Summary
                </TabsTrigger>

                {/* 6. Custom Studio (Commented out for now) */}
                {/* <TabsTrigger value="studio" className="gap-1.5 text-xs font-semibold">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                  Custom Studio
                </TabsTrigger> */}

                {/* 7. Data Table */}
                <TabsTrigger value="table" className="gap-1.5 text-xs font-semibold">
                  <TableIcon className="w-3.5 h-3.5 text-teal-600" />
                  Data Table & Export
                </TabsTrigger>
              </TabsList>

              <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700 truncate max-w-[160px]">{dataset.name}</span>
                <span>({filteredRecords.length.toLocaleString()} rows)</span>
              </div>
            </div>

            {/* TAB 1: Telemetry Timeseries */}
            <TabsContent value="telemetry" className="m-0">
              <SensorTelemetryView
                records={filteredRecords}
                aggregation={periodState.aggregation}
              />
            </TabsContent>

            {/* TAB 2: Sensor Health & Correlation */}
            <TabsContent value="health" className="m-0">
              <SensorHealthView records={filteredRecords} />
            </TabsContent>

            {/* TAB 3: Reporting Heatmaps */}
            <TabsContent value="heatmaps" className="m-0">
              <HeatmapAnalyticsView records={filteredRecords} />
            </TabsContent>

            {/* TAB 4: Geospatial Map */}
            <TabsContent value="map" className="m-0">
              <GeospatialMapView records={filteredRecords} />
            </TabsContent>

            {/* TAB 5: Cohort & AQI Summary */}
            <TabsContent value="cohort" className="m-0">
              <CohortSummaryView records={filteredRecords} />
            </TabsContent>

            {/* TAB 6: Custom Visualisation Studio (Commented out for now) */}
            {/* <TabsContent value="studio" className="m-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 xl:col-span-4">
                  <ChartControls
                    dataset={dataset}
                    config={chartConfig}
                    onChange={setChartConfig}
                  />
                </div>
                <div className="lg:col-span-8 xl:col-span-8 space-y-4">
                  <ChartCanvas
                    dataset={dataset}
                    config={chartConfig}
                    height={520}
                  />
                </div>
              </div>
            </TabsContent> */}

            {/* TAB 7: Data Table */}
            <TabsContent value="table" className="m-0">
              <DataTablePreview dataset={dataset} records={filteredRawRecords} />
            </TabsContent>
          </Tabs>

          {/* Semantic Column Mapping Wizard Dialog */}
          <ColumnMappingDialog
            open={isMappingDialogOpen}
            onOpenChange={setIsMappingDialogOpen}
            dataset={dataset}
            mapping={mapping}
            onSaveMapping={setMapping}
          />
        </div>
      )}
    </div>
  )
}
