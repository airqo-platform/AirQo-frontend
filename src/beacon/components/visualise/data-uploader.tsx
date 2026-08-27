"use client"

import React, { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UploadCloud,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  X,
  ClipboardPaste,
  Sliders,
} from "lucide-react"
import {
  parseCSVFileStream,
  parseExcelFile,
  parseJSONText,
  parseCSVText,
  profileDataset,
  type ParsedDataset,
  type StreamProgress,
} from "@/lib/visualise/data-parser"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface DataUploaderProps {
  onDatasetLoaded: (dataset: ParsedDataset) => void
  currentDatasetName?: string
}

const MAX_NON_STREAM_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB limit for in-memory Excel/JSON

export function DataUploader({ onDatasetLoaded, currentDatasetName }: DataUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamProgress, setStreamProgress] = useState<StreamProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [maxSampleRows, setMaxSampleRows] = useState<number>(50000)

  // Paste Dialog State
  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false)
  const [pastedText, setPastedText] = useState("")
  const [pasteDatasetName, setPasteDatasetName] = useState("Pasted Data")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Main file processing logic
  const processFile = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setStreamProgress({ bytesRead: 0, totalBytes: file.size, percent: 0, rowsParsed: 0 })

    try {
      const fileName = file.name.toLowerCase()

      // 1. CSV / TSV / TXT Files (Using Streaming Chunk Parser for any size)
      if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
        const streamResult = await parseCSVFileStream(file, {
          maxSampleRows,
          sampleMode: "uniform",
          onProgress: (prog) => {
            setStreamProgress(prog)
          },
        })

        if (!streamResult.data || streamResult.data.length === 0) {
          throw new Error("The CSV file is empty or could not be parsed.")
        }

        const profiled = profileDataset(streamResult.data, file.name, "file")
        profiled.fileSizeBytes = file.size
        profiled.totalFileRows = streamResult.totalFileRows
        profiled.isSampled = streamResult.isSampled

        onDatasetLoaded(profiled)
        toast.success(
          streamResult.isSampled
            ? `Streamed & loaded sample of ${profiled.rawRowCount.toLocaleString()} rows (from ~${streamResult.totalFileRows.toLocaleString()} rows in file)`
            : `Loaded dataset with ${profiled.rawRowCount.toLocaleString()} rows`
        )
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        // 2. Excel Files (non-streaming in-memory parsing)
        if (file.size > MAX_NON_STREAM_FILE_SIZE_BYTES) {
          throw new Error(
            `Excel file size (${formatBytes(file.size)}) exceeds the maximum supported limit of ${formatBytes(MAX_NON_STREAM_FILE_SIZE_BYTES)}. For large datasets, please convert and upload as CSV.`
          )
        }
        const data = await parseExcelFile(file)
        if (!data || data.length === 0) {
          throw new Error("No readable rows found in the Excel workbook.")
        }
        const profiled = profileDataset(data, file.name, "file")
        profiled.fileSizeBytes = file.size
        onDatasetLoaded(profiled)
        toast.success(`Loaded Excel dataset with ${profiled.rawRowCount.toLocaleString()} rows`)
      } else if (fileName.endsWith(".json")) {
        // 3. JSON Files (non-streaming in-memory parsing)
        if (file.size > MAX_NON_STREAM_FILE_SIZE_BYTES) {
          throw new Error(
            `JSON file size (${formatBytes(file.size)}) exceeds the maximum supported limit of ${formatBytes(MAX_NON_STREAM_FILE_SIZE_BYTES)}. For large datasets, please convert and upload as CSV.`
          )
        }
        const text = await file.text()
        const data = parseJSONText(text)
        if (!data || data.length === 0) {
          throw new Error("JSON file must contain an array of data objects.")
        }
        const profiled = profileDataset(data, file.name, "file")
        profiled.fileSizeBytes = file.size
        onDatasetLoaded(profiled)
        toast.success(`Loaded JSON dataset with ${profiled.rawRowCount.toLocaleString()} rows`)
      } else {
        throw new Error(
          "Unsupported file format. Please upload CSV, Excel (.xlsx/.xls), JSON, or TSV."
        )
      }
    } catch (err: any) {
      console.error(err)
      const msg = err?.message || "Failed to process file. Please check format."
      setError(msg)
      toast.error(msg)
    } finally {
      setIsProcessing(false)
      setStreamProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle pasted text submit
  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) {
      toast.error("Please paste CSV or JSON data first.")
      return
    }

    setIsProcessing(true)
    setError(null)
    await new Promise((res) => setTimeout(res, 20))

    try {
      let data: Record<string, any>[] = []
      const trimmed = pastedText.trim()

      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        data = parseJSONText(trimmed)
      } else {
        data = parseCSVText(trimmed)
      }

      if (!data || data.length === 0) {
        throw new Error("Could not parse any rows from the pasted text.")
      }

      const profiled = profileDataset(data, pasteDatasetName || "Pasted_Data", "text")
      onDatasetLoaded(profiled)
      setIsPasteDialogOpen(false)
      setPastedText("")
      toast.success(`Pasted dataset loaded (${profiled.rawRowCount.toLocaleString()} rows)`)
    } catch (err: any) {
      const msg = err?.message || "Invalid pasted data format."
      setError(msg)
      toast.error(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/10 scale-[0.99]"
            : "border-slate-300 hover:border-slate-400 bg-white"
        } shadow-sm`}
      >
        <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.tsv,.json,.txt"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
            {isProcessing ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-800">
            {currentDatasetName ? "Replace or Upload New Dataset" : "Upload your dataset to start analyzing"}
          </h3>
          <p className="text-sm text-slate-500 max-w-lg mt-1.5">
            Drag and drop your file here, or click to browse. Handles files of any size (including gigabyte-scale sensor logs) with fast in-browser streaming.
          </p>

          {/* Configuration toolbar (Sampling limits) */}
          <div className="mt-4 flex flex-wrap items-center gap-3 bg-slate-50 p-2 px-3 rounded-lg border border-slate-200/80 text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              In-Browser Sample Limit:
            </span>
            <Select
              value={String(maxSampleRows)}
              onValueChange={(val) => setMaxSampleRows(Number(val))}
              disabled={isProcessing}
            >
              <SelectTrigger className="h-7 text-xs w-36 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10000" className="text-xs">10,000 rows</SelectItem>
                <SelectItem value="25000" className="text-xs">25,000 rows</SelectItem>
                <SelectItem value="50000" className="text-xs">50,000 rows (Balanced)</SelectItem>
                <SelectItem value="100000" className="text-xs">100,000 rows</SelectItem>
                <SelectItem value="200000" className="text-xs">200,000 rows (High Detail)</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-slate-400 text-[11px]">(Uniform time-distribution sampling)</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6 shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Browse Computer Files
            </Button>

            <Button
              type="button"
              variant="outline"
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => setIsPasteDialogOpen(true)}
              disabled={isProcessing}
            >
              <ClipboardPaste className="w-4 h-4 text-slate-500" />
              Paste Raw Data
            </Button>
          </div>

          {/* Streaming Progress Bar */}
          {isProcessing && streamProgress && (
            <div className="w-full max-w-md mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  Streaming {formatBytes(streamProgress.bytesRead)} / {formatBytes(streamProgress.totalBytes)}
                </span>
                <span className="font-bold text-primary">{streamProgress.percent}%</span>
              </div>
              <Progress value={streamProgress.percent} className="h-2 bg-slate-100" />
              <p className="text-[11px] text-slate-400">
                Parsed ~{streamProgress.rowsParsed.toLocaleString()} records from file...
              </p>
            </div>
          )}

          {/* Supported format badges */}
          <div className="flex items-center gap-2 mt-6 text-xs text-slate-400">
            <span>Supported formats:</span>
            <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-600">
              CSV (Any Size)
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-600">
              XLSX / XLS
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-600">
              JSON
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-600">
              TSV
            </Badge>
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 max-w-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{error}</span>
              <button onClick={() => setError(null)} aria-label="Dismiss error" className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paste Dialog */}
      <Dialog open={isPasteDialogOpen} onOpenChange={setIsPasteDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Paste Raw Data</DialogTitle>
            <DialogDescription>
              Paste CSV rows or a JSON array directly from your clipboard to analyze instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="paste-dataset-name" className="text-xs font-medium text-slate-700 block mb-1">Dataset Name</label>
              <Input
                id="paste-dataset-name"
                value={pasteDatasetName}
                onChange={(e) => setPasteDatasetName(e.target.value)}
                placeholder="e.g. Field Calibration Run"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label htmlFor="paste-raw-text" className="text-xs font-medium text-slate-700 block mb-1">Raw CSV or JSON Text</label>
              <Textarea
                id="paste-raw-text"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`created_at,device_name,Sensor1 PM2.5,Sensor2 PM2.5\n2025-08-19 08:00:00,AQ_01,24.5,23.8\n2025-08-19 09:00:00,AQ_01,28.1,27.9`}
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasteSubmit} disabled={isProcessing} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isProcessing ? "Processing..." : "Parse & Visualise Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
