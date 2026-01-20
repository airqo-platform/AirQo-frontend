"use client"

import React, { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Filter, Calendar, SlidersHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { getAirQloudStats, getDeviceStatsMaintenance } from "@/services/device-api.service"
import MaintenanceBarChart from "./maintenance-bar-chart"

interface MaintenanceGraphCardProps {
    type: 'airqloud' | 'device'
    metric: 'uptime' | 'error_margin'
    title: string
    color: string
    globalFilters?: {
        country?: string
        search?: string
    }
}

export default function MaintenanceGraphCard({
    type,
    metric,
    title,
    color,
    globalFilters
}: MaintenanceGraphCardProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)

    // Card-specific filters
    const [period, setPeriod] = useState(14)
    const [min, setMin] = useState(0)
    const [max, setMax] = useState(metric === 'uptime' ? 24 : 100)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('')

    // Debounce helper for range inputs
    const [tempMin, setTempMin] = useState(min)
    const [tempMax, setTempMax] = useState(max)

    const pageSize = 20

    const fetchData = async () => {
        setLoading(true)
        try {
            const filters = {
                uptime: metric === 'uptime' ? { min, max } : { min: 0, max: 24 },
                error_margin: metric === 'error_margin' ? { min, max } : { min: 0, max: 100 },
                country: globalFilters?.country || "",
                search: globalFilters?.search || ""
            }

            // If we are filtering by a specific metric and not the other, we should probably 
            // let the other metric capture everything, hence the defaults above.

            const sort = sortOrder ? { field: metric, order: sortOrder as 'asc' | 'desc' } : undefined
            const body = {
                period_days: period,
                filters,
                sort,
                page,
                page_size: pageSize
            }

            let response
            if (type === 'airqloud') {
                response = await getAirQloudStats(body)
            } else {
                response = await getDeviceStatsMaintenance(body)
            }

            setData(response.items)
            setTotal(response.total)
        } catch (error) {
            console.error(`Failed to fetch ${title} data`, error)
        } finally {
            setLoading(false)
        }
    }

    // Effect to trigger fetch on any filter change
    useEffect(() => {
        fetchData()
    }, [page, period, min, max, sortOrder, globalFilters])

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1)
    }

    const handleNextPage = () => {
        if (page * pageSize < total) setPage(page + 1)
    }

    const handleRangeBlur = () => {
        setMin(Number(tempMin))
        setMax(Number(tempMax))
        setPage(1) // Reset to page 1 on filter change
    }

    const handleEnterKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRangeBlur()
    }

    // Determine keys for charting
    const xKey = type === 'airqloud' ? 'name' : 'device_name'
    const yKey = metric === 'uptime' ? 'avg_uptime' : 'avg_error_margin'
    const unit = '%'

    // Transform data for display (Uptime: 0-24h -> 0-100%)
    const chartData = data.map(item => ({
        ...item,
        avg_uptime: metric === 'uptime' ? Number(((item.avg_uptime / 24) * 100).toFixed(1)) : item.avg_uptime
    }))

    // Color logic matching Analytics Table
    const getBarColor = (value: number) => {
        if (metric === 'uptime') {
            // Uptime % logic
            if (value >= 75) return "#22c55e" // green-500
            if (value >= 50) return "#f97316" // orange-500
            return "#ef4444" // red-500
        } else {
            // Error Margin logic
            if (value <= 3) return "#22c55e" // green-500
            if (value <= 5) return "#eab308" // yellow-500 (using yellow for error as per badge, or orange if preferred) - Table used yellow-600 text. Use yellow-500 for bar.
            return "#ef4444" // red-500
        }
    }

    const router = useRouter()

    const handleBarClick = (entry: any) => {
        if (type === 'airqloud' && entry.id) {
            router.push(`/dashboard/analytics/${entry.id}`)
        } else if (type === 'device' && entry.device_id) {
            router.push(`/dashboard/devices/${entry.device_id}`)
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-md font-semibold text-gray-800">{title}</h3>

                {/* Sort Control */}
                <select
                    className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 pl-2 pr-6"
                    value={sortOrder}
                    onChange={(e) => {
                        setSortOrder(e.target.value as 'asc' | 'desc' | '')
                        setPage(1)
                    }}
                >
                    <option value="">Default</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-600 bg-gray-50 p-2 rounded-md">

                {/* Period */}
                <div className="flex items-center space-x-1">
                    <div className="flex items-center text-gray-500">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        <span>Days:</span>
                    </div>
                    <input
                        type="number"
                        className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center"
                        value={period}
                        onChange={(e) => setPeriod(Number(e.target.value))}
                        min={1}
                    />
                </div>

                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                {/* Range Filter */}
                <div className="flex items-center space-x-1">
                    <div className="flex items-center text-gray-500">
                        <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                        <span>Range:</span>
                    </div>
                    <input
                        type="number"
                        className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center"
                        value={tempMin}
                        onChange={(e) => setTempMin(Number(e.target.value))}
                        onBlur={handleRangeBlur}
                        onKeyDown={handleEnterKey}
                    />
                    <span>-</span>
                    <input
                        type="number"
                        className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center"
                        value={tempMax}
                        onChange={(e) => setTempMax(Number(e.target.value))}
                        onBlur={handleRangeBlur}
                        onKeyDown={handleEnterKey}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-[300px] relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
                <MaintenanceBarChart
                    data={chartData}
                    xKey={xKey}
                    yKey={yKey}
                    color={color}
                    title={title}
                    unit={unit}

                    // title="" // Hide title in internal chart since card has it
                    getColor={getBarColor}
                    onBarClick={handleBarClick}
                />
            </div>

            {/* Pagination Footer */}
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`p-1 rounded-full ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ChevronLeft size={20} />
                </button>

                <span className="text-xs text-gray-500">
                    Page {page} of {Math.ceil(total / pageSize) || 1}
                </span>

                <button
                    onClick={handleNextPage}
                    disabled={page * pageSize >= total}
                    className={`p-1 rounded-full ${page * pageSize >= total ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

        </div>
    )
}
