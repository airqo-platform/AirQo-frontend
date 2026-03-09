"use client"

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { Map as MapIcon, AlertTriangle, CheckCircle2, Search, ChevronDown, X } from "lucide-react"
import { getMaintenanceMapData } from "@/services/device-api.service"
import { MaintenanceMapItem } from "@/types/api.types"
import { airQloudService, type AirQloudBasic } from "@/services/airqloud.service"
import { calculateNearestNeighborRoute, Coordinates } from "@/utils/routing-utils"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"

// Dynamically import Map component to avoid SSR issues with Leaflet
const MaintenanceMap = dynamic(() => import("@/components/maintenance/maintenance-map"), {
    loading: () => <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Map...</div>,
    ssr: false
})

const DAYS_OPTIONS = [7, 14, 30, 60]
const OFFLINE_DAYS_OPTIONS = [
    { label: "All Devices", value: null },
    { label: "Offline ≥ 1 day", value: 1 },
    { label: "Offline ≥ 3 days", value: 3 },
    { label: "Offline ≥ 7 days", value: 7 },
    { label: "Offline ≥ 14 days", value: 14 },
    { label: "Offline ≥ 30 days", value: 30 },
]
const AVAILABLE_TAGS = ["hardware", "software", "urban", "rural", "bam", "lowcost"]

