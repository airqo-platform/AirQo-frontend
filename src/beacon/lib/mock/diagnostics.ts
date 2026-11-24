/**
 * Diagnostics for the mock backend.
 *
 * Device profiles, diagnostic templates and status code sets live in memory for the life of the
 * server process, so the settings pages see their own edits (`seed-defaults` restores the
 * defaults). A small diagnostic engine scores the demo fleet's readings against the profiles:
 * on-demand evaluations, the nightly daily diagnoses, fleet summaries, issue streaks, indicators
 * and trends all come from that one engine, so every view agrees with the others and with the
 * device health in lib/mock/fleet.ts (offline devices report no data, degraded ones show sensor
 * disagreement, low charge, weak signal and gaps, healthy ones pass every check).
 *
 * Raw device rows (`/data-sync/raw`, `rawFieldsFor`) follow a fixed firmware layout per
 * manufacturer; a profile's telemetry mappings say what each field means, as on real devices.
 */
import { causeTitle, humanizeComponent, humanizeMetric } from "@/lib/device-diagnosis"
import { decodeStatus, validateStatusCodes } from "@/lib/status-codes"
import type {
  AgreementIndicator,
  ChargeCycleIndicator,
  ComponentDefinition,
  ComponentRelationship,
  ConfigMapping,
  CoverageIndicator,
  DailyDiagnosticsRunResponse,
  DailyIssue,
  DataCompleteness,
  DeviceDailyDiagnostic,
  DeviceDailyDiagnosticSummary,
  DeviceDiagnostics,
  DeviceDiagnosticsIssue,
  DeviceHealthSnapshot,
  DeviceIndicators,
  DeviceIndicatorSeries,
  DeviceIssueHistoryItem,
  DeviceIssueSummary,
  DeviceProfile,
  DeviceTrends,
  DeviceVendor,
  DiagnosisResult,
  DiagnosticCheckType,
  DiagnosticEvaluationResult,
  DiagnosticFeedbackRecord,
  DiagnosticsSummary,
  DiagnosticsSummaryIssue,
  DiagnosticTemplate,
  EvidenceContribution,
  EvidenceFact,
  FleetDailySummary,
  FleetDeviceHealth,
  FleetIssue,
  FleetTopIssue,
  HealthTrendPoint,
  HypothesisRule,
  IndicatorGroupValues,
  IndicatorSeriesPoint,
  IndicatorTrend,
  IssueSeverity,
  LifecycleState,
  MetadataMapping,
  MetricDefinition,
  MetricSummary,
  OutageWindow,
  ProfileDiagnosticReadiness,
  StatusCode,
  StatusCodeSet,
  StatusDecodeResponse,
  StatusDecodeRule,
  TelemetryMapping,
  TemplateCause,
  TemplateSymptom,
} from "@/types/diagnostics"
import {
  DAY,
  DEVICES,
  HOUR,
  daysAgo,
  devicesForGroup,
  findDevice,
  noise,
  readingAt,
  seeded,
  type DemoDevice,
  type DemoReading,
} from "./fleet"
import type { MockResult, MockRouter } from "./router"

// ─── Small helpers ──────────────────────────────────────────────────────────

const round = (value: number, places = 2) => Math.round(value * 10 ** places) / 10 ** places
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const mean = (values: number[]) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0)
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const dayStartMs = (day: string) => Date.parse(`${day}T00:00:00Z`)
const shiftDay = (day: string, days: number) => isoDay(dayStartMs(day) + days * DAY)
const todayUtc = () => isoDay(Date.now())
const yesterdayUtc = () => shiftDay(todayUtc(), -1)
const isDay = (value: string | null | undefined): value is string =>
  Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(dayStartMs(value)))

/** Every day from `start` to `end`, both included. */
function daysBetween(start: string, end: string): string[] {
  const days: string[] = []
  for (let day = start; day <= end && days.length < 400; day = shiftDay(day, 1)) days.push(day)
  return days
}

const numberOf = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const intParam = (query: URLSearchParams, name: string, fallback: number, min: number, max: number) => {
  const raw = query.get(name)
  const value = raw === null || raw === "" ? NaN : Number(raw)
  return Number.isFinite(value) ? clamp(Math.floor(value), min, max) : fallback
}

const isTrue = (value: string | null) => value === "true" || value === "1"

const hex8 = (key: string) => Math.floor(noise(key) * 0xffffffff).toString(16).padStart(8, "0")
/** A UUID-shaped id derived from a seed, so fixture ids are stable across restarts. */
const uuidFrom = (seed: string) => {
  const [a, b, c, d] = ["a", "b", "c", "d"].map((part) => hex8(`${seed}-${part}`))
  return `${a}-${b.slice(0, 4)}-4${b.slice(5, 8)}-8${c.slice(1, 4)}-${c.slice(4, 8)}${d}`
}
let idCounter = 0
const newId = (kind: string) => uuidFrom(`${kind}-${++idCounter}-${Date.now()}`)

const detail = (status: number, value: unknown): MockResult => ({ status, body: { detail: value } })
const notFound = (what: string) => detail(404, `${what} not found`)

const SEVERITY_RANK: Record<IssueSeverity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }
const SEVERITIES: IssueSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
const severityRank = (severity: string | null | undefined) => SEVERITY_RANK[severity as IssueSeverity] ?? 0
const worstSeverity = (severities: Array<IssueSeverity | null | undefined>): IssueSeverity | null =>
  severities.reduce<IssueSeverity | null>((worst, s) => (s && severityRank(s) > severityRank(worst) ? s : worst), null)

const ENGINE_VERSION = "2.4.0"
/** Days back the nightly diagnosis history reaches. */
const HISTORY_DAYS = 90
/** Raw readings are kept this long, so a daily run can only (re)diagnose these days. */
const RAW_RETENTION_DAYS = 14

// ─── Raw device rows (fixed firmware layout per manufacturer) ───────────────

type ValueKey =
  | "s1_pm2_5" | "s1_pm10" | "s2_pm2_5" | "s2_pm10" | "pm2_5" | "pm10" | "temperature" | "humidity"
  | "battery" | "co2" | "signal" | "status" | "latitude" | "longitude"

type SampleValues = Record<ValueKey, number | null>

interface Firmware {
  /** Seconds between uploads */
  interval: number
  fields: Array<[string, ValueKey]>
}

const FIRMWARE: Record<string, Firmware> = {
  acme: {
    interval: 300,
    fields: [
      ["field1", "s1_pm2_5"], ["field2", "s1_pm10"], ["field3", "s2_pm2_5"], ["field4", "s2_pm10"],
      ["field5", "latitude"], ["field6", "longitude"], ["field7", "battery"], ["field8", "temperature"],
      ["field9", "humidity"], ["field10", "status"], ["field11", "signal"],
    ],
  },
  nimbus: {
    interval: 600,
    fields: [["field1", "pm2_5"], ["field2", "pm10"], ["field3", "temperature"], ["field4", "humidity"], ["field5", "battery"], ["field6", "signal"]],
  },
  terra: {
    interval: 900,
    fields: [["field1", "co2"], ["field2", "pm2_5"], ["field3", "temperature"], ["field4", "humidity"], ["field5", "battery"], ["field6", "signal"]],
  },
}

const firmwareOf = (device: DemoDevice): Firmware => FIRMWARE[device.network] ?? (device.dualPm ? FIRMWARE.acme : FIRMWARE.nimbus)

const deviceSeeds = new Map<string, number>()
const deviceSeed = (device: DemoDevice) => {
  let seed = deviceSeeds.get(device._id)
  if (seed === undefined) {
    seed = Math.floor(noise(`${device._id}-samples`) * 4294967296) >>> 0
    deviceSeeds.set(device._id, seed)
  }
  return seed
}

/** Randomness for one upload: cheap integer mixing instead of hashing a string per row. */
const sampleRng = (device: DemoDevice, hourSlot: number, k: number) =>
  seeded((deviceSeed(device) ^ Math.imul(hourSlot, 0x9e3779b1) ^ Math.imul(k + 1, 0x85ebca77)) >>> 0)

/**
 * One upload's values. Upload 0 of an hour is the hourly reading itself (what the rest of the
 * mock shows); later uploads in the hour jitter around it, and some are dropped on unhealthy devices.
 */
function sampleValues(device: DemoDevice, reading: DemoReading, hourSlot: number, k: number): SampleValues | null {
  const r = sampleRng(device, hourSlot, k)
  if (k > 0 && r() > (device.health === "healthy" ? 0.985 : 0.88)) return null
  const jitter = (scale: number) => (k === 0 ? 0 : (r() - 0.5) * scale)
  const pm = (value: number | null, factor: number) => (value === null ? null : round(Math.max(0, value * factor), 2))
  const f1 = 1 + jitter(0.06)
  const f2 = 1 + jitter(0.06)
  const s1 = pm(reading.s1_pm2_5, f1)
  const s2 = pm(reading.s2_pm2_5, f2)
  const battery = round(reading.battery + jitter(0.02), 2)

  // Signal quality (CSQ 0..31): steady on healthy devices, weak and patchy on the others
  const signalBase = device.health === "healthy" ? 14 + noise(`${device._id}-csq`) * 12 : 7 + noise(`${device._id}-csq`) * 8
  const signal = Math.round(clamp(signalBase + (r() - 0.5) * 4, 0, 31))

  // Bitmask status (see the acme-status code set); only the dual-sensor firmware reports one
  let status: number | null = null
  if (device.network === "acme" || (FIRMWARE[device.network] === undefined && device.dualPm)) {
    const unhealthy = device.health !== "healthy"
    status = 0
    if (device.health === "offline" && r() < 0.05) status += 1
    if (s1 !== null && s2 !== null && Math.abs(s1 - s2) / Math.max(1, (s1 + s2) / 2) > 0.4 && r() < 0.6) status += 2
    if (battery < 3.6) status += 4
    if (r() < (unhealthy ? 0.12 : 0.02)) status += 8
    if (r() < 0.008) status += 32
    if (device.health === "degraded" && r() < 0.02) status += 64 // not in the set: decodes as unknown
  }

  return {
    s1_pm2_5: s1,
    s1_pm10: pm(reading.s1_pm10, f1),
    s2_pm2_5: s2,
    s2_pm10: pm(reading.s2_pm10, f2),
    pm2_5: s1 === null ? null : s2 === null ? s1 : round((s1 + s2) / 2, 2),
    pm10: pm(reading.pm10, f1),
    temperature: round(reading.temperature + jitter(0.3), 1),
    humidity: round(clamp(reading.humidity + jitter(1), 0, 100), 1),
    battery,
    co2: reading.co2 === null ? null : Math.round(reading.co2 + jitter(6)),
    signal,
    status,
    latitude: device.latitude,
    longitude: device.longitude,
  }
}

const fieldsFrom = (firmware: Firmware, values: SampleValues): Record<string, number | string | null> =>
  Object.fromEntries(firmware.fields.map(([slot, key]) => [slot, values[key]]))

/**
 * A device's raw fields (field1..fieldN) for one hourly reading, laid out the way its firmware
 * sends them; the status code value is in the acme devices' field10.
 */
export function rawFieldsFor(device: DemoDevice, reading: DemoReading): Record<string, number | string | null> {
  const hourSlot = Math.floor(Date.parse(reading.timestamp) / HOUR)
  const values = sampleValues(device, reading, hourSlot, 0) as SampleValues
  return fieldsFrom(firmwareOf(device), values)
}

interface EngineRecord {
  t: number
  values: Record<string, unknown>
}

/** Every upload a device made between two instants, oldest first. */
function deviceRecords(device: DemoDevice, startMs: number, endMs: number): EngineRecord[] {
  const firmware = firmwareOf(device)
  const now = Date.now()
  const end = Math.min(endMs, now)
  const nowSlot = Math.floor(now / HOUR)
  const perHour = Math.max(1, Math.round(3600 / firmware.interval))
  const records: EngineRecord[] = []
  for (let slot = Math.floor(startMs / HOUR); slot <= Math.floor(end / HOUR); slot++) {
    const reading = readingAt(device, nowSlot - slot)
    if (!reading) continue
    for (let k = 0; k < perHour; k++) {
      const t = slot * HOUR + k * firmware.interval * 1000
      if (t < startMs || t > end) continue
      const values = sampleValues(device, reading, slot, k)
      if (values) records.push({ t, values: fieldsFrom(firmware, values) })
    }
  }
  return records
}

const channelOf = (device: DemoDevice): string | number => device.device_number ?? device._id

// ─── Default profiles, templates and status code sets ───────────────────────

const metric = (
  key: string,
  name: string,
  unit: string | undefined,
  min: number | null,
  max: number | null,
  extra: Partial<MetricDefinition> = {},
): MetricDefinition => ({
  key,
  name,
  unit,
  data_type: "float",
  expected_min: min,
  expected_max: max,
  max_rate_of_change: null,
  is_telemetry_field: true,
  role: null,
  ...extra,
})

interface ComponentSpec {
  name: string
  type: string
  criticality: number
  x: number
  y: number
  description: string
  metrics: MetricDefinition[]
}

interface RelationSpec {
  source: string
  target: string
  type: string
  criticality: number
  description: string
  tolerance?: { absolute?: number; relative?: number }
}

interface ProfileSpec {
  name: string
  category: string
  description: string
  vendor: string
  manufacturers: string[]
  telemetry: Record<string, TelemetryMapping>
  config: Record<string, ConfigMapping>
  metadata: Record<string, MetadataMapping>
  components: ComponentSpec[]
  relationships: RelationSpec[]
  createdDaysAgo: number
}

const batteryComponent = (x: number, y: number, criticality: number): ComponentSpec => ({
  name: "device_battery",
  type: "battery",
  criticality,
  x,
  y,
  description: "Rechargeable pack that keeps the device running overnight",
  metrics: [
    metric("battery_voltage", "Battery voltage", "V", 3.6, 4.5, {
      max_rate_of_change: 0.5,
      role: "charge_level",
      description: "Pack voltage. Below 3.6 V the modem browns out.",
    }),
  ],
})

const environmentComponent = (x: number, y: number): ComponentSpec => ({
  name: "environment_sensor",
  type: "sensor",
  criticality: 0.1,
  x,
  y,
  description: "Temperature and humidity inside the enclosure",
  metrics: [
    metric("temperature", "Temperature", "°C", -10, 60, { max_rate_of_change: 10 }),
    metric("humidity", "Relative humidity", "%", 0, 100, { max_rate_of_change: 30 }),
  ],
})

const linkComponent = (name: string, x: number, y: number, criticality: number): ComponentSpec => ({
  name,
  type: "connectivity",
  criticality,
  x,
  y,
  description: "Cellular modem that uploads the readings",
  metrics: [
    metric("signal_quality", "Signal quality", "CSQ", 8, 31, {
      data_type: "int",
      role: "signal_strength",
      description: "Received signal quality; below 8 uploads start failing.",
    }),
  ],
})

