import type { ComponentType } from "react"
import {
  AqActivityHeart,
  AqAirQlouds,
  AqBeaker02,
  AqBox,
  AqFile02,
  AqHomeSmile,
  AqLayersThree01,
  AqMonitor,
  AqPackage,
  AqTool02,
  AqUserSquare,
} from "@airqo/icons-react"
import {
  ROUTES,
  matchesRoute,
  type NavModule,
  type NavigationAccess,
} from "@/lib/navigation"

export type NavIcon = ComponentType<{ className?: string; size?: number | string; color?: string }>

export interface NavSubRoute {
  id: string
  label: string
  href: string
  description?: string
  /** Match the pathname exactly, for subroutes that share their parent's href. */
  exact?: boolean
}

export interface NavItemConfig {
  id: string
  label: string
  href: string
  icon: NavIcon
  description?: string
  subroutes?: NavSubRoute[]
  /** Replaces the default prefix match, for routes that contain other nav targets. */
  isActive?: (pathname: string) => boolean
}

export interface NavSection {
  id: string
  title: string
  items: NavItemConfig[]
}

export function isSubRouteActive(sub: NavSubRoute, pathname: string | null): boolean {
  if (!pathname) return false
  return sub.exact ? pathname === sub.href : matchesRoute(pathname, sub.href)
}

export function isNavItemActive(item: NavItemConfig, pathname: string | null): boolean {
  if (!pathname) return false
  if (item.isActive) return item.isActive(pathname)
  return (
    matchesRoute(pathname, item.href) ||
    Boolean(item.subroutes?.some((sub) => isSubRouteActive(sub, pathname)))
  )
}

// ─── Devices module ──────────────────────────────────────────────────────────

const MY_DEVICES_ITEM: NavItemConfig = {
  id: "my-devices",
  label: "My Devices",
  href: ROUTES.MY_DEVICES,
  icon: AqUserSquare,
}

const DEVICES_ITEM: NavItemConfig = {
  id: "devices",
  label: "Devices",
  href: ROUTES.DEVICES,
  icon: AqMonitor,
  isActive: (pathname) =>
    matchesRoute(pathname, ROUTES.DEVICES) && !matchesRoute(pathname, ROUTES.MY_DEVICES),
}

const ANALYTICS_ITEM: NavItemConfig = {
  id: "analytics",
  label: "Performance Analysis",
  href: ROUTES.ANALYTICS,
  icon: AqAirQlouds,
  subroutes: [
    {
      id: "cohort-analysis",
      label: "Cohort Analysis",
      href: `${ROUTES.ANALYTICS}?analysis=cohorts`,
      description: "Analyze performance across cohorts",
    },
    {
      id: "grid-analysis",
      label: "Grid Analysis",
      href: `${ROUTES.ANALYTICS}?analysis=grids`,
      description: "Spatial grid metrics & performance",
    },
    {
      id: "device-data-analysis",
      label: "Device Data Analysis",
      href: ROUTES.VISUALISE,
      description: "Explore raw sensor telemetry charts",
    },
  ],
}

const MAINTENANCE_ITEM: NavItemConfig = {
  id: "maintenance",
  label: "Maintenance",
  href: ROUTES.MAINTENANCE,
  icon: AqTool02,
}

const REPORTS_ITEM: NavItemConfig = {
  id: "reports",
  label: "Reports",
  href: ROUTES.REPORTS,
  icon: AqFile02,
}

/**
 * Like Vertex, the AirQo (personal) context leads with the user's own devices,
 * while any other organisation leads with the organisation's devices.
 */
