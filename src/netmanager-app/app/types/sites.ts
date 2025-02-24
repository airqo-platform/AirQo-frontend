export interface Site {
  _id: string;
  nearest_tahmo_station: {
    id: number;
    code: string | null;
    longitude: number;
    latitude: number;
    timezone: string | null;
  };
  images: unknown[];
  groups: unknown[];
  site_codes: string[];
  site_tags: string[];
  isOnline: boolean;
  formatted_name: string;
  location_name: string;
  search_name: string;
  parish: string;
  village: string;
  sub_county: string;
  city: string;
  district: string;
  county: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  name: string;
  network: string;
  approximate_latitude: number;
  approximate_longitude: number;
  bearing_in_radians: number;
  approximate_distance_in_km: number;
  lat_long: string;
  generated_name: string;
  altitude: number;
  data_provider: string;
  description: string;
  weather_stations: Array<{
    code: string;
    name: string;
    country: string;
    longitude: number;
    latitude: number;
    timezone: string;
    distance: number;
    _id: string;
  }>;
  createdAt: string;
  lastActive: string;
  grids: Array<{
    _id: string;
    name: string;
    admin_level: string;
    visibility: boolean;
  }>;
  devices: Array<{
    _id: string;
    visibility: boolean;
    mobility: boolean;
    status: string;
    isPrimaryInLocation: boolean;
    category: string;
    isActive: boolean;
    device_number: number;
    name: string;
    createdAt: string;
    device_codes: string[];
    network: string;
    approximate_distance_in_km: number;
    bearing_in_radians: number;
    latitude: number;
    longitude: number;
    ISP: string;
    previous_sites: string[];
    groups: string[];
    host_id: string | null;
    cohorts: unknown[];
    serial_number: string;
    isOnline: boolean;
    lastActive: string;
  }>;
  airqlouds: unknown[];
  site_category?: {
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
}

export interface Device {
  name: string;
  description?: string;
  site?: string;
  isPrimary: boolean;
  isCoLocated: boolean;
  registrationDate: string;
  deploymentStatus: "Deployed" | "Pending" | "Removed";
}
