"use client"

import type React from "react"
import { cn } from "../lib/utils"

/*
 * The page frame inside a signed-in app: top bar across the top, the section
 * sidebar beside a scrolling main area, and the slide-over drawer.
 *
 * Copied from beacon/app/dashboard/layout.tsx, whose frame was built to match
 * nexus/src/shared/layouts/MainLayout.tsx (same `flex flex-col h-screen gap-2`
 * column, top bar, sidebar plus scrolling `main`, and the same content container:
 * `container px-1 py-6 mx-auto md:px-6 lg:px-8`). Differences kept as options:
 * - Nexus pads the frame with `p-1`; Beacon with `px-1.5 pt-1.5 pb-0.5` (used here).
 * - Nexus has a "compact" content width (max-w-5xl): `contentWidth`.
 * - Beacon renders map pages edge to edge with no content container: `fullBleed`.
 * - Nexus adds a skip link, a mobile bar under the header (`subHeader`), a banner
 *   and footer inside `main` (`pageBanner`, `footer`) and a bottom nav (`bottomNav`).
 * - Beacon puts its page satisfaction banner under `main` (`belowContent`).
 * vertex/components/layout/layout.tsx draws the same parts with fixed positioning:
 * a fixed top bar and sidebar, and `main` offset with lg:ml-[256px]/[88px] and
 * mt-[calc(48px+...)]. It would need restructuring to use this.
 *
 * The app keeps its own state (auth redirects, route guards, sidebar open state,
 * module) and passes the rendered pieces in.
 */
interface DashboardLayoutProps {
  /** Usually <TopBar />. */
  topBar: React.ReactNode
  /** Usually <SectionSidebar />; it hides itself below md. */
  sidebar?: React.ReactNode
  /** Usually <AppDrawer />; it portals itself, so placement doesn't matter. */
  drawer?: React.ReactNode
  /** Shown under the top bar on small screens only (Nexus's secondary navigation). */
  subHeader?: React.ReactNode
  /** Inside `main`, above the content container (Nexus's maintenance banner). */
  pageBanner?: React.ReactNode
  /** Inside `main`, after the content (Nexus's footer). */
  footer?: React.ReactNode
  /** Under the scrolling area, outside `main` (Beacon's page satisfaction banner). */
  belowContent?: React.ReactNode
  /** Shown at the bottom on small screens only (Nexus's bottom navigation). */
  bottomNav?: React.ReactNode
  /** Edge-to-edge content with no container or page scroll, e.g. map pages. */
  fullBleed?: boolean
  /** "compact" narrows the content to max-w-5xl (Nexus's layout preference). */
  contentWidth?: "default" | "compact"
  /** Extra classes for the outer frame. */
  className?: string
  /** Extra classes for `main`. */
  mainClassName?: string
  children: React.ReactNode
}

export function DashboardLayout({
  topBar,
  sidebar,
  drawer,
  subHeader,
  pageBanner,
  footer,
  belowContent,
  bottomNav,
  fullBleed = false,
  contentWidth = "default",
  className,
  mainClassName,
  children,
}: Readonly<DashboardLayoutProps>) {
  return (
    <>
      {/* Skip link (Nexus) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100000] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>

      <div
        className={cn(
          "flex flex-col h-screen gap-2 px-1.5 pt-1.5 pb-0.5 overflow-hidden bg-background",
          className
        )}
      >
        {/* Top Navigation Bar */}
        {topBar}

        {/* Secondary Navigation - Mobile Only */}
        {subHeader && <div className="relative z-30 md:hidden">{subHeader}</div>}

        {/* Main Row Container (Sidebar + Content) with gap */}
        <div className="flex flex-1 gap-2 overflow-hidden">
          {sidebar}

          {/* Scrollable Main Content Area */}
          <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">
            <main
              id="main-content"
              className={cn(
                "flex-1 flex flex-col",
                fullBleed ? "overflow-hidden h-full w-full" : "overflow-y-auto overflow-x-hidden",
                mainClassName
              )}
            >
              {pageBanner}
              {fullBleed ? (
                <div className="flex-1 min-h-0 flex flex-col w-full h-full">{children}</div>
              ) : (
                /* Content Container matching Nexus padding and max-w layout */
                <div className="flex-grow w-full max-w-full">
                  <div
                    className={cn(
                      "container px-1 py-6 mx-auto md:px-6 lg:px-8 w-full",
                      contentWidth === "compact" ? "max-w-5xl" : "max-w-7xl"
                    )}
                  >
                    {children}
                  </div>
                </div>
              )}
              {footer}
            </main>
            {belowContent}
          </div>
        </div>

        {/* Bottom Navigation - Mobile Only */}
        {bottomNav && <div className="md:hidden shrink-0">{bottomNav}</div>}

        {drawer}
      </div>
    </>
  )
}

export default DashboardLayout
