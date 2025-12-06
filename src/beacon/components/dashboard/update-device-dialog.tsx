"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { config } from "@/lib/config"

// Firmware version interface
export interface FirmwareVersion {
  id: string
  firmware_version: string
  firmware_type?: string | null
  created_at?: string
}

// Device interface - supports both UIDevice and DeviceDetail types
export interface UpdateableDevice {
  device_id: string
  device_name: string
  network_id?: string | null
  current_firmware?: string | null
  target_firmware?: string | null
  firmware_download_state?: string | null
}

interface UpdateDeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: UpdateableDevice | null
  onUpdateSuccess?: () => void
}

export default function UpdateDeviceDialog({
  open,
  onOpenChange,
  device,
  onUpdateSuccess,
}: UpdateDeviceDialogProps) {
  const { toast } = useToast()
  const [updateMode, setUpdateMode] = useState<"firmware" | "network">("firmware")
  const [selectedTargetFirmware, setSelectedTargetFirmware] = useState<string>("")
  const [networkIdInput, setNetworkIdInput] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [firmwareVersions, setFirmwareVersions] = useState<FirmwareVersion[]>([])
  const [loadingFirmware, setLoadingFirmware] = useState(false)

  // Fetch firmware versions when dialog opens
  useEffect(() => {
    if (open) {
      fetchFirmwareVersions()
      // Reset network ID input when opening
      if (device?.network_id) {
        setNetworkIdInput(device.network_id)
      }
    }
  }, [open, device])

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedTargetFirmware("")
      setNetworkIdInput("")
      setUpdateMode("firmware")
    }
  }, [open])

  // Fetch available firmware versions from API
  const fetchFirmwareVersions = async () => {
    try {
      setLoadingFirmware(true)
      const baseUrl = config.apiUrl
      const endpoint = config.isLocalhost ? "/firmware" : `${config.apiPrefix || "/api/v1"}/beacon/firmware`
      const url = `${baseUrl}${endpoint}`

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch firmware versions: ${response.status}`)
      }

      const data = await response.json()
      setFirmwareVersions(data || [])
    } catch (error) {
      console.error("Error fetching firmware versions:", error)
      toast({
        title: "Error",
        description: "Failed to load firmware versions",
        variant: "destructive",
      })
    } finally {
      setLoadingFirmware(false)
    }
  }

  // Get firmware type badge
  const getFirmwareTypeBadge = (type: string | null | undefined) => {
    switch (type?.toLowerCase()) {
      case "stable":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 ml-2">Stable</Badge>
      case "beta":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 ml-2">Beta</Badge>
      case "deprecated":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 ml-2">Deprecated</Badge>
      case "legacy":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 ml-2">Legacy</Badge>
      default:
        return null
    }
  }

  // Get firmware type priority for sorting
  const getFirmwareTypePriority = (type: string | null | undefined) => {
    switch (type?.toLowerCase()) {
      case "stable":
        return 1
      case "beta":
        return 2
      case "legacy":
        return 3
      case "deprecated":
        return 4
      default:
        return 5
    }
  }

  // Sort firmware versions by type priority, then by creation date (newest first)
  const sortedFirmwareVersions = useMemo(() => {
    return [...firmwareVersions].sort((a, b) => {
      const priorityA = getFirmwareTypePriority(a.firmware_type)
      const priorityB = getFirmwareTypePriority(b.firmware_type)

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // If same priority, sort by created_at (newest first)
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    })
  }, [firmwareVersions])

  // Handle update submission
  const handleUpdate = async () => {
    if (!device) {
      return
    }

    // Validate based on update mode
    if (updateMode === "firmware" && !selectedTargetFirmware) {
      toast({
        title: "Error",
        description: "Please select a firmware version",
        variant: "destructive",
      })
      return
    }

    if (updateMode === "network" && !networkIdInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a network ID",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      // Use config to determine correct endpoint
      const baseUrl = config.apiUrl
      const endpoint = config.isLocalhost ? "/devices/" : `${config.apiPrefix || "/api/v1"}/devices/`
      const url = `${baseUrl}${endpoint}${device.device_id}/details`

      let payload: any = {}

      // Build payload based on update mode
      if (updateMode === "firmware") {
        const selectedFirmware = firmwareVersions.find((fw) => fw.id === selectedTargetFirmware)

        if (!selectedFirmware) {
          setIsUpdating(false)
          toast({
            title: "Error",
            description: "Selected firmware not found. Please try again.",
            variant: "destructive",
          })
          return
        }

        payload.target_firmware = selectedFirmware.firmware_version
      } else {
        payload.network_id = networkIdInput.trim()
      }

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage = responseData?.detail || responseData?.message || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      // Show success toast
      if (updateMode === "firmware") {
        const selectedFirmware = firmwareVersions.find((fw) => fw.id === selectedTargetFirmware)
        toast({
          title: "Success",
          description: `Target firmware updated to ${selectedFirmware?.firmware_version}`,
        })
      } else {
        toast({
          title: "Success",
          description: `Network ID updated to ${networkIdInput.trim()}`,
        })
      }

      // Close dialog and trigger refresh
      onOpenChange(false)
      onUpdateSuccess?.()
    } catch (error: any) {
      console.error("Update error:", error)
      toast({
        title: "Update Failed",
        description: error.message || "An error occurred while updating the device",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Device Details</DialogTitle>
          <DialogDescription>
            {device && (
              <>
                Update Details for device: <span className="font-semibold">{device.device_name}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            {/* Toggle between Firmware and Network ID */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                variant={updateMode === "firmware" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUpdateMode("firmware")}
                className="flex-1"
              >
                Firmware Update
              </Button>
              <Button
                variant={updateMode === "network" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUpdateMode("network")}
                className="flex-1"
              >
                Network ID
              </Button>
            </div>

            {/* Firmware Update Mode */}
            {updateMode === "firmware" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Firmware</p>
                    <p className="text-sm text-muted-foreground">{device?.current_firmware || "Not set"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Target Firmware</p>
                    <p className="text-sm text-muted-foreground">{device?.target_firmware || "Not set"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-firmware">Select New Target Firmware</Label>
                  <Select value={selectedTargetFirmware} onValueChange={setSelectedTargetFirmware}>
                    <SelectTrigger id="target-firmware">
                      <SelectValue placeholder={loadingFirmware ? "Loading firmware versions..." : "Select firmware version"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedFirmwareVersions.map((firmware) => (
                        <SelectItem key={firmware.id} value={firmware.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 w-full">
                            <span>{firmware.firmware_version}</span>
                            {getFirmwareTypeBadge(firmware.firmware_type)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-amber-50 p-3 rounded border border-amber-200 mt-4">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> The device will download and install the new firmware on its next check-in.
                  </p>
                </div>
              </>
            )}

            {/* Network ID Update Mode */}
            {updateMode === "network" && (
              <>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Current Network ID</p>
                    <p className="text-sm text-muted-foreground">{device?.network_id || "Not set"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="network-id">New Network ID</Label>
                  <Input
                    id="network-id"
                    type="text"
                    placeholder="Enter network ID"
                    value={networkIdInput}
                    onChange={(e) => setNetworkIdInput(e.target.value)}
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded border border-blue-200 mt-4">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> The network ID will be updated immediately.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={
              isUpdating ||
              (updateMode === "firmware" && !selectedTargetFirmware) ||
              (updateMode === "network" && !networkIdInput.trim())
            }
          >
            {isUpdating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : updateMode === "firmware" ? (
              "Update Firmware"
            ) : (
              "Update Network ID"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
