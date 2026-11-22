"use client"

import { ChevronDown, Factory } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatNetworkLabel, toggleNetworkSelection, type NetworkFilterOption } from "@/lib/manufacturers"

interface ManufacturerFilterProps {
  /** From `GET /networks/`, see buildNetworkFilterOptions */
  options: NetworkFilterOption[]
  /** Lower-cased network identifiers currently selected; empty means every manufacturer */
  selected: string[]
  onChange: (selected: string[]) => void
  loading?: boolean
  disabled?: boolean
  className?: string
}

/** Label for the trigger button: who is selected, in one phrase. */
export function describeManufacturerSelection(selected: readonly string[]): string {
  if (selected.length === 0) return "All manufacturers"
  if (selected.length === 1) return formatNetworkLabel(selected[0])
  if (selected.length === 2) return selected.map(formatNetworkLabel).join(", ")
  return `${selected.length} manufacturers`
}

/**
 * Multi-select of sensor manufacturers for the device list. Selections are sent as the
 * comma-separated `network` query parameter, so the menu stays open while items are toggled.
 */
export function ManufacturerFilter({
  options,
  selected,
  onChange,
  loading = false,
  disabled = false,
  className,
}: Readonly<ManufacturerFilterProps>) {
  const label = describeManufacturerSelection(selected)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 gap-2 bg-white font-normal", className)}
          disabled={disabled}
          aria-label={`Filter by manufacturer: ${label}`}
          data-testid="manufacturer-filter"
        >
          <Factory className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[12rem] truncate text-sm">{label}</span>
          {selected.length > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Sensor manufacturer</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selected.length === 0}
          onCheckedChange={() => onChange([])}
          onSelect={(event) => event.preventDefault()}
        >
          All manufacturers
        </DropdownMenuCheckboxItem>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={(checked) => onChange(toggleNetworkSelection(selected, option.value, checked === true))}
            onSelect={(event) => event.preventDefault()}
            className={cn(!option.enabled && "text-muted-foreground")}
            title={option.enabled ? undefined : "Not in the server's enabled networks"}
          >
            <span className="flex-1 truncate">{option.label}</span>
            <span className="ml-3 text-xs tabular-nums text-muted-foreground">{option.count}</span>
          </DropdownMenuCheckboxItem>
        ))}
        {loading && options.length === 0 && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">Loading manufacturers…</div>
        )}
        {!loading && options.length === 0 && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">No manufacturers found.</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ManufacturerFilter
