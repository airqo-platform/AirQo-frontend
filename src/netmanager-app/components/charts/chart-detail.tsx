"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SensorChart } from "@/components/charts/sensor-chart"
import { ChartForm } from "@/components/charts/chart-form"
import { toast } from "sonner"
import { useExportData } from "@/core/hooks/useExportData"

interface ChartDetailProps {
  deviceId: string
  chartConfig: {
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
  deviceType?: string
}

export function ChartDetail({ deviceId, chartConfig, deviceType = "Default" }: ChartDetailProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [config, setConfig] = useState(chartConfig)
  const exportData = useExportData()

  const handleExportData = async () => {
    try {
      toast("Preparing data export...")
      await exportData.mutateAsync({
        deviceId,
        fieldId: config.fieldId,
        days: config.days,
        format: "csv",
      })
      toast("Data exported successfully")
    } catch (error) {
      toast("Failed to export data", {
        description: (error as Error).message,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/devices/${deviceId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Device
        </Button>

        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={handleExportData} disabled={exportData.isPending}>
                <Download className="mr-2 h-4 w-4" />
                {exportData.isPending ? "Exporting..." : "Export Data"}
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Chart
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardContent className="p-6">
            <ChartForm deviceId={deviceId} chartConfig={config} deviceType={deviceType} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
            <div className="h-[500px] w-full">
              <SensorChart config={config} />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                Field: {config.fieldId} • Chart Type: {config.chartType} • Days: {config.days}
              </p>
              {config.referenceLines && config.referenceLines.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Reference Lines:</p>
                  <ul className="list-disc list-inside">
                    {config.referenceLines.map((line, index) => (
                      <li key={index}>
                        {line.label}: {line.value} ({line.style})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
