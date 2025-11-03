/**
 * Air Quality Utility Functions and Constants
 *
 * This utility provides centralized air quality management including:
 * - Air quality icons mapping
 * - Pollutant ranges and standards
 * - Level calculations and color assignments
 * - Standard organization values (WHO, NEMA)
 *
 * Use this utility across all modules (analytics, charts, airqo-map) to ensure
 * consistency and ease of maintenance.
 */

import {
  AqGood,
  AqHazardous,
  AqModerate,
  AqNoValue,
  AqUnhealthy,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
  AqArrowDown,
  AqArrowUp,
} from '@airqo/icons-react';
import { HiMinus } from 'react-icons/hi';
import type { ComponentType } from 'react';

// ========================================
// TYPES
// ========================================

export type AirQualityLevel =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive-groups'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous'
  | 'no-value';

// TODO: Expand to support additional pollutants (no2, o3, co, so2) when needed
export type PollutantType = 'pm2_5' | 'pm10';

export type StandardsOrganization = 'WHO' | 'NEMA';

export interface AirQualityStandard {
  level: string;
  range: {
    min: number;
    max: number;
  };
  color: string;
  description: string;
}

export interface PollutantRange {
  limit: number;
  category: string;
}

export interface AirQualityInfo {
  level: AirQualityLevel;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
  // Note: AirQo icons have built-in colors, no need for custom color handling
}

export interface StandardValues {
  pm2_5: number;
  pm10: number;
}

// ========================================
// AIR QUALITY ICONS
// ========================================

export const AIR_QUALITY_ICONS: Record<
  AirQualityLevel,
  ComponentType<{ className?: string }>
> = {
  good: AqGood,
  moderate: AqModerate,
  'unhealthy-sensitive-groups': AqUnhealthyForSensitiveGroups,
  unhealthy: AqUnhealthy,
  'very-unhealthy': AqVeryUnhealthy,
  hazardous: AqHazardous,
  'no-value': AqNoValue,
} as const;

// Trend icons for air quality trends
export const TREND_ICONS = {
  up: AqArrowUp,
  down: AqArrowDown,
  stable: HiMinus,
} as const;

// ========================================
// AIR QUALITY COLORS
// ========================================

export const AIR_QUALITY_COLORS: Record<AirQualityLevel, string> = {
  good: '#34C759', // green-500
  moderate: '#ECAA06', // amber-500
  'unhealthy-sensitive-groups': '#FF851F', // red-500
  unhealthy: '#F7453C', // violet-500
  'very-unhealthy': '#AC5CD9', // red-600
  hazardous: '#D95BA3', // red-900
  'no-value': '#6B7280', // gray-500
} as const;

// ========================================
// POLLUTANT RANGES FOR CATEGORIZATION
// ========================================

export const POLLUTANT_RANGES: Record<PollutantType, PollutantRange[]> = {
  pm2_5: [
    { limit: 500.5, category: 'Invalid' },
    { limit: 225.5, category: 'Hazardous' },
    { limit: 125.5, category: 'VeryUnhealthy' },
    { limit: 55.5, category: 'Unhealthy' },
    { limit: 35.5, category: 'UnhealthyForSensitiveGroups' },
    { limit: 9.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  pm10: [
    { limit: 604.1, category: 'Invalid' },
    { limit: 424.1, category: 'Hazardous' },
    { limit: 354.1, category: 'VeryUnhealthy' },
    { limit: 254.1, category: 'Unhealthy' },
    { limit: 154.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 54.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  // TODO: Add support for additional pollutants when needed:
  // no2, o3, co, so2 with their respective ranges
} as const;

// ========================================
// WHO AIR QUALITY STANDARDS
// ========================================

export const WHO_PM25_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 5 },
    color: '#10B981', // green-500
    description: 'WHO 2021 Annual guideline (5 µg/m³) - Minimal health risk',
  },
  {
    level: 'Moderate',
    range: { min: 5, max: 15 },
    color: '#F59E0B', // amber-500
    description: 'Above WHO annual but within 24-hour guideline (15 µg/m³)',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 15, max: 25 },
    color: '#EF4444', // red-500
    description:
      'Above WHO 24-hour guideline - sensitive groups may experience health effects',
  },
  {
    level: 'Unhealthy',
    range: { min: 25, max: 35 },
    color: '#8B5CF6', // violet-500
    description: 'Everyone may experience health effects',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 35, max: 75 },
    color: '#DC2626', // red-600
    description: 'Health warnings - emergency conditions',
  },
  {
    level: 'Hazardous',
    range: { min: 75, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Health alert - serious risk to everyone',
  },
];

