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
  _id: string;
  isOnline: boolean;
  device_codes: string[];
  status: string;
  category: string;
  isActive: boolean;
  description: string;
  name: string;
  network: string;
  long_name: string;
  createdAt: string;
  authRequired: boolean;
  serial_number: string;
  api_code: string;
  latitude: number;
  longitude: number;
  groups: string[];
  previous_sites: string[];
  cohorts: string[];
  grids: DeviceGrid[];
  site: DeviceSite;
  claim_status?: "unclaimed" | "claimed" | "deployed";
  owner_id?: string;
  claimed_at?: string;
  assigned_organization_id?: string;
  deployment_date?: string;
  mountType?: "pole" | "wall" | "faceboard" | "rooftop" | "suspended";
  powerType?: "solar" | "mains" | "alternator";
  height?: number;
  isPrimaryInLocation?: boolean;
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
