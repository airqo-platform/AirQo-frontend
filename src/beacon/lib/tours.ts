import { ROUTES, isRouteAccessible, type NavigationAccess } from "@/lib/navigation"

export interface TourStep {
  /** Selector for what the step spotlights. A step whose target isn't on screen is skipped. */
  target: string
  title: string
  description: string
}

export interface PageTour {
  /** Remembered once seen, so pages sharing an id only tour once. */
  id: string
  title: string
  /** The tour waits for this, so it never runs over a loading or empty page. */
  readyTarget: string
  steps: TourStep[]
}

const tourTarget = (name: string) => `[data-tour="${name}"]`

const HOME_TOUR: PageTour = {
  id: "home",
  title: "Explore Beacon",
  readyTarget: tourTarget("home-content"),
  steps: [
    {
      target: tourTarget("home-setup"),
      title: "Start here",
      description:
        "Add a device in Vertex or join your organisation in Nexus. Beacon fills up as soon as you've done either.",
    },
    {
      target: tourTarget("home-overview"),
      title: "Your devices right now",
      description: "Total, deployed, online and offline counts for the organisation you're working in.",
    },
    {
      target: tourTarget("side-menu"),
      title: "Everything is in this menu",
      description: "These are the parts of Beacon you can open. What's listed depends on the organisation you're in.",
    },
    {
      target: tourTarget("organisation-switcher"),
      title: "Switch organisation",
      description:
        "Your devices, sites and reports follow the organisation picked here. You can also find others to join.",
    },
    {
      target: tourTarget("help-menu"),
      title: "Need a hand?",
      description: "Replay the tour for the page you're on, or send us feedback, from here.",
    },
  ],
}

const DEVICE_LIST_STEPS: TourStep[] = [
  {
    target: tourTarget("device-summary"),
    title: "Your devices at a glance",
    description:
      "These cards count your devices and how many are deployed, online and offline. Check them first to see if anything needs a visit.",
  },
  {
    target: tourTarget("device-filters"),
    title: "Find a device",
    description: "Search by name, ID, location, city or country, or narrow the list by manufacturer.",
  },
  {
    target: tourTarget("device-row"),
    title: "Open a device",
    description: "Select any device to see its details, diagnostics and performance.",
  },
]

const MY_DEVICES_TOUR: PageTour = {
  id: "device-list",
  title: "My Devices",
  readyTarget: tourTarget("device-row"),
  steps: DEVICE_LIST_STEPS,
}

const DEVICES_TOUR: PageTour = {
  id: "device-list",
  title: "Devices",
  readyTarget: tourTarget("device-row"),
  steps: DEVICE_LIST_STEPS,
}

const DEVICE_DETAILS_TOUR: PageTour = {
  id: "device-details",
  title: "Device details",
  readyTarget: tourTarget("device-tabs"),
  steps: [
    {
      target: tourTarget("device-tabs"),
      title: "Everything about this device",
      description: "Each tab covers one side of this device, from its details to its config and performance.",
    },
    {
      target: tourTarget("device-diagnostics-tab"),
      title: "Start with Diagnostics when something's wrong",
      description: "It leads with the likely cause and what to check before a field visit.",
    },
  ],
}

const NETWORK_HEALTH_TOUR: PageTour = {
  id: "network-health",
  title: "Network Health",
  readyTarget: tourTarget("fleet-summary"),
  steps: [
    {
      target: tourTarget("fleet-summary"),
      title: "How your fleet is doing",
      description: "How many devices were diagnosed, how many have issues, and what's new or resolved since the day before.",
    },
    {
      target: tourTarget("fleet-queue"),
      title: "What to fix",
      description: "Issues grouped by the part of the device to fix, most critical first. Open a group to see which devices to visit first.",
    },
  ],
}

const MAINTENANCE_TOUR: PageTour = {
  id: "maintenance",
  title: "Maintenance",
  // The map is on the page before it has anything on it, so wait for its first device. Leaflet's
  // marker elements have no size of their own, and a target has to be visible, so look inside one.
  readyTarget: `${tourTarget("maintenance-map")} .custom-device-marker > *`,
  steps: [
    {
      target: tourTarget("maintenance-map"),
      title: "Your fleet on a map",
      description: "Each marker is a device or site. Select one to see its health and recent performance.",
    },
    {
      target: tourTarget("maintenance-filters"),
      title: "Narrow it down",
      description: "Filter what the map shows, such as by period, how long devices have been offline, or cluster.",
    },
    {
      target: tourTarget("maintenance-route"),
      title: "Plan a field trip",
      description: "Plan a route through what's on the map, or only the devices you've selected. You can then copy it, share it or open it in Google Maps.",
    },
  ],
}

const SITES_TOUR: PageTour = {
  id: "sites",
  title: "Sites",
  readyTarget: tourTarget("entity-row"),
  steps: [
    {
      target: tourTarget("sites-summary"),
      title: "How your sites are doing",
      description: "Uptime, error margin and correlation for the devices at your sites.",
    },
    {
      target: tourTarget("entity-row"),
      title: "Open a site",
      description: "Select a site to see its devices and how each one performed.",
    },
  ],
}

const CLUSTERED_ANALYSIS_TOUR: PageTour = {
  id: "clustered-analysis",
  title: "Clustered Analysis",
  readyTarget: tourTarget("entity-row"),
  steps: [
    {
      target: tourTarget("analysis-filters"),
      title: "Choose what to compare",
      description: "Filter by clusters or devices, pick the ones you want and a date range, then press Analyse.",
    },
    {
      target: tourTarget("entity-row"),
      title: "Or open one directly",
      description: "Select a row to see how that cluster or device has been performing.",
    },
  ],
}

