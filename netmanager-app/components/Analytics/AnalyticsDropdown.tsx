'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnalyticsAirqloudsDropDownProps {
  isCohort: boolean
  airqloudsData: any[]
  onSetActiveGrid?: (grid: any) => void // Optional prop for setting active grid
  onSetActiveCohort?: (cohort: any) => void // Optional prop for setting active cohort
}

const AnalyticsAirqloudsDropDown: React.FC<AnalyticsAirqloudsDropDownProps> = ({ 
  isCohort, 
  airqloudsData, 
  onSetActiveGrid, 
  onSetActiveCohort 
}) => {
  const handleChange = (value: string) => {
    const selectedAirqloud = airqloudsData.find(airqloud => airqloud._id === value)
    if (selectedAirqloud) {
      if (isCohort && onSetActiveCohort) {
        onSetActiveCohort(selectedAirqloud) // Handle cohort selection
      } else if (onSetActiveGrid) {
        onSetActiveGrid(selectedAirqloud) // Handle grid selection
      }
    }
  }

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={`Select ${isCohort ? 'Cohort' : 'Grid'}`} />
      </SelectTrigger>
      <SelectContent>
        {airqloudsData.map((airqloud) => (
          <SelectItem key={airqloud._id} value={airqloud._id}>
            {airqloud.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default AnalyticsAirqloudsDropDown
