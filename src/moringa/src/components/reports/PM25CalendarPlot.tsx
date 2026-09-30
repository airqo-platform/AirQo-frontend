"use client"

import { CalendarDays, Download } from "lucide-react"
import type { ReactNode } from "react"
import { useRef, useState } from "react"
import type { SiteData } from "@/lib/types"
import { translateReport, type ReportLanguage } from "@/lib/report-translations"
import { getLocalizedCalendarLabels, getReportChartCopy, translateAqiCategory } from "@/lib/report-chart-translations"
import html2canvas from "html2canvas"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const DAY_MS = 24 * 60 * 60 * 1000

type DailyAverage = { dateKey: string; timestamp: number; value: number }
type CalendarCell = { day: number; dateKey: string; value: number | null } | null

const AQI_LEVELS = [
  { label: "Good", range: "0-9.0", max: 9, color: "#22863a", textColor: "#ffffff" },
  { label: "Moderate", range: "9.1-35.4", max: 35.4, color: "#fdd835", textColor: "#111827" },
  { label: "Sensitive Groups", range: "35.5-55.4", max: 55.4, color: "#fb8c00", textColor: "#111827" },
  { label: "Unhealthy", range: "55.5-125.4", max: 125.4, color: "#dc2626", textColor: "#ffffff" },
  { label: "Very Unhealthy", range: "125.5-225.4", max: 225.4, color: "#7e22ce", textColor: "#ffffff" },
  { label: "Hazardous", range: "\u2265225.5", max: Number.POSITIVE_INFINITY, color: "#7f1d1d", textColor: "#ffffff" },
] as const

