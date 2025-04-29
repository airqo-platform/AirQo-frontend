"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { ChartForm } from "@/components/charts/chart-form"
import { useDeviceStatus } from "@/core/hooks/useDevices"

export default function NewChartPage() {
  const params = useParams()
  const router = useRouter()
  const deviceId = params.deviceId as string
  const { devices, isLoading, error } = useDeviceStatus()
  const [device, setDevice] = useState<any>(null)

  useEffect(() => {
    if (devices && deviceId) {
      const foundDevice = devices.find((d) => d._id === deviceId)
      if (foundDevice) {
        setDevice(foundDevice)
      }
    }
  }, [devices, deviceId])

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

  // Determine device type for field mappings
  const deviceType = device.device_number ? "Lowcost Monitor" : "Default"

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Device
        </Button>

        <h1 className="text-2xl font-bold">Add New Chart</h1>
        <p className="text-muted-foreground">Create a new visualization for {device.name}</p>

        <Card>
          <CardContent className="p-6">
            <ChartForm deviceId={deviceId} deviceType={deviceType} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
