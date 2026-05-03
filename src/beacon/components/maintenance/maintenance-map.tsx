"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MaintenanceMapItem } from "@/types/api.types"
import { calculateDistance, optimizeRoute, findDevicesAlongRoute, calculateCriticalityScore } from "@/utils/map-utils"
import { Coordinates } from "@/utils/routing-utils"
import { getDevicePerformanceData } from "@/services/device-api.service"
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

type DeviceHealth = 'good' | 'moderate' | 'critical' | 'offline';

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

    // Normalize raw `uptime` to a 0-100 percentage. Some upstream sources
    // provide a 0-1 fraction; treat values <= 1 as fractions and scale them.
    const normalizeUptimePct = (uptime: number | null | undefined): number => {
        const n = Number(uptime);
        if (!Number.isFinite(n)) return 0;
        return n <= 1 ? n * 100 : n;
    };

    const getUptimeStatus = (uptimePct: number): DeviceHealth => {
        if (uptimePct === 0) return 'offline';
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
        // If device is offline (uptime = 0), render fully gray regardless of error margin
        if (uptimeStatus === 'offline') {
            let baseSize = Math.max(14, Math.min(48, 16 + (zoom - 7) * 3));
            let size = isSelected ? baseSize * 1.4 : baseSize;
            const selectionRing = isSelected ? 'ring-2 ring-blue-600 ring-offset-2' : '';
            return L.divIcon({
                className: 'custom-div-icon bg-transparent',
                html: `<div style="width: ${size}px; height: ${size}px;" class="bg-gray-400 rounded-full border-[3px] border-gray-300 ${selectionRing} shadow-sm mx-auto transition-all duration-300"></div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
                popupAnchor: [0, -size / 2]
            });
        }

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

    // Auto-fit bounds when data changes (cohort/filter selection) or route mode toggles
    useEffect(() => {
        if (!map.current || !data || data.length === 0) return;

        const hasActiveRoute = routePath && routePath.length > 0;

        const timer = setTimeout(() => {
            if (hasActiveRoute && routeLayerRef.current) {
                // Route is active — fit to route polyline
                map.current?.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
            } else if (markersRef.current.length > 0) {
                // Normal mode — fit to all visible device markers
                const points = data
                    .filter(d => d.latitude != null && d.longitude != null)
                    .map(d => [d.latitude, d.longitude] as [number, number]);

                if (points.length > 0) {
                    const bounds = L.latLngBounds(points);
                    if (bounds.isValid()) {
                        map.current?.fitBounds(bounds, { padding: [50, 50] });
                    }
                }
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [data, isRouteMode, routePath]);

    // ---- Mini-graph (uptime / error margin / correlation) helpers ----
    interface DailyPoint { value: number; timestamp: string }
    interface MiniHistory { uptime: DailyPoint[]; error: DailyPoint[]; correlation: DailyPoint[]; loaded: boolean; loading: boolean; failed?: boolean }
    // Cache keyed by device_id so we only fetch once per popup-open
    const miniHistoryCache = useRef<Record<string, MiniHistory>>({})

    const toNum = (v: any): number | null => {
        if (v == null) return null
        const n = typeof v === 'number' ? v : Number(v)
        return Number.isFinite(n) ? n : null
    }

    // Compute per-day uptime%, error margin (|s1-s2| mean) and correlation (Pearson r of s1 vs s2)
    const computeMiniHistory = (rawPoints: any[]): { uptime: DailyPoint[]; error: DailyPoint[]; correlation: DailyPoint[] } => {
        const buckets: Record<string, { hours: Set<number>; errs: number[]; s1: number[]; s2: number[] }> = {}
        for (const p of rawPoints) {
            if (!p?.datetime) continue
            const dt = new Date(p.datetime)
            if (isNaN(dt.getTime())) continue
            const dayKey = dt.toISOString().slice(0, 10) // YYYY-MM-DD
            if (!buckets[dayKey]) buckets[dayKey] = { hours: new Set(), errs: [], s1: [], s2: [] }
            buckets[dayKey].hours.add(dt.getUTCHours())
            const s1 = toNum(p.s1_pm2_5 ?? p['pm2.5 sensor1'])
            const s2 = toNum(p.s2_pm2_5 ?? p['pm2.5 sensor2'])
            if (s1 != null && s2 != null) {
                buckets[dayKey].errs.push(Math.abs(s1 - s2))
                buckets[dayKey].s1.push(s1)
                buckets[dayKey].s2.push(s2)
            }
        }
        const days = Object.keys(buckets).sort()
        const uptime: DailyPoint[] = []
        const error: DailyPoint[] = []
        const correlation: DailyPoint[] = []
        const pearson = (xs: number[], ys: number[]): number | null => {
            const n = xs.length
            if (n < 2) return null
            const mx = xs.reduce((a, b) => a + b, 0) / n
            const my = ys.reduce((a, b) => a + b, 0) / n
            let num = 0, dx = 0, dy = 0
            for (let i = 0; i < n; i++) {
                const ex = xs[i] - mx
                const ey = ys[i] - my
                num += ex * ey; dx += ex * ex; dy += ey * ey
            }
            const den = Math.sqrt(dx * dy)
            return den === 0 ? null : num / den
        }
        for (const d of days) {
            const b = buckets[d]
            const ts = `${d}T00:00:00.000Z`
            uptime.push({ timestamp: ts, value: (b.hours.size / 24) * 100 })
            if (b.errs.length > 0) error.push({ timestamp: ts, value: b.errs.reduce((a, c) => a + c, 0) / b.errs.length })
            const r = pearson(b.s1, b.s2)
            if (r != null) correlation.push({ timestamp: ts, value: r })
        }
        return { uptime, error, correlation }
    }

    // Render mini bars as inline-styled HTML (Tailwind classes also work since popups
    // are appended to document.body)
    const renderMiniBars = (
        history: DailyPoint[],
        opts: { label: string; barColor: (v: number) => string; format: (v: number) => string; avgFormat: (v: number) => string; normalize: (v: number, all: number[]) => number }
    ): string => {
        if (history.length === 0) return `<div class="text-[10px] text-gray-400">No ${opts.label.toLowerCase()} data</div>`
        const values = history.slice(-14)
        const avg = values.reduce((a, b) => a + b.value, 0) / values.length
        const all = values.map(v => v.value)
        const bars = values.map(v => {
            const ratio = Math.max(0.05, Math.min(1, opts.normalize(v.value, all)))
            const h = Math.max(3, Math.round(ratio * 24))
            const date = new Date(v.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            return `<div title="${date}: ${opts.format(v.value)}" style="height:${h}px" class="w-[3px] rounded-t-sm ${opts.barColor(v.value)}"></div>`
        }).join('')
        return `
            <div>
                <div class="flex items-center justify-between mb-0.5">
                    <span class="text-[10px] font-medium text-gray-600">${opts.label}</span>
                    <span class="text-[10px] font-bold text-gray-700">${opts.avgFormat(avg)}</span>
                </div>
                <div class="flex items-end gap-[2px] h-6">${bars}</div>
            </div>
        `
    }

    const renderMiniGraphsHtml = (h: { uptime: DailyPoint[]; error: DailyPoint[]; correlation: DailyPoint[] }): string => {
        const uptimeHtml = renderMiniBars(h.uptime, {
            label: 'Uptime',
            avgFormat: v => `${v.toFixed(0)}%`,
            format: v => `${v.toFixed(1)}%`,
            barColor: v => v >= 75 ? 'bg-green-500' : v >= 50 ? 'bg-orange-500' : 'bg-red-500',
            normalize: v => v / 100,
        })
        const errorHtml = renderMiniBars(h.error, {
            label: 'Error margin',
            avgFormat: v => `\u00b1${v.toFixed(1)}`,
            format: v => `\u00b1${v.toFixed(2)} \u00b5g/m\u00b3`,
            barColor: v => v <= 3 ? 'bg-green-500' : v <= 5 ? 'bg-yellow-500' : 'bg-red-500',
            normalize: (v, all) => v / Math.max(10, ...all),
        })
        const corrHtml = renderMiniBars(h.correlation, {
            label: 'Correlation',
            avgFormat: v => v.toFixed(2),
            format: v => v.toFixed(3),
            barColor: v => v >= 0.9 ? 'bg-green-500' : v >= 0.75 ? 'bg-yellow-500' : 'bg-red-500',
            normalize: v => Math.max(0, v),
        })
        return `<div class="space-y-1.5 mt-2 pt-2 border-t border-gray-100">${uptimeHtml}${errorHtml}${corrHtml}</div>`
    }

    // Fetch and render mini graphs into a placeholder div (lazy on popup open)
    const loadMiniGraphsForDevice = async (device: MaintenanceMapItem) => {
        const containerId = `mini-graphs-${device.device_id}`
        const container = document.getElementById(containerId)
        if (!container) return
        const cached = miniHistoryCache.current[device.device_id]
        if (cached?.loaded) {
            container.innerHTML = renderMiniGraphsHtml(cached)
            return
        }
        if (cached?.loading) return
        miniHistoryCache.current[device.device_id] = { uptime: [], error: [], correlation: [], loaded: false, loading: true }
        container.innerHTML = `<div class="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">Loading 14-day history\u2026</div>`
        try {
            const end = new Date()
            const start = new Date(end.getTime() - 14 * 86400000)
            const resp = await getDevicePerformanceData({
                start: start.toISOString(),
                end: end.toISOString(),
                deviceNames: [device.device_name],
            })
            const arr = Array.isArray(resp) ? resp : []
            const dev = arr[0] ?? {}
            const points: any[] = Array.isArray(dev.raw_data) && dev.raw_data.length > 0
                ? dev.raw_data
                : Array.isArray(dev.data) ? dev.data : []
            const computed = computeMiniHistory(points)
            miniHistoryCache.current[device.device_id] = { ...computed, loaded: true, loading: false }
            const stillThere = document.getElementById(containerId)
            if (stillThere) stillThere.innerHTML = renderMiniGraphsHtml(computed)
        } catch (err) {
            console.error('[MaintenanceMap] mini-graph fetch failed:', err)
            miniHistoryCache.current[device.device_id] = { uptime: [], error: [], correlation: [], loaded: false, loading: false, failed: true }
            const stillThere = document.getElementById(containerId)
            if (stillThere) stillThere.innerHTML = `<div class="text-[10px] text-red-500 mt-2 pt-2 border-t border-gray-100">Failed to load history</div>`
        }
    }

    // Render Markers
    useEffect(() => {
        if (!map.current || !data) return;
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

            const uptimePct = normalizeUptimePct(device.uptime);
            const uptimeStatus = getUptimeStatus(uptimePct);
            const errorStatus = getErrorStatus(device.error_margin);

            const icon = createMarkerIcon(uptimeStatus, errorStatus, isSelected);

            // Determine text color for popup
            let uptimeColorClass = 'text-green-600';
            if (uptimeStatus === 'moderate') uptimeColorClass = 'text-yellow-600';
            if (uptimeStatus === 'critical') uptimeColorClass = 'text-red-600';
            if (uptimeStatus === 'offline') uptimeColorClass = 'text-gray-400';

            let errorColorClass = 'text-green-600';
            if (errorStatus === 'moderate') errorColorClass = 'text-yellow-600';
            if (errorStatus === 'critical') errorColorClass = 'text-red-600';

            const marker = L.marker([device.latitude, device.longitude], { icon })
                .bindPopup(`
                    <div class="p-2 min-w-[200px]">
                        <div class="flex justify-between items-start mb-2">
                             <h3 class="font-bold text-sm">${device.device_name}</h3>
                        </div>
                        <p class="text-xs text-gray-600 mb-2">${device.cohorts?.length ? device.cohorts.join(', ') : 'No cohorts'}</p>
                        <div class="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div><span class="font-medium">Uptime:</span> <span class="font-bold ${uptimeColorClass}">${uptimePct.toFixed(0)}%</span></div>
                            <div><span class="font-medium">Error:</span> <span class="font-bold ${errorColorClass}">${device.error_margin.toFixed(1)}</span></div>
                        </div>
                        <div class="text-xs text-gray-500 mb-2"><span class="font-medium">Last Post:</span> ${device.last_active ? new Date(device.last_active).toLocaleString() : 'N/A'}</div>
                        <div id="mini-graphs-${device.device_id}"></div>
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
                // Lazy-load 14-day mini graphs (uptime / error margin / correlation)
                loadMiniGraphsForDevice(device);
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
                const uptimePct = normalizeUptimePct(device.uptime);
                const uptimeStatus = getUptimeStatus(uptimePct);
                const errorStatus = getErrorStatus(device.error_margin);

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

        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <Card className="p-3 shadow-lg bg-white/95 backdrop-blur border-slate-200 w-[190px]">
                    <div className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wider">Device Health</div>

                    {/* Uptime — Dot Fill */}
                    <div className="mb-2">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Dot — Uptime</div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-gray-300 flex-shrink-0" />
                                <span className="text-xs text-gray-600">≥ 85% — Good</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-gray-300 flex-shrink-0" />
                                <span className="text-xs text-gray-600">50–84% — Moderate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-gray-300 flex-shrink-0" />
                                <span className="text-xs text-gray-600">&lt; 50% — Critical</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-gray-300 flex-shrink-0" />
                                <span className="text-xs text-gray-600">0% — Offline</span>
                            </div>
                        </div>
                    </div>

                    {/* Error Margin — Ring Color */}
                    <div className="pt-2 border-t border-gray-100">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Ring — Error Margin</div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-green-400 flex-shrink-0" />
                                <span className="text-xs text-gray-600">≤ 10 — Good</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-yellow-400 flex-shrink-0" />
                                <span className="text-xs text-gray-600">11–20 — Moderate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-red-400 flex-shrink-0" />
                                <span className="text-xs text-gray-600">&gt; 20 — Critical</span>
                            </div>
                        </div>
                    </div>

                    {(isRouteMode || routePath) && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 opacity-60 flex-shrink-0" />
                            <span className="text-xs text-purple-600 italic">Suggested Stop</span>
                        </div>
                    )}
                    {routePath && (
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 flex-shrink-0" />
                            <span className="text-xs text-gray-600 italic">Home / Depot</span>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
