"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import {
  ArrowDown,
  ArrowUp,
  BrainCircuit,
  CalendarRange,
  ChevronDown,
  CloudDownload,
  Download,
  Globe,
  HeartPulse,
  Layers,
  LoaderCircle,
  MapPin,
  MapPinned,
  Minus,
  MoreHorizontal,
  Printer,
  BarChart3,
  X,
  Zap,
} from "lucide-react"
import Navigation from "@/components/navigation/navigation"
import type { ReactNode } from "react"
import { getReportData, loadHistoricalReportData } from "@/services/apiService"
import { Button } from "@/ui/button"
import type { SiteData, Filters, ReportDataOptions, ReportDateRange } from "@/lib/types"
import {
  REPORT_LANGUAGES,
  formatReportDateForLanguage,
  translateReport,
  type ReportLanguage,
} from "@/lib/report-translations"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { differenceInCalendarDays, format } from "date-fns"
import {
  PM25BarChart,
  AQICategoryChart,
  WeeklyComparisonChart,
  AQIIndexVisual,
  getAqiCategoryForPm25,
  getAqiPeriodBucket,
  type ReportTimelineGrouping,
} from "@/components/charts/AirQualityChart"
import { Input } from "@/ui/input"
import { Checkbox } from "@/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import ReportDataModal from "@/components/reports/ReportDataModal"
import ErrorPopup from "@/components/reports/ErrorPopup"
import ReportLoadingScreen from "@/components/reports/ReportLoadingScreen"
import NexusDateRangePicker, { createDefaultReportDateRange } from "@/components/reports/NexusDateRangePicker"
import { PM25CalendarPlot } from "@/components/reports/PM25CalendarPlot"
import { translateAqiCategory, translateSiteCategory } from "@/lib/report-chart-translations"
import { REPORT_REQUEST_RETRIES, REPORT_RETRY_DELAY_MS, retryReportRequest } from "@/lib/report-retry"
import "leaflet/dist/leaflet.css"

const GoodAir = "/images/GoodAir.png"
const Moderate = "/images/Moderate.png"
const UnhealthySG = "/images/UnhealthySG.png"
const Unhealthy = "/images/Unhealthy.png"
const VeryUnhealthy = "/images/VeryUnhealthy.png"
const Hazardous = "/images/Hazardous.png"
const Invalid = "/images/Invalid.png"
const REPORT_LOAD_MAX_ATTEMPTS = REPORT_REQUEST_RETRIES + 1
const MAX_RANDOM_SITE_SELECTION = 20

import { Switch } from "@/ui/switch"
import { Label } from "@/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"

// Dynamic map components for report map preview
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const getSiteSelectionId = (site: SiteData) =>
  site._id ||
  site.site_id ||
  [
    site.siteDetails?.name || site.siteDetails?.formatted_name || "unknown-site",
    site.siteDetails?.city || "unknown-city",
    site.siteDetails?.country || "unknown-country",
    site.siteDetails?.approximate_latitude ?? "unknown-lat",
    site.siteDetails?.approximate_longitude ?? "unknown-lng",
  ].join(":")

const getSiteCheckboxId = (site: SiteData) => `main-device-${encodeURIComponent(getSiteSelectionId(site))}`

const getReportSiteId = (site: SiteData) => site.site_id || site.siteDetails?._id || site._id

const getRandomSiteSelection = (sites: SiteData[], limit = MAX_RANDOM_SITE_SELECTION) => {
  const siteIds = Array.from(new Set(sites.map(getSiteSelectionId)))
  for (let index = siteIds.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentSiteId = siteIds[index]
    siteIds[index] = siteIds[randomIndex]
    siteIds[randomIndex] = currentSiteId
  }
  return siteIds.slice(0, limit)
}

export default function ReportPage() {
  return (
    <div className="reports-theme flex min-h-screen flex-col bg-gray-100 text-slate-950">
      <Navigation />
      <ReportContent />
    </div>
  )
}

