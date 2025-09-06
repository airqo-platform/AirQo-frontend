import {Device as DeviceType} from "./devices";

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
  groups: string[];
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
  devices: DeviceType[];
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
  geometry?: {
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
    location: { lat: number; lng: number };
    location_type: string;
    viewport: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  landform_270?: number;
  landform_90?: number;
  aspect?: number;
  distance_to_nearest_road?: number;
  distance_to_nearest_secondary_road?: number;
  distance_to_nearest_unclassified_road?: number;
  distance_to_nearest_residential_road?: number;
  share_links?: Record<string, unknown>;
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
