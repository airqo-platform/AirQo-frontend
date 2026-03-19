"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Search,
  RefreshCw,
  FlaskConical,
  CheckCircle2,
  Activity,
  BarChart3,
} from "lucide-react"

// --- Mock Data ---

const mockSummary = {
  totalCollocationBatches: 12,
  dispatchUptime: 87,
  dispatchErrorMargin: 3.8,
  dispatchUptimeHistory: generateUptimeHistory(87),
  dispatchErrorMarginHistory: generateErrorMarginHistory(3.8),
  inlabUptime: 94,
  inlabErrorMargin: 2.5,
  inlabUptimeHistory: generateUptimeHistory(94),
  inlabErrorMarginHistory: generateErrorMarginHistory(2.5),
}

interface UptimeHistoryItem {
  value: number
  timestamp: string
}

interface InlabDevice {
  id: string
  deviceName: string
  category: string
  channelId: string
  networkId: string
  firmware: string
  uptime: number
  sensorErrorMargin: number
  uptimeHistory: UptimeHistoryItem[]
}

interface DispatchedCollocation {
  id: string
  name: string
  numberOfDevices: number
  startDate: string
  endDate: string
  uptime: number
  sensorErrorMargin: number
  uptimeHistory: UptimeHistoryItem[]
}

// Helper to generate mock daily uptime history
function generateUptimeHistory(avgUptime: number, days: number = 14): UptimeHistoryItem[] {
  const history: UptimeHistoryItem[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    // Vary ±10% around the average, clamped to 0-100
    const variation = (Math.random() - 0.5) * 20
    const value = Math.min(100, Math.max(0, avgUptime + variation))
    history.push({
      value: Math.round(value * 10) / 10,
      timestamp: date.toISOString().split("T")[0],
    })
  }
  return history
}

function generateErrorMarginHistory(avgMargin: number, days: number = 14): UptimeHistoryItem[] {
  const history: UptimeHistoryItem[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const variation = (Math.random() - 0.5) * 3
    const value = Math.max(0, avgMargin + variation)
    history.push({
      value: Math.round(value * 10) / 10,
      timestamp: date.toISOString().split("T")[0],
    })
  }
  return history
}

const mockInlabDevices: InlabDevice[] = [
  { id: "1", deviceName: "aq_g5401", category: "lowcost", channelId: "2084531", networkId: "airqo", firmware: "v2.1.3", uptime: 98.2, sensorErrorMargin: 3.1, uptimeHistory: generateUptimeHistory(98.2) },
  { id: "2", deviceName: "aq_g5402", category: "lowcost", channelId: "2084532", networkId: "airqo", firmware: "v2.1.3", uptime: 95.7, sensorErrorMargin: 4.5, uptimeHistory: generateUptimeHistory(95.7) },
  { id: "3", deviceName: "aq_g5403", category: "lowcost", channelId: "2084533", networkId: "airqo", firmware: "v2.1.2", uptime: 91.3, sensorErrorMargin: 5.2, uptimeHistory: generateUptimeHistory(91.3) },
  { id: "4", deviceName: "aq_g5404", category: "bam", channelId: "2084534", networkId: "kcca", firmware: "v2.1.3", uptime: 99.1, sensorErrorMargin: 1.8, uptimeHistory: generateUptimeHistory(99.1) },
  { id: "5", deviceName: "aq_g5405", category: "lowcost", channelId: "2084535", networkId: "airqo", firmware: "v2.1.1", uptime: 88.6, sensorErrorMargin: 6.7, uptimeHistory: generateUptimeHistory(88.6) },
  { id: "6", deviceName: "aq_g5406", category: "lowcost", channelId: "2084536", networkId: "airqo", firmware: "v2.1.3", uptime: 96.4, sensorErrorMargin: 2.9, uptimeHistory: generateUptimeHistory(96.4) },
]

const mockDispatchedCollocations: DispatchedCollocation[] = [
  { id: "1", name: "Batch Alpha", numberOfDevices: 8, startDate: "2026-01-10", endDate: "2026-01-24", uptime: 96.5, sensorErrorMargin: 3.2, uptimeHistory: generateUptimeHistory(96.5) },
  { id: "2", name: "Batch Beta", numberOfDevices: 5, startDate: "2026-02-01", endDate: "2026-02-15", uptime: 93.1, sensorErrorMargin: 4.8, uptimeHistory: generateUptimeHistory(93.1) },
  { id: "3", name: "Batch Gamma", numberOfDevices: 10, startDate: "2026-02-20", endDate: "2026-03-06", uptime: 97.8, sensorErrorMargin: 2.1, uptimeHistory: generateUptimeHistory(97.8) },
  { id: "4", name: "Batch Delta", numberOfDevices: 6, startDate: "2026-03-10", endDate: "2026-03-18", uptime: 91.4, sensorErrorMargin: 5.5, uptimeHistory: generateUptimeHistory(91.4) },
]

// --- Helpers ---

function getMarginBadgeColor(margin: number) {
  if (margin <= 3) return "bg-green-100 text-green-700 hover:bg-green-200"
  if (margin <= 5) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
  return "bg-red-100 text-red-700 hover:bg-red-200"
}

// --- Mini bar graph component for uptime history (same pattern as airqlouds-table) ---

