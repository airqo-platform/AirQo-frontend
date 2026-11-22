"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatNetworkLabel, getNetworkTone } from "@/lib/manufacturers"

interface ManufacturerBadgeProps {
  /** The device's `network`: its sensor manufacturer / data provider on the platform */
  network: string | null | undefined
  className?: string
}

/** Names a device's sensor manufacturer, coloured per manufacturer. */
export function ManufacturerBadge({ network, className }: Readonly<ManufacturerBadgeProps>) {
  const label = formatNetworkLabel(network)
  return (
    <Badge
      variant="outline"
      className={cn("whitespace-nowrap font-medium", getNetworkTone(network), className)}
      title={`Sensor manufacturer: ${label}`}
      data-network={network ?? ""}
    >
      {label}
    </Badge>
  )
}

export default ManufacturerBadge
