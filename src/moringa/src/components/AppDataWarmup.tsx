"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { prefetchMapAndReportData } from "@/services/apiService"

export default function AppDataWarmup() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname === "/website-map-integration" || pathname === "/website-map-integration/") return
    void prefetchMapAndReportData()
  }, [pathname])

  return null
}
