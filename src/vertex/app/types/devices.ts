import { Site } from "./sites";

export interface DeviceSite {
  _id: string;
  visibility: boolean;
  grids: string[];
  isOnline: boolean;
  location_name: string;
  search_name: string;
  group: string;
  name: string;
  data_provider: string;
  site_category: {
    tags: string[];
    area_name: string;
    category: string;
    highway: string;
    landuse: string;
    latitude: number;
    longitude: number;
    natural: string;
    search_radius: number;
    waterway: string;
  };
  groups: string[];
  description?: string;
  createdAt?: string;
}

export interface DeviceGrid {
  _id: string;
  visibility: boolean;
  name: string;
  admin_level: string;
  long_name: string;
}

export interface Device {
  _id?: string;
  id?: string;
  name: string;
  alias?: string;
  mobility?: boolean;
  network: string;
  groups?: string[];
  serial_number: string;
  authRequired?: boolean;
  long_name?: string;
  latitude?: number | undefined | null | string;
  longitude?: number | undefined | null | string;
  approximate_distance_in_km?: number;
  bearing_in_radians?: number;
  createdAt: string;
  visibility?: boolean | undefined;
  description?: string | undefined;
  isPrimaryInLocation?: boolean;
  nextMaintenance?: string;
  deployment_date?: string;
  mountType?: string;
  isActive: boolean;
  isOnline: boolean;
  pictures?: unknown[];
  site_id?: string;
  host_id?: string | null;
  height?: number;
  device_codes: string[];
  category: string;
  cohorts: unknown[];
  device_number?: number | undefined | string;
  readKey?: string;
  writeKey?: string;
  phoneNumber?: string;
  generation_version?: number | undefined | string;
  generation_count?: number | undefined | string;
  previous_sites?: string[];
  grids?: DeviceGrid[];
  site?: DeviceSite[] | {
    _id: string;
    name: string;
  };
  status?: "not deployed" | "deployed" | "recalled" | "online" | "offline";
  maintenance_status?: "good" | "due" | "overdue" | -1;
  powerType?: "solar" | "alternator" | "mains";
  elapsed_time?: number;
  // Additional properties for device ownership and status
  owner_id?: string;
  assigned_organization_id?: string;
  claim_status?: "claimed" | "unclaimed";
  claimed_at?: string;
  site_name?: string; // Optional site name for display purposes
  [key: string]: unknown;
  onlineStatusAccuracy?: {
    accuracyPercentage?: number;
    correctChecks?: number;
    failurePercentage?: number;
    lastCheck?: string;
    lastCorrectCheck?: string;
    lastSuccessfulUpdate?: string;
    lastUpdate?: string;
    successPercentage?: number;
    successfulUpdates?: number;
    totalAttempts?: number;
    totalChecks?: number;
    failedUpdates?: number;
    incorrectChecks?: number;
    lastFailureReason?: string;
    lastIncorrectCheck?: string;
    lastIncorrectReason?: string;
  };
  api_code?: string;
  lastActive?: string;
  lastRawData?: string;
  rawOnlineStatus?: boolean;
}

export interface PaginationMeta {
  total: number;
  totalResults: number;
  limit: number;
  skip: number;
  page: number;
  totalPages: number;
  detailLevel: string;
  usedCache: boolean;
}

export interface DevicesSummaryResponse {
  success: boolean;
  message: string;
  devices: Device[];
  meta: PaginationMeta;
}

interface HealthTip {
  title: string;
  description: string;
  image: string;
}

interface AQIRange {
  min: number;
  max?: number;
}

interface AQIRanges {
  good: AQIRange;
  moderate: AQIRange;
  u4sg: AQIRange;
  unhealthy: AQIRange;
  very_unhealthy: AQIRange;
  hazardous: AQIRange;
}

interface Averages {
  dailyAverage: number;
  percentageDifference: number;
  weeklyAverages: {
    currentWeek: number;
    previousWeek: number;
  };
}

export interface Measurement {
  _id: string;
  site_id: string;
  time: string;
  __v: number;
  aqi_category: string;
  aqi_color: string;
  aqi_color_name: string;
  aqi_ranges: AQIRanges;
  averages: Averages;
  createdAt: string;
  device: string;
  device_id: string;
  frequency: string;
  health_tips: HealthTip[];
  is_reading_primary: boolean;
  no2: Record<string, unknown>;
  pm10: { value: number };
  pm2_5: { value: number };
  siteDetails: Site;
  timeDifferenceHours: number;
  updatedAt: string;
}

export interface ReadingsApiResponse {
  success: boolean;
  message: string;
  measurements: Measurement[];
}

export interface DeviceAvailabilityResponse {
  success: boolean;
  message: string;
  data: {
    available: boolean;
    status: "unclaimed" | "claimed" | "deployed";
  };
}

export interface DeviceClaimRequest {
  device_name: string;
  user_id: string;
  claim_token?: string;
}

