"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { formatCategoryLabel } from "@/lib/utils"
import { useApiData } from "@/hooks/useApiData"
import { getInlabDevices, getBatches, createBatch } from "@/services/inlab.service"
import type { InlabDevice, InlabBatch, InlabBatchDevice, InlabDeviceDaily, InlabDeviceDataPoint } from "@/types/inlab.types"
import { toast } from "sonner"

// --- Helpers ---

function getMarginBadgeColor(margin: number) {
  if (margin <= 3) return "bg-green-100 text-green-700 hover:bg-green-200"
  if (margin <= 5) return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
  return "bg-red-100 text-red-700 hover:bg-red-200"
}

// Pearson correlation between two numeric arrays (paired)
function pearsonCorrelation(x: number[], y: number[]): number | null {
  const n = Math.min(x.length, y.length)
  if (n < 2) return null
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (let i = 0; i < n; i++) {
    sumX += x[i]
    sumY += y[i]
    sumXY += x[i] * y[i]
    sumX2 += x[i] * x[i]
    sumY2 += y[i] * y[i]
  }
  const num = n * sumXY - sumX * sumY
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  if (!den) return null
  return num / den
}

// Compute correlation between sensor1 and sensor2 from a device's data points
function computeDeviceCorrelation(data?: InlabDeviceDataPoint[]): number | null {
  if (!data || data.length === 0) return null
  const s1: number[] = []
  const s2: number[] = []
  for (const p of data) {
    const a = p["pm2.5 sensor1"]
    const b = p["pm2.5 sensor2"]
    if (a !== null && a !== undefined && b !== null && b !== undefined) {
      s1.push(a)
      s2.push(b)
    }
  }
  return pearsonCorrelation(s1, s2)
}

function getCorrelationColor(c: number | null) {
  if (c === null || c === undefined || isNaN(c)) return "bg-gray-100 text-gray-600"
  if (c >= 0.9) return "bg-green-100 text-green-700"
  if (c >= 0.7) return "bg-yellow-100 text-yellow-700"
  return "bg-red-100 text-red-700"
}

// --- Batch-level mini graphs (one bar per device) ---

