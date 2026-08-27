"use client"

import React from "react"
import {
  Layers,
  Radio,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Compass,
  Plus,
  Minus,
  Home,
  Route,
  Pentagon,
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export interface MapTopControlsProps {
  onOpenGatewaysDialog?: () => void
  gatewaysCount?: number
  showDeviceNames?: boolean
  onToggleDeviceNames?: (show: boolean) => void
  showGateways?: boolean
  onToggleGateways?: (show: boolean) => void
  highlightUncoveredDevices?: boolean
  onToggleHighlightUncovered?: (show: boolean) => void
  isSidebarCollapsed?: boolean
  onToggleSidebarCollapse?: () => void
  onExportMap?: () => void
  onExportCSV?: () => void
  onToggleRoute?: () => void
  isRouting?: boolean
  hasRoute?: boolean
  onToggleStyleDialog?: () => void
  onRefreshData?: () => void
  isRefreshing?: boolean
  onResetView?: () => void
  className?: string
}

export interface MapBottomControlsProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onGeolocation?: () => void
  onTogglePolygonDraw?: () => void
  isDrawingPolygon?: boolean
  hasPolygon?: boolean
  className?: string
}

export interface MapControlsProps extends MapTopControlsProps, MapBottomControlsProps {}

/**
 * Top Right Action Controls for Map
 */
