"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Database, FileSpreadsheet, Activity, CheckCircle2, Hash, Calendar, Layers } from "lucide-react"
import type { ParsedDataset, ColumnProfile } from "@/lib/visualise/data-parser"

interface KpiSummaryProps {
  dataset: ParsedDataset | null
  selectedYColumn?: string
  activeFilterCount?: number
}

export function KpiSummary({ dataset, selectedYColumn, activeFilterCount = 0 }: KpiSummaryProps) {
  if (!dataset || dataset.rawRowCount === 0) return null

  const profiles = Object.values(dataset.columnProfiles)
  const numericCols = profiles.filter((p) => p.type === "number")
  const dateCols = profiles.filter((p) => p.type === "date")
  const categoryCols = profiles.filter((p) => p.type === "category")

  // Total cells vs null cells for data completeness score
  const totalCells = dataset.rawRowCount * dataset.columns.length
  const totalNulls = profiles.reduce((sum, p) => sum + p.nullCount, 0)
  const completeness = totalCells > 0 ? (((totalCells - totalNulls) / totalCells) * 100).toFixed(1) : "100"

  // Selected Y-metric profile if present
  const yProfile: ColumnProfile | undefined = selectedYColumn
    ? dataset.columnProfiles[selectedYColumn]
    : numericCols[0]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Dataset Overview */}
      <Card className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {dataset.isSampled ? "Loaded Sample Rows" : "Total Records"}
            </p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">
              {dataset.rawRowCount.toLocaleString()}
            </h4>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 inline" />
              <span className="truncate max-w-[150px]">{dataset.name}</span>
              {dataset.isSampled && dataset.totalFileRows && (
                <span className="text-[10px] text-blue-600 font-mono">
                  (of ~{dataset.totalFileRows.toLocaleString()})
                </span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Database className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Columns Breakdown */}
      <Card className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Detected Columns</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">
              {dataset.columns.length}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-0.5 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                <Hash className="w-3 h-3" /> {numericCols.length}
              </span>
              <span className="inline-flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                <Calendar className="w-3 h-3" /> {dateCols.length}
              </span>
              <span className="inline-flex items-center gap-0.5 text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                <Layers className="w-3 h-3" /> {categoryCols.length}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Layers className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Primary Metric Focus */}
      <Card className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">
              {yProfile ? `Avg ${yProfile.name}` : "Primary Metric"}
            </p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1 truncate">
              {yProfile?.mean !== undefined ? yProfile.mean.toFixed(2) : "—"}
            </h4>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {yProfile?.min !== undefined && yProfile?.max !== undefined
                ? `Min: ${yProfile.min} | Max: ${yProfile.max}`
                : "No numeric values"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Data Quality & Completeness */}
      <Card className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Data Completeness</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{completeness}%</h4>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {activeFilterCount > 0 ? (
                <span className="text-blue-600 font-medium">{activeFilterCount} active filter(s)</span>
              ) : (
                <span>{totalNulls === 0 ? "0 missing values" : `${totalNulls} missing cells`}</span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
