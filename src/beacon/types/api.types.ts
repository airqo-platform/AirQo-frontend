// API Response Types for Device Management System

import type { DeviceDataSource } from './network.types'

export type { DeviceDataSource } from './network.types'

export type GridAdminLevel =
  | 'Municipality'
  | 'municipality'
  | 'county'
  | 'division'
  | 'city'
  | 'country'
  | 'state'
  | 'metropolitanmunicipality'
  | 'province'
  | 'region'
  | 'district'

// Device Stats Response Types
export interface DeviceStatsSummary {
  total: number
  active: number
  inactive: number
  online: number
  offline: number
}

export interface DeviceSummaryResponse {
  total_devices: number
  active_airqlouds: number
  tracked_devices: number
  deployed_devices: number
  tracked_online: number
  tracked_offline: number
}

export interface DeviceDeployment {
  deployed: number
  not_deployed: number
  recalled: number
}

export interface DevicePercentages {
  active_rate: number
  online_rate: number
  deployment_rate: number
}

export interface DeviceMaintenance {
  upcoming_30_days: number
  percentage: number
}

export interface DeviceStatsResponse {
  summary: DeviceStatsSummary
  deployment: DeviceDeployment
  status_breakdown: Record<string, number>
  percentages: DevicePercentages
  networks?: Record<string, number>
  categories?: Record<string, number>
  maintenance?: DeviceMaintenance
  timestamp: string
}

/**
 * beacon-api's own record for a mirrored device, nested under `beacon_data`. Older API builds
 * omit the manufacturer fields, so they are all optional.
 */
export interface DeviceBeaconData {
  /** The device's sensor manufacturer / network (airqo, airgradient, ...) */
  network_id?: string | null
  site_id?: string | null
  profile_id?: string | null
  current_firmware?: string | null
  previous_firmware?: string | null
  file_upload_state?: boolean
  firmware_download_state?: string | null
  /** ThingSpeak channel; AirQo devices only */
  device_number?: number | null
  writeKey?: string | null
  readKey?: string | null
  status?: string | null
  /** Manufacturer identity for non-AirQo devices */
  serial_number?: string | null
  /** Manufacturer API URL the platform reads the device from */
  api_code?: string | null
  auth_required?: boolean | null
  data_source?: DeviceDataSource | null
}

/** Latest stored raw reading, keyed field1..field20 (labels come from the device's profile) */
export interface DeviceLastReading {
  timestamp?: string | null
  /** Source key of the local tables: the ThingSpeak channel for AirQo devices, the device id otherwise */
  channel_id?: string | number | null
  values?: Record<string, unknown>
}

// Device Model Types
export interface Device {
  _id: string
  name: string
  long_name: string
  alias: string
  description?: string

  // Status & Connectivity
  isActive: boolean
  isOnline: boolean
  isPrimaryInLocation: boolean
  status: string // "deployed", "not deployed", "recalled"
  visibility: boolean
  /** Whether the manufacturer API needs the device's vendor credential */
  authRequired?: boolean | null

  // Hardware & Config
  /** ThingSpeak channel. Only AirQo devices have one; never use it as the device identity, use `_id`. */
  device_number?: number | null
  /** Manufacturer serial number; the identity of non-AirQo devices */
  serial_number?: string | null
  /** Manufacturer API URL ("device connection URL") for non-AirQo devices */
  api_code?: string | null
  /** Where beacon reads this device's data from; derive with resolveDeviceDataSource when absent */
  data_source?: DeviceDataSource | null
  device_codes: string[]
  /** Sensor manufacturer / data provider: "airqo", "airgradient", "iqair", ... */
  network: string
  category: string // "lowcost", "bam", "gas"
  mobility: boolean
  height: number
  mountType?: string
  powerType?: string

  // Security (ThingSpeak keys; AirQo devices only)
  writeKey?: string | null
  readKey?: string | null

  // beacon-api's own record and latest stored reading (from /devices/synced)
  beacon_data?: DeviceBeaconData | null
  last_reading?: DeviceLastReading | null

  // Dates
  createdAt: string
  lastActive: string
  lastRawData: string
  deployment_date?: string
  nextMaintenance?: string

  // Location
  latitude: number
  longitude: number
  approximate_distance_in_km?: number
  bearing_in_radians?: number

  // Categories & Groups
  groups: string[]
  tags: string[]
  cohorts: Array<{
    _id: string
    name: string
    description?: string
  }>

