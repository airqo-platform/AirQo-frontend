'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isEmpty } from 'lodash'

import { Card, CardContent } from "@/components/ui/card"

import ErrorBoundary from '@/components/ErrorBoundary'
import { useUserDefaultGraphsData } from '@/redux/Dashboard/selectors'
import { loadUserDefaultGraphData } from '@/redux/Dashboard/operations'
import D3CustomisableChart from '@/components/d3/CustomisableChart'
import { loadMapEventsData } from '@/redux/MapData/operations'
import { useEventsMapData } from '@/redux/MapData/selectors'
import { PM_25_CATEGORY } from '@/utils/categories'
import { formatString } from '@/utils/stringUtils'
import ExceedancesChart from './ExceedancesChart'
import PollutantCategory from './PollutantCategory'
import AveragesChart from './AveragesChart'
import AddChart from './AddChart'

interface GridInfo {
  name: string
  admin_level: string
  numberOfSites: number
  visibility: string
  sites: any[]
}

interface PM25SiteCount {
  Good: any[]
  Moderate: any[]
  UHFSG: any[]
  Unhealthy: any[]
  VeryUnhealthy: any[]
  Hazardous: any[]
}

interface GridsDashboardViewProps {
  grid: any
  gridDetails: any
  loading: boolean
}

const GridsDashboardView: React.FC<GridsDashboardViewProps> = ({ grid, gridDetails, loading }) => {
  const dispatch = useDispatch()
  const userDefaultGraphs = useUserDefaultGraphsData()

  const [gridInfo, setGridInfo] = useState<GridInfo>({
    name: 'N/A',
    admin_level: 'N/A',
    numberOfSites: 0,
    visibility: 'N/A',
    sites: []
  })

  const [pm2_5SiteCount, setPm2_5SiteCount] = useState<PM25SiteCount>({
    Good: [],
    Moderate: [],
    UHFSG: [],
    Unhealthy: [],
    VeryUnhealthy: [],
    Hazardous: []
  })

  const recentEventsData = useEventsMapData()

  useEffect(() => {
    dispatch(loadMapEventsData())
  }, [dispatch])

  useEffect(() => {
    const initialCount: PM25SiteCount = {
      Good: [],
      Moderate: [],
      UHFSG: [],
      Unhealthy: [],
      VeryUnhealthy: [],
      Hazardous: []
    }

    if (gridInfo.sites.length > 0) {
      const gridSites = gridInfo.sites.reduce((acc, curr) => {
        acc[curr._id] = curr
        return acc
      }, {} as Record<string, any>)

      recentEventsData.features?.forEach((feature) => {
        const siteId = feature.properties.site_id
        const site = gridSites[siteId]

        if (site) {
          const pm2_5 = feature.properties.pm2_5.value

          Object.entries(PM_25_CATEGORY).forEach(([key, [min, max]]) => {
            if (pm2_5 > min && pm2_5 <= max) {
              initialCount[key as keyof PM25SiteCount].push({ ...site, pm2_5 })
            }
          })
        }
      })
    }

    setPm2_5SiteCount(initialCount)
  }, [recentEventsData.features, gridInfo.sites])

  useEffect(() => {
    if (!isEmpty(gridDetails)) {
      setGridInfo({
        name: gridDetails.long_name,
        admin_level: gridDetails.admin_level,
        numberOfSites: gridDetails.numberOfSites,
        visibility: gridDetails.visibility,
        sites: gridDetails.sites
      })
    } else {
      setGridInfo({
        name: 'N/A',
        admin_level: 'N/A',
        numberOfSites: 0,
        visibility: 'N/A',
        sites: []
      })
    }
  }, [gridDetails])

  useEffect(() => {
    dispatch(loadUserDefaultGraphData(true, grid._id))
  }, [dispatch, grid])

  const dateValue = new Date().toLocaleDateString('en-GB')

  return (
    <ErrorBoundary>
      <div className="mt-10">
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Grid name</p>
              <h2 className="text-2xl font-bold capitalize">
                {loading ? '...' : formatString(grid.name || gridInfo.name)}
              </h2>
            </div>
            <div>
              <p className="text-sm text-gray-500">Admin level</p>
              <h2 className="text-2xl font-bold capitalize">
                {loading ? '...' : formatString(gridInfo.admin_level)}
              </h2>
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of sites</p>
              <h2 className="text-2xl font-bold">
                {loading ? '...' : grid.numberOfSites || gridInfo.numberOfSites}
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(pm2_5SiteCount).map(([level, sites]) => (
            <PollutantCategory
              key={level}
              pm25level={level}
              sites={sites}
              iconClass={`pm25${level.replace(/\s+/g, '')}`}
            />
          ))}
        </div>

        {gridInfo.sites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <AveragesChart analyticsSites={gridInfo.sites} isGrids={true} />

            <Card>
              <CardContent>
                <ExceedancesChart
                  date={dateValue}
                  idSuffix="exceedances"
                  analyticsSites={gridInfo.sites}
                  isGrids={true}
                />
              </CardContent>
            </Card>

            {userDefaultGraphs?.map((filter, key) => (
              <Card key={key}>
                <CardContent>
                  <D3CustomisableChart
                    defaultFilter={filter}
                    isGrids
                    analyticsSites={gridInfo.sites}
                  />
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent>
                <AddChart
                  isGrids
                  analyticsSites={gridInfo.sites}
                  grid={grid}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default GridsDashboardView

