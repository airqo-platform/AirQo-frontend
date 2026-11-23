import { beaconConfig } from "@/beacon.config"
import { formatNetworkLabel } from "@/lib/manufacturers"
import { DEMO_GROUPS, DEMO_USER } from "./identity"
import {
  COHORTS,
  DAY,
  DEVICES,
  GRIDS,
  HOUR,
  SITES,
  cohortsForGroup,
  cohortsOfDevice,
  dailyPerformance,
  daysAgo,
  hoursAgo,
  devicesForGroup,
  errorMargin,
  findCohort,
  findDevice,
  findGroup,
  findSite,
  lastActive,
  latestReading,
  noise,
  readingsBetween,
  sitesForGroup,
  uptimePercent,
  type DemoCohort,
  type DemoDevice,
  type DemoReading,
  type DemoSite,
} from "./fleet"
import { latestDeviceDiagnostics, rawFieldsFor, registerDiagnosticsRoutes, summarizeDiagnostics } from "./diagnostics"
import { MockRouter, paginate, type MockRequest } from "./router"

/**
 * The Beacon API (device health) as served by the mock backend. Paths are relative to the API
 * prefix (`/api/v1`). Response shapes follow what services/*.ts and the pages read.
 */
export const beaconApi = new MockRouter("Beacon")

const round = (value: number, places = 2) => Math.round(value * 10 ** places) / 10 ** places
const ok = (body: Record<string, unknown> = {}) => ({ body: { success: true, message: "OK", ...body } })
const notFound = (what: string) => ({ status: 404, body: { success: false, detail: `${what} not found` } })
const isTrue = (value: string | null) => value === "true" || value === "1"

// ─── Shared shapes ──────────────────────────────────────────────────────────

/** The window a request asks about, defaulting to the last 14 days. */
function windowOf(query: URLSearchParams, defaultDays = 14) {
  const end = Date.parse(query.get("endDateTime") ?? query.get("end_date") ?? query.get("end") ?? "") || Date.now()
  const daysParam = Number(query.get("days") ?? query.get("period_days"))
  const start =
    Date.parse(query.get("startDateTime") ?? query.get("start_date") ?? query.get("start") ?? "") ||
    end - (Number.isFinite(daysParam) && daysParam > 0 ? daysParam : defaultDays) * DAY
  return { start: Math.min(start, end), end: Math.min(end, Date.now()), days: Math.max(1, Math.round((end - start) / DAY)) }
}

/** One reading as the synced endpoints return it, labelled the way the device's profile does. */
function dataPoint(device: DemoDevice, reading: DemoReading) {
  const meta = {
    datetime: reading.timestamp,
    device_name: device.name,
    frequency: "hourly",
    network: device.network,
    site_name: device.site?.name ?? null,
    latitude: device.latitude,
    longitude: device.longitude,
  }
  // Every device reports a battery; mains-powered ones carry a backup cell
  const battery = { battery: reading.battery }
  if (device.dualPm) {
    return {
      ...meta,
      "pm2.5 sensor1": reading.s1_pm2_5,
      "pm2.5 sensor2": reading.s2_pm2_5,
      "pm10 sensor1": reading.s1_pm10,
      "pm10 sensor2": reading.s2_pm10,
      temperature: reading.temperature,
      humidity: reading.humidity,
      ...battery,
    }
  }
  return {
    ...meta,
    "PM2.5": reading.pm2_5,
    "PM10": reading.pm10,
    ...(reading.co2 === null ? {} : { CO2: reading.co2 }),
    Temperature: reading.temperature,
    Humidity: reading.humidity,
    ...battery,
  }
}

function averagesOf(points: Array<Record<string, unknown>>) {
  const sums: Record<string, { total: number; count: number }> = {}
  for (const point of points) {
    for (const [key, value] of Object.entries(point)) {
      if (typeof value !== "number" || key === "latitude" || key === "longitude") continue
      const entry = (sums[key] ??= { total: 0, count: 0 })
      entry.total += value
      entry.count++
    }
  }
  return Object.fromEntries(Object.entries(sums).map(([key, { total, count }]) => [key, round(total / count)]))
}

/** Pearson correlation of the two PM2.5 sensors over a window, or null for single-sensor devices. */
function sensorCorrelation(readings: DemoReading[]): number | null {
  const pairs = readings.filter((r) => r.s1_pm2_5 !== null && r.s2_pm2_5 !== null)
  if (pairs.length < 3) return null
  const xs = pairs.map((r) => r.s1_pm2_5 as number)
  const ys = pairs.map((r) => r.s2_pm2_5 as number)
  const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my)
    dx += (xs[i] - mx) ** 2
    dy += (ys[i] - my) ** 2
  }
  return dx > 0 && dy > 0 ? round(num / Math.sqrt(dx * dy), 3) : null
}

