import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios"
import type { DataDownloadRecord, DataDownloadRequest, DataDownloadResponse, ReportDataOptions, SiteData } from "@/lib/types"

// Remove the incorrect import and add the utility function directly
const removeTrailingSlash = (url: string): string => {
  return url.endsWith("/") ? url.slice(0, -1) : url
}

const BASE_URL = "/api/airqo"
const RETRYABLE_API_STATUSES = new Set([429, 500, 502, 503, 504])
const MAP_RETRYABLE_API_STATUSES = new Set([401, ...RETRYABLE_API_STATUSES])
const MAX_API_ATTEMPTS = 3
const MAX_SATELLITE_API_ATTEMPTS = 5
const ACTIVE_FIRES_FAILURE_COOLDOWN_MS = 30 * 1000
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _airqoRetryCount?: number
  _airqoMaxAttempts?: number
  _airqoRetryableStatuses?: ReadonlySet<number>
}
const ACTIVE_FIRES_PATH = "/spatial/active_fires/africa"
// Axios instance with a base URL and default headers
const apiService = axios.create({
  baseURL: removeTrailingSlash(BASE_URL),
  headers: {
    "Content-Type": "application/json",
  },
})

apiService.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const config = error.config as RetryableRequestConfig | undefined
    const method = config?.method?.toUpperCase() || "GET"
    const retryCount = config?._airqoRetryCount || 0
    const maxAttempts = config?._airqoMaxAttempts || MAX_API_ATTEMPTS
    const retryableStatuses = config?._airqoRetryableStatuses || RETRYABLE_API_STATUSES
    const isRetryableFailure = !status || retryableStatuses.has(status)

    if (
      config &&
      method === "GET" &&
      isRetryableFailure &&
      retryCount < maxAttempts - 1
    ) {
      config._airqoRetryCount = retryCount + 1
      await delay(500 * config._airqoRetryCount)
      return apiService.request(config)
    }

    return Promise.reject(error)
  },
)

// Interface for health tip
interface HealthTip {
  title?: string
  description?: string
  image?: string
}

// Interface for measurement value
interface MeasurementValue {
  value: number | null
}

// Interface for site details
interface SiteDetails {
  _id: string
  name: string
  formatted_name?: string
  approximate_latitude?: number
  approximate_longitude?: number
  country?: string
  location_name?: string
  city?: string
  region?: string
  data_provider?: string
}

// Interface for map node measurement
interface MapNode {
  _id: string
  site_id: string
  time: string
  aqi_category?: string
  aqi_color?: string
  aqi_color_name?: string
  device: string
  device_id: string
  pm2_5: MeasurementValue
  pm10: MeasurementValue
  no2: Partial<MeasurementValue>
  health_tips: HealthTip[]
  siteDetails: SiteDetails
  createdAt: string
  updatedAt: string
}

// Interface for heatmap data
interface HeatmapData {
  bounds: [[number, number], [number, number]]
  city: string
  id: string
  image: string // base64 encoded image
  message: string
}

export interface ActiveFire {
  acquisition_date?: string | null
  acquisition_datetime?: string | null
  acquisition_time?: string | null
  bright_t31?: number | null
  brightness?: number | null
  confidence?: string | number | null
  daynight?: string | null
  frp?: number | null
  instrument?: string | null
  latitude: number
  longitude: number
  product?: string | null
  satellite?: string | null
  scan?: number | null
  track?: number | null
  version?: string | null
}

export interface DailyForecastValues {
  pm2_5_mean: number | null
  pm2_5_low: number | null
  pm2_5_high: number | null
  pm2_5_min: number | null
  pm2_5_max: number | null
  forecast_confidence: number | null
}

export interface DailyForecastAqi {
  aqi_value: number | null
  label?: string
  aqi_category?: string
  aqi_color?: string
  aqi_color_name?: string
}

export interface DailyForecastMet {
  air_temperature: number | null
  relative_humidity: number | null
  air_pressure_at_sea_level: number | null
  precipitation_amount: number | null
  cloud_area_fraction: number | null
  wind_speed: number | null
  wind_from_direction: number | null
  wind_direction_compass?: string
}

export interface DailyForecastEntry {
  date: string
  created_at?: string
  forecast: DailyForecastValues
  aqi: DailyForecastAqi
  met: DailyForecastMet | null
}

