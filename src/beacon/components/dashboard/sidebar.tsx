"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AqChevronLeft,
  AqChevronRight,
  AqMessageNotificationSquare,
} from "@airqo/icons-react"
import { Card } from "@/components/ui/card"
import {
  getSidebarSections,
  isNavItemActive,
  isSubRouteActive,
  type NavItemConfig,
} from "@/components/dashboard/nav-config"
import { openFeedbackDialog } from "@/components/features/feedback/feedback-dialog"
import { FeedbackLauncher } from "@/components/features/feedback/feedback-launcher"
import { useNavigationAccess } from "@/hooks/use-navigation-access"
import type { NavModule } from "@/lib/navigation"
import { cn } from "@/lib/utils"

interface SidebarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  /** Which module's links to show; the layout derives it from the pathname. */
  activeModule: NavModule
}

export default function Sidebar({ sidebarOpen, onToggleSidebar, activeModule }: Readonly<SidebarProps>) {
  const pathname = usePathname()
  const access = useNavigationAccess()
  const sections = getSidebarSections(activeModule, access)

  // Floating side flyout menu state (Portal)
  const [activeFlyout, setActiveFlyout] = useState<{
    item: NavItemConfig
    top: number
    left: number
  } | null>(null)

  // Floating tooltip state for collapsed items without subroutes
  const [activeTooltip, setActiveTooltip] = useState<{
    label: string
    top: number
    left: number
  } | null>(null)

  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (flyoutTimeoutRef.current) {
        clearTimeout(flyoutTimeoutRef.current)
      }
    }
  }, [])

  // Auto-close flyout on path changes
  useEffect(() => {
    setActiveFlyout(null)
    setActiveTooltip(null)
  }, [pathname])

  // Handle hovering over a nav item
  const handleItemMouseEnter = useCallback((item: NavItemConfig, element: HTMLElement) => {
    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current)
      flyoutTimeoutRef.current = null
    }

    const rect = element.getBoundingClientRect()
    const top = rect.top
    const left = rect.right + 6

    if (item.subroutes && item.subroutes.length > 0) {
      setActiveTooltip(null)
      setActiveFlyout({
        item,
        top,
        left,
      })
    } else {
      setActiveFlyout(null)
      if (!sidebarOpen) {
        setActiveTooltip({
          label: item.label,
          top: top + rect.height / 2,
          left,
        })
      }
    }
  }, [sidebarOpen])

  const handleItemMouseLeave = useCallback(() => {
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null)
      setActiveTooltip(null)
    }, 180)
  }, [])

  const handleFlyoutMouseEnter = useCallback(() => {
    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current)
      flyoutTimeoutRef.current = null
    }
  }, [])

  const handleFlyoutMouseLeave = useCallback(() => {
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null)
      setActiveTooltip(null)
    }, 180)
  }, [])

  const renderNavItem = (item: NavItemConfig) => {
    const Icon = item.icon
    const hasSubroutes = Boolean(item.subroutes && item.subroutes.length > 0)
    const isActive = isNavItemActive(item, pathname)
    const isFlyoutOpen = activeFlyout?.item.id === item.id

    if (!sidebarOpen) {
      // Collapsed state (Icon only)
      return (
        <div
          key={item.id}
          className="relative flex items-center justify-center"
          onMouseEnter={(e) => handleItemMouseEnter(item, e.currentTarget)}
          onMouseLeave={handleItemMouseLeave}
        >
          {/* Nexus Active Indicator - Collapsed Mode */}
          {isActive && (
            <div className="absolute top-0 bottom-0 flex items-center -left-2">
              <span className="w-1 bg-primary rounded-md h-1/2" aria-hidden="true" />
            </div>
          )}

          <Link
            href={item.href}
            className={cn(
              "relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ease-in-out focus-visible:outline-none",
              isActive
                ? "bg-primary/10 text-primary"
                : isFlyoutOpen
                ? "bg-muted text-foreground"
                : "text-foreground hover:bg-muted"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "text-foreground")} />
            <span className="sr-only">{item.label}</span>
          </Link>
        </div>
      )
    }

    // Expanded state
    return (
      <div
        key={item.id}
        className="relative"
        onMouseEnter={(e) => handleItemMouseEnter(item, e.currentTarget)}
        onMouseLeave={handleItemMouseLeave}
      >
        {/* Nexus Active Indicator - Positioned outside the link container */}
        {isActive && (
          <div className="absolute top-0 bottom-0 flex items-center -left-2">
            <span className="w-1 bg-primary rounded-md h-1/2" aria-hidden="true" />
          </div>
        )}

        <Link
          href={item.href}
          className={cn(
            "relative flex items-center gap-3 py-2.5 px-3 rounded-lg w-full transition-all duration-300 ease-in-out focus-visible:outline-none",
            isActive
              ? "bg-primary/10 text-primary"
              : isFlyoutOpen
              ? "bg-muted text-foreground"
              : "text-foreground hover:bg-muted font-normal"
          )}
          aria-current={isActive ? "page" : undefined}
        >
          <div className="flex items-center justify-center flex-shrink-0 w-5 h-5">
            <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-foreground")} />
          </div>
          <h3 className={cn("text-sm truncate flex-1", isActive ? "text-primary font-medium" : "text-foreground font-normal")}>
            {item.label}
          </h3>
          {hasSubroutes && (
            <AqChevronRight
              className={cn(
                "w-4 h-4 flex-shrink-0 transition-transform duration-200",
                isActive ? "text-primary" : "text-foreground/70",
                isFlyoutOpen && "translate-x-0.5"
              )}
            />
          )}
        </Link>
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "hidden md:block shrink-0 transition-all duration-300 relative h-full z-30",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Floating Collapse / Expand Chevron Button */}
      <div className="absolute z-50 top-4 -right-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-6 h-6 p-1 transition-all duration-200 bg-background border border-border rounded-full shadow-md focus:outline-none hover:shadow-lg hover:scale-105"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <AqChevronLeft className="w-3 h-3 text-muted-foreground hover:text-foreground" />
          ) : (
            <AqChevronRight className="w-3 h-3 text-muted-foreground hover:text-foreground" />
          )}
        </button>
      </div>

      {/* Main Sidebar Card */}
      <Card
        className={cn(
          "h-full flex flex-col rounded-xl border border-border bg-card shadow-sm relative overflow-y-auto overflow-x-hidden"
        )}
      >
        {/* Navigation List - grouped into sections like Vertex's secondary sidebar */}
        <nav
          className="flex-1 px-3 py-4"
          aria-label={activeModule === "admin" ? "Administrative panel" : "Device navigation"}
        >
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={cn(index > 0 && (sidebarOpen ? "mt-6" : "mt-3 pt-3 border-t border-border"))}
            >
              {sidebarOpen && (
                <div className="mb-2 px-2 text-xs font-semibold tracking-wider text-muted-foreground">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">{section.items.map(renderNavItem)}</div>
            </div>
          ))}
        </nav>

        {/* Bottom Section - Nexus Style Feedback Card */}
        <div
          className={cn(
            "p-3 border-t border-border mt-auto",
            !sidebarOpen && "px-1.5 py-3 flex justify-center"
          )}
        >
          <button
            type="button"
            onClick={openFeedbackDialog}
            title="Share feedback"
            aria-label="Share feedback"
            className={cn(
              "group flex w-full items-start gap-3 rounded-2xl border border-border bg-background px-3 py-3 text-left shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              !sidebarOpen &&
                "items-center justify-center gap-0 border-none bg-transparent px-0 py-0 shadow-none"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center transition-colors text-primary flex-shrink-0",
                sidebarOpen
                  ? "h-10 w-10 rounded-full bg-primary/10 group-hover:bg-primary/15"
                  : "h-9 w-9 bg-primary/10 hover:bg-primary/20 rounded-full"
              )}
              aria-hidden="true"
            >
              <AqMessageNotificationSquare className="h-5 w-5" />
            </span>

            {sidebarOpen && (
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Share feedback
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs leading-relaxed text-muted-foreground truncate",
                    "group-hover:whitespace-normal group-hover:overflow-visible"
                  )}
                >
                  Tell us what is working well, what could be better, or any problems you&apos;ve faced.
                </span>
              </span>
            )}
          </button>
        </div>
      </Card>

      {/* Floating Tooltip in Collapsed Mode (Portal to body) */}
      {mounted &&
        !sidebarOpen &&
        activeTooltip &&
        createPortal(
          <div
            className="fixed z-[99999] bg-black text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap pointer-events-none -translate-y-1/2 animate-in fade-in duration-100"
            style={{
              top: `${activeTooltip.top}px`,
              left: `${activeTooltip.left}px`,
            }}
          >
            {activeTooltip.label}
          </div>,
          document.body
        )}

      {/* Floating Side Flyout Submenu (Portal to body for both expanded & collapsed) */}
      {mounted &&
        activeFlyout &&
        createPortal(
          <div
            className="fixed z-[99999] w-64 bg-card border border-border rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: `${Math.min(activeFlyout.top, typeof window !== "undefined" ? window.innerHeight - 280 : activeFlyout.top)}px`,
              left: `${activeFlyout.left}px`,
            }}
            onMouseEnter={handleFlyoutMouseEnter}
            onMouseLeave={handleFlyoutMouseLeave}
          >
            <div className="px-3 py-1.5 mb-1.5 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {activeFlyout.item.label}
            </div>
            <div className="space-y-1">
              {activeFlyout.item.subroutes!.map((sub) => {
                const isSubActive = isSubRouteActive(sub, pathname)
                return (
                  <Link
                    key={sub.id}
                    href={sub.href}
                    onClick={() => setActiveFlyout(null)}
                    className={cn(
                      "block p-2.5 rounded-lg text-xs transition-colors",
                      isSubActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span className={cn("font-medium block text-xs", isSubActive ? "text-primary font-semibold" : "text-foreground")}>
                      {sub.label}
                    </span>
                    {sub.description && (
                      <span className="text-[11px] text-muted-foreground block truncate mt-0.5">
                        {sub.description}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>,
          document.body
        )}

      <FeedbackLauncher />
    </aside>
  )
}
