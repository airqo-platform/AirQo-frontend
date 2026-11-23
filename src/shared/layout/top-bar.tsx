"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { AqAirQo, AqMenu01 } from "@airqo/icons-react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

/**
 * The bar across the top of Beacon, Vertex and Nexus: menu button, app brand,
 * page title, then the app's controls on the right.
 *
 * Markup copied from Beacon's components/dashboard/top-nav.tsx, which follows the
 * Nexus header (nexus/src/shared/components/header/index.tsx). Vertex draws the
 * same bar in components/layout/topbar.tsx.
 */
interface TopBarProps {
  onMenuClick: () => void
  /** Logo and app name. `TopBarBrand` draws the standard one. */
  brand: ReactNode
  /** Page title shown after the brand. */
  title?: ReactNode
  /** Small pill after the brand, e.g. "Administrator". */
  badge?: string
  /** Right-hand controls: organisation switcher, help, apps, profile. */
  actions?: ReactNode
}

export function TopBar({ onMenuClick, brand, title, badge, actions }: Readonly<TopBarProps>) {
  return (
    <header className="relative z-40 w-full shrink-0">
      <Card className="w-full p-0 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between w-full h-14 px-3 sm:px-4">
          {/* Left Section: Hamburger & Brand */}
          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-1 mr-1 p-2 rounded-lg text-foreground hover:bg-muted"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
              title="Menu"
            >
              <AqMenu01 className="w-5 h-5 text-foreground" />
            </Button>

            {brand}

            {badge && (
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {badge}
              </span>
            )}
          </div>

          {/* Middle Section: Page Title */}
          <div className="flex-1 ml-4 sm:ml-6 min-w-0">
            {title && (
              <h1 className="text-base sm:text-xl font-normal text-foreground truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Right Section: Controls & Profile */}
          <div className="flex items-center gap-x-2 sm:gap-x-3 shrink-0">{actions}</div>
        </div>
      </Card>
    </header>
  )
}

interface TopBarBrandProps {
  href: string
  /** App name shown beside the logo, e.g. "Beacon". */
  name: string
  /** Replaces the AirQo mark, e.g. an organisation's logo. */
  logo?: ReactNode
}

export function TopBarBrand({ href, name, logo }: Readonly<TopBarBrandProps>) {
  return (
    <Link href={href} className="flex items-center space-x-2.5 cursor-pointer focus:outline-none">
      {logo ?? <AqAirQo size={32} color="#0A84FF" />}
      <span className="text-lg font-bold text-foreground tracking-tight hidden xs:inline-block">
        {name}
      </span>
    </Link>
  )
}
