import { beaconConfig } from "@/beacon.config"
import { DEFAULT_PRIMARY_COLOR } from "@/lib/theme-utils"
import { DEMO_GROUPS, DEMO_USER } from "./identity"
import { COHORTS, DAY, DEVICES, HOUR, findCohort, reportedInHour, type DemoDevice } from "./fleet"
import { deviceRecord } from "./beacon-api"
import { MockRouter } from "./router"

/**
 * The platform API (users, groups, preferences, network status) as served by the mock backend.
 * Paths are relative to the API version (`/api/v2`).
 */
export const platformApi = new MockRouter("platform")

const round = (value: number, places = 2) => Math.round(value * 10 ** places) / 10 ** places
const ok = (body: Record<string, unknown> = {}) => ({ body: { success: true, message: "OK", ...body } })

// ─── Users and groups ───────────────────────────────────────────────────────

const orgTheme = () =>
  ok({ data: { theme: { mode: "light", primaryColor: DEFAULT_PRIMARY_COLOR, interfaceStyle: "default", contentLayout: "wide" } } })

// Registered before /users/:id, which would otherwise match "theme"
platformApi.get("/users/theme", orgTheme)
platformApi.get("/users/preferences/theme/user/:userId/group/:groupId", orgTheme)
platformApi.get("/users/preferences/theme/organization/group/:groupId", orgTheme)

platformApi.post("/users/feedback/submit", () => ok({ message: "Thanks! Feedback is not stored in the demo." }))

/** Organisations the demo user could ask to join, beside the ones they're in. */
platformApi.get("/users/groups/discover", () =>
  ok({
    groups: [
      ...DEMO_GROUPS.map(({ _id, grp_title, organization_slug }) => ({ _id, grp_title, organization_slug })),
      { _id: "100000000000000000000004", grp_title: "harbour_authority", organization_slug: "harbour-authority" },
      { _id: "100000000000000000000005", grp_title: "green_schools_trust", organization_slug: "green-schools-trust" },
    ],
  }),
)

platformApi.get("/users/:id", ({ params }) =>
  params.id === DEMO_USER._id
    ? ok({ users: [DEMO_USER] })
    : { status: 404, body: { success: false, message: "User not found" } },
)

// ─── Personal devices ("My Devices" in the system group) ────────────────────

/** The demo user's own devices, in a personal cohort that isn't part of the fleet's cohorts. */
const PERSONAL_COHORT = {
  _id: "c00000010000000000000099",
  name: "demo_admin_devices",
  deviceIds: DEVICES.filter((d, i) => d.status === "not deployed" || i === 2 || i === 7).map((d) => d._id),
}

platformApi.get("/users/:id/cohorts", ({ params }) =>
  ok({ cohorts: params.id === DEMO_USER._id ? [PERSONAL_COHORT._id] : [] }),
)

platformApi.get("/devices/cohorts/verify/:id", ({ params }) => {
  if (params.id === PERSONAL_COHORT._id) return ok({ cohort: { _id: PERSONAL_COHORT._id, name: PERSONAL_COHORT.name } })
  const cohort = findCohort(params.id)
  return cohort
    ? ok({ cohort: { _id: cohort._id, name: cohort.name } })
    : { status: 404, body: { success: false, message: "Cohort not found" } }
})

platformApi.get("/devices/my-devices", ({ query }) => {
  const cohortIds = (query.get("cohort_ids") ?? "").split(",").filter(Boolean)
  const ids = new Set<string>()
  for (const id of cohortIds) {
    const members = id === PERSONAL_COHORT._id ? PERSONAL_COHORT.deviceIds : findCohort(id)?.deviceIds ?? []
    members.forEach((member) => ids.add(member))
  }
  const devices = DEVICES.filter((d) => ids.has(d._id))
  const deployed = devices.filter((d) => d.status === "deployed").length
  return ok({
    devices: devices.map(deviceRecord),
    total_devices: devices.length,
    deployed_devices: deployed,
    deployed_devices_count: deployed,
  })
})

// ─── Network status (the fleet overview) ────────────────────────────────────