export interface DailyForecastSiteDetails {
  site_id: string
  site_name: string
  site_latitude: number
  site_longitude: number
}

export interface DailyForecastSite {
  site_details: DailyForecastSiteDetails
  start_date: string
  end_date: string
  days: number
  total: number
  forecasts: DailyForecastEntry[]
}

export interface DailyForecastResponse {
  start_date: string
  end_date: string
  days: number
  total: number
  units?: Record<string, string>
  descriptions?: Record<string, string>
  forecasts: DailyForecastSite[]
}

export interface HourlyForecastValues {
  pm2_5_mean: number | null
  pm2_5_q10: number | null
  pm2_5_q90: number | null
  forecast_confidence: number | null
}

export interface HourlyForecastEntry {
  timestamp: string
  created_at?: string
  forecast: HourlyForecastValues
  aqi: DailyForecastAqi
  met: DailyForecastMet | null
}

export interface HourlyForecastSite {
  site_details: DailyForecastSiteDetails
  start_timestamp: string
  end_timestamp: string
  hours: number
  total: number
  forecasts: HourlyForecastEntry[]
}

export interface HourlyForecastResponse {
  start_timestamp: string
  end_timestamp: string
  hours: number
  page?: number
  limit?: number
  total_pages?: number
  total: number
  units?: Record<string, string>
  descriptions?: Record<string, string>
  forecasts: HourlyForecastSite[]
}

interface SiteHistoricalItem {
  time?: string
  timestamp?: string
  datetime?: string
  pm2_5?: MeasurementValue | number | null
  pm2_5_calibrated_value?: number | null
  pm2_5_raw_value?: number | null
}

export interface SatellitePredictionRequest {
  latitude: number
  longitude: number
  timestamp: string
}

// Satellite API service to fetch data with POST request
export const getSatelliteData = async (body: SatellitePredictionRequest) => {
  for (let attempt = 1; attempt <= MAX_SATELLITE_API_ATTEMPTS; attempt += 1) {
    try {
      const response = await apiService.post("/spatial/satellite_prediction", body)
      return response.data
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      const shouldRetry = status === 502 && attempt < MAX_SATELLITE_API_ATTEMPTS

      if (!shouldRetry) throw error
      await delay(500 * attempt)
    }
  }

  throw new Error("Satellite prediction failed after five attempts.")
}

// Map and Reports use the same readings endpoint. Keep one shared request/cache so
// the app-level warm-up can be reused when either page is opened later.
const MAP_READINGS_CACHE_MAX_AGE_MS = 5 * 60 * 1000
const MAP_LOAD_MAX_ATTEMPTS = 5
let mapReadingsRequest: Promise<MapNode[]> | null = null
let mapReadingsCache: { data: MapNode[]; cachedAt: number } | null = null

const withoutInterceptorRetries = { _airqoMaxAttempts: 1 } as AxiosRequestConfig

const runMapLoadWithRetries = async <T,>(
  request: () => Promise<T>,
  hasUsableData: (result: T) => boolean,
  retryableStatuses: ReadonlySet<number> = RETRYABLE_API_STATUSES,
): Promise<T> => {
  let lastResult: T | undefined

  for (let attempt = 1; attempt <= MAP_LOAD_MAX_ATTEMPTS; attempt += 1) {
    try {
      lastResult = await request()
      if (hasUsableData(lastResult) || attempt === MAP_LOAD_MAX_ATTEMPTS) return lastResult
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      const isRetryableFailure = !status || retryableStatuses.has(status)
      if (!isRetryableFailure || attempt === MAP_LOAD_MAX_ATTEMPTS) throw error
    }

    await delay(500 * attempt)
  }

  return lastResult as T
}

const fetchMapReadings = (): Promise<MapNode[]> => {
  if (mapReadingsCache && Date.now() - mapReadingsCache.cachedAt < MAP_READINGS_CACHE_MAX_AGE_MS) {
    return Promise.resolve(mapReadingsCache.data)
  }
  if (mapReadingsRequest) return mapReadingsRequest

  mapReadingsRequest = runMapLoadWithRetries(
    () => apiService.get("/devices/readings/map", withoutInterceptorRetries),
    (response) => Array.isArray(response.data?.measurements) && response.data.measurements.length > 0,
    MAP_RETRYABLE_API_STATUSES,
  )
    .then((response) => {
      const data = Array.isArray(response.data?.measurements) ? response.data.measurements : []
      if (data.length > 0) mapReadingsCache = { data, cachedAt: Date.now() }
      return data
    })
    .finally(() => {
      mapReadingsRequest = null
    })

  return mapReadingsRequest
}

