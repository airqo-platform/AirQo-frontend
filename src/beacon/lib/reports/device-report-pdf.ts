import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import {
  UPTIME_BANDS,
  formatErrorMargin,
  type DeviceReport,
  type ReportText,
} from "@/lib/reports/device-report"
import { getMapNote } from "@/lib/reports/report-images"
import {
  CHART_WIDTH,
  HALF_CHART_WIDTH,
  buildBandLegend,
  buildCalendarCharts,
  buildDailyUptimeChart,
  buildDataReceivedChart,
  buildDeviceHeatmap,
  buildDistributionChart,
  buildHourlyPatternChart,
  buildSensorHealthChart,
  buildStatusGauge,
  buildWeeklyChart,
  HEATMAP_DEVICE_LIMIT,
  type ReportChart,
} from "@/lib/reports/report-charts"

export interface ReportSections {
  map: boolean
  mapHeatmap: boolean
  dailyUptime: boolean
  patterns: boolean
  dataReceived: boolean
  sensorHealth: boolean
}

export interface ReportImages {
  /** JPEG data URL of the device map. */
  map?: string | null
  /** PNG data URL of the AirQo logo, 47:32. */
  logo?: string | null
}

const PAGE = { width: 210, height: 297, marginX: 15, top: 15, bottom: 18 }
const CONTENT_WIDTH = PAGE.width - 2 * PAGE.marginX
const GAP = 5
const CARD_PADDING = 5
const CARD_RADIUS = 2

// One chart unit in millimetres, so a full-width chart fills a card and text stays one size
const CHART_SCALE = (CONTENT_WIDTH - 2 * CARD_PADDING) / CHART_WIDTH
const POINTS_PER_MM = 72 / 25.4

const COLORS = {
  ink: "#1c1d20",
  body: "#475569",
  muted: "#64748b",
  border: "#e2e8f0",
  primary: "#145fff",
  headerFill: "#f1f5f9",
  findingsFill: "#eff6ff",
  findingsBorder: "#dbeafe",
  actionFill: "#fffbeb",
  actionBorder: "#fde68a",
}

const BODY_SIZE = 9
const BODY_LINE = 4.5
const HEADING_SIZE = 12
const TABLE_ROW_HEIGHT = 6.5

// Helvetica only covers Latin characters, and jsPDF garbles the whole string on anything else
const toPdfText = (text: string) => text.replace(/[^\u0000-ÿ–—‘’“”•…]/g, "?")

type TextLine = Array<{ text: string; bold: boolean; x: number }>

/**
 * Word-wraps text with bold runs, which jsPDF's own splitter can't do. Each word gets its own
 * position: viewers substitute their own Helvetica, so a run measured here can draw slightly wider
 * there, and whatever followed it would run into it.
 */
function layoutText(pdf: jsPDF, text: ReportText, maxWidth: number, size: number): TextLine[] {
  pdf.setFontSize(size)
  const widthOf = (value: string, bold: boolean) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal")
    // jsPDF overestimates ³, leaving a gap after every µg/m³. A hyphen is its true width in Helvetica.
    return pdf.getTextWidth(value.replace(/³/g, "-"))
  }
  const lines: TextLine[] = [[]]
  let cursor = 0
  let pendingSpace = 0

  for (const part of text) {
    const bold = Boolean(part.bold)
    for (const token of toPdfText(part.text).split(/(\s+)/)) {
      if (!token) continue
      if (/^\s+$/.test(token)) {
        if (cursor > 0) pendingSpace = widthOf(" ", bold)
        continue
      }
      const width = widthOf(token, bold)
      if (cursor > 0 && cursor + pendingSpace + width > maxWidth) {
        lines.push([])
        cursor = 0
        pendingSpace = 0
      }
      lines[lines.length - 1].push({ text: token, bold, x: cursor + pendingSpace })
      cursor += pendingSpace + width
      pendingSpace = 0
    }
  }
  return lines
}

