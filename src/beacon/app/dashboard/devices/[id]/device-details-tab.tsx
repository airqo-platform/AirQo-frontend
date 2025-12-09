"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Settings,
  Activity,
  Network,
  Copy,
  Check,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

// Dynamically import the map component with no SSR
const DeviceMap = dynamic(
  () => import("../device-map").catch((error) => {
    console.error('Failed to load DeviceMap:', error)
    return {
      default: () => (
        <div className="h-[500px] w-full flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 text-sm">Map failed to load</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }
  }),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    ),
  }
)

interface DeviceDetailsTabProps {
  device: any
  copiedKey: string | null
  copyToClipboard: (text: string, keyType: string) => void
  setUpdateDialogOpen: (open: boolean) => void
}

export default function DeviceDetailsTab({
  device,
  copiedKey,
  copyToClipboard,
  setUpdateDialogOpen,
}: DeviceDetailsTabProps) {
  const router = useRouter()
  const [showReadKey, setShowReadKey] = useState(false)
  const [showWriteKey, setShowWriteKey] = useState(false)

  // Check if firmware update is pending
  const isFirmwarePending = device.target_firmware && 
    device.current_firmware !== device.target_firmware

  // Create map device object
  const mapDevice = {
    id: device.device_id,
    name: device.device_name,
    status: device.is_online ? "active" : "offline",
    lat: device.location?.latitude || device.latitude || 0,
    lng: device.location?.longitude || device.longitude || 0,
    latest_reading: device.recent_reading ? {
      pm2_5: device.recent_reading.pm2_5,
      pm10: device.recent_reading.pm10,
      timestamp: device.recent_reading.timestamp,
      site_name: device.recent_reading.site_name,
    } : undefined,
    location: device.location,
  }
  
  const hasValidLocation = mapDevice.lat !== 0 && mapDevice.lng !== 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Details</CardTitle>
        <CardDescription>
          View comprehensive device information and location
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {hasValidLocation ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Map Section */}
            <div className="h-[calc(100vh-16rem)] w-full relative z-0 lg:col-span-1">
              <DeviceMap devices={[mapDevice]} selectedDeviceId={device.device_id} />
            </div>
            
            {/* Details Section */}
            <div className="p-6 bg-gray-50 h-[calc(100vh-16rem)] overflow-y-auto relative z-0 lg:col-span-2">
              <div className="space-y-6">
                {/* Device Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Network className="h-5 w-5 mr-2 text-blue-600" />
                      Device Information
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setUpdateDialogOpen(true)}
                      title="Edit Device Information"
                    >
                      <Edit className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
                    </Button>
                  </h3>
                  <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 flex items-center justify-between">
                          Network ID
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => setUpdateDialogOpen(true)}
                            title="Edit Network ID"
                          >
                            <Edit className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                          </Button>
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium font-mono text-sm">{device.network_id || 'N/A'}</p>
                          {device.network_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(device.network_id, 'Network ID')}
                            >
                              {copiedKey === 'Network ID' ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Channel ID</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{device.channel_id || 'N/A'}</p>
                          {device.channel_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(device.channel_id.toString(), 'Channel ID')}
                            >
                              {copiedKey === 'Channel ID' ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        {device.category ? (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-medium text-gray-800 hover:text-gray-600 text-sm"
                            onClick={() => router.push(`/dashboard/category?name=${encodeURIComponent(device.category!)}`)}
                          >
                            {device.category}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        ) : (
                          <p className="font-medium text-gray-400">Not set</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 flex items-center justify-between">
                          Firmware
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => setUpdateDialogOpen(true)}
                            title="Edit Firmware"
                          >
                            <Edit className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                          </Button>
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{device.current_firmware || 'N/A'}</p>
                          {isFirmwarePending && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                              Pending
                            </Badge>
                          )}
                        </div>
                        {isFirmwarePending && (
                          <p className="text-xs text-gray-500 mt-1">
                            Target: {device.target_firmware}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Read Key</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                            {device.read_key ? (showReadKey ? device.read_key : '••••••••••••••••') : 'N/A'}
                          </p>
                          {device.read_key && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setShowReadKey(!showReadKey)}
                                title={showReadKey ? "Hide" : "Show"}
                              >
                                {showReadKey ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(device.read_key, 'Read Key')}
                                title="Copy"
                              >
                                {copiedKey === 'Read Key' ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Write Key</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                            {device.write_key ? (showWriteKey ? device.write_key : '••••••••••••••••') : 'N/A'}
                          </p>
                          {device.write_key && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setShowWriteKey(!showWriteKey)}
                                title={showWriteKey ? "Hide" : "Show"}
                              >
                                {showWriteKey ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(device.write_key, 'Write Key')}
                                title="Copy"
                              >
                                {copiedKey === 'Write Key' ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Location Details
                  </h3>
                  <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Latitude</p>
                        <p className="font-medium">{mapDevice.lat.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Longitude</p>
                        <p className="font-medium">{mapDevice.lng.toFixed(6)}</p>
                      </div>
                    </div>
                    {device.recent_reading?.site_name && (
                      <div>
                        <p className="text-sm text-gray-500">Location Name</p>
                        <p className="font-medium">{device.recent_reading.site_name}</p>
                      </div>
                    )}
                    {device.location?.admin_level_country && (
                      <div>
                        <p className="text-sm text-gray-500">Country</p>
                        <p className="font-medium">{device.location.admin_level_country}</p>
                      </div>
                    )}
                    {device.location?.admin_level_city && (
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-medium">{device.location.admin_level_city}</p>
                      </div>
                    )}
                    {device.location?.admin_level_division && (
                      <div>
                        <p className="text-sm text-gray-500">Division</p>
                        <p className="font-medium">{device.location.admin_level_division}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Specifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                    Device Specifications
                  </h3>
                  <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
                    {device.height && (
                      <div>
                        <p className="text-sm text-gray-500">Height</p>
                        <p className="font-medium">{device.height} meters</p>
                      </div>
                    )}
                    {device.mount_type && (
                      <div>
                        <p className="text-sm text-gray-500">Mount Type</p>
                        <p className="font-medium capitalize">{device.mount_type}</p>
                      </div>
                    )}
                    {device.power_type && (
                      <div>
                        <p className="text-sm text-gray-500">Power Type</p>
                        <p className="font-medium capitalize">{device.power_type}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge
                        className={
                          device.is_online
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {device.is_online ? "ONLINE" : "OFFLINE"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Latest Readings */}
                {device.recent_reading && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-600" />
                      Latest Readings
                    </h3>
                    <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">PM2.5</p>
                          <p className="text-xl font-semibold">
                            {device.recent_reading.pm2_5 !== null && device.recent_reading.pm2_5 !== undefined
                              ? `${device.recent_reading.pm2_5.toFixed(1)} µg/m³`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">PM10</p>
                          <p className="text-xl font-semibold">
                            {device.recent_reading.pm10 !== null && device.recent_reading.pm10 !== undefined
                              ? `${device.recent_reading.pm10.toFixed(1)} µg/m³`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      {device.recent_reading.temperature !== undefined && device.recent_reading.temperature !== null && (
                        <div>
                          <p className="text-sm text-gray-500">Temperature</p>
                          <p className="font-medium">{device.recent_reading.temperature.toFixed(1)}°C</p>
                        </div>
                      )}
                      {device.recent_reading.humidity !== undefined && device.recent_reading.humidity !== null && (
                        <div>
                          <p className="text-sm text-gray-500">Humidity</p>
                          <p className="font-medium">{device.recent_reading.humidity.toFixed(1)}%</p>
                        </div>
                      )}
                      {device.recent_reading.timestamp && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-500">Last Reading</p>
                          <p className="font-medium text-sm">
                            {new Date(device.recent_reading.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <MapPin className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p>No location data available for this device.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
