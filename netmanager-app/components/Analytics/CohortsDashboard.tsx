'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { isEmpty } from 'lodash'

import { Card, CardContent } from "@/components/ui/card"

import ErrorBoundary from '@/components/ui/ErrorBoundory'

interface CohortInfo {
  name: string
  numberOfDevices: number
  devices: any[]
}

interface PM25DeviceCount {
  Good: any[]
  Moderate: any[]
  UHFSG: any[]
  Unhealthy: any[]
  VeryUnhealthy: any[]
  Hazardous: any[]
}

interface CohortsDashboardViewProps {
  cohort: any
  cohortDetails: any
  loading: boolean
}

const CohortsDashboardView: React.FC<CohortsDashboardViewProps> = ({ cohort, cohortDetails, loading }) => {
  const dispatch = useDispatch()
  const userDefaultGraphs = useUserDefaultGraphsData()

  const [cohortInfo, setCohortInfo] = useState<CohortInfo>({
    name: 'N/A',
    numberOfDevices: 0,
    devices: []
  })

  // const [pm2_5DeviceCount, setPm2_5DeviceCount] = useState<PM25DeviceCount>({
  //   Good: [],
  //   Moderate: [],
  //   UHFSG: [],
  //   Unhealthy: [],
  //   VeryUnhealthy: [],
  //   Hazardous: []
  // })

  // const recentEventsData = useEventsMapData()

  // useEffect(() => {
  //   if (isEmpty(recentEventsData.features)) {
  //     dispatch(loadMapEventsData())
  //   }
  // }, [dispatch, recentEventsData.features])

  // useEffect(() => {
  //   const initialCount: PM25DeviceCount = {
  //     Good: [],
  //     Moderate: [],
  //     UHFSG: [],
  //     Unhealthy: [],
  //     VeryUnhealthy: [],
  //     Hazardous: []
  //   }

  //   if (cohortInfo.devices.length > 0) {
  //     const cohortDevices = cohortInfo.devices.map(device => ({
  //       value: device._id,
  //       label: device.name
  //     }))
  //     const cohortDevicesObj = cohortDevices.reduce((acc, curr) => {
  //       acc[curr.value] = curr
  //       return acc
  //     }, {} as Record<string, { value: string; label: string }>)

  //     recentEventsData.features?.forEach((feature) => {
  //       const deviceId = feature.properties.device_id
  //       const device = cohortDevicesObj[deviceId]

  //       if (device) {
  //         const pm2_5 = feature.properties.pm2_5.value

  //         Object.entries(PM_25_CATEGORY).forEach(([key, [min, max]]) => {
  //           if (pm2_5 > min && pm2_5 <= max) {
  //             initialCount[key as keyof PM25DeviceCount].push({ ...device, pm2_5 })
  //           }
  //         })
  //       }
  //     })
  //   }

  //   setPm2_5DeviceCount(initialCount)
  // }, [recentEventsData.features, cohortInfo.devices])

  // useEffect(() => {
  //   if (!isEmpty(cohortDetails)) {
  //     setCohortInfo({
  //       name: cohortDetails.name,
  //       numberOfDevices: cohortDetails.numberOfDevices,
  //       devices: cohortDetails.devices
  //     })
  //   } else {
  //     setCohortInfo({
  //       name: 'N/A',
  //       numberOfDevices: 0,
  //       devices: []
  //     })
  //   }
  // }, [cohortDetails])

  // useEffect(() => {
  //   dispatch(loadUserDefaultGraphData(true, cohort._id))
  // }, [dispatch, cohort])

  // const dateValue = new Date().toLocaleDateString('en-GB')

  return (
    <ErrorBoundary>
      <div className="mt-10">
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Cohort name</p>
              {/* <h2 className="text-2xl font-bold capitalize">{formatString(cohort.name)}</h2> */}
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of devices</p>
              <h2 className="text-2xl font-bold">{cohort.numberOfDevices}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* {Object.entries(pm2_5DeviceCount).map(([level, devices]) => (
            <PollutantCategory
              key={level}
              pm25level={level}
              devices={devices}
              iconClass={`pm25${level.replace(/\s+/g, '')}`}
            />
          ))} */}
        </div>

        {cohortInfo.devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* <AveragesChart analyticsDevices={cohortInfo.devices} isCohorts /> */}

            <Card>
              <CardContent>
                {/* <ExceedancesChart
                  date={dateValue}
                  idSuffix="exceedances"
                  analyticsDevices={cohortInfo.devices}
                  isCohorts
                /> */}
              </CardContent>
            </Card>

            {/* {userDefaultGraphs?.map((filter, key) => (
              <Card key={key}>
                <CardContent>
                  <D3CustomisableChart
                    defaultFilter={filter}
                    isCohorts
                    analyticsDevices={cohortInfo.devices}
                  />
                </CardContent>
              </Card> */}
            {/* ))} */}

            {/* <Card>
              <CardContent>
                <AddChart
                  isCohorts
                  analyticsDevices={cohortInfo.devices}
                  cohort={cohort}
                />
              </CardContent>
            </Card> */}
          </div>
        ) : (
          <div className="flex justify-center items-center h-24">
            <p className="text-gray-500">No devices found</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default CohortsDashboardView

