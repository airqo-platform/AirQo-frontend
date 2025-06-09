"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AlertCircle, 
  AlertTriangle, 
  Bell, 
  Calendar, 
  Check,
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin,  
  RefreshCw, 
  Search, 
  WifiOff, 
  Wifi,
  Battery,
  Thermometer,
  X
} from "lucide-react"
import { config } from "@/lib/config"

// Helper functions for date formatting
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
}

const isWithinDays = (dateString, days) => {
  const date = new Date(dateString)
  const now = new Date()
  const daysAgo = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
  return date > daysAgo
}

const isToday = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getDateRangeAlerts = (alerts, daysFilter) => {
  const now = new Date()
  
  switch(daysFilter) {
    case "today":
      return alerts.filter(alert => isToday(alert.timestamp))
    case "3":
      return alerts.filter(alert => isWithinDays(alert.timestamp, 3))
    case "7":
      return alerts.filter(alert => isWithinDays(alert.timestamp, 7))
    case "30":
      return alerts.filter(alert => isWithinDays(alert.timestamp, 30))
    case "all":
      return alerts
    default:
      return alerts.filter(alert => isToday(alert.timestamp))
  }
}

export default function AlertsPage() {
  // State management
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filtering and pagination state
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [daysFilter, setDaysFilter] = useState("today")
  const [sortOrder, setSortOrder] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const alertsPerPage = 10

  // Fetch alerts from API (using maintenance history from devices)
  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      
      // Using the devices-detail endpoint to get maintenance history
      const response = await fetch(`${config.apiUrl}/devices-detail`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      const devices = data.devices || []
      
      // Process all maintenance events as alerts
      const allAlerts = devices
        .flatMap(device => 
          (device.maintenance_history || []).map(event => ({
            id: `${device.device.id}-${event.timestamp}`,
            deviceId: device.device.id,
            deviceName: device.device.name,
            type: getAlertType(event.maintenance_type),
            message: event.description,
            location: device.location.name || 
                    (device.location.city ? `${device.location.city}, ${device.location.country || ''}` : "Unknown location"),
            timestamp: event.timestamp,
            formattedDate: formatDate(event.timestamp),
            formattedTime: formatTime(event.timestamp),
            icon: getAlertIcon(event.maintenance_type),
            status: event.maintenance_type,
            severity: getSeverity(event.maintenance_type)
          }))
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      
      setAlerts(allAlerts)
      setTotalPages(Math.ceil(allAlerts.length / alertsPerPage))
      setError(null)
    } catch (err) {
      console.error("Error fetching alerts:", err)
      setError("Failed to load alerts data")
      setAlerts([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to determine alert type
  function getAlertType(maintenanceType) {
    switch(maintenanceType) {
      case "Offline":
        return "critical"
      case "Restored":
        return "success"
      default:
        return "warning"
    }
  }
  
  // Helper function to determine severity
  function getSeverity(maintenanceType) {
    switch(maintenanceType) {
      case "Offline":
        return "high"
      case "Low Battery":
        return "medium"
      case "Temperature Warning":
        return "medium"
      case "Restored":
        return "low"
      default:
        return "medium"
    }
  }
  
  // Helper function to determine alert icon
  function getAlertIcon(maintenanceType) {
    switch(maintenanceType) {
      case "Offline":
        return <WifiOff className="h-4 w-4" />
      case "Restored":
        return <Wifi className="h-4 w-4" />
      case "Low Battery":
        return <Battery className="h-4 w-4" />
      case "Temperature Warning":
        return <Thermometer className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Get priority styling
  const getPriorityStyle = (type, severity = 'medium') => {
    const styles = {
      critical: {
        badge: "bg-red-100 text-red-800 border-red-200",
        card: "border-l-4 border-l-red-500 bg-red-50/30 hover:bg-red-50/50",
        icon: "text-red-600"
      },
      warning: {
        badge: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        card: "border-l-4 border-l-yellow-500 bg-yellow-50/30 hover:bg-yellow-50/50",
        icon: "text-yellow-600"
      },
      success: {
        badge: "bg-green-100 text-green-800 border-green-200",
        card: "border-l-4 border-l-green-500 bg-green-50/30 hover:bg-green-50/50", 
        icon: "text-green-600"
      }
    }
    return styles[type] || styles.warning
  }

  // Load alerts when component mounts
  useEffect(() => {
    fetchAlerts()
  }, [])

  // Filter and sort alerts based on user selections
  const filteredAlerts = alerts.filter(alert => {
    // Search term filter
    const matchesSearch = 
      alert.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Type filter
    const matchesType = 
      typeFilter === "all" || alert.type === typeFilter
    
    return matchesSearch && matchesType
  })

  // Apply date range filter
  const dateFilteredAlerts = getDateRangeAlerts(filteredAlerts, daysFilter)

  // Sort the filtered alerts
  const sortedAlerts = [...dateFilteredAlerts].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.timestamp) - new Date(a.timestamp)
    } else {
      return new Date(a.timestamp) - new Date(b.timestamp)
    }
  })

  // Get current page of alerts
  const currentAlerts = sortedAlerts.slice(
    (currentPage - 1) * alertsPerPage,
    currentPage * alertsPerPage
  )

  // Calculate alert counts by type from date-filtered alerts
  const criticalCount = dateFilteredAlerts.filter(alert => alert.type === "critical").length
  const warningCount = dateFilteredAlerts.filter(alert => alert.type === "warning").length
  const successCount = dateFilteredAlerts.filter(alert => alert.type === "success").length

  // Update total pages when filters change
  useEffect(() => {
    setTotalPages(Math.ceil(dateFilteredAlerts.length / alertsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [dateFilteredAlerts.length, alertsPerPage])

  // Dismiss alert function
  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId))
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-600 mt-1">Monitor and manage system notifications</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={fetchAlerts}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-800 mt-1">
                  {isLoading ? '...' : criticalCount}
                </p>
              </div>
              <div className="p-3 bg-red-200/50 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm font-medium">Warning Alerts</p>
                <p className="text-3xl font-bold text-yellow-800 mt-1">
                  {isLoading ? '...' : warningCount}
                </p>
              </div>
              <div className="p-3 bg-yellow-200/50 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-800 mt-1">
                  {isLoading ? '...' : successCount}
                </p>
              </div>
              <div className="p-3 bg-green-200/50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Alert Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={daysFilter} onValueChange={setDaysFilter}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="3">Last 3 days</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md">
                {dateFilteredAlerts.length} alerts
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search alerts..."
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-36">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mr-3" />
                <p className="text-gray-600">Loading alerts...</p>
              </div>
            </CardContent>
          </Card>
        ) : currentAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
                <p className="text-gray-500">
                  {searchTerm || typeFilter !== 'all' || daysFilter !== 'all' 
                    ? "Try adjusting your search or filters" 
                    : daysFilter === 'today' 
                      ? "No alerts for today - all systems running normally"
                      : "All systems are running normally"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {currentAlerts.map((alert) => {
              const style = getPriorityStyle(alert.type, alert.severity)
              return (
                <Card key={alert.id} className={`${style.card} transition-all duration-200`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-2 rounded-full bg-white shadow-sm ${style.icon}`}>
                          {alert.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {alert.deviceName}
                            </h3>
                            <Badge className={style.badge}>
                              {alert.status}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 mb-3 leading-relaxed">
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1.5" />
                              <span>{alert.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1.5" />
                              <span>{alert.formattedDate} at {alert.formattedTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-4 text-gray-400 hover:text-gray-600"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * alertsPerPage + 1}-
                      {Math.min(currentPage * alertsPerPage, sortedAlerts.length)} of {sortedAlerts.length} alerts
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}