"use client"
import { useEffect, useRef } from "react"
import type { AqiMapData, MapProps } from "@/lib/types" 
// Dynamically import Leaflet to avoid SSR issues
//import dynamic from "next/dynamic"
//const L = dynamic(() => import("leaflet"), { ssr: false })

interface AqiHeatmapProps extends MapProps {
  isVisible: boolean
  onLayerReady?: (layer: any) => void
}

export default function AqiHeatmap({ map, isVisible, onLayerReady }: AqiHeatmapProps) {
  const layerRef = useRef<any>(null)
  const isLoadedRef = useRef(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined" || !map) return

    const fetchAndOverlayImage = async () => {
      try {
        // Dynamically import Leaflet
        const leaflet = await import("leaflet")

        const res = await fetch(process.env.NEXT_PUBLIC_AQI_API_URL as string)
        const data: AqiMapData = await res.json()

        const { image, bounds } = data.mapimage

        const imageBounds: any = bounds

        // Create the layer but don't add it to map yet
        const imageLayer = leaflet.default.imageOverlay(image, imageBounds, {
          opacity: 0.3,
        })

        layerRef.current = imageLayer
        isLoadedRef.current = true

        // Add to map if visible by default
        if (isVisible) {
          imageLayer.addTo(map)
        }

        // Notify parent component that layer is ready
        if (onLayerReady) {
          onLayerReady(imageLayer)
        }
      } catch (err) {
        console.error("Error loading AQI heatmap:", err)
      }
    }

    if (!isLoadedRef.current) {
      fetchAndOverlayImage()
    }

    // Cleanup function
    return () => {
      if (layerRef.current && map && typeof window !== "undefined") {
        try {
          map.removeLayer(layerRef.current)
        } catch (error) {
          // Layer might not be on map, ignore error
          console.warn("Ignored error during layer removal:", error);
        }
      }
    }
  }, [map, onLayerReady, isVisible])

  // Handle visibility changes
  useEffect(() => {
    if (typeof window === "undefined" || !layerRef.current || !map) return

    if (isVisible) {
      if (!map.hasLayer(layerRef.current)) {
        layerRef.current.addTo(map)
      }
    } else {
      if (map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [isVisible, map])

  return null
}
