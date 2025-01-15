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
}

export interface DevicesSummaryResponse {
  success: boolean;
  message: string;
  devices: Device[];
}
