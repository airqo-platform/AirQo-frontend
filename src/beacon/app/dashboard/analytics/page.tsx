"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import AnalyticsFilters, { FilterState } from "./analytics-filters"
import AirQloudsTable from "./airqlouds-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { airQloudService, ColumnMapping } from "@/services/airqloud.service"
import { deviceApiService } from "@/services/device-api.service"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function AnalyticsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({
    filterType: "airqlouds",
    selectedItems: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
    includeTime: false,
  })
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [includeDevices, setIncludeDevices] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [csvDeviceCount, setCsvDeviceCount] = useState<number>(0)
  const [columnMappings, setColumnMappings] = useState<ColumnMapping>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    country: "",
  })

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    // TODO: Fetch data based on filters
    console.log("Filters changed:", newFilters)
  }

  const handleSyncAirQlouds = async () => {
    setIsSyncing(true)
    try {
      const result = await airQloudService.syncAirQlouds({
        force: false,
        run_in_background: true
      })
      
      toast({
        title: "Sync Triggered",
        description: result.message || "AirQlouds (Cohorts) sync has been triggered successfully.",
      })
      
      // Refresh the table after a short delay to allow sync to complete
      setTimeout(() => {
        setRefreshKey(prev => prev + 1)
      }, 2000)
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync AirQlouds (Cohorts).",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAnalyse = async (filterState: FilterState) => {
    if (!filterState.dateRange.from || !filterState.dateRange.to) {
      toast({
        title: "Date Range Required",
        description: "Please select a date range for the analysis.",
        variant: "destructive",
      })
      return
    }

    if (filterState.selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: `Please select at least one ${filterState.filterType === 'airqlouds' ? 'AirQloud (Cohort)' : 'Device'} to analyse.`,
        variant: "destructive",
      })
      return
    }

    setIsAnalysing(true)

    try {
      // Format dates to ISO strings with time
      const startDate = new Date(filterState.dateRange.from)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(filterState.dateRange.to)
      endDate.setHours(23, 59, 59, 999)

      let response
      
      if (filterState.filterType === "airqlouds") {
        response = await airQloudService.getAirQloudPerformance({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          ids: filterState.selectedItems,
        })
      } else {
        // Device analysis
        response = await deviceApiService.getDevicePerformanceData({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          ids: filterState.selectedItems,
        })
      }

      // Store the data in sessionStorage and navigate to analysis page
      sessionStorage.setItem('analysisData', JSON.stringify(response))
      sessionStorage.setItem('analysisDateRange', JSON.stringify({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      }))
      sessionStorage.setItem('analysisType', filterState.filterType)
      
      router.push('/dashboard/analytics/analysis')
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to fetch analysis data",
        variant: "destructive",
      })
    } finally {
      setIsAnalysing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
      // Parse CSV to get column headers and count devices
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lines = text.split('\n').filter(line => line.trim().length > 0)
        if (lines.length > 0) {
          // Filter out empty column names and ensure uniqueness
          const headers = lines[0]
            .split(',')
            .map(h => h.trim())
            .filter(h => h.length > 0) // Remove empty strings
            .filter((h, index, self) => self.indexOf(h) === index) // Remove duplicates
          setCsvColumns(headers)
          // Count devices (excluding header row)
          const deviceCount = lines.length - 1
          setCsvDeviceCount(deviceCount)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleColumnMappingChange = (field: 'device' | 'read' | 'channel', column: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [field]: column === 'none' ? undefined : column
    }))
  }

  const resetForm = () => {
    setFormData({ name: "", country: "" })
    setCsvFile(null)
    setCsvColumns([])
    setCsvDeviceCount(0)
    setColumnMappings({})
    setIncludeDevices(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Close dialog immediately when submit is clicked
    setOpen(false)

    try {
      if (includeDevices && csvFile) {
        // Create AirQloud with devices
        const response = await airQloudService.createAirQloudWithDevices(
          csvFile,
          formData.name,
          formData.country || undefined,
          undefined, // visibility not used
          columnMappings
        )
        
        toast({
          title: "Success",
          description: `AirQloud (Cohort) "${response.airqloud.name}" created with ${response.devices_added} devices added successfully.`,
          variant: "default",
        })

        if (response.devices_failed > 0) {
          toast({
            title: "Warning",
            description: `${response.devices_failed} devices failed to add. Check console for details.`,
            variant: "destructive",
          })
          console.error("Failed devices:", response.errors)
        }
      } else {
        // Create simple AirQloud
        const payload = {
          name: formData.name,
          ...(formData.country && { country: formData.country }),
        }

        const response = await airQloudService.createAirQloud(payload)
        
        toast({
          title: "Success",
          description: `AirQloud (Cohort) "${response.name}" has been created successfully.`,
          variant: "default",
        })
      }

      resetForm()

      // Trigger table refresh without full page reload
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create AirQloud (Cohort)",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AirQloud Uptime</h1>
      </div> */}

      {/* Add Button with Dialog */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleSyncAirQlouds}
          disabled={isSyncing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync AirQlouds (Cohorts)'}
        </Button>
      </div>

      {/* Filters Component */}
      <AnalyticsFilters 
        onFilterChange={handleFilterChange} 
        onAnalyse={handleAnalyse}
        isAnalysing={isAnalysing}
      />

      {/* AirQlouds Table Component */}
      <AirQloudsTable key={refreshKey} />
    </div>
  )
}