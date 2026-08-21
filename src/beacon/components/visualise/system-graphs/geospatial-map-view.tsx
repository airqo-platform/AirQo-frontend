"use client"

import React, { useEffect, useRef, useMemo } from "react"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { StandardizedRecord } from "@/lib/visualise/column-mapper"
import { getAQICategory, AQI_CATEGORIES } from "@/lib/visualise/column-mapper"

const escapeHtml = (v: unknown): string => {
  if (v === null || v === undefined) return ""
  return String(v).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      case "'":
        return "&#39;"
      default:
        return c
    }
  })
}

interface GeospatialMapViewProps {
  records: StandardizedRecord[]
}

export function GeospatialMapView({ records }: GeospatialMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  // Filter records with valid coordinates
  const validGeoRecords = useMemo(() => {
    return records.filter((r) => r.latitude !== null && r.longitude !== null)
  }, [records])

  // Group by device to find latest state & coordinate path
  const devicesMap = useMemo(() => {
    const MAX_POINTS_PER_DEVICE = 500
    const map = new Map<
      string,
      {
        deviceName: string
        latestRecord: StandardizedRecord
        points: Array<[number, number]>
      }
    >()

    for (const r of validGeoRecords) {
      const lat = r.latitude!
      const lng = r.longitude!

      if (!map.has(r.deviceName)) {
        map.set(r.deviceName, {
          deviceName: r.deviceName,
          latestRecord: r,
          points: [[lat, lng]],
        })
      } else {
        const item = map.get(r.deviceName)!
        const lastPt = item.points[item.points.length - 1]

        // Deduplicate consecutive identical coordinates & enforce maximum vertex cap
        if (!lastPt || lastPt[0] !== lat || lastPt[1] !== lng) {
          if (item.points.length < MAX_POINTS_PER_DEVICE) {
            item.points.push([lat, lng])
          }
        }

        if (r.timestamp && (!item.latestRecord.timestamp || r.timestamp > item.latestRecord.timestamp)) {
          item.latestRecord = r
        }
      }
    }

    return Array.from(map.values())
  }, [validGeoRecords])

  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return

      try {
        const L = (await import("leaflet")).default

        if (!isMounted) return

        // If map already exists, remove it
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        // Center on average coords or default to Kampala (0.3476, 32.5825)
        let centerLat = 0.3476
        let centerLng = 32.5825
        let zoom = 11

        if (validGeoRecords.length > 0) {
          const lats = validGeoRecords.map((r) => r.latitude!)
          const lngs = validGeoRecords.map((r) => r.longitude!)
          centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
          centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
        }

        const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], zoom)
        mapInstanceRef.current = map

        // OpenStreetMap base tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map)

        const bounds = L.latLngBounds([])

        // Add markers for each device
        devicesMap.forEach((dev) => {
          const rec = dev.latestRecord
          const lat = rec.latitude!
          const lng = rec.longitude!
          bounds.extend([lat, lng])

          const aqi = getAQICategory(rec.pm25)

          // Custom circle marker
          const circle = L.circleMarker([lat, lng], {
            radius: 10,
            fillColor: aqi.color,
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85,
          }).addTo(map)

          // Popup HTML (properly escaped against XSS)
          const safeDeviceName = escapeHtml(dev.deviceName)
          const safeCategory = escapeHtml(aqi.category)
          const safePm25 = rec.pm25 !== null ? `${escapeHtml(rec.pm25)} µg/m³` : "N/A"
          const safeS1Pm25 = rec.s1Pm25 !== null ? `<div><b>S1 PM2.5:</b> ${escapeHtml(rec.s1Pm25)} µg/m³</div>` : ""
          const safeS2Pm25 = rec.s2Pm25 !== null ? `<div><b>S2 PM2.5:</b> ${escapeHtml(rec.s2Pm25)} µg/m³</div>` : ""
          const safeBattery = rec.battery !== null ? `<div><b>Battery:</b> ${escapeHtml(rec.battery)} V</div>` : ""
          const safeTemp = rec.primaryTemp !== null ? `<div><b>Temp:</b> ${escapeHtml(rec.primaryTemp)} °C</div>` : ""

          const popupHtml = `
            <div style="font-family: system-ui, sans-serif; min-width: 180px; font-size: 12px; line-height: 1.4;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px; font-size: 13px;">${safeDeviceName}</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="background: ${aqi.color}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 10px;">${safeCategory}</span>
                <span style="color: #64748b; font-family: monospace; font-size: 11px;">${safePm25}</span>
              </div>
              <div style="color: #334155; font-size: 11px; border-top: 1px solid #f1f5f9; padding-top: 4px; margin-top: 4px;">
                ${safeS1Pm25}
                ${safeS2Pm25}
                ${safeBattery}
                ${safeTemp}
                <div style="color: #94a3b8; font-size: 10px; margin-top: 4px;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</div>
              </div>
            </div>
          `
          circle.bindPopup(popupHtml)

          // Polyline route trail if device moved across multiple coordinates
          if (dev.points.length > 1) {
            L.polyline(dev.points, {
              color: aqi.color,
              weight: 3,
              opacity: 0.5,
              dashArray: "4, 6",
            }).addTo(map)
          }
        })

        if (devicesMap.length > 1 && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40] })
        }
      } catch (err) {
        console.error("Leaflet map initialization error:", err)
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [validGeoRecords, devicesMap])

  if (validGeoRecords.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-12 text-center text-slate-500 text-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-700">No Geospatial Coordinates Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Ensure your dataset has valid Latitude and Longitude columns mapped in the Column Mapping Wizard.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-3 pt-4 px-6 flex flex-row items-center justify-between border-b border-slate-100">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            Geospatial Sensor Map ({devicesMap.length} Locations)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Interactive map displaying device positions, AQI category color codes, and sensor telemetry popups
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-purple-600 bg-purple-50">
            {validGeoRecords.length.toLocaleString()} Geotagged Records
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Canvas Container */}
        <div ref={mapContainerRef} className="h-[520px] w-full z-0" />

        {/* AQI Category Map Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">AQI Index:</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              {AQI_CATEGORIES.filter((c) => c.category !== "Unknown").map((cat) => (
                <span key={cat.category} className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.category}
                </span>
              ))}
            </div>
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            OpenStreetMap Tiles
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
