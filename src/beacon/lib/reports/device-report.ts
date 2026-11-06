import { addDays, eachDayOfInterval, format, startOfDay, startOfWeek } from "date-fns"

/**
 * The device health report, worked out once from the performance data. The on-screen preview and
 * the PDF both render this model, so they can't disagree on a number or a sentence.
 */

export type UptimeBand = "good" | "moderate" | "critical" | "no-data"

// The same thresholds as the Sites summary cards and the design system's uptime scale
export const UPTIME_GOOD = 75
export const UPTIME_MODERATE = 50
export const ERROR_MARGIN_GOOD = 3
export const ERROR_MARGIN_WARNING = 5
export const CORRELATION_GOOD = 0.9
export const CORRELATION_WARNING = 0.75

export const UPTIME_BANDS: Record<UptimeBand, { label: string; range: string; color: string }> = {
  good: { label: "Good", range: "75% or more", color: "#22c55e" },
  moderate: { label: "Moderate", range: "50 to 74%", color: "#f97316" },
  critical: { label: "Critical", range: "Under 50%", color: "#ef4444" },
  "no-data": { label: "No data", range: "Nothing received", color: "#94a3b8" },
}

export const BAND_ORDER: UptimeBand[] = ["good", "moderate", "critical", "no-data"]

export const SNAPSHOT_NOTE = "The map shows the selected devices, coloured by uptime."

export const getUptimeBand = (uptime: number | null | undefined): UptimeBand => {
  if (uptime === null || uptime === undefined || uptime <= 0) return "no-data"
  if (uptime >= UPTIME_GOOD) return "good"
  return uptime >= UPTIME_MODERATE ? "moderate" : "critical"
}

/** Text with some words emphasised, which both the preview and the PDF can render. */
export type ReportText = Array<{ text: string; bold?: boolean }>

const strong = (text: string | number) => ({ text: String(text), bold: true })
const rich = (...parts: Array<string | { text: string; bold?: boolean }>): ReportText =>
  parts.map((part) => (typeof part === "string" ? { text: part } : part))

export const reportTextToString = (text: ReportText): string => text.map((part) => part.text).join("")

export interface ReportDeviceDay {
  hours: number
  records: number
  errorSum: number
  errorCount: number
}

export interface ReportDevice {
  id: string
  name: string
  groups: string[]
  latitude: number | null
  longitude: number | null
  uptime: number | null
  band: UptimeBand
  errorMargin: number | null
  correlation: number | null
  records: number
  lastSeen: Date | null
  days: Record<string, ReportDeviceDay>
}

export interface ReportDay {
  key: string
  date: Date
  /** Hours of this day inside the period and not in the future. */
  expectedHours: number
  /** Whether the whole day is inside the period and already over. */
  isComplete: boolean
  uptime: number | null
  records: number
  reportingDevices: number
  errorMargin: number | null
}

export interface ReportWeek {
  label: string
  uptime: number | null
  days: number
}

export interface DeviceReportInput {
  /** Clusters, or a single entry holding the selected devices. */
  entities: Array<{ name?: string; devices?: any[] }>
  /** What was selected, in the singular: "Cluster" or "Device". */
  itemLabel: string
  itemNames: string[]
  organisation: string
  from: Date
  to: Date
  generatedAt: Date
}

export interface DeviceReport {
  title: string
  subtitle: string
  periodLabel: string
  generatedLabel: string
  filename: string
  from: Date
  to: Date
  snapshot: Array<{ label: string; value: string }>
  devices: ReportDevice[]
  days: ReportDay[]
  weeks: ReportWeek[]
  /** Share of possible device-hours with data, for each hour of the day. */
  hourlyCoverage: Array<number | null>
  bandCounts: Record<UptimeBand, number>
  hasPartialDay: boolean
  showGroups: boolean
  summary: {
    deviceCount: number
    reportingCount: number
    mappedCount: number
    averageUptime: number | null
    band: UptimeBand
    averageErrorMargin: number | null
    averageCorrelation: number | null
    records: number
    uptimeChange: number | null
    changeLabel: string | null
  }
  narrative: {
    introduction: ReportText[]
    findings: ReportText[]
    conclusion: ReportText[]
    recommendations: ReportText[]
  }
}

