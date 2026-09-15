"use client"

import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, Clock, ShieldCheck } from "lucide-react"
import { AqAirQo, AqHomeSmile, AqXClose } from "@airqo/icons-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ADMIN_NAV_ITEMS,
  getSidebarSections,
  isNavItemActive,
  type NavIcon,
} from "@/components/dashboard/nav-config"
import { useNavigationAccess } from "@/hooks/use-navigation-access"
import { useRecentlyVisited } from "@/hooks/use-recently-visited"
import { useGroup } from "@/lib/group-context"
import { getDevicesHome, isRouteAccessible, type NavModule } from "@/lib/navigation"
import { cn } from "@/lib/utils"

interface PrimarySidebarProps {
  isOpen: boolean
  onClose: () => void
  activeModule: NavModule
}

type FlyoutMenu = "admin" | "recent"

const FLYOUT_CLOSE_DELAY_MS = 200

const drawerItemClassName = (isActive: boolean) =>
  cn(
    "relative flex w-full items-center gap-3 py-2.5 px-3 rounded-lg text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted font-normal"
  )

function DrawerItemBody({
  icon: Icon,
  label,
  isActive,
  endIcon: EndIcon,
}: Readonly<{ icon: NavIcon; label: string; isActive: boolean; endIcon?: NavIcon }>) {
  return (
    <>
      {isActive && (
        <span className="absolute top-0 bottom-0 flex items-center -left-2" aria-hidden="true">
          <span className="block w-1 bg-primary rounded-md h-1/2" />
        </span>
      )}
      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "text-foreground")} />
      <span className="flex-1 truncate">{label}</span>
      {EndIcon && (
        <EndIcon
          className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
        />
      )}
    </>
  )
}

interface DrawerFlyoutProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  icon: NavIcon
  label: string
  isActive?: boolean
  children: React.ReactNode
}

/** Drawer entry that opens a side menu on hover, click or keyboard — Vertex's admin/recent pattern. */
function DrawerFlyout({
  open,
  onOpenChange,
  onMouseEnter,
  onMouseLeave,
  icon,
  label,
  isActive = false,
  children,
}: Readonly<DrawerFlyoutProps>) {
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={cn(drawerItemClassName(isActive), open && !isActive && "bg-muted")}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onPointerDown={(event) => {
            // Open on press rather than Radix's toggle, so clicking a
            // hover-opened menu doesn't immediately close it.
            event.preventDefault()
            onOpenChange(true)
          }}
        >
          <DrawerItemBody
            icon={icon}
            label={label}
            isActive={isActive}
            endIcon={open ? ChevronDown : ChevronRight}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-72 z-[10002]"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDownOutside={(event) => {
          if (triggerRef.current?.contains(event.target as Node)) {
            event.preventDefault()
          }
        }}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Slide-over primary navigation opened from the top bar's menu button.
 * Mirrors Vertex: Home returns to the devices module, the Administrative Panel
 * (AirQo maintainers only) switches to the admin module, and Recently Visited
 * jumps back to recent pages.
 */