function siteSummary(site: DemoSite | null) {
  if (!site) return undefined
  return {
    _id: site._id,
    name: site.name,
    formatted_name: site.formatted_name,
    location_name: site.location_name,
    search_name: site.search_name,
    city: site.city,
    country: site.country,
    description: site.description,
    approximate_latitude: site.approximate_latitude,
    approximate_longitude: site.approximate_longitude,
    generated_name: site.generated_name,
  }
}

/** The platform's device record, as /devices/synced and /devices/{id} return it. */
export function deviceRecord(device: DemoDevice) {
  const latest = latestReading(device)
  const active = lastActive(device)
  const thingspeak = device.data_source === "thingspeak"
  const channel = thingspeak ? device.device_number : device._id
  return {
    _id: device._id,
    device_id: device._id,
    name: device.name,
    long_name: device.long_name,
    alias: device.alias,
    description: device.description,
    isActive: device.isActive,
    isOnline: device.isOnline,
    rawOnlineStatus: device.isOnline,
    isPrimaryInLocation: true,
    status: device.status,
    visibility: true,
    authRequired: !thingspeak,
    device_number: device.device_number,
    serial_number: device.serial_number,
    api_code: device.api_code,
    data_source: device.data_source,
    device_codes: [device.name, device._id],
    network: device.network,
    network_id: null,
    category: device.category,
    mobility: false,
    height: device.height,
    mountType: device.mountType,
    powerType: device.powerType,
    writeKey: thingspeak ? `W${device.name.toUpperCase().replace(/_/g, "")}DEMO` : null,
    readKey: thingspeak ? `R${device.name.toUpperCase().replace(/_/g, "")}DEMO` : null,
    beacon_data: {
      network_id: device.network,
      site_id: device.site?._id ?? null,
      profile_id: null,
      current_firmware: device.firmware,
      previous_firmware: device.firmware === "v2.4.0" ? "v2.3.1" : "v2.2.0",
      file_upload_state: false,
      firmware_download_state: null,
      device_number: device.device_number,
      writeKey: null,
      readKey: null,
      status: device.status,
      serial_number: device.serial_number,
      api_code: device.api_code,
      auth_required: !thingspeak,
      data_source: device.data_source,
    },
    last_reading: latest
      ? { timestamp: latest.timestamp, channel_id: channel, values: rawFieldsFor(device, latest) }
      : null,
    createdAt: device.createdAt,
    lastActive: active,
    lastRawData: active,
    deployment_date: device.deploymentDate ?? undefined,
    nextMaintenance: device.nextMaintenance,
    latitude: device.latitude,
    longitude: device.longitude,
    approximate_distance_in_km: 0,
    bearing_in_radians: 0,
    groups: device.groups,
    tags: [],
    cohorts: cohortsOfDevice(device).map((c) => ({ _id: c._id, name: c.name, description: c.description })),
    grids: device.site?.grids ?? [],
    site: siteSummary(device.site),
    category_hierarchy: [{ level: "primary", category: device.category, description: device.category === "gas" ? "Gas sensor" : "Low-cost sensor" }],
    device_categories: {
      primary_category: device.category,
      deployment_category: device.site ? "static" : "unassigned",
      is_mobile: false,
      is_static: true,
      is_lowcost: device.category.startsWith("lowcost"),
      all_categories: [device.category],
    },
    transmissionStatus: device.isOnline ? "transmitting" : device.status === "deployed" ? "not_transmitting" : "not_deployed",
  }
}

/** A device with its performance over a window, as the synced list endpoints return it. */
function devicePerformance(device: DemoDevice, start: number, end: number, withSeries: boolean) {
  const readings = readingsBetween(device, start, end)
  const hours = Math.max(1, Math.round((end - start) / HOUR))
  const uptime = device.status === "deployed" ? round((readings.length / hours) * 100, 1) : 0
  const points = readings.map((r) => dataPoint(device, r))
  return {
    device_id: device._id,
    device_name: device.name,
    is_active: device.isActive,
    uptime,
    data_completeness: uptime,
    sensor_error_margin: device.dualPm ? errorMargin(device, Math.max(1, Math.round((end - start) / DAY))) : null,
    correlation: sensorCorrelation(readings),
    averages: averagesOf(points),
    last_active: lastActive(device),
    data: withSeries ? points : [],
  }
}

