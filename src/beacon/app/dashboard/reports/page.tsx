"use client"

import { useState, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { airQloudService } from "@/services/airqloud.service"
import { deviceApiService } from "@/services/device-api.service"
import { useGroup } from "@/lib/group-context"
import AnalyticsFilters, { FilterState } from "@/app/dashboard/analytics/analytics-filters"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, RefreshCw, Image as ImageIcon } from "lucide-react"
import { subDays } from "date-fns"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import dynamic from "next/dynamic"

// Import existing visualization components
import DevicePerformanceHeatmaps, { DeviceHourHeatmaps } from "@/components/analytics/device-heatmap"
import AirQloudPerformanceTab from "@/components/analytics/airqloud-performance-tab"

// Dynamically import Map component to avoid SSR issues with Leaflet
const MaintenanceMap = dynamic(() => import("@/components/maintenance/maintenance-map"), {
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Map...</div>,
  ssr: false
})

const getFilterLabel = (filterType: FilterState["filterType"]) => {
  if (filterType === "airqlouds") return "Cohort"
  if (filterType === "grids") return "Grid"
  return "Device"
}

const getDateWindow = (filterState: FilterState) => {
  const startDate = new Date(filterState.dateRange.from as Date)
  const endDate = new Date(filterState.dateRange.to as Date)

  if (filterState.includeTime && filterState.timeRange) {
    const [startHours, startMinutes] = filterState.timeRange.from.split(":")
    const [endHours, endMinutes] = filterState.timeRange.to.split(":")
    startDate.setHours(Number.parseInt(startHours), Number.parseInt(startMinutes), 0, 0)
    endDate.setHours(Number.parseInt(endHours), Number.parseInt(endMinutes), 59, 999)
  } else {
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
  }

  return { startDate, endDate }
}

const fetchAnalysisData = async (filterState: FilterState, start: string, end: string, group: string) => {
  if (filterState.filterType === "airqlouds") {
    return airQloudService.getAirQloudPerformance({
      start,
      end,
      ids: filterState.selectedItems,
      group,
    })
  }

  if (filterState.filterType === "grids") {
    return airQloudService.getGridPerformance({
      start,
      end,
      ids: filterState.selectedItems,
      admin_level: "city",
      group,
    })
  }

  return deviceApiService.getDevicePerformanceData({
    start,
    end,
    deviceNames: filterState.selectedItems,
    group,
  })
}

