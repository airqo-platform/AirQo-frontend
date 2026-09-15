/**
 * Beacon navigation model, mirroring Vertex's layout:
 *
 * - Two modules: "devices" (day-to-day monitoring) and "admin" (AirQo-internal
 *   tools). The active module is derived from the pathname alone, so the
 *   sidebar can never disagree with the page being shown.
 * - The Administrative Panel is entered from the primary (hamburger) drawer and
 *   is only offered to AirQo-group members who can maintain devices.
 * - Personal devices ("My Devices") belong to the AirQo (personal) context;
 *   other organisations see their organisation's devices instead.
 *
 * The access rules live here so the sidebars, the drawer and the route guard
 * all read from one policy.
 */

export const ROUTES = {
  ADMIN_OVERVIEW: "/dashboard",
  DEVICES: "/dashboard/devices",
  MY_DEVICES: "/dashboard/devices/my-devices",
  ANALYTICS: "/dashboard/analytics",
  VISUALISE: "/dashboard/visualise",
  MAINTENANCE: "/dashboard/maintenance",
  REPORTS: "/dashboard/reports",
  DIAGNOSTICS: "/dashboard/diagnostics",
  DIAGNOSTICS_SIMULATOR: "/dashboard/diagnostics/simulator",
  DEVICE_PROFILES: "/dashboard/settings/device-profiles",
  DIAGNOSTIC_TEMPLATES: "/dashboard/settings/diagnostic-templates",
  COLLOCATION_INLAB: "/dashboard/collocation/inlab",
  COLLOCATION_SITE: "/dashboard/collocation/site",
  FIRMWARE: "/dashboard/firmware",
  CATEGORIES: "/dashboard/category",
  STOCK: "/dashboard/stock",
  USERS: "/dashboard/users",
  ALERTS: "/dashboard/alerts",
  SETTINGS: "/dashboard/settings",
} as const

export type NavModule = "devices" | "admin"

export const matchesRoute = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`)

// Everything under these prefixes belongs to the admin module. The overview
// ("/dashboard") is matched exactly because every other page nests under it.
const ADMIN_ROUTE_PREFIXES = [
  ROUTES.DIAGNOSTICS,
  ROUTES.DEVICE_PROFILES,
  ROUTES.DIAGNOSTIC_TEMPLATES,
  "/dashboard/collocation",
  ROUTES.FIRMWARE,
  ROUTES.CATEGORIES,
  ROUTES.STOCK,
  // User management isn't in the admin menu yet, but it is an admin surface.
  ROUTES.USERS,
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
  /** The AirQo group is active — Beacon's equivalent of Vertex's personal context. */
  isPersonalContext: boolean
  canMaintainDevices: boolean
  /** Gates both the "Administrative Panel" entry and every admin-module route. */
  canAccessAdminPanel: boolean
  showMyDevices: boolean
  showOrgDevices: boolean
  canAccessAnalytics: boolean
  canAccessMaintenance: boolean
  canAccessReports: boolean
  canAccessVisualise: boolean
}

export function getNavigationAccess({
  activeGroup,
  isActiveGroupAdmin,
  hasPermission,
  hasAnyPermission,
}: NavigationAccessInput): NavigationAccess {
  const hasGroup = Boolean(activeGroup)
  const isPersonalContext = activeGroup?.toLowerCase() === "airqo"
  const canMaintainDevices = hasPermission("DEVICE_MAINTAIN") || isActiveGroupAdmin
  // Outside the AirQo group every member gets their organisation's tools;
  // inside it, the fleet-wide views need maintainer rights.
  const canUseGroupTools = hasGroup && (!isPersonalContext || canMaintainDevices)

  return {
    isPersonalContext,
    canMaintainDevices,
    canAccessAdminPanel: isPersonalContext && canMaintainDevices,
    showMyDevices: isPersonalContext,
    showOrgDevices: !isPersonalContext || canMaintainDevices,
    canAccessAnalytics:
      canUseGroupTools || (hasGroup && hasAnyPermission(["ANALYTICS_VIEW", "DATA_VIEW"])),
    canAccessMaintenance: canUseGroupTools,
    canAccessReports:
      canUseGroupTools ||
      (hasGroup && hasAnyPermission(["DATA_EXPORT", "ANALYTICS_EXPORT", "DATA_VIEW"])),
    canAccessVisualise: hasGroup,
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
  if (isAdminRoute(pathname)) return access.canAccessAdminPanel
  if (matchesRoute(pathname, ROUTES.MY_DEVICES)) return access.showMyDevices
  // Exact match so device detail pages stay reachable from My Devices.
  if (pathname === ROUTES.DEVICES) return access.showOrgDevices
  if (matchesRoute(pathname, ROUTES.ANALYTICS)) return access.canAccessAnalytics
  if (matchesRoute(pathname, ROUTES.MAINTENANCE)) return access.canAccessMaintenance
  // Fleet-wide device alerts carry the same visibility as maintenance
  if (matchesRoute(pathname, ROUTES.ALERTS)) return access.canAccessMaintenance
  if (matchesRoute(pathname, ROUTES.REPORTS)) return access.canAccessReports
  if (matchesRoute(pathname, ROUTES.VISUALISE) || matchesRoute(pathname, "/dashboard/visualize")) {
    return access.canAccessVisualise
  }
  return true
}

/**
 * Landing page of the devices module: the drawer's "Home" and the guard's redirect target.
 * As in Vertex, the AirQo (personal) context lands on the user's own devices.
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
  { label: "Performance Analysis", href: ROUTES.ANALYTICS },
  { label: "Device Data Analysis", href: ROUTES.VISUALISE },
  { label: "Maintenance", href: ROUTES.MAINTENANCE },
  { label: "Reports", href: ROUTES.REPORTS },
  { label: "Network Overview", href: ROUTES.ADMIN_OVERVIEW, exact: true },
  { label: "Bench Simulator", href: ROUTES.DIAGNOSTICS_SIMULATOR },
  { label: "Fleet Health", href: ROUTES.DIAGNOSTICS },
  { label: "Device Profiles", href: ROUTES.DEVICE_PROFILES },
  { label: "Diagnostic Templates", href: ROUTES.DIAGNOSTIC_TEMPLATES },
  { label: "In-Lab Collocation", href: ROUTES.COLLOCATION_INLAB },
  { label: "Site Collocation", href: ROUTES.COLLOCATION_SITE },
  { label: "Firmware Management", href: ROUTES.FIRMWARE },
  { label: "Device Categories", href: ROUTES.CATEGORIES },
  { label: "Stock & Inventory", href: ROUTES.STOCK },
]

/** Maps a pathname to the top-level page it belongs to, for "Recently Visited". */
export function getRecentPage(pathname: string): RecentPage | null {
  const match = RECENT_PAGE_ROUTES.find((route) =>
    route.exact ? pathname === route.href : matchesRoute(pathname, route.href)
  )
  return match ? { label: match.label, href: match.href } : null
}