/** A cohort, site or grid with its devices' performance rolled up. */
function entityPerformance(devices: DemoDevice[], query: URLSearchParams) {
  const includePerformance = isTrue(query.get("includePerformance"))
  const includeSeries = query.get("includeSeries") !== "false"
  const includeDevices = query.get("includeDevices") !== "false"
  const includeDiagnostics = isTrue(query.get("includeDiagnostics"))
  const { start, end, days } = windowOf(query)

  const base: Record<string, unknown> = {
    number_of_devices: devices.length,
    numberOfDevices: devices.length,
  }
  if (includeDiagnostics) base.diagnostics_summary = summarizeDiagnostics(devices)

  if (!includePerformance) {
    if (includeDevices) {
      base.devices = devices.map((d) => ({
        ...deviceRecord(d),
        ...(includeDiagnostics ? { diagnostics: latestDeviceDiagnostics(d) } : {}),
      }))
    }
    return base
  }

  const perDevice = devices.map((d) => ({
    device: d,
    performance: devicePerformance(d, start, end, includeSeries),
  }))
  const deployed = perDevice.filter(({ device }) => device.status === "deployed")
  const uptime = deployed.length
    ? round(deployed.reduce((sum, { performance }) => sum + performance.uptime, 0) / deployed.length, 1)
    : 0
  const margins = perDevice.map(({ performance }) => performance.sensor_error_margin).filter((m): m is number => m !== null && m > 0)
  const correlations = perDevice.map(({ performance }) => performance.correlation).filter((c): c is number => c !== null)
  const yesterday = Date.now() - DAY
  const offline = deployed.filter(({ device }) => !(lastActive(device) && Date.parse(lastActive(device) as string) > yesterday)).length

  base.uptime = uptime
  base.data_completeness = uptime
  base.error_margin = margins.length ? round(margins.reduce((a, b) => a + b, 0) / margins.length) : null
  base.correlation = correlations.length ? round(correlations.reduce((a, b) => a + b, 0) / correlations.length, 3) : null
  base.offline_devices = offline
  base.averages = averagesOf(perDevice.map(({ performance }) => performance.averages))

  if (includeSeries) {
    // Hourly sensor averages across the devices, for error margin and correlation charts
    const byHour = new Map<string, { s1: number[]; s2: number[]; pm: number[] }>()
    for (const { device } of perDevice) {
      for (const reading of readingsBetween(device, start, end)) {
        const bucket = byHour.get(reading.timestamp) ?? { s1: [], s2: [], pm: [] }
        if (reading.s1_pm2_5 !== null && reading.s2_pm2_5 !== null) {
          bucket.s1.push(reading.s1_pm2_5)
          bucket.s2.push(reading.s2_pm2_5)
        }
        if (reading.pm2_5 !== null) bucket.pm.push(reading.pm2_5)
        byHour.set(reading.timestamp, bucket)
      }
    }
    const mean = (values: number[]) => (values.length ? round(values.reduce((a, b) => a + b, 0) / values.length) : null)
    base.data = [...byHour.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([datetime, bucket]) => ({
        datetime,
        "pm2.5 sensor1": mean(bucket.s1),
        "pm2.5 sensor2": mean(bucket.s2),
        pm2_5: mean(bucket.pm),
        record_count: bucket.pm.length,
      }))
  } else {
    base.daily = Array.from({ length: days }, (_, i) => {
      const daysBack = days - 1 - i
      const date = new Date(end - daysBack * DAY).toISOString().slice(0, 10)
      const dayUptimes = deployed.map(({ device }) => uptimePercent(device, 1, Math.floor((Date.now() - end) / HOUR) + daysBack * 24))
      const dayMargins = deployed
        .filter(({ device }) => device.dualPm)
        .map(({ device }) => dailyPerformance(device, daysBack + 1)[0]?.error_margin)
        .filter((m): m is number => typeof m === "number")
      return {
        date,
        uptime: dayUptimes.length ? round(dayUptimes.reduce((a, b) => a + b, 0) / dayUptimes.length, 1) : 0,
        error_margin: dayMargins.length ? round(dayMargins.reduce((a, b) => a + b, 0) / dayMargins.length) : null,
        correlation: base.correlation as number | null,
      }
    })
  }

  if (includeDevices) {
    base.devices = perDevice.map(({ device, performance }) => ({
      ...deviceRecord(device),
      ...performance,
      ...(includeDiagnostics ? { diagnostics: latestDeviceDiagnostics(device) } : {}),
    }))
  }
  return base
}

