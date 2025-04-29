"use client"

import { Badge } from "@/components/ui/badge"
import type { DeviceStatus } from "@/core/apis/devices"

interface DeviceHeaderProps {
  device: DeviceStatus
}

export function DeviceHeader({ device }: DeviceHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{device.name}</h1>
        <div className="flex items-center gap-2">
          <Badge
            variant={device.status === "online" ? "default" : "secondary"}
            className={device.status === "online" ? "bg-green-500" : "bg-gray-500"}
          >
            {device.status}
          </Badge>
          <span className="text-sm text-muted-foreground">Power: {device.powerType}</span>
          <span className="text-sm text-muted-foreground">Maintenance: {device.maintenance_status}</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <span>
          Location: {device.latitude}, {device.longitude}
        </span>
        {device.site_id && <span> • Site ID: {device.site_id}</span>}
      </div>
    </div>
  )
}