function drawTextLines(pdf: jsPDF, lines: TextLine[], x: number, y: number, size: number, color: string, lineHeight: number) {
  pdf.setFontSize(size)
  pdf.setTextColor(color)
  lines.forEach((line, index) => {
    line.forEach((word) => {
      pdf.setFont("helvetica", word.bold ? "bold" : "normal")
      pdf.text(word.text, x + word.x, y + index * lineHeight)
    })
  })
}

export function drawChart(pdf: jsPDF, chart: ReportChart, originX: number, originY: number, scale = CHART_SCALE) {
  const toX = (value: number) => originX + value * scale
  const toY = (value: number) => originY + value * scale

  for (const shape of chart.shapes) {
    switch (shape.kind) {
      case "rect": {
        pdf.setFillColor(shape.fill)
        if (shape.radius) {
          const radius = Math.min(shape.radius * scale, (shape.w * scale) / 2, (shape.h * scale) / 2)
          pdf.roundedRect(toX(shape.x), toY(shape.y), shape.w * scale, shape.h * scale, radius, radius, "F")
        } else {
          pdf.rect(toX(shape.x), toY(shape.y), shape.w * scale, shape.h * scale, "F")
        }
        break
      }
      case "line": {
        pdf.setDrawColor(shape.stroke)
        pdf.setLineWidth((shape.width ?? 0.6) * scale)
        pdf.setLineDashPattern((shape.dash ?? []).map((part) => part * scale), 0)
        pdf.line(toX(shape.x1), toY(shape.y1), toX(shape.x2), toY(shape.y2))
        pdf.setLineDashPattern([], 0)
        break
      }
      case "circle": {
        pdf.setFillColor(shape.fill)
        pdf.circle(toX(shape.cx), toY(shape.cy), shape.r * scale, "F")
        break
      }
      case "triangle": {
        const [x1, y1, x2, y2, x3, y3] = shape.points
        pdf.setFillColor(shape.fill)
        pdf.triangle(toX(x1), toY(y1), toX(x2), toY(y2), toX(x3), toY(y3), "F")
        break
      }
      case "text": {
        pdf.setFont("helvetica", shape.bold ? "bold" : "normal")
        pdf.setFontSize(shape.size * scale * POINTS_PER_MM)
        pdf.setTextColor(shape.color ?? COLORS.ink)
        pdf.text(toPdfText(shape.text), toX(shape.x), toY(shape.y), {
          align: shape.anchor === "middle" ? "center" : shape.anchor === "end" ? "right" : "left",
          angle: shape.rotate,
        })
        break
      }
    }
  }
}