const cohortDevices = (cohort: DemoCohort, group: string | null) => {
  const visible = new Set(devicesForGroup(group).map((d) => d._id))
  return DEVICES.filter((d) => cohort.deviceIds.includes(d._id) && visible.has(d._id))
}

function cohortRecord(cohort: DemoCohort, query: URLSearchParams) {
  const devices = cohortDevices(cohort, query.get("group"))
  return {
    _id: cohort._id,
    cohort_id: cohort._id,
    name: cohort.name,
    description: cohort.description,
    network: cohort.network,
    groups: cohort.groups,
    cohort_tags: cohort.cohort_tags,
    cohort_codes: [cohort.name],
    visibility: cohort.visibility,
    createdAt: cohort.createdAt,
    country: "",
    ...entityPerformance(devices, query),
  }
}

const siteDevices = (site: DemoSite) => DEVICES.filter((d) => d.site?._id === site._id)

function siteRecord(site: DemoSite, query: URLSearchParams) {
  return {
    _id: site._id,
    site_id: site._id,
    name: site.name,
    generated_name: site.generated_name,
    formatted_name: site.formatted_name,
    city: site.city,
    district: site.district,
    region: site.region,
    country: site.country,
    latitude: site.latitude,
    longitude: site.longitude,
    grids: site.grids,
    createdAt: site.createdAt,
    ...entityPerformance(siteDevices(site), query),
  }
}

function meta(total: number, limit: number, skip: number, extra: Record<string, unknown> = {}) {
  return {
    total,
    totalResults: total,
    limit,
    skip,
    page: Math.floor(skip / Math.max(1, limit)) + 1,
    totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
    ...extra,
  }
}

function matchesSearch(search: string | null, ...values: Array<string | null | undefined>) {
  if (!search) return true
  const needle = search.trim().toLowerCase()
  return values.some((value) => value?.toLowerCase().includes(needle))
}

function matchesTags(cohort: DemoCohort, tags: string | null) {
  if (!tags) return true
  const wanted = tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
  return wanted.length === 0 || cohort.cohort_tags.some((tag) => wanted.includes(tag.toLowerCase()))
}

/** The manufacturers in a `network` filter. A value naming a group isn't a manufacturer, so it's ignored. */
function networkFilter(query: URLSearchParams): string[] {
  return (query.get("network") ?? "")
    .split(",")
    .map((n) => n.trim().toLowerCase())
    .filter((n) => n && !findGroup(n))
}

// ─── Devices ────────────────────────────────────────────────────────────────

function listDevices({ query }: MockRequest) {
  const group = query.get("group")
  const networks = networkFilter(query)
  const search = query.get("search")
  const status = query.get("status")
  const scoped = devicesForGroup(group)
  const matching = scoped.filter(
    (d) =>
      (networks.length === 0 || networks.includes(d.network)) &&
      (!status || status === "all" || d.status === status) &&
      matchesSearch(search, d._id, d.name, d.long_name, d.site?.name, d.serial_number),
  )
  const page = paginate(matching, query, 100)
  const includePerformance = isTrue(query.get("includePerformance"))
  const includeDiagnostics = isTrue(query.get("includeDiagnostics"))
  const { start, end } = windowOf(query)

  const devices = page.items.map((device) => ({
    ...deviceRecord(device),
    ...(includePerformance ? devicePerformance(device, start, end, query.get("includeSeries") !== "false") : {}),
    ...(includeDiagnostics ? { diagnostics: latestDeviceDiagnostics(device) } : {}),
  }))

  return ok({
    devices,
    meta: meta(page.total, page.limit, page.skip, {
      totalDevices: scoped.length,
      deployedDevices: scoped.filter((d) => d.status === "deployed").length,
      onlineDevices: scoped.filter((d) => d.isOnline).length,
      offlineDevices: scoped.filter((d) => d.status === "deployed" && !d.isOnline).length,
      devicesInAtLeastOneCohort: scoped.filter((d) => cohortsOfDevice(d).some((c) => !isDefaultCohort(c))).length,
    }),
  })
}

const isDefaultCohort = (cohort: DemoCohort) => cohort.name === beaconConfig.auth.systemGroupSlug

beaconApi.get("/devices/synced", listDevices)

