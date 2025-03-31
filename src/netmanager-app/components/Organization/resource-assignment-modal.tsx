"use client"

import { useState } from "react"
import { Search, X, Loader2 } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useAssignDevicesToGroup, useAssignSitesToGroup } from "@/core/hooks/useGroups"
import { Skeleton } from "@/components/ui/skeleton"

interface ResourceAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  organizationName: string
  availableSites: Array<{ id: string; name: string; assigned?: boolean }>
  availableDevices: Array<{ id: string; name: string; assigned?: boolean }>
  onSuccess?: () => void
  networkId: string
  initialTab?: "sites" | "devices"
  isLoading?: boolean
}

export function ResourceAssignmentModal({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  availableSites,
  availableDevices,
  onSuccess,
  initialTab = "sites",
  isLoading = false,
}: ResourceAssignmentModalProps) {
  const [activeTab, setActiveTab] = useState<"sites" | "devices">(initialTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])

  const { mutate: assignSites, isPending: isAssigningSites } = useAssignSitesToGroup()
  const { mutate: assignDevices, isPending: isAssigningDevices } = useAssignDevicesToGroup()

  const isPending = isAssigningSites || isAssigningDevices

  // Filter resources based on search query
  const filteredSites = availableSites.filter((site) => site.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredDevices = availableDevices.filter((device) =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle selection of sites
  const handleSiteSelection = (siteId: string) => {
    setSelectedSites((prev) => (prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]))
  }

  // Handle selection of devices
  const handleDeviceSelection = (deviceId: string) => {
    setSelectedDevices((prev) => (prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]))
  }

  // Handle select all for the current filtered list
  const handleSelectAll = () => {
    if (activeTab === "sites") {
      const allSiteIds = filteredSites.filter((site) => !site.assigned).map((site) => site.id)
      if (selectedSites.length === allSiteIds.length) {
        setSelectedSites([])
      } else {
        setSelectedSites(allSiteIds)
      }
    } else {
      const allDeviceIds = filteredDevices.filter((device) => !device.assigned).map((device) => device.id)
      if (selectedDevices.length === allDeviceIds.length) {
        setSelectedDevices([])
      } else {
        setSelectedDevices(allDeviceIds)
      }
    }
  }

  // Handle assignment submission
  const handleAssign = () => {
    if (activeTab === "sites" && selectedSites.length > 0) {
      assignSites(
        { siteIds: selectedSites, groups: [organizationName] },
        {
          onSuccess: () => {
            setSelectedSites([])
            onSuccess?.()
          },
        },
      )
    } else if (activeTab === "devices" && selectedDevices.length > 0) {
      assignDevices(
        { deviceIds: selectedDevices, groups: [organizationName] },
        {
          onSuccess: () => {
            setSelectedDevices([])
            onSuccess?.()
          },
        },
      )
    }
  }

  // Reset selections when closing the modal
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedSites([])
      setSelectedDevices([])
      setSearchQuery("")
    }
    onOpenChange(open)
  }

  // Render loading skeletons
  const renderSkeletons = () => (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2 p-3 border rounded-lg">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Resources to {organizationName}</DialogTitle>
          <DialogDescription>Select sites and devices to assign to this organization.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={isLoading}>
              {activeTab === "sites" &&
              selectedSites.length === filteredSites.filter((s) => !s.assigned).length &&
              filteredSites.some((s) => !s.assigned)
                ? "Deselect All"
                : "Select All"}
              {activeTab === "devices" &&
              selectedDevices.length === filteredDevices.filter((d) => !d.assigned).length &&
              filteredDevices.some((d) => !d.assigned)
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          <Tabs
            defaultValue={initialTab}
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "sites" | "devices")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sites" disabled={isLoading}>
                Sites
                {selectedSites.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedSites.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="devices" disabled={isLoading}>
                Devices
                {selectedDevices.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDevices.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sites" className="mt-4">
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {isLoading ? (
                  renderSkeletons()
                ) : filteredSites.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {searchQuery ? "No sites match your search" : "No sites available"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSites.map((site) => (
                      <div
                        key={site.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          selectedSites.includes(site.id) ? "border-primary bg-primary/5" : ""
                        } ${site.assigned ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`site-${site.id}`}
                            checked={selectedSites.includes(site.id)}
                            onCheckedChange={() => handleSiteSelection(site.id)}
                            disabled={site.assigned}
                          />
                          <label
                            htmlFor={`site-${site.id}`}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                              site.assigned ? "cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            {site.name}
                          </label>
                          {site.assigned && (
                            <Badge variant="outline" className="ml-2">
                              Already assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="devices" className="mt-4">
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {isLoading ? (
                  renderSkeletons()
                ) : filteredDevices.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {searchQuery ? "No devices match your search" : "No devices available"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDevices.map((device) => (
                      <div
                        key={device.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          selectedDevices.includes(device.id) ? "border-primary bg-primary/5" : ""
                        } ${device.assigned ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`device-${device.id}`}
                            checked={selectedDevices.includes(device.id)}
                            onCheckedChange={() => handleDeviceSelection(device.id)}
                            disabled={device.assigned}
                          />
                          <label
                            htmlFor={`device-${device.id}`}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                              device.assigned ? "cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            {device.name}
                          </label>
                          {device.assigned && (
                            <Badge variant="outline" className="ml-2">
                              Already assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              isLoading ||
              (activeTab === "sites" && selectedSites.length === 0) ||
              (activeTab === "devices" && selectedDevices.length === 0) ||
              isPending
            }
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Assigning..." : "Assign to Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

