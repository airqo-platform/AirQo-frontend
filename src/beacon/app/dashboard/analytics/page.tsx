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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import SiteAnalyticsPage from "./site_analysis"
import RegionalAnalysis from "./RegionalAnalysisPage"
import CountryAnalysisPage from "./CountryAnalysisPage"
import DistrictAnalysisPage from "./DistrictAnalysisPage"

// API endpoint base URL
const API_BASE_URL = "http://srv828289.hstgr.cloud:8000";

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
function formatNumber(value, decimals = 1) {
  // Check if value is null, undefined, or not a number
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A"
  }
  return Number(value).toFixed(decimals) + " μg/m³"
}

export default function AnalyticsPage() {
  // State variables
  const [timeRange, setTimeRange] = useState("month")
  const [activeTab, setActiveTab] = useState("network")
  const [selectedSite, setSelectedSite] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedRegionForCountry, setSelectedRegionForCountry] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedRegionForDistrict, setSelectedRegionForDistrict] = useState("")
  const [selectedCountryForDistrict, setSelectedCountryForDistrict] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  // Data states - replace static data with these states
  const [regionalSummaryData, setRegionalSummaryData] = useState({
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
  
  const [regionalComparisonData, setRegionalComparisonData] = useState([])
  const [countryData, setCountryData] = useState([])
  const [districtData, setDistrictData] = useState([])
  const [villageData, setVillageData] = useState([])
  const [sitesList, setSitesList] = useState([])
  const [siteAirQualityData, setSiteAirQualityData] = useState({})
  const [sitePerformanceData, setSitePerformanceData] = useState({})

  // Fetch data when component mounts or when dependencies change
  useEffect(() => {
    // Call your API endpoints here to fetch real data
    fetchSummaryData()
    fetchRegionalData()
    fetchCountryData()
    fetchDistrictData()
    fetchVillageData()
    fetchSitesData()
  }, [])

  // When time range changes, refetch time-dependent data
  useEffect(() => {
    fetchTimeRangeData()
  }, [timeRange])

  const fetchSummaryData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Use the network summary endpoint with the full URL
      const response = await fetch(`${API_BASE_URL}/network-analysis/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Summary data from API:', data);
      
      // Map the API response directly to our state structure
      setRegionalSummaryData({
        regions: data.regions || 0,
        totalDevices: data.totalDevices || 0,
        countries: data.countries || 0,
        countriesDevices: data.totalDevices || 0, // Using totalDevices since there's no specific countriesDevices field
        districts: data.districts || 0,
        districtsWithDevices: data.districts || 0, // Assuming all districts have devices
        onlineDevices: data.onlineDevices || 0,
        offlineDevices: data.offlineDevices || 0,
        dataCompleteness: data.dataCompleteness || 0,
        averagePM25: data.averagePM25 || 0,
        averagePM10: data.averagePM10 || 0,
      });
      
      // You can also store the regionsData for more detailed analysis
      if (data.regionsData) {
        setRegionalComparisonData(data.regionsData.map(region => ({
          region: region.region,
          deviceCount: region.deviceCount || 0,
          onlineDevices: region.onlineDevices || 0,
          offlineDevices: region.offlineDevices || 0,
          dataTransmissionRate: region.dataTransmissionRate || 0,
          dataCompleteness: region.dataCompleteness || 0,
          pm25: region.pm25 || 0,
          pm10: region.pm10 || 0,
          // AQI distribution data
          aqiGood: region.aqiGood || 0,
          aqiModerate: region.aqiModerate || 0,
          aqiUhfsg: region.aqiUhfsg || 0,
          aqiUnhealthy: region.aqiUnhealthy || 0,
          aqiVeryUnhealthy: region.aqiVeryUnhealthy || 0,
          aqiHazardous: region.aqiHazardous || 0,
          // Additional data
          countries: region.countries || 0,
          districts: region.districts || 0,
        })));
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setHasError(true);
      
      // If we can't fetch data from the API, use hard-coded data from the image for demo purposes
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

  const fetchRegionalData = async () => {
    try {
      // Actual API call to the regional data endpoint
      const response = await fetch(`${API_BASE_URL}/network-analysis/regional`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Process the regions data 
      if (result.regions && Array.isArray(result.regions)) {
        const regionsData = result.regions.map(region => {
          // Extract relevant data from the region.data object
          const regionData = region.data || {};
          
          return {
            region: region.region,
            deviceCount: regionData.deviceCount || 0,
            onlineDevices: regionData.onlineDevices || 0,
            offlineDevices: regionData.offlineDevices || 0,
            dataTransmissionRate: regionData.dataTransmissionRate || 0,
            dataCompleteness: regionData.dataCompleteness || 0,
            pm25: regionData.pm25 || 0,
            pm10: regionData.pm10 || 0,
            // Add AQI distribution data
            aqiGood: regionData.aqiGood || 0,
            aqiModerate: regionData.aqiModerate || 0,
            aqiUhfsg: regionData.aqiUhfsg || 0,
            aqiUnhealthy: regionData.aqiUnhealthy || 0,
            aqiVeryUnhealthy: regionData.aqiVeryUnhealthy || 0,
            aqiHazardous: regionData.aqiHazardous || 0,
            // Add more fields
            countries: regionData.countries || 0,
            districts: regionData.districts || 0,
          };
        });
        
        setRegionalComparisonData(regionsData);
        
        // Set default selected region if we have data
        if (regionsData.length > 0 && !selectedRegion) {
          setSelectedRegion(regionsData[0].region);
          setSelectedRegionForCountry(regionsData[0].region);
          setSelectedRegionForDistrict(regionsData[0].region);
        }
      }
    } catch (error) {
      console.error("Error fetching regional data:", error);
      // Keep existing regional data if error occurs
    }
  }

  const fetchCountryData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/network-analysis/countries`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Process the countries data
      if (result.countries && Array.isArray(result.countries)) {
        const countriesData = result.countries.map(country => {
          // Extract relevant data from the country.data object
          const countryData = country.data || {};
          
          return {
            name: country.country,
            region: countryData.region || 'Unknown',
            deviceCount: countryData.deviceCount || 0,
            onlineDevices: countryData.onlineDevices || 0,
            offlineDevices: countryData.offlineDevices || 0,
            dataTransmissionRate: countryData.dataTransmissionRate || 0,
            dataCompleteness: countryData.dataCompleteness || 0,
            pm25: countryData.pm25 || 0,
            pm10: countryData.pm10 || 0,
            // Add AQI distribution data
            aqiGood: countryData.aqiGood || 0,
            aqiModerate: countryData.aqiModerate || 0,
            aqiUhfsg: countryData.aqiUhfsg || 0,
            aqiUnhealthy: countryData.aqiUnhealthy || 0,
            aqiVeryUnhealthy: countryData.aqiVeryUnhealthy || 0,
            aqiHazardous: countryData.aqiHazardous || 0,
            // Map devicesList if available
            devicesList: countryData.devicesList || []
          };
        });
        
        setCountryData(countriesData);
        
        // Set default selected country if we have data
        if (countriesData.length > 0 && !selectedCountry) {
          setSelectedCountry(countriesData[0].name);
          setSelectedCountryForDistrict(countriesData[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching country data:", error);
      setCountryData([]);
    }
  }

  const fetchDistrictData = async () => {
    try {
      // If we have a selected country, filter by it
      const url = selectedCountryForDistrict 
        ? `${API_BASE_URL}/network-analysis/districts?country=${encodeURIComponent(selectedCountryForDistrict)}`
        : `${API_BASE_URL}/network-analysis/districts`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.districts && Array.isArray(result.districts)) {
        // Process the districts data
        const districtsData = result.districts.map(district => {
          // Extract relevant data from the district.data object
          const districtData = district.data || {};
          
          return {
            name: district.district,
            country: district.country,
            deviceCount: districtData.devices || 0,
            onlineDevices: districtData.onlineDevices || 0,
            offlineDevices: districtData.offlineDevices || 0,
            dataTransmissionRate: districtData.dataTransmissionRate || 0,
            dataCompleteness: districtData.dataCompleteness || 0,
            pm25: districtData.pm25 || 0,
            pm10: districtData.pm10 || 0,
            // Add AQI distribution data
            aqiGood: districtData.aqiGood || 0,
            aqiModerate: districtData.aqiModerate || 0,
            aqiUhfsg: districtData.aqiUhfsg || 0,
            aqiUnhealthy: districtData.aqiUnhealthy || 0,
            aqiVeryUnhealthy: districtData.aqiVeryUnhealthy || 0,
            aqiHazardous: districtData.aqiHazardous || 0,
            // Map devicesList if available
            devicesList: districtData.devicesList || []
          };
        });
        
        setDistrictData(districtsData);
        
        // Set default selected district if we have data
        if (districtsData.length > 0 && !selectedDistrict) {
          setSelectedDistrict(districtsData[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching district data:", error);
      setDistrictData([]);
    }
  }

  const fetchVillageData = async () => {
    // This function would need to be implemented when there's an API endpoint for village data
    try {
      // For now, this is a placeholder
      setVillageData([]);
      
      // Set default selected location if we have data
      if (villageData.length > 0 && !selectedLocation) {
        setSelectedLocation(villageData[0].name);
      }
    } catch (error) {
      console.error("Error fetching village data:", error);
      setVillageData([]);
    }
  }

  const fetchSitesData = async () => {
    // This function would need to be implemented when there's an API endpoint for sites data
    try {
      // For now, these are placeholders
      setSitesList([]);
      setSiteAirQualityData({});
      setSitePerformanceData({});
      
      // Set default selected site if we have data
      if (sitesList.length > 0 && !selectedSite) {
        setSelectedSite(sitesList[0].id);
      }
    } catch (error) {
      console.error("Error fetching sites data:", error);
    }
  }

  const fetchTimeRangeData = async () => {
    // This would be implemented to fetch time-dependent data based on the selected range
    try {
      // For now, this is a placeholder
      console.log(`Fetching time range data for: ${timeRange}`);
    } catch (error) {
      console.error("Error fetching time range data:", error);
    }
  }

  // The rest of your component's code (data processing functions, memoization, etc.) remains the same
  
  // Get the current site data
  const currentSite = useMemo(() => {
    return sitesList.find((site) => site.id === selectedSite) || null
  }, [sitesList, selectedSite])
  
  const currentSiteAirQuality = useMemo(() => {
    return siteAirQualityData[selectedSite] || null
  }, [siteAirQualityData, selectedSite])
  
  const currentSitePerformance = useMemo(() => {
    return sitePerformanceData[selectedSite] || []
  }, [sitePerformanceData, selectedSite])

  // Get the selected region data
  const currentRegion = useMemo(() => {
    return regionalComparisonData.find((region) => region.region === selectedRegion) || null
  }, [regionalComparisonData, selectedRegion])

  // Get the selected country data
  const currentCountry = useMemo(() => {
    return countryData.find((country) => country.name === selectedCountry) || null
  }, [countryData, selectedCountry])

  // Get the selected district data
  const currentDistrict = useMemo(() => {
    return districtData.find((district) => district.name === selectedDistrict) || null
  }, [districtData, selectedDistrict])

  // Filter countries based on selected region
  const countriesInSelectedRegion = useMemo(() => {
    return countryData.filter((country) => country.region === selectedRegionForCountry)
  }, [countryData, selectedRegionForCountry])

  // Filter districts based on selected country
  const districtsInSelectedCountry = useMemo(() => {
    return districtData.filter((district) => district.country === selectedCountryForDistrict)
  }, [districtData, selectedCountryForDistrict])

  // Filter locations based on selected district
  const locationsInSelectedDistrict = useMemo(() => {
    return villageData.filter((village) => village.district === selectedDistrict)
  }, [villageData, selectedDistrict])

  // Get the selected location data
  const currentLocation = useMemo(() => {
    return villageData.find((village) => village.name === selectedLocation) || null
  }, [villageData, selectedLocation])

  // Filter countries for the regional analysis view
  const countriesInRegion = useMemo(() => {
    return countryData.filter((country) => country.region === selectedRegion)
  }, [countryData, selectedRegion])

  // Filter districts for the country analysis view
  const districtsInCountry = useMemo(() => {
    return districtData.filter((district) => district.country === selectedCountry)
  }, [districtData, selectedCountry])

  // Find regions with highest and lowest offline devices
  const regionWithMostOfflineDevices = useMemo(() => {
    if (!regionalComparisonData.length) return null
    return regionalComparisonData.reduce((prev, current) => 
      (prev.offlineDevices > current.offlineDevices) ? prev : current
    )
  }, [regionalComparisonData])

  const regionWithLeastOfflineDevices = useMemo(() => {
    if (!regionalComparisonData.length) return null
    return regionalComparisonData.reduce((prev, current) => 
      (prev.offlineDevices < current.offlineDevices) ? prev : current
    )
  }, [regionalComparisonData])

  // Find countries with highest and lowest offline devices
  const countryWithMostOfflineDevices = useMemo(() => {
    if (!countryData.length) return null
    return countryData.reduce((prev, current) => 
      (prev.offlineDevices > current.offlineDevices) ? prev : current
    )
  }, [countryData])

  const countryWithLeastOfflineDevices = useMemo(() => {
    if (!countryData.length) return null
    return countryData.reduce((prev, current) => 
      (prev.offlineDevices < current.offlineDevices && current.offlineDevices > 0) ? prev : current
    )
  }, [countryData])

  // Find districts with highest and lowest offline devices
  const districtWithMostOfflineDevices = useMemo(() => {
    if (!districtData.length) return null
    return districtData.reduce((prev, current) => 
      (prev.offlineDevices > current.offlineDevices) ? prev : current
    )
  }, [districtData])

  const districtWithLeastOfflineDevices = useMemo(() => {
    if (!districtData.length) return null
    return districtData.reduce((prev, current) => 
      (prev.offlineDevices < current.offlineDevices && current.offlineDevices > 0) ? prev : current
    )
  }, [districtData])

  // Find locations with highest and lowest offline devices
  const locationWithMostOfflineDevices = useMemo(() => {
    if (!villageData.length) return null
    return villageData.reduce((prev, current) => 
      (prev.offlineDevices > current.offlineDevices) ? prev : current
    )
  }, [villageData])

  const locationWithLeastOfflineDevices = useMemo(() => {
    if (!villageData.length) return null
    return villageData.reduce((prev, current) => 
      (prev.offlineDevices < current.offlineDevices && current.offlineDevices > 0) ? prev : current
    )
  }, [villageData])

  // Find entities with best and worst data transmission rates
  const regionWithBestDataTransmission = useMemo(() => {
    if (!regionalComparisonData.length) return null
    return regionalComparisonData.reduce((prev, current) => 
      (prev.dataTransmissionRate > current.dataTransmissionRate) ? prev : current
    )
  }, [regionalComparisonData])

  const regionWithWorstDataTransmission = useMemo(() => {
    if (!regionalComparisonData.length) return null
    return regionalComparisonData.reduce((prev, current) => 
      (prev.dataTransmissionRate < current.dataTransmissionRate) ? prev : current
    )
  }, [regionalComparisonData])

  // Prepare AQI distribution data for pie chart
  const getAqiDistributionData = (entity) => {
    if (!entity) return []
    
    return [
      { name: "Good", value: entity.aqiGood || 0, color: aqiColors.good },
      { name: "Moderate", value: entity.aqiModerate || 0, color: aqiColors.moderate },
      { name: "UHFSG", value: entity.aqiUhfsg || 0, color: aqiColors.unhealthySensitive },
      { name: "Unhealthy", value: entity.aqiUnhealthy || 0, color: aqiColors.unhealthy },
      { name: "V.Unhealthy", value: entity.aqiVeryUnhealthy || 0, color: aqiColors.veryUnhealthy },
      { name: "Hazardous", value: entity.aqiHazardous || 0, color: aqiColors.hazardous },
    ]
  }

  // Get AQI distribution data for current selections
  const regionAqiData = useMemo(() => getAqiDistributionData(currentRegion), [currentRegion])
  const countryAqiData = useMemo(() => getAqiDistributionData(currentCountry), [currentCountry])
  const districtAqiData = useMemo(() => getAqiDistributionData(currentDistrict), [currentDistrict])
  const locationAqiData = useMemo(() => getAqiDistributionData(currentLocation), [currentLocation])

  // Filter devices based on search term and status filter
  const filterDevices = (devices) => {
    if (!devices) return []
    
    return devices.filter((device) => {
      const matchesSearch = 
        device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || device.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }

  const filteredCountryDevices = useMemo(() => {
    return currentCountry?.devicesList ? filterDevices(currentCountry.devicesList) : []
  }, [currentCountry, searchTerm, statusFilter])
  
  const filteredDistrictDevices = useMemo(() => {
    return currentDistrict?.devicesList ? filterDevices(currentDistrict.devicesList) : []
  }, [currentDistrict, searchTerm, statusFilter])
  
  const filteredLocationDevices = useMemo(() => {
    return currentLocation?.devicesList ? filterDevices(currentLocation.devicesList) : []
  }, [currentLocation, searchTerm, statusFilter])

  // Handlers for data refresh and export
  const handleRefresh = () => {
    // Refetch all data
    fetchSummaryData()
    fetchRegionalData()
    fetchCountryData()
    fetchDistrictData()
    fetchVillageData()
    fetchSitesData()
    fetchTimeRangeData()
  }

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting data...")
    // Example: generate CSV or Excel file
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Device Performance Analytics</h1>
        <div className="flex items-center space-x-2">
          <select className="border rounded-md p-2" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
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
        <TabsList className="grid grid-cols-2 mb-4 w-[400px]">
          <TabsTrigger value="network">Network Analytics</TabsTrigger>
          <TabsTrigger value="site">Site Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-6">
          {/* Regional Analysis Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-primary" />
                  Regions & Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regionalSummaryData.regions} Regions</div>
                <p className="text-sm text-muted-foreground">
                  {regionalSummaryData.totalDevices} devices across all regions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Map className="mr-2 h-5 w-5 text-primary" />
                  Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regionalSummaryData.countries} Countries</div>
                <p className="text-sm text-muted-foreground">
                  {regionalSummaryData.totalDevices} devices across all countries
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Layers className="mr-2 h-5 w-5 text-primary" />
                  Districts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {regionalSummaryData.districts}/{regionalSummaryData.districts}
                </div>
                <p className="text-sm text-muted-foreground">Districts with active monitoring devices</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Device Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {regionalSummaryData.onlineDevices}/{regionalSummaryData.totalDevices}
                </div>
                <p className="text-sm text-muted-foreground">Devices currently online</p>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue="regional" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
            <TabsTrigger value="country">Country Analysis</TabsTrigger>
            <TabsTrigger value="district">District Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="regional" className="space-y-4">
            <RegionalAnalysis timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="country" className="space-y-4">
            <CountryAnalysisPage timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="district" className="space-y-4">
            <DistrictAnalysisPage timeRange={timeRange} />
          </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="site" className="space-y-6">
          <SiteAnalyticsPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}