const PROFILE_SPECS: ProfileSpec[] = [
  {
    name: "lowcost",
    category: "air_quality",
    description:
      "Acme dual-sensor particulate monitor: two co-located optical PM sensors, a solar-charged battery and a cellular modem uploading to a data channel every 5 minutes.",
    vendor: "Acme Instruments",
    manufacturers: ["acme"],
    telemetry: {
      field1: { key: "pm2_5_sensor1", label: "PM2.5 sensor 1", unit: "µg/m³", source: "pm_sensor_1" },
      field2: { key: "pm10_sensor1", label: "PM10 sensor 1", unit: "µg/m³", source: "pm_sensor_1" },
      field3: { key: "pm2_5_sensor2", label: "PM2.5 sensor 2", unit: "µg/m³", source: "pm_sensor_2" },
      field4: { key: "pm10_sensor2", label: "PM10 sensor 2", unit: "µg/m³", source: "pm_sensor_2" },
      field7: { key: "battery_voltage", label: "Battery voltage", unit: "V", source: "device_battery" },
      field8: { key: "temperature", label: "Internal temperature", unit: "°C", source: "environment_sensor" },
      field9: { key: "humidity", label: "Internal humidity", unit: "%", source: "environment_sensor" },
      field10: { key: "device_status", label: "Device status", source: "main_board", status_code_set: "acme-status" },
      field11: { key: "signal_quality", label: "Signal quality", unit: "CSQ", source: "cellular_modem" },
    },
    config: {
      config1: { key: "sampling_interval", label: "Sampling interval", type: "int", unit: "s", default: 60 },
      config2: { key: "reporting_interval", label: "Upload interval", type: "int", unit: "s", default: 300 },
      config5: { key: "low_battery_threshold", label: "Low battery threshold", type: "float", unit: "V", default: 3.6 },
    },
    metadata: {
      field5: { key: "latitude", label: "GPS latitude" },
      field6: { key: "longitude", label: "GPS longitude" },
    },
    components: [
      {
        name: "pm_sensor_1",
        type: "sensor",
        criticality: 0.25,
        x: 420,
        y: 40,
        description: "Primary optical particulate sensor",
        metrics: [
          metric("pm2_5_sensor1", "PM2.5 (sensor 1)", "µg/m³", 0, 500, { max_rate_of_change: 200 }),
          metric("pm10_sensor1", "PM10 (sensor 1)", "µg/m³", 0, 600, { max_rate_of_change: 250 }),
        ],
      },
      {
        name: "pm_sensor_2",
        type: "sensor",
        criticality: 0.25,
        x: 420,
        y: 260,
        description: "Secondary optical particulate sensor, co-located with the first",
        metrics: [
          metric("pm2_5_sensor2", "PM2.5 (sensor 2)", "µg/m³", 0, 500, { max_rate_of_change: 200 }),
          metric("pm10_sensor2", "PM10 (sensor 2)", "µg/m³", 0, 600, { max_rate_of_change: 250 }),
        ],
      },
      batteryComponent(60, 150, 0.2),
      linkComponent("cellular_modem", 780, 150, 0.2),
      environmentComponent(60, 380),
    ],
    relationships: [
      {
        source: "pm_sensor_1",
        target: "pm_sensor_2",
        type: "MEASURES_SAME_AS",
        criticality: 0.9,
        description: "Co-located sensors sampling the same air",
        tolerance: { absolute: 5, relative: 0.15 },
      },
      { source: "device_battery", target: "pm_sensor_1", type: "POWERS", criticality: 0.8, description: "Battery supplies the primary sensor" },
      { source: "device_battery", target: "pm_sensor_2", type: "POWERS", criticality: 0.8, description: "Battery supplies the secondary sensor" },
      { source: "device_battery", target: "cellular_modem", type: "POWERS", criticality: 0.9, description: "Battery supplies the modem" },
      { source: "pm_sensor_1", target: "cellular_modem", type: "COMMUNICATES_VIA", criticality: 0.7, description: "Readings are uploaded by the modem" },
      { source: "pm_sensor_2", target: "cellular_modem", type: "COMMUNICATES_VIA", criticality: 0.7, description: "Readings are uploaded by the modem" },
    ],
    createdDaysAgo: 260,
  },
  {
    name: "lowcost_single",
    category: "air_quality",
    description:
      "Nimbus single-sensor particulate monitor read through the manufacturer's API: one optical PM sensor, a backup battery and a cellular link reporting every 10 minutes.",
    vendor: "Nimbus Sensing",
    manufacturers: ["nimbus"],
    telemetry: {
      field1: { key: "pm2_5", label: "PM2.5", unit: "µg/m³", source: "pm_sensor" },
      field2: { key: "pm10", label: "PM10", unit: "µg/m³", source: "pm_sensor" },
      field3: { key: "temperature", label: "Temperature", unit: "°C", source: "environment_sensor" },
      field4: { key: "humidity", label: "Humidity", unit: "%", source: "environment_sensor" },
      field5: { key: "battery_voltage", label: "Battery voltage", unit: "V", source: "device_battery" },
      field6: { key: "signal_quality", label: "Signal quality", unit: "CSQ", source: "data_link" },
    },
    config: {
      config1: { key: "reporting_interval", label: "Reporting interval", type: "int", unit: "s", default: 600 },
    },
    metadata: {},
    components: [
      {
        name: "pm_sensor",
        type: "sensor",
        criticality: 0.35,
        x: 420,
        y: 60,
        description: "Optical particulate sensor",
        metrics: [
          metric("pm2_5", "PM2.5", "µg/m³", 0, 500, { max_rate_of_change: 200 }),
          metric("pm10", "PM10", "µg/m³", 0, 600, { max_rate_of_change: 250 }),
        ],
      },
      batteryComponent(60, 150, 0.25),
      linkComponent("data_link", 780, 150, 0.3),
      environmentComponent(420, 300),
    ],
    relationships: [
      { source: "device_battery", target: "pm_sensor", type: "POWERS", criticality: 0.8, description: "Battery supplies the sensor" },
      { source: "device_battery", target: "data_link", type: "POWERS", criticality: 0.9, description: "Battery supplies the link" },
      { source: "pm_sensor", target: "data_link", type: "COMMUNICATES_VIA", criticality: 0.7, description: "Readings leave through the cellular link" },
    ],
    createdDaysAgo: 210,
  },
  {
    name: "gas",
    category: "air_quality_gas",
    description:
      "Terra gas monitor: an NDIR CO₂ sensor with a small particulate channel, a backup battery and a cellular link reporting every 15 minutes.",
    vendor: "Terra Analytics",
    manufacturers: ["terra"],
    telemetry: {
      field1: { key: "co2", label: "CO₂", unit: "ppm", source: "gas_sensor" },
      field2: { key: "pm2_5", label: "PM2.5", unit: "µg/m³", source: "pm_sensor" },
      field3: { key: "temperature", label: "Temperature", unit: "°C", source: "environment_sensor" },
      field4: { key: "humidity", label: "Humidity", unit: "%", source: "environment_sensor" },
      field5: { key: "battery_voltage", label: "Battery voltage", unit: "V", source: "device_battery" },
      field6: { key: "signal_quality", label: "Signal quality", unit: "CSQ", source: "data_link" },
    },
    config: {
      config1: { key: "reporting_interval", label: "Reporting interval", type: "int", unit: "min", default: 15 },
      config2: { key: "warmup_minutes", label: "Sensor warm-up", type: "int", unit: "min", default: 3 },
    },
    metadata: {},
    components: [
      {
        name: "gas_sensor",
        type: "sensor",
        criticality: 0.35,
        x: 420,
        y: 40,
        description: "NDIR carbon dioxide sensor",
        metrics: [metric("co2", "CO₂", "ppm", 350, 2000, { max_rate_of_change: 400 })],
      },
      {
        name: "pm_sensor",
        type: "sensor",
        criticality: 0.15,
        x: 420,
        y: 230,
        description: "Optical particulate channel",
        metrics: [metric("pm2_5", "PM2.5", "µg/m³", 0, 500, { max_rate_of_change: 200 })],
      },
      batteryComponent(60, 150, 0.2),
      linkComponent("data_link", 780, 150, 0.2),
      environmentComponent(420, 400),
    ],
    relationships: [
      { source: "device_battery", target: "gas_sensor", type: "POWERS", criticality: 0.8, description: "Battery supplies the gas sensor and its heater" },
      { source: "device_battery", target: "data_link", type: "POWERS", criticality: 0.9, description: "Battery supplies the link" },
      { source: "gas_sensor", target: "data_link", type: "COMMUNICATES_VIA", criticality: 0.7, description: "Readings leave through the cellular link" },
      { source: "pm_sensor", target: "data_link", type: "COMMUNICATES_VIA", criticality: 0.5, description: "Readings leave through the cellular link" },
    ],
    createdDaysAgo: 180,
  },
  {
    name: "bench_prototype",
    category: "generic_iot",
    description: "Draft profile for a prototype node on the test bench. Add components and map their metrics before devices on it can be diagnosed.",
    vendor: "In-house",
    manufacturers: [],
    telemetry: {
      field1: { key: "board_temperature", label: "Board temperature", unit: "°C" },
    },
    config: {},
    metadata: {},
    components: [],
    relationships: [],
    createdDaysAgo: 12,
  },
]

function buildProfile(spec: ProfileSpec): DeviceProfile {
  const id = uuidFrom(`profile-${spec.name}`)
  const components: ComponentDefinition[] = spec.components.map((c) => {
    const componentId = uuidFrom(`component-${spec.name}-${c.name}`)
    return {
      id: componentId,
      profile_id: id,
      name: c.name,
      component_type: c.type,
      criticality: c.criticality,
      x_coordinate: c.x,
      y_coordinate: c.y,
      meta_data: { description: c.description },
      metrics: c.metrics.map((m) => ({ ...m, id: uuidFrom(`metric-${spec.name}-${c.name}-${m.key}`), component_id: componentId })),
    }
  })
  const idOf = (name: string) => components.find((c) => c.name === name)?.id
  const relationships: ComponentRelationship[] = spec.relationships.map((r, index) => ({
    id: uuidFrom(`relationship-${spec.name}-${index}`),
    profile_id: id,
    source_component: r.source,
    source_component_id: idOf(r.source),
    source_component_name: r.source,
    target_component: r.target,
    target_component_id: idOf(r.target),
    target_component_name: r.target,
    relation_type: r.type,
    relationship_type: r.type,
    criticality: r.criticality,
    description: r.description,
    meta_data: r.tolerance ? { tolerance: r.tolerance } : null,
  }))
  const vendor: DeviceVendor = { id: uuidFrom(`vendor-${spec.vendor}`), name: spec.vendor }
  return {
    id,
    name: spec.name,
    category: spec.category,
    description: spec.description,
    vendor,
    vendor_id: vendor.id,
    meta_data: { manufacturers: spec.manufacturers },
    telemetry_mappings: spec.telemetry,
    config_mappings: spec.config,
    metadata_mappings: spec.metadata,
    components,
    relationships,
    created_at: daysAgo(spec.createdDaysAgo),
    updated_at: daysAgo(Math.max(1, Math.floor(spec.createdDaysAgo / 4))),
  }
}

const rule = (evidence_code: string, weight: number, is_mandatory: boolean, description: string): HypothesisRule => ({
  evidence_code,
  weight,
  is_mandatory,
  description,
})

const symptom = (
  code: string,
  name: string,
  severity: IssueSeverity,
  description: string,
  checks: DiagnosticCheckType[],
  threshold_condition: string,
): TemplateSymptom => ({
  code,
  name,
  severity,
  description,
  evaluation_logic: { checks },
  category: checks[0],
  threshold_condition,
  evaluation_window: "24h",
})

const cause = (
  code: string,
  title: string,
  category: string,
  default_severity: IssueSeverity,
  description: string,
  recommended_action: string,
  hypothesis_rules: HypothesisRule[],
): TemplateCause => ({ code, title, category, default_severity, description, recommended_action, hypothesis_rules })

interface TemplateSpec {
  key: string
  template: Omit<DiagnosticTemplate, "id" | "created_at" | "updated_at">
  createdDaysAgo: number
}

const TEMPLATE_SPECS: TemplateSpec[] = [
  {
    key: "battery",
    createdDaysAgo: 240,
    template: {
      name: "Battery and charging",
      target_component_type: "battery",
      version: "1.2.0",
      description: "Separates a worn-out battery from a charging problem using the charge level's daily range and what happened before outages.",
      symptoms: [
        symptom("SYMP_LOW_CHARGE", "Charge below safe minimum", "HIGH", "The charge level spends part of the day below the metric's expected minimum.", ["METRIC_BELOW_MIN"], "charge_level < expected_min in more than 5% of readings"),
        symptom("SYMP_OUTAGE_AFTER_LOW_CHARGE", "Outage after low charge", "HIGH", "The device stopped reporting right after its charge was low.", ["LOW_CHARGE_OUTAGE"], "gap of 90 min or more starting below the low-charge threshold"),
        symptom("SYMP_FAST_DISCHARGE", "Discharge faster than allowed", "MEDIUM", "Hour-to-hour discharge exceeds the metric's max rate of change.", ["METRIC_RATE_EXCEEDED"], "hourly drop > max_rate_of_change"),
      ],
      causes: [
        cause(
          "CAUSE_BATTERY_DEGRADATION",
          "Battery capacity loss",
          "HARDWARE_FAILURE",
          "HIGH",
          "Cells no longer hold enough charge to last the night.",
          "Measure the resting voltage of the battery pack and replace it if it can't hold charge overnight.",
          [
            rule("SYMP_LOW_CHARGE", 4, true, "Charge drops below the safe minimum"),
            rule("SYMP_FAST_DISCHARGE", 2.5, false, "Discharges faster than a healthy pack"),
            rule("SYMP_OUTAGE_AFTER_LOW_CHARGE", 2, false, "Outages follow low charge"),
            rule("EVID_CHARGE_WITHIN_LIMITS", -5, false, "Charge stayed within limits"),
          ],
        ),
        cause(
          "CAUSE_CHARGING_FAULT",
          "Charging circuit or supply fault",
          "MAINTENANCE_REQUIRED",
          "HIGH",
          "The battery isn't being recharged during the day, so the device runs flat and stops.",
          "Check the charger, solar panel and wiring; clean the panel and confirm it delivers current in daylight.",
          [
            rule("SYMP_OUTAGE_AFTER_LOW_CHARGE", 4, true, "The device went silent after running low"),
            rule("SYMP_LOW_CHARGE", 1.5, false, "Charge drops below the safe minimum"),
          ],
        ),
      ],
      target_profile_categories: [],
    },
  },
  {
    key: "sensor",
    createdDaysAgo: 230,
    template: {
      name: "Sensor health",
      target_component_type: "sensor",
      version: "1.4.0",
      description: "Drift between paired sensors, dead or frozen channels and readings outside the sensor's range.",
      symptoms: [
        symptom("SYMP_PAIR_OUT_OF_TOLERANCE", "Paired sensors outside tolerance", "MEDIUM", "Co-located sensors differ by more than the relationship's tolerance too often.", ["SENSOR_ERROR_MARGIN"], "within-tolerance share < 80%"),
        symptom("SYMP_PAIR_DECORRELATED", "Paired sensors move independently", "HIGH", "Co-located sensors no longer follow each other.", ["SENSOR_DISAGREEMENT"], "Pearson r < 0.5"),
        symptom("SYMP_CHANNEL_SILENT", "Sensor channel missing", "HIGH", "A mapped metric is absent from every reading.", ["METRIC_MISSING"], "metric missing from all records"),
        symptom("SYMP_CHANNEL_STUCK", "Sensor value frozen", "MEDIUM", "A metric reports the same value all window.", ["METRIC_STUCK"], "zero variance over 12+ readings"),
        symptom("SYMP_OUT_OF_RANGE", "Reading outside the sensor's range", "MEDIUM", "Values beyond the metric's expected range.", ["METRIC_ABOVE_MAX", "METRIC_BELOW_MIN", "METRIC_RATE_EXCEEDED"], "value outside expected_min..expected_max"),
      ],
      causes: [
        cause(
          "CAUSE_SENSOR_DRIFT",
          "Sensor drift or a dirty optical chamber",
          "MAINTENANCE_REQUIRED",
          "MEDIUM",
          "One sensor of a pair reads consistently off the other, usually from dust in the chamber or ageing.",
          "Clean the sensor inlet and optical chamber, then co-locate the device with a reference to recalibrate.",
          [
            rule("SYMP_PAIR_OUT_OF_TOLERANCE", 4.5, true, "Paired sensors disagree beyond tolerance"),
            rule("SYMP_PAIR_DECORRELATED", 1.5, false, "Paired sensors stopped tracking each other"),
            rule("EVID_SENSORS_IN_AGREEMENT", -5, false, "Pairs track each other within tolerance"),
          ],
        ),
        cause(
          "CAUSE_SENSOR_FAILURE",
          "Sensor module failure",
          "HARDWARE_FAILURE",
          "HIGH",
          "The sensor stopped producing usable values.",
          "Reseat the sensor's connector; replace the module if the channel stays silent or frozen.",
          [
            rule("SYMP_CHANNEL_SILENT", 4.5, false, "Channel missing from every reading"),
            rule("SYMP_CHANNEL_STUCK", 4, false, "Channel frozen on one value"),
            rule("SYMP_PAIR_DECORRELATED", 3, false, "Paired sensors stopped tracking each other"),
          ],
        ),
        cause(
          "CAUSE_SENSOR_ENVIRONMENT",
          "Conditions outside the sensor's range",
          "ENVIRONMENTAL",
          "LOW",
          "The readings are real but beyond what the sensor is specified for.",
          "Check the site for nearby sources, heat build-up in the enclosure or water ingress.",
          [rule("SYMP_OUT_OF_RANGE", 3, true, "Values beyond the expected range")],
        ),
      ],
      target_profile_categories: [],
    },
  },
  {
    key: "connectivity",
    createdDaysAgo: 220,
    template: {
      name: "Data link",
      target_component_type: "connectivity",
      version: "1.1.0",
      description: "Tells a weak cellular link apart from a device that stopped transmitting.",
      symptoms: [
        symptom("SYMP_DATA_GAPS", "Missing readings", "MEDIUM", "Fewer readings arrived than the reporting interval implies.", ["DATA_GAPS"], "missing share > 20%"),
        symptom("SYMP_WEAK_SIGNAL", "Weak cellular signal", "MEDIUM", "Signal quality spends time below its minimum.", ["METRIC_BELOW_MIN"], "signal_quality < expected_min in more than 5% of readings"),
      ],
      causes: [
        cause(
          "CAUSE_WEAK_SIGNAL",
          "Weak or unstable cellular link",
          "MAINTENANCE_REQUIRED",
          "MEDIUM",
          "Uploads fail where coverage is poor.",
          "Check the antenna and its cable; move the antenna higher or switch the SIM to a network with better coverage.",
          [
            rule("SYMP_WEAK_SIGNAL", 4, true, "Signal below the usable minimum"),
            rule("SYMP_DATA_GAPS", 2, false, "Readings went missing"),
          ],
        ),
        cause(
          "CAUSE_TRANSMISSION_LOSS",
          "Device not transmitting",
          "HARDWARE_FAILURE",
          "HIGH",
          "Readings stopped or arrive only now and then while the signal looks fine, pointing at power, the SIM or the modem.",
          "Visit the site: check power to the device, the SIM's data balance and the antenna, then restart the modem.",
          [
            rule("SYMP_DATA_GAPS", 4, true, "Readings went missing"),
            rule("EVID_SIGNAL_OK", 1, false, "Signal was fine when the device reported"),
            rule("SYMP_WEAK_SIGNAL", -2, false, "Signal was weak, which explains the gaps better"),
          ],
        ),
      ],
      target_profile_categories: [],
    },
  },
]

