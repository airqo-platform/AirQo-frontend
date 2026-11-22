"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

interface SensorDataTabProps {
  deviceId: string
  deviceName: string
}

export default function SensorDataTab({ deviceId, deviceName }: SensorDataTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Sensor Data</CardTitle>
        <CardDescription>
          Visualize sensor readings from the device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-10 text-gray-500">
          <Activity className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p>No sensor data available for this device.</p>
        </div>
      </CardContent>
    </Card>
  )
}
