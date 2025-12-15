/**
 * AirQloud Service
 * Handles API calls for AirQloud analytics data
 */

import { config } from '@/lib/config'

export interface DevicePerformance {
  device_id: string
  device_name?: string
  performance: {
    freq: number[]
    error_margin: number[]
    timestamp: string[]
  }
}

export interface AirQloudWithPerformance {
  id: string
  name: string
  country: string
  visibility: boolean | null
  is_active: boolean
  created_at: string
  number_of_devices?: number
  device_count: number
  freq: number[]
  error_margin: number[]
  timestamp: string[]
  device_performance?: DevicePerformance[]
}

export interface AirQloudBasic {
  id: string
  name: string
  country: string
  visibility: boolean | null
  is_active: boolean
  created_at: string
  number_of_devices?: number
  device_count: number
}

export interface AirQloudsQueryParams {
  skip?: number
  limit?: number
  country?: string
  search?: string
  include_performance?: boolean
  performance_days?: number
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
  error_margin: number[]
  timestamp: string[]
}

class AirQloudService {
  private readonly baseUrl: string
  private readonly apiPrefix: string

  constructor() {
    this.baseUrl = config.apiUrl
    this.apiPrefix = config.apiPrefix || '/api/v1'
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
  private getAuthHeaders(): Record<string, string> {
    if (config.isLocalhost) {
      return { 'Content-Type': 'application/json' }
    }
    
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
   * Get all AirQlouds with performance data
   */
  async getAirQlouds(params: AirQloudsQueryParams = {}): Promise<AirQloudWithPerformance[]> {
    const queryParams = new URLSearchParams()
    
    // Always include performance data
    queryParams.append('include_performance', 'true')
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.country) queryParams.append('country', params.country)
    if (params.search) queryParams.append('search', params.search)
    if (params.performance_days) queryParams.append('performance_days', params.performance_days.toString())

    const endpoint = this.getEndpoint('/airqlouds')
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
      return data
    } catch (error) {
      console.error('Error fetching AirQlouds:', error)
      throw error
    }
  }

  /**
   * Get all AirQlouds without performance data (for filters/dropdowns)
   */
  async getAirQloudsBasic(params: Omit<AirQloudsQueryParams, 'include_performance' | 'performance_days'> = {}): Promise<AirQloudBasic[]> {
    const queryParams = new URLSearchParams()
    
    // Do NOT include performance data
    queryParams.append('include_performance', 'false')
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.country) queryParams.append('country', params.country)
    if (params.search) queryParams.append('search', params.search)

    const endpoint = this.getEndpoint('/airqlouds')
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
      return data
    } catch (error) {
      console.error('Error fetching AirQlouds (basic):', error)
      throw error
    }
  }

  /**
   * Get a specific AirQloud by ID with performance data
   */
  async getAirQloudById(
    airqloudId: string, 
    performanceDays: number = 14
  ): Promise<AirQloudWithPerformance> {
    const endpoint = this.getEndpoint(`/airqlouds/${airqloudId}`)
    const url = `${this.baseUrl}${endpoint}?include_performance=true&performance_days=${performanceDays}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching AirQloud ${airqloudId}:`, error)
      throw error
    }
  }

  /**
   * Create a new AirQloud
   */
  async createAirQloud(payload: CreateAirQloudPayload): Promise<CreateAirQloudResponse> {
    const endpoint = this.getEndpoint('/airqlouds/')
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
      console.error('Error creating AirQloud:', error)
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
    const endpoint = this.getEndpoint('/airqlouds/create-with-devices')
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

      // For FormData, don't set Content-Type header - browser will set it with boundary
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
      console.error('Error creating AirQloud with devices:', error)
      throw error
    }
  }

  /**
   * Get performance data for multiple AirQlouds
   */
  async getAirQloudPerformance(params: {
    start: string
    end: string
    ids: string[]
  }): Promise<AirQloudPerformanceData[]> {
    const endpoint = this.getEndpoint('/performance/airqloud')
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching AirQloud performance:', error)
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
    const queryParams = new URLSearchParams()
    
    if (params.force !== undefined) {
      queryParams.append('force', params.force.toString())
    }
    if (params.run_in_background !== undefined) {
      queryParams.append('run_in_background', params.run_in_background.toString())
    }

    const endpoint = this.getEndpoint('/airqlouds/sync')
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
      console.error('Error syncing AirQlouds:', error)
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
    const endpoint = this.getEndpoint(`/airqlouds/${airqloudId}`)
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
      return data
    } catch (error) {
      console.error(`Error updating AirQloud ${airqloudId}:`, error)
      throw error
    }
  }
}

export const airQloudService = new AirQloudService()
