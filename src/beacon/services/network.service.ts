import { config } from "@/lib/config"
import { fetchWithAuth } from "@/lib/api-client"
import authService from "@/services/api-service"
import { isMockMode, getMockNetworks, getMockNetworkProfiles } from "@/lib/mock-data"
import type {
  DataSyncTriggerResponse,
  NetworkListResponse,
  NetworkProfileReadiness,
  NetworkProfileSeedResponse,
  NetworkProfilesResponse,
  NetworkSummary,
  NetworkSyncResponse,
} from "@/types/network.types"

/**
 * Sensor manufacturers ("networks") in beacon-api: the mirrored platform networks with
 * per-manufacturer device counts, the manufacturer diagnostic profiles, and the admin
 * actions that sync them and pull readings for devices read through manufacturer APIs.
 *
 * Same routing and auth as the other Beacon services: the API sits behind the platform
 * gateway at /api/v1/beacon (plain /api/v1 against a local API) and the gateway expects the
 * platform token as-is in Authorization, which is already formatted as `JWT <token>`.
 */
const getBaseUrl = () => `${config.apiUrl}${config.beaconApiPrefix}`

export class NetworkApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "NetworkApiError"
    this.status = status
  }
}

const buildHeaders = (requireAuth: boolean): HeadersInit => {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const token = authService.getToken()
  if (token) {
    headers["Authorization"] = token
  } else if (requireAuth) {
    throw new NetworkApiError("Authentication required", 401)
  }
  return headers
}

const parseResponse = async <T>(response: Response, context: string): Promise<T> => {
  if (response.ok) {
    return (await response.json()) as T
  }
  let detail = `${context} failed with status ${response.status}`
  try {
    const body = await response.json()
    if (typeof body?.detail === "string") detail = body.detail
    else if (typeof body?.message === "string") detail = body.message
  } catch {
    // keep the status message
  }
  throw new NetworkApiError(detail, response.status)
}

class NetworkService {
  private async request<T>(
    path: string,
    context: string,
    options: { method?: "GET" | "POST"; requireAuth?: boolean } = {}
  ): Promise<T> {
    const response = await fetchWithAuth(`${getBaseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers: buildHeaders(Boolean(options.requireAuth)),
    })
    return parseResponse<T>(response, context)
  }

  /** Networks beacon knows, each with its mirrored, deployed, online and readable device counts. */
  async getNetworks(params: { includeCounts?: boolean } = {}): Promise<NetworkSummary[]> {
    if (isMockMode()) return getMockNetworks()
    const includeCounts = params.includeCounts ?? true
    const response = await this.request<NetworkListResponse>(
      `/networks/?include_counts=${includeCounts ? "true" : "false"}`,
      "Fetching manufacturers"
    )
    return Array.isArray(response?.networks) ? response.networks : []
  }

  /** Mirrors the platform's networks list (JWT). */
  syncNetworks(): Promise<NetworkSyncResponse> {
    return this.request<NetworkSyncResponse>("/networks/sync", "Syncing manufacturers", {
      method: "POST",
      requireAuth: true,
    })
  }

  /** Each manufacturer profile as the diagnostic engine sees it. */
  async getManufacturerProfiles(): Promise<NetworkProfileReadiness[]> {
    if (isMockMode()) return getMockNetworkProfiles()
    const response = await this.request<NetworkProfilesResponse>("/networks/profiles", "Fetching manufacturer profiles")
    return Array.isArray(response?.profiles) ? response.profiles : []
  }

  /** Creates the per-manufacturer profiles and assigns them to devices without one. */
  seedManufacturerProfiles(): Promise<NetworkProfileSeedResponse> {
    return this.request<NetworkProfileSeedResponse>("/networks/profiles/seed", "Seeding manufacturer profiles", {
      method: "POST",
    })
  }

  /** Backfills readings for devices read through manufacturer APIs; runs in the background (JWT). */
  syncExternalReadings(days: number = 14): Promise<DataSyncTriggerResponse> {
    const safeDays = Math.max(1, Math.floor(Number(days) || 14))
    return this.request<DataSyncTriggerResponse>(`/data-sync/sync-external?days=${safeDays}`, "Backfilling external readings", {
      method: "POST",
      requireAuth: true,
    })
  }

  /** Stores each external device's latest reading from its manufacturer; runs in the background (JWT). */
  pollExternalFeeds(): Promise<DataSyncTriggerResponse> {
    return this.request<DataSyncTriggerResponse>("/data-sync/poll-external-feeds", "Polling live feeds", {
      method: "POST",
      requireAuth: true,
    })
  }
}

export const networkService = new NetworkService()

export const getNetworks = (params?: { includeCounts?: boolean }) => networkService.getNetworks(params)
export const syncNetworks = () => networkService.syncNetworks()
export const getManufacturerProfiles = () => networkService.getManufacturerProfiles()
export const seedManufacturerProfiles = () => networkService.seedManufacturerProfiles()
export const syncExternalReadings = (days?: number) => networkService.syncExternalReadings(days)
export const pollExternalFeeds = () => networkService.pollExternalFeeds()

export default networkService
