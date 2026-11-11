"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useGroup } from "@/lib/group-context"
import { trackEvent } from "@/lib/analytics"
import AnalyticsFilters, {
  FILTER_ITEM_LABELS,
  FilterState,
  fetchFilteredPerformance,
  getFilterDateWindow,
} from "@/app/dashboard/analytics/analytics-filters"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, RefreshCw } from "lucide-react"
import { DeviceHealthReport, type ReportMapState } from "@/components/reports/device-health-report"
import { buildDeviceReport, type DeviceReport } from "@/lib/reports/device-report"
import type { ReportSections } from "@/lib/reports/device-report-pdf"
import { loadReportLogo, renderDeviceMap } from "@/lib/reports/report-images"

const SECTION_OPTIONS: Array<{ key: keyof ReportSections; label: string; requires?: keyof ReportSections }> = [
  { key: "map", label: "Device map" },
  { key: "mapHeatmap", label: "Uptime heatmap on the map", requires: "map" },
  { key: "dailyUptime", label: "Daily uptime and calendar" },
  { key: "patterns", label: "Hourly and device heatmaps" },
  { key: "dataReceived", label: "Readings received" },
  { key: "sensorHealth", label: "Sensor health (error margin, correlation)" },
]

export default function ReportsPage() {
  const { toast } = useToast()
  const { activeGroup, loading: groupLoading } = useGroup()
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [report, setReport] = useState<DeviceReport | null>(null)
  const [map, setMap] = useState<ReportMapState>({ status: "loading", image: null })
  const [sections, setSections] = useState<ReportSections>({
    map: true,
    mapHeatmap: false,
    dailyUptime: true,
    patterns: true,
    dataReceived: true,
    sensorHealth: true,
  })
  const latestPreview = useRef(0)

  // A report belongs to the organisation it was run for, so neither it nor one still loading outlives a switch
  useEffect(() => {
    latestPreview.current += 1
    setReport(null)
    setIsAnalysing(false)
  }, [activeGroup])

  useEffect(() => {
    if (!report || !sections.map) return
    let isCurrent = true
    setMap({ status: "loading", image: null })
    renderDeviceMap(report.devices, sections.mapHeatmap)
      .catch((error) => {
        console.error("Could not draw the report map:", error)
        return null
      })
      .then((image) => {
        if (isCurrent) setMap(image ? { status: "ready", image } : { status: "unavailable", image: null })
      })
    return () => {
      isCurrent = false
    }
  }, [report, sections.map, sections.mapHeatmap])

  const handlePreview = async (filterState: FilterState) => {
    if (groupLoading || !activeGroup) {
      toast({
        title: "Organisation Required",
        description: "Please wait for your active organisation to load.",
        variant: "destructive",
      })
      return
    }

    if (!filterState.dateRange.from || !filterState.dateRange.to) {
      toast({
        title: "Date Range Required",
        description: "Please select a date range.",
        variant: "destructive",
      })
      return
    }

    if (filterState.selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: `Please select at least one ${FILTER_ITEM_LABELS[filterState.filterType]}.`,
        variant: "destructive",
      })
      return
    }

    const previewId = ++latestPreview.current
    setIsAnalysing(true)
    setReport(null)

    try {
      const { startDate, endDate } = getFilterDateWindow(filterState)
      const response = await fetchFilteredPerformance(filterState, startDate.toISOString(), endDate.toISOString(), activeGroup)
      if (previewId !== latestPreview.current) return
      const isDevices = filterState.filterType === "devices"
      const results: any[] = Array.isArray(response) ? response : (response as any)?.data || []

      setReport(
        buildDeviceReport({
          entities: isDevices ? [{ devices: results }] : results,
          itemLabel: FILTER_ITEM_LABELS[filterState.filterType],
          itemNames: isDevices ? filterState.selectedItems : results.map((cluster) => cluster.name),
          organisation: activeGroup,
          from: startDate,
          to: endDate,
          generatedAt: new Date(),
        })
      )

      trackEvent("report_generated", {
        item_type: filterState.filterType,
        item_count: filterState.selectedItems.length,
        result_count: results.length,
        days: Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000)),
      })
      toast({
        title: "Preview Loaded",
        description: "Data has been loaded into the preview section.",
      })
    } catch (error) {
      if (previewId !== latestPreview.current) return
      trackEvent("report_failed", {
        item_type: filterState.filterType,
        item_count: filterState.selectedItems.length,
      })
      toast({
        title: "Failed to load data",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      if (previewId === latestPreview.current) setIsAnalysing(false)
    }
  }

  const exportPdf = async () => {
    if (!report) return
    setIsExporting(true)

    try {
      const [{ downloadDeviceReportPdf }, logo] = await Promise.all([
        import("@/lib/reports/device-report-pdf"),
        loadReportLogo().catch(() => null),
      ])
      downloadDeviceReportPdf(report, sections, { map: map.image, logo })
      trackEvent("report_exported", { format: "pdf", sections, has_map: Boolean(map.image) })
      toast(
        sections.map && !map.image
          ? {
              title: "PDF saved without the map",
              description: "The map couldn't be drawn for these devices, so the rest of the report was exported.",
            }
          : { title: "Success", description: "PDF generated successfully." }
      )
    } catch (err) {
      console.error(err)
      toast({ title: "Export Failed", description: "An error occurred during PDF generation.", variant: "destructive" })
    } finally {
      setIsExporting(false)
    }
  }

  const downloadSectionImage = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId)
    if (!element) return

    try {
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      const link = document.createElement("a")
      link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      trackEvent("report_exported", { format: "png", section: elementId })

      toast({ title: "Success", description: "Image downloaded successfully." })
    } catch (err) {
      console.error(err)
      toast({ title: "Download Failed", description: "An error occurred while generating the image.", variant: "destructive" })
    }
  }

  const isMapPending = sections.map && map.status === "loading"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm">Generate device health reports from system components</p>
        </div>
        {report && report.devices.length > 0 && (
          <Button onClick={exportPdf} disabled={isExporting || isMapPending} className="gap-2">
            {isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isExporting ? "Exporting..." : isMapPending ? "Drawing the map..." : "Export to PDF"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsFilters onAnalyse={handlePreview} isAnalysing={isAnalysing} />
        </div>

        <div className="lg:col-span-1">
          <Card data-tour="report-components">
            <CardHeader>
              <CardTitle>Report Components</CardTitle>
              <CardDescription>Select sections to include in the report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {SECTION_OPTIONS.map(({ key, label, requires }) => {
                const isDisabled = requires ? !sections[requires] : false
                return (
                  <div key={key} className={`flex items-center space-x-2 ${requires ? "ml-6" : ""}`}>
                    <Checkbox
                      id={`report-section-${key}`}
                      checked={sections[key]}
                      disabled={isDisabled}
                      onCheckedChange={() => setSections((previous) => ({ ...previous, [key]: !previous[key] }))}
                    />
                    <Label
                      htmlFor={`report-section-${key}`}
                      className={isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    >
                      {label}
                    </Label>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {report && (
        <div className="mt-8 space-y-6">
          <h2 data-tour="report-preview" className="text-xl font-semibold border-b pb-2">
            Live Preview
          </h2>
          {report.devices.length > 0 ? (
            <DeviceHealthReport report={report} sections={sections} map={map} onSaveImage={downloadSectionImage} />
          ) : (
            <Card className="p-10 text-center text-sm text-muted-foreground">
              There are no devices to report on for this selection.
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
