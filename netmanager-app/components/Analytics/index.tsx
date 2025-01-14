'use client'

import React, { useState } from 'react'
import AnalyticsAirqloudsDropDown from './AnalyticsDropdown';
import { Button } from '../ui/button';
import GridDashboard from './GridDashboard';
import CohortDashboard from './CohortsDashboard';


const Analytics = () => {
  const [isCohort, setIsCohort] = useState(false);

  const handleSwitchGridsCohort = () => {
    setIsCohort(!isCohort);
  };

  return (
    <div>
      <div className="grid grid-cols-12 ">
        <div className='flex col-span-6    p-4'>
          <AnalyticsAirqloudsDropDown 
            isCohort={true} 
            airqloudsData={[
              { _id: "1", name: "Airqloud 1" },
              { _id: "2", name: "Airqloud 2" },
              { _id: "3", name: "Airqloud 3" },
            ]}
          />
        </div>
        <div className='flex col-span-6 justify-items-end ml-20  p-4'>
          <div className='flex flex-row gap-4'>
            <Button className='bg-blue-500 text-white w-[200px]'>Dowload Data</Button>
            <Button 
              className='bg-blue-500 text-white w-[200px]'
              onClick={handleSwitchGridsCohort}
            >
              Switch to {isCohort ? 'Grid View' : 'Cohort View'}
            </Button>
          </div>
        </div>
      </div>
      {!isCohort && (
        <GridDashboard />
      )}
      {isCohort && (
        <CohortDashboard />
      )}
    </div>
  )
}

export default Analytics

