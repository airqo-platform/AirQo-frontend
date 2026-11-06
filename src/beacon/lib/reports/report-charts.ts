import { format, getDaysInMonth, getISODay, startOfMonth } from "date-fns"
import {
  BAND_ORDER,
  CORRELATION_WARNING,
  ERROR_MARGIN_GOOD,
  ERROR_MARGIN_WARNING,
  UPTIME_BANDS,
  UPTIME_GOOD,
  UPTIME_MODERATE,
  getUptimeBand,
  type DeviceReport,
} from "@/lib/reports/device-report"

/**
 * Report charts as plain shapes. The preview draws them as SVG and the PDF as vector graphics, so
 * a chart looks the same in both and stays sharp at any zoom. Units are arbitrary: a full-width
 * chart is CHART_WIDTH across and half-width charts are HALF_CHART_WIDTH, which keeps text the same
 * size in every chart.
 */

export const CHART_WIDTH = 720
export const HALF_CHART_WIDTH = 350

export const REPORT_COLORS = {
  ink: "#1c1d20",
  muted: "#64748b",
  axis: "#475569",
  grid: "#e2e8f0",
  primary: "#145fff",
  outside: "#f1f5f9",
  goodLine: "#15803d",
  criticalLine: "#b91c1c",
  warningLine: "#b45309",
} as const

export type ChartShape =
  | { kind: "rect"; x: number; y: number; w: number; h: number; fill: string; radius?: number }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; width?: number; dash?: number[] }
  | {
      kind: "text"
      x: number
      y: number
      text: string
      size: number
      color?: string
      bold?: boolean
      anchor?: "start" | "middle" | "end"
      /** Degrees anticlockwise. */
      rotate?: number
    }
  | { kind: "circle"; cx: number; cy: number; r: number; fill: string }
  | { kind: "triangle"; points: [number, number, number, number, number, number]; fill: string }

export interface ReportChart {
  width: number
  height: number
  shapes: ChartShape[]
}

const LABEL_SIZE = 9
const SMALL_SIZE = 8
const THRESHOLD_LABEL_WIDTH = 130

const truncate = (text: string, length: number) => (text.length > length ? `${text.slice(0, length - 1)}…` : text)

/** A round number at or above `value`, for a chart's top gridline. */
export function niceMax(value: number): number {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10
  return step * magnitude
}

