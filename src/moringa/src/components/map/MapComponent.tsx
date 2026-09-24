"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, useMap, Marker, Polygon } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Location } from "@/lib/types"
import { NavigationControls } from "./NavigationControls"
import { MapLayerControl } from "./MapLayerControl"
import { InitialCountryView } from "./InitialCountryView"

// Keep Leaflet's default marker assets local so Next.js never requests /marker-icon.png.
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
})

// Create custom icons for different marker types
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
})

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
})

// Update the mapStyles object to include more Mapbox styles
const mapStyles = {
  streets: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
  satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
  dark: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
  light: `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
 }

type MapStyle = keyof typeof mapStyles

interface MapComponentProps {
  polygon: Location[]
  mustHaveLocations: Location[]
  suggestedLocations: Location[]
  onPolygonChange: (locations: Location[]) => void
  onLocationClick: (location: Location) => void
  isDrawing: boolean
  isSelectingPriority: boolean
}

// Add map instance to window for global access
declare global {
  interface Window {
    map: L.Map
  }
}

function MapStyleButton() {
  const map = useMap()
  const [currentStyle, setCurrentStyle] = useState<MapStyle>("streets")

  const handleStyleChange = (style: string) => {
    console.log("Changing map style to:", style)
    setCurrentStyle(style as MapStyle)

    // Find and remove the existing tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Add the new tile layer with Mapbox-specific options
    L.tileLayer(mapStyles[style as MapStyle], {
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(map)
  }

  return (
    <div className="absolute right-4 top-20 z-[1000]">
      <MapLayerControl onStyleChange={handleStyleChange} currentStyle={currentStyle} />
    </div>
  )
}

function MapController() {
  const map = useMap()
  useEffect(() => {
    window.map = map
  }, [map])
  return null
}

function FitMapToData({
  polygon,
  mustHaveLocations,
  suggestedLocations,
}: Pick<MapComponentProps, "polygon" | "mustHaveLocations" | "suggestedLocations">) {
  const map = useMap()

  useEffect(() => {
    const locations = [...polygon, ...mustHaveLocations, ...suggestedLocations]
    if (!locations.length) return

    const bounds = L.latLngBounds(locations.map((location) => [location.lat, location.lng]))
    if (!bounds.isValid()) return

    if (locations.length === 1) {
      map.flyTo(bounds.getCenter(), 13, { duration: 0.8 })
      return
    }

    map.fitBounds(bounds, {
      paddingTopLeft: [48, 110],
      paddingBottomRight: [48, 48],
      maxZoom: 14,
      animate: true,
    })
  }, [map, mustHaveLocations, polygon, suggestedLocations])

  return null
}

function DrawControl({
  onPolygonChange,
}: {
  onPolygonChange: (locations: Location[]) => void
}) {
  const map = useMap()
  const drawingRef = useRef<L.Polyline>()
  const locationsRef = useRef<Location[]>([])

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      const newLocation = { lat: e.latlng.lat, lng: e.latlng.lng }
      locationsRef.current = [...locationsRef.current, newLocation]

      if (!drawingRef.current) {
        drawingRef.current = L.polyline([], { color: "blue" }).addTo(map)
      }

      drawingRef.current.setLatLngs(locationsRef.current)
      onPolygonChange(locationsRef.current)
    }

    map.on("click", handleClick)

    return () => {
      map.off("click", handleClick)
      drawingRef.current?.remove()
    }
  }, [map, onPolygonChange])

  return null
}

function PriorityLocationControl({ onLocationClick }: { onLocationClick: (location: Location) => void }) {
  const map = useMap()

  useEffect(() => {
    const handleClick = (event: L.LeafletMouseEvent) => {
      onLocationClick({ lat: event.latlng.lat, lng: event.latlng.lng })
    }

    map.getContainer().style.cursor = "crosshair"
    map.on("click", handleClick)

    return () => {
      map.getContainer().style.cursor = ""
      map.off("click", handleClick)
    }
  }, [map, onLocationClick])

  return null
}

// Add a check for the Mapbox token at the beginning of the component
export default function MapComponent({
  polygon,
  mustHaveLocations,
  suggestedLocations,
  onPolygonChange,
  onLocationClick,
  isDrawing,
  isSelectingPriority,
}: MapComponentProps) {
  // Check if Mapbox token is available
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!mapboxToken) {
    console.warn("Mapbox token is not set in environment variables. Map functionality may be limited.")
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[1.3733, 32.2903]} // Uganda center
        zoom={7}
        className="h-full w-full"
      >
        <MapController />
        <InitialCountryView
          disabled={polygon.length > 0 || mustHaveLocations.length > 0 || suggestedLocations.length > 0}
        />
        <FitMapToData
          polygon={polygon}
          mustHaveLocations={mustHaveLocations}
          suggestedLocations={suggestedLocations}
        />
        <MapStyleButton />
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={mapStyles.streets}
          tileSize={512}
          zoomOffset={-1}
        />

        {isDrawing && <DrawControl onPolygonChange={onPolygonChange} />}
        {isSelectingPriority && !isDrawing ? <PriorityLocationControl onLocationClick={onLocationClick} /> : null}

        {polygon.length > 2 && (
          <Polygon
            positions={polygon.map((loc) => [loc.lat, loc.lng])}
            pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.12, weight: 3 }}
          />
        )}

        {mustHaveLocations.map((location, index) => (
          <Marker
            key={`must-have-${location.lat}-${location.lng}-${index}`}
            position={[location.lat, location.lng]}
            icon={greenIcon}
          />
        ))}

        {suggestedLocations.map((location, index) => (
          <Marker
            key={`suggested-${location.lat}-${location.lng}-${index}`}
            position={[location.lat, location.lng]}
            icon={blueIcon}
          />
        ))}
      </MapContainer>

      <NavigationControls />
    </div>
  )
}
