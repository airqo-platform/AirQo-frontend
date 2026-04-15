"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Wifi, AlertTriangle, FlaskConical, CheckCircle2, Activity, FileText, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// --- Types & Mock Data Generation (Same as inlab/page.tsx for consistency) ---

interface UptimeHistoryItem {
  value: number
  timestamp: string
}

interface DailyData {
  timestamp: string
  pm2_5: number
  errorMargin: number
  correlation: number
}

interface BatchDevice {
  id: string
  deviceName: string
  category: string
  channelId: string
  networkId: string
  firmware: string
  uptime: number
  sensorErrorMargin: number
  uptimeHistory: UptimeHistoryItem[]
  dailyData: DailyData[]
}

interface BatchDetailData {
  id: string
  name: string
  numberOfDevices: number
  startDate: string
  endDate: string
  uptime: number
  sensorErrorMargin: number
  uptimeHistory: UptimeHistoryItem[]
  devices: BatchDevice[]
}

function generateUptimeHistory(avgUptime: number, days: number = 14): UptimeHistoryItem[] {
  const history: UptimeHistoryItem[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const variation = (Math.random() - 0.5) * 20
    const value = Math.min(100, Math.max(0, avgUptime + variation))
    history.push({
      value: Math.round(value * 10) / 10,
      timestamp: date.toISOString().split("T")[0],
    })
  }
  return history
}

function generateDailyData(avgPm25: number, avgError: number, days: number = 14): DailyData[] {
  const data: DailyData[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const pmVariation = (Math.random() - 0.5) * 10
    const errVariation = (Math.random() - 0.5) * 2
    // Generate correlation between 0.95 and 1
    const correlation = 0.95 + (Math.random() * 0.05)
    
    data.push({
      timestamp: date.toISOString().split("T")[0],
      pm2_5: Math.round(Math.max(0, avgPm25 + pmVariation) * 10) / 10,
      errorMargin: Math.round(Math.max(0, avgError + errVariation) * 10) / 10,
      correlation: Math.round(correlation * 1000) / 1000,
    })
  }
  return data
}

const getBatchDetail = (id: string): BatchDetailData | null => {
  const batches: Record<string, any> = {
    "1": { name: "MANHICA Batch", devices: 8, start: "2026-01-10", end: "2026-01-24", uptime: 96.5, margin: 3.2, pm25: 12.5 },
    "2": { name: "WRI & Safiri Electric Project", devices: 5, start: "2026-02-01", end: "2026-02-15", uptime: 93.1, margin: 4.8, pm25: 15.2 },
    "3": { name: "NCCG_CAF_22", devices: 10, start: "2026-02-20", end: "2026-03-06", uptime: 97.8, margin: 2.1, pm25: 8.4 },
  }

  const batch = batches[id] || { name: `Batch ${id}`, devices: 6, start: "2026-03-01", end: "2026-03-15", uptime: 90, margin: 4.0, pm25: 10.0 }

  const devices: BatchDevice[] = []
  for (let i = 1; i <= batch.devices; i++) {
    const uptime = Math.round((70 + Math.random() * 30) * 10) / 10
    const margin = Math.round((1 + Math.random() * 5) * 10) / 10
    devices.push({
      id: `${id}-${i}`,
      deviceName: `aq_g${5400 + i}`,
      category: i % 3 === 0 ? "bam" : "lowcost",
      channelId: `${2084530 + i}`,
      networkId: "airqo",
      firmware: "v2.1.3",
      uptime: uptime,
      sensorErrorMargin: margin,
      uptimeHistory: generateUptimeHistory(uptime),
      dailyData: generateDailyData(batch.pm25, margin)
    })
  }

  return {
    id,
    name: batch.name,
    numberOfDevices: batch.devices,
    startDate: batch.start,
    endDate: batch.end,
    uptime: batch.uptime,
    sensorErrorMargin: batch.margin,
    uptimeHistory: generateUptimeHistory(batch.uptime),
    devices
  }
}

// --- Components ---

