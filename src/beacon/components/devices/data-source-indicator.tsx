"use client"

import type { ComponentType } from "react"
import { Cloud, CloudOff, Radio } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { DATA_SOURCE_META, isDeviceDataSource } from "@/lib/manufacturers"
import type { DeviceDataSource } from "@/types/network.types"

const ICONS: Record<DeviceDataSource, ComponentType<{ className?: string }>> = {
  thingspeak: Radio,
  external_api: Cloud,
  none: CloudOff,
}

interface DataSourceIndicatorProps {
  /** `thingspeak`, `external_api` or `none`; anything else renders as `none` */
  dataSource: DeviceDataSource | string | null | undefined
  /** `badge` shows the label; `icon` is a compact dot for table cells */
  variant?: "badge" | "icon"
  className?: string
}

/**
 * Where a device's readings come from, with a tooltip explaining what that means. A device
 * with no data path shows no readings and counts as offline, so the tooltip says why.
 */
export function DataSourceIndicator({ dataSource, variant = "badge", className }: Readonly<DataSourceIndicatorProps>) {
  const source: DeviceDataSource = isDeviceDataSource(dataSource) ? dataSource : "none"
  const meta = DATA_SOURCE_META[source]
  const Icon = ICONS[source]

  const body =
    variant === "icon" ? (
      <span
        className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full border", meta.tone, className)}
        aria-label={`Data source: ${meta.label}`}
        data-data-source={source}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
    ) : (
      <Badge
        variant="outline"
        className={cn("gap-1 whitespace-nowrap font-medium", meta.tone, className)}
        aria-label={`Data source: ${meta.label}`}
        data-data-source={source}
      >
        <Icon className="h-3 w-3" />
        {meta.shortLabel}
      </Badge>
    )

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex cursor-help">
            {body}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold">{meta.label}</p>
          <p className="text-xs">{meta.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default DataSourceIndicator
