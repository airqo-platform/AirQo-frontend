"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"
import { Button } from "@/ui/button"
import { Checkbox } from "@/ui/checkbox"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { BarChart3, Calendar, CheckSquare, Layers, LoaderCircle, MapPin, Search, Square } from "lucide-react"
import type { ReportDataOptions, ReportDateRange, SiteData } from "@/lib/types"
import { loadHistoricalReportData } from "@/services/apiService"
import ErrorPopup from "@/components/reports/ErrorPopup"
import ReportLoadingScreen from "@/components/reports/ReportLoadingScreen"
import { retryReportRequest } from "@/lib/report-retry"

interface ReportDataModalProps {
  isOpen: boolean
  onClose: () => void
  sites: SiteData[]
  dateRange: ReportDateRange
  aggregation: ReportDataOptions["frequency"]
  onAggregationChange: (aggregation: ReportDataOptions["frequency"]) => void
  canGenerate: boolean
  onReportReady: (reportSites: SiteData[], dateRange: ReportDateRange) => void
}

const getSiteId = (site: SiteData) => site.site_id || site.siteDetails?._id || site._id

export default function ReportDataModal({
  isOpen,
  onClose,
  sites,
  dateRange,
  aggregation,
  onAggregationChange,
  canGenerate,
  onReportReady,
}: ReportDataModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("ALL")
  const [selectedCity, setSelectedCity] = useState("ALL")
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([])
  const [dataType, setDataType] = useState<ReportDataOptions["dataType"]>("calibrated")
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [canRetryError, setCanRetryError] = useState(false)

  const countries = useMemo(
    () =>
      Array.from(
        new Set(sites.map((site) => site.siteDetails?.country).filter((country): country is string => Boolean(country))),
      ).sort(),
    [sites],
  )

  const cities = useMemo(() => {
    const countrySites =
      selectedCountry === "ALL" ? sites : sites.filter((site) => site.siteDetails?.country === selectedCountry)
    return Array.from(
      new Set(countrySites.map((site) => site.siteDetails?.city).filter((city): city is string => Boolean(city))),
    ).sort()
  }, [selectedCountry, sites])

  const filteredSites = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return sites.filter((site) => {
      const name = (site.siteDetails?.name || site.siteDetails?.formatted_name || "").toLowerCase()
      const city = (site.siteDetails?.city || "").toLowerCase()
      const country = (site.siteDetails?.country || "").toLowerCase()
      return (
        (!normalizedSearch ||
          name.includes(normalizedSearch) ||
          city.includes(normalizedSearch) ||
          country.includes(normalizedSearch)) &&
        (selectedCountry === "ALL" || site.siteDetails?.country === selectedCountry) &&
        (selectedCity === "ALL" || site.siteDetails?.city === selectedCity)
      )
    })
  }, [searchTerm, selectedCity, selectedCountry, sites])

  const allFilteredSelected =
    filteredSites.length > 0 && filteredSites.every((site) => selectedSiteIds.includes(getSiteId(site)))

  const toggleSite = (siteId: string) => {
    setSelectedSiteIds((current) =>
      current.includes(siteId) ? current.filter((id) => id !== siteId) : [...current, siteId],
    )
  }

  const toggleAllVisible = () => {
    const visibleIds = filteredSites.map(getSiteId)
    if (allFilteredSelected) {
      const visibleIdSet = new Set(visibleIds)
      setSelectedSiteIds((current) => current.filter((id) => !visibleIdSet.has(id)))
      return
    }
    setSelectedSiteIds((current) => Array.from(new Set([...current, ...visibleIds])))
  }

  const handleGenerateReport = async () => {
    setErrorMessage(null)
    setCanRetryError(false)
    const effectiveSiteIds = selectedSiteIds.length > 0 ? selectedSiteIds : filteredSites.map(getSiteId)

    if (effectiveSiteIds.length === 0) {
      setErrorMessage("Select at least one site for the report.")
      return
    }
    const options: ReportDataOptions = {
      selectedSiteIds: effectiveSiteIds,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      frequency: aggregation,
      dataType,
      pollutants: ["pm2_5", "pm10"],
    }
    setIsGenerating(true)
    try {
      const reportSites = await retryReportRequest(() => loadHistoricalReportData(sites, options))

      onReportReady(reportSites, { startDate: options.startDate, endDate: options.endDate })
      onClose()
    } catch (error) {
      console.error("Unable to build historical report:", error)
      setErrorMessage(error instanceof Error ? error.message : "Unable to build the report.")
      setCanRetryError(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const activeSiteCount = selectedSiteIds.length > 0 ? selectedSiteIds.length : filteredSites.length

  return (
    <>
      {isGenerating && <ReportLoadingScreen />}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Customize report data</DialogTitle>
              <DialogDescription>
                Confirm the monitoring sites and data settings for the date range selected above.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
              <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
                <Calendar className="h-4 w-4" /> Selected date range
              </Label>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {format(new Date(dateRange.startDate.slice(0, 10) + "T12:00:00Z"), "MMM d, yyyy")} - {format(new Date(dateRange.endDate.slice(0, 10) + "T12:00:00Z"), "MMM d, yyyy")}
              </p>
              <p className="mt-1 text-xs text-slate-500">Change this period from the Date range control in Report filters.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <Layers className="h-4 w-4 text-cyan-600" /> Data type
                </Label>
                <Select value={dataType} onValueChange={(value: ReportDataOptions["dataType"]) => setDataType(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calibrated">Calibrated</SelectItem>
                    <SelectItem value="raw">Raw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average by</Label>
                <Select value={aggregation} onValueChange={onAggregationChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Day</SelectItem>
                    <SelectItem value="weekly">Week</SelectItem>
                    <SelectItem value="monthly">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-2 sm:flex-row sm:items-center">
              <Label className="flex items-center gap-2 text-sm font-bold">
                <MapPin className="h-4 w-4 text-blue-600" /> Sites
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                  {selectedSiteIds.length > 0
                    ? selectedSiteIds.length + " selected"
                    : "All " + filteredSites.length + " visible sites"}
                </span>
              </Label>
              <Button type="button" variant="ghost" size="sm" onClick={toggleAllVisible} className="text-blue-600">
                {allFilteredSelected ? (
                  <><Square className="mr-1 h-3.5 w-3.5" /> Deselect visible</>
                ) : (
                  <><CheckSquare className="mr-1 h-3.5 w-3.5" /> Select all visible</>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search sites..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-9 pl-8"
                />
              </div>
              <Select
                value={selectedCountry}
                onValueChange={(country) => {
                  setSelectedCountry(country)
                  setSelectedCity("ALL")
                }}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="All countries" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All countries</SelectItem>
                  {countries.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-9"><SelectValue placeholder="All cities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All cities</SelectItem>
                  {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
              {filteredSites.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No sites match these filters.</div>
              ) : (
                filteredSites.map((site) => {
                  const id = getSiteId(site)
                  const checked = selectedSiteIds.includes(id)
                  return (
                    <div
                      key={id}
                      onClick={() => toggleSite(id)}
                      className={
                        "flex cursor-pointer items-center justify-between px-3 py-2.5 hover:bg-blue-50/60 " +
                        (checked ? "bg-blue-50/70" : "")
                      }
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Checkbox
                          checked={checked}
                          onClick={(event) => event.stopPropagation()}
                          onCheckedChange={() => toggleSite(id)}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {site.siteDetails?.name || site.siteDetails?.formatted_name || id}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {[site.siteDetails?.city, site.siteDetails?.country].filter(Boolean).join(", ") || "Location unavailable"}
                          </p>
                        </div>
                      </div>
                      <span className="ml-3 shrink-0 text-xs text-slate-500">
                        {site.pm2_5?.value == null ? "No current reading" : site.pm2_5.value.toFixed(1) + " µg/m³"}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>

        <DialogFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:justify-between">
          <span className="text-xs text-slate-500">{activeSiteCount} site(s) in this report</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="button"
              onClick={handleGenerateReport}
              disabled={!canGenerate || isGenerating || activeSiteCount === 0}
              className="min-w-[145px] bg-blue-600 text-white hover:bg-blue-700"
            >
              {isGenerating ? (
                <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Building...</>
              ) : (
                <><BarChart3 className="mr-2 h-4 w-4" /> {errorMessage ? "Regenerate report" : "Build report"}</>
              )}
            </Button>
          </div>
        </DialogFooter>
        </DialogContent>
      </Dialog>
      <ErrorPopup
        isOpen={Boolean(errorMessage)}
        message={errorMessage || "We couldn't generate the report."}
        onClose={() => setErrorMessage(null)}
        onTryAgain={canRetryError ? () => void handleGenerateReport() : undefined}
        isRetrying={isGenerating}
      />
    </>
  )
}