export const prefetchMapAndReportData = async (): Promise<void> => {
  try {
    await fetchMapReadings()
  } catch (error) {
    console.error("Error prefetching map and report data after retries:", error)
  }
}

export const getMapNodes = async (): Promise<MapNode[] | null> => {
  try {
    return await fetchMapReadings()
  } catch (error) {
    console.error("Error fetching map nodes after retries:", error)
    return null
  }
}

// Fetch report data and let callers distinguish request failures from empty results.
export const getReportData = async (): Promise<MapNode[]> => fetchMapReadings()

let heatmapDataRequest: Promise<HeatmapData[] | null> | null = null
let heatmapRetryBlockedUntil = 0

// Get heatmap data from the spatial heatmaps endpoint with a hard retry cap.
export const getHeatmapData = async (): Promise<HeatmapData[] | null> => {
  if (Date.now() < heatmapRetryBlockedUntil) return null
  if (heatmapDataRequest) return heatmapDataRequest

  heatmapDataRequest = (async () => {
    try {
      const response = await apiService.get("/spatial/heatmaps", {
        _airqoMaxAttempts: MAP_LOAD_MAX_ATTEMPTS,
        _airqoRetryableStatuses: MAP_RETRYABLE_API_STATUSES,
      } as AxiosRequestConfig)
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data
      }

      console.warn("No heatmap data was returned.")
      return null
    } catch (error) {
      heatmapRetryBlockedUntil = Date.now() + 5 * 60 * 1000
      console.error("Heatmap fetch failed after 5 attempts. Skipping retries for 5 minutes:", error)
      return null
    }
  })()

  try {
    return await heatmapDataRequest
  } finally {
    heatmapDataRequest = null
  }
}

const getActiveFireTimestamp = (fire: ActiveFire) => {
  const directTimestamp = fire.acquisition_datetime ? Date.parse(fire.acquisition_datetime) : Number.NaN
  if (Number.isFinite(directTimestamp)) return directTimestamp

  const time = fire.acquisition_time?.padStart(4, "0")
  if (!fire.acquisition_date || !time) return null

  const fallbackTimestamp = Date.parse(
    `${fire.acquisition_date}T${time.slice(0, 2)}:${time.slice(2, 4)}:00Z`,
  )
  return Number.isFinite(fallbackTimestamp) ? fallbackTimestamp : null
}

const getActiveFireDeduplicationKey = (fire: ActiveFire) => {
  const latitudeBucket = fire.latitude.toFixed(2)
  const longitudeBucket = fire.longitude.toFixed(2)
  const timestamp = getActiveFireTimestamp(fire)
  const tenMinuteBucket = timestamp == null ? "unknown" : Math.floor(timestamp / 600_000)

  return `${latitudeBucket}:${longitudeBucket}:${tenMinuteBucket}`
}

const deduplicateActiveFires = (fires: ActiveFire[]) => {
  const uniqueFires = new Map<string, ActiveFire>()

  fires.forEach((fire) => {
    const key = getActiveFireDeduplicationKey(fire)
    const existing = uniqueFires.get(key)

    if (!existing || (fire.frp ?? 0) > (existing.frp ?? 0)) {
      uniqueFires.set(key, fire)
    }
  })

  return Array.from(uniqueFires.values())
}

let activeFiresRequest: Promise<ActiveFire[] | null> | null = null
let activeFiresBlockedUntil = 0

export const getActiveFires = async (): Promise<ActiveFire[] | null> => {
  if (Date.now() < activeFiresBlockedUntil) return null
  if (activeFiresRequest) return activeFiresRequest

  activeFiresRequest = (async () => {
    try {
      const response = await apiService.get(ACTIVE_FIRES_PATH, {
        params: { hours: 24 },
      })
      const fires = response.data?.data?.fires

      if (!Array.isArray(fires)) {
        console.warn("Active-fire response did not include a fires array.")
        return []
      }

      const validFires = fires
        .filter(
          (fire): fire is ActiveFire =>
            fire &&
            typeof fire.latitude === "number" &&
            Number.isFinite(fire.latitude) &&
            typeof fire.longitude === "number" &&
            Number.isFinite(fire.longitude),
        )
        .map((fire) => ({ ...fire, product: fire.product || "NASA FIRMS" }))

      return deduplicateActiveFires(validFires)
    } catch (error) {
      activeFiresBlockedUntil = Date.now() + ACTIVE_FIRES_FAILURE_COOLDOWN_MS
      console.error("Active-fire request failed. Pausing new requests for 30 seconds:", error)
      return null
    } finally {
      activeFiresRequest = null
    }
  })()

  return activeFiresRequest
}

