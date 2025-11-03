import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MapReading, MapSiteDetails } from '../types/api';

export interface SelectedLocationState {
  selectedReading: MapReading | null;
  selectedSiteDetails: MapSiteDetails | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SelectedLocationState = {
  selectedReading: null,
  selectedSiteDetails: null,
  isLoading: false,
  error: null,
};

const selectedLocationSlice = createSlice({
  name: 'selectedLocation',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<MapReading>) => {
      state.selectedReading = action.payload;
      state.selectedSiteDetails = action.payload.siteDetails;
      state.error = null;
    },
    clearSelectedLocation: state => {
      state.selectedReading = null;
      state.selectedSiteDetails = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: state => {
      state.error = null;
    },
  },
});

export const {
  setSelectedLocation,
  clearSelectedLocation,
  setLoading,
  setError,
  clearError,
} = selectedLocationSlice.actions;

export default selectedLocationSlice.reducer;
