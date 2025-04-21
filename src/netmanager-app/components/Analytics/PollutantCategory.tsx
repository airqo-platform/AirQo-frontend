"use client"

import { useState, useRef, useEffect } from "react"
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

  const compare = (a: Site, b: Site): number => {
    if (a.pm2_5 < b.pm2_5) return 1
    if (a.pm2_5 > b.pm2_5) return -1
    return 0
  }

  const toggleShow = () => setShow(!show)

  let sortedData: Site[] = []
  if (sites) {
    sortedData = sites.sort(compare)
  } else if (devices) {
    sortedData = devices.sort(compare)
  }

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (show && ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false)
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)
    return () => document.removeEventListener("mousedown", checkIfClickedOutside)
  }, [show])

  return (
    <div className="relative" ref={ref}>
      <Card className="cursor-pointer transition-all hover:shadow-md w-full" onClick={toggleShow}>
        <CardContent className="p-3">
          <div className="flex justify-between items-center">
            <div className="max-w-[60%]">
              <p className="text-xs font-bold text-gray-500 truncate">{pm25level}</p>
            </div>
            <Avatar className={cn("h-10 w-10", iconClass)} style={{ backgroundColor: getPm25LevelHexColor(pm25level) }}>
              <AvatarFallback className="text-sm">{sortedData.length}</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
      {show && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {sortedData.length === 0 ? (
            <li className="p-2 text-gray-500">no data</li>
          ) : (
            sortedData.map((data, index) => (
              <li key={index} className="p-2 hover:bg-gray-100">
                {data.label} -{" "}
                <span className={`font-semibold text-${getPm25LevelColor(pm25level)}`}>
                  {data.pm2_5 && !isNaN(data.pm2_5) ? data.pm2_5.toFixed(2) : "N/A"}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

const PM25_LEVEL_COLORS = {
  good: { class: "green-500", hex: "#10B981" },
  moderate: { class: "yellow-500", hex: "#FBBF24" },
  uhfsg: { class: "orange-500", hex: "#F97316" },
  unhealthy: { class: "red-500", hex: "#EF4444" },
  veryunhealthy: { class: "purple-500", hex: "#8B5CF6" },
  hazardous: { class: "rose-900", hex: "#9B1C31" },
  default: { class: "gray-500", hex: "#6B7280" },
} as const

function getPm25LevelColors(level: string) {
  const key = level.toLowerCase().replace(/\s+/g, "") as keyof typeof PM25_LEVEL_COLORS
  return PM25_LEVEL_COLORS[key] || PM25_LEVEL_COLORS.default
}

function getPm25LevelColor(level: string): string {
  return getPm25LevelColors(level).class
}

function getPm25LevelHexColor(level: string): string {
  return getPm25LevelColors(level).hex
}