const unwrapForecastPayload = (value: any): any => {
  let current = value

  for (let i = 0; i < 6; i++) {
    if (Array.isArray(current) && current.length === 1) {
      current = current[0]
      continue
    }
    break
  }

  return current
}

let dailyForecastRequest: Promise<DailyForecastResponse | null> | null = null

export const getDailyForecastCollection = async (): Promise<DailyForecastResponse | null> => {
  if (dailyForecastRequest) return dailyForecastRequest

  dailyForecastRequest = (async () => {
    try {
      const response = await runMapLoadWithRetries(
        () => apiService.get("/predict/daily-forecasting", withoutInterceptorRetries),
        (result) => {
          const payload = unwrapForecastPayload(result.data)
          const data = payload?.data ? unwrapForecastPayload(payload.data) : payload
          return Boolean(
            data &&
            typeof data === "object" &&
            Array.isArray((data as DailyForecastResponse).forecasts) &&
            (data as DailyForecastResponse).forecasts.length > 0
          )
        },
        MAP_RETRYABLE_API_STATUSES,
      )
      const payload = unwrapForecastPayload(response.data)
      const data = payload?.data ? unwrapForecastPayload(payload.data) : payload

      if (data && typeof data === "object" && Array.isArray((data as DailyForecastResponse).forecasts)) {
        return data as DailyForecastResponse
      }

      return null
    } catch (error) {
      console.error("Error fetching daily forecast collection after retries:", error)
      throw error
    }
  })()

  try {
    return await dailyForecastRequest
  } finally {
    dailyForecastRequest = null
  }
}

export const getDailyForecast = async (siteId: string): Promise<DailyForecastSite | null> => {
  try {
    const collection = await getDailyForecastCollection()
    if (!collection?.forecasts?.length) return null
    return collection.forecasts.find((site) => site.site_details?.site_id === siteId) || null
  } catch (error) {
    console.error("Error fetching site daily forecast:", error)
    return null
  }
}

const getHourlyForecastPage = async (
  siteId: string | null,
  page: number,
  limit: number,
  hours: number,
): Promise<HourlyForecastResponse | null> => {
  const response = await apiService.get("/predict/hourly-forecasting", {
    params: {
      ...(siteId ? { site_id: siteId } : {}),
      page,
      limit,
      hours,
    },
  })

  const payload = unwrapForecastPayload(response.data)
  const data = payload?.data ? unwrapForecastPayload(payload.data) : payload

  if (data && typeof data === "object" && Array.isArray((data as HourlyForecastResponse).forecasts)) {
    return data as HourlyForecastResponse
  }

  return null
}

const mergeHourlyForecastCollectionPages = (pages: HourlyForecastResponse[]): HourlyForecastResponse | null => {
  if (!pages.length) return null

  const firstPage = pages[0]
  const siteById = new Map<string, HourlyForecastSite>()
  const forecastMapsBySiteId = new Map<string, Map<string, HourlyForecastEntry>>()

  pages.forEach((page) => {
    page.forecasts?.forEach((site) => {
      const siteId = site.site_details?.site_id
      if (!siteId) return

      if (!siteById.has(siteId)) {
        siteById.set(siteId, site)
        forecastMapsBySiteId.set(siteId, new Map<string, HourlyForecastEntry>())
      }

      const forecastMap = forecastMapsBySiteId.get(siteId)
      site.forecasts?.forEach((forecast) => {
        if (forecast?.timestamp) {
          forecastMap?.set(forecast.timestamp, forecast)
        }
      })
    })
  })

  const forecasts = Array.from(siteById.entries()).map(([siteId, site]) => {
    const siteForecasts = Array.from(forecastMapsBySiteId.get(siteId)?.values() || []).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    return {
      ...site,
      start_timestamp: siteForecasts[0]?.timestamp || site.start_timestamp,
      end_timestamp: siteForecasts[siteForecasts.length - 1]?.timestamp || site.end_timestamp,
      forecasts: siteForecasts,
    }
  })

  return {
    ...firstPage,
    forecasts,
  }
}

