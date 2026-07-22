"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Search,
  MapPin,
  Wifi,
  WifiOff,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Map as MapIcon,
  Activity,
  Package,
  List
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/components/ui/use-toast"
import { 
  getDeviceSummary, 
  getDevicesForUIPaginated, 
  syncDevices, 
  syncDevicePerformance,
  getMyDevicesForUI,
  getPersonalUserCohorts 
} from "@/services/device-api.service"
import { useSession } from "next-auth/react"
import type { ApiResponseMeta, DeviceSummaryResponse, UIDevice } from "@/types/api.types"
import UpdateDeviceDialog from "@/components/dashboard/update-device-dialog"
import { formatCategoryLabel } from "@/lib/utils"
import { useGroup } from "@/lib/group-context"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function DevicesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { activeGroup, loading: groupLoading, isActiveGroupAdmin } = useGroup()

  const isAirqoGroup = activeGroup?.toLowerCase() === 'airqo'
  const hideOrgDevices = isAirqoGroup && !isActiveGroupAdmin

  // State for device data (Org Devices)
  const [devices, setDevices] = useState<UIDevice[]>([])
  const [devicesMeta, setDevicesMeta] = useState<ApiResponseMeta | null>(null)
  const [totalDevices, setTotalDevices] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [deviceCounts, setDeviceCounts] = useState<DeviceSummaryResponse>({
    total_devices: 0,
    active_airqlouds: 0,
    tracked_devices: 0,
    deployed_devices: 0,
    tracked_online: 0,
    tracked_offline: 0
  })

  // State for personal devices (My Devices)
  const [deviceScope, setDeviceScope] = useState<"org" | "my">("org")

  // Sync default scope when hideOrgDevices changes
  useEffect(() => {
    if (hideOrgDevices) {
      setDeviceScope("my")
    }
  }, [hideOrgDevices])
  const [myDevices, setMyDevices] = useState<UIDevice[]>([])
  const [myDevicesLoading, setMyDevicesLoading] = useState(false)
  const [myDevicesError, setMyDevicesError] = useState<string | null>(null)
  const [myDevicesCounts, setMyDevicesCounts] = useState({
    total: 0,
    deployed: 0
  })

  // UI states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [firmwareDialogOpen, setFirmwareDialogOpen] = useState(false)
  const [selectedFirmwareDevice, setSelectedFirmwareDevice] = useState<UIDevice | null>(null)
  const [showTracked, setShowTracked] = useState(true) // Default to tracked

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Derived loading and error states based on active scope
  const isDataLoading = deviceScope === "org" ? loading : myDevicesLoading
  const activeError = deviceScope === "org" ? error : myDevicesError

  // Debounce search term specifically
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch device counts
  const fetchDeviceCounts = async () => {
    try {
      const data = await getDeviceSummary()
      setDeviceCounts(data)
    } catch (err) {
      console.error("Error fetching device counts:", err)
    }
  }

  // Fetch devices list with pagination (Org Devices)
  const fetchDevices = async (isBackground = false) => {
    if (!activeGroup) {
      setDevices([])
      setDevicesMeta(null)
      setTotalDevices(0)
      setTotalPages(0)
      setHasNext(false)
      setHasPrevious(false)
      setLoading(false)
      setIsRefreshing(false)
      return
    }

    try {
      if (!isBackground && devices.length === 0) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)

      const skip = (currentPage - 1) * itemsPerPage
      const params: any = {
        skip,
        limit: itemsPerPage,
        group: activeGroup,
      }

      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim()
      }

      const data = await getDevicesForUIPaginated(params)

      setDevices(data.devices)
      setDevicesMeta(data.meta ?? null)
      setTotalDevices(data.pagination.total)
      setTotalPages(data.pagination.pages)
      setHasNext(data.pagination.has_next)
      setHasPrevious(data.pagination.has_previous)
    } catch (err) {
      console.error("Error fetching devices:", err)
      setError("Failed to load device data")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch personal devices (My Devices)
  const fetchMyDevices = async (isBackground = false) => {
    try {
      if (!isBackground && myDevices.length === 0) {
        setMyDevicesLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setMyDevicesError(null)

      const token = session?.accessToken
      if (!token) {
        throw new Error("No authentication token available")
      }

      const rawToken = token.replace(/^(JWT|Bearer)\s+/i, '')
      const userResp = await fetch("/api/auth/user", {
        headers: {
          'Authorization': `JWT ${rawToken}`,
          'Content-Type': 'application/json'
        }
      })
      if (!userResp.ok) throw new Error("Failed to fetch user details")
      const data = await userResp.json()
      const userData = data.users?.[0]

      if (!userData?._id) {
        throw new Error("Could not retrieve user ID")
      }

      const uId = userData._id

      const grps = userData.groups || []
      const grpIds = grps
        .filter((g: any) => g.grp_title?.toLowerCase() !== "airqo")
        .map((g: any) => g._id)

      const cohortIds = await getPersonalUserCohorts(uId)

      const result = await getMyDevicesForUI({
        userId: uId,
        groupIds: grpIds,
        cohortIds: cohortIds
      })

      setMyDevices(result.devices)
      setMyDevicesCounts({
        total: result.total_devices,
        deployed: result.deployed_devices
      })
    } catch (err: any) {
      console.error("Error fetching my devices:", err)
      setMyDevicesError(err.message || "Failed to fetch personal devices")
    } finally {
      setMyDevicesLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial data load
  useEffect(() => {
    if (groupLoading || !activeGroup) return
    fetchDeviceCounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup, groupLoading])

  // Refetch devices when pagination, search, or scope changes
  useEffect(() => {
    if (groupLoading || !activeGroup) return

    if (deviceScope === "org") {
      fetchDevices()
    } else {
      if (session?.accessToken) {
        fetchMyDevices()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, debouncedSearchTerm, showTracked, activeGroup, groupLoading, deviceScope, session?.accessToken])

  // Refresh all data
  const refreshData = () => {
    setIsRefreshing(true)
    if (deviceScope === "org") {
      Promise.all([fetchDeviceCounts(), fetchDevices()]).finally(() => setIsRefreshing(false))
    } else {
      Promise.all([fetchDeviceCounts(), fetchMyDevices()]).finally(() => setIsRefreshing(false))
    }
  }

  // Sync devices and performance
  const handleSyncDevices = async () => {
    setIsSyncing(true)
    try {
      await Promise.all([
        syncDevices(),
        syncDevicePerformance()
      ])
      toast({
        title: "Success",
        description: "Devices synced successfully.",
      })
      refreshData()
    } catch (err) {
      console.error("Error syncing devices:", err)
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "An error occurred while syncing devices.",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Calculate percentages for progress bars
  const calculatePercentage = useCallback((value: number, total: number) => {
    return total > 0
      ? Math.round((value / total) * 100)
      : 0
  }, [])

  const totalDevicesCount = deviceScope === "org"
    ? (devicesMeta?.totalDevices ?? devicesMeta?.total ?? deviceCounts.total_devices)
    : myDevices.length

  const trackedDevicesCount = deviceScope === "org"
    ? (devicesMeta?.devicesInAtLeastOneCohort ?? deviceCounts.tracked_devices)
    : myDevices.length

  const deployedDevicesCount = deviceScope === "org"
    ? (devicesMeta?.deployedDevices ?? deviceCounts.deployed_devices)
    : myDevices.filter(d => d.status === "deployed").length

  const onlineDevicesCount = deviceScope === "org"
    ? (devicesMeta?.onlineDevices ?? deviceCounts.tracked_online)
    : myDevices.filter(d => isDeviceOnline(d)).length

  const offlineDevicesCount = deviceScope === "org"
    ? (devicesMeta?.offlineDevices ?? deviceCounts.tracked_offline)
    : myDevices.filter(d => !isDeviceOnline(d)).length

  const trackedPercentage = calculatePercentage(trackedDevicesCount, totalDevicesCount)
  const onlinePercentage = calculatePercentage(onlineDevicesCount, trackedDevicesCount)
  const offlinePercentage = calculatePercentage(offlineDevicesCount, trackedDevicesCount)
  const deployedPercentage = calculatePercentage(deployedDevicesCount, totalDevicesCount)

  // Get unique networks for filter
  const uniqueNetworks = useMemo(() => {
    const activeDevicesList = deviceScope === "org" ? devices : myDevices
    const networks = new Set(activeDevicesList.map(d => d.network).filter(Boolean))
    return Array.from(networks)
  }, [devices, myDevices, deviceScope])

  const getDeviceLastSeenTimestamp = useCallback((device: UIDevice) => {
    return device.reading_timestamp || device.last_updated || null
  }, [])

  // Helper to check if device is online based on "previous day" logic
  const isDeviceOnline = useCallback((device: UIDevice) => {
    const lastSeenTimestamp = getDeviceLastSeenTimestamp(device)
    if (!lastSeenTimestamp) return false

    const updatedDate = new Date(lastSeenTimestamp)
    if (Number.isNaN(updatedDate.getTime())) return false

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 1)
    cutoffDate.setHours(0, 0, 0, 0)

    return updatedDate >= cutoffDate
  }, [getDeviceLastSeenTimestamp])

  // Sort devices - online devices first, then by name
  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      if (a.status === "deployed" && b.status !== "deployed") return -1;
      if (a.status !== "deployed" && b.status === "deployed") return 1;
      return (a.device_name || "").localeCompare(b.device_name || "");
    });
  }, [devices])

  // Filter, sort, and paginate devices dynamically based on scope
  const displayedDevices = useMemo(() => {
    if (deviceScope === "org") {
      return sortedDevices
    }

    let filtered = myDevices
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((d) => 
        (d.device_name || "").toLowerCase().includes(term) ||
        (d.device_id || "").toLowerCase().includes(term) ||
        (d.location_name || "").toLowerCase().includes(term) ||
        (d.city || "").toLowerCase().includes(term) ||
        (d.country || "").toLowerCase().includes(term)
      )
    }

    const sorted = [...filtered].sort((a, b) => {
      if (a.status === "deployed" && b.status !== "deployed") return -1
      if (a.status !== "deployed" && b.status === "deployed") return 1
      return (a.device_name || "").localeCompare(b.device_name || "")
    })

    return sorted
  }, [deviceScope, sortedDevices, myDevices, searchTerm])

  const paginatedDisplayedDevices = useMemo(() => {
    if (deviceScope === "org") {
      return displayedDevices
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    return displayedDevices.slice(startIndex, startIndex + itemsPerPage)
  }, [deviceScope, displayedDevices, currentPage, itemsPerPage])

  const currentTotalItems = useMemo(() => {
    return deviceScope === "org" ? totalDevices : displayedDevices.length
  }, [deviceScope, totalDevices, displayedDevices])

  const currentTotalPages = useMemo(() => {
    return deviceScope === "org"
      ? totalPages
      : Math.ceil(displayedDevices.length / itemsPerPage) || 1
  }, [deviceScope, totalPages, displayedDevices, itemsPerPage])

  const currentItems = paginatedDisplayedDevices;

  // Get status badge variant
  const getStatusBadge = useCallback((device: UIDevice) => {
    if (isDeviceOnline(device)) {
      return { variant: "default", className: "bg-green-500 hover:bg-green-600", icon: Wifi, text: "Online" }
    }
    return { variant: "secondary", className: "bg-gray-500 hover:bg-gray-600", icon: WifiOff, text: "Offline" }
  }, [isDeviceOnline])

  // Get deployment status badge
  const getDeploymentBadge = useCallback((status: string | undefined) => {
    switch (status) {
      case "deployed":
        return { variant: "default", className: "bg-green-100 text-green-700 hover:bg-green-200", text: "Deployed" }
      case "not deployed":
        return { variant: "secondary", className: "bg-gray-100 text-gray-700 hover:bg-gray-200", text: "Not Deployed" }
      case "recalled":
        return { variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-200", text: "Recalled" }
      default:
        return { variant: "outline", className: "", text: status || "Unknown" }
    }
  }, [])

  // Get network badge color
  const getNetworkBadge = useCallback((network: string | undefined) => {
    const networkColors: { [key: string]: string } = {
      airbeam: "bg-purple-100 text-purple-800",
      airqo: "bg-blue-100 text-blue-800",
      lowcost: "bg-green-100 text-green-800",
      default: "bg-gray-100 text-gray-800"
    }
    return networkColors[network?.toLowerCase() || 'default'] || networkColors.default
  }, [])

  // Get firmware badge info
  const getFirmwareBadge = useCallback((currentFirmware: string | undefined, targetFirmware: string | undefined, downloadState: string | undefined) => {
    // Both current and target are null - not set
    if (!currentFirmware && !targetFirmware) {
      return {
        color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        text: "Not Set",
        tooltip: "Firmware not set"
      }
    }

    // Target is null - has updated firmware
    if (!targetFirmware) {
      return {
        color: "bg-green-100 text-green-700 hover:bg-green-200",
        text: currentFirmware || "Updated",
        tooltip: "Firmware is up to date"
      }
    }

    // Current firmware matches target - green
    if (currentFirmware === targetFirmware) {
      return {
        color: "bg-green-100 text-green-700 hover:bg-green-200",
        text: currentFirmware,
        tooltip: "Firmware is up to date"
      }
    }

    // Current firmware differs from target - orange (pending update)
    return {
      color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
      text: currentFirmware || "Pending",
      tooltip: `${downloadState === 'pending' ? 'Pending' : downloadState === 'failed' ? 'Failed' : 'Updating'} to ${targetFirmware}`
    }
  }, [])

  // Handle device selection on map
  const handleDeviceSelect = useCallback((id: string) => {
    setSelectedDeviceId(id)
  }, [])

  // Handle firmware badge click
  const handleFirmwareClick = useCallback((device: UIDevice, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    setSelectedFirmwareDevice(device)
    setFirmwareDialogOpen(true)
  }, [])

  // Handle network ID click
  const handleNetworkIdClick = useCallback((device: UIDevice, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    setSelectedFirmwareDevice(device)
    setFirmwareDialogOpen(true)
  }, [])

  // Handle successful device update
  const handleUpdateSuccess = useCallback(() => {
    refreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle row click to navigate to device details
  const handleRowClick = useCallback((deviceId: string) => {
    window.location.href = `/dashboard/devices/${deviceId}`
  }, [])


  const hasInitialData = deviceScope === "org" ? devices.length > 0 : myDevices.length > 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Device Monitoring</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={handleSyncDevices}
            disabled={isSyncing || isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Refresh Devices'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={refreshData}
            disabled={isRefreshing || isSyncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {activeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{activeError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total & Tracked Devices */}
        <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              Total Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-bold">
                  {isDataLoading && !hasInitialData ? '...' : totalDevicesCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Registered devices</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">
                  {isDataLoading && !hasInitialData ? '...' : trackedDevicesCount}
                </div>
                <p className="text-xs text-muted-foreground">Tracked ({trackedPercentage}%)</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${trackedPercentage}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployed Devices */}
        <Card className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-500" />
              Deployed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {isDataLoading && !hasInitialData ? '...' : deployedDevicesCount}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${deployedPercentage}%` }}></div>
              <span className="text-xs text-muted-foreground ml-2">{deployedPercentage}% of total</span>
            </div>
          </CardContent>
        </Card>

        {/* Online Devices */}
        <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wifi className="mr-2 h-5 w-5 text-green-500" />
              Online (Tracked)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {isDataLoading && !hasInitialData ? '...' : onlineDevicesCount}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: `${onlinePercentage}%` }}></div>
              <span className="text-xs text-muted-foreground ml-2">{onlinePercentage}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Offline Devices */}
        <Card className="overflow-hidden border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <WifiOff className="mr-2 h-5 w-5 text-red-500" />
              Offline (Tracked)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {isDataLoading && !hasInitialData ? '...' : offlineDevicesCount}
            </div>
            <div className="flex items-center mt-1">
              <div className="h-2 bg-red-500 rounded-full" style={{ width: `${offlinePercentage}%` }}></div>
              <span className="text-xs text-muted-foreground ml-2">{offlinePercentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List Section with Tabs */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Device List
            </CardTitle>

            {/* Scope Tabs */}
            <div className="flex items-center gap-2">
              {!hideOrgDevices && (
                <Button
                  variant={deviceScope === "org" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeviceScope("org")}
                  className="flex items-center"
                >
                  <List className="mr-2 h-4 w-4" />
                  Org Devices
                </Button>
              )}
              <Button
                variant={deviceScope === "my" ? "default" : "outline"}
                size="sm"
                onClick={() => setDeviceScope("my")}
                className="flex items-center"
              >
                <Package className="mr-2 h-4 w-4" />
                My Devices
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <>
            {/* Controls Container */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by device name, ID, location, city, or country..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // Reset to first page when searching
                  }}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1.5 h-7 w-7 p-0"
                    onClick={() => {
                      setSearchTerm("")
                      setCurrentPage(1)
                    }}
                  >
                    <span className="sr-only">Clear search</span>
                    ✕
                  </Button>
                )}
              </div>
            </div>

            {isDataLoading && !hasInitialData ? (
              <div className="py-8 flex justify-center items-center">
                <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                <span className="ml-4 text-lg">Loading devices...</span>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <AlertCircle className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                <p>No devices found matching your criteria.</p>
                <p className="text-sm mt-2">Try changing your search or filter settings.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Device Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Deployment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Channel ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Network ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Firmware</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((device) => {
                      const statusInfo = getStatusBadge(device)
                      const deploymentInfo = getDeploymentBadge(device.status)
                      const StatusIcon = statusInfo.icon
                      const lastSeenTimestamp = getDeviceLastSeenTimestamp(device)
                      const firmwareInfo = getFirmwareBadge(
                        device.current_firmware,
                        device.target_firmware,
                        device.firmware_download_state
                      )

                      return (
                        <tr
                          key={device.device_id}
                          className="border-b hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                          onClick={() => handleRowClick(device.device_id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleRowClick(device.device_id)
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View details for device ${device.device_name || device.device_id}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <StatusIcon
                                      className={`h-4 w-4 ${isDeviceOnline(device) ? 'text-green-500' : 'text-gray-400'}`}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent className={isDeviceOnline(device) ? "bg-green-600 text-white border-green-600" : "bg-gray-600 text-white border-gray-600"}>
                                    <p>Last updated: {lastSeenTimestamp ? new Date(lastSeenTimestamp).toLocaleString() : 'Never'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="font-medium">{device.device_name || "Unnamed"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${deploymentInfo.className}`}>
                              {deploymentInfo.text}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {formatCategoryLabel(device.category)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {device.channel_id || "-"}
                            </span>
                          </td>
                          <td className="py-3 px-4" onClick={(e) => handleNetworkIdClick(device, e)}>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors">
                              {device.network_id || "Not Set"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4" onClick={(e) => handleFirmwareClick(device, e)}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge className={`${firmwareInfo.color} cursor-pointer transition-colors`}>
                                    {firmwareInfo.text}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{firmwareInfo.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="py-3 px-4">
                            {device.location_name || device.city || device.country ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {device.location_name || "Unknown"}
                                </span>
                                {(device.city || device.country) && (
                                  <span className="text-xs text-gray-500">
                                    {[device.city, device.country].filter(Boolean).join(", ")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No location</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Items per page:</span>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Per page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={currentTotalPages || 1}
                      onPageChange={setCurrentPage}
                      showInfo={true}
                      totalItems={currentTotalItems}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        </CardContent>
      </Card>

      {/* Update Device Dialog */}
      <UpdateDeviceDialog
        open={firmwareDialogOpen}
        onOpenChange={setFirmwareDialogOpen}
        device={selectedFirmwareDevice}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  )
}