"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Check, Layers } from "lucide-react"

export interface MapTileStyle {
  id: string
  name: string
  url: string
  attribution: string
  description: string
  badgeColor: string
}

export const MAP_TILE_STYLES: MapTileStyle[] = [
  {
    id: "voyager",
    name: "CartoDB Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    description: "Detailed street names, green parks, and vibrant terrain (Recommended)",
    badgeColor: "bg-blue-500",
  },
  {
    id: "light",
    name: "CartoDB Positron",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    description: "Clean, minimal light background highlighting device markers",
    badgeColor: "bg-gray-400",
  },
  {
    id: "osm",
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    description: "Standard open-source crowd-mapped cartography",
    badgeColor: "bg-emerald-500",
  },
  {
    id: "dark",
    name: "Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    description: "High-contrast dark canvas for night views",
    badgeColor: "bg-slate-800",
  },
  {
    id: "satellite",
    name: "Satellite / Aerial",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    description: "High-resolution satellite and aerial photography",
    badgeColor: "bg-amber-600",
  },
]

interface MapStyleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStyleId: string
  onSelectStyle: (style: MapTileStyle) => void
}

export const MapStyleDialog: React.FC<MapStyleDialogProps> = ({
  open,
  onOpenChange,
  currentStyleId,
  onSelectStyle,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Layers className="w-4 h-4 text-blue-600" />
            Base Map Layers & Style
          </DialogTitle>
          <DialogDescription className="text-xs">
            Choose your preferred map canvas style and imagery layer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2.5 py-2">
          {MAP_TILE_STYLES.map((style) => {
            const isSelected = currentStyleId === style.id
            return (
              <div
                key={style.id}
                onClick={() => {
                  onSelectStyle(style)
                  onOpenChange(false)
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-3.5 h-3.5 rounded-full ${style.badgeColor} shadow-xs`} />
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {style.name}
                      {isSelected && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.2 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {style.description}
                    </p>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