export const getHourlyForecastCollection = async (hours = 168, pageSize = 10): Promise<HourlyForecastResponse | null> => {
  try {
    const firstPage = await getHourlyForecastPage(null, 1, pageSize, hours)
    if (!firstPage) return null

    const totalPages = Math.max(1, firstPage.total_pages || 1)
    const remainingPages =
      totalPages > 1
        ? await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) => getHourlyForecastPage(null, index + 2, pageSize, hours)),
          )
        : []

    const pages = [firstPage, ...remainingPages.filter((page): page is HourlyForecastResponse => !!page)]
    const collection = mergeHourlyForecastCollectionPages(pages)

    if (!collection?.forecasts?.length) return null

    return {
      ...collection,
      forecasts: collection.forecasts.map((site) => ({
        ...site,
        forecasts: site.forecasts.slice(0, hours),
      })),
    }
  } catch (error) {
    console.error("Error fetching hourly forecast collection:", error)
    return null
  }
}

const mergeHourlyForecastPages = (siteId: string, pages: HourlyForecastResponse[]): HourlyForecastSite | null => {
  const returnedSites = pages.flatMap((page) => page.forecasts || [])
  const matchingSites = returnedSites.filter((site) => site.site_details?.site_id === siteId)
  const sites = matchingSites.length > 0 ? matchingSites : returnedSites.length === 1 ? returnedSites : []

  if (!sites.length) return null

  const firstSite = sites[0]
  const forecastByTimestamp = new Map<string, HourlyForecastEntry>()

  sites.forEach((site) => {
    site.forecasts?.forEach((forecast) => {
      if (forecast?.timestamp) {
        forecastByTimestamp.set(forecast.timestamp, forecast)
      }
    })
  })

  const forecasts = Array.from(forecastByTimestamp.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  return {
    ...firstSite,
    start_timestamp: forecasts[0]?.timestamp || firstSite.start_timestamp,
    end_timestamp: forecasts[forecasts.length - 1]?.timestamp || firstSite.end_timestamp,
    hours: pages[0]?.hours ?? firstSite.hours,
    total: pages[0]?.total ?? firstSite.total,
    forecasts,
  }
}

const hourlyForecastSiteRequests = new Map<string, Promise<HourlyForecastSite | null>>()

export const getHourlyForecast = async (siteId: string, hours = 168, pageSize = 100): Promise<HourlyForecastSite | null> => {
  const requestKey = `${siteId}:${hours}:${pageSize}`
  const existingRequest = hourlyForecastSiteRequests.get(requestKey)
  if (existingRequest) return existingRequest

  const request = (async () => {
    try {
      const firstPage = await getHourlyForecastPage(siteId, 1, pageSize, hours)
      if (!firstPage) return null

      const pages = [firstPage]
      const totalPages = Math.max(1, firstPage.total_pages || 1)

      // Avoid sending a burst of parallel requests if one site still spans multiple pages.
      for (let page = 2; page <= totalPages; page += 1) {
        const nextPage = await getHourlyForecastPage(siteId, page, pageSize, hours)
        if (nextPage) pages.push(nextPage)
      }

      const mergedSite = mergeHourlyForecastPages(siteId, pages)

      if (mergedSite?.forecasts?.length) {
        return {
          ...mergedSite,
          forecasts: mergedSite.forecasts.slice(0, hours),
        }
      }

      return null
    } catch (error) {
      console.error("Error fetching site hourly forecast:", error)
      return null
    } finally {
      hourlyForecastSiteRequests.delete(requestKey)
    }
  })()

  hourlyForecastSiteRequests.set(requestKey, request)
  return request
}

export const getSiteHistorical = async (
  siteId: string,
  startTime: string = "LAST7DAYS",
  endTime: string = "TODAY",
): Promise<SiteHistoricalItem[] | null> => {
  try {
    const extractMeasurements = (value: any): SiteHistoricalItem[] | null => {
      const isMeasurementRow = (row: any) =>
        row &&
        typeof row === "object" &&
        (typeof row.time === "string" || typeof row.timestamp === "string" || typeof row.datetime === "string") &&
        ("pm2_5" in row || "pm2_5_calibrated_value" in row || "pm2_5_raw_value" in row)

      const unwrapSingles = (v: any) => {
        let current = v
        // Some endpoints wrap response as `[[[{...}]]]` etc.
        for (let i = 0; i < 6; i++) {
          if (Array.isArray(current) && current.length === 1) {
            current = current[0]
            continue
          }
          break
        }
        return current
      }

      const v = unwrapSingles(value)

      if (Array.isArray(v)) {
        // Case A: array of measurement rows
        if (v.length && isMeasurementRow(v[0])) return v as SiteHistoricalItem[]

        // Case B: array of wrapper objects each with measurements
        const collected: SiteHistoricalItem[] = []
        v.forEach((item) => {
          const unwrappedItem = unwrapSingles(item)
          if (unwrappedItem && typeof unwrappedItem === "object" && Array.isArray((unwrappedItem as any).measurements)) {
            collected.push(...((unwrappedItem as any).measurements as SiteHistoricalItem[]))
            return
          }
          if (unwrappedItem && typeof unwrappedItem === "object" && Array.isArray((unwrappedItem as any).data)) {
            collected.push(...((unwrappedItem as any).data as SiteHistoricalItem[]))
            return
          }
          if (unwrappedItem && typeof unwrappedItem === "object" && Array.isArray((unwrappedItem as any).results)) {
            collected.push(...((unwrappedItem as any).results as SiteHistoricalItem[]))
            return
          }
        })
        return collected.length ? collected : null
      }

      if (v && typeof v === "object") {
        if (Array.isArray((v as any).measurements)) return (v as any).measurements as SiteHistoricalItem[]
        if (Array.isArray((v as any).data)) return (v as any).data as SiteHistoricalItem[]
        if (Array.isArray((v as any).results)) return (v as any).results as SiteHistoricalItem[]
      }

      return null
    }

    const fetchHistorical = async (s: string, e: string) => {
      const response = await apiService.get(`/devices/measurements/sites/${siteId}/historical`, {
        params: {
          startTime: s,
          endTime: e,
        },
      })
      return extractMeasurements(response.data)
    }

    // Prefer explicit ISO times (some deployments don't accept LAST7DAYS/TODAY reliably).
    const isoResult = await fetchHistorical(startTime, endTime)
    if (isoResult?.length) return isoResult

    // Fallback to keyword params if the caller passed ISO (or vice versa).
    const keywordResult = await fetchHistorical("LAST7DAYS", "TODAY")
    if (keywordResult?.length) return keywordResult

    return isoResult || keywordResult || null
  } catch (error) {
    console.error("Error fetching site historical:", error)
    return null
  }
}

/** Fetch historical selected-site measurements through the server-side AirQo proxy. */
export const getSiteReportData = async (request: DataDownloadRequest): Promise<DataDownloadResponse> => {
  let response
  try {
    response = await apiService.post<DataDownloadResponse | string>("/analytics/data-download", request)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 500) {
      throw new Error("Our file-retrieval service encountered an issue. The robot is attempting recovery. Please regenerate the report.")
    }
    throw error
  }
  const payload = response.data

  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload) as DataDownloadResponse
      if (parsed && typeof parsed === "object") return parsed
    } catch {
      throw new Error("The report API returned an invalid JSON response.")
    }
  }

  return payload as DataDownloadResponse
}

