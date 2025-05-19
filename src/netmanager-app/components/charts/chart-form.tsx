"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useCreateChartConfig, useUpdateChartConfig } from "@/core/hooks/useChartConfigs"

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

interface ChartFormProps {
  deviceId: string
  deviceType?: string
  chartConfig?: {
    _id?: string
    fieldId: string
    title: string
    xAxisLabel: string
    yAxisLabel: string
    color: string
    backgroundColor: string
    chartType: string
    days: number
    results: number
    showLegend: boolean
    showGrid: boolean
    referenceLines?: {
      value: number
      label: string
      color: string
      style: string
    }[]
  }
}

export function ChartForm({ deviceId, deviceType = "default", chartConfig }: ChartFormProps) {
  const router = useRouter()
  const createChartConfig = useCreateChartConfig()
  const updateChartConfig = useUpdateChartConfig()

  const [config, setConfig] = useState(
    chartConfig || {
      fieldId: "pm2_5",
      title: "New Chart",
      xAxisLabel: "Time",
      yAxisLabel: "Value",
      color: "#d62020",
      backgroundColor: "#ffffff",
      chartType: "Line",
      days: 7,
      results: 100,
      showLegend: true,
      showGrid: true,
      referenceLines: [],
    },
  )

  const deviceCategory = deviceType.toLowerCase().includes("bam")
    ? "bam"
    : deviceType.toLowerCase().includes("lowcost")
      ? "lowcost"
      : "default"

  const fields = fieldMappings[deviceCategory as keyof typeof fieldMappings] || fieldMappings.default

  const handleChange = (field: string, value: any) => {
    setConfig({
      ...config,
      [field]: value,
    })
  }

  const handleReferenceLineChange = (index: number, field: string, value: any) => {
    const updatedLines = [...(config.referenceLines || [])]
    updatedLines[index] = {
      ...updatedLines[index],
      [field]: value,
    }

    setConfig({
      ...config,
      referenceLines: updatedLines,
    })
  }

  const addReferenceLine = () => {
    setConfig({
      ...config,
      referenceLines: [
        ...(config.referenceLines || []),
        {
          value: 0,
          label: "Reference Line",
          color: "#FF0000",
          style: "dashed",
        },
      ],
    })
  }

  const removeReferenceLine = (index: number) => {
    const updatedLines = [...(config.referenceLines || [])]
    updatedLines.splice(index, 1)

    setConfig({
      ...config,
      referenceLines: updatedLines,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (config._id) {
        // Update existing chart
        await updateChartConfig.mutateAsync({
          deviceId,
          chartId: config._id,
          chartConfig: config,
        })
        toast("Chart updated successfully")
      } else {
        // Create new chart
        await createChartConfig.mutateAsync({
          deviceId,
          chartConfig: config,
        })
        toast("Chart created successfully")
      }
      router.push(`/devices/overview/${deviceId}`)
    } catch (error) {
      toast("Failed to save chart", {
        description: (error as Error).message,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fieldId">Field</Label>
          <Select value={config.fieldId} onValueChange={(value) => handleChange("fieldId", value)}>
            <SelectTrigger id="fieldId">
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

        <div className="space-y-2">
          <Label htmlFor="title">Chart Title</Label>
          <Input id="title" value={config.title} onChange={(e) => handleChange("title", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="xAxisLabel">X-Axis Label</Label>
          <Input
            id="xAxisLabel"
            value={config.xAxisLabel}
            onChange={(e) => handleChange("xAxisLabel", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yAxisLabel">Y-Axis Label</Label>
          <Input
            id="yAxisLabel"
            value={config.yAxisLabel}
            onChange={(e) => handleChange("yAxisLabel", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chartType">Chart Type</Label>
          <Select value={config.chartType} onValueChange={(value) => handleChange("chartType", value)}>
            <SelectTrigger id="chartType">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Line">Line</SelectItem>
              <SelectItem value="Bar">Bar</SelectItem>
              <SelectItem value="Column">Column</SelectItem>
              <SelectItem value="Spline">Spline</SelectItem>
              <SelectItem value="Area">Area</SelectItem>
              <SelectItem value="Step">Step</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Chart Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={config.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input value={config.color} onChange={(e) => handleChange("color", e.target.value)} className="flex-1" />
          </div>
        </div>
      </div>

      <Separator />

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="data-options">
          <AccordionTrigger>Data Options</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="days">Days of Data</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  max="30"
                  value={config.days}
                  onChange={(e) => handleChange("days", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="results">Number of Results</Label>
                <Input
                  id="results"
                  type="number"
                  min="10"
                  max="1000"
                  value={config.results}
                  onChange={(e) => handleChange("results", Number.parseInt(e.target.value))}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="display-options">
          <AccordionTrigger>Display Options</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showLegend"
                  checked={config.showLegend}
                  onCheckedChange={(checked) => handleChange("showLegend", checked === true)}
                />
                <Label htmlFor="showLegend">Show Legend</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showGrid"
                  checked={config.showGrid}
                  onCheckedChange={(checked) => handleChange("showGrid", checked === true)}
                />
                <Label htmlFor="showGrid">Show Grid</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reference-lines">
          <AccordionTrigger>Reference Lines</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {(config.referenceLines || []).map((line, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Reference Line {index + 1}</h4>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeReferenceLine(index)}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`line-${index}-value`}>Value</Label>
                      <Input
                        id={`line-${index}-value`}
                        type="number"
                        value={line.value}
                        onChange={(e) => handleReferenceLineChange(index, "value", Number.parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`line-${index}-label`}>Label</Label>
                      <Input
                        id={`line-${index}-label`}
                        value={line.label}
                        onChange={(e) => handleReferenceLineChange(index, "label", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`line-${index}-color`}>Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`line-${index}-color`}
                          type="color"
                          value={line.color}
                          onChange={(e) => handleReferenceLineChange(index, "color", e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={line.color}
                          onChange={(e) => handleReferenceLineChange(index, "color", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`line-${index}-style`}>Line Style</Label>
                      <Select
                        value={line.style}
                        onValueChange={(value) => handleReferenceLineChange(index, "style", value)}
                      >
                        <SelectTrigger id={`line-${index}-style`}>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addReferenceLine} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Reference Line
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push(`/devices/${deviceId}`)}>
          Cancel
        </Button>
        <Button type="submit" disabled={createChartConfig.isPending || updateChartConfig.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {createChartConfig.isPending || updateChartConfig.isPending ? "Saving..." : "Save Chart"}
        </Button>
      </div>
    </form>
  )
}
