"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet-geosearch/dist/geosearch.css"
import Papa from "papaparse"
import { useMap, useMapEvents } from "react-leaflet"
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Download,
  Gauge,
  Info,
  Loader2,
  MapPin,
  Network,
  PieChart,
  Satellite,
  Sparkles,
  X,
} from "lucide-react"

import { FileUpload } from "@/components/Controls/FileUpload"
import { InitialCountryView } from "@/components/map/InitialCountryView"
import Navigation from "@/components/navigation/navigation"
import { getSiteCategory } from "@/lib/api"
import type {
  Location,
  SourceCandidate,
  SourceMetadataDateRange,
  SourceMetadataMatchedFeature,
  SourceMetadataResponse,
  SourceMetadataSentinel2Context,
  SourceMetadataSiteCategory,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Label } from "@/ui/label"
import { Switch } from "@/ui/switch"
import { Textarea } from "@/ui/textarea"
import { useToast } from "@/ui/use-toast"
import "leaflet/dist/leaflet.css"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface SiteCategoryInfo extends Location {
  area_name: string | null
  category: string | null
  candidate_sources: SourceCandidate[]
  computed_at_utc: string | null
  cache_hit: boolean | null
  data_sources: string[]
  date_range: SourceMetadataDateRange | null
  disclaimer: string | null
  elapsed_ms: number | null
  matched_feature: SourceMetadataMatchedFeature | null
  message: string
  model_version: string | null
  nearby_feature_counts: Record<string, number>
  osm_debug_info: string[]
  primary_confidence: number | null
  primary_source: string | null
  satellite_enabled: boolean
  satellite_error: string | null
  satellite_data_used: boolean
  satellite_pollutants_mean: Record<string, number | null>
  satellite_provider: string | null
  satellite_reasoning: string[]
  sentinel2_context: SourceMetadataSentinel2Context | null
  site_category: SourceMetadataSiteCategory | null
  site_reasoning: string[]
}

const sourceLabel = (value: string | null | undefined) =>
  value
    ? value
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Unknown"

const confidenceLabel = (value: number | null | undefined) =>
  value == null ? "N/A" : `${(value * 100).toFixed(1)}%`

const metricLabel = (value: number | null | undefined, digits = 2) =>
  value == null || !Number.isFinite(value) ? "N/A" : value.toFixed(digits)

