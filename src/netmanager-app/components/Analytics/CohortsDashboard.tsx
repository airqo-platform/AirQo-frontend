"use client"

import React, { useState, useMemo, useEffect } from 'react'

import { PollutantCategory } from './PollutantCategory'

import { ExceedancesChart } from './ExceedanceLine'
import { Cohort } from '@/app/types/cohorts'
import { Device } from '@/app/types/devices'
import { AveragesChart } from "./averages-chart";

interface CohortDashboardProps {
  loading: boolean
  cohortId: string | null
  cohorts: Cohort[]
}

const CohortDashboard: React.FC<CohortDashboardProps> = ({ loading, cohortId, cohorts }) => {
  const [transformedDevices, setTransformedDevices] = useState<{ label: string; pm2_5: number }[]>([])
  const [analyticsDevices, setAnalyticsDevices] = useState<Device[]>([])

  const categories = [
    { pm25level: "Good", iconClass: "bg-green-500" },
    { pm25level: "Moderate", iconClass: "bg-yellow-500" },
    { pm25level: "Unhealthy for Sensitive Groups", iconClass: "bg-orange-500" },
    { pm25level: "Unhealthy", iconClass: "bg-red-500" },
    { pm25level: "Very Unhealthy", iconClass: "bg-purple-500" },
    { pm25level: "Hazardous", iconClass: "bg-rose-900" }
  ]

  const activeCohort = useMemo(() => cohorts.find((cohort) => cohort._id === cohortId), [cohorts, cohortId]);

  useEffect(() => {
    if (activeCohort?.devices) {
      const transformed = activeCohort.devices.map(device => ({
        label: device.long_name,
        pm2_5: 0
      }));
      setTransformedDevices(transformed);

      const analyticsDevices = activeCohort.devices.map(device => ({
        _id: device._id,
        isOnline: true,
        device_codes: [],
        status: 'active',
        category: 'default',
        isActive: true,
        description: '',
        name: device.name,
        network: device.network,
        long_name: device.long_name,
        createdAt: new Date().toISOString(),
        authRequired: device.authRequired,
        serial_number: device.serial_number,
        api_code: device.api_code,
        latitude: 0,
        longitude: 0,
        groups: device.groups,
        previous_sites: [],
        cohorts: [],
        grids: [],
        site: {
          _id: '',
          visibility: true,
          grids: [],
          isOnline: true,
          location_name: '',
          search_name: '',
          group: '',
          name: '',
          data_provider: '',
          site_category: {
            tags: [],
            area_name: '',
            category: '',
            highway: '',
            landuse: '',
            latitude: 0,
            longitude: 0,
            natural: '',
            search_radius: 0,
            waterway: ''
          },
          groups: []
        }
      }));
      setAnalyticsDevices(analyticsDevices);
    }
  }, [activeCohort]);

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="p-4 border text-center rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Cohort Name</h3>
            <p className="text-2xl font-bold capitalize">
            {loading ? '...' : activeCohort?.name || 'N/A'}
            </p>
          </div>
          <div className="p-4 border text-center rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Number of devices</h3>
            <p className="text-2xl font-bold capitalize">
            {loading ? '...' : activeCohort?.numberOfDevices || 'N/A'}
            </p>
          </div>

      </div>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-full max-w-7xl">
          <div className="flex flex-wrap justify-between gap-4">
            {categories.map((category, index) => (
              <div key={index} className="flex-1 min-w-[100px] max-w-[150px]">
                <PollutantCategory 
                  pm25level={category.pm25level} 
                  iconClass={category.iconClass} 
                  devices={transformedDevices}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <AveragesChart 
          isCohorts={false}
          isGrids={true}
          analyticsDevices={[]}
          analyticsSites={analyticsDevices}
        />
        <ExceedancesChart
          analyticsSites={[]}
          analyticsDevices={analyticsDevices}
          isGrids={false}
          isCohorts={true}
        />
      </div>
    </div>
  )
}

export default CohortDashboard