export function buildDeviceReportPdf(report: DeviceReport, sections: ReportSections, images: ReportImages = {}): jsPDF {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true })
  pdf.setProperties({
    title: report.title,
    subject: "Device health report",
    author: "AirQo Beacon",
    creator: "AirQo Beacon",
  })

  const left = PAGE.marginX
  let y = PAGE.top
  const bottomLimit = PAGE.height - PAGE.bottom

  /** Keeps a block whole: starts a new page if it wouldn't fit on this one. */
  const reserve = (height: number) => {
    if (y + height > bottomLimit && y > PAGE.top) {
      pdf.addPage()
      y = PAGE.top
    }
  }

  const drawCard = (x: number, top: number, width: number, height: number, fill = "#ffffff", border = COLORS.border) => {
    pdf.setDrawColor(border)
    pdf.setFillColor(fill)
    pdf.setLineWidth(0.25)
    pdf.setLineDashPattern([], 0)
    pdf.roundedRect(x, top, width, height, CARD_RADIUS, CARD_RADIUS, "FD")
  }

  const setHeading = (size = HEADING_SIZE, color = COLORS.ink) => {
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(size)
    pdf.setTextColor(color)
  }

  const drawSectionHeading = (text: string, reserveBelow: number) => {
    reserve(7 + reserveBelow)
    setHeading()
    pdf.text(toPdfText(text), left, y + 4)
    y += 7
  }

  const drawChartCard = (title: string, caption: string | null, charts: ReportChart[]) => {
    const captionLines = caption ? layoutText(pdf, [{ text: caption }], CONTENT_WIDTH - 2 * CARD_PADDING, 8) : []
    const chartsHeight = charts.reduce((sum, chart) => sum + chart.height * CHART_SCALE + 2, 0)
    const height = CARD_PADDING + 5 + captionLines.length * 3.8 + 2 + chartsHeight + CARD_PADDING - 2
    reserve(height)
    drawCard(left, y, CONTENT_WIDTH, height)
    setHeading(10.5)
    pdf.text(toPdfText(title), left + CARD_PADDING, y + CARD_PADDING + 2.5)
    let cursor = y + CARD_PADDING + 5
    if (captionLines.length > 0) {
      drawTextLines(pdf, captionLines, left + CARD_PADDING, cursor + 2, 8, COLORS.muted, 3.8)
      cursor += captionLines.length * 3.8
    }
    cursor += 2
    charts.forEach((chart) => {
      drawChart(pdf, chart, left + CARD_PADDING, cursor)
      cursor += chart.height * CHART_SCALE + 2
    })
    y += height + GAP
  }

  const drawTextCard = (
    title: string | null,
    paragraphs: ReportText[],
    options: { fill?: string; border?: string; bullets?: boolean; titleColor?: string } = {}
  ) => {
    const bulletIndent = options.bullets ? 4 : 0
    const width = CONTENT_WIDTH - 2 * CARD_PADDING - bulletIndent
    const blocks = paragraphs.map((paragraph) => layoutText(pdf, paragraph, width, BODY_SIZE))
    const blockGap = 1.8
    const textHeight =
      blocks.reduce((sum, lines) => sum + lines.length * BODY_LINE, 0) + Math.max(blocks.length - 1, 0) * blockGap
    const height = CARD_PADDING + (title ? 7 : 0) + textHeight + CARD_PADDING - 1.5
    reserve(height)
    drawCard(left, y, CONTENT_WIDTH, height, options.fill, options.border)
    if (title) {
      setHeading(HEADING_SIZE, options.titleColor ?? COLORS.ink)
      pdf.text(toPdfText(title), left + CARD_PADDING, y + CARD_PADDING + 3)
    }
    let cursor = y + CARD_PADDING + (title ? 7 : 0) + 2.5
    blocks.forEach((lines) => {
      if (options.bullets) {
        pdf.setFillColor(COLORS.ink)
        pdf.circle(left + CARD_PADDING + 1, cursor - 1.1, 0.6, "F")
      }
      drawTextLines(pdf, lines, left + CARD_PADDING + bulletIndent, cursor, BODY_SIZE, COLORS.body, BODY_LINE)
      cursor += lines.length * BODY_LINE + blockGap
    })
    y += height + GAP
  }

  // ── Header ────────────────────────────────────────────────────────────────
  if (images.logo) pdf.addImage(images.logo, "PNG", left, y, 14.1, 9.6)
  setHeading(9, COLORS.muted)
  pdf.setFont("helvetica", "normal")
  pdf.text("AirQo Beacon", PAGE.width - PAGE.marginX, y + 4, { align: "right" })
  pdf.text("Device health report", PAGE.width - PAGE.marginX, y + 8, { align: "right" })
  y += 15

  const titleLines = layoutText(pdf, [{ text: report.title, bold: true }], CONTENT_WIDTH - 10, 14)
  titleLines.forEach((line, index) => {
    setHeading(14)
    pdf.text(line.map((word) => word.text).join(" "), PAGE.width / 2, y + 4 + index * 6.2, { align: "center" })
  })
  y += 4 + titleLines.length * 6.2

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9.5)
  pdf.setTextColor(COLORS.muted)
  pdf.text(toPdfText(report.subtitle), PAGE.width / 2, y + 0.5, { align: "center" })
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(COLORS.primary)
  pdf.text(toPdfText(report.periodLabel), PAGE.width / 2, y + 5.5, { align: "center" })
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(COLORS.muted)
  pdf.text(toPdfText(report.generatedLabel), PAGE.width / 2, y + 10.5, { align: "center" })
  y += 14
  pdf.setDrawColor(COLORS.border)
  pdf.setLineWidth(0.25)
  pdf.line(left, y, PAGE.width - PAGE.marginX, y)
  y += GAP

  // ── Snapshot and map ──────────────────────────────────────────────────────
  const hasMap = sections.map && Boolean(images.map)
  const snapshotWidth = hasMap ? 66 : CONTENT_WIDTH
  const rowHeight = 6.2
  const snapshotHeight = hasMap ? 60 : CARD_PADDING * 2 + 7 + report.snapshot.length * rowHeight
  reserve(snapshotHeight)
  drawCard(left, y, snapshotWidth, snapshotHeight)
  setHeading(10.5, COLORS.primary)
  pdf.text("Snapshot", left + CARD_PADDING, y + CARD_PADDING + 2.5)
  report.snapshot.forEach((row, index) => {
    const rowY = y + CARD_PADDING + 9 + index * rowHeight
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8.5)
    pdf.setTextColor(COLORS.muted)
    pdf.text(toPdfText(row.label), left + CARD_PADDING, rowY)
    pdf.setTextColor(COLORS.ink)
    // Long cluster names have no spaces to wrap at, so the cut is marked rather than silent
    const maxValueWidth = snapshotWidth - 2 * CARD_PADDING - pdf.getTextWidth(toPdfText(row.label)) - 4
    let value = toPdfText(row.value)
    if (pdf.getTextWidth(value) > maxValueWidth) {
      while (value.length > 1 && pdf.getTextWidth(`${value}...`) > maxValueWidth) value = value.slice(0, -1)
      value = `${value}...`
    }
    pdf.text(value, left + snapshotWidth - CARD_PADDING, rowY, { align: "right" })
  })
  if (hasMap) {
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    pdf.setTextColor(COLORS.primary)
    const noteLines = pdf.splitTextToSize(
      toPdfText(getMapNote(report.devices, sections.mapHeatmap)),
      snapshotWidth - 2 * CARD_PADDING
    ) as string[]
    pdf.text(noteLines, left + CARD_PADDING, y + snapshotHeight - 4.1 - (noteLines.length - 1) * 3.4, {
      lineHeightFactor: 1.2,
    })
    const mapX = left + snapshotWidth + GAP
    const mapWidth = CONTENT_WIDTH - snapshotWidth - GAP
    pdf.addImage(images.map as string, "JPEG", mapX, y, mapWidth, snapshotHeight)
    pdf.setDrawColor(COLORS.border)
    pdf.setLineWidth(0.25)
    pdf.roundedRect(mapX, y, mapWidth, snapshotHeight, 0.5, 0.5, "S")
  }
  y += snapshotHeight + GAP

  // ── Narrative and status ──────────────────────────────────────────────────
  drawTextCard("Introduction", report.narrative.introduction)

  const gauge = buildStatusGauge(report)
  const gaugeHeight = gauge.height * CHART_SCALE + 2 * CARD_PADDING
  drawSectionHeading("Overall device health for the period", gaugeHeight)
  drawCard(left, y, CONTENT_WIDTH, gaugeHeight)
  drawChart(pdf, gauge, left + CARD_PADDING, y + CARD_PADDING)
  y += gaugeHeight + GAP

  // ── Results ───────────────────────────────────────────────────────────────
  const { summary } = report
  const cards = [
    {
      label: "Devices analysed",
      value: String(summary.deviceCount),
      note: `${summary.reportingCount} sent data`,
    },
    {
      label: "Average uptime",
      value: summary.averageUptime === null ? "-" : `${summary.averageUptime.toFixed(1)}%`,
      note: UPTIME_BANDS[summary.band].label,
    },
    {
      label: "Average error margin",
      value: summary.averageErrorMargin === null ? "-" : formatErrorMargin(summary.averageErrorMargin),
      note: "PM2.5 sensor 1 vs 2",
    },
    {
      label: "Uptime change",
      value:
        summary.uptimeChange === null
          ? "-"
          : `${summary.uptimeChange > 0 ? "+" : ""}${summary.uptimeChange.toFixed(1)} pts`,
      note: summary.changeLabel ? `Between ${summary.changeLabel}` : "Not enough days to compare",
    },
  ]
  const statHeight = 24
  drawSectionHeading("Results", statHeight)
  const statWidth = (CONTENT_WIDTH - 3 * 4) / 4
  cards.forEach((card, index) => {
    const x = left + index * (statWidth + 4)
    drawCard(x, y, statWidth, statHeight)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    pdf.setTextColor(COLORS.muted)
    pdf.text(card.label, x + 3.5, y + 5.5)
    setHeading(13)
    pdf.text(toPdfText(card.value), x + 3.5, y + 12.5)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(7)
    pdf.setTextColor(COLORS.muted)
    pdf.text(pdf.splitTextToSize(card.note, statWidth - 6) as string[], x + 3.5, y + 17.5, { lineHeightFactor: 1.15 })
  })
  y += statHeight + GAP

  // ── Charts ────────────────────────────────────────────────────────────────
  if (sections.dailyUptime && report.days.length > 0) {
    drawChartCard(
      "Average uptime per day",
      report.hasPartialDay ? "Share of possible device-hours with data. A day still in progress only counts the hours so far." : "Share of possible device-hours with data.",
      [buildDailyUptimeChart(report)]
    )

    const legend = buildBandLegend()
    const calendars = buildCalendarCharts(report)
    calendars.forEach((calendar, index) => {
      const isLast = index === calendars.length - 1
      drawChartCard(
        index === 0 ? "Calendar of daily uptime" : "Calendar of daily uptime, continued",
        index === 0 ? "Each cell shows that day's average uptime across the selected devices." : null,
        isLast ? [calendar, legend] : [calendar]
      )
    })

    // Two half-width cards side by side
    const distribution = buildDistributionChart(report)
    const weekly = buildWeeklyChart(report)
    const halfScale = CHART_SCALE
    const halfWidth = (CONTENT_WIDTH - GAP) / 2
    const halfChartWidth = HALF_CHART_WIDTH * halfScale
    const inset = Math.max((halfWidth - halfChartWidth) / 2, 2)
    const halfHeight =
      CARD_PADDING + 11 + Math.max(distribution.height, weekly.height) * halfScale + CARD_PADDING - 1
    reserve(halfHeight)
    ;[
      { title: "Devices by uptime", caption: "Over the whole period", chart: distribution },
      { title: "Uptime by week", caption: "Weeks start on Monday", chart: weekly },
    ].forEach((card, index) => {
      const x = left + index * (halfWidth + GAP)
      drawCard(x, y, halfWidth, halfHeight)
      setHeading(10.5)
      pdf.text(card.title, x + inset, y + CARD_PADDING + 2.5)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      pdf.setTextColor(COLORS.muted)
      pdf.text(card.caption, x + inset, y + CARD_PADDING + 7)
      drawChart(pdf, card.chart, x + inset, y + CARD_PADDING + 10, halfScale)
    })
    y += halfHeight + GAP
  }

  if (sections.patterns && report.devices.length > 0) {
    drawChartCard("Uptime by hour of day", "Share of possible device-hours with data for each hour, in your local time.", [
      buildHourlyPatternChart(report),
    ])
    drawChartCard(
      "Uptime by device and day",
      report.devices.length > HEATMAP_DEVICE_LIMIT
        ? `The ${HEATMAP_DEVICE_LIMIT} devices with the lowest uptime, out of ${report.devices.length}. Numbers are that day's uptime in percent.`
        : "Numbers are that day's uptime in percent. Grey means no data.",
      [buildDeviceHeatmap(report), buildBandLegend()]
    )
  }

  if (sections.dataReceived && report.days.length > 0) {
    drawChartCard("Readings received per day", `${summary.records.toLocaleString("en")} readings across the period.`, [
      buildDataReceivedChart(report),
    ])
  }

  if (sections.sensorHealth) {
    const sensorChart = buildSensorHealthChart(report)
    if (sensorChart) {
      drawChartCard(
        "Largest sensor error margins",
        `Gap between each device's two PM2.5 sensors. Average correlation is ${
          summary.averageCorrelation === null ? "not available" : summary.averageCorrelation.toFixed(2)
        }.`,
        [sensorChart]
      )
    }
  }

  // ── Findings, conclusion and recommendations ──────────────────────────────
  drawTextCard("Key findings", report.narrative.findings, {
    bullets: true,
    fill: COLORS.findingsFill,
    border: COLORS.findingsBorder,
  })

  drawTextCard("Conclusion", report.narrative.conclusion)
  drawTextCard("Recommendations", report.narrative.recommendations, {
    bullets: true,
    fill: COLORS.actionFill,
    border: COLORS.actionBorder,
  })

  // ── Device comparison, last because it can run to many pages ──────────────
  // Starts on a fresh page when that keeps a short table whole
  const tableHeight = 12 + (report.devices.length + 1) * TABLE_ROW_HEIGHT
  const fitsOnOnePage = tableHeight <= bottomLimit - PAGE.top
  drawSectionHeading("Device comparison", fitsOnOnePage ? tableHeight : 20)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(8)
  pdf.setTextColor(COLORS.muted)
  pdf.text("Lowest uptime first.", left, y + 0.5)
  y += 3

  const statusColumn = report.showGroups ? 3 : 2
  autoTable(pdf, {
    startY: y,
    margin: { left, right: PAGE.marginX, top: PAGE.top, bottom: PAGE.bottom },
    showHead: "everyPage",
    rowPageBreak: "avoid",
    head: [
      [
        "Device",
        ...(report.showGroups ? ["Clusters"] : []),
        "Uptime",
        "Status",
        "Error margin",
        "Correlation",
        "Readings",
        "Last seen",
      ],
    ],
    body: report.devices.map((device) => [
      toPdfText(device.name),
      ...(report.showGroups ? [toPdfText(device.groups.join(", "))] : []),
      device.uptime === null ? "-" : `${device.uptime.toFixed(1)}%`,
      UPTIME_BANDS[device.band].label,
      device.errorMargin === null ? "-" : `±${device.errorMargin.toFixed(1)}`,
      device.correlation === null ? "-" : device.correlation.toFixed(2),
      device.records.toLocaleString("en"),
      device.lastSeen ? format(device.lastSeen, "MMM d, HH:mm") : "-",
    ]),
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 1.8, bottom: 1.8, left: 2, right: 2 },
      textColor: COLORS.ink,
      lineColor: COLORS.border,
      lineWidth: { bottom: 0.2 },
      overflow: "ellipsize",
    },
    headStyles: { fillColor: COLORS.headerFill, textColor: COLORS.body, fontStyle: "bold", lineWidth: 0 },
    alternateRowStyles: { fillColor: "#ffffff" },
    columnStyles: {
      0: { cellWidth: "auto", fontStyle: "bold" },
      [statusColumn]: { cellPadding: { top: 1.8, bottom: 1.8, left: 5.5, right: 2 } },
    },
    didDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== statusColumn) return
      const device = report.devices[data.row.index]
      pdf.setFillColor(UPTIME_BANDS[device.band].color)
      pdf.circle(data.cell.x + 3, data.cell.y + data.cell.height / 2, 1.1, "F")
    },
  })

  // ── Footers, once the page count is known ─────────────────────────────────
  const pageCount = pdf.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    pdf.setTextColor(COLORS.muted)
    pdf.text(`Page ${page} of ${pageCount}`, PAGE.width / 2, PAGE.height - 9, { align: "center" })
    pdf.text("AirQo Beacon", left, PAGE.height - 9)
    pdf.text(format(report.to, "MMM d, yyyy"), PAGE.width - PAGE.marginX, PAGE.height - 9, { align: "right" })
  }

  return pdf
}

export function downloadDeviceReportPdf(report: DeviceReport, sections: ReportSections, images: ReportImages = {}) {
  buildDeviceReportPdf(report, sections, images).save(report.filename)
}