const sourceBarColor = (index: number) =>
  ["bg-blue-600", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"][index % 5]

const sourceHexColors = ["#2563EB", "#8B5CF6", "#F59E0B", "#F43F5E", "#06B6D4"]

const sentinelSceneClassLabels: Record<number, string> = {
  0: "No Data",
  1: "Saturated / Defective",
  2: "Dark Area Pixels",
  3: "Cloud Shadows",
  4: "Vegetation",
  5: "Bare Soil / Non-Vegetated Land",
  6: "Water",
  7: "Unclassified",
  8: "Cloud (Medium Probability)",
  9: "Cloud (High Probability)",
  10: "Thin Cirrus Cloud",
  11: "Snow / Ice",
}

const sentinelSceneClassLabel = (value: number | null | undefined) =>
  value == null || !Number.isFinite(value)
    ? "Scene class unavailable"
    : sentinelSceneClassLabels[Math.round(value)] ?? "Unknown scene class"

const sentinelIndexDetails: Record<
  string,
  {
    label: string
    description: string
    interpret: (value: number) => string
  }
> = {
  bare_soil_index: {
    label: "Bare Soil Index (BSI)",
    description: "Highlights exposed soil, dry ground, and sparsely vegetated surfaces.",
    interpret: (value) =>
      value >= 0.2
        ? "Strong exposed-soil or dry-surface signal."
        : value >= 0.05
          ? "Mild exposed-soil or disturbed-surface signal."
          : value > -0.05
            ? "Near neutral; no dominant bare-soil signal."
            : "Vegetation or moisture likely outweighs exposed soil.",
  },
  ndbi: {
    label: "Built-up Index (NDBI)",
    description: "Compares built-up or impervious surfaces with vegetation and moisture.",
    interpret: (value) =>
      value >= 0.2
        ? "Strong built-up or impervious-surface signal."
        : value >= 0.05
          ? "Moderate built-up-surface signal."
          : value > -0.05
            ? "Near neutral; built-up land is not dominant in the pixel."
            : "Vegetation or water is more prominent than built-up surfaces.",
  },
  ndvi: {
    label: "Vegetation Index (NDVI)",
    description: "Indicates vegetation presence and relative greenness.",
    interpret: (value) =>
      value >= 0.6
        ? "Dense, healthy vegetation signal."
        : value >= 0.3
          ? "Moderate vegetation cover."
          : value >= 0.1
            ? "Sparse or low-density vegetation."
            : value >= 0
              ? "Very little vegetation."
              : "Likely water, bare ground, cloud, or non-vegetated surface.",
  },
  ndwi: {
    label: "Water Index (NDWI)",
    description: "Indicates open water or surface moisture.",
    interpret: (value) =>
      value >= 0.3
        ? "Strong open-water or wet-surface signal."
        : value >= 0.05
          ? "Some surface moisture or water influence."
          : value > -0.05
            ? "Near neutral moisture signal."
            : "Dry or non-water surface dominates.",
  },
  normalized_burn_ratio: {
    label: "Normalized Burn Ratio (NBR)",
    description: "Contrasts healthy vegetation with burned, bare, or disturbed surfaces.",
    interpret: (value) =>
      value >= 0.5
        ? "Strong healthy-vegetation signal."
        : value >= 0.2
          ? "Moderate vegetation signal."
          : value >= 0
            ? "Low positive value; limited vegetation or a dry/disturbed surface may be present."
            : "Possible burned, bare, or severely disturbed surface; ground validation is required.",
  },
}

const displayValue = (value: string | number | null | undefined) => (value == null || value === "" ? "N/A" : String(value))

const timeLabel = (value: string | null | undefined) => {
  if (!value) return "N/A"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const siteKey = (site: Pick<SiteCategoryInfo, "lat" | "lng" | "satellite_enabled">) =>
  `${site.lat}-${site.lng}-${site.satellite_enabled ? "sat" : "nosat"}`

const getModeTheme = (satelliteEnabled: boolean) =>
  satelliteEnabled
    ? {
        accentText: "text-emerald-700",
        badge: "border border-emerald-200 bg-emerald-100 text-emerald-800",
        detailCard: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50",
        detailPanel: "border-emerald-200 bg-emerald-50/70",
        dot: "bg-emerald-500",
        muted: "text-emerald-700/80",
        resultCard: "border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 hover:border-emerald-300 hover:bg-emerald-50",
        resultSelected: "border-emerald-400 bg-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]",
        switch: "data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300",
        tone: "Satellite Enriched",
      }
    : {
        accentText: "text-slate-700",
        badge: "border border-slate-200 bg-slate-200/80 text-slate-700",
        detailCard: "border-slate-300 bg-gradient-to-br from-slate-100 via-white to-slate-50",
        detailPanel: "border-slate-300 bg-slate-100/80",
        dot: "bg-slate-500",
        muted: "text-slate-600",
        resultCard: "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/70",
        resultSelected: "border-slate-400 bg-slate-100",
        switch: "data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-400",
        tone: "Context Only",
      }

const resultTitle = (site: SiteCategoryInfo) =>
  displayValue(site.area_name) !== "N/A" ? displayValue(site.area_name) : `${site.lat.toFixed(5)}, ${site.lng.toFixed(5)}`

const hasMeaningfulContextValue = (value: string | null | undefined) => {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized !== "" && normalized !== "unknown" && normalized !== "n/a"
}

const toSiteInfo = (response: SourceMetadataResponse, lat: number, lng: number, satelliteEnabled: boolean): SiteCategoryInfo => {
  const details = response.data.evidence.site_category
  const primary = response.data.primary_source ?? response.data.candidate_sources[0] ?? null
  const evidence = response.data.evidence
  const metadata = response.data.metadata
  const reasoning = evidence.reasoning ?? evidence.site_reasoning ?? []
  const satelliteReasoning = evidence.satellite_reasoning ?? []

  return {
    lat: response.data.location?.latitude ?? lat,
    lng: response.data.location?.longitude ?? lng,
    area_name: response.data.location?.area_name ?? details?.area_name ?? null,
    category: details?.category ?? null,
    candidate_sources: response.data.candidate_sources ?? [],
    computed_at_utc: metadata?.computed_at_utc ?? null,
    cache_hit: metadata?.cache_hit ?? null,
    data_sources: metadata?.data_sources ?? [],
    date_range: evidence.sentinel2_context?.date_range ?? metadata?.date_range ?? null,
    disclaimer: metadata?.disclaimer ?? null,
    elapsed_ms: metadata?.elapsed_ms ?? null,
    matched_feature: evidence.matched_feature ?? null,
    message: response.message,
    model_version: metadata?.model_version ?? null,
    nearby_feature_counts: evidence.nearby_feature_counts ?? {},
    osm_debug_info: evidence.osm_debug_info ?? [],
    primary_confidence: primary?.confidence ?? null,
    primary_source: primary?.source_type ?? null,
    satellite_enabled: satelliteEnabled,
    satellite_error: evidence.sentinel2_error ?? evidence.satellite_error ?? null,
    satellite_data_used: metadata?.satellite_data_used ?? !!evidence.sentinel2_context,
    satellite_pollutants_mean: evidence.satellite_pollutants_mean ?? {},
    satellite_provider: metadata?.satellite_provider ?? evidence.sentinel2_context?.provider ?? null,
    satellite_reasoning: satelliteReasoning,
    sentinel2_context: evidence.sentinel2_context ?? null,
    site_category: details ?? null,
    site_reasoning: reasoning,
  }
}

function ProfiledLocationMapController({ center }: { center: [number, number] | null }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      const distanceKm = map.distance(map.getCenter(), center) / 1_000
      const duration = Math.min(2.4, Math.max(1.1, 0.9 + Math.log10(distanceKm + 1) * 0.45))
      const destinationZoom = Math.min(16, Math.max(map.getZoom() || 3, 13))

      map.stop()
      map.flyTo(center, destinationZoom, {
        animate: true,
        duration,
        easeLinearity: 0.2,
      })
      return
    }

    map.fitWorld({ animate: false })
  }, [center, map])

  return null
}

