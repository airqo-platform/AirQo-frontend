import { beaconConfig } from "@/beacon.config"
import { DEMO_GROUPS } from "./identity"

/**
 * The demo fleet: sites, devices, cohorts and grids, plus readings generated on demand.
 *
 * Everything comes from a seeded random generator, so the fleet is the same on every request and
 * every restart. Timestamps are relative to now, so the demo always looks current.
 */

// ─── Deterministic randomness ───────────────────────────────────────────────

/** mulberry32: small, fast, seedable. */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = (value: string) => {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** A stable random number in [0, 1) for a key. */
export const noise = (key: string) => seeded(hash(key))()

const round = (value: number, places = 2) => Math.round(value * 10 ** places) / 10 ** places

export const HOUR = 60 * 60 * 1000
export const DAY = 24 * HOUR

export const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString()
export const daysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString()
export const daysAhead = (days: number) => new Date(Date.now() + days * DAY).toISOString()

/** A 24-hex-character id, like the platform's ObjectIds, derived from a prefix and index. */
const objectId = (prefix: number, index: number) =>
  `${prefix.toString(16).padStart(8, "0")}${index.toString(16).padStart(16, "0")}`

// ─── Organisation groups ────────────────────────────────────────────────────

const [SYSTEM_GROUP, RIVERSIDE_GROUP, LAKESHORE_GROUP] = DEMO_GROUPS

// ─── Grids (administrative areas) ───────────────────────────────────────────

const [centerLat, centerLng] = beaconConfig.map.defaultCenter

interface Area {
  key: string
  city: string
  district: string
  region: string
  /** Offset from the configured map centre, in degrees */
  offset: [number, number]
  group: (typeof DEMO_GROUPS)[number]
}

const AREAS: Area[] = [
  { key: "riverside", city: "Riverside", district: "Riverside District", region: "Central Region", offset: [0, 0], group: RIVERSIDE_GROUP },
  { key: "lakeshore", city: "Lakeshore", district: "Lakeshore District", region: "Eastern Region", offset: [0.18, 0.9], group: LAKESHORE_GROUP },
  { key: "hillcrest", city: "Hillcrest", district: "Hillcrest District", region: "Western Region", offset: [-0.45, -0.85], group: SYSTEM_GROUP },
]

export const COUNTRY = "Demo Country"

export const GRIDS = AREAS.map((area, index) => ({
  _id: objectId(0x67000001, index + 1),
  grid_id: objectId(0x67000001, index + 1),
  name: area.district.toLowerCase().replace(/\s+/g, "_"),
  long_name: area.district,
  admin_level: "district",
  network: beaconConfig.auth.systemGroupSlug,
  area,
}))

// ─── Sites ──────────────────────────────────────────────────────────────────

const SITE_NAMES: Record<string, string[]> = {
  riverside: ["Market Square", "Central Library", "North Bus Terminal", "Riverside Hospital", "Old Town Primary School", "Industrial Park Gate"],
  lakeshore: ["University Main Gate", "Lakeshore Pier", "Science Block Roof", "Harbour Road"],
  hillcrest: ["Hillcrest Water Works", "Ridge Road Junction", "Hillcrest Health Centre", "Quarry Lane"],
}

export interface DemoSite {
  _id: string
  name: string
  formatted_name: string
  location_name: string
  search_name: string
  generated_name: string
  description: string
  city: string
  district: string
  region: string
  country: string
  latitude: number
  longitude: number
  approximate_latitude: number
  approximate_longitude: number
  grids: Array<{ _id: string; name: string; admin_level: string; long_name: string }>
  groups: string[]
  createdAt: string
  area: Area
}

export const SITES: DemoSite[] = AREAS.flatMap((area, areaIndex) =>
  SITE_NAMES[area.key].map((name, i) => {
    const index = areaIndex * 10 + i + 1
    const r = seeded(hash(`site-${area.key}-${i}`))
    const latitude = round(centerLat + area.offset[0] + (r() - 0.5) * 0.16, 6)
    const longitude = round(centerLng + area.offset[1] + (r() - 0.5) * 0.16, 6)
    const grid = GRIDS[areaIndex]
    return {
      _id: objectId(0x51700001, index),
      name: `${name}, ${area.city}`,
      formatted_name: `${name}, ${area.city}, ${COUNTRY}`,
      location_name: `${name}, ${area.city}`,
      search_name: name,
      generated_name: `site_${100 + index}`,
      description: `${name} monitoring site`,
      city: area.city,
      district: area.district,
      region: area.region,
      country: COUNTRY,
      latitude,
      longitude,
      approximate_latitude: latitude,
      approximate_longitude: longitude,
      grids: [{ _id: grid._id, name: grid.name, admin_level: grid.admin_level, long_name: grid.long_name }],
      groups: [area.group.grp_title, SYSTEM_GROUP.grp_title],
      createdAt: daysAgo(400 - index * 7),
      area,
    }
  }),
)

// ─── Devices ────────────────────────────────────────────────────────────────

export type DemoHealth = "healthy" | "degraded" | "offline" | "undeployed" | "recalled"

/** Manufacturers in the demo; see NETWORK_LABELS in lib/manufacturers.ts. */
const MANUFACTURERS = [
  { network: "acme", prefix: "acme", category: "lowcost", dualPm: true, source: "thingspeak" as const, uploadSeconds: 300 },
  { network: "nimbus", prefix: "nimbus", category: "lowcost_single", dualPm: false, source: "external_api" as const, uploadSeconds: 600 },
  { network: "terra", prefix: "terra", category: "gas", dualPm: false, source: "external_api" as const, uploadSeconds: 900 },
]

export interface DemoDevice {
  _id: string
  name: string
  long_name: string
  alias: string
  description: string
  network: string
  category: string
  status: "deployed" | "not deployed" | "recalled"
  health: DemoHealth
  isActive: boolean
  isOnline: boolean
  /** Hours since the last reading */
  silentHours: number
  dualPm: boolean
  data_source: "thingspeak" | "external_api"
  /** How often the device uploads, matching its device profile */
  uploadSeconds: number
  device_number: number | null
  serial_number: string | null
  api_code: string | null
  powerType: "solar" | "mains" | "alternator"
  mountType: "pole" | "wall" | "rooftop"
  height: number
  site: DemoSite | null
  latitude: number
  longitude: number
  groups: string[]
  cohortIds: string[]
  firmware: string
  createdAt: string
  deploymentDate: string | null
  nextMaintenance: string
  /** 0..1, how much this device's readings drift between its two PM sensors */
  sensorDrift: number
  /** 0..1, base data completeness */
  reliability: number
  batteryBase: number
}

const HEALTH_PLAN: DemoHealth[] = [
  "healthy", "healthy", "healthy", "degraded", "healthy", "offline", "healthy", "healthy",
  "degraded", "healthy", "healthy", "offline", "healthy", "healthy", "degraded", "healthy",
  "healthy", "offline", "healthy", "healthy", "healthy", "degraded", "healthy", "healthy",
  "healthy", "offline", "healthy", "degraded", "undeployed", "undeployed", "undeployed",
  "recalled", "recalled", "healthy", "healthy", "healthy",
]

export const DEVICES: DemoDevice[] = HEALTH_PLAN.map((health, i) => {
  const r = seeded(hash(`device-${i}`))
  const manufacturer = MANUFACTURERS[i % MANUFACTURERS.length]
  const deployed = health !== "undeployed" && health !== "recalled"
  const site = deployed ? SITES[i % SITES.length] : null
  const number = 1001 + i
  const name = `${manufacturer.prefix}_${number}`
  const silentHours =
    // Offline devices: the first two went quiet a day or two ago, the rest weeks ago (no data in any 14-day window)
    health === "offline"
      ? i < 17 ? 30 + Math.floor(r() * 40) : 400 + Math.floor(r() * 400)
      : health === "degraded" ? 1 + Math.floor(r() * 3) : r() * 0.8
  const homeArea = site?.area ?? AREAS[i % AREAS.length]
  const latitude = site ? round(site.latitude + (r() - 0.5) * 0.002, 6) : round(centerLat + (r() - 0.5) * 0.02, 6)
  const longitude = site ? round(site.longitude + (r() - 0.5) * 0.002, 6) : round(centerLng + (r() - 0.5) * 0.02, 6)

  return {
    _id: objectId(0xde000001, i + 1),
    name,
    long_name: name.replace("_", " ").toUpperCase(),
    alias: name,
    description: `${manufacturer.network === "terra" ? "Gas" : "Particulate"} monitor ${number}`,
    network: manufacturer.network,
    category: manufacturer.category,
    status: health === "recalled" ? "recalled" : deployed ? "deployed" : "not deployed",
    health,
    isActive: deployed,
    isOnline: deployed && health !== "offline",
    silentHours,
    dualPm: manufacturer.dualPm,
    data_source: manufacturer.source,
    uploadSeconds: manufacturer.uploadSeconds,
    device_number: manufacturer.source === "thingspeak" ? 2200000 + number : null,
    serial_number: manufacturer.source === "thingspeak" ? null : `${manufacturer.prefix.toUpperCase()}-${number}-${(i * 7919).toString(36).toUpperCase()}`,
    api_code: manufacturer.source === "thingspeak" ? null : `https://api.${manufacturer.network}.example.com/v1/devices/${number}/readings`,
    powerType: (["solar", "mains", "alternator"] as const)[i % 3],
    mountType: (["pole", "wall", "rooftop"] as const)[(i + 1) % 3],
    height: round(2.5 + r() * 4, 1),
    site,
    latitude,
    longitude,
    groups: deployed || health === "recalled" ? [homeArea.group.grp_title, SYSTEM_GROUP.grp_title] : [SYSTEM_GROUP.grp_title],
    cohortIds: [],
    firmware: health === "degraded" && i % 2 === 0 ? "v2.3.1" : "v2.4.0",
    createdAt: daysAgo(500 - i * 9),
    deploymentDate: deployed ? daysAgo(320 - i * 7) : null,
    nextMaintenance: daysAhead(-10 + ((i * 11) % 90)),
    sensorDrift: health === "degraded" ? 0.25 + r() * 0.35 : r() * 0.08,
    reliability: health === "healthy" ? 0.93 + r() * 0.07 : health === "degraded" ? 0.55 + r() * 0.25 : 0.1 + r() * 0.3,
    batteryBase: 3.9 + r() * 0.25,
  }
})

// ─── Cohorts ────────────────────────────────────────────────────────────────

export interface DemoCohort {
  _id: string
  name: string
  description: string
  network: string
  groups: string[]
  cohort_tags: string[]
  visibility: boolean
  createdAt: string
  deviceIds: string[]
}

const cohortOf = (index: number, name: string, description: string, tags: string[], groups: string[], deviceIds: string[]): DemoCohort => ({
  _id: objectId(0xc0000001, index),
  name,
  description,
  network: beaconConfig.auth.systemGroupSlug,
  groups,
  cohort_tags: tags,
  visibility: true,
  createdAt: daysAgo(300 - index * 20),
  deviceIds,
})

const devicesWhere = (predicate: (device: DemoDevice) => boolean) => DEVICES.filter(predicate).map((d) => d._id)

export const COHORTS: DemoCohort[] = [
  // Every device, named after the system group; the analytics views hide it as a cluster
  cohortOf(1, beaconConfig.auth.systemGroupSlug, "Every device in the network", ["organizational"], [SYSTEM_GROUP.grp_title], devicesWhere(() => true)),
  cohortOf(2, "riverside_city_network", "Riverside City Council's monitoring network", ["organizational"], [RIVERSIDE_GROUP.grp_title, SYSTEM_GROUP.grp_title], devicesWhere((d) => d.groups.includes(RIVERSIDE_GROUP.grp_title))),
  cohortOf(3, "lakeshore_campus", "Lakeshore University campus sensors", ["organizational"], [LAKESHORE_GROUP.grp_title, SYSTEM_GROUP.grp_title], devicesWhere((d) => d.groups.includes(LAKESHORE_GROUP.grp_title))),
  cohortOf(4, "hillcrest_pilot", "Hillcrest pilot deployment", ["organizational"], [SYSTEM_GROUP.grp_title], devicesWhere((d) => d.site?.area.key === "hillcrest")),
  cohortOf(5, "acme_batch_2025", "Acme hardware batch under evaluation", ["hardware"], [SYSTEM_GROUP.grp_title], devicesWhere((d) => d.network === "acme")),
  cohortOf(6, "schools_programme", "Sensors at schools and hospitals", ["research"], [RIVERSIDE_GROUP.grp_title, SYSTEM_GROUP.grp_title], devicesWhere((d) => /School|Hospital|Health/.test(d.site?.name ?? ""))),
]

for (const cohort of COHORTS) {
  for (const id of cohort.deviceIds) DEVICES.find((d) => d._id === id)?.cohortIds.push(cohort._id)
}

// ─── Lookups and scoping ────────────────────────────────────────────────────

export const findDevice = (idOrName: string | undefined | null) => {
  if (!idOrName) return undefined
  const key = idOrName.toLowerCase()
  return DEVICES.find(
    (d) =>
      d._id === idOrName ||
      d.name === key ||
      d.long_name.toLowerCase() === key ||
      String(d.device_number) === idOrName ||
      d.serial_number?.toLowerCase() === key,
  )
}

export const findSite = (id: string | undefined | null) => SITES.find((s) => s._id === id || s.generated_name === id || s.name === id)
export const findCohort = (id: string | undefined | null) => COHORTS.find((c) => c._id === id || c.name === id)
export const findGroup = (idOrTitle: string | undefined | null) =>
  DEMO_GROUPS.find((g) => g._id === idOrTitle || g.grp_title.toLowerCase() === (idOrTitle ?? "").toLowerCase())

/** The devices a group sees. No group, an unknown one or the system group sees the whole fleet. */
export function devicesForGroup(group: string | null | undefined): DemoDevice[] {
  const match = findGroup(group)
  if (!match || match === SYSTEM_GROUP) return DEVICES
  return DEVICES.filter((d) => d.groups.includes(match.grp_title))
}

export function cohortsForGroup(group: string | null | undefined): DemoCohort[] {
  const match = findGroup(group)
  if (!match || match === SYSTEM_GROUP) return COHORTS
  return COHORTS.filter((c) => c.groups.includes(match.grp_title))
}

export function sitesForGroup(group: string | null | undefined): DemoSite[] {
  const match = findGroup(group)
  if (!match || match === SYSTEM_GROUP) return SITES
  return SITES.filter((s) => s.groups.includes(match.grp_title))
}

export const cohortsOfDevice = (device: DemoDevice) => COHORTS.filter((c) => c.deviceIds.includes(device._id))

// ─── Readings and metrics ───────────────────────────────────────────────────

/** Whether a device reported in a given hour (hours counted back from now). */
export function reportedInHour(device: DemoDevice, hoursBack: number): boolean {
  if (device.status !== "deployed") return false
  if (hoursBack < Math.floor(device.silentHours)) return false
  return noise(`${device._id}-up-${Math.floor((Date.now() / HOUR) - hoursBack)}`) < device.reliability
}

/** Fraction of hours with data over the last `days` days, 0..100. */
export function uptimePercent(device: DemoDevice, days: number, endHoursBack = 0): number {
  if (device.status !== "deployed") return 0
  const hours = Math.max(1, Math.round(days * 24))
  let up = 0
  for (let h = endHoursBack; h < endHoursBack + hours; h++) if (reportedInHour(device, h)) up++
  return round((up / hours) * 100, 1)
}

export interface DemoReading {
  timestamp: string
  hoursBack: number
  s1_pm2_5: number | null
  s2_pm2_5: number | null
  s1_pm10: number | null
  s2_pm10: number | null
  pm2_5: number | null
  pm10: number | null
  temperature: number
  humidity: number
  battery: number
  co2: number | null
}

/** One hourly reading, or null if the device didn't report that hour. */
export function readingAt(device: DemoDevice, hoursBack: number): DemoReading | null {
  if (!reportedInHour(device, hoursBack)) return null
  const slot = Math.floor(Date.now() / HOUR) - hoursBack
  const time = new Date(slot * HOUR)
  const hourOfDay = time.getUTCHours()
  const r = seeded(hash(`${device._id}-reading-${slot}`))
  // Morning and evening peaks
  const diurnal = 1 + 0.6 * Math.exp(-((hourOfDay - 8) ** 2) / 6) + 0.5 * Math.exp(-((hourOfDay - 19) ** 2) / 8)
  const base = 18 + noise(`${device._id}-base`) * 25
  const pm25 = round(base * diurnal * (0.8 + r() * 0.4), 2)
  const s2 = device.dualPm ? round(pm25 * (1 + (r() - 0.5) * 2 * device.sensorDrift), 2) : null
  const temperature = round(19 + 8 * Math.sin(((hourOfDay - 9) / 24) * 2 * Math.PI) + r() * 2, 1)
  const humidity = round(Math.min(98, Math.max(25, 75 - (temperature - 19) * 2.5 + r() * 8)), 1)
  const charging = device.powerType === "solar" && hourOfDay >= 8 && hourOfDay <= 17
  const battery = round(device.batteryBase + (charging ? 0.15 : -0.1) - (device.health === "degraded" ? 0.35 : 0) + r() * 0.05, 2)

  return {
    timestamp: time.toISOString(),
    hoursBack,
    s1_pm2_5: pm25,
    s2_pm2_5: s2,
    s1_pm10: round(pm25 * 1.45, 2),
    s2_pm10: s2 === null ? null : round(s2 * 1.45, 2),
    pm2_5: s2 === null ? pm25 : round((pm25 + s2) / 2, 2),
    pm10: round(pm25 * 1.45, 2),
    temperature,
    humidity,
    battery,
    co2: device.category === "gas" ? Math.round(410 + r() * 120) : null,
  }
}

/** Hourly readings over a window, oldest first. */
export function readingsBetween(device: DemoDevice, startMs: number, endMs: number, limit = 24 * 90): DemoReading[] {
  const nowSlot = Math.floor(Date.now() / HOUR)
  const firstBack = Math.max(0, nowSlot - Math.floor(endMs / HOUR))
  const lastBack = Math.max(firstBack, nowSlot - Math.floor(startMs / HOUR))
  const readings: DemoReading[] = []
  for (let h = Math.min(lastBack, firstBack + limit); h >= firstBack; h--) {
    const reading = readingAt(device, h)
    if (reading) readings.push(reading)
  }
  return readings
}

export function latestReading(device: DemoDevice): DemoReading | null {
  for (let h = Math.floor(device.silentHours); h < device.silentHours + 72; h++) {
    const reading = readingAt(device, h)
    if (reading) return reading
  }
  return null
}

/** Mean absolute difference between the two PM2.5 sensors over a window, or 0 for single-sensor devices. */
export function errorMargin(device: DemoDevice, days: number): number {
  if (!device.dualPm || device.status !== "deployed") return 0
  const readings = readingsBetween(device, Date.now() - days * DAY, Date.now(), 24 * days)
  const pairs = readings.filter((r) => r.s2_pm2_5 !== null)
  if (pairs.length === 0) return 0
  return round(pairs.reduce((sum, r) => sum + Math.abs((r.s1_pm2_5 ?? 0) - (r.s2_pm2_5 ?? 0)), 0) / pairs.length, 2)
}

export function lastActive(device: DemoDevice): string | null {
  if (device.status !== "deployed") return device.status === "recalled" ? daysAgo(40) : null
  return latestReading(device)?.timestamp ?? hoursAgo(device.silentHours)
}

/** Daily uptime and completeness for the last `days` days, oldest first. */
export function dailyPerformance(device: DemoDevice, days: number) {
  const result = []
  for (let d = days - 1; d >= 0; d--) {
    const uptime = uptimePercent(device, 1, d * 24)
    const date = new Date(Date.now() - d * DAY)
    date.setUTCHours(0, 0, 0, 0)
    result.push({
      date: date.toISOString().slice(0, 10),
      uptime,
      data_completeness: uptime,
      error_margin: device.dualPm ? round(device.sensorDrift * 20 + noise(`${device._id}-em-${d}`) * 2, 2) : null,
    })
  }
  return result
}
