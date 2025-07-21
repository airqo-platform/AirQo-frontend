"use client"

import { useState, useEffect } from "react"
import createAxiosInstance from "@/core/apis/axiosConfig"
import type { UserStatsResponse } from "@/app/types/userStats"

export function useUserStats() {
  const [data, setData] = useState<UserStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true)
        const axios = createAxiosInstance()
        const response = await axios.get("/users/stats")

        if (response.data.success) {
          setData(response.data)
        } else {
          throw new Error(response.data.message || "Failed to fetch user statistics")
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserStats()
  }, [])

  return { data, isLoading, error }
}
