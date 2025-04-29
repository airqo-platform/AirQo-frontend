"use client"

import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import { useSensorData } from "@/core/hooks/useSensorData"
import { ChartContainer } from "@/components/ui/chart"
import {
  Area,
  Bar,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ComposedChart,
} from "recharts"
import { useEffect, useState } from "react"

interface SeriesConfig {
  fieldId: string
  label: string
  color: string
  chartType: "Line" | "Area" | "Bar" | "Column"
}

interface MultiSeriesChartProps {
  deviceId: string
  title: string
  xAxisLabel: string
  yAxisLabel: string
  days: number
  results: number
  showLegend: boolean
  showGrid: boolean
  series: SeriesConfig[]
}

interface SeriesData {
    config: SeriesConfig
    data?: {
      labels: string[]
      values: number[]
    }
  }

export function MultiSeriesChart({
  deviceId,
  xAxisLabel,
  yAxisLabel,
  days,
  results,
  showLegend,
  showGrid,
  series,
}: MultiSeriesChartProps) {
  // Create chart config for shadcn/ui chart
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {}
    series.forEach((s) => {
      config[s.fieldId] = {
        label: s.label,
        color: s.color,
      }
    })
    return config
  }, [series])

  // Generate a unique ID for the chart
  const chartId = useMemo(() => `multi-chart-${deviceId}-${Date.now()}`, [deviceId])

  // Fetch data for each series
  // const seriesData = useMemo(() => {
  //   return series.map((s) => ({
  //     config: s,
  //     ...useSensorData(deviceId, s.fieldId, days, results),
  //   }))
  // }, [deviceId, days, results, series])

  const [seriesData, setSeriesData] = useState<SeriesData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setHasError(false)
      try {
        const data = await Promise.all(
          series.map(async (s) => {
            const sensorData = useSensorData(deviceId, s.fieldId, days, results)
            return {
              config: s,
              ...sensorData,
            }
          }),
        )
        setSeriesData(data)
      } catch (error) {
        console.error("Error fetching data:", error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [deviceId, days, results, series])

  // Check if any series is still loading
//   const isLoadingCheck = seriesData.some((s) => s.isLoading)

  // Check if any series has an error
//   const hasErrorCheck = seriesData.some((s) => s.error)

  // Format data for Recharts - merge all series data by timestamp
  const chartData = useMemo(() => {
    if (isLoading || hasError || seriesData.length === 0) return []

    // Get the first series data to use as a base
    const firstSeries = seriesData[0]
    if (!firstSeries.data) return []

    // Create a map of timestamps to data points
    const dataMap = new Map()

    // Initialize with timestamps from the first series
    firstSeries.data.labels.forEach((label, index) => {
      dataMap.set(label, {
        timestamp: label,
        [firstSeries.config.fieldId]: firstSeries.data?.values[index],
      })
    })

    // Add data from other series
    for (let i = 1; i < seriesData.length; i++) {
      const series = seriesData[i]
      if (!series.data) continue

      series.data.labels.forEach((label, index) => {
        if (dataMap.has(label)) {
          // Add to existing timestamp
          const entry = dataMap.get(label)
          entry[series.config.fieldId] = series.data?.values[index]
          dataMap.set(label, entry)
        } else {
          // Create new timestamp entry
          const entry: Record<string, any> = { timestamp: label }
          entry[series.config.fieldId] = series.data?.values[index]
          dataMap.set(label, entry)
        }
      })
    }

    // Convert map to array and sort by timestamp
    return Array.from(dataMap.values()).sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    })
  }, [seriesData, isLoading, hasError])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (hasError) {
    return <div className="flex items-center justify-center h-full text-destructive text-sm">Error loading data</div>
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>
    )
  }

  // Custom tooltip component
  interface CustomTooltipProps {
    active?: boolean;
    payload?: { payload: { timestamp: string }; name: string; value?: number; color: string }[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md">
          <p className="text-sm font-medium">{`Time: ${payload[0].payload.timestamp}`}</p>
          {payload.map((entry: { payload: { timestamp: string }; name: string; value?: number; color: string }, index: number) => (
            <p key={`item-${index}`} className="text-sm text-muted-foreground" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value?.toFixed(2) || "N/A"}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer id={chartId} config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="timestamp" label={{ value: xAxisLabel, position: "insideBottom", offset: -5 }} height={50} />
          <YAxis label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}

          {series.map((s) => {
            if (s.chartType === "Line") {
              return (
                <Line
                  key={s.fieldId}
                  type="monotone"
                  dataKey={s.fieldId}
                  name={s.label}
                  stroke={s.color}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              )
            }

            if (s.chartType === "Area") {
              return (
                <Area
                  key={s.fieldId}
                  type="monotone"
                  dataKey={s.fieldId}
                  name={s.label}
                  stroke={s.color}
                  fill={`${s.color}20`}
                  activeDot={{ r: 8 }}
                />
              )
            }

            if (s.chartType === "Bar" || s.chartType === "Column") {
              return <Bar key={s.fieldId} dataKey={s.fieldId} name={s.label} fill={s.color} radius={4} />
            }

            return null
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