export function getDeviceNavSections(access: NavigationAccess): NavSection[] {
  const monitoringItems = [
    access.canAccessAnalytics ? ANALYTICS_ITEM : null,
    access.canAccessMaintenance ? MAINTENANCE_ITEM : null,
    access.canAccessReports ? REPORTS_ITEM : null,
  ].filter((item): item is NavItemConfig => item !== null)

  const sections: NavSection[] = access.isPersonalContext
    ? [
        { id: "personal-assets", title: "Personal assets", items: [MY_DEVICES_ITEM] },
        {
          id: "network-monitoring",
          title: "Network monitoring",
          items: access.showOrgDevices ? [DEVICES_ITEM, ...monitoringItems] : monitoringItems,
        },
      ]
    : [
        { id: "organization-assets", title: "Organization assets", items: [DEVICES_ITEM] },
        { id: "monitoring", title: "Monitoring", items: monitoringItems },
      ]

  return sections.filter((section) => section.items.length > 0)
}

// ─── Admin module ────────────────────────────────────────────────────────────

export const ADMIN_NAV_ITEMS: NavItemConfig[] = [
  {
    id: "admin-overview",
    label: "Overview",
    href: ROUTES.ADMIN_OVERVIEW,
    icon: AqHomeSmile,
    description: "Platform statistics and network health",
    isActive: (pathname) => pathname === ROUTES.ADMIN_OVERVIEW,
  },
  {
    id: "admin-diagnostics",
    label: "IoT Diagnostics",
    href: ROUTES.DIAGNOSTICS,
    icon: AqActivityHeart,
    description: "Fleet triage, bench simulator & hardware profiles",
    subroutes: [
      {
        id: "admin-diagnostics-triage",
        label: "Fleet Health",
        href: ROUTES.DIAGNOSTICS,
        description: "Daily fleet health, recurring issues & devices needing attention",
        exact: true,
      },
      {
        id: "admin-diagnostics-simulator",
        label: "Bench Simulator",
        href: ROUTES.DIAGNOSTICS_SIMULATOR,
        description: "Simulate sensor anomalies & diagnostic scenarios",
      },
      {
        id: "admin-diagnostics-profiles",
        label: "Device Profiles",
        href: ROUTES.DEVICE_PROFILES,
        description: "Hardware topologies & slot mapping specifications",
      },
      {
        id: "admin-diagnostics-templates",
        label: "Diagnostic Templates",
        href: ROUTES.DIAGNOSTIC_TEMPLATES,
        description: "Manage symptom rules & evidential weighting templates",
      },
    ],
  },
  {
    id: "admin-collocation",
    label: "Collocation",
    href: ROUTES.COLLOCATION_INLAB,
    icon: AqBeaker02,
    description: "In-lab and on-site sensor collocation testing",
    isActive: (pathname) => matchesRoute(pathname, "/dashboard/collocation"),
    subroutes: [
      {
        id: "collocation-inlab",
        label: "In-Lab Collocation",
        href: ROUTES.COLLOCATION_INLAB,
        description: "Review in-laboratory batch collocation results",
      },
      {
        id: "collocation-site",
        label: "Site Collocation",
        href: ROUTES.COLLOCATION_SITE,
        description: "Field site collocation sensor calibration",
      },
    ],
  },
  {
    id: "admin-firmware",
    label: "Firmware Management",
    href: ROUTES.FIRMWARE,
    icon: AqPackage,
    description: "Binary releases and over-the-air updates",
  },
  {
    id: "admin-categories",
    label: "Device Categories",
    href: ROUTES.CATEGORIES,
    icon: AqLayersThree01,
    description: "Organize devices into functional categories",
  },
  {
    id: "admin-stock",
    label: "Stock & Inventory",
    href: ROUTES.STOCK,
    icon: AqBox,
    description: "Hardware parts, inventory levels & stock movements",
  },
]

const ADMIN_NAV_SECTIONS: NavSection[] = [
  { id: "administrative-panel", title: "Administrative Panel", items: ADMIN_NAV_ITEMS },
]

export function getSidebarSections(module: NavModule, access: NavigationAccess): NavSection[] {
  if (module === "admin") {
    return access.canAccessAdminPanel ? ADMIN_NAV_SECTIONS : []
  }
  return getDeviceNavSections(access)
}
