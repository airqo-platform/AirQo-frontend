"use client"

import React, { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Radio,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  MapPin,
  Sparkles,
  RefreshCw,
  FileCode,
  Globe2,
  Signal,
  Building2,
  TreePine,
  Maximize2,
  Plus,
  RotateCcw
} from "lucide-react"
import {
  LoRaWANGateway,
  GatewayEnvironment,
} from "@/types/lorawan.types"
import {
  parseLoRaWANGatewayJSON,
  KAMPALA_SAMPLE_GATEWAYS,
  ENVIRONMENT_PROFILES,
} from "@/utils/lorawan-utils"
import { useToast } from "@/hooks/use-toast"

interface LoRaWANGatewayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gateways: LoRaWANGateway[]
  onGatewaysChange: (gateways: LoRaWANGateway[]) => void
  onCenterGateway?: (gateway: LoRaWANGateway) => void
}

const SAMPLE_JSON_SNIPPET = JSON.stringify(
  {
    "Muk Gateway": {
      "latitude": 0.33415,
      "longitude": 32.57028,
      "altitude": 1195
    },
    "Masaka Nkozi Gateway": {
      "latitude": 0.00273,
      "longitude": 32.01378,
      "altitude": 1250
    },
    "Gateway at Soroti": {
      "latitude": 1.76566,
      "longitude": 33.62723,
      "altitude": 0
    },
    "Gateway at Muganzirwaza": {
      "latitude": 0.29526,
      "longitude": 32.57249,
      "altitude": 0
    },
    "Gateway at NWSC-Ggaba": {
      "latitude": 0.25126,
      "longitude": 32.63737,
      "altitude": 0
    }
  },
  null,
  2
)