function SiteCategoryContent() {
  const [sites, setSites] = useState<SiteCategoryInfo[]>([])
  const [selectedSite, setSelectedSite] = useState<SiteCategoryInfo | null>(null)
  const [manualInput, setManualInput] = useState("")
  const [includeSatellite, setIncludeSatellite] = useState(true)
  const [sourceVisualization, setSourceVisualization] = useState<"donut" | "bars">("donut")
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0)
  const [hoveredSourceIndex, setHoveredSourceIndex] = useState<number | null>(null)
  const [isManualSectionOpen, setIsManualSectionOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [defaultMarkerIcon, setDefaultMarkerIcon] = useState<import("leaflet").Icon | null>(null)
  const { toast } = useToast()
  const sitesRef = useRef<SiteCategoryInfo[]>([])
  const includeSatelliteRef = useRef(includeSatellite)
  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const selectedPreviewRef = useRef<HTMLDivElement | null>(null)
  const metadataRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    sitesRef.current = sites
  }, [sites])

  useEffect(() => {
    let active = true

    void import("leaflet").then((leaflet) => {
      if (!active) return
      setDefaultMarkerIcon(
        leaflet.default.icon({
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          iconUrl: "/leaflet/marker-icon.png",
          shadowUrl: "/leaflet/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      )
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    includeSatelliteRef.current = includeSatellite
  }, [includeSatellite])

  useEffect(() => {
    setSelectedSourceIndex(0)
    setHoveredSourceIndex(null)
  }, [selectedSite])

  useEffect(() => {
    if (!selectedSite || !sidebarRef.current || !selectedPreviewRef.current) return

    const sidebar = sidebarRef.current
    const targetTop = Math.max(0, selectedPreviewRef.current.offsetTop - 45) // 45px is an estimated offset for the top padding and title

    if (window.innerWidth < 1024) {
      selectedPreviewRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
      return
    }

    sidebar.scrollTo({
      top: targetTop,
      behavior: "smooth",
    })
  }, [selectedSite])

  const exists = (lat: number, lng: number, satelliteEnabled: boolean) =>
    sites.some((site) => site.lat === lat && site.lng === lng && site.satellite_enabled === satelliteEnabled)

  const fetchSite = async (lat: number, lng: number, satelliteEnabled: boolean) =>
    toSiteInfo(await getSiteCategory(lat, lng, satelliteEnabled), lat, lng, satelliteEnabled)

  const processLocations = async (locations: Location[]) => {
    const satelliteEnabled = includeSatellite
    const newSites: SiteCategoryInfo[] = []
    const seenKeys = new Set(
      sites
        .filter((site) => site.satellite_enabled === satelliteEnabled)
        .map((site) => siteKey(site)),
    )
    let failed = 0
    let skipped = 0

    setLoading(true)
    try {
      for (const location of locations) {
        const locationKey = siteKey({ ...location, satellite_enabled: satelliteEnabled })

        if (seenKeys.has(locationKey)) {
          skipped += 1
          continue
        }

        seenKeys.add(locationKey)

        try {
          newSites.push(await fetchSite(location.lat, location.lng, satelliteEnabled))
        } catch (error) {
          failed += 1
          console.error(error)
        }
      }

      if (newSites.length > 0) {
        setSites((prev) => [...prev, ...newSites])
        setSelectedSite(newSites[newSites.length - 1])
        setMapCenter([newSites[newSites.length - 1].lat, newSites[newSites.length - 1].lng])
        toast({
          title: "Source metadata ready",
          description: `Processed ${newSites.length} location(s) with satellite ${satelliteEnabled ? "on" : "off"}${skipped ? `, skipped ${skipped}` : ""}${failed ? `, ${failed} failed` : ""}.`,
        })
      } else if (failed > 0) {
        toast({ title: "Error", description: "Failed to process the requested locations.", variant: "destructive" })
      } else if (skipped > 0) {
        toast({ title: "No new locations", description: "These coordinates already exist for the current satellite mode." })
      }
    } finally {
      setLoading(false)
    }
  }

  const selectOrFetchLocation = async (lat: number, lng: number) => {
    const satelliteEnabled = includeSatelliteRef.current
    setMapCenter([lat, lng])

    if (sitesRef.current.some((site) => site.lat === lat && site.lng === lng && site.satellite_enabled === satelliteEnabled)) {
      const match = sitesRef.current.find(
        (site) => site.lat === lat && site.lng === lng && site.satellite_enabled === satelliteEnabled,
      )
      if (match) {
        setSelectedSite(match)
        setMapCenter([lat, lng])
      }
      return
    }

    setLoading(true)
    try {
      const nextSite = await fetchSite(lat, lng, satelliteEnabled)
      setSites((prev) => {
        const updatedSites = [...prev, nextSite]
        sitesRef.current = updatedSites
        return updatedSites
      })
      setSelectedSite(nextSite)
      setMapCenter([lat, lng])
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to load source metadata.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleMapClick = async (e: { latlng: { lat: number; lng: number } }) => {
    const { lat, lng } = e.latlng
    await selectOrFetchLocation(lat, lng)
  }

  const handleManualSubmit = async () => {
    try {
      const coordinates = manualInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [lat, lng] = line.split(",").map((value) => Number.parseFloat(value.trim()))
          if (Number.isNaN(lat) || Number.isNaN(lng)) throw new Error("Use one latitude,longitude pair per line.")
          return { lat, lng }
        })

      await processLocations(coordinates)
      setManualInput("")
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Invalid coordinates format.", variant: "destructive" })
    }
  }

  const downloadCSV = () => {
    const pollutantKeys = Array.from(new Set(sites.flatMap((site) => Object.keys(site.satellite_pollutants_mean)))).sort()
    const rows = sites.map((site) => {
      const row: Record<string, string | number> = {
        latitude: site.lat,
        longitude: site.lng,
        satellite_enabled: site.satellite_enabled ? "true" : "false",
        primary_source: sourceLabel(site.primary_source),
        primary_confidence: site.primary_confidence == null ? "" : Number((site.primary_confidence * 100).toFixed(1)),
        site_category: site.category ?? "",
        classification_confidence:
          site.site_category?.classification_confidence == null
            ? ""
            : Number((site.site_category.classification_confidence * 100).toFixed(1)),
        classification_method: site.site_category?.classification_method ?? "",
        distance_to_matched_feature_m: site.site_category?.distance_to_matched_feature_m ?? "",
        area_name: site.area_name ?? "",
        candidate_sources: site.candidate_sources.map((item) => `${sourceLabel(item.source_type)} (${confidenceLabel(item.confidence)})`).join(" | "),
        site_reasoning: site.site_reasoning.join(" | "),
        satellite_reasoning: site.satellite_reasoning.join(" | "),
        satellite_error: site.satellite_error ?? "",
        matched_feature_name: site.matched_feature?.name ?? "",
        matched_feature_osm_id: site.matched_feature?.osm_id ?? "",
        matched_feature_osm_type: site.matched_feature?.osm_type ?? "",
        matched_feature_tags: site.matched_feature
          ? Object.entries(site.matched_feature.tags).map(([key, value]) => `${key}=${value}`).join(" | ")
          : "",
        nearby_feature_counts: Object.entries(site.nearby_feature_counts).map(([key, value]) => `${key}=${value}`).join(" | "),
        sentinel2_scene_id: site.sentinel2_context?.scene_id ?? "",
        sentinel2_scene_datetime: site.sentinel2_context?.scene_datetime ?? "",
        sentinel2_scene_cloud_cover: site.sentinel2_context?.scene_cloud_cover ?? "",
        sentinel2_aerosol_optical_thickness: site.sentinel2_context?.aerosol_optical_thickness ?? "",
        sentinel2_indices: site.sentinel2_context
          ? Object.entries(site.sentinel2_context.indices).map(([key, value]) => `${key}=${value ?? ""}`).join(" | ")
          : "",
        osm_debug_info: site.osm_debug_info.join(" | "),
        data_sources: site.data_sources.join(" | "),
        computed_at_utc: site.computed_at_utc ?? "",
        elapsed_ms: site.elapsed_ms ?? "",
        cache_hit: site.cache_hit == null ? "" : site.cache_hit ? "true" : "false",
        start_date: site.date_range?.start_date ?? "",
        end_date: site.date_range?.end_date ?? "",
        model_version: site.model_version ?? "",
        disclaimer: site.disclaimer ?? "",
      }

      for (const key of pollutantKeys) row[`satellite_${key.toLowerCase()}`] = site.satellite_pollutants_mean[key] ?? ""
      return row
    })

    const blob = new Blob([Papa.unparse(rows)], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "source_metadata.csv"
    link.click()
  }

  const MapEvents = () => {
    useMapEvents({ click: handleMapClick })
    return null
  }

  const SearchControl = () => {
    const map = useMap()

    useEffect(() => {
      let disposed = false
      let searchControl: any = null
      let handleSearchLocation: ((result: any) => Promise<void>) | null = null

      const setupSearch = async () => {
        const geosearch = await import("leaflet-geosearch")
        if (disposed) return

        const provider = new geosearch.OpenStreetMapProvider()
        searchControl = new geosearch.GeoSearchControl({
          provider,
          style: "bar",
          autoComplete: true,
          autoCompleteDelay: 250,
          position: "topright",
          showMarker: false,
          updateMap: false,
        } as any)

        map.addControl(searchControl)

        const searchBar = document.querySelector(".leaflet-control-geosearch form")
        if (searchBar) {
          searchBar.classList.add("bg-white", "text-black", "border", "border-gray-300", "rounded-xl", "relative")

          const searchContainer = document.querySelector(".leaflet-control-geosearch")
          if (searchContainer) {
            searchContainer.classList.add(
              "!right-3",
              "!top-3",
              "!left-auto",
              "!transform-none",
              "!w-[calc(100%_-_5rem)]",
              "sm:!right-4",
              "sm:!top-4",
              "sm:!w-72",
            )
          }

          const existingIcon = searchBar.querySelector(".categorize-search-icon")
          if (!existingIcon) {
            const searchIcon = document.createElement("div")
            searchIcon.className = "categorize-search-icon absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            searchIcon.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
            searchBar.appendChild(searchIcon)
          }

          const searchInput = searchBar.querySelector("input")
          if (searchInput) {
            searchInput.setAttribute("placeholder", "Search place name on the map")
            ;(searchInput as HTMLInputElement).style.paddingLeft = "2.5rem"
          }
        }

        handleSearchLocation = async (result: any) => {
          const location = result?.location
          if (!location || typeof location.x !== "number" || typeof location.y !== "number") return
          await selectOrFetchLocation(location.y, location.x)
        }

        map.on("geosearch/showlocation", handleSearchLocation)
      }

      void setupSearch()

      return () => {
        disposed = true
        if (handleSearchLocation) {
          map.off("geosearch/showlocation", handleSearchLocation)
        }
        if (searchControl) {
          map.removeControl(searchControl)
        }
      }
    }, [map])

    return null
  }


  const selectedKey = selectedSite ? siteKey(selectedSite) : null
  const pollutantEntries = selectedSite
    ? Object.entries(selectedSite.satellite_pollutants_mean).filter(
        ([, value]) => typeof value === "number" && Number.isFinite(value),
      )
    : []
  const nearbyFeatureEntries = selectedSite
    ? Object.entries(selectedSite.nearby_feature_counts).sort(([, left], [, right]) => right - left)
    : []
  const sentinelIndexEntries = selectedSite?.sentinel2_context
    ? Object.entries(selectedSite.sentinel2_context.indices)
    : []
  const sourceConfidenceTotal = selectedSite
    ? selectedSite.candidate_sources.reduce((total, item) => total + Math.max(item.confidence, 0), 0)
    : 0
  const activeSourceIndex = hoveredSourceIndex ?? Math.min(selectedSourceIndex, Math.max((selectedSite?.candidate_sources.length ?? 1) - 1, 0))
  const activeSource = selectedSite?.candidate_sources[activeSourceIndex] ?? selectedSite?.candidate_sources[0] ?? null
  const hasUsableSatelliteData = !!selectedSite?.sentinel2_context || pollutantEntries.length > 0
  const requestTheme = getModeTheme(includeSatellite)
  const selectedTheme = getModeTheme(selectedSite?.satellite_enabled ?? includeSatellite)
  const localComputedAt = new Date().toLocaleString()
  const contextFields = selectedSite
    ? [
        { label: "Highway", value: selectedSite.site_category?.highway },
        { label: "Land Use", value: selectedSite.site_category?.landuse },
        { label: "Natural", value: selectedSite.site_category?.natural },
        { label: "Waterway", value: selectedSite.site_category?.waterway },
      ].filter((field) => hasMeaningfulContextValue(field.value))
    : []
  const visibleSites = selectedSite ? sites.slice().reverse().filter((site) => siteKey(site) !== selectedKey) : sites.slice().reverse()

  const renderResultCard = (site: SiteCategoryInfo, pinned = false) => (
    <button
      key={`${siteKey(site)}-${pinned ? "pinned" : "list"}`}
      type="button"
      onClick={() => { setSelectedSite(site); setMapCenter([site.lat, site.lng]) }}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition",
        getModeTheme(site.satellite_enabled).resultCard,
        pinned || selectedKey === siteKey(site) ? getModeTheme(site.satellite_enabled).resultSelected : "",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", getModeTheme(site.satellite_enabled).dot)} />
            <p className="font-semibold text-slate-900">{resultTitle(site)}</p>
          </div>
          <p className="mt-1 text-sm text-slate-600">Category: {displayValue(site.category)}</p>
          {site.satellite_enabled && site.primary_source ? (
            <p className="text-xs text-emerald-700">
              Primary source: {sourceLabel(site.primary_source)} ({confidenceLabel(site.primary_confidence)})
            </p>
          ) : (
            <p className="text-xs text-slate-500">OSM context classification</p>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{site.lat.toFixed(5)}, {site.lng.toFixed(5)}</p>
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<div>Loading navigation...</div>}><Navigation /></Suspense>
      <div>
        <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
          <div className="relative h-[52vh] min-h-[360px] w-full shrink-0 sm:h-[58vh] lg:h-full lg:min-h-0 lg:flex-1">
            <MapContainer className="h-full w-full">
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <SearchControl />
              <MapEvents />
              <ProfiledLocationMapController center={mapCenter} />
              <InitialCountryView disabled={loading || mapCenter !== null || sites.length > 0} />
              {defaultMarkerIcon && sites.map((site) => (
                <Marker icon={defaultMarkerIcon} key={siteKey(site)} position={[site.lat, site.lng]} eventHandlers={{ click: () => { setSelectedSite(site); setMapCenter([site.lat, site.lng]) } }}>
                  <Popup>
                    <div className="space-y-1 p-1 text-sm">
                      <p><strong>Location:</strong> {resultTitle(site)}</p>
                      <p><strong>Site Category:</strong> {displayValue(site.category)}</p>
                      {site.satellite_enabled && (
                        <>
                          <p><strong>Primary Source:</strong> {sourceLabel(site.primary_source)}</p>
                          <p><strong>Confidence:</strong> {confidenceLabel(site.primary_confidence)}</p>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <Button onClick={() => setShowInfo(true)} className="absolute left-3 top-3 z-[1000] h-11 w-11 rounded-full bg-blue-500 p-0 text-white shadow-lg hover:bg-blue-600 sm:left-4 sm:top-4">
              <Info className="h-5 w-5" />
            </Button>
          </div>
          <div ref={sidebarRef} className="w-full space-y-4 border-t border-slate-200 bg-white p-3 sm:p-4 lg:h-full lg:w-[28rem] lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
            <Card className={cn("rounded-2xl border", requestTheme.detailPanel)}>
              <CardHeader className="pb-1"><CardTitle className="text-lg">Request Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-1">
                <div className={cn("flex items-center justify-between gap-3 rounded-xl border p-3", requestTheme.detailCard)}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", requestTheme.dot)} />
                      <Label htmlFor="satellite-toggle" className="font-semibold">
                        {includeSatellite ? "Include Satellite Data" : "Using the OSM-only"}
                      </Label>
                    </div>
                    <p className={cn("mt-1 text-xs", requestTheme.muted)}>
                      {includeSatellite
                        ? "Using source metadata with satellite-enhanced evidence."
                        : "Using the OSM-only categorize_site endpoint for context-based categorization."}
                    </p>
                  </div>
                  <Switch
                    id="satellite-toggle"
                    checked={includeSatellite}
                    onCheckedChange={setIncludeSatellite}
                    className={requestTheme.switch}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600">
                  <span>Current mode</span>
                  <span className={cn("rounded-full px-2.5 py-1 font-semibold", requestTheme.badge)}>{requestTheme.tone}</span>
                </div>
                <Button onClick={downloadCSV} disabled={sites.length === 0} className={cn("w-full rounded-xl text-white", includeSatellite ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-600 hover:bg-slate-700")}><Download className="mr-2 h-4 w-4" />Download CSV</Button>
                {sites.length === 0 && <FileUpload onUpload={processLocations} />}
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <button
                  type="button"
                  onClick={() => setIsManualSectionOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <CardTitle className="text-lg">Add Multiple Locations</CardTitle>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-slate-500 transition-transform",
                      isManualSectionOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </button>
              </CardHeader>
              {isManualSectionOpen && (
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-500">Enter one `latitude,longitude` pair per line.</p>
                  <Textarea value={manualInput} onChange={(e) => setManualInput(e.target.value)} placeholder="0.3178311,32.5899529&#10;0.318058,32.590206" className="min-h-28 rounded-xl border-slate-300 bg-slate-50 focus-visible:bg-white" />
                  <Button onClick={handleManualSubmit} disabled={!manualInput.trim() || loading} className="w-full rounded-xl bg-blue-500 text-white hover:bg-blue-600">Process Coordinates</Button>
                </CardContent>
              )}
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-3"><CardTitle className="text-lg">Results</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {sites.length === 0 ? <p className="text-sm text-slate-500">Click the map, upload a CSV, or paste coordinates to fetch source metadata.</p> : visibleSites.map((site) => renderResultCard(site))}
              </CardContent>
            </Card>
            {selectedSite && (
              <>
                <div ref={selectedPreviewRef} className="space-y-2">
                  <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Result</p>
                  {renderResultCard(selectedSite, true)}
                </div>
                <Card ref={metadataRef} className="overflow-hidden rounded-2xl border-slate-200">
                <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 text-white sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">
                        <Sparkles className="h-4 w-4" />
                        Classification profile
                      </div>
                      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{displayValue(selectedSite.category)}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{resultTitle(selectedSite)}</span>
                        <span>{selectedSite.lat.toFixed(5)}, {selectedSite.lng.toFixed(5)}</span>
                      </div>
                    </div>
                    <div className="self-start rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur sm:shrink-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-200">Confidence</p>
                      <p className="mt-1 text-xl font-bold">
                        {confidenceLabel(selectedSite.site_category?.classification_confidence)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
                    <div className="rounded-xl bg-white/10 p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-slate-300">Primary source</p>
                      <p className="mt-1 truncate text-sm font-semibold">{sourceLabel(selectedSite.primary_source)}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-slate-300">Method</p>
                      <p className="mt-1 truncate text-sm font-semibold">{sourceLabel(selectedSite.site_category?.classification_method)}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-slate-300">Nearest evidence</p>
                      <p className="mt-1 text-sm font-semibold">
                        {selectedSite.site_category?.distance_to_matched_feature_m == null
                          ? "N/A"
                          : `${selectedSite.site_category.distance_to_matched_feature_m.toFixed(0)} m`}
                      </p>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-5 p-3 sm:p-5">
                  {selectedSite.candidate_sources.length > 0 ? (
                    <section>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {sourceVisualization === "donut"
                            ? <PieChart className="h-4 w-4 text-blue-700" />
                            : <BarChart3 className="h-4 w-4 text-blue-700" />}
                          <h3 className="text-sm font-bold text-slate-900">Likely emission sources</h3>
                        </div>
                        <div className="flex rounded-lg bg-slate-100 p-1">
                          <button
                            type="button"
                            onClick={() => setSourceVisualization("donut")}
                            className={cn(
                              "rounded-md px-2.5 py-1 text-xs font-semibold transition",
                              sourceVisualization === "donut" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500",
                            )}
                          >
                            Donut
                          </button>
                          <button
                            type="button"
                            onClick={() => setSourceVisualization("bars")}
                            className={cn(
                              "rounded-md px-2.5 py-1 text-xs font-semibold transition",
                              sourceVisualization === "bars" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500",
                            )}
                          >
                            Bars
                          </button>
                        </div>
                      </div>
                      {sourceVisualization === "donut" ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                          <div className="grid items-center gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
                            <div className="relative mx-auto h-[140px] w-[140px] sm:h-[150px] sm:w-[150px]">
                              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90 overflow-visible" aria-label="Interactive source contribution donut chart">
                                <circle cx="60" cy="60" r="44" fill="none" stroke="#E2E8F0" strokeWidth="20" />
                                {selectedSite.candidate_sources.map((item, index) => {
                                  const normalizedPercent = sourceConfidenceTotal > 0
                                    ? (Math.max(item.confidence, 0) / sourceConfidenceTotal) * 100
                                    : 0
                                  const offset = selectedSite.candidate_sources
                                    .slice(0, index)
                                    .reduce(
                                      (total, previous) =>
                                        total + (sourceConfidenceTotal > 0 ? (Math.max(previous.confidence, 0) / sourceConfidenceTotal) * 100 : 0),
                                      0,
                                    )
                                  return (
                                    <circle
                                      key={`${item.source_type}-donut`}
                                      cx="60"
                                      cy="60"
                                      r="44"
                                      fill="none"
                                      pathLength="100"
                                      stroke={sourceHexColors[index % sourceHexColors.length]}
                                      strokeWidth={activeSourceIndex === index ? "24" : "20"}
                                      strokeDasharray={`${normalizedPercent} ${100 - normalizedPercent}`}
                                      strokeDashoffset={-offset}
                                      strokeLinecap="butt"
                                      className="cursor-pointer transition-all duration-200 focus:outline-none"
                                      opacity={hoveredSourceIndex !== null && activeSourceIndex !== index ? 0.45 : 1}
                                      role="button"
                                      tabIndex={0}
                                      aria-label={`${sourceLabel(item.source_type)} ${confidenceLabel(item.confidence)}`}
                                      onMouseEnter={() => setHoveredSourceIndex(index)}
                                      onMouseLeave={() => setHoveredSourceIndex(null)}
                                      onFocus={() => setHoveredSourceIndex(index)}
                                      onBlur={() => setHoveredSourceIndex(null)}
                                      onClick={() => setSelectedSourceIndex(index)}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                          event.preventDefault()
                                          setSelectedSourceIndex(index)
                                        }
                                      }}
                                    />
                                  )
                                })}
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-semibold text-slate-500">
                                  {activeSourceIndex === 0 ? "Primary" : "Selected"}
                                </span>
                                <span className="max-w-[84px] text-sm font-bold leading-tight text-slate-900">
                                  {sourceLabel(activeSource?.source_type)}
                                </span>
                                <span
                                  className="mt-1 text-xs font-bold"
                                  style={{ color: sourceHexColors[activeSourceIndex % sourceHexColors.length] }}
                                >
                                  {confidenceLabel(activeSource?.confidence)}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {selectedSite.candidate_sources.map((item, index) => (
                                <button
                                  type="button"
                                  key={`${item.source_type}-legend`}
                                  onMouseEnter={() => setHoveredSourceIndex(index)}
                                  onMouseLeave={() => setHoveredSourceIndex(null)}
                                  onFocus={() => setHoveredSourceIndex(index)}
                                  onBlur={() => setHoveredSourceIndex(null)}
                                  onClick={() => setSelectedSourceIndex(index)}
                                  className={cn(
                                    "flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2 text-left transition",
                                    activeSourceIndex === index
                                      ? "border-blue-300 shadow-sm ring-2 ring-blue-100"
                                      : "border-slate-200 hover:border-slate-300",
                                  )}
                                >
                                  <div className="flex min-w-0 items-center gap-2">
                                    <span
                                      className="h-3 w-3 shrink-0 rounded-full"
                                      style={{ backgroundColor: sourceHexColors[index % sourceHexColors.length] }}
                                    />
                                    <span className="truncate text-xs font-semibold text-slate-800">{sourceLabel(item.source_type)}</span>
                                  </div>
                                  <span
                                    className="shrink-0 text-xs font-bold"
                                    style={{ color: sourceHexColors[index % sourceHexColors.length] }}
                                  >
                                    {confidenceLabel(item.confidence)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          {selectedSite.candidate_sources.map((item, index) => (
                            <div key={`${item.source_type}-${item.confidence}`}>
                              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                                <span className="font-semibold text-slate-800">{sourceLabel(item.source_type)}</span>
                                <span className="font-bold text-slate-900">{confidenceLabel(item.confidence)}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={cn("h-full rounded-full", sourceBarColor(index))}
                                  style={{ width: `${Math.max(item.confidence * 100, 2)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  ) : null}

                  {selectedSite.site_reasoning.length > 0 ? (
                    <section>
                      <div className="mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-slate-900">Why this classification</h3>
                      </div>
                      <div className="space-y-2">
                        {selectedSite.site_reasoning.map((item, index) => (
                          <div key={item} className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                              {index + 1}
                            </span>
                            <p className="text-sm leading-5 text-slate-700">{item}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {(selectedSite.matched_feature || contextFields.length > 0 || nearbyFeatureEntries.length > 0) ? (
                    <section>
                      <div className="mb-3 flex items-center gap-2">
                        <Network className="h-4 w-4 text-violet-700" />
                        <h3 className="text-sm font-bold text-slate-900">Mapped context within 500 m</h3>
                      </div>
                      {selectedSite.matched_feature ? (
                        <div className="mb-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-violet-100 p-2 text-violet-700"><Building2 className="h-4 w-4" /></div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Matched OSM feature</p>
                              <p className="mt-1 font-bold text-slate-900">{displayValue(selectedSite.matched_feature.name)}</p>
                              <p className="text-xs text-slate-500">
                                {sourceLabel(selectedSite.matched_feature.osm_type)} #{displayValue(selectedSite.matched_feature.osm_id)}
                              </p>
                            </div>
                          </div>
                          {Object.keys(selectedSite.matched_feature.tags).length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {Object.entries(selectedSite.matched_feature.tags).map(([key, value]) => (
                                <span key={key} className="rounded-full border border-violet-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {contextFields.length > 0 ? (
                        <div className="mb-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                          {contextFields.map((field) => (
                            <div key={field.label} className="rounded-xl border border-slate-200 p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{field.label}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{field.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {nearbyFeatureEntries.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {nearbyFeatureEntries.map(([key, value]) => (
                            <div key={key} className="rounded-xl bg-slate-100 px-2 py-2.5 text-center">
                              <p className="text-lg font-bold text-slate-900">{value}</p>
                              <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-500">{key}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {selectedSite.sentinel2_context ? (
                    <section className="overflow-hidden rounded-2xl border border-cyan-200">
                      <div className="bg-gradient-to-r from-cyan-950 to-blue-950 p-4 text-white">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/10 p-2"><Satellite className="h-5 w-5 text-cyan-200" /></div>
                            <div>
                              <p className="font-bold">Sentinel-2 surface context</p>
                              <p className="text-xs text-cyan-100">{displayValue(selectedSite.sentinel2_context.scene_id)}</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold">
                            {selectedSite.sentinel2_context.cache_hit ? "Cached scene" : "Fresh scene"}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-2 text-center min-[360px]:grid-cols-3">
                          <div className="rounded-xl bg-white/10 p-2">
                            <p className="text-xs uppercase text-cyan-200">Cloud cover</p>
                            <p className="mt-1 text-sm font-bold">{metricLabel(selectedSite.sentinel2_context.scene_cloud_cover, 1)}%</p>
                          </div>
                          <div className="rounded-xl bg-white/10 p-2">
                            <p className="text-xs uppercase text-cyan-200">Aerosol depth</p>
                            <p className="mt-1 text-sm font-bold">{metricLabel(selectedSite.sentinel2_context.aerosol_optical_thickness, 3)}</p>
                          </div>
                          <div
                            className="group relative rounded-xl bg-white/10 p-2 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                            tabIndex={0}
                            aria-label={`Scene class ${displayValue(selectedSite.sentinel2_context.scene_classification)}: ${sentinelSceneClassLabel(selectedSite.sentinel2_context.scene_classification)}`}
                          >
                            <p className="text-xs uppercase text-cyan-200">Scene class</p>
                            <p className="mt-1 text-sm font-bold">{displayValue(selectedSite.sentinel2_context.scene_classification)}</p>
                            <div
                              role="tooltip"
                              className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden w-52 rounded-xl border border-cyan-200 bg-white p-3 text-left text-xs leading-5 text-slate-700 shadow-xl group-hover:block group-focus:block"
                            >
                              <p className="font-bold text-cyan-800">
                                Class {displayValue(selectedSite.sentinel2_context.scene_classification)}
                              </p>
                              <p>{sentinelSceneClassLabel(selectedSite.sentinel2_context.scene_classification)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-cyan-50/60 p-4">
                        <div className="space-y-2">
                          {sentinelIndexEntries.map(([key, value]) => {
                            const details = sentinelIndexDetails[key]
                            return (
                              <details key={key} className="group rounded-xl border border-cyan-100 bg-white">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-cyan-800">{details?.label ?? sourceLabel(key)}</p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <div className="rounded-lg bg-cyan-50 px-2.5 py-1.5 text-right">
                                      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Value</p>
                                      <p className="text-base font-bold text-slate-900">{metricLabel(value, 4)}</p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-cyan-700 transition-transform group-open:rotate-180" />
                                  </div>
                                </summary>
                                <div className="border-t border-cyan-100 px-3 pb-3 pt-2">
                                  <p className="text-xs leading-5 text-slate-500">
                                    {details?.description ?? "Satellite-derived surface index."}
                                  </p>
                                  <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs leading-5 text-slate-700">
                                    <span className="font-semibold">Interpretation: </span>
                                    {typeof value === "number" && details
                                      ? details.interpret(value)
                                      : "No interpretation is available for this result."}
                                  </div>
                                </div>
                              </details>
                            )
                          })}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          These indices describe surface reflectance patterns. They support contextual interpretation but do not confirm an emission source on their own.
                        </p>
                        <div className="mt-3 space-y-1 text-xs text-slate-600">
                          <p><strong>Captured:</strong> {timeLabel(selectedSite.sentinel2_context.scene_datetime)}</p>
                          <p><strong>Provider:</strong> {displayValue(selectedSite.sentinel2_context.provider)}</p>
                          <p><strong>Search window:</strong> {selectedSite.date_range ? `${selectedSite.date_range.start_date} to ${selectedSite.date_range.end_date}` : "N/A"}</p>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {pollutantEntries.length > 0 ? (
                    <section>
                      <h3 className="mb-2 text-sm font-bold text-slate-900">Satellite pollutant means</h3>
                      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                        {pollutantEntries.map(([key, value]) => (
                          <div key={key} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">{key}</p>
                            <p className="mt-1 text-sm font-bold text-slate-900">{value == null ? "N/A" : value.toFixed(6)}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  <section className={cn("rounded-2xl border p-4", selectedTheme.detailCard)}>
                    <div className="mb-3 flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-600" />
                      <h3 className="text-sm font-bold text-slate-900">Provenance and runtime</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs min-[360px]:grid-cols-2">
                      <div className="rounded-xl bg-white/80 p-3">
                        <Clock3 className="mb-1.5 h-4 w-4 text-slate-500" />
                        <p className="text-slate-500">Computed</p>
                        <p className="mt-1 font-semibold text-slate-800">{selectedSite.satellite_enabled ? timeLabel(selectedSite.computed_at_utc) : localComputedAt}</p>
                      </div>
                      <div className="rounded-xl bg-white/80 p-3">
                        <Gauge className="mb-1.5 h-4 w-4 text-slate-500" />
                        <p className="text-slate-500">API runtime</p>
                        <p className="mt-1 font-semibold text-slate-800">{selectedSite.elapsed_ms == null ? "N/A" : `${selectedSite.elapsed_ms.toFixed(0)} ms`}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
                      <p><strong>Model:</strong> 2.0 </p>
                      {hasUsableSatelliteData ? (
                        <p><strong>Satellite:</strong> {displayValue(selectedSite.satellite_provider)}</p>
                      ) : null}
                      <p><strong>Sources:</strong> {selectedSite.data_sources.length ? selectedSite.data_sources.join(", ") : "N/A"}</p>
                      <p className="border-t border-slate-200 pt-2 text-[11px]">{displayValue(selectedSite.disclaimer)}</p>
                    </div>
                  </section>
                </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <Card className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white sm:max-w-lg sm:rounded-2xl">
            <CardHeader className="pr-12"><CardTitle className="text-xl">How Categorize Works</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <Button variant="ghost" className="absolute right-2 top-2 text-slate-500 hover:text-slate-700" onClick={() => setShowInfo(false)}><X className="h-5 w-5" /></Button>
              <p>When satellite is on, the page uses `spatial/source_metadata` and combines source probabilities, mapped OSM evidence, and Sentinel-2 surface context.</p>
              <p>When satellite is off, the page switches to `spatial/categorize_site` and shows an OSM-driven grey context-only view based on site category data.</p>
              <p>The confidence values describe model inference, not confirmed emissions. Use the evidence trail and ground validation before making operational decisions.</p>
              <p>Click the map, upload a CSV with latitude and longitude columns, or paste coordinates manually. Results are stored separately for the two modes.</p>
            </CardContent>
          </Card>
        </div>
      )}
      {loading && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="flex items-center space-x-2 rounded-2xl bg-white p-4 shadow-xl"><Loader2 className="h-4 w-4 animate-spin" /><span className="font-bold text-slate-700">{includeSatellite ? "Processing satellite-enriched source metadata..." : "Processing OSM site categorization..."}</span></div></div>}
    </div>
  )
}

export default function SiteCategory() {
  return (
    <Suspense fallback={<div>Loading source metadata...</div>}>
      <SiteCategoryContent />
    </Suspense>
  )
}
