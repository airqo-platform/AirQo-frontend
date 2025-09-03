"use client"

import { useState, useEffect, useMemo } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Download,
  RefreshCw,
  Activity,
  Globe,
  Map,
  Layers,
  Signal,
  SignalZero,
  Percent,
  Wind,
  Search,
} from "lucide-react"
import { getSites, getSiteAnalytics, getCountryAnalytics, getRegionalAnalytics, getDistrictAnalytics } from "@/services/device-api.service"
import { config } from "@/lib/config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// TypeScript interfaces
interface Device {
  id: string;
  name: string;
  status: string;
  pm25?: number;
  pm10?: number;
}

interface RegionalSummaryData {
  regions: number;
  totalDevices: number;
  countries: number;
  countriesDevices: number;
  districts: number;
  districtsWithDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  dataCompleteness: number;
  averagePM25: number;
  averagePM10: number;
}

interface RegionalData {
  region: string;
  deviceCount: number;
  onlineDevices: number;
  offlineDevices: number;
  dataTransmissionRate: number;
  dataCompleteness: number;
  pm25: number;
  pm10: number;
  aqiGood: number;
  aqiModerate: number;
  aqiUhfsg: number;
  aqiUnhealthy: number;
  aqiVeryUnhealthy: number;
  aqiHazardous: number;
  countries: number;
  districts: number;
}

interface CountryData {
  name: string;
  region: string;
  deviceCount: number;
  onlineDevices: number;
  offlineDevices: number;
  dataTransmissionRate: number;
  dataCompleteness: number;
  pm25: number;
  pm10: number;
  aqiGood: number;
  aqiModerate: number;
  aqiUhfsg: number;
  aqiUnhealthy: number;
  aqiVeryUnhealthy: number;
  aqiHazardous: number;
  devicesList: Device[];
}

interface DistrictData {
  name: string;
  country: string;
  deviceCount: number;
  onlineDevices: number;
  offlineDevices: number;
  dataTransmissionRate: number;
  dataCompleteness: number;
  pm25: number;
  pm10: number;
  aqiGood: number;
  aqiModerate: number;
  aqiUhfsg: number;
  aqiUnhealthy: number;
  aqiVeryUnhealthy: number;
  aqiHazardous: number;
  devicesList: Device[];
}

interface VillageData {
  name: string;
  district: string;
  deviceCount: number;
  onlineDevices: number;
  offlineDevices: number;
  dataTransmissionRate: number;
  dataCompleteness: number;
  pm25: number;
  pm10: number;
  aqiGood: number;
  aqiModerate: number;
  aqiUhfsg: number;
  aqiUnhealthy: number;
  aqiVeryUnhealthy: number;
  aqiHazardous: number;
  devicesList: Device[];
}

interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
}

interface AirQualityData {
  [key: string]: any;
}

interface PerformanceData {
  [key: string]: any[];
}

interface AqiDistributionItem {
  name: string;
  value: number;
  color: string;
}

interface EntityWithAqi {
  aqiGood?: number;
  aqiModerate?: number;
  aqiUhfsg?: number;
  aqiUnhealthy?: number;
  aqiVeryUnhealthy?: number;
  aqiHazardous?: number;
}


// AQI color mapping - keeping this as it's configuration, not static data
const aqiColors = {
  good: "#4CAF50",
  moderate: "#FFC107",
  unhealthySensitive: "#FF9800",
  unhealthy: "#F44336",
  veryUnhealthy: "#9C27B0",
  hazardous: "#B71C1C",
}

// Function to format number with units
function formatNumber(value: number | null | undefined, decimals: number = 1): string {
  // Check if value is null, undefined, or not a number
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A"
  }
  return Number(value).toFixed(decimals) + " μg/m³"
}

