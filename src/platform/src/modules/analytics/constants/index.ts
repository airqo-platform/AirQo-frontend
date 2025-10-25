import {
  WHO_PM25_STANDARDS,
  WHO_PM10_STANDARDS,
  NEMA_PM25_STANDARDS,
  NEMA_PM10_STANDARDS,
  AIR_QUALITY_STANDARDS,
  POLLUTANT_LABELS,
  POLLUTANT_RANGES,
  REFERENCE_LINES,
  PRIMARY_COLOR_PALETTE,
  DEFAULT_CHART_CONFIG,
} from '@/shared/components/charts/constants';

// Re-export shared chart constants to avoid duplication
export {
  WHO_PM25_STANDARDS,
  WHO_PM10_STANDARDS,
  NEMA_PM25_STANDARDS,
  NEMA_PM10_STANDARDS,
  AIR_QUALITY_STANDARDS,
  POLLUTANT_LABELS,
  POLLUTANT_RANGES,
  REFERENCE_LINES,
  PRIMARY_COLOR_PALETTE,
  DEFAULT_CHART_CONFIG,
};

// Re-export as AIR_QUALITY_THRESHOLDS for backward compatibility
export { AIR_QUALITY_STANDARDS as AIR_QUALITY_THRESHOLDS };

// Filter options - keeping these as they are analytics-specific
export const FREQUENCY_OPTIONS = [
  { label: 'Raw', value: 'raw' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

// Pollutant options - using shared POLLUTANT_LABELS but formatted for dropdown
export const POLLUTANT_OPTIONS = Object.entries(POLLUTANT_LABELS).map(
  ([value, label]) => ({
    label,
    value: value.toUpperCase(),
  })
);

// Chart color palette - using shared colors
export { PRIMARY_COLOR_PALETTE as CHART_COLOR_PALETTE };
