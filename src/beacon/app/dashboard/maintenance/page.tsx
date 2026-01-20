"use client"

import React, { useEffect, useState, useMemo } from "react"
import { BarChart3, Table as TableIcon, Map as MapIcon, AlertTriangle, Battery, WifiOff, CheckCircle2, Search, Globe } from "lucide-react"
import { getAirQloudStats, getDeviceStatsMaintenance, getMaintenanceMapData } from "@/services/device-api.service"
import { AirQloudStatsResponse, DeviceMaintenanceStatsResponse, MaintenanceMapResponse, MaintenanceMapItem } from "@/types/api.types"
import { calculateNearestNeighborRoute, Coordinates, RoutePoint } from "@/utils/routing-utils"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight } from "lucide-react"
import AirQloudMaintenanceTable from "@/components/maintenance/airqloud-maintenance-table"
import DeviceMaintenanceTable from "@/components/maintenance/device-maintenance-table"
import MaintenanceGraphCard from "@/components/maintenance/maintenance-graph-card"
import dynamic from "next/dynamic"

// Dynamically import Map component to avoid SSR issues with Leaflet
const MaintenanceMap = dynamic(() => import("@/components/maintenance/maintenance-map"), {
    loading: () => <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Map...</div>,
    ssr: false
})

type ViewType = 'charts' | 'tables' | 'map'
type SortOrder = 'asc' | 'desc'

