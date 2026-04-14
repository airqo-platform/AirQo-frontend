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
  dataType: 'grid',
  currentMeasurement: any,
): string => {
  if (currentMeasurement?.siteDetails) {
    // For grid, show site name or search_name
    return (
      currentMeasurement.siteDetails.name ||
      formatDisplayName(currentMeasurement.siteDetails.search_name) ||
      '--'
    );
  }
  return '--';
};

/**
 * Convert hex color to rgba string
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Darken a hex color by a given fraction (0-1)
 */
export const darkenHex = (hex: string, amount: number): string => {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const cleaned = (hex || '#000000').replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const factor = 1 - Math.max(0, Math.min(1, amount));
  return (
    '#' +
    [clamp(r * factor), clamp(g * factor), clamp(b * factor)]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
  );
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
  try {
    const url = new URL(nextPageUrl);
    const params: any = {};
    url.searchParams.forEach((value, key) => {
      if (key === 'limit' || key === 'skip') {
        params[key] = parseInt(value);
      }
    });
    return params;
  } catch (error) {
    console.error('Invalid nextPage URL:', nextPageUrl, error);
    return {};
  }
};
