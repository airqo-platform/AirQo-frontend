
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { HelpCircle, TrendingUp, TrendingDown, Wind, Thermometer } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts"
import {
  Download,
  RefreshCw,
  Activity,
  AlertTriangle,
  Settings,
  MapPin,
  Info,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { config } from "@/lib/config"



// AQI color mapping
const aqiColors = {
  "good": "#4CAF50",
  "moderate": "#FFC107",
  "unhealthy for sensitive groups": "#FF9800",
  "unhealthy": "#F44336",
  "very unhealthy": "#9C27B0",
  "hazardous": "#B71C1C"
}


const formatNumber = (value, decimals = 1) => {
    // Check if value is null, undefined, or not a number
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "N/A";
    }
    return Number(value).toFixed(decimals) + " μg/m³";
  };

export default function SiteAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("week")
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [locationData, setLocationData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch locations list on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${config.apiUrl}/site-analytics/locations`)
        if (!response.ok) {
          throw new Error('Failed to fetch locations')
        }
        const data = await response.json()
        
        // Filter to unique location_ids by creating a Map
        // This ensures each location_id only appears once in the dropdown
        const uniqueLocationsMap = new Map();
        
        data.forEach(location => {
          // If we haven't seen this location_id before, or want to replace with a better entry
          if (!uniqueLocationsMap.has(location.location_id)) {
            uniqueLocationsMap.set(location.location_id, location);
          }
        });
        
        // Convert Map back to array
        const uniqueLocations = Array.from(uniqueLocationsMap.values());
        
        setLocations(uniqueLocations)
        
        // Set the first location as default if available
        if (uniqueLocations.length > 0 && !selectedLocation) {
          setSelectedLocation(uniqueLocations[0].location_id)
        }
      } catch (err) {
        setError('Error loading locations: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocations()
  }, [])

  // Fetch location data when selectedLocation or timeRange changes
  useEffect(() => {
    if (!selectedLocation) return
    
    const fetchLocationData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Make sure to include both the location ID and time range in the request
        const response = await fetch(`${config.apiUrl}/site-analytics/location/${selectedLocation}?time_range=${timeRange}`)
        if (!response.ok) {
          throw new Error('Failed to fetch location data')
        }
        const data = await response.json()
        setLocationData(data)
      } catch (err) {
        setError('Error loading location data: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocationData()
  }, [selectedLocation, timeRange])

  // Handle refresh
  const handleRefresh = () => {
    if (selectedLocation) {
      const fetchLocationData = async () => {
        setIsLoading(true)
        setError(null)
        
        try {
          const response = await fetch(`${config.apiUrl}/site-analytics/locations/${selectedLocation}?time_range=${timeRange}`)
          if (!response.ok) {
            throw new Error('Failed to fetch location data')
          }
          const data = await response.json()
          setLocationData(data)
        } catch (err) {
          setError('Error refreshing data: ' + err.message)
        } finally {
          setIsLoading(false)
        }
      }

      fetchLocationData()
    }
  }

  // Format the AQI distribution data for charts
  const formatAqiDistributionForChart = (aqiData) => {
    if (!aqiData) return []
    
    return [
      { name: "Good", value: aqiData.good || 0, color: "#4CAF50" },
      { name: "Moderate", value: aqiData.moderate || 0, color: "#FFC107" },
      { name: "Unhealthy for Sensitive Groups", value: aqiData.unhealthy_sensitive || 0, color: "#FF9800" },
      { name: "Unhealthy", value: aqiData.unhealthy || 0, color: "#F44336" },
      { name: "Very Unhealthy", value: aqiData.very_unhealthy || 0, color: "#9C27B0" },
      { name: "Hazardous", value: aqiData.hazardous || 0, color: "#B71C1C" }
    ].filter(item => item.value > 0) // Only include non-zero values
  }

  // Render loading state
  if (isLoading && !locationData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading location data...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error && !locationData) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Site Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="flex items-center">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Location Selector */}
      <div className="mb-6">
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.location_id} value={location.location_id}>
                {location.display_name} ({location.location_type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {locationData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
                <CardTitle className="text-sm font-medium">Location</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{locationData.location.display_name || locationData.location.country}</div>
                <div className="text-sm text-muted-foreground capitalize">{locationData.location.location_type}</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
                <CardTitle className="text-sm font-medium">Sites</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{locationData.metrics.total_sites || 0}</div>
                <div className="text-sm text-muted-foreground">Monitoring sites in this location</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
                <CardTitle className="text-sm font-medium">Data Completeness</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{locationData.metrics.avg_data_completeness ? Math.round(locationData.metrics.avg_data_completeness) + '%' : 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Average data completeness</div>
              </CardContent>
            </Card>
          </div>

          {/* Average PM2.5 and PM10 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Average PM2.5
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationData.metrics.avg_pm25 
                    ? `${locationData.metrics.avg_pm25.toFixed(1)} μg/m³` 
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Average PM2.5 across all sites</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Average PM10
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationData.metrics.avg_pm10
                    ? `${locationData.metrics.avg_pm10.toFixed(1)} μg/m³`
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Average PM10 across all sites</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Active Sites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationData.time_series && locationData.time_series.length > 0 
                    ? locationData.time_series[locationData.time_series.length - 1].active_sites || 0
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">Currently active monitoring sites</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationData.time_series && locationData.time_series.length > 0 
                    ? `${Math.round(locationData.time_series[locationData.time_series.length - 1].uptime || 0)}%`
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Average uptime for all devices</p>
              </CardContent>
            </Card>
          </div>

          {/* AQI Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-green-500/10 to-transparent">
                <CardTitle className="text-sm font-medium text-center">Good</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex justify-center">
                <div className="text-3xl font-bold flex items-center justify-center h-16 w-16 rounded-full bg-green-500 text-white">
                  {locationData.aqi_distribution.good || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-yellow-500/10 to-transparent">
                <CardTitle className="text-sm font-medium text-center">Moderate</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex justify-center">
                <div className="text-3xl font-bold flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500 text-white">
                  {locationData.aqi_distribution.moderate || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-orange-500/10 to-transparent">
                <CardTitle className="text-sm font-medium text-center">UHFSG</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex justify-center">
                <div className="text-3xl font-bold flex items-center justify-center h-16 w-16 rounded-full bg-orange-500 text-white">
                  {locationData.aqi_distribution.unhealthy_sensitive || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-red-500/10 to-transparent">
                <CardTitle className="text-sm font-medium text-center">Unhealthy</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex justify-center">
                <div className="text-3xl font-bold flex items-center justify-center h-16 w-16 rounded-full bg-red-500 text-white">
                  {locationData.aqi_distribution.unhealthy || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-500/10 to-transparent">
                <CardTitle className="text-sm font-medium text-center">V.Unhealthy</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex justify-center">
                <div className="text-3xl font-bold flex items-center justify-center h-16 w-16 rounded-full bg-purple-500 text-white">
                  {locationData.aqi_distribution.very_unhealthy || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-red-900/10 to-transparent">
                <CardTitle className="text-sm font-medium text-center">Hazardous</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex justify-center">
                <div className="text-3xl font-bold flex items-center justify-center h-16 w-16 rounded-full bg-red-900 text-white">
                  {locationData.aqi_distribution.hazardous || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Site Overview</TabsTrigger>
              <TabsTrigger value="air-quality">Air Quality</TabsTrigger>
              <TabsTrigger value="devices">Device Details</TabsTrigger>
              <TabsTrigger value="time-series">Time Series</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="mr-2 h-5 w-5 text-primary" />
          Site Summary
        </CardTitle>
        <CardDescription>Overview of monitoring sites in {locationData.location.display_name || locationData.location.country}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Sites</span>
            <span className="font-bold">{locationData.metrics.total_sites || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Active Sites</span>
            <span className="font-bold">{locationData.time_series && locationData.time_series.length > 0 
              ? locationData.time_series[locationData.time_series.length - 1].active_sites || 0
              : 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Data Completeness</span>
            <span className="font-bold">{locationData.metrics.avg_data_completeness 
              ? Math.round(locationData.metrics.avg_data_completeness) + '%' 
              : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Average Uptime</span>
            <span className="font-bold">{locationData.time_series && locationData.time_series.length > 0 
              ? `${Math.round(locationData.time_series[locationData.time_series.length - 1].uptime || 0)}%`
              : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Air Quality Overview
        </CardTitle>
        <CardDescription>Current air quality status across sites</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Average PM2.5</span>
              <span className="font-bold">{locationData.metrics.avg_pm25 
                ? `${locationData.metrics.avg_pm25.toFixed(1)} μg/m³` 
                : 'N/A'}</span>
            </div>
            <Progress 
              value={locationData.metrics.avg_pm25 ? Math.min(100, (locationData.metrics.avg_pm25 / 50) * 100) : 0} 
              className="h-2" 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Average PM10</span>
              <span className="font-bold">{locationData.metrics.avg_pm10
                ? `${locationData.metrics.avg_pm10.toFixed(1)} μg/m³`
                : 'N/A'}</span>
            </div>
            <Progress 
              value={locationData.metrics.avg_pm10 ? Math.min(100, (locationData.metrics.avg_pm10 / 100) * 100) : 0} 
              className="h-2" 
            />
          </div>
          
          <div className="pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Predominant AQI Category</span>
              {locationData.aqi_distribution && Object.keys(locationData.aqi_distribution).length > 0 ? (
                <Badge 
                  style={{ 
                    backgroundColor: aqiColors[getPredominantAqiCategory(locationData.aqi_distribution).toLowerCase()] || "#888",
                    color: "#fff" 
                  }}
                >
                  {getPredominantAqiCategory(locationData.aqi_distribution)}
                </Badge>
              ) : (
                <span>N/A</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <TrendingUp className="mr-2 h-5 w-5 text-primary" />
        PM2.5 Trends
      </CardTitle>
      <CardDescription>Average PM2.5 readings over time</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-80">
        {locationData.time_series && locationData.time_series.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={locationData.time_series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="reading_date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()} 
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value.toFixed(1)} μg/m³`, "Avg PM2.5"]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg_pm25" 
                name="Average PM2.5" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No PM2.5 trend data available</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>

 