beaconApi.get("/devices/performance", ({ query }) => {
  const names = (query.get("device_name") ?? "").split(",").map((n) => n.trim()).filter(Boolean)
  const { start, end } = windowOf(query)
  const data = names
    .map((name) => findDevice(name))
    .filter((d): d is DemoDevice => Boolean(d))
    .map((device) => {
      const performance = devicePerformance(device, start, end, true)
      return {
        device_name: device.name,
        device_id: device._id,
        uptime: performance.uptime,
        data_completeness: performance.data_completeness,
        sensor_error_margin: performance.sensor_error_margin,
        averages: performance.averages,
        data: performance.data,
      }
    })
  return ok({ data })
})

// Legacy shape: the Alerts page reads maintenance history from here
beaconApi.get("/devices", ({ query }) => {
  const devices = devicesForGroup(query.get("group")).map((device) => {
    // Event types the Alerts page knows: Offline, Low Battery, Temperature Warning, Restored
    const history: Array<{ maintenance_type: string; description: string; timestamp: string }> = []
    const jitter = (key: string, max: number) => noise(`${device._id}-${key}`) * max
    if (device.health === "offline") {
      history.push({ maintenance_type: "Offline", description: `${device.long_name} stopped transmitting`, timestamp: lastActive(device) ?? daysAgo(2) })
      history.push({ maintenance_type: "Offline", description: `${device.long_name} is still not transmitting`, timestamp: hoursAgo(1 + jitter("offline-today", 6)) })
    }
    if (device.health === "degraded") {
      history.push({ maintenance_type: "Low Battery", description: `${device.long_name} battery dropped below the minimum`, timestamp: hoursAgo(2 + jitter("battery", 8)) })
      history.push({ maintenance_type: "Restored", description: `${device.long_name} resumed transmitting after a gap`, timestamp: daysAgo(1 + jitter("restored", 3)) })
    }
    if (device.status === "deployed" && noise(`${device._id}-temp`) < 0.2) {
      history.push({ maintenance_type: "Temperature Warning", description: `${device.long_name} enclosure temperature above 45°C`, timestamp: daysAgo(jitter("temp-when", 10)) })
    }
    if (device.status === "deployed" && noise(`${device._id}-old`) < 0.4) {
      history.push({ maintenance_type: "Restored", description: `${device.long_name} back online after maintenance`, timestamp: daysAgo(8 + jitter("old-when", 20)) })
    }
    return {
      device: { id: device._id, name: device.name, status: device.status },
      location: { name: device.site?.name ?? "", city: device.site?.city ?? "", country: device.site?.country ?? "" },
      maintenance_history: history.map((event) => ({ ...event, date: event.timestamp })),
    }
  })
  return { body: { devices } }
})

beaconApi.get("/devices/:id", ({ params }) => {
  const device = findDevice(params.id)
  return device ? ok({ data: deviceRecord(device) }) : notFound("Device")
})

beaconApi.patch("/devices/:id/details", ({ params, body }) => {
  const device = findDevice(params.id)
  if (!device) return notFound("Device")
  if (body && typeof body.target_firmware === "string") device.firmware = body.target_firmware
  return ok({ message: "Device updated", data: deviceRecord(device) })
})

beaconApi.get("/devices/:name/metadata/lowcost", ({ params, query }) => {
  const device = findDevice(params.name)
  if (!device) return notFound("Device")
  const readings = readingsBetween(device, Date.now() - 7 * DAY, Date.now()).reverse()
  const page = paginate(readings, query, 20)
  const startId = 100000 + Math.floor(Date.now() / HOUR) % 100000
  const metadata = page.items.map((reading, i) => ({
    entryID: startId - page.skip - i,
    created_at: reading.timestamp,
    ...rawFieldsFor(device, reading),
  }))
  return ok({ meta: { total: page.total, skip: page.skip, limit: page.limit }, beacon_data: { metadata } })
})

const DEFAULT_CONFIG = {
  config1: "60", // sampling interval, s
  config2: "300", // upload interval, s (per device below)
  config3: "1", // GPS enabled
  config4: "0", // debug logging
  config5: "3.6", // low battery threshold, V
  config6: "2", // retries
  config7: "",
  config8: "",
  config9: "",
  config10: "",
}

const configOverrides = new Map<string, Record<string, string>>()

