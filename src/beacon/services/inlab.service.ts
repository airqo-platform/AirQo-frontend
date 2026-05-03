import { config } from '@/lib/config'
import authService from './api-service'
import type {
  InlabDevicesResponse,
  InlabBatchesResponse,
  InlabBatchResponse,
  InlabBatchDetailResponse,
  InlabDeleteResponse,
  InlabDeviceUpdateResponse,
  CreateBatchPayload,
  UpdateBatchPayload,
  AddDevicesPayload,
  UpdateDeviceDatesPayload,
  InlabDevicesQueryParams,
  InlabBatchQueryParams,
  InlabBatchDetailQueryParams,
} from '@/types/inlab.types'

class InlabService {
  private readonly baseUrl: string
  private readonly apiPrefix: string
  private readonly maxRetries: number = 3
  private readonly retryDelay: number = 1000

  constructor() {
    this.baseUrl = config.apiUrl
    this.apiPrefix = config.beaconApiPrefix || (config.isLocalhost ? '/api/v1' : '/api/v1/beacon')
  }

  private getEndpoint(resource: string): string {
    const cleanPath = resource.startsWith('/') ? resource : `/${resource}`
    return `${this.apiPrefix}/collocation${cleanPath}`
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    const token = authService.getToken()
    if (token) {
      headers['Authorization'] = token
    }
    return headers
  }

  private buildQueryString(params: Record<string, any>): string {
    const validParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    return validParams.length > 0 ? `?${validParams.join('&')}` : ''
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      const headers = {
        ...this.getAuthHeaders(),
        ...(options.headers as Record<string, string> || {}),
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }))

        if (response.status >= 500 && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay))
          return this.fetchWithRetry<T>(url, options, retries - 1)
        }

        throw new Error(errorData.detail || `Request failed with status ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (retries > 0) {
        const isNetworkError =
          error instanceof TypeError ||
          (error instanceof Error && error.message.includes('network'))

        if (isNetworkError) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay))
          return this.fetchWithRetry<T>(url, options, retries - 1)
        }
      }
      throw error
    }
  }

  // ─── GET /inlab ──────────────────────────────────────────────

  async getInlabDevices(params?: InlabDevicesQueryParams): Promise<InlabDevicesResponse> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = this.getEndpoint('/inlab')
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<InlabDevicesResponse>(url)
  }

  // ─── GET /inlab/batch ────────────────────────────────────────

  async getBatches(params?: InlabBatchQueryParams): Promise<InlabBatchesResponse> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = this.getEndpoint('/inlab/batch')
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<InlabBatchesResponse>(url)
  }

  // ─── GET /inlab/batch/{id} ───────────────────────────────────

  async getBatchDetail(
    batchId: string,
    params?: InlabBatchDetailQueryParams
  ): Promise<InlabBatchDetailResponse> {
    const queryString = this.buildQueryString(params || {})
    const endpoint = this.getEndpoint(`/inlab/batch/${encodeURIComponent(batchId)}`)
    const url = `${this.baseUrl}${endpoint}${queryString}`
    return this.fetchWithRetry<InlabBatchDetailResponse>(url)
  }

  // ─── POST /inlab/batch ───────────────────────────────────────

  async createBatch(payload: CreateBatchPayload): Promise<InlabBatchResponse> {
    const endpoint = this.getEndpoint('/inlab/batch')
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<InlabBatchResponse>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  // ─── PATCH /inlab/batch/{id} ─────────────────────────────────

  async updateBatch(
    batchId: string,
    payload: UpdateBatchPayload
  ): Promise<InlabBatchResponse> {
    const endpoint = this.getEndpoint(`/inlab/batch/${encodeURIComponent(batchId)}`)
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<InlabBatchResponse>(url, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  // ─── DELETE /inlab/batch/{id} ────────────────────────────────

  async deleteBatch(batchId: string): Promise<InlabDeleteResponse> {
    const endpoint = this.getEndpoint(`/inlab/batch/${encodeURIComponent(batchId)}`)
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<InlabDeleteResponse>(url, {
      method: 'DELETE',
    })
  }

  // ─── POST /inlab/batch/{id}/devices ──────────────────────────

  async addDevicesToBatch(
    batchId: string,
    payload: AddDevicesPayload
  ): Promise<InlabBatchResponse> {
    const endpoint = this.getEndpoint(
      `/inlab/batch/${encodeURIComponent(batchId)}/devices`
    )
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<InlabBatchResponse>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  // ─── DELETE /inlab/batch/{id}/devices/{deviceId} ─────────────

  async removeDeviceFromBatch(
    batchId: string,
    deviceId: string
  ): Promise<InlabDeleteResponse> {
    const endpoint = this.getEndpoint(
      `/inlab/batch/${encodeURIComponent(batchId)}/devices/${encodeURIComponent(deviceId)}`
    )
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<InlabDeleteResponse>(url, {
      method: 'DELETE',
    })
  }

  // ─── PATCH /inlab/batch/{id}/devices/{deviceId} ──────────────

  async updateDeviceDates(
    batchId: string,
    deviceId: string,
    payload: UpdateDeviceDatesPayload
  ): Promise<InlabDeviceUpdateResponse> {
    const endpoint = this.getEndpoint(
      `/inlab/batch/${encodeURIComponent(batchId)}/devices/${encodeURIComponent(deviceId)}`
    )
    const url = `${this.baseUrl}${endpoint}`
    return this.fetchWithRetry<InlabDeviceUpdateResponse>(url, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }
}

// Export singleton instance
export const inlabService = new InlabService()

// Export convenience functions
export const getInlabDevices = (params?: InlabDevicesQueryParams) =>
  inlabService.getInlabDevices(params)
export const getBatches = (params?: InlabBatchQueryParams) =>
  inlabService.getBatches(params)
export const getBatchDetail = (batchId: string, params?: InlabBatchDetailQueryParams) =>
  inlabService.getBatchDetail(batchId, params)
export const createBatch = (payload: CreateBatchPayload) =>
  inlabService.createBatch(payload)
export const updateBatch = (batchId: string, payload: UpdateBatchPayload) =>
  inlabService.updateBatch(batchId, payload)
export const deleteBatch = (batchId: string) =>
  inlabService.deleteBatch(batchId)
export const addDevicesToBatch = (batchId: string, payload: AddDevicesPayload) =>
  inlabService.addDevicesToBatch(batchId, payload)
export const removeDeviceFromBatch = (batchId: string, deviceId: string) =>
  inlabService.removeDeviceFromBatch(batchId, deviceId)
export const updateDeviceDates = (
  batchId: string,
  deviceId: string,
  payload: UpdateDeviceDatesPayload
) => inlabService.updateDeviceDates(batchId, deviceId, payload)
