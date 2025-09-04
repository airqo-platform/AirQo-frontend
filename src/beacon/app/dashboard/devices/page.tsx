"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  MapPin,
  Wifi,
  WifiOff,
  AlertTriangle,
  BarChart3,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Map,
  Activity,
  Package
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { config } from "@/lib/config"
import { getDeviceStatsForUI, getDevicesForUI } from "@/services/device-api.service"
import type { UIDeviceCounts, UIDevice } from "@/types/api.types"

// Dynamically import the map component to avoid SSR issues
const AfricaMap = dynamic(() => import("./africa-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[700px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
})

export default function DevicesPage() {
  // State for device data
  const [devices, setDevices] = useState<UIDevice[]>([])
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
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
  
  // Fetch devices list
  const fetchDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch from the /devices endpoint
      const data = await getDevicesForUI()
      
      // Handle both array response and object with devices array
      const deviceList = Array.isArray(data) ? data : (data.devices || [])
      setDevices(deviceList)
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
  
  // Refresh all data
  const refreshData = () => {
    setIsRefreshing(true)
    Promise.all([fetchDeviceCounts(), fetchDevices()])
  }
  
  // Calculate percentages for the progress bars
  const calculatePercentage = useCallback((value) => {
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
  
  // Filter devices based on search term, status filter, and network filter
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        device.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.device_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.city?.toLowerCase().includes(searchTerm.toLowerCase())
        
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "online" && device.is_online === true) ||
        (statusFilter === "offline" && device.is_online === false) ||
        (statusFilter === "deployed" && device.status === "deployed") ||
        (statusFilter === "not_deployed" && device.status === "not deployed") ||
        (statusFilter === "recalled" && device.status === "recalled")
        
      const matchesNetwork = networkFilter === "all" || device.network === networkFilter
        
      return matchesSearch && matchesStatus && matchesNetwork
    })
  }, [devices, searchTerm, statusFilter, networkFilter])
  
  
  // Sort devices - online devices first, then by name
  const sortedDevices = useMemo(() => {
    return [...filteredDevices].sort((a, b) => {
      // First sort by online status
      if (a.is_online && !b.is_online) return -1;
      if (!a.is_online && b.is_online) return 1;
      
      // Then sort by deployment status
      if (a.status === "deployed" && b.status !== "deployed") return -1;
      if (a.status !== "deployed" && b.status === "deployed") return 1;
      
      // Then sort by name
      return (a.device_name || "").localeCompare(b.device_name || "");
    });
  }, [filteredDevices]);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedDevices.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate total pages
  const totalPages = Math.ceil(sortedDevices.length / itemsPerPage);
  
  // Get status badge variant
  const getStatusBadge = useCallback((device) => {
    if (device.is_online) {
      return { variant: "default", className: "bg-green-500 hover:bg-green-600", icon: Wifi, text: "Online" }
    }
    return { variant: "secondary", className: "bg-gray-500 hover:bg-gray-600", icon: WifiOff, text: "Offline" }
  }, [])
  
  // Get deployment status badge
  const getDeploymentBadge = useCallback((status) => {
    switch(status) {
      case "deployed":
        return { variant: "default", className: "bg-blue-500 hover:bg-blue-600", text: "Deployed" }
      case "not deployed":
        return { variant: "secondary", className: "bg-yellow-500 hover:bg-yellow-600", text: "Not Deployed" }
      case "recalled":
        return { variant: "destructive", className: "bg-red-500 hover:bg-red-600", text: "Recalled" }
      default:
        return { variant: "outline", className: "", text: status || "Unknown" }
    }
  }, [])
  
  // Get network badge color
  const getNetworkBadge = useCallback((network) => {
    const networkColors = {
      airbeam: "bg-purple-100 text-purple-800",
      airqo: "bg-blue-100 text-blue-800",
      lowcost: "bg-green-100 text-green-800",
      default: "bg-gray-100 text-gray-800"
    }
    return networkColors[network?.toLowerCase()] || networkColors.default
  }, [])
  
  // Handle device selection on map
  const handleDeviceSelect = useCallback((id) => {
    setSelectedDeviceId(id)
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
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add Device
          </Button>
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

      {showMap && (
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Device Locations
              </div>
              <Badge variant="outline" className="ml-2">
                Device Locations
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[700px] w-full">
              <AfricaMap
                devices={[]}
                onDeviceSelect={handleDeviceSelect}
                selectedDeviceId={selectedDeviceId || undefined}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-primary" />
            Device List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID, name, or location..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
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
                  onValueChange={(value) => setNetworkFilter(value)}
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
            </div>
          </div>

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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Device ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Deployment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Network</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((device) => {
                    const statusInfo = getStatusBadge(device)
                    const deploymentInfo = getDeploymentBadge(device.status)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <tr key={device.device_id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{device.device_id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{device.device_name || "Unnamed"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`flex items-center w-fit ${statusInfo.className}`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.text}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${deploymentInfo.className}`}>
                            {deploymentInfo.text}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {device.network && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkBadge(device.network)}`}>
                              {device.network}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {device.category || "-"}
                          </span>
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
                        <td className="py-3 px-4">
                          <Link
                            href={`/dashboard/devices/${device.device_id}`}
                            className="flex items-center text-primary hover:underline text-sm"
                          >
                            View <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedDevices.length)} of {sortedDevices.length} devices
                </div>
                
                <div className="flex items-center space-x-2">
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
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="mx-2 text-sm">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}