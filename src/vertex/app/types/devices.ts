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
  groups: string[];
  serial_number: string;
  authRequired: boolean;
  long_name: string;
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
  site?: DeviceSite;
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
}

export interface DevicesSummaryResponse {
  success: boolean;
  message: string;
  devices: Device[];
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

export interface MyDevicesResponse {
  success: boolean;
  message: string;
  devices: Device[];
  total_devices: number;
  deployed_devices: number;
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