// Same processing logic from analytics/analysis/page.tsx
const processDevicePerformanceFlat = (device: any): any => {
  const data = device.data
  const rawData = device.raw_data
  const readings = Array.isArray(data) && data.length > 0 ? data : rawData

  if (readings && Array.isArray(readings)) {
    // Process nested
    const dailyData: any = {}
    const hourlyData: any = {}
    readings.forEach((d: any) => {
      const dt = new Date(d.datetime)
      const date = dt.toDateString()
      if (!dailyData[date]) dailyData[date] = { hoursSet: new Set(), errorMargins: [] }
      const hour = dt.getHours()
      dailyData[date].hoursSet.add(hour)
      const hourKey = `${date}|${hour}`
      if (!hourlyData[hourKey]) hourlyData[hourKey] = { date, hour, count: 0, errorMargins: [] }
      const recordCount = typeof d.record_count === "number" ? d.record_count : 1
      hourlyData[hourKey].count += recordCount
      
      let s1 = d.s1_pm2_5 ?? d["pm2.5 sensor1"] ?? d.pm2_5_sensor1 ?? d.pm2_5_s1 ?? d.pm2_5_s1_raw
      let s2 = d.s2_pm2_5 ?? d["pm2.5 sensor2"] ?? d.pm2_5_sensor2 ?? d.pm2_5_s2 ?? d.pm2_5_s2_raw
      
      if (s1 != null && s2 != null) {
        const em = Math.abs(s1 - s2)
        dailyData[date].errorMargins.push(em)
        hourlyData[hourKey].errorMargins.push(em)
      }
    })

    const dates: string[] = []
    const end = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(end)
      d.setDate(d.getDate() - i)
      dates.push(d.toDateString())
    }

    const uptimeHistory = dates.map(date => ({
      value: dailyData[date] ? Math.min(100, (Math.min(24, dailyData[date].hoursSet.size) / 24) * 100) : 0,
      timestamp: date
    }))
    const errorMarginHistory = dates.map(date => ({
      value: dailyData[date] && dailyData[date].errorMargins.length > 0
        ? dailyData[date].errorMargins.reduce((sum: number, em: number) => sum + em, 0) / dailyData[date].errorMargins.length
        : 0,
      timestamp: date
    }))

    let computedAvgUptime = typeof device.uptime === "number" ? (device.uptime >= 0 && device.uptime <= 1 ? device.uptime * 100 : device.uptime) : 0
    if (!computedAvgUptime && uptimeHistory.length > 0) {
      computedAvgUptime = uptimeHistory.reduce((sum, d) => sum + d.value, 0) / uptimeHistory.length
    }
    const allErrorMargins = Object.values(dailyData).flatMap((d: any) => d.errorMargins)
    const computedAvgErrorMargin = allErrorMargins.length > 0
      ? allErrorMargins.reduce((s: number, v: number) => s + v, 0) / allErrorMargins.length
      : (device.sensor_error_margin ?? 0)

    const totalDataPoints = Object.values(hourlyData).reduce((sum: number, h: any) => sum + h.count, 0)

    return {
      device_id: device._id || device.device_id || device.name || device.id,
      device_name: device.long_name || device.name || device.id,
      daily_uptime_percentage: computedAvgUptime,
      average_error_margin: computedAvgErrorMargin,
      data_points: totalDataPoints || readings.length,
      uptime_history: uptimeHistory,
      error_margin_history: errorMarginHistory,
      hourly_data: Object.values(hourlyData)
        .filter((h: any) => dates.includes(h.date))
        .map((h: any) => ({
          date: h.date,
          hour: h.hour,
          count: h.count,
          errorMargin: h.errorMargins.length > 0
            ? h.errorMargins.reduce((a: number, b: number) => a + b, 0) / h.errorMargins.length
            : null,
        })),
    }
  }

  // Fallback flat format
  const timestamp = device.timestamp || []
  const freq = device.freq || []
  const error_margin = device.error_margin || []
  if (timestamp.length === 0) {
    return {
      device_id: device.id,
      device_name: device.name || device.id,
      daily_uptime_percentage: 0,
      average_error_margin: 0,
      data_points: 0,
      uptime_history: [],
      error_margin_history: [],
      hourly_data: [],
    }
  }

  const dailyData: any = {}
  timestamp.forEach((ts: string, index: number) => {
    const date = new Date(ts).toDateString()
    if (!dailyData[date]) dailyData[date] = { hours: 0, errorMargins: [] }
    if (freq[index] && freq[index] > 0) dailyData[date].hours += 1
    if (error_margin[index] !== undefined && error_margin[index] !== null) dailyData[date].errorMargins.push(error_margin[index])
  })

  const dates: string[] = []
  const end = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    dates.push(d.toDateString())
  }
  
  const uptimeHistory = dates.map(date => ({ value: dailyData[date] ? (dailyData[date].hours / 24) * 100 : 0, timestamp: date }))
  const errorMarginHistory = dates.map(date => ({
    value: dailyData[date] && dailyData[date].errorMargins.length > 0
      ? dailyData[date].errorMargins.reduce((sum: number, em: number) => sum + em, 0) / dailyData[date].errorMargins.length
      : 0,
    timestamp: date
  }))

  const totalUniqueHours = Object.values(dailyData).reduce((sum: number, day: any) => sum + day.hours, 0)
  const totalDays = Object.keys(dailyData).length
  const dailyUptimePercentage = totalDays > 0 ? (totalUniqueHours / (totalDays * 24)) * 100 : 0
  const allErrorMargins = Object.values(dailyData).flatMap((day: any) => day.errorMargins)
  const avgErrorMargin = allErrorMargins.length > 0 ? allErrorMargins.reduce((sum: number, em: number) => sum + em, 0) / allErrorMargins.length : 0

  return {
    device_id: device.id,
    device_name: device.name || device.id,
    daily_uptime_percentage: Math.min(dailyUptimePercentage, 100),
    average_error_margin: avgErrorMargin,
    data_points: timestamp.length,
    uptime_history: uptimeHistory,
    error_margin_history: errorMarginHistory,
    hourly_data: [],
  }
}

