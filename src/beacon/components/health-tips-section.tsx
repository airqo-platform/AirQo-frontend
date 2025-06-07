"use client"

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { config } from '@/lib/config'

export default function HealthTipsSection({ deviceId, readingKey, airQuality }) {
  const [healthTips, setHealthTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHealthTips = async () => {
      try {
        setLoading(true)
        setError(null)

        let endpoint
        if (readingKey) {
          endpoint = `${config.apiUrl}/health-tips/reading/${readingKey}`
        } else if (deviceId) {
          endpoint = `${config.apiUrl}/health-tips/device/${deviceId}`
        } else if (airQuality) {
          endpoint = `${config.apiUrl}/health-tips/category/${encodeURIComponent(airQuality)}`
        } else {
          setHealthTips([])
          setLoading(false)
          return
        }

        const response = await fetch(endpoint)

        if (!response.ok) {
          if (response.status === 404) {
            setHealthTips([])
            setLoading(false)
            return
          }
          throw new Error(`Failed to fetch health tips: ${response.status}`)
        }

        const data = await response.json()
        setHealthTips(data.tips || [])
      } catch (err) {
        console.error("Error fetching health tips:", err)
        setError(err.message)
        setHealthTips([
          {
            title: "For Everyone",
            description: "Check local air quality reports for the latest information.",
            category: "Unknown"
          },
          {
            title: "For sensitive groups",
            description: "If you experience symptoms, reduce outdoor activity.",
            category: "Unknown"
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchHealthTips()
  }, [deviceId, readingKey, airQuality])

  const getAlertStyle = () => {
    if (!airQuality) return "bg-blue-50 border-blue-200"
    switch (airQuality.toLowerCase()) {
      case "good": return "bg-green-50 border-green-200"
      case "moderate": return "bg-yellow-50 border-yellow-200"
      case "unhealthy for sensitive groups": return "bg-orange-50 border-orange-200"
      case "unhealthy": return "bg-red-50 border-red-200"
      case "very unhealthy": return "bg-purple-50 border-purple-200"
      case "hazardous": return "bg-red-900 border-red-700 text-white"
      default: return "bg-blue-50 border-blue-200"
    }
  }

  const renderTipBadge = (title) => {
    if (!title) return null
    const lowercase = title.toLowerCase()
    const bgColor =
      lowercase.includes("everyone") ? "bg-green-500" :
      lowercase.includes("children") ? "bg-blue-500" :
      lowercase.includes("elderly") ? "bg-purple-500" :
      lowercase.includes("pregnant") ? "bg-pink-500" :
      lowercase.includes("respiratory") ? "bg-orange-500" :
      lowercase.includes("heart") ? "bg-red-500" :
      lowercase.includes("active") ? "bg-cyan-500" :
      lowercase.includes("sensitive") ? "bg-yellow-500" :
      lowercase.includes("parents") ? "bg-indigo-500" :
      "bg-gray-500"

    return <Badge className={`${bgColor} text-white text-xs px-2 py-1 rounded-full`}>{title}</Badge>
  }

  if (loading) {
    return (
      <Alert className="bg-gray-50 border-gray-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Loading Health Tips</AlertTitle>
        <AlertDescription>
          Retrieving appropriate health recommendations based on air quality...
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Health Information</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li>Unable to load personalized health tips at this time.</li>
            <li>Please check back later for air quality recommendations.</li>
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  if (healthTips.length === 0) {
    return (
      <Alert className="bg-gray-50 border-gray-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Health Information</AlertTitle>
        <AlertDescription>
          <p className="mt-2 text-sm">No specific health tips available for current conditions.</p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className={`${getAlertStyle()} shadow-md`}>
      <Info className="h-4 w-4" />
      <AlertTitle>Air Quality Health Tips</AlertTitle>
      <AlertDescription>
        <div className="mt-4 grid gap-4">
          {healthTips.map((tip, index) => (
            <div
              key={tip.tip_id || index}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                {renderTipBadge(tip.title)}
              </div>
              <p className="text-sm text-gray-700">{tip.description}</p>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  )
}