</TabsContent>

<TabsContent value="air-quality" className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          AQI Distribution
        </CardTitle>
        <CardDescription>Distribution of AQI categories across all sites</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {locationData.aqi_distribution && Object.keys(locationData.aqi_distribution).length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatAqiDistributionForChart(locationData.aqi_distribution)}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {formatAqiDistributionForChart(locationData.aqi_distribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} sites`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No AQI distribution data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          PM10 vs PM2.5 Comparison
        </CardTitle>
        <CardDescription>Comparison of PM10 and PM2.5 levels over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {locationData.time_series && locationData.time_series.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={locationData.time_series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="reading_date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()} 
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [`${value.toFixed(1)} μg/m³`, name]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avg_pm25" 
                  name="PM2.5" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="avg_pm10" 
                  name="PM10" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No PM comparison data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>

  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
        Sites Exceeding WHO Guidelines
      </CardTitle>
      <CardDescription>Sites with PM2.5 or PM10 levels exceeding WHO guidelines</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Site Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Latest PM2.5</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">WHO Guideline PM2.5</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Latest PM10</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">WHO Guideline PM10</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {locationData.sites && locationData.sites
              .filter(site => (
                (site.latest_pm2_5 !== null && site.latest_pm2_5 !== undefined && site.latest_pm2_5 > 15) || 
                (site.latest_pm10 !== null && site.latest_pm10 !== undefined && site.latest_pm10 > 45)
              ))
              .map((site, index) => (
                <tr 
                  key={`who-${site.site_id}_${index}`}
                  className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <td className="py-3 px-4 font-medium">{site.site_name || site.site_id}</td>
                  <td className="py-3 px-4 font-medium">
                    {formatNumber(site.latest_pm2_5)}
                  </td>
                  <td className="py-3 px-4">15.0 μg/m³</td>
                  <td className="py-3 px-4 font-medium">
                    {formatNumber(site.latest_pm10)}
                  </td>
                  <td className="py-3 px-4">45.0 μg/m³</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={
                        (site.latest_pm2_5 > 30 || site.latest_pm10 > 90) ? "destructive" : 
                        (site.latest_pm2_5 > 15 || site.latest_pm10 > 45) ? "warning" : "outline"
                      }
                    >
                      {(site.latest_pm2_5 > 30 || site.latest_pm10 > 90) ? "Significantly Exceeding" : "Exceeding"}
                    </Badge>
                  </td>
                </tr>
            ))}
            {!locationData.sites || 
             !locationData.sites.some(site => 
               (site.latest_pm2_5 !== null && site.latest_pm2_5 !== undefined && site.latest_pm2_5 > 15) || 
               (site.latest_pm10 !== null && site.latest_pm10 !== undefined && site.latest_pm10 > 45)
             ) ? (
              <tr>
                <td colSpan="6" className="py-4 text-center text-muted-foreground">
                  No sites exceeding WHO guidelines
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <HelpCircle className="mr-2 h-5 w-5 text-primary" />
        Air Quality Insights
      </CardTitle>
      <CardDescription>Key insights about air quality in this location</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Calculate insights from the data */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Average AQI Category</AlertTitle>
          <AlertDescription>
            The predominant air quality category in {locationData.location.display_name || locationData.location.country} is{" "}
            <span className="font-bold" style={{ color: aqiColors[getPredominantAqiCategory(locationData.aqi_distribution).toLowerCase()] || "#888" }}>
              {getPredominantAqiCategory(locationData.aqi_distribution)}
            </span>
          </AlertDescription>
        </Alert>

        {locationData.time_series && locationData.time_series.length > 1 && (
          <Alert variant={isPm25Increasing(locationData.time_series) ? "destructive" : "default"}>
            {isPm25Increasing(locationData.time_series) ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <AlertTitle>PM2.5 Trend</AlertTitle>
            <AlertDescription>
              PM2.5 levels are {isPm25Increasing(locationData.time_series) ? "increasing" : "decreasing"} over the selected time period. 
              {isPm25Increasing(locationData.time_series) 
                ? " This could indicate worsening air quality conditions." 
                : " This indicates improving air quality conditions."}
            </AlertDescription>
          </Alert>
        )}

        <Alert variant={getHighestPmRatio(locationData.sites) > 2.5 ? "warning" : "default"}>
          <Wind className="h-4 w-4" />
          <AlertTitle>PM10/PM2.5 Ratio</AlertTitle>
          <AlertDescription>
            The highest PM10/PM2.5 ratio is {getHighestPmRatio(locationData.sites).toFixed(1)} at site {getHighestPmRatioSiteName(locationData.sites)}.
            {getHighestPmRatio(locationData.sites) > 2.5 
              ? " High ratios may indicate significant coarse particle pollution sources such as dust, construction, or road traffic." 
              : " This ratio is within normal levels, suggesting a balanced mix of fine and coarse particles."}
          </AlertDescription>
        </Alert>
      </div>
    </CardContent>
  </Card>
</TabsContent>
            
            <TabsContent value="devices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    Sites in {locationData.location.display_name || locationData.location.country}
                  </CardTitle>
                  <CardDescription>Details of all monitoring sites in this location with latest PM readings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Site Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Latest PM2.5</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Latest PM10</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Last Reading</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">AQI Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {locationData.sites && locationData.sites.length > 0 ? (
                          locationData.sites.map((site, index) => (
                            <tr 
                              key={`${site.site_id}_${index}`} // Ensure unique keys for sites
                              className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                            >
                              <td className="py-3 px-4 font-medium">{site.site_name || site.site_id}</td>
                              <td className="py-3 px-4">{site.location_name || `${site.city || site.district || site.country}`}</td>
                              <td className="py-3 px-4">
                              {formatNumber(site.latest_pm2_5)}
                            </td>
                            <td className="py-3 px-4">
                              {formatNumber(site.latest_pm10)}
                            </td>
                              <td className="py-3 px-4">
                                {site.last_reading_time ? new Date(site.last_reading_time).toLocaleString() : "N/A"}
                              </td>
                              <td className="py-3 px-4">
                                {site.aqi_category ? (
                                  <Badge 
                                    style={{ 
                                      backgroundColor: aqiColors[site.aqi_category.toLowerCase()] || "#888",
                                      color: "#fff" 
                                    }}
                                  >
                                    {site.aqi_category}
                                  </Badge>
                                ) : "N/A"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-4 text-center text-muted-foreground">No sites found in this location</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time-series" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-primary" />
                    Active Sites and Uptime
                  </CardTitle>
                  <CardDescription>Number of active sites and data uptime percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {locationData.time_series && locationData.time_series.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={locationData.time_series}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="reading_date" 
                            tickFormatter={(value) => new Date(value).toLocaleDateString()} 
                          />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <Legend />
                          <Bar 
                            yAxisId="left" 
                            dataKey="active_sites" 
                            name="Active Sites" 
                            fill="#8884d8" 
                          />
                          <Line 
                            yAxisId="right" 
                            type="monotone" 
                            dataKey="uptime" 
                            name="Uptime (%)" 
                            stroke="#ff7300" 
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No uptime data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}




// Function to determine the predominant AQI category
function getPredominantAqiCategory(aqiDistribution) {
    if (!aqiDistribution) return "Unknown";
    
    // Find the category with the highest count
    let maxCount = 0;
    let predominantCategory = "Unknown";
    
    const categories = {
      "good": aqiDistribution.good || 0,
      "moderate": aqiDistribution.moderate || 0,
      "unhealthy for sensitive groups": aqiDistribution.unhealthy_sensitive || 0,
      "unhealthy": aqiDistribution.unhealthy || 0,
      "very unhealthy": aqiDistribution.very_unhealthy || 0,
      "hazardous": aqiDistribution.hazardous || 0
    };
    
    for (const [category, count] of Object.entries(categories)) {
      if (count > maxCount) {
        maxCount = count;
        predominantCategory = category.charAt(0).toUpperCase() + category.slice(1);
      }
    }
    
    return predominantCategory;
  }
  
  // Function to determine if PM2.5 levels are increasing
  function isPm25Increasing(timeSeriesData) {
    if (!timeSeriesData || timeSeriesData.length < 2) return false;
    
    // Get the first and last valid readings
    const validReadings = timeSeriesData.filter(reading => 
      reading.avg_pm25 !== null && reading.avg_pm25 !== undefined
    );
    
    if (validReadings.length < 2) return false;
    
    const firstReading = validReadings[0];
    const lastReading = validReadings[validReadings.length - 1];
    
    return lastReading.avg_pm25 > firstReading.avg_pm25;
  }
  
  // Function to calculate the highest PM10/PM2.5 ratio
  function getHighestPmRatio(sites) {
    if (!sites || sites.length === 0) return 1;
    
    let highestRatio = 0;
    
    sites.forEach(site => {
      if (site.latest_pm2_5 && site.latest_pm10 && site.latest_pm2_5 > 0) {
        const ratio = site.latest_pm10 / site.latest_pm2_5;
        if (ratio > highestRatio) {
          highestRatio = ratio;
        }
      }
    });
    
    return highestRatio || 1;
  }
  
  // Function to get the site name with the highest ratio
  function getHighestPmRatioSiteName(sites) {
    if (!sites || sites.length === 0) return "Unknown";
    
    let highestRatio = 0;
    let siteName = "Unknown";
    
    sites.forEach(site => {
      if (site.latest_pm2_5 && site.latest_pm10 && site.latest_pm2_5 > 0) {
        const ratio = site.latest_pm10 / site.latest_pm2_5;
        if (ratio > highestRatio) {
          highestRatio = ratio;
          siteName = site.site_name || site.site_id || "Unknown";
        }
      }
    });
    
    return siteName;
  }