export const MapTopControls: React.FC<MapTopControlsProps> = ({
  onResetView,
  onRefreshData,
  isRefreshing = false,
  onToggleStyleDialog,
  onOpenGatewaysDialog,
  gatewaysCount = 0,
  onExportMap,
  onExportCSV,
  onToggleRoute,
  isRouting = false,
  hasRoute = false,
  showDeviceNames = false,
  onToggleDeviceNames,
  showGateways = false,
  onToggleGateways,
  highlightUncoveredDevices = false,
  onToggleHighlightUncovered,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-1.5 flex-shrink-0 ${className}`}>
      {/* LoRaWAN Gateways Pill (only when LoRaWAN visibility is on) */}
      {onOpenGatewaysDialog && showGateways && (
        <button
          onClick={onOpenGatewaysDialog}
          className="flex items-center px-2.5 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md hover:bg-indigo-50/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all"
          title="Manage LoRaWAN Gateways"
        >
          <Radio className="w-3.5 h-3.5 mr-1 text-indigo-600" />
          <span>Gateways</span>
          <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 text-[10px] rounded-full font-bold">
            {gatewaysCount}
          </span>
        </button>
      )}

      {/* Route Action Button */}
      {onToggleRoute && (
        <button
          onClick={onToggleRoute}
          className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all ${
            isRouting || hasRoute
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          title={isRouting || hasRoute ? "Clear active route" : "Generate optimal maintenance route"}
        >
          <Route className="w-3.5 h-3.5 mr-1" />
          <span>{isRouting || hasRoute ? "Clear Route" : "Optimize"}</span>
        </button>
      )}

      {/* Unified Export Dropdown (Map & CSV) */}
      {(onExportMap || onExportCSV) && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center px-2.5 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md hover:bg-gray-50 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700 rounded-full text-xs font-semibold shadow-md hover:shadow-lg transition-all gap-1"
              title="Export map visual or devices CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-48 p-1.5 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-[1200]"
          >
            <div className="space-y-1 text-xs">
              {onExportMap && (
                <button
                  onClick={onExportMap}
                  className="w-full text-left px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <div>
                    <div className="font-semibold">Export Map View</div>
                    <div className="text-[10px] text-gray-400">PNG, PDF or GeoJSON</div>
                  </div>
                </button>
              )}
              {onExportCSV && (
                <button
                  onClick={onExportCSV}
                  className="w-full text-left px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <div>
                    <div className="font-semibold">Export Device CSV</div>
                    <div className="text-[10px] text-gray-400">Locations & diagnostics</div>
                  </div>
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Action icons cluster */}
      <div className="flex items-center gap-0.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-1 rounded-full border border-gray-200/80 dark:border-gray-700 shadow-md">
        {/* Map Style Dialog */}
        {onToggleStyleDialog && (
          <button
            onClick={onToggleStyleDialog}
            className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 transition-colors"
            title="Change Map Style & Base Tiles"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Visibility Controls Popover */}
        {(onToggleDeviceNames || onToggleGateways) && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  showDeviceNames || showGateways
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
                title="Layer & Elements Visibility (Device Names, LoRaWAN)"
              >
                {showDeviceNames || showGateways ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-4 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-[1200]"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      Map Visibility
                    </h4>
                  </div>
                  {(showDeviceNames || showGateways) && (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                {/* Device Names Toggle */}
                {onToggleDeviceNames && (
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="toggle-device-names"
                        className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer"
                      >
                        Device Names
                      </Label>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                        Show device name badges beside markers
                      </p>
                    </div>
                    <Switch
                      id="toggle-device-names"
                      checked={showDeviceNames}
                      onCheckedChange={onToggleDeviceNames}
                    />
                  </div>
                )}

                {/* LoRaWAN Information Toggle */}
                {onToggleGateways && (
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="toggle-gateways"
                        className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer"
                      >
                        LoRaWAN Information
                      </Label>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                        Show gateway towers & coverage zones
                      </p>
                    </div>
                    <Switch
                      id="toggle-gateways"
                      checked={showGateways}
                      onCheckedChange={onToggleGateways}
                    />
                  </div>
                )}

                {/* Highlight Uncovered Toggle (only when LoRaWAN info is active) */}
                {showGateways && onToggleHighlightUncovered && (
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="toggle-uncovered"
                        className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer"
                      >
                        Highlight Blindspots
                      </Label>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                        Pulsing indicators on devices outside coverage
                      </p>
                    </div>
                    <Switch
                      id="toggle-uncovered"
                      checked={highlightUncoveredDevices}
                      onCheckedChange={onToggleHighlightUncovered}
                    />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Refresh Map Data */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
            title="Refresh Map Readings"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        )}

        {/* Reset View */}
        {onResetView && (
          <button
            onClick={onResetView}
            className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 transition-colors"
            title="Reset to Default View"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Toggle Sidebar Collapse / Maximize Map */}
        {onToggleSidebarCollapse && (
          <button
            onClick={onToggleSidebarCollapse}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              isSidebarCollapsed
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
            title={isSidebarCollapsed ? "Show Devices & Search" : "Collapse Sidebar / Maximize Map"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Bottom Right Controls for Map: Geolocation, Zoom In & Zoom Out, Polygon Selection Tool
 */
export const MapBottomControls: React.FC<MapBottomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onGeolocation,
  onTogglePolygonDraw,
  isDrawingPolygon = false,
  hasPolygon = false,
  className = "",
}) => {
  return (
    <div
      className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] flex flex-col items-center gap-2 pointer-events-auto ${className}`}
    >
      {/* Polygon Draw Tool */}
      {onTogglePolygonDraw && (
        <button
          onClick={onTogglePolygonDraw}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all ${
            isDrawingPolygon || hasPolygon
              ? "bg-blue-600 text-white ring-2 ring-blue-400"
              : "bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-gray-300 hover:bg-gray-50 border border-gray-200 dark:border-gray-700"
          }`}
          title="Draw Polygon to Select Area Devices"
          aria-label="Draw Polygon Area"
        >
          <Pentagon className="w-4 h-4" />
        </button>
      )}

      {/* Geolocation */}
      {onGeolocation && (
        <button
          onClick={onGeolocation}
          className="w-10 h-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md hover:bg-gray-50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full shadow-md hover:shadow-lg flex items-center justify-center transition-all"
          title="Locate My Position"
          aria-label="Find my location"
        >
          <Compass className="w-4 h-4" />
        </button>
      )}

      {/* Zoom In & Out - Grouped Stack in the Bottom Right Corner */}
      <div className="flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full shadow-md overflow-hidden">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 transition-colors border-b border-gray-100 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * Combined MapControls
 */
export const MapControls: React.FC<MapControlsProps> = (props) => {
  return (
    <>
      <MapTopControls {...props} />
      <MapBottomControls {...props} />
    </>
  )
}