beaconApi.get("/devices/:name/configdata/lowcost", ({ params, query }) => {
  const device = findDevice(params.name)
  if (!device) return notFound("Device")
  const current = { ...DEFAULT_CONFIG, config2: String(device.uploadSeconds), ...configOverrides.get(device._id) }
  const history = Array.from({ length: 6 }, (_, i) => ({
    id: 6 - i,
    device_id: device._id,
    channel_id: device.device_number ?? device._id,
    ...(i === 0 ? current : { ...DEFAULT_CONFIG, config2: String(device.uploadSeconds + i * 60) }),
    config_updated: true,
    created_at: daysAgo(i * 30 + 2),
  }))
  const page = paginate(history, query, 10)
  return ok({
    meta: { total: page.total, totalPages: page.totalPages, page: page.page - 1 },
    beacon_data: { config_data: page.items, category_details: current },
  })
})

beaconApi.post("/data/config", ({ body }) => {
  const ids: string[] = Array.isArray(body?.device_ids) ? body.device_ids : []
  for (const id of ids) {
    const device = findDevice(id)
    if (!device) continue
    const values = Object.fromEntries(Object.entries(body).filter(([key]) => /^config\d+$/.test(key))) as Record<string, string>
    configOverrides.set(device._id, { ...configOverrides.get(device._id), ...values })
  }
  return ok({ message: `Configuration queued for ${ids.length} device(s)` })
})

beaconApi.get("/firmware", () => ({
  body: [
    { id: "fw-240", firmware_version: "v2.4.0", firmware_type: "stable", created_at: daysAgo(30) },
    { id: "fw-231", firmware_version: "v2.3.1", firmware_type: "stable", created_at: daysAgo(120) },
    { id: "fw-250b", firmware_version: "v2.5.0-beta", firmware_type: "beta", created_at: daysAgo(5) },
  ],
}))

// ─── Cohorts ────────────────────────────────────────────────────────────────

beaconApi.get("/cohorts", ({ query }) => {
  const cohorts = cohortsForGroup(query.get("group"))
    .filter((c) => matchesTags(c, query.get("tags")) && matchesSearch(query.get("search"), c.name))
  const page = paginate(cohorts, query, 100)
  return ok({
    cohorts: page.items.map((cohort) => {
      const devices = cohortDevices(cohort, query.get("group"))
      return {
        _id: cohort._id,
        name: cohort.name,
        network: cohort.network,
        createdAt: cohort.createdAt,
        numberOfDevices: devices.length,
        devices: devices.map(deviceRecord),
        groups: cohort.groups,
        cohort_tags: cohort.cohort_tags,
        cohort_codes: [cohort.name],
        visibility: cohort.visibility,
      }
    }),
    meta: meta(page.total, page.limit, page.skip),
  })
})

beaconApi.get("/cohorts/synced", ({ query }) => {
  const ids = (query.get("cohort_ids") ?? "").split(",").map((id) => id.trim()).filter(Boolean)
  const cohorts = (ids.length ? ids.map(findCohort).filter((c): c is DemoCohort => Boolean(c)) : cohortsForGroup(query.get("group")))
    .filter((c) => ids.length > 0 || (matchesTags(c, query.get("tags")) && matchesSearch(query.get("search"), c.name, c.description)))
  const page = paginate(cohorts, query, 100)
  return ok({ cohorts: page.items.map((c) => cohortRecord(c, query)), meta: meta(page.total, page.limit, page.skip) })
})

beaconApi.get("/cohorts/synced/:id", ({ params, query }) => {
  const cohort = findCohort(params.id)
  return cohort ? ok({ cohort: cohortRecord(cohort, query) }) : notFound("Cohort")
})

// ─── Sites ──────────────────────────────────────────────────────────────────

beaconApi.get("/sites/summary", ({ query }) => {
  const { start, end, days } = windowOf(query)
  const sites = sitesForGroup(query.get("group"))
  const devices = sites.flatMap(siteDevices).filter((d) => d.status === "deployed")
  const uptimes = devices.map((d) => devicePerformance(d, start, end, false))
  const margins = uptimes.map((p) => p.sensor_error_margin).filter((m): m is number => m !== null && m > 0)
  const correlations = uptimes.map((p) => p.correlation).filter((c): c is number => c !== null)
  return ok({
    summary: {
      total_sites: sites.length,
      total_devices: devices.length,
      uptime: uptimes.length ? round(uptimes.reduce((sum, p) => sum + p.uptime, 0) / uptimes.length, 1) : null,
      error_margin: margins.length ? round(margins.reduce((a, b) => a + b, 0) / margins.length) : null,
      error_margin_devices: margins.length,
      correlation: correlations.length ? round(correlations.reduce((a, b) => a + b, 0) / correlations.length, 3) : null,
      correlation_devices: correlations.length,
      start_date_time: new Date(start).toISOString(),
      end_date_time: new Date(end).toISOString(),
      days,
    },
  })
})