export interface DeviceClaimResponse {
  success: boolean;
  message: string;
  device: {
    name: string;
    long_name: string;
    status: string;
    claim_status: "claimed";
    claimed_at: string;
  };
}

export interface BulkDeviceClaimItem {
  device_name: string;
  claim_token: string;
}

export interface BulkDeviceClaimRequest {
  user_id: string;
  devices: BulkDeviceClaimItem[];
}

export interface BulkDeviceClaimResult {
  device_name: string;
  success?: boolean;
  device?: {
    name: string;
    long_name: string;
    status: string;
    claim_status: "claimed";
    claimed_at: string;
  };
  error?: string;
}

export interface BulkDeviceClaimResponse {
  success?: boolean;
  message: string;
  data: {
    successful_claims: BulkDeviceClaimResult[];
    failed_claims: BulkDeviceClaimResult[];
  };
}

export interface MyDevicesResponse {
  success: boolean;
  message: string;
  devices: Device[];
  total_devices: number;
  deployed_devices: number;
  deployed_devices_count?: number;
}

export interface DeviceAssignmentRequest {
  device_name: string;
  organization_id: string;
  user_id: string;
}

export interface DeviceAssignmentResponse {
  success: boolean;
  message: string;
  device: Device;
}

export interface DeviceCreationResponse {
  success: boolean;
  message: string;
  created_device: Device;
}

export interface DeviceUpdateGroupResponse {
  success: boolean;
  message: string;
  updated_device?: Device;
}

export interface MaintenanceLogData {
  date: string;
  tags: string[];
  description: string;
  userName: string;
  maintenanceType: "preventive" | "corrective";
  email: string;
  firstName: string;
  lastName: string;
  user_id: string;
}

export interface DecryptionRequest {
  encrypted_key: string;
  device_number: number;
}

export interface DecryptedKeyResult {
  encrypted_key: string;
  device_number: string;
  decrypted_key: string;
}

export interface DecryptionResponse {
  success: boolean;
  message: string;
  decrypted_keys: DecryptedKeyResult[];
}

export interface DevicePreparation {
  device_name: string;
  claim_token: string;
  token_type: string;
  qr_code_data: {
    device_id: string;
    claim_url: string;
    platform: string;
    token: string;
    generated_at: string;
  };
  qr_code_image: string;
  label_data: {
    device_name: string;
    device_id: string;
    claim_token: string;
    instructions: string[];
  };
  shipping_prepared_at: string;
}

export interface PrepareDeviceResponse {
  success: boolean;
  message: string;
  device_preparation: DevicePreparation;
}

export interface BulkPreparationResult {
  device_name: string;
  claim_token: string;
  qr_code_data: unknown;
  qr_code_image: string;
}

export interface BulkPreparationFailure {
  device_name: string;
  error: string;
}

export interface BulkPrepareResponse {
  success: boolean;
  message: string;
  bulk_preparation_results: {
    successful_preparations: BulkPreparationResult[];
    failed_preparations: BulkPreparationFailure[];
    summary: {
      total_requested: number;
      successful_count: number;
      failed_count: number;
    };
  };
}

export interface ShippingLabel {
  device_name: string;
  device_id: string;
  device_long_name: string;
  claim_token: string;
  qr_code_image: string;
  qr_code_data: unknown;
  instructions: string[];
}

export interface GenerateLabelsResponse {
  success: boolean;
  message: string;
  shipping_labels: {
    labels: ShippingLabel[];
    total_labels: number;
  };
}

export interface ShippingStatusDevice {
  id?: string;
  _id?: string;
  name: string;
  long_name: string;
  claim_status: string;
  claim_token: string | null;
  shipping_prepared_at: string;
  owner_id: string;
  claimed_at: string;
}

export interface ShippingStatusResponse {
  success: boolean;
  message: string;
  shipping_status: {
    devices: ShippingStatusDevice[];
    summary: {
      total_devices: number;
      prepared_for_shipping: number;
      claimed_devices: number;
      deployed_devices: number;
    };
    categorized: {
      prepared_for_shipping: unknown[];
      claimed_devices: unknown[];
      deployed_devices: unknown[];
    };
  };
}

export interface OrphanedDevice {
  _id: string;
  name: string;
  long_name: string;
  status: string;
  isActive: boolean;
  claim_status: string;
  owner_id: string;
  cohort_ids: string[];
  claimed_at: string;
}

export interface OrphanedDevicesResponse {
  success: boolean;
  message: string;
  devices: OrphanedDevice[];
  total_orphaned: number;
  recommendation: string;
}

export interface ShippingBatch {
  _id: string;
  batch_name: string;
  device_count: number;
  device_names: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingBatchesResponse {
  success: boolean;
  message: string;
  batches: ShippingBatch[];
  meta: PaginationMeta;
}

export interface ShippingBatchDetailsResponse {
  success: boolean;
  message: string;
  batch: ShippingBatch & {
    devices: ShippingStatusDevice[];
  };
}
