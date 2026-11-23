import { beaconConfig, isSystemGroup } from "@/beacon.config"
import {
  EXTENSION_ADMIN_ROUTE_PREFIXES,
  EXTENSION_PAGE_TITLES,
  EXTENSION_RECENT_PAGES,
  EXTENSION_TITLE_PREFIXES,
} from "@/lib/integration/routes"

const { features } = beaconConfig

/**
 * Navigation model:
 *
 * - Two modules: "devices" (day-to-day monitoring) and "admin" (operator-internal
 *   tools, including Device Data Analysis). The active module is derived from the pathname alone, so the
 *   sidebar can never disagree with the page being shown.
 * - The Administrative Panel is entered from the primary (hamburger) drawer and
 *   is only offered to system group members who can maintain devices.
 * - Personal devices ("My Devices") belong to the system group (personal) context;
 *   other organisations see their organisation's devices instead.
 *
 * The access rules live here so the sidebars, the drawer and the route guard
 * all read from one policy.
 */

export const ROUTES = {
  HOME: "/dashboard/home",
  ADMIN_OVERVIEW: "/dashboard",
  DEVICES: "/dashboard/devices",
  MY_DEVICES: "/dashboard/devices/my-devices",
  SITES: "/dashboard/sites",
  ANALYTICS: "/dashboard/analytics",
  NETWORK_HEALTH: "/dashboard/network-health",
  VISUALISE: "/dashboard/visualise",
  MAINTENANCE: "/dashboard/maintenance",
  REPORTS: "/dashboard/reports",
  DIAGNOSTICS: "/dashboard/diagnostics",
  DIAGNOSTICS_SIMULATOR: "/dashboard/diagnostics/simulator",
  DEVICE_PROFILES: "/dashboard/settings/device-profiles",
  DIAGNOSTIC_TEMPLATES: "/dashboard/settings/diagnostic-templates",
  STATUS_CODES: "/dashboard/settings/status-codes",
  MANUFACTURERS: "/dashboard/manufacturers",
  ALERTS: "/dashboard/alerts",
  SETTINGS: "/dashboard/settings",
} as const

export type NavModule = "devices" | "admin"

export const matchesRoute = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`)

/**
 * Where to send someone after sign-in: a dashboard path on this site, or null for anything else.
 * Parsing it the way a browser would catches `//evil.com` and `/\evil.com`. Every signed-in page is
 * under the dashboard, so limiting to it also rules out targets like `/login?action=logout`.
 */
