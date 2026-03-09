"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  Activity,
  Box,
  Settings,
  MapPin,
  FileText,
  Edit,
  ArrowLeft,
} from "lucide-react"
import { config } from "@/lib/config"
import authService from "@/services/api-service"
import { useToast } from "@/hooks/use-toast"
import UpdateDeviceDialog from "@/components/dashboard/update-device-dialog"
import SensorDataTab from "./sensor-data-tab"
import MetadataTab from "./metadata-tab"
import ConfigTab from "./config-tab"
import PerformanceTab from "./performance-tab"
import DeviceDetailsTab from "./device-details-tab"

// Define interfaces for the device data
interface DeviceDetail {
  _id: string
  name: string
  long_name: string
  device_number: number
  description?: string
  createdAt: string

  // Network & Identifiers
  network: string
  network_id: string | null
  device_codes: string[]

  // Keys
  readKey: string
  writeKey: string

  // Status & State
  isActive: boolean
  isOnline: boolean
  rawOnlineStatus: boolean
  status: string
  visibility: boolean
  mobility: boolean
  authRequired: boolean

  // Categories
  category: string
  category_hierarchy: Array<{
    level: string
    category: string
    description: string
  }>
  device_categories: {
    primary_category: string
    deployment_category: string
    is_mobile: boolean
    is_static: boolean
    is_lowcost: boolean
    all_categories: string[]
  }

  // Hardware/Physical
  height: number
  mountType: string
  powerType: string

  // Firmware
  beacon_data: {
    network_id: string | null
    current_firmware: string | null
    previous_firmware: string | null
    file_upload_state: boolean
    firmware_download_state: string | null
  }

  // Location
  latitude: number
  longitude: number
  approximate_distance_in_km: number
  bearing_in_radians: number
  site?: {
    _id: string
    name: string
    formatted_name: string
    location_name: string
    city?: string
    country?: string
    description?: string
  }

  // Dates
  deployment_date: string
  nextMaintenance: string
  lastActive: string
  lastRawData: string

  // Groups & Tags
  cohorts: Array<{ _id: string; name: string }>
  grids: Array<{ _id: string; name: string }>
  groups: any[]
  tags: any[]
}

export default function DeviceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [device, setDevice] = useState<DeviceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, keyType: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(keyType)
      toast({
        title: "Copied!",
        description: `${keyType} copied to clipboard`,
      })
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  // Fetch device data from API
  const fetchDeviceData = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      if (!params?.id) return

      const deviceId = params.id as string
      // Use consistent endpoint path as per user request
      const apiPath = config.isLocalhost ?
        `/devices/${deviceId}` :
        `/api/v1/beacon/devices/${deviceId}`

      const response = await fetch(`${config.apiUrl}${apiPath}`, {
        headers: {
          'Authorization': authService.getToken() || '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Device not found")
        }
        throw new Error(`API error: ${response.status}`)
      }

      const responseData = await response.json()
      console.log("Device data received:", responseData)

      if (responseData.success && responseData.data) {
        setDevice(responseData.data)
      } else if (responseData.name || responseData.device_id) {
        // Fallback or direct object return
        setDevice(responseData)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err: any) {
      console.error("Error fetching device data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (params?.id) {
      fetchDeviceData()
    }
  }, [params?.id])

  const handleRefresh = () => {
    fetchDeviceData()
    toast({
      title: "Refreshing device data",
      description: "Getting the latest information for this device.",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mb-2" />
          <p>Loading device information...</p>
        </div>
      </div>
    )
  }

  if (error || !device) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Devices
        </Button>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Device Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The device you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => router.push("/dashboard/devices")}>View All Devices</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        className="mb-2 pl-0 -ml-3"
        onClick={() => router.push('/dashboard/devices')}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to devices
      </Button>

      {/* Tabs for Device Information */}
      <Tabs defaultValue="device-details" className="mt-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="device-details" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Device Details
            </TabsTrigger>
            {/* <TabsTrigger value="sensor-data" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Sensor Data
          </TabsTrigger> */}
            <TabsTrigger value="metadata" className="flex items-center">
              <Box className="mr-2 h-4 w-4" />
              Metadata
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Config
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Files
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            onClick={() => setUpdateDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Device
          </Button>
        </div>

        <TabsContent value="device-details" className="mt-4">
          <DeviceDetailsTab
            device={device}
            copiedKey={copiedKey}
            copyToClipboard={copyToClipboard}
            setUpdateDialogOpen={setUpdateDialogOpen}
          />
        </TabsContent>

        {/* <TabsContent value="sensor-data" className="mt-4">
          <SensorDataTab deviceId={device.name} deviceName={device.long_name || device.name} />
        </TabsContent> */}

        <TabsContent value="metadata" className="mt-4">
          <MetadataTab deviceId={device.name} deviceName={device.long_name || device.name} />
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <ConfigTab
            deviceId={device.name}
            deviceName={device.long_name || device.name}
            channelId={device.device_number || 0}
          />
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <PerformanceTab deviceId={device.name} deviceName={device.long_name || device.name} />
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Files</CardTitle>
              <CardDescription>
                View and manage files associated with this device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>No files available for this device.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Device Dialog */}
      <UpdateDeviceDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        device={device ? {
          device_id: device.name,
          device_name: device.long_name || device.name,
          network_id: device.network_id || device.beacon_data?.network_id,
          current_firmware: device.beacon_data?.current_firmware,
          firmware_download_state: device.beacon_data?.firmware_download_state
        } : null}
        onUpdateSuccess={handleRefresh}
      />
    </div>
  )
}