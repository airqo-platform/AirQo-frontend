"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Activity,
  Network,
  Copy,
  Check,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Link2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { formatCategoryLabel } from "@/lib/utils"
import { DATA_SOURCE_META, resolveDeviceDataSource } from "@/lib/manufacturers"
import { ManufacturerBadge } from "@/components/devices/manufacturer-badge"
import { DataSourceIndicator } from "@/components/devices/data-source-indicator"
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

/** Small copy button used next to identifiers. */
function CopyButton({
  value,
  label,
  copiedKey,
  copyToClipboard,
}: Readonly<{ value: string; label: string; copiedKey: string | null; copyToClipboard: (text: string, keyType: string) => void }>) {
  return (
    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(value, label)} title={`Copy ${label}`}>
      {copiedKey === label ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
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

  // Only AirQo devices read from ThingSpeak; everything else is known by serial number + manufacturer API URL
  const dataSource = resolveDeviceDataSource(device)
  const isThingSpeak = dataSource === "thingspeak"
  const serialNumber: string | null = device.serial_number ?? device.beacon_data?.serial_number ?? null
  const connectionUrl: string | null = device.api_code ?? device.beacon_data?.api_code ?? null
  const authRequired: boolean | null = device.authRequired ?? device.beacon_data?.auth_required ?? null
  const network: string | null = device.network ?? device.beacon_data?.network_id ?? null
  const category: string | null = device.category ?? device.category_hierarchy?.[0]?.category ?? null

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
                    <p className="text-sm text-gray-500">Manufacturer</p>
                    <div className="mt-1">
                      <ManufacturerBadge network={network} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{formatCategoryLabel(category)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data Source</p>
                    <div className="mt-1">
                      <DataSourceIndicator dataSource={dataSource} />
                    </div>
                    {dataSource === "none" && (
                      <p className="text-xs text-gray-500 mt-1">{DATA_SOURCE_META.none.description}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Serial Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium font-mono text-sm break-all">{serialNumber || "N/A"}</p>
                      {serialNumber && (
                        <CopyButton value={serialNumber} label="Serial Number" copiedKey={copiedKey} copyToClipboard={copyToClipboard} />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center justify-between">
                      Network ID
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium font-mono text-sm">{device.network_id || 'N/A'}</p>
                      {device.network_id && (
                        <CopyButton value={device.network_id} label="Network ID" copiedKey={copiedKey} copyToClipboard={copyToClipboard} />
                      )}
                    </div>
                  </div>
                  {isThingSpeak && (
                    <div>
                      <p className="text-sm text-gray-500">Device Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{device.device_number || 'N/A'}</p>
                        {device.device_number && (
                          <CopyButton
                            value={device.device_number.toString()}
                            label="Device Number"
                            copiedKey={copiedKey}
                            copyToClipboard={copyToClipboard}
                          />
                        )}
                      </div>
                    </div>
                  )}
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

                {isThingSpeak ? (
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
                              <CopyButton value={device.readKey} label="Read Key" copiedKey={copiedKey} copyToClipboard={copyToClipboard} />
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
                              <CopyButton value={device.writeKey} label="Write Key" copiedKey={copiedKey} copyToClipboard={copyToClipboard} />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4 mt-2">
                    <p className="text-sm font-medium mb-3">Manufacturer Connection</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Connection URL</p>
                        <div className="flex items-center gap-2">
                          <p
                            className="font-medium font-mono text-xs bg-gray-50 px-2 py-1 rounded flex-1 truncate"
                            title={connectionUrl ?? undefined}
                          >
                            {connectionUrl || 'N/A'}
                          </p>
                          {connectionUrl && (
                            <>
                              <CopyButton value={connectionUrl} label="Connection URL" copiedKey={copiedKey} copyToClipboard={copyToClipboard} />
                              {/^https?:\/\//i.test(connectionUrl) && (
                                <Button asChild variant="ghost" size="sm" className="h-6 w-6 p-0" title="Open connection URL">
                                  <a href={connectionUrl} target="_blank" rel="noopener noreferrer">
                                    <Link2 className="h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Authentication Required</p>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          {authRequired == null ? (
                            <span className="text-gray-400">Unknown</span>
                          ) : authRequired ? (
                            <>
                              <ShieldCheck className="h-4 w-4 text-amber-600" />
                              <span>Yes, the manufacturer API needs the device credential</span>
                            </>
                          ) : (
                            <>
                              <ShieldOff className="h-4 w-4 text-gray-400" />
                              <span>No, the device is publicly readable</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                              {formatCategoryLabel(item.category)}
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
