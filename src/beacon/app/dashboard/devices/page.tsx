"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Search,
  MapPin,
  Wifi,
  WifiOff,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Map,
  Activity,
  Package,
  List
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"
import { getDeviceStatsForUI, getDevicesForUIPaginated } from "@/services/device-api.service"
import type { UIDeviceCounts, UIDevice } from "@/types/api.types"
import UpdateDeviceDialog from "@/components/dashboard/update-device-dialog"

// Dynamically import the map component to avoid SSR issues with better error handling
const AfricaMap = dynamic(
  () => import("./africa-map").catch((error) => {
    console.error('Failed to load AfricaMap:', error)
    // Return a fallback component
    return {
      default: () => (
        <div className="h-[700px] w-full flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
          <div className="text-center">
            <MapPin className="h-10 w-10 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 text-sm">Africa map failed to load</p>
            <button
              onClick={() => globalThis.location.reload()}
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
      <div className="h-[700px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    ),
  }
)

export default function DevicesPage() {
  const { toast } = useToast()
  
  // State for device data
  const [devices, setDevices] = useState<UIDevice[]>([])
  const [totalDevices, setTotalDevices] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [deviceCounts, setDeviceCounts] = useState<UIDeviceCounts>({
    total_devices: 0,
    active_devices: 0,
    offline_devices: 0,
    deployed_devices: 0,
    not_deployed: 0,
    recalled_devices: 0
  })
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "map">("list") // New state for view toggle
  const [firmwareDialogOpen, setFirmwareDialogOpen] = useState(false)
  const [selectedFirmwareDevice, setSelectedFirmwareDevice] = useState<UIDevice | null>(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  
  // Fetch device counts
  const fetchDeviceCounts = async () => {
    try {
      const data = await getDeviceStatsForUI()
      setDeviceCounts(data)
    } catch (err) {
      console.error("Error fetching device counts:", err)
      // Don't set error for counts, just use defaults
    }
  }
  
  // Fetch devices list with pagination
  const fetchDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Calculate skip based on current page
      const skip = (currentPage - 1) * itemsPerPage
      
      // Prepare query params
      const params: any = {
        skip,
        limit: itemsPerPage
      }
      
      // Add search term if provided (backend search)
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      
      // Always filter by airqo network
      params.network = "airqo"
      
      // Add filters if they are set (currently commented out in UI)
      // if (networkFilter !== "all") {
      //   params.network = networkFilter
      // }
      // if (statusFilter !== "all") {
      //   params.status = statusFilter
      // }
      
      // Fetch from the /devices endpoint with pagination
      const data = await getDevicesForUIPaginated(params)
      
      setDevices(data.devices)
      setTotalDevices(data.pagination.total)
      setTotalPages(data.pagination.pages)
      setHasNext(data.pagination.has_next)
      setHasPrevious(data.pagination.has_previous)
      
      console.log('Pagination metadata:', data.pagination)
    } catch (err) {
      console.error("Error fetching devices:", err)
      setError("Failed to load device data")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }
  
  // Initial data load
  useEffect(() => {
    Promise.all([fetchDeviceCounts(), fetchDevices()])
    
    // Delay showing the map to avoid React reconciliation issues
    const timer = setTimeout(() => {
      setShowMap(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])
  
  // Refetch devices when pagination or search changes
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const searchDebounce = setTimeout(() => {
      fetchDevices()
    }, 500) // Wait 500ms after user stops typing
    
    return () => clearTimeout(searchDebounce)
  }, [currentPage, itemsPerPage, searchTerm]) // Added searchTerm
  
  // Refresh all data
  const refreshData = () => {
    setIsRefreshing(true)
    Promise.all([fetchDeviceCounts(), fetchDevices()])
  }
  
  // Calculate percentages for the progress bars
  const calculatePercentage = useCallback((value: number) => {
    return deviceCounts.total_devices > 0 
      ? Math.round((value / deviceCounts.total_devices) * 100) 
      : 0
  }, [deviceCounts.total_devices])

  const activePercentage = calculatePercentage(deviceCounts.active_devices)
  const offlinePercentage = calculatePercentage(deviceCounts.offline_devices)
  const deployedPercentage = calculatePercentage(deviceCounts.deployed_devices)
  
  // Get unique networks for filter
  const uniqueNetworks = useMemo(() => {
    const networks = new Set(devices.map(d => d.network).filter(Boolean))
    return Array.from(networks)
  }, [devices])
  
  // No client-side filtering needed - backend handles search
  // Sort devices - online devices first, then by name
  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      // First sort by online status
      if (a.is_online && !b.is_online) return -1;
      if (!a.is_online && b.is_online) return 1;
      
      // Then sort by deployment status
      if (a.status === "deployed" && b.status !== "deployed") return -1;
      if (a.status !== "deployed" && b.status === "deployed") return 1;
      
      // Then sort by name
      return (a.device_name || "").localeCompare(b.device_name || "");
    });
  }, [devices]);

  // Memoize map device data to avoid re-filtering/mapping on every render
  const mapDevices = useMemo(() => {
    return devices
      .filter((device) => 
        device.latitude != null && 
        device.longitude != null &&
        !Number.isNaN(device.latitude) &&
        !Number.isNaN(device.longitude)
      )
      .map((device) => ({
        id: device.device_id,
        name: device.device_name,
        status: device.status ?? (device.is_online ? "online" : "offline"),
        lat: device.latitude,
        lng: device.longitude,
        pm2_5: device.pm2_5,
        pm10: device.pm10,
        reading_timestamp: device.reading_timestamp,
      }))
  }, [devices])
  
  // Display current items (no need for slicing since backend handles pagination)
  const currentItems = sortedDevices;
  
  // Get status badge variant
  const getStatusBadge = useCallback((device: UIDevice) => {
    if (device.is_online) {
      return { variant: "default", className: "bg-green-500 hover:bg-green-600", icon: Wifi, text: "Online" }
    }
    return { variant: "secondary", className: "bg-gray-500 hover:bg-gray-600", icon: WifiOff, text: "Offline" }
  }, [])
  
  // Get deployment status badge
  const getDeploymentBadge = useCallback((status: string | undefined) => {
    switch(status) {
      case "deployed":
        return { variant: "default", className: "bg-green-100 text-green-700 hover:bg-green-200", text: "Deployed" }
      case "not deployed":
        return { variant: "secondary", className: "bg-gray-100 text-gray-700 hover:bg-gray-200", text: "Not Deployed" }
      case "recalled":
        return { variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-200", text: "Recalled" }
      default:
        return { variant: "outline", className: "", text: status || "Unknown" }
    }
  }, [])
  
  // Get network badge color
  const getNetworkBadge = useCallback((network: string | undefined) => {
    const networkColors: { [key: string]: string } = {
      airbeam: "bg-purple-100 text-purple-800",
      airqo: "bg-blue-100 text-blue-800",
      lowcost: "bg-green-100 text-green-800",
      default: "bg-gray-100 text-gray-800"
    }
    return networkColors[network?.toLowerCase() || 'default'] || networkColors.default
  }, [])
  
  // Get firmware badge info
  const getFirmwareBadge = useCallback((currentFirmware: string | undefined, targetFirmware: string | undefined, downloadState: string | undefined) => {
    // Both current and target are null - not set
    if (!currentFirmware && !targetFirmware) {
      return {
        color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        text: "Not Set",
        tooltip: "Firmware not set"
      }
    }
    
    // Target is null - has updated firmware
    if (!targetFirmware) {
      return {
        color: "bg-green-100 text-green-700 hover:bg-green-200",
        text: currentFirmware || "Updated",
        tooltip: "Firmware is up to date"
      }
    }
    
    // Current firmware matches target - green
    if (currentFirmware === targetFirmware) {
      return {
        color: "bg-green-100 text-green-700 hover:bg-green-200",
        text: currentFirmware,
        tooltip: "Firmware is up to date"
      }
    }
    
    // Current firmware differs from target - orange (pending update)
    return {
      color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
      text: currentFirmware || "Pending",
      tooltip: `${downloadState === 'pending' ? 'Pending' : downloadState === 'failed' ? 'Failed' : 'Updating'} to ${targetFirmware}`
    }
  }, [])
  
  // Handle device selection on map
  const handleDeviceSelect = useCallback((id: string) => {
    setSelectedDeviceId(id)
  }, [])
  
  // Handle firmware badge click
  const handleFirmwareClick = useCallback((device: UIDevice, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    setSelectedFirmwareDevice(device)
    setFirmwareDialogOpen(true)
  }, [])
  
  // Handle network ID click
  const handleNetworkIdClick = useCallback((device: UIDevice, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    setSelectedFirmwareDevice(device)
    setFirmwareDialogOpen(true)
  }, [])
  
  // Handle successful device update
  const handleUpdateSuccess = useCallback(() => {
    refreshData()
  }, [])

  // Handle row click to navigate to device details
  const handleRowClick = useCallback((deviceId: string) => {
    window.location.href = `/dashboard/devices/${deviceId}`
  }, [])


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Device Monitoring</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          {/* <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add Device
          </Button> */}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Total Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {loading ? '...' : deviceCounts.total_devices}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All registered devices</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-500" />
              Online Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {loading ? '...' : deviceCounts.active_devices}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: `${activePercentage}%` }}></div>
              <span className="text-xs text-muted-foreground ml-2">{activePercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <WifiOff className="mr-2 h-5 w-5 text-red-500" />
              Offline Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {loading ? '...' : deviceCounts.offline_devices}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-red-500 rounded-full" style={{ width: `${offlinePercentage}%` }}></div>
              <span className="text-xs text-muted-foreground ml-2">{offlinePercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-500" />
              Deployed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {loading ? '...' : deviceCounts.deployed_devices}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${deployedPercentage}%` }}></div>
              <span className="text-xs text-muted-foreground ml-2">{deployedPercentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List and Map Section with Toggle */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              {viewMode === "list" ? (
                <>
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Device List
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Device Locations
                </>
              )}
            </CardTitle>
            
            {/* View Toggle Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center"
              >
                <List className="mr-2 h-4 w-4" />
                List View
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="flex items-center"
              >
                <Map className="mr-2 h-4 w-4" />
                Map View
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {/* List View */}
          {viewMode === "list" && (
            <>
              {/* Search Input - Backend Search Enabled */}
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by device name, ID, location, city, or country..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1) // Reset to first page when searching
                    }}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1.5 h-7 w-7 p-0"
                      onClick={() => {
                        setSearchTerm("")
                        setCurrentPage(1)
                      }}
                    >
                      <span className="sr-only">Clear search</span>
                      ✕
                    </Button>
                  )}
                </div>
                {searchTerm && (
                  <div className="text-sm text-muted-foreground">
                    Searching devices...
                  </div>
                )}
              </div>
              
              {/* Filters - Temporarily Commented Out */}
              {/* <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value)
                    setCurrentPage(1) // Reset to first page when filter changes
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="deployed">Deployed</SelectItem>
                    <SelectItem value="not_deployed">Not Deployed</SelectItem>
                    <SelectItem value="recalled">Recalled</SelectItem>
                  </SelectContent>
                </Select>
                
                {uniqueNetworks.length > 0 && (
                  <Select
                    value={networkFilter}
                    onValueChange={(value) => {
                      setNetworkFilter(value)
                      setCurrentPage(1) // Reset to first page when filter changes
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Networks</SelectItem>
                      {uniqueNetworks.map(network => (
                        <SelectItem key={network} value={network}>
                          {network}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div> */}

              {loading ? (
                <div className="py-8 flex justify-center items-center">
                  <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                  <span className="ml-4 text-lg">Loading devices...</span>
                </div>
              ) : sortedDevices.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <AlertCircle className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  <p>No devices found matching your criteria.</p>
                  <p className="text-sm mt-2">Try changing your search or filter settings.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Device Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Deployment</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Channel ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Network ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Firmware</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((device) => {
                        const statusInfo = getStatusBadge(device)
                        const deploymentInfo = getDeploymentBadge(device.status)
                        const StatusIcon = statusInfo.icon
                        const firmwareInfo = getFirmwareBadge(
                          device.current_firmware, 
                          device.target_firmware,
                          device.firmware_download_state
                        )
                        
                        return (
                          <tr 
                            key={device.device_id} 
                            className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handleRowClick(device.device_id)}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2" title={statusInfo.text}>
                                <StatusIcon 
                                  className={`h-4 w-4 ${device.is_online ? 'text-green-500' : 'text-gray-400'}`}
                                />
                                <span className="font-medium">{device.device_name || "Unnamed"}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${deploymentInfo.className}`}>
                                {deploymentInfo.text}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">
                                {device.category || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">
                                {device.channel_id || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-4" onClick={(e) => handleNetworkIdClick(device, e)}>
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors">
                                {device.network_id || "Not Set"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4" onClick={(e) => handleFirmwareClick(device, e)}>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className={`${firmwareInfo.color} cursor-pointer transition-colors`}>
                                      {firmwareInfo.text}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{firmwareInfo.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                            <td className="py-3 px-4">
                              {device.location_name || device.city || device.country ? (
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {device.location_name || "Unknown"}
                                  </span>
                                  {(device.city || device.country) && (
                                    <span className="text-xs text-gray-500">
                                      {[device.city, device.country].filter(Boolean).join(", ")}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">No location</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page:</span>
                        <Select 
                          value={itemsPerPage.toString()} 
                          onValueChange={(value) => {
                            setItemsPerPage(Number(value));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Per page" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages || 1}
                        onPageChange={setCurrentPage}
                        showInfo={true}
                        totalItems={totalDevices}
                        itemsPerPage={itemsPerPage}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Map View */}
          {viewMode === "map" && showMap && (
            <div className="h-[700px] w-full">
              <AfricaMap
                devices={mapDevices}
                onDeviceSelect={handleDeviceSelect}
                selectedDeviceId={selectedDeviceId || undefined}
              />
            </div>
          )}
          
          {viewMode === "map" && !showMap && (
            <div className="h-[700px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Loading map...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Update Device Dialog */}
      <UpdateDeviceDialog
        open={firmwareDialogOpen}
        onOpenChange={setFirmwareDialogOpen}
        device={selectedFirmwareDevice}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  )
}