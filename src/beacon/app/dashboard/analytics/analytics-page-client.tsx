"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AnalyticsFilters, { FilterState } from "./analytics-filters"
import AirQloudsTable from "./airqlouds-table"
import { useToast } from "@/components/ui/use-toast"
import { airQloudService } from "@/services/airqloud.service"
import { deviceApiService } from "@/services/device-api.service"
import { useGroup } from "@/lib/group-context"

const getFilterLabel = (filterType: FilterState["filterType"]) => {
  if (filterType === "airqlouds") return "Cohort"
  if (filterType === "grids") return "Grid"
  return "Device"
}

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

  if (filterState.filterType === "grids") {
    return airQloudService.getGridPerformance({
      start,
      end,
      ids: filterState.selectedItems,
      admin_level: "city",
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
  const initialFilterType = searchParams?.get("analysis") === "grids" ? "grids" : "airqlouds"
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

  return (
    <div className="space-y-6 p-6">
      <AnalyticsFilters
        initialFilterType={initialFilterType}
        onFilterChange={setFilters}
        onAnalyse={handleAnalyse}
        isAnalysing={isAnalysing}
      />

      <AirQloudsTable entityType={filters.filterType === "grids" ? "grids" : "cohorts"} />
    </div>
  )
}