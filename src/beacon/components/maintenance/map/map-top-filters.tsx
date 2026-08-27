"use client"

import React, { useRef, useState, useEffect } from "react"
import { GridAdminLevel, SyncedGrid } from "@/types/api.types"
import { AirQloudBasic } from "@/services/airqloud.service"
import {
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  Calendar,
  Filter,
  Layers,
  Radio,
  SlidersHorizontal,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const DAYS_OPTIONS = [7, 14, 30, 60]
const OFFLINE_DAYS_OPTIONS = [
  { label: "All Devices", value: null },
  { label: "Offline ≥ 1d", value: 1 },
  { label: "Offline ≥ 3d", value: 3 },
  { label: "Offline ≥ 7d", value: 7 },
  { label: "Offline ≥ 14d", value: 14 },
  { label: "Offline ≥ 30d", value: 30 },
]

const UPTIME_OPTIONS = [
  { label: "All Uptime", value: "all" },
  { label: "Good (≥85%)", value: "good" },
  { label: "Moderate (50–85%)", value: "moderate" },
  { label: "Critical (<50%)", value: "critical" },
  { label: "Offline (0%)", value: "offline" },
]

const ERROR_MARGIN_OPTIONS = [
  { label: "All Error Margin", value: "all" },
  { label: "Good (≤10)", value: "good" },
  { label: "Moderate (10–20)", value: "moderate" },
  { label: "Critical (>20)", value: "critical" },
]

const GRID_ADMIN_LEVEL_OPTIONS: { label: string; value: GridAdminLevel }[] = [
  { label: "Municipality", value: "Municipality" },
  { label: "county", value: "county" },
  { label: "division", value: "division" },
  { label: "city", value: "city" },
  { label: "country", value: "country" },
  { label: "state", value: "state" },
  { label: "metropolitanmunicipality", value: "metropolitanmunicipality" },
  { label: "province", value: "province" },
  { label: "region", value: "region" },
  { label: "district", value: "district" },
]

const AVAILABLE_TAGS = ["hardware", "duplicate", "organizational", "inlab", "misc"]

interface MapTopFiltersProps {
  selectedDays: number
  onDaysChange: (days: number) => void
  offlineDaysFilter: number | null
  onOfflineDaysChange: (days: number | null) => void
  uptimeFilter: "all" | "good" | "moderate" | "critical" | "offline"
  onUptimeChange: (val: "all" | "good" | "moderate" | "critical" | "offline") => void
  errorMarginFilter: "all" | "good" | "moderate" | "critical"
  onErrorMarginChange: (val: "all" | "good" | "moderate" | "critical") => void
  selectedCohort: string
  onCohortChange: (cohort: string) => void
  cohorts: AirQloudBasic[]
  loadingCohorts?: boolean
  cohortSearch: string
  onCohortSearchChange: (q: string) => void
  selectedGrid: string
  onGridChange: (grid: string) => void
  grids: SyncedGrid[]
  loadingGrids?: boolean
  gridSearch: string
  onGridSearchChange: (q: string) => void
  gridAdminLevelFilter: "all" | GridAdminLevel
  onGridAdminLevelChange: (val: "all" | GridAdminLevel) => void
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClearTags: () => void
  coverageFilter: "all" | "inside_radius" | "outside_radius"
  onCoverageFilterChange: (val: "all" | "inside_radius" | "outside_radius") => void
  totalCount?: number
  filteredCount?: number
  hasGateways?: boolean
  showLoRaWAN?: boolean
  coveragePercentage?: number
  className?: string
}

export const MapTopFilters: React.FC<MapTopFiltersProps> = ({
  selectedDays,
  onDaysChange,
  offlineDaysFilter,
  onOfflineDaysChange,
  uptimeFilter,
  onUptimeChange,
  errorMarginFilter,
  onErrorMarginChange,
  selectedCohort,
  onCohortChange,
  cohorts,
  loadingCohorts = false,
  cohortSearch,
  onCohortSearchChange,
  selectedGrid,
  onGridChange,
  grids,
  loadingGrids = false,
  gridSearch,
  onGridSearchChange,
  gridAdminLevelFilter,
  onGridAdminLevelChange,
  selectedTags,
  onToggleTag,
  onClearTags,
  coverageFilter,
  onCoverageFilterChange,
  totalCount,
  filteredCount,
  hasGateways = false,
  showLoRaWAN = false,
  coveragePercentage = 0,
  className = "",
}) => {
  const [cohortOpen, setCohortOpen] = useState(false)
  const [gridOpen, setGridOpen] = useState(false)
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false)

  const cohortDropdownRef = useRef<HTMLDivElement>(null)
  const gridDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cohortDropdownRef.current && !cohortDropdownRef.current.contains(e.target as Node)) {
        setCohortOpen(false)
      }
      if (gridDropdownRef.current && !gridDropdownRef.current.contains(e.target as Node)) {
        setGridOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedGridItem = grids.find((item) => item.name === selectedGrid)
  const selectedGridLabel =
    selectedGrid === "all"
      ? "All Grids"
      : selectedGridItem?.long_name || selectedGridItem?.name || selectedGrid

  const filteredCohorts = React.useMemo(() => {
    if (!cohorts.length) return []
    if (!cohortSearch.trim()) return cohorts
    const q = cohortSearch.toLowerCase()
    return cohorts.filter((aq) => aq.name.toLowerCase().includes(q))
  }, [cohorts, cohortSearch])

  return (
    <div
      className={`flex items-center gap-1.5 flex-wrap min-w-0 ${className}`}
    >
      {/* Period Dropdown */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full px-3 py-1.5 border border-gray-200/80 dark:border-gray-700 shadow-md flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-200">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        <select
          value={selectedDays}
          onChange={(e) => onDaysChange(Number(e.target.value))}
          className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-pointer pr-1"
        >
          {DAYS_OPTIONS.map((d) => (
            <option key={d} value={d} className="bg-white text-gray-800">
              {d} Days
            </option>
          ))}
        </select>
      </div>

      {/* Offline Status Dropdown */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full px-3 py-1.5 border border-gray-200/80 dark:border-gray-700 shadow-md flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-200">
        <select
          value={offlineDaysFilter === null ? "" : String(offlineDaysFilter)}
          onChange={(e) =>
            onOfflineDaysChange(e.target.value === "" ? null : Number(e.target.value))
          }
          className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
        >
          {OFFLINE_DAYS_OPTIONS.map((opt) => (
            <option
              key={String(opt.value)}
              value={opt.value === null ? "" : String(opt.value)}
              className="bg-white text-gray-800"
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cohort Selector (Searchable Dropdown) */}
      <div className="relative" ref={cohortDropdownRef}>
        <button
          onClick={() => setCohortOpen(!cohortOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border rounded-full text-xs font-semibold shadow-md transition-all ${
            selectedCohort !== "all"
              ? "border-blue-500 text-blue-700 bg-blue-50/90"
              : "border-gray-200/80 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
          }`}
        >
          <span className="truncate max-w-[120px]">
            {selectedCohort === "all" ? "All Cohorts" : selectedCohort}
          </span>
          {selectedCohort === "all" ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <X
              className="w-3.5 h-3.5 text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation()
                onCohortChange("all")
              }}
            />
          )}
        </button>

        {cohortOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-[1100] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-md">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cohorts..."
                  value={cohortSearch}
                  onChange={(e) => onCohortSearchChange(e.target.value)}
                  className="bg-transparent text-xs text-gray-700 dark:text-gray-200 outline-none w-full"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  onCohortChange("all")
                  setCohortOpen(false)
                  onCohortSearchChange("")
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                  selectedCohort === "all"
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                }`}
              >
                All Cohorts
                {selectedCohort === "all" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              {loadingCohorts ? (
                <div className="p-3 text-center text-xs text-gray-400">Loading...</div>
              ) : (
                filteredCohorts.map((aq) => (
                  <button
                    key={aq.id || aq.name}
                    onClick={() => {
                      onCohortChange(aq.name)
                      setCohortOpen(false)
                      onCohortSearchChange("")
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                      selectedCohort === aq.name
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="truncate">
                      <div>{aq.name}</div>
                      <span className="text-[10px] text-gray-400">{aq.device_count} devices</span>
                    </div>
                    {selectedCohort === aq.name && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid Selector (Searchable Dropdown) */}
      <div className="relative" ref={gridDropdownRef}>
        <button
          onClick={() => setGridOpen(!gridOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border rounded-full text-xs font-semibold shadow-md transition-all ${
            selectedGrid !== "all"
              ? "border-blue-500 text-blue-700 bg-blue-50/90"
              : "border-gray-200/80 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
          }`}
        >
          <span className="truncate max-w-[120px]">{selectedGridLabel}</span>
          {selectedGrid === "all" ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <X
              className="w-3.5 h-3.5 text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation()
                onGridChange("all")
              }}
            />
          )}
        </button>

        {gridOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-[1100] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 space-y-1.5">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-md">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search grids..."
                  value={gridSearch}
                  onChange={(e) => onGridSearchChange(e.target.value)}
                  className="bg-transparent text-xs text-gray-700 dark:text-gray-200 outline-none w-full"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400">Level:</span>
                <select
                  value={gridAdminLevelFilter}
                  onChange={(e) => onGridAdminLevelChange(e.target.value as "all" | GridAdminLevel)}
                  className="px-1.5 py-0.5 rounded text-[10px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                >
                  <option value="all">All</option>
                  {GRID_ADMIN_LEVEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  onGridChange("all")
                  setGridOpen(false)
                  onGridSearchChange("")
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                  selectedGrid === "all"
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                }`}
              >
                All Grids
                {selectedGrid === "all" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              {loadingGrids ? (
                <div className="p-3 text-center text-xs text-gray-400">Loading...</div>
              ) : (
                grids.map((g) => (
                  <button
                    key={g.grid_id || g.name}
                    onClick={() => {
                      onGridChange(g.name)
                      setGridOpen(false)
                      onGridSearchChange("")
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                      selectedGrid === g.name
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="truncate">
                      <div>{g.long_name || g.name}</div>
                      <span className="text-[10px] text-gray-400">{g.admin_level}</span>
                    </div>
                    {selectedGrid === g.name && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* LoRaWAN In/Out Radius Filter Toggle (if LoRaWAN is enabled and gateways exist) */}
      {showLoRaWAN && hasGateways && (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full p-0.5 border border-indigo-200/80 dark:border-indigo-800 shadow-md flex items-center text-xs">
          <button
            onClick={() => onCoverageFilterChange("all")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              coverageFilter === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All LoRa
          </button>
          <button
            onClick={() => onCoverageFilterChange("inside_radius")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              coverageFilter === "inside_radius"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 hover:text-emerald-800"
            }`}
          >
            In Radius
          </button>
          <button
            onClick={() => onCoverageFilterChange("outside_radius")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              coverageFilter === "outside_radius"
                ? "bg-red-600 text-white shadow-xs"
                : "text-red-700 hover:text-red-800"
            }`}
          >
            Blindspots
          </button>
        </div>
      )}

      {/* Advanced Filters Button (Uptime, Error, Tags) */}
      <div className="relative">
        <button
          onClick={() => setFiltersDrawerOpen(!filtersDrawerOpen)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all ${
            uptimeFilter !== "all" || errorMarginFilter !== "all" || selectedTags.length > 0
              ? "bg-blue-600 text-white"
              : "bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-gray-200 hover:bg-gray-50 border border-gray-200/80 dark:border-gray-700"
          }`}
          title="More Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {(uptimeFilter !== "all" || errorMarginFilter !== "all" || selectedTags.length > 0) && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        {/* Advanced Filters Popover/Drawer */}
        {filtersDrawerOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-3.5 z-[1100] space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                Advanced Filters
              </span>
              <button
                onClick={() => setFiltersDrawerOpen(false)}
                className="p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Uptime Filter */}
            <div>
              <span className="text-[11px] font-medium text-gray-500 block mb-1">Device Uptime:</span>
              <select
                value={uptimeFilter}
                onChange={(e) => onUptimeChange(e.target.value as typeof uptimeFilter)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                {UPTIME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Margin Filter */}
            <div>
              <span className="text-[11px] font-medium text-gray-500 block mb-1">Error Margin:</span>
              <select
                value={errorMarginFilter}
                onChange={(e) => onErrorMarginChange(e.target.value as typeof errorMarginFilter)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                {ERROR_MARGIN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-gray-500">Tags:</span>
                {selectedTags.length > 0 && (
                  <button onClick={onClearTags} className="text-[10px] text-blue-600 underline">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {AVAILABLE_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer text-[10px] py-0.5 ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => onToggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