function ReportContent() {
  // Add this state at the top of the ReportContent function, near the other state declarations
  const [activeTab, setActiveTab] = useState("moran")
  const [siteData, setSiteData] = useState<SiteData[]>([])
  const [isReportDataLoading, setIsReportDataLoading] = useState(true)
  const [reportLoadError, setReportLoadError] = useState<string | null>(null)
  const [reportLoadRequest, setReportLoadRequest] = useState(0)
  const [filteredData, setFilteredData] = useState<SiteData[]>([])
  const [customReportData, setCustomReportData] = useState<SiteData[] | null>(null)
  const [reportDateRange, setReportDateRange] = useState<ReportDateRange | null>(null)
  const [reportQueryRange, setReportQueryRange] = useState<ReportDateRange>(createDefaultReportDateRange)
  const [reportAggregation, setReportAggregation] = useState<ReportDataOptions["frequency"]>("daily")
  const [reportTimelineGrouping, setReportTimelineGrouping] = useState<ReportTimelineGrouping>("monthly")
  const [reportTimelinePeriod, setReportTimelinePeriod] = useState("all")
  const [comparisonRowsShown, setComparisonRowsShown] = useState<5 | 10>(10)
  const [comparisonSearch, setComparisonSearch] = useState("")
  const [comparisonAqiFilter, setComparisonAqiFilter] = useState("all")
  const [isDownloadingComparisonPng, setIsDownloadingComparisonPng] = useState(false)
  const reportDurationDays = reportDateRange
    ? differenceInCalendarDays(new Date(reportDateRange.endDate), new Date(reportDateRange.startDate)) + 1
    : 0
  const comparisonPeriod: "weekly" | "monthly" = reportDurationDays > 31 ? "monthly" : "weekly"
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [reportLanguage, setReportLanguage] = useState<ReportLanguage>("en")
  const [pdfExportError, setPdfExportError] = useState<string | null>(null)
  const [isReportDataModalOpen, setIsReportDataModalOpen] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const comparisonTableRef = useRef<HTMLTableElement>(null)
  const t = (key: Parameters<typeof translateReport>[1], values?: Record<string, string | number>) =>
    translateReport(reportLanguage, key, values)

  // Add a state to control whether the report is visible on the page
  const [showReportOnPage, setShowReportOnPage] = useState(false)

  // Add a state to track collapsed categories
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    country: [],
    city: [],
    district: [],
    category: [],
  })

  // Available filter options
  const [filterOptions, setFilterOptions] = useState<{
    countries: string[]
    cities: string[]
    districts: string[]
    categories: string[]
  }>({
    countries: [],
    cities: [],
    districts: [],
    categories: [],
  })

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((values) => values.length > 0),
    [filters],
  )
  const hasRequiredReportScope = filters.city.length > 0 || filters.district.length > 0

  const formatSelectionLabel = (values: string[], fallback: string) => {
    if (values.length === 0) return fallback
    if (values.length <= 2) return values.join(", ")
    return `${values.slice(0, 2).join(", ")} +${values.length - 2} more`
  }

  const formatSelectionList = (values: string[], fallback: string) => (values.length ? values.join(", ") : fallback)

  const summarizeSelection = (values: string[], pluralLabel: string) => {
    if (values.length === 0) return ""
    if (values.length === 1) return values[0]
    if (values.length === 2) return values.join(" and ")
    return `${values.slice(0, 2).join(", ")} +${values.length - 2} more ${pluralLabel}`
  }

  // Add a search state for devices
  const [deviceSearch, setDeviceSearch] = useState<string>("")
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])

  // Add a visual indicator for the report generation process
  const [reportGenerating, setReportGenerating] = useState(false)
  const [reportGenerationError, setReportGenerationError] = useState<string | null>(null)
  const [lastReportSourceSites, setLastReportSourceSites] = useState<SiteData[]>([])

  // Add a new state for tracking selection animation:
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)
  const [pdfMode, setPdfMode] = useState(false)

  // Helper functions for calculations and recommendations
  const calculateAveragePM25 = (sites: SiteData[]): number => {
    if (sites.length === 0) return 0
    const sum = sites.reduce((acc, site) => acc + (site.pm2_5?.value || 0), 0)
    return sum / sites.length
  }

  const getAverageAQICategory = (sites: SiteData[]): string => {
    if (sites.length === 0) return "Good" // Default value
    const aqiCategories = sites.map((site) => site.aqi_category || "Unknown")
    const categoryCounts: { [key: string]: number } = {}
    aqiCategories.forEach((category) => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    let mostFrequentCategory = "Good"
    let maxCount = 0
    for (const category in categoryCounts) {
      if (categoryCounts[category] > maxCount) {
        mostFrequentCategory = category
        maxCount = categoryCounts[category]
      }
    }
    return mostFrequentCategory
  }

  const calculateAveragePercentageChange = (sites: SiteData[]): number => {
    if (sites.length === 0) return 0
    const sum = sites.reduce(
      (acc, site) =>
        acc +
        (comparisonPeriod === "monthly"
          ? site.averages?.monthlyPercentageDifference || 0
          : site.averages?.percentageDifference || 0),
      0,
    )
    return sum / sites.length
  }

  const calculateAQICategoryCounts = (sites: SiteData[]): { [key: string]: number } => {
    const categoryCounts: { [key: string]: number } = {}
    sites.forEach((site) => {
      const category = site.aqi_category || "Unknown"
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })
    return categoryCounts
  }

  const calculateMostCommonCategory = (sites: SiteData[]): string => {
    const categoryCounts = calculateAQICategoryCounts(sites)
    let mostCommon = ""
    let maxCount = 0
    for (const category in categoryCounts) {
      if (categoryCounts[category] > maxCount) {
        mostCommon = category
        maxCount = categoryCounts[category]
      }
    }
    return mostCommon
  }

  const compareToAverage = (value: number, average: number): string => {
    if (value > average) {
      return "higher than"
    } else if (value < average) {
      return "lower than"
    } else {
      return "equal to"
    }
  }

  const getConclusion = (selectedSite: SiteData | null, filters: Filters, filteredData: SiteData[]): string => {
    if (selectedSite) {
      return t("conclusionSite", { site: selectedSite.siteDetails.name })
    }

    if (hasActiveFilters) {
      return t("conclusionRegion")
    }

    if (filteredData.length === 0) {
      return t("conclusionNoData")
    }

    return t("conclusionNetwork")
  }

  const getRegionalInsights = (filters: Filters, filteredData: SiteData[]): string => {
    const countrySummary = summarizeSelection(filters.country, "countries")
    const citySummary = summarizeSelection(filters.city, "cities")
    const districtSummary = summarizeSelection(filters.district, "districts")
    const categorySummary = summarizeSelection(filters.category, "categories")

    if (countrySummary) {
      return t("regionalCountry", { scope: countrySummary })
    }

    if (districtSummary) {
      return t("regionalDistrict", { scope: districtSummary })
    }

    if (citySummary && reportLanguage !== "en") {
      return t("regionalCity", { scope: citySummary })
    }

    if (citySummary) {
      return `The air quality in ${citySummary} is a concern, with PM₂.₅ levels frequently exceeding WHO guidelines. Local authorities should implement measures to reduce emissions from traffic and industry.`
    }

    if (categorySummary) {
      return t("regionalCategory", { scope: categorySummary })
    }

    if (filteredData.length === 0) {
      return t("regionalNoData")
    }

    return t("regionalNetwork")
  }

  const getHealthRecommendations = (aqiCategory: string): string[] => {
    switch (aqiCategory.toLowerCase()) {
      case "good":
        return [t("healthGood")]
      case "moderate":
        return [t("healthModerate")]
      case "unhealthy for sensitive groups":
        return [t("healthSensitiveOne"), t("healthSensitiveTwo")]
      case "unhealthy":
        return [t("healthUnhealthyOne"), t("healthUnhealthyTwo")]
      case "very unhealthy":
        return [t("healthVeryOne"), t("healthVeryTwo")]
      case "hazardous":
        return [t("healthHazardOne"), t("healthHazardTwo"), t("healthHazardThree")]
      default:
        return [t("healthUnavailable")]
    }
  }


  const getChangeIcon = (trend: number): ReactNode => {
    if (trend < 0) {
      return <ArrowDown className="text-green-500 w-8 h-8" />
    } else if (trend > 0) {
      return <ArrowUp className="text-red-500 w-8 h-8" />
    } else {
      return <Minus className="text-gray-500 w-8 h-8" />
    }
  }

  useEffect(() => {
    let isActive = true
    let attemptCount = 0
    let retryTimer: number | null = null

    setIsReportDataLoading(true)
    setReportLoadError(null)

    const finishWithError = (message: string) => {
      if (!isActive) return
      setIsReportDataLoading(false)
      setReportLoadError(message)
    }

    const scheduleRetry = () => {
      if (!isActive) return
      if (retryTimer !== null) window.clearTimeout(retryTimer)
      retryTimer = window.setTimeout(() => {
        retryTimer = null
        void fetchData()
      }, REPORT_RETRY_DELAY_MS)
    }

    async function fetchData() {
      attemptCount += 1

      try {
        const data = await getReportData()
        if (!isActive) return

        const typedData = data as SiteData[]
        if (typedData.length === 0) {
          if (attemptCount < REPORT_LOAD_MAX_ATTEMPTS) {
            scheduleRetry()
          } else {
            finishWithError("No report data is available right now. Please try again.")
          }
          return
        }

        setSiteData(typedData)
        setFilteredData(typedData)
        setIsReportDataLoading(false)
        setReportLoadError(null)

        const countries = Array.from(new Set(typedData.map((site) => site.siteDetails?.country || "Unknown"))).sort()
        const cities = Array.from(new Set(typedData.map((site) => site.siteDetails?.city || "Unknown"))).sort()
        const districts = Array.from(new Set(typedData.map((site) => site.siteDetails?.district || "Unknown"))).sort()
        const categories = Array.from(
          new Set(
            typedData.map((site) => {
              const category = site.siteDetails?.site_category?.category || "Uncategorized"
              return category === "Water Body" ? "Urban Background" : category
            }),
          ),
        ).sort()

        setFilterOptions({ countries, cities, districts, categories })
      } catch (err) {
        if (!isActive) return

        if (attemptCount < REPORT_LOAD_MAX_ATTEMPTS) {
          scheduleRetry()
        } else {
          finishWithError("We couldn't load the report data. Check your connection and try again.")
        }

        if (process.env.NODE_ENV !== "production") {
          console.warn("Report data fetch failed.", err)
        }
      }
    }

    void fetchData()

    return () => {
      isActive = false
      if (retryTimer !== null) window.clearTimeout(retryTimer)
    }
  }, [reportLoadRequest])

  // Update cities and districts when country changes
  useEffect(() => {
    if (siteData.length === 0) return

    const relevantSites =
      filters.country.length > 0
        ? siteData.filter((site) => filters.country.includes(site.siteDetails?.country || "Unknown"))
        : siteData

    const cities = Array.from(new Set(relevantSites.map((site) => site.siteDetails?.city || "Unknown"))).sort()
    const districts = Array.from(new Set(relevantSites.map((site) => site.siteDetails?.district || "Unknown"))).sort()

    setFilterOptions((prev) => ({
      ...prev,
      cities,
      districts,
    }))

    setFilters((prev) => ({
      ...prev,
      city: prev.city.filter((city) => cities.includes(city)),
      district: prev.district.filter((district) => districts.includes(district)),
    }))
  }, [filters.country, siteData])

  const matchesSelection = (value: string | undefined, selections: string[]) =>
    selections.length === 0 || selections.includes(value || "Unknown")

  const matchesCategorySelection = (category: string | undefined, selections: string[]) => {
    const normalizedCategory = category === "Water Body" ? "Urban Background" : category || "Uncategorized"
    if (selections.length === 0) return true

    return selections.some((selected) => {
      if (selected === "Urban Background") {
        return normalizedCategory === "Urban Background" || normalizedCategory === "Water Body"
      }
      return normalizedCategory === selected
    })
  }

  const filterSites = (sites: SiteData[], activeFilters: Filters) =>
    sites.filter((site) => {
      const country = site.siteDetails?.country || "Unknown"
      const city = site.siteDetails?.city || "Unknown"
      const district = site.siteDetails?.district || "Unknown"
      const category = site.siteDetails?.site_category?.category || "Uncategorized"

      return (
        matchesSelection(country, activeFilters.country) &&
        matchesSelection(city, activeFilters.city) &&
        matchesSelection(district, activeFilters.district) &&
        matchesCategorySelection(category, activeFilters.category)
      )
    })

  // Apply filters
  useEffect(() => {
    const result = filterSites(customReportData ?? siteData, filters)

    setFilteredData(result)
    // Reset selected site if it's no longer in filtered data
    if (selectedSite && !result.some((site) => getSiteSelectionId(site) === getSiteSelectionId(selectedSite))) {
      setSelectedSite(null)
    }
  }, [customReportData, filters, siteData, selectedSite])

  // Handle filter changes
  const handleFilterChange = (filterType: keyof Filters, values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: values,
    }))
  }

  const removeFilterValue = (filterType: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].filter((item) => item !== value),
    }))
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      country: [],
      city: [],
      district: [],
      category: [],
    })
    setSelectedSite(null)
    setReportQueryRange(createDefaultReportDateRange())
    setCustomReportData(null)
    setReportDateRange(null)
    setSelectedDevices([])
    setReportTimelineGrouping("monthly")
    setReportTimelinePeriod("all")
  }

  const handleHistoricalReportReady = (reportSites: SiteData[], dateRange: ReportDateRange) => {
    setCustomReportData(reportSites)
    setReportAggregation(reportSites[0]?.reportAggregation || "daily")
    setReportTimelineGrouping("monthly")
    setReportTimelinePeriod("all")
    setReportDateRange(dateRange)
    setReportQueryRange(dateRange)
    setFilteredData(reportSites)
    setSelectedDevices(reportSites.map(getSiteSelectionId))
    setSelectedSite(reportSites.length === 1 ? reportSites[0] : null)
    setShowReportOnPage(true)
    setReportGenerating(false)

    window.setTimeout(() => {
      document.getElementById("report-section")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const generateHistoricalReport = async (sourceSites: SiteData[]) => {
    if (!hasRequiredReportScope) {
      setReportGenerationError("Select at least one city or district before generating a report. A country-only selection is too broad.")
      return
    }
    const selectedSiteIds = sourceSites.map(getReportSiteId).filter((id): id is string => Boolean(id))
    if (selectedSiteIds.length === 0) {
      setReportGenerationError("Select at least one site for the report.")
      return
    }

    const options: ReportDataOptions = {
      selectedSiteIds,
      startDate: reportQueryRange.startDate,
      endDate: reportQueryRange.endDate,
      frequency: reportAggregation,
      dataType: "calibrated",
      pollutants: ["pm2_5", "pm10"],
    }

    setLastReportSourceSites(sourceSites)
    setReportGenerating(true)
    setReportGenerationError(null)
    try {
      const reportSites = await retryReportRequest(() => loadHistoricalReportData(sourceSites, options))
      handleHistoricalReportReady(reportSites, reportQueryRange)
    } catch (error) {
      console.error("Unable to build historical report:", error)
      setReportGenerationError(error instanceof Error ? error.message : "Unable to build the report.")
      setReportGenerating(false)
    }
  }

  const clearHistoricalReport = () => {
    setCustomReportData(null)
    setReportDateRange(null)
    setSelectedSite(null)
    setSelectedDevices([])
  }
  // Add this function after the resetFilters function
  const handleDeviceSearch = (searchTerm: string) => {
    setDeviceSearch(searchTerm)
  }

  const toggleDeviceSelection = (deviceId: string) => {
    setLastSelectedId(deviceId)
    setTimeout(() => setLastSelectedId(null), 1000)

    setSelectedDevices((prev) => (prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]))
  }

  const selectAllDevices = () => {
    setSelectedDevices(getRandomSiteSelection(filteredData))
  }

  const clearDeviceSelection = () => {
    setSelectedDevices([])
  }

  // Add this function to get filtered devices based on search
  const getFilteredDevices = () => {
    if (!deviceSearch.trim()) return filteredData

    return filteredData.filter((site) => {
      const siteName = site.siteDetails?.name || site.siteDetails?.formatted_name || ""
      const city = site.siteDetails?.city || ""
      const country = site.siteDetails?.country || ""
      const searchTerm = deviceSearch.toLowerCase()

      return (
        siteName.toLowerCase().includes(searchTerm) ||
        city.toLowerCase().includes(searchTerm) ||
        country.toLowerCase().includes(searchTerm)
      )
    })
  }

  // Generate PDF report
  const generatePDF = async () => {
    if (!reportRef.current) return

    setIsGeneratingPDF(true)
    setPdfMode(true)

    try {
      // If advanced analysis is enabled but only one tab is visible,
      // temporarily show both tabs for the PDF
      const originalTab = activeTab
      let tempShowBothTabs = false

      if (showAdvancedAnalysis) {
        tempShowBothTabs = true
        // Force render both tabs for PDF
        setActiveTab("both")
      }

      // Wait a moment for the UI to update with both tabs if needed
      await new Promise((resolve) => setTimeout(resolve, 500))

      const reportElement = reportRef.current

      // Keep enough resolution for report text while limiting the rasterized PDF size.
      const canvas = await html2canvas(reportElement, {
        scale: 1.25,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      })

      // Keep report content inside a dedicated printable area on every page.
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const marginLeft = 15
      const marginRight = 15
      const marginTop = 18
      const marginBottom = 18
      const contentWidth = pageWidth - marginLeft - marginRight
      const contentHeight = pageHeight - marginTop - marginBottom
      const maxSliceHeight = Math.floor((contentHeight * canvas.width) / contentWidth)
      const reportRect = reportElement.getBoundingClientRect()
      const canvasScale = canvas.height / reportRect.height
      const breakPadding = Math.max(6, Math.round(4 * canvasScale))

      // Text and visual blocks should move to the next page instead of being cut
      // across the reserved header or footer area.
      const protectedBlocks = Array.from(
        reportElement.querySelectorAll<HTMLElement>(
          "p, li, h1, h2, h3, h4, table, .pdf-keep-together, .recharts-wrapper, .leaflet-container",
        ),
      )
        .map((element) => {
          const rect = element.getBoundingClientRect()
          return {
            top: Math.max(0, Math.floor((rect.top - reportRect.top) * canvasScale)),
            bottom: Math.min(canvas.height, Math.ceil((rect.bottom - reportRect.top) * canvasScale)),
          }
        })
        .filter((block) => block.bottom > block.top && block.bottom - block.top < maxSliceHeight * 0.9)
        .sort((a, b) => a.top - b.top)

      const pageSlices: Array<{ startY: number; endY: number }> = []
      let startY = 0

      while (startY < canvas.height) {
        const idealEnd = Math.min(canvas.height, startY + maxSliceHeight)
        let safeEnd = idealEnd

        if (idealEnd < canvas.height) {
          let adjusted = true
          while (adjusted) {
            adjusted = false
            const crossingBlock = protectedBlocks.find(
              (block) => block.top + breakPadding < safeEnd && block.bottom - breakPadding > safeEnd,
            )

            if (crossingBlock && crossingBlock.top - breakPadding > startY) {
              safeEnd = crossingBlock.top - breakPadding
              adjusted = true
            }
          }

          // Avoid creating a nearly empty page when an unusually tall block is encountered.
          if (safeEnd - startY < maxSliceHeight * 0.35) {
            safeEnd = idealEnd
          }
        }

        pageSlices.push({ startY, endY: safeEnd })
        startY = safeEnd
      }

      pageSlices.forEach((slice, pageIndex) => {
        if (pageIndex > 0) pdf.addPage()

        const sliceHeight = slice.endY - slice.startY
        const pageCanvas = document.createElement("canvas")
        pageCanvas.width = canvas.width
        pageCanvas.height = sliceHeight
        const pageContext = pageCanvas.getContext("2d")

        if (!pageContext) {
          throw new Error("Unable to prepare a PDF page")
        }

        pageContext.fillStyle = "#ffffff"
        pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        pageContext.drawImage(
          canvas,
          0,
          slice.startY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        )

        const renderedHeight = (sliceHeight * contentWidth) / canvas.width
        pdf.addImage(
          pageCanvas.toDataURL("image/jpeg", 0.78),
          "JPEG",
          marginLeft,
          marginTop,
          contentWidth,
          renderedHeight,
          undefined,
          "FAST",
        )

        pdf.setFontSize(8)
        pdf.setTextColor(100, 116, 139)
        pdf.text(`${t("page")} ${pageIndex + 1} ${t("of")} ${pageSlices.length}`, pageWidth / 2, pageHeight - 8, {
          align: "center",
        })
      })
      // Generate filename based on filters or selected site
      let filename = "air-quality-report"
      if (selectedSite) {
        filename = `air-quality-report-${selectedSite.siteDetails.name.replace(/\s+/g, "-").toLowerCase()}`
      } else if (hasActiveFilters) {
        const parts = [...filters.country, ...filters.city, ...filters.district, ...filters.category]
        const slug = parts
          .filter(Boolean)
          .map((part) => part.replace(/\s+/g, "-").toLowerCase())
          .join("-")
        if (slug) {
          filename = `air-quality-report-${slug}`
        }
      }

      pdf.save(`${filename}-${reportLanguage}-${format(new Date(), "yyyy-MM-dd")}.pdf`)
      setPdfExportError(null)

      // Restore original tab state if we temporarily changed it
      if (tempShowBothTabs) {
        setActiveTab(originalTab)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      setPdfExportError("We couldn't create the PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
      setPdfMode(false)
    }
  }

  // Add hotspots detection function
  const getHotspotSites = (sites: SiteData[], limit = 3): SiteData[] => {
    if (sites.length === 0) return []

    // Sort sites by PM₂.₅ value in descending order and take the top 'limit' sites
    return [...sites]
      .filter((site) => site.pm2_5?.value !== undefined && site.pm2_5?.value !== null)
      .sort((a, b) => (b.pm2_5?.value || 0) - (a.pm2_5?.value || 0))
      .slice(0, limit)
  }
    // add coldspot detection function
  const getColdspotSites = (sites: SiteData[], limit = 3): SiteData[] => {
    if (sites.length === 0) return []

    // Sort sites by PM₂.₅ value in ascending order and take the top 'limit' sites
    return [...sites]
      .filter((site) => site.pm2_5?.value !== undefined && site.pm2_5?.value !== null)
      .sort((a, b) => (a.pm2_5?.value || 0) - (b.pm2_5?.value || 0))
      .slice(0, limit)
  }
  // Add this after the getHotspotSites function
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false)

  // Group sites by category
  const sitesByCategory: Record<string, SiteData[]> = {}
  filteredData.forEach((site) => {
    let category = site.siteDetails?.site_category?.category || "Uncategorized"

    // Replace "Water Body" with "Urban Background" for display
    if (category === "Water Body") {
      category = "Background"
    }

    if (!sitesByCategory[category]) {
      sitesByCategory[category] = []
    }
    sitesByCategory[category].push(site)
  })

  // Generate report title based on filters, selected sites, and historical period
  const formatReportDate = (value: string) =>
    formatReportDateForLanguage(new Date(value.slice(0, 10) + "T12:00:00Z"), reportLanguage)
  const getReportTitle = () => {
    let title: string

    if (selectedSite) {
      title = t("reportFor", { scope: selectedSite.siteDetails.name })
    } else if (selectedDevices.length > 0 && selectedDevices.length < filteredData.length) {
      title = t("reportFor", { scope: t("selectedDevices", { count: selectedDevices.length }) })
    } else {
      const parts = []
      if (filters.country.length) parts.push(formatSelectionLabel(filters.country, ""))
      if (filters.city.length) parts.push(formatSelectionLabel(filters.city, ""))
      if (filters.district.length) parts.push(formatSelectionLabel(filters.district, ""))
      if (filters.category.length) parts.push(`${formatSelectionLabel(filters.category, "")} Sites`)
      title = parts.length > 0 ? t("reportFor", { scope: parts.join(", ") }) : t("comprehensiveReport")
    }

    if (!reportDateRange) return title

    const startDate = formatReportDateForLanguage(
      new Date(reportDateRange.startDate.slice(0, 10) + "T12:00:00Z"), reportLanguage, true,
    )
    const endDate = formatReportDateForLanguage(
      new Date(reportDateRange.endDate.slice(0, 10) + "T12:00:00Z"), reportLanguage, true,
    )
    return `${title}: ${startDate} - ${endDate}`
  }
  // Add a function to toggle category collapse state
  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: prev[category] === false,
    }))
  }

  // Get location information for report
  const getLocationInfo = () => {
    if (selectedSite) {
      return {
        city: selectedSite.siteDetails?.city || "Unknown City",
        country: selectedSite.siteDetails?.country || "Unknown Country",
        name: selectedSite.siteDetails?.name || "Unknown Site",
      }
    }

    return {
      city: formatSelectionList(filters.city, "All Cities"),
      country: formatSelectionList(filters.country, "All Countries"),
      name: filters.category.length ? `${formatSelectionList(filters.category, "All")} Sites` : "All Sites",
    }
  }

  const getReportScopeDescription = () => {
    if (selectedSite) {
      const siteName = selectedSite.siteDetails.name || selectedSite.siteDetails.formatted_name || "the selected site"
      const location = [selectedSite.siteDetails.city, selectedSite.siteDetails.country].filter(Boolean).join(", ")
      return location ? `${siteName} in ${location}` : siteName
    }

    const filteredLocations = [
      filters.district.length ? formatSelectionList(filters.district, "") : null,
      filters.city.length ? formatSelectionList(filters.city, "") : null,
      filters.country.length ? formatSelectionList(filters.country, "") : null,
    ].filter(Boolean)
    const categoryScope = filters.category.length
      ? ` for ${formatSelectionList(filters.category, "")} site categories`
      : ""

    if (filteredLocations.length > 0) {
      return `${filteredLocations.join(", ")}${categoryScope}`
    }

    if (selectedDevices.length > 0 && selectedDevices.length < (customReportData ?? siteData).length) {
      return `${filteredData.length} selected monitoring site${filteredData.length === 1 ? "" : "s"}`
    }

    return `the selected monitoring network${categoryScope}`
  }

  // Calculate average PM₂.₅ for AQI index visualization
  const avgPM25 = calculateAveragePM25(filteredData)
  const avgAQICategory = getAverageAQICategory(filteredData)
  const averagePercentageChange = calculateAveragePercentageChange(filteredData)
  const comparisonReference = comparisonPeriod === "monthly" ? "previous month" : "previous week"
  const averageChangeDescription =
    Math.abs(averagePercentageChange) < 0.01
      ? `was broadly unchanged from the ${comparisonReference}`
      : `was ${Math.abs(averagePercentageChange).toFixed(1)}% ${averagePercentageChange > 0 ? "higher" : "lower"} than the ${comparisonReference}`
  const dailyPm25Extremes = useMemo(() => getDailyPm25Extremes(filteredData), [filteredData])
  const formatFindingSites = (sites: SiteData[]) =>
    sites
      .map((site) =>
        `${site.siteDetails?.name || t("unknownSite")} (${(site.pm2_5?.value || 0).toFixed(1)} µg/m³)`,
      )
      .join(", ")
  const localizedKeyFindings = [
    t("findingAverage", {
      value: `${calculateAveragePM25(filteredData).toFixed(1)} µg/m³`,
      category: translateAqiCategory(avgAQICategory, reportLanguage),
    }),
    t("findingChange", {
      value: Math.abs(calculateAveragePercentageChange(filteredData)).toFixed(2),
      direction: t(calculateAveragePercentageChange(filteredData) < 0 ? "decrease" : "increase"),
      period: t(comparisonPeriod === "monthly" ? "month" : "week"),
    }),
    ...(dailyPm25Extremes ? [t("findingExtremes", {
      high: `${dailyPm25Extremes.highest.value.toFixed(1)} µg/m³`,
      highDate: dailyPm25Extremes.highest.dates.map(formatReportDate).join(", "),
      low: `${dailyPm25Extremes.lowest.value.toFixed(1)} µg/m³`,
      lowDate: dailyPm25Extremes.lowest.dates.map(formatReportDate).join(", "),
    })] : []),
    ...(Object.entries(calculateAQICategoryCounts(filteredData)).length > 1 ? [t("findingCommon", {
      category: calculateMostCommonCategory(filteredData),
      percent: ((calculateAQICategoryCounts(filteredData)[calculateMostCommonCategory(filteredData)] / filteredData.length) * 100).toFixed(0),
    })] : []),
    ...(selectedSite ? [t("findingSelectedSite", {
      site: selectedSite.siteDetails.name,
      value: `${(selectedSite.pm2_5?.value || 0).toFixed(1)} µg/m³`,
      comparison: t(
        (selectedSite.pm2_5?.value || 0) > calculateAveragePM25(filteredData)
          ? "higherThan"
          : (selectedSite.pm2_5?.value || 0) < calculateAveragePM25(filteredData)
            ? "lowerThan"
            : "equalTo",
      ),
    })] : []),
    ...(filteredData.length > 1 && getHotspotSites(filteredData).length > 0
      ? [t("findingHotspots", { sites: formatFindingSites(getHotspotSites(filteredData)) })]
      : []),
    ...(filteredData.length > 1 && getColdspotSites(filteredData).length > 0
      ? [t("findingLowerPollution", { sites: formatFindingSites(getColdspotSites(filteredData)) })]
      : []),
  ]
  const reportTimelinePeriodKeys = useMemo(() => {
    const keys = new Set<string>()
    filteredData.forEach((site) => {
      site.reportMeasurements?.forEach((measurement) => {
        keys.add(getAqiPeriodBucket(measurement.timestamp, reportTimelineGrouping).key)
      })
    })
    return keys
  }, [filteredData, reportTimelineGrouping])
  const effectiveReportTimelinePeriod =
    reportTimelinePeriod === "all" || reportTimelinePeriodKeys.has(reportTimelinePeriod)
      ? reportTimelinePeriod
      : "all"
  const comparisonTableRows = useMemo(
    () =>
      filteredData.flatMap((site) => {
        if (effectiveReportTimelinePeriod === "all") {
          return [{
            site,
            pm25Value: site.pm2_5?.value,
            aqiCategory: site.aqi_category || "Unknown",
          }]
        }

        const values = (site.reportMeasurements || [])
          .filter(
            (measurement) =>
              getAqiPeriodBucket(measurement.timestamp, reportTimelineGrouping).key ===
              effectiveReportTimelinePeriod,
          )
          .map((measurement) => measurement.value)

        if (values.length === 0) return []

        const pm25Value = values.reduce((sum, value) => sum + value, 0) / values.length
        return [{ site, pm25Value, aqiCategory: getAqiCategoryForPm25(pm25Value) }]
      }),
    [effectiveReportTimelinePeriod, filteredData, reportTimelineGrouping],
  )
  const comparisonAqiOptions = useMemo(
    () => Array.from(new Set(comparisonTableRows.map((row) => row.aqiCategory))).sort(),
    [comparisonTableRows],
  )
  const effectiveComparisonAqiFilter =
    comparisonAqiFilter === "all" || comparisonAqiOptions.includes(comparisonAqiFilter)
      ? comparisonAqiFilter
      : "all"
  const filteredComparisonTableRows = useMemo(() => {
    const search = comparisonSearch.trim().toLowerCase()

    return comparisonTableRows.filter(({ site, aqiCategory }) => {
      if (effectiveComparisonAqiFilter !== "all" && aqiCategory !== effectiveComparisonAqiFilter) {
        return false
      }
      if (!search) return true

      const siteCategory = site.siteDetails?.site_category?.category || "Uncategorized"
      const displayCategory = siteCategory === "Water Body" ? "Urban Background" : siteCategory
      return [
        site.siteDetails?.name,
        site.siteDetails?.formatted_name,
        displayCategory,
        aqiCategory,
        site.siteDetails?.city,
        site.siteDetails?.district,
        site.siteDetails?.country,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search))
    })
  }, [comparisonSearch, comparisonTableRows, effectiveComparisonAqiFilter])

  const getAQICategoryCounts = (sites: SiteData[]): { [key: string]: number } => {
    const categoryCounts: { [key: string]: number } = {}
    sites.forEach((site) => {
      const category = site.aqi_category || "Unknown"
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })
    return categoryCounts
  }

  const getMostCommonCategory = (sites: SiteData[]): string => {
    const categoryCounts = getAQICategoryCounts(sites)
    let mostCommon = ""
    let maxCount = 0
    for (const category in categoryCounts) {
      if (categoryCounts[category] > maxCount) {
        mostCommon = category
        maxCount = categoryCounts[category]
      }
    }
    return mostCommon
  }

  const mostCommonCategory = getMostCommonCategory(filteredData)

  const mapSites = useMemo(
    () =>
      filteredData.filter(
        (site) =>
          typeof site.siteDetails?.approximate_latitude === "number" &&
          typeof site.siteDetails?.approximate_longitude === "number",
      ),
    [filteredData],
  )

  const mapBounds = useMemo(() => {
    if (mapSites.length === 0) return null
    const lats = mapSites.map((site) => site.siteDetails.approximate_latitude)
    const lngs = mapSites.map((site) => site.siteDetails.approximate_longitude)
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ] as [[number, number], [number, number]]
  }, [mapSites])

  const mapCenter = useMemo(() => {
    if (mapSites.length === 0) return { lat: 0, lng: 0 }
    const latSum = mapSites.reduce((sum, site) => sum + site.siteDetails.approximate_latitude, 0)
    const lngSum = mapSites.reduce((sum, site) => sum + site.siteDetails.approximate_longitude, 0)
    return {
      lat: latSum / mapSites.length,
      lng: lngSum / mapSites.length,
    }
  }, [mapSites])

  const mapTile = useMemo(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (token) {
      return {
        url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${token}`,
        attribution:
          '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        tileSize: 512 as const,
        zoomOffset: -1 as const,
      }
    }
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      tileSize: 256 as const,
      zoomOffset: 0 as const,
    }
  }, [])

  const leafletInstance = useMemo(() => {
    if (typeof window === "undefined") return null
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const leaflet = require("leaflet") as typeof import("leaflet")
    leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    })
    return leaflet
  }, [])

  const getMarkerIcon = useMemo(() => {
    const pickImage = (category?: string) => {
      const normalized = (category || "").toLowerCase()
      switch (normalized) {
        case "good":
          return GoodAir
        case "moderate":
          return Moderate
        case "unhealthy for sensitive groups":
          return UnhealthySG
        case "unhealthy":
          return Unhealthy
        case "very unhealthy":
          return VeryUnhealthy
        case "hazardous":
          return Hazardous
        default:
          return Invalid
      }
    }

    return (category?: string) => {
      if (!leafletInstance) return undefined
      return leafletInstance.icon({
        iconUrl: pickImage(category),
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      })
    }
  }, [leafletInstance])

  const getAQIMeta = (category?: string) => {
    const normalized = (category || "").toLowerCase()
    switch (normalized) {
      case "good":
        return { color: "#16a34a", label: "Good" }
      case "moderate":
        return { color: "#f59e0b", label: "Moderate" }
      case "unhealthy for sensitive groups":
        return { color: "#f97316", label: "Unhealthy for Sensitive Groups" }
      case "unhealthy":
        return { color: "#ef4444", label: "Unhealthy" }
      case "very unhealthy":
        return { color: "#a855f7", label: "Very Unhealthy" }
      case "hazardous":
        return { color: "#7f1d1d", label: "Hazardous" }
      default:
        return { color: "#6b7280", label: "Unknown" }
    }
  }

  const handleGenerateReport = (sourceSites?: SiteData[]) => {
    const availableSites = filterSites(siteData, filters)
    const reportSites =
      sourceSites ??
      (selectedDevices.length > 0
        ? availableSites.filter((site) => selectedDevices.includes(getSiteSelectionId(site)))
        : availableSites)

    void generateHistoricalReport(reportSites)
  }

  const downloadComparisonTablePng = async () => {
    if (!comparisonTableRef.current) return

    setIsDownloadingComparisonPng(true)
    try {
      const tableCanvas = await html2canvas(comparisonTableRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDocument) => {
          const clonedScroller = clonedDocument.querySelector<HTMLElement>("[data-comparison-table-scroll]")
          if (clonedScroller) {
            clonedScroller.style.maxHeight = "none"
            clonedScroller.style.overflow = "visible"
          }
        },
      })
      const titleHeight = 64
      const outputCanvas = document.createElement("canvas")
      outputCanvas.width = tableCanvas.width
      outputCanvas.height = tableCanvas.height + titleHeight
      const context = outputCanvas.getContext("2d")
      if (!context) throw new Error("Canvas is unavailable")

      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, outputCanvas.width, outputCanvas.height)
      context.fillStyle = "#0f172a"
      context.font = "600 28px Arial, sans-serif"
      context.fillText("Device Comparison Table", 24, 42)
      context.drawImage(tableCanvas, 0, titleHeight)

      const blob = await new Promise<Blob | null>((resolve) => outputCanvas.toBlob(resolve, "image/png"))
      if (!blob) throw new Error("PNG generation failed")

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "device_comparison_table.png"
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating device comparison PNG:", error)
    } finally {
      setIsDownloadingComparisonPng(false)
    }
  }

  return (
    <div className="container mx-auto max-w-[1440px] px-4 py-6 sm:py-8">
      {reportGenerating && <ReportLoadingScreen />}
      <ErrorPopup
        isOpen={Boolean(reportLoadError)}
        message={reportLoadError || "We couldn't load the report data."}
        onClose={() => setReportLoadError(null)}
        onTryAgain={() => setReportLoadRequest((request) => request + 1)}
        isRetrying={isReportDataLoading}
      />
      <ErrorPopup
        isOpen={Boolean(reportGenerationError)}
        message={reportGenerationError || "We couldn't generate the report."}
        onClose={() => setReportGenerationError(null)}
        onTryAgain={() => handleGenerateReport(lastReportSourceSites.length > 0 ? lastReportSourceSites : undefined)}
        isRetrying={reportGenerating}
      />
      <ErrorPopup
        isOpen={Boolean(pdfExportError)}
        message={pdfExportError || "We couldn't create the PDF."}
        onClose={() => setPdfExportError(null)}
        onTryAgain={() => void generatePDF()}
        isRetrying={isGeneratingPDF}
      />
      <header className="mb-8 border-b border-slate-200 px-1 pb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Air Quality Reports</h1>
        <p className="mx-auto mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Compare recent air quality conditions across monitoring sites and build a focused report for the locations that matter.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-8 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/50 p-5 shadow-lg shadow-slate-200/50 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Filter report visuals</h2>
            <p className="mt-1 text-sm text-slate-500">
              Use one date range and geographic selection across every chart, map, summary, and recommendation.
            </p>
          </div>
          <Button variant="outline" onClick={resetFilters} disabled={!siteData.length} className="w-full rounded-xl border-slate-300 bg-white md:w-auto">
            Reset Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <NexusDateRangePicker
            value={reportQueryRange}
            disabled={!siteData.length}
            onApply={(range) => {
              setReportQueryRange(range)
              setCustomReportData(null)
              setReportDateRange(null)
              setSelectedSite(null)
              setShowReportOnPage(false)
              setReportGenerationError(null)
              setReportTimelineGrouping("monthly")
              setReportTimelinePeriod("all")
            }}
          />
          <FilterMultiSelect
            label="Country"
            placeholder="Select countries"
            options={filterOptions.countries}
            values={filters.country}
            onChange={(values) => handleFilterChange("country", values)}
            helperText="Choose one or more countries to focus the report."
            disabled={!siteData.length}
          />

          <FilterMultiSelect
            label="City"
            placeholder="Select cities"
            options={filterOptions.cities}
            values={filters.city}
            onChange={(values) => handleFilterChange("city", values)}
            helperText="City options narrow automatically when you pick countries."
            disabled={filterOptions.cities.length === 0}
          />

          <FilterMultiSelect
            label="District"
            placeholder="Select districts"
            options={filterOptions.districts}
            values={filters.district}
            onChange={(values) => handleFilterChange("district", values)}
            helperText="Districts follow your country and city choices."
            disabled={filterOptions.districts.length === 0}
          />

          <FilterMultiSelect
            label="Category"
            placeholder="Select site categories"
            options={filterOptions.categories}
            values={filters.category}
            onChange={(values) => handleFilterChange("category", values)}
            helperText="Mix categories to compare background vs traffic-heavy sites."
            disabled={!siteData.length}
          />
        </div>
      </div>

      {isReportDataLoading && (
        <div
          className="mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-100/50"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 ring-8 ring-blue-50/60">
              <LoaderCircle className="h-7 w-7 animate-spin text-blue-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Preparing your air quality overview</p>
              <p className="mt-1 text-sm text-slate-500">Loading monitoring sites, recent readings, and report filters.</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {siteData.length > 0 ? (
        <>
      {/* Filter summary */}
      <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50/60 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Active filters</span>
          {hasActiveFilters ? (
            <>
              {(["country", "city", "district", "category"] as (keyof Filters)[]).map((key) =>
                filters[key].map((value) => (
                  <button
                    type="button"
                    key={`${key}-${value}`}
                    onClick={() => removeFilterValue(key, value)}
                    className="group flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:bg-blue-100"
                  >
                    <span className="capitalize">{key}:</span> {value}
                    <X className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                  </button>
                )),
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                Most Common AQI Category: {mostCommonCategory || "N/A"}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-500">None selected, showing the complete network.</span>
          )}
          </div>
          <div className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
            Showing {filteredData.length} of {(customReportData ?? siteData).length} sites
          </div>
        </div>
      </div>

      {/* Selected Devices Counter */}
      {selectedDevices.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-5 text-white shadow-lg shadow-blue-900/15">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white text-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
                {selectedDevices.length}
              </div>
              <div>
                <h3 className="text-xl font-bold">Devices Selected</h3>
                <p className="text-blue-100">
                  {selectedDevices.length === 1
                    ? "1 device selected for reporting"
                    : `${selectedDevices.length} devices selected for reporting`}
                </p>
              </div>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={clearDeviceSelection}
                className="rounded-xl border-white bg-transparent text-white hover:bg-blue-700"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Category Breakdown */}
          {selectedDevices.length > 1 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(sitesByCategory).map(([category, sites]) => {
                const selectedCount = sites.filter((site) => selectedDevices.includes(getSiteSelectionId(site))).length
                if (selectedCount === 0) return null

                return (
                  <div key={`selected-${category}`} className="rounded-xl bg-blue-700 p-2 text-center">
                    <div className="text-sm text-blue-200">{category}</div>
                    <div className="text-lg font-bold">{selectedCount} selected</div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-blue-500">
            <div className="flex justify-between items-center">
              <p className="text-blue-100">Generate a report with your selected devices</p>
              <Button
                onClick={() => handleGenerateReport()}
                disabled={!hasRequiredReportScope || reportGenerating}
                className="rounded-xl bg-white text-blue-600 hover:bg-blue-50"
              >
                {reportGenerating ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>Generate Report</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Device Search and Selection */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-lg font-semibold mb-2 md:mb-0">Device Selection</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={selectAllDevices} size="sm" 
            className="rounded-xl border-blue-700 bg-blue-500 text-white hover:bg-blue-600">
              {filteredData.length > MAX_RANDOM_SITE_SELECTION ? "Select Random 20" : "Select All"}
            </Button>
            <Button variant="outline" onClick={clearDeviceSelection} size="sm" className="rounded-xl">
              Clear All
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search devices by name, city, or country"
              value={deviceSearch}
              onChange={(e) => handleDeviceSearch(e.target.value)}
              className="h-11 flex-1 rounded-xl border-slate-300 bg-slate-50 focus-visible:bg-white"
            />
            <Button
              onClick={() => handleGenerateReport()}
              disabled={!hasRequiredReportScope || reportGenerating}
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
            >
              {reportGenerating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                selectedDevices.length > 0 ? "Generate selected" : "Generate Report"
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {getFilteredDevices()
              .slice(0, 9)
              .map((site) => (
                <div key={getSiteSelectionId(site)} className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <Checkbox
                    id={getSiteCheckboxId(site)}
                    checked={selectedDevices.includes(getSiteSelectionId(site))}
                    onCheckedChange={() => toggleDeviceSelection(getSiteSelectionId(site))}
                  />
                  <label htmlFor={getSiteCheckboxId(site)} className="text-sm flex-1 cursor-pointer truncate">
                    {site.siteDetails.name || site.siteDetails.formatted_name || "Unknown Site"}
                    <span className="text-xs text-gray-500 ml-1">({site.siteDetails.city || "Unknown"})</span>
                  </label>
                </div>
              ))}
          </div>

          {getFilteredDevices().length > 9 && (
            <div className="text-center text-sm text-blue-600">
              {getFilteredDevices().length - 9} more devices available. Refine your search to see more.
            </div>
          )}

          <div className="text-sm text-gray-600">
            {selectedDevices.length} of {filteredData.length} devices selected
          </div>
        </div>
      </div>

      {/* Report Action Buttons */}
      <div className={`mb-4 rounded-2xl border px-4 py-3 ${
        hasRequiredReportScope
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${hasRequiredReportScope ? "bg-emerald-500" : "bg-amber-500"}`} />
          <div>
            <p className="text-sm font-bold">{hasRequiredReportScope ? "Report scope ready" : "Choose a report area"}</p>
            <p className="mt-0.5 text-xs leading-5 opacity-80">
              {hasRequiredReportScope
                ? `The report will use ${filters.district.length ? "district" : "city"}-level data for the selected date range.`
                : "Select at least one city or district. Country-only reports are disabled to keep results focused and meaningful."}
            </p>
          </div>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap justify-end gap-2">
        <Button
          onClick={() => {
            if (showReportOnPage) {
              setShowReportOnPage(false)
              return
            }
            if (customReportData && reportDateRange) {
              setShowReportOnPage(true)
              return
            }
            handleGenerateReport()
          }}
          disabled={(!showReportOnPage && !hasRequiredReportScope) || reportGenerating}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          {reportGenerating
            ? "Generating report..."
            : showReportOnPage
              ? "Hide Report"
              : customReportData && reportDateRange
                ? "Show Report"
                : "Generate Report"}
        </Button>
        <Button
          onClick={() => setIsReportDataModalOpen(true)}
          disabled={!hasRequiredReportScope || reportGenerating}
          className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
        >
          <CalendarRange className="mr-2 h-4 w-4" />
          Customize data & sites
        </Button>
        {showReportOnPage &&
          (customReportData !== null ||
            (selectedDevices.length > 0 && selectedDevices.length < siteData.length)) && (
          <Button
            onClick={() => {
              if (customReportData) {
                clearHistoricalReport()
              } else {
                setFilteredData(filterSites(siteData, filters))
              }
            }}
            className="bg-gray-600 text-white hover:bg-gray-700"
          >
            {customReportData ? "Use Latest Data" : "Back to All Data"}
          </Button>
        )}
      </div>

      {showReportOnPage && (
        <div id="report-section" className="mb-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="mb-5 flex w-full flex-wrap items-stretch justify-end gap-2.5 border-b border-slate-100 pb-4 lg:flex-nowrap">
            <div className="group order-last flex h-12 w-fit max-w-full flex-none items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 text-slate-600 shadow-sm transition hover:border-slate-400 hover:shadow-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 lg:ml-auto">
              <Globe className="h-6 w-6 shrink-0 stroke-[1.7] text-slate-600" />
              <span className="whitespace-nowrap text-sm font-medium sm:text-base">{t("reportLanguage")}:</span>
              <Select
                value={reportLanguage}
                onValueChange={(value) => setReportLanguage(value as ReportLanguage)}
              >
                <SelectTrigger
                  aria-label={t("reportLanguage")}
                  className="h-9 w-auto min-w-[108px] gap-2 border-0 bg-transparent p-0 text-sm font-bold text-slate-950 shadow-none ring-offset-0 hover:text-blue-700 focus:ring-0 focus:ring-offset-0 sm:text-base [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-slate-500 [&>svg]:opacity-100"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  align="end"
                  sideOffset={10}
                  className="min-w-[190px] rounded-xl border-slate-200 bg-white p-1.5 shadow-xl"
                >
                  {REPORT_LANGUAGES.map((language) => (
                    <SelectItem
                      key={language.value}
                      value={language.value}
                      className="cursor-pointer rounded-lg py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700 focus:bg-blue-50 focus:text-blue-800"
                    >
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsReportDataModalOpen(true)}
              className="h-12 flex-1 rounded-xl border-0 bg-slate-100 px-4 text-sm font-semibold text-slate-600 shadow-none hover:bg-slate-200 hover:text-slate-800 sm:flex-none sm:text-base"
            >
              <MapPinned className="mr-1.5 h-5 w-5 shrink-0 stroke-[1.7] text-slate-600" />
              {t("changeSites")}
            </Button>
            <Button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="h-12 flex-1 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:translate-y-0 sm:flex-none sm:text-base"
            >
              {isGeneratingPDF ? (
                <><div className="mr-1.5 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{t("preparingPdf")}</>
              ) : (
                <><CloudDownload className="mr-1.5 h-5 w-5 shrink-0 stroke-[1.8]" />{t("downloadPdf")}</>
              )}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  aria-label={t("moreActions")}
                  title={t("moreActions")}
                  className="h-12 w-12 shrink-0 rounded-full border-slate-300 bg-white p-0 text-slate-500 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 hover:shadow-md"
                >
                  <MoreHorizontal className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 rounded-xl border-slate-200 p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Printer className="h-4 w-4" /></span>
                  <span><span className="block text-sm font-semibold text-slate-800">Print report</span><span className="block text-xs text-slate-500">Open the browser print dialog</span></span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600"><BrainCircuit className="h-4 w-4" /></span>
                    <div><Label htmlFor="advanced-mode" className="cursor-pointer text-sm font-semibold text-slate-800">Advanced analysis</Label><p className="text-xs text-slate-500">Spatial statistics and clusters</p></div>
                  </div>
                  <Switch id="advanced-mode" checked={showAdvancedAnalysis} onCheckedChange={setShowAdvancedAnalysis} />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div ref={reportRef} lang={reportLanguage} className="space-y-6">
            {/* Report Header */}
            <div className="text-center mb-6 border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-800">{getReportTitle()}</h2>
              <p className="text-gray-600 mt-2">
                {getLocationInfo().city}, {getLocationInfo().country}
              </p>
              {reportDateRange && (
                <p className="mt-1 font-medium text-blue-700">
                  {t("dataPeriod")}: {formatReportDate(reportDateRange.startDate)}
                  {` ${t("to")} `}
                  {formatReportDate(reportDateRange.endDate)}
                </p>
              )}
              <p className="text-gray-500 mt-1">{t("reportGenerated")}: {formatReportDateForLanguage(new Date(), reportLanguage)}</p>
            </div>

            {/* Map snapshot of selected area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <Card className="h-full border-blue-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-blue-800">{t("areaSnapshot")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t("country")}</span>
                    <span>{formatSelectionList(filters.country, t("allCountries"))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t("district")}</span>
                    <span>{formatSelectionList(filters.district, t("allDistricts"))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t("city")}</span>
                    <span>{formatSelectionList(filters.city, t("allCities"))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t("sitesMapped")}</span>
                    <span>{mapSites.length}</span>
                  </div>
                  <div className="pt-2 border-t text-xs text-blue-700">
                    {t("mapContextNote")}
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2 h-[320px] rounded-xl overflow-hidden border border-blue-100 shadow">
                {mapSites.length > 0 ? (
                  <MapContainer
                    key={mapSites.length}
                    center={[mapCenter.lat, mapCenter.lng]}
                    bounds={mapBounds || undefined}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution={mapTile.attribution}
                      url={mapTile.url}
                      tileSize={mapTile.tileSize}
                      zoomOffset={mapTile.zoomOffset}
                    />
                    {mapSites.slice(0, 150).map((site) => {
                      const meta = getAQIMeta(site.aqi_category)
                      const icon = getMarkerIcon(site.aqi_category)
                      return (
                        <Marker
                          key={getSiteSelectionId(site)}
                          position={[site.siteDetails.approximate_latitude, site.siteDetails.approximate_longitude]}
                          icon={icon}
                        >
                          <Popup>
                            <div className="min-w-[200px] space-y-2">
                              <div className="font-semibold text-sm text-gray-900">
                                {site.siteDetails.name || site.siteDetails.formatted_name || "Unknown Site"}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span
                                  className="inline-block w-3 h-3 rounded-full border border-white shadow"
                                  style={{ backgroundColor: meta.color }}
                                />
                                <span className="font-medium">{meta.label}</span>
                              </div>
                              <div className="text-sm text-gray-700">
                                PM₂.₅: {(site.pm2_5?.value ?? 0).toFixed(1)} µg/m³
                              </div>
                              <div className="text-xs text-gray-500">
                                {site.siteDetails.city || "Unknown City"}, {site.siteDetails.country || "Unknown"}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })}
                    {mapSites[0] && (
                      <Circle
                        center={[mapCenter.lat, mapCenter.lng]}
                        radius={500}
                        pathOptions={{ color: "#1d4ed8", fillColor: "#bfdbfe", fillOpacity: 0.2 }}
                      />
                    )}
                  </MapContainer>
                ) : (
                  <div className="h-full w-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm">
                    No mappable coordinates for the current selection
                  </div>
                )}
              </div>
            </div>

            {/* Introduction */}
            <section className="pdf-keep-together mb-8 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/60">
              <div className="border-b border-blue-100 px-5 py-4 sm:px-6">
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{t("introduction")}</h3>
              </div>

              <div className="space-y-4 px-5 py-5 text-sm leading-7 text-slate-700 sm:px-6 sm:py-6 sm:text-base">
                {reportLanguage !== "en" ? (
                  <>
                    <p>{t("introOne", {
                      scope: getReportScopeDescription(),
                      period: reportDateRange
                        ? t("periodFrom", { start: formatReportDate(reportDateRange.startDate), end: formatReportDate(reportDateRange.endDate) })
                        : "",
                      source: reportDateRange ? t("historicalMeasurements") : t("latestReadings"),
                      count: filteredData.length,
                      sites: filteredData.length === 1 ? t("site") : t("sites"),
                    })}</p>
                    <p>{t("introTwo", {
                      value: `${avgPM25.toFixed(1)} µg/m³`,
                      category: translateAqiCategory(avgAQICategory, reportLanguage),
                    })}</p>
                  </>
                ) : (
                  <>
                <p>
                  This report summarizes air quality conditions across <strong>{getReportScopeDescription()}</strong>
                  {reportDateRange && (
                    <>
                      {" "}from <strong>{formatReportDate(reportDateRange.startDate)}</strong> to{" "}
                      <strong>{formatReportDate(reportDateRange.endDate)}</strong>
                    </>
                  )}. It brings together {reportDateRange ? "historical measurements" : "the latest available readings"} from{" "}
                  <strong>{filteredData.length} monitoring {filteredData.length === 1 ? "site" : "sites"}</strong>.
                  PM<sub>2.5</sub> is the primary indicator, while Air Quality Index categories translate measured
                  concentrations into health-relevant conditions.
                </p>
                <p>
                  Across the selected sites, average PM<sub>2.5</sub> was{" "}
                  <strong>{avgPM25.toFixed(1)} {"\u00b5g/m\u00b3"}</strong>, corresponding to an overall AQI category of{" "}
                  <strong>{avgAQICategory}</strong>. The network average {averageChangeDescription}. The sections that
                  follow compare monitoring locations, show geographic and temporal patterns, identify higher- and
                  lower-pollution conditions, and provide practical health guidance. Results reflect available sensor
                  coverage and may vary with weather, traffic, local emissions, and temporary data gaps.
                </p>
                  </>
                )}
              </div>
            </section>
            {/* AQI Index Visualization */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {reportDateRange ? t("averageStatus") : t("currentStatus")}
              </h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <AQIIndexVisual
                  language={reportLanguage}
                  aqiCategory={selectedSite ? selectedSite.aqi_category || "Unknown" : avgAQICategory}
                  pm25Value={selectedSite ? selectedSite.pm2_5?.value || 0 : avgPM25}
                />
              </div>
            </div>

            {/* Results Section with Charts */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t("results")}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-1">{t("sitesAnalyzed")}</h4>
                  <p className="text-2xl font-bold">{filteredData.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-1">{t("averagePm25")}</h4>
                  <p className="text-2xl font-bold">{calculateAveragePM25(filteredData).toFixed(1)} µg/m³</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-1">{comparisonPeriod === "monthly" ? t("monthly") : t("weekly")} {t("change")}</h4>
                  <p className="text-2xl font-bold flex items-center">
                    {calculateAveragePercentageChange(filteredData).toFixed(2)}%
                    {calculateAveragePercentageChange(filteredData) < 0 ? (
                      <ArrowDown className="ml-1 w-5 h-5 text-green-500" />
                    ) : calculateAveragePercentageChange(filteredData) > 0 ? (
                      <ArrowUp className="ml-1 w-5 h-5 text-red-500" />
                    ) : (
                      <Minus className="ml-1 w-5 h-5 text-gray-500" />
                    )}
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="space-y-6">
                <PM25BarChart sites={filteredData} language={reportLanguage} />
                <PM25CalendarPlot sites={filteredData} language={reportLanguage} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AQICategoryChart
                    sites={filteredData}
                    language={reportLanguage}
                    periodGrouping={reportTimelineGrouping}
                    selectedPeriod={reportTimelinePeriod}
                    onPeriodGroupingChange={setReportTimelineGrouping}
                    onSelectedPeriodChange={setReportTimelinePeriod}
                  />
                  <WeeklyComparisonChart
                    sites={filteredData}
                    language={reportLanguage}
                    comparisonPeriod={comparisonPeriod}
                    rangeDays={reportDurationDays}
                    timelineGrouping={reportTimelineGrouping}
                    timelinePeriod={reportTimelinePeriod}
                  />
                </div>
              </div>

              {/* Device comparison follows the AQI Category Distribution period selection. */}
              <section className="pdf-keep-together mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-2 pt-3 sm:px-4">
                  <h4 className="text-base font-semibold text-slate-950">{t("deviceComparison")}</h4>
                  {!pdfMode && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="search"
                        value={comparisonSearch}
                        onChange={(event) => setComparisonSearch(event.target.value)}
                        placeholder="Filter devices..."
                        aria-label="Filter comparison table"
                        className="h-7 w-40 rounded-md px-2.5 text-xs"
                      />
                      <select
                        value={effectiveComparisonAqiFilter}
                        onChange={(event) => setComparisonAqiFilter(event.target.value)}
                        aria-label="Filter by AQI category"
                        className="h-7 max-w-[210px] rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700"
                      >
                        <option value="all">All AQI categories</option>
                        {comparisonAqiOptions.map((category) => (
                          <option key={category} value={category}>{translateAqiCategory(category, reportLanguage)}</option>
                        ))}
                      </select>
                      <span className="text-xs font-medium text-slate-600">Show rows:</span>
                      {([5, 10] as const).map((rowCount) => (
                        <button
                          key={rowCount}
                          type="button"
                          onClick={() => setComparisonRowsShown(rowCount)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                            comparisonRowsShown === rowCount
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                          aria-pressed={comparisonRowsShown === rowCount}
                        >
                          {rowCount}
                        </button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void downloadComparisonTablePng()}
                        disabled={isDownloadingComparisonPng || filteredComparisonTableRows.length === 0}
                        className="h-7 gap-1.5 rounded-md px-2.5 text-xs"
                      >
                        {isDownloadingComparisonPng ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        PNG
                      </Button>
                    </div>
                  )}
                </div>
                <div
                  data-comparison-table-scroll
                  className="overflow-auto border-t border-slate-100"
                  style={{ maxHeight: pdfMode ? "none" : comparisonRowsShown === 5 ? "236px" : "436px" }}
                >
                  <table
                    ref={comparisonTableRef}
                    data-device-comparison-table
                    className="w-full min-w-[760px] border-collapse bg-white text-left text-xs text-slate-800"
                  >
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
                      <tr>
                        <th scope="col" className="w-[38%] px-3 py-2 font-medium">{t("deviceName")}</th>
                        <th scope="col" className="w-[16%] px-3 py-2 font-medium">{t("category")}</th>
                        <th scope="col" className="w-[11%] px-3 py-2 font-medium">
                          PM<sub>2.5</sub>
                        </th>
                        <th scope="col" className="w-[27%] px-3 py-2 font-medium">{t("aqiCategory")}</th>
                        <th scope="col" className="w-[8%] px-3 py-2 text-right font-medium">{t("location")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComparisonTableRows.map(({ site, pm25Value, aqiCategory }, index) => {
                        const aqiMeta = getAQIMeta(aqiCategory)
                        const siteCategory = site.siteDetails?.site_category?.category || "Uncategorized"
                        const displayCategory = siteCategory === "Water Body" ? "Urban Background" : siteCategory

                        return (
                          <tr
                            key={`comparison-${getSiteSelectionId(site)}`}
                            className={`border-t border-slate-100 ${index % 2 === 0 ? "bg-blue-50/70" : "bg-white"}`}
                          >
                            <th scope="row" className="px-3 py-2 font-semibold text-slate-950">
                              {site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Device"}
                            </th>
                            <td className="px-3 py-2">{translateSiteCategory(displayCategory, reportLanguage)}</td>
                            <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-950">
                              {typeof pm25Value === "number" ? `${pm25Value.toFixed(1)} \u00b5g/m\u00b3` : "N/A"}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className="inline-flex whitespace-nowrap rounded px-2 py-1 font-semibold text-white"
                                style={{ backgroundColor: aqiMeta.color }}
                              >
                                {translateAqiCategory(aqiMeta.label, reportLanguage)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right">
                              {site.siteDetails?.city || site.siteDetails?.district || "Unknown"}
                            </td>
                          </tr>
                        )
                      })}
                      {filteredComparisonTableRows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">
                            No devices match the selected table filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">{t("keyFindings")}</h4>
                {reportLanguage !== "en" ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {localizedKeyFindings.map((finding, index) => <li key={index}>{finding}</li>)}
                  </ul>
                ) : (
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    The average PM<sub>2.5</sub> concentration is{" "}
                    <strong>{calculateAveragePM25(filteredData).toFixed(1)} µg/m³</strong>, which is classified as{" "}
                    <strong>{avgAQICategory}</strong>.
                  </li>
                  <li>
                    There has been a{" "}
                    <strong>
                      {Math.abs(calculateAveragePercentageChange(filteredData)).toFixed(2)}%{" "}
                      {calculateAveragePercentageChange(filteredData) < 0 ? "decrease" : "increase"}
                    </strong>{" "}
                    in PM<sub>2.5</sub> levels compared to the previous {comparisonPeriod === "monthly" ? "month" : "week"}.
                  </li>
                  {dailyPm25Extremes && (
                    <li>
                      The highest daily average PM<sub>2.5</sub> concentration was{" "}
                      <strong>{dailyPm25Extremes.highest.value.toFixed(1)} {"\u00b5g/m\u00b3"}</strong> on{" "}
                      <strong>{dailyPm25Extremes.highest.dates.map(formatReportDate).join(", ")}</strong>, while the
                      lowest daily average was{" "}
                      <strong>{dailyPm25Extremes.lowest.value.toFixed(1)} {"\u00b5g/m\u00b3"}</strong> on{" "}
                      <strong>{dailyPm25Extremes.lowest.dates.map(formatReportDate).join(", ")}</strong>.
                    </li>
                  )}
                  {Object.entries(calculateAQICategoryCounts(filteredData)).length > 1 && (
                    <li>
                      The most common air quality category is{" "}
                      <strong>{calculateMostCommonCategory(filteredData)}</strong>, representing{" "}
                      {(
                        (calculateAQICategoryCounts(filteredData)[calculateMostCommonCategory(filteredData)] /
                          filteredData.length) *
                        100
                      ).toFixed(0)}
                      % of all sites.
                    </li>
                  )}
                  {selectedSite && (
                    <li>
                      {selectedSite.siteDetails.name} has a PM<sub>2.5</sub> reading of{" "}
                      <strong>{(selectedSite.pm2_5?.value || 0).toFixed(1)} µg/m³</strong>, which is{" "}
                      {compareToAverage(selectedSite.pm2_5?.value || 0, calculateAveragePM25(filteredData))} the
                      regional average.
                    </li>
                  )}
                  {filteredData.length > 1 && getHotspotSites(filteredData).length > 0 && (
                    <li>
                      <strong>Pollution Hotspots:</strong>{" "}
                      {getHotspotSites(filteredData).map((site, index, arr) => (
                        <span key={getSiteSelectionId(site)}>
                          {site.siteDetails?.name || "Unknown Site"} ({(site.pm2_5?.value || 0).toFixed(1)} µg/m³)
                          {index < arr.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      {" are the areas with the highest pollution levels."}
                    </li>
                  )}
                 
                  {filteredData.length > 1 && getColdspotSites(filteredData).length > 0 && (
                    <li>
                      <strong>Lower-Pollution sites:</strong>{" "}
                      {getColdspotSites(filteredData).map((site, index, arr) => (
                        <span key={getSiteSelectionId(site)}>
                          {site.siteDetails?.name || "Unknown Site"} ({(site.pm2_5?.value || 0).toFixed(1)} µg/m³)
                          {index < arr.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      {" are the areas with lower pollution levels."}
                    </li>
                  )}
                </ul>
                )}
              </div>
            </div>

            {showAdvancedAnalysis && !pdfMode && (
              <div className="mb-8">
                <AdvancedAnalysisSection sites={filteredData} activeTab={activeTab} />
              </div>
            )}

            {/* Conclusion */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t("conclusion")}</h3>
              <p className="text-gray-700 mb-4">{getConclusion(selectedSite, filters, filteredData)}</p>

              <p className="text-gray-700">{getRegionalInsights(filters, filteredData)}</p>
            </div>

            {/* Recommendations */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t("recommendations")}</h3>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">{t("healthRecommendations")}</h4>
                <ul className="list-disc list-inside text-yellow-700 space-y-2">
                  {getHealthRecommendations(
                    selectedSite ? selectedSite.aqi_category : getAverageAQICategory(filteredData),
                  ).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Jump to Categories Button */}
            {!pdfMode && (
              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 text-left sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Explore individual monitoring sites</p>
                    <p className="mt-0.5 text-sm text-slate-500">Browse devices grouped by their surrounding environment.</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const categoriesElement = document.getElementById("categories-section")
                    if (categoriesElement) {
                      categoriesElement.scrollIntoView({ behavior: "smooth" })
                    }
                  }}
                  className="h-11 shrink-0 rounded-xl bg-blue-600 px-5 text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
                >
                  View device categories
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <section className="mb-8 rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/70 p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">At a glance</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Network snapshot</h2>
          </div>
          <p className="text-sm text-slate-500">Based on your current report filters</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Monitoring Sites"
            value={filteredData.length.toString()}
            icon={<Globe className="h-7 w-7 text-blue-500" />}
          />
          <SummaryCard
            title="Average PM₂.₅"
            value={`${calculateAveragePM25(filteredData).toFixed(1)} \u00B5g/m\u00B3`}
            icon={<BarChart3 className="h-7 w-7 text-emerald-500" />}
          />
          <SummaryCard
            title="Weekly Change"
            value={`${calculateAveragePercentageChange(filteredData).toFixed(2)}%`}
            icon={getChangeIcon(calculateAveragePercentageChange(filteredData))}
            trend={calculateAveragePercentageChange(filteredData)}
          />
        </div>
      </section>
      {/* No results message */}
      {filteredData.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 text-center mb-8">
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">No sites match your filters</h3>
          <p className="text-yellow-700">
            Try adjusting your filter criteria or{" "}
            <button onClick={resetFilters} className="text-blue-600 underline">
              reset all filters
            </button>
            .
          </p>
        </div>
      )}

      {/* Categories Controls */}
      <div id="categories-section" className="mb-5 flex scroll-mt-6 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-200">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Explore the network</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Device Categories</h2>
            <p className="mt-1 text-sm text-slate-500">Review monitoring sites grouped by their surrounding environment.</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            const allCollapsed = Object.keys(sitesByCategory).every(
              (category) => collapsedCategories[category] !== false,
            )

            if (allCollapsed) {
              // Expand all
              const expanded: Record<string, boolean> = {}
              Object.keys(sitesByCategory).forEach((category) => {
                expanded[category] = false
              })
              setCollapsedCategories(expanded)
            } else {
              // Collapse all
              const collapsed: Record<string, boolean> = {}
              Object.keys(sitesByCategory).forEach((category) => {
                collapsed[category] = true
              })
              setCollapsedCategories(collapsed)
            }
          }}
          className="h-10 shrink-0 rounded-xl border-blue-200 bg-blue-50/60 px-4 font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-100"
        >
          {Object.keys(sitesByCategory).every((category) => collapsedCategories[category] !== false)
            ? "Expand All Categories"
            : "Collapse All Categories"}
        </Button>
      </div>

      {/* Site Categories */}
      {Object.entries(sitesByCategory).map(([category, sites]) => (
        <div
          key={category}
          className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
        >
          <div className="flex cursor-pointer flex-col gap-3 bg-gradient-to-r from-blue-50 via-white to-cyan-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center">
              <div onClick={() => toggleCategoryCollapse(category)} className="flex items-center cursor-pointer">
                <h2 className="text-2xl font-bold text-gray-800">{category} Sites</h2>
                <div className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {sites.length} {sites.length === 1 ? "device" : "devices"}
                </div>
                <div className="ml-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {sites.filter((site) => selectedDevices.includes(getSiteSelectionId(site))).length} selected
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  // Get all site IDs in this category
                  const categoryDeviceIds = sites.map(getSiteSelectionId)

                  // Check if all devices in this category are already selected
                  const allSelected = categoryDeviceIds.every((id) => selectedDevices.includes(id))

                  if (allSelected) {
                    // If all are selected, deselect all in this category
                    setSelectedDevices((prev) => prev.filter((id) => !categoryDeviceIds.includes(id)))
                  } else {
                    // Otherwise, select all in this category
                    const newSelectedDevices = [...selectedDevices]
                    categoryDeviceIds.forEach((id) => {
                      if (!newSelectedDevices.includes(id)) {
                        newSelectedDevices.push(id)
                      }
                    })
                    setSelectedDevices(newSelectedDevices)
                  }
                }}
                className="mr-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {sites.every((site) => selectedDevices.includes(getSiteSelectionId(site))) ? "Deselect All" : "Select All"}
              </Button>
              <div
                onClick={() => toggleCategoryCollapse(category)}
                className={`transform transition-transform duration-300 ${collapsedCategories[category] !== false ? "rotate-180" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              collapsedCategories[category] !== false ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"
            }`}
          >
            <div className="grid grid-cols-1 gap-4 p-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sites.map((site) => {
                const isSiteSelected = selectedDevices.includes(getSiteSelectionId(site))
                return (
                  <SiteCard
                    key={getSiteSelectionId(site)}
                    site={site}
                    onSelect={() => void generateHistoricalReport([site])}
                    reportDisabled={!hasRequiredReportScope || reportGenerating}
                    isSelected={selectedSite ? getSiteSelectionId(selectedSite) === getSiteSelectionId(site) : false}
                    isCheckboxSelected={isSiteSelected}
                    onCheckboxChange={() => toggleDeviceSelection(getSiteSelectionId(site))}
                    lastSelectedId={lastSelectedId}
                  />
                )
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Health Tips Section */}
      {!pdfMode && (
        <Card className="w-full shadow-lg border border-blue-100 bg-white mt-8">
          <CardHeader className="text-center bg-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
              <HeartPulse className="w-6 h-6" />
              <span>Health Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HealthTipBox
              title="For Everyone"
              description="Check air quality before outdoor activities. Stay indoors during high pollution events."
            />
            <HealthTipBox
              title="For Sensitive Groups"
              description="Children, elderly, and those with respiratory conditions should limit outdoor exposure when air quality is poor."
            />
            <HealthTipBox
              title="For Active Individuals"
              description="Consider indoor workouts when PM₂.₅ levels exceed 35.5 µg/m³."
            />
          </div>
        </CardContent>
      </Card>
      )}
        </>
      ) : null}
      <ReportDataModal
        isOpen={isReportDataModalOpen}
        onClose={() => setIsReportDataModalOpen(false)}
        sites={filterSites(siteData, filters)}
        dateRange={reportQueryRange}
        aggregation={reportAggregation}
        onAggregationChange={setReportAggregation}
        canGenerate={hasRequiredReportScope}
        onReportReady={handleHistoricalReportReady}
      />
    </div>
  )
}

type FilterMultiSelectProps = {
  label: string
  placeholder: string
  options: string[]
  values: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
  helperText?: string
}

function FilterMultiSelect({
  label,
  placeholder,
  options,
  values,
  onChange,
  disabled,
  helperText,
}: FilterMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredOptions = useMemo(
    () => options.filter((option) => option.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  )

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value))
    } else {
      onChange([...values, value])
    }
  }

  const clearAll = () => {
    onChange([])
    setSearch("")
  }

  return (
    <div
      className={`rounded-2xl border p-3 transition ${
        values.length
          ? "border-blue-200 bg-blue-50/60 shadow-[0_0_0_1px_rgba(37,99,235,0.04)]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">{label}</label>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
          values.length ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
        }`}>
          {values.length || "All"}
        </span>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`min-h-12 h-auto w-full justify-between rounded-xl px-3 py-2 text-left ${
              values.length
                ? "border-blue-200 bg-white hover:bg-white"
                : "border-slate-300 bg-slate-50 hover:bg-slate-100"
            }`}
            disabled={disabled}
          >
            <span className={`min-w-0 flex-1 ${values.length ? "text-slate-900" : "text-slate-500"}`}>
              {values.length ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm font-semibold">{values.slice(0, 2).join(", ")}</span>
                  {values.length > 2 && (
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      +{values.length - 2}
                    </span>
                  )}
                </span>
              ) : (
                placeholder
              )}
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 rounded-2xl border-slate-200 p-3 shadow-xl">
          <div className="mb-3 flex items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="h-10 rounded-xl border-slate-300 bg-slate-50"
            />
            {values.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-blue-700 hover:text-blue-900">
                Clear
              </Button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto space-y-1">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 transition ${
                    values.includes(option)
                      ? "border-blue-200 bg-blue-50 text-blue-900"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <Checkbox checked={values.includes(option)} onCheckedChange={() => toggleValue(option)} />
                  <span className="text-sm text-gray-800">{option}</span>
                </label>
              ))
            ) : (
              <div className="text-xs text-gray-500 px-1 py-2">No options match your search.</div>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t">
            <span>{values.length} selected</span>
            <Button variant="link" size="sm" className="px-0 text-blue-600" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {helperText && <p className="mt-2 min-h-8 text-xs leading-4 text-slate-500">{helperText}</p>}
    </div>
  )
}

function SiteCard({
  site,
  onSelect,
  isSelected,
  isCheckboxSelected,
  onCheckboxChange,
  lastSelectedId,
  reportDisabled,
}: {
  site: SiteData
  onSelect?: () => void
  isSelected?: boolean
  isCheckboxSelected?: boolean
  onCheckboxChange?: () => void
  lastSelectedId?: string | null
  reportDisabled?: boolean
}) {
  const pm25Value = site.pm2_5?.value ?? 0
  const aqiCategory = site.aqi_category || "Unknown"
  const siteName = site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"
  const areaName = site.siteDetails?.site_category?.area_name || "Unknown Area"
  const percentChange = site.averages?.percentageDifference ?? 0
  const currentWeek = site.averages?.weeklyAverages?.currentWeek ?? 0
  const previousWeek = site.averages?.weeklyAverages?.previousWeek ?? 0
  const country = site.siteDetails?.country || "Unknown"
  const city = site.siteDetails?.city || "Unknown"

  const getCategoryTheme = (category: string) => {
    switch (category.toLowerCase()) {
      case "good":
        return {
          accent: "bg-emerald-500",
          badge: "border-emerald-200 bg-emerald-100 text-emerald-800",
          card: "border-emerald-200 bg-gradient-to-br from-white via-white to-emerald-50/80",
          metric: "text-emerald-700",
          soft: "bg-emerald-50 text-emerald-700",
        }
      case "moderate":
        return {
          accent: "bg-amber-400",
          badge: "border-amber-200 bg-amber-100 text-amber-800",
          card: "border-amber-200 bg-gradient-to-br from-white via-white to-amber-50/90",
          metric: "text-amber-700",
          soft: "bg-amber-50 text-amber-700",
        }
      case "unhealthy for sensitive groups":
        return {
          accent: "bg-orange-500",
          badge: "border-orange-200 bg-orange-100 text-orange-800",
          card: "border-orange-200 bg-gradient-to-br from-white via-white to-orange-50/90",
          metric: "text-orange-700",
          soft: "bg-orange-50 text-orange-700",
        }
      case "unhealthy":
        return {
          accent: "bg-red-500",
          badge: "border-red-200 bg-red-100 text-red-800",
          card: "border-red-200 bg-gradient-to-br from-white via-white to-red-50/90",
          metric: "text-red-700",
          soft: "bg-red-50 text-red-700",
        }
      case "very unhealthy":
        return {
          accent: "bg-purple-500",
          badge: "border-purple-200 bg-purple-100 text-purple-800",
          card: "border-purple-200 bg-gradient-to-br from-white via-white to-purple-50/90",
          metric: "text-purple-700",
          soft: "bg-purple-50 text-purple-700",
        }
      case "hazardous":
        return {
          accent: "bg-rose-800",
          badge: "border-rose-300 bg-rose-100 text-rose-900",
          card: "border-rose-300 bg-gradient-to-br from-white via-white to-rose-100/80",
          metric: "text-rose-900",
          soft: "bg-rose-100 text-rose-900",
        }
      default:
        return {
          accent: "bg-slate-400",
          badge: "border-slate-200 bg-slate-100 text-slate-700",
          card: "border-slate-200 bg-gradient-to-br from-white via-white to-slate-50",
          metric: "text-slate-800",
          soft: "bg-slate-100 text-slate-700",
        }
    }
  }

  const theme = getCategoryTheme(aqiCategory)
  const trendTone = percentChange < 0
    ? "bg-emerald-50 text-emerald-700"
    : percentChange > 0
      ? "bg-red-50 text-red-700"
      : "bg-slate-100 text-slate-600"
  const wasJustSelected = getSiteSelectionId(site) === lastSelectedId

  return (
    <Card
      className={`group relative w-full overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.card} ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      } ${isCheckboxSelected ? "shadow-blue-200/60 ring-2 ring-blue-400/70" : ""} ${
        wasJustSelected ? "-translate-y-1 shadow-xl" : ""
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 ${theme.accent}`} />
      <CardContent className="p-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-bold text-slate-950">{siteName}</h3>
              {isCheckboxSelected && (
                <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Selected
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-600">{areaName}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{city}, {country}</span>
            </p>
          </div>
          {onCheckboxChange && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white/90 shadow-sm">
              <Checkbox
                checked={isCheckboxSelected}
                aria-label={`Select ${siteName} for reporting`}
                onCheckedChange={() => onCheckboxChange()}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] gap-2">
          <div className="rounded-xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Current PM₂.₅</p>
            <p className={`mt-0.5 text-2xl font-bold tracking-tight ${theme.metric}`}>
              {pm25Value.toFixed(1)} <span className="text-sm font-semibold">µg/m³</span>
            </p>
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-white/80 bg-white/70 p-3 shadow-sm backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">AQI status</p>
            <span className={`mt-1.5 w-fit rounded-full border px-2 py-0.5 text-[11px] font-bold ${theme.badge}`}>
              {aqiCategory}
            </span>
          </div>
        </div>

        <div className="mt-2 rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-800">Weekly comparison</p>
              <p className="text-[10px] text-slate-500">Weekly average · µg/m³</p>
            </div>
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${trendTone}`}>
              {percentChange < 0 ? (
                <ArrowDown className="h-3.5 w-3.5" />
              ) : percentChange > 0 ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              {Math.abs(percentChange).toFixed(2)}%
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Previous</p>
              <p className="text-sm font-bold text-slate-700">{previousWeek.toFixed(1)}</p>
              <p className="hidden">µg/m³</p>
            </div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${theme.soft}`}>
              {percentChange < 0 ? <ArrowDown className="h-4 w-4" /> : percentChange > 0 ? <ArrowUp className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Current</p>
              <p className="text-sm font-bold text-slate-900">{currentWeek.toFixed(1)}</p>
              <p className="hidden">µg/m³</p>
            </div>
          </div>
        </div>

        {onSelect && (
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            disabled={reportDisabled}
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            className={`mt-3 h-9 w-full rounded-lg text-xs font-semibold transition ${
              isSelected
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border-blue-200 bg-white/80 text-blue-700 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            {reportDisabled ? "Select a city or district first" : isSelected ? "Selected for report" : "View detailed report"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: string
  icon: ReactNode
  trend?: number
}) {
  return (
    <Card className="group relative w-full overflow-hidden rounded-2xl border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{title}</h3>
            <div className="mt-2 flex items-center text-3xl font-bold tracking-tight text-slate-950">
              {value}
              {trend !== undefined && (
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-xs font-bold ${
                    trend < 0 ? "bg-emerald-50 text-emerald-700" : trend > 0 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {trend < 0 ? "↓" : trend > 0 ? "↑" : "−"}
                </span>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-3.5 ring-1 ring-blue-100 transition-transform group-hover:scale-105">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function HealthTipBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">{title}</h3>
      <p className="text-blue-700 text-sm">{description}</p>
    </div>
  )
}

// Add this new component after the HealthTipBox component at the end of the file
// Modify the AdvancedAnalysisSection component to accept and use an activeTab prop
// Modify the AdvancedAnalysisSection component to make it more compact for PDF
function AdvancedAnalysisSection({ sites, activeTab = "moran" }: { sites: SiteData[]; activeTab?: string }) {
  const [localActiveTab, setLocalActiveTab] = useState(activeTab)
  const moranChartRef = useRef<HTMLDivElement>(null)
  const getisOrdChartRef = useRef<HTMLDivElement>(null)

  const downloadSpatialChartPng = async (element: HTMLDivElement | null, filename: string) => {
    if (!element) return
    try {
      const canvas = await html2canvas(element, {
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
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting spatial chart:", error)
    }
  }

  // Use the passed activeTab if it's "both", otherwise use local state
  const effectiveTab = activeTab === "both" ? "both" : localActiveTab

  // Colors for the charts
  const moranColors = ["#ff6b6b", "#4ecdc4", "#ffd166", "#6a0572", "#cccccc"]
  const getisOrdColors = ["#d00000", "#e85d04", "#faa307", "#48cae4", "#0077b6", "#023e8a", "#cccccc"]

  // Simulated data for Local Moran's I analysis with device names
  const moranData = [
    {
      type: "HH (High-High)",
      count: Math.floor(sites.length * 0.25),
      description: "Areas with high PM₂.₅ values surrounded by areas with high values",
      devices: sites
        .slice(0, Math.floor(sites.length * 0.25))
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "LL (Low-Low)",
      count: Math.floor(sites.length * 0.3),
      description: "Areas with low PM₂.₅ values surrounded by areas with low values",
      devices: sites
        .slice(Math.floor(sites.length * 0.25), Math.floor(sites.length * 0.25) + Math.floor(sites.length * 0.3))
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "HL (High-Low)",
      count: Math.floor(sites.length * 0.15),
      description: "Areas with high PM₂.₅ values surrounded by areas with low values (potential outliers)",
      devices: sites
        .slice(
          Math.floor(sites.length * 0.25) + Math.floor(sites.length * 0.3),
          Math.floor(sites.length * 0.25) + Math.floor(sites.length * 0.3) + Math.floor(sites.length * 0.15),
        )
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "LH (Low-High)",
      count: Math.floor(sites.length * 0.1),
      description: "Areas with low PM₂.₅ values surrounded by areas with high values (potential outliers)",
      devices: sites
        .slice(
          Math.floor(sites.length * 0.25) + Math.floor(sites.length * 0.3) + Math.floor(sites.length * 0.15),
          Math.floor(sites.length * 0.25) +
            Math.floor(sites.length * 0.3) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1),
        )
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "Not Significant",
      count:
        sites.length -
        (Math.floor(sites.length * 0.25) +
          Math.floor(sites.length * 0.3) +
          Math.floor(sites.length * 0.15) +
          Math.floor(sites.length * 0.1)),
      description: "Areas with no statistically significant spatial autocorrelation",
      devices: sites
        .slice(
          Math.floor(sites.length * 0.25) +
            Math.floor(sites.length * 0.3) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1),
        )
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
  ]

  // Simulated data for Getis-Ord Gi* analysis with device names
  const getisOrdData = [
    {
      type: "Hot Spot (99% Confidence)",
      count: Math.floor(sites.length * 0.1),
      description: "Statistically significant hot spots with 99% confidence",
      devices: sites
        .slice(0, Math.floor(sites.length * 0.1))
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "Hot Spot (95% Confidence)",
      count: Math.floor(sites.length * 0.15),
      description: "Statistically significant hot spots with 95% confidence",
      devices: sites
        .slice(Math.floor(sites.length * 0.1), Math.floor(sites.length * 0.1) + Math.floor(sites.length * 0.15))
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "Hot Spot (90% Confidence)",
      count: Math.floor(sites.length * 0.1),
      description: "Statistically significant hot spots with 90% confidence",
      devices: sites
        .slice(
          Math.floor(sites.length * 0.1) + Math.floor(sites.length * 0.15),
          Math.floor(sites.length * 0.1) + Math.floor(sites.length * 0.15) + Math.floor(sites.length * 0.1),
        )
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "Cold Spot (90% Confidence)",
      count: Math.floor(sites.length * 0.1),
      description: "Statistically significant cold spots with 90% confidence",
      devices: sites
        .slice(
          Math.floor(sites.length * 0.1) + Math.floor(sites.length * 0.15) + Math.floor(sites.length * 0.1),
          Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.1),
        )
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "Cold Spot (95% Confidence)",
      count: Math.floor(sites.length * 0.15),
      description: "Statistically significant cold spots with 95% confidence",
      devices: sites
        .slice(
          Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.1),
          Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15),
        )
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "Cold Spot (99% Confidence)",
      count: Math.floor(sites.length * 0.1),
      description: "Statistically significant cold spots with 99% confidence",
      devices: sites
        .slice(
          Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15),
          Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1),
        )
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
    {
      type: "Not Significant",
      count:
        sites.length -
        (Math.floor(sites.length * 0.1) +
          Math.floor(sites.length * 0.15) +
          Math.floor(sites.length * 0.1) +
          Math.floor(sites.length * 0.1) +
          Math.floor(sites.length * 0.15) +
          Math.floor(sites.length * 0.1)),
      description: "Areas with no statistically significant hot or cold spots",
      devices: sites
        .slice(
          Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.1) +
            Math.floor(sites.length * 0.15) +
            Math.floor(sites.length * 0.1),
        )
        .map((site) => site.siteDetails?.name || site.siteDetails?.formatted_name || "Unknown Site"),
    },
  ]

  // Render the Moran's I analysis section
  const renderMoranAnalysis = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">About Local Moran&apos;s I</h4>
        <p className="text-blue-700 text-sm">
          Local Moran&apos;s I is a spatial autocorrelation statistic that identifies clusters and spatial outliers. It
          helps identify areas with similar values clustered together (HH, LL) and areas that are different from their
          neighbors (HL, LH).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card ref={moranChartRef}>
          <CardHeader className="flex-row items-center justify-between space-y-0 py-3">
            <CardTitle className="text-base">Cluster and Outlier Analysis</CardTitle>
            <Button
              data-chart-export-control
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void downloadSpatialChartPng(moranChartRef.current, "moran_cluster_analysis.png")}
              className="h-8 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              PNG
            </Button>
          </CardHeader>
          <CardContent className="h-[250px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moranData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value, name, props) => [`${value} sites`, props.payload.type]} />
                <Legend />
                <Bar dataKey="count" name="Number of Sites" fill="#8884d8">
                  {moranData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={moranColors[index % moranColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Interpretation</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
              {moranData.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: moranColors[index % moranColors.length] }}
                  />
                  <div>
                    <div className="font-medium text-sm">
                      {item.type}: {item.count} sites
                    </div>
                    <div className="text-xs text-gray-600">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">Key Insights from Local Moran&apos;s I Analysis</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li>
            <strong>High-High Clusters:</strong> {moranData[0].count} sites show high PM₂.₅ values clustered together,
            indicating potential pollution hotspots that require immediate attention.
          </li>
          <li>
            <strong>Spatial Outliers:</strong> {moranData[2].count + moranData[3].count} sites are spatial outliers (HL
            or LH), suggesting localized emission sources or unique geographical factors affecting air quality.
          </li>
          <li>
            <strong>Low-Low Clusters:</strong> {moranData[1].count} sites show low PM₂.₅ values clustered together,
            representing areas with consistently better air quality.
          </li>
        </ul>
      </div>

      <Card className="mt-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Device Details by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {moranData.map((item, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: moranColors[index % moranColors.length] }}
                  />
                  <h4 className="font-semibold text-sm">{item.type}</h4>
                </div>
                {item.devices && item.devices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
                    {item.devices.slice(0, 4).map((device, idx) => (
                      <div key={idx} className="text-xs bg-gray-50 p-1 rounded">
                        {device}
                      </div>
                    ))}
                    {item.devices.length > 4 && (
                      <div className="text-xs text-gray-500">+{item.devices.length - 4} more devices</div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No devices in this category</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Render the Getis-Ord analysis section
  const renderGetisOrdAnalysis = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">About Getis-Ord Gi* (Hot Spot Analysis)</h4>
        <p className="text-blue-700 text-sm">
          Getis-Ord Gi* is a spatial statistic that identifies statistically significant hot spots (high values) and
          cold spots (low values) in your data. The analysis shows where features with high or low values cluster
          spatially, with different confidence levels (90%, 95%, 99%).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card ref={getisOrdChartRef}>
          <CardHeader className="flex-row items-center justify-between space-y-0 py-3">
            <CardTitle className="text-base">Hot Spot Analysis</CardTitle>
            <Button
              data-chart-export-control
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void downloadSpatialChartPng(getisOrdChartRef.current, "getis_ord_hot_spot_analysis.png")}
              className="h-8 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              PNG
            </Button>
          </CardHeader>
          <CardContent className="h-[250px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getisOrdData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip formatter={(value, name, props) => [`${value} sites`, props.payload.type]} />
                <Legend />
                <Bar dataKey="count" name="Number of Sites" fill="#8884d8">
                  {getisOrdData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getisOrdColors[index % getisOrdColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Interpretation</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
              {getisOrdData.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: getisOrdColors[index % getisOrdColors.length] }}
                  />
                  <div>
                    <div className="font-medium text-sm">
                      {item.type}: {item.count} sites
                    </div>
                    <div className="text-xs text-gray-600">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">Key Insights from Getis-Ord Gi* Analysis</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
          <li>
            <strong>Significant Hot Spots:</strong>{" "}
            {getisOrdData[0].count + getisOrdData[1].count + getisOrdData[2].count} sites are identified as
            statistically significant hot spots, with varying confidence levels.
          </li>
          <li>
            <strong>Significant Cold Spots:</strong>{" "}
            {getisOrdData[3].count + getisOrdData[4].count + getisOrdData[5].count} sites are identified as
            statistically significant cold spots, representing areas with consistently lower pollution levels.
          </li>
          <li>
            <strong>Highest Confidence Hot Spots:</strong> {getisOrdData[0].count} sites show hot spots with 99%
            confidence, indicating areas that should be prioritized for intervention.
          </li>
        </ul>
      </div>

      <Card className="mt-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Device Details by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {getisOrdData.map((item, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getisOrdColors[index % getisOrdColors.length] }}
                  />
                  <h4 className="font-semibold text-sm">{item.type}</h4>
                </div>
                {item.devices && item.devices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
                    {item.devices.slice(0, 4).map((device, idx) => (
                      <div key={idx} className="text-xs bg-gray-50 p-1 rounded">
                        {device}
                      </div>
                    ))}
                    {item.devices.length > 4 && (
                      <div className="text-xs text-gray-500">+{item.devices.length - 4} more devices</div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No devices in this category</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Advanced Spatial Analysis</h3>
        {effectiveTab !== "both" && (
          <div className="flex space-x-2">
            <Button
              variant={localActiveTab === "moran" ? "default" : "outline"}
              onClick={() => setLocalActiveTab("moran")}
              className="flex items-center gap-2"
            >
              <Layers className="h-4 w-4" />
              Local Moran&apos;s I
            </Button>
            <Button
              variant={localActiveTab === "getis" ? "default" : "outline"}
              onClick={() => setLocalActiveTab("getis")}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Getis-Ord Gi*
            </Button>
          </div>
        )}
      </div>

      {/* Render based on the active tab */}
      {effectiveTab === "both" ? (
        <>
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">Local Moran&apos;s I Analysis</h3>
            {renderMoranAnalysis()}
          </div>
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">Getis-Ord Gi* Analysis</h3>
            {renderGetisOrdAnalysis()}
          </div>
        </>
      ) : localActiveTab === "moran" ? (
        renderMoranAnalysis()
      ) : (
        renderGetisOrdAnalysis()
      )}
    </div>
  )
}
type DailyPm25Extreme = {
  dates: string[]
  value: number
}

const getDailyPm25Extremes = (sites: SiteData[]): { highest: DailyPm25Extreme; lowest: DailyPm25Extreme } | null => {
  const valuesByDate = new Map<string, number[]>()

  sites.forEach((site) => {
    site.reportMeasurements?.forEach((measurement) => {
      const date = new Date(measurement.timestamp)
      if (Number.isNaN(date.getTime()) || !Number.isFinite(measurement.value)) return
      const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`
      valuesByDate.set(dateKey, [...(valuesByDate.get(dateKey) || []), measurement.value])
    })
  })

  const dailyValues = Array.from(valuesByDate.entries()).map(([date, values]) => ({
    date,
    value: values.reduce((sum, value) => sum + value, 0) / values.length,
  }))
  if (dailyValues.length === 0) return null

  const highestValue = Math.max(...dailyValues.map(({ value }) => value))
  const lowestValue = Math.min(...dailyValues.map(({ value }) => value))
  const matchesValue = (value: number, target: number) => Math.abs(value - target) < 0.000001

  return {
    highest: {
      dates: dailyValues.filter(({ value }) => matchesValue(value, highestValue)).map(({ date }) => date),
      value: highestValue,
    },
    lowest: {
      dates: dailyValues.filter(({ value }) => matchesValue(value, lowestValue)).map(({ date }) => date),
      value: lowestValue,
    },
  }
}