export const WHO_PM10_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 15 },
    color: '#10B981', // green-500
    description: 'WHO 2021 Annual guideline (15 µg/m³) - Minimal health risk',
  },
  {
    level: 'Moderate',
    range: { min: 15, max: 45 },
    color: '#F59E0B', // amber-500
    description: 'Above WHO annual but within 24-hour guideline (45 µg/m³)',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 45, max: 75 },
    color: '#EF4444', // red-500
    description:
      'Above WHO 24-hour guideline - sensitive groups may experience health effects',
  },
  {
    level: 'Unhealthy',
    range: { min: 75, max: 150 },
    color: '#8B5CF6', // violet-500
    description: 'Everyone may experience health effects',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 150, max: 250 },
    color: '#DC2626', // red-600
    description: 'Health warnings - emergency conditions',
  },
  {
    level: 'Hazardous',
    range: { min: 250, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Health alert - serious risk to everyone',
  },
];

// ========================================
// NEMA UGANDA AIR QUALITY STANDARDS
// ========================================

export const NEMA_PM25_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 12 },
    color: '#10B981', // green-500
    description: 'Well below NEMA annual limit - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 12, max: 25 },
    color: '#F59E0B', // amber-500
    description: 'Within NEMA annual limit (25 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 25, max: 35 },
    color: '#EF4444', // red-500
    description: 'Above NEMA annual but below 24-hour limit',
  },
  {
    level: 'Unhealthy',
    range: { min: 35, max: 50 },
    color: '#8B5CF6', // violet-500
    description: 'Above NEMA 24-hour limit (35 µg/m³)',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 50, max: 100 },
    color: '#DC2626', // red-600
    description: 'Significantly above NEMA limits',
  },
  {
    level: 'Hazardous',
    range: { min: 100, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Extremely high - Health emergency',
  },
];

export const NEMA_PM10_STANDARDS: AirQualityStandard[] = [
  {
    level: 'Good',
    range: { min: 0, max: 20 },
    color: '#10B981', // green-500
    description: 'Well below NEMA annual limit - Good air quality',
  },
  {
    level: 'Moderate',
    range: { min: 20, max: 40 },
    color: '#F59E0B', // amber-500
    description: 'Within NEMA annual limit (40 µg/m³) - Acceptable',
  },
  {
    level: 'Unhealthy for Sensitive Groups',
    range: { min: 40, max: 60 },
    color: '#EF4444', // red-500
    description: 'Above NEMA annual but within 24-hour limit',
  },
  {
    level: 'Unhealthy',
    range: { min: 60, max: 100 },
    color: '#8B5CF6', // violet-500
    description: 'Above NEMA 24-hour limit (60 µg/m³)',
  },
  {
    level: 'Very Unhealthy',
    range: { min: 100, max: 200 },
    color: '#DC2626', // red-600
    description: 'Significantly above NEMA limits',
  },
  {
    level: 'Hazardous',
    range: { min: 200, max: Infinity },
    color: '#7C2D12', // red-900
    description: 'Extremely high - Health emergency',
  },
];

// ========================================
// STANDARD REFERENCE VALUES
// ========================================

/**
 * Standard values for reference lines in charts
 * Using WHO 2021 guidelines and NEMA Uganda standards
 */