export function LoRaWANGatewayDialog({
  open,
  onOpenChange,
  gateways,
  onGatewaysChange,
  onCenterGateway,
}: LoRaWANGatewayDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("import")
  const [jsonText, setJsonText] = useState<string>("")
  const [importMode, setImportMode] = useState<"replace" | "append">("append")
  const [parseError, setParseError] = useState<string | null>(null)
  const [previewGateways, setPreviewGateways] = useState<LoRaWANGateway[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manual gateway addition form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGwName, setNewGwName] = useState("")
  const [newGwLat, setNewGwLat] = useState("")
  const [newGwLng, setNewGwLng] = useState("")
  const [newGwEnv, setNewGwEnv] = useState<GatewayEnvironment>("urban")
  const [newGwHeight, setNewGwHeight] = useState("30")
  const [newGwAltitude, setNewGwAltitude] = useState("")

  // Validate JSON on the fly when edited
  const handleJsonChange = (text: string) => {
    setJsonText(text)
    if (!text.trim()) {
      setParseError(null)
      setPreviewGateways([])
      return
    }
    try {
      const parsed = parseLoRaWANGatewayJSON(text)
      setPreviewGateways(parsed)
      setParseError(null)
    } catch (err: any) {
      setParseError(err?.message || "Invalid JSON format")
      setPreviewGateways([])
    }
  }

  // Handle file drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        handleJsonChange(content)
      }
    }
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Failed to read the selected file.",
        variant: "destructive"
      })
    }
    reader.readAsText(file)
  }

  // Load sample gateways
  const handleLoadSample = () => {
    const sampleText = JSON.stringify(KAMPALA_SAMPLE_GATEWAYS, null, 2)
    handleJsonChange(sampleText)
    toast({
      title: "Sample Loaded",
      description: `Loaded ${KAMPALA_SAMPLE_GATEWAYS.length} official AirQo LoRaWAN gateways.`
    })
  }

  // Commit imported gateways
  const handleApplyImport = () => {
    if (previewGateways.length === 0) {
      toast({
        title: "No Gateways",
        description: "Please enter valid JSON or load sample gateways first.",
        variant: "destructive"
      })
      return
    }

    let updated: LoRaWANGateway[]
    if (importMode === "replace" || gateways.length === 0) {
      updated = previewGateways
    } else {
      // Append without duplicating IDs
      const existingIds = new Set(gateways.map(g => g.id))
      const newItems = previewGateways.filter(g => !existingIds.has(g.id))
      updated = [...gateways, ...newItems]
    }

    onGatewaysChange(updated)
    toast({
      title: "Gateways Applied",
      description: `Successfully loaded ${updated.length} LoRaWAN gateways.`
    })
    setJsonText("")
    setPreviewGateways([])
    setActiveTab("manage")
  }

  // Manually add a single gateway
  const handleAddSingleGateway = () => {
    const lat = parseFloat(newGwLat)
    const lng = parseFloat(newGwLng)
    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter valid latitude and longitude numbers.",
        variant: "destructive"
      })
      return
    }

    const name = newGwName.trim() || `Gateway #${gateways.length + 1}`
    const profile = ENVIRONMENT_PROFILES[newGwEnv] || ENVIRONMENT_PROFILES.urban
    const height = parseFloat(newGwHeight) || 30
    const alt = newGwAltitude.trim() ? `${newGwAltitude}m ASL` : undefined

    const newGw: LoRaWANGateway = {
      id: `gw-${Date.now()}`,
      name,
      latitude: lat,
      longitude: lng,
      environment: newGwEnv,
      antenna_height_m: height,
      max_range_km: profile.maxRadiusKm,
      inner_strong_radius_km: profile.strongRadiusKm,
      description: alt ? `Altitude: ${alt}` : undefined,
      enabled: true,
    }

    const updated = [...gateways, newGw]
    onGatewaysChange(updated)
    toast({
      title: "Gateway Added",
      description: `Added "${name}" with ${profile.maxRadiusKm} km coverage standard.`
    })

    setNewGwName("")
    setNewGwLat("")
    setNewGwLng("")
    setNewGwAltitude("")
    setShowAddForm(false)
  }

  // Reset to 5 default gateways
  const handleResetToDefaults = () => {
    if (confirm("Reset to the 5 official AirQo default gateways? (Muk, Muganzirwaza, NWSC-Ggaba, Masaka Nkozi, Soroti)")) {
      onGatewaysChange(KAMPALA_SAMPLE_GATEWAYS)
      toast({
        title: "Defaults Restored",
        description: "Reset to the 5 official AirQo gateways."
      })
    }
  }

  // Toggle single gateway enabled
  const toggleGateway = (id: string) => {
    const updated = gateways.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g)
    onGatewaysChange(updated)
  }

  // Update gateway environment
  const updateGatewayEnvironment = (id: string, env: GatewayEnvironment) => {
    const updated = gateways.map(g => {
      if (g.id !== id) return g
      const profile = ENVIRONMENT_PROFILES[env]
      return {
        ...g,
        environment: env,
        max_range_km: profile.maxRadiusKm,
        inner_strong_radius_km: profile.strongRadiusKm
      }
    })
    onGatewaysChange(updated)
  }

  // Update gateway numeric field
  const updateGatewayField = (id: string, field: "antenna_height_m" | "max_range_km", value: number) => {
    const updated = gateways.map(g => g.id === id ? { ...g, [field]: value } : g)
    onGatewaysChange(updated)
  }

  // Delete gateway
  const deleteGateway = (id: string) => {
    const updated = gateways.filter(g => g.id !== id)
    onGatewaysChange(updated)
  }

  // Clear all
  const clearAllGateways = () => {
    if (confirm("Are you sure you want to remove all LoRaWAN gateways?")) {
      onGatewaysChange([])
      toast({
        title: "Gateways Cleared",
        description: "All LoRaWAN gateways have been removed."
      })
    }
  }

  // Export gateways as JSON
  const handleExportGatewaysJson = () => {
    if (gateways.length === 0) return
    const dataStr = JSON.stringify(gateways, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `airqo-lorawan-gateways-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeCount = gateways.filter(g => g.enabled !== false).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-white text-gray-900 shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-gray-100 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  LoRaWAN Gateways & RF Coverage Layer
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold">
                    {gateways.length} Gateways ({activeCount} Active)
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  Import gateway coordinates, simulate logarithmic signal attenuation, and analyze 2–10 km coverage radii
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-5 pt-3 border-b border-gray-100 bg-white">
            <TabsList className="grid grid-cols-3 w-full bg-gray-100 p-1">
              <TabsTrigger value="import" className="text-xs font-medium gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                Import JSON / GeoJSON
              </TabsTrigger>
              <TabsTrigger value="manage" className="text-xs font-medium gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Layers className="w-3.5 h-3.5" />
                Manage Gateways ({gateways.length})
              </TabsTrigger>
              <TabsTrigger value="guide" className="text-xs font-medium gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Signal className="w-3.5 h-3.5" />
                RF Attenuation Factors
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: IMPORT JSON */}
          <TabsContent value="import" className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4 m-0">
            {/* Quick Actions Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/70 border border-indigo-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div className="text-xs text-indigo-900">
                  <span className="font-semibold">Quick Start:</span> Load sample Kampala gateways or paste your gateway JSON / GeoJSON below.
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLoadSample}
                  className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs h-8 shadow-sm flex-1 sm:flex-none"
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Load AirQo Gateways (5 Gateways)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 text-xs h-8 shadow-sm"
                >
                  <Upload className="w-3 h-3 mr-1.5" />
                  Upload File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.geojson,application/json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* JSON Editor Input */}
            <div className="space-y-1.5 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-gray-500" />
                  Gateway JSON / GeoJSON Payload
                </Label>
                {previewGateways.length > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {previewGateways.length} valid gateways found
                  </span>
                )}
              </div>
              <Textarea
                placeholder={`Paste JSON array or GeoJSON FeatureCollection here...\nExample:\n${SAMPLE_JSON_SNIPPET}`}
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="font-mono text-xs h-[180px] bg-slate-900 text-slate-100 border-slate-700 focus-visible:ring-indigo-500 rounded-md p-3"
              />
            </div>

            {/* Error or Preview Info */}
            {parseError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">JSON Syntax Error:</span> {parseError}
                </div>
              </div>
            )}

            {/* Import Mode Options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="font-medium text-gray-700">Import Mode:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Replace existing ({gateways.length})</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === "append"}
                    onChange={() => setImportMode("append")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Append to existing</span>
                </label>
              </div>

              <Button
                onClick={handleApplyImport}
                disabled={previewGateways.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-4 shadow-sm"
              >
                Apply {previewGateways.length > 0 ? `(${previewGateways.length} Gateways)` : ""}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: MANAGE GATEWAYS */}
          <TabsContent value="manage" className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4 m-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-lg p-3">
              <div>
                <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Active Gateways List ({gateways.length})
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Configure propagation spread (Urban 2–5km / Suburban 5–7km / Rural 10km) or map new gateways.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-2.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {showAddForm ? "Close Form" : "Map Gateway"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetToDefaults}
                  className="text-xs h-7 px-2.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  title="Reset to the 5 official AirQo default gateways"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset Defaults (5)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportGatewaysJson}
                  disabled={gateways.length === 0}
                  className="text-xs h-7 px-2.5"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllGateways}
                  disabled={gateways.length === 0}
                  className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 h-7 px-2"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Manual Add Gateway Form */}
            {showAddForm && (
              <Card className="p-3.5 border-indigo-200 bg-indigo-50/40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    Map New LoRaWAN Gateway
                  </h4>
                  <span className="text-[11px] text-indigo-700">Enter coordinates to render coverage radii</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">Gateway Name</Label>
                    <Input
                      placeholder="e.g. Jinja Highway Gateway"
                      value={newGwName}
                      onChange={(e) => setNewGwName(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">Latitude (DD)</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 0.33415"
                      value={newGwLat}
                      onChange={(e) => setNewGwLat(e.target.value)}
                      className="h-8 text-xs bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">Longitude (DD)</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 32.57028"
                      value={newGwLng}
                      onChange={(e) => setNewGwLng(e.target.value)}
                      className="h-8 text-xs bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">Environment (Degradation)</Label>
                    <select
                      value={newGwEnv}
                      onChange={(e) => setNewGwEnv(e.target.value as GatewayEnvironment)}
                      className="w-full h-8 px-2.5 rounded-md border border-gray-200 bg-white text-xs text-gray-800 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="urban">Urban (2–5 km spread, Kampala)</option>
                      <option value="suburban">Suburban (5–7 km spread)</option>
                      <option value="rural">Rural / Open (Up to 10 km reach)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">Antenna Tower Height (m)</Label>
                    <Input
                      type="number"
                      min={5}
                      max={150}
                      placeholder="30"
                      value={newGwHeight}
                      onChange={(e) => setNewGwHeight(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-gray-700">Altitude (m ASL, optional)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 1195"
                      value={newGwAltitude}
                      onChange={(e) => setNewGwAltitude(e.target.value)}
                      className="h-8 text-xs bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddForm(false)}
                    className="h-7 text-xs text-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddSingleGateway}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs px-3 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Save Gateway
                  </Button>
                </div>
              </Card>
            )}

            {gateways.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Radio className="w-10 h-10 text-gray-300 mb-2" />
                <h4 className="text-sm font-semibold text-gray-700">No LoRaWAN Gateways Loaded</h4>
                <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                  Click below to load the 5 default AirQo gateways or import a JSON payload.
                </p>
                <Button
                  size="sm"
                  onClick={handleResetToDefaults}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Load AirQo Primary Gateways (5 Gateways)
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg max-h-[380px]">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold w-8">Active</th>
                      <th className="px-3 py-2 text-left font-semibold">Gateway Name & Location</th>
                      <th className="px-3 py-2 text-left font-semibold">Environment (Spread)</th>
                      <th className="px-3 py-2 text-center font-semibold">Antenna Height</th>
                      <th className="px-3 py-2 text-center font-semibold">Max Range</th>
                      <th className="px-3 py-2 text-center font-semibold w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {gateways.map((gw) => {
                      const env = gw.environment || "urban"
                      const isDefault = KAMPALA_SAMPLE_GATEWAYS.some(d => d.name.toLowerCase() === gw.name.toLowerCase() || d.id === gw.id)
                      return (
                        <tr key={gw.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={gw.enabled !== false}
                              onChange={() => toggleGateway(gw.id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                              {gw.name}
                              {isDefault && (
                                <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] rounded font-bold">
                                  Default
                                </span>
                              )}
                              {gw.description?.includes("Altitude") && (
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {gw.description}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              {gw.latitude.toFixed(5)}, {gw.longitude.toFixed(5)}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={env}
                              onChange={(e) => updateGatewayEnvironment(gw.id, e.target.value as GatewayEnvironment)}
                              className="px-2 py-1 rounded border border-gray-200 bg-white text-xs text-gray-800 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="urban">Urban (2–5 km)</option>
                              <option value="suburban">Suburban (5–7 km)</option>
                              <option value="rural">Rural / Open (10 km)</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                min={5}
                                max={150}
                                value={gw.antenna_height_m || 25}
                                onChange={(e) => updateGatewayField(gw.id, "antenna_height_m", Number(e.target.value))}
                                className="w-16 h-7 text-xs text-center p-1"
                              />
                              <span className="text-gray-400 text-[10px]">m</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                step={0.5}
                                min={1}
                                max={25}
                                value={gw.max_range_km ?? ENVIRONMENT_PROFILES[env].maxRadiusKm}
                                onChange={(e) => updateGatewayField(gw.id, "max_range_km", Number(e.target.value))}
                                className="w-16 h-7 text-xs text-center p-1"
                              />
                              <span className="text-gray-400 text-[10px]">km</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {onCenterGateway && (
                                <button
                                  onClick={() => onCenterGateway(gw)}
                                  className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                                  title="Center on Map"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteGateway(gw.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                title="Delete Gateway"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: RF ATTENUATION FACTORS & GUIDE */}
          <TabsContent value="guide" className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="p-3.5 border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <TreePine className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-emerald-900">Maximum Distance: 10 km</h4>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  LoRaWAN reaches up to <strong>10 km</strong> in open layouts, lake shores, and rural expanses without major physical obstructions.
                </p>
                <div className="mt-2 text-[10px] text-emerald-700 font-mono bg-emerald-100/60 p-1.5 rounded">
                  Path Loss Exponent: n ≈ 2.5<br />
                  Spreading Factor: SF11–SF12
                </div>
              </Card>

              <Card className="p-3.5 border-amber-200 bg-amber-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-900">Urban Spread: 2 to 5 km</h4>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Expect reduced coverage (<strong>2 to 5 km</strong>) in dense built-up areas like <strong>Kampala</strong> due to concrete walls and building diffraction.
                </p>
                <div className="mt-2 text-[10px] text-amber-700 font-mono bg-amber-100/60 p-1.5 rounded">
                  Path Loss Exponent: n ≈ 3.8<br />
                  Spreading Factor: SF7–SF10
                </div>
              </Card>

              <Card className="p-3.5 border-indigo-200 bg-indigo-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Signal className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-900">Logarithmic Attenuation</h4>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  Signal strength drops logarithmically over distance depending on obstacles, gateway antenna height, and local topography.
                </p>
                <div className="mt-2 text-[10px] text-indigo-700 font-mono bg-indigo-100/60 p-1.5 rounded">
                  PL(d) = PL₀ + 10·n·log₁₀(d)<br />
                  Antenna Gain: +20·log₁₀(h/10)
                </div>
              </Card>
            </div>

            {/* Signal Drop Radii Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Map Concentric Signal Zones
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-start gap-2 bg-white p-2.5 rounded border border-emerald-200">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-800">Strong Zone (≤ 2 km)</div>
                    <div className="text-[11px] text-gray-600">RSSI &gt; -90 dBm, SF7. Ideal for high-frequency AirQo telemetry.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white p-2.5 rounded border border-amber-200">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-amber-800">Moderate Zone (2–5 km)</div>
                    <div className="text-[11px] text-gray-600">RSSI -90 to -110 dBm, SF9–SF10. Urban concrete boundary.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white p-2.5 rounded border border-red-200">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-600 mt-0.5 flex-shrink-0 border-dashed" />
                  <div>
                    <div className="font-bold text-red-800">Signal Drop Boundary (&gt; 5–10 km)</div>
                    <div className="text-[11px] text-gray-600">Fringe reach / Disconnected. Devices outside require repeater.</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            Gateways are persisted locally and synchronized with maintenance routing.
          </div>
          <Button
            size="sm"
            variant="default"
            onClick={() => onOpenChange(false)}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs px-4"
          >
            Close & View on Map
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
