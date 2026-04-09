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

class AirQloudService {
  private readonly baseUrl: string
  private readonly apiPrefix: string

  constructor() {
    this.baseUrl = config.apiUrl
    this.apiPrefix = config.apiPrefix || ''
  }

  /**
   * Get the appropriate endpoint based on environment
   */
  private getEndpoint(path: string): string {
    return config.isLocalhost ? path : `${this.apiPrefix}/beacon${path}`
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
   * Get all AirQlouds with performance data - ALIAS for getCohorts
   */
  async getAirQlouds(params: AirQloudsQueryParams = {}): Promise<MappedAirQloudsResponse> {
    return this.getCohorts(params)
  }

  /**
   * Get all AirQlouds without performance data (for filters/dropdowns)
   */
  async getAirQloudsBasic(params: Omit<AirQloudsQueryParams, 'include_performance' | 'performance_days'> = {}): Promise<MappedAirQloudsResponse> {
    return this.getCohorts(params)
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

    const endpoint = this.getEndpoint(`/cohorts/${airqloudId}`)

    const queryParams = new URLSearchParams()

    if (startDateTime && endDateTime) {
      queryParams.append('includePerformance', 'true')
      queryParams.append('startDateTime', startDateTime)
      queryParams.append('endDateTime', endDateTime)
      queryParams.append('frequency', 'hourly')
    }

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
      const cohort = data.cohorts?.[0]

      if (!cohort) {
        throw new Error(`Cohort ${airqloudId} not found`)
      }

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
   * Get performance data for multiple AirQlouds
   * Uses path-based IDs: /cohorts/id1,id2?includePerformance=true&...
   */
  async getAirQloudPerformance(params: {
    start: string
    end: string
    ids: string[]
  }): Promise<AirQloudPerformanceData[]> {
    if (isMockMode()) return getMockCohortPerformance(params.ids) as any

    if (!params.ids || params.ids.length === 0) {
      return []
    }

    const queryParams = new URLSearchParams()
    queryParams.append('includePerformance', 'true')
    queryParams.append('startDateTime', params.start)
    queryParams.append('endDateTime', params.end)
    queryParams.append('frequency', 'hourly')

    const idsPath = params.ids.join(',')
    const endpoint = this.getEndpoint(`/cohorts/${idsPath}`)
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

      return data.cohorts.map((cohort: Cohort) => ({
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
      }))
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
