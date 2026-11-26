import type {
  CohortBreakdownItem,
  NetworkBreakdownItem,
  NetworkStatusAlert,
  UptimeSummaryItem,
} from "@/services/network-status.service"

/**
 * Pure helpers behind the admin Overview (/dashboard): the four device statuses, the network's
 * warning and critical lines, and the figures each role view shows.
 */

export type NetworkHealth = "OK" | "WARNING" | "CRITICAL"

/**
 * The platform's check-network-status job marks a check WARNING from 35% of deployed devices not
 * transmitting and CRITICAL from 50%. A check carries its own `threshold_value`, which wins when set.
 */
export const WARNING_OFFLINE_PERCENT = 35
export const CRITICAL_OFFLINE_PERCENT = 50

export function healthFor(offlinePercent: number, warningAt: number = WARNING_OFFLINE_PERCENT): NetworkHealth {
  if (offlinePercent >= CRITICAL_OFFLINE_PERCENT) return "CRITICAL"
  if (offlinePercent >= warningAt) return "WARNING"
  return "OK"
}

export const HEALTH_LABELS: Record<NetworkHealth, string> = {
  OK: "OK",
  WARNING: "Warning",
  CRITICAL: "Critical",
}

// ─── Device statuses ─────────────────────────────────────────────────────────

export type DeviceStatusKey = "operational" | "transmitting" | "data_available" | "not_transmitting"

export interface DeviceStatusCategory {
  key: DeviceStatusKey
  /** The platform's own name for the status, kept as is. */
  label: string
  /** One line in plain words, shown under the name. */
  description: string
  /** Feed freshness: the device's latest data is at most 5 hours old. */
  isOnline: boolean
  /** Active connection: the device transmitted in the last 2 hours. */
  rawOnlineStatus: boolean
}

export const DEVICE_STATUS_CATEGORIES: DeviceStatusCategory[] = [
  {
    key: "operational",
    label: "Operational",
    description: "Fresh data, and transmitted in the last 2 hours",
    isOnline: true,
    rawOnlineStatus: true,
  },
  {
    key: "transmitting",
    label: "Transmitting",
    description: "Transmitted in the last 2 hours, but no fresh data for over 5 hours",
    isOnline: false,
    rawOnlineStatus: true,
  },
  {
    key: "data_available",
    label: "Data Available",
    description: "Fresh data, but nothing transmitted for over 2 hours",
    isOnline: true,
    rawOnlineStatus: false,
  },
  {
    key: "not_transmitting",
    label: "Not Transmitting",
    description: "No fresh data and nothing transmitted",
    isOnline: false,
    rawOnlineStatus: false,
  },
]

export const getStatusCategory = (key: DeviceStatusKey): DeviceStatusCategory =>
  DEVICE_STATUS_CATEGORIES.find((category) => category.key === key) ?? DEVICE_STATUS_CATEGORIES[3]

export const isDeviceStatusKey = (value: unknown): value is DeviceStatusKey =>
  DEVICE_STATUS_CATEGORIES.some((category) => category.key === value)

export interface StatusCounts {
  total: number
  operational: number
  transmitting: number
  data_available: number
  not_transmitting: number
}

export function countsFromCheck(check: NetworkStatusAlert): StatusCounts {
  return {
    total: check.total_deployed_devices ?? 0,
    operational: check.operational_count ?? 0,
    transmitting: check.transmitting_count ?? 0,
    data_available: check.data_available_count ?? 0,
    not_transmitting: check.not_transmitting_devices_count ?? 0,
  }
}

export function countsFromSummary(summary: {
  total_monitors: number
  operational: number
  transmitting: number
  data_available: number
  not_transmitting: number
}): StatusCounts {
  return {
    total: summary.total_monitors ?? 0,
    operational: summary.operational ?? 0,
    transmitting: summary.transmitting ?? 0,
    data_available: summary.data_available ?? 0,
    not_transmitting: summary.not_transmitting ?? 0,
  }
}

export const percentOf = (value: number, total: number): number => (total > 0 ? (value / total) * 100 : 0)

/** Online counts every deployed device except Not Transmitting, as the platform's checks do. */
export const onlinePercent = (counts: StatusCounts): number =>
  counts.total > 0 ? 100 - percentOf(counts.not_transmitting, counts.total) : 0

// ─── Since yesterday ─────────────────────────────────────────────────────────

const HOUR_MS = 60 * 60 * 1000

export interface DayOverDay {
  latest: NetworkStatusAlert
  previous: NetworkStatusAlert
  /** Change in Not Transmitting devices; positive means more devices went silent. */
  notTransmittingChange: number
  /** Change in the online rate, in percentage points. */
  onlineChange: number
}

/**
 * Compares the newest check with the one taken closest to 24 hours before it (within 3 hours
 * either side). Returns null when no such check exists.
 */
