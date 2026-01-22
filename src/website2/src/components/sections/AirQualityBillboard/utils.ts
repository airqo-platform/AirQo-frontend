import { getAirQualityCategory, getAirQualityColor } from '@/utils/airQuality';

/**
 * Utility to format display names
 */
export const formatDisplayName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get color directly from PM2.5 value
 */
export const getColorFromPM25 = (pm25: number): string => {
  return getAirQualityColor(getAirQualityCategory(pm25, 'pm2_5'));
};

/**
 * Get text color for better readability on colored backgrounds
 */
export const getTextColor = (pm25: number): string => {
  const category = getAirQualityCategory(pm25, 'pm2_5');
  const level = categoryToLevel(category);
  // Use black text for light backgrounds (good, moderate)
  // Use white text for dark backgrounds
  return level === 'good' || level === 'moderate' ? '#000000' : '#FFFFFF';
};

/**
 * Convert air quality category to level
 */
const categoryToLevel = (category: any): string => {
  if (typeof category === 'string') return category.toLowerCase();
  if (category && typeof category === 'object' && 'level' in category) {
    return category.level.toLowerCase();
  }
  return 'unknown';
};

/**
 * Get location name from measurement
 */
export const getLocationName = (
  dataType: 'cohort' | 'grid',
  currentMeasurement: any,
): string => {
  if (dataType === 'cohort' && currentMeasurement?.deviceDetails) {
    // For cohort, show device name as-is (no formatting)
    return currentMeasurement.deviceDetails.name || 'Unknown Device';
  }
  if (dataType === 'grid' && currentMeasurement?.siteDetails) {
    // For grid, show site name or search_name
    return (
      currentMeasurement.siteDetails.name ||
      formatDisplayName(currentMeasurement.siteDetails.search_name) ||
      'Unknown Location'
    );
  }
  return 'Unknown Location';
};

/**
 * Get valid measurements (those with PM2.5 values)
 */
export const getValidMeasurements = (measurements: any[]): any[] => {
  return measurements.filter(
    (m: any) => m.pm2_5 && typeof m.pm2_5.value === 'number',
  );
};

/**
 * Parse next page URL parameters
 */
export const parseNextPageParams = (nextPageUrl: string): any => {
  const url = new URL(nextPageUrl);
  const params: any = {};
  url.searchParams.forEach((value, key) => {
    if (key === 'limit' || key === 'skip') {
      params[key] = parseInt(value);
    }
  });
  return params;
};
