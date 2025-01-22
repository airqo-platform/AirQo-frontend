"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ImportIcon, MoreHorizontal } from 'lucide-react'
import AnalyticsAirqloudsDropDown from './AnalyticsDropdown'
import GridDashboard from './GridDashboard'
import CohortDashboard from './CohortsDashboard'
import { useGrids } from '@/core/hooks/useGrids'
import { useCohorts } from '@/core/hooks/useCohorts'
import { dataExport } from '@/core/apis/analytics'
import { useToast } from "@/components/ui/use-toast"


const NewAnalytics: React.FC = () => {
  const [isCohort, setIsCohort] = useState(false)
  const [downloadingData, setDownloadingData] = useState(false)
  const [activeGrid, setActiveGrid] = useState(null)
  const [activeCohort, setActiveCohort] = useState(null)

  const { toast } = useToast()
  const { grids, isLoading: isGridsLoading } = useGrids()
  const { cohorts, isLoading: isCohortsLoading } = useCohorts()

  const airqloudsData = isCohort ? cohorts : grids

  const handleAirqloudSelect = (id: string) => {
    const selectedData = isCohort
      ? cohorts.find((cohort) => cohort._id === id)
      : grids.find((grid) => grid._id === id);
    if (selectedData) {
      const storageKey = isCohort ? "activeCohort" : "activeGrid";
      const setActive = isCohort ? setActiveCohort : setActiveGrid;
      setActive(selectedData);
      localStorage.setItem(storageKey, JSON.stringify(selectedData));
    }
  };

  useEffect(() => {
    const getStoredData = (key: string, data: any[], setter: React.Dispatch<React.SetStateAction<any>>) => {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        setter(JSON.parse(storedData));
      } else if (data.length > 0) {
        setter(data[0]);
      }
    };

    getStoredData('activeGrid', grids, setActiveGrid);
    getStoredData('activeCohort', cohorts, setActiveCohort);
  }, [grids, cohorts]);

  const handleSwitchGridsCohort = () => {
    setIsCohort(!isCohort)
  }

  const handleDownloadData = async () => {
    setDownloadingData(true)
    try {
      await dataExport({
        sites: !isCohort ? activeGrid?.sites.map(site => site._id) : [],
        devices: isCohort ? activeCohort?.devices.map(device => device._id) : [],
        startDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date().toISOString(),
        frequency: 'hourly',
        pollutants: ['pm2_5', 'pm10'],
        downloadType: isCohort ? 'csv' : 'json',
        outputFormat: 'airqo-standard'
      })
      toast({
        title: "Success",
        description: "Air quality data download successful",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error downloading data",
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

  return (
    <Card className="p-4">
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-6">
            <div className='col-span-1 sm:col-span-2 lg:col-span-6 mb-4 sm:mb-0'>
              <AnalyticsAirqloudsDropDown 
                isCohort={isCohort} 
                airqloudsData={airqloudsData}
                onSelect={handleAirqloudSelect}
                selectedId={isCohort ? activeCohort?._id : activeGrid?._id}
              />
            </div>
            <div className='col-span-1 sm:col-span-2 lg:col-span-6 flex flex-col sm:flex-row justify-start sm:justify-end items-stretch sm:items-center gap-4'>
              <Button 
                variant="outline"
                onClick={handleDownloadData}
                disabled={downloadingData || isGridsLoading || isCohortsLoading}
                className="w-full sm:w-auto"
              >
                Download Data
              </Button>
              <Button 
                onClick={handleSwitchGridsCohort}
                className="w-full sm:w-auto"
              >
                <ImportIcon className="mr-2 h-4 w-4" />
                Switch to {isCohort ? 'Grid View' : 'Cohort View'}
              </Button>
              {!isCohort && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="w-full sm:w-auto">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleRefreshGrid}>
                      Refresh Grid
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        {!isCohort && activeGrid && (
          <GridDashboard
            loading={isGridsLoading}
            gridId={activeGrid._id}
            recentEventsData={activeGrid.sites}
            grids={grids}
          />
        )}
        {isCohort && activeCohort && (
          <CohortDashboard
            loading={isCohortsLoading}
            cohortId={activeCohort._id}
            cohorts={cohorts}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default NewAnalytics

