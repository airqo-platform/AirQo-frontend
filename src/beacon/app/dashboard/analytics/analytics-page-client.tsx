"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AnalyticsFilters, { FilterState, type AnalyticsFilterType } from "./analytics-filters"
import AirQloudsTable from "./airqlouds-table"
import { useToast } from "@/components/ui/use-toast"
import { airQloudService, type PerformanceEntityType } from "@/services/airqloud.service"
import { deviceApiService } from "@/services/device-api.service"
import { useGroup } from "@/lib/group-context"
import { ROUTES } from "@/lib/navigation"

// Clustered Analysis covers cohorts, which it calls clusters, and devices
const ANALYTICS_FILTER_TYPES: AnalyticsFilterType[] = ["airqlouds", "devices"]
const FILTER_TYPE_LABELS: Partial<Record<AnalyticsFilterType, string>> = { airqlouds: "Clusters" }
const DEVICES_PAGE_SIZE = 10

// The "Filter By" choice drives the table below it and is kept in
// `?analysis=<entity>` so it survives reloads and back navigation.
const FILTER_TO_ENTITY: Record<AnalyticsFilterType, PerformanceEntityType> = {
  airqlouds: "cohorts",
  grids: "grids",
  devices: "devices",
}

const getFilterTypeFromParam = (value: string | null | undefined): AnalyticsFilterType =>
  ANALYTICS_FILTER_TYPES.find((type) => FILTER_TO_ENTITY[type] === value) ?? "airqlouds"

const getFilterLabel = (filterType: FilterState["filterType"]) =>
  filterType === "airqlouds" ? "Cluster" : "Device"

const getDateWindow = (filterState: FilterState) => {
  const startDate = new Date(filterState.dateRange.from as Date)
  const endDate = new Date(filterState.dateRange.to as Date)

  if (filterState.includeTime && filterState.timeRange) {
    const [startHours, startMinutes] = filterState.timeRange.from.split(":")
    const [endHours, endMinutes] = filterState.timeRange.to.split(":")
    startDate.setHours(Number.parseInt(startHours), Number.parseInt(startMinutes), 0, 0)
    endDate.setHours(Number.parseInt(endHours), Number.parseInt(endMinutes), 59, 999)
  } else {
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
  }

  return { startDate, endDate }
}

const fetchAnalysisData = async (filterState: FilterState, start: string, end: string, group: string) => {
  if (filterState.filterType === "airqlouds") {
    return airQloudService.getAirQloudPerformance({
      start,
      end,
      ids: filterState.selectedItems,
      group,
    })
  }

  return deviceApiService.getDevicePerformanceData({
    start,
    end,
    deviceNames: filterState.selectedItems,
    group,
  })
}

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
        title: "Group Required",
        description: "Please wait for your active group to load before running analysis.",
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
        description: `Please select at least one ${getFilterLabel(filterState.filterType)} to analyse.`,
        variant: "destructive",
      })
      return
    }

    setIsAnalysing(true)

    try {
      const { startDate, endDate } = getDateWindow(filterState)
      const response = await fetchAnalysisData(filterState, startDate.toISOString(), endDate.toISOString(), activeGroup)

      sessionStorage.setItem("analysisData", JSON.stringify(response))
      sessionStorage.setItem("analysisDateRange", JSON.stringify({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      }))
      sessionStorage.setItem("analysisType", filterState.filterType)

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
        filterTypes={ANALYTICS_FILTER_TYPES}
        filterTypeLabels={FILTER_TYPE_LABELS}
        title="Clustered Analysis"
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
