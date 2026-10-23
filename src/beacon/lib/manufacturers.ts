import type { DeviceDataSource, NetworkSummary } from "@/types/network.types"

/**
 * Sensor manufacturers. On the platform a device's `network` is the manufacturer or data
 * provider that owns it, so these helpers turn network identifiers into labels, decide how
 * a device's readings reach beacon, and build the `network` query filter.
 */

/** Display names for the manufacturers the platform knows; anything else is title-cased. */
const NETWORK_LABELS: Record<string, string> = {
  airqo: "AirQo",
  airgradient: "AirGradient",
  iqair: "IQAir",
  metone: "Met One",
  clarity: "Clarity",
  kcca: "KCCA",
  airbeam: "AirBeam",
  airly: "Airly",
  plumelabs: "Plume Labs",
  "quant-aq": "QuantAQ",
  purpleair: "PurpleAir",
  urbanbetter: "Urban Better",
  nasa: "NASA",
  tahmo: "TAHMO",
  airnow: "AirNow",
}

const NETWORK_TONES: Record<string, string> = {
  airqo: "bg-blue-100 text-blue-800 border-blue-200",
  airgradient: "bg-emerald-100 text-emerald-800 border-emerald-200",
  iqair: "bg-sky-100 text-sky-800 border-sky-200",
  metone: "bg-amber-100 text-amber-800 border-amber-200",
  clarity: "bg-violet-100 text-violet-800 border-violet-200",
  kcca: "bg-violet-100 text-violet-800 border-violet-200",
  airbeam: "bg-purple-100 text-purple-800 border-purple-200",
  airly: "bg-teal-100 text-teal-800 border-teal-200",
  plumelabs: "bg-rose-100 text-rose-800 border-rose-200",
  "quant-aq": "bg-orange-100 text-orange-800 border-orange-200",
}

const DEFAULT_NETWORK_TONE = "bg-gray-100 text-gray-800 border-gray-200"

export const normalizeNetwork = (network: string | null | undefined): string =>
  (network ?? "").toString().trim().toLowerCase()