function buildTemplate(spec: TemplateSpec): DiagnosticTemplate {
  const id = uuidFrom(`template-${spec.key}`)
  return normalizeTemplate({ ...clone(spec.template), id, created_at: daysAgo(spec.createdDaysAgo), updated_at: daysAgo(spec.createdDaysAgo / 3) }, null, `template-${spec.key}`)
}

interface CodeSetSpec {
  name: string
  description: string
  decode_rule: StatusDecodeRule
  codes: StatusCode[]
  createdDaysAgo: number
}

const CODE_SET_SPECS: CodeSetSpec[] = [
  {
    name: "acme-status",
    description: "Status flags reported by the Acme dual-sensor firmware in field10. Flags add up: 12 is low battery (4) plus a modem retry (8).",
    decode_rule: "bitmask",
    createdDaysAgo: 150,
    codes: [
      { code: 0, label: "OK", kind: "ok", description: "No status flags set." },
      { code: 1, label: "PM sensor 1 fault", kind: "fault", description: "Sensor 1 returned no frame or a checksum error." },
      { code: 2, label: "PM sensor 2 fault", kind: "fault", description: "Sensor 2 returned no frame, a checksum error or values far from sensor 1." },
      { code: 4, label: "Low battery", kind: "fault", description: "Battery below the configured low battery threshold." },
      { code: 8, label: "Modem retry", kind: "info", description: "The last upload needed a retry to reach the network." },
      { code: 16, label: "Storage write error", kind: "fault", description: "Buffered readings couldn't be written to local storage." },
      { code: 32, label: "Clock not synchronised", kind: "info", description: "The device clock hasn't been synchronised since boot." },
    ],
  },
  {
    name: "terra-gas-status",
    description: "State codes of the Terra gas monitor. One code at a time.",
    decode_rule: "exact",
    createdDaysAgo: 90,
    codes: [
      { code: 0, label: "Measuring", kind: "ok", description: "Normal operation." },
      { code: 1, label: "Warming up", kind: "info", description: "Sensor heater still settling after power-up." },
      { code: 2, label: "Zero calibration due", kind: "info", description: "More than 30 days since the last zero calibration." },
      { code: 3, label: "Gas sensor fault", kind: "fault", description: "The NDIR cell returned no signal." },
      { code: 4, label: "Pump flow low", kind: "fault", description: "Sample pump flow below the minimum." },
    ],
  },
]

const buildCodeSet = (spec: CodeSetSpec): StatusCodeSet => ({
  id: uuidFrom(`code-set-${spec.name}`),
  name: spec.name,
  description: spec.description,
  decode_rule: spec.decode_rule,
  codes: clone(spec.codes),
  created_at: daysAgo(spec.createdDaysAgo),
  updated_at: daysAgo(spec.createdDaysAgo / 2),
})

// ─── In-memory store ────────────────────────────────────────────────────────

const store = {
  profiles: PROFILE_SPECS.map(buildProfile),
  templates: TEMPLATE_SPECS.map(buildTemplate),
  codeSets: CODE_SET_SPECS.map(buildCodeSet),
  feedback: [] as DiagnosticFeedbackRecord[],
  snapshots: new Map<string, DeviceHealthSnapshot[]>(),
  /** device|day → when a forced daily run re-diagnosed it */
  reruns: new Map<string, string>(),
}

const findProfile = (ref: string) => store.profiles.find((p) => p.id === ref) ?? store.profiles.find((p) => p.name === ref)
const findTemplate = (ref: string) => store.templates.find((t) => t.id === ref)
const findCodeSet = (ref: string) =>
  store.codeSets.find((s) => s.id === ref) ?? store.codeSets.find((s) => s.name.toLowerCase() === ref.toLowerCase())

// Profile names some legacy categories use; see CATEGORY_PROFILE_ALIASES in lib/status-codes.ts
const CATEGORY_ALIASES: Record<string, string[]> = { gas: ["lowcost_gas"], lowcost: ["lowcost"] }

/**
 * The profile a device is diagnosed with: one that lists the device's manufacturer in
 * `meta_data.manufacturers`, else one named like its category (or a legacy alias), the way
 * lib/status-codes.ts `findProfileForCategory` matches.
 */
function profileFor(device: DemoDevice): DeviceProfile | null {
  const byManufacturer = store.profiles.find((p) => {
    const list = p.meta_data?.manufacturers
    return Array.isArray(list) && list.includes(device.network)
  })
  if (byManufacturer) return byManufacturer
  const wanted = (device.category || "lowcost").trim().toLowerCase()
  const direct = store.profiles.find((p) => p.name.trim().toLowerCase() === wanted)
  if (direct) return direct
  for (const alias of CATEGORY_ALIASES[wanted] ?? []) {
    const match = store.profiles.find((p) => p.name === alias)
    if (match) return match
  }
  return null
}

// ─── Caches (cleared on edits, and every hour since the fleet's timeline moves with the clock) ──

const cache = {
  hour: -1,
  cores: new Map<string, DayCore | null>(),
  streaks: new Map<string, { days: number; start: string } | null>(),
  readiness: new Map<string, ProfileDiagnosticReadiness>(),
}

function freshCache() {
  const hour = Math.floor(Date.now() / HOUR)
  if (hour !== cache.hour) invalidate(hour)
}

function invalidate(hour = Math.floor(Date.now() / HOUR)) {
  cache.hour = hour
  cache.cores.clear()
  cache.streaks.clear()
  cache.readiness.clear()
}

// ─── Policy and readiness ───────────────────────────────────────────────────

interface Policy {
  min_records: number
  missing_rate_threshold: number
  outage_gap_minutes: number
  limit_breach_fraction: number
  stuck_min_records: number
  agreement_min_within_rate: number
  correlation_min: number
  low_charge_margin: number
  charge_flat_rate: number
  default_interval_seconds: number
  disabled_checks: string[]
}

const DEFAULT_POLICY: Policy = {
  min_records: 6,
  missing_rate_threshold: 0.2,
  outage_gap_minutes: 90,
  limit_breach_fraction: 0.05,
  stuck_min_records: 12,
  agreement_min_within_rate: 0.8,
  correlation_min: 0.5,
  low_charge_margin: 0.1,
  charge_flat_rate: 0.03,
  default_interval_seconds: 300,
  disabled_checks: [],
}

function policyFor(profile: DeviceProfile, override?: Record<string, unknown> | null): Policy {
  const merged: Record<string, unknown> = { ...DEFAULT_POLICY }
  for (const source of [profile.meta_data?.diagnostics, override]) {
    if (!source || typeof source !== "object") continue
    for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
      if (!(key in DEFAULT_POLICY)) continue
      if (key === "disabled_checks") merged[key] = Array.isArray(value) ? value.map(String) : []
      else if (numberOf(value) !== null) merged[key] = numberOf(value)
    }
  }
  return merged as unknown as Policy
}

const TIME_UNIT_SECONDS: Record<string, number> = {
  ms: 0.001, s: 1, sec: 1, second: 1, seconds: 1, min: 60, minute: 60, minutes: 60, h: 3600, hour: 3600, hours: 3600,
}

/** The `reporting_interval` config field's default in seconds, or null without one. */
function configuredInterval(profile: DeviceProfile): number | null {
  for (const mapping of Object.values(profile.config_mappings || {})) {
    if (!mapping || mapping.key !== "reporting_interval") continue
    const value = numberOf(mapping.default)
    if (value === null || value <= 0) return null
    return value * (TIME_UNIT_SECONDS[String(mapping.unit || "s").toLowerCase()] ?? 1)
  }
  return null
}

interface MetricRef {
  component: ComponentDefinition
  metric: MetricDefinition
  slot: string
  ref: string
  label: string
  numeric: boolean
}

const NUMERIC_TYPES = new Set(["float", "int", "integer"])
const isNumericMetric = (m: MetricDefinition) => !m.data_type || NUMERIC_TYPES.has(m.data_type)
const metricLabel = (m: MetricDefinition) => m.name || humanizeMetric(m.key)

function slotsByKey(profile: DeviceProfile): Map<string, string> {
  const slots = new Map<string, string>()
  for (const [slot, mapping] of Object.entries(profile.telemetry_mappings || {})) {
    const key = typeof mapping === "string" ? (mapping as string) : mapping?.key
    if (key && !slots.has(key)) slots.set(key, slot)
  }
  return slots
}

/** Component metrics mapped to a telemetry field: the ones the engine evaluates. */
function metricRefs(profile: DeviceProfile): MetricRef[] {
  const slots = slotsByKey(profile)
  const refs: MetricRef[] = []
  for (const component of profile.components || []) {
    for (const m of component.metrics || []) {
      if (m.is_telemetry_field === false) continue
      const slot = slots.get(m.key)
      if (!slot) continue
      refs.push({ component, metric: m, slot, ref: `${component.name}.${m.key}`, label: metricLabel(m), numeric: isNumericMetric(m) })
    }
  }
  return refs
}

const relationType = (r: ComponentRelationship) => r.relationship_type || r.relation_type || "POWERS"

function relationEnds(profile: DeviceProfile, r: ComponentRelationship): [ComponentDefinition, ComponentDefinition] | null {
  const find = (id?: string, name?: string, alt?: string) =>
    (profile.components || []).find((c) => (id && c.id === id) || (name && c.name === name) || (alt && c.name === alt))
  const source = find(r.source_component_id, r.source_component, r.source_component_name)
  const target = find(r.target_component_id, r.target_component, r.target_component_name)
  return source && target && source !== target ? [source, target] : null
}

/** "pm2_5_sensor1" → "pm2_5"; keys without a sensor number stay as they are. */
const baseKey = (key: string) => key.replace(/_?sensor_?\d+$/i, "")

/** Metric pairs a MEASURES_SAME_AS relationship compares: same key once sensor numbers are dropped. */
function pairMetrics(refs: MetricRef[], a: ComponentDefinition, b: ComponentDefinition): Array<[MetricRef, MetricRef]> {
  const left = refs.filter((r) => r.component === a && r.numeric)
  const right = refs.filter((r) => r.component === b && r.numeric)
  const pairs: Array<[MetricRef, MetricRef]> = []
  for (const l of left) {
    const match = right.find((r) => baseKey(r.metric.key) === baseKey(l.metric.key))
    if (match) pairs.push([l, match])
  }
  if (pairs.length === 0 && left.length === 1 && right.length === 1) pairs.push([left[0], right[0]])
  return pairs
}

const transmissionComponents = (profile: DeviceProfile) =>
  (profile.components || []).filter((c) => c.component_type === "connectivity").map((c) => c.name)

function readinessOf(profile: DeviceProfile): ProfileDiagnosticReadiness {
  const cached = cache.readiness.get(profile.id)
  if (cached) return cached

  const errors: string[] = []
  const warnings: string[] = []
  const components = profile.components || []
  const slots = slotsByKey(profile)
  const refs = metricRefs(profile)

  if (components.length === 0) errors.push("The profile has no components, so there is nothing to score.")
  if (slots.size === 0) errors.push("No telemetry fields are mapped, so no reading can be interpreted.")
  if (components.length > 0 && slots.size > 0 && refs.length === 0) {
    errors.push("None of the components' metrics is mapped to a telemetry field, so no check can run.")
  }

  for (const component of components) {
    if (!component.metrics?.length) warnings.push(`${component.name} has no metrics; it is scored only through its relationships.`)
    for (const m of component.metrics || []) {
      const ref = `${component.name}.${m.key}`
      if (m.is_telemetry_field !== false && !slots.has(m.key)) {
        warnings.push(`${ref} is not mapped to a telemetry field, so it is skipped.`)
      } else if (isNumericMetric(m) && (m.expected_min === null || m.expected_min === undefined) && (m.expected_max === null || m.expected_max === undefined)) {
        warnings.push(`${ref} has no expected range, so the range checks are skipped.`)
      }
    }
  }

  const transmission = transmissionComponents(profile)
  if (components.length > 0 && transmission.length === 0) {
    warnings.push("No connectivity component; data gaps are attributed to the first component.")
  }

  const metricRoles: Record<string, string> = {}
  for (const r of refs) if (r.metric.role) metricRoles[r.ref] = String(r.metric.role)
  if (refs.length > 0 && !Object.values(metricRoles).includes("charge_level")) {
    warnings.push("No metric has the charge_level role, so outages can't be attributed to low charge.")
  }

  const dependencies: Record<string, string[]> = {}
  const redundantPairs: string[] = []
  for (const relationship of profile.relationships || []) {
    const ends = relationEnds(profile, relationship)
    if (!ends) {
      warnings.push(`A ${relationType(relationship)} relationship points at a component that doesn't exist.`)
      continue
    }
    const [source, target] = ends
    const type = relationType(relationship)
    if (type === "MEASURES_SAME_AS") {
      const pairs = pairMetrics(refs, source, target)
      if (pairs.length === 0) warnings.push(`${source.name} and ${target.name} measure the same thing but share no comparable metric.`)
      for (const [a, b] of pairs) redundantPairs.push(`${a.ref} ~ ${b.ref}`)
      const tolerance = relationship.meta_data?.tolerance
      if (pairs.length > 0 && (!tolerance || (tolerance.absolute == null && tolerance.relative == null))) {
        warnings.push(`${source.name} ~ ${target.name} has no tolerance, so their agreement is measured but never flagged.`)
      }
    } else if (type === "COMMUNICATES_VIA") {
      ;(dependencies[source.name] ??= []).push(target.name)
    } else {
      ;(dependencies[target.name] ??= []).push(source.name)
    }
  }

  const interval = configuredInterval(profile)
  const policy = policyFor(profile)
  if (refs.length > 0 && interval === null) {
    warnings.push(`No reporting_interval config field; data gaps assume one reading every ${policy.default_interval_seconds} s.`)
  }

  const readiness: ProfileDiagnosticReadiness = {
    profile_id: profile.id,
    profile_name: profile.name,
    diagnosable: errors.length === 0,
    errors,
    warnings,
    evaluated_metrics: refs.map((r) => r.ref),
    transmission_components: transmission,
    dependencies,
    redundant_pairs: redundantPairs,
    metric_roles: metricRoles,
    effective_policy: { ...policy, expected_interval_seconds: interval ?? policy.default_interval_seconds },
  }
  cache.readiness.set(profile.id, readiness)
  return readiness
}

// ─── Engine ─────────────────────────────────────────────────────────────────

interface Sample {
  t: number
  v: number
}

interface EngineOptions {
  windowStart: number
  windowEnd: number
  intervalSeconds?: number | null
  policy?: Record<string, unknown> | null
}

interface Fact extends EvidenceFact {
  check: DiagnosticCheckType
  severity: IssueSeverity
}

interface EngineResult {
  recordCount: number
  hoursWithData: number
  firstRecordAt: string | null
  lastRecordAt: string | null
  score: number
  state: LifecycleState
  subsystemScores: Record<string, number>
  facts: Fact[]
  symptoms: string[]
  diagnoses: DiagnosisResult[]
  indicators: DeviceIndicators
  completeness: DataCompleteness
  metricsSummary: Record<string, MetricSummary>
  headline: string
  summary: string
}