const getRecordString = (record: DataDownloadRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) return value.trim()
    if (typeof value === "number" && Number.isFinite(value)) return String(value)
  }
  return null
}

const getRecordNumber = (record: DataDownloadRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key]
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value.replace(/^'+/, "")) : NaN
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const normalizeSiteName = (value?: string | null) => (value || "").trim().toLowerCase().replace(/[_\s]+/g, " ")

const getAqiCategory = (pm25: number) => {
  if (pm25 <= 12) return { category: "Good", color: "#A8E05F" }
  if (pm25 <= 35.4) return { category: "Moderate", color: "#FDD64B" }
  if (pm25 <= 55.4) return { category: "Unhealthy for Sensitive Groups", color: "#FF9B57" }
  if (pm25 <= 150.4) return { category: "Unhealthy", color: "#FE6A69" }
  if (pm25 <= 250.4) return { category: "Very Unhealthy", color: "#A97ABC" }
  return { category: "Hazardous", color: "#A87383" }
}

const average = (values: number[]) =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

const getRecordTimestamp = (record: DataDownloadRecord) => {
  const value = getRecordString(record, [
    "datetime",
    "date_time",
    "timestamp",
    "time",
    "date",
    "day",
  ])
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

const getPm25Value = (record: DataDownloadRecord, dataType: ReportDataOptions["dataType"]) =>
  dataType === "calibrated"
    ? getRecordNumber(record, ["pm2_5_calibrated_value", "pm2_5", "pm2_5_raw_value"])
    : getRecordNumber(record, ["pm2_5_raw_value", "pm2_5", "pm2_5_calibrated_value"])

export const buildSiteReportData = (
  response: DataDownloadResponse,
  sourceSites: SiteData[],
  options: ReportDataOptions,
): SiteData[] => {
  if (!Array.isArray(response.data) || response.data.length === 0) {
    throw new Error(response.message || "No measurements were returned for the selected sites and dates.")
  }

  const sourceById = new Map<string, SiteData>()
  const sourceByName = new Map<string, SiteData>()
  sourceSites.forEach((site) => {
    ;[site.site_id, site.siteDetails?._id, site._id].filter((id): id is string => Boolean(id)).forEach((id) => sourceById.set(id, site))
    ;[site.siteDetails?.name, site.siteDetails?.formatted_name, site.siteDetails?.location_name]
      .map(normalizeSiteName)
      .filter(Boolean)
      .forEach((name) => sourceByName.set(name, site))
  })

  const groupedRecords = new Map<string, { source?: SiteData; records: DataDownloadRecord[] }>()
  response.data.forEach((record) => {
    const recordSiteId = getRecordString(record, ["site_id", "siteId", "site"])
    const recordSiteName = getRecordString(record, ["site_name", "location_name", "name"])
    const source = (recordSiteId ? sourceById.get(recordSiteId) : undefined) || sourceByName.get(normalizeSiteName(recordSiteName))
    const groupKey = source?.site_id || source?.siteDetails?._id || recordSiteId || normalizeSiteName(recordSiteName)
    if (!groupKey) return

    const group = groupedRecords.get(groupKey) || { source, records: [] }
    group.records.push(record)
    groupedRecords.set(groupKey, group)
  })

  const endTimestamp = Date.parse(options.endDate)
  const endDate = new Date(endTimestamp)
  const currentWeekStart = endTimestamp - 7 * 24 * 60 * 60 * 1000
  const previousWeekStart = endTimestamp - 14 * 24 * 60 * 60 * 1000
  const currentMonthStart = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1)
  const nextMonthStart = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, 1)
  const previousMonthStart = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() - 1, 1)

  return Array.from(groupedRecords.entries()).flatMap(([groupKey, group]) => {
    const measurements = group.records
      .map((record) => ({ value: getPm25Value(record, options.dataType), timestamp: getRecordTimestamp(record) }))
      .filter((measurement): measurement is { value: number; timestamp: number | null } => measurement.value !== null)
    if (measurements.length === 0) return []

    const selectedStartTimestamp = Date.parse(options.startDate)
    const periodMeasurements = measurements.filter(
      (measurement) =>
        measurement.timestamp === null ||
        (measurement.timestamp >= selectedStartTimestamp && measurement.timestamp <= endTimestamp),
    )
    if (periodMeasurements.length === 0) return []

    const periodAverage = average(periodMeasurements.map((measurement) => measurement.value))
    const reportMeasurements = periodMeasurements
      .filter((measurement): measurement is { value: number; timestamp: number } => measurement.timestamp !== null)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((measurement) => ({ timestamp: new Date(measurement.timestamp).toISOString(), value: measurement.value }))
    const currentValues = measurements
      .filter((measurement) => measurement.timestamp !== null && measurement.timestamp >= currentWeekStart)
      .map((measurement) => measurement.value)
    const previousValues = measurements
      .filter(
        (measurement) =>
          measurement.timestamp !== null &&
          measurement.timestamp >= previousWeekStart &&
          measurement.timestamp < currentWeekStart,
      )
      .map((measurement) => measurement.value)
    const currentWeek = currentValues.length > 0 ? average(currentValues) : periodAverage
    const previousWeek = previousValues.length > 0 ? average(previousValues) : currentWeek
    const percentageDifference = previousWeek > 0 ? ((currentWeek - previousWeek) / previousWeek) * 100 : 0
    const currentMonthValues = measurements
      .filter(
        (measurement) =>
          measurement.timestamp !== null &&
          measurement.timestamp >= currentMonthStart &&
          measurement.timestamp < nextMonthStart,
      )
      .map((measurement) => measurement.value)
    const previousMonthValues = measurements
      .filter(
        (measurement) =>
          measurement.timestamp !== null &&
          measurement.timestamp >= previousMonthStart &&
          measurement.timestamp < currentMonthStart,
      )
      .map((measurement) => measurement.value)
    const currentMonth = currentMonthValues.length > 0 ? average(currentMonthValues) : periodAverage
    const previousMonth = previousMonthValues.length > 0 ? average(previousMonthValues) : currentMonth
    const monthlyPercentageDifference =
      previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0
    const latestTimestamp = Math.max(...periodMeasurements.map((measurement) => measurement.timestamp || 0))
    const representativeRecord = group.records[0]
    const source = group.source
    const siteId = source?.site_id || source?.siteDetails?._id || getRecordString(representativeRecord, ["site_id", "siteId"]) || groupKey
    const siteName =
      source?.siteDetails?.name ||
      getRecordString(representativeRecord, ["site_name", "location_name", "name"]) ||
      siteId
    const aqi = getAqiCategory(periodAverage)

    return [{
      _id: source?._id || siteId,
      site_id: siteId,
      time: latestTimestamp > 0 ? new Date(latestTimestamp).toISOString() : options.endDate,
      aqi_category: aqi.category,
      aqi_color: aqi.color,
      pm2_5: { value: periodAverage },
      reportMeasurements,
      reportAggregation: options.frequency,
      averages: {
        percentageDifference,
        weeklyAverages: { currentWeek, previousWeek },
        monthlyPercentageDifference,
        monthlyAverages: { currentMonth, previousMonth },
      },
      siteDetails: {
        _id: source?.siteDetails?._id || siteId,
        name: siteName,
        formatted_name: source?.siteDetails?.formatted_name || siteName,
        location_name:
          source?.siteDetails?.location_name ||
          getRecordString(representativeRecord, ["location_name", "site_name"]) ||
          siteName,
        approximate_latitude:
          source?.siteDetails?.approximate_latitude ||
          getRecordNumber(representativeRecord, ["latitude", "site_latitude"]) ||
          0,
        approximate_longitude:
          source?.siteDetails?.approximate_longitude ||
          getRecordNumber(representativeRecord, ["longitude", "site_longitude"]) ||
          0,
        city: source?.siteDetails?.city || getRecordString(representativeRecord, ["city"]) || undefined,
        district: source?.siteDetails?.district || getRecordString(representativeRecord, ["district"]) || undefined,
        country: source?.siteDetails?.country || getRecordString(representativeRecord, ["country"]) || undefined,
        site_category: source?.siteDetails?.site_category,
      },
    }]
  })
}

