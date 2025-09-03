// API Response Types for Device Management System

// Device Stats Response Types
export interface DeviceStatsSummary {
  total: number
  active: number
  inactive: number
  online: number
  offline: number
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

// Device Model Types
export interface Device {
  device_key: string
  device_id: string
  device_name: string
  network?: string
  category?: string
  status?: string
  is_active: boolean
  is_online: boolean
  site_id?: string
  latitude?: number
  longitude?: number
  power_type?: string
  mount_type?: string
  last_updated?: string
  next_maintenance?: string
  created_at?: string
  updated_at?: string
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
  network?: string
  status?: string
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
  country?: string
  
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

// Transform functions types
export type TransformDeviceStats = (stats: DeviceStatsResponse) => UIDeviceCounts
export type TransformDeviceList = (devices: Device[]) => UIDevice[]