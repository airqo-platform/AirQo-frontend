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
import { useDevice } from "@/core/hooks/useDevices"

// Field mapping based on device category
const fieldMappings = {
  bam: [
    { id: "pm2_5", name: "PM2.5 (μg/m³)" },
    { id: "pm10", name: "PM10 (μg/m³)" },
    { id: "ConcRt", name: "ConcRt (μg/m³)" },
    { id: "ConcHr", name: "ConcHr (μg/m³)" },
    { id: "Flow", name: "Flow (LPM)" },
    { id: "DeviceStatus", name: "Device Status" },
    { id: "battery", name: "Battery" },
  ],
  lowcost: [
    { id: "pm2_5", name: "PM2.5 (μg/m³)" },
    { id: "pm10", name: "PM10 (μg/m³)" },
    { id: "s2_pm2_5", name: "Sensor 2 PM2.5 (μg/m³)" },
    { id: "s2_pm10", name: "Sensor 2 PM10 (μg/m³)" },
    { id: "latitude", name: "Latitude" },
    { id: "longitude", name: "Longitude" },
    { id: "battery", name: "Battery" },
  ],
  default: [
    { id: "pm2_5", name: "PM2.5 (μg/m³)" },
    { id: "pm10", name: "PM10 (μg/m³)" },
    { id: "battery", name: "Battery" },
  ],
}

interface ExportFormProps {
  deviceId: string
  deviceType?: string
}

export function ExportForm({ deviceId, deviceType = "default" }: ExportFormProps) {
  const router = useRouter()
  const { data: device, isLoading } = useDevice(deviceId)
  const [exportType, setExportType] = useState("device")
  const [field, setField] = useState("pm2_5")
  const [timeRange, setTimeRange] = useState("24h")
  const [frequency, setFrequency] = useState("raw")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const exportData = useExportData()

  const deviceCategory = deviceType.toLowerCase().includes("bam")
    ? "bam"
    : deviceType.toLowerCase().includes("lowcost")
      ? "lowcost"
      : "default"

  const fields = fieldMappings[deviceCategory as keyof typeof fieldMappings] || fieldMappings.default

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!device) {
      toast("Device information not available")
      return
    }

    try {
      toast("Preparing data export...")

      // Calculate days based on time range
      let days = 1
      if (timeRange === "7d") days = 7
      if (timeRange === "30d") days = 30

      await exportData.mutateAsync({
        deviceId,
        fieldId: exportType === "field" ? field : undefined,
        days,
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Export Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
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
                    <SelectItem key={field.id} value={field.id}>
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
            <Label htmlFor="frequency">Data Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw">Raw Data</SelectItem>
                <SelectItem value="hourly">Hourly Average</SelectItem>
                <SelectItem value="daily">Daily Average</SelectItem>
                <SelectItem value="weekly">Weekly Average</SelectItem>
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
