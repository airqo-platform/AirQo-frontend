"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const DeviceMap = dynamic(() => import("../device-map"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg" />,
})

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
  const currentFirmware = device.beacon_data?.current_firmware || null
  const targetFirmware = device.target_firmware
  const isFirmwarePending = targetFirmware && currentFirmware !== targetFirmware

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Device Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Network className="h-5 w-5 mr-2 text-blue-600" />
                  Device Info
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
              <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Device Name</p>
                    <p className="font-medium">{device.long_name || device.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{device.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center justify-between">
                      Network ID
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
                    <p className="text-sm text-gray-500">Device Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{device.device_number || 'N/A'}</p>
                      {device.device_number && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(device.device_number.toString(), 'Device Number')}
                        >
                          {copiedKey === 'Device Number' ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      Firmware
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{currentFirmware || 'N/A'}</p>
                      {isFirmwarePending && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          Pending
                        </Badge>
                      )}
                    </div>
                    {isFirmwarePending && (
                      <p className="text-xs text-gray-500 mt-1">
                        Target: {targetFirmware}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-medium mb-3">API Keys</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Read Key</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium font-mono text-xs bg-gray-50 px-2 py-1 rounded flex-1 truncate">
                          {device.readKey ? (showReadKey ? device.readKey : '••••••••••••••••') : 'N/A'}
                        </p>
                        {device.readKey && (
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
                              onClick={() => copyToClipboard(device.readKey, 'Read Key')}
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
                      <p className="text-xs text-gray-500 mb-1">Write Key</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium font-mono text-xs bg-gray-50 px-2 py-1 rounded flex-1 truncate">
                          {device.writeKey ? (showWriteKey ? device.writeKey : '••••••••••••••••') : 'N/A'}
                        </p>
                        {device.writeKey && (
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
                              onClick={() => copyToClipboard(device.writeKey, 'Write Key')}
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
            </div>
          </div>

          {/* Column 2: Location Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Location
              </h3>
              <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Latitude</p>
                    <p className="font-medium">{device.latitude != null ? device.latitude.toFixed(6) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Longitude</p>
                    <p className="font-medium">{device.longitude != null ? device.longitude.toFixed(6) : '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location Name</p>
                  <p className="font-medium">{device.site?.formatted_name || device.site?.location_name || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{device.site?.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium">{device.site?.country || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <MapPin className="mr-2 h-4 w-4" />
                        View on Map
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Device Location</DialogTitle>
                      </DialogHeader>
                      <div className="h-full w-full min-h-[500px]">
                        <DeviceMap
                          devices={[
                            {
                              id: device.name,
                              name: device.long_name || device.name,
                              status: device.rawOnlineStatus ? "active" : "offline",
                              lat: device.latitude ?? 0,
                              lng: device.longitude ?? 0,
                              lastUpdate: device.lastRawData ? new Date(device.lastRawData).toLocaleString() : undefined,
                              location: {
                                location_name: device.site?.location_name,
                                admin_level_city: device.site?.city,
                                admin_level_country: device.site?.country
                              }
                            }
                          ]}
                          selectedDeviceId={device.name}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-medium mb-3">Specifications</p>
                  <div className="grid grid-cols-2 gap-4">
                    {device.height && (
                      <div>
                        <p className="text-sm text-gray-500">Height</p>
                        <p className="font-medium">{device.height}m</p>
                      </div>
                    )}
                    {device.mountType && (
                      <div>
                        <p className="text-sm text-gray-500">Mount</p>
                        <p className="font-medium capitalize">{device.mountType}</p>
                      </div>
                    )}
                    {device.powerType && (
                      <div>
                        <p className="text-sm text-gray-500">Power</p>
                        <p className="font-medium capitalize">{device.powerType}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: System & Status */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                System & Status
              </h3>
              <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge
                      className={
                        device.rawOnlineStatus
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }
                    >
                      {device.rawOnlineStatus ? "ONLINE" : "OFFLINE"}
                    </Badge>
                    {device.lastRawData && (
                      <span className="text-xs text-gray-500">
                        Last Active: {new Date(device.lastRawData).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {/* Category Hierarchy */}
                  {device.category_hierarchy && device.category_hierarchy.length > 0 && (
                    <div className="border-t pt-4 mt-2">
                      <p className="text-sm font-medium mb-3">Category Hierarchy</p>
                      <div className="grid grid-cols-2 gap-4">
                        {device.category_hierarchy.map((item: any, index: number) => (
                          <div key={index}>
                            <p className="text-xs text-gray-500 capitalize">{item.level}</p>
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-gray-800 hover:text-gray-600 text-sm"
                              onClick={() => router.push(`/dashboard/category/${encodeURIComponent(item.category)}`)}
                            >
                              {item.category}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cohorts */}
                  {device.cohorts && device.cohorts.length > 0 && (
                    <div className="border-t pt-4 mt-2">
                      <p className="text-sm font-medium mb-3">Cohorts</p>
                      <div className="flex flex-wrap gap-1 items-center">
                        {device.cohorts.map((cohort: any, index: number) => (
                          <span key={cohort._id} className="flex items-center">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-gray-800 hover:text-gray-600 text-sm"
                              onClick={() => router.push(`/dashboard/cohorts/${cohort._id}`)}
                            >
                              {cohort.name}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                            {index < device.cohorts.length - 1 && <span className="mr-2">,</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grids */}
                  {device.grids && device.grids.length > 0 && (
                    <div className="border-t pt-4 mt-2">
                      <p className="text-sm font-medium mb-3">Grids</p>
                      <div className="flex flex-wrap gap-1 items-center">
                        {device.grids.map((grid: any, index: number) => (
                          <span key={grid._id} className="flex items-center">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-gray-800 hover:text-gray-600 text-sm"
                              onClick={() => router.push(`/dashboard/grids/${grid._id}`)}
                            >
                              {grid.name}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                            {index < device.grids.length - 1 && <span className="mr-2">,</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
