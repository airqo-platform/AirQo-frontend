"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import { useEffect, useState, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import html2canvas from "html2canvas"
import type { SiteData } from "@/lib/types"
import { translateReport, type ReportLanguage } from "@/lib/report-translations"
import { getReportChartCopy, translateAqiCategory } from "@/lib/report-chart-translations"
import { BarChart3, LineChartIcon, PieChartIcon, Download, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react"

// AQI colors
const AQI_COLORS: Record<string, string> = {
  Good: "#A8E05F",
  Moderate: "#FDD64B",
  "Unhealthy for Sensitive Groups": "#FF9B57",
  Unhealthy: "#FE6A69",
  "Very Unhealthy": "#A97ABC",
  Hazardous: "#A87383",
  Unknown: "#CCCCCC",
}

const SITE_COLORS = ["#2563eb", "#dc2626", "#059669", "#7c3aed", "#ea580c", "#0891b2", "#4f46e5", "#be123c"]
const WHO_PM25_DAILY_GUIDELINE = 15
const UGANDA_NEMA_PM25_DAILY_STANDARD = 35

const getReportBucket = (
  timestamp: string,
  aggregation: "daily" | "weekly" | "monthly",
  language: ReportLanguage = "en",
) => {
  const date = new Date(timestamp)
  const locale = language === "en" ? "en-US" : language === "alz" ? "alz-UG" : language
  const copy = getReportChartCopy(language)
  if (aggregation === "weekly") {
    const dayOfWeek = date.getUTCDay()
    date.setUTCDate(date.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  }

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  if (aggregation === "monthly") {
    return {
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString(locale, { month: "short", year: "numeric", timeZone: "UTC" }),
      sortValue: Date.UTC(year, month, 1),
    }
  }

  const day = date.getUTCDate()
  const label = date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
  return {
    key: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    label: aggregation === "weekly" ? `${language === "en" ? "Week of" : copy.week} ${label}` : label,
    sortValue: Date.UTC(year, month, day),
  }
}

export const getAqiPeriodBucket = (
  timestamp: string,
  grouping: "monthly" | "weekly",
  language: ReportLanguage = "en",
) => {
  const date = new Date(timestamp)
  const locale = language === "en" ? "en-US" : language === "alz" ? "alz-UG" : language
  const copy = getReportChartCopy(language)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const monthLabel = date.toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: "UTC" })
  if (grouping === "monthly") {
    return {
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: monthLabel,
      sortValue: Date.UTC(year, month, 1),
    }
  }

  const weekOfMonth = Math.ceil(date.getUTCDate() / 7)
  return {
    key: `${year}-${String(month + 1).padStart(2, "0")}-week-${weekOfMonth}`,
    label: `${copy.week} ${weekOfMonth}, ${monthLabel}`,
    sortValue: Date.UTC(year, month, (weekOfMonth - 1) * 7 + 1),
  }
}

export const getAqiCategoryForPm25 = (value: number) => {
  if (value <= 9) return "Good"
  if (value <= 35.4) return "Moderate"
  if (value <= 55.4) return "Unhealthy for Sensitive Groups"
  if (value <= 125.4) return "Unhealthy"
  if (value <= 225.4) return "Very Unhealthy"
  return "Hazardous"
}

// Custom Dot component for dynamic coloring in LineChart
const CustomDot = ({ cx, cy, payload }: { cx?: number; cy?: number; payload?: any }) => {
  if (!cx || !cy || !payload) return null
  return <circle cx={cx} cy={cy} r={4} fill={payload.color || "#CCCCCC"} stroke="#3b82f6" strokeWidth={1} />
}