const compactNumber = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k`
  return String(Math.round(value))
}

interface BarOptions {
  height: number
  values: Array<number | null>
  labels: string[]
  maxValue: number
  yTicks: number[]
  formatTick: (value: number) => string
  formatValue?: (value: number) => string
  barColor?: string
  thresholds?: Array<{ value: number; label: string; color: string }>
  labelEvery?: number
}

function buildBarChart(options: BarOptions): ReportChart {
  const { height, values, labels, maxValue, yTicks, formatTick, formatValue, thresholds = [] } = options
  const left = 34
  const right = 8
  // Threshold labels get their own row above the plot, clear of the bars
  const top = thresholds.length > 0 ? 26 : 12
  const bottom = 22
  const plotWidth = CHART_WIDTH - left - right
  const plotHeight = height - top - bottom
  const baseline = top + plotHeight
  const yFor = (value: number) => baseline - (Math.min(value, maxValue) / maxValue) * plotHeight
  const slot = plotWidth / Math.max(values.length, 1)
  const barWidth = Math.max(1, Math.min(slot * 0.72, 70))
  const labelEvery = options.labelEvery ?? Math.max(1, Math.ceil(values.length / 14))
  const shapes: ChartShape[] = []

  yTicks.forEach((tick) => {
    shapes.push({ kind: "line", x1: left, y1: yFor(tick), x2: left + plotWidth, y2: yFor(tick), stroke: REPORT_COLORS.grid })
    shapes.push({
      kind: "text",
      x: left - 5,
      y: yFor(tick) + 3,
      text: formatTick(tick),
      size: SMALL_SIZE,
      color: REPORT_COLORS.muted,
      anchor: "end",
    })
  })

  // Behind the bars, so the lines never run through a bar's value
  thresholds.forEach((threshold, index) => {
    const y = yFor(threshold.value)
    shapes.push({
      kind: "line",
      x1: left,
      y1: y,
      x2: left + plotWidth,
      y2: y,
      stroke: threshold.color,
      width: 1.2,
      dash: [5, 3],
    })
    const labelRight = left + plotWidth - (thresholds.length - 1 - index) * THRESHOLD_LABEL_WIDTH
    shapes.push({
      kind: "line",
      x1: labelRight - THRESHOLD_LABEL_WIDTH + 12,
      y1: 7,
      x2: labelRight - THRESHOLD_LABEL_WIDTH + 30,
      y2: 7,
      stroke: threshold.color,
      width: 1.2,
      dash: [5, 3],
    })
    shapes.push({
      kind: "text",
      x: labelRight - THRESHOLD_LABEL_WIDTH + 34,
      y: 10,
      text: threshold.label,
      size: SMALL_SIZE,
      bold: true,
      color: threshold.color,
    })
  })

  values.forEach((value, index) => {
    const centre = left + slot * index + slot / 2
    if (value !== null && value > 0) {
      const y = yFor(value)
      shapes.push({
        kind: "rect",
        x: centre - barWidth / 2,
        y,
        w: barWidth,
        h: Math.max(baseline - y, 0.5),
        fill: options.barColor ?? REPORT_COLORS.primary,
        radius: barWidth > 6 ? 1.5 : 0,
      })
    }
    if (value !== null && formatValue && slot >= 24) {
      const fitsInside = baseline - yFor(value) >= 16
      shapes.push({
        kind: "text",
        x: centre,
        y: fitsInside ? yFor(value) + 11 : yFor(value) - 3,
        text: formatValue(value),
        size: SMALL_SIZE,
        bold: fitsInside,
        color: fitsInside ? "#ffffff" : REPORT_COLORS.ink,
        anchor: "middle",
      })
    }
    if (index % labelEvery === 0) {
      shapes.push({
        kind: "text",
        x: centre,
        y: baseline + 14,
        text: labels[index],
        size: SMALL_SIZE,
        color: REPORT_COLORS.muted,
        anchor: "middle",
      })
    }
  })

  shapes.push({ kind: "line", x1: left, y1: baseline, x2: left + plotWidth, y2: baseline, stroke: REPORT_COLORS.axis })

  return { width: CHART_WIDTH, height, shapes }
}

const UPTIME_THRESHOLDS = [
  { value: UPTIME_GOOD, label: `Good: ${UPTIME_GOOD}%`, color: REPORT_COLORS.goodLine },
  { value: UPTIME_MODERATE, label: `Critical: under ${UPTIME_MODERATE}%`, color: REPORT_COLORS.criticalLine },
]

/** The uptime scale with a marker at the average, and the average spelled out beneath it. */
export function buildStatusGauge(report: DeviceReport): ReportChart {
  const { averageUptime, band } = report.summary
  const barTop = 16
  const barHeight = 14
  const zones = [
    { from: 0, to: UPTIME_MODERATE, band: "critical" as const },
    { from: UPTIME_MODERATE, to: UPTIME_GOOD, band: "moderate" as const },
    { from: UPTIME_GOOD, to: 100, band: "good" as const },
  ]
  const xFor = (value: number) => (value / 100) * CHART_WIDTH
  const shapes: ChartShape[] = []

  zones.forEach((zone) => {
    shapes.push({
      kind: "rect",
      x: xFor(zone.from),
      y: barTop,
      w: xFor(zone.to) - xFor(zone.from),
      h: barHeight,
      fill: UPTIME_BANDS[zone.band].color,
    })
    shapes.push({
      kind: "text",
      x: (xFor(zone.from) + xFor(zone.to)) / 2,
      y: barTop + barHeight + 14,
      text: `${UPTIME_BANDS[zone.band].label} (${UPTIME_BANDS[zone.band].range})`,
      size: LABEL_SIZE,
      color: REPORT_COLORS.axis,
      anchor: "middle",
    })
  })

  const hasValue = averageUptime !== null && band !== "no-data"
  if (hasValue) {
    const x = xFor(averageUptime as number)
    shapes.push({ kind: "triangle", points: [x - 6, barTop - 9, x + 6, barTop - 9, x, barTop - 1], fill: REPORT_COLORS.ink })
  }

  const circleY = barTop + barHeight + 48
  shapes.push({ kind: "circle", cx: CHART_WIDTH / 2 - 64, cy: circleY, r: 24, fill: UPTIME_BANDS[band].color })
  shapes.push({
    kind: "text",
    x: CHART_WIDTH / 2 - 64,
    y: circleY + 4.5,
    text: hasValue ? `${(averageUptime as number).toFixed(1)}` : "-",
    size: 13,
    bold: true,
    color: REPORT_COLORS.ink,
    anchor: "middle",
  })
  shapes.push({
    kind: "text",
    x: CHART_WIDTH / 2 - 30,
    y: circleY - 2,
    text: UPTIME_BANDS[band].label,
    size: 14,
    bold: true,
    color: REPORT_COLORS.ink,
  })
  shapes.push({
    kind: "text",
    x: CHART_WIDTH / 2 - 30,
    y: circleY + 13,
    text: hasValue ? `${(averageUptime as number).toFixed(1)}% average uptime` : "No data received",
    size: LABEL_SIZE,
    color: REPORT_COLORS.axis,
  })

  return { width: CHART_WIDTH, height: circleY + 28, shapes }
}

export function buildDailyUptimeChart(report: DeviceReport): ReportChart {
  const days = report.days.filter((day) => day.expectedHours > 0)
  return buildBarChart({
    height: 200,
    values: days.map((day) => day.uptime),
    labels: days.map((day) => format(day.date, "MMM d")),
    maxValue: 100,
    yTicks: [0, 25, 50, 75, 100],
    formatTick: (value) => `${value}%`,
    formatValue: (value) => `${Math.round(value)}%`,
    thresholds: UPTIME_THRESHOLDS,
  })
}

export function buildDataReceivedChart(report: DeviceReport): ReportChart {
  const days = report.days.filter((day) => day.expectedHours > 0)
  const maxValue = niceMax(Math.max(...days.map((day) => day.records), 1))
  return buildBarChart({
    height: 150,
    values: days.map((day) => day.records),
    labels: days.map((day) => format(day.date, "MMM d")),
    maxValue,
    yTicks: [0, maxValue / 2, maxValue],
    formatTick: compactNumber,
    formatValue: compactNumber,
  })
}

export function buildHourlyPatternChart(report: DeviceReport): ReportChart {
  return buildBarChart({
    height: 140,
    values: report.hourlyCoverage,
    labels: report.hourlyCoverage.map((_, hour) => `${String(hour).padStart(2, "0")}:00`),
    maxValue: 100,
    yTicks: [0, 50, 100],
    formatTick: (value) => `${value}%`,
    labelEvery: 3,
  })
}

/** Month grids, two to a row, each cell coloured by that day's uptime. One chart per row of months. */
export function buildCalendarCharts(report: DeviceReport): ReportChart[] {
  const byKey = new Map(report.days.map((day) => [day.key, day]))
  const monthStarts = Array.from(
    new Map(report.days.map((day) => [format(day.date, "yyyy-MM"), startOfMonth(day.date)])).values()
  )
  const cell = 48
  const gap = 2
  const monthWidth = 7 * (cell + gap) - gap
  const monthGap = CHART_WIDTH - 2 * monthWidth
  const rowHeight = 32
  const headerHeight = 34
  const charts: ReportChart[] = []

  for (let index = 0; index < monthStarts.length; index += 2) {
    const months = monthStarts.slice(index, index + 2)
    const shapes: ChartShape[] = []
    let tallest = 0

    months.forEach((monthStart, monthIndex) => {
      const offsetX = months.length === 1 ? (CHART_WIDTH - monthWidth) / 2 : monthIndex * (monthWidth + monthGap)
      shapes.push({
        kind: "text",
        x: offsetX + monthWidth / 2,
        y: 11,
        text: format(monthStart, "MMMM yyyy"),
        size: 11,
        bold: true,
        color: REPORT_COLORS.ink,
        anchor: "middle",
      })
      ;["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((weekday, column) => {
        shapes.push({
          kind: "text",
          x: offsetX + column * (cell + gap) + cell / 2,
          y: 27,
          text: weekday,
          size: SMALL_SIZE,
          color: REPORT_COLORS.muted,
          anchor: "middle",
        })
      })

      const leadingBlanks = getISODay(monthStart) - 1
      const dayCount = getDaysInMonth(monthStart)
      for (let dayNumber = 1; dayNumber <= dayCount; dayNumber += 1) {
        const position = leadingBlanks + dayNumber - 1
        const x = offsetX + (position % 7) * (cell + gap)
        const y = headerHeight + Math.floor(position / 7) * (rowHeight + gap)
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNumber)
        const day = byKey.get(format(date, "yyyy-MM-dd"))
        const inPeriod = Boolean(day && day.expectedHours > 0)
        const uptime = day?.uptime ?? null
        shapes.push({
          kind: "rect",
          x,
          y,
          w: cell,
          h: rowHeight,
          fill: inPeriod ? UPTIME_BANDS[getUptimeBand(uptime)].color : REPORT_COLORS.outside,
        })
        shapes.push({
          kind: "text",
          x: x + 4,
          y: y + 10,
          text: String(dayNumber),
          size: SMALL_SIZE,
          bold: inPeriod,
          color: inPeriod ? REPORT_COLORS.ink : REPORT_COLORS.muted,
        })
        if (inPeriod && uptime !== null) {
          shapes.push({
            kind: "text",
            x: x + cell / 2,
            y: y + 25,
            text: `${Math.round(uptime)}%`,
            size: LABEL_SIZE,
            bold: true,
            color: REPORT_COLORS.ink,
            anchor: "middle",
          })
        }
        tallest = Math.max(tallest, y + rowHeight)
      }
    })

    charts.push({ width: CHART_WIDTH, height: tallest + 2, shapes })
  }

  return charts
}

/** Small colour key for anything using the uptime bands. */
export function buildBandLegend(): ReportChart {
  const shapes: ChartShape[] = []
  const itemWidth = 130
  const startX = (CHART_WIDTH - itemWidth * BAND_ORDER.length) / 2
  BAND_ORDER.forEach((band, index) => {
    const x = startX + index * itemWidth
    shapes.push({ kind: "rect", x, y: 2, w: 12, h: 9, fill: UPTIME_BANDS[band].color, radius: 1.5 })
    shapes.push({
      kind: "text",
      x: x + 17,
      y: 10,
      text: `${UPTIME_BANDS[band].label}: ${UPTIME_BANDS[band].range.toLowerCase()}`,
      size: SMALL_SIZE,
      color: REPORT_COLORS.axis,
    })
  })
  return { width: CHART_WIDTH, height: 14, shapes }
}

function buildHorizontalRows(
  rows: Array<{ label: string; sublabel?: string; value: number; display: string; color: string }>,
  maxValue: number
): ReportChart {
  const rowHeight = 32
  const labelWidth = 98
  const valueWidth = 56
  const barWidth = HALF_CHART_WIDTH - labelWidth - valueWidth
  const shapes: ChartShape[] = []

  rows.forEach((row, index) => {
    const y = index * rowHeight
    const hasSublabel = Boolean(row.sublabel)
    shapes.push({
      kind: "text",
      x: 0,
      y: y + (hasSublabel ? 12 : 17),
      text: row.label,
      size: LABEL_SIZE,
      bold: hasSublabel,
      color: REPORT_COLORS.ink,
    })
    if (row.sublabel) {
      shapes.push({ kind: "text", x: 0, y: y + 23, text: row.sublabel, size: SMALL_SIZE, color: REPORT_COLORS.muted })
    }
    shapes.push({ kind: "rect", x: labelWidth, y: y + 8, w: barWidth, h: 12, fill: REPORT_COLORS.outside, radius: 2 })
    if (row.value > 0) {
      shapes.push({
        kind: "rect",
        x: labelWidth,
        y: y + 8,
        w: Math.max((row.value / maxValue) * barWidth, 2),
        h: 12,
        fill: row.color,
        radius: 2,
      })
    }
    shapes.push({
      kind: "text",
      x: HALF_CHART_WIDTH,
      y: y + 17.5,
      text: row.display,
      size: LABEL_SIZE,
      bold: true,
      color: REPORT_COLORS.ink,
      anchor: "end",
    })
  })

  return { width: HALF_CHART_WIDTH, height: rows.length * rowHeight, shapes }
}

export function buildDistributionChart(report: DeviceReport): ReportChart {
  const total = Math.max(report.summary.deviceCount, 1)
  return buildHorizontalRows(
    BAND_ORDER.map((band) => ({
      label: UPTIME_BANDS[band].label,
      sublabel: UPTIME_BANDS[band].range,
      value: report.bandCounts[band],
      display: `${report.bandCounts[band]} (${Math.round((report.bandCounts[band] / total) * 100)}%)`,
      color: UPTIME_BANDS[band].color,
    })),
    total
  )
}

const WEEKS_SHOWN = 8

export function buildWeeklyChart(report: DeviceReport): ReportChart {
  return buildHorizontalRows(
    report.weeks.slice(-WEEKS_SHOWN).map((week) => ({
      label: week.label,
      value: week.uptime ?? 0,
      display: week.uptime === null ? "-" : `${week.uptime.toFixed(1)}%`,
      color: UPTIME_BANDS[getUptimeBand(week.uptime)].color,
    })),
    100
  )
}

export const HEATMAP_DEVICE_LIMIT = 20

/** One row per device and one column per day, for the devices with the lowest uptime. */
export function buildDeviceHeatmap(report: DeviceReport): ReportChart {
  const days = report.days.filter((day) => day.expectedHours > 0)
  const devices = report.devices.slice(0, HEATMAP_DEVICE_LIMIT)
  const labelWidth = 130
  const headerHeight = 18
  const rowHeight = 17
  const columnWidth = (CHART_WIDTH - labelWidth) / Math.max(days.length, 1)
  const labelEvery = Math.max(1, Math.ceil(44 / columnWidth))
  const shapes: ChartShape[] = []

  days.forEach((day, column) => {
    if (column % labelEvery === 0) {
      shapes.push({
        kind: "text",
        x: labelWidth + column * columnWidth + columnWidth / 2,
        y: 11,
        text: format(day.date, "MMM d"),
        size: SMALL_SIZE,
        color: REPORT_COLORS.muted,
        anchor: "middle",
      })
    }
  })

  devices.forEach((device, row) => {
    const y = headerHeight + row * rowHeight
    shapes.push({
      kind: "text",
      x: 0,
      y: y + 11.5,
      text: truncate(device.name, 26),
      size: SMALL_SIZE,
      color: REPORT_COLORS.ink,
    })
    days.forEach((day, column) => {
      const hours = device.days[day.key]?.hours ?? 0
      const uptime = (hours / day.expectedHours) * 100
      shapes.push({
        kind: "rect",
        x: labelWidth + column * columnWidth,
        y,
        w: Math.max(columnWidth - 1, 0.5),
        h: rowHeight - 1,
        fill: hours > 0 ? UPTIME_BANDS[getUptimeBand(uptime)].color : REPORT_COLORS.grid,
      })
      if (columnWidth >= 26 && hours > 0) {
        shapes.push({
          kind: "text",
          x: labelWidth + column * columnWidth + (columnWidth - 1) / 2,
          y: y + 11,
          text: `${Math.round(uptime)}`,
          size: 7.5,
          color: REPORT_COLORS.ink,
          anchor: "middle",
        })
      }
    })
  })

  return { width: CHART_WIDTH, height: headerHeight + devices.length * rowHeight + 2, shapes }
}

const SENSOR_ROWS = 10

/** The largest gaps between each device's two PM2.5 sensors, with its correlation alongside. */
export function buildSensorHealthChart(report: DeviceReport): ReportChart | null {
  const devices = report.devices
    .filter((device) => device.errorMargin !== null)
    .sort((a, b) => (b.errorMargin as number) - (a.errorMargin as number))
    .slice(0, SENSOR_ROWS)
  if (devices.length === 0) return null

  const labelWidth = 130
  const correlationColumn = 62
  const marginColumnEnd = CHART_WIDTH - correlationColumn
  const barWidth = marginColumnEnd - 66 - labelWidth
  const headerHeight = 22
  const rowHeight = 20
  const maxValue = Math.max(niceMax(devices[0].errorMargin as number), ERROR_MARGIN_WARNING + 1)
  const xFor = (value: number) => labelWidth + (value / maxValue) * barWidth
  const plotBottom = headerHeight + devices.length * rowHeight
  const shapes: ChartShape[] = [
    {
      kind: "text",
      x: marginColumnEnd,
      y: 12,
      text: "Error margin",
      size: SMALL_SIZE,
      bold: true,
      color: REPORT_COLORS.axis,
      anchor: "end",
    },
    {
      kind: "text",
      x: CHART_WIDTH,
      y: 12,
      text: "Correlation",
      size: SMALL_SIZE,
      bold: true,
      color: REPORT_COLORS.axis,
      anchor: "end",
    },
  ]

  // A key rather than labels on the lines, which an outlier can squeeze together. Behind the bars.
  ;[
    { value: ERROR_MARGIN_GOOD, color: REPORT_COLORS.warningLine },
    { value: ERROR_MARGIN_WARNING, color: REPORT_COLORS.criticalLine },
  ].forEach(({ value, color }, index) => {
    shapes.push({
      kind: "line",
      x1: xFor(value),
      y1: headerHeight,
      x2: xFor(value),
      y2: plotBottom,
      stroke: color,
      width: 1,
      dash: [4, 3],
    })
    const keyX = labelWidth + index * 76
    shapes.push({ kind: "line", x1: keyX, y1: 9, x2: keyX + 16, y2: 9, stroke: color, width: 1, dash: [4, 3] })
    shapes.push({
      kind: "text",
      x: keyX + 20,
      y: 12,
      text: `${value} µg/m³`,
      size: SMALL_SIZE,
      bold: true,
      color,
    })
  })

  devices.forEach((device, row) => {
    const y = headerHeight + row * rowHeight
    const margin = device.errorMargin as number
    let color = UPTIME_BANDS.good.color
    if (margin > ERROR_MARGIN_WARNING) color = UPTIME_BANDS.critical.color
    else if (margin > ERROR_MARGIN_GOOD) color = "#eab308"
    shapes.push({
      kind: "text",
      x: 0,
      y: y + 13,
      text: truncate(device.name, 26),
      size: SMALL_SIZE,
      color: REPORT_COLORS.ink,
    })
    shapes.push({ kind: "rect", x: labelWidth, y: y + 4, w: Math.max(xFor(margin) - labelWidth, 1), h: 12, fill: color, radius: 1.5 })
    shapes.push({
      kind: "text",
      x: marginColumnEnd,
      y: y + 13,
      text: `±${margin.toFixed(1)}`,
      size: SMALL_SIZE,
      bold: true,
      color: REPORT_COLORS.ink,
      anchor: "end",
    })
    const correlation = device.correlation
    shapes.push({
      kind: "text",
      x: CHART_WIDTH,
      y: y + 13,
      text: correlation === null ? "-" : correlation.toFixed(2),
      size: SMALL_SIZE,
      bold: correlation !== null && correlation < CORRELATION_WARNING,
      color: correlation !== null && correlation < CORRELATION_WARNING ? REPORT_COLORS.criticalLine : REPORT_COLORS.ink,
      anchor: "end",
    })
  })

  return { width: CHART_WIDTH, height: plotBottom + 2, shapes }
}
