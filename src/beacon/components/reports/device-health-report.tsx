"use client"

import type { ReactNode } from "react"
import { format } from "date-fns"
import { Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  UPTIME_BANDS,
  formatErrorMargin,
  type DeviceReport,
  type ReportText,
} from "@/lib/reports/device-report"
import type { ReportSections } from "@/lib/reports/device-report-pdf"
import { getMapNote } from "@/lib/reports/report-images"
import {
  HEATMAP_DEVICE_LIMIT,
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
  type ReportChart,
} from "@/lib/reports/report-charts"

const TABLE_PREVIEW_ROWS = 25

export interface ReportMapState {
  status: "loading" | "ready" | "unavailable"
  image: string | null
}

function ChartSvg({ chart, label }: Readonly<{ chart: ReportChart; label: string }>) {
  return (
    <svg
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {chart.shapes.map((shape, index) => {
        switch (shape.kind) {
          case "rect":
            return <rect key={index} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.radius} fill={shape.fill} />
          case "line":
            return (
              <line
                key={index}
                x1={shape.x1}
                y1={shape.y1}
                x2={shape.x2}
                y2={shape.y2}
                stroke={shape.stroke}
                strokeWidth={shape.width ?? 0.6}
                strokeDasharray={shape.dash?.join(" ")}
              />
            )
          case "circle":
            return <circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill} />
          case "triangle": {
            const [x1, y1, x2, y2, x3, y3] = shape.points
            return <polygon key={index} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill={shape.fill} />
          }
          case "text":
            return (
              <text
                key={index}
                x={shape.x}
                y={shape.y}
                fontSize={shape.size}
                fontWeight={shape.bold ? 700 : 400}
                fill={shape.color ?? "#1c1d20"}
                textAnchor={shape.anchor ?? "start"}
                transform={shape.rotate ? `rotate(${-shape.rotate} ${shape.x} ${shape.y})` : undefined}
              >
                {shape.text}
              </text>
            )
        }
      })}
    </svg>
  )
}