const toDateKey = (timestamp: string) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`
}

const getDailyAverages = (sites: SiteData[]) => {
  const valuesByDate = new Map<string, number[]>()
  sites.forEach((site) => {
    site.reportMeasurements?.forEach((measurement) => {
      if (!Number.isFinite(measurement.value)) return
      const dateKey = toDateKey(measurement.timestamp)
      if (!dateKey) return
      valuesByDate.set(dateKey, [...(valuesByDate.get(dateKey) || []), measurement.value])
    })
  })

  return Array.from(valuesByDate.entries())
    .map(([dateKey, values]): DailyAverage => ({
      dateKey,
      timestamp: Date.parse(`${dateKey}T00:00:00Z`),
      value: values.reduce((sum, value) => sum + value, 0) / values.length,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}

const getCalendarCells = (year: number, month: number, valuesByDate: Map<string, number>): CalendarCell[] => {
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells: CalendarCell[] = Array.from({ length: mondayOffset }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    cells.push({ day, dateKey, value: valuesByDate.get(dateKey) ?? null })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const getAqiLevel = (value: number) => AQI_LEVELS.find((level) => value <= level.max) ?? AQI_LEVELS[AQI_LEVELS.length - 1]

const getCellStyle = (value: number | null) => {
  if (value === null) return { backgroundColor: "#e5e7eb", color: "#6b7280" }
  const level = getAqiLevel(value)
  return { backgroundColor: level.color, color: level.textColor }
}

const LegendItem = ({ color, children }: { color: string; children: ReactNode }) => (
  <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
    <span className="h-2 w-3 rounded-sm border border-black/10 sm:w-4" style={{ backgroundColor: color }} />
    <span>{children}</span>
  </div>
)

export function PM25CalendarPlot({ sites, language = "en" }: { sites: SiteData[]; language?: ReportLanguage }) {
  const t = (key: Parameters<typeof translateReport>[1]) => translateReport(language, key)
  const copy = getReportChartCopy(language)
  const localizedCalendarLabels = getLocalizedCalendarLabels(language)
  const monthNames = language === "en" ? MONTH_NAMES : localizedCalendarLabels.months
  const weekdays = language === "en" ? WEEKDAYS : localizedCalendarLabels.weekdays
  const [downloadValue, setDownloadValue] = useState<"none" | "csv" | "json" | "png">("none")
  const chartRef = useRef<HTMLElement>(null)
  const dailyAverages = getDailyAverages(sites)

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownload = async (type: "csv" | "json" | "png") => {
    if (type === "csv") {
      const csv = [
        `${copy.date},${copy.dailyAverage}`,
        ...dailyAverages.map((average) => `${average.dateKey},${average.value.toFixed(1)}`),
      ].join("\n")
      downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "pm25_calendar_plot.csv")
      return
    }

    if (type === "json") {
      downloadBlob(
        new Blob([JSON.stringify(dailyAverages, null, 2)], { type: "application/json;charset=utf-8;" }),
        "pm25_calendar_plot.json",
      )
      return
    }

    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDocument) => {
          clonedDocument.querySelectorAll<HTMLElement>("[data-chart-export-control]").forEach((control) => {
            control.style.display = "none"
          })
        },
      })
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (blob) downloadBlob(blob, "pm25_calendar_plot.png")
    }
  }

  const handleDownloadChange = (value: "none" | "csv" | "json" | "png") => {
    setDownloadValue(value)
    if (value !== "none") {
      void handleDownload(value)
        .catch((error) => console.error("Error exporting PM2.5 calendar plot:", error))
        .finally(() => setDownloadValue("none"))
    }
  }

  if (dailyAverages.length === 0) return null

  const valuesByDate = new Map(dailyAverages.map((average) => [average.dateKey, average.value]))
  const years = Array.from(new Set(dailyAverages.map((average) => new Date(average.timestamp).getUTCFullYear())))

  return (
    <section ref={chartRef} className="pdf-keep-together overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      {years.map((year, yearIndex) => {
        const yearValues = dailyAverages.filter((average) => new Date(average.timestamp).getUTCFullYear() === year)
        const values = yearValues.map((average) => average.value)
        const elapsedDays = Math.round((yearValues[yearValues.length - 1].timestamp - yearValues[0].timestamp) / DAY_MS) + 1
        const missingDays = Math.max(0, elapsedDays - yearValues.length)
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length
        const sortedValues = [...values].sort((a, b) => a - b)
        const middle = Math.floor(sortedValues.length / 2)
        const median = sortedValues.length % 2 ? sortedValues[middle] : (sortedValues[middle - 1] + sortedValues[middle]) / 2
        const visibleAqiLevels = AQI_LEVELS.filter((level) =>
          values.some((value) => getAqiLevel(value).label === level.label),
        )
        const monthsWithData = new Set(
          yearValues.map((average) => new Date(average.timestamp).getUTCMonth()),
        )

        return (
          <div key={year} className={yearIndex > 0 ? "border-t border-gray-200" : undefined}>
            <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h4 className="flex items-center justify-center gap-2 text-lg font-bold text-blue-800 sm:justify-start md:text-xl">
                  <CalendarDays className="h-5 w-5" />
                  {t("calendarPlot")}: {year}
                </h4>
                <p className="mt-1 text-xs text-slate-600">{t("dailyAverages")}</p>
              </div>
              {yearIndex === 0 && (
                <div data-chart-export-control>
                  <Select value={downloadValue} onValueChange={handleDownloadChange}>
                    <SelectTrigger className="h-9 w-full rounded-xl bg-white sm:w-[130px]">
                      <SelectValue placeholder={copy.export} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          {copy.export}
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-5 p-4">
              {monthNames.map((monthName, month) => ({ monthName, month }))
                .filter(({ month }) => monthsWithData.has(month))
                .map(({ monthName, month }) => (
                <div key={monthName} className="w-full min-w-0 sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
                  <h5 className="mb-1 text-center text-sm font-bold text-blue-800">{monthName}</h5>
                  <div className="grid grid-cols-7 gap-px overflow-hidden rounded bg-white">
                    {weekdays.map((weekday) => <div key={weekday} className="pb-1 text-center text-[9px] font-semibold text-slate-600">{weekday}</div>)}
                    {getCalendarCells(year, month, valuesByDate).map((cell, index) => cell ? (
                      <div
                        key={cell.dateKey}
                        className="flex min-h-10 flex-col justify-between p-1 text-[8px] leading-none"
                        style={getCellStyle(cell.value)}
                        title={cell.value === null ? `${cell.dateKey}: ${copy.missingData}` : `${cell.dateKey}: ${cell.value.toFixed(1)} \u00b5g/m\u00b3`}
                      >
                        <span className="font-semibold">{cell.day}</span>
                        {cell.value !== null && (
                          <span className="self-center pb-0.5 font-bold">{cell.value.toFixed(1)}</span>
                        )}
                      </div>
                    ) : <div key={`empty-${month}-${index}`} className="min-h-10 bg-slate-50" aria-hidden="true" />)}
                  </div>
                </div>
                ))}
            </div>

            <div className="space-y-3 border-t border-gray-100 px-4 py-4 text-xs text-slate-700">
              <div className="mx-auto w-fit rounded-lg border border-blue-500 px-3 py-1.5 text-center">
                {copy.daysWithData}: {yearValues.length}&nbsp; | &nbsp;{copy.missingDays}: {missingDays}
              </div>
              <div className="flex flex-nowrap items-center justify-start gap-x-2 overflow-x-auto pb-1 text-[8px] leading-none sm:justify-center sm:text-[9px] lg:gap-x-3">
                {visibleAqiLevels.map((level) => (
                  <LegendItem key={level.label} color={level.color}>
                    {translateAqiCategory(level.label, language)}: {level.range} {"\u00b5g/m\u00b3"}
                  </LegendItem>
                ))}
                {missingDays > 0 && <LegendItem color="#e5e7eb">{copy.missingData}</LegendItem>}
              </div>
              <p className="text-center text-[10px] text-slate-500">
                {language !== "en" ? copy.calendarExplanation : <>
                Values inside calendar cells are daily average calibrated PM<sub>2.5</sub> concentrations in {"\u00b5g/m\u00b3"}. Missing days are counted between the first and last available dates shown for the year.
                </>}
              </p>
            </div>
          </div>
        )
      })}
    </section>
  )
}
