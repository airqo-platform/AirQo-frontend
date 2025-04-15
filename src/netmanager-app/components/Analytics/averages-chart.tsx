"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts"
import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"
import { ArrowRight, BarChart3, Download, LineChartIcon, MoreHorizontal, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import createAxiosInstance from "@/core/apis/axiosConfig"
import { DAILY_MEAN_AVERAGES_URI, DEVICE_MEAN_AVERAGES_URI } from "@/core/urls"

interface AnalyticsSite {
  _id: string
  name?: string
  description?: string
  generated_name?: string
}

interface Device {
  _id: string
  name: string
  long_name: string
  [key: string]: string | number | boolean | undefined
}

interface ChartData {
  name: string
  value: number
  color: string
}

interface AveragesChartProps {
  analyticsSites: AnalyticsSite[]
  analyticsDevices: Device[]
  isGrids: boolean
  isCohorts: boolean
}

const chartConfig = {
  good: { label: "Good", color: "hsl(120, 100%, 30%)" },
  moderate: { label: "Moderate", color: "hsl(60, 100%, 50%)" },
  uhfsg: { label: "Unhealthy for Sensitive Groups", color: "hsl(30, 100%, 50%)" },
  unhealthy: { label: "Unhealthy", color: "hsl(0, 100%, 50%)" },
  veryUnhealthy: { label: "Very Unhealthy", color: "hsl(300, 100%, 25%)" },
  hazardous: { label: "Hazardous", color: "hsl(0, 0%, 20%)" },
}

type ChartType = "bar" | "line"

const pollutantOptions = [
  { value: "pm2_5", label: "PM 2.5" },
  { value: "pm10", label: "PM 10" },
  { value: "no2", label: "NO₂" },
]

const annotationMapper = {
  pm2_5: {
    value: 15,
    label: "WHO AQG",
  },
  pm10: {
    value: 45,
    label: "WHO AQG",
  },
  no2: {
    value: 25,
    label: "WHO AQG",
  },
}

const labelMapper = {
  pm2_5: "PM₂.₅(µg/m³)",
  pm10: "PM10 (µg/m³)",
  no2: "NO₂ (µg/m³)",
}

export const AveragesChart: React.FC<AveragesChartProps> = ({
  analyticsSites,
  analyticsDevices,
  isGrids,
  isCohorts,
}) => {
  const [loading, setLoading] = useState(false)
  const [averageSites, setAverageSites] = useState<string[]>([])
  const [averageDevices, setAverageDevices] = useState<string[]>([])
  const [dataset, setDataset] = useState<ChartData[]>([])
  const [allLocations, setAllLocations] = useState<ChartData[]>([])
  const [pollutant, setPollutant] = useState({ value: "pm2_5", label: "PM 2.5" })
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false)
  const [allLocationsDialogOpen, setAllLocationsDialogOpen] = useState(false)
  const [tempPollutant, setTempPollutant] = useState(pollutant)
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [customisedLabel, setCustomisedLabel] = useState(labelMapper[pollutant.value as keyof typeof labelMapper])
  const [customisedAnnotation, setCustomisedAnnotation] = useState(annotationMapper[pollutant.value as keyof typeof annotationMapper])

  const chartRef = useRef<HTMLDivElement>(null)
  const detailsChartRef = useRef<HTMLDivElement>(null)

  const chartTitle = `Mean Daily ${pollutant.label} Over the Past 28 Days`

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
      const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
      const endDate = new Date().toISOString()

      const filter = {
        startDate,
        endDate,
        pollutant: pollutant.value,
        ...(isGrids ? { sites: averageSites } : { devices: averageDevices }),
      }

      try {
        const response = await createAxiosInstance().post(
          isCohorts ? DEVICE_MEAN_AVERAGES_URI : DAILY_MEAN_AVERAGES_URI,
          filter,
        )
        const responseData = response.data
        const averagesData = responseData.data

        // Sort data alphabetically by location name
        const zippedArr = averagesData.labels.map((label: string, index: number) => ({
          name: label,
          value: averagesData.average_values[index],
          color: averagesData.background_colors[index],
        }))

        zippedArr.sort((a: ChartData, b: ChartData) => {
          const aName = a.name.trim()
          const bName = b.name.trim()
          return aName.localeCompare(bName)
        })

        setAllLocations(zippedArr)
        setDataset(zippedArr.slice(0, 10))
      } catch (error) {
        console.error("Error fetching average data:", error)
        setDataset([])
        setAllLocations([])
      }
      setLoading(false)
    }

    fetchData()
  }, [averageSites, averageDevices, isGrids, isCohorts, pollutant])

  const handleCustomize = () => {
    setPollutant(tempPollutant)
    setCustomisedLabel(labelMapper[tempPollutant.value as keyof typeof labelMapper])
    setCustomisedAnnotation(annotationMapper[tempPollutant.value as keyof typeof annotationMapper])
    setCustomizeDialogOpen(false)
  }

  // Function to truncate text to 4 characters
  const truncateText = (text: string | undefined) => {
    if (!text) return ""
    return text.length > 4 ? `${text.substring(0, 4)}...` : text
  }

  // Export functions
  const exportToPNG = async (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return

    try {
      const dataUrl = await toPng(ref.current, { quality: 1 })
      const link = document.createElement("a")
      link.download = `average-chart-${new Date().toISOString().split("T")[0]}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error exporting to PNG:", error)
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
      pdf.save(`average-chart-${new Date().toISOString().split("T")[0]}.pdf`)
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
              <title>Average Chart</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="Average Chart" />
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

  const getLocationStatus = (value: number) => {
    if (value <= 12.09) {
      return { status: "Good", color: chartConfig.good.color }
    } else if (value <= 35.49) {
      return { status: "Moderate", color: chartConfig.moderate.color }
    } else if (value <= 55.49) {
      return { status: "UHFSG", color: chartConfig.uhfsg.color }
    } else if (value <= 150.49) {
      return { status: "Unhealthy", color: chartConfig.unhealthy.color }
    } else if (value <= 250.49) {
      return { status: "Very Unhealthy", color: chartConfig.veryUnhealthy.color }
    } else {
      return { status: "Hazardous", color: chartConfig.hazardous.color }
    }
  }

  const LocationItem = ({ location }: { location: ChartData }) => {
    const { status, color } = getLocationStatus(location.value)

    return (
      <div className="flex justify-between items-center p-3 border rounded-md mb-2">
        <span className="font-bold text-primary">{location.name}</span>
        <Badge variant="outline" style={{ backgroundColor: color, color: "#fff" }}>
          {status}
        </Badge>
        <span className="font-bold">{location.value.toFixed(2)}</span>
      </div>
    )
  }

  const ProgressBars = () => {
    const barRanges = [
      { label: "Good:", min: 0, max: 12.09, color: chartConfig.good.color },
      { label: "Moderate:", min: 12.1, max: 35.49, color: chartConfig.moderate.color },
      { label: "Unhealthy For Sensitive Groups:", min: 35.5, max: 55.49, color: chartConfig.uhfsg.color },
      { label: "Unhealthy:", min: 55.5, max: 150.49, color: chartConfig.unhealthy.color },
      { label: "Very Unhealthy:", min: 150.5, max: 250.49, color: chartConfig.veryUnhealthy.color },
      { label: "Hazardous:", min: 250.5, max: 500, color: chartConfig.hazardous.color },
    ]

    const totalLocations = allLocations.length

    return (
      <Card className="w-full h-full">
        <CardContent className="space-y-4">
          {barRanges.map(({ label, min, max, color }, index) => {
            const count = allLocations.filter((item) => item.value >= min && item.value <= max).length
            const percentage = totalLocations > 0 ? (count / totalLocations) * 100 : 0

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{label}</span>
                  <span className="font-bold">{count} Locations</span>
                </div>
                <Progress value={percentage} className="h-2" style={{ backgroundColor: color }} />
              </div>
            )
          })}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{chartTitle}</CardTitle>
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
                good: {
                  label: "Good",
                  color: chartConfig.good.color,
                },
                moderate: {
                  label: "Moderate",
                  color: chartConfig.moderate.color,
                },
                uhfsg: {
                  label: "Unhealthy for Sensitive Groups",
                  color: chartConfig.uhfsg.color,
                },
                unhealthy: {
                  label: "Unhealthy",
                  color: chartConfig.unhealthy.color,
                },
                veryUnhealthy: {
                  label: "Very Unhealthy",
                  color: chartConfig.veryUnhealthy.color,
                },
                hazardous: {
                  label: "Hazardous",
                  color: chartConfig.hazardous.color,
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
                        value: isCohorts ? "Devices" : "Locations",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      label={{
                        value: customisedLabel,
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine
                      y={customisedAnnotation.value}
                      label={customisedAnnotation.label}
                      stroke="#666"
                      strokeDasharray="3 3"
                    />
                    <Bar dataKey="value" fill={chartConfig.moderate.color} radius={[4, 4, 0, 0]} name={customisedLabel} />
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
                        value: isCohorts ? "Devices" : "Locations",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      label={{
                        value: customisedLabel,
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine
                      y={customisedAnnotation.value}
                      label={customisedAnnotation.label}
                      stroke="#666"
                      strokeDasharray="3 3"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-good)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name={customisedLabel}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="link" onClick={() => setAllLocationsDialogOpen(true)}>
          View all {isCohorts ? "Devices" : "Locations"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>

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
                    label: value === "pm2_5" ? "PM 2.5" : value === "pm10" ? "PM 10" : "NO₂",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pollutant" />
                </SelectTrigger>
                <SelectContent>
                  {pollutantOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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

      {/* All Locations Dialog */}
      <Dialog open={allLocationsDialogOpen} onOpenChange={setAllLocationsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{chartTitle}</DialogTitle>
          </DialogHeader>
          <div ref={detailsChartRef}>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chart">Chart View</TabsTrigger>
                <TabsTrigger value="distribution">Distribution</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              <TabsContent value="chart" className="mt-4">
                <Card className="w-full">
                  <CardContent>
                    <div className="h-[400px]">
                      <ChartContainer
                        config={{
                          good: {
                            label: "Good",
                            color: chartConfig.good.color,
                          },
                          moderate: {
                            label: "Moderate",
                            color: chartConfig.moderate.color,
                          },
                        }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === "bar" ? (
                            <BarChart
                              data={allLocations}
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
                                  value: isCohorts ? "Devices" : "Locations",
                                  position: "insideBottom",
                                  offset: -10,
                                }}
                              />
                              <YAxis
                                label={{
                                  value: customisedLabel,
                                  angle: -90,
                                  position: "insideLeft",
                                }}
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <ReferenceLine
                                y={customisedAnnotation.value}
                                label={customisedAnnotation.label}
                                stroke="#666"
                                strokeDasharray="3 3"
                              />
                              <Bar
                                dataKey="value"
                                fill={chartConfig.moderate.color}
                                radius={[4, 4, 0, 0]}
                                name={customisedLabel}
                              />
                            </BarChart>
                          ) : (
                            <LineChart
                              data={allLocations}
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
                                  value: isCohorts ? "Devices" : "Locations",
                                  position: "insideBottom",
                                  offset: -10,
                                }}
                              />
                              <YAxis
                                label={{
                                  value: customisedLabel,
                                  angle: -90,
                                  position: "insideLeft",
                                }}
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <ReferenceLine
                                y={customisedAnnotation.value}
                                label={customisedAnnotation.label}
                                stroke="#666"
                                strokeDasharray="3 3"
                              />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={chartConfig.moderate.color}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                name={customisedLabel}
                              />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="distribution" className="mt-4">
                <ProgressBars />
              </TabsContent>
              <TabsContent value="list" className="mt-4">
                <div className="max-h-[500px] overflow-y-auto">
                  {allLocations.map((location, index) => (
                    <LocationItem key={index} location={location} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => exportToPNG(detailsChartRef)}>
                <Download className="mr-2 h-4 w-4" />
                Export as PNG
              </Button>
              <Button variant="outline" onClick={() => exportToPDF(detailsChartRef)}>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button onClick={() => setAllLocationsDialogOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