  grids: Array<{
    _id: string
    name: string
    admin_level: string
    long_name: string
  }>

  // Site Info
  site?: {
    _id: string
    name: string
    formatted_name: string
    location_name: string
    search_name: string
    city: string
    country: string
    description: string
    approximate_latitude: number
    approximate_longitude: number
    generated_name: string
  }

  // Additional Data
  device_categories?: {
    primary_category: string
    deployment_category: string
    is_mobile: boolean
    is_static: boolean
    is_lowcost: boolean
    all_categories: string[]
  }

  onlineStatusAccuracy?: {
    accuracyPercentage: number
    lastCheck: string
    lastCorrectCheck: string
  }

  // Keeping some old optional fields for backward compatibility if mixed usage occurs
  // (Optional - can remove if we are sure only new format is used)
  device_id?: string
  device_name?: string
  site_location?: any
  location?: any
  current_firmware?: string
  target_firmware?: string
  firmware_download_state?: string
}

// Pagination Metadata
export interface PaginationMetadata {
  total: number
  skip: number
  limit: number | null
  returned: number
  pages: number
  current_page: number
  has_next: boolean
  has_previous: boolean
}

// New API Response Meta
export interface ApiResponseMeta {
  total: number
  limit: number
  skip: number
  page: number
  totalResults: number
  totalPages: number
  detailLevel?: string
  usedCache?: boolean
  nextPage?: string
  totalDevices?: number
  devicesInAtLeastOneCohort?: number
  deployedDevices?: number
  onlineDevices?: number
  offlineDevices?: number
}

// Paginated Device Response
export interface PaginatedDeviceResponse {
  devices: Device[]
  pagination?: PaginationMetadata // specific to internal usage after transformation or old API
  meta?: ApiResponseMeta // from new API
}

// Device Performance Types
export interface DevicePerformancePeriod {
  start: string
  end: string
  days: number
}

export interface DevicePerformanceMetrics {
  uptime_percentage: number
  data_completeness: number
  total_readings: number
  valid_readings: number
  error_readings: number
}

export interface DevicePerformanceAverages {
  pm2_5: number | null
  pm10: number | null
  temperature: number | null
  humidity: number | null
}

export interface DevicePerformanceStatus {
  current_status: string | null
  is_active: boolean
  is_online: boolean
  last_updated: string | null
}

export interface DevicePerformanceResponse {
  device_id: string
  device_name: string
  period: DevicePerformancePeriod
  metrics: DevicePerformanceMetrics
  averages: DevicePerformanceAverages
  status: DevicePerformanceStatus
}

// Device Reading Types
export interface DeviceReading {
  reading_key?: string
  device_key: string
  timestamp: string
  s1_pm2_5?: number | null
  s2_pm2_5?: number | null
  s1_pm10?: number | null
  s2_pm10?: number | null
  temperature?: number | null
  humidity?: number | null
  battery_voltage?: number | null
  latitude?: number | null
  longitude?: number | null
  quality_index?: number | null
}

export interface DeviceReadingsResponse {
  device_id: string
  device_name: string
  count: number
  readings: DeviceReading[]
}

// Offline Devices Response
export interface OfflineDevice {
  device_id: string
  device_key: string
  device_name: string
  network?: string
  category?: string
  last_updated: string
  status?: string
  is_online: boolean
  is_active: boolean
}

export interface OfflineDevicesResponse {
  threshold_hours: number
  count: number
  devices: OfflineDevice[]
}

// API Error Response
export interface ApiError {
  detail: string
  status_code?: number
  timestamp?: string
}

// Query Parameters
export interface DeviceQueryParams {
  skip?: number
  limit?: number
  site_id?: string
  /** Sensor manufacturer(s), comma-separated and case-insensitive, e.g. "airqo,airgradient" */
  network?: string
  status?: string
  search?: string
  group?: string
  /** Attach each device's latest stored daily diagnosis as `diagnostics` */
  includeDiagnostics?: boolean
}

export interface PerformanceQueryParams {
  days?: number
}

export interface ReadingsQueryParams {
  start_date?: string
  end_date?: string
  limit?: number
}

export interface OfflineQueryParams {
  hours?: number
}

export interface StatsQueryParams {
  include_networks?: boolean
  include_categories?: boolean
  include_maintenance?: boolean
  group?: string
}

// UI Compatible Types (for backward compatibility)
export interface UIDeviceCounts {
  total_devices: number
  active_devices: number
  offline_devices: number
  deployed_devices: number
  not_deployed: number
  recalled_devices: number
}

