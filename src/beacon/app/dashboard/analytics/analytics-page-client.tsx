"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AnalyticsFilters, {
  FILTER_ITEM_LABELS,
  FILTER_TYPES,
  FILTER_TYPE_LABELS,
  FilterState,
  MAX_SELECTED_ITEMS,
  fetchFilteredPerformance,
  getFilterDateWindow,
  type AnalyticsFilterType,
} from "./analytics-filters"
import AirQloudsTable from "./airqlouds-table"
import { useToast } from "@/components/ui/use-toast"
import type { PerformanceEntityType } from "@/services/airqloud.service"
import { handOffAnalysis } from "@/lib/analysis-handoff"
import { useGroup } from "@/lib/group-context"
import { ROUTES } from "@/lib/navigation"

const DEVICES_PAGE_SIZE = 10

// The "Filter By" choice drives the table below it and is kept in
// `?analysis=<entity>` so it survives reloads and back navigation.
const FILTER_TO_ENTITY: Record<AnalyticsFilterType, PerformanceEntityType> = {
  airqlouds: "cohorts",
  devices: "devices",
}

const getFilterTypeFromParam = (value: string | null | undefined): AnalyticsFilterType =>
  FILTER_TYPES.find((type) => FILTER_TO_ENTITY[type] === value) ?? "airqlouds"

export default function AnalyticsPageClient() {
  const { toast } = useToast()
  const { activeGroup, loading: groupLoading } = useGroup()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialFilterType = getFilterTypeFromParam(searchParams?.get("analysis"))
  const [filters, setFilters] = useState<FilterState>({
    filterType: initialFilterType,
    selectedItems: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
    includeTime: false,
  })
  const [isAnalysing, setIsAnalysing] = useState(false)

  const handleFilterChange = (nextFilters: FilterState) => {
    setFilters(nextFilters)
    if (nextFilters.filterType !== initialFilterType) {
      router.replace(`${ROUTES.ANALYTICS}?analysis=${FILTER_TO_ENTITY[nextFilters.filterType]}`, { scroll: false })
    }
  }

  const handleAnalyse = async (filterState: FilterState) => {
    if (groupLoading || !activeGroup) {
      toast({
        title: "Organisation Required",
        description: "Please wait for your active organisation to load before running analysis.",
        variant: "destructive",
      })
      return
    }

    if (!filterState.dateRange.from || !filterState.dateRange.to) {
      toast({
        title: "Date Range Required",
        description: "Please select a date range for the analysis.",
        variant: "destructive",
      })
      return
    }

    if (filterState.selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: `Please select at least one ${FILTER_ITEM_LABELS[filterState.filterType]} to analyse.`,
        variant: "destructive",
      })
      return
    }

    const maxSelected = MAX_SELECTED_ITEMS[filterState.filterType]
    if (filterState.selectedItems.length > maxSelected) {
      toast({
        title: "Too Many Items Selected",
        description: `You can analyse up to ${maxSelected} ${FILTER_TYPE_LABELS[filterState.filterType].toLowerCase()} at a time.`,
        variant: "destructive",
      })
      return
    }

    setIsAnalysing(true)

    try {
      const { startDate, endDate } = getFilterDateWindow(filterState)
      const response = await fetchFilteredPerformance(filterState, startDate.toISOString(), endDate.toISOString(), activeGroup)

      handOffAnalysis({
        type: filterState.filterType,
        dateRange: { from: startDate.toISOString(), to: endDate.toISOString() },
        data: response,
      })

      router.push("/dashboard/analytics/analysis")
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to fetch analysis data",
        variant: "destructive",
      })
    } finally {
      setIsAnalysing(false)
    }
  }

  const entityType = FILTER_TO_ENTITY[filters.filterType]

  return (
    <div className="space-y-6 p-6">
      <AnalyticsFilters
        initialFilterType={initialFilterType}
        onFilterChange={handleFilterChange}
        onAnalyse={handleAnalyse}
        isAnalysing={isAnalysing}
      />

      <AirQloudsTable
        entityType={entityType}
        entityLabel={entityType === "cohorts" ? FILTER_TYPE_LABELS.airqlouds : undefined}
        pageSize={entityType === "devices" ? DEVICES_PAGE_SIZE : undefined}
      />
    </div>
  )
}
