/**
 * AirQloud Service
 * Handles API calls for AirQloud analytics data
 */

import { config } from '@/lib/config'
import { isMockMode, getMockCohorts, getMockCohortPerformance } from '@/lib/mock-data'

export interface DevicePerformance {
  device_id: string
  device_name?: string
  performance: {
    freq: number[]
    error_margin: number[]
    timestamp: string[]
  }
}

export interface Device {
  _id?: string
  name: string
  long_name: string
  description: string | null
  device_number: number
  isActive: boolean
  isOnline: boolean
  rawOnlineStatus: boolean
  lastRawData: string
  lastActive: string
  status: string
  network: string
  createdAt: string
  uptime?: number | null
  data_completeness?: number | null
  sensor_error_margin?: number | null
  data?: any[]
}

export interface Cohort {
  _id?: string
  name: string
  network: string
  createdAt: string
  numberOfDevices: number
  devices: Device[]
  groups: any[]
  cohort_tags: string[]
  cohort_codes: string[]
  visibility: boolean
  uptime?: number | null
  data_completeness?: number | null
  sensor_error_margin?: number | null
  error_margin?: number | number[] | null  // Single number in summary mode, array in raw mode
  data?: any[]
  // Optional performance fields for compatibility
  freq?: number[]
  timestamp?: string[]
}

// Retaining old interface name for compatibility effectively, but mapping to Cohort structure
export interface AirQloudWithPerformance extends Cohort {
  id: string // Mapped from name
  device_count: number // Mapped from numberOfDevices
  is_active: boolean // Mapped from visibility
  country: string // defaulted to empty
}

export interface AirQloudBasic extends Cohort {
  id: string
  device_count: number
}

export interface AirQloudsQueryParams {
  skip?: number
  limit?: number
  tags?: string
  search?: string
  include_performance?: boolean // Deprecated but kept for signature compatibility
  performance_days?: number
  is_active?: boolean
  includePerformance?: boolean
  startDateTime?: string
  endDateTime?: string
  frequency?: string
  summary?: boolean
}

export interface AirQloudsMeta {
  total: number
  page: number
  totalPages: number
  limit: number
  skip: number
}

export interface AirQloudsResponse {
  cohorts: Cohort[]
  meta: AirQloudsMeta
}

// Adapted response to match old structure for the UI component
export interface MappedAirQloudsResponse {
  airqlouds: AirQloudWithPerformance[]
  meta: AirQloudsMeta
}

export interface CreateAirQloudPayload {
  name: string
  country?: string
  visibility?: boolean
  number_of_devices?: number
}

export interface UpdateAirQloudPayload {
  is_active?: boolean
  country?: string | null
}

export interface CreateAirQloudResponse {
  name: string
  country: string
  visibility: boolean
  number_of_devices: number
  id: string
  created_at: string
}

export interface DeviceError {
  device_id?: string
  read_key?: string
  channel_id?: string
  error: string
}

export interface CreateAirQloudWithDevicesResponse {
  airqloud: {
    id: string
    name: string
    country: string
    visibility: boolean
    number_of_devices: number
    created_at: string
  }
  devices_added: number
  devices_failed: number
  errors: DeviceError[]
  summary: {
    total_rows: number
    successful: number
    failed: number
  }
}

export interface ColumnMapping {
  device?: string
  read?: string
  channel?: string
}

export interface AirQloudPerformanceData {
  id: string
  name: string
  freq: number[]
  error_margin: number | number[]
  timestamp: string[]
  uptime?: number | null
  data_completeness?: number | null
  sensor_error_margin?: number | null
  data?: any[]
  numberOfDevices?: number
  devices?: Array<{
    _id?: string
    name: string
    long_name: string
    uptime?: number | null
    data_completeness?: number | null
    sensor_error_margin?: number | null
    data?: any[]
  }>
}

/**
 * Normalize a single data point from the new synced API shape
 * (`pm2.5 sensor1` / `pm2.5 sensor2`) into a structure that also exposes the
 * legacy field names (`s1_pm2_5` / `s2_pm2_5`) used by existing consumers.
 */