export function getSafeReturnPath(path: string | null | undefined): string | null {
  if (!path?.startsWith("/")) return null

  const base = "https://beacon.invalid"
  try {
    const url = new URL(path, base)
    if (url.origin !== base || !matchesRoute(url.pathname, ROUTES.ADMIN_OVERVIEW)) return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

// Everything under these prefixes belongs to the admin module. The overview
// ("/dashboard") is matched exactly because every other page nests under it.
const ADMIN_ROUTE_PREFIXES = [
  ROUTES.DIAGNOSTICS,
  ROUTES.VISUALISE,
  "/dashboard/visualize",
  ROUTES.DEVICE_PROFILES,
  ROUTES.DIAGNOSTIC_TEMPLATES,
  ROUTES.STATUS_CODES,
  ROUTES.MANUFACTURERS,
  ...EXTENSION_ADMIN_ROUTE_PREFIXES,
]

export function isAdminRoute(pathname: string): boolean {
  if (pathname === ROUTES.ADMIN_OVERVIEW || pathname === `${ROUTES.ADMIN_OVERVIEW}/`) {
    return true
  }
  return ADMIN_ROUTE_PREFIXES.some((route) => matchesRoute(pathname, route))
}

export function getModuleForPath(pathname: string | null | undefined): NavModule {
  return pathname && isAdminRoute(pathname) ? "admin" : "devices"
}

export interface NavigationAccessInput {
  activeGroup: string | null
  isActiveGroupAdmin: boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}

export interface NavigationAccess {
  /** The system group is active — the personal context. */
  isPersonalContext: boolean
  canMaintainDevices: boolean
  /** Gates both the "Administrative Panel" entry and every admin-module route. */
  canAccessAdminPanel: boolean
  showMyDevices: boolean
  showOrgDevices: boolean
  canAccessAnalytics: boolean
  /** Sites came out of Clustered Analysis, so they follow its access. */
  canAccessSites: boolean
  canAccessMaintenance: boolean
  canAccessReports: boolean
  /** The organisation's own fleet health; system group members use Fleet Diagnostics in the admin panel instead. */
  canAccessNetworkHealth: boolean
}

export function getNavigationAccess({
  activeGroup,
  isActiveGroupAdmin,
  hasPermission,
  hasAnyPermission,
}: NavigationAccessInput): NavigationAccess {
  const hasGroup = Boolean(activeGroup)
  const isPersonalContext = isSystemGroup(activeGroup)
  const canMaintainDevices = hasPermission("DEVICE_MAINTAIN") || isActiveGroupAdmin
  // Outside the system group every member gets their organisation's tools;
  // inside it, the fleet-wide views need maintainer rights.
  const canUseGroupTools = hasGroup && (!isPersonalContext || canMaintainDevices)
  const canAccessAnalytics =
    canUseGroupTools || (hasGroup && hasAnyPermission(["ANALYTICS_VIEW", "DATA_VIEW"]))

  return {
    isPersonalContext,
    canMaintainDevices,
    canAccessAdminPanel: isPersonalContext && canMaintainDevices,
    showMyDevices: isPersonalContext,
    showOrgDevices: !isPersonalContext || canMaintainDevices,
    canAccessAnalytics,
    canAccessSites: canAccessAnalytics,
    canAccessMaintenance: features.maintenanceMap && canUseGroupTools,
    canAccessReports:
      features.reports &&
      (canUseGroupTools || (hasGroup && hasAnyPermission(["DATA_EXPORT", "ANALYTICS_EXPORT", "DATA_VIEW"]))),
    canAccessNetworkHealth: hasGroup && !isPersonalContext,
  }
}

/**
 * Whether the signed-in user may open a dashboard route. Admin-module routes
 * (including user management) need the admin panel, and fleet views follow
 * the group rules below. Everything else is deliberately open to any signed-in
 * user: device detail pages (reachable from My Devices) and the user's own
 * profile settings (ROUTES.SETTINGS).
 */
export function isRouteAccessible(pathname: string, access: NavigationAccess): boolean {
  // Features switched off in beacon.config.ts
  if (!features.deviceDataAnalysis && (matchesRoute(pathname, ROUTES.VISUALISE) || matchesRoute(pathname, "/dashboard/visualize"))) {
    return false
  }
  if (isAdminRoute(pathname)) return access.canAccessAdminPanel
  if (matchesRoute(pathname, ROUTES.MY_DEVICES)) return access.showMyDevices
  // Exact match so device detail pages stay reachable from My Devices.
  if (pathname === ROUTES.DEVICES) return access.showOrgDevices
  if (matchesRoute(pathname, ROUTES.SITES)) return access.canAccessSites
  if (matchesRoute(pathname, ROUTES.ANALYTICS)) return access.canAccessAnalytics
  if (matchesRoute(pathname, ROUTES.NETWORK_HEALTH)) return access.canAccessNetworkHealth
  if (matchesRoute(pathname, ROUTES.MAINTENANCE)) return access.canAccessMaintenance
  // Fleet-wide device alerts carry the same visibility as maintenance
  if (matchesRoute(pathname, ROUTES.ALERTS)) return access.canAccessMaintenance
  if (matchesRoute(pathname, ROUTES.REPORTS)) return access.canAccessReports
  return true
}

/**
 * Where the route guard sends someone off a page their organisation doesn't offer. The system group (personal) context lands on the user's own devices.
 */
export function getDevicesHome(access: NavigationAccess): string {
  return access.showMyDevices ? ROUTES.MY_DEVICES : ROUTES.DEVICES
}

export interface RecentPage {
  label: string
  href: string
}

// Ordered so nested routes are matched before their parents.
const RECENT_PAGE_ROUTES: Array<RecentPage & { exact?: boolean }> = [
  { label: "My Devices", href: ROUTES.MY_DEVICES },
  { label: "Devices", href: ROUTES.DEVICES, exact: true },
  { label: "Sites", href: ROUTES.SITES },
  { label: "Clustered Analysis", href: ROUTES.ANALYTICS },
  { label: "Network Health", href: ROUTES.NETWORK_HEALTH },
  { label: "Maintenance", href: ROUTES.MAINTENANCE },
  { label: "Reports", href: ROUTES.REPORTS },
  { label: "Network Overview", href: ROUTES.ADMIN_OVERVIEW, exact: true },
  { label: "Bench Simulator", href: ROUTES.DIAGNOSTICS_SIMULATOR },
  { label: "Fleet Health", href: ROUTES.DIAGNOSTICS },
  { label: "Device Data Analysis", href: ROUTES.VISUALISE },
  { label: "Device Profiles", href: ROUTES.DEVICE_PROFILES },
  { label: "Diagnostic Templates", href: ROUTES.DIAGNOSTIC_TEMPLATES },
  { label: "Status Codes", href: ROUTES.STATUS_CODES },
  { label: "Sensor Manufacturers", href: ROUTES.MANUFACTURERS },
  ...EXTENSION_RECENT_PAGES,
]

/** Maps a pathname to the top-level page it belongs to, for "Recently Visited". */
export function getRecentPage(pathname: string): RecentPage | null {
  const match = RECENT_PAGE_ROUTES.find((route) =>
    route.exact ? pathname === route.href : matchesRoute(pathname, route.href)
  )
  return match ? { label: match.label, href: match.href } : null
}

/** Title shown for pages that have no name of their own. */
export const DEFAULT_PAGE_TITLE = beaconConfig.app.name

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/home": "Home",
  "/dashboard": "Network Overview",
  "/dashboard/devices": "Devices",
  "/dashboard/devices/my-devices": "My Devices",
  "/dashboard/sites": "Sites",
  "/dashboard/analytics": "Clustered Analysis",
  "/dashboard/network-health": "Network Health",
  "/dashboard/network-health/issues": "Network Health",
  "/dashboard/maintenance": "Maintenance",
  "/dashboard/reports": "Reports",
  "/dashboard/diagnostics": "Diagnostics",
  "/dashboard/diagnostics/issues": "Diagnostics",
  "/dashboard/diagnostics/simulator": "Bench Simulator",
  "/dashboard/settings/device-profiles": "Device Profiles",
  "/dashboard/settings/diagnostic-templates": "Diagnostic Templates",
  "/dashboard/settings/status-codes": "Status Codes",
  "/dashboard/manufacturers": "Sensor Manufacturers",
  "/dashboard/visualise": "Device Data Analysis",
  "/dashboard/visualize": "Device Data Analysis",
  "/dashboard/settings": "Settings",
  "/dashboard/alerts": "Alerts",
  ...EXTENSION_PAGE_TITLES,
}

export function getPageTitle(pathname: string | null): string {
  if (!pathname) return DEFAULT_PAGE_TITLE

  // Exact match
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname]
  }

  // Dynamic device details route /dashboard/devices/[id]
  if (pathname.startsWith("/dashboard/devices/")) {
    if (pathname.endsWith("/diagnostics")) {
      return "Device Diagnostics"
    }
    return "Device Details"
  }

  // Site details /dashboard/sites/[id]
  if (pathname.startsWith("/dashboard/sites/")) {
    return "Site Details"
  }

  for (const [prefix, title] of EXTENSION_TITLE_PREFIXES) {
    if (pathname.startsWith(prefix)) return title
  }

  // Analytics subroutes
  if (pathname.startsWith("/dashboard/analytics/")) {
    return "Clustered Analysis"
  }

  // Fallback
  return DEFAULT_PAGE_TITLE
}
