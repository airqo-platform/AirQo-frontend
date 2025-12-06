import { config } from '@/lib/config'
import authService from './api-service'
import {
  DeviceStatsResponse,
  Device,
  DevicePerformanceResponse,
  DeviceReadingsResponse,
  OfflineDevicesResponse,
  ApiError,
  DeviceQueryParams,
  PerformanceQueryParams,
  ReadingsQueryParams,
  OfflineQueryParams,
  StatsQueryParams,
  UIDeviceCounts,
  UIDevice,
  PaginatedDeviceResponse,
  PaginatedUIDeviceResponse
} from '@/types/api.types'

class ApiService {
  private readonly baseUrl: string
  private readonly defaultHeaders: HeadersInit
  private readonly maxRetries: number = 3
  private readonly retryDelay: number = 1000
  private readonly apiPrefix: string

  constructor() {
    this.baseUrl = config.apiUrl
    this.apiPrefix = config.apiPrefix || '/api/v1'
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private getAuthHeaders(): HeadersInit {
    // Skip auth for localhost
    if (config.isLocalhost) {
      return this.defaultHeaders
    }
    
    const token = authService.getToken()
    if (token) {
      return {
        ...this.defaultHeaders,
        'Authorization': token
      }
    }
    return this.defaultHeaders
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
          status_code: response.status
        }))
        
        if (response.status >= 500 && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay))
          return this.fetchWithRetry<T>(url, options, retries - 1)
        }
        
        throw new Error(error.detail || `Request failed with status ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (retries > 0) {
        const isNetworkError = error instanceof TypeError || 
          (error instanceof Error && error.message.includes('network'))
        
        if (isNetworkError) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay))
          return this.fetchWithRetry<T>(url, options, retries - 1)
        }
      }
      throw error
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const validParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    
    return validParams.length > 0 ? `?${validParams.join('&')}` : ''
  }

  // Transform API response to UI format for backward compatibility
  transformDeviceStatsToUI(stats: DeviceStatsResponse): UIDeviceCounts {
    return {
      total_devices: stats.summary.total,
      active_devices: stats.summary.online,
      offline_devices: stats.summary.offline,
      deployed_devices: stats.deployment.deployed,
      not_deployed: stats.deployment.not_deployed,
      recalled_devices: stats.deployment.recalled
    }
  }

  // Transform device list to UI format
  transformDeviceListToUI(devices: Device[]): UIDevice[] {
    return devices.map(device => ({
      // Flat properties for backward compatibility
      device_id: device.device_id,
      device_name: device.device_name,
      device_key: device.device_key,
      network: device.network,
      category: device.category,
      status: device.status,
      is_online: device.is_online,
      is_active: device.is_active,
      power_type: device.power_type,
      mount_type: device.mount_type,
      height: device.height,
      next_maintenance: device.next_maintenance,
      first_seen: device.first_seen,
      last_updated: device.last_updated,
      
      // New firmware and network fields
      channel_id: device.channel_id,
      network_id: device.network_id,
      current_firmware: device.current_firmware,
      target_firmware: device.target_firmware,
      firmware_download_state: device.firmware_download_state,
      
      // Location data from site_location or location
      latitude: device.location?.latitude || device.site_location?.latitude || device.latitude,
      longitude: device.location?.longitude || device.site_location?.longitude || device.longitude,
      location_name: device.location?.site_name || device.site_location?.site_name || device.site_id,
      city: device.site_location?.city || '',
      district: device.site_location?.district || '',
      country: device.site_location?.country || '',
      site_category: device.site_location?.site_category || '',
      
      // Latest reading data
      pm2_5: device.latest_reading?.pm2_5 || null,
      pm10: device.latest_reading?.pm10 || null,
      temperature: device.latest_reading?.temperature || null,
      humidity: device.latest_reading?.humidity || null,
      reading_timestamp: device.latest_reading?.timestamp,
      
      // Nested structure for new code
      device: {
        id: device.device_id,
        name: device.device_name,
        power_type: device.power_type,
        mount_type: device.mount_type,
        next_maintenance: device.next_maintenance,
        status: device.status
      },
      location: {
        name: device.location?.site_name || device.site_location?.site_name || device.site_id,
        latitude: device.location?.latitude || device.site_location?.latitude || device.latitude,
        longitude: device.location?.longitude || device.site_location?.longitude || device.longitude,
        city: device.site_location?.city || '',
        district: device.site_location?.district || '',
        country: device.site_location?.country || ''
      },
      maintenance_history: [], // This would need a separate API call
      readings_history: [] // This would need a separate API call
    }))
  }

  // Device Stats API
  async getDeviceStats(params?: StatsQueryParams): Promise<DeviceStatsResponse> {
    const queryString = this.buildQueryString({
      include_networks: params?.include_networks ?? true,
      include_categories: params?.include_categories ?? true,
      include_maintenance: params?.include_maintenance ?? true
    })
    
    const endpoint = config.isLocalhost ? '/devices/stats' : `${this.apiPrefix}/beacon/devices/stats`
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<DeviceStatsResponse>(url)
  }

  // Get Device Stats with UI transformation
  async getDeviceStatsForUI(params?: StatsQueryParams): Promise<UIDeviceCounts> {
    const stats = await this.getDeviceStats(params)
    return this.transformDeviceStatsToUI(stats)
  }

  // Device List API
  async getDevices(params?: DeviceQueryParams): Promise<Device[]> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = config.isLocalhost ? '/devices/' : `${this.apiPrefix}/beacon/devices/`
    const url = `${this.baseUrl}${endpoint}${queryString}`
    console.log('Device API URL:', url)
    console.log('Base URL:', this.baseUrl)
    return this.fetchWithRetry<Device[]>(url)
  }

  // Device List API with Pagination
  async getDevicesPaginated(params?: DeviceQueryParams): Promise<PaginatedDeviceResponse> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = config.isLocalhost ? '/devices/' : `${this.apiPrefix}/beacon/devices/`
    const url = `${this.baseUrl}${endpoint}${queryString}`
    console.log('Device API URL (Paginated):', url)
    console.log('Base URL:', this.baseUrl)
    
    const response = await this.fetchWithRetry<any>(url)
    
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      // Legacy response format (array of devices)
      return {
        devices: response,
        pagination: {
          total: response.length,
          skip: params?.skip || 0,
          limit: params?.limit || null,
          returned: response.length,
          pages: 1,
          current_page: 1,
          has_next: false,
          has_previous: false
        }
      }
    } else if (response.devices && response.pagination) {
      // New paginated response format with metadata
      return {
        devices: response.devices,
        pagination: response.pagination
      }
    } else if (response.devices) {
      // Paginated format without full metadata (old format)
      const total = response.total || response.devices.length
      const skip = params?.skip || 0
      const limit = params?.limit || response.devices.length
      
      return {
        devices: response.devices,
        pagination: {
          total,
          skip,
          limit,
          returned: response.devices.length,
          pages: limit ? Math.ceil(total / limit) : 1,
          current_page: limit ? Math.floor(skip / limit) + 1 : 1,
          has_next: skip + response.devices.length < total,
          has_previous: skip > 0
        }
      }
    } else {
      // Fallback for unexpected format
      throw new Error('Unexpected API response format')
    }
  }

  // Get Devices with UI transformation
  async getDevicesForUI(params?: DeviceQueryParams): Promise<{ devices: UIDevice[] }> {
    const devices = await this.getDevices(params)
    return { devices: this.transformDeviceListToUI(devices) }
  }

  // Get Devices with Pagination and UI transformation
  async getDevicesForUIPaginated(params?: DeviceQueryParams): Promise<PaginatedUIDeviceResponse> {
    const paginatedResponse = await this.getDevicesPaginated(params)
    return {
      devices: this.transformDeviceListToUI(paginatedResponse.devices),
      pagination: paginatedResponse.pagination
    }
  }

  // Single Device API
  async getDevice(deviceId: string): Promise<Device> {
    const endpoint = config.isLocalhost ? '/devices/' : `${this.apiPrefix}/beacon/devices/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}`
    return this.fetchWithRetry<Device>(url)
  }

  // Device Performance API
  async getDevicePerformance(
    deviceId: string,
    params?: PerformanceQueryParams
  ): Promise<DevicePerformanceResponse> {
    const queryString = this.buildQueryString({ days: params?.days || 7 })
    const endpoint = config.isLocalhost ? '/devices/' : `${this.apiPrefix}/beacon/devices/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}/performance${queryString}`
    return this.fetchWithRetry<DevicePerformanceResponse>(url)
  }

  // Device Readings API
  async getDeviceReadings(
    deviceId: string,
    params?: ReadingsQueryParams
  ): Promise<DeviceReadingsResponse> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = config.isLocalhost ? '/devices/' : `${this.apiPrefix}/beacon/devices/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}/readings${queryString}`
    return this.fetchWithRetry<DeviceReadingsResponse>(url)
  }

  // Offline Devices API
  async getOfflineDevices(params?: OfflineQueryParams & { limit?: number }): Promise<OfflineDevicesResponse> {
    const queryString = this.buildQueryString({ 
      hours: params?.hours || 24,
      limit: params?.limit 
    })
    const endpoint = config.isLocalhost ? '/devices/offline/list' : `${this.apiPrefix}/beacon/devices/offline/list`
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<OfflineDevicesResponse>(url)
  }

  // Create Device
  async createDevice(deviceData: Partial<Device>): Promise<Device> {
    const endpoint = config.isLocalhost ? '/devices' : `${this.apiPrefix}/beacon/devices`
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<Device>(url, {
      method: 'POST',
      body: JSON.stringify(deviceData)
    })
  }

  // Update Device
  async updateDevice(deviceId: string, deviceData: Partial<Device>): Promise<Device> {
    const endpoint = config.isLocalhost ? '/devices/' : `${this.apiPrefix}/beacon/devices/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}`
    return this.fetchWithRetry<Device>(url, {
      method: 'PATCH',
      body: JSON.stringify(deviceData)
    })
  }

  // Delete Device
  async deleteDevice(deviceId: string): Promise<{ message: string }> {
    const endpoint = config.isLocalhost ? '/devices/' : `${this.apiPrefix}/beacon/devices/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}`
    return this.fetchWithRetry<{ message: string }>(url, {
      method: 'DELETE'
    })
  }

  // Dashboard Summary API (analytics prefix)
  async getDashboardSummary(): Promise<any> {
    const endpoint = config.isLocalhost ? '/analytics/dashboard' : `${this.apiPrefix}/beacon/analytics/dashboard`
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<any>(url)
  }

  // System Health API (analytics prefix)
  async getSystemHealth(): Promise<any> {
    const endpoint = config.isLocalhost ? '/analytics/system-health' : `${this.apiPrefix}/beacon/analytics/system-health`
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<any>(url)
  }

  // Data Transmission Summary API (analytics prefix)
  async getDataTransmissionSummary(params?: { days?: number }): Promise<any> {
    const queryString = this.buildQueryString({ days: params?.days || 7 })
    const endpoint = config.isLocalhost ? '/analytics/data-transmission/summary' : `${this.apiPrefix}/beacon/analytics/data-transmission/summary`
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  // Network Performance API (analytics prefix)
  async getNetworkPerformance(params?: { days?: number }): Promise<any> {
    const queryString = this.buildQueryString({ days: params?.days || 7 })
    const endpoint = config.isLocalhost ? '/analytics/network-performance' : `${this.apiPrefix}/beacon/analytics/network-performance`
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  // Upcoming Maintenance API
  async getUpcomingMaintenance(params?: { days?: number; limit?: number }): Promise<any> {
    const queryString = this.buildQueryString({ 
      days: params?.days || 30,
      limit: params?.limit
    })
    const endpoint = config.isLocalhost ? '/devices/maintenance/upcoming' : `${this.apiPrefix}/beacon/devices/maintenance/upcoming`
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  // Map Data API
  async getMapData(): Promise<any> {
    const endpoint = config.isLocalhost ? '/devices/map-data' : `${this.apiPrefix}/beacon/devices/map-data`
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<any>(url)
  }

  // Site Analytics APIs
  async getSites(params?: { limit?: number; skip?: number }): Promise<any> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = config.isLocalhost ? '/sites/' : `${this.apiPrefix}/beacon/sites/`
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  async getSiteById(siteId: string): Promise<any> {
    const endpoint = config.isLocalhost ? '/sites/' : `${this.apiPrefix}/beacon/sites/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(siteId)}`
    return this.fetchWithRetry<any>(url)
  }

  async getSiteAnalytics(siteId: string, params?: { 
    start_date?: string; 
    end_date?: string; 
    frequency?: string 
  }): Promise<any> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = config.isLocalhost ? '/sites/' : `${this.apiPrefix}/beacon/sites/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(siteId)}/analytics${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  async getCountryAnalytics(countryId: string, params?: { 
    start_date?: string; 
    end_date?: string 
  }): Promise<any> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = config.isLocalhost ? '/locations/countries/' : `${this.apiPrefix}/beacon/analytics/locations/countries/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(countryId)}/analytics${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  async getRegionalAnalytics(regionId: string, params?: { 
    start_date?: string; 
    end_date?: string 
  }): Promise<any> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = config.isLocalhost ? '/locations/regions/' : `${this.apiPrefix}/beacon/analytics/locations/regions/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(regionId)}/analytics${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  async getDistrictAnalytics(districtId: string, params?: { 
    start_date?: string; 
    end_date?: string 
  }): Promise<any> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = config.isLocalhost ? '/locations/districts/' : `${this.apiPrefix}/beacon/analytics/locations/districts/`
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(districtId)}/analytics${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  // Get device metadata with pagination and filtering
  async getDeviceMetadata(params?: {
    skip?: number
    limit?: number
    device_id?: string
    channel_id?: string
    start_date?: string
    end_date?: string
  }): Promise<any> {
    const endpoint = config.isLocalhost 
      ? '/data/metadata'
      : `${this.apiPrefix}/beacon/data/metadata`
    const queryString = this.buildQueryString(params || {})
    const url = `${this.baseUrl}${endpoint}${queryString}`
    
    return this.fetchWithRetry(url)
  }

  // Get device configuration history
  async getDeviceConfig(params?: {
    channel_id: number
    skip?: number
    limit?: number
    start_date?: string
    end_date?: string
  }): Promise<any> {
    const endpoint = config.isLocalhost 
      ? '/data/config'
      : `${this.apiPrefix}/beacon/data/config`
    const queryString = this.buildQueryString(params || {})
    const url = `${this.baseUrl}${endpoint}${queryString}`
    
    return this.fetchWithRetry(url)
  }

  // Get device performance data
  async getDevicePerformanceData(data: {
    start: string
    end: string
    ids: string[]
  }): Promise<any> {
    const endpoint = config.isLocalhost 
      ? '/performance/device'
      : `${this.apiPrefix}/beacon/performance/device`
    const url = `${this.baseUrl}${endpoint}`
    
    return this.fetchWithRetry(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Update device configurations
  async updateDeviceConfigs(data: {
    device_ids: string[]
    config1?: string
    config2?: string
    config3?: string
    config4?: string
    config5?: string
    config6?: string
    config7?: string
    config8?: string
    config9?: string
    config10?: string
  }): Promise<any> {
    const endpoint = config.isLocalhost
      ? '/data/config'
      : `${this.apiPrefix}/beacon/data/config`
    const url = `${this.baseUrl}${endpoint}`
    
    return this.fetchWithRetry(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Batch operations with error handling
  async getDeviceWithDetails(deviceId: string): Promise<{
    device: Device
    performance?: DevicePerformanceResponse
    readings?: DeviceReadingsResponse
  }> {
    try {
      const [device, performance, readings] = await Promise.allSettled([
        this.getDevice(deviceId),
        this.getDevicePerformance(deviceId, { days: 7 }),
        this.getDeviceReadings(deviceId, { limit: 100 })
      ])

      const result: any = {}
      
      if (device.status === 'fulfilled') {
        result.device = device.value
      } else {
        throw new Error('Failed to fetch device details')
      }

      if (performance.status === 'fulfilled') {
        result.performance = performance.value
      }

      if (readings.status === 'fulfilled') {
        result.readings = readings.value
      }

      return result
    } catch (error) {
      console.error('Error fetching device details:', error)
      throw error
    }
  }
}

// Export singleton instance
export const deviceApiService = new ApiService()

// Export convenience functions
export const getDeviceStats = (params?: StatsQueryParams) => deviceApiService.getDeviceStats(params)
export const getDeviceStatsForUI = (params?: StatsQueryParams) => deviceApiService.getDeviceStatsForUI(params)
export const getDevices = (params?: DeviceQueryParams) => deviceApiService.getDevices(params)
export const getDevicesForUI = (params?: DeviceQueryParams) => deviceApiService.getDevicesForUI(params)
export const getDevicesPaginated = (params?: DeviceQueryParams) => deviceApiService.getDevicesPaginated(params)
export const getDevicesForUIPaginated = (params?: DeviceQueryParams) => deviceApiService.getDevicesForUIPaginated(params)
export const getDevice = (deviceId: string) => deviceApiService.getDevice(deviceId)
export const getDevicePerformance = (deviceId: string, params?: PerformanceQueryParams) => deviceApiService.getDevicePerformance(deviceId, params)
export const getDeviceReadings = (deviceId: string, params?: ReadingsQueryParams) => deviceApiService.getDeviceReadings(deviceId, params)
export const getOfflineDevices = (params?: OfflineQueryParams & { limit?: number }) => deviceApiService.getOfflineDevices(params)
export const createDevice = (deviceData: Partial<Device>) => deviceApiService.createDevice(deviceData)
export const updateDevice = (deviceId: string, deviceData: Partial<Device>) => deviceApiService.updateDevice(deviceId, deviceData)
export const deleteDevice = (deviceId: string) => deviceApiService.deleteDevice(deviceId)
export const getDeviceWithDetails = (deviceId: string) => deviceApiService.getDeviceWithDetails(deviceId)
export const getDashboardSummary = () => deviceApiService.getDashboardSummary()
export const getSystemHealth = () => deviceApiService.getSystemHealth()
export const getDataTransmissionSummary = (params?: { days?: number }) => deviceApiService.getDataTransmissionSummary(params)
export const getNetworkPerformance = (params?: { days?: number }) => deviceApiService.getNetworkPerformance(params)
export const getUpcomingMaintenance = (params?: { days?: number; limit?: number }) => deviceApiService.getUpcomingMaintenance(params)
export const getMapData = () => deviceApiService.getMapData()
export const getSites = (params?: { limit?: number; skip?: number }) => deviceApiService.getSites(params)
export const getSiteById = (siteId: string) => deviceApiService.getSiteById(siteId)
export const getSiteAnalytics = (siteId: string, params?: { start_date?: string; end_date?: string; frequency?: string }) => deviceApiService.getSiteAnalytics(siteId, params)
export const getCountryAnalytics = (countryId: string, params?: { start_date?: string; end_date?: string }) => deviceApiService.getCountryAnalytics(countryId, params)
export const getRegionalAnalytics = (regionId: string, params?: { start_date?: string; end_date?: string }) => deviceApiService.getRegionalAnalytics(regionId, params)
export const getDistrictAnalytics = (districtId: string, params?: { start_date?: string; end_date?: string }) => deviceApiService.getDistrictAnalytics(districtId, params)
export const getDeviceMetadata = (params?: { skip?: number; limit?: number; device_id?: string; channel_id?: string; start_date?: string; end_date?: string }) => deviceApiService.getDeviceMetadata(params)
export const getDeviceConfig = (params?: { channel_id: number; skip?: number; limit?: number; start_date?: string; end_date?: string }) => deviceApiService.getDeviceConfig(params)
export const updateDeviceConfigs = (data: { device_ids: string[]; config1?: string; config2?: string; config3?: string; config4?: string; config5?: string; config6?: string; config7?: string; config8?: string; config9?: string; config10?: string }) => deviceApiService.updateDeviceConfigs(data)
export const getDevicePerformanceData = (data: { start: string; end: string; ids: string[] }) => deviceApiService.getDevicePerformanceData(data)