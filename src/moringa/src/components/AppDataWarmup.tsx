"use client"

import { useEffect } from "react"
import { prefetchMapAndReportData } from "@/services/apiService"

export default function AppDataWarmup() {
  useEffect(() => {
    void prefetchMapAndReportData()
  }, [])

  return null
}