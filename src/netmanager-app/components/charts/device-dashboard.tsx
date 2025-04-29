"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MultiSeriesChart } from "@/components/charts/multi-series-chart"
import { SensorChart } from "@/components/charts/sensor-chart"
import { useChartConfigs } from "@/core/hooks/useChartConfigs"

interface DeviceDashboardProps {
  deviceId: string
  deviceType?: string
}

export function DeviceDashboard({ deviceId, deviceType = "default" }: DeviceDashboardProps) {
  const [timeRange, setTimeRange] = useState("7")
  const { chartConfigs, isLoading, error } = useChartConfigs(deviceId)

  // Define multi-series chart configurations
  const multiSeriesConfigs = [
    {
      id: "air-quality",
      title: "Air Quality Metrics",
      xAxisLabel: "Time",
      yAxisLabel: "Value",
      series: [
        { fieldId: "pm2_5", label: "PM2.5 (μg/m³)", color: "#d62020", chartType: "Line" as const },
        { fieldId: "pm10", label: "PM10 (μg/m³)", color: "#2080d6", chartType: "Line" as const },
      ],
    },
    {
      id: "environmental",
      title: "Environmental Conditions",
      xAxisLabel: "Time",
      yAxisLabel: "Value",
      series: [{ fieldId: "battery", label: "Battery", color: "#20d680", chartType: "Area" as const }],
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-[300px] w-full bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
        Error loading charts: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Device Dashboard</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="timeRange">Time Range:</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="timeRange" className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 Hours</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Custom Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {multiSeriesConfigs.map((config) => (
            <Card key={config.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{config.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <MultiSeriesChart
                    deviceId={deviceId}
                    title={config.title}
                    xAxisLabel={config.xAxisLabel}
                    yAxisLabel={config.yAxisLabel}
                    days={Number.parseInt(timeRange)}
                    results={100}
                    showLegend={true}
                    showGrid={true}
                    series={config.series}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {chartConfigs.map((config) => (
              <Card key={config._id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{config.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <SensorChart
                      config={{
                        ...config,
                        days: Number.parseInt(timeRange),
                      }}
                      deviceId={deviceId}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