function makeFact(
  component: ComponentDefinition,
  check: DiagnosticCheckType,
  metricKey: string | null,
  severity: IssueSeverity,
  confidence: number,
  title: string,
  description: string,
  value: unknown,
  related: string[] = [],
): Fact {
  return {
    code: `${check}:${component.name}${metricKey ? `.${metricKey}` : ""}`,
    check,
    component_name: component.name,
    component_type: component.component_type,
    metric: metricKey,
    title,
    description,
    severity,
    confidence: round(clamp(confidence, 0, 1), 2),
    value,
    related_components: related,
    polarity: "SUPPORTING",
  }
}

const samplesOf = (records: EngineRecord[], ref: MetricRef): Sample[] => {
  const samples: Sample[] = []
  for (const record of records) {
    const v = numberOf(record.values[ref.slot] ?? record.values[ref.metric.key])
    if (v !== null) samples.push({ t: record.t, v })
  }
  return samples
}

const present = (value: unknown) => value !== undefined && value !== null && value !== ""

function hourlyMeans(samples: Sample[], windowStart: number) {
  const buckets = new Map<number, { sum: number; n: number }>()
  for (const s of samples) {
    const hour = Math.floor((s.t - windowStart) / HOUR)
    const bucket = buckets.get(hour) ?? { sum: 0, n: 0 }
    bucket.sum += s.v
    bucket.n += 1
    buckets.set(hour, bucket)
  }
  return [...buckets.entries()].sort((a, b) => a[0] - b[0]).map(([hour, b]) => ({ hour, v: b.sum / b.n }))
}

function correlation(xs: number[], ys: number[]): number | null {
  if (xs.length < 3) return null
  const mx = mean(xs)
  const my = mean(ys)
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
    syy += (ys[i] - my) ** 2
  }
  return sxx === 0 || syy === 0 ? null : sxy / Math.sqrt(sxx * syy)
}

const percentile = (values: number[], p: number) => {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1) + 0.5))]
}

const iso = (ms: number) => new Date(ms).toISOString()
/** "Missing readings" → "missing readings", but "PM10 sensors…" stays as it is. */
const lowerFirst = (text: string) => (/^[A-Z][a-z]/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text)

function summarise(samples: Sample[]): MetricSummary {
  const values = samples.map((s) => s.v)
  const m = mean(values)
  let min = samples[0]
  let max = samples[0]
  for (const s of samples) {
    if (s.v < min.v) min = s
    if (s.v > max.v) max = s
  }
  return {
    mean: round(m, 3),
    min: round(min.v, 3),
    max: round(max.v, 3),
    std: round(Math.sqrt(mean(values.map((v) => (v - m) ** 2))), 3),
    min_at: iso(min.t),
    max_at: iso(max.t),
    count: samples.length,
  }
}

const PENALTY: Record<IssueSeverity, number> = { LOW: 10, MEDIUM: 30, HIGH: 50, CRITICAL: 80 }

function stateFor(score: number, facts: Fact[]): LifecycleState {
  let state: LifecycleState = score >= 85 ? "HEALTHY" : score >= 70 ? "DEGRADING" : score >= 50 ? "SUSPICIOUS" : score >= 30 ? "LIKELY_FAILURE" : "FAILED"
  if (facts.some((f) => f.severity === "CRITICAL") && (state === "HEALTHY" || state === "DEGRADING" || state === "SUSPICIOUS")) state = "LIKELY_FAILURE"
  return state
}

/** Scores the readings of one window against a profile; the heart of every diagnosis here. */
function runEngine(profile: DeviceProfile, allRecords: EngineRecord[], options: EngineOptions): EngineResult {
  const { windowStart, windowEnd } = options
  const policy = policyFor(profile, options.policy)
  const disabled = new Set(policy.disabled_checks)
  const enabled = (check: DiagnosticCheckType) => !disabled.has(check)
  const records = allRecords.filter((r) => r.t >= windowStart && r.t <= windowEnd).sort((a, b) => a.t - b.t)
  const refs = metricRefs(profile)
  const components = profile.components || []
  const interval = options.intervalSeconds || configuredInterval(profile) || policy.default_interval_seconds
  const windowHours = Math.max(1, Math.round((windowEnd - windowStart) / HOUR))
  const expected = Math.max(1, Math.round((windowHours * 3600) / interval))
  const transmission =
    components.find((c) => c.component_type === "connectivity") ?? components.find((c) => c.metrics?.length) ?? components[0]
  const facts: Fact[] = []
  const observations = new Set<string>()
  const indicators: DeviceIndicators = {}
  const put = (component: string, group: string, values: IndicatorGroupValues) => {
    ;(indicators[component] ??= {})[group] = values
  }

  // Coverage
  const perHour = 3600 / interval
  const hourCounts = new Map<number, number>()
  for (const r of records) {
    const hour = Math.floor((r.t - windowStart) / HOUR)
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1)
  }
  const hoursWithData = hourCounts.size
  const hoursComplete = [...hourCounts.values()].filter((n) => n >= Math.max(1, Math.floor(perHour * 0.9))).length
  const missingRate = round(clamp(1 - records.length / expected, 0, 1), 3)
  const chargeRef = refs.find((r) => r.metric.role === "charge_level" && r.numeric) ?? null
  const chargeSamples = chargeRef ? samplesOf(records, chargeRef) : []
  const lowChargeThreshold =
    chargeRef && typeof chargeRef.metric.expected_min === "number" ? round(chargeRef.metric.expected_min + policy.low_charge_margin, 3) : null

  const gapMs = policy.outage_gap_minutes * 60 * 1000
  const outages: OutageWindow[] = []
  const chargeBefore = (t: number) => {
    let value: number | null = null
    for (const s of chargeSamples) {
      if (s.t > t) break
      value = s.v
    }
    return value
  }
  const addOutage = (start: number, end: number) => {
    const before = chargeRef ? chargeBefore(start) : null
    outages.push({
      start: iso(start),
      end: iso(end),
      hours: round((end - start) / HOUR, 1),
      after_low_charge: before === null || lowChargeThreshold === null ? null : before < lowChargeThreshold,
    })
  }
  if (records.length === 0) addOutage(windowStart, windowEnd)
  else {
    if (records[0].t - windowStart >= gapMs) addOutage(windowStart, records[0].t)
    for (let i = 1; i < records.length; i++) if (records[i].t - records[i - 1].t >= gapMs) addOutage(records[i - 1].t, records[i].t)
    if (windowEnd - records[records.length - 1].t >= gapMs) addOutage(records[records.length - 1].t, windowEnd)
  }
  const mappedSlots = refs.map((r) => r.slot)
  const partial = records.filter((r) => mappedSlots.some((slot) => !present(r.values[slot]))).length
  const counts = [...hourCounts.values()].sort((a, b) => a - b)
  const coverage: CoverageIndicator = {
    records: records.length,
    expected_records: expected,
    missing_rate: missingRate,
    expected_interval_seconds: interval,
    hours_total: windowHours,
    hours_with_data: hoursWithData,
    hours_complete: hoursComplete,
    hours_empty: Math.max(0, windowHours - hoursWithData),
    records_per_hour_median: counts.length ? counts[Math.floor(counts.length / 2)] : null,
    partial_record_rate: records.length ? round(partial / records.length, 3) : null,
    outage_count: outages.length,
    offline_hours: round(outages.reduce((sum, o) => sum + o.hours, 0), 1),
    longest_outage_hours: outages.length ? Math.max(...outages.map((o) => o.hours)) : 0,
    outages_after_low_charge: outages.filter((o) => o.after_low_charge === true).length,
    outages_with_healthy_charge: outages.filter((o) => o.after_low_charge === false).length,
    outages_unattributed: outages.filter((o) => o.after_low_charge === null).length,
    low_charge_threshold: lowChargeThreshold,
    charge_metric: chargeRef?.metric.key ?? null,
    outages,
  }
  if (transmission) put(transmission.name, "coverage", coverage as unknown as IndicatorGroupValues)

  const completeness: DataCompleteness = {
    records: records.length,
    expected_records: expected,
    missing_rate: missingRate,
    expected_interval_seconds: interval,
  }

  const metricsSummary: Record<string, MetricSummary> = {}

  if (records.length === 0) {
    if (transmission && enabled("DATA_GAPS")) {
      // Its own code, so "no data at all" streaks apart from days that merely had gaps
      const silent = makeFact(transmission, "DATA_GAPS", null, "CRITICAL", 0.97, "No data received", `No readings arrived in the ${windowHours} h window; ${expected} were expected.`, { records: 0, expected_records: expected })
      facts.push({ ...silent, code: `${silent.code}.no_data` })
    }
  } else {
    // Per-metric checks
    for (const ref of refs) {
      const { component, metric: m } = ref
      if (!ref.numeric) {
        const seen = records.some((r) => present(r.values[ref.slot] ?? r.values[m.key]))
        if (!seen && records.length >= policy.min_records && enabled("METRIC_MISSING")) {
          facts.push(makeFact(component, "METRIC_MISSING", m.key, component.criticality >= 0.25 ? "HIGH" : "MEDIUM", 0.95, `${ref.label} missing`, `${ref.label} (${ref.slot}) was absent from all ${records.length} readings.`, null))
        }
        continue
      }
      const samples = samplesOf(records, ref)
      if (samples.length === 0) {
        if (records.length >= policy.min_records && enabled("METRIC_MISSING")) {
          facts.push(makeFact(component, "METRIC_MISSING", m.key, component.criticality >= 0.25 ? "HIGH" : "MEDIUM", 0.95, `${ref.label} missing`, `${ref.label} (${ref.slot}) was absent from all ${records.length} readings.`, null))
        }
        continue
      }
      metricsSummary[ref.ref] = summarise(samples)
      const unit = m.unit ? ` ${m.unit}` : ""
      const values = samples.map((s) => s.v)
      const isCharge = m.role === "charge_level"

      const breach = (check: "METRIC_BELOW_MIN" | "METRIC_ABOVE_MAX", limit: number) => {
        const out = check === "METRIC_BELOW_MIN" ? values.filter((v) => v < limit) : values.filter((v) => v > limit)
        const fraction = out.length / values.length
        if (fraction <= policy.limit_breach_fraction || !enabled(check)) return false
        const extreme = check === "METRIC_BELOW_MIN" ? Math.min(...out) : Math.max(...out)
        const severity: IssueSeverity = isCharge
          ? fraction > 0.3 ? "HIGH" : "MEDIUM"
          : fraction > 0.5 ? "HIGH" : fraction > 0.2 ? "MEDIUM" : "LOW"
        const below = check === "METRIC_BELOW_MIN"
        facts.push(
          makeFact(
            component,
            check,
            m.key,
            severity,
            0.6 + fraction * 0.4,
            `${ref.label} ${below ? "below minimum" : "above maximum"}`,
            `${ref.label} was ${below ? "below" : "above"} ${limit}${unit} in ${Math.round(fraction * 100)}% of readings (${below ? "lowest" : "highest"} ${round(extreme, 2)}${unit}).`,
            round(extreme, 3),
          ),
        )
        return true
      }
      const lowBreach = typeof m.expected_min === "number" ? breach("METRIC_BELOW_MIN", m.expected_min) : false
      if (typeof m.expected_max === "number") breach("METRIC_ABOVE_MAX", m.expected_max)
      if (isCharge && !lowBreach && typeof m.expected_min === "number") observations.add("EVID_CHARGE_WITHIN_LIMITS")
      if (m.role === "signal_strength" && !lowBreach) observations.add("EVID_SIGNAL_OK")

      const hourly = hourlyMeans(samples, windowStart)
      if (typeof m.max_rate_of_change === "number" && m.max_rate_of_change > 0 && enabled("METRIC_RATE_EXCEEDED")) {
        let worst = 0
        for (let i = 1; i < hourly.length; i++) {
          const rate = (hourly[i].v - hourly[i - 1].v) / (hourly[i].hour - hourly[i - 1].hour)
          const relevant = isCharge ? -rate : Math.abs(rate)
          if (relevant > worst) worst = relevant
        }
        if (worst > m.max_rate_of_change) {
          facts.push(
            makeFact(component, "METRIC_RATE_EXCEEDED", m.key, "MEDIUM", 0.75, `${ref.label} changing too fast`, `${ref.label} ${isCharge ? "fell" : "changed"} by up to ${round(worst, 2)}${unit} per hour; the limit is ${m.max_rate_of_change}${unit}.`, round(worst, 3)),
          )
        }
      }

      if (samples.length >= policy.stuck_min_records && Math.max(...values) - Math.min(...values) === 0 && enabled("METRIC_STUCK")) {
        facts.push(makeFact(component, "METRIC_STUCK", m.key, "MEDIUM", 0.9, `${ref.label} stuck`, `${ref.label} reported ${values[0]}${unit} in all ${samples.length} readings.`, values[0]))
      }

      // Daily charge cycle
      if (isCharge) {
        const s = metricsSummary[ref.ref]
        const kinds: Array<{ kind: "charge" | "discharge" | "flat"; hours: number; rate: number }> = []
        for (let i = 1; i < hourly.length; i++) {
          const hours = hourly[i].hour - hourly[i - 1].hour
          const rate = (hourly[i].v - hourly[i - 1].v) / hours
          kinds.push({ kind: rate > policy.charge_flat_rate ? "charge" : rate < -policy.charge_flat_rate ? "discharge" : "flat", hours, rate })
        }
        const hoursOf = (kind: string) => round(kinds.filter((k) => k.kind === kind).reduce((sum, k) => sum + k.hours, 0), 1)
        const longest = (kind: string) => {
          let best = 0
          let run = 0
          for (const k of kinds) {
            run = k.kind === kind ? run + k.hours : 0
            best = Math.max(best, run)
          }
          return round(best, 1)
        }
        const rates = (kind: string) => kinds.filter((k) => k.kind === kind).map((k) => Math.abs(k.rate))
        let cycles = 0
        for (let i = 1; i < kinds.length; i++) if (kinds[i - 1].kind === "discharge" && kinds[i].kind === "charge") cycles++
        const sampleHours = interval / 3600
        const cycle: ChargeCycleIndicator = {
          metric: m.key,
          unit: m.unit ?? null,
          readings: samples.length,
          min: s.min ?? null,
          min_at: s.min_at ?? undefined,
          max: s.max ?? null,
          max_at: s.max_at ?? undefined,
          mean: s.mean ?? null,
          swing: round((s.max ?? 0) - (s.min ?? 0), 3),
          start: samples[0].v,
          end: samples[samples.length - 1].v,
          net_change: round(samples[samples.length - 1].v - samples[0].v, 3),
          hours_charging: hoursOf("charge"),
          hours_discharging: hoursOf("discharge"),
          hours_flat: hoursOf("flat"),
          longest_charge_hours: longest("charge"),
          longest_discharge_hours: longest("discharge"),
          cycle_count: cycles,
          charge_rate_per_hour: rates("charge").length ? round(mean(rates("charge")), 3) : null,
          discharge_rate_per_hour: rates("discharge").length ? round(mean(rates("discharge")), 3) : null,
          max_discharge_rate_per_hour: rates("discharge").length ? round(Math.max(...rates("discharge")), 3) : null,
          hours_below_min: typeof m.expected_min === "number" ? round(Math.min(windowHours, values.filter((v) => v < (m.expected_min as number)).length * sampleHours), 1) : null,
          hours_above_max: typeof m.expected_max === "number" ? round(Math.min(windowHours, values.filter((v) => v > (m.expected_max as number)).length * sampleHours), 1) : null,
          low_charge_threshold: lowChargeThreshold,
          hours_low_charge: lowChargeThreshold === null ? null : round(Math.min(windowHours, values.filter((v) => v < lowChargeThreshold).length * sampleHours), 1),
          expected_min: m.expected_min ?? null,
          expected_max: m.expected_max ?? null,
        }
        put(component.name, "charge_cycle", cycle as unknown as IndicatorGroupValues)
      }

      if (m.role === "charge_source") {
        const peak = samples.reduce((best, sample) => (sample.v > best.v ? sample : best), samples[0])
        put(component.name, "generation", {
          metric: m.key,
          unit: m.unit ?? null,
          readings: samples.length,
          peak: peak.v,
          peak_at: iso(peak.t),
          mean: round(mean(values), 3),
          hours_active: hourly.filter((h) => h.v > (m.expected_min ?? 0)).length,
        })
      }
    }

    // Paired sensors
    let anyPair = false
    let allAgree = true
    for (const relationship of profile.relationships || []) {
      if (relationType(relationship) !== "MEASURES_SAME_AS") continue
      const ends = relationEnds(profile, relationship)
      if (!ends) continue
      const [a, b] = ends
      const tolerance = relationship.meta_data?.tolerance ?? null
      const tolAbs = typeof tolerance?.absolute === "number" ? tolerance.absolute : null
      const tolRel = typeof tolerance?.relative === "number" ? tolerance.relative : null
      pairMetrics(refs, a, b).forEach(([left, right], index) => {
        const xs: number[] = []
        const ys: number[] = []
        for (const record of records) {
          const x = numberOf(record.values[left.slot])
          const y = numberOf(record.values[right.slot])
          if (x !== null && y !== null) {
            xs.push(x)
            ys.push(y)
          }
        }
        if (xs.length < policy.min_records) return
        anyPair = true
        const diffs = xs.map((x, i) => x - ys[i])
        const absDiffs = diffs.map(Math.abs)
        const level = mean(xs.map((x, i) => (x + ys[i]) / 2))
        const mae = mean(absDiffs)
        const bias = mean(diffs)
        const r = correlation(xs, ys)
        const hasTolerance = tolAbs !== null || tolRel !== null
        const within = hasTolerance
          ? xs.filter((x, i) => Math.abs(x - ys[i]) <= Math.max(tolAbs ?? 0, (tolRel ?? 0) * ((x + ys[i]) / 2))).length / xs.length
          : null
        const agreement: AgreementIndicator = {
          with: b.name,
          metric: left.metric.key,
          other_metric: right.metric.key,
          paired_count: xs.length,
          correlation: r === null ? null : round(r, 3),
          mean_abs_error: round(mae, 3),
          p95_abs_error: round(percentile(absDiffs, 0.95), 3),
          bias: round(bias, 3),
          relative_error: level ? round(mae / level, 3) : null,
          mean_level: round(level, 3),
          relative_bias: level ? round(bias / level, 3) : null,
          tolerance_abs: tolAbs,
          tolerance_rel: tolRel,
          within_tolerance_rate: within === null ? null : round(within, 3),
        }
        if (index === 0) put(a.name, `agreement:${b.name}`, agreement as unknown as IndicatorGroupValues)
        const subject = humanizeMetric(baseKey(left.metric.key)) || left.label
        if (r !== null && r < policy.correlation_min && enabled("SENSOR_DISAGREEMENT")) {
          allAgree = false
          facts.push(
            makeFact(a, "SENSOR_DISAGREEMENT", left.metric.key, "HIGH", 0.85, `${subject} sensors disagree`, `${left.ref} and ${right.ref} stopped tracking each other (correlation ${round(r, 2)}).`, round(r, 3), [b.name]),
          )
        } else if (within !== null && within < policy.agreement_min_within_rate && enabled("SENSOR_ERROR_MARGIN")) {
          allAgree = false
          facts.push(
            makeFact(
              a,
              "SENSOR_ERROR_MARGIN",
              left.metric.key,
              within < 0.5 ? "HIGH" : "MEDIUM",
              0.6 + (policy.agreement_min_within_rate - within) * 0.5,
              `${subject} sensors outside tolerance`,
              `${left.ref} and ${right.ref} agreed within tolerance in ${Math.round(within * 100)}% of ${xs.length} paired readings (mean difference ${round(mae, 2)}${left.metric.unit ? ` ${left.metric.unit}` : ""}).`,
              round(within, 3),
              [b.name],
            ),
          )
        } else if (r !== null && r < policy.correlation_min) {
          allAgree = false
        }
      })
    }
    if (anyPair && allAgree) observations.add("EVID_SENSORS_IN_AGREEMENT")

    // Data gaps and low-charge outages
    if (transmission && missingRate > policy.missing_rate_threshold && enabled("DATA_GAPS")) {
      const severity: IssueSeverity = missingRate > 0.6 ? "HIGH" : missingRate > 0.35 ? "MEDIUM" : "LOW"
      facts.push(
        makeFact(transmission, "DATA_GAPS", null, severity, 0.6 + missingRate * 0.4, "Missing readings", `${records.length} of ~${expected} expected readings arrived (${Math.round(missingRate * 100)}% missing) across ${hoursWithData} of ${windowHours} hours.`, missingRate),
      )
    } else if (missingRate <= policy.missing_rate_threshold) {
      observations.add("EVID_DATA_COMPLETE")
    }
    const lowChargeOutages = outages.filter((o) => o.after_low_charge === true)
    if (chargeRef && lowChargeOutages.length > 0 && enabled("LOW_CHARGE_OUTAGE")) {
      facts.push(
        makeFact(chargeRef.component, "LOW_CHARGE_OUTAGE", chargeRef.metric.key, "HIGH", 0.8, "Outage after low charge", `${lowChargeOutages.length} outage${lowChargeOutages.length === 1 ? "" : "s"} began with ${chargeRef.label.toLowerCase()} below ${lowChargeThreshold}${chargeRef.metric.unit ? ` ${chargeRef.metric.unit}` : ""}.`, lowChargeOutages.length, transmission ? [transmission.name] : []),
      )
    }
  }

  // Scores
  const scores: Record<string, number> = {}
  if (records.length === 0) {
    if (transmission) scores[transmission.name] = 0
  } else {
    for (const component of components) scores[component.name] = 100
    for (const f of facts) {
      const penalty = PENALTY[f.severity] * Math.max(0.5, f.confidence)
      scores[f.component_name] = (scores[f.component_name] ?? 100) - penalty
      for (const other of f.related_components || []) if (other in scores) scores[other] -= penalty / 2
    }
    for (const name of Object.keys(scores)) scores[name] = Math.round(clamp(scores[name], 0, 100))
  }
  let score = 0
  if (records.length > 0 && components.length > 0) {
    const weights = components.map((c) => Math.max(0.05, Number(c.criticality) || 0.5))
    const weighted = components.reduce((sum, c, i) => sum + weights[i] * scores[c.name], 0) / weights.reduce((a, b) => a + b, 0)
    const lowest = Math.min(...components.map((c) => scores[c.name]))
    score = Math.round(0.6 * weighted + 0.4 * lowest)
  }
  const state: LifecycleState = records.length === 0 ? "NO_DATA" : stateFor(score, facts)

  const { symptoms, diagnoses } = diagnose(profile, facts, observations)

  const top = diagnoses[0]
  const headline =
    records.length === 0
      ? "No data received"
      : facts.length === 0
        ? "All checks passed"
        : `${top ? causeTitle(top) : facts[0].title}${facts.length > 1 ? ` and ${facts.length - 1} more issue${facts.length === 2 ? "" : "s"}` : ""}`
  const summary =
    records.length === 0
      ? `No readings arrived in the ${windowHours} hours evaluated, so nothing else could be checked.`
      : `${records.length} readings over ${hoursWithData} of ${windowHours} hours (${Math.round((1 - missingRate) * 100)}% of expected). ` +
        (facts.length === 0
          ? "Every check passed."
          : `Found ${facts.map((f) => lowerFirst(f.title || f.check)).join("; ")}.${top ? ` Most likely cause: ${lowerFirst(causeTitle(top))} (${Math.round(top.confidence_percentage)}%).` : ""}`)

  return {
    recordCount: records.length,
    hoursWithData,
    firstRecordAt: records.length ? iso(records[0].t) : null,
    lastRecordAt: records.length ? iso(records[records.length - 1].t) : null,
    score,
    state,
    subsystemScores: scores,
    facts: facts.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.confidence - a.confidence),
    symptoms,
    diagnoses,
    indicators,
    completeness,
    metricsSummary,
    headline,
    summary,
  }
}