beaconApi.get("/sites", ({ query }) => {
  const sites = sitesForGroup(query.get("group")).filter((s) =>
    matchesSearch(query.get("search"), s.name, s.generated_name, s.city, s.district),
  )
  const page = paginate(sites, query, 50)
  return ok({ sites: page.items.map((s) => siteRecord(s, query)), meta: meta(page.total, page.limit, page.skip) })
})

beaconApi.get("/sites/:id", ({ params, query }) => {
  const site = findSite(params.id)
  return site ? ok({ site: siteRecord(site, query) }) : notFound("Site")
})

// ─── Grids ──────────────────────────────────────────────────────────────────

beaconApi.get("/grids/synced", ({ query }) => {
  const ids = (query.get("grid_ids") ?? "").split(",").filter(Boolean)
  const levels = query.getAll("admin_level").flatMap((l) => l.split(",")).filter(Boolean)
  const grids = GRIDS.filter(
    (g) =>
      (ids.length === 0 || ids.includes(g.grid_id)) &&
      (levels.length === 0 || levels.includes(g.admin_level)) &&
      matchesSearch(query.get("search"), g.name, g.long_name),
  )
  const page = paginate(grids, query, 50)
  return ok({
    grids: page.items.map((grid) => ({
      grid_id: grid.grid_id,
      _id: grid._id,
      name: grid.name,
      long_name: grid.long_name,
      admin_level: grid.admin_level,
      network: grid.network,
      number_of_sites: SITES.filter((s) => s.grids.some((g) => g._id === grid._id)).length,
    })),
    meta: meta(page.total, page.limit, page.skip),
  })
})

// ─── Maintenance map ────────────────────────────────────────────────────────

function mapItem(device: DemoDevice, days: number) {
  const uptime = uptimePercent(device, days)
  return {
    device_id: device._id,
    device_name: device.name,
    device_number: device.device_number,
    latitude: device.latitude,
    longitude: device.longitude,
    last_active: lastActive(device),
    uptime,
    data_completeness: uptime,
    error_margin: device.dualPm ? errorMargin(device, Math.min(days, 7)) : 0,
    cohorts: cohortsOfDevice(device).filter((c) => !isDefaultCohort(c)).map((c) => c.name),
    grids: device.site?.grids.map((g) => g.name) ?? [],
  }
}

const mapDays = (query: URLSearchParams) => Math.max(1, Math.min(90, Number(query.get("days")) || 14))

beaconApi.get("/maintenance/map-view/synced", ({ query }) => {
  const days = mapDays(query)
  const tags = query.get("tags")
  const taggedCohorts = tags ? new Set(COHORTS.filter((c) => matchesTags(c, tags)).map((c) => c._id)) : null
  const devices = devicesForGroup(query.get("group")).filter(
    (d) => d.status === "deployed" && (!taggedCohorts || d.cohortIds.some((id) => taggedCohorts.has(id))),
  )
  return ok({ data: devices.map((d) => mapItem(d, days)) })
})

beaconApi.get("/maintenance/map-view/sites/synced", ({ query }) => {
  const days = mapDays(query)
  const data = sitesForGroup(query.get("group"))
    .map((site) => {
      const items = siteDevices(site).filter((d) => d.status === "deployed").map((d) => mapItem(d, days))
      const avg = (values: number[]) => (values.length ? round(values.reduce((a, b) => a + b, 0) / values.length, 1) : 0)
      const withMargin = items.filter((i) => i.error_margin > 0)
      const latest = items.map((i) => i.last_active).filter(Boolean).sort().at(-1) ?? null
      return {
        site_id: site._id,
        site_name: site.name,
        generated_name: site.generated_name,
        latitude: site.latitude,
        longitude: site.longitude,
        city: site.city,
        district: site.district,
        region: site.region,
        country: site.country,
        last_active: latest,
        uptime: avg(items.map((i) => i.uptime)),
        data_completeness: avg(items.map((i) => i.data_completeness)),
        error_margin: avg(withMargin.map((i) => i.error_margin)),
        error_margin_devices: withMargin.length,
        cohorts: [...new Set(items.flatMap((i) => i.cohorts))],
        grids: site.grids.map((g) => g.name),
        number_of_devices: items.length,
        devices: items,
      }
    })
    .filter((site) => site.number_of_devices > 0)
  return ok({ data })
})