export function compareWithYesterday(checks: NetworkStatusAlert[]): DayOverDay | null {
  const valid = checks.filter((check) => !Number.isNaN(Date.parse(check.checked_at)))
  if (valid.length < 2) return null
  const latest = valid.reduce((a, b) => (Date.parse(b.checked_at) > Date.parse(a.checked_at) ? b : a))
  const target = Date.parse(latest.checked_at) - 24 * HOUR_MS

  let previous: NetworkStatusAlert | null = null
  let bestGap = Infinity
  for (const check of valid) {
    const gap = Math.abs(Date.parse(check.checked_at) - target)
    if (check !== latest && gap < bestGap) {
      previous = check
      bestGap = gap
    }
  }
  if (!previous || bestGap > 3 * HOUR_MS) return null

  return {
    latest,
    previous,
    notTransmittingChange: latest.not_transmitting_devices_count - previous.not_transmitting_devices_count,
    onlineChange: previous.not_transmitting_percentage - latest.not_transmitting_percentage,
  }
}

// ─── The period, day by day ──────────────────────────────────────────────────

export interface DailyOnline {
  date: string
  averageOnline: number
  lowestOnline: number
}

/** Daily average and lowest online rate, oldest first. */
export function dailyOnline(uptime: UptimeSummaryItem[]): DailyOnline[] {
  return [...uptime]
    .filter((day) => day && typeof day._id === "string")
    .sort((a, b) => a._id.localeCompare(b._id))
    .map((day) => ({
      date: day._id,
      averageOnline: 100 - (day.avgOfflinePercentage ?? 0),
      lowestOnline: 100 - (day.maxOfflinePercentage ?? 0),
    }))
}

export interface PeriodSummary {
  days: number
  /** Mean of the daily averages. */
  averageOnline: number | null
  /** Days whose average offline rate reached the warning line. */
  daysInWarning: number
  /** Days with at least one check at or above the critical line. */
  criticalDays: string[]
  /** The day with the lowest single check. */
  worstDay: { date: string; lowestOnline: number } | null
}

export function summarisePeriod(uptime: UptimeSummaryItem[], warningAt: number = WARNING_OFFLINE_PERCENT): PeriodSummary {
  const days = dailyOnline(uptime)
  if (days.length === 0) {
    return { days: 0, averageOnline: null, daysInWarning: 0, criticalDays: [], worstDay: null }
  }
  const averageOnline = days.reduce((sum, day) => sum + day.averageOnline, 0) / days.length
  const worst = days.reduce((a, b) => (b.lowestOnline < a.lowestOnline ? b : a))
  return {
    days: days.length,
    averageOnline,
    daysInWarning: days.filter((day) => 100 - day.averageOnline >= warningAt).length,
    criticalDays: days.filter((day) => 100 - day.lowestOnline >= CRITICAL_OFFLINE_PERCENT).map((day) => day.date),
    worstDay: { date: worst.date, lowestOnline: worst.lowestOnline },
  }
}

// ─── Fleets ──────────────────────────────────────────────────────────────────

export interface RankedFleet {
  id: string
  name: string
  devices: number
  averageOnline: number
  lowestOnline: number
  highestOnline: number
  health: NetworkHealth
}

/** Manufacturers or cohorts, worst average first. */
export function rankFleets(
  items: Array<NetworkBreakdownItem | CohortBreakdownItem>,
  nameOf: (item: NetworkBreakdownItem | CohortBreakdownItem) => string,
  warningAt: number = WARNING_OFFLINE_PERCENT,
): RankedFleet[] {
  return items
    .map((item) => ({
      id: item._id,
      name: nameOf(item),
      devices: Math.round(item.avg_total_monitors ?? 0),
      averageOnline: 100 - (item.avg_not_transmitting_percentage ?? 0),
      lowestOnline: 100 - (item.max_not_transmitting_percentage ?? 0),
      highestOnline: 100 - (item.min_not_transmitting_percentage ?? 0),
      health: healthFor(item.avg_not_transmitting_percentage ?? 0, warningAt),
    }))
    .sort((a, b) => a.averageOnline - b.averageOnline || a.name.localeCompare(b.name))
}

// ─── Reporting ───────────────────────────────────────────────────────────────

const formatDay = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" })

const formatPercent = (value: number) => `${value.toFixed(1)}%`

/** A paragraph people can paste into a report or an email. */
export function reportSummary(input: {
  scopeName: string
  period: PeriodSummary
  firstDay: string | null
  lastDay: string | null
  deployed: number | null
  fleets: RankedFleet[]
}): string {
  const { scopeName, period, firstDay, lastDay, deployed, fleets } = input
  if (period.averageOnline === null || !firstDay || !lastDay) {
    return `No status checks were recorded for ${scopeName} in this period.`
  }

  const range = firstDay === lastDay ? `On ${formatDay(firstDay)}` : `Between ${formatDay(firstDay)} and ${formatDay(lastDay)}`
  const of = deployed ? ` of the ${deployed.toLocaleString("en-GB")} deployed devices` : " of deployed devices"
  const sentences = [`${range}, an average of ${formatPercent(period.averageOnline)}${of} in ${scopeName} were online.`]

  const warning =
    period.daysInWarning === 0
      ? "The daily average stayed below the warning line every day"
      : `The daily average reached the warning line on ${period.daysInWarning} of ${period.days} days`
  const critical =
    period.criticalDays.length === 0
      ? "no check reached the critical line."
      : period.criticalDays.length === 1
        ? `one day, ${formatDay(period.criticalDays[0])}, had a check at the critical line.`
        : `${period.criticalDays.length} days had a check at the critical line.`
  sentences.push(`${warning}, and ${critical}`)

  if (fleets.length > 1) {
    const best = fleets[fleets.length - 1]
    const worst = fleets[0]
    sentences.push(
      `${best.name} had the highest average online rate (${formatPercent(best.averageOnline)}) and ${worst.name} the lowest (${formatPercent(worst.averageOnline)}).`,
    )
  }
  return sentences.join(" ")
}

