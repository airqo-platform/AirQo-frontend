"use client"

import { useState } from "react"
import { Plus, Upload, FileText } from "lucide-react"
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
  const [filters, setFilters] = useState<FilterState>({
    filterType: "airqlouds",
    selectedItems: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
    includeTime: false,
  })
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [includeDevices, setIncludeDevices] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [columnMappings, setColumnMappings] = useState<ColumnMapping>({})
  const [formData, setFormData] = useState({
    name: "",
    country: "",
  })

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    // TODO: Fetch data based on filters
    console.log("Filters changed:", newFilters)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
      // Parse CSV to get column headers
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lines = text.split('\n')
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim())
          setCsvColumns(headers)
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
    setColumnMappings({})
    setIncludeDevices(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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
          description: `AirQloud "${response.airqloud.name}" created with ${response.devices_added} devices added successfully.`,
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
          description: `AirQloud "${response.name}" has been created successfully.`,
          variant: "default",
        })
      }

      setOpen(false)
      resetForm()

      // Optionally refresh the table here
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create AirQloud",
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
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="default"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add AirQloud
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New AirQloud</DialogTitle>
              <DialogDescription>
                Create a new AirQloud {includeDevices ? "and add devices from a CSV file" : ""}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Toggle for including devices */}
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="include-devices" className="font-medium">
                      Include Devices from CSV
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV file to add devices to this AirQloud
                    </p>
                  </div>
                  <Switch
                    id="include-devices"
                    checked={includeDevices}
                    onCheckedChange={setIncludeDevices}
                  />
                </div>

                {/* Basic Fields */}
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    AirQloud Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Kampala Central"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country (optional)</Label>
                  <Input
                    id="country"
                    placeholder="e.g., Uganda"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>

                {includeDevices && (
                  <>
                    {/* CSV Upload */}
                    <div className="grid gap-2">
                      <Label htmlFor="csv-file">
                        CSV File <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="csv-file"
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          required={includeDevices}
                          className="flex-1"
                        />
                        {csvFile && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {csvFile.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload a CSV file containing device information
                      </p>
                    </div>

                    {/* Column Mappings */}
                    {csvColumns.length > 0 && (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">
                              Map CSV Columns to Device Fields
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Map your CSV columns to the corresponding device fields
                            </p>
                            
                            <div className="grid gap-3">
                              <div className="grid gap-2">
                                <Label htmlFor="device-mapping" className="text-xs">
                                  Device ID Column
                                </Label>
                                <Select
                                  value={columnMappings.device || "none"}
                                  onValueChange={(value) => handleColumnMappingChange('device', value)}
                                >
                                  <SelectTrigger id="device-mapping">
                                    <SelectValue placeholder="Select column for device_id" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {csvColumns.map((col) => (
                                      <SelectItem key={col} value={col}>
                                        {col}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor="read-mapping" className="text-xs">
                                  Read Key Column
                                </Label>
                                <Select
                                  value={columnMappings.read || "none"}
                                  onValueChange={(value) => handleColumnMappingChange('read', value)}
                                >
                                  <SelectTrigger id="read-mapping">
                                    <SelectValue placeholder="Select column for read_key" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {csvColumns.map((col) => (
                                      <SelectItem key={col} value={col}>
                                        {col}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor="channel-mapping" className="text-xs">
                                  Channel ID Column
                                </Label>
                                <Select
                                  value={columnMappings.channel || "none"}
                                  onValueChange={(value) => handleColumnMappingChange('channel', value)}
                                >
                                  <SelectTrigger id="channel-mapping">
                                    <SelectValue placeholder="Select column for channel_id" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {csvColumns.map((col) => (
                                      <SelectItem key={col} value={col}>
                                        {col}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                              <p className="font-medium mb-1">Mapping Preview:</p>
                              <code className="text-xs block whitespace-pre">
                                {JSON.stringify(
                                  Object.entries({
                                    ...(columnMappings.device && { [columnMappings.device]: 'device_id' }),
                                    ...(columnMappings.read && { [columnMappings.read]: 'read_key' }),
                                    ...(columnMappings.channel && { [columnMappings.channel]: 'channel_id' })
                                  }).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
                                  null,
                                  2
                                )}
                              </code>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    resetForm()
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : includeDevices ? "Create with Devices" : "Create AirQloud"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Component */}
      <AnalyticsFilters onFilterChange={handleFilterChange} />

      {/* AirQlouds Table Component */}
      <AirQloudsTable />
    </div>
  )
}