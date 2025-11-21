'use client';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import {
  setFilters,
  setFrequency,
  setDateRange,
  setPollutant,
  setLoading,
  setError,
  resetFilters,
} from '../store/analyticsSlice';
import type { AnalyticsFilters, FrequencyType, PollutantType } from '../types';

export const useAnalytics = () => {
  const dispatch = useDispatch();
  const analyticsState = useSelector((state: RootState) => state.analytics);

  return {
    filters: analyticsState.filters,
    isLoading: analyticsState.isLoading,
    error: analyticsState.error,
    setFilters: (filters: Partial<AnalyticsFilters>) =>
      dispatch(setFilters(filters)),
    setFrequency: (frequency: FrequencyType) =>
      dispatch(setFrequency(frequency)),
    setDateRange: (startDate: string, endDate: string) =>
      dispatch(setDateRange({ startDate, endDate })),
    setPollutant: (pollutant: PollutantType) =>
      dispatch(setPollutant(pollutant)),
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    setError: (error: string | null) => dispatch(setError(error)),
    resetFilters: () => dispatch(resetFilters()),
  };
};
