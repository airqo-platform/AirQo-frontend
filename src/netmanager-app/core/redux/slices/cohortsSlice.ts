import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Device {
  _id: string;
  name: string;
  network: string;
  groups: string[];
  authRequired: boolean;
  serial_number: string;
  api_code: string;
  long_name: string;
}

export interface Cohort {
  _id: string;
  visibility: boolean;
  cohort_tags: string[];
  cohort_codes: string[];
  name: string;
  network: string;
  groups: string[];
  numberOfDevices: number;
  devices: Device[];
}

export interface CohortsState {
  cohorts: Cohort[];
  activeCohort: Cohort | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CohortsState = {
  cohorts: [],
  activeCohort: null,
  isLoading: false,
  error: null,
};

const cohortSlice = createSlice({
  name: "cohorts",
  initialState,
  reducers: {
    setCohorts(state, action: PayloadAction<Cohort[]>) {
      state.cohorts = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setActiveCohort(state: CohortsState, action: PayloadAction<Cohort>) {
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

export const {
  setCohorts,
  setLoading,
  setActiveCohort,
  setError,
} = cohortSlice.actions;
export default cohortSlice.reducer;
