"use client"

import { useState, useEffect } from "react"
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
  CheckCircle,
  XCircle,
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
import { format, parseISO } from "date-fns"
import { 
  getDashboardSummary, 
  getSystemHealth, 
  getDataTransmissionSummary, 
  getNetworkPerformance,
  getDeviceStats,
  getDevices,
  getOfflineDevices,
  getUpcomingMaintenance
} from "@/services/device-api.service"

export default function DashboardPage() {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [transmissionData, setTransmissionData] = useState<any>(null)
  const [networkData, setNetworkData] = useState<any>(null)
  const [deviceStats, setDeviceStats] = useState<any>(null)
  const [devices, setDevices] = useState<any[]>([])
  const [offlineDevices, setOfflineDevices] = useState<any[]>([])
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard summary data (critical data first)
  const fetchDashboardSummary = async () => {
    try {
      const dashboard = await getDashboardSummary()
      setDashboardData(dashboard)
      setLoading(false) // Stop loading once we have basic data
    } catch (err) {
      console.error("Error fetching dashboard summary:", err)
      setError("Failed to load dashboard data")
      setLoading(false)
    }
  }

  // Fetch system health data
  const fetchSystemHealthData = async () => {
    try {
      const health = await getSystemHealth()
      setSystemHealth(health)
    } catch (err) {
      console.error("Error fetching system health:", err)
    }
  }

  // Fetch transmission data
  const fetchTransmissionData = async () => {
    try {
      const transmission = await getDataTransmissionSummary({ days: 7 })
      setTransmissionData(transmission)
    } catch (err) {
      console.error("Error fetching transmission data:", err)
    }
  }

  // Fetch network performance
  const fetchNetworkData = async () => {
    try {
      const network = await getNetworkPerformance({ days: 7 })
      setNetworkData(network)
    } catch (err) {
      console.error("Error fetching network data:", err)
    }
  }

  // Fetch device statistics
  const fetchDeviceStatistics = async () => {
    try {
      const stats = await getDeviceStats({ include_networks: true, include_categories: true, include_maintenance: true })
      setDeviceStats(stats)
    } catch (err) {
      console.error("Error fetching device stats:", err)
    }
  }

  // Fetch device lists
  const fetchDeviceLists = async () => {
    try {
      const [deviceList, offline, maintenance] = await Promise.all([
        getDevices({ limit: 10 }),
        getOfflineDevices({ hours: 24, limit: 10 }),
        getUpcomingMaintenance({ days: 30, limit: 10 })
      ])
      
      setDevices(deviceList || [])
      setOfflineDevices(offline?.devices || [])
      setUpcomingMaintenance(maintenance?.devices || [])
    } catch (err) {
      console.error("Error fetching device lists:", err)
    }
  }

  // Refresh all data
  const refreshData = async () => {
    setLoading(true)
    setError(null)
    
    // Fetch critical data first
    await fetchDashboardSummary()
    
    // Then fetch other data in parallel groups
    Promise.all([
      fetchSystemHealthData(),
      fetchTransmissionData(),
      fetchNetworkData(),
      fetchDeviceStatistics(),
      fetchDeviceLists()
    ])
  }

  // Call fetch functions on component mount
  useEffect(() => {
    // Fetch critical dashboard data first
    fetchDashboardSummary()
    
    // Then fetch other data independently (non-blocking)
    fetchSystemHealthData()
    fetchTransmissionData()
    fetchNetworkData()
    fetchDeviceStatistics()
    fetchDeviceLists()
  }, [])

  // Get device counts from dashboard data
  const deviceCounts = dashboardData?.devices || {
    total: 0,
    active: 0,
    online: 0,
    offline: 0,
    inactive: 0,
    maintenance_soon: 0
  }
  
  const siteCounts = dashboardData?.sites || {
    total: 0,
    active: 0,
    inactive: 0
  }
  
  // Calculate percentages
  const activePercentage = deviceCounts.total > 0 
    ? Math.round((deviceCounts.active / deviceCounts.total) * 100) 
    : 0
  const onlinePercentage = deviceCounts.total > 0
    ? Math.round((deviceCounts.online / deviceCounts.total) * 100)
    : 0
  const offlinePercentage = deviceCounts.total > 0
    ? Math.round((deviceCounts.offline / deviceCounts.total) * 100)
    : 0

  // Get health indicators
  const healthIndicators = dashboardData?.health_indicators || {}
  
  // Get network distribution data for charts
  const networkDistribution = dashboardData?.network_distribution || {}
  const networkChartData = Object.entries(networkDistribution).map(([network, count]) => ({
    network: network === 'null' ? 'Unknown' : network,
    count: count as number,
    percentage: deviceCounts.total > 0 ? Math.round((count as number / deviceCounts.total) * 100) : 0
  }))

  // Get categories data from device stats
  const categoriesData = deviceStats?.categories ? 
    Object.entries(deviceStats.categories).map(([category, count]) => ({
      name: category === 'unknown' ? 'Unknown' : category,
      value: count as number,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    })) : []

  const isLoading = loading

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold"></h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center"
          onClick={() => refreshData()}
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

      {/* Device Stats Cards */}
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
              {isLoading ? '...' : deviceCounts.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Devices in the network</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-500/10 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wifi className="mr-2 h-5 w-5 text-green-500" />
              Online Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {isLoading ? '...' : deviceCounts.online}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: `${onlinePercentage}%` }}></div>
              <span className="text-xs text-muted-foreground ml-2">{onlinePercentage}%</span>
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
              {isLoading ? '...' : deviceCounts.offline}
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
              <Activity className="mr-2 h-5 w-5 text-blue-500" />
              Active Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {isLoading ? '...' : deviceCounts.active}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${activePercentage}%` }}></div>
              <span className="text-xs text-muted-foreground ml-2">{activePercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-500/10 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-purple-500" />
              Total Sites
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {isLoading ? '...' : siteCounts.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {siteCounts.active} active, {siteCounts.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 bg-gradient-to-r from-amber-500/10 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wrench className="mr-2 h-5 w-5 text-amber-500" />
              Maintenance Due
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {isLoading ? '...' : deviceCounts.maintenance_soon}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Within next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health and Data Transmission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Health Card */}
        <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white pb-8">
            <CardTitle className="flex items-center text-xl">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <Activity className="h-6 w-6" />
              </div>
              System Health Monitor
            </CardTitle>
            <CardDescription className="text-white/90 mt-1">Real-time system performance analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-6 -mt-4">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : systemHealth ? (
              <div className="space-y-5">
                {/* Health Score Visual */}
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Overall Health Score</h3>
                    <Badge 
                      className={`px-3 py-1 text-sm font-bold ${
                        systemHealth.status === "healthy" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : systemHealth.status === "degraded" 
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {systemHealth.status?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - (systemHealth.health_score || 0) / 100)}`}
                            className={`transition-all duration-1000 ${
                              systemHealth.health_score >= 80 
                                ? "text-green-500" 
                                : systemHealth.health_score >= 60 
                                ? "text-yellow-500" 
                                : "text-red-500"
                            }`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{systemHealth.health_score}%</div>
                            <div className="text-xs text-gray-500">Health</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues Alert */}
                {systemHealth.issues && systemHealth.issues.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800 mb-2">Active Issues</p>
                        <ul className="space-y-1">
                          {systemHealth.issues.map((issue: string, index: number) => (
                            <li key={index} className="text-xs text-red-700 flex items-center">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <Wifi className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Online Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{healthIndicators.device_online_rate || 0}%</div>
                    <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${healthIndicators.device_online_rate || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Active Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{healthIndicators.device_active_rate || 0}%</div>
                    <div className="mt-2 h-1.5 bg-green-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500" 
                        style={{ width: `${healthIndicators.device_active_rate || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-600 font-medium">Site Active</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{healthIndicators.site_active_rate || 0}%</div>
                    <div className="mt-2 h-1.5 bg-purple-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-500" 
                        style={{ width: `${healthIndicators.site_active_rate || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <Wrench className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-600 font-medium">Maintenance</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-900">{healthIndicators.maintenance_rate || 0}%</div>
                    <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-500" 
                        style={{ width: `${healthIndicators.maintenance_rate || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No health data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Transmission Card */}
        <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white pb-8">
            <CardTitle className="flex items-center text-xl">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <BarChart3 className="h-6 w-6" />
              </div>
              Data Transmission Analytics
            </CardTitle>
            <CardDescription className="text-white/90 mt-1">Real-time data flow and quality metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-6 -mt-4">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : transmissionData ? (
              <div className="space-y-5">
                {/* Main Metrics */}
                <div className="bg-white rounded-xl shadow-sm border p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-2">
                        <Activity className="h-7 w-7 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {(transmissionData.transmission?.total_readings || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Total Readings (7 days)</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-2">
                        <TrendingUp className="h-7 w-7 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {transmissionData.transmission?.data_quality || 0}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Data Quality Score</div>
                    </div>
                  </div>
                </div>

                {/* Transmission Rate Visual */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">Transmission Rate</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Network performance indicator</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {transmissionData.transmission?.transmission_rate || 0}%
                    </div>
                  </div>
                  <div className="relative h-3 bg-white rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 rounded-full ${
                        (transmissionData.transmission?.transmission_rate || 0) >= 90 
                          ? "bg-gradient-to-r from-green-400 to-green-500" 
                          : (transmissionData.transmission?.transmission_rate || 0) >= 70 
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500" 
                          : "bg-gradient-to-r from-red-400 to-red-500"
                      }`}
                      style={{ width: `${transmissionData.transmission?.transmission_rate || 0}%` }}
                    />
                  </div>
                </div>

                {/* Detailed Statistics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-xs text-gray-600">Valid Readings</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-xl font-bold text-green-900 mt-1">
                      {(transmissionData.transmission?.valid_readings || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">Invalid Readings</span>
                      </div>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="text-xl font-bold text-red-900 mt-1">
                      {(transmissionData.transmission?.invalid_readings || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Daily Average */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Daily Average</p>
                        <p className="text-xs text-gray-500">Readings per day</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {Math.round(transmissionData.transmission?.average_daily_readings || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Active Devices Info */}
                {transmissionData.devices && (
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      {transmissionData.devices.active || 0} Active Devices
                    </span>
                    <span>{transmissionData.devices.total || 0} Total Devices</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No transmission data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Network Distribution and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Network Distribution Chart */}
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b">
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
              Network Distribution
            </CardTitle>
            <CardDescription>Device distribution across networks</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : networkChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={networkChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="network" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [value, 'Devices']}
                      labelFormatter={(label: any) => `Network: ${label}`}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No network distribution data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Categories Chart */}
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent border-b">
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-purple-500" />
              Device Categories
            </CardTitle>
            <CardDescription>Distribution by device category</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : categoriesData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoriesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, 'Devices']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No category data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Offline Devices and Upcoming Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Offline Devices */}
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-50 to-transparent border-b">
            <CardTitle className="flex items-center">
              <WifiOff className="mr-2 h-5 w-5 text-red-500" />
              Offline Devices
            </CardTitle>
            <CardDescription>Devices offline for more than 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : offlineDevices.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {offlineDevices.map((device) => (
                  <div 
                    key={device.device_key || device.device_id} 
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <WifiOff className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{device.device_name}</p>
                        <p className="text-sm text-gray-600">Network: {device.network || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {device.status || 'Offline'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Last seen: {device.last_updated === "Never" ? "Never" : format(parseISO(device.last_updated), "MMM dd, HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
                {offlineDevices.length >= 10 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/devices?filter=offline">
                      <Button variant="outline" size="sm">
                        View all offline devices
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Wifi className="h-12 w-12 mx-auto mb-3 text-green-300" />
                  <p>All devices are online!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card className="hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent border-b">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-amber-500" />
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
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {upcomingMaintenance.map((device) => (
                  <div 
                    key={device.device_key || device.device_id} 
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                        device.days_until_due <= 7 
                          ? 'bg-red-100' 
                          : device.days_until_due <= 14 
                            ? 'bg-yellow-100' 
                            : 'bg-green-100'
                      }`}>
                        <Wrench className={`h-5 w-5 ${
                          device.days_until_due <= 7 
                            ? 'text-red-500' 
                            : device.days_until_due <= 14 
                              ? 'text-yellow-500' 
                              : 'text-green-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{device.device_name}</p>
                        <p className="text-sm text-gray-500">{device.site_name || 'Unknown location'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{format(parseISO(device.next_maintenance), 'MMM dd, yyyy')}</p>
                      <p className="text-sm text-gray-500">
                        In {device.days_until_due} day{device.days_until_due !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingMaintenance.length >= 10 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/devices?filter=maintenance">
                      <Button variant="outline" size="sm">
                        View all maintenance schedules
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
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
        </Card>
      </div>
    </div>
  )
}