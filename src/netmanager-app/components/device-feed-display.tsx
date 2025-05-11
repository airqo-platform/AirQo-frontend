"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface DeviceFeedDisplayProps {
  deviceId: string
  deviceNumber?: string
  fetchRawFeed: (deviceId: string) => Promise<any>
  fetchTransformedFeed: (channelId: string) => Promise<any>
}

export function DeviceFeedDisplay({
  deviceId,
  deviceNumber,
  fetchRawFeed,
  fetchTransformedFeed,
}: DeviceFeedDisplayProps) {
  const [rawFeed, setRawFeed] = useState<any>(null)
  const [transformedFeed, setTransformedFeed] = useState<any>(null)
  const [isLoadingRaw, setIsLoadingRaw] = useState(false)
  const [isLoadingTransformed, setIsLoadingTransformed] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadRawFeed = async () => {
    if (!deviceId) return

    setIsLoadingRaw(true)
    try {
      const data = await fetchRawFeed(deviceId)
      setRawFeed(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching raw feed:", error)
      toast.error("Failed to fetch raw device data")
    } finally {
      setIsLoadingRaw(false)
    }
  }

  const loadTransformedFeed = async () => {
    if (!deviceNumber) {
      console.warn("Device number (channel ID) not available")
      return
    }

    setIsLoadingTransformed(true)
    try {
      const data = await fetchTransformedFeed(deviceNumber)
      setTransformedFeed(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching transformed feed:", error)
      toast.error("Failed to fetch transformed device data")
    } finally {
      setIsLoadingTransformed(false)
    }
  }

  const refreshData = () => {
    loadRawFeed()
    if (deviceNumber) {
      loadTransformedFeed()
    }
  }

  useEffect(() => {
    loadRawFeed()
    if (deviceNumber) {
      loadTransformedFeed()
    }
  }, [deviceId, deviceNumber])

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch (e) {
      return timestamp
    }
  }

  const renderDataItem = (key: string, value: any) => {
    // Skip rendering these keys in a special way
    if (key === "isCache" || key === "created_at" || key === "entry_id") {
      return null
    }

    // Format the value based on the key
    let formattedValue = value
    let label = key

    // Map field names to more readable labels based on device type
    if (key === "field1") label = "PM2.5 (μg/m³)"
    if (key === "field2") label = "PM10 (μg/m³)"
    if (key === "field3") label = "Sensor 2 PM2.5 (μg/m³)"
    if (key === "field4") label = "Sensor 2 PM10 (μg/m³)"
    if (key === "field5") label = "Latitude"
    if (key === "field6") label = "Longitude"
    if (key === "field7") label = "Battery Voltage"
    if (key === "field8") label = "Extra Data"

    // For transformed feed, use the key directly as it's already descriptive
    if (key === "pm2_5") label = "PM2.5 (μg/m³)"
    if (key === "pm10") label = "PM10 (μg/m³)"
    if (key === "s2_pm2_5") label = "Sensor 2 PM2.5 (μg/m³)"
    if (key === "s2_pm10") label = "Sensor 2 PM10 (��g/m³)"
    if (key === "battery") label = "Battery Voltage"
    if (key === "latitude") label = "Latitude"
    if (key === "longitude") label = "Longitude"

    // Truncate long values (like field8)
    if (typeof formattedValue === "string" && formattedValue.length > 50) {
      formattedValue = formattedValue.substring(0, 50) + "..."
    }

    return (
      <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold">{formattedValue}</span>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Device Feed</CardTitle>
            <CardDescription>
              Latest data from ThingSpeak
              {lastUpdated && <span className="ml-2 text-xs">(Last updated: {lastUpdated.toLocaleTimeString()})</span>}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoadingRaw || isLoadingTransformed}>
            {isLoadingRaw || isLoadingTransformed ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transformed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transformed">Transformed Data</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="transformed">
            {isLoadingTransformed ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transformedFeed ? (
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {transformedFeed.isCache ? "Cached" : "Live"}
                  </Badge>
                  <span className="text-sm font-medium">{formatTimestamp(transformedFeed.created_at)}</span>
                </div>
                <Separator className="my-2" />
                {Object.entries(transformedFeed).map(([key, value]) => renderDataItem(key, value))}
              </div>
            ) : deviceNumber ? (
              <div className="py-8 text-center text-muted-foreground">No transformed data available</div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Device number not available. Cannot fetch transformed data.
              </div>
            )}
          </TabsContent>

          <TabsContent value="raw">
            {isLoadingRaw ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : rawFeed ? (
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {rawFeed.isCache ? "Cached" : "Live"}
                  </Badge>
                  <span className="text-sm font-medium">Entry ID: {rawFeed.entry_id}</span>
                </div>
                <div className="text-sm font-medium text-center">{formatTimestamp(rawFeed.created_at)}</div>
                <Separator className="my-2" />
                {Object.entries(rawFeed).map(([key, value]) => renderDataItem(key, value))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">No raw data available</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
