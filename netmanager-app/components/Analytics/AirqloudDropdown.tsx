'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Airqloud {
  _id: string
  name: string
  devices?: string[]
  sites?: string[]
}

interface AnalyticsAirqloudsDropDownProps {
  isCohort: boolean
  airqloudsData?: Airqloud[]
}

export function AnalyticsAirqloudsDropDown({ isCohort, airqloudsData = [] }: AnalyticsAirqloudsDropDownProps) {
  const [currentValue, setCurrentValue] = useState<Airqloud | null>(null)
  const [hoveredOption, setHoveredOption] = useState<Airqloud | null>(null)

  const handleAirQloudChange = (value: string) => {
    const selectedAirqloud = airqloudsData.find(airqloud => airqloud._id === value)
    if (selectedAirqloud) {
      setCurrentValue(selectedAirqloud)
      const storageKey = isCohort ? 'activeCohort' : 'activeGrid'
      localStorage.setItem(storageKey, JSON.stringify(selectedAirqloud))
    }
  }

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
        <p className="text-gray-500">No Airqlouds data available</p>
      ) : (
        <Select onValueChange={handleAirQloudChange} value={currentValue?._id}>
          <SelectTrigger className="w-full h-11 bg-white border-gray-200 text-blue-600 font-bold capitalize">
            <SelectValue placeholder="Select an Airqloud">
              {currentValue && formatString(currentValue.name)}
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
                      ? `${airqloud.devices?.length || 0} devices`
                      : `${airqloud.sites?.length || 0} sites`}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hoveredOption && (hoveredOption.sites || hoveredOption.devices) && (
        <div className="absolute z-10 mt-2 p-2 bg-white border rounded-md shadow-lg max-w-xs">
          <h4 className="font-semibold mb-1">{isCohort ? 'Devices:' : 'Sites:'}</h4>
          <ul className="text-sm">
            {(isCohort ? hoveredOption.devices : hoveredOption.sites)?.map((item, index) => (
              <li key={index} className="truncate">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
