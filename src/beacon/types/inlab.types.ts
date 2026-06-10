// Inlab Collocation API Types
// Matches the API spec in inlabapis.md

// --- Response Meta ---

export interface InlabApiMeta {
  total: number
  totalResults: number
  skip: number
  limit: number
  page: number
  totalPages: number
}

// --- Device Data (time-series readings) ---

export interface InlabDeviceDataPoint {
  channel_id: string
  device_id: string
  datetime: string
  frequency: 'raw' | 'hourly' | 'daily'
  'pm2.5 sensor1': number | null
  'pm2.5 sensor2': number | null
  battery: number | null
  record_count: number
  complete: boolean
  device_name: string
}

// --- Device Daily Summary ---

export interface InlabDeviceDaily {
  date: string
  uptime: number
  error_margin: number
  correlation: number | null
}

// --- Device Averages ---

export interface InlabDeviceAverages {
  'pm2.5 sensor1': number | null
  'pm2.5 sensor2': number | null
  battery: number | null
  'pm2.5': number | null
}

// --- Inlab Device (from GET /inlab) ---

export interface InlabDevice {
  device_id: string
  name: string
  device_name: string
  is_active: boolean
  category: string
  network_id: string
  firmware: string
  uptime: number
  data_completeness: number
  error_margin: number
  correlation: number | null
  averages: InlabDeviceAverages
  data: InlabDeviceDataPoint[]
  daily: InlabDeviceDaily[]
}

// --- GET /inlab Response ---

export interface InlabDevicesResponse {
  success: boolean
  message: string
  meta: InlabApiMeta
  devices: InlabDevice[]
}

// --- Batch Device (association record) ---

export interface InlabBatchDevice {
  device_id: string
  device_name: string
  firmware_version: string | null
  category: string
  network_id: string
  start_date: string | null
  end_date: string | null
  // Performance fields (now included in batch listing response)
  uptime?: number
  error_margin?: number
  correlation?: number | null
  data?: InlabDeviceDataPoint[]
  daily?: InlabDeviceDaily[]
}

// --- Batch Device with Performance (from GET /batch/{id}) ---

export interface InlabBatchDeviceWithPerformance extends InlabBatchDevice {
  uptime: number
  error_margin: number
  data: InlabDeviceDataPoint[]
  daily?: InlabDeviceDaily[]
}

// --- Batch Record ---

export interface InlabBatch {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  device_count: number
  devices: InlabBatchDevice[]
  created_at: string
}

// --- Batch with Performance (from GET /batch/{id}) ---

export interface InlabBatchWithPerformance {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  device_count: number
  devices: InlabBatchDeviceWithPerformance[]
  created_at: string
}

// --- API Responses ---

export interface InlabBatchesResponse {
  success: boolean
  message: string
  meta: InlabApiMeta
  batches: InlabBatch[]
}

export interface InlabBatchResponse {
  success: boolean
  message: string
  batch: InlabBatch
}

export interface InlabBatchDetailResponse {
  success: boolean
  message: string
  batch: InlabBatchWithPerformance
}

export interface InlabDeleteResponse {
  success: boolean
  message: string
}

export interface InlabDeviceUpdateResponse {
  success: boolean
  message: string
  device: {
    device_id: string
    start_date: string | null
    end_date: string | null
  }
}

// --- Request Payloads ---

export interface CreateBatchPayload {
  name: string
  start_date?: string
  end_date?: string
  device_ids?: string[]
}

export interface UpdateBatchPayload {
  name?: string
  start_date?: string
  end_date?: string
}

export interface AddDevicesPayload {
  device_ids: string[]
}

export interface UpdateDeviceDatesPayload {
  start_date?: string
  end_date?: string
}

// --- Query Parameters ---

export interface InlabDevicesQueryParams {
  skip?: number
  limit?: number
  search?: string
  startDateTime?: string
  endDateTime?: string
  frequency?: 'raw' | 'hourly' | 'daily'
}

export interface InlabBatchQueryParams {
  skip?: number
  limit?: number
  search?: string
}

export interface InlabBatchDetailQueryParams {
  startDateTime?: string
  endDateTime?: string
  frequency?: 'raw' | 'hourly' | 'daily'
}
