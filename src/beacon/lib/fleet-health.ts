/**
 * Fleet health as a fix queue: one day's diagnosed issues grouped by the part of the device they
 * concern (the issue's subsystem, e.g. "battery"), with each group's devices in the order to visit
 * them. Everything here works on the issues of a single diagnosis day.
 */
import type { DiagnosticCheckType, FleetDeviceHealth, FleetIssue, IssueSeverity } from "@/types/diagnostics"

const SEVERITY_RANK: Record<IssueSeverity, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }

const rank = (severity: string): number => SEVERITY_RANK[severity as IssueSeverity] ?? 0

const SUBSYSTEM_LABELS: Record<string, string> = {
  battery: "Battery",
  sensor: "Sensors",
  connectivity: "Connectivity",
}

/** The name people use for a subsystem: "battery" → "Battery", "gps_module" → "Gps module". */
export function subsystemLabel(subsystem?: string | null): string {
  const key = subsystem?.trim().toLowerCase() || ""
  if (!key) return "Other"
  if (SUBSYSTEM_LABELS[key]) return SUBSYSTEM_LABELS[key]
  const words = key.replace(/[_-]+/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** The subsystem as the word before "issues": "battery issues", "sensor issues", "gps module issues". */
export function subsystemNoun(subsystem?: string | null): string {
  return subsystem?.trim().toLowerCase().replace(/[_-]+/g, " ") || "other"
}

export type SeverityCounts = Record<IssueSeverity, number>

export const emptySeverityCounts = (): SeverityCounts => ({ CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 })

export function countSeverities(issues: Pick<FleetIssue, "severity">[]): SeverityCounts {
  const counts = emptySeverityCounts()
  for (const issue of issues) {
    if (issue.severity in counts) counts[issue.severity] += 1
  }
  return counts
}

export interface FleetGroupDevice {
  deviceId: string
  deviceName: string
  /** Most severe first, then longest-running. */
  issues: FleetIssue[]
  worstSeverity: IssueSeverity
  hasNewIssue: boolean
  longestStreakDays: number
  streakStartDate: string | null
  /** Known only for the day's lowest-scoring devices, which the summary lists. */
  healthScore: number | null
}

export interface FleetIssueType {
  title: string
  deviceCount: number
  newDeviceCount: number
}

export interface FleetIssueGroup {
  subsystem: string
  label: string
  issueCount: number
  deviceCount: number
  newDeviceCount: number
  severityCounts: SeverityCounts
  /** By title, most devices first. */
  types: FleetIssueType[]
  /** In visit order (see `sortDevices`, "score"). */
  devices: FleetGroupDevice[]
  /** How many of the day's lowest-scoring devices have their likely cause in this group. */
  likelyCauseDeviceCount: number
}

export type DeviceSortOrder = "score" | "severity" | "streak" | "issues"

export const DEVICE_SORT_LABELS: Record<DeviceSortOrder, string> = {
  severity: "Most severe first",
  score: "Lowest health score first",
  streak: "Longest-running first",
  issues: "Most issues first",
}

const compareIssues = (a: FleetIssue, b: FleetIssue): number =>
  rank(b.severity) - rank(a.severity) || b.streak_days - a.streak_days || a.title.localeCompare(b.title)

const bySeverity = (a: FleetGroupDevice, b: FleetGroupDevice): number =>
  rank(b.worstSeverity) - rank(a.worstSeverity) ||
  b.issues.length - a.issues.length ||
  b.longestStreakDays - a.longestStreakDays ||
  a.deviceName.localeCompare(b.deviceName)

const DEVICE_COMPARATORS: Record<DeviceSortOrder, (a: FleetGroupDevice, b: FleetGroupDevice) => number> = {
  severity: bySeverity,
  // Devices without a known score follow those with one, in severity order.
  score: (a, b) => {
    if (a.healthScore !== null && b.healthScore !== null) return a.healthScore - b.healthScore || bySeverity(a, b)
    if (a.healthScore !== null) return -1
    if (b.healthScore !== null) return 1
    return bySeverity(a, b)
  },
  streak: (a, b) => b.longestStreakDays - a.longestStreakDays || bySeverity(a, b),
  issues: (a, b) => b.issues.length - a.issues.length || bySeverity(a, b),
}

export function sortDevices(devices: FleetGroupDevice[], order: DeviceSortOrder): FleetGroupDevice[] {
  return [...devices].sort(DEVICE_COMPARATORS[order])
}

/** The day's issues as one entry per device. `scores` maps device ids to known health scores. */
export function summariseDevices(issues: FleetIssue[], scores: Map<string, number> = new Map()): FleetGroupDevice[] {
  const byDevice = new Map<string, FleetIssue[]>()
  for (const issue of issues) {
    const list = byDevice.get(issue.device_id)
    if (list) list.push(issue)
    else byDevice.set(issue.device_id, [issue])
  }

  const devices = [...byDevice.entries()].map(([deviceId, deviceIssues]): FleetGroupDevice => {
    const sorted = [...deviceIssues].sort(compareIssues)
    const longest = deviceIssues.reduce((best, issue) => (issue.streak_days > best.streak_days ? issue : best))
    return {
      deviceId,
      deviceName: deviceIssues[0].device_name || deviceId,
      issues: sorted,
      worstSeverity: sorted[0].severity,
      hasNewIssue: deviceIssues.some((issue) => issue.is_new),
      longestStreakDays: longest.streak_days,
      streakStartDate: longest.streak_start_date || null,
      healthScore: scores.get(deviceId) ?? null,
    }
  })
  return sortDevices(devices, "score")
}

export const scoresFromWorstDevices = (worstDevices: FleetDeviceHealth[] = []): Map<string, number> =>
  new Map(worstDevices.map((device) => [device.device_id, device.overall_health_score]))

/**
 * How many of the day's lowest-scoring devices have their likely cause among `devices`' issues. A
 * device's `top_cause_code` names a component ("COMPONENT_FAULT:device_battery"); it counts when one of
 * that device's issues here is on the same component.
 */
export function countLikelyCauses(devices: FleetGroupDevice[], worstDevices: FleetDeviceHealth[] = []): number {
  const byId = new Map(devices.map((device) => [device.deviceId, device]))
  return worstDevices.filter((worst) => {
    const component = worst.top_cause_code?.split(":")[1]
    return Boolean(component && byId.get(worst.device_id)?.issues.some((issue) => issue.component_name === component))
  }).length
}

const urgency = (group: FleetIssueGroup) => group.severityCounts.CRITICAL + group.severityCounts.HIGH

/**
 * Groups the day's issues by subsystem. Groups with the most critical and high issues come first,
 * then those with more critical issues, then those affecting more devices.
 */
export function groupFleetIssues(issues: FleetIssue[], worstDevices: FleetDeviceHealth[] = []): FleetIssueGroup[] {
  const scores = scoresFromWorstDevices(worstDevices)
  const bySubsystem = new Map<string, FleetIssue[]>()
  for (const issue of issues) {
    const key = issue.subsystem?.trim().toLowerCase() || ""
    const list = bySubsystem.get(key)
    if (list) list.push(issue)
    else bySubsystem.set(key, [issue])
  }

  const groups = [...bySubsystem.entries()].map(([subsystem, groupIssues]): FleetIssueGroup => {
    const devices = summariseDevices(groupIssues, scores)
    const types = new Map<string, { devices: Set<string>; newDevices: Set<string> }>()
    for (const issue of groupIssues) {
      const entry = types.get(issue.title) ?? { devices: new Set<string>(), newDevices: new Set<string>() }
      entry.devices.add(issue.device_id)
      if (issue.is_new) entry.newDevices.add(issue.device_id)
      types.set(issue.title, entry)
    }
    return {
      subsystem,
      label: subsystemLabel(subsystem),
      issueCount: groupIssues.length,
      deviceCount: devices.length,
      newDeviceCount: devices.filter((device) => device.hasNewIssue).length,
      severityCounts: countSeverities(groupIssues),
      types: [...types.entries()]
        .map(([title, entry]) => ({ title, deviceCount: entry.devices.size, newDeviceCount: entry.newDevices.size }))
        .sort((a, b) => b.deviceCount - a.deviceCount || a.title.localeCompare(b.title)),
      devices,
      likelyCauseDeviceCount: countLikelyCauses(devices, worstDevices),
    }
  })

  return groups.sort(
    (a, b) =>
      urgency(b) - urgency(a) ||
      b.severityCounts.CRITICAL - a.severityCounts.CRITICAL ||
      b.deviceCount - a.deviceCount ||
      a.label.localeCompare(b.label)
  )
}

export interface IssueAgeBucket {
  label: string
  count: number
}

/** How long the day's issues have been found on consecutive days. */
export function issueAgeBuckets(issues: Pick<FleetIssue, "is_new" | "streak_days">[]): IssueAgeBucket[] {
  const buckets: IssueAgeBucket[] = [
    { label: "New today", count: 0 },
    { label: "2–3 days", count: 0 },
    { label: "4–6 days", count: 0 },
    { label: "7 days or more", count: 0 },
  ]
  for (const issue of issues) {
    const days = issue.is_new ? 1 : issue.streak_days
    const index = days <= 1 ? 0 : days <= 3 ? 1 : days <= 6 ? 2 : 3
    buckets[index].count += 1
  }
  return buckets
}

export interface CheckTypeCount {
  checkType: DiagnosticCheckType | string
  deviceCount: number
}

/** The checks behind the devices' issues, each with the number of devices it found, most first. */
export function checkTypeCounts(devices: FleetGroupDevice[]): CheckTypeCount[] {
  const counts = new Map<string, number>()
  for (const device of devices) {
    for (const checkType of new Set(device.issues.map((issue) => issue.check_type))) {
      counts.set(checkType, (counts.get(checkType) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([checkType, deviceCount]) => ({ checkType, deviceCount }))
    .sort((a, b) => b.deviceCount - a.deviceCount || a.checkType.localeCompare(b.checkType))
}

export interface DeviceFilters {
  checkType?: string | null
  severity?: IssueSeverity | null
  newOnly?: boolean
  /** Matched against the device name and id, and each issue's code, title and component. */
  query?: string
}

/**
 * The device's issues that match every filter that is set. A query that matches the device's name or
 * id matches all of its issues; otherwise it has to match the issue's code, title or component.
 */
export function matchingIssues(device: FleetGroupDevice, filters: DeviceFilters): FleetIssue[] {
  const query = filters.query?.trim().toLowerCase() || ""
  const deviceMatches =
    !query || device.deviceName.toLowerCase().includes(query) || device.deviceId.toLowerCase().includes(query)
  return device.issues.filter(
    (issue) =>
      (!filters.checkType || issue.check_type === filters.checkType) &&
      (!filters.severity || issue.severity === filters.severity) &&
      (!filters.newOnly || issue.is_new) &&
      (deviceMatches ||
        [issue.issue_code, issue.title, issue.component_name].some((value) => value?.toLowerCase().includes(query)))
  )
}

/** Devices with at least one issue matching every filter that is set. */
export function filterDevices(devices: FleetGroupDevice[], filters: DeviceFilters): FleetGroupDevice[] {
  return devices.filter((device) => matchingIssues(device, filters).length > 0)
}

/** The longest run of consecutive days among `issues`, with the day it began. */
export function longestStreak(issues: Pick<FleetIssue, "streak_days" | "streak_start_date">[]): {
  days: number
  since: string | null
} {
  const longest = issues.reduce<(typeof issues)[number] | null>(
    (best, issue) => (!best || issue.streak_days > best.streak_days ? issue : best),
    null
  )
  return { days: longest?.streak_days ?? 0, since: longest?.streak_start_date || null }
}

/** Moves a `YYYY-MM-DD` diagnosis day by whole days, in UTC like the diagnosis days themselves. */
export function shiftDiagnosisDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}
