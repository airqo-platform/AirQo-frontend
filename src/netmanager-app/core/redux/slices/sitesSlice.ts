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

interface Device {
  _id: string;
  group: string;
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

interface SitesState {
  sites: Site[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SitesState = {
  sites: [],
  isLoading: false,
  error: null,
};

const sitesSlice = createSlice({
  name: "sites",
  initialState,
  reducers: {
    setSites(state, action: PayloadAction<Site[]>) {
      state.sites = action.payload;
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

export const { setSites, setLoading, setError } = sitesSlice.actions;
export default sitesSlice.reducer;