function BatchUptimeMiniGraph({ devices }: { devices: InlabBatchDevice[] }) {
  if (!devices || devices.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }
  const values = devices.map((d) => ({ name: d.device_name, value: d.uptime ?? 0 }))
  const avg = values.reduce((acc, v) => acc + v.value, 0) / (values.length || 1)

  const getBarColor = (v: number) => {
    if (v >= 75) return "bg-green-500 hover:bg-green-600"
    if (v >= 50) return "bg-orange-500 hover:bg-orange-600"
    return "bg-red-500 hover:bg-red-600"
  }
  const getTipBg = (v: number) => {
    if (v >= 75) return "bg-green-600 border-green-700"
    if (v >= 50) return "bg-orange-600 border-orange-700"
    return "bg-red-600 border-red-700"
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="font-medium min-w-[50px]">{avg.toFixed(1)}%</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, i) => (
            <Tooltip key={i} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getBarColor(item.value)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.value / 100) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTipBg(item.value)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{item.name}</div>
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

function BatchErrorMarginMiniGraph({ devices }: { devices: InlabBatchDevice[] }) {
  if (!devices || devices.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }
  const values = devices.map((d) => ({ name: d.device_name, value: d.error_margin ?? 0 }))
  const avg = values.reduce((acc, v) => acc + v.value, 0) / (values.length || 1)
  const maxMargin = Math.max(10, ...values.map((v) => v.value))

  const getBarColor = (v: number) => {
    if (v <= 3) return "bg-green-500 hover:bg-green-600"
    if (v <= 5) return "bg-yellow-500 hover:bg-yellow-600"
    return "bg-red-500 hover:bg-red-600"
  }
  const getTipBg = (v: number) => {
    if (v <= 3) return "bg-green-600 border-green-700"
    if (v <= 5) return "bg-yellow-600 border-yellow-700"
    return "bg-red-600 border-red-700"
  }
  const getTextColor = (v: number) => {
    if (v <= 3) return "text-green-600"
    if (v <= 5) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className={`font-medium min-w-[50px] ${getTextColor(avg)}`}>±{avg.toFixed(2)}</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, i) => (
            <Tooltip key={i} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getBarColor(item.value)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.value / maxMargin) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTipBg(item.value)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{item.name}</div>
                  <div>Error Margin: ±{item.value.toFixed(2)}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

function BatchCorrelationMiniGraph({ devices }: { devices: InlabBatchDevice[] }) {
  if (!devices || devices.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }
  const values = devices.map((d) => ({
    name: d.device_name,
    value: d.correlation !== undefined && d.correlation !== null
      ? d.correlation
      : computeDeviceCorrelation(d.data),
  }))
  const valid = values.filter((v) => v.value !== null && !isNaN(v.value as number)) as { name: string; value: number }[]
  const avg = valid.length ? valid.reduce((a, v) => a + v.value, 0) / valid.length : null

  const getBarColor = (v: number) => {
    if (v >= 0.9) return "bg-green-500 hover:bg-green-600"
    if (v >= 0.7) return "bg-yellow-500 hover:bg-yellow-600"
    return "bg-red-500 hover:bg-red-600"
  }
  const getTipBg = (v: number) => {
    if (v >= 0.9) return "bg-green-600 border-green-700"
    if (v >= 0.7) return "bg-yellow-600 border-yellow-700"
    return "bg-red-600 border-red-700"
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="font-medium min-w-[50px]">
          {avg !== null ? avg.toFixed(2) : "N/A"}
        </span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, i) => {
            const v = item.value
            const display = v !== null && !isNaN(v as number) ? (v as number) : 0
            const heightVal = Math.max(0, Math.min(1, display))
            return (
              <Tooltip key={i} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className={`w-1.5 rounded-t-full ${
                      v === null || isNaN(v as number)
                        ? "bg-gray-300"
                        : getBarColor(v as number)
                    } transition-all cursor-pointer`}
                    style={{ height: `${Math.max(4, heightVal * 32)}px` }}
                  />
                </TooltipTrigger>
                <TooltipContent
                  className={`${
                    v === null || isNaN(v as number)
                      ? "bg-gray-600 border-gray-700"
                      : getTipBg(v as number)
                  } text-white border`}
                >
                  <div className="text-xs font-medium">
                    <div>{item.name}</div>
                    <div>
                      Correlation:{" "}
                      {v !== null && !isNaN(v as number) ? (v as number).toFixed(3) : "N/A"}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

// --- Mini bar graph component for uptime history ---

function UptimeMiniGraph({ dailyData, averageUptime }: { dailyData: InlabDeviceDaily[]; averageUptime: number }) {
  if (!dailyData || dailyData.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }

  const values = dailyData.slice(-14)

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
        <span className="font-medium min-w-[50px]">{averageUptime?.toFixed(1) || 0}%</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getBarColor(item.uptime)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.uptime / 100) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTooltipBgColor(item.uptime)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{formatDate(item.date)}</div>
                  <div>Uptime: {item.uptime.toFixed(1)}%</div>
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
function ErrorMarginMiniGraph({ dailyData, averageMargin }: { dailyData: InlabDeviceDaily[]; averageMargin: number }) {
  if (!dailyData || dailyData.length === 0) {
    return <span className="text-muted-foreground">N/A</span>
  }

  const values = dailyData.slice(-14)
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
        <span className={`font-medium min-w-[50px] ${getTextColor(averageMargin)}`}>±{averageMargin?.toFixed(1) || 0}</span>
        <div className="flex items-end gap-[2px] h-8">
          {values.map((item, index) => (
            <Tooltip key={index} delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  className={`w-1.5 rounded-t-full ${getBarColor(item.error_margin)} transition-all cursor-pointer`}
                  style={{ height: `${Math.max(4, (item.error_margin / maxMargin) * 32)}px` }}
                />
              </TooltipTrigger>
              <TooltipContent className={`${getTooltipBgColor(item.error_margin)} text-white border`}>
                <div className="text-xs font-medium">
                  <div>{formatDate(item.date)}</div>
                  <div>Error Margin: ±{item.error_margin.toFixed(1)}</div>
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
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"inlab" | "dispatched">("inlab")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setDevicePage(1)
      setBatchPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])
  
  // Pagination State
  const [devicePage, setDevicePage] = useState(1)
  const [batchPage, setBatchPage] = useState(1)
  const limit = 20

  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [batchName, setBatchName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Date range filter (default: last 14 days)
  const getDefaultDateRange = () => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 14)
    const fmt = (d: Date) => d.toISOString().split("T")[0]
    return { from: fmt(start), to: fmt(end) }
  }
  // Pending values (bound to inputs) vs applied values (used in query)
  const [dateFrom, setDateFrom] = useState<string>(() => getDefaultDateRange().from)
  const [dateTo, setDateTo] = useState<string>(() => getDefaultDateRange().to)
  const [appliedDateFrom, setAppliedDateFrom] = useState<string>(() => getDefaultDateRange().from)
  const [appliedDateTo, setAppliedDateTo] = useState<string>(() => getDefaultDateRange().to)

  const datesDirty = dateFrom !== appliedDateFrom || dateTo !== appliedDateTo

  const startDateTime = useMemo(
    () => (appliedDateFrom ? new Date(`${appliedDateFrom}T00:00:00`).toISOString() : undefined),
    [appliedDateFrom]
  )
  const endDateTime = useMemo(
    () => (appliedDateTo ? new Date(`${appliedDateTo}T23:59:59`).toISOString() : undefined),
    [appliedDateTo]
  )

  // Fetch Inlab Devices
  const { data: devicesData, loading: loadingDevices, refetch: refetchDevices } = useApiData(
    () => getInlabDevices({
      skip: (devicePage - 1) * limit,
      limit,
      search: debouncedSearch,
      frequency: 'hourly',
      startDateTime,
      endDateTime,
    }),
    [devicePage, limit, debouncedSearch, startDateTime, endDateTime]
  )

  // Fetch Batches
  const { data: batchesData, loading: loadingBatches, refetch: refetchBatches } = useApiData(
    () => getBatches({ skip: (batchPage - 1) * limit, limit, search: debouncedSearch }),
    [batchPage, limit, debouncedSearch]
  )

  // Computations
  const allDevices = devicesData?.devices || []
  const allBatches = batchesData?.batches || []

  const filteredInlabDevices = allDevices
  const filteredDispatched = allBatches

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedDevices.length === filteredInlabDevices.length) {
      setSelectedDevices([])
    } else {
      setSelectedDevices(filteredInlabDevices.map((d) => d.device_id))
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      await createBatch({
        name: batchName,
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
        device_ids: selectedDevices,
      })
      toast.success("Batch created successfully")
      setIsCreateDialogOpen(false)
      setBatchName("")
      setStartDate("")
      setEndDate("")
      setSelectedDevices([])
      await refetchBatches()
      setActiveTab("dispatched")
    } catch (error: any) {
      toast.error(error.message || "Failed to create batch")
    } finally {
      setIsCreating(false)
    }
  }

  const handleRefresh = () => {
    if (activeTab === "inlab") {
      refetchDevices()
    } else {
      refetchBatches()
    }
  }

  // Calculate high-level summary (rough approximations based on current page data if meta doesn't provide it)
  const totalBatches = batchesData?.meta?.total || 0
  
  // Calculate average uptime/error margin across all loaded inlab devices
  const inlabUptimeAvg = allDevices.length ? 
    allDevices.reduce((acc, d) => acc + (d.uptime || 0), 0) / allDevices.length : 0
  const inlabErrorAvg = allDevices.length ? 
    allDevices.reduce((acc, d) => acc + (d.error_margin || 0), 0) / allDevices.length : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inlab Collocation</h1>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={selectedDevices.length === 0} className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Batch {selectedDevices.length > 0 && `(${selectedDevices.length})`}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateBatch}>
                <DialogHeader>
                  <DialogTitle>Create Collocation Batch</DialogTitle>
                  <DialogDescription>
                    Create a new dispatch collocation batch for {selectedDevices.length} selected devices.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="batch-name">Batch Name</Label>
                    <Input
                      id="batch-name"
                      placeholder="e.g. MANHICA Batch"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs font-medium mb-2">Selected Devices:</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedDevices.map((id) => {
                        const device = allDevices.find((d) => d.device_id === id)
                        return (
                          <div key={id} className="text-xs flex items-center justify-between">
                            <span>{device?.device_name}</span>
                            <span className="text-muted-foreground">{device?.network_id}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Batch"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleRefresh} disabled={loadingDevices || loadingBatches}>
            <RefreshCw className={`mr-2 h-4 w-4 ${(loadingDevices || loadingBatches) ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
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
            <div className="text-3xl font-bold">{totalBatches}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered batches</p>
          </CardContent>
        </Card>

        {/* Inlab Performance Uptime */}
        <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-500" />
              Average Inlab Uptime
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <div className="text-3xl font-bold">{inlabUptimeAvg.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Current page average</p>
            </div>
          </CardContent>
        </Card>

        {/* Inlab Error Margin */}
        <Card className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-blue-500" />
              Average Inlab Error Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <div className="text-3xl font-bold">±{inlabErrorAvg.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">Current page average</p>
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
          {/* Search & Date Filters */}
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={activeTab === "inlab" ? "Search by device name, category, network..." : "Search by batch name..."}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === "inlab" && (
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex flex-col">
                  <Label htmlFor="filter-from" className="text-xs text-muted-foreground mb-1">From</Label>
                  <Input
                    id="filter-from"
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-[150px]"
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="filter-to" className="text-xs text-muted-foreground mb-1">To</Label>
                  <Input
                    id="filter-to"
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-[150px]"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!datesDirty || !dateFrom || !dateTo}
                  onClick={() => {
                    setAppliedDateFrom(dateFrom)
                    setAppliedDateTo(dateTo)
                    setDevicePage(1)
                  }}
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const { from, to } = getDefaultDateRange()
                    setDateFrom(from)
                    setDateTo(to)
                    setAppliedDateFrom(from)
                    setAppliedDateTo(to)
                    setDevicePage(1)
                  }}
                >
                  Last 14 days
                </Button>
              </div>
            )}
          </div>

          {/* Inlab Devices Table */}
          {activeTab === "inlab" && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-4 text-left w-10">
                        <Checkbox
                          checked={
                            filteredInlabDevices.length > 0 &&
                            selectedDevices.length === filteredInlabDevices.length
                          }
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </th>
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
                    {loadingDevices ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          Loading devices...
                        </td>
                      </tr>
                    ) : filteredInlabDevices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          No inlab devices found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredInlabDevices.map((device) => (
                        <tr
                          key={device.device_id}
                          className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                            selectedDevices.includes(device.device_id) ? "bg-primary/5" : ""
                          }`}
                          onClick={() => toggleDeviceSelection(device.device_id)}
                        >
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedDevices.includes(device.device_id)}
                              onCheckedChange={() => toggleDeviceSelection(device.device_id)}
                              aria-label={`Select ${device.device_name}`}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{device.device_name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{formatCategoryLabel(device.category)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{device.data?.[0]?.channel_id || "N/A"}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                              {device.network_id || "N/A"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                              {device.firmware || "N/A"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <UptimeMiniGraph
                              dailyData={device.daily}
                              averageUptime={device.uptime}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getMarginBadgeColor(device.error_margin)}>
                              ±{device.error_margin?.toFixed(2)}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {devicesData?.meta && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min((devicePage - 1) * limit + 1, devicesData.meta.total)} to {Math.min(devicePage * limit, devicesData.meta.total)} of {devicesData.meta.total} devices
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDevicePage(p => Math.max(1, p - 1))}
                      disabled={devicePage === 1 || loadingDevices}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span className="text-sm px-2">Page {devicePage} of {devicesData.meta.totalPages || 1}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDevicePage(p => p + 1)}
                      disabled={devicePage >= (devicesData.meta.totalPages || 1) || loadingDevices}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Dispatched Collocation Table */}
          {activeTab === "dispatched" && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Number of Devices</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Avg Uptime</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Avg Error Margin</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Avg Correlation</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Start Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">End Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBatches ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          Loading batches...
                        </td>
                      </tr>
                    ) : filteredDispatched.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          No dispatched collocations found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredDispatched.map((batch) => (
                        <tr
                          key={batch.id}
                          className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/dashboard/collocation/inlab/${batch.id}`)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium">{batch.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                              {batch.device_count || batch.devices?.length || 0}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <BatchUptimeMiniGraph devices={batch.devices || []} />
                          </td>
                          <td className="py-3 px-4">
                            <BatchErrorMarginMiniGraph devices={batch.devices || []} />
                          </td>
                          <td className="py-3 px-4">
                            <BatchCorrelationMiniGraph devices={batch.devices || []} />
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {batch.created_at ? new Date(batch.created_at).toLocaleDateString() : "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {batchesData?.meta && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min((batchPage - 1) * limit + 1, batchesData.meta.total)} to {Math.min(batchPage * limit, batchesData.meta.total)} of {batchesData.meta.total} batches
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setBatchPage(p => Math.max(1, p - 1))}
                      disabled={batchPage === 1 || loadingBatches}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span className="text-sm px-2">Page {batchPage} of {batchesData.meta.totalPages || 1}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setBatchPage(p => p + 1)}
                      disabled={batchPage >= (batchesData.meta.totalPages || 1) || loadingBatches}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