const UptimeMiniGraph = ({ uptimeHistory, averageUptime }: { uptimeHistory: UptimeHistoryItem[], averageUptime: number }) => {
  const getBarColor = (value: number) => {
    if (value >= 90) return "bg-green-500 hover:bg-green-600"
    if (value >= 75) return "bg-blue-500 hover:bg-blue-600"
    if (value >= 50) return "bg-orange-500 hover:bg-orange-600"
    return "bg-red-500 hover:bg-red-600"
  }

  const getTooltipBgColor = (value: number) => {
    if (value >= 90) return "bg-green-600 border-green-700"
    if (value >= 75) return "bg-blue-600 border-blue-700"
    if (value >= 50) return "bg-orange-600 border-orange-700"
    return "bg-red-600 border-red-700"
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm min-w-[45px]">{averageUptime}%</span>
        <div className="flex items-end gap-[2px] h-6">
          {uptimeHistory.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1 rounded-t-sm ${getBarColor(item.value)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.value / 100) * 24)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTooltipBgColor(item.value)} text-white border-0`}>
                <div className="text-xs font-medium">
                  <div>{item.timestamp}</div>
                  <div>Uptime: {item.value}%</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

const PerformanceAnalysis = ({ devices }: { devices: BatchDevice[] }) => {
  // Colors for different devices
  const colors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe", 
    "#00c49f", "#ffbb28", "#ff8042", "#a4de6c", "#d0ed57"
  ]

  // Prepare data for Error Margin and PM2.5 charts
  // We need to group dailyData by timestamp
  const timestamps = devices[0].dailyData.map(d => d.timestamp)
  
  const combinedData = timestamps.map(ts => {
    const entry: any = { timestamp: ts }
    let totalPm = 0
    devices.forEach(device => {
      const dayData = device.dailyData.find(d => d.timestamp === ts)
      if (dayData) {
        entry[`pm_${device.deviceName}`] = dayData.pm2_5
        entry[`err_${device.deviceName}`] = dayData.errorMargin
        entry[`corr_${device.deviceName}`] = dayData.correlation
        totalPm += dayData.pm2_5
      }
    })
    entry.averagePm = Math.round((totalPm / devices.length) * 10) / 10
    return entry
  })

  // For correlation, we'll use PM2.5 readings of each device against the average or against each other.
  // The user asked for "one for all the devices", usually a multi-line PM2.5 chart is a form of correlation check.
  // But maybe a scatter plot of Device A vs Average would be better.
  // Given the request, I'll provide a multi-line chart for correlation of PM2.5 readings.

  return (
    <div className="space-y-6 mt-4">
      {/* Sensor Error Margin Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Sensor Error Margin (All Devices)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-white p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  fontSize={12} 
                  tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis fontSize={12} unit="%" />
                <RechartsTooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                <Legend />
                {devices.map((device, index) => (
                  <Line 
                    key={device.id}
                    type="monotone"
                    dataKey={`err_${device.deviceName}`}
                    name={device.deviceName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Mean Daily PM2.5 Readings Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Mean Daily PM2.5 Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-white p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  fontSize={12} 
                  tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis fontSize={12} unit=" µg/m³" />
                <RechartsTooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                <Legend />
                {devices.map((device, index) => (
                  <Line 
                    key={device.id}
                    type="monotone"
                    dataKey={`pm_${device.deviceName}`}
                    name={device.deviceName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                    dot={false}
                  />
                ))}
                <Line 
                  type="monotone"
                  dataKey="averagePm"
                  name="BATCH AVERAGE"
                  stroke="#000000"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#000000" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-purple-500" />
            Inter-sensor Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full bg-white p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  fontSize={12} 
                  tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis fontSize={12} domain={[0.9, 1.0]} />
                <RechartsTooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                <Legend />
                {devices.map((device, index) => (
                  <Line 
                    key={device.id}
                    type="monotone"
                    dataKey={`corr_${device.deviceName}`}
                    name={device.deviceName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            This graph shows the correlation factor of PM2.5 readings across all devices in the batch.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const ReportTab = ({ data }: { data: BatchDetailData }) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      // Ensure we have some data before trying to build a PDF
      if (!data || !data.devices || data.devices.length === 0) {
        throw new Error("No data available for PDF generation")
      }

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Add Logo or Header
      doc.setFontSize(22)
      doc.setTextColor(63, 63, 63)
      doc.text("Device Test Report", pageWidth / 2, 20, { align: "center" })

      // Add Batch Name
      doc.setFontSize(16)
      doc.text(data.name, pageWidth / 2, 30, { align: "center" })

      // Report Metadata
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40)
      doc.text(`Period: ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}`, 14, 45)

      // Summary Section
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text("Performance Summary", 14, 55)

      const summaryData = [
        ["Metric", "Value", "Status"],
        ["Average Uptime", `${data.uptime}%`, data.uptime >= 90 ? "PASSED" : "REVIEW"],
        ["Mean Error Margin", `±${data.sensorErrorMargin}%`, data.sensorErrorMargin <= 10 ? "PASSED" : "FAILED"],
        ["Total Devices", data.numberOfDevices.toString(), "ACTIVE"],
      ]

      autoTable(doc, {
        startY: 60,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: "striped",
        headStyles: { fillGray: 200, textColor: 0 },
      })

      let currentY = (doc as any).lastAutoTable.finalY + 15

      // Prepare daily data for tables
      const timestamps = data.devices[0].dailyData.map(d => d.timestamp)
      
      // 1. Sensor Error Margin Table
      doc.setFontSize(14)
      doc.text("Daily Sensor Error Margin (%)", 14, currentY)
      
      const errorMarginHeaders = ["Date", ...data.devices.map(d => d.deviceName)]
      const errorMarginRows = timestamps.map(ts => {
        const row = [new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })]
        data.devices.forEach(device => {
          const dayData = device.dailyData.find(d => d.timestamp === ts)
          row.push(dayData ? `±${dayData.errorMargin}%` : "-")
        })
        return row
      })

      autoTable(doc, {
        startY: currentY + 5,
        head: [errorMarginHeaders],
        body: errorMarginRows,
        theme: "grid",
        headStyles: { fillGray: 200, textColor: 0, fontSize: 8 },
        styles: { fontSize: 7 },
      })

      currentY = (doc as any).lastAutoTable.finalY + 15

      // 2. Mean Daily PM2.5 Readings Table
      if (currentY + 40 > pageHeight - 20) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(14)
      doc.text("Mean Daily PM2.5 Readings (µg/m³)", 14, currentY)

      const pm25Headers = ["Date", ...data.devices.map(d => d.deviceName), "Batch Avg"]
      const pm25Rows = timestamps.map(ts => {
        const row = [new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })]
        let totalPm = 0
        let count = 0
        data.devices.forEach(device => {
          const dayData = device.dailyData.find(d => d.timestamp === ts)
          if (dayData) {
            row.push(dayData.pm2_5.toString())
            totalPm += dayData.pm2_5
            count++
          } else {
            row.push("-")
          }
        })
        row.push(count > 0 ? (Math.round((totalPm / count) * 10) / 10).toString() : "-")
        return row
      })

      autoTable(doc, {
        startY: currentY + 5,
        head: [pm25Headers],
        body: pm25Rows,
        theme: "grid",
        headStyles: { fillGray: 200, textColor: 0, fontSize: 8 },
        styles: { fontSize: 7 },
      })

      currentY = (doc as any).lastAutoTable.finalY + 15

      // 3. Inter-sensor Correlation Table
      if (currentY + 40 > pageHeight - 20) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(14)
      doc.text("Inter-sensor Correlation Factor", 14, currentY)

      const correlationHeaders = ["Date", ...data.devices.map(d => d.deviceName)]
      const correlationRows = timestamps.map(ts => {
        const row = [new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })]
        data.devices.forEach(device => {
          const dayData = device.dailyData.find(d => d.timestamp === ts)
          row.push(dayData ? dayData.correlation.toString() : "-")
        })
        return row
      })

      autoTable(doc, {
        startY: currentY + 5,
        head: [correlationHeaders],
        body: correlationRows,
        theme: "grid",
        headStyles: { fillGray: 200, textColor: 0, fontSize: 8 },
        styles: { fontSize: 7 },
      })

      currentY = (doc as any).lastAutoTable.finalY + 15

      // 4. Device Details Section
      if (currentY + 40 > pageHeight - 20) {
        doc.addPage()
        currentY = 20
      }
      
      doc.setFontSize(14)
      doc.text("Device Details", 14, currentY)

      const deviceRows = data.devices.map(device => [
        device.deviceName,
        device.category,
        device.channelId,
        `${device.uptime}%`,
        `±${device.sensorErrorMargin}%`,
        device.sensorErrorMargin < 5 ? "Excellent" : "Good"
      ])

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Device Name", "Category", "Channel ID", "Uptime", "Error Margin", "Rating"]],
        body: deviceRows,
        theme: "grid",
        headStyles: { fillGray: 100, textColor: 0 },
      })

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `AirQo Collocation - Internal Use Only - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        )
      }

      doc.save(`${data.name.replace(/\s+/g, "_")}_Report.pdf`)
      setIsGenerating(false)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      alert("Failed to generate PDF. Please try again or contact support if the problem persists.")
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Automated Batch Report
            </CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              Download a comprehensive PDF report containing all performance metrics and device data.
            </div>
          </div>
          <Button onClick={generatePDF} disabled={isGenerating} className="flex items-center gap-2">
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-full max-w-2xl bg-white shadow-md rounded-sm p-12 space-y-8 pointer-events-none select-none overflow-hidden h-[500px] relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 pointer-events-none" />
              {/* Report Preview Header */}
              <div className="text-center space-y-2 border-b pb-6">
                <div className="text-2xl font-bold text-gray-800">Device Test Report</div>
                <div className="text-lg text-gray-600 uppercase tracking-wide">{data.name}</div>
              </div>

              {/* Report Preview Summary */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Summary</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Uptime:</span>
                      <span className="font-medium">{data.uptime}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Error Margin:</span>
                      <span className="font-medium">±{data.sensorErrorMargin}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Devices:</span>
                      <span className="font-medium">{data.numberOfDevices}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Batch Info</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Start:</span>
                      <span className="font-medium">{new Date(data.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">End:</span>
                      <span className="font-medium">{new Date(data.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Preview Table */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Device Metrics</div>
                <div className="w-full border rounded-sm overflow-hidden">
                  <div className="bg-gray-50 border-b px-4 py-2 flex text-[10px] font-bold text-gray-500 uppercase">
                    <div className="w-1/3">Device</div>
                    <div className="w-1/3 text-center">Uptime</div>
                    <div className="w-1/3 text-right">Margin</div>
                  </div>
                  {data.devices.slice(0, 5).map((d, i) => (
                    <div key={i} className="px-4 py-2 flex text-[10px] border-b last:border-0">
                      <div className="w-1/3 text-gray-700">{d.deviceName}</div>
                      <div className="w-1/3 text-center text-gray-600">{d.uptime}%</div>
                      <div className="w-1/3 text-right text-gray-600">±{d.sensorErrorMargin}%</div>
                    </div>
                  ))}
                  {data.devices.length > 5 && (
                    <div className="px-4 py-2 text-[10px] text-center text-gray-400 italic bg-gray-50">
                      + {data.devices.length - 5} more devices...
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6 italic">Click &quot;Download PDF&quot; to get the full multi-page report.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const CollocationBatchDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const batchId = params?.id as string

  const [data, setData] = useState<BatchDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData(getBatchDetail(batchId))
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [batchId])

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!data) return <div>Batch not found</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {data.numberOfDevices} Devices
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Data
          </Button>
          <Button className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Complete Analysis
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.uptime}%</div>
            <Progress value={data.uptime} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Error Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">±{data.sensorErrorMargin}%</div>
            <div className="text-xs text-gray-500 mt-1">Target: &lt; 10%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Devices Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-xs text-gray-500 mt-1">All devices active</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Remaining Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Math.max(0, Math.ceil((new Date(data.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
            </div>
            <div className="text-xs text-gray-500 mt-1">Until scheduled end</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="devices" className="w-full">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Channel ID</TableHead>
                      <TableHead>Firmware</TableHead>
                      <TableHead>Uptime (14d)</TableHead>
                      <TableHead>Error Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.devices.map((device) => (
                      <TableRow key={device.id} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/dashboard/devices/${device.deviceName}`)}>
                        <TableCell className="font-medium">{device.deviceName}</TableCell>
                        <TableCell className="capitalize">{device.category}</TableCell>
                        <TableCell>{device.channelId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{device.firmware}</Badge>
                        </TableCell>
                        <TableCell>
                          <UptimeMiniGraph uptimeHistory={device.uptimeHistory} averageUptime={device.uptime} />
                        </TableCell>
                        <TableCell>
                          <Badge className={device.sensorErrorMargin < 5 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                            ±{device.sensorErrorMargin}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-4">
          <PerformanceAnalysis devices={data.devices} />
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <ReportTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CollocationBatchDetailPage
