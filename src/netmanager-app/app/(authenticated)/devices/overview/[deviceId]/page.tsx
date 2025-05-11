"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { ChartGrid } from "@/components/charts/chart-grid"
import { useDeviceStatus } from "@/core/hooks/useDevices"
import { DeviceHeader } from "@/components/charts/device-header"
import { DeviceFeedDisplay } from "@/components/device-feed-display"
import { devices } from "@/core/apis/devices"

export default function DeviceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const deviceId = params.deviceId as string
  const { devices: devicesList, isLoading, error } = useDeviceStatus()
  const [device, setDevice] = useState<any>(null)
  const [deviceNumber, setDeviceNumber] = useState<string>("")

  useEffect(() => {
    if (devicesList && deviceId) {
      const foundDevice = devicesList.find((d) => d._id === deviceId)
      if (foundDevice) {
        setDevice(foundDevice)

        // Extract device number (channel ID) from the device
        // The channel ID is specifically the device_number property
        if (foundDevice.device_number) {
          setDeviceNumber(String(foundDevice.device_number))
        }
      }
    }
  }, [devicesList, deviceId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Device Not Found</AlertTitle>
          <AlertDescription>The device you are looking for could not be found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Devices
        </Button>

        <DeviceHeader device={device} />

        <div className="grid grid-cols-1 gap-4">
          {/* ThingSpeak Device Feed Display */}
          <DeviceFeedDisplay
            deviceId={deviceId}
            deviceNumber={deviceNumber}
            fetchRawFeed={devices.getRawDeviceFeed}
            fetchTransformedFeed={devices.getTransformedDeviceFeed}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sensor Data Visualizations</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/devices/overview/${deviceId}/export`)}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button onClick={() => router.push(`/devices/overview/${deviceId}/charts/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Chart
              </Button>
            </div>
          </div>

          <ChartGrid deviceId={deviceId} />
        </div>
      </div>
    </div>
  )
}
