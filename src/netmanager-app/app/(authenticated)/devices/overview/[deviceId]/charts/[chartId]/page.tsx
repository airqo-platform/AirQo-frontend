"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { ChartDetail } from "@/components/charts/chart-detail"
import { useDeviceStatus } from "@/core/hooks/useDevices"
import { useChartConfig } from "@/core/hooks/useChartConfigs"

export default function ChartDetailPage() {
  const params = useParams()
//   const router = useRouter()
  const deviceId = params.deviceId as string
  const chartId = params.chartId as string

  const { devices, isLoading: devicesLoading, error: devicesError } = useDeviceStatus()
  const { chartConfig, isLoading: chartLoading, error: chartError } = useChartConfig(deviceId, chartId)

  const [device, setDevice] = useState<any>(null)

  useEffect(() => {
    if (devices && deviceId) {
      const foundDevice = devices.find((d) => d._id === deviceId)
      if (foundDevice) {
        setDevice(foundDevice)
      }
    }
  }, [devices, deviceId])

  if (devicesLoading || chartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (devicesError || chartError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{devicesError?.message || chartError?.message || "An error occurred"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!device || !chartConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The device or chart you are looking for could not be found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Determine device type for field mappings
  const deviceType = device.device_number ? "Lowcost Monitor" : "Default"

  return (
    <div className="p-6">
      <ChartDetail deviceId={deviceId} chartConfig={chartConfig} deviceType={deviceType} />
    </div>
  )
}