const HOUR_MS = 60 * 60 * 1000
const CHANGE_WINDOW_DAYS = 7
const BROADLY_UNCHANGED_POINTS = 1
const MIN_CORRELATION_PAIRS = 3
const NAMES_IN_A_SENTENCE = 3

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const average = (values: number[]): number | null =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null

const formatDay = (date: Date) => format(date, "MMM d, yyyy")
const formatPercent = (value: number) => `${value.toFixed(1)}%`
export const formatErrorMargin = (value: number) => `±${value.toFixed(1)} µg/m³`
const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`

/**
 * The API reports uptime as 0-100 and the service converts it to a 0-1 fraction, but 0.5 can still
 * mean half a percent. Hours actually seen in the readings settle which scale a small value is on.
 */
export function toUptimePercent(value: unknown, fromReadings: number | null): number | null {
  const number = toNumber(value)
  if (number === null) return fromReadings
  if (number > 1) return Math.min(number, 100)
  const scaled = number * 100
  if (fromReadings !== null && Math.abs(number - fromReadings) < Math.abs(scaled - fromReadings)) return number
  return scaled
}

function getReadings(device: any): any[] {
  if (Array.isArray(device.data) && device.data.length > 0) return device.data
  if (Array.isArray(device.raw_data) && device.raw_data.length > 0) return device.raw_data
  if (Array.isArray(device.timestamp)) {
    return device.timestamp.map((datetime: string, index: number) => ({
      datetime,
      record_count: device.freq?.[index],
      error_margin: Array.isArray(device.error_margin) ? device.error_margin[index] : undefined,
    }))
  }
  return []
}

const firstSensorValue = (reading: any, keys: string[]): number | null => {
  for (const key of keys) {
    const value = toNumber(reading[key])
    if (value !== null) return value
  }
  return null
}

const SENSOR_1_KEYS = ["s1_pm2_5", "pm2.5 sensor1", "pm2_5_sensor1", "pm2_5_s1", "pm2_5_s1_raw"]
const SENSOR_2_KEYS = ["s2_pm2_5", "pm2.5 sensor2", "pm2_5_sensor2", "pm2_5_s2", "pm2_5_s2_raw"]

// The map can't draw past this: 90° projects to infinity, so a device reporting it is treated as unplaced
const MAX_MAP_LATITUDE = 85.0511

const deviceIdOf = (raw: any) => String(raw._id ?? raw.device_id ?? raw.id ?? raw.name ?? raw.device_name)

function summariseDevice(
  raw: any,
  groupName: string | undefined,
  window: { from: number; to: number; expectedHours: number },
  hourHits: number[]
): ReportDevice {
  const days: Record<string, ReportDeviceDay> = {}
  const seenHours = new Set<string>()
  let records = 0
  let lastSeen = 0
  let errorSum = 0
  let errorCount = 0
  // Running totals for the correlation between the two sensors
  let pairs = 0
  let sumX = 0
  let sumY = 0
  let sumXX = 0
  let sumYY = 0
  let sumXY = 0

  for (const reading of getReadings(raw)) {
    const time = new Date(reading.datetime ?? reading.timestamp)
    const timeMs = time.getTime()
    if (Number.isNaN(timeMs) || timeMs < window.from || timeMs > window.to) continue
    const recordCount = toNumber(reading.record_count) ?? 1
    if (recordCount <= 0) continue

    const key = dayKey(time)
    const day = (days[key] ??= { hours: 0, records: 0, errorSum: 0, errorCount: 0 })
    const hour = time.getHours()
    const hourKey = `${key}|${hour}`
    if (!seenHours.has(hourKey)) {
      seenHours.add(hourKey)
      day.hours += 1
      hourHits[hour] += 1
    }
    day.records += recordCount
    records += recordCount
    lastSeen = Math.max(lastSeen, timeMs)

    const sensor1 = firstSensorValue(reading, SENSOR_1_KEYS)
    const sensor2 = firstSensorValue(reading, SENSOR_2_KEYS)
    let readingError = toNumber(reading.error_margin)
    if (sensor1 !== null && sensor2 !== null) {
      readingError = Math.abs(sensor1 - sensor2)
      pairs += 1
      sumX += sensor1
      sumY += sensor2
      sumXX += sensor1 * sensor1
      sumYY += sensor2 * sensor2
      sumXY += sensor1 * sensor2
    }
    if (readingError !== null) {
      day.errorSum += readingError
      day.errorCount += 1
      errorSum += readingError
      errorCount += 1
    }
  }

  let correlation: number | null = null
  if (pairs >= MIN_CORRELATION_PAIRS) {
    const spread = Math.sqrt((pairs * sumXX - sumX * sumX) * (pairs * sumYY - sumY * sumY))
    if (spread > 0) correlation = (pairs * sumXY - sumX * sumY) / spread
  }

  const hasReadings = seenHours.size > 0
  const fromReadings =
    hasReadings && window.expectedHours > 0 ? Math.min(100, (seenHours.size / window.expectedHours) * 100) : null
  const exactPercent = toNumber(raw.uptime_percent)
  const uptime = exactPercent !== null ? Math.min(exactPercent, 100) : toUptimePercent(raw.uptime, fromReadings)
  const latitude = toNumber(raw.latitude)
  const longitude = toNumber(raw.longitude)
  const hasCoordinates =
    latitude !== null &&
    longitude !== null &&
    !(latitude === 0 && longitude === 0) &&
    Math.abs(latitude) <= MAX_MAP_LATITUDE &&
    Math.abs(longitude) <= 180

  return {
    id: deviceIdOf(raw),
    name: raw.long_name || raw.name || raw.device_name || String(raw._id ?? raw.device_id ?? raw.id ?? "Unknown device"),
    groups: groupName ? [groupName] : [],
    latitude: hasCoordinates ? latitude : null,
    longitude: hasCoordinates ? longitude : null,
    uptime,
    band: !hasReadings && !(uptime && uptime > 0) ? "no-data" : getUptimeBand(uptime),
    errorMargin: errorCount > 0 ? errorSum / errorCount : toNumber(raw.sensor_error_margin),
    correlation,
    records,
    lastSeen: lastSeen > 0 ? new Date(lastSeen) : null,
    days,
  }
}

/** "a, b, c and 2 more" */
function listNames(names: string[], limit = NAMES_IN_A_SENTENCE): string {
  if (names.length <= 1) return names[0] ?? ""
  if (names.length > limit) return `${names.slice(0, limit).join(", ")} and ${names.length - limit} more`
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

const formatOrganisation = (organisation: string): string =>
  organisation.toLowerCase() === "airqo"
    ? "AirQo"
    : organisation.replace(/[_-]+/g, " ").replace(/(^|\s)\S/g, (start) => start.toUpperCase())

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export function buildDeviceReport(input: DeviceReportInput): DeviceReport {
  const { from, to, generatedAt, itemNames, itemLabel } = input
  const fromMs = from.getTime()
  const toMs = to.getTime()

  // The hours each day could have data for: a period can start part-way through a day, and today
  // only counts the hours so far
  const hourSlots = new Array<number>(24).fill(0)
  const dayFrames = eachDayOfInterval({ start: from, end: to }).map((date) => {
    const dayStart = startOfDay(date).getTime()
    const dayEnd = startOfDay(addDays(date, 1)).getTime()
    const spanStart = Math.max(dayStart, fromMs)
    const spanEnd = Math.min(dayEnd, toMs + 1, generatedAt.getTime())
    // Distinct clock hours, the way readings are counted, so a clock-change day isn't held to 24
    const clockHours = new Set<number>()
    for (let hourStart = dayStart; hourStart < dayEnd; hourStart += HOUR_MS) {
      if (hourStart < spanEnd && hourStart + HOUR_MS > spanStart) clockHours.add(new Date(hourStart).getHours())
    }
    clockHours.forEach((hour) => {
      hourSlots[hour] += 1
    })
    return {
      date,
      key: dayKey(date),
      expectedHours: clockHours.size,
      isComplete: spanStart === dayStart && spanEnd === dayEnd,
    }
  })
  const expectedHours = dayFrames.reduce((sum, day) => sum + day.expectedHours, 0)

  const hourHits = new Array<number>(24).fill(0)
  // Not past now either: a device with a wrong clock can send readings dated in the future
  const window = { from: fromMs, to: Math.min(toMs, generatedAt.getTime()), expectedHours }
  const byId = new Map<string, ReportDevice>()
  for (const entity of input.entities) {
    for (const raw of entity.devices ?? []) {
      const existing = byId.get(deviceIdOf(raw))
      if (existing) {
        // The same device in two clusters is counted once, under both names
        if (entity.name && !existing.groups.includes(entity.name)) existing.groups.push(entity.name)
        continue
      }
      const device = summariseDevice(raw, entity.name, window, hourHits)
      byId.set(device.id, device)
    }
  }

  // Lowest uptime first, because those are the ones someone needs to act on
  const devices = Array.from(byId.values()).sort(
    (a, b) => (a.uptime ?? -1) - (b.uptime ?? -1) || a.name.localeCompare(b.name)
  )
  const deviceCount = devices.length

  const days: ReportDay[] = dayFrames.map((frame) => {
    let hours = 0
    let records = 0
    let reportingDevices = 0
    let errorSum = 0
    let errorCount = 0
    for (const device of devices) {
      const day = device.days[frame.key]
      if (!day) continue
      hours += day.hours
      records += day.records
      reportingDevices += 1
      errorSum += day.errorSum
      errorCount += day.errorCount
    }
    return {
      ...frame,
      uptime: frame.expectedHours > 0 && deviceCount > 0 ? (hours / (frame.expectedHours * deviceCount)) * 100 : null,
      records,
      reportingDevices,
      errorMargin: errorCount > 0 ? errorSum / errorCount : null,
    }
  })

  const hoursAcross = (period: ReportDay[]): number | null => {
    const possible = period.reduce((sum, day) => sum + day.expectedHours, 0) * deviceCount
    if (possible === 0) return null
    const seen = period.reduce((sum, day) => sum + ((day.uptime ?? 0) / 100) * day.expectedHours * deviceCount, 0)
    return (seen / possible) * 100
  }

  const liveDays = days.filter((day) => day.expectedHours > 0)
  const completeDays = liveDays.filter((day) => day.isComplete)
  const comparableDays = completeDays.length > 0 ? completeDays : liveDays

  const weekGroups = new Map<number, ReportDay[]>()
  for (const day of liveDays) {
    const weekStart = startOfWeek(day.date, { weekStartsOn: 1 }).getTime()
    weekGroups.set(weekStart, [...(weekGroups.get(weekStart) ?? []), day])
  }
  const weeks: ReportWeek[] = Array.from(weekGroups.values()).map((week) => ({
    label: `${format(week[0].date, "MMM d")} - ${format(week[week.length - 1].date, "MMM d")}`,
    uptime: hoursAcross(week),
    days: week.length,
  }))

  const changeSpan = Math.min(CHANGE_WINDOW_DAYS, Math.floor(comparableDays.length / 2))
  let uptimeChange: number | null = null
  let changeLabel: string | null = null
  if (changeSpan >= 1) {
    const recent = hoursAcross(comparableDays.slice(-changeSpan))
    const previous = hoursAcross(comparableDays.slice(-2 * changeSpan, -changeSpan))
    if (recent !== null && previous !== null) {
      uptimeChange = recent - previous
      changeLabel =
        changeSpan === 1
          ? "the latest day and the day before"
          : `the last ${changeSpan} days and the ${changeSpan} days before`
    }
  }

  const bandCounts: Record<UptimeBand, number> = { good: 0, moderate: 0, critical: 0, "no-data": 0 }
  devices.forEach((device) => {
    bandCounts[device.band] += 1
  })

  const reportingDevices = devices.filter((device) => device.band !== "no-data")
  const averageUptime = average(devices.map((device) => device.uptime ?? 0))
  const band = reportingDevices.length > 0 ? getUptimeBand(averageUptime) : "no-data"
  const averageErrorMargin = average(
    devices.flatMap((device) => (device.errorMargin === null ? [] : [device.errorMargin]))
  )
  const averageCorrelation = average(
    devices.flatMap((device) => (device.correlation === null ? [] : [device.correlation]))
  )
  const records = devices.reduce((sum, device) => sum + device.records, 0)
  const mappedCount = devices.filter((device) => device.latitude !== null).length

  const itemsNoun = itemLabel.toLowerCase()
  const scopeTitle =
    itemNames.length === 0
      ? `selected ${itemsNoun}s`
      : itemNames.length <= NAMES_IN_A_SENTENCE
        ? listNames(itemNames)
        : plural(itemNames.length, itemsNoun)
  const scopeSentence =
    itemNames.length === 1
      ? itemsNoun === "device"
        ? `device ${itemNames[0]}`
        : `the ${itemNames[0]} ${itemsNoun}`
      : itemNames.length <= NAMES_IN_A_SENTENCE && itemNames.length > 0
        ? `the ${itemsNoun}s ${listNames(itemNames)}`
        : `${plural(itemNames.length, `selected ${itemsNoun}`)}`
  const organisation = formatOrganisation(input.organisation)
  const periodText = `${formatDay(from)} - ${formatDay(to)}`

  const changeSentence = (): ReportText | null => {
    if (uptimeChange === null || changeLabel === null) return null
    if (Math.abs(uptimeChange) < BROADLY_UNCHANGED_POINTS) {
      return rich(`Uptime was broadly unchanged between ${changeLabel}.`)
    }
    return rich(
      `Uptime ${uptimeChange > 0 ? "rose" : "fell"} by `,
      strong(`${Math.abs(uptimeChange).toFixed(1)} percentage points`),
      ` between ${changeLabel}.`
    )
  }

  const noDataNames = devices.filter((device) => device.band === "no-data").map((device) => device.name)
  const lowErrorDevices = devices
    .filter((device) => device.errorMargin !== null && device.errorMargin > ERROR_MARGIN_WARNING)
    .sort((a, b) => (b.errorMargin as number) - (a.errorMargin as number))
  const lowCorrelationDevices = devices
    .filter((device) => device.correlation !== null && device.correlation < CORRELATION_WARNING)
    .sort((a, b) => (a.correlation as number) - (b.correlation as number))
  const criticalDevices = devices.filter((device) => device.band === "critical")

  // ── Introduction ──────────────────────────────────────────────────────────
  const introduction: ReportText[] = [
    rich(
      "This report summarises device health for ",
      strong(scopeSentence),
      " from ",
      strong(formatDay(from)),
      " to ",
      strong(formatDay(to)),
      ". It brings together hourly records from ",
      strong(plural(deviceCount, "device")),
      ". Uptime is the main indicator: the share of hours in which a device sent data. Error margin and correlation compare each device's two PM2.5 sensors."
    ),
  ]
  if (averageUptime !== null && reportingDevices.length > 0) {
    const change = changeSentence()
    introduction.push(
      rich(
        "Across the selection, average uptime was ",
        strong(formatPercent(averageUptime)),
        ", which is ",
        strong(UPTIME_BANDS[band].label),
        ". ",
        ...(change ? [...change, { text: " " }] : []),
        "The sections that follow show how uptime changed over the period, which devices need attention and what to do next. Results only reflect the data Beacon received, so connectivity gaps can look like downtime."
      )
    )
  } else {
    introduction.push(
      rich(
        "Beacon received no data from these devices in this period, so the sections that follow are limited to what to check next."
      )
    )
  }

  // ── Key findings ──────────────────────────────────────────────────────────
  const findings: ReportText[] = []
  if (averageUptime !== null && reportingDevices.length > 0) {
    findings.push(
      rich(
        "Average uptime was ",
        strong(formatPercent(averageUptime)),
        " (",
        strong(UPTIME_BANDS[band].label),
        "). ",
        strong(bandCounts.good),
        ` of ${deviceCount} devices reached ${UPTIME_GOOD}% or more, and `,
        strong(bandCounts.critical + bandCounts["no-data"]),
        ` are under ${UPTIME_MODERATE}% or sent nothing.`
      )
    )
    const change = changeSentence()
    if (change) findings.push(change)

    const rankedDays = comparableDays.filter((day) => day.uptime !== null)
    if (rankedDays.length > 1) {
      const best = rankedDays.reduce((top, day) => ((day.uptime as number) > (top.uptime as number) ? day : top))
      const worst = rankedDays.reduce((low, day) => ((day.uptime as number) < (low.uptime as number) ? day : low))
      if (best.key !== worst.key) {
        findings.push(
          rich(
            "The best day was ",
            strong(formatDay(best.date)),
            " at ",
            strong(formatPercent(best.uptime as number)),
            ", and the lowest was ",
            strong(formatDay(worst.date)),
            " at ",
            strong(formatPercent(worst.uptime as number)),
            "."
          )
        )
      }
    }

    if (reportingDevices.length > 1) {
      const describe = (device: ReportDevice) => `${device.name} (${formatPercent(device.uptime ?? 0)})`
      findings.push(
        rich(
          "Lowest uptime among reporting devices: ",
          strong(listNames(reportingDevices.slice(0, NAMES_IN_A_SENTENCE).map(describe))),
          "."
        )
      )
      findings.push(
        rich(
          "Highest uptime: ",
          strong(listNames(reportingDevices.slice(-NAMES_IN_A_SENTENCE).reverse().map(describe))),
          "."
        )
      )
    }
  }
  if (noDataNames.length > 0) {
    findings.push(
      rich(
        strong(plural(noDataNames.length, "device")),
        ` sent no data in this period: ${listNames(noDataNames)}.`
      )
    )
  }
  if (lowErrorDevices.length === 1) {
    const [device] = lowErrorDevices
    findings.push(
      rich(
        strong(device.name),
        ` has an error margin above ${ERROR_MARGIN_WARNING} µg/m³ (${formatErrorMargin(device.errorMargin as number)}).`
      )
    )
  } else if (lowErrorDevices.length > 1) {
    findings.push(
      rich(
        strong(plural(lowErrorDevices.length, "device")),
        ` have an error margin above ${ERROR_MARGIN_WARNING} µg/m³, led by ${listNames(
          lowErrorDevices.map((device) => `${device.name} (${formatErrorMargin(device.errorMargin as number)})`)
        )}.`
      )
    )
  } else if (averageErrorMargin !== null) {
    findings.push(rich(`No device has an error margin above ${ERROR_MARGIN_WARNING} µg/m³.`))
  }
  if (lowCorrelationDevices.length === 1) {
    const [device] = lowCorrelationDevices
    findings.push(
      rich(
        strong(device.name),
        ` has sensors correlating below ${CORRELATION_WARNING} (${(device.correlation as number).toFixed(2)}).`
      )
    )
  } else if (lowCorrelationDevices.length > 1) {
    findings.push(
      rich(
        strong(plural(lowCorrelationDevices.length, "device")),
        ` have sensors correlating below ${CORRELATION_WARNING}, led by ${listNames(
          lowCorrelationDevices.map((device) => `${device.name} (${(device.correlation as number).toFixed(2)})`)
        )}.`
      )
    )
  }

  // ── Conclusion ────────────────────────────────────────────────────────────
  const conclusion: ReportText[] = []
  if (band === "no-data") {
    conclusion.push(rich(`Beacon received nothing from ${scopeSentence} in this period, so its health can't be assessed.`))
  } else {
    const uptimeText = formatPercent(averageUptime as number)
    if (band === "good") {
      conclusion.push(rich(`${capitalise(scopeSentence)} is healthy overall, with average uptime of ${uptimeText}.`))
    } else if (band === "moderate") {
      conclusion.push(rich(`${capitalise(scopeSentence)} is only partly reliable, with average uptime of ${uptimeText}.`))
    } else {
      conclusion.push(rich(`${capitalise(scopeSentence)} needs attention, with average uptime of ${uptimeText}.`))
    }
    const struggling = bandCounts.critical + bandCounts["no-data"]
    if (struggling > 0 && deviceCount > 1) {
      conclusion.push(
        rich(
          `${struggling} of ${deviceCount} devices are under ${UPTIME_MODERATE}% or sent nothing, so getting those back online will do the most to raise the average.`
        )
      )
    }
  }

  // ── Recommendations ───────────────────────────────────────────────────────
  const recommendations: ReportText[] = []
  const namesOf = (list: ReportDevice[]) => list.map((device) => device.name)
  if (noDataNames.length === 1) {
    recommendations.push(rich(`Check power and connectivity on ${noDataNames[0]}, which sent nothing.`))
  } else if (noDataNames.length > 1) {
    recommendations.push(
      rich(`Check power and connectivity on the ${noDataNames.length} devices that sent nothing, starting with ${listNames(noDataNames)}.`)
    )
  }
  if (criticalDevices.length === 1) {
    recommendations.push(rich(`Plan a visit to ${criticalDevices[0].name}, which is under ${UPTIME_MODERATE}% uptime.`))
  } else if (criticalDevices.length > 1) {
    recommendations.push(
      rich(
        `Plan a visit to the ${criticalDevices.length} devices under ${UPTIME_MODERATE}% uptime, starting with ${listNames(namesOf(criticalDevices))}.`
      )
    )
  }
  if (lowErrorDevices.length === 1) {
    recommendations.push(
      rich(`Inspect or replace the PM sensors on ${lowErrorDevices[0].name}, whose error margin is above ${ERROR_MARGIN_WARNING} µg/m³.`)
    )
  } else if (lowErrorDevices.length > 1) {
    recommendations.push(
      rich(
        `Inspect or replace the PM sensors on the ${lowErrorDevices.length} devices with an error margin above ${ERROR_MARGIN_WARNING} µg/m³, starting with ${listNames(namesOf(lowErrorDevices))}.`
      )
    )
  }
  if (lowCorrelationDevices.length === 1) {
    recommendations.push(rich(`Clean or swap the sensors on ${lowCorrelationDevices[0].name}, which disagree, then compare them again.`))
  } else if (lowCorrelationDevices.length > 1) {
    recommendations.push(
      rich(`Clean or swap sensors on the ${lowCorrelationDevices.length} devices whose sensors disagree, then compare them again.`)
    )
  }
  if (uptimeChange !== null && uptimeChange <= -BROADLY_UNCHANGED_POINTS * 5) {
    recommendations.push(rich("Look for a shared cause behind the recent fall in uptime, such as a network or power outage."))
  }
  if (recommendations.length === 0) {
    recommendations.push(rich("No urgent action is needed. Keep to the routine maintenance schedule."))
  }

  const slug = toSlug(itemNames.length === 1 ? itemNames[0] : `${plural(itemNames.length, itemsNoun)}`)

  return {
    title: `Device health report for ${scopeTitle}: ${periodText}`,
    subtitle: `${organisation} · ${plural(deviceCount, "device")}`,
    periodLabel: `Data period: ${format(from, "MMMM d, yyyy")} to ${format(to, "MMMM d, yyyy")}`,
    generatedLabel: `Report generated: ${format(generatedAt, "MMMM d, yyyy")}`,
    filename: `device-health-report-${slug || "selection"}-${format(generatedAt, "yyyy-MM-dd")}.pdf`,
    from,
    to,
    snapshot: [
      { label: "Organisation", value: organisation },
      // The title already names the selection in full, and devices get their own count below
      ...(itemLabel === "Device"
        ? []
        : [
            itemNames.length === 1
              ? { label: itemLabel, value: itemNames[0] }
              : { label: `${itemLabel}s`, value: String(itemNames.length) },
          ]),
      { label: "Devices", value: String(deviceCount) },
      { label: "Devices on the map", value: String(mappedCount) },
      { label: "Period", value: plural(liveDays.length, "day") },
    ],
    devices,
    days,
    weeks,
    hourlyCoverage: hourSlots.map((slots, hour) =>
      slots > 0 && deviceCount > 0 ? (hourHits[hour] / (slots * deviceCount)) * 100 : null
    ),
    bandCounts,
    hasPartialDay: liveDays.some((day) => !day.isComplete),
    showGroups: input.entities.length > 1,
    summary: {
      deviceCount,
      reportingCount: reportingDevices.length,
      mappedCount,
      averageUptime,
      band,
      averageErrorMargin,
      averageCorrelation,
      records,
      uptimeChange,
      changeLabel,
    },
    narrative: { introduction, findings, conclusion, recommendations },
  }
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