const CATEGORY_BY_TYPE: Record<string, string> = {
  battery: "RESOURCE_DEPLETION",
  power: "RESOURCE_DEPLETION",
  solar: "RESOURCE_DEPLETION",
  connectivity: "CONNECTIVITY",
  sensor: "HARDWARE_FAILURE",
}

function symptomChecks(s: TemplateSymptom): string[] {
  const logic = s.evaluation_logic
  if (typeof logic === "string") return [logic]
  if (logic && typeof logic === "object") {
    if (Array.isArray(logic.checks)) return logic.checks.map(String)
    if (typeof logic.check === "string") return [logic.check]
  }
  return []
}

/**
 * Likely causes, per component with evidence: the best-scoring cause among the templates for that
 * component's type (rules match symptom codes, evidence codes, check types or EVID_* observations),
 * else a generic component fault. A component that powers another with evidence explains it.
 */
function diagnose(profile: DeviceProfile, facts: Fact[], observations: Set<string>): { symptoms: string[]; diagnoses: DiagnosisResult[] } {
  const symptoms = new Set<string>()
  const results: DiagnosisResult[] = []
  const byComponent = new Map<string, Fact[]>()
  for (const f of facts) byComponent.set(f.component_name, [...(byComponent.get(f.component_name) ?? []), f])

  for (const [name, componentFacts] of byComponent) {
    const component = (profile.components || []).find((c) => c.name === name)
    const type = component?.component_type ?? componentFacts[0].component_type ?? "other"
    const severity = worstSeverity(componentFacts.map((f) => f.severity)) ?? "LOW"
    const templates = store.templates.filter(
      (t) =>
        (t.target_component_type || t.category) === type &&
        (!t.target_profile_categories?.length || t.target_profile_categories.includes(profile.category)),
    )
    const detected = new Set<string>()
    const symptomNames = new Map<string, string>()
    for (const t of templates) {
      for (const s of t.symptoms || []) {
        const checks = symptomChecks(s)
        if (componentFacts.some((f) => checks.includes(f.check))) {
          detected.add(s.code)
          symptoms.add(s.code)
          symptomNames.set(s.code, s.name)
        }
      }
    }
    const hits = (code: string) => {
      const wanted = code.trim().toUpperCase()
      return (
        detected.has(wanted) ||
        observations.has(wanted) ||
        componentFacts.some((f) => f.code.toUpperCase() === wanted || f.check === wanted)
      )
    }

    let best: { c: TemplateCause; score: number; supporting: HypothesisRule[]; refuting: HypothesisRule[] } | null = null
    for (const t of templates) {
      for (const c of t.causes || []) {
        const rules = c.hypothesis_rules?.length ? c.hypothesis_rules : c.rules || []
        let score = 0
        let missingMandatory = false
        const supporting: HypothesisRule[] = []
        const refuting: HypothesisRule[] = []
        for (const r of rules) {
          if (!hits(r.evidence_code || "")) {
            if (r.is_mandatory) missingMandatory = true
            continue
          }
          score += Number(r.weight) || 0
          ;(Number(r.weight) >= 0 ? supporting : refuting).push(r)
        }
        if (missingMandatory || score <= 0 || supporting.length === 0) continue
        if (!best || score > best.score) best = { c, score, supporting, refuting }
      }
    }

    if (best) {
      const positive = best.supporting.reduce((sum, r) => sum + Number(r.weight), 0) || 1
      const negative = best.refuting.reduce((sum, r) => sum + Math.abs(Number(r.weight)), 0) || 1
      const describe = (r: HypothesisRule) => r.description || symptomNames.get(r.evidence_code) || r.evidence_code
      results.push({
        cause_code: `${best.c.code || best.c.cause_code || "CAUSE_UNSPECIFIED"}:${name}`,
        title: best.c.title,
        component_name: name,
        affected_components: [...new Set(componentFacts.flatMap((f) => f.related_components || []))],
        category: best.c.category,
        confidence_percentage: round(clamp(100 * (1 - Math.exp(-best.score / 4)), 5, 97), 1),
        supporting_evidence: best.supporting.map((r) => ({ evidence: r.evidence_code, contribution: round(Number(r.weight) / positive, 2), description: describe(r) })),
        refuting_evidence: best.refuting.map((r) => ({ evidence: r.evidence_code, contribution: round(Math.abs(Number(r.weight)) / negative, 2), description: describe(r) })),
        recommended_action: best.c.recommended_action,
        severity,
      })
    } else {
      const supporting: EvidenceContribution[] = componentFacts.map((f) => ({
        evidence: f.code,
        contribution: round(1 / componentFacts.length, 2),
        description: f.description,
      }))
      results.push({
        cause_code: `COMPONENT_FAULT:${name}`,
        title: `${name} (${type}) fault`,
        component_name: name,
        affected_components: [...new Set(componentFacts.flatMap((f) => f.related_components || []))],
        category: CATEGORY_BY_TYPE[type] ?? "HARDWARE_FAILURE",
        confidence_percentage: Math.min(70, 35 + 10 * componentFacts.length),
        supporting_evidence: supporting,
        refuting_evidence: [],
        recommended_action: `Inspect ${name} (${type}): ${componentFacts.map((f) => lowerFirst(f.title || f.check)).join(", ")}.`,
        severity,
      })
    }
  }

  // A component that powers another explains that one's issues when its charge ran low
  for (const relationship of profile.relationships || []) {
    if (relationType(relationship) !== "POWERS") continue
    const ends = relationEnds(profile, relationship)
    if (!ends) continue
    const upstream = results.find((d) => d.component_name === ends[0].name)
    const downstream = results.find((d) => d.component_name === ends[1].name)
    const powerRelated = (byComponent.get(ends[0].name) ?? []).some((f) => f.check === "LOW_CHARGE_OUTAGE" || f.check === "METRIC_BELOW_MIN")
    if (!upstream || !downstream || !powerRelated) continue
    upstream.affected_components = [...new Set([...(upstream.affected_components || []), ends[1].name])]
    downstream.confidence_percentage = round(downstream.confidence_percentage * 0.6, 1)
  }

  results.sort(
    (a, b) => severityRank(b.severity) * 25 + b.confidence_percentage - (severityRank(a.severity) * 25 + a.confidence_percentage),
  )
  return { symptoms: [...symptoms], diagnoses: results.slice(0, 4) }
}

// ─── Daily diagnoses ────────────────────────────────────────────────────────

interface DayCore {
  device: DemoDevice
  date: string
  profile: DeviceProfile
  result: EngineResult
  state: LifecycleState
  codes: Set<string>
}

function earliestDay(device: DemoDevice): string {
  const history = shiftDay(todayUtc(), -HISTORY_DAYS)
  const deployed = device.deploymentDate ? isoDay(Date.parse(device.deploymentDate)) : history
  return deployed > history ? deployed : history
}

/** The engine's verdict on one completed UTC day, before streaks; null when the day isn't diagnosed. */
function baseCore(device: DemoDevice, date: string): DayCore | null {
  freshCache()
  const key = `${device._id}|${date}`
  if (cache.cores.has(key)) return cache.cores.get(key) ?? null
  let core: DayCore | null = null
  const profile = profileFor(device)
  if (device.status === "deployed" && date <= yesterdayUtc() && date >= earliestDay(device) && profile && readinessOf(profile).diagnosable) {
    const start = dayStartMs(date)
    const result = runEngine(profile, deviceRecords(device, start, start + DAY - 1), { windowStart: start, windowEnd: start + DAY - 1 })
    core = { device, date, profile, result, state: result.state, codes: new Set(result.facts.map((f) => f.code)) }
  }
  cache.cores.set(key, core)
  return core
}

/** The diagnosed day before `date`, allowing a gap of up to 3 undiagnosed days. */
function previousCore(device: DemoDevice, date: string): DayCore | null {
  for (let back = 1; back <= 4; back++) {
    const core = baseCore(device, shiftDay(date, -back))
    if (core) return core
  }
  return null
}

/** A day's core with RECOVERING applied: a fair day right after a failing one. */
function dayCore(device: DemoDevice, date: string): DayCore | null {
  const core = baseCore(device, date)
  if (!core) return null
  if (core.result.state === "HEALTHY" || core.result.state === "DEGRADING") {
    const previous = previousCore(device, date)
    if (previous && previous.result.score < 50) core.state = "RECOVERING"
  }
  return core
}

/** How many diagnosed days in a row an issue has been found, ending on `date`. */
function streakOf(device: DemoDevice, date: string, code: string): { days: number; start: string } | null {
  const key = `${device._id}|${date}|${code}`
  if (cache.streaks.has(key)) return cache.streaks.get(key) ?? null
  const core = baseCore(device, date)
  let streak: { days: number; start: string } | null = null
  if (core && core.codes.has(code)) {
    const previous = previousCore(device, date)
    const before = previous ? streakOf(device, previous.date, code) : null
    streak = before ? { days: before.days + 1, start: before.start } : { days: 1, start: date }
  }
  cache.streaks.set(key, streak)
  return streak
}

function dailyIssues(core: DayCore): DailyIssue[] {
  return core.result.facts.map((f) => {
    const streak = streakOf(core.device, core.date, f.code) ?? { days: 1, start: core.date }
    return {
      issue_code: f.code,
      check_type: f.check,
      component_name: f.component_name,
      metric_key: f.metric ?? null,
      title: f.title || f.check,
      subsystem: f.component_type || "other",
      severity: f.severity,
      confidence: f.confidence,
      description: f.description,
      value: f.value,
      is_new: streak.days === 1,
      streak_days: streak.days,
      streak_start_date: streak.start,
    }
  })
}