const REPORTS_TOUR: PageTour = {
  id: "reports",
  title: "Reports",
  readyTarget: tourTarget("report-components"),
  steps: [
    {
      target: tourTarget("analysis-filters"),
      title: "Choose what to report on",
      description: "Pick what to report on, then press Analyse to build a live preview below. Export to PDF appears once it's ready.",
    },
    {
      target: tourTarget("report-components"),
      title: "Choose what goes in",
      description: "Tick the sections to include in the PDF, such as heatmaps and sensor health.",
    },
    {
      target: tourTarget("report-preview"),
      title: "Check it before you export",
      description: "This shows what the report contains. Use Export to PDF at the top of the page when it looks right.",
    },
  ],
}

const FLEET_HEALTH_TOUR: PageTour = {
  id: "fleet-health",
  title: "Fleet Health",
  readyTarget: tourTarget("fleet-first-group"),
  steps: [
    {
      target: tourTarget("fleet-queue"),
      title: "The fix queue",
      description: "What the nightly diagnosis found, grouped by the part of the device to fix, most critical first.",
    },
    {
      target: tourTarget("fleet-first-group"),
      title: "Open a group",
      description: "It lists the devices to visit first. Inspect one to see its likely cause.",
    },
  ],
}

const TOUR_BY_ROUTE: Record<string, PageTour> = {
  [ROUTES.HOME]: HOME_TOUR,
  [ROUTES.MY_DEVICES]: MY_DEVICES_TOUR,
  [ROUTES.DEVICES]: DEVICES_TOUR,
  [ROUTES.SITES]: SITES_TOUR,
  [ROUTES.ANALYTICS]: CLUSTERED_ANALYSIS_TOUR,
  [ROUTES.NETWORK_HEALTH]: NETWORK_HEALTH_TOUR,
  [ROUTES.MAINTENANCE]: MAINTENANCE_TOUR,
  [ROUTES.REPORTS]: REPORTS_TOUR,
  [ROUTES.DIAGNOSTICS]: FLEET_HEALTH_TOUR,
}

const DEVICE_DETAILS_PATH = /^\/dashboard\/devices\/[^/]+$/

/** The tour for a page, if it has one and the person may open that page. */
export function getTourForPath(pathname: string, access: NavigationAccess): PageTour | null {
  const tour = TOUR_BY_ROUTE[pathname] ?? (DEVICE_DETAILS_PATH.test(pathname) ? DEVICE_DETAILS_TOUR : null)
  return tour && isRouteAccessible(pathname, access) ? tour : null
}

export const findVisibleTarget = (selector: string): HTMLElement | null =>
  Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }) ?? null

export const getVisibleSteps = (tour: PageTour): TourStep[] =>
  tour.steps.filter((step) => findVisibleTarget(step.target))

interface Size {
  width: number
  height: number
}

type TargetBox = Pick<DOMRect, "top" | "right" | "bottom" | "left">

/**
 * Where the tour card goes: below its target, else above, else beside it for targets as tall as
 * the screen, always inside a 16px gutter so it can't drift off a small viewport.
 */
export function getTourCardPosition(
  target: TargetBox | null,
  card: Size,
  viewport: Size
): { top: number; left: number } {
  const margin = 16
  const gap = 14
  const maxLeft = Math.max(margin, viewport.width - card.width - margin)
  const maxTop = Math.max(margin, viewport.height - card.height - margin)
  const clampLeft = (value: number) => Math.min(Math.max(margin, value), maxLeft)
  const clampTop = (value: number) => Math.min(Math.max(margin, value), maxTop)
  const bottomCentre = { top: maxTop, left: clampLeft((viewport.width - card.width) / 2) }

  if (!target) return bottomCentre

  // Clamped even where it fits, because the page can scroll the target off screen behind the tour
  if (target.bottom + gap + card.height <= viewport.height - margin) {
    return { top: clampTop(target.bottom + gap), left: clampLeft(target.left) }
  }
  if (target.top - gap - card.height >= margin) {
    return { top: clampTop(target.top - gap - card.height), left: clampLeft(target.left) }
  }
  if (target.right + gap + card.width <= viewport.width - margin) {
    return { top: clampTop(target.top), left: clampLeft(target.right + gap) }
  }
  if (target.left - gap - card.width >= margin) {
    return { top: clampTop(target.top), left: clampLeft(target.left - gap - card.width) }
  }
  return bottomCentre
}

// ===========================================================
// Which tours someone has seen
// ===========================================================

// Must not contain "auth", "token" or "user": see the note in lib/feedback-preferences.ts.
const SEEN_TOURS_KEY = "beacon_tours_seen"

// Where storage is blocked, this at least stops a tour repeating on every page visit.
const seenThisSession = new Set<string>()

const seenKey = (personId: string) => `${SEEN_TOURS_KEY}_${personId}`

const readSeenTours = (personId: string): string[] => {
  try {
    const stored = JSON.parse(globalThis.localStorage.getItem(seenKey(personId)) ?? "[]")
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

export const hasSeenTour = (personId: string, tourId: string): boolean =>
  seenThisSession.has(`${personId}:${tourId}`) || readSeenTours(personId).includes(tourId)

export const markTourSeen = (personId: string, tourId: string): void => {
  seenThisSession.add(`${personId}:${tourId}`)
  try {
    const seen = new Set(readSeenTours(personId)).add(tourId)
    globalThis.localStorage.setItem(seenKey(personId), JSON.stringify([...seen]))
  } catch {
    // Storage can be full or blocked; the session's memory still works.
  }
}
