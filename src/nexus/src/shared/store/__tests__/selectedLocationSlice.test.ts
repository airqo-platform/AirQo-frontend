import type { Reducer } from '@reduxjs/toolkit';
import reducer, {
  setSelectedLocation,
  clearSelectedLocation,
  setLoading,
  setError,
  clearError,
} from '../selectedLocationSlice';
import type { SelectedLocationState } from '../selectedLocationSlice';
import type { MapReading, AQIRanges, Averages } from '../../types/api';
import type { AirQualityReading } from '../../../modules/airqo-map/components/map/MapNodes';

const locationReducer = reducer as Reducer<SelectedLocationState>;

const initialState: SelectedLocationState = {
  selectedReading: null,
  selectedSiteDetails: null,
  isLoading: false,
  error: null,
};

const mockMapSiteDetails = {
  _id: 'site-1',
  formatted_name: 'Test Site',
  location_name: 'Test Location',
  search_name: 'test',
  city: 'Kampala',
  district: 'Central',
  county: 'Uganda',
  region: 'East',
  country: 'Uganda',
  name: 'Test',
  approximate_latitude: 0.3476,
  approximate_longitude: 32.5825,
  bearing_in_radians: 0,
  data_provider: 'airqo',
  description: 'Test site',
  site_category: { tags: ['test'], category: 'urban' },
};

const mockMapReading: MapReading = {
  _id: 'reading-1',
  site_id: 'site-1',
  time: '2024-01-15T10:00:00Z',
  aqi_category: 'GoodAir',
  aqi_color: '#34C759',
  aqi_color_name: 'green',
  aqi_ranges: {} as AQIRanges,
  averages: {} as Averages,
  createdAt: '2024-01-15T10:00:00Z',
  device: 'device-1',
  device_id: 'device-1',
  frequency: 'hourly',
  health_tips: [],
  is_reading_primary: true,
  no2: { value: null },
  pm10: { value: 10 },
  pm2_5: { value: 5 },
  siteDetails: mockMapSiteDetails,
  timeDifferenceHours: 1,
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockAirQualityReading: AirQualityReading = {
  id: 'aq-1',
  siteId: 'site-1',
  longitude: 32.5825,
  latitude: 0.3476,
  pm25Value: 12,
  pm10Value: 25,
  locationName: 'Test Location',
  lastUpdated: new Date('2024-01-15T10:00:00Z'),
  provider: 'airqo',
  status: 'active',
  isPrimary: true,
};

describe('selectedLocationSlice', () => {
  it('returns the initial state', () => {
    expect(locationReducer(undefined, { type: 'unknown' })).toEqual(
      initialState
    );
  });

  describe('setSelectedLocation', () => {
    it('sets selectedReading and selectedSiteDetails with MapReading', () => {
      const state = locationReducer(
        initialState,
        setSelectedLocation(mockMapReading)
      );

      expect(state.selectedReading).toEqual(mockMapReading);
      expect(state.selectedSiteDetails).toEqual(mockMapSiteDetails);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('serializes Date lastUpdated to ISO string for AirQualityReading', () => {
      const state = locationReducer(
        initialState,
        setSelectedLocation(mockAirQualityReading)
      );

      expect(state.selectedReading).not.toBeNull();
      const reading = state.selectedReading as Record<string, unknown>;
      expect(typeof reading.lastUpdated).toBe('string');
      expect(reading.lastUpdated).toBe('2024-01-15T10:00:00.000Z');
      expect(state.selectedSiteDetails).toBeNull();
    });

    it('handles AirQualityReading with string lastUpdated', () => {
      const readingWithStringDate: AirQualityReading = {
        ...mockAirQualityReading,
        lastUpdated: '2024-01-15T10:00:00Z',
      };

      const state = locationReducer(
        initialState,
        setSelectedLocation(readingWithStringDate)
      );

      const reading = state.selectedReading as Record<string, unknown>;
      expect(reading.lastUpdated).toBe('2024-01-15T10:00:00Z');
    });

    it('clears previous state (error, isLoading reset)', () => {
      const dirtyState: SelectedLocationState = {
        selectedReading: null,
        selectedSiteDetails: null,
        isLoading: true,
        error: 'some error',
      };

      const state = locationReducer(
        dirtyState,
        setSelectedLocation(mockMapReading)
      );

      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.selectedReading).toEqual(mockMapReading);
    });
  });

  describe('clearSelectedLocation', () => {
    it('resets all to null/false', () => {
      const dirtyState: SelectedLocationState = {
        selectedReading: mockMapReading,
        selectedSiteDetails: mockMapSiteDetails,
        isLoading: true,
        error: 'some error',
      };

      const state = locationReducer(dirtyState, clearSelectedLocation());

      expect(state.selectedReading).toBeNull();
      expect(state.selectedSiteDetails).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets isLoading to true', () => {
      const state = locationReducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('sets isLoading to false', () => {
      const state = locationReducer(
        { ...initialState, isLoading: true },
        setLoading(false)
      );
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets error string and isLoading to false', () => {
      const state = locationReducer(
        { ...initialState, isLoading: true },
        setError('Something went wrong')
      );
      expect(state.error).toBe('Something went wrong');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('resets error to null', () => {
      const state = locationReducer(
        { ...initialState, error: 'some error' },
        clearError()
      );
      expect(state.error).toBeNull();
    });
  });
});
