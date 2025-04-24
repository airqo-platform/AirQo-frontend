"use client"

import { ChevronLeft, Copy, Edit, Info } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { useDeviceDetails } from "@/core/hooks/useDevices"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

const truncateId = (id: string) => {
  if (id.length <= 6) return id
  return `${id.slice(0, 6)}***${id.slice(-2)}`
}

export default function DeviceDetailsPage() {
  const params = useParams()
  const deviceId = params.id as string
  const { data: response, isLoading, error } = useDeviceDetails(deviceId)
  const device = response?.data
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Device not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const openEditModal = () => {
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
  }

  const openDetailsModal = () => {
    setIsDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false)
  }

  const handleSaveChanges = () => {
    // TODO: Implement save functionality
    toast.success("Device details updated successfully")
    closeEditModal()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/devices/overview">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Devices
          </Link>
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Device Details &gt; {device.name}</h1>
        </div>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Logs</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="border rounded-lg p-6 mt-6">
            {/* Key details that are always visible with inline layout */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <h3 className="font-semibold w-48">Device Number (Channel ID):</h3>
                <p>{device.device_number}</p>
              </div>
              <div className="flex items-center">
                <h3 className="font-semibold w-48">Visibility Status:</h3>
                <p>{device.visibility ? "Public" : "Private"}</p>
              </div>
              <div className="flex items-center">
                <h3 className="font-semibold w-48">Deployment Status:</h3>
                <p className="capitalize">{device.status}</p>
              </div>
            </div>

            {/* Additional details that are conditionally visible */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Device Details</DialogTitle>
                  <DialogDescription>Complete information about {device.long_name}</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium text-muted-foreground">Name</h4>
                      <p>{device.long_name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Serial Number</h4>
                      <p>{device.serial_number || "—"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Device Number (Channel ID)</h4>
                      <p>{device.device_number}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Description</h4>
                      <p>{device.description || "—"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Next Maintenance</h4>
                      <p>{device.nextMaintenance ? new Date(device.nextMaintenance).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Created At</h4>
                        <p>{device.createdAt ? new Date(device.createdAt).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h3 className="text-lg font-semibold mb-2">Access Keys</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium text-muted-foreground">Read Key</h4>
                      <div className="flex items-center">
                        <p>{truncateId(device.readKey)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(device.readKey)
                            toast("Read key copied to clipboard")
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Write Key</h4>
                      <div className="flex items-center">
                        <p>{truncateId(device.writeKey)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(device.writeKey)
                            toast("Write key copied to clipboard")
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h3 className="text-lg font-semibold mb-2">Location & Contact</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium text-muted-foreground">Latitude</h4>
                      <p>{device.latitude || "—"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Longitude</h4>
                      <p>{device.longitude || "—"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Phone Number</h4>
                      <p>{device.phoneNumber || "—"}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h3 className="text-lg font-semibold mb-2">Configuration</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium text-muted-foreground">Network</h4>
                      <p>{device.network}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Category</h4>
                      <p className="capitalize">{device.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Primary Device In Location</h4>
                      <p>{device.isPrimaryInLocation ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Data Access</h4>
                      <p className="capitalize">{device.visibility || "Private"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Generation Version</h4>
                      <p>{device.generation_version || "—"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Generation Count</h4>
                      <p>{device.generation_count || "—"}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h3 className="text-lg font-semibold mb-2">Status</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium text-muted-foreground">Online Status</h4>
                      <p>{device.isOnline ? "Online" : "Offline"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Active Status</h4>
                      <p>{device.isActive ? "Active" : "Inactive"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Deployment Status</h4>
                      <p className="capitalize">{device.status}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Height</h4>
                      <p>{device.height ? `${device.height} m` : "—"}</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={closeDetailsModal}>
                    Close
                  </Button>
                  <Button variant="outline" onClick={openEditModal}>
                    Edit Details
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={openDetailsModal} className="flex items-center">
                <Info className="mr-2 h-4 w-4" />
                View more details
              </Button>
              <Button variant="outline" onClick={openEditModal} className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit Device Details
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="border rounded-lg p-6 mt-6">
            {/* TODO: Add maintenance logs table */}
            <p>Maintenance logs will go here</p>
          </TabsContent>

          <TabsContent value="photos" className="border rounded-lg p-6 mt-6">
            {/* TODO: Add photos grid */}
            <p>Photos will go here</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Device Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Device Details</DialogTitle>
            <DialogDescription>Make changes to the device details here. Click save when you&apos;re done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="long_name" className="text-right">
                Name
              </Label>
              <Input id="long_name" defaultValue={device.long_name || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channel_id" className="text-right">
                Channel ID
              </Label>
              <Input id="channel_id" defaultValue={device.device_number || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category *
              </Label>
              <Select defaultValue={device.category || ""} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowcost">Lowcost</SelectItem>
                  <SelectItem value="gas">GAS</SelectItem>
                  <SelectItem value="bam">BAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" defaultValue={device.description || ""} className="col-span-3 min-h-[80px]" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Phone Number
              </Label>
              <Input id="phoneNumber" defaultValue={device.phoneNumber || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="latitude" className="text-right">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                defaultValue={device.latitude || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longitude" className="text-right">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                defaultValue={device.longitude || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data_access" className="text-right">
                Data Access
              </Label>
              <Select defaultValue={device.visibility ? "true" : "false"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select data access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Private</SelectItem>
                  <SelectItem value="true">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="network" className="text-right">
                Network
              </Label>
              <Input value={device.network} disabled type="text" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primary_device" className="text-right">
                Primary Device In Location
              </Label>
              <Select defaultValue={device.isPrimaryInLocation ? "yes" : "no"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="generation_version" className="text-right">
                Generation Version
              </Label>
              <Input
                id="generation_version"
                defaultValue={device.generation_version || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="generation_count" className="text-right">
                Generation Count
              </Label>
              <Input
                id="generation_count"
                type="number"
                defaultValue={device.generation_count || ""}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
