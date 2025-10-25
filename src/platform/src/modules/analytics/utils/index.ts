import type { AirQualityLevel, SiteData, AnalyticsDataPoint } from '../types';
import {
  normalizeAirQualityData,
  groupDataBySite,
  convertToMultiSeriesFormat,
  calculateDataStats,
  filterDataByDateRange,
  aggregateDataByInterval,
  formatTimestamp,
  formatTimestampByFrequency,
  getPollutantLabel,
  getPollutantUnits,
} from '@/shared/components/charts/utils';
import {
  AIR_QUALITY_STANDARDS,
  POLLUTANT_RANGES,
} from '@/shared/components/charts/constants';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { RecentReading } from '@/shared/types/api';

// Re-export shared utilities for convenience
export {
  normalizeAirQualityData,
  groupDataBySite,
  convertToMultiSeriesFormat,
  calculateDataStats,
  filterDataByDateRange,
  aggregateDataByInterval,
  formatTimestamp,
  formatTimestampByFrequency,
  getPollutantLabel,
  getPollutantUnits,
};

/**
 * Determine air quality level based on pollutant value using shared ranges
 * @param value - Pollutant concentration value
 * @param pollutant - Pollutant type (pm2_5, pm10, no2, o3, co, so2)
 * @returns Air quality level
 */
export const getAirQualityLevel = (
  value: number | null | undefined,
  pollutant: string = 'pm2_5'
): AirQualityLevel => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'no-value';
  }

  // Get the ranges for the specified pollutant
  const pollutantRanges =
    POLLUTANT_RANGES[pollutant as keyof typeof POLLUTANT_RANGES];
  if (!pollutantRanges) {
    return 'no-value';
  }

  // Find the first range where value is greater than or equal to the limit
  const range = pollutantRanges.find(r => value >= r.limit);

  if (!range) {
    return 'no-value';
  }

  // Map category to analytics level names
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
 * Get air quality threshold data by level using shared standards
 * @param level - Air quality level
 * @returns Threshold configuration
 */
export const getAirQualityThreshold = (level: AirQualityLevel) => {
  const levelMapping: Record<AirQualityLevel, string> = {
    good: 'Good',
    moderate: 'Moderate',
    'unhealthy-sensitive-groups': 'Unhealthy for Sensitive Groups',
    unhealthy: 'Unhealthy',
    'very-unhealthy': 'Very Unhealthy',
    hazardous: 'Hazardous',
    'no-value': '',
  };

  return AIR_QUALITY_STANDARDS.find(std => std.level === levelMapping[level]);
};

/**
 * Map an incoming `aqi_category` string to the internal AirQualityLevel keys
 * Handles several formatting variants (spaces, camelCase, different naming)
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
    case 'unhealthyforsensitivegroupS':
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
 * Get label for air quality level using shared standards
 * @param level - Air quality level
 * @returns Human readable label
 */
export const getAirQualityLabel = (level: AirQualityLevel): string => {
  const threshold = getAirQualityThreshold(level);
  return threshold?.level || 'No Data';
};

/**
 * Get color for air quality level
 * @param level - Air quality level
 * @returns Hex color string
 */
export const getAirQualityColor = (level: AirQualityLevel): string => {
  const colorMapping: Record<AirQualityLevel, string> = {
    good: '#10B981', // green-500
    moderate: '#F59E0B', // amber-500
    'unhealthy-sensitive-groups': '#EF4444', // red-500
    unhealthy: '#8B5CF6', // violet-500
    'very-unhealthy': '#DC2626', // red-600
    hazardous: '#7C2D12', // red-900
    'no-value': '#9ca3af', // gray-400
  };

  return colorMapping[level] || '#9ca3af';
};

/**
 * Format PM2.5 value for display
 * @param value - PM2.5 concentration value
 * @param unit - Unit string (default: "μg/m³")
 * @returns Formatted string
 */
export const formatPMValue = (
  value: number | null | undefined,
  unit: string = 'μg/m³'
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'No Data';
  }

  return `${value.toFixed(2)} ${unit}`;
};

/**
 * Generate trend indicator based on values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Trend direction
 */
