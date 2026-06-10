export type PollutantType = 'pm2_5' | 'pm10' | 'no2' | 'o3' | 'co' | 'so2';

export type AirQualityCategory =
  | 'Good'
  | 'Moderate'
  | 'UnhealthyForSensitiveGroups'
  | 'Unhealthy'
  | 'VeryUnhealthy'
  | 'Hazardous'
  | 'Unknown';

export type AirQualityLevel =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive-groups'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous'
  | 'no-value';

export interface PollutantRange {
  limit: number;
  category: AirQualityCategory;
}

export const POLLUTANT_RANGES: Record<PollutantType, PollutantRange[]> = {
  pm2_5: [
    { limit: 500.5, category: 'Unknown' },
    { limit: 225.5, category: 'Hazardous' },
    { limit: 125.5, category: 'VeryUnhealthy' },
    { limit: 55.5, category: 'Unhealthy' },
    { limit: 35.5, category: 'UnhealthyForSensitiveGroups' },
    { limit: 9.1, category: 'Moderate' },
    { limit: 0.0, category: 'Good' },
  ],
  pm10: [
    { limit: 604.1, category: 'Unknown' },
    { limit: 424.1, category: 'Hazardous' },
    { limit: 354.1, category: 'VeryUnhealthy' },
    { limit: 254.1, category: 'Unhealthy' },
    { limit: 154.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 54.1, category: 'Moderate' },
    { limit: 0.0, category: 'Good' },
  ],
  // TODO: Add support for additional pollutants when needed:
  no2: [],
  o3: [],
  co: [],
  so2: [],
} as const;

export const AIR_QUALITY_COLORS: Record<AirQualityLevel, string> = {
  good: '#34C759',
  moderate: '#ffd633',
  'unhealthy-sensitive-groups': '#FF851F',
  unhealthy: '#F7453C',
  'very-unhealthy': '#AC5CD9',
  hazardous: '#D95BA3',
  'no-value': '#6B7280',
} as const;

export const AIR_QUALITY_INFO = {
  good: {
    label: 'Good',
    range: { pm2_5: '0-9', pm10: '0-54' },
    description: 'Air quality is satisfactory',
  },
  moderate: {
    label: 'Moderate',
    range: { pm2_5: '9-35', pm10: '54-154' },
    description: 'Acceptable for most people',
  },
  'unhealthy-sensitive-groups': {
    label: 'Unhealthy for Sensitive Groups',
    range: { pm2_5: '35-55', pm10: '154-254' },
    description: 'Sensitive groups may experience health effects',
  },
  unhealthy: {
    label: 'Unhealthy',
    range: { pm2_5: '55-125', pm10: '254-354' },
    description: 'Everyone may begin to experience health effects',
  },
  'very-unhealthy': {
    label: 'Very Unhealthy',
    range: { pm2_5: '125-225', pm10: '354-424' },
    description: 'Health warnings of emergency conditions',
  },
  hazardous: {
    label: 'Hazardous',
    range: { pm2_5: '225+', pm10: '424+' },
    description: 'Health alert: everyone may experience serious effects',
  },
} as const;

/**
 * Get air quality category based on pollutant value and type
 */
export const getAirQualityCategory = (
  value: number | null | undefined,
  pollutant: PollutantType,
): AirQualityCategory => {
  if (value == null || value < 0) return 'Unknown';

  const ranges = POLLUTANT_RANGES[pollutant];
  for (const range of ranges) {
    if (value >= range.limit) {
      return range.category;
    }
  }

  return 'Unknown';
};

/**
 * Convert category to level for color mapping
 */
export const categoryToLevel = (category: string): AirQualityLevel => {
  const categoryLower = category.toLowerCase().replace(/\s+/g, '');

  if (categoryLower.includes('good')) return 'good';
  if (categoryLower.includes('moderate')) return 'moderate';
  if (categoryLower.includes('sensit')) return 'unhealthy-sensitive-groups';
  if (categoryLower.includes('veryunhealthy')) return 'very-unhealthy';
  if (categoryLower.includes('unhealthy')) return 'unhealthy';
  if (categoryLower.includes('hazardous')) return 'hazardous';

  return 'no-value';
};

/**
 * Get color based on air quality category
 */
export const getAirQualityColor = (category: string): string => {
  const level = categoryToLevel(category);
  return AIR_QUALITY_COLORS[level];
};

/**
 * Format name by capitalizing and replacing underscores/hyphens
 */
export const formatName = (name: string): string =>
  name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