export const AQ_STANDARDS: Record<StandardsOrganization, StandardValues> = {
  WHO: {
    pm2_5: 5, // WHO 2021 annual guideline: 5 µg/m³
    pm10: 15, // WHO 2021 annual guideline: 15 µg/m³
  },
  NEMA: {
    pm2_5: 25, // NEMA Uganda annual limit: 25 µg/m³
    pm10: 40, // NEMA Uganda annual limit: 40 µg/m³
  },
} as const;

/**
 * Reference line values for chart components
 */
export const REFERENCE_LINES = {
  WHO: {
    PM25_ANNUAL: 5,
    PM25_24HR: 15,
    PM10_ANNUAL: 15,
    PM10_24HR: 45,
  },
  NEMA: {
    PM25_ANNUAL: 25,
    PM25_24HR: 35,
    PM10_ANNUAL: 40,
    PM10_24HR: 60,
  },
} as const;

// Default standards (WHO PM2.5 for backward compatibility)
export const AIR_QUALITY_STANDARDS = WHO_PM25_STANDARDS;

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get air quality level based on pollutant value and type
 * @param value - Pollutant concentration value
 * @param pollutant - Pollutant type (default: pm2_5)
 * @returns Air quality level
 */
export const getAirQualityLevel = (
  value: number | null | undefined,
  pollutant: PollutantType = 'pm2_5'
): AirQualityLevel => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'no-value';
  }

  // Get the ranges for the specified pollutant
  const pollutantRanges = POLLUTANT_RANGES[pollutant];
  if (!pollutantRanges) {
    return 'no-value';
  }

  // Find the first range where value is greater than or equal to the limit
  const range = pollutantRanges.find(r => value >= r.limit);

  if (!range) {
    return 'no-value';
  }

  // Map category to air quality level names
  const levelMapping: Record<string, AirQualityLevel> = {
    GoodAir: 'good',
    ModerateAir: 'moderate',
    UnhealthyForSensitiveGroups: 'unhealthy-sensitive-groups',
    Unhealthy: 'unhealthy',
    VeryUnhealthy: 'very-unhealthy',
    Hazardous: 'hazardous',
    Invalid: 'no-value',
  };

  return levelMapping[range.category] || 'no-value';
};

/**
 * Get color for air quality level
 * @param level - Air quality level
 * @returns Hex color string
 */
export const getAirQualityColor = (level: AirQualityLevel): string => {
  return AIR_QUALITY_COLORS[level] || AIR_QUALITY_COLORS['no-value'];
};

/**
 * Get icon component for air quality level
 * @param level - Air quality level
 * @returns React component for the icon
 */
export const getAirQualityIcon = (
  level: AirQualityLevel
): ComponentType<{ className?: string }> => {
  return AIR_QUALITY_ICONS[level] || AIR_QUALITY_ICONS['no-value'];
};

/**
 * Get air quality threshold data by level using shared standards
 * @param level - Air quality level
 * @param organization - Standards organization (default: WHO)
 * @param pollutant - Pollutant type (default: PM2.5)
 * @returns Threshold configuration
 */
export const getAirQualityThreshold = (
  level: AirQualityLevel,
  organization: StandardsOrganization = 'WHO',
  pollutant: 'PM2.5' | 'PM10' = 'PM2.5'
): AirQualityStandard | undefined => {
  const levelMapping: Record<AirQualityLevel, string> = {
    good: 'Good',
    moderate: 'Moderate',
    'unhealthy-sensitive-groups': 'Unhealthy for Sensitive Groups',
    unhealthy: 'Unhealthy',
    'very-unhealthy': 'Very Unhealthy',
    hazardous: 'Hazardous',
    'no-value': '',
  };

  const standardLevel = levelMapping[level];

  // Select the appropriate standards based on organization and pollutant
  let standards: AirQualityStandard[];
  if (organization === 'WHO') {
    standards = pollutant === 'PM10' ? WHO_PM10_STANDARDS : WHO_PM25_STANDARDS;
  } else {
    standards =
      pollutant === 'PM10' ? NEMA_PM10_STANDARDS : NEMA_PM25_STANDARDS;
  }

  return standards.find(std => std.level === standardLevel);
};

