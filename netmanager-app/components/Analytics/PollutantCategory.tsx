'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Site {
  label: string
  pm2_5: number
}


interface PollutantCategoryProps {
  pm25level: string
  iconClass: string
  sites?: Site[]
  devices?: Site[]
}

export function PollutantCategory({ pm25level, iconClass, sites, devices }: PollutantCategoryProps) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const toggleShow = () => setShow(!show)

  const sortedData = [...(sites || devices || [])].sort((a, b) => b.pm2_5 - a.pm2_5)

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (show && ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false)
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => document.removeEventListener('mousedown', checkIfClickedOutside)
  }, [show])

  

  return (
    <div className="relative w-full" ref={ref}>
      <Card 
        className="cursor-pointer transition-all hover:shadow-md w-full" 
        onClick={toggleShow}
      >
        <CardContent className="flex justify-between items-center p-4">
          <div className="max-w-[60%]">
            <h3 className="text-sm font-semibold text-gray-500 line-clamp-2">{pm25level}</h3>
          </div>
          <Avatar className={cn("h-12 w-12 bg", iconClass)}
            style={{ backgroundColor: getPm25LevelHexColor(pm25level) }}
          >
            <AvatarFallback>{sortedData.length}</AvatarFallback>
          </Avatar>
        </CardContent>
      </Card>
      {show && (
        <ul className="absolute z-10 w-full mt-2 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {sortedData.length === 0 ? (
            <li className="p-2 text-gray-500">No data</li>
          ) : (
            sortedData.map((data, index) => (
              <li key={index} className="p-2 hover:bg-gray-100">
                {data.label} - <span className={`font-semibold text-${getPm25LevelColor(pm25level)}`}>
                  {data.pm2_5 && !isNaN(data.pm2_5) ? data.pm2_5.toFixed(2) : 'N/A'}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
      {/* <ChevronDown className={cn("absolute right-4 top-1/2 transform -translate-y-1/2 transition-transform", show && "rotate-180")} /> */}
    </div>
  )
}

function getPm25LevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'good': return 'green-500'
    case 'moderate': return 'yellow-500'
    case 'unhealthy for sensitive groups': return 'orange-500'
    case 'unhealthy': return 'red-500'
    case 'very unhealthy': return 'purple-500'
    case 'hazardous': return 'rose-900'
    default: return 'gray-500'
  }
}

function getPm25LevelHexColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'good': return '#10B981'; // green-500
    case 'moderate': return '#FBBF24'; // yellow-500
    case 'unhealthy for sensitive groups': return '#F97316'; // orange-500
    case 'unhealthy': return '#EF4444'; // red-500
    case 'very unhealthy': return '#8B5CF6'; // purple-500
    case 'hazardous': return '#9B1C31'; // rose-900
    default: return '#6B7280'; // gray-500
  }
}