export interface UIDevice {
  // Direct device properties (for compatibility with existing code)
  device_id: string
  device_name: string
  device_key?: string
  network?: string
  category?: string
  status?: string
  is_online?: boolean
  is_active?: boolean
  latitude?: number
  longitude?: number
  location_name?: string
  city?: string
  district?: string
  country?: string
  site_category?: string
  power_type?: string
  mount_type?: string
  height?: number
  next_maintenance?: string
  first_seen?: string
  last_updated?: string
  /** ThingSpeak channel; only set for devices read from ThingSpeak */
  channel_id?: number
  network_id?: string
  /** Where beacon reads this device from */
  data_source?: DeviceDataSource
  serial_number?: string
  /** Manufacturer API URL for non-AirQo devices */
  api_code?: string
  auth_required?: boolean
  current_firmware?: string
  target_firmware?: string
  firmware_download_state?: string

  // Latest reading data
  pm2_5?: number | null
  pm10?: number | null
  temperature?: number | null
  humidity?: number | null
  reading_timestamp?: string

  // Nested structure (for new code)
  device: {
    id: string
    name: string
    power_type?: string
    mount_type?: string
    next_maintenance?: string
    status?: string
  }
  location: {
    name?: string
    city?: string
    district?: string
    country?: string
    latitude?: number
    longitude?: number
    deployment_date?: string
  }
  maintenance_history?: Array<{
    maintenance_type: string
    description: string
    date: string
    timestamp?: string
  }>
  readings_history?: Array<{
    timestamp: string
    pm2_5?: number
    pm10?: number
    temperature?: number
    humidity?: number
    aqi_category?: string
  }>
}

// Paginated UI Device Response
export interface PaginatedUIDeviceResponse {
  devices: UIDevice[]
  pagination: PaginationMetadata
  meta?: ApiResponseMeta
}

// Transform functions types
export type TransformDeviceStats = (stats: DeviceStatsResponse) => UIDeviceCounts
export type TransformDeviceList = (devices: Device[]) => UIDevice[]

// Maintenance API Types

export interface MaintenanceFilter {
  min: number
  max: number
}

export interface MaintenanceFilters {
  uptime?: MaintenanceFilter
  error_margin?: MaintenanceFilter
  country?: string
  search?: string
}

export interface MaintenanceSort {
  field: string
  order: 'asc' | 'desc'
}

export interface MaintenanceStatsBody {
  period_days: number
  filters: MaintenanceFilters
  sort?: MaintenanceSort
  page: number
  page_size: number
}

export interface AirQloudMaintenanceStats {
  id: string
  name: string
  country: string | null
  device_count: number
  avg_uptime: number
  avg_error_margin: number
}

export interface AirQloudStatsResponse {
  total: number
  page: number
  page_size: number
  items: AirQloudMaintenanceStats[]
}

export interface DeviceMaintenanceStats {
  device_id: string
  device_name: string
  airqlouds: string[]
  avg_uptime: number
  avg_error_margin: number
  avg_battery: number
}

export interface DeviceMaintenanceStatsResponse {
  total: number
  page: number
  page_size: number
  items: DeviceMaintenanceStats[]
}

export interface MaintenanceMapItem {
  device_id: string
  device_name: string
  device_number?: number | string | null
  latitude: number
  longitude: number
  last_active: string | null
  uptime: number
  data_completeness: number
  error_margin: number
  cohorts: string[]
  grids?: string[]
}

export interface MaintenanceMapResponse {
  success: boolean
  data: MaintenanceMapItem[]
}

export interface SyncedGrid {
  grid_id: string
  name: string
  long_name?: string | null
  admin_level?: GridAdminLevel | null
  network?: string | null
  number_of_sites?: number
}

export interface SyncedGridsQueryParams {
  skip?: number
  limit?: number
  search?: string
  grid_ids?: string
  admin_level?: GridAdminLevel | GridAdminLevel[]
  group?: string
}

export interface SyncedGridsResponse {
  success: boolean
  message?: string
  meta?: ApiResponseMeta
  grids: SyncedGrid[]
}

export interface MaintenanceAnalyticsResponse {
  // Define properties based on usage or allow flexible structure for now if unknown
  [key: string]: any
}

export interface MyDevicesResponse {
  success: boolean
  message: string
  devices: Device[]
  total_devices: number
  deployed_devices: number
  deployed_devices_count?: number
}