// ─── Devices to visit ────────────────────────────────────────────────────────

export interface StatusDeviceSite {
  _id?: string
  name?: string
  district?: string
  country?: string
}

/** A device from the platform's /devices/summary list. */
export interface StatusDevice {
  _id: string
  name: string
  long_name?: string
  network?: string
  lastActive?: string | null
  lastRawData?: string | null
  site?: StatusDeviceSite | StatusDeviceSite[] | null
}

export const siteOf = (device: StatusDevice): StatusDeviceSite | null =>
  (Array.isArray(device.site) ? device.site[0] : device.site) ?? null

/** The device's latest data, from the feed or the raw transmission, whichever is newer. */
export function lastSeenOf(device: StatusDevice): string | null {
  const times = [device.lastActive, device.lastRawData]
    .filter((value): value is string => typeof value === "string" && !Number.isNaN(Date.parse(value)))
    .sort((a, b) => Date.parse(b) - Date.parse(a))
  return times[0] ?? null
}

export function locationOf(device: StatusDevice): string {
  const site = siteOf(device)
  if (!site) return ""
  return [site.name, site.district || site.country].filter(Boolean).join(", ")
}

/** "23 days", "16 hours", "40 minutes"; null for a device never seen. */
export function silentFor(lastSeen: string | null, now: Date = new Date()): string | null {
  if (!lastSeen) return null
  const ms = Math.max(0, now.getTime() - Date.parse(lastSeen))
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours} ${hours === 1 ? "hour" : "hours"}`
  const days = Math.floor(hours / 24)
  return `${days} days`
}

/** Never-seen devices first, then the longest silent. */
export function sortByLongestSilent(devices: StatusDevice[]): StatusDevice[] {
  const time = (device: StatusDevice) => {
    const seen = lastSeenOf(device)
    return seen ? Date.parse(seen) : -Infinity
  }
  return [...devices].sort((a, b) => time(a) - time(b) || a.name.localeCompare(b.name))
}

export interface AreaCount {
  area: string
  count: number
}

/** Devices counted by district (country when a site has none), largest first; the rest folded into "Other areas". */
export function countByArea(devices: StatusDevice[], top = 6): AreaCount[] {
  const counts = new Map<string, number>()
  for (const device of devices) {
    const site = siteOf(device)
    const area = site?.district || site?.country || "No site"
    counts.set(area, (counts.get(area) ?? 0) + 1)
  }
  const sorted = [...counts.entries()]
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count || a.area.localeCompare(b.area))
  if (sorted.length <= top) return sorted
  const rest = sorted.slice(top - 1).reduce((sum, item) => sum + item.count, 0)
  return [...sorted.slice(0, top - 1), { area: "Other areas", count: rest }]
}

const csvCell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)

export function devicesToCsv(
  devices: StatusDevice[],
  networkName: (network: string) => string,
  now: Date = new Date(),
): string {
  const header = ["Device", "Site", "Area", "Country", "Manufacturer", "Last data (UTC)", "Silent for"]
  const rows = devices.map((device) => {
    const site = siteOf(device)
    const seen = lastSeenOf(device)
    return [
      device.long_name || device.name,
      site?.name ?? "",
      site?.district ?? "",
      site?.country ?? "",
      device.network ? networkName(device.network) : "",
      seen ? new Date(seen).toISOString() : "",
      silentFor(seen, now) ?? "Never",
    ]
  })
  return [header, ...rows].map((row) => row.map((cell) => csvCell(String(cell))).join(",")).join("\n")
}

// ─── Role views ──────────────────────────────────────────────────────────────

export type OverviewView = "operations" | "field" | "reporting" | "hardware"

export const OVERVIEW_VIEWS: Array<{ id: OverviewView; label: string; audience: string }> = [
  { id: "operations", label: "Operations", audience: "Network managers: status, changes and incidents" },
  { id: "field", label: "Field", audience: "Field engineers: which devices to visit, and where" },
  { id: "reporting", label: "Reporting", audience: "Leadership and funders: headline numbers" },
  { id: "hardware", label: "Hardware", audience: "Hardware team: manufacturers and cohorts" },
]

export const OVERVIEW_VIEW_STORAGE_KEY = "beacon-overview-view"

export const isOverviewView = (value: unknown): value is OverviewView =>
  OVERVIEW_VIEWS.some((view) => view.id === value)
