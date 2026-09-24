"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"

const COUNTRY_LEVEL_ZOOM = 6
let browserLocationRequest: Promise<GeolocationPosition> | null = null

const getBrowserLocation = () => {
  if (!browserLocationRequest) {
    browserLocationRequest = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        maximumAge: 30 * 60 * 1000,
        timeout: 6000,
      })
    })
  }

  return browserLocationRequest
}

export function InitialCountryView({ disabled = false }: { disabled?: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (disabled || typeof navigator === "undefined" || !navigator.geolocation) return

    let cancelled = false
    let userInteracted = false
    const markInteraction = () => {
      userInteracted = true
    }
    const mapContainer = map.getContainer()

    mapContainer.addEventListener("pointerdown", markInteraction, true)
    mapContainer.addEventListener("wheel", markInteraction, true)
    mapContainer.addEventListener("keydown", markInteraction, true)

    void getBrowserLocation()
      .then((position) => {
        if (cancelled || userInteracted) return

        map.flyTo(
          [position.coords.latitude, position.coords.longitude],
          COUNTRY_LEVEL_ZOOM,
          { duration: 0.8 },
        )
      })
      .catch(() => {
        // Keep the existing default map view when location is unavailable or denied.
      })

    return () => {
      cancelled = true
      mapContainer.removeEventListener("pointerdown", markInteraction, true)
      mapContainer.removeEventListener("wheel", markInteraction, true)
      mapContainer.removeEventListener("keydown", markInteraction, true)
    }
  }, [disabled, map])

  return null
}