// ─── Manufacturers ──────────────────────────────────────────────────────────

beaconApi.get("/networks", ({ query }) => {
  const scoped = devicesForGroup(query.get("group"))
  const onlyWithDevices = isTrue(query.get("only_with_devices"))
  const networks = ["acme", "nimbus", "terra"]
    .map((name, i) => {
      const devices = scoped.filter((d) => d.network === name)
      return {
        network_id: `net-${i + 1}`,
        name,
        acronym: name.toUpperCase(),
        status: "active",
        category: name === "terra" ? "gas" : name === "nimbus" ? "lowcost_single" : "lowcost",
        data_source: name === "acme" ? "thingspeak" : "external_api",
        website: `https://${name}.example.com`,
        email: `support@${name}.example.com`,
        description: `${formatNetworkLabel(name)} sensors`,
        profile_picture: null,
        platform_updated_at: daysAgo(3),
        enabled: true,
        total_devices: devices.length,
        deployed_devices: devices.filter((d) => d.status === "deployed").length,
        online_devices: devices.filter((d) => d.isOnline).length,
        thingspeak_devices: devices.filter((d) => d.data_source === "thingspeak").length,
        external_api_devices: devices.filter((d) => d.data_source === "external_api").length,
      }
    })
    .filter((n) => !onlyWithDevices || n.total_devices > 0)
  return ok({ total: networks.length, networks, scoped_to_group: Boolean(query.get("group")) })
})

beaconApi.get("/networks/profiles", () =>
  ok({
    profiles: [
      { name: "acme_lowcost", network: "acme", category: "lowcost", profile_id: "acme_lowcost", diagnosable: true, components: ["power", "pm_sensors", "connectivity", "climate"], transmission_components: ["connectivity"], errors: [], warnings: [] },
      { name: "nimbus_lowcost", network: "nimbus", category: "lowcost_single", profile_id: "nimbus_lowcost", diagnosable: true, components: ["pm_sensor", "connectivity", "climate"], transmission_components: ["connectivity"], errors: [], warnings: ["Single PM sensor: error margin isn't assessed"] },
      { name: "terra_gas", network: "terra", category: "gas", profile_id: "terra_gas", diagnosable: false, components: ["gas_sensor"], transmission_components: [], errors: ["No transmission component mapped"], warnings: [] },
    ],
  }),
)

beaconApi.post("/networks/profiles/seed", () =>
  ok({ message: "Profiles are up to date", created: [], existing: ["acme_lowcost", "nimbus_lowcost", "terra_gas"], components_added: [], devices_assigned: 0, diagnosable: ["acme_lowcost", "nimbus_lowcost"] }),
)

// ─── Sync actions: the demo data is always in sync, so these only acknowledge ─

for (const path of [
  "/devices/sync",
  "/maintenance/sync-performance",
  "/cohorts/sync",
  "/sites/sync",
  "/grids/sync",
  "/groups/sync",
  "/networks/sync",
  "/data-sync/sync-thingspeak",
  "/data-sync/sync-external",
  "/data-sync/poll-external-feeds",
]) {
  beaconApi.post(path, () => ok({ message: "Sync completed (demo data is always in sync)", updates_count: 0, new_count: 0 }))
}

// ─── The signed-in user's profile (Settings) ────────────────────────────────

const profile = {
  id: DEMO_USER._id,
  first_name: DEMO_USER.firstName,
  last_name: DEMO_USER.lastName,
  email: DEMO_USER.email,
  phone: "",
  role: DEMO_GROUPS[0].role.role_name,
  created_at: "2025-01-06T08:00:00.000Z",
}

beaconApi.get("/users/me", () => ({ body: profile }))
beaconApi.put("/users/me", ({ body }) => {
  for (const key of ["first_name", "last_name", "email", "phone"] as const) {
    if (typeof body?.[key] === "string") profile[key] = body[key]
  }
  return { body: profile }
})

// ─── Diagnostics, device profiles and status codes ──────────────────────────

registerDiagnosticsRoutes(beaconApi)

// Unused by the app but cheap: a single reading, for anyone poking at the API
beaconApi.get("/devices/:id/readings", ({ params, query }) => {
  const device = findDevice(params.id)
  if (!device) return notFound("Device")
  const { start, end } = windowOf(query, 1)
  const readings = readingsBetween(device, start, end, Number(query.get("limit")) || 48)
  return { body: { device_id: device._id, device_name: device.name, count: readings.length, readings } }
})

