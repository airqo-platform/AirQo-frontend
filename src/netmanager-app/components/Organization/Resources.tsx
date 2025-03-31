"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Laptop, Globe, Plus, Loader2, CheckCircle, AlertCircle, Search, X, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useAssignDevicesToGroup, useAssignSitesToGroup } from "@/core/hooks/useGroupMutations"
import { useQuery } from "@tanstack/react-query"
import { sites } from "@/core/apis/sites"
import { devices } from "@/core/apis/devices"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AssignResourcesToGroupProps {
  groupId: string
  groupTitle: string
}

export function AssignResourcesToGroup({ groupId, groupTitle }: AssignResourcesToGroupProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("devices")
  const [selectedDevices, setSelectedDevices] = useState<Array<{ id: string; name: string }>>([])
  const [selectedSites, setSelectedSites] = useState<Array<{ id: string; name: string }>>([])
  const [devicesPopoverOpen, setDevicesPopoverOpen] = useState(false)
  const [sitesPopoverOpen, setSitesPopoverOpen] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Mutations for assigning resources
  const assignDevices = useAssignDevicesToGroup()
  const assignSites = useAssignSitesToGroup()

  // Fetch available devices
  const { data: availableDevices, isLoading: isLoadingDevices } = useQuery({
    queryKey: ["available-devices"],
    queryFn: async () => {
      const response = await devices.getAllDevices()
      // Filter out devices that are already assigned to this group
      return response.filter(
        (device) =>
          !device.groups ||
          !Array.isArray(device.groups) ||
          (!device.groups.includes(groupId) && !device.groups.includes(groupTitle)),
      )
    },
    enabled: open && activeTab === "devices",
  })

  // Fetch available sites
  const { data: availableSites, isLoading: isLoadingSites } = useQuery({
    queryKey: ["available-sites"],
    queryFn: async () => {
      const response = await sites.getAllSites()
      // Filter out sites that are already assigned to this group
      return response.filter(
        (site) =>
          !site.groups ||
          !Array.isArray(site.groups) ||
          (!site.groups.includes(groupId) && !site.groups.includes(groupTitle)),
      )
    },
    enabled: open && activeTab === "sites",
  })

  const handleAssignDevices = async () => {
    if (selectedDevices.length === 0) return

    try {
      await assignDevices.mutateAsync({
        deviceIds: selectedDevices.map((device) => device.id),
        groups: [groupTitle],
      })

      toast({
        title: "Devices assigned successfully",
        description: `${selectedDevices.length} device(s) assigned to ${groupTitle}`,
        variant: "default",
      })

      setSelectedDevices([])
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to assign devices",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAssignSites = async () => {
    if (selectedSites.length === 0) return

    try {
      await assignSites.mutateAsync({
        siteIds: selectedSites.map((site) => site.id),
        groups: [groupTitle],
      })

      toast({
        title: "Sites assigned successfully",
        description: `${selectedSites.length} site(s) assigned to ${groupTitle}`,
        variant: "default",
      })

      setSelectedSites([])
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to assign sites",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = () => {
    if (activeTab === "devices") {
      handleAssignDevices()
    } else {
      handleAssignSites()
    }
  }

  const removeSelectedDevice = (id: string) => {
    setSelectedDevices(selectedDevices.filter((device) => device.id !== id))
  }

  const removeSelectedSite = (id: string) => {
    setSelectedSites(selectedSites.filter((site) => site.id !== id))
  }

  const isLoading = assignDevices.isPending || assignSites.isPending
  const hasError = assignDevices.isError || assignSites.isError

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Assign Resources
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Resources to {groupTitle}</DialogTitle>
          <DialogDescription>
            Select devices or sites to assign to this group. Resources can belong to multiple groups.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="devices" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="devices" className="flex items-center">
              <Laptop className="mr-2 h-4 w-4" /> Devices
            </TabsTrigger>
            <TabsTrigger value="sites" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" /> Sites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Popover open={devicesPopoverOpen} onOpenChange={setDevicesPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={devicesPopoverOpen}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                      Select devices to assign
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[520px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search devices..." />
                    <CommandList>
                      <CommandEmpty>
                        {isLoadingDevices ? (
                          <div className="flex items-center justify-center p-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : (
                          "No devices found."
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[300px]">
                          {!isLoadingDevices &&
                            availableDevices?.map((device) => (
                              <CommandItem
                                key={device._id}
                                onSelect={() => {
                                  const isSelected = selectedDevices.some((d) => d.id === device._id)
                                  if (!isSelected) {
                                    setSelectedDevices([
                                      ...selectedDevices,
                                      {
                                        id: device._id,
                                        name:
                                          device.name ||
                                          device.long_name ||
                                          device.device_number?.toString() ||
                                          "Unnamed Device",
                                      },
                                    ])
                                  }
                                  setDevicesPopoverOpen(false)
                                }}
                              >
                                <Laptop className="mr-2 h-4 w-4" />
                                <span>
                                  {device.name ||
                                    device.long_name ||
                                    device.device_number?.toString() ||
                                    "Unnamed Device"}
                                </span>
                                {device.status && (
                                  <Badge variant="outline" className="ml-2">
                                    {device.status}
                                  </Badge>
                                )}
                              </CommandItem>
                            ))}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedDevices.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">Selected Devices ({selectedDevices.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedDevices.map((device) => (
                        <Badge key={device.id} variant="secondary" className="flex items-center gap-1">
                          <Laptop className="h-3 w-3" />
                          {device.name}
                          <button
                            onClick={() => removeSelectedDevice(device.id)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sites" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Popover open={sitesPopoverOpen} onOpenChange={setSitesPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sitesPopoverOpen}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                      Select sites to assign
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[520px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search sites..." />
                    <CommandList>
                      <CommandEmpty>
                        {isLoadingSites ? (
                          <div className="flex items-center justify-center p-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : (
                          "No sites found."
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[300px]">
                          {!isLoadingSites &&
                            availableSites?.map((site) => (
                              <CommandItem
                                key={site._id}
                                onSelect={() => {
                                  const isSelected = selectedSites.some((s) => s.id === site._id)
                                  if (!isSelected) {
                                    setSelectedSites([
                                      ...selectedSites,
                                      {
                                        id: site._id,
                                        name: site.name || site.formatted_name || site.location_name || "Unnamed Site",
                                      },
                                    ])
                                  }
                                  setSitesPopoverOpen(false)
                                }}
                              >
                                <Globe className="mr-2 h-4 w-4" />
                                <span>{site.name || site.formatted_name || site.location_name || "Unnamed Site"}</span>
                                {site.city && (
                                  <span className="ml-2 text-muted-foreground text-xs">
                                    {site.city}
                                    {site.country ? `, ${site.country}` : ""}
                                  </span>
                                )}
                              </CommandItem>
                            ))}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedSites.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-2">Selected Sites ({selectedSites.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSites.map((site) => (
                        <Badge key={site.id} variant="secondary" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {site.name}
                          <button
                            onClick={() => removeSelectedSite(site.id)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {hasError && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start mt-4">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error assigning resources</p>
              <p className="text-sm">
                {activeTab === "devices"
                  ? assignDevices.error?.message || "Failed to assign devices"
                  : assignSites.error?.message || "Failed to assign sites"}
              </p>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              (activeTab === "devices" && selectedDevices.length === 0) ||
              (activeTab === "sites" && selectedSites.length === 0)
            }
            className="ml-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Assign to Group
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

