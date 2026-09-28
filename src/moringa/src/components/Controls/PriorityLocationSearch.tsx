"use client"

import { useEffect, useState } from "react"
import { MapPin, Search, X } from "lucide-react"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { useToast } from "@/ui/use-toast"
import type { Location } from "@/lib/types"

interface PriorityLocationSearchProps {
  onLocationFound: (location: Location) => void
}

interface LocationSuggestion {
  name: string
  lat: number
  lng: number
}

export function PriorityLocationSearch({ onLocationFound }: PriorityLocationSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error("Location search failed")

        const data = await response.json()
        setSuggestions(
          data
            .map((item: any) => ({
              name: item.display_name,
              lat: Number.parseFloat(item.lat),
              lng: Number.parseFloat(item.lon),
            }))
            .filter((item: LocationSuggestion) => Number.isFinite(item.lat) && Number.isFinite(item.lng)),
        )
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([])
        }
      }
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [query])

  const addLocation = (location: LocationSuggestion) => {
    onLocationFound({ lat: location.lat, lng: location.lng })
    setQuery("")
    setSuggestions([])
    window.map?.flyTo([location.lat, location.lng], 14, { duration: 0.8 })
    toast({
      title: "Priority location added",
      description: location.name,
    })
  }

  const searchFirstResult = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      )
      if (!response.ok) throw new Error("Location search failed")

      const [result] = await response.json()
      const location = result
        ? {
            name: result.display_name,
            lat: Number.parseFloat(result.lat),
            lng: Number.parseFloat(result.lon),
          }
        : null

      if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
        toast({
          title: "Location not found",
          description: "Try another place name.",
          variant: "destructive",
        })
        return
      }

      addLocation(location)
    } catch {
      toast({
        title: "Search failed",
        description: "Unable to search for that location.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          searchFirstResult()
        }}
      >
        <div className="relative min-w-0 flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a priority location"
            className="h-11 rounded-xl border-slate-300 bg-slate-50 pl-9 pr-9 focus-visible:bg-white"
            disabled={isLoading}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setSuggestions([])
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Clear priority location search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !query.trim()}
          className="h-11 w-11 shrink-0 rounded-xl bg-blue-700 text-white hover:bg-blue-600"
          aria-label="Search for priority location"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {suggestions.length > 0 ? (
        <ul className="absolute z-[1200] mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {suggestions.map((suggestion) => (
            <li key={`${suggestion.lat}-${suggestion.lng}`}>
              <button
                type="button"
                className="w-full rounded-lg p-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-800"
                onClick={() => addLocation(suggestion)}
              >
                {suggestion.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
