"use client"

import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AqAirQo,
  AqXClose,
  AqHomeSmile,
  AqBeaker02,
  AqPackage,
  AqLayersThree01,
  AqBox,
  AqChevronRight,
  AqShield02,
} from "@airqo/icons-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGroup } from "@/lib/group-context"
import { cn } from "@/lib/utils"

interface GlobalAdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface AdminNavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string; size?: number | string; color?: string }>
  description?: string
  subroutes?: {
    id: string
    label: string
    href: string
    description?: string
  }[]
}

const AIRQO_ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "admin-overview",
    label: "Overview",
    href: "/dashboard",
    icon: AqHomeSmile,
    description: "Platform high-level statistics and health overview",
  },
  {
    id: "admin-collocation",
    label: "Collocation",
    href: "/dashboard/collocation/inlab",
    icon: AqBeaker02,
    description: "In-lab and on-site sensor collocation testing",
    subroutes: [
      {
        id: "collocation-inlab",
        label: "In-Lab Collocation",
        href: "/dashboard/collocation/inlab",
        description: "Review in-laboratory batch collocation results",
      },
      {
        id: "collocation-site",
        label: "Site Collocation",
        href: "/dashboard/collocation/site",
        description: "Field site collocation sensor calibration",
      },
    ],
  },
  {
    id: "admin-firmware",
    label: "Firmware Management",
    href: "/dashboard/firmware",
    icon: AqPackage,
    description: "Manage binary releases and Over-The-Air firmware updates",
  },
  {
    id: "admin-categories",
    label: "Device Categories",
    href: "/dashboard/category",
    icon: AqLayersThree01,
    description: "Organize sensor devices into functional categories",
  },
  {
    id: "admin-stock",
    label: "Stock & Inventory",
    href: "/dashboard/stock",
    icon: AqBox,
    description: "Track hardware parts, inventory levels, and stock movements",
  },
]

export default function GlobalAdminSidebar({
  isOpen,
  onClose,
}: Readonly<GlobalAdminSidebarProps>) {
  const pathname = usePathname()
  const { activeGroup, isActiveGroupAdmin, hasPermission } = useGroup()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [expandedSubmenu, setExpandedSubmenu] = React.useState<string | null>("admin-collocation")

  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo"
  const canMaintainDevices = hasPermission("DEVICE_MAINTAIN") || isActiveGroupAdmin
  const canAccessAdmin = isAirqoGroup && canMaintainDevices

  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      setTimeout(() => {
        sidebarRef.current?.focus()
      }, 0)
    } else {
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen])

  // Escape key handler and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[10000] transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
        aria-label="Close admin menu"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 max-w-[90vw] z-[10001] shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Card
          ref={sidebarRef}
          className="h-full rounded-none border-r border-y-0 border-l-0 border-border bg-card p-0 flex flex-col focus:outline-none"
          role="dialog"
          aria-modal="true"
          aria-label="Admin Navigation Panel"
          tabIndex={-1}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary">
                <AqAirQo size={32} color="#0A84FF" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground">AirQo Admin</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                    Internal
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Admin tools & management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Close admin menu"
            >
              <AqXClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {canAccessAdmin ? (
              <div className="space-y-4">
                <div>
                  <h3 className="px-2 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    AirQo Organization Tools
                  </h3>

                  <div className="space-y-1">
                    {AIRQO_ADMIN_NAV_ITEMS.map((item) => {
                      const Icon = item.icon
                      const hasSubroutes = Boolean(item.subroutes && item.subroutes.length > 0)
                      const isSubrouteActive = Boolean(
                        pathname &&
                        item.subroutes &&
                        item.subroutes.some(
                          (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
                        )
                      )
                      const isItemActive = Boolean(
                        pathname && (
                          pathname === item.href ||
                          (!hasSubroutes && pathname.startsWith(`${item.href}/`)) ||
                          isSubrouteActive
                        )
                      )

                      const isExpanded = expandedSubmenu === item.id || isSubrouteActive

                      return (
                        <div key={item.id} className="space-y-1">
                          {hasSubroutes ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSubmenu(isExpanded ? null : item.id)
                              }
                              className={cn(
                                "relative flex items-center justify-between w-full gap-3 py-2.5 px-3 rounded-lg text-left transition-all duration-200",
                                isItemActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground hover:bg-muted font-normal"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center justify-center flex-shrink-0 w-5 h-5">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="truncate">
                                  <span className="text-sm">{item.label}</span>
                                </div>
                              </div>
                              <AqChevronRight
                                className={cn(
                                  "w-4 h-4 transition-transform text-muted-foreground",
                                  isExpanded && "rotate-90 text-primary"
                                )}
                              />
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className={cn(
                                "relative flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200",
                                isItemActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground hover:bg-muted font-normal"
                              )}
                            >
                              {isItemActive && (
                                <div className="absolute top-0 bottom-0 flex items-center -left-2">
                                  <span className="w-1 bg-primary rounded-md h-1/2" aria-hidden="true" />
                                </div>
                              )}
                              <div className="flex items-center justify-center flex-shrink-0 w-5 h-5">
                                <Icon className={cn("w-5 h-5", isItemActive ? "text-primary" : "text-foreground")} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm truncate block">{item.label}</span>
                                {item.description && (
                                  <span className="text-[11px] text-muted-foreground block truncate">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </Link>
                          )}

                          {/* Subroutes */}
                          {hasSubroutes && isExpanded && (
                            <div className="pl-9 pr-2 py-1 space-y-1 border-l border-border ml-5">
                              {item.subroutes!.map((sub) => {
                                const isSubActive = Boolean(
                                  pathname &&
                                  (pathname === sub.href || pathname.startsWith(`${sub.href}/`))
                                )
                                return (
                                  <Link
                                    key={sub.id}
                                    href={sub.href}
                                    onClick={onClose}
                                    className={cn(
                                      "block py-2 px-2.5 rounded-md text-xs transition-colors",
                                      isSubActive
                                        ? "bg-primary/15 text-primary font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                  >
                                    <span className="block">{sub.label}</span>
                                    {sub.description && (
                                      <span className="text-[10px] text-muted-foreground font-normal block truncate mt-0.5">
                                        {sub.description}
                                      </span>
                                    )}
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-muted/40 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                  <AqShield02 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">AirQo Restricted Tools</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Internal administration tools (Collocation, Firmware, Categories, Stock) are only accessible to members of the <strong>airqo</strong> organization.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/dashboard/devices"
                    onClick={onClose}
                    className="inline-flex items-center text-xs font-medium text-primary hover:underline"
                  >
                    Go to Device Monitoring &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Organization: <strong className="text-foreground">{activeGroup || "airqo"}</strong></span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded">v1.0</span>
            </div>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  )
}
