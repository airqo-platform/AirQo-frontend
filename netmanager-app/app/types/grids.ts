export interface Grid {
    _id: string;
    visibility: boolean;
    name: string;
    admin_level: string;
    network: string;
    long_name: string;
    createdAt: string;
    sites: Site[];
}

export interface Site {
  _id: string;
  isOnline: boolean;
  formatted_name: string;
  location_name: string;
  search_name: string;
  city: string;
  district: string;
  county: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  name: string;
  approximate_latitude: number;
  approximate_longitude: number;
  generated_name: string;
  data_provider: string;
  description: string;
  site_category: SiteCategory;
  groups: string[];
  grids: Grid[];
  devices: Device[];
  airqlouds: unknown[];
  createdAt: string;
  updatedAt?: string;
}

interface SiteCategory {
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
}
  
export interface Device {
    _id: string;
    group: string;
    authRequired: boolean;
    serial_number: string;
    api_code: string;
    groups: string[];
  }