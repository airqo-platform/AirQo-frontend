'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isEmpty } from 'lodash'
import Papa from 'papaparse'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'

import ErrorBoundary from '@/components/ui/ErrorBoundory'
import AnalyticsAirqloudsDropDown from '@/components/Analytics/AnalyticsDropdown'
import GridsDashboardView from '@/components/Analytics/GridDashboard'
// import AnalyticsBreadCrumb from '@/components'
import CohortsDashboardView from '@/components/Analytics/CohortsDashboard'

import {
  loadGridsAndCohortsSummary,
  setActiveGrid,
  loadGridDetails,
  loadCohortDetails,
  setActiveCohort
} from '@/redux/Analytics/operations'
import { updateMainAlert } from '@/redux/MainAlert/operations'
import { refreshGridApi, downloadDataApi } from '@/apis/analytics'
import { roundToEndOfDay, roundToStartOfDay } from '@/utils/dateTime'
import { createAlertBarExtraContentFromObject } from '@/utils/objectManipulators'
import { RootState, AppDispatch } from '@/redux/store'

const Analytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [isCohort, setIsCohort] = useState(false)
  const [downloadingData, setDownloadingData] = useState(false)

  const activeNetwork = useSelector((state: RootState) => state.accessControl.activeNetwork)
  const combinedGridAndCohortsSummary = useSelector((state: RootState) => state.analytics.combinedGridAndCohortsSummary)
  const activeGrid = useSelector((state: RootState) => state.analytics.activeGrid)
  const activeGridDetails = useSelector((state: RootState) => state.analytics.activeGridDetails)
  const activeCohort = useSelector((state: RootState) => state.analytics.activeCohort)
  const activeCohortDetails = useSelector((state: RootState) => state.analytics.activeCohortDetails)

  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [isGridLoading, setIsGridLoading] = useState(false)
  const [isCohortLoading, setIsCohortLoading] = useState(false)

  useEffect(() => {
    const loadSummaryAsync = async () => {
      if (!activeNetwork || activeNetwork.net_name === '') {
        return
      }

      setIsSummaryLoading(true)
      try {
        await dispatch(loadGridsAndCohortsSummary(activeNetwork.net_name))
      } catch (error) {
        console.error('Error in loadSummaryAsync:', error)
        dispatch(updateMainAlert({
          message: 'Failed to load summary data',
          show: true,
          severity: 'error'
        }))
      } finally {
        setIsSummaryLoading(false)
      }
    }

    loadSummaryAsync()
  }, [activeNetwork, dispatch])

  useEffect(() => {
    const gridsList = combinedGridAndCohortsSummary?.grids
    const cohortsList = combinedGridAndCohortsSummary?.cohorts
    if (!isEmpty(gridsList)) {
      dispatch(setActiveGrid(gridsList[0]))
    }
    if (!isEmpty(cohortsList)) {
      dispatch(setActiveCohort(cohortsList[0]))
    }
  }, [combinedGridAndCohortsSummary, dispatch])

  useEffect(() => {
    const loadGridDetailsAsync = async () => {
      if (activeGrid && activeGrid._id) {
        setIsGridLoading(true)
        try {
          await dispatch(loadGridDetails(activeGrid._id))
        } catch (error) {
          console.error(error)
          dispatch(updateMainAlert({
            message: 'Failed to load grid details',
            show: true,
            severity: 'error'
          }))
        } finally {
          setIsGridLoading(false)
        }
      }
    }
    loadGridDetailsAsync()
  }, [activeGrid, dispatch])

  useEffect(() => {
    const loadCohortDetailsAsync = async () => {
      if (activeCohort && activeCohort._id) {
        setIsCohortLoading(true)
        try {
          await dispatch(loadCohortDetails(activeCohort._id))
        } catch (error) {
          console.error(error)
          dispatch(updateMainAlert({
            message: 'Failed to load cohort details',
            show: true,
            severity: 'error'
          }))
        } finally {
          setIsCohortLoading(false)
        }
      }
    }
    loadCohortDetailsAsync()
  }, [activeCohort, dispatch])

  const handleSwitchAirqloudTypeClick = () => {
    setIsCohort(!isCohort)
  }

  const handleRefreshGrid = async () => {
    setIsGridLoading(true)
    try {
      const res = await refreshGridApi(activeGrid._id)
      await dispatch(loadGridDetails(activeGrid._id))
      dispatch(updateMainAlert({
        show: true,
        message: res.message,
        severity: 'success'
      }))
    } catch (error: any) {
      const errors = error.response?.data?.errors
      dispatch(updateMainAlert({
        show: true,
        message: error.response?.data?.message || 'Failed to refresh grid',
        severity: 'error',
        extra: createAlertBarExtraContentFromObject(errors || {})
      }))
    } finally {
      setIsGridLoading(false)
    }
  }

  const exportData = (data: string, fileName: string, type: string) => {
    try {
      const blob = new Blob([data], { type })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      dispatch(updateMainAlert({
        message: 'Error exporting data',
        show: true,
        severity: 'error'
      }))
    }
  }

  const downloadDataFunc = async (body: any) => {
    try {
      const response = await downloadDataApi(body)
      const resData = response.data
      const filename = `${isCohort ? 'cohort' : 'grid'}_data.csv`
      const csvData = Papa.unparse(resData)
      exportData(csvData, filename, 'text/csv;charset=utf-8;')
      dispatch(updateMainAlert({
        message: 'Air quality data download successful',
        show: true,
        severity: 'success'
      }))
    } catch (err: any) {
      if (err.response?.data?.status === 'success') {
        dispatch(updateMainAlert({
          message: 'Uh-oh! No data found',
          show: true,
          severity: 'success'
        }))
      } else {
        dispatch(updateMainAlert({
          message: err.response?.data?.message || 'Failed to download data',
          show: true,
          severity: 'error'
        }))
      }
    } finally {
      setDownloadingData(false)
    }
  }

  const submitExportData = async () => {
    setDownloadingData(true)
    const exportData = isCohort
      ? activeCohortDetails.devices?.map(device => device._id)
      : activeGridDetails.sites?.map(site => site._id)

    if (isEmpty(exportData)) {
      dispatch(updateMainAlert({
        message: `No ${isCohort ? 'devices' : 'sites'} found`,
        show: true,
        severity: 'error'
      }))
      setDownloadingData(false)
      return
    }

    const body = {
      sites: !isCohort ? exportData : [],
      devices: isCohort ? exportData : [],
      startDateTime: roundToStartOfDay(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()),
      endDateTime: roundToEndOfDay(new Date().toISOString()),
      frequency: 'hourly',
      pollutants: ['pm2_5', 'pm10'],
      downloadType: isCohort ? 'csv' : 'json',
      outputFormat: 'airqo-standard'
    }

    try {
      await downloadDataFunc(body)
    } catch (error) {
      console.error(error)
    } finally {
      setDownloadingData(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-6 lg:p-8">
        {/* <AnalyticsBreadCrumb isCohort={isCohort} /> */}
        {combinedGridAndCohortsSummary && (
          <div className="flex flex-col md:flex-row justify-between items-center w-full relative mb-6">
            <div className="flex justify-between gap-4 w-full max-w-md mb-4 md:mb-0">
              <AnalyticsAirqloudsDropDown
                isCohort={isCohort}
                airqloudsData={isCohort ? combinedGridAndCohortsSummary.cohorts : combinedGridAndCohortsSummary.grids}
              />
              {!isCohort && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleRefreshGrid} disabled={isGridLoading}>
                      Refresh Grid
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={submitExportData}
                disabled={downloadingData || isGridLoading || isCohortLoading || isSummaryLoading}
              >
                Download data
              </Button>
              <Button onClick={handleSwitchAirqloudTypeClick}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Switch to {isCohort ? 'Grid View' : 'Cohort View'}
              </Button>
            </div>
          </div>
        )}

        {!isCohort && !isEmpty(activeGrid) && activeGrid.name !== 'Empty' && (
          <GridsDashboardView
            grid={activeGrid}
            gridDetails={activeGridDetails}
            loading={isGridLoading}
          />
        )}

        {isCohort && !isEmpty(activeCohort) && activeCohort.name !== 'Empty' && (
          <CohortsDashboardView
            cohort={activeCohort}
            cohortDetails={activeCohortDetails}
            loading={isCohortLoading}
          />
        )}

        {isSummaryLoading || isGridLoading || isCohortLoading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : combinedGridAndCohortsSummary &&
          combinedGridAndCohortsSummary.grids &&
          combinedGridAndCohortsSummary.cohorts ? (
          (combinedGridAndCohortsSummary.grids.length === 0 ||
            combinedGridAndCohortsSummary.cohorts.length === 0) && (
            <div className="flex justify-center items-center h-[60vh]">
              <p className="text-2xl text-gray-500">
                {!isCohort && combinedGridAndCohortsSummary.grids.length === 0
                  ? 'No grids yet'
                  : 'No cohorts yet'}
              </p>
            </div>
          )
        ) : (
          <div className="flex justify-center items-center h-[60vh]">
            <p className="text-2xl text-gray-500">No data found</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default Analytics

