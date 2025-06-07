"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Device {
  id: string
  name: string
  status: string
  lat: number
  lng: number
  lastUpdate?: string
  battery?: string
  latest_reading?: {
    pm2_5: number
    pm10: number
    timestamp?: string
    aqi_category?: string
    aqi_color?: string
    no2?: number
  }
}

interface DeviceMapProps {
  devices: Device[]
  selectedDeviceId?: string
}

export default function DeviceMap({ devices = [], selectedDeviceId }: DeviceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const hasInitializedRef = useRef(false)

  // Log the devices to help with debugging
  useEffect(() => {
    console.log("Devices passed to map:", devices);
  }, [devices]);

  // Initialize map and update markers in a single useEffect
  useEffect(() => {
    // Skip if no map container or already initialized
    if (!mapRef.current) return

    // Create map only once
    if (!mapInstanceRef.current) {
      try {
        // Fix for Leaflet icon issues
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        // Create map centered on Africa
        const map = L.map(mapRef.current).setView([5, 20], 3)

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map)

        mapInstanceRef.current = map
        hasInitializedRef.current = true
      } catch (error) {
        console.error("Error initializing map:", error)
        return
      }
    }

    // Skip marker updates if map isn't initialized
    if (!hasInitializedRef.current || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.remove()
    })
    markersRef.current = []

    try {
      // Define custom icon for each status
      const createCustomIcon = (status: string, isSelected: boolean) => {
        const markerColor = status === "active" ? "#4CAF50" : status === "warning" ? "#FFC107" : "#F44336"
        const size = isSelected ? 30 : 20
        const borderWidth = isSelected ? 3 : 2

        return L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${markerColor}; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${borderWidth}px solid white; ${isSelected ? "box-shadow: 0 0 0 2px #000;" : ""}"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
      }

      // Add markers for each device
      if (Array.isArray(devices) && devices.length > 0) {
        // Create a bounds object directly from device coordinates
        const latLngs = devices.map((device) => L.latLng(device.lat, device.lng))
        const bounds = L.latLngBounds(latLngs)

        // Add markers
        devices.forEach((device) => {
          console.log("Rendering device on map:", device.id, "with readings:", device.latest_reading);
          
          const isSelected = device.id === selectedDeviceId
          const icon = createCustomIcon(device.status, isSelected)

          const marker = L.marker([device.lat, device.lng], {
            icon: icon,
          }).addTo(mapInstanceRef.current!)

          // Store marker for cleanup
          markersRef.current.push(marker)

          // Format PM2.5 and PM10 values with 1 decimal place if they exist
          const pm25Value = device.latest_reading?.pm2_5 !== undefined && device.latest_reading?.pm2_5 !== null ? 
            Number(device.latest_reading.pm2_5).toFixed(1) : 'No data';
          
          const pm10Value = device.latest_reading?.pm10 !== undefined && device.latest_reading?.pm10 !== null ? 
            Number(device.latest_reading.pm10).toFixed(1) : 'No data';

          // Add popup with device info
          marker.bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 5px; font-weight: bold;">${device.name}</h3>
              <p style="margin: 0 0 5px;">ID: ${device.id}</p>
              <p style="margin: 0 0 5px;">Status: 
                <span style="color: ${
                  device.status === "active" ? "#4CAF50" : device.status === "warning" ? "#FFC107" : "#F44336"
                }; font-weight: bold;">
                  ${device.status.toUpperCase()}
                </span>
              </p>
              ${device.lastUpdate ? `<p style="margin: 0 0 5px;">Last Update: ${device.lastUpdate}</p>` : ""}
              ${device.battery ? `<p style="margin: 0 0 5px;">Battery: ${device.battery}</p>` : ""}
              ${
                device.status !== "offline"
                  ? `
                <p style="margin: 0 0 5px;">PM2.5: ${pm25Value} μg/m³</p>
                <p style="margin: 0 0 5px;">PM10: ${pm10Value} μg/m³</p>
                ${device.latest_reading?.aqi_category ? 
                  `<p style="margin: 0 0 5px;">AQI: ${device.latest_reading.aqi_category}</p>` : ''}
              `
                  : ""
              }
              <div style="margin-top: 10px; text-align: center;">
                <a href="/dashboard/devices/${device.id}" style="display: inline-block; padding: 5px 10px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">View Details</a>
              </div>
            </div>
          `)

          // If this is the selected device, open its popup
          if (isSelected) {
            marker.openPopup()
          }
        })

        // Fit the map to the bounds with some padding
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 10,
        })
      }

      // Add Africa outline GeoJSON for better visualization
      if (!geoJsonLayerRef.current) {
        fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
          .then((response) => response.json())
          .then((data) => {
            if (!mapInstanceRef.current) return

            const africaCountries = data.features.filter((feature: any) => {
              const africanCountries = [
                "DZA",
                "AGO",
                "BEN",
                "BWA",
                "BFA",
                "BDI",
                "CMR",
                "CPV",
                "CAF",
                "TCD",
                "COM",
                "COG",
                "COD",
                "DJI",
                "EGY",
                "GNQ",
                "ERI",
                "ETH",
                "GAB",
                "GMB",
                "GHA",
                "GIN",
                "GNB",
                "CIV",
                "KEN",
                "LSO",
                "LBR",
                "LBY",
                "MDG",
                "MWI",
                "MLI",
                "MRT",
                "MUS",
                "MAR",
                "MOZ",
                "NAM",
                "NER",
                "NGA",
                "RWA",
                "STP",
                "SEN",
                "SYC",
                "SLE",
                "SOM",
                "ZAF",
                "SSD",
                "SDN",
                "SWZ",
                "TZA",
                "TGO",
                "TUN",
                "UGA",
                "ZMB",
                "ZWE",
              ]
              return africanCountries.includes(feature.properties.iso_a3)
            })

            geoJsonLayerRef.current = L.geoJSON(
              { type: "FeatureCollection", features: africaCountries },
              {
                style: {
                  color: "#666",
                  weight: 1,
                  fillColor: "#f8f8f8",
                  fillOpacity: 0.1,
                },
              },
            ).addTo(mapInstanceRef.current)
          })
          .catch((error) => console.error("Error loading GeoJSON:", error))
      }
    } catch (error) {
      console.error("Error updating map markers:", error)
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        // Clear all markers
        markersRef.current.forEach((marker) => {
          marker.remove()
        })
        markersRef.current = []

        // Remove GeoJSON layer
        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.remove()
          geoJsonLayerRef.current = null
        }

        // Remove map
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        hasInitializedRef.current = false
      }
    }
  }, [devices, selectedDeviceId])

  return <div ref={mapRef} className="h-full w-full" />
}