function normalizeSyncedDataPoint(d: any): any {
  if (!d || typeof d !== 'object') return d
  const s1 = d['pm2.5 sensor1']
  const s2 = d['pm2.5 sensor2']
  const s1Legacy = s1 == null ? null : Number(s1)
  const s2Legacy = s2 == null ? null : Number(s2)
  return {
    ...d,
    // Preserve legacy fields used by performance/analysis processors
    s1_pm2_5: d.s1_pm2_5 ?? s1Legacy,
    s2_pm2_5: d.s2_pm2_5 ?? s2Legacy,
  }
}

/**
 * Convert percentage values (0-100) coming from the new API back into the
 * 0-1 fraction expected by legacy consumers. Values already in 0-1 are
 * returned unchanged.
 */
function toLegacyFraction(value: any): number | null {
  if (value == null) return null
  const n = Number(value)
  if (Number.isNaN(n)) return null
  if (n > 1) return n / 100
  return n
}

/**
 * Derive a sensor error margin from sensor1/sensor2 averages.
 */
function deriveSensorErrorMargin(averages: any): number | null {
  if (!averages || typeof averages !== 'object') return null
  const a1 = averages['pm2.5 sensor1']
  const a2 = averages['pm2.5 sensor2']
  if (a1 == null || a2 == null) return null
  const n1 = Number(a1)
  const n2 = Number(a2)
  if (Number.isNaN(n1) || Number.isNaN(n2)) return null
  return Math.abs(n1 - n2)
}

/**
 * Normalize a device returned by the new `/cohorts/synced` endpoints into the
 * legacy device shape consumed by the analytics/performance UI.
 *
 * New API:
 *   { device_id, device_name, is_active, uptime (%, 0-100),
 *     data_completeness (%, 0-100), averages: {...}, data: [...] }
 *
 * Legacy shape expected by consumers:
 *   { _id, name, long_name, uptime (0-1), data_completeness (0-1),
 *     sensor_error_margin, data: [{ ..., s1_pm2_5, s2_pm2_5 }] }
 */
function normalizeSyncedDevice(device: any): any {
  if (!device) return device

  const id = device._id ?? device.device_id
  const name = device.name ?? device.device_name
  const longName = device.long_name ?? device.device_name ?? name

  // New API returns uptime/data_completeness as percentages (0-100). Legacy
  // consumers expect a 0-1 fraction and multiply by 100 themselves.
  const uptime = toLegacyFraction(device.uptime)
  const dataCompleteness = toLegacyFraction(device.data_completeness)

  // Derive a sensor error margin from the device averages when not provided.
  const sensorErrorMargin = device.sensor_error_margin ?? deriveSensorErrorMargin(device.averages)

  const data = Array.isArray(device.data) ? device.data.map(normalizeSyncedDataPoint) : []

  return {
    ...device,
    _id: id,
    name,
    long_name: longName,
    uptime,
    data_completeness: dataCompleteness,
    sensor_error_margin: sensorErrorMargin,
    data,
  }
}

/**
 * Normalize a cohort returned by `/cohorts/synced` into the legacy shape.
 */
function normalizeSyncedCohort(cohort: any): any {
  if (!cohort) return cohort

  const id = cohort._id ?? cohort.cohort_id
  const numberOfDevices = cohort.numberOfDevices ?? cohort.number_of_devices

  const uptime = toLegacyFraction(cohort.uptime)
  const dataCompleteness = toLegacyFraction(cohort.data_completeness)
  const sensorErrorMargin = cohort.sensor_error_margin ?? deriveSensorErrorMargin(cohort.averages)

  const devices = Array.isArray(cohort.devices) ? cohort.devices.map(normalizeSyncedDevice) : []
  const data = Array.isArray(cohort.data) ? cohort.data.map(normalizeSyncedDataPoint) : []

  return {
    ...cohort,
    _id: id,
    numberOfDevices,
    uptime,
    data_completeness: dataCompleteness,
    sensor_error_margin: sensorErrorMargin,
    devices,
    data,
  }
}

class AirQloudService {
  private readonly baseUrl: string
  private readonly apiPrefix: string

  constructor() {
    this.baseUrl = config.apiUrl
    this.apiPrefix = config.beaconApiPrefix || (config.isLocalhost ? '/api/v1' : '/api/v1/beacon')
  }