const evaluatedAt = (core: DayCore) => {
  const rerun = store.reruns.get(`${core.device._id}|${core.date}`)
  if (rerun) return rerun
  const nightly = dayStartMs(core.date) + DAY + (2 * 60 + 10 + (Number.parseInt(core.device._id.slice(-4), 16) % 40)) * 60 * 1000
  return iso(Math.min(nightly, Date.now()))
}

function daySummary(core: DayCore): DeviceDailyDiagnosticSummary {
  const issues = dailyIssues(core)
  const previous = previousCore(core.device, core.date)
  const resolved = previous ? [...previous.codes].filter((code) => !core.codes.has(code)) : []
  return {
    id: uuidFrom(`daily-${core.device._id}-${core.date}`),
    device_id: core.device._id,
    channel_id: String(channelOf(core.device)),
    diagnosis_date: core.date,
    record_count: core.result.recordCount,
    hours_with_data: core.result.hoursWithData,
    overall_health_score: core.result.score,
    lifecycle_state: core.state,
    headline: core.result.headline,
    subsystem_scores: core.result.subsystemScores,
    top_cause_code: core.result.diagnoses[0]?.cause_code ?? null,
    issue_count: issues.length,
    max_severity: worstSeverity(issues.map((i) => i.severity)),
    resolved_issue_codes: resolved,
    engine_version: ENGINE_VERSION,
    evaluated_at: evaluatedAt(core),
    issues,
  }
}

/** Series point: a day's indicator values without the per-day outage list. */
const seriesValues = (values: IndicatorGroupValues, date: string): IndicatorSeriesPoint<IndicatorGroupValues> => {
  const { outages: _outages, ...rest } = values
  return { ...rest, diagnosis_date: date }
}

function dayDetail(core: DayCore): DeviceDailyDiagnostic {
  return {
    ...daySummary(core),
    profile_id: core.profile.id,
    first_record_at: core.result.firstRecordAt,
    last_record_at: core.result.lastRecordAt,
    active_evidences: core.result.facts,
    detected_symptoms: core.result.symptoms,
    top_diagnoses: core.result.diagnoses,
    metrics_summary: core.result.metricsSummary,
    indicators: core.result.indicators,
    trends: trendsFor(core.device, core.date, 14).trends,
    summary: core.result.summary,
  }
}

/** The diagnosed days of a device between two dates, oldest first. */
function coresBetween(device: DemoDevice, start: string, end: string): DayCore[] {
  const first = start < earliestDay(device) ? earliestDay(device) : start
  const last = end > yesterdayUtc() ? yesterdayUtc() : end
  if (first > last) return []
  return daysBetween(first, last)
    .map((day) => dayCore(device, day))
    .filter((core): core is DayCore => core !== null)
}

const latestCore = (device: DemoDevice, withinDays = 7): DayCore | null => {
  for (let back = 1; back <= withinDays; back++) {
    const core = dayCore(device, shiftDay(todayUtc(), -back))
    if (core) return core
  }
  return null
}

// ─── Trends ─────────────────────────────────────────────────────────────────

interface TrendSeries {
  component: string
  group: string
  field: string
  subject: string
  unit: string | null
  bad: "up" | "down"
  limit: number | null
  floor: number
  points: Array<{ date: string; value: number }>
}

function trendsFor(device: DemoDevice, asOf: string | null, windowDays: number): DeviceTrends {
  const minDays = Math.min(7, windowDays)
  const end = asOf ?? latestCore(device, HISTORY_DAYS)?.date ?? null
  if (!end) return { device_id: device._id, as_of: null, window_days: windowDays, min_days: minDays, degrading_count: 0, improving_count: 0, trends: [] }
  const cores = coresBetween(device, shiftDay(end, -(windowDays - 1)), end)
  const series = new Map<string, TrendSeries>()
  const track = (core: DayCore, base: Omit<TrendSeries, "points">, value: unknown) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return
    const key = `${base.component}|${base.group}|${base.field}`
    const entry = series.get(key) ?? { ...base, points: [] }
    entry.points.push({ date: core.date, value })
    series.set(key, entry)
  }
  for (const core of cores) {
    const policy = policyFor(core.profile)
    for (const [component, groups] of Object.entries(core.result.indicators)) {
      for (const [group, values] of Object.entries(groups)) {
        if (group === "charge_cycle") {
          track(core, { component, group, field: "min", subject: `${humanizeMetric(String(values.metric))} daily minimum`, unit: values.unit ?? null, bad: "down", limit: values.expected_min ?? null, floor: 0.1 }, values.min)
        } else if (group === "coverage" && core.result.recordCount > 0) {
          track(core, { component, group, field: "missing_rate", subject: "Share of readings missing", unit: null, bad: "up", limit: policy.missing_rate_threshold, floor: 0.1 }, values.missing_rate)
        } else if (group.startsWith("agreement:")) {
          track(core, { component, group, field: "mean_abs_error", subject: `${humanizeMetric(baseKey(String(values.metric)))} difference between ${humanizeComponent(component).toLowerCase()} and ${humanizeComponent(String(values.with)).toLowerCase()}`, unit: null, bad: "up", limit: null, floor: 1 }, values.mean_abs_error)
        }
      }
    }
  }

  const trends: IndicatorTrend[] = []
  for (const s of series.values()) {
    if (s.points.length < minDays) continue
    const origin = dayStartMs(s.points[0].date)
    const xs = s.points.map((p) => (dayStartMs(p.date) - origin) / DAY)
    const ys = s.points.map((p) => p.value)
    const mx = mean(xs)
    const my = mean(ys)
    let sxy = 0
    let sxx = 0
    let syy = 0
    for (let i = 0; i < xs.length; i++) {
      sxy += (xs[i] - mx) * (ys[i] - my)
      sxx += (xs[i] - mx) ** 2
      syy += (ys[i] - my) ** 2
    }
    const slope = sxx ? sxy / sxx : 0
    const r2 = sxx && syy ? (sxy * sxy) / (sxx * syy) : 0
    const change = slope * (xs[xs.length - 1] - xs[0])
    const fraction = change / Math.max(Math.abs(my), s.floor)
    const direction: IndicatorTrend["direction"] = Math.abs(fraction) < 0.05 ? "flat" : change > 0 ? "up" : "down"
    const strong = r2 >= 0.4 && Math.abs(fraction) >= 0.1
    const status: IndicatorTrend["status"] = strong && direction === s.bad ? "degrading" : strong && direction !== "flat" ? "improving" : "stable"
    const latest = ys[ys.length - 1]
    const toLimit = status === "degrading" && s.limit !== null && slope !== 0 ? (s.limit - latest) / slope : null
    trends.push({
      component: s.component,
      group: s.group,
      field: s.field,
      subject: s.subject,
      title: `${s.subject} ${s.bad === "down" ? "falling" : "rising"}`,
      unit: s.unit,
      status,
      direction,
      window_days: windowDays,
      points: s.points.length,
      first_date: s.points[0].date,
      last_date: s.points[s.points.length - 1].date,
      first_value: round(ys[0], 3),
      latest: round(latest, 3),
      mean: round(my, 3),
      slope_per_day: round(slope, 4),
      change: round(change, 3),
      change_fraction: round(fraction, 3),
      r_squared: round(r2, 3),
      limit: s.limit,
      days_to_limit: toLimit !== null && toLimit > 0 ? round(toLimit, 1) : null,
    })
  }
  const order = { degrading: 0, improving: 1, stable: 2 }
  trends.sort((a, b) => order[a.status] - order[b.status] || Math.abs(b.change_fraction) - Math.abs(a.change_fraction))
  return {
    device_id: device._id,
    as_of: end,
    window_days: windowDays,
    min_days: minDays,
    degrading_count: trends.filter((t) => t.status === "degrading").length,
    improving_count: trends.filter((t) => t.status === "improving").length,
    trends,
  }
}

// ─── List roll-ups (used by the device, cohort, site and grid lists) ─────────

const compareIssues = (a: DailyIssue, b: DailyIssue) =>
  severityRank(b.severity) - severityRank(a.severity) || b.streak_days - a.streak_days || a.title.localeCompare(b.title)

/** A device's most recent stored daily diagnosis from the last 7 days, or null. */
export function latestDeviceDiagnostics(device: DemoDevice): DeviceDiagnostics | null {
  const core = latestCore(device)
  if (!core) return null
  const day = daySummary(core)
  const issues: DeviceDiagnosticsIssue[] = [...day.issues]
    .sort(compareIssues)
    .slice(0, 3)
    .map((issue) => ({
      issue_code: issue.issue_code,
      title: issue.title,
      severity: issue.severity,
      subsystem: issue.subsystem,
      component_name: issue.component_name ?? null,
      streak_days: issue.streak_days,
      is_new: issue.is_new,
    }))
  return {
    diagnosis_date: day.diagnosis_date,
    overall_health_score: day.overall_health_score,
    lifecycle_state: day.lifecycle_state,
    issue_count: day.issue_count,
    max_severity: day.max_severity ?? null,
    top_cause_code: day.top_cause_code ?? null,
    headline: day.headline ?? null,
    issues,
  }
}

/** Roll-up of the latest diagnoses of a set of devices (a site, grid or cohort). */
export function summarizeDiagnostics(devices: DemoDevice[]): DiagnosticsSummary {
  const latest = devices.map((device) => {
    const core = latestCore(device)
    return core ? daySummary(core) : null
  })
  const diagnosed = latest.filter((day): day is DeviceDailyDiagnosticSummary => day !== null)
  const scored = diagnosed.filter((day) => day.lifecycle_state !== "NO_DATA").map((day) => day.overall_health_score)
  const states: Partial<Record<LifecycleState, number>> = {}
  for (const day of diagnosed) states[day.lifecycle_state] = (states[day.lifecycle_state] ?? 0) + 1
  const issues = new Map<string, DiagnosticsSummaryIssue>()
  for (const day of diagnosed) {
    for (const issue of day.issues) {
      const entry = issues.get(issue.issue_code) ?? { issue_code: issue.issue_code, title: issue.title, severity: issue.severity, subsystem: issue.subsystem, device_count: 0 }
      entry.device_count += 1
      if (severityRank(issue.severity) > severityRank(entry.severity)) entry.severity = issue.severity
      issues.set(issue.issue_code, entry)
    }
  }
  return {
    devices_total: devices.length,
    devices_diagnosed: diagnosed.length,
    devices_not_diagnosed: devices.length - diagnosed.length,
    devices_with_issues: diagnosed.filter((day) => day.issue_count > 0).length,
    average_health_score: scored.length ? round(mean(scored), 1) : null,
    min_health_score: scored.length ? Math.min(...scored) : null,
    lifecycle_state_counts: states,
    max_severity: worstSeverity(diagnosed.map((day) => day.max_severity)),
    latest_diagnosis_date: diagnosed.reduce<string | null>((max, day) => (!max || day.diagnosis_date > max ? day.diagnosis_date : max), null),
    top_issues: [...issues.values()]
      .sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.device_count - a.device_count || a.title.localeCompare(b.title))
      .slice(0, 5),
  }
}

// ─── Evaluations and snapshots ──────────────────────────────────────────────

interface Evaluation {
  result: DiagnosticEvaluationResult
}

function toEvaluation(
  deviceId: string,
  profile: DeviceProfile,
  engine: EngineResult,
  windowHours: number,
  timestamp: string,
  context: Record<string, unknown>,
): DiagnosticEvaluationResult {
  return {
    device_id: deviceId,
    profile_id: profile.id,
    profile_name: profile.name,
    overall_health_score: engine.score,
    lifecycle_state: engine.state,
    subsystem_scores: engine.subsystemScores,
    active_evidences: engine.facts,
    detected_symptoms: engine.symptoms,
    top_diagnoses: engine.diagnoses,
    indicators: engine.indicators,
    headline: engine.headline,
    summary: engine.summary,
    data_completeness: engine.completeness,
    profile_warnings: readinessOf(profile).warnings,
    evaluated_window_hours: windowHours,
    timestamp,
    context,
  }
}

/** Evaluates a fleet device's last `windowHours` of readings ending at `endMs`; a 422 result when its profile can't. */
function evaluateDevice(device: DemoDevice, windowHours: number, endMs: number, context: Record<string, unknown> = {}): Evaluation | MockResult {
  freshCache()
  const profile = profileFor(device)
  if (!profile) {
    return detail(422, {
      message: `No device profile matches ${device.name}.`,
      errors: [`No profile lists the "${device.network}" manufacturer or is named after the "${device.category}" category. Register one under Device Profiles.`],
      warnings: [],
    })
  }
  const readiness = readinessOf(profile)
  if (!readiness.diagnosable) {
    return detail(422, { message: `The ${profile.name} profile can't drive a diagnosis yet.`, errors: readiness.errors, warnings: readiness.warnings })
  }
  const start = endMs - windowHours * HOUR
  const engine = runEngine(profile, deviceRecords(device, start, endMs), {
    windowStart: start,
    windowEnd: endMs,
    intervalSeconds: numberOf(context.expected_interval_seconds),
    policy: (context.policy as Record<string, unknown>) ?? null,
  })
  return {
    result: toEvaluation(device._id, profile, engine, windowHours, iso(endMs), {
      ...context,
      device_name: device.name,
      category: device.category,
      network: device.network,
    }),
  }
}

const isEvaluation = (value: Evaluation | MockResult): value is Evaluation => "result" in value

const snapshotFrom = (device: DemoDevice, evaluation: DiagnosticEvaluationResult, id: string): DeviceHealthSnapshot => ({
  id,
  device_id: device._id,
  device_name: device.name,
  category: device.category,
  timestamp: evaluation.timestamp,
  overall_health_score: evaluation.overall_health_score,
  lifecycle_state: evaluation.lifecycle_state,
  subsystem_scores: evaluation.subsystem_scores,
  active_evidences: evaluation.active_evidences,
  detected_symptoms: evaluation.detected_symptoms,
  top_diagnoses: evaluation.top_diagnoses,
  evaluated_window_hours: evaluation.evaluated_window_hours,
  is_simulated: false,
})

/** Saved on-demand evaluations, newest first; most deployed devices start with a few from earlier days. */
function snapshotsOf(device: DemoDevice): DeviceHealthSnapshot[] {
  let list = store.snapshots.get(device._id)
  if (!list) {
    list = []
    if (device.status === "deployed" && noise(`${device._id}-snapshot`) < 0.7) {
      const latestEnd = Date.now() - (2 + Math.floor(noise(`${device._id}-snapshot-age`) * 30)) * HOUR
      for (const [index, daysBack] of [0, 3, 8].entries()) {
        const end = Math.floor((latestEnd - daysBack * DAY) / 60000) * 60000
        const evaluation = evaluateDevice(device, 24, end)
        if (isEvaluation(evaluation)) list.push(snapshotFrom(device, evaluation.result, uuidFrom(`snapshot-${device._id}-${index}`)))
      }
    }
    store.snapshots.set(device._id, list)
  }
  return list
}

// ─── Fleet ──────────────────────────────────────────────────────────────────

function groupDevices(group: string | null): DemoDevice[] {
  const titles = (group || "").split(",").map((g) => g.trim()).filter(Boolean)
  if (titles.length <= 1) return devicesForGroup(titles[0] ?? null)
  const ids = new Set(titles.flatMap((title) => devicesForGroup(title).map((d) => d._id)))
  return DEVICES.filter((d) => ids.has(d._id))
}

/** The newest day on or before yesterday that any of the devices was diagnosed. */
function latestFleetDay(devices: DemoDevice[]): string | null {
  for (let back = 1; back <= RAW_RETENTION_DAYS; back++) {
    const day = shiftDay(todayUtc(), -back)
    if (devices.some((d) => dayCore(d, day))) return day
  }
  return null
}

const fleetDay = (devices: DemoDevice[], day: string) =>
  devices
    .map((device) => dayCore(device, day))
    .filter((core): core is DayCore => core !== null)
    .map((core) => ({ core, summary: daySummary(core) }))

