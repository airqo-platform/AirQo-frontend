import { config } from '@/lib/config'
import authService from './api-service'
import { isMockMode, getMockDevices, getMockDeviceStats, getMockDeviceSummary, getMockDashboardSummary, getMockSystemHealth, getMockDataTransmission, getMockNetworkPerformance, getMockOfflineDevices, getMockUpcomingMaintenance, getMockMapData, getMockMaintenanceMapData, getMockDevicePerformanceData, getMockDeviceMetadata, getMockDeviceConfig } from '@/lib/mock-data'
import {
  DeviceStatsResponse,
  Device,
  DevicePerformanceResponse,
  DeviceReadingsResponse,
  OfflineDevicesResponse,
  DeviceSummaryResponse,
  ApiError,
  DeviceQueryParams,
  PerformanceQueryParams,
  ReadingsQueryParams,
  OfflineQueryParams,
  StatsQueryParams,
  UIDeviceCounts,
  UIDevice,
  PaginatedDeviceResponse,
  PaginatedUIDeviceResponse,
  MaintenanceStatsBody,
  AirQloudStatsResponse,
  DeviceMaintenanceStatsResponse,
  MaintenanceAnalyticsResponse,
  MaintenanceMapResponse,
  MaintenanceMapItem
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

  /**
   * Get the appropriate endpoint based on environment
   * @param resource - The resource path (e.g., '/devices/')
   */
  private getEndpoint(resource: string): string {
    const cleanPath = resource.startsWith('/') ? resource : `/${resource}`;

    // For local development, use path as is (base URL handles the rest)
    if (config.isLocalhost) {
      return cleanPath;
    }

    // For production/staging, prefix with configured API prefix + service name
    return `${this.apiPrefix}/beacon${cleanPath}`;
  }

  private getAuthHeaders(): HeadersInit {


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
      const headers = {
        ...this.getAuthHeaders(),
        ...options.headers,
      }

      const response = await fetch(url, {
        ...options,
        headers,
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
      device_id: device._id || device.device_id || '', // Fallback to old field if present
      device_name: device.name || device.long_name || device.device_name || 'Unnamed Device',
      device_key: '',
      network: device.network || '',
      category: device.category || '',
      status: device.status || 'not deployed',
      is_online: device.isOnline,
      is_active: device.isActive,
      power_type: device.powerType || '',
      mount_type: device.mountType || '',
      height: device.height || 0,
      next_maintenance: device.nextMaintenance || '',
      first_seen: device.createdAt || '',
      last_updated: device.lastRawData || device.lastActive || '',

      // New firmware and network fields - NOT present in new Device interface as top level, maybe in beacon_data?
      // usage in new Device format seems limited, preserving structure for UI
      channel_id: device.device_number || 0, // Using device_number as channel_id proxy?
      network_id: '', // Not clear in new format, logic needed?
      current_firmware: '', // Not in data.json top level
      target_firmware: '',
      firmware_download_state: '',

      // Location data
      latitude: device.latitude || device.site?.approximate_latitude || 0,
      longitude: device.longitude || device.site?.approximate_longitude || 0,
      location_name: device.site?.location_name || device.site?.name || '',
      city: device.site?.city || '',
      district: '', // Not in data.json site
      country: device.site?.country || '',
      site_category: '', // Not in data.json site

      // Latest reading data - raw data structure in data.json is different/absent top level
      pm2_5: null,
      pm10: null,
      temperature: null,
      humidity: null,
      reading_timestamp: device.lastRawData,

      // Nested structure for new code
      device: {
        id: device._id || device.device_id || '',
        name: device.name || device.long_name || 'Unnamed',
        power_type: device.powerType,
        mount_type: device.mountType,
        next_maintenance: device.nextMaintenance,
        status: device.status
      },
      location: {
        name: device.site?.location_name || device.site?.name,
        latitude: device.latitude || device.site?.approximate_latitude,
        longitude: device.longitude || device.site?.approximate_longitude,
        city: device.site?.city,
        district: '',
        country: device.site?.country
      },
      maintenance_history: [],
      readings_history: []
    }))
  }

  // Device Stats API
  async getDeviceStats(params?: StatsQueryParams): Promise<DeviceStatsResponse> {
    if (isMockMode()) return getMockDeviceStats() as any

    const queryString = this.buildQueryString({
      include_networks: params?.include_networks ?? true,
      include_categories: params?.include_categories ?? true,
      include_maintenance: params?.include_maintenance ?? true
    })

    const endpoint = this.getEndpoint('/devices/stats')
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
    if (isMockMode()) return getMockDevices() as any

    const queryString = this.buildQueryString(params || {})
    const endpoint = this.getEndpoint('/devices/')
    const url = `${this.baseUrl}${endpoint}${queryString}`
    console.log('Device API URL:', url)
    console.log('Base URL:', this.baseUrl)
    return this.fetchWithRetry<Device[]>(url)
  }

  // Device List API with Pagination
  async getDevicesPaginated(params?: DeviceQueryParams): Promise<PaginatedDeviceResponse> {
    if (isMockMode()) {
      const devices = getMockDevices() as any
      return {
        devices,
        pagination: { total: devices.length, skip: 0, limit: 100, returned: devices.length, pages: 1, current_page: 1, has_next: false, has_previous: false }
      }
    }

    const queryString = this.buildQueryString(params || {})
    const endpoint = this.getEndpoint('/devices/')
    const url = `${this.baseUrl}${endpoint}${queryString}`
    console.log('Device API URL (Paginated):', url)
    console.log('Base URL:', this.baseUrl)

    const response = await this.fetchWithRetry<any>(url)

    // Handle new response format with "meta"
    if (response.meta && response.devices) {
      return {
        devices: response.devices,
        meta: response.meta,
        pagination: {
          total: response.meta.total,
          skip: response.meta.skip,
          limit: response.meta.limit,
          returned: response.devices.length,
          pages: response.meta.totalPages,
          current_page: response.meta.page,
          has_next: (response.meta.page * response.meta.limit) < response.meta.total, // Approximate check
          has_previous: response.meta.page > 1
        }
      }
    }

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

    // Ensure pagination exists
    const pagination = paginatedResponse.pagination || {
      total: 0,
      skip: params?.skip || 0,
      limit: params?.limit || 0,
      returned: 0,
      pages: 0,
      current_page: 1,
      has_next: false,
      has_previous: false
    }

    return {
      devices: this.transformDeviceListToUI(paginatedResponse.devices),
      pagination
    }
  }

  // Single Device API
  async getDevice(deviceId: string): Promise<Device> {
    if (isMockMode()) {
      const devices = getMockDevices() as any
      return devices.find((d: any) => d._id === deviceId) || devices[0]
    }

    const endpoint = this.getEndpoint('/devices/')
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}`
    return this.fetchWithRetry<Device>(url)
  }

  // Device Performance API
  async getDevicePerformance(
    deviceId: string,
    params?: PerformanceQueryParams
  ): Promise<DevicePerformanceResponse> {
    const queryString = this.buildQueryString({ days: params?.days || 7 })
    const endpoint = this.getEndpoint('/devices/')
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}/performance${queryString}`
    return this.fetchWithRetry<DevicePerformanceResponse>(url)
  }

  // Device Readings API
  async getDeviceReadings(
    deviceId: string,
    params?: ReadingsQueryParams
  ): Promise<DeviceReadingsResponse> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = this.getEndpoint('/devices/')
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}/readings${queryString}`
    return this.fetchWithRetry<DeviceReadingsResponse>(url)
  }

  // Offline Devices API
  async getOfflineDevices(params?: OfflineQueryParams & { limit?: number }): Promise<OfflineDevicesResponse> {
    if (isMockMode()) return getMockOfflineDevices() as any

    const queryString = this.buildQueryString({
      hours: params?.hours || 24,
      limit: params?.limit
    })
    const endpoint = this.getEndpoint('/devices/offline/list')
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<OfflineDevicesResponse>(url)
  }

  // Create Device
  async createDevice(deviceData: Partial<Device>): Promise<Device> {
    const endpoint = this.getEndpoint('/devices')
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<Device>(url, {
      method: 'POST',
      body: JSON.stringify(deviceData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Update Device
  async updateDevice(deviceId: string, deviceData: Partial<Device>): Promise<Device> {
    const endpoint = this.getEndpoint('/devices/')
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}`
    return this.fetchWithRetry<Device>(url, {
      method: 'PATCH',
      body: JSON.stringify(deviceData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Delete Device
  async deleteDevice(deviceId: string): Promise<{ message: string }> {
    const endpoint = this.getEndpoint('/devices/')
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(deviceId)}`
    return this.fetchWithRetry<{ message: string }>(url, {
      method: 'DELETE'
    })
  }

  // Dashboard Summary API (analytics prefix)
  async getDashboardSummary(): Promise<any> {
    if (isMockMode()) return getMockDashboardSummary()

    const endpoint = this.getEndpoint('/analytics/dashboard')
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<any>(url)
  }

  // Device Summary API (new endpoint)
  // Device Summary API (new endpoint)
  async getDeviceSummary(): Promise<DeviceSummaryResponse> {
    if (isMockMode()) return Promise.resolve(getMockDeviceSummary())
    
    // Return dummy data as the endpoint is no longer available
    return Promise.resolve({
      total_devices: 0,
      active_airqlouds: 0,
      tracked_devices: 0,
      deployed_devices: 0,
      tracked_online: 0,
      tracked_offline: 0
    })
  }

  // System Health API (analytics prefix)
  async getSystemHealth(): Promise<any> {
    if (isMockMode()) return getMockSystemHealth()

    const endpoint = this.getEndpoint('/analytics/system-health')
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<any>(url)
  }

  // Data Transmission Summary API (analytics prefix)
  async getDataTransmissionSummary(params?: { days?: number }): Promise<any> {
    if (isMockMode()) return getMockDataTransmission()

    const queryString = this.buildQueryString({ days: params?.days || 7 })
    const endpoint = this.getEndpoint('/analytics/data-transmission/summary')
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  // Network Performance API (analytics prefix)
  async getNetworkPerformance(params?: { days?: number }): Promise<any> {
    if (isMockMode()) return getMockNetworkPerformance()

    const queryString = this.buildQueryString({ days: params?.days || 7 })
    const endpoint = this.getEndpoint('/analytics/network-performance')
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  // Upcoming Maintenance API
  async getUpcomingMaintenance(params?: { days?: number; limit?: number }): Promise<any> {
    if (isMockMode()) return getMockUpcomingMaintenance()

    const queryString = this.buildQueryString({
      days: params?.days || 30,
      limit: params?.limit
    })
    const endpoint = this.getEndpoint('/devices/maintenance/upcoming')
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  // Map Data API
  async getMapData(): Promise<any> {
    if (isMockMode()) return getMockMapData()

    const endpoint = this.getEndpoint('/devices/map-data')
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<any>(url)
  }

  // Site Analytics APIs
  async getSites(params?: { limit?: number; skip?: number }): Promise<any> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = this.getEndpoint('/sites/')
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<any>(url)
  }

  async getSiteById(siteId: string): Promise<any> {
    const endpoint = this.getEndpoint('/sites/')
    const url = `${this.baseUrl}${endpoint}${encodeURIComponent(siteId)}`
    return this.fetchWithRetry<any>(url)
  }

  async getSiteAnalytics(siteId: string, params?: {
    start_date?: string;
    end_date?: string;
    frequency?: string
  }): Promise<any> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = this.getEndpoint('/sites/')
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
    category_name?: string
  }): Promise<any> {
    if (isMockMode()) return getMockDeviceMetadata()

    const { device_id, category_name = 'lowcost', ...queryParams } = params || {}

    if (!device_id) {
      throw new Error('Device ID is required for fetching metadata')
    }

    const endpoint = config.isLocalhost
      ? `/devices/${device_id}/metadata/${category_name}`
      : this.getEndpoint(`/devices/${device_id}/metadata/${category_name}`)

    const queryString = this.buildQueryString(queryParams)
    const url = `${this.baseUrl}${endpoint}${queryString}`

    return this.fetchWithRetry(url)
  }

  // Get device configuration history
  async getDeviceConfig(params?: {
    device_id: string
    category_name?: string
    skip?: number
    limit?: number
  }): Promise<any> {
    if (isMockMode()) return getMockDeviceConfig()

    const { device_id, category_name = 'lowcost', ...queryParams } = params || {}

    if (!device_id) {
      throw new Error('Device ID is required for fetching config history')
    }

    const endpoint = config.isLocalhost
      ? `/devices/${device_id}/configdata/${category_name}`
      : this.getEndpoint(`/devices/${device_id}/configdata/${category_name}`)

    const queryString = this.buildQueryString(queryParams)
    const url = `${this.baseUrl}${endpoint}${queryString}`

    return this.fetchWithRetry(url)
  }

  // Get device performance data (GET /devices/performance)
  async getDevicePerformanceData(data: {
    start: string
    end: string
    deviceNames: string[]
  }): Promise<any> {
    if (isMockMode()) return getMockDevicePerformanceData(data.deviceNames)

    const endpoint = this.getEndpoint('/devices/performance')
    // Use comma-separated device names
    const deviceNamesParam = data.deviceNames.join(',')
    const url = `${this.baseUrl}${endpoint}?device_name=${encodeURIComponent(deviceNamesParam)}&startDateTime=${encodeURIComponent(data.start)}&endDateTime=${encodeURIComponent(data.end)}`

    const response = await this.fetchWithRetry<any>(url)
    return response.data ?? response
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
      : this.getEndpoint('/data/config')
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
  // Maintenance Stats APIs
  async getAirQloudStats(body: MaintenanceStatsBody): Promise<AirQloudStatsResponse> {
    const endpoint = config.isLocalhost
      ? '/maintenance/airqlouds/stats'
      : this.getEndpoint('/maintenance/airqlouds/stats')
    const url = `${this.baseUrl}${endpoint}`

    return this.fetchWithRetry<AirQloudStatsResponse>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async getDeviceStatsMaintenance(body: MaintenanceStatsBody): Promise<DeviceMaintenanceStatsResponse> {
    const endpoint = config.isLocalhost
      ? '/maintenance/devices/stats'
      : this.getEndpoint('/maintenance/devices/stats')
    const url = `${this.baseUrl}${endpoint}`

    return this.fetchWithRetry<DeviceMaintenanceStatsResponse>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async getMaintenanceAnalytics(period_days: number = 14): Promise<MaintenanceAnalyticsResponse> {
    const endpoint = config.isLocalhost
      ? `/maintenance/analytics?days=${period_days}`
      : this.getEndpoint(`/maintenance/analytics?days=${period_days}`)
    const url = `${this.baseUrl}${endpoint}`

    return this.fetchWithRetry<MaintenanceAnalyticsResponse>(url)
  }

  async getMaintenanceMapData(period_days: number = 14, tags?: string): Promise<MaintenanceMapItem[]> {
    if (isMockMode()) return getMockMaintenanceMapData() as any

    let query = `days=${period_days}`
    if (tags) query += `&tags=${tags}`
    const endpoint = config.isLocalhost
      ? `/maintenance/map-view?${query}`
      : this.getEndpoint(`/maintenance/map-view?${query}`)
    const url = `${this.baseUrl}${endpoint}`

    const response = await this.fetchWithRetry<MaintenanceMapResponse>(url)
    return response.data
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
export const getDeviceSummary = () => deviceApiService.getDeviceSummary()
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
export const getDeviceMetadata = (params?: { skip?: number; limit?: number; device_id?: string; category_name?: string }) => deviceApiService.getDeviceMetadata(params)
export const getDeviceConfig = (params?: { device_id: string; category_name?: string; skip?: number; limit?: number }) => deviceApiService.getDeviceConfig(params)
export const updateDeviceConfigs = (data: { device_ids: string[]; config1?: string; config2?: string; config3?: string; config4?: string; config5?: string; config6?: string; config7?: string; config8?: string; config9?: string; config10?: string }) => deviceApiService.updateDeviceConfigs(data)
export const getDevicePerformanceData = (data: { start: string; end: string; deviceNames: string[] }) => deviceApiService.getDevicePerformanceData(data)
export const getAirQloudStats = (body: MaintenanceStatsBody) => deviceApiService.getAirQloudStats(body)
export const getDeviceStatsMaintenance = (body: MaintenanceStatsBody) => deviceApiService.getDeviceStatsMaintenance(body)
export const getMaintenanceAnalytics = (period_days: number = 14) => deviceApiService.getMaintenanceAnalytics(period_days)
export const getMaintenanceMapData = (period_days: number = 14, tags?: string) => deviceApiService.getMaintenanceMapData(period_days, tags)