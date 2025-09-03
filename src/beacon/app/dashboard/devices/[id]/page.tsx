"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts"
import {
  ArrowLeft,
  Battery,
  BatteryCharging,
  BatteryLow,
  Clock,
  Download,
  MapPin,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
  AlertTriangle,
  Activity,
  Calendar,
  Zap,
  Timer,
  Wrench,
  Database,
  Info,
} from "lucide-react"
import dynamic from "next/dynamic"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { config } from "@/lib/config"
import authService from "@/services/api-service"

// Dynamically import the map component with no SSR
const DeviceMap = dynamic(() => import("../device-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
})

// Helper function to calculate AQI category based on PM2.5 values
const calculateAQICategory = (pm25) => {
  if (!pm25 || pm25 === null) return "Unknown"
  if (pm25 <= 12) return "Good"
  if (pm25 <= 35.4) return "Moderate"
  if (pm25 <= 55.4) return "Unhealthy for Sensitive Groups"
  if (pm25 <= 150.4) return "Unhealthy"
  if (pm25 <= 250.4) return "Very Unhealthy"
  return "Hazardous"
}

export default function DeviceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [device, setDevice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showMap, setShowMap] = useState(false)
  const [dataTimeRange, setDataTimeRange] = useState("10days")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filteredReadings, setFilteredReadings] = useState<any[]>([])
  const [performance, setPerformance] = useState<any>(null)
  const [readings, setReadings] = useState<any>(null)
  
  // Fetch performance data
  const fetchPerformanceData = async (deviceId: string, days: number = 7) => {
    try {
      const apiPath = config.isLocalhost ? 
        `/devices/${deviceId}/performance?days=${days}` :
        `/api/v1/beacon/devices/${deviceId}/performance?days=${days}`
      
      const response = await fetch(
        `${config.apiUrl}${apiPath}`,
        {
          headers: {
            'Authorization': authService.getToken() || '',
            'Content-Type': 'application/json'
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setPerformance(data)
      }
    } catch (error) {
      console.error("Error fetching performance data:", error)
    }
  }

  // Fetch readings data
  const fetchReadingsData = async (deviceId: string, limit: number = 100) => {
    try {
      const apiPath = config.isLocalhost ? 
        `/devices/${deviceId}/readings?limit=${limit}` :
        `/api/v1/beacon/devices/${deviceId}/readings?limit=${limit}`
      
      const response = await fetch(
        `${config.apiUrl}${apiPath}`,
        {
          headers: {
            'Authorization': authService.getToken() || '',
            'Content-Type': 'application/json'
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setReadings(data)
        
        // Process readings to add calculated fields
        if (data.readings && data.readings.length > 0) {
          const processedReadings = data.readings.map((reading: any) => ({
            ...reading,
            aqi_category: calculateAQICategory(reading.pm2_5)
          }))
          setReadings({ ...data, readings: processedReadings })
        }
      }
    } catch (error) {
      console.error("Error fetching readings data:", error)
    }
  }

  // Fetch device data from new API endpoint
  const fetchDeviceData = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      
      const deviceId = params.id as string
      // Use the new endpoint structure - /devices/{device_id} for localhost
      const apiPath = config.isLocalhost ? 
        `/devices/${deviceId}` :
        `/api/v1/beacon/devices/${deviceId}`
      
      const response = await fetch(`${config.apiUrl}${apiPath}`, {
        headers: {
          'Authorization': authService.getToken() || '',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Device not found")
        }
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform flat API response to expected nested structure
      const transformedData = {
        device: {
          device_id: data.device_id,
          device_name: data.device_name,
          device_key: data.device_key,
          is_online: data.is_online,
          status: data.status,
          power_type: data.power_type,
          mount_type: data.mount_type,
          height: data.height,
          network: data.network,
          category: data.category,
          next_maintenance: data.next_maintenance,
          first_seen: data.first_seen,
          last_updated: data.last_updated,
          created_at: data.created_at,
          updated_at: data.updated_at
        },
        location: {
          latitude: data.location?.latitude || data.latitude,
          longitude: data.location?.longitude || data.longitude,
          search_name: data.recent_reading?.site_name || data.site_name,
          location_name: data.recent_reading?.site_name || data.site_name,
          admin_level_country: null,
          admin_level_city: null,
          admin_level_division: null,
          deployment_date: data.first_seen
        },
        latest_reading: data.recent_reading ? {
          timestamp: data.recent_reading.timestamp,
          pm2_5: data.recent_reading.pm2_5,
          pm10: data.recent_reading.pm10,
          temperature: data.recent_reading.temperature,
          humidity: data.recent_reading.humidity,
          aqi_category: calculateAQICategory(data.recent_reading.pm2_5)
        } : null,
        recent_readings: [],
        maintenance_history: [],
        site: {
          site_name: data.site_name
        }
      }
      
      setDevice(transformedData)
      
      // Fetch performance and readings data
      await fetchPerformanceData(deviceId, 7)
      await fetchReadingsData(deviceId, 100)
    } catch (err) {
      console.error("Error fetching device data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }
  
  useEffect(() => {
    fetchDeviceData()
    
    // Delay showing the map to avoid React reconciliation issues
    const timer = setTimeout(() => {
      setShowMap(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [params.id])

  useEffect(() => {
    if (readings && readings.readings && readings.readings.length > 0) {
      // Format the selected date to YYYY-MM-DD for comparison
      const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd')
      
      // Filter readings for the selected date
      const filtered = readings.readings.filter((reading: any) => {
        if (!reading.created_at) return false
        const readingDate = new Date(reading.created_at).toISOString().split('T')[0]
        return readingDate === formattedSelectedDate
      })
      
      setFilteredReadings(filtered)
    }
  }, [selectedDate, readings])
  
  // Function to get battery icon based on battery value
  const getBatteryIcon = useCallback((batteryLevel) => {
    if (!batteryLevel && batteryLevel !== 0) return <Battery className="h-6 w-6 text-gray-400" />
    
    const percentage = typeof batteryLevel === 'number' ? batteryLevel : 
      parseFloat(batteryLevel.toString().replace("%", ""))
    
    if (isNaN(percentage)) return <Battery className="h-6 w-6 text-gray-400" />
    
    if (percentage >= 70) return <BatteryCharging className="h-6 w-6 text-green-500" />
    if (percentage >= 30) return <Battery className="h-6 w-6 text-yellow-500" />
    return <BatteryLow className="h-6 w-6 text-red-500" />
  }, [])
  
  // Function to get status icon
  const getStatusIcon = useCallback((isOnline) => {
    if (isOnline) return <Wifi className="h-5 w-5 text-green-500" />
    return <WifiOff className="h-5 w-5 text-red-500" />
  }, [])
  
  // Function to refresh data
  const handleRefresh = () => {
    fetchDeviceData()
  }
  
  // Format dates for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown"
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch (e) {
      return dateStr
    }
  }
  
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Unknown"
    try {
      const date = new Date(dateStr)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    } catch (e) {
      return dateStr
    }
  }
  
  // Get location string from device data
  const getLocationString = () => {
    if (!device || !device.location) return "Unknown location"
    
    const parts = []
    
    if (device.location.search_name) {
      parts.push(device.location.search_name)
    }
    
    if (device.location.location_name) {
      parts.push(device.location.location_name)
    }
    
    if (device.location.admin_level_country) {
      parts.push(device.location.admin_level_country)
    }
    
    return parts.length > 0 ? parts.join(", ") : "Unknown location"
  }
  
  // Render data transmission chart
  const renderDataTransmissionChart = () => {
    if (!readings || !readings.readings || readings.readings.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          No data available for visualization
        </div>
      )
    }
    
    // Group readings by date to count how many readings were received per day
    const readingsByDate: Record<string, { count: number; date: string }> = {}
    readings.readings.forEach((reading: any) => {
      const date = reading.created_at ? new Date(reading.created_at).toISOString().split('T')[0] : 'Unknown'
      if (!readingsByDate[date]) {
        readingsByDate[date] = { count: 0, date }
      }
      readingsByDate[date].count++
    })
    
    // Convert to array for chart and add expected count
    const dataTransmissionStats = Object.values(readingsByDate).map(item => ({
      ...item,
      date: item.date,
      dataPoints: item.count,
      expectedDataPoints: 48 // Expected readings per day (every 30 minutes)
    }))
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dataTransmissionStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="dataPoints" fill="#2196F3" name="Readings Received" />
          <Bar dataKey="expectedDataPoints" fill="#E0E0E0" name="Expected Readings" />
        </BarChart>
      </ResponsiveContainer>
    )
  }
  
  // Render performance chart
  const renderPerformanceChart = () => {
    if (!readings || !readings.readings || readings.readings.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          No readings available for chart
        </div>
      )
    }
    
    // Prepare data for chart - limit to last 10 days for readability
    const chartData = readings.readings.slice(0, 240).map((reading: any) => ({
      date: reading.created_at ? new Date(reading.created_at).toISOString().split('T')[0] : 'Unknown',
      pm2_5: reading.pm2_5,
      pm10: reading.pm10,
      temperature: reading.temperature,
      humidity: reading.humidity
    })).reverse() // Show oldest to newest
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pm2_5" stroke="#4CAF50" name="PM2.5 (µg/m³)" />
          <Line type="monotone" dataKey="pm10" stroke="#2196F3" name="PM10 (µg/m³)" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mb-2" />
          <p>Loading device information...</p>
        </div>
      </div>
    )
  }

  if (error || !device) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Devices
        </Button>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Device Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The device you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => router.push("/dashboard/devices")}>View All Devices</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Create a single device for map with proper format
  const mapDevice = {
    id: device.device?.device_id || "unknown",
    name: device.device?.device_name || "Unnamed Device",
    status: device.device?.is_online ? "active" : "offline",
    lat: device.location?.latitude || 0,
    lng: device.location?.longitude || 0,
    latest_reading: device.latest_reading,
    lastUpdate: device.device?.last_updated ? formatDateTime(device.device.last_updated) : undefined
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Devices
        </Button>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  {getStatusIcon(device.device?.is_online)}
                  <CardTitle className="ml-2">{device.device?.device_name || "Unnamed Device"}</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  ID: {device.device?.device_id} • {getLocationString()}
                </CardDescription>
              </div>
              <Badge
                className={
                  device.device?.is_online
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }
              >
                {device.device?.is_online ? "ONLINE" : "OFFLINE"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] w-full">
              {showMap && device.location?.latitude && device.location?.longitude ? (
                <DeviceMap devices={[mapDevice]} selectedDeviceId={device.device?.device_id} />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    {!showMap ? (
                      <>
                        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Loading map...</p>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-gray-500">No location data available for this device</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t p-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              Last updated: {formatDateTime(device.device?.last_updated)}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
            <CardTitle className="text-lg">Device Health</CardTitle>
            <CardDescription>Current performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Activity className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-xl font-semibold capitalize">{device.device?.status || "unknown"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Zap className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Power Type</p>
                    <p className="text-xl font-semibold capitalize">{device.device?.power_type || "Unknown"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mount Type</p>
                    <p className="text-xl font-semibold capitalize">{device.device?.mount_type || "Unknown"}</p>
                  </div>
                </div>
              </div>

              {device.device?.next_maintenance && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Calendar className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Maintenance</p>
                      <p className="text-xl font-semibold">{formatDate(device.device.next_maintenance)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data-transmission">Data Transmission</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                <CardTitle className="text-lg">Device Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Device ID</p>
                      <p className="font-medium">{device.device?.device_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex items-center">
                        {getStatusIcon(device.device?.is_online)}
                        <span className="ml-1">{device.device?.is_online ? "Online" : "Offline"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">First Seen</p>
                      <p className="font-medium">{formatDate(device.device?.first_seen)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(device.device?.last_updated)}</p>
                    </div>
                    {device.device?.network && (
                      <div>
                        <p className="text-sm text-gray-500">Network</p>
                        <p className="font-medium">{device.device.network}</p>
                      </div>
                    )}
                    {device.device?.category && (
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{device.device.category}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{getLocationString()}</p>
                  </div>
                  {device.device?.height && (
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-medium">{device.device.height} m</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                <CardTitle className="text-lg">Location Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {device.location?.latitude && device.location?.longitude && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Latitude</p>
                          <p className="font-medium">{device.location.latitude}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Longitude</p>
                          <p className="font-medium">{device.location.longitude}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Site information if available */}
                  {device.site && Object.values(device.site).some(value => value) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Site Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {device.site.site_name && (
                          <div>
                            <p className="text-sm text-gray-500">Site Name</p>
                            <p className="font-medium">{device.site.site_name}</p>
                          </div>
                        )}
                        {device.site.data_provider && (
                          <div>
                            <p className="text-sm text-gray-500">Data Provider</p>
                            <p className="font-medium">{device.site.data_provider}</p>
                          </div>
                        )}
                        {device.site.site_category && (
                          <div>
                            <p className="text-sm text-gray-500">Site Category</p>
                            <p className="font-medium">{device.site.site_category}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Administrative Location */}
                  {device.location && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Administrative Location</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {device.location.admin_level_country && (
                          <div>
                            <p className="text-sm text-gray-500">Country</p>
                            <p className="font-medium">{device.location.admin_level_country}</p>
                          </div>
                        )}
                        {device.location.admin_level_city && (
                          <div>
                            <p className="text-sm text-gray-500">City</p>
                            <p className="font-medium">{device.location.admin_level_city}</p>
                          </div>
                        )}
                        {device.location.admin_level_division && (
                          <div>
                            <p className="text-sm text-gray-500">Division</p>
                            <p className="font-medium">{device.location.admin_level_division}</p>
                          </div>
                        )}
                        {device.location.deployment_date && (
                          <div>
                            <p className="text-sm text-gray-500">Deployment Date</p>
                            <p className="font-medium">{formatDate(device.location.deployment_date)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance History */}
          {device.maintenance_history && device.maintenance_history.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                <CardTitle className="text-lg">Recent Status Changes</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {device.maintenance_history.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${
                          entry.is_online ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium capitalize">
                            {entry.change_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: {entry.device_status} • {entry.is_online ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{formatDateTime(entry.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data-transmission" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Database className="mr-2 h-5 w-5 text-primary" />
                    Data Transmission History
                  </CardTitle>
                  <CardDescription>Track when data was sent and when it was missing</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    className="border rounded-md p-2 text-sm"
                    value={dataTimeRange}
                    onChange={(e) => setDataTimeRange(e.target.value)}
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="10days">Last 10 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Performance Metrics */}
              {performance && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Uptime</p>
                      <p className="text-2xl font-bold">{performance.metrics?.uptime_percentage || 0}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Data Completeness</p>
                      <p className="text-2xl font-bold">{performance.metrics?.data_completeness || 0}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Total Readings</p>
                      <p className="text-2xl font-bold">{performance.metrics?.total_readings || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Valid Readings</p>
                      <p className="text-2xl font-bold">{performance.metrics?.valid_readings || 0}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="h-80">{renderDataTransmissionChart()}</div>

              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Latest Data Reading</h3>
                {device.latest_reading ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">PM2.5</p>
                        <p className="text-xl font-semibold">
                          {device.latest_reading.pm2_5 !== null && device.latest_reading.pm2_5 !== undefined ? 
                            `${device.latest_reading.pm2_5.toFixed(1)} µg/m³` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">PM10</p>
                        <p className="text-xl font-semibold">
                          {device.latest_reading.pm10 !== null && device.latest_reading.pm10 !== undefined ? 
                            `${device.latest_reading.pm10.toFixed(1)} µg/m³` : 'N/A'}
                        </p>
                      </div>
                      {device.latest_reading.aqi_category && (
                        <div>
                          <p className="text-sm text-gray-500">AQI Category</p>
                          <Badge className={
                            device.latest_reading.aqi_category === "Good" ? "bg-green-500" :
                            device.latest_reading.aqi_category === "Moderate" ? "bg-yellow-500" :
                            device.latest_reading.aqi_category === "Unhealthy for Sensitive Groups" ? "bg-orange-500" :
                            device.latest_reading.aqi_category === "Unhealthy" ? "bg-red-500" :
                            device.latest_reading.aqi_category === "Very Unhealthy" ? "bg-purple-500" :
                            device.latest_reading.aqi_category === "Hazardous" ? "bg-red-800" : "bg-gray-500"
                          }>
                            {device.latest_reading.aqi_category}
                          </Badge>
                        </div>
                      )}
                      {device.latest_reading.timestamp && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Reading Time</p>
                          <p className="font-medium">{formatDateTime(device.latest_reading.timestamp)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-gray-500">No sensor readings available</p>
                  </div>
                )}

                <h3 className="text-md font-medium mt-6 mb-2 flex justify-between items-center">
                  <span>Recent Readings</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <input
                      type="date"
                      value={format(selectedDate, 'yyyy-MM-dd')}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="border rounded-md px-3 py-1 text-sm"
                    />
                  </div>
                </h3>

                {readings && readings.readings && readings.readings.length > 0 ? (
                  <div className="h-80 mb-6">{renderPerformanceChart()}</div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-gray-500">No recent readings available</p>
                  </div>
                )}

                {filteredReadings.length > 0 && (
                  <div className="overflow-x-auto">
                    <h4 className="text-sm font-medium mb-2">Readings for {format(selectedDate, "PPP")}</h4>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">PM2.5</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">PM10</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Temp</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Humidity</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">AQI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReadings.map((reading, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">{new Date(reading.created_at).toLocaleTimeString()}</td>
                            <td className="py-3 px-4">
                              {reading.pm2_5 !== null && reading.pm2_5 !== undefined ? 
                                `${reading.pm2_5.toFixed(1)} µg/m³` : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              {reading.pm10 !== null && reading.pm10 !== undefined ? 
                                `${reading.pm10.toFixed(1)} µg/m³` : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              {reading.temperature !== null && reading.temperature !== undefined ? 
                                `${reading.temperature.toFixed(1)}°C` : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              {reading.humidity !== null && reading.humidity !== undefined ? 
                                `${reading.humidity.toFixed(1)}%` : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                reading.aqi_category === "Good" ? "bg-green-500" :
                                reading.aqi_category === "Moderate" ? "bg-yellow-500" :
                                reading.aqi_category === "Unhealthy for Sensitive Groups" ? "bg-orange-500" :
                                reading.aqi_category === "Unhealthy" ? "bg-red-500" :
                                reading.aqi_category === "Very Unhealthy" ? "bg-purple-500" :
                                reading.aqi_category === "Hazardous" ? "bg-red-800" : "bg-gray-500"
                              }>
                                {reading.aqi_category}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}