  /**
   * Get the appropriate endpoint based on environment
   */
  private getEndpoint(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${this.apiPrefix}${cleanPath}`
  }

  /**
   * Get auth headers - skip for localhost
   */
  /**
   * Get auth headers
   */
  private getAuthHeaders(): Record<string, string> {
    // Import authService dynamically to avoid circular dependencies
    const authService = require('./api-service').default
    const token = authService.getToken()

    if (token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    }

    return { 'Content-Type': 'application/json' }
  }

  /**
   * Get all Cohorts (formerly AirQlouds)
   */
  async getCohorts(params: AirQloudsQueryParams = {}): Promise<MappedAirQloudsResponse> {
    if (isMockMode()) {
      const data = getMockCohorts()
      const mappedCohorts: AirQloudWithPerformance[] = data.cohorts.map((cohort: any) => ({
        ...cohort,
        id: cohort._id || cohort.name,
        device_count: cohort.numberOfDevices,
        is_active: cohort.visibility,
        country: '',
        freq: cohort.freq || [],
        error_margin: cohort.error_margin || [],
        timestamp: cohort.timestamp || [],
      }))
      return { airqlouds: mappedCohorts, meta: data.meta as AirQloudsMeta }
    }

    const queryParams = new URLSearchParams()

    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.tags) queryParams.append('tags', params.tags)

    if (params.search) queryParams.append('search', params.search)

    if (params.includePerformance) queryParams.append('includePerformance', params.includePerformance.toString())
    if (params.startDateTime) queryParams.append('startDateTime', params.startDateTime)
    if (params.endDateTime) queryParams.append('endDateTime', params.endDateTime)
    if (params.frequency) queryParams.append('frequency', params.frequency)
    if (params.summary !== undefined) queryParams.append('summary', params.summary.toString())

    const endpoint = this.getEndpoint('/cohorts/')
    const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Map the new response structure to the old one for compatibility
      const mappedCohorts: AirQloudWithPerformance[] = data.cohorts.map((cohort: Cohort) => ({
        ...cohort,
        id: cohort._id || cohort.name,
        device_count: cohort.numberOfDevices,
        is_active: cohort.visibility,
        country: '',
        freq: cohort.freq || [],
        error_margin: cohort.error_margin || [],
        timestamp: cohort.timestamp || [],
      }))

      // Summary mode may not return meta, so provide a fallback
      const meta: AirQloudsMeta = data.meta || {
        total: mappedCohorts.length,
        page: 1,
        totalPages: 1,
        limit: mappedCohorts.length,
        skip: 0
      }

      return {
        airqlouds: mappedCohorts,
        meta
      }
    } catch (error) {
      console.error('Error fetching Cohorts:', error)
      throw error
    }
  }

  /**
   * Get all AirQlouds with performance data via the synced endpoint.
   * Used by the Performance Analysis table.
   *   GET /cohorts/synced?cohort_ids=...&includePerformance=true&startDateTime=...&endDateTime=...&frequency=hourly&tags=...&skip=&limit=
   */
  async getAirQlouds(
    params: AirQloudsQueryParams & { cohort_ids?: string[] | string } = {}
  ): Promise<MappedAirQloudsResponse> {
    if (isMockMode()) {
      return this.getCohorts(params)
    }

    const queryParams = new URLSearchParams()

    if (params.cohort_ids) {
      const ids = Array.isArray(params.cohort_ids) ? params.cohort_ids.join(',') : params.cohort_ids
      if (ids) queryParams.append('cohort_ids', ids)
    }

    if (params.includePerformance !== undefined) {
      queryParams.append('includePerformance', params.includePerformance.toString())
    }
    if (params.startDateTime) queryParams.append('startDateTime', params.startDateTime)
    if (params.endDateTime) queryParams.append('endDateTime', params.endDateTime)
    if (params.frequency) queryParams.append('frequency', params.frequency)
    if (params.tags) queryParams.append('tags', params.tags)
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)

    const endpoint = this.getEndpoint('/cohorts/synced')
    const qs = queryParams.toString()
    const url = qs ? `${this.baseUrl}${endpoint}?${qs}` : `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const rawCohorts: any[] = Array.isArray(data?.cohorts) ? data.cohorts : []

      const mappedCohorts: AirQloudWithPerformance[] = rawCohorts.map((raw) => {
        const cohort = normalizeSyncedCohort(raw)
        return {
          ...cohort,
          id: cohort._id || cohort.name,
          device_count: cohort.numberOfDevices,
          is_active: cohort.visibility,
          country: cohort.country || '',
          freq: cohort.freq || [],
          error_margin: cohort.error_margin ?? [],
          timestamp: cohort.timestamp || [],
        }
      })

      const metaTotal = Number.isFinite(data?.meta?.total) ? data.meta.total : mappedCohorts.length
      const metaLimitRaw = data?.meta?.limit
      const fallbackLimit = (params.limit ?? mappedCohorts.length) || 1
      const effectiveLimit = Number.isFinite(metaLimitRaw) && metaLimitRaw > 0 ? metaLimitRaw : fallbackLimit
      const computedTotalPages = Math.max(1, Math.ceil(metaTotal / effectiveLimit))

      const meta: AirQloudsMeta = {
        total: metaTotal,
        page: Number.isFinite(data?.meta?.page) ? data.meta.page : 1,
        totalPages: Number.isFinite(data?.meta?.totalPages) ? data.meta.totalPages : computedTotalPages,
        limit: Number.isFinite(metaLimitRaw) ? metaLimitRaw : (params.limit ?? mappedCohorts.length),
        skip: Number.isFinite(data?.meta?.skip) ? data.meta.skip : (params.skip ?? 0),
      }

      return { airqlouds: mappedCohorts, meta }
    } catch (error) {
      console.error('Error fetching synced Cohorts:', error)
      throw error
    }
  }

  /**
   * Get all AirQlouds without performance data (for filters/dropdowns).
   * Uses the synced endpoint without `includePerformance` for a lightweight list.
   */
  async getAirQloudsBasic(params: Omit<AirQloudsQueryParams, 'include_performance' | 'performance_days'> = {}): Promise<MappedAirQloudsResponse> {
    // Don't pass includePerformance for the basic/dropdown call - keeps URL minimal
    const { includePerformance: _ignored, ...rest } = params
    return this.getAirQlouds(rest)
  }

  /**
   * Get a specific AirQloud by ID with performance data
   * Uses the same path-based endpoint as multi-cohort analysis: /cohorts/{id}
   */
  async getAirQloudById(
    airqloudId: string,
    startDateTime?: string,
    endDateTime?: string
  ): Promise<AirQloudWithPerformance> {
    if (isMockMode()) {
      const data = getMockCohorts()
      const cohort = data.cohorts[0] as any
      return {
        ...cohort,
        id: cohort._id || cohort.name,
        device_count: cohort.numberOfDevices,
        is_active: cohort.visibility,
        country: '',
        error_margin: cohort.error_margin,
      }
    }

    const endpoint = this.getEndpoint(`/cohorts/synced/${airqloudId}`)

    const queryParams = new URLSearchParams()

    if (startDateTime && endDateTime) {
      queryParams.append('includePerformance', 'true')
      queryParams.append('startDateTime', startDateTime)
      queryParams.append('endDateTime', endDateTime)
      queryParams.append('frequency', 'hourly')
    }

    const qs = queryParams.toString()
    const url = qs ? `${this.baseUrl}${endpoint}?${qs}` : `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      // The new /cohorts/synced/{id} endpoint returns a single cohort under
      // `cohort`. Fall back to the legacy `cohorts[0]` shape for safety.
      const rawCohort = data.cohort ?? data.cohorts?.[0]

      if (!rawCohort) {
        throw new Error(`Cohort ${airqloudId} not found`)
      }

      const cohort = normalizeSyncedCohort(rawCohort)

      return {
        ...cohort,
        id: cohort._id || cohort.name,
        device_count: cohort.numberOfDevices,
        is_active: cohort.visibility,
        country: cohort.country || '',
        error_margin: cohort.error_margin,
      }
    } catch (error) {
      console.error(`Error fetching Cohort ${airqloudId}:`, error)
      throw error
    }
  }

  /**
   * Create a new AirQloud
   */
  async createAirQloud(payload: CreateAirQloudPayload): Promise<CreateAirQloudResponse> {
    const endpoint = this.getEndpoint('/cohorts/')
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating Cohort:', error)
      throw error
    }
  }

  /**
   * Create AirQloud with devices from CSV
   */
  async createAirQloudWithDevices(
    file: File,
    name: string,
    country?: string,
    visibility?: boolean,
    columnMappings?: ColumnMapping
  ): Promise<CreateAirQloudWithDevicesResponse> {
    const endpoint = this.getEndpoint('/cohorts/create-with-devices')
    const url = `${this.baseUrl}${endpoint}`

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name)

      if (country) {
        formData.append('country', country)
      }

      if (visibility !== undefined) {
        formData.append('visibility', visibility.toString())
      }

      if (columnMappings) {
        const transformedMappings: Record<string, string> = {}

        if (columnMappings.device) {
          transformedMappings[columnMappings.device] = 'device_id'
        }
        if (columnMappings.read) {
          transformedMappings[columnMappings.read] = 'read_key'
        }
        if (columnMappings.channel) {
          transformedMappings[columnMappings.channel] = 'channel_id'
        }

        formData.append('column_mappings', JSON.stringify(transformedMappings))
      }

      const authHeaders = this.getAuthHeaders()
      delete (authHeaders as any)['Content-Type']

      const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating Cohort with devices:', error)
      throw error
    }
  }

  /**
   * Get performance data for one or more cohorts.
   * Uses the new synced endpoint:
   *   /cohorts/synced?cohort_ids=id1,id2&includePerformance=true&...
   */
  async getAirQloudPerformance(params: {
    start: string
    end: string
    ids: string[]
    tags?: string[] | string
    skip?: number
    limit?: number
    frequency?: string
  }): Promise<AirQloudPerformanceData[]> {
    if (isMockMode()) return getMockCohortPerformance(params.ids) as any

    if (!params.ids || params.ids.length === 0) {
      return []
    }

    const queryParams = new URLSearchParams()
    queryParams.append('cohort_ids', params.ids.join(','))
    queryParams.append('includePerformance', 'true')
    queryParams.append('startDateTime', params.start)
    queryParams.append('endDateTime', params.end)
    queryParams.append('frequency', params.frequency || 'hourly')

    if (params.tags) {
      const tagsValue = Array.isArray(params.tags) ? params.tags.join(',') : params.tags
      if (tagsValue) queryParams.append('tags', tagsValue)
    }
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

    const endpoint = this.getEndpoint('/cohorts/synced')
    const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const rawCohorts: any[] = Array.isArray(data?.cohorts) ? data.cohorts : []

      return rawCohorts.map((raw) => {
        const cohort = normalizeSyncedCohort(raw)
        return {
          id: cohort._id || cohort.name,
          name: cohort.name,
          uptime: cohort.uptime,
          data_completeness: cohort.data_completeness,
          sensor_error_margin: cohort.sensor_error_margin,
          error_margin: cohort.error_margin,
          data: cohort.data,
          freq: cohort.freq || [],
          timestamp: cohort.timestamp || [],
          numberOfDevices: cohort.numberOfDevices,
          devices: cohort.devices || [],
        }
      })
    } catch (error) {
      console.error('Error fetching Cohorts Performance:', error)
      throw error
    }
  }

  /**
   * Sync AirQlouds from Platform API
   */
  async syncAirQlouds(params: {
    force?: boolean
    run_in_background?: boolean
  } = {}): Promise<{ success: boolean; message: string; force: boolean }> {
    if (isMockMode()) return { success: true, message: 'Sync completed (mock mode)', force: false }

    const queryParams = new URLSearchParams()

    if (params.force !== undefined) {
      queryParams.append('force', params.force.toString())
    }
    if (params.run_in_background !== undefined) {
      queryParams.append('run_in_background', params.run_in_background.toString())
    }

    const endpoint = this.getEndpoint('/cohorts/sync')
    const url = `${this.baseUrl}${endpoint}?${queryParams.toString()}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error syncing Cohorts:', error)
      throw error
    }
  }

  /**
   * Update an AirQloud (is_active status or country)
   */
  async updateAirQloud(
    airqloudId: string,
    payload: UpdateAirQloudPayload
  ): Promise<AirQloudWithPerformance> {
    const endpoint = this.getEndpoint(`/cohorts/${airqloudId}`)
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        ...data,
        id: data.name,
        device_count: data.numberOfDevices,
        is_active: data.visibility,
        country: '',
        freq: [],
        error_margin: [],
        timestamp: [],
      }
    } catch (error) {
      console.error(`Error updating Cohort ${airqloudId}:`, error)
      throw error
    }
  }
}

export const airQloudService = new AirQloudService()