export default function MaintenancePage() {
    const { toast } = useToast()

    // --- FILTER STATE ---
    const [selectedDays, setSelectedDays] = useState(14)
    const [selectedTags, setSelectedTags] = useState<string[]>(["hardware"])

    // --- COHORT LIST ---
    const [cohorts, setCohorts] = useState<AirQloudBasic[]>([])
    const [loadingAirQlouds, setLoadingAirQlouds] = useState(false)

    // --- SELECTION STATE ---
    const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])

    // --- MAP VIEW STATE ---
    const [mapData, setMapData] = useState<MaintenanceMapItem[] | null>(null)
    const [loadingMap, setLoadingMap] = useState(false)
    const [offlineDaysFilter, setOfflineDaysFilter] = useState<number | null>(null)
    const [selectedAirQloud, setSelectedAirQloud] = useState<string>('all')

    // --- COHORT DROPDOWN STATE ---
    const [cohortSearch, setCohortSearch] = useState('')
    const [cohortDropdownOpen, setCohortDropdownOpen] = useState(false)
    const cohortDropdownRef = useRef<HTMLDivElement>(null)

    // --- ROUTING STATE ---
    const DEFAULT_HOME_LOCATION = { latitude: 0.332078, longitude: 32.570473, name: "Head Office" };
    const [routePath, setRoutePath] = useState<MaintenanceMapItem[]>([])
    const [isRouting, setIsRouting] = useState(false)
    const [homeLocation] = useState<Coordinates & { name?: string }>(DEFAULT_HOME_LOCATION)

    // Tag toggle handler (mirrors analytics-filters pattern)
    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    // Close cohort dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (cohortDropdownRef.current && !cohortDropdownRef.current.contains(e.target as Node)) {
                setCohortDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Filtered cohort list for the dropdown
    const filteredCohorts = useMemo(() => {
        if (!cohorts.length) return []
        if (!cohortSearch.trim()) return cohorts
        const q = cohortSearch.toLowerCase()
        return cohorts.filter(aq => aq.name.toLowerCase().includes(q))
    }, [cohorts, cohortSearch])

    // Filtered Map Data
    const filteredMapData = useMemo(() => {
        if (!mapData) return [];

        let filtered = mapData;

        // 1. Cohort Filter
        if (selectedAirQloud !== 'all') {
            filtered = filtered.filter(d => d.cohorts.includes(selectedAirQloud));
        }

        // 2. Offline Days Filter
        if (offlineDaysFilter !== null) {
            const now = new Date().getTime();
            const thresholdMs = offlineDaysFilter * 86400000; // days to milliseconds
            filtered = filtered.filter(device => {
                if (!device.last_active) return true; // show devices with no last_active data
                const offlineDuration = now - new Date(device.last_active).getTime();
                return offlineDuration >= thresholdMs;
            });
        }

        return filtered;
    }, [mapData, offlineDaysFilter, selectedAirQloud]);

    // Handlers
    const handleDeviceSelect = (id: string) => {
        setSelectedDeviceIds(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        )
    }

    // Fetch cohort list (same endpoint as analytics-filters)
    useEffect(() => {
        let cancelled = false
        const fetchCohorts = async () => {
            setLoadingAirQlouds(true)
            try {
                const tagsParam = selectedTags.length > 0 ? selectedTags.join(',') : undefined
                const response = await airQloudService.getAirQloudsBasic({
                    search: cohortSearch || undefined,
                    tags: tagsParam,
                    limit: 100,
                })
                if (!cancelled) {
                    const items = Array.isArray(response) ? response : (response as any).airqlouds || []
                    setCohorts(items)
                }
            } catch (error) {
                console.error('Failed to fetch cohorts', error)
            } finally {
                if (!cancelled) setLoadingAirQlouds(false)
            }
        }

        const timer = setTimeout(fetchCohorts, 300) // debounce for search
        return () => { cancelled = true; clearTimeout(timer) }
    }, [selectedTags, cohortSearch])

    // Fetch Map Data (re-fetch when days or tags change)
    const fetchMapData = useCallback(async () => {
        setLoadingMap(true)
        try {
            const tagsParam = selectedTags.length > 0 ? selectedTags.join(",") : undefined
            const response = await getMaintenanceMapData(selectedDays, tagsParam)
            return response
        } catch (error) {
            console.error("Failed to fetch Map data", error)
            return null
        } finally {
            setLoadingMap(false)
        }
    }, [selectedDays, selectedTags])

    // --- ROUTING LOGIC ---
    const calculateRoute = () => {
        if (!filteredMapData || filteredMapData.length === 0) return;

        setIsRouting(true);
        toast({
            title: "Calculating Route...",
            description: `Optimizing route for ${filteredMapData.length} devices.`,
        });

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

        const routePoints = validDevices.map(d => ({
            ...d,
            id: d.device_id,
            latitude: d.latitude!,
            longitude: d.longitude!
        }));

        const optimizedPoints = calculateNearestNeighborRoute(homeLocation, routePoints);
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


    // Fetch map data when days or tags change
    useEffect(() => {
        let cancelled = false;
        fetchMapData().then((res) => {
            if (!cancelled && res) setMapData(res)
        })
        return () => { cancelled = true; }
    }, [fetchMapData])

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

            {/* Header & Quick Filters */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-gray-900">Maintenance Dashboard</h1>
                        <p className="text-gray-500 text-sm">Monitor device health and plan maintenance routes</p>
                    </div>
                </div>

                {/* Days & Tags Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                    {/* Days Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Period:</span>
                        <select
                            value={selectedDays}
                            onChange={(e) => setSelectedDays(Number(e.target.value))}
                            className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {DAYS_OPTIONS.map(d => (
                                <option key={d} value={d}>{d} days</option>
                            ))}
                        </select>
                    </div>

                    {/* Separator */}
                    <div className="hidden sm:block w-px h-6 bg-gray-200" />

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">Tags:</span>
                        {AVAILABLE_TAGS.map(tag => (
                            <Badge
                                key={tag}
                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${selectedTags.includes(tag)
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                                onClick={() => toggleTag(tag)}
                            >
                                {tag}
                            </Badge>
                        ))}
                        {selectedTags.length > 0 && (
                            <button
                                onClick={() => setSelectedTags([])}
                                className="text-xs text-gray-400 hover:text-gray-600 underline ml-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pb-2">
                    {/* Offline Days Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Show Devices:</span>
                        <select
                            value={offlineDaysFilter === null ? '' : String(offlineDaysFilter)}
                            onChange={(e) => setOfflineDaysFilter(e.target.value === '' ? null : Number(e.target.value))}
                            className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {OFFLINE_DAYS_OPTIONS.map(opt => (
                                <option key={String(opt.value)} value={opt.value === null ? '' : String(opt.value)}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Separator */}
                    <div className="hidden sm:block w-px h-6 bg-gray-200" />

                    {/* Cohort Dropdown with Search */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Cohort:</span>
                        <div className="relative" ref={cohortDropdownRef}>
                            <button
                                onClick={() => setCohortDropdownOpen(!cohortDropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
                            >
                                <span className="truncate flex-1 text-left">
                                    {selectedAirQloud === 'all' ? 'All Cohorts' : selectedAirQloud}
                                </span>
                                {selectedAirQloud !== 'all' ? (
                                    <X
                                        className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedAirQloud('all')
                                            clearRoute()
                                        }}
                                    />
                                ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>

                            {cohortDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                    {/* Search Input */}
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-gray-50 border border-gray-200">
                                            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Search cohorts..."
                                                value={cohortSearch}
                                                onChange={(e) => setCohortSearch(e.target.value)}
                                                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
                                                autoFocus
                                            />
                                            {cohortSearch && (
                                                <button onClick={() => setCohortSearch('')}>
                                                    <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Options List */}
                                    <div className="max-h-[240px] overflow-y-auto">
                                        {/* All Cohorts option */}
                                        <button
                                            onClick={() => {
                                                setSelectedAirQloud('all')
                                                clearRoute()
                                                setCohortDropdownOpen(false)
                                                setCohortSearch('')
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between ${selectedAirQloud === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                }`}
                                        >
                                            All Cohorts
                                            {selectedAirQloud === 'all' && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                            )}
                                        </button>

                                        {loadingAirQlouds ? (
                                            <div className="p-3 space-y-2">
                                                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                                            </div>
                                        ) : filteredCohorts.length === 0 ? (
                                            <div className="p-3 text-xs text-gray-400 text-center">No cohorts found</div>
                                        ) : (
                                            filteredCohorts.map((aq: AirQloudBasic) => (
                                                <button
                                                    key={aq.id || aq.name}
                                                    onClick={() => {
                                                        setSelectedAirQloud(aq.name)
                                                        clearRoute()
                                                        setCohortDropdownOpen(false)
                                                        setCohortSearch('')
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between gap-2 ${selectedAirQloud === aq.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                        <span className={`truncate ${selectedAirQloud === aq.name ? 'font-medium' : ''}`}>{aq.name}</span>
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                            <span>{aq.device_count} devices</span>
                                                        </div>
                                                    </div>
                                                    {selectedAirQloud === aq.name && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAP VIEW --- */}
            <div className="flex flex-col gap-4 h-[calc(100vh-16rem)] animate-in fade-in duration-300">
                {/* Map & Route Controls */}
                <div className="flex flex-col gap-4 h-full overflow-hidden">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapIcon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm">
                                {selectedAirQloud === 'all' ? 'All Cohorts' : selectedAirQloud.toUpperCase()}
                            </span>
                            {offlineDaysFilter !== null && (
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    Offline ≥ {offlineDaysFilter}d
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center text-xs border rounded-md px-2 py-1 bg-gray-50">
                                <span className="text-gray-500 mr-2">Home:</span>
                                <span className="font-medium">{homeLocation.name}</span>
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
        </div>
    )
}
