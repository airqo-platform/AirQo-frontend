import type { MaintenanceMapItem, MaintenanceMapSite } from "@/types/api.types"
import { cheapestInsertionKm, haversineDistance, type Coordinates } from "@/utils/routing-utils"
import { formatCompactNumber } from "@/lib/utils"

/** What the maintenance map plots: one marker per device, or per site with its devices rolled up. */
export type MaintenanceMapView = "devices" | "sites"

export const MAINTENANCE_MAP_VIEWS: readonly MaintenanceMapView[] = ["devices", "sites"]

export const isMaintenanceMapView = (value: unknown): value is MaintenanceMapView =>
  value === "devices" || value === "sites"

/** AirQo looks after its devices; other organisations think in terms of their sites. */
export const getDefaultMaintenanceMapView = (activeGroup: string | null | undefined): MaintenanceMapView =>
  activeGroup?.toLowerCase() === "airqo" ? "devices" : "sites"

export interface MapItemNoun {
  singular: string
  plural: string
}

export const MAP_ITEM_NOUNS: Record<MaintenanceMapView, MapItemNoun> = {
  devices: { singular: "device", plural: "devices" },
  sites: { singular: "site", plural: "sites" },
}

export const countLabel = (count: number, noun: MapItemNoun) => `${count} ${count === 1 ? noun.singular : noun.plural}`

export type ErrorMarginBand = "good" | "moderate" | "critical"

/** The map's error margin bands in µg/m³, as its legend, filters and markers draw them. */
export const getErrorMarginBand = (errorMargin: number): ErrorMarginBand =>
  errorMargin <= 10 ? "good" : errorMargin <= 20 ? "moderate" : "critical"

export const ERROR_MARGIN_BADGE_CLASSES: Record<ErrorMarginBand | "none", string> = {
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  none: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700/80 dark:text-gray-300 dark:border-gray-600/60",
}

/**
 * The band of a map item's error margin, or "none" when it has no paired sensor readings: an
 * offline device, or a site none of whose devices read both sensors. The API sends 0 for those.
 */
export function getItemErrorMarginBand(item: MaintenanceMapItem, isOffline: boolean): ErrorMarginBand | "none" {
  const em = Number(item.error_margin)
  if (!Number.isFinite(em)) return "none"
  if (item.site ? item.site.error_margin_devices === 0 : isOffline) return "none"
  return getErrorMarginBand(em)
}

// ─── Route suggestions ───────────────────────────────────────────────────────

/** A suggestion may add at most this many straight-line km to the round trip. */
export const SUGGESTION_MAX_DETOUR_KM = 5
export const SUGGESTION_LIMIT = 5

export interface RouteSuggestion {
  item: MaintenanceMapItem
  /** Extra straight-line km to fit it into the route; used to rank, not shown */
  detourKm: number
  /** The route stop it is closest to, to say where it is */
  nearStopName: string
  /** Why it needs a visit, e.g. "Offline · last data 6 days ago" */
  reasons: string[]
  /** 3 offline, 2 critical uptime or error margin */
  severity: number
}

/**
 * Whether an item has a place on the map. A site without coordinates arrives with null ones, and
 * `Number(null)` is 0, so null is ruled out before the number check or the site lands at (0, 0).
 */
export const hasMapCoordinates = (item: Pick<MaintenanceMapItem, "latitude" | "longitude">): boolean =>
  item.latitude != null &&
  item.longitude != null &&
  Number.isFinite(Number(item.latitude)) &&
  Number.isFinite(Number(item.longitude))

const toCoords = (item: MaintenanceMapItem): Coordinates => ({
  latitude: Number(item.latitude),
  longitude: Number(item.longitude),
})

/** What makes an item worth a visit, in the map legend's critical bands; severity 0 when none. */
export function getAttentionReasons(item: MaintenanceMapItem, now: number = Date.now()): { severity: number; reasons: string[] } {
  const raw = Number(item.uptime)
  const uptimePct = Number.isFinite(raw) ? (raw <= 1 ? raw * 100 : raw) : 0
  const isOffline = uptimePct === 0 || !item.last_active
  const reasons: string[] = []
  let severity = 0

  if (isOffline) {
    const last = item.last_active ? new Date(item.last_active).getTime() : NaN
    const days = Number.isFinite(last) ? Math.floor((now - last) / 86400000) : null
    reasons.push(days === null ? "Offline · no data" : days >= 1 ? `Offline · last data ${days} day${days === 1 ? "" : "s"} ago` : "Offline")
    severity = 3
  } else if (uptimePct < 50) {
    reasons.push(`Uptime ${uptimePct.toFixed(0)}%`)
    severity = 2
  }

  if (getItemErrorMarginBand(item, isOffline) === "critical") {
    reasons.push(`Error ±${formatCompactNumber(Number(item.error_margin), 1)}`)
    severity = Math.max(severity, 2)
  }

  return { severity, reasons }
}

/**
 * Items not on the route that need a visit and are close to it: offline, or in the critical
 * uptime or error margin band, and adding at most `maxDetourKm` to the trip. Most serious first,
 * then the smallest detour.
 */
export function suggestRouteAdditions(
  start: Coordinates,
  route: MaintenanceMapItem[],
  candidates: MaintenanceMapItem[],
  { maxDetourKm = SUGGESTION_MAX_DETOUR_KM, limit = SUGGESTION_LIMIT, now = Date.now() } = {}
): RouteSuggestion[] {
  const located = route.filter(hasMapCoordinates)
  const stops = located.map(toCoords)
  if (stops.length === 0) return []
  const onRoute = new Set(route.map((item) => item.device_id))
  const nearestStopName = (point: Coordinates) => {
    let best = located[0]
    let bestKm = Infinity
    for (const stop of located) {
      const km = haversineDistance(point.latitude, point.longitude, Number(stop.latitude), Number(stop.longitude))
      if (km < bestKm) {
        best = stop
        bestKm = km
      }
    }
    return best.device_name || best.device_id
  }

  return candidates
    .filter((item) => !onRoute.has(item.device_id) && hasMapCoordinates(item))
    .flatMap((item) => {
      const { severity, reasons } = getAttentionReasons(item, now)
      if (severity === 0) return []
      const point = toCoords(item)
      const detourKm = cheapestInsertionKm(start, stops, point)
      return detourKm <= maxDetourKm ? [{ item, detourKm, nearStopName: nearestStopName(point), reasons, severity }] : []
    })
    .sort((a, b) => b.severity - a.severity || a.detourKm - b.detourKm)
    .slice(0, limit)
}

/**
 * A site as a map item. The map keys, selects and routes items by `device_id`, so a site item
 * carries the site id there and the site itself under `site`. A site without coordinates keeps
 * them null, which `hasMapCoordinates` keeps off the map.
 */
export function siteToMapItem(site: MaintenanceMapSite): MaintenanceMapItem {
  return {
    device_id: site.site_id,
    device_name: site.site_name,
    device_number: null,
    latitude: site.latitude as number,
    longitude: site.longitude as number,
    last_active: site.last_active,
    uptime: site.uptime,
    data_completeness: site.data_completeness,
    error_margin: site.error_margin,
    cohorts: site.cohorts,
    grids: site.grids,
    site,
  }
}

/** District, city, region and country, most specific first and without repeats. */
export function formatSiteLocation(site: Pick<MaintenanceMapSite, "district" | "city" | "region" | "country">): string {
  const parts = [site.district, site.city, site.region, site.country]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
  return parts
    .filter((part, index) => parts.findIndex((p) => p.toLowerCase() === part.toLowerCase()) === index)
    .join(", ")
}