export function formatNetworkLabel(network: string | null | undefined): string {
  const key = normalizeNetwork(network)
  if (!key) return "Unknown"
  if (NETWORK_LABELS[key]) return NETWORK_LABELS[key]
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

/** Tailwind classes that colour a manufacturer badge. */
export function getNetworkTone(network: string | null | undefined): string {
  return NETWORK_TONES[normalizeNetwork(network)] ?? DEFAULT_NETWORK_TONE
}

// ─── Data source ─────────────────────────────────────────────────────────────

export const DEVICE_DATA_SOURCES: readonly DeviceDataSource[] = ["thingspeak", "external_api", "none"]

export interface DataSourceMeta {
  label: string
  shortLabel: string
  /** Shown in tooltips: what the source means for the readings the user sees */
  description: string
  tone: string
}

export const DATA_SOURCE_META: Record<DeviceDataSource, DataSourceMeta> = {
  thingspeak: {
    label: "ThingSpeak",
    shortLabel: "ThingSpeak",
    description: "Readings are read from the device's ThingSpeak channel with its read key.",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
  },
  external_api: {
    label: "Manufacturer API",
    shortLabel: "Mfr. API",
    description:
      "Readings are fetched from the manufacturer's API through the platform adapter, using the device's serial number and connection URL.",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  none: {
    label: "No data path",
    shortLabel: "No data",
    description:
      "Beacon has no way to read this device yet, so it shows no readings and counts as offline. It needs a ThingSpeak channel and read key, or a serial number and connection URL for a manufacturer with a working adapter.",
    tone: "bg-gray-100 text-gray-600 border-gray-200",
  },
}

export function isDeviceDataSource(value: unknown): value is DeviceDataSource {
  return typeof value === "string" && (DEVICE_DATA_SOURCES as readonly string[]).includes(value)
}

export interface DataSourceInput {
  data_source?: string | null
  device_number?: number | string | null
  beacon_data?: {
    data_source?: string | null
    device_number?: number | string | null
  } | null
}

/**
 * The data source the API reports, or the best guess for an older beacon-api build that doesn't
 * send one: those builds only mirrored AirQo devices, which read from ThingSpeak when they have a channel.
 */
export function resolveDeviceDataSource(device: DataSourceInput | null | undefined): DeviceDataSource {
  if (!device) return "none"
  const reported = device.data_source ?? device.beacon_data?.data_source
  if (isDeviceDataSource(reported)) return reported
  const channel = Number(device.beacon_data?.device_number ?? device.device_number)
  return Number.isFinite(channel) && channel > 0 ? "thingspeak" : "none"
}

export const isThingSpeakDevice = (device: DataSourceInput | null | undefined): boolean =>
  resolveDeviceDataSource(device) === "thingspeak"

export interface SourceIdentifierInput extends DataSourceInput {
  serial_number?: string | null
  beacon_data?: DataSourceInput["beacon_data"] & { serial_number?: string | null }
}

/**
 * The identifier that locates a device at its data source: the ThingSpeak channel for AirQo
 * devices, the manufacturer serial number for everything else. Null when neither is recorded.
 */
export function getDeviceSourceIdentifier(
  device: SourceIdentifierInput | null | undefined
): { label: string; value: string } | null {
  if (!device) return null
  if (resolveDeviceDataSource(device) === "thingspeak") {
    const channel = device.beacon_data?.device_number ?? device.device_number
    return channel ? { label: "Channel ID", value: String(channel) } : null
  }
  const serial = device.serial_number ?? device.beacon_data?.serial_number
  return serial ? { label: "Serial Number", value: String(serial) } : null
}

// ─── Network filter ──────────────────────────────────────────────────────────

/** Parses the comma-separated, case-insensitive `network` value the API accepts. */
export function parseNetworkFilter(value: string | null | undefined): string[] {
  const seen = new Set<string>()
  for (const part of (value ?? "").split(",")) {
    const network = normalizeNetwork(part)
    if (network) seen.add(network)
  }
  return Array.from(seen)
}

/** Joins selected networks into the `network` query value; undefined when nothing is selected. */
export function serializeNetworkFilter(networks: readonly string[] | null | undefined): string | undefined {
  const parsed = parseNetworkFilter((networks ?? []).join(","))
  return parsed.length > 0 ? parsed.join(",") : undefined
}

export function toggleNetworkSelection(selected: readonly string[], network: string, checked: boolean): string[] {
  const value = normalizeNetwork(network)
  const current = parseNetworkFilter(selected.join(","))
  if (!value) return current
  if (checked) return current.includes(value) ? current : [...current, value]
  return current.filter((item) => item !== value)
}

export interface NetworkFilterOption {
  /** Lower-cased network identifier sent in the `network` query */
  value: string
  label: string
  count: number
  enabled: boolean
}

/** Filter options from `GET /networks/`: one per manufacturer, busiest first. */
export function buildNetworkFilterOptions(networks: readonly NetworkSummary[] | null | undefined): NetworkFilterOption[] {
  const byValue = new Map<string, NetworkFilterOption>()
  for (const network of networks ?? []) {
    const value = normalizeNetwork(network.name)
    if (!value) continue
    const existing = byValue.get(value)
    if (existing) {
      existing.count += network.total_devices ?? 0
      existing.enabled = existing.enabled || network.enabled !== false
      continue
    }
    byValue.set(value, {
      value,
      label: formatNetworkLabel(value),
      count: network.total_devices ?? 0,
      enabled: network.enabled !== false,
    })
  }
  return Array.from(byValue.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Filter options from devices already in memory (e.g. My Devices), counted per manufacturer. */
export function buildNetworkFilterOptionsFromDevices(
  devices: ReadonlyArray<{ network?: string | null }> | null | undefined
): NetworkFilterOption[] {
  const counts = new Map<string, number>()
  for (const device of devices ?? []) {
    const value = normalizeNetwork(device.network)
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return Array.from(counts, ([value, count]) => ({ value, label: formatNetworkLabel(value), count, enabled: true })).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label)
  )
}

/**
 * Drops selected manufacturers that are not among the available options, e.g. after switching
 * organisation. Returns the same array when nothing changes, so callers can compare by reference.
 */
export function pruneNetworkSelection(selected: readonly string[], options: readonly NetworkFilterOption[]): string[] {
  const available = new Set(options.map((option) => option.value))
  const kept = selected.filter((network) => available.has(normalizeNetwork(network)))
  return kept.length === selected.length ? (selected as string[]) : kept
}

/** In-memory counterpart of the API's `network` filter, for lists that are not server-paginated. */
export function matchesNetworkFilter(network: string | null | undefined, selected: readonly string[]): boolean {
  if (selected.length === 0) return true
  return selected.map(normalizeNetwork).includes(normalizeNetwork(network))
}
