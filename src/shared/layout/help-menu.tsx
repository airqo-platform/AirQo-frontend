"use client"

import type { ComponentType } from "react"
import { AqHelpCircle } from "@airqo/icons-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu"

/**
 * Question-mark button in the top bar with the app's help actions.
 *
 * Copied from the Help & Feedback menu in Beacon's components/dashboard/top-nav.tsx
 * ("Take a tour of this page", "Send feedback"). Nexus has
 * header/components/info-dropdown.tsx ("Share Feedback", "Learn about AirQo Nexus");
 * Vertex's button in layout/topbar.tsx opens the feedback dialog directly.
 */
export interface HelpMenuItem {
  label: string
  onSelect: () => void
  icon?: ComponentType<{ className?: string }>
}

interface HelpMenuProps {
  items: HelpMenuItem[]
}

export function HelpMenu({ items }: Readonly<HelpMenuProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-tour="help-menu"
          className="text-muted-foreground hover:text-foreground rounded-full h-9 w-9 hover:bg-muted transition-colors"
          title="Help & Feedback"
          aria-label="Help & Feedback"
        >
          <AqHelpCircle className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-card border border-border shadow-lg rounded-xl mt-1 z-[9999]"
      >
        {items.map(({ label, onSelect, icon: Icon }) => (
          <DropdownMenuItem key={label} className="cursor-pointer rounded-lg" onSelect={onSelect}>
            {Icon && <Icon className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
