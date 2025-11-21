// Re-export air quality utilities from shared utils for backward compatibility and consistency
export {
  WHO_PM25_STANDARDS,
  WHO_PM10_STANDARDS,
  NEMA_PM25_STANDARDS,
  NEMA_PM10_STANDARDS,
  AIR_QUALITY_STANDARDS,
  POLLUTANT_LABELS,
  POLLUTANT_RANGES,
  REFERENCE_LINES,
  AIR_QUALITY_ICONS,
  getAirQualityLevel,
  getAirQualityColor,
  getAirQualityIcon,
  getAirQualityLabel,
  getAirQualityInfo,
  mapAqiCategoryToLevel,
  type AirQualityLevel,
  type PollutantType,
} from '@/shared/utils/airQuality';

// Re-export chart constants for analytics use
export {
  PRIMARY_COLOR_PALETTE,
  DEFAULT_CHART_CONFIG,
} from '@/shared/components/charts/constants';

// Re-export as AIR_QUALITY_THRESHOLDS for backward compatibility
export { AIR_QUALITY_STANDARDS as AIR_QUALITY_THRESHOLDS } from '@/shared/utils/airQuality';

// Filter options - keeping these as they are analytics-specific
export const FREQUENCY_OPTIONS = [
  { label: 'Raw', value: 'raw' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

// Import for local use in this module
import { POLLUTANT_LABELS as SHARED_POLLUTANT_LABELS } from '@/shared/utils/airQuality';
import { PRIMARY_COLOR_PALETTE as SHARED_PRIMARY_COLOR_PALETTE } from '@/shared/components/charts/constants';

// Pollutant options - using shared POLLUTANT_LABELS but formatted for dropdown
export const POLLUTANT_OPTIONS = Object.entries(SHARED_POLLUTANT_LABELS).map(
  ([value, label]) => ({
    label,
    value: value.toUpperCase(),
  })
);

// Chart color palette - using shared colors
export { SHARED_PRIMARY_COLOR_PALETTE as CHART_COLOR_PALETTE };
