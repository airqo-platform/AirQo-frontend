"use client"

import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import { useSensorData } from "@/core/hooks/useSensorData"
import { ChartContainer, ChartLegend } from "@/components/ui/chart"
import {
  Area,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  AreaChart,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts"

interface ChartConfig {
  _id: string
  fieldId: string
  title: string
  xAxisLabel: string
  yAxisLabel: string
  color: string
  backgroundColor: string
  chartType: string
  days: number
  results: number
  showLegend: boolean
  showGrid: boolean
  referenceLines?: {
    value: number
    label: string
    color: string
    style: string
  }[]
}

interface SensorChartProps {
  config: ChartConfig
  deviceId: string
}

export function SensorChart({ config, deviceId }: SensorChartProps) {
  const { data, isLoading, error } = useSensorData(deviceId, config.fieldId, config.days, config.results)

  // Format data for Recharts
  const chartData = useMemo(() => {
    if (!data) return []

    return data.labels.map((label, index) => ({
      timestamp: label,
      value: data.values[index],
    }))
  }, [data])

  // Generate a unique ID for the chart
  const chartId = useMemo(() => `chart-${config._id}`, [config._id])

  // Create chart config for shadcn/ui chart
  const chartConfig = useMemo(() => {
    return {
      [config.fieldId]: {
        label: config.title,
        color: config.color,
      },
    }
  }, [config.fieldId, config.title, config.color])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-destructive text-sm">Error loading data</div>
  }

  if (!data || data.values.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>
    )
  }

  // Calculate min and max values for Y axis with some padding
  const minValue = Math.min(...data.values) * 0.9
  const maxValue = Math.max(...data.values) * 1.1

  // Render the appropriate chart type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 20, left: 20, bottom: 5 },
    }

    if (config.chartType === "Bar" || config.chartType === "Column") {
      return (
        <BarChart {...commonProps}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey="timestamp"
            label={{ value: config.xAxisLabel, position: "insideBottom", offset: -5 }}
            height={50}
          />
          <YAxis
            label={{ value: config.yAxisLabel, angle: -90, position: "insideLeft" }}
            domain={[minValue, maxValue]}
          />
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && <ChartLegend />}
          <Bar dataKey="value" fill={config.color} radius={4} />
          {config.referenceLines?.map((line, index) => (
            <ReferenceLine
              key={index}
              y={line.value}
              stroke={line.color}
              strokeDasharray={line.style === "dashed" ? "5 5" : line.style === "dotted" ? "2 2" : undefined}
              label={line.label}
            />
          ))}
        </BarChart>
      )
    }

    if (config.chartType === "Area") {
      return (
        <AreaChart {...commonProps}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey="timestamp"
            label={{ value: config.xAxisLabel, position: "insideBottom", offset: -5 }}
            height={50}
          />
          <YAxis
            label={{ value: config.yAxisLabel, angle: -90, position: "insideLeft" }}
            domain={[minValue, maxValue]}
          />
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && <ChartLegend />}
          <Area type="monotone" dataKey="value" stroke={config.color} fill={`${config.color}20`} activeDot={{ r: 8 }} />
          {config.referenceLines?.map((line, index) => (
            <ReferenceLine
              key={index}
              y={line.value}
              stroke={line.color}
              strokeDasharray={line.style === "dashed" ? "5 5" : line.style === "dotted" ? "2 2" : undefined}
              label={line.label}
            />
          ))}
        </AreaChart>
      )
    }

    // Default to Line chart
    return (
      <LineChart {...commonProps}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis
          dataKey="timestamp"
          label={{ value: config.xAxisLabel, position: "insideBottom", offset: -5 }}
          height={50}
        />
        <YAxis label={{ value: config.yAxisLabel, angle: -90, position: "insideLeft" }} domain={[minValue, maxValue]} />
        <Tooltip content={<CustomTooltip />} />
        {config.showLegend && <ChartLegend />}
        <Line type="monotone" dataKey="value" stroke={config.color} activeDot={{ r: 8 }} strokeWidth={2} />
        {config.referenceLines?.map((line, index) => (
          <ReferenceLine
            key={index}
            y={line.value}
            stroke={line.color}
            strokeDasharray={line.style === "dashed" ? "5 5" : line.style === "dotted" ? "2 2" : undefined}
            label={line.label}
          />
        ))}
      </LineChart>
    )
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md">
          <p className="text-sm font-medium">{`Time: ${payload[0].payload.timestamp}`}</p>
          <p className="text-sm text-muted-foreground">{`${config.title}: ${payload[0].value.toFixed(2)}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer id={chartId} config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </ChartContainer>
  )
}