function RichText({ text }: Readonly<{ text: ReportText }>) {
  return (
    <>
      {text.map((part, index) =>
        part.bold ? (
          <strong key={index} className="font-semibold text-slate-800">
            {part.text}
          </strong>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  )
}

function ReportCard({
  id,
  title,
  caption,
  filename,
  onSaveImage,
  children,
}: Readonly<{
  id: string
  title: string
  caption?: string | null
  filename: string
  onSaveImage: (elementId: string, filename: string) => void
  children: ReactNode
}>) {
  return (
    <section id={id} className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[#1c1d20]">{title}</h3>
          {caption && <p className="mt-0.5 text-xs text-slate-500">{caption}</p>}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-html2canvas-ignore
          onClick={() => onSaveImage(id, filename)}
          className="h-8 gap-1.5 border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        >
          <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Save image
        </Button>
      </div>
      {children}
    </section>
  )
}

function SectionHeading({ children }: Readonly<{ children: ReactNode }>) {
  return <h2 className="text-lg font-semibold text-[#1c1d20]">{children}</h2>
}

interface DeviceHealthReportProps {
  report: DeviceReport
  sections: ReportSections
  map: ReportMapState
  onSaveImage: (elementId: string, filename: string) => void
}

/** The report as it will export. It's a sheet of paper, so it stays white in dark mode too. */
export function DeviceHealthReport({ report, sections, map, onSaveImage }: Readonly<DeviceHealthReportProps>) {
  const { summary, narrative } = report
  const legend = buildBandLegend()
  const sensorChart = sections.sensorHealth ? buildSensorHealthChart(report) : null
  const hasDays = report.days.length > 0
  const hiddenDevices = report.devices.length - TABLE_PREVIEW_ROWS

  const resultCards = [
    { label: "Devices analysed", value: String(summary.deviceCount), note: `${summary.reportingCount} sent data` },
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

  return (
    <article className="mx-auto max-w-4xl space-y-6 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm md:p-8">
      <header className="border-b border-slate-200 pb-5 text-center">
        <div className="mb-4 flex items-start justify-between text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/airqo_logo.svg" alt="AirQo" width={47} height={32} />
          <p className="text-right text-xs leading-4 text-slate-500">
            AirQo Beacon
            <br />
            Device health report
          </p>
        </div>
        <h1 className="text-xl font-bold text-[#1c1d20]">{report.title}</h1>
        <p className="mt-2 text-slate-500">{report.subtitle}</p>
        <p className="mt-1 font-semibold text-[#145fff]">{report.periodLabel}</p>
        <p className="mt-1 text-slate-500">{report.generatedLabel}</p>
      </header>

      <div
        className={`grid gap-4 ${sections.map && map.status !== "unavailable" ? "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : ""}`}
      >
        <section className="flex flex-col rounded-lg border border-slate-200 p-5">
          <h2 className="mb-2 text-base font-semibold text-[#145fff]">Snapshot</h2>
          <dl className="space-y-1.5">
            {report.snapshot.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="flex-shrink-0 text-slate-500">{row.label}</dt>
                <dd className="truncate text-right text-[#1c1d20]" title={row.value}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          {sections.map && map.status === "ready" && (
            <p className="mt-auto pt-3 text-xs text-[#145fff]">{getMapNote(report.devices, sections.mapHeatmap)}</p>
          )}
        </section>
        {sections.map && map.status === "loading" && (
          <div className="flex min-h-48 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Drawing the map...
          </div>
        )}
        {sections.map && map.status === "ready" && map.image && (
          <section id="report-map" className="relative overflow-hidden rounded-lg border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={map.image} alt="Map of the selected devices, coloured by uptime" className="block h-full w-full object-cover" />
          </section>
        )}
      </div>

      <section className="rounded-lg border border-slate-200 p-5">
        <SectionHeading>Introduction</SectionHeading>
        <div className="mt-2 space-y-2 leading-6">
          {narrative.introduction.map((paragraph, index) => (
            <p key={index}>
              <RichText text={paragraph} />
            </p>
          ))}
        </div>
      </section>

      <div className="space-y-2">
        <SectionHeading>Overall device health for the period</SectionHeading>
        <section className="rounded-lg border border-slate-200 p-5">
          <ChartSvg chart={buildStatusGauge(report)} label={`Average uptime is ${UPTIME_BANDS[summary.band].label}`} />
        </section>
      </div>

      <div className="space-y-2">
        <SectionHeading>Results</SectionHeading>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {resultCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-xs text-slate-500">{card.label}</p>
              <p className="mt-1 text-lg font-bold text-[#1c1d20]">{card.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{card.note}</p>
            </div>
          ))}
        </div>
      </div>

      {sections.dailyUptime && hasDays && (
        <>
          <ReportCard
            id="report-daily-uptime"
            title="Average uptime per day"
            caption={
              report.hasPartialDay
                ? "Share of possible device-hours with data. A day still in progress only counts the hours so far."
                : "Share of possible device-hours with data."
            }
            filename="average-uptime-per-day"
            onSaveImage={onSaveImage}
          >
            <ChartSvg chart={buildDailyUptimeChart(report)} label="Average uptime for each day of the period" />
          </ReportCard>

          <ReportCard
            id="report-calendar"
            title="Calendar of daily uptime"
            caption="Each cell shows that day's average uptime across the selected devices."
            filename="calendar-of-daily-uptime"
            onSaveImage={onSaveImage}
          >
            <div className="space-y-3">
              {buildCalendarCharts(report).map((chart, index) => (
                <ChartSvg key={index} chart={chart} label="Calendar of daily uptime" />
              ))}
              <ChartSvg chart={legend} label="Key to the uptime colours" />
            </div>
          </ReportCard>

          <div className="grid gap-4 md:grid-cols-2">
            <ReportCard
              id="report-distribution"
              title="Devices by uptime"
              caption="Over the whole period"
              filename="devices-by-uptime"
              onSaveImage={onSaveImage}
            >
              <ChartSvg chart={buildDistributionChart(report)} label="Number of devices in each uptime band" />
            </ReportCard>
            <ReportCard
              id="report-weekly"
              title="Uptime by week"
              caption="Weeks start on Monday"
              filename="uptime-by-week"
              onSaveImage={onSaveImage}
            >
              <ChartSvg chart={buildWeeklyChart(report)} label="Average uptime for each week" />
            </ReportCard>
          </div>
        </>
      )}

      {sections.patterns && report.devices.length > 0 && (
        <>
          <ReportCard
            id="report-hourly"
            title="Uptime by hour of day"
            caption="Share of possible device-hours with data for each hour, in your local time."
            filename="uptime-by-hour"
            onSaveImage={onSaveImage}
          >
            <ChartSvg chart={buildHourlyPatternChart(report)} label="Average uptime for each hour of the day" />
          </ReportCard>
          <ReportCard
            id="report-heatmap"
            title="Uptime by device and day"
            caption={
              report.devices.length > HEATMAP_DEVICE_LIMIT
                ? `The ${HEATMAP_DEVICE_LIMIT} devices with the lowest uptime, out of ${report.devices.length}. Numbers are that day's uptime in percent.`
                : "Numbers are that day's uptime in percent. Grey means no data."
            }
            filename="uptime-by-device-and-day"
            onSaveImage={onSaveImage}
          >
            <div className="space-y-3">
              <ChartSvg chart={buildDeviceHeatmap(report)} label="Each device's uptime on each day" />
              <ChartSvg chart={legend} label="Key to the uptime colours" />
            </div>
          </ReportCard>
        </>
      )}

      {sections.dataReceived && hasDays && (
        <ReportCard
          id="report-readings"
          title="Readings received per day"
          caption={`${summary.records.toLocaleString("en")} readings across the period.`}
          filename="readings-received-per-day"
          onSaveImage={onSaveImage}
        >
          <ChartSvg chart={buildDataReceivedChart(report)} label="Readings received on each day" />
        </ReportCard>
      )}

      {sensorChart && (
        <ReportCard
          id="report-sensors"
          title="Largest sensor error margins"
          caption={`Gap between each device's two PM2.5 sensors. Average correlation is ${
            summary.averageCorrelation === null ? "not available" : summary.averageCorrelation.toFixed(2)
          }.`}
          filename="largest-sensor-error-margins"
          onSaveImage={onSaveImage}
        >
          <ChartSvg chart={sensorChart} label="Devices with the largest gap between their two sensors" />
        </ReportCard>
      )}

      <section className="rounded-lg border border-blue-100 bg-blue-50 p-5">
        <SectionHeading>Key findings</SectionHeading>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-6">
          {narrative.findings.map((finding, index) => (
            <li key={index}>
              <RichText text={finding} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 p-5">
        <SectionHeading>Conclusion</SectionHeading>
        <div className="mt-2 space-y-2 leading-6">
          {narrative.conclusion.map((paragraph, index) => (
            <p key={index}>
              <RichText text={paragraph} />
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <SectionHeading>Recommendations</SectionHeading>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-6">
          {narrative.recommendations.map((recommendation, index) => (
            <li key={index}>
              <RichText text={recommendation} />
            </li>
          ))}
        </ul>
      </section>

      {report.devices.length > 0 && (
        <section className="space-y-2">
          <div>
            <SectionHeading>Device comparison</SectionHeading>
            <p className="text-xs text-slate-500">Lowest uptime first.</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">Device</th>
                  {report.showGroups && <th className="px-3 py-2 font-semibold">Clusters</th>}
                  <th className="px-3 py-2 font-semibold">Uptime</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Error margin</th>
                  <th className="px-3 py-2 font-semibold">Correlation</th>
                  <th className="px-3 py-2 font-semibold">Readings</th>
                  <th className="px-3 py-2 font-semibold">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {report.devices.slice(0, TABLE_PREVIEW_ROWS).map((device) => (
                  <tr key={device.id} className="border-t border-slate-200 text-[#1c1d20]">
                    <td className="px-3 py-2 font-semibold">{device.name}</td>
                    {report.showGroups && <td className="px-3 py-2">{device.groups.join(", ")}</td>}
                    <td className="px-3 py-2">{device.uptime === null ? "-" : `${device.uptime.toFixed(1)}%`}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: UPTIME_BANDS[device.band].color }}
                          aria-hidden="true"
                        />
                        {UPTIME_BANDS[device.band].label}
                      </span>
                    </td>
                    <td className="px-3 py-2">{device.errorMargin === null ? "-" : `±${device.errorMargin.toFixed(1)}`}</td>
                    <td className="px-3 py-2">{device.correlation === null ? "-" : device.correlation.toFixed(2)}</td>
                    <td className="px-3 py-2">{device.records.toLocaleString("en")}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {device.lastSeen ? format(device.lastSeen, "MMM d, HH:mm") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hiddenDevices > 0 && (
            <p className="text-xs text-slate-500">
              Showing the first {TABLE_PREVIEW_ROWS} of {report.devices.length} devices. The PDF lists all of them.
            </p>
          )}
        </section>
      )}
    </article>
  )
}
