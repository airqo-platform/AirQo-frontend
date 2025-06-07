"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar as DatePicker } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import HealthTipsSection from "@/components/health-tips-section";


import { config } from "@/lib/config"



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

// Sample data for charts until we have real data from API
const generateSampleData = (days = 7) => {
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Generate some random data with occasional missing points
    const isMissing = Math.random() > 0.8
    
    data.push({
      date: dateStr,
      uptime: isMissing ? 0 : Math.floor(Math.random() * 30) + 70,
      dataCompleteness: isMissing ? 0 : Math.floor(Math.random() * 30) + 70,
      batteryLevel: Math.max(20, Math.floor(Math.random() * 30) + 60),
      signalStrength: isMissing ? 0 : Math.floor(Math.random() * 30) + 60,
      dataComplete: !isMissing
    })
  }
  
  return data
}

export default function DeviceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showMap, setShowMap] = useState(false)
  const [dataTimeRange, setDataTimeRange] = useState("10days")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filteredReadings, setFilteredReadings] = useState([])
  
  // Generate sample historical data for charts
  const [historicalData, setHistoricalData] = useState(generateSampleData(10))
  
  // Fetch device data from new API endpoint
  const fetchDeviceData = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      
      const deviceId = params.id
      // Use the new endpoint structure
      const response = await fetch(`${config.apiUrl}/device-detail/${deviceId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Device not found")
        }
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Prepare actual readings history data if available
      let preparedReadingsHistory = [];
      if (data.readings_history && data.readings_history.length > 0) {
        preparedReadingsHistory = data.readings_history.map(reading => ({
          date: reading.timestamp ? new Date(reading.timestamp).toISOString().split('T')[0] : 'Unknown',
          pm2_5: reading.pm2_5 || 0,
          pm10: reading.pm10 || 0,
          aqi_category: reading.aqi_category || 'Unknown'
        })).reverse(); // Display oldest to newest
      }
      
      // Add derived or calculated fields
      const enhancedDevice = {
        ...data,
        uptime: "98.5%", // Example default value if not provided by API
        dataCompleteness: "94.3%",
        mtbf: "120 days",
        mttr: "48 hours",
        failureRate: "8.2%",
        sensorHealth: "Good",
        calibrationDrift: "2.8%",
        batteryLife: data.device?.power_type === "battery" ? "14 months" : "N/A",
        batteryLevel: "85%", // Example default value if not provided by API
        signalStrength: "92%", // Example default value if not provided by API
        readingsHistory: preparedReadingsHistory.length > 0 ? preparedReadingsHistory : null
      }
      
      setDevice(enhancedDevice)
      
      // If there is readings history data, use it to update the historical charts
      if (preparedReadingsHistory.length > 0) {
        setHistoricalData(preparedReadingsHistory)
      }
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
    if (device?.readings_history && device.readings_history.length > 0) {
      // Format the selected date to YYYY-MM-DD for comparison
      const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd')
      
      // Filter readings for the selected date
      const filtered = device.readings_history.filter(reading => {
        if (!reading.timestamp) return false
        const readingDate = new Date(reading.timestamp).toISOString().split('T')[0]
        return readingDate === formattedSelectedDate
      })
      
      setFilteredReadings(filtered)
    }
  }, [selectedDate, device?.readings_history])
  
  // Function to get battery icon based on percentage
  const getBatteryIcon = useCallback((batteryStr) => {
    if (!batteryStr) return <Battery className="h-6 w-6 text-gray-400" />
    
    const percentage = parseInt(batteryStr.replace("%", ""))
    if (isNaN(percentage)) return <Battery className="h-6 w-6 text-gray-400" />
    
    if (percentage >= 70) return <BatteryCharging className="h-6 w-6 text-green-500" />
    if (percentage >= 30) return <Battery className="h-6 w-6 text-yellow-500" />
    return <BatteryLow className="h-6 w-6 text-red-500" />
  }, [])
  
  // Function to get status icon
  const getStatusIcon = useCallback((status) => {
    status = status?.toLowerCase()
    if (status === "active" || status === "deployed") return <Wifi className="h-5 w-5 text-green-500" />
    if (status === "warning") return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <WifiOff className="h-5 w-5 text-red-500" />
  }, [])
  
  // Function to get status badge for data transmission
  const getDataStatusBadge = useCallback((status) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-500">Complete</Badge>
      case "partial":
        return <Badge className="bg-yellow-500">Partial</Badge>
      case "missing":
        return <Badge className="bg-red-500">Missing</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
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
  
  // Get device status from API data
  const getDeviceStatus = () => {
    if (!device) return "unknown"
    if (device.device?.is_online) return "active"
    if (device.device?.status === "deployed") return "deployed"
    return "offline"
  }
  
  // Get location string from device data
  const getLocationString = () => {
    if (!device || !device.location) return "Unknown location"
    
    const location = []
    
    if (device.location.name) location.push(device.location.name)
    
    if (device.location.city && !device.location.name?.includes(device.location.city)) {
      location.push(device.location.city)
    }
    
    if (device.location.country && !device.location.name?.includes(device.location.country)) {
      location.push(device.location.country)
    }
    
    return location.length > 0 ? location.join(", ") : "Unknown location"
  }

  // Function to generate AI analysis of device data transmission patterns
  const generateDataTransmissionAnalysis = async () => {
    if (!device?.readings_history || device.readings_history.length === 0) {
      return "Insufficient data to generate analysis.";
    }
    
    try {
      // Group readings by date to identify data completeness patterns
      const readingsByDate = {};
      const expectedReadingsPerDay = 24; // Assuming hourly readings
      
      device.readings_history.forEach(reading => {
        const date = reading.timestamp ? 
          new Date(reading.timestamp).toISOString().split('T')[0] : 'Unknown';
        
        if (!readingsByDate[date]) {
          readingsByDate[date] = { count: 0, date };
        }
        readingsByDate[date].count++;
      });
      
      // Calculate transmission metrics
      const dates = Object.keys(readingsByDate);
      const dateCount = dates.length;
      const totalReadings = device.readings_history.length;
      const totalExpectedReadings = dateCount * expectedReadingsPerDay;
      const completenessRate = ((totalReadings / totalExpectedReadings) * 100).toFixed(1);
      
      // Find gaps in transmission
      const gapDays = [];
      if (dates.length > 1) {
        // Sort dates chronologically
        dates.sort();
        
        // Check for missing days between first and last date
        const startDate = new Date(dates[0]);
        const endDate = new Date(dates[dates.length - 1]);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (!readingsByDate[dateStr]) {
            gapDays.push(dateStr);
          }
        }
      }
      
      // Create the prompt for OpenAI focusing on transmission patterns
      const prompt = `
      Analyze this device's data transmission patterns:
      
      Device: ${device.device?.name || "Unnamed Device"} (ID: ${device.device?.id})
      Location: ${getLocationString()}
      Date Range: ${dates[0]} to ${dates[dates.length - 1]}
      Total Days with Data: ${dateCount} days
      Total Readings Received: ${totalReadings}
      Expected Readings Per Day: ${expectedReadingsPerDay}
      Overall Data Completeness: ${completenessRate}%
      Days with Missing Data: ${gapDays.length > 0 ? gapDays.join(', ') : "None"}
      
      Device Status: ${getDeviceStatus()}
      Power Type: ${device.device?.power_type || "Unknown"}
      Mount Type: ${device.device?.mount_type || "Unknown"}
      Network: ${device.device?.network || "Unknown"}
      
      Provide a technical analysis focused on:
      1. Data transmission reliability and patterns
      2. Potential causes for any identified transmission gaps
      3. Device connectivity health assessment
      4. Recommendations for improving data collection reliability
      5. Maintenance suggestions based on transmission patterns
      
      Format the analysis as bullet points for maintenance technicians.
      Avoid discussing air quality measurements - focus only on the device's data transmission performance.
      `;
      
      // Call our API route instead of OpenAI directly
      const response = await fetch('/api/analyze-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.analysis;
      
    } catch (error) {
      console.error("Error generating analysis:", error);
      return "Unable to generate device transmission analysis at this time. Please try again later.";
    }
  };
  
  // Sample failure and maintenance history
  const failureHistory = device?.maintenance_history || [
    {
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      maintenance_type: "Offline",
      description: "Device lost connection due to network issues"
    },
    {
      timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      maintenance_type: "Status Change",
      description: "Status changed to not deployed"
    }
  ]
  
  const maintenanceHistory = device?.maintenance_history || [
    {
      timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      maintenance_type: "Routine",
      description: "Regular maintenance and sensor calibration",
    },
    {
      timestamp: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      maintenance_type: "Installation",
      description: "Initial device installation and setup",
    }
  ]
  
  // Sample calibration drift data
  const calibrationDriftData = [
    { month: "Jan", pm25Drift: 0.5, pm10Drift: 0.8 },
    { month: "Feb", pm25Drift: 0.8, pm10Drift: 1.2 },
    { month: "Mar", pm25Drift: 1.2, pm10Drift: 1.8 },
    { month: "Apr", pm25Drift: 1.6, pm10Drift: 2.3 },
    { month: "May", pm25Drift: 2.1, pm10Drift: 2.8 },
    { month: "Jun", pm25Drift: 2.8, pm10Drift: 3.5 },
  ]
  
  // Simplified chart rendering functions
  const renderDataTransmissionChart = () => {
    if (!device?.readings_history || device.readings_history.length === 0) {
      return <div>No data available</div>;
    }
    
    // Group readings by date to count how many readings were received per day
    const readingsByDate = {};
    device.readings_history.forEach(reading => {
      const date = reading.timestamp ? new Date(reading.timestamp).toISOString().split('T')[0] : 'Unknown';
      if (!readingsByDate[date]) {
        readingsByDate[date] = { count: 0, date };
      }
      readingsByDate[date].count++;
    });
    
    // Convert to array for chart and add expected count
    const dataTransmissionStats = Object.values(readingsByDate).map(item => ({
      ...item,
      date: item.date,
      dataPoints: item.count,
      expectedDataPoints: 24 // Expected readings per day (e.g., hourly readings)
    }));
    
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
    );
  }
  
  const renderPerformanceChart = () => {
    // Use real readings data if available
    const chartData = device?.readingsHistory || historicalData
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {device?.readingsHistory ? (
            <>
              <Line type="monotone" dataKey="pm2_5" stroke="#4CAF50" name="PM2.5 (µg/m³)" />
              <Line type="monotone" dataKey="pm10" stroke="#2196F3" name="PM10 (µg/m³)" />
            </>
          ) : (
            <>
              <Line type="monotone" dataKey="uptime" stroke="#4CAF50" name="Uptime (%)" />
              <Line type="monotone" dataKey="dataCompleteness" stroke="#2196F3" name="Data Completeness (%)" />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    )
  }
  
  const renderBatteryChart = () => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={historicalData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="batteryLevel" stroke="#FF9800" name="Battery Level (%)" />
        </LineChart>
      </ResponsiveContainer>
    )
  }
  
  const renderCalibrationChart = () => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={calibrationDriftData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pm25Drift" stroke="#8884d8" name="PM2.5 Drift (%)" />
          <Line type="monotone" dataKey="pm10Drift" stroke="#82ca9d" name="PM10 Drift (%)" />
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
    id: device.device?.id || "unknown",
    name: device.device?.name || "Unnamed Device",
    status: device.device?.is_online ? "active" : "offline",
    lat: device.location?.latitude,
    lng: device.location?.longitude,
    latest_reading: device.latest_reading,
    lastUpdate: device.device?.last_updated ? 
      new Date(device.device.last_updated).toLocaleString() : undefined
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
                  {getStatusIcon(getDeviceStatus())}
                  <CardTitle className="ml-2">{device.device?.name || "Unnamed Device"}</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  ID: {device.device?.id} • {getLocationString()}
                </CardDescription>
              </div>
              <Badge
                className={
                  getDeviceStatus() === "active"
                    ? "bg-green-500 hover:bg-green-600"
                    : getDeviceStatus() === "deployed"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-red-500 hover:bg-red-600"
                }
              >
                {getDeviceStatus().toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] w-full">
              {showMap && device.location?.latitude && device.location?.longitude ? (
                <DeviceMap devices={[mapDevice]} selectedDeviceId={device.device?.id} />
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
              Last updated: {device.device?.last_updated ? formatDate(device.device.last_updated) + ' ' + new Date(device.device.last_updated).toLocaleTimeString() : "Unknown"}
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
                    <p className="text-xl font-semibold capitalize">{getDeviceStatus()}</p>
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
                      <p className="font-medium">{device.device?.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex items-center">
                        {getStatusIcon(getDeviceStatus())}
                        <span className="ml-1 capitalize">{getDeviceStatus()}</span>
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
                        {device.site.name && (
                          <div>
                            <p className="text-sm text-gray-500">Site Name</p>
                            <p className="font-medium">{device.site.name}</p>
                          </div>
                        )}
                        {device.site.data_provider && (
                          <div>
                            <p className="text-sm text-gray-500">Data Provider</p>
                            <p className="font-medium">{device.site.data_provider}</p>
                          </div>
                        )}
                        {device.site.category && (
                          <div>
                            <p className="text-sm text-gray-500">Site Category</p>
                            <p className="font-medium">{device.site.category}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Location information if available */}
                  {device.location && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Administrative Location</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {device.location.country && (
                          <div>
                            <p className="text-sm text-gray-500">Country</p>
                            <p className="font-medium">{device.location.country}</p>
                          </div>
                        )}
                        {device.location.city && (
                          <div>
                            <p className="text-sm text-gray-500">City</p>
                            <p className="font-medium">{device.location.city}</p>
                          </div>
                        )}
                        {device.location.division && (
                          <div>
                            <p className="text-sm text-gray-500">Division</p>
                            <p className="font-medium">{device.location.division}</p>
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
              <div className="h-80">{renderDataTransmissionChart()}</div>

              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Latest Data Readings</h3>
                {device.latest_reading?.pm2_5 !== undefined || device.latest_reading?.pm10 !== undefined ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      {device.latest_reading.pm2_5 !== undefined && (
                        <div>
                          <p className="text-sm text-gray-500">PM2.5</p>
                          <p className="text-xl font-semibold">{typeof device.latest_reading.pm2_5 === 'number' ? device.latest_reading.pm2_5.toFixed(1) : device.latest_reading.pm2_5} µg/m³</p>
                        </div>
                      )}
                      {device.latest_reading.pm10 !== undefined && (
                        <div>
                          <p className="text-sm text-gray-500">PM10</p>
                          <p className="text-xl font-semibold">{typeof device.latest_reading.pm10 === 'number' ? device.latest_reading.pm10.toFixed(1) : device.latest_reading.pm10} µg/m³</p>
                        </div>
                      )}
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
                          <p className="font-medium">{formatDate(device.latest_reading.timestamp)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-gray-500">No sensor readings available</p>
                  </div>
                )}

                <h3 className="text-md font-medium mt-4 mb-2 flex justify-between items-center">
                <span>Data Transmission Summary</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                  <DatePicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                  />
                </PopoverContent>
                </Popover>
              </h3>
              {device?.readings_history && device.readings_history.length > 0 ? (
                filteredReadings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">PM2.5</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">PM10</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">AQI Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReadings.map((reading) => (
                          <tr key={reading.timestamp} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">{new Date(reading.timestamp).toLocaleTimeString()}</td>
                            <td className="py-3 px-4">{typeof reading.pm2_5 === 'number' ? reading.pm2_5.toFixed(1) : (reading.pm2_5 || 'N/A')} µg/m³</td>
                            <td className="py-3 px-4">{typeof reading.pm10 === 'number' ? reading.pm10.toFixed(1) : (reading.pm10 || 'N/A')} µg/m³</td>
                            <td className="py-3 px-4">
                              {reading.aqi_category ? (
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
                              ) : (
                                'N/A'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null
              ) : null}
              </div>
            
            </CardContent>
            <CardFooter className="bg-gray-50 border-t px-4 py-3">

            <HealthTipsSection 
            deviceId={device?.device?.id} 
            readingKey={device?.latest_reading?.reading_key}
            airQuality={device?.latest_reading?.aqi_category}
          />
            </CardFooter>
          </Card>
        </TabsContent>

        {/* <TabsContent value="performance" className="space-y-4">
        <DevicePerformanceMetrics
        deviceId={device?.device?.id}
      />
        
        </TabsContent> */}
      </Tabs>
    </div>
  
)
}