export default function ReportsPage() {
  const { toast } = useToast()
  const { activeGroup, loading: groupLoading } = useGroup()
  const [filters, setFilters] = useState<FilterState>(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const fourteenDaysAgo = subDays(today, 13)
    fourteenDaysAgo.setHours(0, 0, 0, 0)
    
    return {
      filterType: "airqlouds",
      selectedItems: [],
      dateRange: { from: fourteenDaysAgo, to: today },
      includeTime: false,
    }
  })
  
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [deviceData, setDeviceData] = useState<any>(null)
  
  const [selectedComponents, setSelectedComponents] = useState({
    mapImage: true,
    singularHeatmaps: true,
    hourlyHeatmaps: true,
    frequency: true,
    sensorHealth: true,
  })
  
  const [isExporting, setIsExporting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleToggleComponent = (key: keyof typeof selectedComponents) => {
    setSelectedComponents(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePreview = async (filterState: FilterState) => {
    if (groupLoading || !activeGroup) {
      toast({
        title: "Group Required",
        description: "Please wait for your active group to load.",
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
        description: `Please select at least one ${getFilterLabel(filterState.filterType)}.`,
        variant: "destructive",
      })
      return
    }

    setIsAnalysing(true)
    setAnalysisData(null)
    setDeviceData(null)

    try {
      const { startDate, endDate } = getDateWindow(filterState)
      const response = await fetchAnalysisData(filterState, startDate.toISOString(), endDate.toISOString(), activeGroup)
      
      if (filterState.filterType === "devices") {
        const parsedData = Array.isArray(response) ? response : response?.data || []
        setDeviceData(parsedData)
      } else {
        setAnalysisData(response)
      }
      
      toast({
        title: "Preview Loaded",
        description: "Data has been loaded into the preview section.",
      })
    } catch (error) {
      toast({
        title: "Failed to load data",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAnalysing(false)
    }
  }

  const exportPdf = async () => {
    if (!previewRef.current) return
    setIsExporting(true)
    
    try {
      const elementsToCapture = previewRef.current.querySelectorAll('.pdf-section')
      if (elementsToCapture.length === 0) {
        toast({ title: "Nothing to export", variant: "destructive" })
        setIsExporting(false)
        return
      }

      toast({ title: "Generating PDF...", description: "Please wait while we prepare your document." })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const margin = 10
      const pageWidth = pdf.internal.pageSize.getWidth() - (margin * 2)
      
      for (let i = 0; i < elementsToCapture.length; i++) {
        const element = elementsToCapture[i] as HTMLElement
        // Optional: add a class before capture to handle scrollable elements (make them full height)
        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true,
          logging: false
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgProps = pdf.getImageProperties(imgData)
        const usableHeight = (imgProps.height * pageWidth) / imgProps.width
        
        if (i > 0) pdf.addPage()
        
        pdf.addImage(imgData, 'PNG', margin, margin, pageWidth, usableHeight)
      }

      pdf.save(`device_health_report_${new Date().getTime()}.pdf`)
      
      toast({ title: "Success", description: "PDF generated successfully." })
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
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imageStr = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `${filename}_${new Date().getTime()}.png`
      link.href = imageStr
      link.click()
      
      toast({ title: "Success", description: "Image downloaded successfully." })
    } catch (err) {
      console.error(err)
      toast({ title: "Download Failed", description: "An error occurred while generating the image.", variant: "destructive" })
    }
  }

  // Derived processed data
  let processedDevices: any[] = []
  let allDevicesForMap: any[] = []

  if (filters.filterType === "devices" && deviceData) {
    processedDevices = deviceData.map(processDevicePerformanceFlat)
    allDevicesForMap = deviceData.map((d: any) => ({
      device_id: d.id || d.device_id,
      device_name: d.name || d.device_name,
      latitude: d.latitude,
      longitude: d.longitude,
      uptime: d.uptime,
      error_margin: d.sensor_error_margin,
      cohorts: []
    }))
  } else if (analysisData && analysisData.length > 0) {
    processedDevices = analysisData.flatMap((aq: any) => {
      const devices = Array.isArray(aq.devices) ? aq.devices : []
      return devices.map(processDevicePerformanceFlat)
    })
    allDevicesForMap = analysisData.flatMap((aq: any) => {
      const devices = Array.isArray(aq.devices) ? aq.devices : []
      return devices.map((d: any) => ({
        device_id: d._id || d.device_id || d.name,
        device_name: d.long_name || d.name,
        latitude: d.latitude,
        longitude: d.longitude,
        uptime: d.uptime,
        error_margin: d.sensor_error_margin,
        cohorts: [aq.name]
      }))
    })
  }
  
  // Deduplicate for map
  const uniqueMapDevices = Array.from(new Map(allDevicesForMap.map(item => [item.device_id, item])).values())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm">Generate device health reports from system components</p>
        </div>
        {(analysisData || deviceData) && (
          <Button onClick={exportPdf} disabled={isExporting} className="gap-2">
            {isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isExporting ? "Exporting..." : "Export to PDF"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsFilters
            initialFilterType={filters.filterType}
            onFilterChange={setFilters}
            onAnalyse={handlePreview}
            isAnalysing={isAnalysing}
            hideDateRange={true}
          />
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Components</CardTitle>
              <CardDescription>Select sections to include in the PDF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mapImage" 
                  checked={selectedComponents.mapImage}
                  onCheckedChange={() => handleToggleComponent('mapImage')}
                />
                <Label htmlFor="mapImage" className="cursor-pointer">Map Location Image</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="singularHeatmaps" 
                  checked={selectedComponents.singularHeatmaps}
                  onCheckedChange={() => handleToggleComponent('singularHeatmaps')}
                />
                <Label htmlFor="singularHeatmaps" className="cursor-pointer">Singular Heatmaps</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hourlyHeatmaps" 
                  checked={selectedComponents.hourlyHeatmaps}
                  onCheckedChange={() => handleToggleComponent('hourlyHeatmaps')}
                />
                <Label htmlFor="hourlyHeatmaps" className="cursor-pointer">Device Hourly Heatmaps</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="frequency" 
                  checked={selectedComponents.frequency}
                  onCheckedChange={() => handleToggleComponent('frequency')}
                />
                <Label htmlFor="frequency" className="cursor-pointer">Data Frequency</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sensorHealth" 
                  checked={selectedComponents.sensorHealth}
                  onCheckedChange={() => handleToggleComponent('sensorHealth')}
                />
                <Label htmlFor="sensorHealth" className="cursor-pointer">Sensor Health (Correlation, Error)</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Preview Area */}
      {(analysisData || deviceData) && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Live Preview</h2>
          
          <div ref={previewRef} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border">
            {/* Map Section */}
            {selectedComponents.mapImage && uniqueMapDevices.length > 0 && (
              <div id="section-map" className="pdf-section space-y-4 relative bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Device Locations</h3>
                  <Button variant="outline" size="sm" onClick={() => downloadSectionImage('section-map', 'device_locations')} className="gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Save Image</span>
                  </Button>
                </div>
                <div className="h-[600px] rounded-lg border overflow-hidden">
                  <MaintenanceMap 
                    data={uniqueMapDevices}
                    loading={false}
                    selectedDeviceIds={[]}
                    onDeviceSelect={() => {}}
                    routePath={[]}
                    homeLocation={{ latitude: 0.332078, longitude: 32.570473, name: "Head Office" }}
                  />
                </div>
              </div>
            )}

            {/* Heatmaps */}
            {selectedComponents.singularHeatmaps && processedDevices.length > 0 && (
              <div id="section-singular-heatmaps" className="pdf-section space-y-4 relative bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Device Performance Heatmaps</h3>
                  <Button variant="outline" size="sm" onClick={() => downloadSectionImage('section-singular-heatmaps', 'singular_heatmaps')} className="gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Save Image</span>
                  </Button>
                </div>
                <DevicePerformanceHeatmaps devices={processedDevices} />
              </div>
            )}

            {selectedComponents.hourlyHeatmaps && processedDevices.length > 0 && (
              <div id="section-hourly-heatmaps" className="pdf-section space-y-4 relative bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Device Hourly Heatmaps</h3>
                  <Button variant="outline" size="sm" onClick={() => downloadSectionImage('section-hourly-heatmaps', 'hourly_heatmaps')} className="gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Save Image</span>
                  </Button>
                </div>
                <DeviceHourHeatmaps devices={processedDevices} />
              </div>
            )}

            {/* Frequency and Sensor Health */}
            {(selectedComponents.frequency || selectedComponents.sensorHealth) && (
              <div id="section-performance-analysis" className="pdf-section space-y-4 relative bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Performance Analysis</h3>
                  <Button variant="outline" size="sm" onClick={() => downloadSectionImage('section-performance-analysis', 'performance_analysis')} className="gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Save Image</span>
                  </Button>
                </div>
                {filters.filterType === "devices" ? (
                  <AirQloudPerformanceTab
                    airqloudId="custom-devices"
                    airqloudName="Selected Devices"
                    entityType="cohort"
                    initialData={{ devices: deviceData || [] }}
                  />
                ) : (
                  analysisData?.map((entity: any) => (
                    <div key={entity.id} className="mb-8">
                      <AirQloudPerformanceTab
                        airqloudId={entity.id}
                        airqloudName={entity.name}
                        entityType={filters.filterType === "grids" ? "grid" : "cohort"}
                        initialData={{ devices: entity.devices || [] }}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
