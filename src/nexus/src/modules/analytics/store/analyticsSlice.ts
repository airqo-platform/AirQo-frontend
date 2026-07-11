import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  FrequencyType,
  PollutantType,
} from '@/shared/components/charts/types';

export interface AnalyticsFilters {
  frequency: FrequencyType;
  startDate: string;
  endDate: string;
  pollutant: PollutantType;
}

interface AnalyticsState {
  filters: AnalyticsFilters;
  isLoading: boolean;
  error: string | null;
}

// Helper function to create proper backend datetime format
const createBackendDateTime = (
  daysOffset: number,
  isEndOfDay: boolean = false
): string => {
  const date = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
  if (isEndOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString(); // Returns format: "2025-07-20T00:00:00.000Z"
};

const initialState: AnalyticsState = {
  filters: {
    frequency: 'daily',
    startDate: createBackendDateTime(-7, false), // 7 days ago, start of day
    endDate: createBackendDateTime(0, true), // today, end of day
    pollutant: 'pm2_5',
  },
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AnalyticsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.error = null;
    },
    setFrequency: (state, action: PayloadAction<FrequencyType>) => {
      state.filters.frequency = action.payload;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.filters.startDate = action.payload.startDate;
      state.filters.endDate = action.payload.endDate;
    },
    setPollutant: (state, action: PayloadAction<PollutantType>) => {
      state.filters.pollutant = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    resetFilters: state => {
      state.filters = initialState.filters;
      state.error = null;
    },
  },
});

export const {
  setFilters,
  setFrequency,
  setDateRange,
  setPollutant,
  setLoading,
  setError,
  resetFilters,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