/** Fetch and build the historical values used by report visuals. */
export const loadHistoricalReportData = async (
  sourceSites: SiteData[],
  options: ReportDataOptions,
): Promise<SiteData[]> => {
  const selectedStartTimestamp = Date.parse(options.startDate)
  const selectedEndDate = new Date(options.endDate)
  const selectedRangeDays = Math.ceil(
    (Date.parse(options.endDate) - selectedStartTimestamp) / (24 * 60 * 60 * 1000),
  )
  const previousMonthStart = new Date(
    Date.UTC(selectedEndDate.getUTCFullYear(), selectedEndDate.getUTCMonth() - 1, 1),
  ).toISOString()
  const requestStartDate =
    selectedRangeDays > 14 && Date.parse(previousMonthStart) < selectedStartTimestamp
      ? previousMonthStart
      : options.startDate

  const response = await getSiteReportData({
    datatype: options.dataType,
    downloadType: "json",
    startDateTime: requestStartDate,
    endDateTime: options.endDate,
    // The download API supplies daily values; weekly/monthly report averages
    // are calculated from those dated daily measurements in the client.
    frequency: "daily",
    minimum: true,
    outputFormat: "airqo-standard",
    pollutants: options.pollutants,
    sites: options.selectedSiteIds,
    metaDataFields: ["latitude", "longitude"],
    weatherFields: ["temperature", "humidity"],
    device_category: "lowcost",
  })

  const reportSites = buildSiteReportData(response, sourceSites, options)
  if (reportSites.length === 0) {
    throw new Error("No usable PM2.5 measurements were returned for this selection.")
  }

  return reportSites
}