/** The devices a network-status request covers: a manufacturer, a cohort, or the whole fleet. */
function scopedDevices(query: URLSearchParams): DemoDevice[] {
  const network = query.get("network")?.toLowerCase()
  const cohort = query.get("cohort_id") ? findCohort(query.get("cohort_id")) : null
  return DEVICES.filter(
    (d) => d.status === "deployed" && (!network || d.network === network) && (!cohort || cohort.deviceIds.includes(d._id)),
  )
}

const THRESHOLD = 30

/** One status check: how many deployed devices transmitted in the hour `hoursBack` ago. */
function check(devices: DemoDevice[], hoursBack: number) {
  const total = devices.length
  const transmitting = devices.filter((d) => reportedInHour(d, hoursBack)).length
  const notTransmitting = total - transmitting
  const pct = total ? round((notTransmitting / total) * 100, 1) : 0
  const checkedAt = new Date((Math.floor(Date.now() / HOUR) - hoursBack) * HOUR).toISOString()
  const status = pct >= 50 ? "CRITICAL" : pct >= THRESHOLD ? "WARNING" : "OK"
  return {
    _id: `check-${Math.floor(Date.now() / HOUR) - hoursBack}`,
    checked_at: checkedAt,
    createdAt: checkedAt,
    total_deployed_devices: total,
    operational_count: transmitting,
    transmitting_count: transmitting,
    data_available_count: transmitting,
    not_transmitting_devices_count: notTransmitting,
    not_transmitting_percentage: pct,
    status,
    severity: status === "CRITICAL" ? "HIGH" : status === "WARNING" ? "MEDIUM" : "LOW",
    message:
      status === "OK"
        ? `${transmitting} of ${total} devices transmitting`
        : `${notTransmitting} of ${total} devices (${pct}%) are not transmitting`,
    threshold_exceeded: pct >= THRESHOLD,
    threshold_value: THRESHOLD,
  }
}

/** Hourly checks over the requested window (default: the last 7 days), newest first. */
function checksFor(query: URLSearchParams, defaultHours = 7 * 24) {
  const devices = scopedDevices(query)
  const end = Math.min(Date.parse(query.get("end_date") ?? "") || Date.now(), Date.now())
  const hoursParam = Number(query.get("hours"))
  const daysParam = Number(query.get("days"))
  const start =
    Date.parse(query.get("start_date") ?? "") ||
    end - (hoursParam > 0 ? hoursParam * HOUR : daysParam > 0 ? daysParam * DAY : defaultHours * HOUR)
  const first = Math.max(0, Math.floor((Date.now() - end) / HOUR))
  const last = Math.min(90 * 24, Math.floor((Date.now() - start) / HOUR))
  const checks = []
  for (let h = first; h <= last; h++) checks.push(check(devices, h))
  return checks
}

const stats = (values: number[]) => ({
  avg: values.length ? round(values.reduce((a, b) => a + b, 0) / values.length, 1) : 0,
  max: values.length ? Math.max(...values) : 0,
  min: values.length ? Math.min(...values) : 0,
})

const STATUS_BASE = "/devices/network-status"

platformApi.get(STATUS_BASE, ({ query }) => {
  const limit = Number(query.get("limit")) || 200
  return ok({ alerts: checksFor(query).slice(0, limit) })
})

platformApi.get(`${STATUS_BASE}/recent`, ({ query }) => {
  const recent = checksFor(query, 48).filter((c) => c.threshold_exceeded)
  return ok({ alerts: recent })
})

platformApi.get(`${STATUS_BASE}/statistics`, ({ query }) => {
  const checks = checksFor(query)
  const pct = stats(checks.map((c) => c.not_transmitting_percentage))
  const mean = (key: "operational_count" | "transmitting_count" | "data_available_count") =>
    checks.length ? round(checks.reduce((sum, c) => sum + c[key], 0) / checks.length, 1) : 0
  return ok({
    statistics: [
      {
        totalAlerts: checks.length,
        avg_operational_count: mean("operational_count"),
        avg_transmitting_count: mean("transmitting_count"),
        avg_data_available_count: mean("data_available_count"),
        avg_not_transmitting_percentage: pct.avg,
        max_not_transmitting_percentage: pct.max,
        min_not_transmitting_percentage: pct.min,
        warningCount: checks.filter((c) => c.status === "WARNING").length,
        criticalCount: checks.filter((c) => c.status === "CRITICAL").length,
      },
    ],
  })
})