function UptimeMiniGraph({ uptimeHistory, averageUptime }: { uptimeHistory: UptimeHistoryItem[]; averageUptime: number }) {
  if (uptimeHistory.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }

  const values = uptimeHistory.slice(-14)

  const getBarColor = (value: number) => {
    if (value >= 75) return "bg-green-500 hover:bg-green-600"
    if (value >= 50) return "bg-orange-500 hover:bg-orange-600"
    return "bg-red-500 hover:bg-red-600"
  }

  const getTooltipBgColor = (value: number) => {
    if (value >= 75) return "bg-green-600 border-green-700"
    if (value >= 50) return "bg-orange-600 border-orange-700"
    return "bg-red-600 border-red-700"
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="font-medium min-w-[50px]">{averageUptime.toFixed(1)}%</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getBarColor(item.value)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.value / 100) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTooltipBgColor(item.value)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{formatDate(item.timestamp)}</div>
                  <div>Uptime: {item.value.toFixed(1)}%</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

// Error margin mini bar graph (inverted: lower is better)
function ErrorMarginMiniGraph({ errorMarginHistory, averageMargin }: { errorMarginHistory: UptimeHistoryItem[]; averageMargin: number }) {
  if (errorMarginHistory.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }

  const values = errorMarginHistory.slice(-14)
  const maxMargin = 10 // scale bars against 10%

  const getBarColor = (value: number) => {
    if (value <= 3) return "bg-green-500 hover:bg-green-600"
    if (value <= 5) return "bg-yellow-500 hover:bg-yellow-600"
    return "bg-red-500 hover:bg-red-600"
  }

  const getTooltipBgColor = (value: number) => {
    if (value <= 3) return "bg-green-600 border-green-700"
    if (value <= 5) return "bg-yellow-600 border-yellow-700"
    return "bg-red-600 border-red-700"
  }

  const getTextColor = (value: number) => {
    if (value <= 3) return "text-green-600"
    if (value <= 5) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className={`font-medium min-w-[50px] ${getTextColor(averageMargin)}`}>±{averageMargin.toFixed(1)}%</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getBarColor(item.value)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.value / maxMargin) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTooltipBgColor(item.value)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{formatDate(item.timestamp)}</div>
                  <div>Error Margin: ±{item.value.toFixed(1)}%</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

// --- Component ---

export default function InlabCollocationPage() {
  const [activeTab, setActiveTab] = useState<"inlab" | "dispatched">("inlab")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInlabDevices = mockInlabDevices.filter((d) =>
    d.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.networkId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDispatched = mockDispatchedCollocations.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inlab Collocation</h1>
        <Button variant="outline" size="sm" className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Collocation Batches */}
        <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FlaskConical className="mr-2 h-5 w-5 text-primary" />
              Total Collocation Batches
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{mockSummary.totalCollocationBatches}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered batches</p>
          </CardContent>
        </Card>

        {/* Overall Dispatch Pass Rate */}
        <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
              Overall Dispatch Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Uptime</span>
              <UptimeMiniGraph
                uptimeHistory={mockSummary.dispatchUptimeHistory}
                averageUptime={mockSummary.dispatchUptime}
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Error Margin</span>
              <ErrorMarginMiniGraph
                errorMarginHistory={mockSummary.dispatchErrorMarginHistory}
                averageMargin={mockSummary.dispatchErrorMargin}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inlab Performance */}
        <Card className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5 text-blue-500" />
              Inlab Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Uptime</span>
              <UptimeMiniGraph
                uptimeHistory={mockSummary.inlabUptimeHistory}
                averageUptime={mockSummary.inlabUptime}
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Error Margin</span>
              <ErrorMarginMiniGraph
                errorMarginHistory={mockSummary.inlabErrorMarginHistory}
                averageMargin={mockSummary.inlabErrorMargin}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              {activeTab === "inlab" ? "Inlab Devices" : "Dispatched Collocation"}
            </CardTitle>

            {/* Toggle Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "inlab" ? "default" : "outline"}
                size="sm"
                onClick={() => { setActiveTab("inlab"); setSearchTerm("") }}
              >
                Inlab Devices
              </Button>
              <Button
                variant={activeTab === "dispatched" ? "default" : "outline"}
                size="sm"
                onClick={() => { setActiveTab("dispatched"); setSearchTerm("") }}
              >
                Dispatched Collocation
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Search */}
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={activeTab === "inlab" ? "Search by device name, category, network..." : "Search by batch name..."}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Inlab Devices Table */}
          {activeTab === "inlab" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Device Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Channel ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Network ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Firmware</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Uptime</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Sensor Error Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInlabDevices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No inlab devices found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredInlabDevices.map((device) => (
                      <tr
                        key={device.id}
                        className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/dashboard/devices/${device.id}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium">{device.deviceName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{device.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{device.channelId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                            {device.networkId}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                            {device.firmware}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <UptimeMiniGraph
                            uptimeHistory={device.uptimeHistory}
                            averageUptime={device.uptime}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getMarginBadgeColor(device.sensorErrorMargin)}>
                            ±{device.sensorErrorMargin}%
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Dispatched Collocation Table */}
          {activeTab === "dispatched" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Number of Devices</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Start Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">End Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Uptime</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Sensor Error Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDispatched.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No dispatched collocations found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredDispatched.map((batch) => (
                      <tr
                        key={batch.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium">{batch.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                            {batch.numberOfDevices}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(batch.startDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(batch.endDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <UptimeMiniGraph
                            uptimeHistory={batch.uptimeHistory}
                            averageUptime={batch.uptime}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getMarginBadgeColor(batch.sensorErrorMargin)}>
                            ±{batch.sensorErrorMargin}%
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
