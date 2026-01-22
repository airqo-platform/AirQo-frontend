"use client"

import React from "react"
import { DeviceMaintenanceStats } from "@/types/api.types"
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react"

interface DeviceMaintenanceTableProps {
    data: DeviceMaintenanceStats[]
    loading?: boolean
    sortField: string
    sortOrder: 'asc' | 'desc'
    onSort: (field: string) => void
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    selectedDeviceIds?: string[]
    onSelectionChange?: (ids: string[]) => void
}

export default function DeviceMaintenanceTable({
    data,
    loading,
    sortField,
    sortOrder,
    onSort,
    page,
    pageSize,
    total,
    onPageChange,
    selectedDeviceIds = [],
    onSelectionChange
}: DeviceMaintenanceTableProps) {
    const handleSelectAll = (checked: boolean) => {
        if (!onSelectionChange) return;
        if (checked) {
            // Select all current page items
            const newIds = [...new Set([...selectedDeviceIds, ...data.map(d => d.device_id)])];
            onSelectionChange(newIds);
        } else {
            // Deselect all current page items
            const newIds = selectedDeviceIds.filter(id => !data.some(d => d.device_id === id));
            onSelectionChange(newIds);
        }
    }

    const handleSelectRow = (id: string, checked: boolean) => {
        if (!onSelectionChange) return;
        if (checked) {
            onSelectionChange([...selectedDeviceIds, id]);
        } else {
            onSelectionChange(selectedDeviceIds.filter(d => d !== id));
        }
    }

    const allSelected = data.length > 0 && data.every(d => selectedDeviceIds.includes(d.device_id));

    if (loading) {
        return <div className="p-4 text-center">Loading Device stats...</div>
    }

    if (!data || data.length === 0) {
        return <div className="p-4 text-center text-gray-500">No Device data available.</div>
    }

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
    }

    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={allSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => onSort('device_name')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Device Name</span>
                                    {renderSortIcon('device_name')}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => onSort('airqlouds')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>AirQlouds</span>
                                    {renderSortIcon('airqlouds')}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => onSort('avg_uptime')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Avg Uptime</span>
                                    {renderSortIcon('avg_uptime')}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => onSort('avg_error_margin')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Avg Error Margin</span>
                                    {renderSortIcon('avg_error_margin')}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => onSort('avg_battery')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Avg Battery</span>
                                    {renderSortIcon('avg_battery')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.map((item) => (
                            <tr key={item.device_id} className={`hover:bg-gray-50 ${selectedDeviceIds.includes(item.device_id) ? 'bg-blue-50' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedDeviceIds.includes(item.device_id)}
                                        onChange={(e) => handleSelectRow(item.device_id, e.target.checked)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.device_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.airqlouds.join(", ")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {((item.avg_uptime / 24) * 100).toFixed(1)}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.avg_error_margin.toFixed(2)}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.avg_battery.toFixed(2)}V
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{total > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="font-medium">{Math.min(page * pageSize, total)}</span> of <span className="font-medium">{total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => onPageChange(page - 1)}
                                disabled={page === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {/* Simple Page Indicator */}
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                Page {page} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page >= totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div >
    )
}
