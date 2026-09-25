"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, Palette } from "lucide-react"
import { Button } from "@/ui/button"

interface MapLayerControlProps {
  onStyleChange: (style: string) => void
  currentStyle: string
}

// Map style options with preview images and labels
const mapStyleOptions = [
  {
    id: "streets",
    label: "Streets",
    previewUrl: "/images/map/street.webp", // Assuming there's a streets.webp file
    description: "Standard street map with labels",
  },
  {
    id: "light",
    label: "Light",
    previewUrl: "/images/map/light.webp",
    description: "Light-colored map for data visualization",
  },
  {
    id: "dark",
    label: "Dark",
    previewUrl: "/images/map/dark.webp",
    description: "Dark-colored map for night viewing",
  },
  {
    id: "satellite",
    label: "Satellite",
    previewUrl: "/images/map/satellite.webp",
    description: "Satellite imagery with street overlays",
  },
]

export function MapLayerControl({ onStyleChange, currentStyle }: MapLayerControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState(currentStyle)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleApply = () => {
    onStyleChange(selectedStyle)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setSelectedStyle(currentStyle) // Reset to current style
    setIsOpen(false)
  }

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <Button
        onClick={() => {
          console.log("Opening map style selector")
          setIsOpen(!isOpen)
        }}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
        aria-label="Change map style"
      >
        <Palette className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div
          ref={modalRef}
          className="absolute top-16 right-0 bg-white rounded-xl shadow-2xl p-6 w-[340px] z-[2000] border border-gray-100"
          style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Map Style</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            {mapStyleOptions.map((style) => (
              <div
                key={style.id}
                className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                  selectedStyle === style.id
                    ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() => setSelectedStyle(style.id)}
              >
                <div className="relative h-24 w-full">
                  <Image src={style.previewUrl || "/placeholder.svg"} alt={style.label} fill className="object-cover" />
                  {selectedStyle === style.id && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 text-center">
                  <div className="text-sm font-semibold text-gray-800">{style.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={handleCancel} className="hover:bg-gray-50 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              Apply Style
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
