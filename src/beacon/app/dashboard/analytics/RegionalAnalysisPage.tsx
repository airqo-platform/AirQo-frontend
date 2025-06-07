// components/RegionalAnalysis.jsx
"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Zap,
  Settings,
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

// Distribution Card component for power and mounting type
const DistributionCards = ({ title, icon: Icon, data }) => {
  if (!data || data.length === 0) return null;
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Icon className="mr-2 h-5 w-5 text-primary" />
        {title}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((item) => (
          <Card key={item.name} className="overflow-hidden">
            <CardHeader className={`pb-2 bg-gradient-to-r from-primary/10 to-transparent`}>
              <CardTitle className="text-sm font-medium text-center">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex justify-center">
              <div 
                className="text-xl font-bold flex items-center justify-center h-16 w-16 rounded-full text-white"
                style={{ backgroundColor: item.color }}
              >
                {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Metric Card component for consistent rendering of metrics
const MetricCard = ({ title, icon: Icon, value, total, unit, progressMax = 100, iconColor }) => {
  const percentage = total ? (value / total) * 100 : 0;
  const progressValue = progressMax ? Math.min(100, (value / progressMax) * 100) : percentage;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Icon className={`mr-2 h-5 w-5 ${iconColor || "text-primary"}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toFixed(1) : value || 0}{unit && ` ${unit}`}</div>
        {total && (
          <p className="text-xs text-muted-foreground">
            {percentage.toFixed(1)}% of total devices
          </p>
        )}
        <div className="mt-2">
          <Progress value={progressValue} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function RegionalAnalysis({ timeRange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [currentRegion, setCurrentRegion] = useState(null);
  const [summary, setSummary] = useState(null);
  const [countriesInRegion, setCountriesInRegion] = useState([]);
  
  // Prepare distribution data
  const [powerTypeData, setPowerTypeData] = useState([]);
  const [mountTypeData, setMountTypeData] = useState([]);

  // Fetch all regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}/network-analysis/regional`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.regions && data.regions.length > 0) {
          setRegions(data.regions);
          // Set first region as selected by default
          setSelectedRegion(data.regions[0].region);
        }
      } catch (err) {
        console.error("Failed to fetch regions:", err);
        setError("Failed to load regions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchSummary = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/network-analysis/summary`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      }
    };

    fetchRegions();
    fetchSummary();
  }, []);

  // Fetch specific region data when selectedRegion changes
  useEffect(() => {
    if (!selectedRegion) return;

    const fetchRegionData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}/network-analysis/regional/${encodeURIComponent(selectedRegion)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const regionData = await response.json();
        setCurrentRegion(regionData);

        // Prepare power type data
        const powerData = [
          { name: "Solar", value: regionData.data?.solarDevices || 0, color: "#FFC107" },
          { name: "Mains", value: regionData.data?.mainsDevices || 0, color: "#4CAF50" },
          { name: "Battery", value: regionData.data?.batteryDevices || 0, color: "#2196F3" },
          { name: "Alternator", value: regionData.data?.alternatorDevices || 0, color: "#9C27B0" },
          { name: "Unknown", value: regionData.data?.unknownPowerDevices || 0, color: "#607D8B" }
        ];
        setPowerTypeData(powerData.filter(item => item.value > 0));

        // Prepare mount type data
        const mountData = [
          { name: "Pole", value: regionData.data?.poleDevices || 0, color: "#3F51B5" },
          { name: "Wall", value: regionData.data?.wallDevices || 0, color: "#E91E63" },
          { name: "Rooftop", value: regionData.data?.rooftopDevices || 0, color: "#FF9800" },
          { name: "Suspended", value: regionData.data?.suspendedDevices || 0, color: "#009688" },
          { name: "Faceboard", value: regionData.data?.faceboardDevices || 0, color: "#795548" },
          { name: "Unknown", value: regionData.data?.unknownMountDevices || 0, color: "#607D8B" }
        ];
        setMountTypeData(mountData.filter(item => item.value > 0));

        // Fetch countries in this region
        await fetchCountriesInRegion(selectedRegion);
      } catch (err) {
        console.error(`Failed to fetch data for region ${selectedRegion}:`, err);
        setError(`Failed to load data for ${selectedRegion}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionData();
  }, [selectedRegion]);

  // Fetch countries in selected region
  const fetchCountriesInRegion = async (region) => {
    try {
      const response = await fetch(`${config.apiUrl}/network-analysis/countries`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      // Filter countries based on selected region
      const countries = data.countries.filter(country => {
        return country.data && country.data.region === region;
      });
      
      setCountriesInRegion(countries);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (selectedRegion) {
      // Re-fetch the current region data
      const fetchRegionData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${config.apiUrl}/network-analysis/regional/${encodeURIComponent(selectedRegion)}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const regionData = await response.json();
          setCurrentRegion(regionData);
          await fetchCountriesInRegion(selectedRegion);
        } catch (err) {
          console.error(`Failed to refresh data for region ${selectedRegion}:`, err);
          setError(`Failed to refresh data for ${selectedRegion}. Please try again later.`);
        } finally {
          setLoading(false);
        }
      };

      fetchRegionData();
    }
  };

  // Prepare AQI distribution data for pie chart
  const getAqiDistributionData = () => {
    if (!currentRegion || !currentRegion.data) return [];
    
    const aqiData = currentRegion.data;

    return [
      { name: "Good", value: aqiData.aqiGood || 0, color: aqiColors.good },
      { name: "Moderate", value: aqiData.aqiModerate || 0, color: aqiColors.moderate },
      { name: "UHFSG", value: aqiData.aqiUhfsg || 0, color: aqiColors.unhealthySensitive },
      { name: "Unhealthy", value: aqiData.aqiUnhealthy || 0, color: aqiColors.unhealthy },
      { name: "V.Unhealthy", value: aqiData.aqiVeryUnhealthy || 0, color: aqiColors.veryUnhealthy },
      { name: "Hazardous", value: aqiData.aqiHazardous || 0, color: aqiColors.hazardous },
    ].filter(item => item.value > 0);
  };

  // Format country data for charts
  const getCountryChartData = () => {
    if (!countriesInRegion || countriesInRegion.length === 0) return [];
    
    return countriesInRegion.map(country => {
      const onlineDevices = country.data?.onlineDevices || 0;
      const offlineDevices = country.data?.offlineDevices || 0;
      
      return {
        name: country.country,
        devices: onlineDevices + offlineDevices, 
        onlineDevices: onlineDevices,
        offlineDevices: offlineDevices
      };
    });
  };

  // Show loading state
  if (loading && !currentRegion) {
    return <div className="p-8 text-center">Loading regional data...</div>;
  }

  // Show error state
  if (error && !currentRegion) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  // Extract region data
  const regionData = currentRegion?.data || {};
  const countryChartData = getCountryChartData();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[300px]">
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
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      {/* Power Source Distribution */}
      <DistributionCards 
        title="Power Source Distribution" 
        icon={Zap} 
        data={powerTypeData} 
      />

      {/* Mounting Type Distribution */}
      <DistributionCards 
        title="Mounting Type Distribution" 
        icon={Settings} 
        data={mountTypeData} 
      />

      {/* Air Quality Index Categories - Using absolute counts instead of percentages */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Air Quality Index Categories</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: "Good", value: regionData.aqiGood || 0, color: aqiColors.good },
            { name: "Moderate", value: regionData.aqiModerate || 0, color: aqiColors.moderate },
            { name: "UHFSG", value: regionData.aqiUhfsg || 0, color: aqiColors.unhealthySensitive },
            { name: "Unhealthy", value: regionData.aqiUnhealthy || 0, color: aqiColors.unhealthy },
            { name: "V.Unhealthy", value: regionData.aqiVeryUnhealthy || 0, color: aqiColors.veryUnhealthy },
            { name: "Hazardous", value: regionData.aqiHazardous || 0, color: aqiColors.hazardous },
          ].map((item) => (
            <Card key={item.name} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-center">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-6 flex justify-center">
                <div 
                  className="text-2xl font-bold flex items-center justify-center h-20 w-20 rounded-full text-white"
                  style={{ backgroundColor: item.color }}
                >
                  {item.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Region-specific metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard 
          title="Online Devices"
          icon={Signal}
          value={regionData.onlineDevices || 0}
          total={regionData.deviceCount}
          iconColor="text-green-500"
        />
        
        <MetricCard 
          title="Offline Devices"
          icon={SignalZero}
          value={regionData.offlineDevices || 0}
          total={regionData.deviceCount}
          iconColor="text-red-500"
        />
        
        <MetricCard 
          title="Data Completeness"
          icon={Percent}
          value={regionData.dataCompleteness || 0}
          unit="%"
        />
        
        <MetricCard 
          title="Average PM2.5"
          icon={Wind}
          value={regionData.pm25 || 0}
          unit="μg/m³"
          progressMax={50}
        />
        
        <MetricCard 
          title="Average PM10"
          icon={Wind}
          value={regionData.pm10 || 0}
          unit="μg/m³"
          progressMax={100}
        />
        
        <MetricCard 
          title="Data Transmission"
          icon={Activity}
          value={regionData.dataTransmissionRate || 0}
          unit="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Device Distribution by Country
            </CardTitle>
            <CardDescription>Number of devices by country in {selectedRegion}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={countryChartData}
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
              AQI Distribution
            </CardTitle>
            <CardDescription>Distribution of AQI categories in {selectedRegion}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getAqiDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getAqiDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} readings`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}