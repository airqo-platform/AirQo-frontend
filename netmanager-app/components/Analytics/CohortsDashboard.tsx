import React from 'react'
import { PollutantCategory } from './PollutantCategory'
interface Site {
  label: string
  pm2_5: number
}

const  CohortDashboard = () => {
  const categories = [
    { pm25level: "Good", iconClass: "bg-green-500" },
    { pm25level: "Moderate", iconClass: "bg-yellow-500" },
    { pm25level: "Unhealthy for Sensitive Groups", iconClass: "bg-orange-500" },
    { pm25level: "Unhealthy", iconClass: "bg-red-500" },
    { pm25level: "Very Unhealthy", iconClass: "bg-purple-500" },
    { pm25level: "Hazardous", iconClass: "bg-rose-900" }
  ]

  const testData: Site[] = [
    { label: "Downtown", pm2_5: 12.4 }, 
    { label: "Suburban Area", pm2_5: 35.0 },
    { label: "Industrial Zone", pm2_5: 55.5 },
    { label: "City Center", pm2_5: 110.0 },
    { label: "Highway", pm2_5: 175.0 },
    { label: "Coal Plant", pm2_5: 250.0 },
  ]
  return (
    <div>
      <div className="flex flex-col items-center justify-center p-4">
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
    </div>
  )
}

export default CohortDashboard
