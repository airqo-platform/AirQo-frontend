import {
  AqActivityHeart,
  AqAirQlouds,
  AqFile02,
  AqMarkerPin01,
  AqMonitor,
  AqTool02,
  AqUserSquare,
} from "@airqo/icons-react"
import type { NavIcon } from "@/components/dashboard/nav-config"
import { ROUTES, type NavigationAccess } from "@/lib/navigation"

export interface HomeFeature {
  id: string
  /** The page's name, for introducing Beacon to someone new. */
  title: string
  /** What it's for, for someone who already knows their way around. */
  action: string
  description: string
  href: string
  icon: NavIcon
  /** False when it needs an organisation the person isn't working in. */
  available: boolean
}

type FeatureDefinition = Omit<HomeFeature, "available"> & {
  isAvailable: (access: NavigationAccess) => boolean
  /** Device lists have no "locked" state: whichever the person can't open is simply left out. */
  hideWhenUnavailable?: boolean
}

const FEATURES: FeatureDefinition[] = [
  {
    id: "my-devices",
    title: "My Devices",
    action: "Check my devices",
    description: "See status, deployment and readings for devices you own.",
    href: ROUTES.MY_DEVICES,
    icon: AqUserSquare,
    isAvailable: (access) => access.showMyDevices,
    hideWhenUnavailable: true,
  },
  {
    id: "devices",
    title: "Devices",
    action: "Check devices",
    description: "See status, deployment and readings across your fleet.",
    href: ROUTES.DEVICES,
    icon: AqMonitor,
    isAvailable: (access) => access.showOrgDevices,
    hideWhenUnavailable: true,
  },
  {
    id: "sites",
    title: "Sites",
    action: "Explore sites",
    description: "Find monitoring sites and the devices deployed at each one.",
    href: ROUTES.SITES,
    icon: AqMarkerPin01,
    isAvailable: (access) => access.canAccessSites,
  },
  {
    id: "analytics",
    title: "Clustered Analysis",
    action: "Compare clusters",
    description: "Compare performance across clusters of devices.",
    href: ROUTES.ANALYTICS,
    icon: AqAirQlouds,
    isAvailable: (access) => access.canAccessAnalytics,
  },
  {
    id: "network-health",
    title: "Network Health",
    action: "Check network health",
    description: "See what the nightly diagnosis found and what to fix first.",
    href: ROUTES.NETWORK_HEALTH,
    icon: AqActivityHeart,
    isAvailable: (access) => access.canAccessNetworkHealth,
  },
  {
    id: "maintenance",
    title: "Maintenance",
    action: "Plan maintenance",
    description: "Plan field visits on a map of devices and sites.",
    href: ROUTES.MAINTENANCE,
    icon: AqTool02,
    isAvailable: (access) => access.canAccessMaintenance,
  },
  {
    id: "reports",
    title: "Reports",
    action: "Build a report",
    description: "Build and export reports on device performance.",
    href: ROUTES.REPORTS,
    icon: AqFile02,
    isAvailable: (access) => access.canAccessReports,
  },
]

/**
 * The parts of Beacon to offer on Home. Pages that need an organisation stay listed as locked, so
 * someone new can see what Beacon does. AirQo staff get no locked entries: the one page their
 * admin context hides, Network Health, has a counterpart in the admin panel.
 */
export function getHomeFeatures(access: NavigationAccess): HomeFeature[] {
  return FEATURES.flatMap(({ isAvailable, hideWhenUnavailable, ...feature }) => {
    const available = isAvailable(access)
    if (!available && (hideWhenUnavailable || access.canAccessAdminPanel)) return []
    return [{ ...feature, available }]
  })
}
