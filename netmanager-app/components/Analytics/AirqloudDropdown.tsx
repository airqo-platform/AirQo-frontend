'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid } from '@/app/types/grids'
import { Cohort } from '@/app/types/cohorts'

interface AnalyticsAirqloudsDropDownProps {
  isCohort: boolean
  airqloudsData?: Cohort[] | Grid[]
  onSelect: (id: string) => void
  selectedId: string | null
}

export function AnalyticsAirqloudsDropDown({ 
  isCohort, 
  airqloudsData = [], 
  onSelect,
  selectedId
}: AnalyticsAirqloudsDropDownProps) {
  const [hoveredOption, setHoveredOption] = useState<Cohort | Grid | null>(null)

  const handleAirqloudChange = (value: string) => {
    const selectedAirqloud = airqloudsData.find((a) => a._id === value);
    if (selectedAirqloud) {
      const storageKey = isCohort ? "activeCohort" : "activeGrid";
      localStorage.setItem(storageKey, JSON.stringify(selectedAirqloud));
      onSelect(value);
    }
  };

  const formatString = (string: string) => {
    return string
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
      .replace('Id', 'ID')
  }

  return (
    <div className="relative w-full">
      {airqloudsData.length === 0 ? (
        <p className="text-gray-500">{isCohort ? 'No Cohorts' : 'No Grids'} data available</p>
      ) : (
        <Select onValueChange={handleAirqloudChange} value={selectedId || undefined}>
          <SelectTrigger className="w-full h-11 bg-white border-gray-200 text-blue-600 font-bold capitalize">
            <SelectValue placeholder={`Select a ${isCohort ? 'Cohort' : 'Grid'}`}>
              {selectedId && formatString(airqloudsData.find(a => a._id === selectedId)?.name || '')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {airqloudsData.map((airqloud) => (
              <SelectItem
                key={airqloud._id}
                value={airqloud._id}
                onMouseEnter={() => setHoveredOption(airqloud)}
                onMouseLeave={() => setHoveredOption(null)}
                className="cursor-pointer"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium">{formatString(airqloud.name)}</span>
                  <span className="text-sm text-gray-500">
                    {isCohort
                      ? 'devices' in airqloud
                        ? `${airqloud.devices?.length || 0} devices`
                        : ''
                      : 'sites' in airqloud ? `${airqloud.sites?.length || 0} sites` : ''}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hoveredOption && (
        <div className="absolute z-10 mt-2 p-2 bg-white border rounded-md shadow-lg max-w-xs">
          <h4 className="font-semibold mb-1">{isCohort ? 'Devices:' : 'Sites:'}</h4>
          <ul className="text-sm max-h-40 overflow-y-auto">
            {(isCohort && 'devices' in hoveredOption ? hoveredOption.devices : 'sites' in hoveredOption ? hoveredOption.sites : [])?.map((item, index) => (
              <li key={index} className="truncate">{JSON.stringify(item)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
