// components/CountryAnalysis.jsx
"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Signal,
  SignalZero,
  Percent,
  Wind,
  Search,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { config } from "@/lib/config"

// AQI color mapping
const aqiColors = {
  good: "#4CAF50",
  moderate: "#FFC107",
  unhealthySensitive: "#FF9800",
  unhealthy: "#F44336",
  veryUnhealthy: "#9C27B0",
  hazardous: "#B71C1C",
}

// Paginated Device Table Component
const PaginatedDeviceTable = ({ devices = [], searchTerm = "", statusFilter = "all" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter devices based on search term and status filter
  const filteredDevices = devices.filter((device) => {
    const matchesSearch = 
      device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle both numeric (0/1) and string status values
    const deviceStatus = typeof device.status === "number" 
      ? (device.status === 1 ? "online" : "offline")
      : device.status;
    
    const matchesStatus = statusFilter === "all" || deviceStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDevices = filteredDevices.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="border rounded-md overflow-hidden">
      <table className="w-full">
  <thead>
    <tr className="bg-muted/50">
      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Device ID</th>
      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
      <th className="text-left py-3 px-4 font-medium text-muted-foreground">PM2.5</th>
      <th className="text-left py-3 px-4 font-medium text-muted-foreground">PM10</th>
      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
    </tr>
  </thead>
  <tbody>
    {paginatedDevices.length > 0 ? (
      paginatedDevices.map((device) => {
        // Handle both numeric (0/1) and string status values
        const isOnline = typeof device.status === "number" 
          ? device.status === 1 
          : device.status === "online";

        return (
          <tr key={device.id} className="border-t hover:bg-muted/30">
            <td className="py-3 px-4 font-mono text-sm">{device.id}</td>
            <td className="py-3 px-4">{device.name || "Unnamed Device"}</td>
            <td className="py-3 px-4">
              <Badge className={isOnline ? "bg-green-500" : "bg-red-500"}>
                {isOnline ? "online" : "offline"}
              </Badge>
            </td>
        
            <td className="py-3 px-4">{device.pm25} μg/m³</td>
            <td className="py-3 px-4">{device.pm10} μg/m³</td>
            <td className="py-3 px-4">
              <Link
                href={`/dashboard/devices/${device.id}`}
                className="flex items-center text-primary hover:underline"
              >
                View Details <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan={7} className="py-4 text-center text-muted-foreground">
          No devices found matching your criteria
        </td>
      </tr>
    )}
  </tbody>
</table>
      </div>
      
      {filteredDevices.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDevices.length)} of {filteredDevices.length} devices
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {totalPages <= 5 ? (
              // Show all pages if total is 5 or less
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))
            ) : (
              // Show selective pages if total is more than 5
              <>
                {/* Always show first page */}
                <Button
                  key={1}
                  variant={currentPage === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </Button>
                
                {/* Show ellipsis if not at the beginning */}
                {currentPage > 3 && <span className="px-2">...</span>}
                
                {/* Show current page and surrounding pages */}
                {Array.from(
                  { length: 3 },
                  (_, i) => Math.min(Math.max(currentPage - 1 + i, 2), totalPages - 1)
                )
                .filter((page, i, arr) => arr.indexOf(page) === i) // Remove duplicates
                .filter(page => page > 1 && page < totalPages) // Remove first and last pages
                .map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                {/* Show ellipsis if not at the end */}
                {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                
                {/* Always show last page */}
                <Button
                  key={totalPages}
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default function CountryAnalysis({ timeRange }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState("")
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState("")
  const [currentCountry, setCurrentCountry] = useState(null)
  const [districtsInCountry, setDistrictsInCountry] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pm25TimeSeriesData, setPm25TimeSeriesData] = useState([]);



  

  // Fetch all regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${config.apiUrl}/network-analysis/regional`)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const data = await response.json()
        if (data.regions && data.regions.length > 0) {
          setRegions(data.regions)
          // Set first region as selected by default
          setSelectedRegion(data.regions[0].region)
        }
      } catch (err) {
        console.error("Failed to fetch regions:", err)
        setError("Failed to load regions. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRegions()
  }, [])

  // Fetch countries when selected region changes
  useEffect(() => {
    if (!selectedRegion) return

    const fetchCountriesInRegion = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${config.apiUrl}/network-analysis/countries`)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const data = await response.json()
        // Filter countries based on selected region
        const countriesInRegion = data.countries.filter(country => {
          return country.data && country.data.region === selectedRegion
        })
        
        setCountries(countriesInRegion)
        
        // Set first country as selected by default if available
        if (countriesInRegion.length > 0) {
          setSelectedCountry(countriesInRegion[0].country)
        } else {
          setSelectedCountry("")
        }
      } catch (err) {
        console.error("Failed to fetch countries:", err)
        setError("Failed to load countries. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCountriesInRegion()
  }, [selectedRegion])

  // Fetch specific country data when selectedCountry changes
  useEffect(() => {
    if (!selectedCountry) return

    const fetchCountryData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${config.apiUrl}/network-analysis/countries/${encodeURIComponent(selectedCountry)}`)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const countryData = await response.json()
        setCurrentCountry(countryData)

        // Fetch districts in this country
        await fetchDistrictsInCountry(selectedCountry)
      } catch (err) {
        console.error(`Failed to fetch data for country ${selectedCountry}:`, err)
        setError(`Failed to load data for ${selectedCountry}. Please try again later.`)
      } finally {
        setLoading(false)
      }
    }

    fetchCountryData()
  }, [selectedCountry])


  // 1. Add this useEffect to fetch country time series data when selectedCountry changes
useEffect(() => {
  if (!selectedCountry) return;

  const fetchCountryTimeSeriesData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/network-analysis/countries/${encodeURIComponent(selectedCountry)}/time-series?days=14`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setPm25TimeSeriesData(data.timeSeriesData || []);
    } catch (err) {
      console.error(`Failed to fetch time series data for country ${selectedCountry}:`, err);
      // Fallback to sample data if API call fails
      setPm25TimeSeriesData([
        { date: "4/18/2025", pm25: 9, pm10: 3 },
        { date: "4/19/2025", pm25: 26, pm10: 36 },
        { date: "4/20/2025", pm25: 17, pm10: 22 },
        { date: "4/21/2025", pm25: 19, pm10: 25 },
        { date: "4/22/2025", pm25: 22, pm10: 31 },
        { date: "4/23/2025", pm25: 17, pm10: 16 },
        { date: "4/24/2025", pm25: 18, pm10: 21 },
        { date: "4/25/2025", pm25: 16, pm10: 18 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  fetchCountryTimeSeriesData();
}, [selectedCountry]);





  // Fetch districts in selected country
  const fetchDistrictsInCountry = async (country) => {
    try {
      const response = await fetch(`${config.apiUrl}/network-analysis/districts`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      // Filter districts based on selected country
      const districts = data.districts.filter(district => {
        return district.data && district.data.country === country
      })
      
      setDistrictsInCountry(districts)
    } catch (err) {
      console.error("Failed to fetch districts:", err)
    }
  }

 const handleRefresh = () => {
  if (selectedCountry) {
    // Re-fetch the current country data
    const fetchCountryData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}/network-analysis/countries/${encodeURIComponent(selectedCountry)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const countryData = await response.json();
        setCurrentCountry(countryData);
        await fetchDistrictsInCountry(selectedCountry);
        
        // Also refresh time series data
        const timeSeriesResponse = await fetch(`${config.apiUrl}/network-analysis/countries/${encodeURIComponent(selectedCountry)}/time-series?days=14`);
        if (timeSeriesResponse.ok) {
          const timeSeriesData = await timeSeriesResponse.json();
          setPm25TimeSeriesData(timeSeriesData.timeSeriesData || []);
        }
      } catch (err) {
        console.error(`Failed to refresh data for country ${selectedCountry}:`, err);
        setError(`Failed to refresh data for ${selectedCountry}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }
};

  // Prepare AQI distribution data for pie chart
  const getAqiDistributionData = () => {
    if (!currentCountry || !currentCountry.data) return []
    
    const aqiData = currentCountry.data

    return [
      { name: "Good", value: aqiData.aqiGood || 0, color: aqiColors.good },
      { name: "Moderate", value: aqiData.aqiModerate || 0, color: aqiColors.moderate },
      { name: "UHFSG", value: aqiData.aqiUhfsg || 0, color: aqiColors.unhealthySensitive },
      { name: "Unhealthy", value: aqiData.aqiUnhealthy || 0, color: aqiColors.unhealthy },
      { name: "V.Unhealthy", value: aqiData.aqiVeryUnhealthy || 0, color: aqiColors.veryUnhealthy },
      { name: "Hazardous", value: aqiData.aqiHazardous || 0, color: aqiColors.hazardous },
    ]
  }

  // Format district data for charts
  const getDistrictChartData = () => {
    if (!districtsInCountry || districtsInCountry.length === 0) return []
    
    return districtsInCountry.map(district => {
      const onlineDevices = district.data?.onlineDevices || 0;
      const offlineDevices = district.data?.offlineDevices || 0;
      
      return {
        name: district.district,
        devices: onlineDevices + offlineDevices, // Calculate total from sum
        onlineDevices: onlineDevices,
        offlineDevices: offlineDevices
      }
    })
  }

  // Get devices list
  const getDevicesList = () => {
    if (!currentCountry || !currentCountry.data || !currentCountry.data.devicesList) {
      return [];
    }
    
    return currentCountry.data.devicesList;
  }

  // Show loading state
  if (loading && !currentCountry) {
    return <div className="p-8 text-center">Loading country data...</div>
  }

  // Show error state
  if (error && !currentCountry) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    )
  }

  // Extract country data
  const countryData = currentCountry?.data || {}
  const countryAqiData = getAqiDistributionData()
  const districtChartData = getDistrictChartData()
  const devicesList = getDevicesList()



  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.region} value={region.region}>
                    {region.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.country} value={country.country}>
                    {country.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      {/* AQI Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {countryAqiData.map((item) => (
          <Card key={item.name} className="overflow-hidden">
            <CardHeader className={`pb-2 bg-gradient-to-r from-${item.name.toLowerCase()}-500/10 to-transparent`}>
              <CardTitle className="text-sm font-medium text-center">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex justify-center">
              <div 
                className="text-3xl font-bold flex items-center justify-center h-16 w-16 rounded-full text-white"
                style={{ backgroundColor: item.color }}
              >
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Country-specific metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Signal className="mr-2 h-5 w-5 text-green-500" />
              Online Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countryData.onlineDevices || 0}</div>
            <p className="text-xs text-muted-foreground">
              {countryData.devices ? 
                ((countryData.onlineDevices / countryData.devices) * 100).toFixed(1) : 0}% of total devices
            </p>
            <div className="mt-2">
              <Progress 
                value={countryData.devices ? 
                  (countryData.onlineDevices / countryData.devices) * 100 : 0} 
                className="h-2" 
              />
            </div>
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
            <div className="text-2xl font-bold">{countryData.offlineDevices || 0}</div>
            <p className="text-xs text-muted-foreground">
              {countryData.devices ? 
                ((countryData.offlineDevices / countryData.devices) * 100).toFixed(1) : 0}% of total devices
            </p>
            <div className="mt-2">
              <Progress 
                value={countryData.devices ? 
                  (countryData.offlineDevices / countryData.devices) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Percent className="mr-2 h-5 w-5 text-primary" />
              Data Transmission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countryData.dataTransmissionRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Country average</p>
            <div className="mt-2">
              <Progress value={countryData.dataTransmissionRate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wind className="mr-2 h-5 w-5 text-primary" />
              Average PM2.5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countryData.pm25?.toFixed(1) || 0} μg/m³</div>
            <p className="text-xs text-muted-foreground">Country average</p>
            <div className="mt-2">
              <Progress value={Math.min(100, ((countryData.pm25 || 0) / 50) * 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wind className="mr-2 h-5 w-5 text-primary" />
              Average PM10
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countryData.pm10?.toFixed(1) || 0} μg/m³</div>
            <p className="text-xs text-muted-foreground">Country average</p>
            <div className="mt-2">
              <Progress value={Math.min(100, ((countryData.pm10 || 0) / 100) * 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Data Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countryData.dataCompleteness?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Country average</p>
            <div className="mt-2">
              <Progress value={countryData.dataCompleteness || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Device Distribution by District
            </CardTitle>
            <CardDescription>Number of devices by district in {selectedCountry}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={districtChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="devices" name="Total Devices" fill="#4CAF50" />
                  <Bar dataKey="onlineDevices" name="Online Devices" fill="#2196F3" />
                  <Bar dataKey="offlineDevices" name="Offline Devices" fill="#F44336" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wind className="mr-2 h-5 w-5 text-primary" />
            PM10 vs PM2.5 Comparison
          </CardTitle>
          <CardDescription>Comparison of PM10 and PM2.5 levels over time in {selectedCountry}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading trend data...</p>
              </div>
            ) : pm25TimeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pm25TimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pm25" name="PM2.5 (μg/m³)" stroke="#8884d8" />
                  <Line type="monotone" dataKey="pm10" name="PM10 (μg/m³)" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available for this country</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Device List for Country with Pagination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            Device List for {selectedCountry}
          </CardTitle>
          <CardDescription>All devices in {selectedCountry} and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PaginatedDeviceTable 
            devices={devicesList}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        </CardContent>
      </Card>
    </div>
  )
}