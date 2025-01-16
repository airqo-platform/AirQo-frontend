"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react'
import { PollutantCategory } from './PollutantCategory'
import { LineCharts } from '../Charts/Line'
import { BarCharts } from '../Charts/Bar'
import { ExceedancesChart } from './ExceedeanceLine.tsx'
import { Cohort} from '@/app/types/cohorts'

interface CohortDashboardProps {
  loading: boolean
  cohortId: string | null
  cohorts: Cohort[]
}

const CohortDashboard: React.FC<CohortDashboardProps> = ({ loading, cohortId, cohorts }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  // const [chartTypePM, setChartTypePM] = useState<'line' | 'bar'>('bar')

  const categories = [
    { pm25level: "Good", iconClass: "bg-green-500" },
    { pm25level: "Moderate", iconClass: "bg-yellow-500" },
    { pm25level: "Unhealthy for Sensitive Groups", iconClass: "bg-orange-500" },
    { pm25level: "Unhealthy", iconClass: "bg-red-500" },
    { pm25level: "Very Unhealthy", iconClass: "bg-purple-500" },
    { pm25level: "Hazardous", iconClass: "bg-rose-900" }
  ]

   const activeCohort = useMemo(() => cohorts.find((cohort) => cohort._id === cohortId), [cohorts, cohortId]);
  

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
                  devices={activeCohort?.devices || []}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <Card className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mean Daily PM 2.5 Over the Past 28 Days
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChartType('line')}>
                  Line Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('bar')}>
                  Bar Chart
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            {chartType === 'line' ? <LineCharts /> : <BarCharts />}
          </CardContent>
        </Card>

        <ExceedancesChart
          analyticsSites={[]}
          analyticsDevices={activeCohort?.devices || []}
          isGrids={false}
          isCohorts={true}
        />
      </div>
    </div>
  )
}

export default CohortDashboard