function fleetSummary(devices: DemoDevice[], day: string | null, topN: number): FleetDailySummary {
  const entries = day ? fleetDay(devices, day) : []
  const states: Partial<Record<LifecycleState, number>> = {}
  const severities: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0 }
  const topIssues = new Map<string, FleetTopIssue>()
  let newIssues = 0
  let resolved = 0
  for (const { summary } of entries) {
    states[summary.lifecycle_state] = (states[summary.lifecycle_state] ?? 0) + 1
    severities[summary.max_severity ?? "NONE"] += 1
    resolved += summary.resolved_issue_codes?.length ?? 0
    for (const issue of summary.issues) {
      if (issue.is_new) newIssues += 1
      const entry = topIssues.get(issue.issue_code) ?? {
        issue_code: issue.issue_code,
        check_type: issue.check_type,
        component_name: issue.component_name ?? null,
        title: issue.title,
        subsystem: issue.subsystem,
        severity: issue.severity,
        device_count: 0,
        new_device_count: 0,
      }
      entry.device_count += 1
      if (issue.is_new) entry.new_device_count += 1
      if (severityRank(issue.severity) > severityRank(entry.severity)) entry.severity = issue.severity
      topIssues.set(issue.issue_code, entry)
    }
  }
  const scored = entries.filter((e) => e.summary.lifecycle_state !== "NO_DATA").map((e) => e.summary.overall_health_score)
  const worst: FleetDeviceHealth[] = [...entries]
    .sort((a, b) => a.summary.overall_health_score - b.summary.overall_health_score || b.summary.issue_count - a.summary.issue_count || a.core.device.name.localeCompare(b.core.device.name))
    .slice(0, topN)
    .map(({ core, summary }) => ({
      device_id: core.device._id,
      device_name: core.device.name,
      overall_health_score: summary.overall_health_score,
      lifecycle_state: summary.lifecycle_state,
      issue_count: summary.issue_count,
      max_severity: summary.max_severity ?? null,
      top_cause_code: summary.top_cause_code ?? null,
      headline: summary.headline ?? null,
    }))
  return {
    diagnosis_date: day,
    devices_diagnosed: entries.length,
    devices_with_issues: entries.filter((e) => e.summary.issue_count > 0).length,
    average_health_score: scored.length ? round(mean(scored), 1) : null,
    lifecycle_state_counts: states,
    max_severity_counts: severities,
    new_issue_count: newIssues,
    resolved_issue_count: resolved,
    top_issues: [...topIssues.values()]
      .sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.device_count - a.device_count || a.title.localeCompare(b.title))
      .slice(0, topN),
    worst_devices: worst,
  }
}

// ─── Input normalisation for edits ──────────────────────────────────────────

function normalizeProfile(input: Record<string, any>, base: DeviceProfile | null): DeviceProfile {
  const id = base?.id ?? newId("profile")
  const merged: Record<string, any> = { ...(base ? clone(base) : {}), ...input, id }
  const components: ComponentDefinition[] = (Array.isArray(merged.components) ? merged.components : []).map((c: any) => {
    const componentId = c.id || newId("component")
    return {
      ...c,
      id: componentId,
      profile_id: id,
      name: String(c.name ?? "").trim() || `component_${componentId.slice(0, 4)}`,
      component_type: c.component_type || "other",
      criticality: numberOf(c.criticality) ?? 0.5,
      metrics: (Array.isArray(c.metrics) ? c.metrics : []).map((m: any) => ({ ...m, id: m.id || newId("metric"), component_id: componentId })),
    }
  })
  const byRef = (id?: string, name?: string) => components.find((c) => (id && c.id === id) || (name && c.name === name))
  const relationships: ComponentRelationship[] = (Array.isArray(merged.relationships) ? merged.relationships : []).map((r: any) => {
    const source = byRef(r.source_component_id, r.source_component ?? r.source_component_name)
    const target = byRef(r.target_component_id, r.target_component ?? r.target_component_name)
    const type = r.relationship_type || r.relation_type || "POWERS"
    return {
      ...r,
      id: r.id || newId("relationship"),
      profile_id: id,
      source_component: source?.name ?? r.source_component,
      source_component_id: source?.id ?? r.source_component_id,
      source_component_name: source?.name ?? r.source_component_name,
      target_component: target?.name ?? r.target_component,
      target_component_id: target?.id ?? r.target_component_id,
      target_component_name: target?.name ?? r.target_component_name,
      relation_type: type,
      relationship_type: type,
    }
  })
  let vendor: DeviceVendor | null = base?.vendor && typeof base.vendor === "object" ? base.vendor : null
  if ("vendor" in input) {
    const raw = input.vendor
    const name = typeof raw === "string" ? raw.trim() : raw && typeof raw === "object" ? String(raw.name ?? "").trim() : ""
    vendor = name ? { id: (raw && typeof raw === "object" && raw.id) || input.vendor_id || (vendor?.name === name ? vendor.id : uuidFrom(`vendor-${name}`)), name } : null
  }
  const now = new Date().toISOString()
  return {
    ...merged,
    id,
    name: String(merged.name ?? "").trim(),
    category: String(merged.category || "generic_iot"),
    description: merged.description ?? null,
    vendor,
    vendor_id: vendor?.id ?? null,
    meta_data: merged.meta_data ?? null,
    telemetry_mappings: merged.telemetry_mappings ?? {},
    config_mappings: merged.config_mappings ?? {},
    metadata_mappings: merged.metadata_mappings ?? {},
    components,
    relationships,
    created_at: base?.created_at ?? now,
    updated_at: now,
  } as DeviceProfile
}

function normalizeTemplate(input: Record<string, any>, base: DiagnosticTemplate | null, seed?: string): DiagnosticTemplate {
  const id = base?.id ?? input.id ?? newId("template")
  const merged: Record<string, any> = { ...(base ? clone(base) : {}), ...input, id }
  const idFor = (kind: string, index: number, existing?: string) => existing || (seed ? uuidFrom(`${seed}-${kind}-${index}`) : newId(kind))
  const symptoms: TemplateSymptom[] = (Array.isArray(merged.symptoms) ? merged.symptoms : []).map((s: any, i: number) => ({
    ...s,
    id: idFor("symptom", i, s.id),
    template_id: id,
    code: String(s.code ?? "").trim().toUpperCase(),
    severity: SEVERITIES.includes(s.severity) ? s.severity : "MEDIUM",
  }))
  const causes: TemplateCause[] = (Array.isArray(merged.causes) ? merged.causes : []).map((c: any, i: number) => {
    const causeId = idFor("cause", i, c.id)
    const rules = (Array.isArray(c.hypothesis_rules) && c.hypothesis_rules.length ? c.hypothesis_rules : Array.isArray(c.rules) ? c.rules : []).map(
      (r: any, j: number) => ({
        ...r,
        id: idFor(`rule-${i}`, j, r.id),
        cause_id: causeId,
        evidence_code: String(r.evidence_code ?? "").trim().toUpperCase(),
        weight: numberOf(r.weight) ?? 0,
        is_mandatory: Boolean(r.is_mandatory),
      }),
    )
    const code = String(c.code || c.cause_code || "CAUSE_UNSPECIFIED").trim().toUpperCase()
    const { rules: _alias, ...rest } = c
    return { ...rest, id: causeId, template_id: id, code, cause_code: code, hypothesis_rules: rules }
  })
  const targetType = merged.target_component_type || merged.category || "sensor"
  const now = new Date().toISOString()
  return {
    ...merged,
    id,
    name: String(merged.name ?? "").trim(),
    target_component_type: targetType,
    category: targetType,
    version: String(merged.version || "1.0.0"),
    description: String(merged.description ?? ""),
    symptoms,
    causes,
    target_profile_categories: Array.isArray(merged.target_profile_categories) ? merged.target_profile_categories : [],
    created_at: merged.created_at ?? base?.created_at ?? now,
    updated_at: seed ? merged.updated_at ?? now : now,
  } as DiagnosticTemplate
}

function codeSetErrors(input: { name?: unknown; decode_rule?: unknown; codes?: unknown }): string[] {
  const errors: string[] = []
  if (typeof input.name !== "string" || !input.name.trim()) errors.push("The set needs a name.")
  if (input.decode_rule !== "bitmask" && input.decode_rule !== "exact") errors.push('decode_rule must be "bitmask" or "exact".')
  if (!Array.isArray(input.codes)) errors.push("codes must be a list.")
  else if (input.decode_rule === "bitmask" || input.decode_rule === "exact") {
    const codes = input.codes.map((c: any) => ({ code: Number(c?.code), label: String(c?.label ?? ""), kind: c?.kind }))
    for (const c of codes) if (!["ok", "fault", "info"].includes(c.kind)) errors.push(`Code ${c.code} needs a kind of ok, fault or info.`)
    errors.push(...validateStatusCodes(input.decode_rule, codes as StatusCode[]))
  }
  return errors
}

const cleanCodes = (codes: any[]): StatusCode[] =>
  codes.map((c) => ({ code: Number(c.code), label: String(c.label).trim(), description: c.description ? String(c.description) : null, kind: c.kind }))

const page = <T>(items: T[], query: URLSearchParams, defaultLimit: number, maxLimit: number) => {
  const skip = intParam(query, "skip", 0, 0, Number.MAX_SAFE_INTEGER)
  const limit = intParam(query, "limit", defaultLimit, 1, maxLimit)
  return items.slice(skip, skip + limit)
}

// ─── Routes ─────────────────────────────────────────────────────────────────

const deviceOr404 = (id: string): DemoDevice | MockResult => findDevice(id) ?? notFound(`Device ${id}`)
const isDevice = (value: DemoDevice | MockResult): value is DemoDevice => "_id" in value

