import createAxiosInstance from "@/core/apis/axiosConfig"
import { DEVICES_MGT_URL } from "@/core/urls"
import type { AxiosError } from "axios"
import type { DevicesSummaryResponse, Device } from "@/app/types/devices"

// Create axios instances with and without JWT
const axiosInstance = createAxiosInstance()
const axiosInstanceWithTokenAccess = createAxiosInstance(false)

interface ErrorResponse {
  message: string
}

export interface DeviceStatus {
  _id: string
  name: string
  device_number: number
  latitude: number
  longitude: number
  isActive: boolean
  mobility: boolean
  status?: "online" | "offline"
  maintenance_status: "good" | "due" | "overdue" | -1
  powerType: "solar" | "alternator" | "mains"
  nextMaintenance?: { $date: string }
  network: string
  site_id?: string
  elapsed_time: number
}

interface DeviceStatusSummary {
  _id: string
  created_at: { $date: string }
  total_active_device_count: number
  count_of_online_devices: number
  count_of_offline_devices: number
  count_of_mains: number
  count_of_solar_devices: number
  count_of_alternator_devices: number
  count_due_maintenance: number
  count_overdue_maintenance: number
  count_unspecified_maintenance: number
  online_devices: DeviceStatus[]
  offline_devices: DeviceStatus[]
}

export interface DeviceStatusResponse {
  message: string
  data: DeviceStatusSummary[]
}

export interface RawDeviceFeed {
  isCache: boolean
  created_at: string
  entry_id: number
  field1: string
  field2: string
  field3: string
  field4: string
  field5: string
  field6: string
  field7: string
  field8: string
  [key: string]: string | number | boolean
}

export interface TransformedDeviceFeed {
  isCache: boolean
  created_at: string
  pm2_5: string
  pm10: string
  s2_pm2_5: string
  s2_pm10: string
  latitude: string
  longitude: string
  battery: string
  [key: string]: string | number | boolean
}

export interface ChartDataRequest {
  network: string
  device_category: string
  device_names: string[]
  startDateTime: string
  endDateTime: string
  frequency: "raw" | "hourly" | "daily" | "weekly"
}

export interface ChartDataPoint {
  timestamp: string
  pm2_5?: number
  pm10?: number
  battery?: number
  [key: string]: string | number | boolean | undefined
}

export interface ChartDataResponse {
  success: boolean
  message: string
  data: {
    [deviceName: string]: ChartDataPoint[]
  }
}

export const devices = {
  // Existing API functions
  getDevicesSummaryApi: async (networkId: string, groupName: string) => {
    try {
      const response = await axiosInstance.get<DevicesSummaryResponse>(
        `${DEVICES_MGT_URL}/summary?network=${networkId}&group=${groupName}`,
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      throw new Error(axiosError.response?.data?.message || "Failed to fetch devices summary")
    }
  },

  getMapReadingsApi: async () => {
    try {
      const response = await axiosInstanceWithTokenAccess.get<DevicesSummaryResponse>(`${DEVICES_MGT_URL}/readings/map`)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      throw new Error(axiosError.response?.data?.message || "Failed to fetch events")
    }
  },

  getDevicesApi: async (networkId: string) => {
    try {
      const response = await axiosInstance.get<DevicesSummaryResponse>(
        `${DEVICES_MGT_URL}/summary?network=${networkId}`,
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      throw new Error(axiosError.response?.data?.message || "Failed to fetch devices summary")
    }
  },

  getDevicesStatus: async (): Promise<DeviceStatusResponse> => {
    // Get today's date and yesterday's date
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const limit = 1

    const response = await axiosInstance.get(
      `/monitor/devices/status?tenant=airqo&startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
    )
    return response.data
  },

  // New API functions for charts and data export
  getDevices: async (): Promise<Device[]> => {
    try {
      // Use the existing getDevicesApi function with default network "airqo"
      const response = await devices.getDevicesApi("airqo")
      return response.devices || []
    } catch (error) {
      console.error("Error fetching devices:", error)
      throw error
    }
  },

  getDevice: async (deviceId: string): Promise<Device> => {
    try {
      const response = await axiosInstance.get<{ success: boolean; device: Device }>(`${DEVICES_MGT_URL}/${deviceId}`)
      return response.data.device
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      throw new Error(axiosError.response?.data?.message || `Failed to fetch device ${deviceId}`)
    }
  },

  getRawDeviceFeed: async (deviceId: string): Promise<RawDeviceFeed> => {
    try {
      const response = await axiosInstance.get<RawDeviceFeed>(`${DEVICES_MGT_URL}/feeds/recent/${deviceId}`)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      throw new Error(axiosError.response?.data?.message || `Failed to fetch feed for device ${deviceId}`)
    }
  },

  getTransformedDeviceFeed: async (channelId: string): Promise<TransformedDeviceFeed> => {
    try {
      const response = await axiosInstance.get<TransformedDeviceFeed>(
        `${DEVICES_MGT_URL}/feeds/transform/recent?channel=${channelId}`,
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      throw new Error(axiosError.response?.data?.message || `Failed to fetch transformed feed for channel ${channelId}`)
    }
  },

  getChartData: async (params: ChartDataRequest): Promise<ChartDataResponse> => {
    try {
      const response = await axiosInstance.post<ChartDataResponse>(`${DEVICES_MGT_URL}/feeds/raw-data`, params)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      throw new Error(axiosError.response?.data?.message || "Failed to fetch chart data")
    }
  },

  exportData: async (params: ChartDataRequest): Promise<Blob> => {
    try {
      const response = await axiosInstance.post(`${DEVICES_MGT_URL}/feeds/download`, params, {
        responseType: "blob",
      })
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw new Error(axiosError.message || "Failed to export data")
    }
  },
}

