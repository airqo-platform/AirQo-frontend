import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

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
  name: string;
  authRequired: boolean;
  serial_number: string;
  api_code: string;
  groups: string[];
}

interface Grid {
  _id: string;
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

export interface DevicesState {
    devices: Device[];
    isLoading: boolean;
    error: string | null;
  }
  const initialState: DevicesState = {
    devices: [],
    isLoading: false,
    error: null,
  };

  const devicesSlice = createSlice({
    name: "devices",
    initialState,
    reducers: {
      setDevices(state, action: PayloadAction<Device[]>) {
        state.devices = action.payload;
        state.isLoading = false;
        state.error = null;
      },
      setLoading(state, action: PayloadAction<boolean>) {
        state.isLoading = action.payload;
      },
      setError(state, action: PayloadAction<string>) {
        state.error = action.payload;
        state.isLoading = false;
      },
    },
  });

export const { setDevices, setLoading, setError } = devicesSlice.actions;
export default devicesSlice.reducer;