/**
 * Get human-readable label for air quality level
 * @param level - Air quality level
 * @param organization - Standards organization (default: WHO)
 * @param pollutant - Pollutant type (default: PM2.5)
 * @returns Human readable label
 */
export const getAirQualityLabel = (
  level: AirQualityLevel,
  organization: StandardsOrganization = 'WHO',
  pollutant: 'PM2.5' | 'PM10' = 'PM2.5'
): string => {
  const threshold = getAirQualityThreshold(level, organization, pollutant);
  return threshold?.level || 'No Data';
};

/**
 * Get complete air quality information for a given value
 * @param value - Pollutant concentration value
 * @param pollutant - Pollutant type (default: pm2_5)
 * @param organization - Standards organization (default: WHO)
 * @returns Complete air quality information object
 */
export const getAirQualityInfo = (
  value: number | null | undefined,
  pollutant: PollutantType = 'pm2_5',
  organization: StandardsOrganization = 'WHO'
): AirQualityInfo => {
  const level = getAirQualityLevel(value, pollutant);

  // Map pollutant types to display formats for threshold lookups
  const pollutantDisplayMap: Record<PollutantType, 'PM2.5' | 'PM10'> = {
    pm2_5: 'PM2.5',
    pm10: 'PM10',
    // TODO: Add mappings for additional pollutants when expanded
  };

  const displayType = pollutantDisplayMap[pollutant];

  return {
    level,
    label: getAirQualityLabel(level, organization, displayType),
    icon: getAirQualityIcon(level),
    description: getAirQualityThreshold(level, organization, displayType)
      ?.description,
  };
};

/**
 * Map an incoming `aqi_category` string to the internal AirQualityLevel keys
 * Handles several formatting variants (spaces, camelCase, different naming)
 * @param category - Raw category string from API
 * @returns Standardized air quality level
 */
export const mapAqiCategoryToLevel = (category?: string): AirQualityLevel => {
  if (!category || typeof category !== 'string') return 'no-value';

  const normalized = category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  switch (normalized) {
    case 'good':
    case 'goodair':
      return 'good';
    case 'moderate':
    case 'moderateair':
      return 'moderate';
    case 'unhealthyforsensitivegroups':
    case 'unhealthyforsensitivegroup':
    case 'unhealthyforsensitive':
    case 'unhealthyforsensitivegroups':
      return 'unhealthy-sensitive-groups';
    case 'unhealthy':
      return 'unhealthy';
    case 'veryunhealthy':
    case 'veryunhealthyair':
      return 'very-unhealthy';
    case 'hazardous':
      return 'hazardous';
    case 'invalid':
      return 'no-value';
    default:
      return 'no-value';
  }
};

/**
 * Get standards by organization and pollutant type
 * @param organization - Standards organization
 * @param pollutant - Pollutant type
 * @returns Array of air quality standards
 */
export const getStandardsByType = (
  organization: StandardsOrganization,
  pollutant: 'PM2.5' | 'PM10'
): AirQualityStandard[] => {
  if (organization === 'WHO') {
    return pollutant === 'PM10' ? WHO_PM10_STANDARDS : WHO_PM25_STANDARDS;
  } else {
    return pollutant === 'PM10' ? NEMA_PM10_STANDARDS : NEMA_PM25_STANDARDS;
  }
};

/**
 * Standards organization options for UI components
 */
export const STANDARDS_ORGANIZATIONS = {
  WHO: 'WHO (World Health Organization)',
  NEMA: 'NEMA (Uganda)',
} as const;

/**
 * Pollutant display labels
 */
export const POLLUTANT_LABELS = {
  pm2_5: 'PM₂.₅',
  pm10: 'PM₁₀',
  // TODO: Add labels for additional pollutants when expanded:
  // no2: 'NO₂', o3: 'O₃', co: 'CO', so2: 'SO₂'
} as const;

/**
 * Get pollutant display label
 * @param pollutant - Pollutant type
 * @returns Display label with proper formatting
 */
export const getPollutantLabel = (pollutant: PollutantType): string => {
  return POLLUTANT_LABELS[pollutant] || pollutant.toUpperCase();
};