/** Registers every diagnostics, status code and raw-data endpoint on the Beacon mock router. */
export function registerDiagnosticsRoutes(router: MockRouter): void {
  // ── Latest health and on-demand evaluation ──

  router.get("/diagnostics/devices/:id/health", ({ params }) => {
    const device = deviceOr404(params.id)
    if (!isDevice(device)) return device
    return { body: snapshotsOf(device)[0] ?? null }
  })

  router.get("/diagnostics/devices/:id/health/history", ({ params, query }) => {
    const device = deviceOr404(params.id)
    if (!isDevice(device)) return device
    return { body: snapshotsOf(device).slice(0, intParam(query, "limit", 30, 1, 500)) }
  })

  router.post("/diagnostics/evaluate/:id", ({ params, query, body }) => {
    const device = deviceOr404(params.id)
    if (!isDevice(device)) return device
    const windowHours = clamp(Math.round(numberOf(body?.window_hours) ?? 24), 1, 24 * 14)
    const context = body?.context && typeof body.context === "object" ? (body.context as Record<string, unknown>) : {}
    const evaluation = evaluateDevice(device, windowHours, Date.now(), context)
    if (!isEvaluation(evaluation)) return evaluation
    if (query.get("save_snapshot") !== "false") {
      const list = snapshotsOf(device)
      list.unshift(snapshotFrom(device, evaluation.result, newId("snapshot")))
      if (list.length > 50) list.length = 50
    }
    return { body: evaluation.result }
  })

  router.post("/diagnostics/evaluate-payload", ({ body }) => {
    freshCache()
    if (!body || !Array.isArray(body.telemetry_window)) {
      return detail(422, [{ loc: ["body", "telemetry_window"], msg: "Input should be a valid list" }])
    }
    const device = body.device_id ? findDevice(String(body.device_id)) : undefined
    let profile: DeviceProfile | null = null
    if (body.profile_id) {
      profile = findProfile(String(body.profile_id)) ?? null
      if (!profile) return notFound(`Profile ${body.profile_id}`)
    } else if (device) {
      profile = profileFor(device)
    }
    if (!profile) {
      return detail(422, { message: "No device profile to evaluate against.", errors: ["Pass profile_id, or a device_id whose device type has a profile."], warnings: [] })
    }
    const readiness = readinessOf(profile)
    if (!readiness.diagnosable) {
      return detail(422, { message: `The ${profile.name} profile can't drive a diagnosis yet.`, errors: readiness.errors, warnings: readiness.warnings })
    }
    const context = body.context && typeof body.context === "object" ? (body.context as Record<string, unknown>) : {}
    const interval = numberOf(context.expected_interval_seconds) ?? configuredInterval(profile) ?? DEFAULT_POLICY.default_interval_seconds
    const raw = body.telemetry_window as Array<Record<string, unknown>>
    const now = Date.now()
    const records: EngineRecord[] = raw
      .filter((r) => r && typeof r === "object")
      .map((r, i) => {
        const stamp = r.datetime ?? r.timestamp ?? r.created_at ?? r.time
        const parsed = typeof stamp === "string" || typeof stamp === "number" ? new Date(stamp).getTime() : NaN
        return { t: Number.isFinite(parsed) ? parsed : now - (raw.length - 1 - i) * interval * 1000, values: r }
      })
    const lastT = records.reduce((max, r) => Math.max(max, r.t), 0)
    const firstT = records.reduce((min, r) => Math.min(min, r.t), Number.POSITIVE_INFINITY)
    const windowEnd = records.length ? Math.max(lastT, Math.min(now, lastT + interval * 1000)) : now
    const requested = numberOf(body.window_hours)
    const windowHours =
      requested && requested > 0 ? requested : records.length ? Math.max(1, Math.ceil((windowEnd - firstT) / HOUR)) : 24
    const engine = runEngine(profile, records, {
      windowStart: windowEnd - windowHours * HOUR,
      windowEnd,
      intervalSeconds: interval,
      policy: (context.policy as Record<string, unknown>) ?? null,
    })
    return { body: toEvaluation(String(body.device_id || "bench_node"), profile, engine, windowHours, new Date().toISOString(), context) }
  })

  router.post("/diagnostics/feedback", ({ body }) => {
    const missing = ["device_id", "technician_user_id", "confirmed_cause_code"].filter((field) => !body?.[field])
    if (missing.length > 0) {
      return detail(422, missing.map((field) => ({ loc: ["body", field], msg: "Field required" })))
    }
    const record: DiagnosticFeedbackRecord = {
      snapshot_id: body.snapshot_id || undefined,
      device_id: String(body.device_id),
      technician_user_id: String(body.technician_user_id),
      confirmed_cause_code: String(body.confirmed_cause_code),
      was_prediction_accurate: Boolean(body.was_prediction_accurate),
      actions_taken: body.actions_taken ?? "",
      technician_notes: body.technician_notes ?? "",
      id: newId("feedback"),
      created_at: new Date().toISOString(),
    }
    store.feedback.unshift(record)
    return { status: 201, body: record }
  })

  // ── Device profiles ──

  router.get("/diagnostics/profiles", ({ query }) => {
    const category = query.get("category")
    const list = store.profiles
      .filter((p) => !category || p.category.toLowerCase() === category.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name))
    return { body: page(list, query, 100, 1000) }
  })

  router.post("/diagnostics/profiles", ({ body }) => {
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return detail(422, [{ loc: ["body", "name"], msg: "Field required" }])
    }
    if (store.profiles.some((p) => p.name.toLowerCase() === body.name.trim().toLowerCase())) {
      return detail(409, `A profile named "${body.name.trim()}" already exists.`)
    }
    const { id: _ignored, ...input } = body
    const profile = normalizeProfile(input, null)
    store.profiles.push(profile)
    invalidate()
    return { status: 201, body: profile }
  })

  router.get("/diagnostics/profiles/:id", ({ params }) => {
    const profile = findProfile(params.id)
    return profile ? { body: profile } : notFound(`Profile ${params.id}`)
  })

  router.put("/diagnostics/profiles/:id", ({ params, body }) => {
    const existing = findProfile(params.id)
    if (!existing) return notFound(`Profile ${params.id}`)
    const input = body && typeof body === "object" ? { ...body } : {}
    delete input.id
    delete input.created_at
    if (typeof input.name === "string") {
      const name = input.name.trim()
      if (!name) return detail(422, [{ loc: ["body", "name"], msg: "String should have at least 1 character" }])
      if (store.profiles.some((p) => p !== existing && p.name.toLowerCase() === name.toLowerCase())) {
        return detail(409, `A profile named "${name}" already exists.`)
      }
    }
    const updated = normalizeProfile(input, existing)
    store.profiles[store.profiles.indexOf(existing)] = updated
    invalidate()
    return { body: updated }
  })

  router.delete("/diagnostics/profiles/:id", ({ params }) => {
    const existing = findProfile(params.id)
    if (!existing) return notFound(`Profile ${params.id}`)
    store.profiles = store.profiles.filter((p) => p !== existing)
    invalidate()
    return { body: { success: true, message: `Profile ${existing.name} deleted` } }
  })

  router.get("/diagnostics/profiles/:id/diagnostic-readiness", ({ params }) => {
    freshCache()
    const profile = findProfile(params.id)
    return profile ? { body: readinessOf(profile) } : notFound(`Profile ${params.id}`)
  })

  // ── Diagnostic templates ──

  router.get("/diagnostics/templates", ({ query }) => ({
    body: page([...store.templates].sort((a, b) => a.name.localeCompare(b.name)), query, 100, 1000),
  }))

  router.post("/diagnostics/templates", ({ body }) => {
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return detail(422, [{ loc: ["body", "name"], msg: "Field required" }])
    }
    const { id: _ignored, ...input } = body
    const template = normalizeTemplate(input, null)
    store.templates.push(template)
    invalidate()
    return { status: 201, body: template }
  })

  router.get("/diagnostics/templates/:id", ({ params }) => {
    const template = findTemplate(params.id)
    return template ? { body: template } : notFound(`Template ${params.id}`)
  })

  router.put("/diagnostics/templates/:id", ({ params, body }) => {
    const existing = findTemplate(params.id)
    if (!existing) return notFound(`Template ${params.id}`)
    const input = body && typeof body === "object" ? { ...body } : {}
    delete input.id
    delete input.created_at
    const updated = normalizeTemplate(input, existing)
    store.templates[store.templates.indexOf(existing)] = updated
    invalidate()
    return { body: updated }
  })

  router.delete("/diagnostics/templates/:id", ({ params }) => {
    const existing = findTemplate(params.id)
    if (!existing) return notFound(`Template ${params.id}`)
    store.templates = store.templates.filter((t) => t !== existing)
    invalidate()
    return { body: { success: true, message: `Template ${existing.name} deleted` } }
  })

  router.post("/diagnostics/seed-defaults", () => {
    // Defaults replace their earlier copies (by id or name); anything else people added stays
    const profiles = PROFILE_SPECS.map(buildProfile)
    const templates = TEMPLATE_SPECS.map(buildTemplate)
    const codeSets = CODE_SET_SPECS.map(buildCodeSet)
    const keep = <T extends { id: string; name: string }>(current: T[], defaults: T[]) => [
      ...defaults,
      ...current.filter((item) => !defaults.some((d) => d.id === item.id || d.name.toLowerCase() === item.name.toLowerCase())),
    ]
    store.profiles = keep(store.profiles, profiles)
    store.templates = keep(store.templates, templates)
    store.codeSets = keep(store.codeSets, codeSets)
    invalidate()
    return {
      body: {
        message: `Restored ${profiles.length} default profiles, ${templates.length} templates and ${codeSets.length} status code sets.`,
        profiles_seeded: profiles.length,
        templates_seeded: templates.length,
      },
    }
  })

  // ── Status code sets ──

  router.get("/status-code-sets", ({ query }) => {
    const search = (query.get("search") || "").trim().toLowerCase()
    const list = store.codeSets
      .filter((s) => !search || s.name.toLowerCase().includes(search) || (s.description || "").toLowerCase().includes(search))
      .sort((a, b) => a.name.localeCompare(b.name))
    return { body: page(list, query, 100, 1000) }
  })

  router.post("/status-code-sets", ({ body }) => {
    const errors = codeSetErrors(body ?? {})
    if (errors.length > 0) return detail(422, errors)
    const name = String(body.name).trim()
    if (findCodeSet(name)) return detail(409, [`A status code set named "${name}" already exists.`])
    const now = new Date().toISOString()
    const set: StatusCodeSet = {
      id: newId("code-set"),
      name,
      description: body.description ?? null,
      decode_rule: body.decode_rule,
      codes: cleanCodes(body.codes),
      created_at: now,
      updated_at: now,
    }
    store.codeSets.push(set)
    return { status: 201, body: set }
  })

  router.get("/status-code-sets/:ref", ({ params }) => {
    const set = findCodeSet(params.ref)
    return set ? { body: set } : notFound(`Status code set ${params.ref}`)
  })

  router.patch("/status-code-sets/:ref", ({ params, body }) => {
    const set = findCodeSet(params.ref)
    if (!set) return notFound(`Status code set ${params.ref}`)
    const next = {
      name: typeof body?.name === "string" ? body.name.trim() : set.name,
      description: body && "description" in body ? body.description ?? null : set.description,
      decode_rule: body?.decode_rule ?? set.decode_rule,
      codes: Array.isArray(body?.codes) ? body.codes : set.codes,
    }
    const errors = codeSetErrors(next)
    if (errors.length > 0) return detail(422, errors)
    const clash = findCodeSet(next.name)
    if (clash && clash !== set) return detail(409, [`A status code set named "${next.name}" already exists.`])
    // Profiles link to sets by name, so a rename leaves their links pointing at the old name
    Object.assign(set, {
      name: next.name,
      description: next.description,
      decode_rule: next.decode_rule,
      codes: cleanCodes(next.codes),
      updated_at: new Date().toISOString(),
    })
    return { body: set }
  })

  router.delete("/status-code-sets/:ref", ({ params }) => {
    const set = findCodeSet(params.ref)
    if (!set) return notFound(`Status code set ${params.ref}`)
    store.codeSets = store.codeSets.filter((s) => s !== set)
    return { body: { success: true, message: `Status code set ${set.name} deleted` } }
  })

  router.get("/status-code-sets/:ref/decode", ({ params, query }) => {
    const set = findCodeSet(params.ref)
    if (!set) return notFound(`Status code set ${params.ref}`)
    const values = query.getAll("value").flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean)
    if (values.length === 0) return detail(422, ["Give at least one value to decode."])
    if (values.length > 1000) return detail(422, ["At most 1000 values can be decoded per request."])
    const response: StatusDecodeResponse = {
      code_set: set.name,
      decode_rule: set.decode_rule,
      results: values.map((value) => decodeStatus(set, value)),
    }
    return { body: response }
  })

  // ── Daily diagnoses for one device ──

  router.get("/diagnostics/devices/:id/daily", ({ params, query }) => {
    const device = deviceOr404(params.id)
    if (!isDevice(device)) return device
    const end = isDay(query.get("end_date")) ? (query.get("end_date") as string) : yesterdayUtc()
    const start = isDay(query.get("start_date")) ? (query.get("start_date") as string) : shiftDay(end, -29)
    if (start > end) return detail(422, "start_date must be on or before end_date")
    const state = query.get("lifecycle_state")
    const list = coresBetween(device, start, end)
      .reverse()
      .filter((core) => !state || core.state === state)
      .slice(0, intParam(query, "limit", 30, 1, 366))
      .map(daySummary)
    return { body: list }
  })

  router.get("/diagnostics/devices/:id/daily/:date", ({ params }) => {
    const device = deviceOr404(params.id)
    if (!isDevice(device)) return device
    if (!isDay(params.date)) return detail(422, "diagnosis_date must be a date (YYYY-MM-DD)")
    const core = dayCore(device, params.date)
    return core ? { body: dayDetail(core) } : notFound(`Diagnosis for ${device.name} on ${params.date}`)
  })

  router.get("/diagnostics/devices/:id/issues", ({ params, query }) => {
    const device = deviceOr404(params.id)
    if (!isDevice(device)) return device
    const days = intParam(query, "days", 30, 1, HISTORY_DAYS)
    const start = shiftDay(todayUtc(), -days)
    const end = yesterdayUtc()
    const cores = coresBetween(device, start, end)
    const days_ = cores.map((core) => ({ core, summary: daySummary(core) }))
    const latest = days_[days_.length - 1] ?? null
    const history = new Map<string, DeviceIssueHistoryItem>()
    for (const { core, summary } of days_) {
      for (const issue of summary.issues) {
        const item = history.get(issue.issue_code) ?? {
          issue_code: issue.issue_code,
          title: issue.title,
          subsystem: issue.subsystem,
          severity: issue.severity,
          days_observed: 0,
          first_seen: core.date,
          last_seen: core.date,
          is_active: false,
          current_streak_days: 0,
        }
        item.days_observed += 1
        item.last_seen = core.date
        if (severityRank(issue.severity) > severityRank(item.severity)) item.severity = issue.severity
        history.set(issue.issue_code, item)
      }
    }
    if (latest) {
      for (const issue of latest.summary.issues) {
        const item = history.get(issue.issue_code)
        if (item) {
          item.is_active = true
          item.current_streak_days = issue.streak_days
        }
      }
    }
    const scored = days_.filter((d) => d.summary.lifecycle_state !== "NO_DATA").map((d) => d.summary.overall_health_score)
    const trend: HealthTrendPoint[] = days_.map(({ summary }) => ({
      diagnosis_date: summary.diagnosis_date,
      overall_health_score: summary.overall_health_score,
      lifecycle_state: summary.lifecycle_state,
      issue_count: summary.issue_count,
    }))
    const response: DeviceIssueSummary = {
      device_id: device._id,
      start_date: start,
      end_date: end,
      days_diagnosed: days_.length,
      average_health_score: scored.length ? round(mean(scored), 1) : null,
      latest_diagnosis_date: latest?.summary.diagnosis_date ?? null,
      latest_lifecycle_state: latest?.summary.lifecycle_state ?? null,
      latest_headline: latest?.summary.headline ?? null,
      issues: [...history.values()].sort(
        (a, b) => Number(b.is_active) - Number(a.is_active) || severityRank(b.severity) - severityRank(a.severity) || b.days_observed - a.days_observed,
      ),
      health_trend: trend,
    }
    return { body: response }
  })

  router.get("/diagnostics/devices/:id/indicators", ({ params, query }) => {
    const device = deviceOr404(params.id)
    if (!isDevice(device)) return device
    const days = intParam(query, "days", 30, 1, HISTORY_DAYS)
    const componentFilter = query.get("component")
    const indicatorFilter = query.get("indicator")
    const start = shiftDay(todayUtc(), -days)
    const end = yesterdayUtc()
    const cores = coresBetween(device, start, end)
    const components: DeviceIndicatorSeries["components"] = {}
    for (const core of cores) {
      for (const [component, groups] of Object.entries(core.result.indicators)) {
        if (componentFilter && component !== componentFilter) continue
        for (const [group, values] of Object.entries(groups)) {
          if (indicatorFilter && group !== indicatorFilter && group.split(":")[0] !== indicatorFilter) continue
          ;((components[component] ??= {})[group] ??= []).push(seriesValues(values, core.date))
        }
      }
    }
    const response: DeviceIndicatorSeries = { device_id: device._id, start_date: start, end_date: end, days_diagnosed: cores.length, components }
    return { body: response }
  })

  router.get("/diagnostics/devices/:id/trends", ({ params, query }) => {
    const device = deviceOr404(params.id)
    if (!isDevice(device)) return device
    const asOf = query.get("as_of")
    if (asOf && !isDay(asOf)) return detail(422, "as_of must be a date (YYYY-MM-DD)")
    return { body: trendsFor(device, asOf, intParam(query, "window_days", 14, 3, 60)) }
  })

  // ── Fleet ──

  router.get("/diagnostics/fleet/daily-summary", ({ query }) => {
    const devices = groupDevices(query.get("group"))
    const requested = query.get("diagnosis_date")
    if (requested && !isDay(requested)) return detail(422, "diagnosis_date must be a date (YYYY-MM-DD)")
    const day = requested || latestFleetDay(devices)
    return { body: fleetSummary(devices, day, intParam(query, "top_n", 10, 1, 100)) }
  })

  router.get("/diagnostics/fleet/issues", ({ query }) => {
    let devices = groupDevices(query.get("group"))
    const deviceFilter = query.get("device_id")
    if (deviceFilter) {
      const match = findDevice(deviceFilter)
      devices = match ? devices.filter((d) => d === match) : []
    }
    const single = query.get("diagnosis_date")
    const start = query.get("start_date")
    const end = query.get("end_date")
    for (const value of [single, start, end]) if (value && !isDay(value)) return detail(422, `${value} is not a date (YYYY-MM-DD)`)
    let days: string[]
    if (single) days = [single]
    else if (start || end) days = daysBetween(start || shiftDay(end as string, -6), end || yesterdayUtc()).slice(-31)
    else {
      const latest = latestFleetDay(devices)
      days = latest ? [latest] : []
    }

    const severity = query.get("severity")
    const subsystem = query.get("subsystem")
    const component = query.get("component_name")
    const check = query.get("check_type")
    const code = query.get("issue_code")
    const minStreak = intParam(query, "min_streak_days", 0, 0, 1000)
    const onlyNew = isTrue(query.get("only_new"))

    const issues: FleetIssue[] = []
    for (const day of days) {
      for (const { core, summary } of fleetDay(devices, day)) {
        for (const issue of summary.issues) {
          if (severity && issue.severity !== severity) continue
          if (subsystem !== null && subsystem !== "" && issue.subsystem.toLowerCase() !== subsystem.toLowerCase()) continue
          if (component && issue.component_name !== component) continue
          if (check && issue.check_type !== check) continue
          if (code && issue.issue_code !== code) continue
          if (issue.streak_days < minStreak) continue
          if (onlyNew && !issue.is_new) continue
          issues.push({ ...issue, device_id: core.device._id, device_name: core.device.name, diagnosis_date: day })
        }
      }
    }
    issues.sort(
      (a, b) =>
        b.diagnosis_date.localeCompare(a.diagnosis_date) ||
        severityRank(b.severity) - severityRank(a.severity) ||
        b.streak_days - a.streak_days ||
        (a.device_name ?? "").localeCompare(b.device_name ?? "") ||
        a.issue_code.localeCompare(b.issue_code),
    )
    return { body: page(issues, query, 100, 1000) }
  })

  router.post("/diagnostics/daily/run", ({ query }) => {
    const yesterday = yesterdayUtc()
    const oldest = shiftDay(todayUtc(), -RAW_RETENTION_DAYS)
    const startParam = query.get("start_date")
    const endParam = query.get("end_date")
    for (const value of [startParam, endParam]) if (value && !isDay(value)) return detail(422, `${value} is not a date (YYYY-MM-DD)`)
    let start: string
    let end: string
    if (startParam || endParam) {
      end = endParam || yesterday
      start = startParam || end
    } else {
      const lookback = numberOf(query.get("lookback_days")) ?? 1
      if (lookback < 1 || lookback > RAW_RETENTION_DAYS) return detail(422, `lookback_days must be between 1 and ${RAW_RETENTION_DAYS}`)
      end = yesterday
      start = shiftDay(yesterday, -(Math.floor(lookback) - 1))
    }
    if (start > end) return detail(422, "start_date must be on or before end_date")
    if (end > yesterday) return detail(422, "Only completed UTC days can be diagnosed; end_date must be yesterday or earlier")
    if (start < oldest) return detail(422, `Raw data is kept for ${RAW_RETENTION_DAYS} days, so start_date can't be before ${oldest}`)

    const requestedIds = query.getAll("device_id").flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean)
    const unknown = requestedIds.filter((id) => !findDevice(id))
    if (unknown.length > 0) return detail(422, [`Unknown device${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}`])
    const devices = requestedIds.length ? requestedIds.map((id) => findDevice(id) as DemoDevice) : DEVICES
    const force = isTrue(query.get("force"))
    const days = daysBetween(start, end)
    if (force) {
      const now = new Date().toISOString()
      for (const device of devices) for (const day of days) store.reruns.set(`${device._id}|${day}`, now)
    }
    invalidate()
    const deviceText = requestedIds.length ? `${requestedIds.length} device${requestedIds.length === 1 ? "" : "s"}` : "every device"
    const dayText = days.length === 1 ? `${start}` : `${days.length} days (${start} to ${end})`
    const response: DailyDiagnosticsRunResponse = {
      success: true,
      message: force ? `Re-diagnosing ${dayText} for ${deviceText}` : `Diagnosing ${dayText} for ${deviceText}; days already diagnosed are kept`,
      start_date: start,
      end_date: end,
      device_ids: requestedIds.length ? requestedIds : null,
      force,
    }
    return { status: 202, body: response }
  })

  // ── Raw rows (Reported Status history) ──

  router.get("/data-sync/raw", ({ query }) => {
    const channel = query.get("channel_id")
    if (!channel) return detail(422, [{ loc: ["query", "channel_id"], msg: "Field required" }])
    const device = findDevice(channel)
    if (!device) return { body: { success: true, data: [] } }
    const end = Math.min(Date.parse(query.get("end") || "") || Date.now(), Date.now())
    const start = Date.parse(query.get("start") || "") || end - DAY
    const limit = intParam(query, "limit", 100, 1, 10000)
    const interval = firmwareOf(device).interval
    const rows = deviceRecords(device, Math.max(start, end - 31 * DAY), end)
      .reverse()
      .slice(0, limit)
      .map((record) => ({
        entry_id: Math.floor(record.t / (interval * 1000)) % 10_000_000,
        channel_id: channelOf(device),
        created_at: iso(record.t),
        created_at_ts: iso(record.t),
        ...record.values,
      }))
    return { body: { success: true, data: rows } }
  })
}
