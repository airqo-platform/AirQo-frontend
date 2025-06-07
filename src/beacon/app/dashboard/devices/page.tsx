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
  Layers,
  Map
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { config } from "@/lib/config"



// Dynamically import the map component to avoid SSR issues
const AfricaMap = dynamic(() => import("./africa-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Loading map of Africa...</p>
      </div>
    </div>
  ),
})

export default function DevicesPage() {
  // State for device data
  const [devices, setDevices] = useState([])
  const [deviceCounts, setDeviceCounts] = useState({
    total_devices: 0,
    active_devices: 0,
    offline_devices: 0,
    deployed_devices: 0,
    not_deployed: 0,
    recalled_devices: 0
  })
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showMap, setShowMap] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Fetch device counts
  const fetchDeviceCounts = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/device-counts`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      setDeviceCounts(data)
    } catch (err) {
      console.error("Error fetching device counts:", err)
      setError("Failed to load device counts")
    }
  }
  
  // Fetch devices list
  const fetchDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the valid-device-locations endpoint because it includes readings and locations
      const response = await fetch(`${config.apiUrl}/valid-device-locations`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      setDevices(data)
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
  const notDeployedPercentage = calculatePercentage(deviceCounts.not_deployed)
  const recalledPercentage = calculatePercentage(deviceCounts.recalled_devices)
  
  // Filter devices based on search term and status filter
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        (device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "ACTIVE" && device.status === "ACTIVE") ||
        (statusFilter === "INACTIVE" && device.status === "INACTIVE")
        
      return matchesSearch && matchesStatus
    })
  }, [devices, searchTerm, statusFilter])
  
  // Filter devices with valid coordinates for the map
  const devicesWithValidCoordinates = useMemo(() => {
    return devices.filter(device => 
      device.latitude !== undefined && 
      device.latitude !== null && 
      device.longitude !== undefined && 
      device.longitude !== null &&
      !isNaN(parseFloat(device.latitude)) &&
      !isNaN(parseFloat(device.longitude))
    )
  }, [devices])
  
  // Count devices with valid and invalid coordinates
  const validCoordinatesCount = devicesWithValidCoordinates.length
  const invalidCoordinatesCount = devices.length - validCoordinatesCount
  
  // Sort devices - active devices first
  const sortedDevices = useMemo(() => {
    return [...filteredDevices].sort((a, b) => {
      // First sort by status (active first)
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      
      // Then sort by name
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [filteredDevices]);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedDevices.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Calculate total pages
  const totalPages = Math.ceil(sortedDevices.length / itemsPerPage);
  
  // Format the reading timestamp to show how long ago it was
  const formatLastUpdate = useCallback((timestamp) => {
    if (!timestamp) return "Unknown"
    
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffMins < 60) {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
      } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
      } else {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
      }
    } catch (e) {
      return "Invalid date"
    }
  }, [])
  
  // Format date for display
  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return ""
    
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString()
    } catch (e) {
      return ""
    }
  }, [])
  
  // Function to get status badge color
  const getStatusBadgeClass = useCallback((status) => {
    return status === "ACTIVE" 
      ? "bg-green-500 hover:bg-green-600" 
      : "bg-red-500 hover:bg-red-600"
  }, [])
  
  // Function to get AQI color based on PM2.5 value
  const getPM25Color = useCallback((value) => {
    if (value === null || value === undefined) return "bg-gray-400"
    if (value < 12) return "bg-green-500"
    if (value < 35.4) return "bg-yellow-500"
    if (value < 55.4) return "bg-orange-500"
    if (value < 150.4) return "bg-red-500"
    if (value < 250.4) return "bg-purple-500"
    return "bg-red-900"
  }, [])
  
  // Function to get AQI color based on PM10 value
  const getPM10Color = useCallback((value) => {
    if (value === null || value === undefined) return "bg-gray-400"
    if (value < 54) return "bg-green-500"
    if (value < 154) return "bg-yellow-500"
    if (value < 254) return "bg-orange-500"
    if (value < 354) return "bg-red-500"
    if (value < 424) return "bg-purple-500"
    return "bg-red-900"
  }, [])
  
  // Handle device selection on map
  const handleDeviceSelect = useCallback((id) => {
    setSelectedDeviceId(id)
  }, [])
  
  // Count devices by status for map legend (but only for devices with valid coordinates)
  const activeDevicesOnMap = useMemo(() => 
    devicesWithValidCoordinates.filter(d => d.status === "ACTIVE").length, 
    [devicesWithValidCoordinates]
  );
  
  const inactiveDevicesOnMap = useMemo(() => 
    devicesWithValidCoordinates.filter(d => d.status === "INACTIVE").length, 
    [devicesWithValidCoordinates]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Device Management</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Total Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {loading ? '...' : deviceCounts.total_devices}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Devices deployed across Africa</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-500/10 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wifi className="mr-2 h-5 w-5 text-green-500" />
              Active Devices
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
          <CardHeader className="pb-2 bg-gradient-to-r from-red-500/10 to-transparent">
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
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-500" />
              Deployed Devices
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

      <Card className="hover:shadow-md transition-shadow overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Device Locations Across Africa
            </div>
            {devicesWithValidCoordinates.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {devicesWithValidCoordinates.length} devices with location data
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {devicesWithValidCoordinates.length === 0 ? (
            <div className="h-[300px] w-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Map className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">No devices with valid location data</p>
                <p className="text-gray-500 text-sm mt-1">Add location coordinates to devices to see them on the map</p>
              </div>
            </div>
          ) : (
            <>
              <div className="h-[600px] w-full">
                {showMap ? (
                  <AfricaMap
                    devices={devicesWithValidCoordinates}
                    onDeviceSelect={handleDeviceSelect}
                    selectedDeviceId={selectedDeviceId || undefined}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Loading map of Africa...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 flex items-center justify-between border-t">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Active ({activeDevicesOnMap})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">Inactive ({inactiveDevicesOnMap})</span>
                  </div>
                </div>
                
                {invalidCoordinatesCount > 0 && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                    {invalidCoordinatesCount} {invalidCoordinatesCount === 1 ? 'device is' : 'devices are'} missing valid coordinates
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center items-center">
              <RefreshCw className="h-10 w-10 text-primary animate-spin" />
              <span className="ml-4 text-lg">Loading device data...</span>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Last Update</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">PM2.5</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">PM10</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((device) => (
                    <tr key={device.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium">{device.id}</td>
                      <td className="py-3 px-4">{device.name || "Unnamed Device"}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`flex items-center ${getStatusBadgeClass(device.status)}`}
                        >
                          {device.status === "ACTIVE" ? (
                            <Wifi className="mr-1 h-3 w-3" />
                          ) : (
                            <WifiOff className="mr-1 h-3 w-3" />
                          )}
                          {device.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{device.location?.name || "Unknown"}</span>
                          {device.location?.admin_level_city && (
                            <span className="text-xs text-gray-500">
                              {[
                                device.location.admin_level_city,
                                device.location.admin_level_country
                              ].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {device.reading_timestamp ? (
                          <div className="flex flex-col">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-gray-400" />
                              {formatLastUpdate(device.reading_timestamp)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(device.reading_timestamp)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No recent data</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {device.pm2_5 !== undefined && device.pm2_5 !== null ? (
                          <div className="flex items-center">
                            <div
                              className={`h-2 w-2 rounded-full mr-2 ${getPM25Color(device.pm2_5)}`}
                            ></div>
                            {parseFloat(device.pm2_5).toFixed(1)} µg/m³
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {device.pm10 !== undefined && device.pm10 !== null ? (
                          <div className="flex items-center">
                            <div
                              className={`h-2 w-2 rounded-full mr-2 ${getPM10Color(device.pm10)}`}
                            ></div>
                            {parseFloat(device.pm10).toFixed(1)} µg/m³
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/devices/${device.id}`}
                          className="flex items-center text-primary hover:underline"
                        >
                          View Details <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
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
                      setCurrentPage(1); // Reset to first page when changing items per page
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
          
          {/* Last updated info */}
          <div className="mt-4 flex justify-end items-center text-sm text-gray-500">
            {devices.length > 0 && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Last updated: {new Date().toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}