export default function AnalyticsPage() {
  // State variables
  const [timeRange, setTimeRange] = useState<string>("month")
  const [activeTab, setActiveTab] = useState<string>("network")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  
  // Data states
  const [siteStats, setSiteStats] = useState(null)
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [cityData, setCityData] = useState(null)
  const [citySites, setCitySites] = useState([])
  const [selectedSite, setSelectedSite] = useState<string>("")
  const [siteDevices, setSiteDevices] = useState(null)
  const [cityMetrics, setCityMetrics] = useState([])
  const [regionalSummaryData, setRegionalSummaryData] = useState<RegionalSummaryData>({
    regions: 6,
    totalDevices: 243,
    countries: 9,
    countriesDevices: 243,
    districts: 44,
    districtsWithDevices: 44,
    onlineDevices: 158,
    offlineDevices: 85,
    dataCompleteness: 65,
    averagePM25: 20.6,
    averagePM10: 25,
  })
  

  // Fetch data when component mounts or when dependencies change
  useEffect(() => {
    fetchSummaryData()
  }, [])
  
  // Fetch city data when selected city changes
  useEffect(() => {
    if (selectedCity) {
      fetchCityData(selectedCity)
    }
  }, [selectedCity])

  // Fetch site devices when selected site changes
  useEffect(() => {
    if (selectedSite) {
      fetchSiteDevices(selectedSite)
    }
  }, [selectedSite])

  // When time range changes, refetch time-dependent data
  useEffect(() => {
    fetchTimeRangeData()
  }, [timeRange])

  const fetchSummaryData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Fetch site statistics from the new endpoints
      const countEndpoint = config.isLocalhost ? `${config.apiUrl}/sites/count` : `${config.apiUrl}/api/v1/sites/count`;
      const statsEndpoint = config.isLocalhost ? `${config.apiUrl}/sites/statistics` : `${config.apiUrl}/api/v1/sites/statistics`;
      
      const [countResponse, statsResponse] = await Promise.all([
        fetch(countEndpoint),
        fetch(statsEndpoint)
      ]);
      
      if (!countResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch site data');
      }
      
      const [countData, statsData] = await Promise.all([
        countResponse.json(),
        statsResponse.json()
      ]);
      
      setSiteStats(statsData);
      
      // Fetch metrics for all cities
      if (statsData.by_city) {
        await fetchAllCityMetrics(Object.keys(statsData.by_city));
      }
      
      // Update regional summary data with the statistics
      setRegionalSummaryData({
        regions: Object.keys(statsData.by_district || {}).length,
        totalDevices: statsData.device_distribution?.total_device_count || countData.total || 0,
        countries: Object.keys(statsData.by_city || {}).length,
        countriesDevices: statsData.device_distribution?.total_device_count || countData.total || 0,
        districts: Object.keys(statsData.by_district || {}).length,
        districtsWithDevices: Object.keys(statsData.by_district || {}).length,
        onlineDevices: countData.active || 0,
        offlineDevices: countData.inactive || 0,
        dataCompleteness: Math.round(statsData.percentages?.active_rate || 0),
        averagePM25: 20.6,
        averagePM10: 25,
      });
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setHasError(true);
      
      // Fallback data
      setRegionalSummaryData({
        regions: 6,
        totalDevices: 243,
        countries: 9,
        countriesDevices: 243,
        districts: 44,
        districtsWithDevices: 44,
        onlineDevices: 158,
        offlineDevices: 85,
        dataCompleteness: 65,
        averagePM25: 20.6,
        averagePM10: 25,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCityData = async (city: string): Promise<void> => {
    if (!city) return;
    
    try {
      setIsLoading(true);
      
      // Fetch city summary and sites in that city
      const summaryEndpoint = config.isLocalhost ? `${config.apiUrl}/cities/${encodeURIComponent(city)}/summary` : `${config.apiUrl}/api/v1/cities/${encodeURIComponent(city)}/summary`;
      const sitesEndpoint = config.isLocalhost ? `${config.apiUrl}/sites?city=${encodeURIComponent(city)}` : `${config.apiUrl}/api/v1/sites?city=${encodeURIComponent(city)}`;
      
      const [summaryResponse, sitesResponse] = await Promise.all([
        fetch(summaryEndpoint),
        fetch(sitesEndpoint)
      ]);
      
      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        setCityData(summary);
      }
      
      if (sitesResponse.ok) {
        const sites = await sitesResponse.json();
        setCitySites(sites);
        
        // Auto-select first site if none selected
        if (sites.length > 0 && !selectedSite) {
          setSelectedSite(sites[0].site_id);
        }
      }
    } catch (error) {
      console.error("Error fetching city data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSiteDevices = async (siteId: string): Promise<void> => {
    if (!siteId) return;
    
    try {
      setIsLoading(true);
      
      // Use the detailed endpoint for comprehensive metrics
      const endpoint = config.isLocalhost ? 
        `${config.apiUrl}/sites/${encodeURIComponent(siteId)}/devices/detailed?include_metrics=true&hours=24` : 
        `${config.apiUrl}/api/v1/sites/${encodeURIComponent(siteId)}/devices/detailed?include_metrics=true&hours=24`;
      
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        setSiteDevices(data);
      }
    } catch (error) {
      console.error("Error fetching site devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllCityMetrics = async (cities: string[]): Promise<void> => {
    try {
      // Fetch device summary for each city in parallel
      const metricsPromises = cities.slice(0, 20).map(async (city) => {
        try {
          const endpoint = config.isLocalhost ? 
            `${config.apiUrl}/devices/summary/by-location?city=${encodeURIComponent(city)}&hours=24` : 
            `${config.apiUrl}/api/v1/devices/summary/by-location?city=${encodeURIComponent(city)}&hours=24`;
          
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            return {
              city,
              siteCount: (siteStats as any)?.by_city?.[city] || 0,
              ...data
            };
          }
        } catch (error) {
          console.error(`Error fetching metrics for ${city}:`, error);
        }
        return null;
      });

      const results = await Promise.all(metricsPromises);
      const validResults = results.filter(result => result !== null);
      setCityMetrics(validResults);
    } catch (error) {
      console.error("Error fetching city metrics:", error);
    }
  };

  const fetchTimeRangeData = async (): Promise<void> => {
    try {
      console.log(`Fetching time range data for: ${timeRange}`);
    } catch (error) {
      console.error("Error fetching time range data:", error);
    }
  }

  // Handlers for data refresh and export
  const handleRefresh = (): void => {
    fetchSummaryData()
    fetchTimeRangeData()
  }

  const handleExport = (): void => {
    // Implement export functionality
    console.log("Exporting data...")
    // Example: generate CSV or Excel file
  }

  const handleTimeRangeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setTimeRange(event.target.value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Device Performance Analytics</h1>
        <div className="flex items-center space-x-2">
          <select 
            className="border rounded-md p-2" 
            value={timeRange} 
            onChange={handleTimeRangeChange}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-1 mb-4 w-[400px]">
          <TabsTrigger value="network">Site Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-6">
          {/* Site Analytics Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Map className="mr-2 h-5 w-5 text-primary" />
                  Total Sites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{siteStats?.summary?.total || regionalSummaryData.totalDevices}</div>
                <p className="text-sm text-muted-foreground">
                  Monitoring sites across the network
                </p>
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
                  {siteStats?.summary?.active || regionalSummaryData.onlineDevices}
                </div>
                <p className="text-sm text-muted-foreground">Sites currently operational</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-primary" />
                  Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(siteStats?.by_city || {}).length || regionalSummaryData.countries}</div>
                <p className="text-sm text-muted-foreground">
                  Countries with monitoring sites
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Layers className="mr-2 h-5 w-5 text-primary" />
                  Data Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(siteStats?.percentages?.active_rate || regionalSummaryData.dataCompleteness)}%</div>
                <p className="text-sm text-muted-foreground">Overall data completeness</p>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue="city" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="city">City Analysis</TabsTrigger>
            <TabsTrigger value="district">District Analysis</TabsTrigger>
            <TabsTrigger value="category">Category Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="city" className="space-y-4">
            {!selectedCity ? (
              <div className="space-y-6">
                {/* Key Metrics Table */}
                {cityMetrics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-primary" />
                        📊 Key Metrics Across Cities
                      </CardTitle>
                      <CardDescription>
                        Comprehensive device performance and data quality metrics across all cities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-3 px-3 font-medium">City</th>
                              <th className="text-left py-3 px-3 font-medium">Sites</th>
                              <th className="text-left py-3 px-3 font-medium">Devices Off/On</th>
                              <th className="text-left py-3 px-3 font-medium">Uptime (%)</th>
                              <th className="text-left py-3 px-3 font-medium">Avg Sensor Error</th>
                              <th className="text-left py-3 px-3 font-medium">Avg Hourly Entries</th>
                              <th className="text-left py-3 px-3 font-medium">Optimal (%)</th>
                              <th className="text-left py-3 px-3 font-medium">Good (%)</th>
                              <th className="text-left py-3 px-3 font-medium">Fair (%)</th>
                              <th className="text-left py-3 px-3 font-medium">Poor (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cityMetrics
                              .sort((a: any, b: any) => (b.performance_metrics?.uptime_percentage || 0) - (a.performance_metrics?.uptime_percentage || 0))
                              .map((city: any, index: number) => (
                              <tr key={city.city} className={`border-b hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                  onClick={() => setSelectedCity(city.city)}>
                                <td className="py-3 px-3 font-medium text-blue-600 hover:underline">{city.city}</td>
                                <td className="py-3 px-3">{city.siteCount}</td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-red-600 font-medium">{city.device_counts?.offline || 0}</span>
                                    <span>/</span>
                                    <span className="text-green-600 font-medium">{city.device_counts?.online || 0}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center">
                                    <span className={`font-medium ${
                                      (city.performance_metrics?.uptime_percentage || 0) > 60 ? 'text-green-600' :
                                      (city.performance_metrics?.uptime_percentage || 0) > 30 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                      {city.performance_metrics?.uptime_percentage?.toFixed(2) || '0.00'}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`font-medium ${
                                    (city.performance_metrics?.avg_sensor_error_rate || 0) < 10 ? 'text-green-600' :
                                    (city.performance_metrics?.avg_sensor_error_rate || 0) < 20 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {city.performance_metrics?.avg_sensor_error_rate?.toFixed(2) || '0.00'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-medium">{city.average_hourly_entries?.toFixed(2) || '0.00'}</td>
                                <td className="py-3 px-3">
                                  <span className="text-green-600 font-medium">
                                    {city.completeness_percentages?.optimal?.toFixed(2) || '0.00'}%
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="text-blue-600 font-medium">
                                    {city.completeness_percentages?.good?.toFixed(2) || '0.00'}%
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="text-yellow-600 font-medium">
                                    {city.completeness_percentages?.fair?.toFixed(2) || '0.00'}%
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="text-red-600 font-medium">
                                    {city.completeness_percentages?.poor?.toFixed(2) || '0.00'}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Performance Insights */}
                      {cityMetrics.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium text-green-800">🚀 Best Performing</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {(() => {
                                const best = cityMetrics
                                  .filter((city: any) => (city.performance_metrics?.uptime_percentage || 0) > 50)
                                  .sort((a: any, b: any) => (b.performance_metrics?.uptime_percentage || 0) - (a.performance_metrics?.uptime_percentage || 0))
                                  .slice(0, 3);
                                
                                return best.length > 0 ? (
                                  <div className="space-y-2">
                                    {best.map((city: any) => (
                                      <div key={city.city} className="flex justify-between items-center">
                                        <span className="font-medium text-green-700">{city.city}</span>
                                        <span className="text-sm text-green-600">
                                          {city.performance_metrics?.uptime_percentage?.toFixed(1)}% uptime
                                        </span>
                                      </div>
                                    ))}
                                    <p className="text-xs text-green-600 mt-2">High uptime, low error rates, strong completeness</p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-green-600">No cities with &gt;50% uptime</p>
                                );
                              })()}
                            </CardContent>
                          </Card>

                          <Card className="border-red-200 bg-red-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium text-red-800">🔴 Needs Attention</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {(() => {
                                const worst = cityMetrics
                                  .filter((city: any) => (city.completeness_percentages?.poor || 0) > 50)
                                  .sort((a: any, b: any) => (b.completeness_percentages?.poor || 0) - (a.completeness_percentages?.poor || 0))
                                  .slice(0, 3);
                                
                                return worst.length > 0 ? (
                                  <div className="space-y-2">
                                    {worst.map((city: any) => (
                                      <div key={city.city} className="flex justify-between items-center">
                                        <span className="font-medium text-red-700">{city.city}</span>
                                        <span className="text-sm text-red-600">
                                          {city.completeness_percentages?.poor?.toFixed(1)}% poor completeness
                                        </span>
                                      </div>
                                    ))}
                                    <p className="text-xs text-red-600 mt-2">High poor completeness rates, low data quality</p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-red-600">No cities with &gt;50% poor completeness</p>
                                );
                              })()}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* City Selector Grid */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Select a City for Detailed Analysis</h2>
                  {siteStats?.by_city && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(siteStats.by_city)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([city, count]) => (
                        <Card key={city} className="cursor-pointer transition-colors hover:bg-gray-50 hover:shadow-md"
                              onClick={() => setSelectedCity(city)}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">{city}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-primary">{count as number}</div>
                            <p className="text-sm text-muted-foreground">monitoring sites</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Selected City Analysis */
              <div className="space-y-6">
                {/* City Header with Back Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedCity} Analysis</h2>
                    <p className="text-muted-foreground">Detailed analysis of devices and sites</p>
                  </div>
                  <Button variant="outline" onClick={() => {setSelectedCity(""); setSelectedSite(""); setSiteDevices(null)}}>
                    ← Back to Cities
                  </Button>
                </div>

                {/* City Summary Cards */}
                {cityData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Activity className="mr-2 h-5 w-5 text-blue-500" />
                          Total Devices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{cityData.device_counts?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">devices in {selectedCity}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Signal className="mr-2 h-5 w-5 text-green-500" />
                          Online Devices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{cityData.device_counts?.online || 0}</div>
                        <p className="text-xs text-muted-foreground">currently online</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <SignalZero className="mr-2 h-5 w-5 text-red-500" />
                          Offline Devices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{cityData.device_counts?.offline || 0}</div>
                        <p className="text-xs text-muted-foreground">currently offline</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Percent className="mr-2 h-5 w-5 text-primary" />
                          Uptime Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {cityData.device_counts?.total ? 
                            Math.round((cityData.device_counts.online / cityData.device_counts.total) * 100) 
                            : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">devices operational</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Sites in Selected City */}
                {citySites && citySites.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Map className="mr-2 h-5 w-5 text-primary" />
                        Sites in {selectedCity}
                      </CardTitle>
                      <CardDescription>Select a site for detailed device analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {citySites.map((site: any) => (
                          <Card key={site.site_id} 
                                className={`cursor-pointer transition-colors ${selectedSite === site.site_id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                                onClick={() => setSelectedSite(site.site_id)}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">{site.site_name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">District:</span>
                                  <span className="text-xs font-medium">{site.district}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Devices:</span>
                                  <span className="text-xs font-medium">{site.device_count || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Category:</span>
                                  <span className="text-xs font-medium">{site.site_category || 'N/A'}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Selected Site Device Details */}
                {siteDevices && selectedSite && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-primary" />
                        Device Details - {siteDevices.site?.site_name}
                      </CardTitle>
                      <CardDescription>
                        Performance metrics and status for devices at this site
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Site Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{siteDevices.summary?.total_devices || 0}</div>
                          <p className="text-sm text-muted-foreground">Total Devices</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{siteDevices.summary?.online || 0}</div>
                          <p className="text-sm text-muted-foreground">Online</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{siteDevices.summary?.offline || 0}</div>
                          <p className="text-sm text-muted-foreground">Offline</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{siteDevices.summary?.active || 0}</div>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                      </div>

                      {/* Device Details Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-3 px-4 font-medium">Device ID</th>
                              <th className="text-left py-3 px-4 font-medium">Status</th>
                              <th className="text-left py-3 px-4 font-medium">Online</th>
                              <th className="text-left py-3 px-4 font-medium">Completeness</th>
                              <th className="text-left py-3 px-4 font-medium">Uptime</th>
                              <th className="text-left py-3 px-4 font-medium">Last Reading</th>
                              <th className="text-left py-3 px-4 font-medium">PM2.5</th>
                              <th className="text-left py-3 px-4 font-medium">PM10</th>
                            </tr>
                          </thead>
                          <tbody>
                            {siteDevices.devices?.map((device: any, index: number) => (
                              <tr key={device.device_key || index} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-mono text-sm">{device.device_key}</td>
                                <td className="py-3 px-4">
                                  <Badge variant={device.is_active ? "default" : "secondary"}>
                                    {device.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant={device.is_online ? "default" : "destructive"}>
                                    {device.is_online ? "Online" : "Offline"}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  {device.metrics?.completeness_percentage ? (
                                    <div className="flex items-center">
                                      <div className="text-sm font-medium">{device.metrics.completeness_percentage.toFixed(1)}%</div>
                                      <Badge variant={
                                        device.metrics.completeness_category === 'optimal' ? 'default' :
                                        device.metrics.completeness_category === 'good' ? 'secondary' :
                                        device.metrics.completeness_category === 'fair' ? 'outline' : 'destructive'
                                      } className="ml-2 text-xs">
                                        {device.metrics.completeness_category}
                                      </Badge>
                                    </div>
                                  ) : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  {device.metrics?.uptime_percentage ? 
                                    `${device.metrics.uptime_percentage.toFixed(1)}%` : 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-xs">
                                  {device.metrics?.last_reading ? 
                                    new Date(device.metrics.last_reading).toLocaleString() : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  {device.metrics?.last_pm2_5 ? 
                                    `${device.metrics.last_pm2_5.toFixed(1)} μg/m³` : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  {device.metrics?.last_pm10 ? 
                                    `${device.metrics.last_pm10.toFixed(1)} μg/m³` : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="district" className="space-y-4">
            {siteStats?.by_district && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(siteStats.by_district)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 12)
                  .map(([district, count]) => (
                  <Card key={district}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{district}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{count}</div>
                      <p className="text-xs text-muted-foreground">monitoring sites</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="category" className="space-y-4">
            {siteStats?.by_category && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(siteStats.by_category).map(([category, count]) => (
                  <Card key={category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{count}</div>
                      <p className="text-xs text-muted-foreground">monitoring sites</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          </Tabs>
        </TabsContent>

      </Tabs>
    </div>
  )
}