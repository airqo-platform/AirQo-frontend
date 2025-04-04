import { Device, Site } from "@/app/types/sites";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Airqloud {
  _id: string;
  name: string;
  devices: Device[];
  sites: Site[];
}

export interface AirqloudsState {
  airqlouds: Airqloud[];
  activeGrid: Airqloud | null;
  activeCohort: Airqloud | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AirqloudsState = {
  airqlouds: [],
  activeGrid: null,
  activeCohort: null,
  isLoading: false,
  error: null,
};

const airqloudsSlice = createSlice({
  name: "airqlouds",
  initialState,
  reducers: {
    setAirqlouds(state, action: PayloadAction<Airqloud[]>) {
      state.airqlouds = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setActiveGrid(state, action: PayloadAction<Airqloud>) {
      state.activeGrid = action.payload;
    },
    setActiveCohort(state, action: PayloadAction<Airqloud>) {
      state.activeCohort = action.payload;
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

export const { setAirqlouds, setActiveGrid, setActiveCohort, setLoading, setError } = airqloudsSlice.actions;
export default airqloudsSlice.reducer;

