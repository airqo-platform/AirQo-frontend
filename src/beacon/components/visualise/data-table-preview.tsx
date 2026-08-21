"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Hash,
  Calendar,
  Layers,
  CheckCircle2,
  Info,
  FileSpreadsheet,
  FileText,
  ArrowUpDown,
} from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import type { ParsedDataset, ColumnProfile } from "@/lib/visualise/data-parser"

interface DataTablePreviewProps {
  dataset: ParsedDataset
  records?: Record<string, any>[]
}

export function DataTablePreview({ dataset, records }: DataTablePreviewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedColumnStats, setSelectedColumnStats] = useState<ColumnProfile | null>(null)

  const columns = dataset.columns
  const profiles = dataset.columnProfiles
  const baseData = records || dataset.data

  // Filter & sort data
  const filteredData = useMemo(() => {
    let result = baseData

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col]
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        })
      )
    }

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const valA = a[sortColumn]
        const valB = b[sortColumn]

        if (valA === null || valA === undefined) return 1
        if (valB === null || valB === undefined) return -1

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA
        }

        const strA = String(valA).toLowerCase()
        const strB = String(valB).toLowerCase()
        return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA)
      })
    }

    return result
  }, [baseData, searchQuery, sortColumn, sortDirection, columns])

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, page, pageSize])

  // Handle Sort
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else {
        setSortColumn(null)
        setSortDirection("asc")
      }
    } else {
      setSortColumn(col)
      setSortDirection("asc")
    }
  }

  // Export to CSV (with formula injection sanitization)
  const handleExportCSV = () => {
    try {
      const escapeFormula = (val: any) => {
        if (typeof val === "string" && /^[=+\-@\t\r]/.test(val)) {
          return `'${val}`
        }
        return val ?? ""
      }

      const headers = columns.map((col) => escapeFormula(col))
      const rows = filteredData.map((row) =>
        columns.map((col) => escapeFormula(row[col]))
      )
      const aoa = [headers, ...rows]
      const worksheet = XLSX.utils.aoa_to_sheet(aoa)
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet)
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${dataset.name}_export_${Date.now()}.csv`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success("Dataset exported to CSV.")
    } catch (err) {
      toast.error("Failed to export CSV.")
    }
  }

  // Export to Excel XLSX
  const handleExportExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
      XLSX.writeFile(workbook, `${dataset.name}_export_${Date.now()}.xlsx`)
      toast.success("Dataset exported to Excel.")
    } catch (err) {
      toast.error("Failed to export Excel.")
    }
  }

  const getColumnIcon = (type?: string) => {
    if (type === "number") return <Hash className="w-3 h-3 text-blue-500" />
    if (type === "date") return <Calendar className="w-3 h-3 text-amber-500" />
    return <Layers className="w-3 h-3 text-purple-500" />
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-3 pt-5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            Data Table Preview
            <Badge variant="outline" className="font-mono text-xs font-normal text-slate-500">
              {filteredData.length.toLocaleString()} rows
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Click on any column header to inspect its statistics and distribution.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search data..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="h-8 text-xs pl-8 pr-3 bg-slate-50 border-slate-200"
            />
          </div>

          {/* Export CSV */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            CSV
          </Button>

          {/* Export Excel */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="h-8 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Excel
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Table View */}
        <div className="overflow-x-auto max-h-[520px]">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10">
              <TableRow className="border-b border-slate-200">
                <TableHead className="w-12 text-center text-xs font-bold text-slate-500 font-mono">
                  #
                </TableHead>
                {columns.map((col) => {
                  const profile = profiles[col]
                  return (
                    <TableHead key={col} className="text-xs font-semibold text-slate-700 whitespace-nowrap py-2.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSort(col)}
                          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-left"
                        >
                          {getColumnIcon(profile?.type)}
                          <span>{col}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedColumnStats(profile || null)}
                          className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition-colors"
                          title="Inspect column statistics"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedData.map((row, rowIdx) => (
                <TableRow key={rowIdx} className="hover:bg-slate-50/80 border-b border-slate-100">
                  <TableCell className="text-center text-[11px] text-slate-400 font-mono py-2">
                    {(page - 1) * pageSize + rowIdx + 1}
                  </TableCell>
                  {columns.map((col) => {
                    const val = row[col]
                    const isNull = val === null || val === undefined || val === ""
                    return (
                      <TableCell key={col} className="text-xs text-slate-700 whitespace-nowrap py-2">
                        {isNull ? (
                          <span className="text-slate-300 italic font-mono text-[10px]">null</span>
                        ) : typeof val === "boolean" ? (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${
                              val ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {String(val)}
                          </Badge>
                        ) : typeof val === "number" ? (
                          <span className="font-mono text-slate-800">{val.toLocaleString()}</span>
                        ) : (
                          <span>{String(val)}</span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}

              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-slate-500 text-xs">
                    No matching records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="text-xs text-slate-500">
            Showing <span className="font-medium text-slate-700">{filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{" "}
            <span className="font-medium text-slate-700">{Math.min(page * pageSize, filteredData.length)}</span> of{" "}
            <span className="font-medium text-slate-700">{filteredData.length.toLocaleString()}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-xs text-slate-600 font-medium">
              Page {page} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Column Statistics Dialog */}
      <Dialog open={!!selectedColumnStats} onOpenChange={(open) => !open && setSelectedColumnStats(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {getColumnIcon(selectedColumnStats?.type)}
              Column Statistics: {selectedColumnStats?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed data distribution and summary for this attribute.
            </DialogDescription>
          </DialogHeader>

          {selectedColumnStats && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Data Type</span>
                  <span className="font-semibold text-slate-800 uppercase">{selectedColumnStats.type}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Total Records</span>
                  <span className="font-semibold text-slate-800">{selectedColumnStats.totalCount}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Null / Empty Cells</span>
                  <span className="font-semibold text-slate-800">{selectedColumnStats.nullCount}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">Distinct Values</span>
                  <span className="font-semibold text-slate-800">{selectedColumnStats.uniqueCount}</span>
                </div>
              </div>

              {/* Numeric Specific Stats */}
              {selectedColumnStats.type === "number" && (
                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 space-y-1.5 text-xs">
                  <h5 className="font-semibold text-blue-900">Summary Statistics</h5>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-500">Minimum:</span>{" "}
                      <span className="font-mono font-medium text-slate-800">{selectedColumnStats.min}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Maximum:</span>{" "}
                      <span className="font-mono font-medium text-slate-800">{selectedColumnStats.max}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Mean (Avg):</span>{" "}
                      <span className="font-mono font-medium text-slate-800">{selectedColumnStats.mean?.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Median:</span>{" "}
                      <span className="font-mono font-medium text-slate-800">{selectedColumnStats.median?.toFixed(2)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Total Sum:</span>{" "}
                      <span className="font-mono font-medium text-slate-800">{selectedColumnStats.sum?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Categories */}
              {selectedColumnStats.topValues && selectedColumnStats.topValues.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <h5 className="font-semibold text-slate-800">Top Value Frequencies</h5>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {selectedColumnStats.topValues.map((tv, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                        <span className="text-slate-700 truncate max-w-[200px]">{tv.value}</span>
                        <span className="font-mono text-slate-500 font-semibold">{tv.count} rows</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
