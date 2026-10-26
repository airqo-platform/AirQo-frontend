// Sensor manufacturers ("networks" on the AirQo platform) and how beacon-api reads their devices.
// On the platform a device's `network` names the manufacturer or data provider that owns it; Vertex
// labels the same field "Sensor Manufacturer".

/** Where beacon-api gets a device's readings from. */
export type DeviceDataSource = 'thingspeak' | 'external_api' | 'none'

export interface NetworkSummary {
  /** Platform _id; null when the network is only seen on devices and has not been synced yet */
  network_id: string | null
  name: string
  acronym?: string | null
  status?: string | null
  category?: string | null
  data_source?: string | null
  website?: string | null
  email?: string | null
  description?: string | null
  profile_picture?: string | null
  platform_updated_at?: string | null
  /** Passes the server's ENABLED_NETWORKS allow-list */
  enabled: boolean
  total_devices: number
  deployed_devices: number
  online_devices: number
  /** Devices beacon can read from ThingSpeak (AirQo hardware) */
  thingspeak_devices: number
  /** Devices readable through the manufacturer's API adapter */
  external_api_devices: number
}

export interface NetworkListParams {
  /** Attach per-network device counts (default true) */
  includeCounts?: boolean
  /** Comma-separated group title(s); scopes the counts to that organisation's devices */
  group?: string | null
  /** Drop networks with no device in scope, for a manufacturer filter */
  onlyWithDevices?: boolean
}

export interface NetworkListResponse {
  success: boolean
  message: string
  total: number
  networks: NetworkSummary[]
  /** Counts are limited to the requested organisation's devices; older API builds omit it */
  scoped_to_group?: boolean
}

export interface NetworkSyncResponse {
  success: boolean
  message: string
  updates_count?: number | null
  new_count?: number | null
}

/** How the IoT diagnostic engine sees one manufacturer profile, e.g. `airgradient_lowcost`. */
export interface NetworkProfileReadiness {
  name: string
  network: string
  category: string
  profile_id: string
  diagnosable: boolean
  components: string[]
  transmission_components: string[]
  errors: string[]
  warnings: string[]
}

export interface NetworkProfilesResponse {
  success: boolean
  message: string
  profiles: NetworkProfileReadiness[]
}

export interface NetworkProfileSeedResponse {
  success: boolean
  message: string
  created: string[]
  existing: string[]
  components_added: string[]
  devices_assigned: number
  diagnosable: string[]
}

/** The external data-sync triggers run in the background and only acknowledge the request. */
export interface DataSyncTriggerResponse {
  success: boolean
  message: string
}
