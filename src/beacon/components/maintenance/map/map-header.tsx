"use client"

import React from "react"
import { Search, X, PanelLeftClose } from "lucide-react"

interface MapHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  totalCount?: number
  filteredCount?: number
  placeholder?: string
  onCollapse?: () => void
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  totalCount,
  filteredCount,
  placeholder = "Search devices, sites, cohorts, grids...",
  onCollapse,
}) => {
  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex-none bg-white dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Maintenance Map
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            Monitor device health, coverage, and routes.
          </p>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        {isSearching && (
          <button
            onClick={onClearSearch}
            className="absolute right-2.5 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>
            Results for &ldquo;<span className="font-semibold text-gray-700 dark:text-gray-300">{searchQuery}</span>&rdquo;
          </span>
          {typeof filteredCount === "number" && (
            <span className="font-medium bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">
              {filteredCount} {filteredCount === 1 ? "device" : "devices"}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
