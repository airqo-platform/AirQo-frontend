import type {
  NormalizedChartData,
  FrequencyType,
  PollutantType,
} from '@/shared/components/charts/types';

// Air Quality Level type definitions
export type AirQualityLevel =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive-groups'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous'
  | 'no-value';

// Site card data interface
export interface SiteData {
  _id: string;
  name: string;
  search_name?: string;
  location: string;
  country?: string;
  city?: string;
  region?: string;
  value: number;
  status: AirQualityLevel;
  aqi_category?: string;
  pollutant: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentageDifference?: number;
}

// Analytics card props interface
export interface AnalyticsCardProps {
  siteData: SiteData;
  className?: string;
  showIcon?: boolean;
  selectedPollutant?: PollutantType;
  onClick?: (site: SiteData) => void;
}

// Quick access locations props interface
export interface QuickAccessLocationsProps {
  sites: SiteData[];
  currentFilters?: {
    frequency: string;
    startDate: string;
    endDate: string;
    pollutant: string;
  };
  onFilterChange?: (
    filter: string,
    value: string | { startDate: string; endDate: string }
  ) => void;
  onManageFavorites: () => void;
  className?: string;
  title?: string;
  subtitle?: string;
  showIcon?: boolean;
  selectedPollutant?: PollutantType;
  isLoading?: boolean;
  onCardClick?: (site: SiteData) => void;
}

// Air quality thresholds and colors
export interface AirQualityThreshold {
  level: AirQualityLevel;
  min: number;
  max: number;
  color: string;
  label: string;
}

// Analytics data point interface
export interface AnalyticsDataPoint {
  time: string;
  site_id: string;
  site_name: string;
  value: number;
  pollutant: string;
  generated_name: string;
}

// Re-export shared chart types to avoid duplication
export type {
  NormalizedChartData,
  FrequencyType,
  PollutantType,
  StandardsType,
} from '@/shared/components/charts/types';

// Analytics filters interface
export interface AnalyticsFilters {
  frequency: FrequencyType;
  startDate: string;
  endDate: string;
  pollutant: PollutantType;
}

// Re-export as ChartData for backward compatibility
export type ChartData = NormalizedChartData;

// Analytics preferences interface
export interface AnalyticsPreferences {
  selectedSites: string[];
  timeframe: string;
  pollutant: string;
  chartType: string;
}
