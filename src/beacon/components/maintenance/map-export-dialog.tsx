"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Download,
  FileImage,
  FileText,
  Globe2,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  MapPin,
  Radio,
  Navigation,
  Info
} from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { MaintenanceMapItem } from "@/types/api.types"
import { LoRaWANGateway, GatewayCoverageStats } from "@/types/lorawan.types"
import { generateMapGeoJSON, computeGatewayCoverageStats } from "@/utils/lorawan-utils"
import { useToast } from "@/hooks/use-toast"

interface MapExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapElementId?: string
  devices: MaintenanceMapItem[]
  gateways: LoRaWANGateway[]
  routePath?: MaintenanceMapItem[]
  selectedCohort?: string
  selectedGrid?: string
  periodDays?: number
}

export function MapExportDialog({
  open,
  onOpenChange,
  mapElementId = "maintenance-map-container",
  devices,
  gateways,
  routePath,
  selectedCohort = "All Cohorts",
  selectedGrid = "All Grids",
  periodDays = 14,
}: MapExportDialogProps) {
  const { toast } = useToast()
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)
  const [includeGateways, setIncludeGateways] = useState(true)
  const [includeRoute, setIncludeRoute] = useState(true)
  const [imageResolution, setImageResolution] = useState<"standard" | "high">("high")

  const coverageStats: GatewayCoverageStats = computeGatewayCoverageStats(gateways, devices)

  // 1. EXPORT PNG IMAGE
  const handleExportImage = async (format: "png" | "jpeg") => {
    setExportingFormat(format)
    try {
      const element = document.getElementById(mapElementId)
      if (!element) {
        throw new Error("Map container element not found for export.")
      }

      toast({
        title: "Capturing Map...",
        description: "Rendering high-resolution map snapshot with overlays.",
      })

      const scale = imageResolution === "high" ? 2 : 1
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#f8fafc",
      })

      const mimeType = format === "png" ? "image/png" : "image/jpeg"
      const imageStr = canvas.toDataURL(mimeType, 0.95)
      const link = document.createElement("a")
      const timestamp = new Date().toISOString().slice(0, 10)
      link.download = `airqo-maintenance-map-${timestamp}.${format}`
      link.href = imageStr
      link.click()

      toast({
        title: "Map Image Exported",
        description: `Downloaded ${format.toUpperCase()} map image successfully.`,
      })
      onOpenChange(false)
    } catch (err: any) {
      console.error("Map image export failed:", err)
      toast({
        title: "Export Failed",
        description: err?.message || "Failed to render map image.",
        variant: "destructive",
      })
    } finally {
      setExportingFormat(null)
    }
  }

  // 2. EXPORT PDF REPORT
  const handleExportPDF = async () => {
    setExportingFormat("pdf")
    try {
      const element = document.getElementById(mapElementId)
      if (!element) {
        throw new Error("Map element not found.")
      }

      toast({
        title: "Generating PDF Report...",
        description: "Rendering map capture and summary metrics.",
      })

      // Capture map snapshot
      const canvas = await html2canvas(element, {
        scale: 1.8,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 12

      // Title & Header Bar
      pdf.setFillColor(15, 23, 42) // slate-900
      pdf.rect(0, 0, pageWidth, 18, "F")

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("AirQo Beacon — Maintenance & LoRaWAN Gateway Map Report", margin, 12)

      pdf.setFontSize(8)
      pdf.setFont("helvetica", "normal")
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      pdf.text(`Generated: ${dateStr} • Period: ${periodDays} Days`, pageWidth - margin - 55, 12)

      // Summary Pills
      pdf.setTextColor(30, 41, 59)
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "bold")
      pdf.text(`Cohort: ${selectedCohort}   |   Grid: ${selectedGrid}   |   Devices: ${devices.length}   |   LoRaWAN Gateways: ${gateways.length} (${coverageStats.coveragePercentage}% Covered)`, margin, 25)

      // Insert Map Image
      const mapWidth = pageWidth - margin * 2
      const mapHeight = 115
      pdf.addImage(imgData, "PNG", margin, 29, mapWidth, mapHeight)

      // Footer Summary Bar
      const startY = 29 + mapHeight + 5
      pdf.setFillColor(241, 245, 249) // slate-100
      pdf.rect(margin, startY, mapWidth, 24, "F")

      pdf.setFontSize(8)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(51, 65, 85)
      pdf.text("COVERAGE & MAINTENANCE SUMMARY", margin + 4, startY + 6)

      pdf.setFont("helvetica", "normal")
      pdf.text(`• Total Tracked Devices: ${devices.length}`, margin + 4, startY + 12)
      pdf.text(`• LoRaWAN Strong Zone (≤2km): ${coverageStats.strongCoverageCount}`, margin + 4, startY + 18)

      pdf.text(`• LoRaWAN Moderate Zone (2-5km): ${coverageStats.moderateCoverageCount}`, margin + 80, startY + 12)
      pdf.text(`• Signal Drop / Uncovered Devices: ${coverageStats.uncoveredDevices}`, margin + 80, startY + 18)

      if (routePath && routePath.length > 0) {
        pdf.text(`• Active Route Stops: ${routePath.length} devices`, margin + 170, startY + 12)
        pdf.text(`• Route Mode: Optimized Nearest Neighbor`, margin + 170, startY + 18)
      } else {
        pdf.text(`• Active Gateways Deployed: ${gateways.filter(g => g.enabled !== false).length}`, margin + 170, startY + 12)
        pdf.text(`• Terrain Factors: Urban (2-5km) / Rural (10km)`, margin + 170, startY + 18)
      }

      const timestamp = new Date().toISOString().slice(0, 10)
      pdf.save(`airqo-maintenance-report-${timestamp}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Maintenance map report PDF downloaded successfully.",
      })
      onOpenChange(false)
    } catch (err: any) {
      console.error("PDF export failed:", err)
      toast({
        title: "Export Failed",
        description: err?.message || "Failed to generate PDF.",
        variant: "destructive",
      })
    } finally {
      setExportingFormat(null)
    }
  }

  // 3. EXPORT GEOJSON
  const handleExportGeoJSON = () => {
    setExportingFormat("geojson")
    try {
      const activeGateways = includeGateways ? gateways : []
      const activeRoute = includeRoute ? routePath : undefined
      const geoJsonData = generateMapGeoJSON(devices, activeGateways, activeRoute)

      const jsonStr = JSON.stringify(geoJsonData, null, 2)
      const blob = new Blob([jsonStr], { type: "application/geo+json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const timestamp = new Date().toISOString().slice(0, 10)
      a.download = `airqo-maintenance-map-${timestamp}.geojson`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "GeoJSON Exported",
        description: `Exported ${devices.length} devices and ${gateways.length} gateways to GeoJSON.`,
      })
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: "Export Failed",
        description: err?.message || "Failed to generate GeoJSON.",
        variant: "destructive",
      })
    } finally {
      setExportingFormat(null)
    }
  }

  // 4. EXPORT CSV (ENRICHED WITH LORAWAN COVERAGE)
  const handleExportCSV = () => {
    setExportingFormat("csv")
    try {
      const escapeCSV = (val: any): string => {
        if (val === null || val === undefined) return '""'
        let str = String(val)
        if (/^[=+\-@]/.test(str)) str = `'${str}`
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      const headers = [
        "Device Name",
        "Device ID",
        "Latitude",
        "Longitude",
        "Uptime (%)",
        "Error Margin",
        "Last Active",
        "Cohorts",
        "Nearest LoRaWAN Gateway",
        "Distance to Closest Gateway (km)",
        "LoRaWAN Signal Quality",
        "Coverage Status",
        "Estimated RSSI (dBm)"
      ]

      const rows = devices.map((device) => {
        const rawUptime = Number(device.uptime)
        const uptimePct = Number.isFinite(rawUptime) ? (rawUptime <= 1 ? rawUptime * 100 : rawUptime) : 0
        const em = Number(device.error_margin)
        const errorMarginStr = Number.isFinite(em) ? em.toFixed(2) : "N/A"
        const cov = coverageStats.deviceCoverageMap[device.device_id]

        return [
          escapeCSV(device.device_name || ""),
          escapeCSV(device.device_id || ""),
          escapeCSV(device.latitude ?? ""),
          escapeCSV(device.longitude ?? ""),
          escapeCSV(uptimePct.toFixed(1)),
          escapeCSV(errorMarginStr),
          escapeCSV(device.last_active || "N/A"),
          escapeCSV((device.cohorts || []).join("; ")),
          escapeCSV(cov?.nearestGatewayName || "None"),
          escapeCSV(cov ? `${cov.distanceKm.toFixed(2)} km` : "N/A"),
          escapeCSV(cov ? cov.signalQuality.toUpperCase() : "NONE"),
          escapeCSV(cov && cov.signalQuality !== "none" ? "Inside Radius" : "Outside Radius (Blindspot)"),
          escapeCSV(cov ? `${cov.estimatedRssiDbm} dBm` : "N/A")
        ]
      })

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const timestamp = new Date().toISOString().slice(0, 10)
      a.download = `airqo-maintenance-devices-${timestamp}.csv`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "CSV Exported",
        description: `Exported ${devices.length} devices with LoRaWAN RF metrics.`,
      })
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: "Export Failed",
        description: err?.message || "Failed to generate CSV.",
        variant: "destructive",
      })
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white text-gray-900 shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-gray-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Export Maintenance Map
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Download the map visualization, LoRaWAN signal radius layers, and device metadata in multiple formats
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Format Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. High-Res PNG */}
            <Card
              onClick={() => !exportingFormat && handleExportImage("png")}
              className={`p-3.5 border hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between ${
                exportingFormat === "png" ? "border-blue-600 bg-blue-50/40" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <FileImage className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">PNG Image</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    High-resolution snapshot of map, markers, LoRaWAN concentric circles & legend
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                <Badge variant="outline" className="text-[10px] text-gray-500 bg-gray-50">
                  2x Retina Quality
                </Badge>
                <Button
                  size="sm"
                  disabled={!!exportingFormat}
                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {exportingFormat === "png" ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  Export PNG
                </Button>
              </div>
            </Card>

            {/* 2. PDF Document Report */}
            <Card
              onClick={() => !exportingFormat && handleExportPDF()}
              className={`p-3.5 border hover:border-red-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between ${
                exportingFormat === "pdf" ? "border-red-600 bg-red-50/40" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">PDF Report</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Landscape document with map capture, metadata, LoRaWAN metrics & route summary
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                <Badge variant="outline" className="text-[10px] text-gray-500 bg-gray-50">
                  A4 Landscape
                </Badge>
                <Button
                  size="sm"
                  disabled={!!exportingFormat}
                  className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  {exportingFormat === "pdf" ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  Export PDF
                </Button>
              </div>
            </Card>

            {/* 3. GeoJSON Format */}
            <Card
              onClick={() => !exportingFormat && handleExportGeoJSON()}
              className={`p-3.5 border hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between ${
                exportingFormat === "geojson" ? "border-emerald-600 bg-emerald-50/40" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">GeoJSON GIS Layer</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Standard GIS format compatible with QGIS, ArcGIS, Google Earth & Mapbox
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                <Badge variant="outline" className="text-[10px] text-gray-500 bg-gray-50">
                  Points & Polylines
                </Badge>
                <Button
                  size="sm"
                  disabled={!!exportingFormat}
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {exportingFormat === "geojson" ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  Export GeoJSON
                </Button>
              </div>
            </Card>

            {/* 4. CSV SpreadSheet */}
            <Card
              onClick={() => !exportingFormat && handleExportCSV()}
              className={`p-3.5 border hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between ${
                exportingFormat === "csv" ? "border-indigo-600 bg-indigo-50/40" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Enriched CSV</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tabular device data with nearest gateway distance, signal strength & RSSI
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                <Badge variant="outline" className="text-[10px] text-gray-500 bg-gray-50">
                  Excel / Sheets
                </Badge>
                <Button
                  size="sm"
                  disabled={!!exportingFormat}
                  className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {exportingFormat === "csv" ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  Export CSV
                </Button>
              </div>
            </Card>
          </div>

          {/* Export Options & Inclusions */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 text-xs">
            <span className="font-semibold text-gray-700 block">Export Inclusions:</span>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGateways}
                  onChange={(e) => setIncludeGateways(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include LoRaWAN Gateways & RF Radii</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRoute}
                  onChange={(e) => setIncludeRoute(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Active Maintenance Route</span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            Exports reflect currently active filters, polygon selections, and gateway settings.
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
