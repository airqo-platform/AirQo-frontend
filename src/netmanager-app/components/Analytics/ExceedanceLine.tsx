"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts"
import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"
import { ArrowRight, BarChart3, Download, LineChartIcon, MoreHorizontal, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import createAxiosInstance from "@/core/apis/axiosConfig"
import { EXCEEDANCES_DATA_URI, DEVICE_EXCEEDANCES_URI } from "@/core/urls"
import { Device } from '@/app/types/devices'

interface AnalyticsSite {
  _id: string
  name?: string
  description?: string
  generated_name?: string
}


interface ChartData {
  name: string
  Good: number
  Moderate: number
  UHFSG: number
  Unhealthy: number
  VeryUnhealthy: number
  Hazardous: number
  device_id?: string
  site?: {
    name?: string
    description?: string
    generated_name?: string
  }
  exceedance?: {
    Good: number
    Moderate: number
    UHFSG: number
    Unhealthy: number
    VeryUnhealthy: number
    Hazardous: number
  }
  exceedances?: {
    Good: number
    Moderate: number
    UHFSG: number
    Unhealthy: number
    VeryUnhealthy: number
    Hazardous: number
  }
  total?: number
}

interface TooltipPayload {
  name: string
  value: number
  fill: string
  stroke?: string
}

interface ExceedancesChartProps {
  analyticsSites: AnalyticsSite[]
  analyticsDevices: Device[]
  isGrids: boolean
  isCohorts: boolean
}

const chartConfig = {
  Good: { label: "Good", color: "hsl(120, 100%, 30%)" },
  Moderate: { label: "Moderate", color: "hsl(60, 100%, 50%)" },
  UHFSG: { label: "Unhealthy for Sensitive Groups", color: "hsl(30, 100%, 50%)" },
  Unhealthy: { label: "Unhealthy", color: "hsl(0, 100%, 50%)" },
  VeryUnhealthy: { label: "Very Unhealthy", color: "hsl(300, 100%, 25%)" },
  Hazardous: { label: "Hazardous", color: "hsl(0, 0%, 20%)" },
}

type ChartType = "bar" | "line" | "pie"

export const ExceedancesChart: React.FC<ExceedancesChartProps> = ({
  analyticsSites,
  analyticsDevices,
  isGrids,
  isCohorts,
}) => {
  const [loading, setLoading] = useState(false)
  const [averageSites, setAverageSites] = useState<string[]>([])
  const [averageDevices, setAverageDevices] = useState<string[]>([])
  const [dataset, setDataset] = useState<ChartData[]>([])
  const [pollutant, setPollutant] = useState({ value: "pm2_5", label: "PM 2.5" })
  const [standard, setStandard] = useState({ value: "aqi", label: "AQI" })
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false)
  const [allLocationsDialogOpen, setAllLocationsDialogOpen] = useState(false)
  const [allLocationsData, setAllLocationsData] = useState<ChartData[]>([])
  const [tempPollutant, setTempPollutant] = useState(pollutant)
  const [tempStandard, setTempStandard] = useState(standard)
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [detailChartType, setDetailChartType] = useState<ChartType>("bar")

  const chartRef = useRef<HTMLDivElement>(null)
  const detailsChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isGrids) {
      const siteOptions = analyticsSites.map((site) => site._id)
      setAverageSites(siteOptions)
    }
  }, [analyticsSites, isGrids])

  useEffect(() => {
    if (isCohorts) {
      const deviceOptions = analyticsDevices.map((device) => device.long_name)
      setAverageDevices(deviceOptions)
    }
  }, [analyticsDevices, isCohorts])

  useEffect(() => {
    const fetchData = async () => {
      if ((isGrids && !averageSites.length) || (isCohorts && !averageDevices.length)) {
        return
      }

      setLoading(true)
      const filter = {
        pollutant: pollutant.value,
        standard: standard.value,
        startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        ...(isGrids ? { sites: averageSites } : { devices: averageDevices }),
      }

      try {
        const response = await createAxiosInstance().post(
          isCohorts ? DEVICE_EXCEEDANCES_URI : EXCEEDANCES_DATA_URI,
          filter,
        )
        const responseData = response.data
        const exceedanceData = responseData.data

        // Sort data alphabetically by location name
        exceedanceData.sort((a: ChartData, b: ChartData) => {
          const aName = isCohorts
            ? a.device_id?.trim()
            : (a.site?.name || a.site?.description || a.site?.generated_name)?.trim()
          const bName = isCohorts
            ? b.device_id?.trim()
            : (b.site?.name || b.site?.description || b.site?.generated_name)?.trim()

          if (!aName || !bName) return 0
          return aName.localeCompare(bName)
        })

        // Process data for chart display
        const processedData = exceedanceData.map((item: ChartData) => {
          const name = isCohorts
            ? item.device_id
            : item.site?.name || item.site?.description || item.site?.generated_name

          const exceedanceValues = isCohorts ? item.exceedances : item.exceedance

          return {
            name,
            ...exceedanceValues,
            device_id: item.device_id,
            site: item.site,
            total: item.total,
            exceedance: item.exceedance,
            exceedances: item.exceedances,
          }
        })

        const mainChartData = processedData.slice(0, 10)
        setDataset(mainChartData)
        setAllLocationsData(processedData)
      } catch {
        setDataset([])
        setAllLocationsData([])
      }
      setLoading(false)
    }

    fetchData()
  }, [averageSites, averageDevices, isGrids, isCohorts, pollutant, standard])

  const handleCustomize = () => {
    setPollutant(tempPollutant)
    setStandard(tempStandard)
    setCustomizeDialogOpen(false)
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: (entry as TooltipPayload).fill || (entry as TooltipPayload).stroke }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const truncateText = (text: string | undefined) => {
    if (!text) return ""
    return text.length > 4 ? `${text.substring(0, 4)}...` : text
  }

  const exportToPNG = async (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return

    try {
      const dataUrl = await toPng(ref.current, { quality: 1 })
      const link = document.createElement("a")
      link.download = `exceedance-chart-${new Date().toISOString().split("T")[0]}.png`
      link.href = dataUrl
      link.click()
    } catch {
      return
    }
  }

  const exportToPDF = async (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return

    try {
      const dataUrl = await toPng(ref.current, { quality: 1 })
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
      })

      const imgWidth = 280
      const imgHeight = (ref.current.offsetHeight * imgWidth) / ref.current.offsetWidth

      pdf.addImage(dataUrl, "PNG", 10, 10, imgWidth, imgHeight)
      pdf.save(`exceedance-chart-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error exporting to PDF:", error)
    }
  }

  const printChart = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return

    toPng(ref.current, { quality: 1 })
      .then((dataUrl) => {
        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        printWindow.document.write(`
          <html>
            <head>
              <title>Exceedance Chart</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="Exceedance Chart" />
              <script>
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      })
      .catch((error) => console.error("Error printing chart:", error))
  }

  const preparePieChartData = (data: ChartData[]) => {
    // Initialize counters for each category
    const totals = {
      Good: 0,
      Moderate: 0,
      UHFSG: 0,
      Unhealthy: 0,
      VeryUnhealthy: 0,
      Hazardous: 0,
    }

    // Sum up values across all locations
    data.forEach((item) => {
      const exceedanceData = isCohorts ? item.exceedances : item.exceedance
      if (exceedanceData) {
        totals.Good += exceedanceData.Good || 0
        totals.Moderate += exceedanceData.Moderate || 0
        totals.UHFSG += exceedanceData.UHFSG || 0
        totals.Unhealthy += exceedanceData.Unhealthy || 0
        totals.VeryUnhealthy += exceedanceData.VeryUnhealthy || 0
        totals.Hazardous += exceedanceData.Hazardous || 0
      }
    })

    return [
      { name: "Good", value: totals.Good, color: chartConfig.Good.color },
      { name: "Moderate", value: totals.Moderate, color: chartConfig.Moderate.color },
      { name: "Unhealthy for Sensitive Groups", value: totals.UHFSG, color: chartConfig.UHFSG.color },
      { name: "Unhealthy", value: totals.Unhealthy, color: chartConfig.Unhealthy.color },
      { name: "Very Unhealthy", value: totals.VeryUnhealthy, color: chartConfig.VeryUnhealthy.color },
      { name: "Hazardous", value: totals.Hazardous, color: chartConfig.Hazardous.color },
    ].filter((item) => item.value > 0)
  }

  return (
    <Card className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          {pollutant.label} Exceedances Over the Past 28 Days Based on {standard.label}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex border rounded-md">
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="sm"
              className="px-2 h-8"
              onClick={() => setChartType("bar")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "line" ? "secondary" : "ghost"}
              size="sm"
              className="px-2 h-8"
              onClick={() => setChartType("line")}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCustomizeDialogOpen(true)}>Customize Chart</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPNG(chartRef)}>
                <Download className="mr-2 h-4 w-4" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(chartRef)}>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printChart(chartRef)}>
                <Printer className="mr-2 h-4 w-4" />
                Print Chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : dataset.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <div className="h-[300px] w-full" ref={chartRef}>
            <ChartContainer
              config={{
                Good: {
                  label: "Good",
                  color: chartConfig.Good.color,
                },
                Moderate: {
                  label: "Moderate",
                  color: chartConfig.Moderate.color,
                },
                UHFSG: {
                  label: "Unhealthy for Sensitive Groups",
                  color: chartConfig.UHFSG.color,
                },
                Unhealthy: {
                  label: "Unhealthy",
                  color: chartConfig.Unhealthy.color,
                },
                VeryUnhealthy: {
                  label: "Very Unhealthy",
                  color: chartConfig.VeryUnhealthy.color,
                },
                Hazardous: {
                  label: "Hazardous",
                  color: chartConfig.Hazardous.color,
                },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart
                    data={dataset}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                      tickFormatter={truncateText}
                      label={{
                        value: isCohorts ? "Devices" : "",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis label={{ value: "Exceedances", angle: -90, position: "insideLeft" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="UHFSG" stackId="a" fill="var(--color-UHFSG)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Unhealthy" stackId="a" fill="var(--color-Unhealthy)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="VeryUnhealthy" stackId="a" fill="var(--color-VeryUnhealthy)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Hazardous" stackId="a" fill="var(--color-Hazardous)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart
                    data={dataset}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                      tickFormatter={truncateText}
                      label={{
                        value: isCohorts ? "Devices" : "",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis label={{ value: "Exceedances", angle: -90, position: "insideLeft" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="UHFSG"
                      stroke="var(--color-UHFSG)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Unhealthy"
                      stroke="var(--color-Unhealthy)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="VeryUnhealthy"
                      stroke="var(--color-VeryUnhealthy)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Hazardous"
                      stroke="var(--color-Hazardous)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                  )
                }
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
        {dataset.length > 0 && (
          <div className="flex justify-end mt-4">
            <Button variant="link" onClick={() => setAllLocationsDialogOpen(true)}>
              View all Exceedances <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Customize Dialog */}
      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customize Chart</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pollutant" className="text-right">
                Pollutant
              </Label>
              <Select
                value={tempPollutant.value}
                onValueChange={(value) =>
                  setTempPollutant({
                    value,
                    label: value === "pm2_5" ? "PM 2.5" : value === "pm10" ? "PM 10" : value.toUpperCase(),
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pollutant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pm2_5">PM 2.5</SelectItem>
                  <SelectItem value="pm10">PM 10</SelectItem>
                  <SelectItem value="no2">NO₂</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="standard" className="text-right">
                Standard
              </Label>
              <Select
                value={tempStandard.value}
                onValueChange={(value) =>
                  setTempStandard({
                    value,
                    label: value.toUpperCase(),
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aqi">AQI</SelectItem>
                  <SelectItem value="who">WHO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomizeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomize}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={allLocationsDialogOpen} onOpenChange={setAllLocationsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Detailed Exceedance Data</DialogTitle>
            <div className="flex items-center space-x-2">
              <div className="flex border rounded-md">
                <Button
                  variant={detailChartType === "bar" ? "secondary" : "ghost"}
                  size="sm"
                  className="px-2 h-8"
                  onClick={() => setDetailChartType("bar")}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={detailChartType === "line" ? "secondary" : "ghost"}
                  size="sm"
                  className="px-2 h-8"
                  onClick={() => setDetailChartType("line")}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={detailChartType === "pie" ? "secondary" : "ghost"}
                  size="sm"
                  className="px-2 h-8"
                  onClick={() => setDetailChartType("pie")}
                >
                  <span className="h-4 w-4 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  </span>
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportToPNG(detailsChartRef)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToPDF(detailsChartRef)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => printChart(detailsChartRef)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Charts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogHeader>
          <div ref={detailsChartRef}>
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="combined">Combined View</TabsTrigger>
                <TabsTrigger value="pie">Pie Chart</TabsTrigger>
              </TabsList>
              <TabsContent value="grid" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {allLocationsData.map((item, index) => {
                    const locationName = isCohorts
                      ? item.device_id
                      : item.site?.name || item.site?.description || item.site?.generated_name

                    const exceedanceData = isCohorts ? item.exceedances : item.exceedance

                    if (!exceedanceData) return null

                    return (
                      <Card key={index} className="w-full">
                        <CardHeader>
                          <CardTitle className="text-center text-primary text-sm">{locationName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px]">
                            <ChartContainer
                              config={{
                                Good: {
                                  label: "Good",
                                  color: chartConfig.Good.color,
                                },
                                Moderate: {
                                  label: "Moderate",
                                  color: chartConfig.Moderate.color,
                                },
                                UHFSG: {
                                  label: "Unhealthy for Sensitive Groups",
                                  color: chartConfig.UHFSG.color,
                                },
                                Unhealthy: {
                                  label: "Unhealthy",
                                  color: chartConfig.Unhealthy.color,
                                },
                                VeryUnhealthy: {
                                  label: "Very Unhealthy",
                                  color: chartConfig.VeryUnhealthy.color,
                                },
                                Hazardous: {
                                  label: "Hazardous",
                                  color: chartConfig.Hazardous.color,
                                },
                              }}
                              className="w-full h-full"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                  {detailChartType === "bar" ? (
                                    <BarChart
                                      data={[
                                        {
                                          category: "AQI Levels",
                                          ...exceedanceData,
                                        },
                                      ]}
                                      margin={{
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 20,
                                      }}
                                    >
                                      <XAxis dataKey="category" />
                                      <YAxis />
                                      <Tooltip content={<CustomTooltip />} />
                                      <Bar dataKey="Good" stackId="a" fill="var(--color-Good)" />
                                      <Bar dataKey="Moderate" stackId="a" fill="var(--color-Moderate)" />
                                      <Bar dataKey="UHFSG" stackId="a" fill="var(--color-UHFSG)" />
                                      <Bar dataKey="Unhealthy" stackId="a" fill="var(--color-Unhealthy)" />
                                      <Bar dataKey="VeryUnhealthy" stackId="a" fill="var(--color-VeryUnhealthy)" />
                                      <Bar dataKey="Hazardous" stackId="a" fill="var(--color-Hazardous)" />
                                    </BarChart>
                                  ) : (
                                    <LineChart
                                      data={[
                                        {
                                          category: "AQI Levels",
                                          ...exceedanceData,
                                        },
                                      ]}
                                      margin={{
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 20,
                                      }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="category" />
                                      <YAxis />
                                      <Tooltip content={<CustomTooltip />} />
                                      <Line
                                        type="monotone"
                                        dataKey="Good"
                                        stroke="var(--color-Good)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="Moderate"
                                        stroke="var(--color-Moderate)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="UHFSG"
                                        stroke="var(--color-UHFSG)"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                      />
                                    </LineChart>
                                  )}
                                </ResponsiveContainer>
                            </ChartContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
              <TabsContent value="combined" className="mt-4">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-center text-primary">Combined Exceedance Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ChartContainer
                        config={{
                          Good: {
                            label: "Good",
                            color: chartConfig.Good.color,
                          },
                          Moderate: {
                            label: "Moderate",
                            color: chartConfig.Moderate.color,
                          },
                          UHFSG: {
                            label: "Unhealthy for Sensitive Groups",
                            color: chartConfig.UHFSG.color,
                          },
                          Unhealthy: {
                            label: "Unhealthy",
                            color: chartConfig.Unhealthy.color,
                          },
                          VeryUnhealthy: {
                            label: "Very Unhealthy",
                            color: chartConfig.VeryUnhealthy.color,
                          },
                          Hazardous: {
                            label: "Hazardous",
                            color: chartConfig.Hazardous.color,
                          },
                        }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          {detailChartType === "bar" ? (
                            <BarChart
                              data={allLocationsData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 60,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 12 }}
                                tickFormatter={truncateText}
                                label={{
                                  value: isCohorts ? "Devices" : "",
                                  position: "insideBottom",
                                  offset: -10,
                                }}
                              />
                              <YAxis label={{ value: "Exceedances", angle: -90, position: "insideLeft" }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="UHFSG" stackId="a" fill="var(--color-UHFSG)" radius={[4, 4, 0, 0]} />
                              <Bar
                                dataKey="Unhealthy"
                                stackId="a"
                                fill="var(--color-Unhealthy)"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="VeryUnhealthy"
                                stackId="a"
                                fill="var(--color-VeryUnhealthy)"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="Hazardous"
                                stackId="a"
                                fill="var(--color-Hazardous)"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          ) : detailChartType === "line" ? (
                            <LineChart
                              data={allLocationsData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 60,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 12 }}
                                tickFormatter={truncateText}
                                label={{
                                  value: isCohorts ? "Devices" : "",
                                  position: "insideBottom",
                                  offset: -10,
                                }}
                              />
                              <YAxis label={{ value: "Exceedances", angle: -90, position: "insideLeft" }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="UHFSG"
                                stroke="var(--color-UHFSG)"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="Unhealthy"
                                stroke="var(--color-Unhealthy)"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="VeryUnhealthy"
                                stroke="var(--color-VeryUnhealthy)"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="Hazardous"
                                stroke="var(--color-Hazardous)"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          ) : (
                            <PieChart>
                              <Pie
                                data={preparePieChartData(allLocationsData)}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {preparePieChartData(allLocationsData).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} exceedances`, ""]} />
                              <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                          )}
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="pie" className="mt-4">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-center text-primary">Exceedance Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ChartContainer
                        config={{
                          Good: {
                            label: "Good",
                            color: chartConfig.Good.color,
                          },
                          Moderate: {
                            label: "Moderate",
                            color: chartConfig.Moderate.color,
                          },
                          UHFSG: {
                            label: "Unhealthy for Sensitive Groups",
                            color: chartConfig.UHFSG.color,
                          },
                          Unhealthy: {
                            label: "Unhealthy",
                            color: chartConfig.Unhealthy.color,
                          },
                          VeryUnhealthy: {
                            label: "Very Unhealthy",
                            color: chartConfig.VeryUnhealthy.color,
                          },
                          Hazardous: {
                            label: "Hazardous",
                            color: chartConfig.Hazardous.color,
                          },
                        }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={preparePieChartData(allLocationsData)}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={150}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {preparePieChartData(allLocationsData).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} exceedances`, ""]} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button onClick={() => setAllLocationsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
