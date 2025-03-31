"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Filter, Search, Laptop, Globe, Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAssignDevicesToGroup, useAssignSitesToGroup } from "@/core/hooks/useGroups"
import { useQuery } from "@tanstack/react-query"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"
import { useAppSelector } from "@/core/redux/hooks"
import { Site } from "@/app/types/sites"
import { Device } from "@/app/types/devices"

interface ResourceAssignmentPageProps {
  organizationId: string
  organizationName: string
}

export function ResourceAssignmentPage({ organizationId, organizationName }: ResourceAssignmentPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"sites" | "devices">("sites")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])

  const activeNetwork = useAppSelector((state) => state.user.activeNetwork)
  const networkId = activeNetwork?.net_name || ""

  // Fetch all available sites
  const {
    data: sitesData,
    isLoading: isLoadingSites,
    refetch: refetchSites,
  } = useQuery({
    queryKey: ["all-sites", networkId],
    queryFn: async () => {
      const response = await sites.getSitesSummary(networkId, organizationName)
      return response.sites || []
    },
    enabled: !!networkId,
  })

  // Fetch all available devices
  const {
    data: devicesData,
    isLoading: isLoadingDevices,
    refetch: refetchDevices,
  } = useQuery({
    queryKey: ["all-devices", networkId],
    queryFn: async () => {
      const response = await devices.getDevicesSummaryApi(networkId, organizationName)
      return response.devices || []
    },
    enabled: !!networkId,
  })

  // Fetch sites already assigned to this organization
  const { data: assignedSitesData, isLoading: isLoadingAssignedSites } = useQuery({
    queryKey: ["sites-summary", networkId],
    queryFn: async () => {
      const response = await sites.getSitesApi(networkId)
      return response.sites || []
    },
    enabled: !!networkId,
  })

  // Fetch devices already assigned to this organization
  const { data: assignedDevicesData, isLoading: isLoadingAssignedDevices } = useQuery({
    queryKey: ["devices-summary", networkId],
    queryFn: async () => {
      const response = await devices.getDevicesApi(networkId)
      return response.devices || []
    },
    enabled: !!networkId,
  })

  const { mutate: assignSites, isPending: isAssigningSites } = useAssignSitesToGroup()
  const { mutate: assignDevices, isPending: isAssigningDevices } = useAssignDevicesToGroup()

  const isLoading = isLoadingSites || isLoadingDevices || isLoadingAssignedSites || isLoadingAssignedDevices
  const isPending = isAssigningSites || isAssigningDevices

  // Prepare site data with assignment status
  const preparedSites =
    sitesData?.map((site: Site) => {
      const isAssigned = assignedSitesData?.some((assignedSite: Site) => assignedSite._id === site._id)
      return {
        ...site,
        isAssigned,
        selected: selectedSites.includes(site._id),
      }
    }) || []

  // Prepare device data with assignment status
  const preparedDevices =
    devicesData?.map((device: Device) => {
      const isAssigned = assignedDevicesData?.some((assignedDevice) => assignedDevice._id === device._id)
      return {
        ...device,
        isAssigned,
        selected: selectedDevices.includes(device._id),
      }
    }) || []

  // Filter resources based on search query
  const filteredSites = preparedSites.filter((site: Site) => site.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredDevices = preparedDevices.filter((device: Device) =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle selection of sites
//   const handleSiteSelection = (siteId: string) => {
//     setSelectedSites((prev) => (prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]))
//   }

//   // Handle selection of devices
//   const handleDeviceSelection = (deviceId: string) => {
//     setSelectedDevices((prev) => (prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]))
//   }

  // Handle select all for the current filtered list
  const handleSelectAll = () => {
    if (activeTab === "sites") {
      const availableSiteIds = filteredSites.filter((site: Site) => !site.isAssigned).map((site) => site.id)

      if (selectedSites.length === availableSiteIds.length) {
        setSelectedSites([])
      } else {
        setSelectedSites(availableSiteIds)
      }
    } else {
      const availableDeviceIds = filteredDevices.filter((device) => !device.isAssigned).map((device) => device.id)

      if (selectedDevices.length === availableDeviceIds.length) {
        setSelectedDevices([])
      } else {
        setSelectedDevices(availableDeviceIds)
      }
    }
  }

  // Handle assignment submission
  const handleAssign = () => {
    if (activeTab === "sites" && selectedSites.length > 0) {
      assignSites(
        { siteIds: selectedSites, groups: [organizationId] },
        {
          onSuccess: () => {
            toast({
              title: "Sites assigned successfully",
              description: `${selectedSites.length} sites have been assigned to ${organizationName}`,
                variant: "default",
            })
            setSelectedSites([])
            refetchSites()
          },
          onError: (error) => {
            toast({
              title: "Failed to assign sites",
              description: error.message || "An error occurred while assigning sites",
              variant: "destructive",
            })
          },
        },
      )
    } else if (activeTab === "devices" && selectedDevices.length > 0) {
      assignDevices(
        { deviceIds: selectedDevices, groups: [organizationId] },
        {
          onSuccess: () => {
            toast({
              title: "Devices assigned successfully",
              description: `${selectedDevices.length} devices have been assigned to ${organizationName}`,
              variant: "default",
            })
            setSelectedDevices([])
            refetchDevices()
          },
          onError: (error) => {
            toast({
              title: "Failed to assign devices",
              description: error.message || "An error occurred while assigning devices",
              variant: "destructive",
            })
          },
        },
      )
    }
  }

  const siteColumns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          disabled={row.original.isAssigned}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Site Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("name")}</span>
          {row.original.isAssigned && (
            <Badge variant="outline" className="ml-2">
              <Check className="h-3 w-3 mr-1" /> Assigned
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "success" : "secondary"}>{row.getValue("status")}</Badge>
      ),
    },
  ]

  // Define columns for devices table
  const deviceColumns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          disabled={row.original.isAssigned}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Device Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Laptop className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("name")}</span>
          {row.original.isAssigned && (
            <Badge variant="outline" className="ml-2">
              <Check className="h-3 w-3 mr-1" /> Assigned
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Device Type",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "online" ? "success" : "secondary"}>{row.getValue("status")}</Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Organization
        </Button>
        <h1 className="text-2xl font-bold">Assign Resources to {organizationName}</h1>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-3">Loading resources...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resource Assignment</CardTitle>
              <CardDescription>
                Select sites and devices to assign to this organization. Resources that are already assigned are marked
                and cannot be selected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search resources..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 p-0"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear</span>
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {activeTab === "sites" &&
                    selectedSites.length === filteredSites.filter((s) => !s.isAssigned).length &&
                    filteredSites.some((s) => !s.isAssigned)
                      ? "Deselect All"
                      : "Select All"}
                    {activeTab === "devices" &&
                    selectedDevices.length === filteredDevices.filter((d) => !d.isAssigned).length &&
                    filteredDevices.some((d) => !d.isAssigned)
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>

                <Tabs
                  defaultValue="sites"
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as "sites" | "devices")}
                >
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="sites">
                      Sites
                      {selectedSites.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedSites.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="devices">
                      Devices
                      {selectedDevices.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedDevices.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="sites" className="mt-4">
                    {filteredSites.length === 0 ? (
                      <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
                        <div className="flex flex-col items-center text-center">
                          <AlertCircle className="h-10 w-10 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">No sites found</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {searchQuery
                              ? "No sites match your search criteria"
                              : "There are no sites available to assign"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <DataTable
                        columns={siteColumns}
                        data={filteredSites}
                        onRowSelectionChange={(rowSelection) => {
                          const selectedIds = Object.keys(rowSelection).map(
                            (index) => filteredSites[Number.parseInt(index)].id,
                          )
                          setSelectedSites(selectedIds)
                        }}
                        rowSelection={{}}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="devices" className="mt-4">
                    {filteredDevices.length === 0 ? (
                      <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
                        <div className="flex flex-col items-center text-center">
                          <AlertCircle className="h-10 w-10 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">No devices found</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {searchQuery
                              ? "No devices match your search criteria"
                              : "There are no devices available to assign"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <DataTable
                        columns={deviceColumns}
                        data={filteredDevices}
                        onRowSelectionChange={(rowSelection) => {
                          const selectedIds = Object.keys(rowSelection).map(
                            (index) => filteredDevices[Number.parseInt(index)].id,
                          )
                          setSelectedDevices(selectedIds)
                        }}
                        rowSelection={{}}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={
                (activeTab === "sites" && selectedSites.length === 0) ||
                (activeTab === "devices" && selectedDevices.length === 0) ||
                isPending
              }
            >
              {isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              )}
              {isPending ? "Assigning..." : "Assign to Organization"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