// PM₂.₅ Bar Chart
export function PM25BarChart({ sites, language = "en" }: { sites: SiteData[]; language?: ReportLanguage }) {
  const t = (key: Parameters<typeof translateReport>[1]) => translateReport(language, key)
  const copy = getReportChartCopy(language)
  const [siteLimit, setSiteLimit] = useState(7)
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [xAxisView, setXAxisView] = useState<"time" | "site">("time")
  const [seriesMode, setSeriesMode] = useState<"separate" | "merged">("separate")
  const [downloadValue, setDownloadValue] = useState<"none" | "csv" | "json" | "png">("none")
  const [sortOrder, setSortOrder] = useState<"highest" | "lowest" | "none">("none")
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(() => new Set())
  const [aggregation, setAggregation] = useState<"daily" | "weekly" | "monthly">(
    () => sites.find((site) => site.reportAggregation)?.reportAggregation || "daily",
  )
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAggregation(sites.find((site) => site.reportAggregation)?.reportAggregation || "daily")
  }, [sites])

  useEffect(() => {
    setHiddenSeries(new Set())
  }, [siteLimit, aggregation, xAxisView, seriesMode, sortOrder])

  const handleLegendClick = (entry: { dataKey?: unknown }) => {
    if (typeof entry.dataKey !== "string" && typeof entry.dataKey !== "number") return
    const dataKey = String(entry.dataKey)
    setHiddenSeries((current) => {
      const next = new Set(current)
      if (next.has(dataKey)) next.delete(dataKey)
      else next.add(dataKey)
      return next
    })
  }

  const handleSiteLimitChange = (value: string) => {
    setSiteLimit(value === "all" ? sites.length : Number.parseInt(value, 10))
  }

  const handleDownload = async (type: "csv" | "json" | "png") => {
    if (type === "csv") {
      const dataStr = hasTemporalData
        ? [
            [xAxisView === "site" ? copy.site : copy.period, ...activeSeries.map((series) => series.name)].join(","),
            ...activeChartData.map((row) =>
              [row[activeXAxisKey], ...activeSeries.map((series) => row[series.dataKey] ?? "")].join(","),
            ),
          ].join("\n")
        : `${copy.name},PM₂.₅,${copy.category}\n` + displaySites.map((s) => `${s.name},${s.pm25},${translateAqiCategory(s.category, language)}`).join("\n")
      const blob = new Blob([dataStr], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "pm25_chart.csv"
      a.click()
      URL.revokeObjectURL(url)
    } else if (type === "json") {
      const dataStr = JSON.stringify(hasTemporalData ? activeChartData : displaySites, null, 2)
      const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "pm25_chart.json"
      a.click()
      URL.revokeObjectURL(url)
    } else if (type === "png" && chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false,
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight,
        })

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "pm25_chart.png"
            a.click()
            URL.revokeObjectURL(url)
          }
        }, "image/png")
      } catch (error) {
        console.error("Error generating PNG:", error)
        return
      }
    }
  }

  const handleDownloadChange = (value: "none" | "csv" | "json" | "png") => {
    setDownloadValue(value)
    if (value !== "none") {
      handleDownload(value)
      setDownloadValue("none")
    }
  }

  const sortedSites = [...sites].sort((a, b) => {
    const aValue = a.pm2_5?.value ? Number(a.pm2_5.value) : 0
    const bValue = b.pm2_5?.value ? Number(b.pm2_5.value) : 0
    if (sortOrder === "highest") return bValue - aValue
    if (sortOrder === "lowest") return aValue - bValue
    return 0
  })

  const displaySites = sortedSites.slice(0, siteLimit).map((site) => ({
    name: site.siteDetails?.name || "Unknown",
    pm25: site.pm2_5?.value ? Number(site.pm2_5.value).toFixed(1) : "0.0",
    category: site.aqi_category || "Unknown",
    color: AQI_COLORS[site.aqi_category || "Unknown"] || "#CCCCCC",
  }))

  const selectedSites = seriesMode === "merged" ? sortedSites : sortedSites.slice(0, siteLimit)
  const temporalSeries = selectedSites.map((site, index) => ({
    dataKey: `site_${index}`,
    name: site.siteDetails?.name || `Site ${index + 1}`,
    color: SITE_COLORS[index % SITE_COLORS.length],
  }))
  const bucketMap = new Map<string, { period: string; sortValue: number; values: Record<string, number[]> }>()
  selectedSites.forEach((site, index) => {
    site.reportMeasurements?.forEach((measurement) => {
      const bucket = getReportBucket(measurement.timestamp, aggregation, language)
      const row = bucketMap.get(bucket.key) || { period: bucket.label, sortValue: bucket.sortValue, values: {} }
      const dataKey = `site_${index}`
      row.values[dataKey] = [...(row.values[dataKey] || []), measurement.value]
      bucketMap.set(bucket.key, row)
    })
  })
  const temporalData = Array.from(bucketMap.values())
    .sort((a, b) => a.sortValue - b.sortValue)
    .map((bucket) => {
      const row: Record<string, string | number> = { period: bucket.period }
      Object.entries(bucket.values).forEach(([dataKey, values]) => {
        row[dataKey] = Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
      })
      return row
    })
  const hasTemporalData = temporalData.length > 0
  const mergedTemporalData: Record<string, string | number>[] = temporalData.map((row) => {
    const values = temporalSeries
      .map((series) => row[series.dataKey])
      .filter((value): value is number => typeof value === "number")
    const mergedValue = values.length
      ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
      : 0
    return {
      period: row.period,
      merged: mergedValue,
      color: AQI_COLORS[getAqiCategoryForPm25(mergedValue)],
    }
  })
  const mergedSeries = [{ dataKey: "merged", name: copy.allSitesAverage, color: "#2563eb" }]

  const siteAxisSeries = temporalData.map((row, index) => ({
    dataKey: `period_${index}`,
    name: String(row.period),
    color: SITE_COLORS[index % SITE_COLORS.length],
  }))
  const siteAxisData = selectedSites.map((site, siteIndex) => {
    const row: Record<string, string | number> = { name: site.siteDetails?.name || `${copy.site} ${siteIndex + 1}` }
    temporalData.forEach((period, periodIndex) => {
      const value = period[`site_${siteIndex}`]
      if (typeof value === "number") row[`period_${periodIndex}`] = value
    })
    return row
  })
  const useMergedSeries = hasTemporalData && seriesMode === "merged"
  const useSiteXAxis = hasTemporalData && !useMergedSeries && xAxisView === "site"
  const activeChartData = useMergedSeries ? mergedTemporalData : useSiteXAxis ? siteAxisData : temporalData
  const activeSeries = useMergedSeries ? mergedSeries : useSiteXAxis ? siteAxisSeries : temporalSeries
  const activeXAxisKey = useSiteXAxis ? "name" : "period"
  const showDailyRecommendations = hasTemporalData && aggregation === "daily"

  const temporalValues = activeChartData.flatMap((row) => activeSeries.map((series) => Number(row[series.dataKey] || 0)))
  const maxValue = Math.max(0, ...(hasTemporalData ? temporalValues : displaySites.map((site) => Number.parseFloat(site.pm25))))
  const dailyReferenceMax = showDailyRecommendations ? UGANDA_NEMA_PM25_DAILY_STANDARD : 0
  const yAxisDomain = [0, Math.ceil(Math.max(maxValue, dailyReferenceMax) * 1.1)]

  return (
    <Card className="w-full border-gray-200 font-sans shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-5">
        <CardTitle className="flex items-center gap-2 text-base text-gray-800 md:text-lg">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          {language !== "en" ? `${t("averagePm25")} — ${t("results")}` : <>
          PM<sub>2.5</sub>{" "}
          {hasTemporalData
            ? `${aggregation[0].toUpperCase()}${aggregation.slice(1)} Averages ${useMergedSeries ? "\u2014 All Sites Combined" : "by Site"}`
            : "Levels by Site"}
          </>}
        </CardTitle>
        <div className="flex flex-col gap-2.5 pt-3 md:flex-row md:flex-wrap md:items-center">
          {hasTemporalData && (
            <div className="flex items-center gap-2">
              <span className="min-w-fit text-xs font-medium text-gray-600">{copy.display}:</span>
              <Select value={seriesMode} onValueChange={(value: "separate" | "merged") => setSeriesMode(value)}>
                <SelectTrigger className="h-8 w-full rounded-lg border-gray-300 text-xs focus:border-blue-500 md:w-[145px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="separate">{copy.separateSites}</SelectItem>
                  <SelectItem value="merged">{copy.mergeSites}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {seriesMode === "separate" && (
          <div className="flex items-center gap-2">
            <span className="min-w-fit text-xs font-medium text-gray-600">{copy.sites}:</span>
            <Select onValueChange={handleSiteLimitChange} defaultValue="7">
              <SelectTrigger className="h-8 w-full rounded-lg border-gray-300 text-xs focus:border-blue-500 md:w-[125px]">
                <SelectValue placeholder={copy.sites} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 {copy.sites}</SelectItem>
                <SelectItem value="10">10 {copy.sites}</SelectItem>
                <SelectItem value="15">15 {copy.sites}</SelectItem>
                <SelectItem value="20">20 {copy.sites}</SelectItem>
                <SelectItem value="all">{copy.all} ({sites.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          )}

          <div className="flex items-center gap-2">
            <span className="min-w-fit text-xs font-medium text-gray-600">{copy.average}:</span>
            <Select
              value={aggregation}
              onValueChange={(value: "daily" | "weekly" | "monthly") => setAggregation(value)}
            >
              <SelectTrigger className="h-8 w-full rounded-lg border-gray-300 text-xs focus:border-blue-500 md:w-[130px]">
                <SelectValue placeholder={copy.average} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{copy.daily}</SelectItem>
                <SelectItem value="weekly">{copy.weekly}</SelectItem>
                <SelectItem value="monthly">{copy.monthly}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {seriesMode === "separate" && (
            <div className="flex items-center gap-2">
              <span className="min-w-fit text-xs font-medium text-gray-600">{copy.xAxis}:</span>
            <Select value={xAxisView} onValueChange={(value: "time" | "site") => setXAxisView(value)}>
              <SelectTrigger className="h-8 w-full rounded-lg border-gray-300 text-xs focus:border-blue-500 md:w-[125px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">{copy.timePeriod}</SelectItem>
                <SelectItem value="site">{copy.siteName}</SelectItem>
              </SelectContent>
            </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="min-w-fit text-xs font-medium text-gray-600">{copy.type}:</span>
            <Select onValueChange={(v: string) => setChartType(v as "bar" | "line")} defaultValue="bar">
              <SelectTrigger className="h-8 w-full rounded-lg border-gray-300 text-xs focus:border-blue-500 md:w-[105px]">
                <SelectValue placeholder={copy.type} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {copy.bar}
                  </div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4" />
                    {copy.line}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {seriesMode === "separate" && (
            <div className="flex items-center gap-2">
              <span className="min-w-fit text-xs font-medium text-gray-600">{copy.sort}:</span>
            <Select onValueChange={(v: string) => setSortOrder(v as "highest" | "lowest" | "none")} defaultValue="none">
              <SelectTrigger className="h-8 w-full rounded-lg border-gray-300 text-xs focus:border-blue-500 md:w-[125px]">
                <SelectValue placeholder={copy.sort} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    {copy.noSorting}
                  </div>
                </SelectItem>
                <SelectItem value="highest">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    {copy.highestFirst}
                  </div>
                </SelectItem>
                <SelectItem value="lowest">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {copy.lowestFirst}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="min-w-fit text-xs font-medium text-gray-600">{copy.export}:</span>
            <Select value={downloadValue} onValueChange={handleDownloadChange}>
              <SelectTrigger className="h-8 w-full rounded-lg border-gray-300 text-xs focus:border-blue-500 md:w-[105px]">
                <SelectValue placeholder={copy.download} />
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
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {seriesMode === "separate" && siteLimit > 7 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-700 text-sm flex items-center gap-2">
              <span className="text-amber-600">⚠️</span>
              {language === "en" ? "Displaying more than 7 sites may affect chart readability on smaller screens." : `${copy.sites}: 7+`}
            </p>
          </div>
        )}
        <div className="h-[300px] md:h-[350px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart key={`pm-bar-${aggregation}-${xAxisView}-${seriesMode}`} data={hasTemporalData ? activeChartData : displaySites} margin={{ top: 20, right: 10, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={hasTemporalData ? activeXAxisKey : "name"} angle={-35} textAnchor="end" height={75} tick={{ fontSize: 9 }} />
                <YAxis
                  domain={yAxisDomain}
                  label={{ value: "PM₂.₅ (µg/m³)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 9 }}
                  tickCount={10}
                />
                <Tooltip
                  formatter={(value, name) => [`${Number(value).toFixed(1)} µg/m³`, name]}
                  labelFormatter={(label) => useSiteXAxis || !hasTemporalData ? `${copy.site}: ${label}` : `${copy.period}: ${label}`}
                  contentStyle={{ borderRadius: 10, fontSize: 11 }}
                  labelStyle={{ fontSize: 11, fontWeight: 600 }}
                  itemStyle={{ fontSize: 11 }}
                />
                {hasTemporalData ? (
                  activeSeries.map((series) => (
                    <Bar key={series.dataKey} dataKey={series.dataKey} name={series.name} fill={series.color} hide={hiddenSeries.has(series.dataKey)} radius={[3, 3, 0, 0]}>
                      {useMergedSeries && mergedTemporalData.map((row, index) => (
                        <Cell key={`merged-aqi-${index}`} fill={String(row.color)} />
                      ))}
                    </Bar>
                  ))
                ) : (
                  <Bar dataKey="pm25" name="PM₂.₅ Level" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {displaySites.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                )}
                {showDailyRecommendations && (
                  <ReferenceLine
                    isFront
                    y={WHO_PM25_DAILY_GUIDELINE}
                    stroke="#0f766e"
                    strokeDasharray="6 4"
                    strokeWidth={3}
                    label={{ value: "WHO 24h guideline: 15 \u00b5g/m\u00b3", position: "insideTopRight", fill: "#0f766e", fontSize: 9, fontWeight: 700, stroke: "#ffffff", strokeWidth: 3, paintOrder: "stroke" }}
                  />
                )}
                {showDailyRecommendations && (
                  <ReferenceLine
                    isFront
                    y={UGANDA_NEMA_PM25_DAILY_STANDARD}
                    stroke="#1d4ed8"
                    strokeDasharray="6 4"
                    strokeWidth={3}
                    label={{ value: "NEMA Uganda 24h standard: 35 \u00b5g/m\u00b3", position: "insideTopRight", fill: "#1d4ed8", fontSize: 9, fontWeight: 700, stroke: "#ffffff", strokeWidth: 3, paintOrder: "stroke" }}
                  />
                )}
                {hasTemporalData && !useMergedSeries && <Legend iconSize={9} onClick={handleLegendClick} wrapperStyle={{ cursor: "pointer", fontSize: 11, lineHeight: "18px" }} />}
              </BarChart>
            ) : (
              <LineChart key={`pm-line-${aggregation}-${xAxisView}-${seriesMode}`} data={hasTemporalData ? activeChartData : displaySites} margin={{ top: 20, right: 10, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={hasTemporalData ? activeXAxisKey : "name"} angle={-35} textAnchor="end" height={75} tick={{ fontSize: 9 }} />
                <YAxis
                  domain={yAxisDomain}
                  label={{ value: "PM₂.₅ (µg/m³)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 9 }}
                  tickCount={10}
                />
                <Tooltip
                  formatter={(value, name) => [`${Number(value).toFixed(1)} µg/m³`, name]}
                  labelFormatter={(label) => useSiteXAxis || !hasTemporalData ? `${copy.site}: ${label}` : `${copy.period}: ${label}`}
                  contentStyle={{ borderRadius: 10, fontSize: 11 }}
                  labelStyle={{ fontSize: 11, fontWeight: 600 }}
                  itemStyle={{ fontSize: 11 }}
                />
                {hasTemporalData ? (
                  activeSeries.map((series) => (
                    <Line key={series.dataKey} type="monotone" dataKey={series.dataKey} name={series.name} stroke={series.color} strokeWidth={2} hide={hiddenSeries.has(series.dataKey)} connectNulls />
                  ))
                ) : (
                  <Line type="monotone" dataKey="pm25" name="PM₂.₅ Level" stroke="#3b82f6" strokeWidth={2} dot={<CustomDot />} activeDot={{ r: 6 }} />
                )}
                {showDailyRecommendations && (
                  <ReferenceLine
                    isFront
                    y={WHO_PM25_DAILY_GUIDELINE}
                    stroke="#0f766e"
                    strokeDasharray="6 4"
                    strokeWidth={3}
                    label={{ value: "WHO 24h guideline: 15 \u00b5g/m\u00b3", position: "insideTopRight", fill: "#0f766e", fontSize: 9, fontWeight: 700, stroke: "#ffffff", strokeWidth: 3, paintOrder: "stroke" }}
                  />
                )}
                {showDailyRecommendations && (
                  <ReferenceLine
                    isFront
                    y={UGANDA_NEMA_PM25_DAILY_STANDARD}
                    stroke="#1d4ed8"
                    strokeDasharray="6 4"
                    strokeWidth={3}
                    label={{ value: "NEMA Uganda 24h standard: 35 \u00b5g/m\u00b3", position: "insideTopRight", fill: "#1d4ed8", fontSize: 9, fontWeight: 700, stroke: "#ffffff", strokeWidth: 3, paintOrder: "stroke" }}
                  />
                )}
                {hasTemporalData && !useMergedSeries && <Legend iconSize={9} onClick={handleLegendClick} wrapperStyle={{ cursor: "pointer", fontSize: 11, lineHeight: "18px" }} />}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export type ReportTimelineGrouping = "monthly" | "weekly"

export function AQICategoryChart({
  sites,
  language = "en",
  periodGrouping,
  selectedPeriod,
  onPeriodGroupingChange,
  onSelectedPeriodChange,
}: {
  sites: SiteData[]
  language?: ReportLanguage
  periodGrouping: ReportTimelineGrouping
  selectedPeriod: string
  onPeriodGroupingChange: (grouping: ReportTimelineGrouping) => void
  onSelectedPeriodChange: (period: string) => void
}) {
  const t = (key: Parameters<typeof translateReport>[1]) => translateReport(language, key)
  const copy = getReportChartCopy(language)
  const [chartType, setChartType] = useState<"pie" | "bar">("pie")
  const [downloadValue, setDownloadValue] = useState<"none" | "csv" | "json" | "png">("none")
  const chartRef = useRef<HTMLDivElement>(null)

  const periodMap = new Map<string, { key: string; label: string; sortValue: number }>()
  sites.forEach((site) => {
    site.reportMeasurements?.forEach((measurement) => {
      const bucket = getAqiPeriodBucket(measurement.timestamp, periodGrouping, language)
      periodMap.set(bucket.key, bucket)
    })
  })
  const periodOptions = Array.from(periodMap.values()).sort((a, b) => a.sortValue - b.sortValue)
  const localizePeriodLabel = (period?: { key: string; label: string }) => {
    return period?.label || copy.selectedPeriod
  }
  const effectivePeriod = selectedPeriod === "all" || periodMap.has(selectedPeriod) ? selectedPeriod : "all"
  const selectedPeriodLabel = effectivePeriod === "all"
    ? copy.entirePeriod
    : localizePeriodLabel(periodMap.get(effectivePeriod))

  const categoryCount: Record<string, number> = {}
  sites.forEach((site) => {
    let category = site.aqi_category || "Unknown"
    if (effectivePeriod !== "all") {
      const values = (site.reportMeasurements || [])
        .filter((measurement) => getAqiPeriodBucket(measurement.timestamp, periodGrouping, language).key === effectivePeriod)
        .map((measurement) => measurement.value)
      if (values.length === 0) return
      category = getAqiCategoryForPm25(values.reduce((sum, value) => sum + value, 0) / values.length)
    }
    categoryCount[category] = (categoryCount[category] || 0) + 1
  })

  const chartData = Object.entries(categoryCount).map(([name, value]) => ({
    name: translateAqiCategory(name, language),
    value,
    color: AQI_COLORS[name] || "#CCCCCC",
  }))

  const sitesWithData = chartData.reduce((total, category) => total + category.value, 0)

  const handleDownload = async (type: "csv" | "json" | "png") => {
    if (type === "csv") {
      const dataStr = `${copy.period},${copy.category},${copy.count}\n` + chartData.map((d) => `${selectedPeriodLabel},${d.name},${d.value}`).join("\n")
      const blob = new Blob([dataStr], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "aqi_category_chart.csv"
      a.click()
      URL.revokeObjectURL(url)
    } else if (type === "json") {
      const dataStr = JSON.stringify({ period: selectedPeriodLabel, data: chartData }, null, 2)
      const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "aqi_category_chart.json"
      a.click()
      URL.revokeObjectURL(url)
    } else if (type === "png" && chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false,
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight,
        })

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "aqi_category_chart.png"
            a.click()
            URL.revokeObjectURL(url)
          }
        }, "image/png")
      } catch (error) {
        console.error("Error generating PNG:", error)
      }
    }
  }

  const handleDownloadChange = (value: "none" | "csv" | "json" | "png") => {
    setDownloadValue(value)
    if (value !== "none") {
      handleDownload(value)
      setDownloadValue("none")
    }
  }

  return (
    <Card className="w-full border-gray-200 font-sans shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-base text-gray-800 md:text-lg">
          <PieChartIcon className="h-5 w-5 text-green-600" />
          {t("aqiDistribution")}
        </CardTitle>
        <p className="mt-1 text-sm text-slate-600">{selectedPeriodLabel} · {sitesWithData} {sitesWithData === 1 ? copy.site : copy.sites} {copy.withData}</p>
        <div className="flex flex-col gap-3 pt-4 md:flex-row md:flex-wrap md:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 min-w-fit">{copy.type}:</span>
            <Select onValueChange={(v: string) => setChartType(v as "pie" | "bar")} defaultValue="pie">
              <SelectTrigger className="h-9 w-full rounded-xl border-gray-300 focus:border-green-500 md:w-[120px]">
                <SelectValue placeholder={copy.type} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4" />
                    {copy.pie}
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {copy.bar}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="min-w-fit text-sm font-medium text-gray-600">{copy.viewBy}:</span>
            <Select
              value={periodGrouping}
              onValueChange={(value: "monthly" | "weekly") => {
                onPeriodGroupingChange(value)
                onSelectedPeriodChange("all")
              }}
            >
              <SelectTrigger className="h-9 w-full rounded-xl border-gray-300 focus:border-green-500 md:w-[125px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">{copy.month}</SelectItem>
                <SelectItem value="weekly">{copy.week}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="min-w-fit text-sm font-medium text-gray-600">{copy.period}:</span>
            <Select value={effectivePeriod} onValueChange={onSelectedPeriodChange}>
              <SelectTrigger className="h-9 w-full rounded-xl border-gray-300 focus:border-green-500 md:w-[210px]">
                <SelectValue placeholder={copy.selectPeriod} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{copy.entirePeriod}</SelectItem>
                {periodOptions.map((period) => (
                  <SelectItem key={period.key} value={period.key}>{localizePeriodLabel(period)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 min-w-fit">{copy.export}:</span>
            <Select value={downloadValue} onValueChange={handleDownloadChange}>
              <SelectTrigger className="h-9 w-full rounded-xl border-gray-300 focus:border-green-500 md:w-[120px]">
                <SelectValue placeholder={copy.download} />
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
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] md:h-[350px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "pie" ? (
              <PieChart key={`aqi-pie-${periodGrouping}-${effectivePeriod}`}>
                <Pie
                  key={`aqi-pie-data-${periodGrouping}-${effectivePeriod}`}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} ${copy.sites}`, copy.count]} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            ) : (
              <BarChart key={`aqi-bar-${periodGrouping}-${effectivePeriod}`} data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                <YAxis
                  label={{ value: copy.count, angle: -90, position: "insideLeft", fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                  tickCount={10}
                />
                <Tooltip
                  formatter={(value) => [`${value} ${copy.sites}`, copy.count]}
                  labelFormatter={(label) => `${copy.category}: ${label}`}
                />
                <Bar dataKey="value" name={copy.count} fill="#8884d8" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Weekly Comparison Line Chart
export function WeeklyComparisonChart({
  sites,
  language = "en",
  comparisonPeriod = "weekly",
  rangeDays,
  timelineGrouping,
  timelinePeriod,
}: {
  sites: SiteData[]
  language?: ReportLanguage
  comparisonPeriod?: "weekly" | "monthly"
  rangeDays?: number
  timelineGrouping: ReportTimelineGrouping
  timelinePeriod: string
}) {
  const t = (key: Parameters<typeof translateReport>[1]) => translateReport(language, key)
  const copy = getReportChartCopy(language)
  const [siteLimit, setSiteLimit] = useState(7)
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [downloadValue, setDownloadValue] = useState<"none" | "csv" | "json" | "png">("none")
  const [sortOrder, setSortOrder] = useState<"highest" | "lowest" | "none">("none")
  const chartRef = useRef<HTMLDivElement>(null)
  const effectiveComparisonPeriod = timelinePeriod !== "all" && timelineGrouping === "weekly"
    ? "weekly"
    : comparisonPeriod
  const isMonthly = effectiveComparisonPeriod === "monthly"
  const periodLabel = isMonthly ? copy.month : copy.week
  const matchesTimeline = (timestamp: string) =>
    timelinePeriod === "all" || getAqiPeriodBucket(timestamp, timelineGrouping, language).key === timelinePeriod
  let timelineLabel = "the selected reporting period"
  const allPeriodBucketMap = new Map<string, { key: string; label: string; sortValue: number }>()
  sites.forEach((site) => {
    site.reportMeasurements?.forEach((measurement) => {
      if (timelinePeriod !== "all") {
        const timelineBucket = getAqiPeriodBucket(measurement.timestamp, timelineGrouping, language)
        if (timelineBucket.key === timelinePeriod) timelineLabel = timelineBucket.label
      }
      const bucket = getAqiPeriodBucket(measurement.timestamp, isMonthly ? "monthly" : "weekly", language)
      allPeriodBucketMap.set(bucket.key, bucket)
    })
  })

  const allPeriodDefinitions = Array.from(allPeriodBucketMap.values()).sort((a, b) => a.sortValue - b.sortValue)
  let comparisonMode: "all" | "within-selection" | "adjacent" | "daily-fallback" | "weekly-fallback" =
    timelinePeriod === "all" ? "all" : "within-selection"
  let bucketForMeasurement = (timestamp: string) =>
    getAqiPeriodBucket(timestamp, isMonthly ? "monthly" : "weekly", language)
  let periodDefinitions = allPeriodDefinitions.filter((period) => {
    if (timelinePeriod === "all") return true
    return sites.some((site) => site.reportMeasurements?.some((measurement) =>
      matchesTimeline(measurement.timestamp) && bucketForMeasurement(measurement.timestamp).key === period.key,
    ))
  })

  // Compare a selected period with its predecessor. When none exists in the
  // downloaded report, use smaller periods inside the selection instead.
  if (timelinePeriod !== "all" && timelineGrouping === (isMonthly ? "monthly" : "weekly")) {
    const selectedDefinition = allPeriodDefinitions.find((period) => period.key === timelinePeriod)
    const previousDefinition = selectedDefinition
      ? [...allPeriodDefinitions].reverse().find((period) => period.sortValue < selectedDefinition.sortValue)
      : undefined

    if (selectedDefinition && previousDefinition) {
      periodDefinitions = [previousDefinition, selectedDefinition]
      comparisonMode = "adjacent"
    } else if (selectedDefinition) {
      const fallbackGrouping = isMonthly ? "weekly" : "daily"
      bucketForMeasurement = (timestamp: string) => getReportBucket(timestamp, fallbackGrouping, language)
      const fallbackBucketMap = new Map<string, { key: string; label: string; sortValue: number }>()
      sites.forEach((site) => {
        site.reportMeasurements?.forEach((measurement) => {
          if (!matchesTimeline(measurement.timestamp)) return
          const bucket = bucketForMeasurement(measurement.timestamp)
          fallbackBucketMap.set(bucket.key, bucket)
        })
      })
      periodDefinitions = Array.from(fallbackBucketMap.values()).sort((a, b) => a.sortValue - b.sortValue)
      comparisonMode = isMonthly ? "weekly-fallback" : "daily-fallback"
    }
  }
  const hasTemporalPeriods = periodDefinitions.length > 0
  const periodSeries = hasTemporalPeriods
    ? periodDefinitions.map((period, index) => ({
        dataKey: `period_${index}`,
        name: period.label,
        color: SITE_COLORS[index % SITE_COLORS.length],
        bucketKey: period.key,
      }))
    : [
        { dataKey: "previous", name: `${copy.previous} ${periodLabel}`, color: "#111827", bucketKey: "previous" },
        { dataKey: "current", name: `${copy.current} ${periodLabel}`, color: "#2563eb", bucketKey: "current" },
      ]

  const siteRows = sites.flatMap((site) => {
    const row: Record<string, string | number> = { name: site.siteDetails?.name || "Unknown" }
    if (hasTemporalPeriods) {
      const valuesByPeriod = new Map<string, number[]>()
      site.reportMeasurements?.forEach((measurement) => {
        const bucket = bucketForMeasurement(measurement.timestamp)
        if (!periodSeries.some((series) => series.bucketKey === bucket.key)) return
        valuesByPeriod.set(bucket.key, [...(valuesByPeriod.get(bucket.key) || []), measurement.value])
      })
      periodSeries.forEach((series) => {
        const values = valuesByPeriod.get(series.bucketKey) || []
        if (values.length > 0) {
          row[series.dataKey] = Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
        }
      })
    } else {
      row.current = Number((isMonthly
        ? site.averages?.monthlyAverages?.currentMonth || 0
        : site.averages?.weeklyAverages?.currentWeek || 0).toFixed(1))
      row.previous = Number((isMonthly
        ? site.averages?.monthlyAverages?.previousMonth || 0
        : site.averages?.weeklyAverages?.previousWeek || 0).toFixed(1))
    }
    return periodSeries.some((series) => typeof row[series.dataKey] === "number") ? [row] : []
  })

  const sitesWithData = siteRows

  const handleSiteLimitChange = (value: string) => {
    setSiteLimit(value === "all" ? sitesWithData.length : Number.parseInt(value, 10))
  }

  const handleDownload = async (type: "csv" | "json" | "png") => {
    if (type === "csv") {
      const dataStr =
        [copy.site, ...periodSeries.map((series) => series.name)].join(",") + "\n" +
        chartData.map((row) => [row.name, ...periodSeries.map((series) => row[series.dataKey] ?? "")].join(",")).join("\n")
      const blob = new Blob([dataStr], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${effectiveComparisonPeriod}_comparison_chart.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else if (type === "json") {
      const dataStr = JSON.stringify(chartData, null, 2)
      const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${effectiveComparisonPeriod}_comparison_chart.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (type === "png" && chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false,
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight,
        })

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${effectiveComparisonPeriod}_comparison_chart.png`
            a.click()
            URL.revokeObjectURL(url)
          }
        }, "image/png")
      } catch (error) {
        console.error("Error generating PNG:", error)
      }
    }
  }

  const handleDownloadChange = (value: "none" | "csv" | "json" | "png") => {
    setDownloadValue(value)
    if (value !== "none") {
      handleDownload(value)
      setDownloadValue("none")
    }
  }

  const latestPeriodKey = periodSeries[periodSeries.length - 1]?.dataKey
  const sortedSites = [...sitesWithData].sort((a, b) => {
    const aValue = Number(a[latestPeriodKey] || 0)
    const bValue = Number(b[latestPeriodKey] || 0)
    if (sortOrder === "highest") return bValue - aValue
    if (sortOrder === "lowest") return aValue - bValue
    return 0
  })

  const chartData = sortedSites.slice(0, siteLimit)

  const allValues = chartData.flatMap((item) => periodSeries.map((series) => Number(item[series.dataKey] || 0)))
  const maxComparisonValue = Math.max(0, ...allValues)
  const comparisonYAxisDomain = [0, Math.ceil(maxComparisonValue * 1.1)]
  const comparisonHeading = comparisonMode === "daily-fallback"
    ? "Daily"
    : comparisonMode === "weekly-fallback"
      ? "Weekly"
      : isMonthly ? "Monthly" : "Weekly"

  return (
    <Card className="w-full font-sans">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle className="text-base md:text-lg">
          {language === "en" ? comparisonHeading : t(isMonthly ? "monthly" : "weekly")} PM<sub>2.5</sub> {t("comparison")}
        </CardTitle>
        <p className="text-xs leading-5 text-slate-500 md:text-sm">
          {language !== "en" ? `${t("comparison")}: ${copy.entirePeriod}.` : <>
          {comparisonMode === "adjacent"
            ? `Comparing ${periodSeries[periodSeries.length - 1]?.name} with the previous available ${periodLabel.toLowerCase()}, ${periodSeries[0]?.name}.`
            : comparisonMode === "daily-fallback"
              ? periodSeries.length > 1
                ? `No earlier week is available in this report. Daily averages within ${timelineLabel} are shown for comparison.`
                : `No earlier week is available, and only one day has readings within ${timelineLabel}. A historical comparison cannot be calculated.`
              : comparisonMode === "weekly-fallback"
                ? `No earlier month is available in this report. Weekly averages within ${timelineLabel} are shown for comparison.`
                : isMonthly
                  ? `Each series represents one calendar month within ${timelineLabel}.`
                  : `${periodSeries.length} week${periodSeries.length === 1 ? "" : "s"} with data ${timelinePeriod === "all" ? "are shown for the reporting period" : `are shown within ${timelineLabel}`}.`}
          </>}
        </p>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <Select onValueChange={handleSiteLimitChange} defaultValue="7">
            <SelectTrigger className="w-full rounded-xl md:w-[160px]">
              <SelectValue placeholder={copy.sites} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="all">{copy.all} ({sitesWithData.length})</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(v: string) => setChartType(v as "line" | "bar")} defaultValue="line">
            <SelectTrigger className="w-full rounded-xl md:w-[160px]">
              <SelectValue placeholder={copy.type} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {copy.bar}
                </div>
              </SelectItem>
              <SelectItem value="line">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  {copy.line}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(v: string) => setSortOrder(v as "highest" | "lowest" | "none")} defaultValue="none">
            <SelectTrigger className="w-full rounded-xl md:w-[160px]">
              <SelectValue placeholder={copy.sort} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  {copy.noSorting}
                </div>
              </SelectItem>
              <SelectItem value="highest">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  {copy.highestFirst}
                </div>
              </SelectItem>
              <SelectItem value="lowest">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {copy.lowestFirst}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={downloadValue} onValueChange={handleDownloadChange}>
            <SelectTrigger className="w-full rounded-xl md:w-[160px]">
              <SelectValue placeholder={copy.download} />
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
      </CardHeader>
      <CardContent>
        {siteLimit > 7 && (
          <p className="text-yellow-600 text-xs md:text-sm mb-2">
            {language === "en" ? "Warning: Displaying more than 7 sites may affect readability." : `${copy.sites}: 7+`}
          </p>
        )}
        <div className="h-[250px] md:h-[300px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart key={`comparison-line-${timelineGrouping}-${timelinePeriod}`} data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                <YAxis
                  domain={comparisonYAxisDomain}
                  label={{ value: "PM₂.₅ (µg/m³)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                  tickCount={10}
                />
                <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)} µg/m³`, name]} labelFormatter={(label) => `${copy.site}: ${label}`} contentStyle={{ fontSize: 11 }} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                {periodSeries.map((series) => (
                  <Line
                    key={series.dataKey}
                    type="monotone"
                    dataKey={series.dataKey}
                    name={series.name}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart key={`comparison-bar-${timelineGrouping}-${timelinePeriod}`} data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                <YAxis
                  domain={comparisonYAxisDomain}
                  label={{ value: "PM₂.₅ (µg/m³)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                  tickCount={10}
                />
                <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)} µg/m³`, name]} labelFormatter={(label) => `${copy.site}: ${label}`} contentStyle={{ fontSize: 11 }} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                {periodSeries.map((series) => (
                  <Bar key={series.dataKey} dataKey={series.dataKey} name={series.name} fill={series.color} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// AQI Index Visualization
export function AQIIndexVisual({ aqiCategory, pm25Value, language = "en" }: { aqiCategory: string; pm25Value: number; language?: ReportLanguage }) {
  const t = (key: Parameters<typeof translateReport>[1]) => translateReport(language, key)
  const copy = getReportChartCopy(language)
  const [downloadValue, setDownloadValue] = useState<"none" | "png">("none")
  const chartRef = useRef<HTMLDivElement>(null)

  const getColorByCategory = (category: string): string => {
    return AQI_COLORS[category] || "#CCCCCC"
  }

  const getIndexPosition = (pm25: number): number => {
    if (pm25 <= 12) return 10
    if (pm25 <= 35.4) return 30
    if (pm25 <= 55.4) return 50
    if (pm25 <= 150.4) return 70
    if (pm25 <= 250.4) return 85
    return 95
  }

  const handleDownload = async (type: "png") => {
    if (type === "png" && chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false,
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight,
        })

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "aqi_index_chart.png"
            a.click()
            URL.revokeObjectURL(url)
          }
        }, "image/png")
      } catch (error) {
        console.error("Error generating PNG:", error)
      }
    }
  }

  const handleDownloadChange = (value: "none" | "png") => {
    setDownloadValue(value)
    if (value !== "none") {
      handleDownload(value)
      setDownloadValue("none")
    }
  }

  return (
    <Card className="w-full font-sans">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle className="text-base md:text-lg">{t("airQualityIndex")}</CardTitle>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <Select value={downloadValue} onValueChange={handleDownloadChange}>
            <SelectTrigger className="w-full rounded-xl md:w-[160px]">
              <SelectValue placeholder={copy.download} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {copy.export}
                </div>
              </SelectItem>
              <SelectItem value="png">PNG</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center" ref={chartRef}>
          <div className="w-full h-6 md:h-8 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 via-red-400 via-purple-400 to-red-800 rounded-lg mb-2 relative">
            <div
              className="absolute top-full w-0 h-0 border-l-6 md:border-l-8 border-r-6 md:border-r-8 border-b-6 md:border-b-8 border-l-transparent border-r-transparent border-b-gray-800"
              style={{ left: `${getIndexPosition(pm25Value)}%`, transform: "translateX(-50%)" }}
            ></div>
          </div>

          <div className="w-full flex justify-between text-[10px] md:text-xs text-gray-600 mb-4 flex-wrap gap-1">
            <span>{copy.good}</span>
            <span>{copy.moderate}</span>
            <span>{copy.sensitiveGroups}</span>
            <span>{copy.unhealthy}</span>
            <span>{copy.veryUnhealthy}</span>
            <span>{copy.hazardous}</span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-2">
            <div
              className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base"
              style={{ backgroundColor: getColorByCategory(aqiCategory) }}
            >
              {pm25Value.toFixed(1)}
            </div>
            <div className="text-center">
              <p className="text-base md:text-lg font-bold">{translateAqiCategory(aqiCategory, language)}</p>
              <p className="text-xs md:text-sm text-gray-600">{pm25Value.toFixed(1)} µg/m³</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
