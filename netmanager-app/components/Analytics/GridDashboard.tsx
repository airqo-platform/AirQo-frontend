import React, { useState } from 'react';
import { PollutantCategory } from './PollutantCategory';
import { LineCharts } from '../Charts/Line';
import { BarCharts } from '../Charts/Bar';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface Site {
  label: string;
  pm2_5: number;
}

interface GridDashboardProps {
  loading: boolean;
}

const GridDashboard = ({loading}:GridDashboardProps) => {
  const categories = [
    { pm25level: "Good", iconClass: "bg-green-500" },
    { pm25level: "Moderate", iconClass: "bg-yellow-500" },
    { pm25level: "Unhealthy for Sensitive Groups", iconClass: "bg-orange-500" },
    { pm25level: "Unhealthy", iconClass: "bg-red-500" },
    { pm25level: "Very Unhealthy", iconClass: "bg-purple-500" },
    { pm25level: "Hazardous", iconClass: "bg-rose-900" }
  ];

  const testData: Site[] = [
    { label: "Downtown", pm2_5: 12.4 },
    { label: "Suburban Area", pm2_5: 35.0 },
    { label: "Industrial Zone", pm2_5: 55.5 },
    { label: "City Center", pm2_5: 110.0 },
    { label: "Highway", pm2_5: 175.0 },
    { label: "Coal Plant", pm2_5: 250.0 },
  ];

  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [chartTypePM, setChartTypePm] = useState<'line' | 'bar'>('line');

  return (
    <div className='p-4'>
      {/* Header Section */}
      <div >
        <div className="mb-5 grid grid-cols-1  gap-6 sm:grid-cols-3">
          <div className="p-4 border text-center rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Grid Name</h3>
            <p className="text-2xl font-bold capitalize">
              {loading ? '...' : 'Grid Name'}
            </p>
          </div>
          <div className="p-4 border text-center rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Admin Level</h3>
            <p className="text-2xl font-bold capitalize">
              {loading ? '...' : 'Grid Admin Level' }
            </p>
          </div>
          <div className="p-4 border text-center rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Number of Sites</h3>
            <p className="text-2xl font-bold">
              {loading ? '...' : '10'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl">
          <div className="flex flex-wrap justify-between gap-4">
            {categories.map((category, index) => (
              <div key={index} className="flex-1 min-w-[100px] max-w-[150px]">
                <PollutantCategory
                  pm25level={category.pm25level}
                  iconClass={category.iconClass}
                  sites={testData}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <Card className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h4>Mean Daily PM 2.5 Over the Past 28 Days</h4>
              
              {/* Dropdown toggle button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setChartType('line')}>
                    Line
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChartType('bar')}>
                    Bar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {chartType === 'line' ? <LineCharts /> : <BarCharts />}
          </CardContent>
        </Card>
        <Card className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h5>PM 2.5 Exceedances Over the Past 28 Days Based on AQI</h5>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='p-2'>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setChartTypePm('line')}>
                    Line
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChartTypePm('bar')}>
                    Bar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {chartTypePM === 'line' ? <LineCharts /> : <BarCharts />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GridDashboard;
