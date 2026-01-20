"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MaintenanceMapItem } from "@/types/api.types"
import { calculateDistance, optimizeRoute, findDevicesAlongRoute, calculateCriticalityScore } from "@/utils/map-utils"
import { Coordinates } from "@/utils/routing-utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Map as MapIcon, Navigation, Info, AlertTriangle, CheckCircle, CircleDot } from "lucide-react"

// Fix for default marker icons in Next.js/Leaflet
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MaintenanceMapProps {
    data: MaintenanceMapItem[]
    loading?: boolean
    onDeviceSelect?: (deviceId: string) => void
    onSelectionChange?: (ids: string[]) => void
    selectedDeviceIds?: string[]
    routePath?: MaintenanceMapItem[] // Pre-calculated route path
    homeLocation?: Coordinates & { name?: string } // Start/End location
}

type DeviceHealth = 'good' | 'moderate' | 'critical';

export default function MaintenanceMap({
    data,
    loading,
    onDeviceSelect,
    onSelectionChange,
    selectedDeviceIds = [],
    routePath,
    homeLocation
}: MaintenanceMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<L.Map | null>(null)
    const markersRef = useRef<L.Marker[]>([])
    const routeLayerRef = useRef<L.Polyline | null>(null)
    const homeMarkerRef = useRef<L.Marker | null>(null)
    const suggestionMarkersRef = useRef<L.Marker[]>([])

    // Local state for routing if not controlled fully by parent yet
    const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedDeviceIds)
    const [isRouteMode, setIsRouteMode] = useState(false)
    const [routeStats, setRouteStats] = useState({ distance: 0, stops: 0, criticality: 0 })

    const [suggestions, setSuggestions] = useState<MaintenanceMapItem[]>([])
    const [zoom, setZoom] = useState(7)

    // Sync props to local state if needed (for now assume we might want internal selection for route mode)
    useEffect(() => {
        setLocalSelectedIds(selectedDeviceIds)
    }, [selectedDeviceIds])

    // Helper to determine health

    const getUptimeStatus = (uptimePct: number): DeviceHealth => {
        if (uptimePct >= 85) return 'good';
        if (uptimePct >= 50) return 'moderate';
        return 'critical';
    };

    const getErrorStatus = (errorMargin: number): DeviceHealth => {
        if (errorMargin <= 10) return 'good';
        if (errorMargin <= 20) return 'moderate';
        return 'critical';
    };

    // Create custom icon
    const createMarkerIcon = (uptimeStatus: DeviceHealth, errorStatus: DeviceHealth, isSelected: boolean, isSuggestion: boolean = false) => {
        // Dot Color (Uptime)
        let bgColorClass = 'bg-green-500';
        if (uptimeStatus === 'moderate') bgColorClass = 'bg-yellow-500';
        if (uptimeStatus === 'critical') bgColorClass = 'bg-red-500';

        // Ring Color (Error Margin)
        let borderColorClass = 'border-green-400';
        if (errorStatus === 'moderate') borderColorClass = 'border-yellow-400';
        if (errorStatus === 'critical') borderColorClass = 'border-red-400';

        // Dynamic size based on zoom
        // Base: 16px at zoom 7 (was 12). Increase by 3px per zoom level.
        // Min 14px, Max 48px.
        let baseSize = Math.max(14, Math.min(48, 16 + (zoom - 7) * 3));

        let size = isSelected ? baseSize * 1.4 : baseSize;
        if (isSuggestion) {
            size = baseSize * 0.8;
            bgColorClass += ' opacity-70';
        }

        const selectionRing = isSelected ? 'ring-2 ring-blue-600 ring-offset-2' : '';

        // The "Border" acts as the Ring for Error Margin. 
        // We'll make it thicker (e.g. 3px or 4px) to clearly see the ring color.
        const borderStyle = `border-[3px] ${borderColorClass}`;

        return L.divIcon({
            className: 'custom-div-icon bg-transparent', // Important to remove default styles
            html: `<div style="width: ${size}px; height: ${size}px;" class="${bgColorClass} rounded-full ${borderStyle} ${selectionRing} shadow-sm mx-auto transition-all duration-300"></div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
        });
    }

    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current) return
        if (!map.current) {
            map.current = L.map(mapContainer.current).setView([0.3476, 32.5825], 7)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map.current)

            map.current.on('zoomend', () => {
                setZoom(Math.round(map.current!.getZoom()));
            })
        }
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        }
    }, [])

    // Fit bounds on data change or route mode toggle
    // Separated from render effect to prevent auto-zoom reset on user zoom
    useEffect(() => {
        if (!map.current || !data) return;

        // Use a small timeout to allow markers/route to render
        const timer = setTimeout(() => {
            if (markersRef.current.length > 0 && !isRouteMode && !routePath) {
                // When in normal mode, fit to all devices
                const bounds = L.latLngBounds(data
                    .filter(d => d.latitude != null && d.longitude != null)
                    .map(d => [d.latitude, d.longitude] as [number, number])
                );
                if (bounds.isValid()) {
                    map.current?.fitBounds(bounds, { padding: [50, 50] });
                }
            } else if ((isRouteMode || routePath) && routeLayerRef.current) {
                // When in route mode, fit to route
                map.current?.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [data, isRouteMode, routePath]);

    // Render Markers
    useEffect(() => {
        if (!map.current || !data) return;

        // Clear layers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        suggestionMarkersRef.current.forEach(m => m.remove());
        suggestionMarkersRef.current = [];
        if (routeLayerRef.current) routeLayerRef.current.remove();
        if (homeMarkerRef.current) {
            homeMarkerRef.current.remove();
            homeMarkerRef.current = null;
        }

        // 1. Plot Main Devices
        const bounds = L.latLngBounds([]);

        data.forEach(device => {
            if (device.latitude == null || device.longitude == null) return;

            const isSelected = localSelectedIds.includes(device.device_id);

            const uptimePct = (device.avg_uptime / 24) * 100;
            const uptimeStatus = getUptimeStatus(uptimePct);
            const errorStatus = getErrorStatus(device.avg_error_margin);

            const icon = createMarkerIcon(uptimeStatus, errorStatus, isSelected);

            // Determine text color for popup
            let uptimeColorClass = 'text-green-600';
            if (uptimeStatus === 'moderate') uptimeColorClass = 'text-yellow-600';
            if (uptimeStatus === 'critical') uptimeColorClass = 'text-red-600';

            let errorColorClass = 'text-green-600';
            if (errorStatus === 'moderate') errorColorClass = 'text-yellow-600';
            if (errorStatus === 'critical') errorColorClass = 'text-red-600';

            const marker = L.marker([device.latitude, device.longitude], { icon })
                .bindPopup(`
                    <div class="p-2 min-w-[200px]">
                        <div class="flex justify-between items-start mb-2">
                             <h3 class="font-bold text-sm">${device.device_name}</h3>
                        </div>
                        <p class="text-xs text-gray-600 mb-2">${device.site ? device.site.name : 'Unknown Site'}</p>
                        <div class="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div><span class="font-medium">Uptime:</span> <span class="font-bold ${uptimeColorClass}">${((device.avg_uptime / 24) * 100).toFixed(0)}%</span></div>
                            <div><span class="font-medium">Error:</span> <span class="font-bold ${errorColorClass}">${device.avg_error_margin.toFixed(1)}%</span></div>
                        </div>
                         <button 
                            id="btn-select-${device.device_id}" 
                            class="w-full text-xs bg-blue-50 text-blue-600 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                            ${isSelected ? 'Deselect from Route' : 'Add to Route'}
                        </button>
                    </div>
                `);

            marker.on('popupopen', () => {
                const btn = document.getElementById(`btn-select-${device.device_id}`);
                if (btn) {
                    btn.onclick = () => {
                        handleToggleSelect(device.device_id);
                        marker.closePopup();
                    };
                }
            });

            marker.addTo(map.current!);
            markersRef.current.push(marker);
            bounds.extend([device.latitude, device.longitude]);
        });

        // 2. Handle Route Logic
        if (isRouteMode && localSelectedIds.length > 1) {
            const selectedDevices = data.filter(d => localSelectedIds.includes(d.device_id));

            // Optimize Route
            const optimizedRoute = optimizeRoute(selectedDevices, {
                weightDistance: 0.6,
                weightCriticality: 0.3,
                weightAirQloud: 0.1
            });

            // Draw Route
            const latlngs = optimizedRoute.map(d => [d.latitude, d.longitude] as [number, number]);
            routeLayerRef.current = L.polyline(latlngs, {
                color: '#3b82f6', // Blue-500
                weight: 3,
                opacity: 0.7,
                dashArray: '5, 10'
            }).addTo(map.current!);

            // Calculate Stats
            let dist = 0;
            let crit = 0;
            for (let i = 0; i < optimizedRoute.length - 1; i++) {
                dist += calculateDistance(
                    optimizedRoute[i].latitude, optimizedRoute[i].longitude,
                    optimizedRoute[i + 1].latitude, optimizedRoute[i + 1].longitude
                );
            }
            optimizedRoute.forEach(d => crit += calculateCriticalityScore(d));
            setRouteStats({
                distance: Math.round(dist),
                stops: optimizedRoute.length,
                criticality: Math.round(crit / optimizedRoute.length) // avg
            });

            // Find Opportunities
            const opps = findDevicesAlongRoute(optimizedRoute, data, 10); // 10km buffer
            setSuggestions(opps);

            // Plot Suggestions
            opps.forEach(device => {
                const uptimePct = (device.avg_uptime / 24) * 100;
                const uptimeStatus = getUptimeStatus(uptimePct);
                const errorStatus = getErrorStatus(device.avg_error_margin);

                const icon = createMarkerIcon(uptimeStatus, errorStatus, false, true); // true = isSuggestion
                const marker = L.marker([device.latitude, device.longitude], { icon, opacity: 0.8 })
                    .bindPopup(`
                        <div class="p-2 min-w-[180px]">
                            <h3 class="font-bold text-xs text-purple-600">Suggested Stop! (+${calculateCriticalityScore(device).toFixed(0)} score)</h3>
                            <div class="font-medium text-sm mt-1 mb-1">${device.device_name}</div>
                            <div class="text-xs text-gray-500 mb-2">This device is along your route and needs attention.</div>
                            <button 
                                id="btn-suggest-${device.device_id}" 
                                class="w-full text-xs bg-purple-50 text-purple-600 py-1 rounded hover:bg-purple-100 transition-colors"
                            >
                                Add to Route
                            </button>
                        </div>
                    `);
                marker.on('popupopen', () => {
                    const btn = document.getElementById(`btn-suggest-${device.device_id}`);
                    if (btn) btn.onclick = () => { handleToggleSelect(device.device_id); marker.closePopup(); };
                });
                marker.addTo(map.current!);
                suggestionMarkersRef.current.push(marker);
            });

        } else if (routePath && routePath.length > 0) {
            // EXTERNAL ROUTE MODE (e.g. from RoutingPage)

            // 1. Plot Home Marker
            if (homeLocation) {
                const homeIcon = L.divIcon({
                    className: 'bg-transparent',
                    html: `<div class="w-8 h-8 bg-slate-800 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                           </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });
                homeMarkerRef.current = L.marker([homeLocation.latitude, homeLocation.longitude], { icon: homeIcon })
                    .bindPopup(homeLocation.name || "Home Location")
                    .addTo(map.current!);
            }

            // 2. Draw Route Polyline
            // Prepend Home and Append Home to latlngs
            const latlngs: [number, number][] = [];
            if (homeLocation) latlngs.push([homeLocation.latitude, homeLocation.longitude]);

            routePath.forEach(d => {
                if (d.latitude != null && d.longitude != null) latlngs.push([d.latitude, d.longitude]);
            });

            if (homeLocation) latlngs.push([homeLocation.latitude, homeLocation.longitude]);

            routeLayerRef.current = L.polyline(latlngs, {
                color: '#2563eb', // Blue-600
                weight: 4,
                opacity: 0.8,
                lineCap: 'round'
            }).addTo(map.current!);

            // NOTE: In this mode, we assume the route is already optimized and fixed. 
            // We calculate stats for display based on the path.
            let dist = 0;
            // Iterate through the full path (including Home -> First Device and Last Device -> Home)
            for (let i = 0; i < latlngs.length - 1; i++) {
                dist += calculateDistance(
                    latlngs[i][0], latlngs[i][1],
                    latlngs[i + 1][0], latlngs[i + 1][1]
                );
            }

            let crit = 0;
            routePath.forEach(d => crit += calculateCriticalityScore(d));

            setRouteStats({
                distance: Math.round(dist),
                stops: routePath.length,
                criticality: routePath.length > 0 ? Math.round(crit / routePath.length) : 0
            });


        } else {
            // Reset stats if not enough points
            setRouteStats({ distance: 0, stops: localSelectedIds.length, criticality: 0 });
            setSuggestions([]);
        }

    }, [data, localSelectedIds, isRouteMode, zoom, routePath, homeLocation]);


    const handleToggleSelect = (id: string) => {
        let newIds;
        if (localSelectedIds.includes(id)) {
            newIds = localSelectedIds.filter(d => d !== id);
        } else {
            newIds = [...localSelectedIds, id];
        }
        setLocalSelectedIds(newIds);
        if (onDeviceSelect) onDeviceSelect(id); // optional propagation

        // Also propagate selection change
        if (onSelectionChange) onSelectionChange(newIds);
    }

    const clearSelection = () => {
        setLocalSelectedIds([]);
        if (onSelectionChange) onSelectionChange([]);
    }

    const handleSelectAllVisible = () => {
        if (data.length > 50 && !confirm(`Create route for all ${data.length} visible devices? This might be slow.`)) {
            return;
        }
        const ids = data.map(d => d.device_id);
        setLocalSelectedIds(ids);
        if (!isRouteMode) setIsRouteMode(true);

        // Propagate to parent
        if (onSelectionChange) {
            onSelectionChange(ids);
        }
    }


    return (
        <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100 group">
            <div ref={mapContainer} className="absolute inset-0 z-0" />

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <span className="text-gray-900 font-medium animate-pulse">Loading Map Data...</span>
                </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 transition-transform duration-200">
                <Card className="p-2 shadow-lg bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-slate-200">
                    <div className="flex flex-col gap-2">
                        {!routePath && (
                            <Button
                                variant={isRouteMode ? "default" : "outline"}
                                size="sm"
                                className={`w-full justify-start ${isRouteMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                onClick={() => setIsRouteMode(!isRouteMode)}
                            >
                                <Navigation className="w-4 h-4 mr-2" />
                                {isRouteMode ? 'Route Mode Active' : 'Start Route Planning'}
                            </Button>
                        )}

                        {(isRouteMode || routePath) && (
                            <div className="flex flex-col gap-2 mt-2 animate-in fade-in zoom-in-95 duration-200 p-2 bg-slate-50 rounded-md">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Route Stats</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                                        <div className="text-xs text-gray-400">Distance</div>
                                        <div className="text-sm font-bold text-gray-700">{routeStats.distance} km</div>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                                        <div className="text-xs text-gray-400">Stops</div>
                                        <div className="text-sm font-bold text-gray-700">{routeStats.stops}</div>
                                    </div>
                                    <div className="col-span-2 bg-white p-2 rounded border border-gray-100 shadow-sm">
                                        <div className="text-xs text-gray-400">Avg. Criticality</div>
                                        <div className="text-sm font-bold text-gray-700 flex items-center">
                                            {routeStats.criticality} / 100
                                            {routeStats.criticality > 50 && <AlertTriangle className="w-3 h-3 text-red-500 ml-2" />}
                                        </div>
                                    </div>
                                </div>

                                {suggestions.length > 0 && (
                                    <div className="mt-1">
                                        <div className="text-xs text-purple-600 font-medium flex items-center">
                                            <CircleDot className="w-3 h-3 mr-1" />
                                            {suggestions.length} Suggested Stops
                                        </div>
                                    </div>
                                )}

                                {!routePath && (
                                    <div className="flex gap-1 mt-1">
                                        <Button variant="ghost" size="sm" onClick={clearSelection} className="flex-1 h-6 px-2 text-xs text-gray-500">
                                            Clear
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Legend */}
                <Card className="p-3 shadow-lg bg-white/95 backdrop-blur border-slate-200 w-[180px]">
                    <div className="text-xs font-semibold mb-2 text-gray-500">Device Health</div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-400" />
                            <span className="text-xs text-gray-600">Good (Both)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-green-400" />
                            <span className="text-xs text-gray-600">Mod. Uptime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-red-400" />
                            <span className="text-xs text-gray-600">Crit. Error</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                            Dot = Uptime | Ring = Error
                        </div>
                        {(isRouteMode || routePath) && (
                            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-100">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 opacity-60" />
                                <span className="text-xs text-purple-600 italic">Suggestion</span>
                            </div>
                        )}
                        {routePath && (
                            <div className="flex items-center gap-2 mt-1 pt-1 border-gray-100">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                                <span className="text-xs text-gray-600 italic">Home / Depot</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
