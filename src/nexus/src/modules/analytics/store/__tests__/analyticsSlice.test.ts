import type { Reducer } from '@reduxjs/toolkit';
import reducer, {
  setFilters,
  setFrequency,
  setDateRange,
  setPollutant,
  setLoading,
  setError,
  resetFilters,
} from '../analyticsSlice';
import type { AnalyticsFilters } from '../analyticsSlice';
import type {
  FrequencyType,
  PollutantType,
} from '@/shared/components/charts/types';

type AnalyticsState = {
  filters: AnalyticsFilters;
  isLoading: boolean;
  error: string | null;
};

const analyticsReducer = reducer as Reducer<AnalyticsState>;

const initialState: AnalyticsState = {
  filters: {
    frequency: 'daily',
    startDate: expect.any(String),
    endDate: expect.any(String),
    pollutant: 'pm2_5',
  },
  isLoading: false,
  error: null,
};

describe('analyticsSlice', () => {
  it('returns the initial state shape', () => {
    const state = analyticsReducer(undefined, { type: 'unknown' });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.filters.frequency).toBe('daily');
    expect(state.filters.pollutant).toBe('pm2_5');
    expect(typeof state.filters.startDate).toBe('string');
    expect(typeof state.filters.endDate).toBe('string');
  });

  describe('setFilters', () => {
    it('merges partial filters', () => {
      const state = analyticsReducer(
        initialState,
        setFilters({ frequency: 'hourly' })
      );
      expect(state.filters.frequency).toBe('hourly');
      expect(state.filters.pollutant).toBe('pm2_5');
      expect(state.error).toBeNull();
    });

    it('clears pre-existing error', () => {
      const stateWithError = { ...initialState, error: 'old error' };
      const state = analyticsReducer(
        stateWithError,
        setFilters({ frequency: 'weekly' })
      );
      expect(state.error).toBeNull();
    });
  });

  describe('setFrequency', () => {
    it('updates frequency', () => {
      const state = analyticsReducer(
        initialState,
        setFrequency('weekly' as FrequencyType)
      );
      expect(state.filters.frequency).toBe('weekly');
    });
  });

  describe('setDateRange', () => {
    it('updates dates', () => {
      const state = analyticsReducer(
        initialState,
        setDateRange({ startDate: '2025-01-01', endDate: '2025-01-31' })
      );
      expect(state.filters.startDate).toBe('2025-01-01');
      expect(state.filters.endDate).toBe('2025-01-31');
    });
  });

  describe('setPollutant', () => {
    it('updates pollutant', () => {
      const state = analyticsReducer(
        initialState,
        setPollutant('pm10' as PollutantType)
      );
      expect(state.filters.pollutant).toBe('pm10');
    });
  });

  describe('setLoading', () => {
    it('sets isLoading true', () => {
      const state = analyticsReducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('sets isLoading false', () => {
      const stateWithLoading = { ...initialState, isLoading: true };
      const state = analyticsReducer(stateWithLoading, setLoading(false));
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets error and isLoading false', () => {
      const state = analyticsReducer(
        { ...initialState, isLoading: true },
        setError('fetch failed')
      );
      expect(state.error).toBe('fetch failed');
      expect(state.isLoading).toBe(false);
    });

    it('null clears error', () => {
      const stateWithError = { ...initialState, error: 'old error' };
      const state = analyticsReducer(stateWithError, setError(null));
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('resetFilters', () => {
    it('resets to initial filters', () => {
      const modified = analyticsReducer(
        initialState,
        setFilters({ frequency: 'monthly', pollutant: 'pm10' as PollutantType })
      );
      const state = analyticsReducer(modified, resetFilters());
      expect(state.filters.frequency).toBe('daily');
      expect(state.filters.pollutant).toBe('pm2_5');
      expect(state.error).toBeNull();
    });

    it('after partial modification', () => {
      const modified = analyticsReducer(
        initialState,
        setFrequency('hourly' as FrequencyType)
      );
      const state = analyticsReducer(modified, resetFilters());
      expect(state.filters.frequency).toBe('daily');
      expect(state.filters.pollutant).toBe('pm2_5');
      expect(typeof state.filters.startDate).toBe('string');
      expect(typeof state.filters.endDate).toBe('string');
      expect(state.error).toBeNull();
    });
  });
});
