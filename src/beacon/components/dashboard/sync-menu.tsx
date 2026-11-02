"use client"

import { AqRefreshCw01 } from "@airqo/icons-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface SyncMenuItem {
  id: string
  label: string
  /** One line on what the action pulls in */
  description?: string
  onSelect: () => void
  /** The action is running: its row and the trigger icon spin */
  busy?: boolean
  disabled?: boolean
}

interface SyncMenuProps {
  items: SyncMenuItem[]
  className?: string
}

/** A page's sync and refresh actions behind one icon button. */
export function SyncMenu({ items, className }: Readonly<SyncMenuProps>) {
  const anyBusy = items.some((item) => item.busy)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("h-9 w-9", className)}
          aria-label={anyBusy ? "Syncing" : "Sync"}
          title={anyBusy ? "Syncing…" : "Sync"}
        >
          <AqRefreshCw01 className={cn("h-4 w-4", anyBusy && "animate-spin")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Sync</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onSelect={item.onSelect}
            disabled={item.disabled || item.busy}
            className="items-start gap-2"
          >
            <AqRefreshCw01
              className={cn("mt-0.5 h-4 w-4 shrink-0", item.busy ? "animate-spin" : "text-muted-foreground")}
            />
            <div className="min-w-0">
              <div className="text-sm">{item.busy ? `${item.label}…` : item.label}</div>
              {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SyncMenu
