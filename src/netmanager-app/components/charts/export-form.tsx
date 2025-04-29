"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useExportData } from "@/core/hooks/useExportData"

interface ExportFormProps {
  deviceId: string
  deviceType?: string
}

// Field mapping based on device type
const fieldMappings = {
  "BAM Monitor": [
    { id: 1, name: "Date and time" },
    { id: 2, name: "ConcRt(ug/m3)" },
    { id: 3, name: "ConcHR(ug/m3)" },
    { id: 4, name: "ConcS(ug/m3)" },
    { id: 5, name: "Flow(LPM)" },
    { id: 6, name: "DeviceStatus" },
    { id: 7, name: "Logger Battery" },
    { id: 8, name: "Complete BAM dataset" },
  ],
  "Lowcost Monitor": [
    { id: 1, name: "Sensor1 PM2.5_CF_1_ug/m3" },
    { id: 2, name: "Sensor1 PM10_CF_1_ug/m3" },
    { id: 3, name: "Sensor2 PM2.5_CF_1_ug/m3" },
    { id: 4, name: "Sensor2 PM10_CF_1_ug/m3" },
    { id: 5, name: "Latitude" },
    { id: 6, name: "Longitude" },
    { id: 7, name: "Battery Voltage" },
    { id: 8, name: "ExtraData" },
  ],
  "Gas Monitor": [
    { id: 1, name: "PM2.5" },
    { id: 2, name: "TVOC" },
    { id: 3, name: "HCHO" },
    { id: 4, name: "CO2" },
    { id: 5, name: "Intake Temperature" },
    { id: 6, name: "Intake Humidity" },
    { id: 7, name: "Battery Voltage" },
    { id: 8, name: "ExtraData" },
  ],
  Default: [
    { id: 1, name: "Field 1" },
    { id: 2, name: "Field 2" },
    { id: 3, name: "Field 3" },
    { id: 4, name: "Field 4" },
    { id: 5, name: "Field 5" },
    { id: 6, name: "Field 6" },
    { id: 7, name: "Field 7" },
    { id: 8, name: "Field 8" },
  ],
}

export function ExportForm({ deviceId, deviceType = "Default" }: ExportFormProps) {
  const router = useRouter()
  const [exportType, setExportType] = useState("device")
  const [field, setField] = useState("1")
  const [timeRange, setTimeRange] = useState("24h")
  const [timezone, setTimezone] = useState("UTC")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const exportData = useExportData()

  const fields = fieldMappings[deviceType as keyof typeof fieldMappings] || fieldMappings.Default

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      toast("Preparing data export...")

      // Calculate days based on time range
      let days = 1
      if (timeRange === "7d") days = 7
      if (timeRange === "30d") days = 30

      // For custom range, calculate days between dates
      if (timeRange === "custom" && startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }

      await exportData.mutateAsync({
        deviceId,
        fieldId: exportType === "field" ? Number.parseInt(field) : undefined,
        days,
        timezone,
        format: "csv",
        startDate: timeRange === "custom" ? startDate : undefined,
        endDate: timeRange === "custom" ? endDate : undefined,
      })

      toast("Data exported successfully")
    } catch (error) {
      toast("Failed to export data", {
        description: (error as Error).message,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Sensor Data</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleExport} className="space-y-6">
          <div className="space-y-2">
            <Label>Export Type</Label>
            <RadioGroup value={exportType} onValueChange={setExportType} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="device" id="export-device" />
                <Label htmlFor="export-device">Entire Device Data (All Fields)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="field" id="export-field" />
                <Label htmlFor="export-field">Specific Field Data</Label>
              </div>
            </RadioGroup>
          </div>

          {exportType === "field" && (
            <div className="space-y-2">
              <Label htmlFor="field">Field</Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger id="field">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id.toString()}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="timeRange">Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger id="timeRange">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {timeRange === "custom" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    className="pl-10"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    className="pl-10"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={exportData.isPending}>
              <Download className="mr-2 h-4 w-4" />
              {exportData.isPending ? "Exporting..." : "Export to CSV"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
