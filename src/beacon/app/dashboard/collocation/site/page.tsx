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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Search,
  RefreshCw,
  MapPin,
  Activity,
  AlertTriangle,
  BarChart3,
} from "lucide-react"

// --- Types ---

interface HistoryItem {
  value: number
  timestamp: string
}

interface SiteCollocationEntry {
  id: string
  name: string
  location: string
  category: "lowcost" | "bam"
  uptime: number
  errorMargin: number
  uptimeHistory: HistoryItem[]
  errorMarginHistory: HistoryItem[]
  devices: {
    total: number
    lowcost: number
    lowcostOnline: number
    bam: number
    bamOnline: number
  }
}

// --- Mock data generators ---

function generateUptimeHistory(avgUptime: number, days: number = 14): HistoryItem[] {
  const history: HistoryItem[] = []
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

function generateErrorMarginHistory(avgMargin: number, days: number = 14): HistoryItem[] {
  const history: HistoryItem[] = []
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

// --- Mock Data ---

const mockSummary = {
  totalSites: 24,
  lowcostSites: 18,
  bamSites: 6,
  overallUptime: 91.3,
  overallErrorMargin: 3.4,
  uptimeHistory: generateUptimeHistory(91.3),
  errorMarginHistory: generateErrorMarginHistory(3.4),
}

const mockSites: SiteCollocationEntry[] = [
  { id: "1", name: "Makerere University", location: "Kampala, Uganda", category: "lowcost", uptime: 96.2, errorMargin: 2.8, uptimeHistory: generateUptimeHistory(96.2), errorMarginHistory: generateErrorMarginHistory(2.8), devices: { total: 6, lowcost: 5, lowcostOnline: 4, bam: 1, bamOnline: 1 } },
  { id: "2", name: "Nakawa Division", location: "Kampala, Uganda", category: "lowcost", uptime: 93.7, errorMargin: 3.5, uptimeHistory: generateUptimeHistory(93.7), errorMarginHistory: generateErrorMarginHistory(3.5), devices: { total: 4, lowcost: 4, lowcostOnline: 3, bam: 0, bamOnline: 0 } },
  { id: "3", name: "US Embassy", location: "Kampala, Uganda", category: "bam", uptime: 98.9, errorMargin: 1.2, uptimeHistory: generateUptimeHistory(98.9), errorMarginHistory: generateErrorMarginHistory(1.2), devices: { total: 3, lowcost: 1, lowcostOnline: 1, bam: 2, bamOnline: 2 } },
  { id: "4", name: "Bwaise III", location: "Kampala, Uganda", category: "lowcost", uptime: 88.4, errorMargin: 5.8, uptimeHistory: generateUptimeHistory(88.4), errorMarginHistory: generateErrorMarginHistory(5.8), devices: { total: 5, lowcost: 5, lowcostOnline: 3, bam: 0, bamOnline: 0 } },
  { id: "5", name: "Nsambya Hospital", location: "Kampala, Uganda", category: "lowcost", uptime: 94.1, errorMargin: 3.2, uptimeHistory: generateUptimeHistory(94.1), errorMarginHistory: generateErrorMarginHistory(3.2), devices: { total: 3, lowcost: 2, lowcostOnline: 2, bam: 1, bamOnline: 1 } },
  { id: "6", name: "UNBS Headquarters", location: "Kampala, Uganda", category: "bam", uptime: 99.3, errorMargin: 0.9, uptimeHistory: generateUptimeHistory(99.3), errorMarginHistory: generateErrorMarginHistory(0.9), devices: { total: 4, lowcost: 2, lowcostOnline: 2, bam: 2, bamOnline: 2 } },
  { id: "7", name: "Jinja Road Station", location: "Jinja, Uganda", category: "lowcost", uptime: 90.5, errorMargin: 4.6, uptimeHistory: generateUptimeHistory(90.5), errorMarginHistory: generateErrorMarginHistory(4.6), devices: { total: 3, lowcost: 3, lowcostOnline: 2, bam: 0, bamOnline: 0 } },
  { id: "8", name: "Entebbe Airport", location: "Entebbe, Uganda", category: "bam", uptime: 97.8, errorMargin: 1.5, uptimeHistory: generateUptimeHistory(97.8), errorMarginHistory: generateErrorMarginHistory(1.5), devices: { total: 5, lowcost: 2, lowcostOnline: 1, bam: 3, bamOnline: 3 } },
]

// --- Mini Bar Graph Components ---

function UptimeMiniGraph({ uptimeHistory, averageUptime }: { uptimeHistory: HistoryItem[]; averageUptime: number }) {
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

function ErrorMarginMiniGraph({ errorMarginHistory, averageMargin }: { errorMarginHistory: HistoryItem[]; averageMargin: number }) {
  if (errorMarginHistory.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }

  const values = errorMarginHistory.slice(-14)
  const maxMargin = 10

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

export default function SiteCollocationPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSites = mockSites.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Site Collocation</h1>
        <Button variant="outline" size="sm" className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sites */}
        <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Total Sites
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{mockSummary.totalSites}</div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-muted-foreground">Low Cost</span>
                <span className="text-sm font-semibold">{mockSummary.lowcostSites}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                <span className="text-xs text-muted-foreground">BAM</span>
                <span className="text-sm font-semibold">{mockSummary.bamSites}</span>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-blue-500 rounded-l-full"
                style={{ width: `${(mockSummary.lowcostSites / mockSummary.totalSites) * 100}%` }}
              ></div>
              <div
                className="h-full bg-purple-500 rounded-r-full"
                style={{ width: `${(mockSummary.bamSites / mockSummary.totalSites) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Uptime Performance */}
        <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-500" />
              Uptime Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <UptimeMiniGraph
              uptimeHistory={mockSummary.uptimeHistory}
              averageUptime={mockSummary.overallUptime}
            />
          </CardContent>
        </Card>

        {/* Error Margin */}
        <Card className="overflow-hidden border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Error Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ErrorMarginMiniGraph
              errorMarginHistory={mockSummary.errorMarginHistory}
              averageMargin={mockSummary.overallErrorMargin}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sites Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Collocation Sites
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Search */}
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by site name or location..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Devices</th>

                  <th className="text-left py-3 px-4 font-medium text-gray-600">Uptime</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Error Margin</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No sites found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredSites.map((site) => (
                    <tr
                      key={site.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium">{site.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{site.location}</span>
                      </td>
                      <td className="py-3 px-4">
                        <HoverCard openDelay={100} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                              {site.devices.total} devices
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-56 p-3" side="top">
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                  <span>Low Cost</span>
                                </div>
                                <span className="font-medium">{site.devices.lowcostOnline}/{site.devices.lowcost} online</span>
                              </div>
                              {site.devices.bam > 0 && (
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                    <span>BAM</span>
                                  </div>
                                  <span className="font-medium">{site.devices.bamOnline}/{site.devices.bam} online</span>
                                </div>
                              )}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </td>

                      <td className="py-3 px-4">
                        <UptimeMiniGraph
                          uptimeHistory={site.uptimeHistory}
                          averageUptime={site.uptime}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <ErrorMarginMiniGraph
                          errorMarginHistory={site.errorMarginHistory}
                          averageMargin={site.errorMargin}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
