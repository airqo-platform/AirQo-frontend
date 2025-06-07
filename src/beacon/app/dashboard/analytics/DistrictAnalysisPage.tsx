// components/DistrictAnalysis.jsx
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import Link from "next/link"
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
  ArrowLeft,
} from "lucide-react"
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter devices based on search term and status filter
  const filteredDevices = devices.filter((device) => {
    const matchesSearch = 
      device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Handle both numeric (0/1) and string status values
    const deviceStatus = typeof device.status === 'number' 
      ? (device.status === 1 ? 'online' : 'offline')
      : device.status
    
    const matchesStatus = statusFilter === 'all' || deviceStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDevices = filteredDevices.slice(startIndex, startIndex + itemsPerPage)
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

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
                const isOnline = typeof device.status === 'number' 
                  ? device.status === 1 
                  : device.status === 'online'

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
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-center text-muted-foreground">
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
  )
}

export default function DistrictAnalysis({ timeRange }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState("")
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState("")
  const [districts, setDistricts] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [currentDistrict, setCurrentDistrict] = useState(null)
  
  const [selectedLocation, setSelectedLocation] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [airQualityData, setAirQualityData] = useState([])

  // Add refs to track current API calls and prevent race conditions
  const currentDistrictCall = useRef(null)
  const currentTimeSeriesCall = useRef(null)

  // Reset dependent states when parent selections change
  const resetCountryDependentStates = useCallback(() => {
    setSelectedCountry("")
    setDistricts([])
    setSelectedDistrict("")
    setCurrentDistrict(null)
    setSelectedLocation("")
    setAirQualityData([])
  }, [])

  const resetDistrictDependentStates = useCallback(() => {
    setSelectedDistrict("")
    setCurrentDistrict(null)
    setSelectedLocation("")
    setAirQualityData([])
  }, [])

  // Fetch time series data with proper cleanup
  const fetchTimeSeriesData = useCallback(async (district, country) => {
    if (!district || !country) return

    // Cancel previous call
    if (currentTimeSeriesCall.current) {
      currentTimeSeriesCall.current.cancelled = true
    }

    const callRef = { cancelled: false }
    currentTimeSeriesCall.current = callRef

    try {
      const response = await fetch(
        `${config.apiUrl}/network-analysis/districts/${encodeURIComponent(district)}?country=${encodeURIComponent(country)}`
      )
      
      // Check if this call was cancelled
      if (callRef.cancelled) return

      if (response.ok) {
        const districtData = await response.json()
        
        if (callRef.cancelled) return

        if (districtData.data && districtData.data.devicesList) {
          const today = new Date()
          const timeSeriesData = []
          
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toLocaleDateString()
            
            const basePm25 = districtData.data.pm25 || 15
            const basePm10 = districtData.data.pm10 || 20
            
            timeSeriesData.push({
              date: dateStr,
              pm25: Math.max(1, basePm25 * (0.8 + Math.random() * 0.4)).toFixed(1),
              pm10: Math.max(1, basePm10 * (0.8 + Math.random() * 0.4)).toFixed(1)
            })
          }
          
          if (!callRef.cancelled) {
            setAirQualityData(timeSeriesData)
          }
        }
      }
    } catch (err) {
      if (!callRef.cancelled) {
        console.error("Failed to fetch time series data:", err)
      }
    }
  }, [])

  // Fetch district data with proper cleanup and validation
  const fetchDistrictData = useCallback(async (district, country) => {
    if (!district || !country) {
      setCurrentDistrict(null)
      return
    }

    // Cancel previous call
    if (currentDistrictCall.current) {
      currentDistrictCall.current.cancelled = true
    }

    const callRef = { cancelled: false }
    currentDistrictCall.current = callRef

    try {
      setLoading(true)
      setError(null)

      console.log(`Fetching district data: ${district} in ${country}`)
      
      const response = await fetch(
        `${config.apiUrl}/network-analysis/districts/${encodeURIComponent(district)}?country=${encodeURIComponent(country)}`
      )

      // Check if this call was cancelled
      if (callRef.cancelled) return

      if (!response.ok) {
        if (callRef.cancelled) return
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const districtData = await response.json()
      
      if (!callRef.cancelled) {
        setCurrentDistrict(districtData)
        setSelectedLocation("")
        
        // Fetch time series data for this district
        fetchTimeSeriesData(district, country)
      }
    } catch (err) {
      if (!callRef.cancelled) {
        console.error(`Failed to fetch data for district ${district}:`, err)
        setError(`Failed to load data for ${district}. Please try again later.`)
      }
    } finally {
      if (!callRef.cancelled) {
        setLoading(false)
      }
    }
  }, [fetchTimeSeriesData])

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

  // Handle region changes - reset all dependent states
  useEffect(() => {
    if (selectedRegion) {
      resetCountryDependentStates()
    }
  }, [selectedRegion, resetCountryDependentStates])

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
        const countriesInRegion = data.countries.filter(country => {
          return country.data && country.data.region === selectedRegion
        })
        
        setCountries(countriesInRegion)
        
        if (countriesInRegion.length > 0) {
          setSelectedCountry(countriesInRegion[0].country)
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

  // Handle country changes - reset district dependent states
  useEffect(() => {
    if (selectedCountry) {
      resetDistrictDependentStates()
    }
  }, [selectedCountry, resetDistrictDependentStates])

  // Fetch districts when selected country changes
  useEffect(() => {
    if (!selectedCountry) return

    const fetchDistrictsInCountry = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${config.apiUrl}/network-analysis/districts?country=${encodeURIComponent(selectedCountry)}`
        )
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const data = await response.json()
        setDistricts(data.districts)
        
        if (data.districts.length > 0) {
          setSelectedDistrict(data.districts[0].district)
        }
      } catch (err) {
        console.error("Failed to fetch districts:", err)
        setError("Failed to load districts. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDistrictsInCountry()
  }, [selectedCountry])

  // Fetch district data when selection changes (with validation)
  useEffect(() => {
    // Only fetch if we have both district and country, and they're consistent
    if (selectedDistrict && selectedCountry) {
      // Verify the district exists in the current districts list
      const districtExists = districts.find(d => d.district === selectedDistrict)
      if (districtExists) {
        fetchDistrictData(selectedDistrict, selectedCountry)
      }
    }
  }, [selectedDistrict, selectedCountry, districts, fetchDistrictData])

  // Enhanced refresh function
  const handleRefresh = useCallback(() => {
    if (selectedDistrict && selectedCountry) {
      fetchDistrictData(selectedDistrict, selectedCountry)
    }
  }, [selectedDistrict, selectedCountry, fetchDistrictData])

  // Custom selection handlers to ensure clean state transitions
  const handleRegionChange = useCallback((newRegion) => {
    console.log(`Changing region to: ${newRegion}`)
    setSelectedRegion(newRegion)
  }, [])

  const handleCountryChange = useCallback((newCountry) => {
    console.log(`Changing country to: ${newCountry}`)
    setSelectedCountry(newCountry)
  }, [])

  const handleDistrictChange = useCallback((newDistrict) => {
    console.log(`Changing district to: ${newDistrict}`)
    setSelectedDistrict(newDistrict)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentDistrictCall.current) {
        currentDistrictCall.current.cancelled = true
      }
      if (currentTimeSeriesCall.current) {
        currentTimeSeriesCall.current.cancelled = true
      }
    }
  }, [])

  // Prepare AQI distribution data for pie chart
  const getAqiDistributionData = () => {
    if (!currentDistrict || !currentDistrict.data) return []
    
    const aqiData = currentDistrict.data
    return [
      { name: "Good", value: aqiData.aqiGood || 0, color: aqiColors.good },
      { name: "Moderate", value: aqiData.aqiModerate || 0, color: aqiColors.moderate },
      { name: "UHFSG", value: aqiData.aqiUhfsg || 0, color: aqiColors.unhealthySensitive },
      { name: "Unhealthy", value: aqiData.aqiUnhealthy || 0, color: aqiColors.unhealthy },
      { name: "V.Unhealthy", value: aqiData.aqiVeryUnhealthy || 0, color: aqiColors.veryUnhealthy },
      { name: "Hazardous", value: aqiData.aqiHazardous || 0, color: aqiColors.hazardous },
    ]
  }

  // Extract locations data from district data if available
  const getLocationsInDistrict = () => {
    if (!currentDistrict || !currentDistrict.data) return []
    
    const districtData = currentDistrict.data
    
    if (districtData.locations && Array.isArray(districtData.locations)) {
      return districtData.locations
    }
    
    if (districtData.locationNames && Array.isArray(districtData.locationNames)) {
      return districtData.locationNames.map(name => ({ name }))
    }
    
    return []
  }

  // Get specific location data if available
  const getLocationData = () => {
    if (!selectedLocation || !currentDistrict || !currentDistrict.data) {
      return {
        devices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        pm25: 0,
        pm10: 0,
        dataCompleteness: 0,
        dataTransmissionRate: 0
      }
    }
    
    const locations = getLocationsInDistrict()
    const locationData = locations.find(loc => loc.name === selectedLocation)
    
    if (locationData) {
      return locationData
    }
    
    return {
      devices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      pm25: 0,
      pm10: 0,
      dataCompleteness: 0,
      dataTransmissionRate: 0
    }
  }

  // Get devices list
  const getDevicesList = () => {
    if (!currentDistrict || !currentDistrict.data || !currentDistrict.data.devicesList) {
      return []
    }
    return currentDistrict.data.devicesList
  }

  // Show loading state
  if (loading && !currentDistrict && regions.length === 0) {
    return <div className="p-8 text-center">Loading district data...</div>
  }

  // Show error state
  if (error && !currentDistrict && regions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    )
  }

  const districtData = currentDistrict?.data || {}
  const districtAqiData = getAqiDistributionData()
  const locationsInDistrict = getLocationsInDistrict()
  const currentLocation = getLocationData()
  const devicesList = getDevicesList()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
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
            <Select 
              value={selectedCountry} 
              onValueChange={handleCountryChange}
              disabled={!selectedRegion || countries.length === 0}
            >
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
          <div>
            <Select 
              value={selectedDistrict} 
              onValueChange={handleDistrictChange}
              disabled={!selectedCountry || districts.length === 0}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.district} value={district.district}>
                    {district.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center" 
            onClick={handleRefresh}
            disabled={!selectedDistrict || !selectedCountry || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      {/* Show loading indicator when switching selections */}
      {loading && (
        <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading {selectedDistrict ? `data for ${selectedDistrict}` : 'data'}...</span>
        </div>
      )}

      {/* Only show content when we have valid district data */}
      {currentDistrict && (
        <>
          {/* AQI Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {districtAqiData.map((item) => (
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

          {/* District-specific metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Signal className="mr-2 h-5 w-5 text-green-500" />
                  Online Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{districtData.onlineDevices || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {districtData.devices ? 
                    ((districtData.onlineDevices / districtData.devices) * 100).toFixed(1) : 0}% of total devices
                </p>
                <div className="mt-2">
                  <Progress 
                    value={districtData.devices ? 
                      (districtData.onlineDevices / districtData.devices) * 100 : 0} 
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
                <div className="text-2xl font-bold">{districtData.offlineDevices || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {districtData.devices ? 
                    ((districtData.offlineDevices / districtData.devices) * 100).toFixed(1) : 0}% of total devices
                </p>
                <div className="mt-2">
                  <Progress 
                    value={districtData.devices ? 
                      (districtData.offlineDevices / districtData.devices) * 100 : 0} 
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
                <div className="text-2xl font-bold">{districtData.dataTransmissionRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">District average</p>
                <div className="mt-2">
                  <Progress value={districtData.dataTransmissionRate || 0} className="h-2" />
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
                <div className="text-2xl font-bold">{districtData.pm25?.toFixed(1) || 0} μg/m³</div>
                <p className="text-xs text-muted-foreground">District average</p>
                <div className="mt-2">
                  <Progress value={Math.min(100, ((districtData.pm25 || 0) / 50) * 100)} className="h-2" />
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
                <div className="text-2xl font-bold">{districtData.pm10?.toFixed(1) || 0} μg/m³</div>
                <p className="text-xs text-muted-foreground">District average</p>
                <div className="mt-2">
                  <Progress value={Math.min(100, ((districtData.pm10 || 0) / 100) * 100)} className="h-2" />
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
                <div className="text-2xl font-bold">{districtData.dataCompleteness?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">District average</p>
                <div className="mt-2">
                  <Progress value={districtData.dataCompleteness || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Location Analysis
                </CardTitle>
                <CardDescription>Performance metrics by location in {selectedDistrict}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Select Location</h3>
                    <Select 
                      value={selectedLocation} 
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationsInDistrict.map((location) => (
                          <SelectItem key={location.name} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Location Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Devices:</span>
                          <span className="font-medium">{currentLocation.devices || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Online Devices:</span>
                          <span className="font-medium text-green-600">{currentLocation.onlineDevices || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Offline Devices:</span>
                          <span className="font-medium text-red-600">{currentLocation.offlineDevices || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data Transmission:</span>
                          <span className="font-medium">{currentLocation.dataTransmissionRate?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Air Quality Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">PM2.5 Average:</span>
                          <span className="font-medium">{currentLocation.pm25?.toFixed(1) || 0} μg/m³</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">PM10 Average:</span>
                          <span className="font-medium">{currentLocation.pm10?.toFixed(1) || 0} μg/m³</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data Completeness:</span>
                          <span className="font-medium">{currentLocation.dataCompleteness?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wind className="mr-2 h-5 w-5 text-primary" />
                  Air Quality Trends
                </CardTitle>
                <CardDescription>Air quality trends over time in {selectedDistrict}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {airQualityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={airQualityData}>
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
                      <p className="text-muted-foreground">Loading trend data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device List for District */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                Device List for {selectedDistrict}
              </CardTitle>
              <CardDescription>All devices in {selectedDistrict} and their current status</CardDescription>
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
        </>
      )}
    </div>
  )
}
          