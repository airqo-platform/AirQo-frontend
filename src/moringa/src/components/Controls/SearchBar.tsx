"use client"

import { useState, useEffect } from "react"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Search, X } from "lucide-react"
import { useToast } from "@/ui/use-toast"
import type { Location } from "@/lib/types"

interface SearchBarProps {
  onSearch: (query: string) => void
  onBoundaryFound: (boundary: Location[]) => void
}

export function SearchBar({ onSearch, onBoundaryFound }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<{ name: string; osm_id: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch autocomplete suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]) // Hide suggestions if query is too short
        return
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        )
        const data = await response.json()
        setSuggestions(
          data.map((item: any) => ({
            name: item.display_name,
            osm_id: item.osm_id,
          })),
        )
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300) // Debounce API calls
    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle search (when user submits form or selects a suggestion)
  const searchLocation = async (selectedQuery?: string, selectedOsmId?: number) => {
    const searchQuery = selectedQuery || query
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setSuggestions([]) // Hide suggestions after selection

    try {
      const searchResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery,
        )}&format=json&polygon_geojson=1&limit=1`,
      )
      const searchResults = await searchResponse.json()

      if (searchResults.length === 0) {
        toast({
          title: "Location not found",
          description: "Try another search term.",
          variant: "destructive",
        })
        return
      }

      const osmId = selectedOsmId || searchResults[0].osm_id

      // Fetch boundary data
      const boundaryResponse = await fetch(
        `https://nominatim.openstreetmap.org/lookup?osm_ids=R${osmId}&polygon_geojson=1&format=json`,
      )
      const boundaryData = await boundaryResponse.json()

      if (boundaryData[0]?.geojson?.coordinates?.[0]) {
        const boundary = boundaryData[0].geojson.coordinates[0].map(([lng, lat]: number[]) => ({ lat, lng }))
        onBoundaryFound(boundary)
        onSearch(searchQuery)

        // Center the map on the first coordinate of the boundary
        if (window.map) {
          const center = boundary[0]
          window.map.setView([center.lat, center.lng], 12)
        }

        toast({
          title: "Location found",
          description: `Boundary drawn for ${searchResults[0].display_name}`,
        })
      } else {
        toast({
          title: "Boundary not found",
          description: "No boundary data available",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log("Error searching location:", error)
      toast({
        title: "Error",
        description: "Failed to search location",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          searchLocation()
        }}
        className="flex gap-2"
      >
        <Input
          type="text"
          placeholder="Search location (e.g., Kampala)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 flex-1 rounded-xl border-slate-300 bg-white"
          disabled={isLoading}
        />
        {query && (
          <Button type="button" size="icon" variant="ghost" onClick={() => setQuery("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !query.trim()}
          className="h-11 w-11 rounded-xl bg-blue-700 text-white hover:bg-blue-600"
          aria-label="Search for boundary"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Dropdown Suggestions */}
      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="cursor-pointer rounded-lg p-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-800"
              onClick={() => {
                setQuery(suggestion.name)
                setSuggestions([]) // Hide suggestions
                searchLocation(suggestion.name, suggestion.osm_id)
              }}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
