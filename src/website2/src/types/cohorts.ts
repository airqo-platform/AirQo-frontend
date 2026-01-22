/**
 * Types for AirQo Cohorts Data
 */

import { AQIRanges, HealthTip, PollutantValue, SiteDetails } from './grids';

export interface CohortDevice {
  _id: string;
  name: string;
  long_name: string;
  device_number: number;
  isActive: boolean;
  isOnline: boolean;
  rawOnlineStatus: boolean;
  lastRawData: string;
  lastActive: string;
  status: string;
  network: string;
  createdAt: string;
}

export interface Cohort {
  _id: string;
  groups: string[];
  visibility: boolean;
  cohort_tags: string[];
  cohort_codes: string[];
  name: string;
  network: string;
  createdAt: string;
  devices: CohortDevice[];
  numberOfDevices: number;
}

export interface CohortsSummaryMeta {
  total: number;
  limit: number;
  skip: number;
  page: number;
  totalPages: number;
  nextPage?: string;
  previousPage?: string;
}

export interface CohortsSummaryResponse {
  success: boolean;
  message: string;
  meta: CohortsSummaryMeta;
  cohorts: Cohort[];
}

export interface CohortsQueryParams {
  limit?: number;
  skip?: number;
  page?: number;
  search?: string;
}

/**
 * Types for Cohort Measurements
 */

export interface DeviceDetails {
  _id: string;
  isOnline: boolean;
  owner_id: string | null;
  claim_status: string;
  assigned_organization_id: string | null;
  name: string;
  lastRawData: string;
  rawOnlineStatus: boolean;
  latest_pm2_5: {
    raw: {
      value: number;
      time: string;
    };
    calibrated: {
      value: number;
      time: string;
      uncertainty: number | null;
      standardDeviation: number | null;
    };
  };
  deployment_type: string;
  grid_id: string | null;
  latitude: number;
  longitude: number;
}

export interface CohortMeasurement {
  device: string;
  device_id: string;
  site_id: string;
  time: string;
  pm2_5: PollutantValue;
  pm10: PollutantValue;
  frequency: string;
  no2: PollutantValue;
  deviceDetails: DeviceDetails;
  is_reading_primary: boolean;
  health_tips: HealthTip[];
  timeDifferenceHours: number;
  aqi_ranges: AQIRanges;
  aqi_color: string;
  aqi_category: string;
  aqi_color_name: string;
}

export interface CohortMeasurementsMeta {
  total: number;
  skip: number;
  limit: number;
  page: number;
  pages: number;
  startTime: string;
  endTime: string;
  optimized: boolean;
  countSkipped: boolean;
}

export interface CohortMeasurementsResponse {
  success: boolean;
  isCache: boolean;
  message: string;
  meta: CohortMeasurementsMeta;
  measurements: CohortMeasurement[];
}

/**
 * Types for Grid Measurements
 */

export interface GridMeasurement {
  device: string;
  device_id: string;
  site_id: string;
  time: string;
  pm2_5: PollutantValue;
  pm10: PollutantValue;
  frequency: string;
  no2: PollutantValue;
  siteDetails: SiteDetails;
  is_reading_primary: boolean;
  health_tips: HealthTip[];
  timeDifferenceHours: number;
  aqi_ranges: AQIRanges;
  aqi_color: string;
  aqi_category: string;
  aqi_color_name: string;
}

/**
 * Types for Daily Forecast
 */

export interface ForecastItem {
  time: string;
  pm2_5: number;
  aqi_category: string;
  aqi_color: string;
  aqi_color_name: string;
}

export interface ForecastAQIRange {
  min: number;
  max: number | null;
  label: string;
  aqi_category: string;
  aqi_color: string;
  aqi_color_name: string;
}

export interface ForecastAQIRanges {
  good: ForecastAQIRange;
  moderate: ForecastAQIRange;
  u4sg: ForecastAQIRange;
  unhealthy: ForecastAQIRange;
  very_unhealthy: ForecastAQIRange;
  hazardous: ForecastAQIRange;
}

export interface DailyForecastResponse {
  forecasts: ForecastItem[];
  aqi_ranges: ForecastAQIRanges;
}
