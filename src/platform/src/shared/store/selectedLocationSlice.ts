import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MapReading, MapSiteDetails } from '../types/api';
import type { AirQualityReading } from '../../modules/airqo-map/components/map/MapNodes';

export interface SelectedLocationState {
  selectedReading:
    | (
        | MapReading
        | (Omit<AirQualityReading, 'lastUpdated'> & { lastUpdated: string })
      )
    | null;
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
    setSelectedLocation: (
      state,
      action: PayloadAction<MapReading | AirQualityReading>
    ) => {
      // Clear previous state completely
      state.selectedReading = null;
      state.selectedSiteDetails = null;
      state.isLoading = false;
      state.error = null;

      // Create a serializable copy of the reading data
      const reading = action.payload;

      // Convert Date objects to ISO strings for Redux serialization (only for AirQualityReading)
      const serializableReading:
        | MapReading
        | (Omit<AirQualityReading, 'lastUpdated'> & { lastUpdated: string }) = {
        ...reading,
        ...(reading &&
        'lastUpdated' in reading &&
        (reading.lastUpdated instanceof Date ||
          typeof reading.lastUpdated === 'string')
          ? {
              lastUpdated:
                reading.lastUpdated instanceof Date
                  ? reading.lastUpdated.toISOString()
                  : reading.lastUpdated,
            }
          : {}),
      } as
        | MapReading
        | (Omit<AirQualityReading, 'lastUpdated'> & { lastUpdated: string });

      // Set new location data
      state.selectedReading = serializableReading;
      // Only set siteDetails if it's a MapReading
      state.selectedSiteDetails =
        (action.payload as MapReading).siteDetails || null;
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
