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
interface DeviceMetadataEntry {
  entryID: any
  created_at: string
  [key: string]: any
}

interface DeviceConfigEntry {
  entryID: any
  created_at: string
  config_updated?: boolean
  [key: string]: any
}

interface DeviceDetail {
  device_id: string
  device_name: string
  device_key: number
  read_key: string | null
  write_key: string | null
  channel_id: number | null
  network_id: string | null
  network: string
  category: string | null
  current_firmware: string | null
  target_firmware: string | null
  previous_firmware: string | null
  file_upload_state: boolean | null
  firmware_download_state: string | null
  is_active: boolean
  is_online: boolean
  status: string
  mount_type?: string
  power_type?: string
  height?: number
  next_maintenance?: string
  first_seen: string
  last_updated: string
  created_at: string
  updated_at: string
  location?: {
    latitude: number
    longitude: number
    location_name?: string
    admin_level_country?: string
    admin_level_city?: string
    admin_level_division?: string
  }
  recent_reading?: {
    site_name?: string
    pm2_5: number
    pm10: number
    temperature?: number
    humidity?: number
    timestamp?: string
  }
  field_data: DeviceMetadataEntry[]
  config_data?: DeviceConfigEntry[]
  meta_data?: DeviceMetadataEntry[]
  field_names?: Record<string, string>
  config_names?: Record<string, string>
  metadata_names?: Record<string, string>
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
      
      const deviceId = params.id as string
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
      
      const data = await response.json()
      console.log("Device data received:", data)
      console.log("Site name:", data.site_name)
      console.log("Location:", data.location)
      setDevice(data)
    } catch (err: any) {
      console.error("Error fetching device data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }
  
  useEffect(() => {
    fetchDeviceData()
  }, [params.id])

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

      {/* Device Header with basic info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{device.device_name}</h1>
          <p className="text-gray-600 mt-1">Device ID: {device.device_id}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setUpdateDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Device
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Tabs for Device Information */}
      <Tabs defaultValue="device-details" className="mt-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-5">
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

        <TabsContent value="device-details" className="mt-4">
          <DeviceDetailsTab 
            device={device}
            copiedKey={copiedKey}
            copyToClipboard={copyToClipboard}
            setUpdateDialogOpen={setUpdateDialogOpen}
          />
        </TabsContent>

        {/* <TabsContent value="sensor-data" className="mt-4">
          <SensorDataTab deviceId={device.device_id} deviceName={device.device_name} />
        </TabsContent> */}

        <TabsContent value="metadata" className="mt-4">
          <MetadataTab deviceId={device.device_id} deviceName={device.device_name} />
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <ConfigTab 
            deviceId={device.device_id} 
            deviceName={device.device_name}
            channelId={device.channel_id || 0}
          />
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <PerformanceTab deviceId={device.device_id} deviceName={device.device_name} />
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
        device={device}
        onUpdateSuccess={handleRefresh}
      />
    </div>
  )
}