export default function MaintenancePage() {
    const { toast } = useToast()
    const [view, setView] = useState<ViewType>('charts')

    // --- CHART VIEW STATE ---
    // Global Filters for Charts (passed down to cards)
    const [chartAirQloudFilters, setChartAirQloudFilters] = useState({ country: "", search: "" })
    const [chartDeviceFilters, setChartDeviceFilters] = useState({ search: "" })

    // Local state for inputs (to avoid auto-fetching)
    const [localChartAQFilters, setLocalChartAQFilters] = useState({ country: "", search: "" })
    const [localChartDeviceFilters, setLocalChartDeviceFilters] = useState({ search: "" })

    // --- TABLE VIEW STATE (FILTERS) ---
    const [tableAirQloudFilters, setTableAirQloudFilters] = useState({ country: "", search: "" })
    const [tableDeviceFilters, setTableDeviceFilters] = useState({ search: "" })

    // Local state for table inputs
    const [localTableAQFilters, setLocalTableAQFilters] = useState({ country: "", search: "" })
    const [localTableDeviceFilters, setLocalTableDeviceFilters] = useState({ search: "" })

    // --- TABLE PAGINATION & SORTING STATE ---
    const [airQloudPage, setAirQloudPage] = useState(1)
    const [airQloudPageSize] = useState(20)
    const [airQloudSortField, setAirQloudSortField] = useState("error_margin")
    const [airQloudSortOrder, setAirQloudSortOrder] = useState<SortOrder>("asc")

    const [devicePage, setDevicePage] = useState(1)
    const [devicePageSize] = useState(20)
    const [deviceSortField, setDeviceSortField] = useState("error_margin")
    const [deviceSortOrder, setDeviceSortOrder] = useState<SortOrder>("asc")


    const [airQloudStats, setAirQloudStats] = useState<AirQloudStatsResponse | null>(null)
    const [deviceStats, setDeviceStats] = useState<DeviceMaintenanceStatsResponse | null>(null)
    const [loadingAirQlouds, setLoadingAirQlouds] = useState(false)
    const [loadingDevices, setLoadingDevices] = useState(false)

    // --- SELECTION STATE (Shared) ---
    const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])

    // --- MAP VIEW STATE ---
    const [mapData, setMapData] = useState<MaintenanceMapResponse | null>(null)
    const [loadingMap, setLoadingMap] = useState(false)
    const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'critical' | 'battery' | 'offline'>('all')
    const [selectedAirQloud, setSelectedAirQloud] = useState<string>('all')

    // --- ROUTING STATE ---
    const DEFAULT_HOME_LOCATION = { latitude: 0.332078, longitude: 32.570473, name: "Head Office" };
    const [routePath, setRoutePath] = useState<MaintenanceMapItem[]>([])
    const [isRouting, setIsRouting] = useState(false)
    const [homeLocation, setHomeLocation] = useState<Coordinates & { name?: string }>(DEFAULT_HOME_LOCATION)

    // Derived AirQlouds list from map mapData
    const uniqueAirQlouds = useMemo(() => {
        if (!mapData) return [];
        const aqs = new Set<string>();
        mapData.forEach(d => d.airqlouds.forEach(aq => aqs.add(aq)));
        return Array.from(aqs).sort();
    }, [mapData]);

    // Filtered Map Data
    // Filtered Map Data
    const filteredMapData = useMemo(() => {
        if (!mapData) return [];

        let filtered = mapData;

        // 1. AirQloud Filter
        if (selectedAirQloud !== 'all') {
            filtered = filtered.filter(d => d.airqlouds.includes(selectedAirQloud));
        }

        // 2. Quick Filters
        if (activeQuickFilter === 'all') return filtered;

        return filtered.filter(device => {
            if (activeQuickFilter === 'critical') {
                // < 70% uptime OR > 20% error OR > 1 day inactive
                const isinactive = device.last_active && (new Date().getTime() - new Date(device.last_active).getTime()) > 86400000;
                return device.avg_uptime < 70 || device.avg_error_margin > 20 || isinactive;
            }
            if (activeQuickFilter === 'battery') {
                return false;
            }
            if (activeQuickFilter === 'offline') {
                return device.last_active && (new Date().getTime() - new Date(device.last_active).getTime()) > 86400000 * 7;
            }
            return true;
        })
    }, [mapData, activeQuickFilter, selectedAirQloud]);

    // Handlers
    const handleDeviceSelect = (id: string) => {
        setSelectedDeviceIds(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        )
    }

    const clearSelection = () => setSelectedDeviceIds([])


    // Fetch Table Data (AirQlouds)
    const fetchAirQloudTable = async () => {
        setLoadingAirQlouds(true)
        try {
            const response = await getAirQloudStats({
                period_days: 14,
                filters: {
                    uptime: { min: 0, max: 24 },
                    error_margin: { min: 0, max: 100 },
                    ...tableAirQloudFilters
                },
                sort: { field: airQloudSortField, order: airQloudSortOrder },
                page: airQloudPage,
                page_size: airQloudPageSize
            })
            setAirQloudStats(response)
        } catch (error) {
            console.error("Failed to fetch AirQloud table stats", error)
        } finally {
            setLoadingAirQlouds(false)
        }
    }

    // Fetch Table Data (Devices)
    const fetchDeviceTable = async () => {
        setLoadingDevices(true)
        try {
            const response = await getDeviceStatsMaintenance({
                period_days: 14,
                filters: {
                    uptime: { min: 0, max: 24 },
                    error_margin: { min: 0, max: 100 },
                    country: "",
                    ...tableDeviceFilters
                },
                sort: { field: deviceSortField, order: deviceSortOrder },
                page: devicePage,
                page_size: devicePageSize
            })
            setDeviceStats(response)
        } catch (error) {
            console.error("Failed to fetch Device table stats", error)
        } finally {
            setLoadingDevices(false)
        }
    }

    // Fetch Map Data
    const fetchMapData = async () => {
        setLoadingMap(true)
        try {
            const response = await getMaintenanceMapData(14)
            setMapData(response)
        } catch (error) {
            console.error("Failed to fetch Map data", error)
        } finally {
            setLoadingMap(false)
        }
    }

    // --- ROUTING LOGIC ---
    const calculateRoute = () => {
        if (!filteredMapData || filteredMapData.length === 0) return;

        setIsRouting(true);
        toast({
            title: "Calculating Route...",
            description: `Optimizing route for ${filteredMapData.length} devices.`,
        });

        // Use filtering to ensure valid coordinates
        const validDevices: MaintenanceMapItem[] = filteredMapData.filter(item =>
            item.latitude !== undefined && item.longitude !== undefined &&
            item.latitude !== null && item.longitude !== null
        );

        if (validDevices.length === 0) {
            setIsRouting(false);
            toast({
                title: "Routing Error",
                description: "No devices with valid coordinates found in this view.",
                variant: "destructive"
            });
            return;
        }

        // Adapt MaintenanceMapItem to RoutePoint (needs id field)
        const routePoints = validDevices.map(d => ({
            ...d,
            id: d.device_id, // Map device_id to id for the algo
            latitude: d.latitude!,
            longitude: d.longitude!
        }));

        // 1. Calculate Nearest Neighbor Path
        const optimizedPoints = calculateNearestNeighborRoute(homeLocation, routePoints);

        // 2. Map back to MaintenanceMapItem
        setRoutePath(optimizedPoints as unknown as MaintenanceMapItem[]);

        toast({
            title: "Route Calculated",
            description: `Optimal route found for ${optimizedPoints.length} stops.`,
        });
    };

    const clearRoute = () => {
        setIsRouting(false);
        setRoutePath([]);
    }

    // Fetch tables only when in table view and relevant state changes
    useEffect(() => {
        if (view === 'tables') {
            fetchAirQloudTable()
        }
    }, [view, tableAirQloudFilters, airQloudPage, airQloudSortField, airQloudSortOrder])

    useEffect(() => {
        if (view === 'tables') {
            fetchDeviceTable()
        }
    }, [view, tableDeviceFilters, devicePage, deviceSortField, deviceSortOrder])

    // Fetch map data when entering map view
    useEffect(() => {
        if (view === 'map') {
            if (!mapData) fetchMapData();
            // Also fetch AirQloud stats for the sidebar if not present
            if (!airQloudStats) fetchAirQloudTable();
        }
    }, [view])

    // Handlers for AirQloud Table
    const handleAirQloudSort = (field: string) => {
        if (airQloudSortField === field) {
            setAirQloudSortOrder(airQloudSortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setAirQloudSortField(field)
            setAirQloudSortOrder('asc')
        }
        setAirQloudPage(1) // Reset to page 1 on sort change
    }

    // Handlers for Device Table
    const handleDeviceSort = (field: string) => {
        if (deviceSortField === field) {
            setDeviceSortOrder(deviceSortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setDeviceSortField(field)
            setDeviceSortOrder('asc')
        }
        setDevicePage(1) // Reset to page 1 on sort change
    }

    // Reset page when filters change
    const handleAirQloudSearch = () => {
        setTableAirQloudFilters(localTableAQFilters)
        setAirQloudPage(1)
    }

    const handleDeviceSearch = () => {
        setTableDeviceFilters(localTableDeviceFilters)
        setDevicePage(1)
    }

    const handleChartAQSearch = () => {
        setChartAirQloudFilters(localChartAQFilters)
    }

    const handleChartDeviceSearch = () => {
        setChartDeviceFilters(localChartDeviceFilters)
    }


    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

            {/* Header & View Switcher */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-gray-900">Maintenance Dashboard</h1>
                        <p className="text-gray-500 text-sm">Monitor device health and plan maintenance routes</p>
                    </div>

                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                        <button
                            onClick={() => setView('charts')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'charts'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                } `}
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Charts
                        </button>
                        <button
                            onClick={() => setView('tables')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'tables'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                } `}
                        >
                            <TableIcon className="w-4 h-4 mr-2" />
                            Tables
                        </button>
                        <button
                            onClick={() => setView('map')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'map'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                } `}
                        >
                            <MapIcon className="w-4 h-4 mr-2" />
                            Map
                        </button>
                    </div>
                </div>

                {/* Recommendations / Quick Filters */}
                {view === 'map' && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-2">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm font-medium text-gray-700 mr-2">Quick Filters:</span>
                            <button
                                onClick={() => setActiveQuickFilter('all')}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${activeQuickFilter === 'all'
                                    ? 'bg-gray-800 text-white border-gray-800'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                All Devices
                            </button>
                            <button
                                onClick={() => setActiveQuickFilter('critical')}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${activeQuickFilter === 'critical'
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-600'
                                    }`}
                            >
                                <AlertTriangle className="w-3 h-3" />
                                Critical Attention
                            </button>
                            <button
                                onClick={() => setActiveQuickFilter('offline')}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${activeQuickFilter === 'offline'
                                    ? 'bg-orange-100 text-orange-700 border-orange-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-200 hover:text-orange-600'
                                    }`}
                            >
                                <WifiOff className="w-3 h-3" />
                                Offline &gt;7d
                            </button>
                        </div>
                    </div>
                )}
            </div>


            {/* --- CHARTS VIEW --- */}
            {view === 'charts' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* AirQlouds Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-xl font-semibold text-blue-600">AirQlouds Charts</h2>
                            <div className="flex gap-4">
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Search Name..."
                                            value={localChartAQFilters.search}
                                            onChange={(e) => setLocalChartAQFilters({ ...localChartAQFilters, search: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleChartAQSearch()}
                                        />
                                    </div>
                                    <div className="relative w-full sm:w-40">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Country..."
                                            value={localChartAQFilters.country}
                                            onChange={(e) => setLocalChartAQFilters({ ...localChartAQFilters, country: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleChartAQSearch()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleChartAQSearch}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <MaintenanceGraphCard
                                type="airqloud"
                                metric="uptime"
                                title="AirQloud Average Uptime"
                                color="#10B981"
                                globalFilters={chartAirQloudFilters}
                            />
                            <MaintenanceGraphCard
                                type="airqloud"
                                metric="error_margin"
                                title="AirQloud Average Error Margin"
                                color="#EF4444"
                                globalFilters={chartAirQloudFilters}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Devices Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-xl font-semibold text-purple-600">Devices Charts</h2>
                            <div className="flex gap-4">
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                            placeholder="Search Name/ID..."
                                            value={localChartDeviceFilters.search}
                                            onChange={(e) => setLocalChartDeviceFilters({ ...localChartDeviceFilters, search: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleChartDeviceSearch()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleChartDeviceSearch}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors shadow-sm"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <MaintenanceGraphCard
                                type="device"
                                metric="uptime"
                                title="Device Average Uptime"
                                color="#8B5CF6"
                                globalFilters={chartDeviceFilters}
                            />
                            <MaintenanceGraphCard
                                type="device"
                                metric="error_margin"
                                title="Device Average Error Margin"
                                color="#F59E0B"
                                globalFilters={chartDeviceFilters}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- TABLES VIEW --- */}
            {view === 'tables' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* AirQlouds Table Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-xl font-semibold text-blue-600">AirQlouds Data</h2>
                            <div className="flex gap-4">
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Filter Name..."
                                            value={localTableAQFilters.search}
                                            onChange={(e) => setLocalTableAQFilters({ ...localTableAQFilters, search: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAirQloudSearch()}
                                        />
                                    </div>
                                    <div className="relative w-full sm:w-40">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Filter Country..."
                                            value={localTableAQFilters.country}
                                            onChange={(e) => setLocalTableAQFilters({ ...localTableAQFilters, country: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAirQloudSearch()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAirQloudSearch}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <AirQloudMaintenanceTable
                                data={airQloudStats?.items || []}
                                loading={loadingAirQlouds}
                                sortField={airQloudSortField}
                                sortOrder={airQloudSortOrder}
                                onSort={handleAirQloudSort}
                                page={airQloudPage}
                                pageSize={airQloudPageSize}
                                total={airQloudStats?.total || 0}
                                onPageChange={setAirQloudPage}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Devices Table Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-xl font-semibold text-purple-600">Devices Data</h2>
                            <div className="flex gap-4">
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                            placeholder="Filter Device Name/ID..."
                                            value={localTableDeviceFilters.search}
                                            onChange={(e) => setLocalTableDeviceFilters({ ...localTableDeviceFilters, search: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleDeviceSearch()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleDeviceSearch}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors shadow-sm"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <DeviceMaintenanceTable
                                data={deviceStats?.items || []}
                                loading={loadingDevices}
                                sortField={deviceSortField}
                                sortOrder={deviceSortOrder}
                                onSort={handleDeviceSort}
                                page={devicePage}
                                pageSize={devicePageSize}
                                total={deviceStats?.total || 0}
                                onPageChange={setDevicePage}
                                selectedDeviceIds={selectedDeviceIds}
                                onSelectionChange={setSelectedDeviceIds}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAP VIEW (ENHANCED) --- */}
            {view === 'map' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-12rem)] animate-in fade-in duration-300">
                    {/* Left Panel: AirQloud List (Restored) */}
                    <div className="md:col-span-3 h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-gray-700">Select AirQloud</h3>
                            <div className="text-xs text-muted-foreground">{airQloudStats?.items?.length || 0} Avail</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            {loadingAirQlouds ? (
                                <div className="p-4 space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="flex flex-col divide-y">
                                    <button
                                        onClick={() => {
                                            setSelectedAirQloud('all');
                                            clearRoute();
                                        }}
                                        className={`flex items-center p-3 text-left transition-colors hover:bg-gray-50 ${selectedAirQloud === 'all' ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="font-semibold text-sm">All AirQlouds</div>
                                    </button>
                                    {airQloudStats?.items?.map((aq: any) => (
                                        <button
                                            key={aq.id || aq.name}
                                            onClick={() => {
                                                setSelectedAirQloud(aq.name); // Using name as IDs might be inconsistent with map data in this implementation
                                                clearRoute();
                                            }}
                                            className={`flex flex-col gap-1 p-3 text-left transition-colors hover:bg-gray-50 ${selectedAirQloud === aq.name ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-medium text-sm truncate w-32" title={aq.name}>{aq.name}</span>
                                                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{aq.device_count} Dev</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center text-[10px] text-gray-500" title="Avg Uptime">
                                                    <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                                                    {((aq.avg_uptime || 0) / 24 * 100).toFixed(0)}%
                                                </div>
                                                <div className="flex items-center text-[10px] text-gray-500" title="Avg Error Margin">
                                                    <AlertTriangle className={`w-3 h-3 mr-1 ${aq.avg_error_margin > 10 ? 'text-orange-500' : 'text-gray-400'}`} />
                                                    {aq.avg_error_margin !== undefined ? `${aq.avg_error_margin.toFixed(0)}%` : '-'}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Map & Route Controls */}
                    <div className="md:col-span-9 flex flex-col gap-4 h-full overflow-hidden">
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-sm">
                                    {selectedAirQloud === 'all' ? 'All AirQlouds' : selectedAirQloud.toUpperCase()}
                                </span>
                                {(activeQuickFilter !== 'all') && (
                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        Filtered: {activeQuickFilter}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center text-xs border rounded-md px-2 py-1 bg-gray-50">
                                    <span className="text-gray-500 mr-2">Home:</span>
                                    <span className="font-medium">{homeLocation.name}</span>
                                    {/* Placeholder for Configure Home - could open a dialog */}
                                    {/* <Settings className="w-3 h-3 ml-2 text-gray-400 cursor-pointer hover:text-gray-600" /> */}
                                </div>

                                <button
                                    onClick={isRouting ? clearRoute : calculateRoute}
                                    disabled={loadingMap || !filteredMapData?.length}
                                    className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isRouting
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 disabled:opacity-50'
                                        }`}
                                >
                                    <MapIcon className="w-3 h-3 mr-1.5" />
                                    {isRouting ? 'Clear Route' : 'Generate Route'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-gray-100">
                            <MaintenanceMap
                                data={filteredMapData || []}
                                loading={loadingMap}
                                selectedDeviceIds={selectedDeviceIds}
                                onDeviceSelect={handleDeviceSelect}
                                routePath={routePath}
                                homeLocation={homeLocation}
                            />
                        </div>

                        {isRouting && routePath.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 overflow-hidden animate-in slide-in-from-bottom-2">
                                <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center uppercase tracking-wider">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                                    Route Itinerary
                                </h3>
                                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                                    {/* Start Label */}
                                    <div className="flex flex-col items-center min-w-[60px]">
                                        <span className="text-[10px] font-bold text-gray-400 mb-1">START</span>
                                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">H</div>
                                    </div>

                                    <ArrowRight className="w-3 h-3 text-gray-300" />

                                    {routePath.map((stop, idx) => (
                                        <React.Fragment key={stop.device_id}>
                                            <div className="flex flex-col items-center min-w-[80px] max-w-[100px]">
                                                <span className="text-[10px] font-bold text-gray-400 mb-1">STOP {idx + 1}</span>
                                                <div className="w-full bg-blue-50 border border-blue-100 rounded px-2 py-1 text-center">
                                                    <div className="text-[10px] font-medium text-blue-700 truncate" title={stop.device_name}>{stop.device_name}</div>
                                                </div>
                                            </div>
                                            {idx < routePath.length - 1 && (
                                                <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                            )}
                                        </React.Fragment>
                                    ))}

                                    <ArrowRight className="w-3 h-3 text-gray-300" />
                                    <div className="flex flex-col items-center min-w-[60px]">
                                        <span className="text-[10px] font-bold text-gray-400 mb-1">END</span>
                                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">H</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            )}
        </div>
    )
}
