"use client"

import { useEffect, useRef } from "react"
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import { useSensorData } from "@/core/hooks/useSensorData"
import { Loader2 } from "lucide-react"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface ChartConfig {
  _id: string
  fieldId: number
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
}

export function SensorChart({ config }: SensorChartProps) {
  const chartRef = useRef<Chart | null>(null)
  const { data, isLoading, error } = useSensorData(config.fieldId, config.days, config.results)

  // Create chart data
  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: config.title,
        data: data?.values || [],
        borderColor: config.color,
        backgroundColor: `${config.color}20`,
        fill: config.chartType === "Area",
        tension: config.chartType === "Spline" ? 0.4 : 0,
      },
    ],
  }

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: config.showLegend,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: config.xAxisLabel,
        },
        grid: {
          display: config.showGrid,
        },
      },
      y: {
        title: {
          display: true,
          text: config.yAxisLabel,
        },
        grid: {
          display: config.showGrid,
        },
      },
    },
  }

  // Add reference lines if they exist
  useEffect(() => {
    if (!config.referenceLines || !chartRef.current) return

    const chart = chartRef.current

    // Remove existing plugins
    chart.options.plugins = {
      ...chart.options.plugins,
      annotation: {
        annotations: {},
      },
    }

    // Add reference lines
    config.referenceLines.forEach((line, index) => {
      if (chart.options.plugins?.annotation?.annotations) {
        chart.options.plugins.annotation.annotations[`line${index}`] = {
          type: "line",
          yMin: line.value,
          yMax: line.value,
          borderColor: line.color,
          borderWidth: 2,
          borderDash: line.style === "dashed" ? [5, 5] : undefined,
          label: {
            content: line.label,
            display: true,
            position: "end",
            backgroundColor: line.color,
          },
        }
      }
    })

    chart.update()
  }, [config.referenceLines])

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

  // Render the appropriate chart type
  if (config.chartType === "Bar" || config.chartType === "Column") {
    return <Bar data={chartData} options={chartOptions} />
  }

  return <Line data={chartData} options={chartOptions} ref={chartRef} />
}
