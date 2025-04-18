"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ImportIcon, MoreHorizontal, Loader2 } from "lucide-react"
import AnalyticsAirqloudsDropDown from "./AnalyticsDropdown"
import GridDashboard from "./GridDashboard"
import CohortDashboard from "./CohortsDashboard"
import { useGrids } from "@/core/hooks/useGrids"
import { useCohorts } from "@/core/hooks/useCohorts"
import { dataExport } from "@/core/apis/analytics"
import { useToast } from "@/components/ui/use-toast"
import type { Cohort } from "@/app/types/cohorts"
import type { Grid } from "@/app/types/grids"
import { useMapReadings } from "@/core/hooks/useDevices"

const NewAnalytics: React.FC = () => {
  const [isCohort, setIsCohort] = useState(false)
  const [downloadingData, setDownloadingData] = useState(false)
  const [activeGrid, setActiveGrid] = useState<Grid>()
  const [activeCohort, setActiveCohort] = useState<Cohort>()

  const { toast } = useToast()
  const { grids, isLoading: isGridsLoading } = useGrids()
  const { cohorts, isLoading: isCohortsLoading } = useCohorts()
  const { isLoading: isMapReadingsLoading } = useMapReadings()

  const airqloudsData = isCohort ? cohorts : grids
  const isLoading = isGridsLoading || isCohortsLoading || isMapReadingsLoading

  const handleAirqloudSelect = (id: string) => {
    const selectedData = isCohort
      ? cohorts.find((cohort: Cohort) => cohort._id === id)
      : grids.find((grid: Grid) => grid._id === id)
    if (selectedData) {
      const storageKey = isCohort ? "activeCohort" : "activeGrid"
      const setActive = isCohort ? setActiveCohort : setActiveGrid
      setActive(selectedData)
      localStorage.setItem(storageKey, JSON.stringify(selectedData))
    }
  }

  useEffect(() => {
    const activeGrid = localStorage.getItem("activeGrid")
    const activeCohort = localStorage.getItem("activeCohort")

    setActiveGrid(
      activeGrid && Array.isArray(grids) && grids.length > 0
        ? JSON.parse(activeGrid)
        : Array.isArray(grids) && grids.length > 0
          ? grids[0]
          : null,
    )

    setActiveCohort(
      activeCohort && Array.isArray(cohorts) && cohorts.length > 0
        ? JSON.parse(activeCohort)
        : (cohorts && cohorts[0]) || null,
    )
  }, [grids, cohorts])

  const handleSwitchGridsCohort = () => {
    setIsCohort(!isCohort)
  }

  const handleDownloadData = async () => {
    setDownloadingData(true)
    try {
      await dataExport({
        ...(isCohort ? {} : { sites: activeGrid?.sites.map((site) => site._id) || [] }),
        ...(isCohort
          ? {
              device_names: activeCohort?.devices.map((device) => device.name) || [],
            }
          : {}),
        startDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date().toISOString(),
        frequency: "hourly",
        pollutants: ["pm2_5", "pm10"],
        downloadType: isCohort ? "csv" : "json",
        outputFormat: "airqo-standard",
        minimum: true,
        datatype: "raw",
      })
      toast({
        title: "Success",
        description: "Air quality data download successful",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingData(false)
    }
  }

  const handleRefreshGrid = async () => {
    toast({
      title: "Refresh",
      description: "Grid refresh initiated",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
    <Card className="p-4">
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-6">
          <div className="col-span-1 sm:col-span-2 lg:col-span-6 mb-4 sm:mb-0">
            <AnalyticsAirqloudsDropDown
              isCohort={isCohort}
              airqloudsData={airqloudsData}
              onSelect={handleAirqloudSelect}
              selectedId={isCohort ? (activeCohort?._id ?? null) : (activeGrid?._id ?? null)}
            />
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-6 flex flex-col sm:flex-row justify-start sm:justify-end items-stretch sm:items-center gap-4">
            <Button
              variant="outline"
              onClick={handleDownloadData}
              disabled={downloadingData || isLoading}
              className="w-full sm:w-auto"
            >
              {downloadingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {downloadingData ? "Downloading..." : "Download Data"}
            </Button>
            <Button onClick={handleSwitchGridsCohort} className="w-full sm:w-auto">
              <ImportIcon className="mr-2 h-4 w-4" />
              Switch to {isCohort ? "Grid View" : "Cohort View"}
            </Button>
            {!isCohort && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="w-full sm:w-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleRefreshGrid}>Refresh Grid</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {!isCohort && activeGrid && (
          <GridDashboard
            loading={isGridsLoading}
            gridId={activeGrid._id}
            recentEventsData={{
              features: activeGrid.sites.map((site) => ({
                properties: {
                  site_id: site._id,
                  pm2_5: { value: site.approximate_longitude },
                },
              }))
            }}
            grids={grids as Grid[]}
          />
        )}
        {isCohort && activeCohort && (
          <CohortDashboard loading={isCohortsLoading} cohortId={activeCohort._id} cohorts={cohorts} />
        )}
      </CardContent>
    </Card>
    </div>
  )
}

export default NewAnalytics