export const generateTrend = (
  current: number,
  previous?: number
): 'up' | 'down' | 'stable' => {
  if (!previous || isNaN(previous) || isNaN(current)) {
    return 'stable';
  }

  const difference = current - previous;
  const threshold = 0.1; // 0.1 μg/m³ threshold

  if (difference > threshold) return 'up';
  if (difference < -threshold) return 'down';
  return 'stable';
};

/**
 * Transform analytics API data to site data format
 * @param apiData - Raw analytics data from API
 * @returns Transformed site data array
 */
export const transformAnalyticsData = (
  apiData: AnalyticsDataPoint[]
): SiteData[] => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }

  // Group data by site
  const siteGroups = apiData.reduce(
    (acc, point) => {
      const siteId = point.site_id;
      if (!acc[siteId]) {
        acc[siteId] = [];
      }
      acc[siteId].push(point);
      return acc;
    },
    {} as Record<string, AnalyticsDataPoint[]>
  );

  // Transform each site group to SiteData
  return Object.entries(siteGroups).map(([siteId, points]) => {
    // Sort by time to get latest value
    const sortedPoints = points.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const latestPoint = sortedPoints[0];
    const previousPoint = sortedPoints[1];

    const level = getAirQualityLevel(
      latestPoint.value,
      latestPoint.pollutant?.toLowerCase().replace('.', '_') || 'pm2_5'
    );
    const trend = generateTrend(latestPoint.value, previousPoint?.value);

    return {
      _id: siteId,
      name:
        latestPoint.site_name || latestPoint.generated_name || `Site ${siteId}`,
      location: latestPoint.generated_name || 'Unknown Location',
      value: latestPoint.value,
      status: level,
      pollutant: latestPoint.pollutant || 'PM2.5',
      unit: 'μg/m³',
      trend,
    };
  });
};

/**
 * Format relative time from ISO string
 * @param isoString - ISO date string
 * @returns Human readable relative time
 */
export const formatRelativeTime = (isoString: string): string => {
  try {
    const date = parseISO(isoString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
};

/**
 * Calculate average air quality for multiple sites
 * @param sites - Array of site data
 * @param pollutant - Pollutant type to use for level calculation
 * @returns Average air quality information
 */
export const calculateAverageAirQuality = (
  sites: SiteData[],
  pollutant: string = 'pm2_5'
) => {
  const validSites = sites.filter(
    site =>
      site.value !== null && site.value !== undefined && !isNaN(site.value)
  );

  if (validSites.length === 0) {
    return {
      averageValue: null,
      level: 'no-value' as AirQualityLevel,
      count: 0,
    };
  }

  const averageValue =
    validSites.reduce((sum, site) => sum + site.value, 0) / validSites.length;
  const level = getAirQualityLevel(averageValue, pollutant);

  return {
    averageValue,
    level,
    count: validSites.length,
  };
};

/**
 * Normalize recent readings data to SiteData format for analytics cards
 * @param measurements - Array of recent readings from API
 * @param activePollutant - Active pollutant to display ('pm2_5' or 'pm10')
 * @returns Array of normalized SiteData
 */
export const normalizeRecentReadingsToSiteData = (
  measurements: RecentReading[],
  activePollutant: 'pm2_5' | 'pm10' = 'pm2_5'
): SiteData[] => {
  if (!measurements || !Array.isArray(measurements)) {
    return [];
  }

  return measurements.map(measurement => {
    const { siteDetails, averages, pm2_5, pm10 } = measurement;

    // Get value based on active pollutant
    const pollutantValue =
      activePollutant === 'pm2_5' ? pm2_5?.value : pm10?.value;
    const value =
      pollutantValue !== null && pollutantValue !== undefined
        ? pollutantValue
        : 0;

    // Determine trend based on percentage difference
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (averages?.percentageDifference > 0) {
      trend = 'up';
    } else if (averages?.percentageDifference < 0) {
      trend = 'down';
    }

    // Get air quality level
    const status = getAirQualityLevel(value, activePollutant);

    return {
      _id: siteDetails?._id || measurement.site_id,
      name: siteDetails?.name || siteDetails?.formatted_name || 'Unknown Site',
      location: siteDetails?.country || 'Unknown Country',
      value,
      status,
      pollutant: activePollutant,
      unit: 'μg/m³',
      trend,
      // Add additional data for tooltip
      percentageDifference: averages?.percentageDifference || 0,
    };
  }) as SiteData[];
};