export default function PrimarySidebar({ isOpen, onClose, activeModule }: Readonly<PrimarySidebarProps>) {
  const pathname = usePathname()
  const router = useRouter()
  const access = useNavigationAccess()
  const { activeGroup } = useGroup()
  const { visitedPages } = useRecentlyVisited()
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)
  const [openFlyout, setOpenFlyout] = useState<FlyoutMenu | null>(null)

  const devicesHome = getDevicesHome(access)
  const recentPages = visitedPages.filter((page) => isRouteAccessible(page.href, access))
  const moduleSections = getSidebarSections(activeModule, access)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      setTimeout(() => {
        drawerRef.current?.focus()
      }, 0)
    } else {
      setOpenFlyout(null)
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

  const cancelFlyoutClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const flyoutProps = (menu: FlyoutMenu) => ({
    open: openFlyout === menu,
    onOpenChange: (open: boolean) => {
      cancelFlyoutClose()
      setOpenFlyout(open ? menu : null)
    },
    onMouseEnter: () => {
      cancelFlyoutClose()
      setOpenFlyout(menu)
    },
    onMouseLeave: () => {
      closeTimeoutRef.current = setTimeout(() => {
        setOpenFlyout((current) => (current === menu ? null : current))
      }, FLYOUT_CLOSE_DELAY_MS)
    },
  })

  const navigateTo = (href: string) => {
    setOpenFlyout(null)
    onClose()
    if (pathname !== href) {
      router.push(href)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[10000] transition-[opacity,visibility] duration-300",
        isOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
        aria-label="Close navigation menu"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-72 max-w-[90vw] z-[10001] shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Card
          ref={drawerRef}
          className="h-full rounded-none border-r border-y-0 border-l-0 border-border bg-card p-0 flex flex-col focus:outline-none"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          tabIndex={-1}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <AqAirQo size={36} color="#0A84FF" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-bold text-lg leading-tight text-foreground">Beacon</span>
                {activeGroup && (
                  <span
                    className="inline-block w-fit max-w-[160px] truncate px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary"
                    title={activeGroup}
                  >
                    {activeGroup.replace(/[_-]/g, " ")}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Close navigation menu"
            >
              <AqXClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="flex flex-col gap-2" aria-label="Primary">
              {/* Home - visible to all users */}
              <Link
                href={devicesHome}
                onClick={onClose}
                className={drawerItemClassName(activeModule === "devices")}
                aria-current={pathname === devicesHome ? "page" : undefined}
              >
                <DrawerItemBody icon={AqHomeSmile} label="Home" isActive={activeModule === "devices"} />
              </Link>

              {/* Administrative Panel - AirQo maintainers only */}
              {access.canAccessAdminPanel && (
                <DrawerFlyout
                  {...flyoutProps("admin")}
                  icon={ShieldCheck}
                  label="Administrative Panel"
                  isActive={activeModule === "admin"}
                >
                  {ADMIN_NAV_ITEMS.map((item) => {
                    const isActive = isNavItemActive(item, pathname)
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onSelect={() => navigateTo(item.href)}
                        className={cn(
                          "flex flex-col items-start gap-0.5 p-3 cursor-pointer",
                          isActive && "bg-primary/10 text-primary focus:bg-primary/15 focus:text-primary"
                        )}
                      >
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.description && (
                          <span className={cn("text-xs", isActive ? "text-primary" : "text-muted-foreground")}>
                            {item.description}
                          </span>
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DrawerFlyout>
              )}

              {/* Recently Visited - visible to all users */}
              {recentPages.length > 0 && (
                <DrawerFlyout {...flyoutProps("recent")} icon={Clock} label="Recently Visited">
                  {recentPages.map((page) => (
                    <DropdownMenuItem
                      key={page.href}
                      onSelect={() => navigateTo(page.href)}
                      className={cn(
                        "p-3 cursor-pointer text-sm font-medium",
                        pathname === page.href && "bg-primary/10 text-primary focus:bg-primary/15 focus:text-primary"
                      )}
                    >
                      {page.label}
                    </DropdownMenuItem>
                  ))}
                </DrawerFlyout>
              )}
            </nav>

            {/* The module sidebar is hidden on small screens, so surface its links here */}
            {moduleSections.length > 0 && (
              <div className="md:hidden mt-6 pt-4 border-t border-border">
                {moduleSections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <div className="mb-2 px-2 text-xs font-semibold tracking-wider text-muted-foreground">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = isNavItemActive(item, pathname)
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={onClose}
                            className={drawerItemClassName(isActive)}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <DrawerItemBody icon={item.icon} label={item.label} isActive={isActive} />
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="text-xs text-muted-foreground truncate">
              Organization: <strong className="text-foreground">{activeGroup || "—"}</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  )
}