platformApi.get(`${STATUS_BASE}/trends/hourly`, ({ query }) => {
  const buckets = new Map<string, { hour: number; dayOfWeek: number; values: number[] }>()
  for (const c of checksFor(query)) {
    const date = new Date(c.checked_at)
    const hour = date.getUTCHours()
    const dayOfWeek = date.getUTCDay() + 1 // MongoDB's $dayOfWeek: 1 = Sunday
    const key = `${dayOfWeek}-${hour}`
    const bucket = buckets.get(key) ?? { hour, dayOfWeek, values: [] }
    bucket.values.push(c.not_transmitting_percentage)
    buckets.set(key, bucket)
  }
  const trends = [...buckets.values()].map(({ hour, dayOfWeek, values }) => ({
    _id: { hour, dayOfWeek },
    avg_not_transmitting_percentage: stats(values).avg,
    count: values.length,
  }))
  return ok({ trends })
})

platformApi.get(`${STATUS_BASE}/uptime-summary`, ({ query }) => {
  const byDay = new Map<string, number[]>()
  for (const c of checksFor(query, (Number(query.get("days")) || 14) * 24)) {
    const day = c.checked_at.slice(0, 10)
    byDay.set(day, [...(byDay.get(day) ?? []), c.not_transmitting_percentage])
  }
  // Newest day first, as the platform returns it; the overview page reverses it for its chart
  const summary = [...byDay.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([day, values]) => {
      const s = stats(values)
      return {
        _id: day,
        avgOfflinePercentage: s.avg,
        maxOfflinePercentage: s.max,
        minOfflinePercentage: s.min,
        totalChecks: values.length,
        alertsTriggered: values.filter((v) => v >= THRESHOLD).length,
      }
    })
  return ok({ summary })
})

function breakdown(groups: Array<{ id: string; name?: string; devices: DemoDevice[] }>, query: URLSearchParams) {
  const hours = Math.min(
    90 * 24,
    Math.max(1, Math.round(((Date.parse(query.get("end_date") ?? "") || Date.now()) - (Date.parse(query.get("start_date") ?? "") || Date.now() - 7 * DAY)) / HOUR)),
  )
  return groups
    .filter((g) => g.devices.length > 0)
    .map(({ id, name, devices }) => {
      const values = Array.from({ length: hours }, (_, h) => check(devices, h).not_transmitting_percentage)
      const s = stats(values)
      return {
        _id: id,
        ...(name ? { name } : {}),
        totalChecks: hours,
        avg_total_monitors: devices.length,
        avg_not_transmitting_percentage: s.avg,
        max_not_transmitting_percentage: s.max,
        min_not_transmitting_percentage: s.min,
      }
    })
}

platformApi.get(`${STATUS_BASE}/breakdown`, ({ query }) => {
  const deployed = DEVICES.filter((d) => d.status === "deployed")
  const networks = [...new Set(deployed.map((d) => d.network))]
  return ok({ data: breakdown(networks.map((n) => ({ id: n, devices: deployed.filter((d) => d.network === n) })), query) })
})

platformApi.get(`${STATUS_BASE}/breakdown/cohorts`, ({ query }) => {
  const deployed = DEVICES.filter((d) => d.status === "deployed")
  const cohorts = COHORTS.filter((c) => c.name !== beaconConfig.auth.systemGroupSlug)
  return ok({
    data: breakdown(
      cohorts.map((c) => ({ id: c._id, name: c.name, devices: deployed.filter((d) => c.deviceIds.includes(d._id)) })),
      query,
    ),
  })
})

platformApi.get("/devices/summary/count", ({ query }) => {
  const devices = scopedDevices(query)
  const latest = check(devices, 0)
  return ok({
    data: {
      total_monitors: devices.length,
      operational: latest.operational_count,
      transmitting: latest.transmitting_count,
      data_available: latest.data_available_count,
      not_transmitting: latest.not_transmitting_devices_count,
    },
  })
})
