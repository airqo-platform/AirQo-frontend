"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Device } from "@/app/types/devices"

interface DeviceHeaderProps {
  device: Device
}

export function DeviceHeader({ device }: DeviceHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{device.long_name || device.name}</h1>
        <div className="flex items-center gap-2">
          <Badge
            variant={device.isOnline ? "default" : "secondary"}
            className={device.isOnline ? "bg-green-500" : "bg-gray-500"}
          >
            {device.isOnline ? "Online" : "Offline"}
          </Badge>
          <span className="text-sm text-muted-foreground">Status: {device.status}</span>
          <span className="text-sm text-muted-foreground">Category: {device.category}</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <span>
          Location: {device.latitude}, {device.longitude}
        </span>
        {device.site && <span> • Site: {device.site.name}</span>}
        {device.description && <p className="mt-1">{device.description}</p>}
      </div>

      <div className="flex gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={() => router.push(`/devices/${device._id}/dashboard`)}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button variant="outline" size="sm" onClick={() => router.push(`/devices/${device._id}/charts/new`)}>
          <BarChart3 className="mr-2 h-4 w-4" />
          Add Chart
        </Button>
      </div>
    </div>
  )
}
