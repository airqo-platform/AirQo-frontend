"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Wifi,
  WifiOff,
  BarChart3,
  Clock,
  Activity,
  TrendingUp,
  Layers,
  Settings,
  RefreshCw,
  Wrench,
  Calendar,
  Timer,
  Zap,
  BarChart,
  PieChart,
  Battery,
  Package,
  AlertOctagon,
  ThermometerSun,
  Wind,
} from "lucide-react"
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts"
import Link from "next/link"
import { config } from "@/lib/config"
import { format, parseISO, subDays } from "date-fns"

// Import the DeviceReliabilityAnalysis component
import DeviceReliabilityAnalysis from "./devices/device-reliability-analysis"

export default function DashboardPage() {
  // State for device counts
  const [deviceCounts, setDeviceCounts] = useState({
    total_devices: 0,
    active_devices: 0,
    offline_devices: 0,
    deployed_devices: 0,
    not_deployed: 0,
    recalled_devices: 0
  });
  
  // State for detailed device data
  const [devices, setDevices] = useState([]);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [error, setError] = useState(null);

  // Define the fetch functions
  const fetchDeviceCounts = async () => {
    try {
      setLoadingCounts(true);
      const response = await fetch(`${config.apiUrl}/device-counts`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setDeviceCounts(data);
    } catch (err) {
      console.error("Error fetching device counts:", err);
      setError("Failed to load device count data");
    } finally {
      setLoadingCounts(false);
    }
  };

  const fetchDeviceDetails = async () => {
    try {
      setLoadingDevices(true);
      const response = await fetch(`${config.apiUrl}/devices-detail`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (err) {
      console.error("Error fetching device details:", err);
      setError("Failed to load detailed device data");
    } finally {
      setLoadingDevices(false);
    }
  };

  // Call fetch functions on component mount
  useEffect(() => {
    fetchDeviceCounts();
    fetchDeviceDetails();
  }, []);

  // Calculate percentages for the progress bars
  const calculatePercentage = (value) => {
    return deviceCounts.total_devices > 0 
      ? Math.round((value / deviceCounts.total_devices) * 100) 
      : 0;
  };

  const activePercentage = calculatePercentage(deviceCounts.active_devices);
  const offlinePercentage = calculatePercentage(deviceCounts.offline_devices);
  const deployedPercentage = calculatePercentage(deviceCounts.deployed_devices);

  // Process maintenance data for visualization - use useMemo to optimize performance
  const { 
    maintenanceEvents, 
    recentAlerts, 
    maintenanceByType 
  } = useMemo(() => {
    const events = devices
      .flatMap(device => 
        (device.maintenance_history || []).map(event => ({
          id: `${device.device.id}-${event.timestamp}`,
          deviceName: device.device.name,
          deviceId: device.device.id,
          location: device.location.name || 
                  (device.location.city ? `${device.location.city}, ${device.location.country || ''}` : "Unknown location"),
          type: event.maintenance_type === "Offline" ? "critical" : "info",
          message: event.description,
          timestamp: event.timestamp,
          date: format(new Date(event.timestamp), 'MMM dd')
        }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get the 5 most recent alerts
    const alerts = events.slice(0, 5);

    // Count maintenance events by type
    const byType = events.reduce((acc, event) => {
      if (!acc[event.type]) {
        acc[event.type] = 0;
      }
      acc[event.type]++;
      return acc;
    }, {});

    return { 
      maintenanceEvents: events, 
      recentAlerts: alerts, 
      maintenanceByType: byType 
    };
  }, [devices]);

  // Process readings data for charts - use useMemo to optimize
  const { 
    allReadings, 
    readingsByHour, 
    hasAirQualityData, 
    aqiData 
  } = useMemo(() => {
    const readings = devices
      .filter(device => device.readings_history && device.readings_history.length > 0)
      .flatMap(device => 
        device.readings_history.map(reading => ({
          deviceName: device.device.name,
          timestamp: reading.timestamp,
          pm2_5: reading.pm2_5,
          pm10: reading.pm10,
          aqi_category: reading.aqi_category
        }))
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Process readings by device for the line chart
    const deviceReadingsMap = {};
    
    readings.forEach(reading => {
      const hour = format(new Date(reading.timestamp), 'MMM dd HH:00');
      
      if (!deviceReadingsMap[reading.deviceName]) {
        deviceReadingsMap[reading.deviceName] = {};
      }
      
      if (!deviceReadingsMap[reading.deviceName][hour]) {
        deviceReadingsMap[reading.deviceName][hour] = {
          pm2_5: [],
          pm10: []
        };
      }
      
      if (reading.pm2_5 !== null) deviceReadingsMap[reading.deviceName][hour].pm2_5.push(reading.pm2_5);
      if (reading.pm10 !== null) deviceReadingsMap[reading.deviceName][hour].pm10.push(reading.pm10);
    });

    // Calculate averages and format for the chart
    const byHour = [];
    
    for (const deviceName in deviceReadingsMap) {
      for (const hour in deviceReadingsMap[deviceName]) {
        const hourReadings = deviceReadingsMap[deviceName][hour];
        
        const avgPM25 = hourReadings.pm2_5.length > 0 
          ? hourReadings.pm2_5.reduce((sum, val) => sum + val, 0) / hourReadings.pm2_5.length 
          : null;
          
        const avgPM10 = hourReadings.pm10.length > 0 
          ? hourReadings.pm10.reduce((sum, val) => sum + val, 0) / hourReadings.pm10.length 
          : null;
        
        byHour.push({
          hour,
          deviceName,
          pm2_5: avgPM25,
          pm10: avgPM10
        });
      }
    }

    // Prepare AQI category data if available
    const aqiCategoryCounts = readings.reduce((acc, reading) => {
      if (reading.aqi_category) {
        if (!acc[reading.aqi_category]) {
          acc[reading.aqi_category] = 0;
        }
        acc[reading.aqi_category]++;
      }
      return acc;
    }, {});

    const aqi = Object.entries(aqiCategoryCounts).map(([name, value]) => {
      // Assign colors based on AQI category
      let color;
      switch(name) {
        case 'Good': color = '#4CAF50'; break;
        case 'Moderate': color = '#ECAA06'; break;
        case 'Unhealthy for Sensitive Groups': color = '#FF9800'; break;
        case 'Unhealthy': color = '#F44336'; break;
        case 'Very Unhealthy': color = '#9C27B0'; break;
        case 'Hazardous': color = '#8B0000'; break;
        default: color = '#607D8B';
      }
      return { name, value, color };
    });

    // Check if we have any air quality readings
    const hasData = readings.length > 0 && 
                        (readings.some(r => r.pm2_5 !== null) || 
                         readings.some(r => r.pm10 !== null));

    return { 
      allReadings: readings, 
      readingsByHour: byHour, 
      hasAirQualityData: hasData, 
      aqiData: aqi 
    };
  }, [devices]);

  // Get distribution data - use useMemo to optimize
  const {
    powerTypeData,
    mountTypeData,
    upcomingMaintenance
  } = useMemo(() => {
    // Get device count by power type
    const devicesByPowerType = devices.reduce((acc, device) => {
      const powerType = device.device.power_type || "Unknown";
      if (!acc[powerType]) {
        acc[powerType] = 0;
      }
      acc[powerType]++;
      return acc;
    }, {});

    const powerData = Object.entries(devicesByPowerType).map(([name, value]) => {
      // Assign colors based on power type
      let color;
      switch(name.toLowerCase()) {
        case 'mains': color = '#4CAF50'; break;
        case 'solar': color = '#FFC107'; break;
        case 'battery': color = '#2196F3'; break;
        case 'alternator': color = '#9C27B0'; break;
        default: color = '#607D8B';
      }
      return { name, value, color };
    });

    // Get device count by mount type
    const devicesByMountType = devices.reduce((acc, device) => {
      const mountType = device.device.mount_type || "Unknown";
      if (!acc[mountType]) {
        acc[mountType] = 0;
      }
      acc[mountType]++;
      return acc;
    }, {});

    const mountData = Object.entries(devicesByMountType).map(([name, value]) => {
      // Assign colors based on mount type
      let color;
      switch(name.toLowerCase()) {
        case 'wall': color = '#E91E63'; break;
        case 'rooftop': color = '#FF9800'; break;
        case 'pole': color = '#3F51B5'; break;
        case 'suspended': color = '#009688'; break;
        default: color = '#795548';
      }
      return { name, value, color };
    });

    // Get devices needing maintenance (next_maintenance date is before or equal to today)
    const today = new Date();
    const maintenance = devices
      .filter(device => device.device.next_maintenance && new Date(device.device.next_maintenance) > today)
      .map(device => ({
        id: device.device.id,
        name: device.device.name,
        date: format(new Date(device.device.next_maintenance), 'MMM dd, yyyy'),
        location: device.location.name || 
                (device.location.city ? `${device.location.city}, ${device.location.country || ''}` : "Unknown location"),
        daysRemaining: Math.ceil((new Date(device.device.next_maintenance) - today) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining) // Sort by days remaining
      .slice(0, 5); // Get top 5

    return {
      powerTypeData: powerData,
      mountTypeData: mountData,
      upcomingMaintenance: maintenance
    };
  }, [devices]);

  const isLoading = loadingCounts || loadingDevices;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AirQo Device Health Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center"
          onClick={() => {
            fetchDeviceCounts();
            fetchDeviceDetails();
          }}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center">
              <Layers className="mr-2 h-5 w-5 text-primary" />
              Total Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {isLoading ? '...' : deviceCounts.total_devices}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Devices in the network</p>
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
              {isLoading ? '...' : deviceCounts.active_devices}
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
              {isLoading ? '...' : deviceCounts.offline_devices}
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
              {isLoading ? '...' : deviceCounts.deployed_devices}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${deployedPercentage}%` }}></div>
              <span className="text-xs text-muted-foreground ml-2">{deployedPercentage}%</span>
            </div>
          </CardContent>
        </Card>

              <Card className="overflow-hidden border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 bg-gradient-to-r from-amber-500/10 to-transparent">
          <CardTitle className="text-sm font-medium flex items-center">
            <Package className="mr-2 h-5 w-5 text-amber-500" />
            Not Deployed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-bold">
            {isLoading ? '...' : deviceCounts.not_deployed}
          </div>
          <div className="flex items-center mt-1">
            <div className="h-2 bg-amber-500 rounded-full" style={{ width: `${deviceCounts.total_devices > 0 ? Math.round((deviceCounts.not_deployed / deviceCounts.total_devices) * 100) : 0}%` }}></div>
            <span className="text-xs text-muted-foreground ml-2">{deviceCounts.total_devices > 0 ? Math.round((deviceCounts.not_deployed / deviceCounts.total_devices) * 100) : 0}%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 bg-gradient-to-r from-purple-500/10 to-transparent">
          <CardTitle className="text-sm font-medium flex items-center">
            <AlertOctagon className="mr-2 h-5 w-5 text-purple-500" />
            Recalled Devices
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-bold">
            {isLoading ? '...' : deviceCounts.recalled_devices}
          </div>
          <div className="flex items-center mt-1">
            <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${deviceCounts.total_devices > 0 ? Math.round((deviceCounts.recalled_devices / deviceCounts.total_devices) * 100) : 0}%` }}></div>
            <span className="text-xs text-muted-foreground ml-2">{deviceCounts.total_devices > 0 ? Math.round((deviceCounts.recalled_devices / deviceCounts.total_devices) * 100) : 0}%</span>
          </div>
        </CardContent>
      </Card>


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Device Reliability Analysis - REPLACEMENT FOR THE LOCATION CARD */}
        <DeviceReliabilityAnalysis devices={devices} isLoading={isLoading} />

        <Card className="lg:row-span-1 hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-primary" />
                Recent Alerts
              </CardTitle>
              <CardDescription>Latest device status notifications</CardDescription>
            </div>
            <Link href="/dashboard/alerts" className="text-sm text-primary flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {isLoading ? (
              <div className="h-52 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  variant={alert.type === "critical" ? "destructive" : "default"}
                  className={`border-l-4 ${
                    alert.type === "critical" 
                      ? "border-l-red-500 bg-red-50 text-red-800" 
                      : "border-l-blue-500 bg-blue-50 text-blue-800"
                  } hover:shadow-sm transition-shadow`}
                >
                  {alert.type === "critical" ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-blue-500" />
                  )}
                  <AlertTitle className="font-medium">
                    {alert.deviceName} - {alert.location || "Unknown location"}
                  </AlertTitle>
                  <AlertDescription className="flex justify-between items-center">
                    <span>{alert.message}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {alert.date}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No recent alerts found</p>
              </div>
            )}
          </CardContent>
        </Card>
  
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <Card className="hover:shadow-md transition-shadow overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
      <CardTitle className="flex items-center">
        <Zap className="mr-2 h-5 w-5 text-primary" />
        Power Source Distribution
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="h-[200px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : powerTypeData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={powerTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={75}
                fill="#8884d8"
                dataKey="value"
              >
                {powerTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} devices`, name]} />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No power source data available
          </div>
        )}
      </div>
      
      {/* Custom legend below the chart */}
      {!isLoading && powerTypeData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          {powerTypeData.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 mr-1 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: {((entry.value / powerTypeData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </CardContent>
    <CardFooter className="bg-gray-50 border-t px-4 py-3">
      <div className="flex items-center text-sm text-muted-foreground">
        <Battery className="mr-2 h-4 w-4 text-primary" />
        Distribution of device power sources
      </div>
    </CardFooter>
  </Card>

  <Card className="hover:shadow-md transition-shadow overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
      <CardTitle className="flex items-center">
        <Settings className="mr-2 h-5 w-5 text-primary" />
        Mounting Type Distribution
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="h-[200px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : mountTypeData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={mountTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={75}
                fill="#8884d8"
                dataKey="value"
              >
                {mountTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} devices`, name]} />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No mount type data available
          </div>
        )}
      </div>
      
      {/* Custom legend below the chart */}
      {!isLoading && mountTypeData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          {mountTypeData.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 mr-1 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: {((entry.value / mountTypeData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </CardContent>
    <CardFooter className="bg-gray-50 border-t px-4 py-3">
      <div className="flex items-center text-sm text-muted-foreground">
        <Package className="mr-2 h-4 w-4 text-primary" />
        How devices are installed in the field
      </div>
    </CardFooter>
  </Card>

  <Card className="hover:shadow-md transition-shadow overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
      <CardTitle className="flex items-center">
        <Activity className="mr-2 h-5 w-5 text-primary" />
        Air Quality Index Categories
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="h-[200px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : aqiData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={aqiData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={75}
                fill="#8884d8"
                dataKey="value"
              >
                {aqiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} readings`, name]} />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No AQI data available
          </div>
        )}
      </div>
      
      {/* Custom legend below the chart in grid format */}
      {!isLoading && aqiData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          {aqiData.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 mr-1 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">
                {entry.name}: {((entry.value / aqiData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </CardContent>
    <CardFooter className="bg-gray-50 border-t px-4 py-3">
      <div className="flex items-center text-sm text-muted-foreground">
        <Wind className="mr-2 h-4 w-4 text-primary" />
        Distribution of air quality readings
      </div>
    </CardFooter>
  </Card>
</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hasAirQualityData && (
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-primary" />
            Geographical Deployment Summary
          </CardTitle>
          <CardDescription>
            Device distribution by location and coverage metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : devices.length > 0 ? (
            <div className="space-y-6">
              {/* Coverage Statistics with consistent styling */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1 font-medium">Countries Covered</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {new Set(devices.map(d => d.location.country).filter(Boolean)).size || "0"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Unique countries with deployed devices
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1 font-medium">Cities Covered</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {new Set(devices.map(d => d.location.city).filter(Boolean)).size || "0"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Urban areas with monitoring devices
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1 font-medium">Device Density</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {(devices.length / (new Set([
                      ...devices.map(d => d.location.city).filter(Boolean),
                      ...devices.map(d => d.location.country).filter(Boolean)
                    ]).size || 1)).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Average devices per unique location
                  </div>
                </div>
              </div>
      
              {/* Deployment Age with consistent styling */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium mb-3 text-gray-700">Deployment Age</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Average deployment age</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1 flex items-baseline">
                      {Math.round(devices.reduce((sum, device) => {
                        const deploymentDate = device.location.deployment_date ? new Date(device.location.deployment_date) : null;
                        return deploymentDate ? sum + Math.floor((new Date() - deploymentDate) / (1000 * 60 * 60 * 24)) : sum;
                      }, 0) / devices.filter(d => d.location.deployment_date).length || 0)}
                      <span className="text-lg ml-1 text-gray-600">days</span>
                    </div>
                  </div>
                  <div className="h-12 border-l border-gray-200 mx-4"></div>
                  <div>
                    <div className="text-sm text-gray-500">Newest deployment</div>
                    <div className="text-xl font-medium text-gray-900 mt-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {devices.filter(d => d.location.deployment_date).length > 0 ? 
                        format(new Date(Math.max(...devices
                          .filter(d => d.location.deployment_date)
                          .map(d => new Date(d.location.deployment_date).getTime())
                        )), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Geographic Distribution with consistent styling */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium mb-3 text-gray-700">Geographic Spread</h3>
                <div className="space-y-4">
                  {Object.entries(devices.reduce((acc, device) => {
                    const region = device.location.country || 'Unknown';
                    if (!acc[region]) acc[region] = 0;
                    acc[region]++;
                    return acc;
                  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([region, count], index) => {
                    return (
                      <div key={region} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-gray-700">{region}</div>
                          <div className="text-sm font-medium text-gray-600">{count} device{count !== 1 ? 's' : ''}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                          <div 
                            className="bg-primary h-3 rounded-full transition-all duration-500 ease-in-out" 
                            style={{ width: `${Math.min(Math.max((count / devices.length) * 100, 5), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No geographical deployment data available</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t px-4 py-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            {devices.length > 0 
              ? `Total coverage: ${devices.length} devices across ${
                  new Set([
                    ...devices.map(d => d.location.city).filter(Boolean),
                    ...devices.map(d => d.location.country).filter(Boolean)
                  ]).size || 'unknown number of'
                } locations`
              : 'No deployment coverage information available'}
          </div>
        </CardFooter>
      </Card>
        )}

        <Card className="hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Upcoming Maintenance
            </CardTitle>
            <CardDescription>Scheduled device maintenance</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : upcomingMaintenance.length > 0 ? (
              <div className="space-y-4">
                {upcomingMaintenance.map((device) => (
                  <div 
                    key={device.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                        device.daysRemaining <= 7 
                          ? 'bg-red-100' 
                          : device.daysRemaining <= 14 
                            ? 'bg-yellow-100' 
                            : 'bg-green-100'
                      }`}>
                        <Wrench className={`h-5 w-5 ${
                          device.daysRemaining <= 7 
                            ? 'text-red-500' 
                            : device.daysRemaining <= 14 
                              ? 'text-yellow-500' 
                              : 'text-green-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-gray-500">{device.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{device.date}</p>
                      <p className="text-sm text-gray-500">
                        In {device.daysRemaining} day{device.daysRemaining !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming maintenance scheduled</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 border-t px-4 py-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Wrench className="mr-2 h-4 w-4 text-primary" />
              {upcomingMaintenance.length > 0 
                ? `${upcomingMaintenance.length} device${upcomingMaintenance.length !== 1 ? 's' : ''} need maintenance soon`
                : 'No maintenance currently scheduled'}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}