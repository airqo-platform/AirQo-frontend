import {
  getAirQualityLevel,
  getAirQualityThreshold,
  mapAqiCategoryToLevel,
  getAirQualityLabel,
  getAirQualityColor,
  formatPMValue,
  generateTrend,
  transformAnalyticsData,
  formatRelativeTime,
  calculateAverageAirQuality,
  normalizeRecentReadingsToSiteData,
} from '../index';
import type {
  AirQualityLevel,
  AnalyticsDataPoint,
  SiteData,
} from '../../types';
import type { RecentReading } from '@/shared/types/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeAnalyticsDataPoint = (
  overrides: Partial<AnalyticsDataPoint> = {}
): AnalyticsDataPoint => ({
  time: '2024-06-01T12:00:00Z',
  site_id: 'site-1',
  site_name: 'Test Site',
  value: 10,
  pollutant: 'pm2_5',
  generated_name: 'Test Generated Name',
  ...overrides,
});

const makeSiteData = (overrides: Partial<SiteData> = {}): SiteData => ({
  _id: 'site-1',
  name: 'Test Site',
  location: 'Test Location',
  value: 10,
  status: 'good',
  pollutant: 'pm2_5',
  unit: 'µg/m³',
  trend: 'stable',
  ...overrides,
});

const makeRecentReading = (
  overrides: Partial<RecentReading> = {}
): RecentReading => ({
  _id: 'reading-1',
  site_id: 'site-1',
  time: '2024-06-01T12:00:00Z',
  __v: 0,
  aqi_category: 'Good',
  aqi_color: '#34C759',
  aqi_color_name: 'green',
  aqi_ranges: {
    good: { min: 0, max: 50 },
    moderate: { min: 51, max: 100 },
    u4sg: { min: 101, max: 150 },
    unhealthy: { min: 151, max: 200 },
    very_unhealthy: { min: 201, max: 300 },
    hazardous: { min: 301, max: null },
  },
  averages: {
    dailyAverage: 10,
    percentageDifference: 0,
    weeklyAverages: { currentWeek: 10, previousWeek: 10 },
  },
  createdAt: '2024-06-01T12:00:00Z',
  device: 'device-1',
  device_id: 'device-1',
  frequency: 'hourly',
  health_tips: [],
  is_reading_primary: true,
  no2: { value: 0 },
  pm10: { value: 15 },
  pm2_5: { value: 10 },
  siteDetails: {
    _id: 'site-1',
    formatted_name: 'Formatted Site',
    street: 'Street',
    parish: 'Parish',
    village: 'Village',
    sub_county: 'Sub County',
    town: 'Town',
    city: 'Kampala',
    district: 'District',
    county: 'County',
    region: 'Region',
    country: 'Uganda',
    name: 'Site Name',
    description: 'Description',
    location_name: 'Location Name',
    search_name: 'Search Name',
    approximate_latitude: 0.3,
    approximate_longitude: 32.6,
    data_provider: 'AirQo',
    site_category: { tags: [], category: 'urban' },
  },
  timeDifferenceHours: 1,
  updatedAt: '2024-06-01T12:00:00Z',
  ...overrides,
});

// ===========================================================================
// getAirQualityLevel
// ===========================================================================

describe('getAirQualityLevel', () => {
  it('returns good for low PM2.5 values', () => {
    expect(getAirQualityLevel(3, 'pm2_5')).toBe('good');
  });

  it('returns moderate for mid-range PM2.5 values', () => {
    expect(getAirQualityLevel(10, 'pm2_5')).toBe('moderate');
  });

  it('returns unhealthy-sensitive-groups for PM2.5 >= 35.5', () => {
    expect(getAirQualityLevel(40, 'pm2_5')).toBe('unhealthy-sensitive-groups');
  });

  it('returns unhealthy for PM2.5 >= 55.5', () => {
    expect(getAirQualityLevel(60, 'pm2_5')).toBe('unhealthy');
  });

  it('returns very-unhealthy for PM2.5 >= 125.5', () => {
    expect(getAirQualityLevel(130, 'pm2_5')).toBe('very-unhealthy');
  });

  it('returns hazardous for PM2.5 >= 225.5', () => {
    expect(getAirQualityLevel(250, 'pm2_5')).toBe('hazardous');
  });

  it('returns good for low PM10 values', () => {
    expect(getAirQualityLevel(10, 'pm10')).toBe('good');
  });

  it('returns moderate for mid-range PM10 values', () => {
    expect(getAirQualityLevel(80, 'pm10')).toBe('moderate');
  });

  it('returns no-value for null value', () => {
    expect(getAirQualityLevel(null)).toBe('no-value');
  });

  it('returns no-value for undefined value', () => {
    expect(getAirQualityLevel(undefined)).toBe('no-value');
  });

  it('returns no-value for NaN', () => {
    expect(getAirQualityLevel(NaN)).toBe('no-value');
  });

  it('defaults pollutant to pm2_5 when omitted', () => {
    expect(getAirQualityLevel(3)).toBe('good');
  });

  it('handles boundary value at good/moderate edge', () => {
    expect(getAirQualityLevel(0, 'pm2_5')).toBe('good');
  });
});

// ===========================================================================
// getAirQualityThreshold
// ===========================================================================

describe('getAirQualityThreshold', () => {
  it('returns threshold config for good level', () => {
    const threshold = getAirQualityThreshold('good');
    expect(threshold).toBeDefined();
    expect(threshold!.level).toBe('Good');
  });

  it('returns threshold config for moderate level', () => {
    const threshold = getAirQualityThreshold('moderate');
    expect(threshold).toBeDefined();
    expect(threshold!.level).toBe('Moderate');
  });

  it('returns threshold config for unhealthy-sensitive-groups', () => {
    const threshold = getAirQualityThreshold('unhealthy-sensitive-groups');
    expect(threshold).toBeDefined();
    expect(threshold!.level).toBe('Unhealthy for Sensitive Groups');
  });

  it('returns threshold config for unhealthy level', () => {
    const threshold = getAirQualityThreshold('unhealthy');
    expect(threshold).toBeDefined();
    expect(threshold!.level).toBe('Unhealthy');
  });

  it('returns threshold config for very-unhealthy level', () => {
    const threshold = getAirQualityThreshold('very-unhealthy');
    expect(threshold).toBeDefined();
    expect(threshold!.level).toBe('Very Unhealthy');
  });

  it('returns threshold config for hazardous level', () => {
    const threshold = getAirQualityThreshold('hazardous');
    expect(threshold).toBeDefined();
    expect(threshold!.level).toBe('Hazardous');
  });

  it('returns undefined for no-value level', () => {
    expect(getAirQualityThreshold('no-value')).toBeUndefined();
  });

  it('returned object contains range property', () => {
    const threshold = getAirQualityThreshold('good');
    expect(threshold).toBeDefined();
    expect(threshold!.range).toBeDefined();
    expect(threshold!.range.min).toBeGreaterThanOrEqual(0);
  });

  it('returned object contains color property', () => {
    const threshold = getAirQualityThreshold('moderate');
    expect(threshold).toBeDefined();
    expect(typeof threshold!.color).toBe('string');
  });
});

// ===========================================================================
// mapAqiCategoryToLevel
// ===========================================================================

describe('mapAqiCategoryToLevel', () => {
  it('maps "Good" to good', () => {
    expect(mapAqiCategoryToLevel('Good')).toBe('good');
  });

  it('maps "good" to good', () => {
    expect(mapAqiCategoryToLevel('good')).toBe('good');
  });

  it('maps "goodair" to good', () => {
    expect(mapAqiCategoryToLevel('goodair')).toBe('good');
  });

  it('maps "Moderate" to moderate', () => {
    expect(mapAqiCategoryToLevel('Moderate')).toBe('moderate');
  });

  it('maps "moderateair" to moderate', () => {
    expect(mapAqiCategoryToLevel('moderateair')).toBe('moderate');
  });

  it('maps "Unhealthy for Sensitive Groups" to unhealthy-sensitive-groups', () => {
    expect(mapAqiCategoryToLevel('Unhealthy for Sensitive Groups')).toBe(
      'unhealthy-sensitive-groups'
    );
  });

  it('maps "unhealthyforsensitivegroups" to unhealthy-sensitive-groups', () => {
    expect(mapAqiCategoryToLevel('unhealthyforsensitivegroups')).toBe(
      'unhealthy-sensitive-groups'
    );
  });

  it('maps "unhealthyforsensitivegroup" to unhealthy-sensitive-groups', () => {
    expect(mapAqiCategoryToLevel('unhealthyforsensitivegroup')).toBe(
      'unhealthy-sensitive-groups'
    );
  });

  it('maps "Unhealthy" to unhealthy', () => {
    expect(mapAqiCategoryToLevel('Unhealthy')).toBe('unhealthy');
  });

  it('maps "Very Unhealthy" to very-unhealthy', () => {
    expect(mapAqiCategoryToLevel('Very Unhealthy')).toBe('very-unhealthy');
  });

  it('maps "veryunhealthyair" to very-unhealthy', () => {
    expect(mapAqiCategoryToLevel('veryunhealthyair')).toBe('very-unhealthy');
  });

  it('maps "Hazardous" to hazardous', () => {
    expect(mapAqiCategoryToLevel('Hazardous')).toBe('hazardous');
  });

  it('maps "Invalid" to no-value', () => {
    expect(mapAqiCategoryToLevel('Invalid')).toBe('no-value');
  });

  it('returns no-value for undefined input', () => {
    expect(mapAqiCategoryToLevel(undefined)).toBe('no-value');
  });

  it('returns no-value for empty string', () => {
    expect(mapAqiCategoryToLevel('')).toBe('no-value');
  });

  it('returns no-value for unrecognized category', () => {
    expect(mapAqiCategoryToLevel('UnknownCategory')).toBe('no-value');
  });

  it('handles categories with mixed case and spaces', () => {
    expect(mapAqiCategoryToLevel('Very Unhealthy')).toBe('very-unhealthy');
  });
});

// ===========================================================================
// getAirQualityLabel
// ===========================================================================

describe('getAirQualityLabel', () => {
  it('returns "Good" for good level', () => {
    expect(getAirQualityLabel('good')).toBe('Good');
  });

  it('returns "Moderate" for moderate level', () => {
    expect(getAirQualityLabel('moderate')).toBe('Moderate');
  });

  it('returns "Unhealthy for Sensitive Groups" for unhealthy-sensitive-groups', () => {
    expect(getAirQualityLabel('unhealthy-sensitive-groups')).toBe(
      'Unhealthy for Sensitive Groups'
    );
  });

  it('returns "Unhealthy" for unhealthy level', () => {
    expect(getAirQualityLabel('unhealthy')).toBe('Unhealthy');
  });

  it('returns "Very Unhealthy" for very-unhealthy level', () => {
    expect(getAirQualityLabel('very-unhealthy')).toBe('Very Unhealthy');
  });

  it('returns "Hazardous" for hazardous level', () => {
    expect(getAirQualityLabel('hazardous')).toBe('Hazardous');
  });

  it('returns "No Data" for no-value level', () => {
    expect(getAirQualityLabel('no-value')).toBe('No Data');
  });
});

// ===========================================================================
// getAirQualityColor
// ===========================================================================

describe('getAirQualityColor', () => {
  it('returns hex color for good level', () => {
    const color = getAirQualityColor('good');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns hex color for moderate level', () => {
    const color = getAirQualityColor('moderate');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns hex color for unhealthy-sensitive-groups', () => {
    const color = getAirQualityColor('unhealthy-sensitive-groups');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns hex color for unhealthy level', () => {
    const color = getAirQualityColor('unhealthy');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns hex color for very-unhealthy level', () => {
    const color = getAirQualityColor('very-unhealthy');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns hex color for hazardous level', () => {
    const color = getAirQualityColor('hazardous');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns hex color for no-value level', () => {
    const color = getAirQualityColor('no-value');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns distinct colors for different levels', () => {
    const levels: AirQualityLevel[] = [
      'good',
      'moderate',
      'unhealthy-sensitive-groups',
      'unhealthy',
      'very-unhealthy',
      'hazardous',
    ];
    const colors = new Set(levels.map(getAirQualityColor));
    expect(colors.size).toBe(levels.length);
  });
});

// ===========================================================================
// formatPMValue
// ===========================================================================

describe('formatPMValue', () => {
  it('formats a numeric value with default unit', () => {
    expect(formatPMValue(10.5)).toBe('10.5 μg/m³');
  });

  it('formats a numeric value with custom unit', () => {
    expect(formatPMValue(10.5, 'ppm')).toBe('10.5 ppm');
  });

  it('formats with one decimal place', () => {
    expect(formatPMValue(12.3456)).toBe('12.3 μg/m³');
  });

  it('formats zero correctly', () => {
    expect(formatPMValue(0)).toBe('0.0 μg/m³');
  });

  it('formats negative values', () => {
    expect(formatPMValue(-5.2)).toBe('-5.2 μg/m³');
  });

  it('returns "No Data" for null', () => {
    expect(formatPMValue(null)).toBe('No Data');
  });

  it('returns "No Data" for undefined', () => {
    expect(formatPMValue(undefined)).toBe('No Data');
  });

  it('returns "No Data" for NaN', () => {
    expect(formatPMValue(NaN)).toBe('No Data');
  });

  it('formats very large numbers', () => {
    expect(formatPMValue(999999.9)).toBe('999999.9 μg/m³');
  });
});

// ===========================================================================
// generateTrend
// ===========================================================================

describe('generateTrend', () => {
  it('returns stable when values are equal', () => {
    expect(generateTrend(10, 10)).toBe('stable');
  });

  it('returns up when current is significantly higher', () => {
    expect(generateTrend(15, 10)).toBe('up');
  });

  it('returns down when current is significantly lower', () => {
    expect(generateTrend(5, 10)).toBe('down');
  });

  it('returns stable when difference is below threshold (0.1)', () => {
    expect(generateTrend(10.05, 10)).toBe('stable');
  });

  it('returns stable when negative difference is below threshold', () => {
    expect(generateTrend(9.95, 10)).toBe('stable');
  });

  it('returns stable when previous is undefined', () => {
    expect(generateTrend(10)).toBe('stable');
  });

  it('returns stable when current is NaN', () => {
    expect(generateTrend(NaN, 10)).toBe('stable');
  });

  it('returns stable when previous is NaN', () => {
    expect(generateTrend(10, NaN)).toBe('stable');
  });

  it('returns up for large increase', () => {
    expect(generateTrend(100, 10)).toBe('up');
  });

  it('returns down for large decrease', () => {
    expect(generateTrend(10, 100)).toBe('down');
  });
});

// ===========================================================================
// transformAnalyticsData
// ===========================================================================

describe('transformAnalyticsData', () => {
  it('transforms a single data point for one site', () => {
    const data = [makeAnalyticsDataPoint()];
    const result = transformAnalyticsData(data);
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe('site-1');
    expect(result[0].value).toBe(10);
    expect(result[0].name).toBeTruthy();
  });

  it('groups multiple points by site_id', () => {
    const data = [
      makeAnalyticsDataPoint({
        site_id: 'site-1',
        value: 10,
        time: '2024-06-01T12:00:00Z',
      }),
      makeAnalyticsDataPoint({
        site_id: 'site-1',
        value: 20,
        time: '2024-06-01T11:00:00Z',
      }),
      makeAnalyticsDataPoint({
        site_id: 'site-2',
        value: 30,
        time: '2024-06-01T12:00:00Z',
      }),
    ];
    const result = transformAnalyticsData(data);
    expect(result).toHaveLength(2);
    const ids = result.map(r => r._id).sort();
    expect(ids).toEqual(['site-1', 'site-2']);
  });

  it('uses latest point (by time) for each site', () => {
    const data = [
      makeAnalyticsDataPoint({
        site_id: 'site-1',
        value: 10,
        time: '2024-06-01T10:00:00Z',
      }),
      makeAnalyticsDataPoint({
        site_id: 'site-1',
        value: 25,
        time: '2024-06-01T12:00:00Z',
      }),
    ];
    const result = transformAnalyticsData(data);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(25);
  });

  it('computes trend as up when previous value is lower', () => {
    const data = [
      makeAnalyticsDataPoint({
        site_id: 'site-1',
        value: 20,
        time: '2024-06-01T12:00:00Z',
      }),
      makeAnalyticsDataPoint({
        site_id: 'site-1',
        value: 10,
        time: '2024-06-01T11:00:00Z',
      }),
    ];
    const result = transformAnalyticsData(data);
    expect(result[0].trend).toBe('up');
  });

  it('computes trend as down when previous value is higher', () => {
    const data = [
      makeAnalyticsDataPoint({
        site_id: 'site-1',
        value: 5,
        time: '2024-06-01T12:00:00Z',
      }),
      makeAnalyticsDataPoint({
        site_id: 'site-1',
        value: 50,
        time: '2024-06-01T11:00:00Z',
      }),
    ];
    const result = transformAnalyticsData(data);
    expect(result[0].trend).toBe('down');
  });

  it('computes trend as stable when only one point exists', () => {
    const data = [makeAnalyticsDataPoint({ site_id: 'site-1', value: 10 })];
    const result = transformAnalyticsData(data);
    expect(result[0].trend).toBe('stable');
  });

  it('returns empty array for null input', () => {
    expect(
      transformAnalyticsData(null as unknown as AnalyticsDataPoint[])
    ).toEqual([]);
  });

  it('returns empty array for undefined input', () => {
    expect(
      transformAnalyticsData(undefined as unknown as AnalyticsDataPoint[])
    ).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(
      transformAnalyticsData('not-an-array' as unknown as AnalyticsDataPoint[])
    ).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(transformAnalyticsData([])).toEqual([]);
  });

  it('sets pollutant with fallback to PM2.5', () => {
    const data = [
      makeAnalyticsDataPoint({ pollutant: null as unknown as string }),
    ];
    const result = transformAnalyticsData(data);
    expect(result[0].pollutant).toBe('PM2.5');
  });

  it('sets unit to µg/m³', () => {
    const data = [makeAnalyticsDataPoint()];
    const result = transformAnalyticsData(data);
    expect(result[0].unit).toBe('μg/m³');
  });

  it('sets location from generated_name', () => {
    const data = [
      makeAnalyticsDataPoint({ generated_name: 'Kampala Station' }),
    ];
    const result = transformAnalyticsData(data);
    expect(result[0].location).toBe('Kampala Station');
  });

  it('uses "Unknown Location" as name when all display fields are empty', () => {
    const data = [
      makeAnalyticsDataPoint({
        site_name: '',
        generated_name: '',
      }),
    ];
    const result = transformAnalyticsData(data);
    expect(result[0].name).toBe('Unknown Location');
  });

  it('handles data with pollutant containing dot (e.g. pm2.5)', () => {
    const data = [makeAnalyticsDataPoint({ pollutant: 'pm2.5' })];
    const result = transformAnalyticsData(data);
    expect(result[0].pollutant).toBe('pm2.5');
  });
});

// ===========================================================================
// formatRelativeTime
// ===========================================================================

describe('formatRelativeTime', () => {
  it('returns a string containing time words for a recent date', () => {
    const recent = new Date(Date.now() - 60 * 1000).toISOString();
    const result = formatRelativeTime(recent);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns "Unknown time" for invalid ISO string', () => {
    expect(formatRelativeTime('not-a-date')).toBe('Unknown time');
  });

  it('returns "Unknown time" for empty string', () => {
    expect(formatRelativeTime('')).toBe('Unknown time');
  });

  it('returns a relative string for a date in the past', () => {
    const past = new Date(Date.now() - 3600 * 1000).toISOString();
    const result = formatRelativeTime(past);
    expect(result).toContain('ago');
  });

  it('handles a date far in the past', () => {
    const farPast = new Date('2020-01-01T00:00:00Z').toISOString();
    const result = formatRelativeTime(farPast);
    expect(result).toContain('ago');
  });
});

// ===========================================================================
// calculateAverageAirQuality
// ===========================================================================

describe('calculateAverageAirQuality', () => {
  it('calculates average value for valid sites', () => {
    const sites = [
      makeSiteData({ value: 10 }),
      makeSiteData({ value: 20 }),
      makeSiteData({ value: 30 }),
    ];
    const result = calculateAverageAirQuality(sites);
    expect(result.averageValue).toBe(20);
    expect(result.count).toBe(3);
    expect(result.level).toBe('moderate');
  });

  it('returns no-value when all sites have null values', () => {
    const sites = [
      makeSiteData({ value: null as unknown as number }),
      makeSiteData({ value: null as unknown as number }),
    ];
    const result = calculateAverageAirQuality(sites);
    expect(result.averageValue).toBeNull();
    expect(result.level).toBe('no-value');
    expect(result.count).toBe(0);
  });

  it('returns no-value when all sites have undefined values', () => {
    const sites = [makeSiteData({ value: undefined as unknown as number })];
    const result = calculateAverageAirQuality(sites);
    expect(result.averageValue).toBeNull();
    expect(result.level).toBe('no-value');
    expect(result.count).toBe(0);
  });

  it('returns no-value when all sites have NaN values', () => {
    const sites = [makeSiteData({ value: NaN })];
    const result = calculateAverageAirQuality(sites);
    expect(result.averageValue).toBeNull();
    expect(result.level).toBe('no-value');
    expect(result.count).toBe(0);
  });

  it('filters out invalid sites and averages the rest', () => {
    const sites = [
      makeSiteData({ value: 10 }),
      makeSiteData({ value: NaN }),
      makeSiteData({ value: 30 }),
      makeSiteData({ value: null as unknown as number }),
    ];
    const result = calculateAverageAirQuality(sites);
    expect(result.averageValue).toBe(20);
    expect(result.count).toBe(2);
  });

  it('returns count 0 for empty array', () => {
    const result = calculateAverageAirQuality([]);
    expect(result.averageValue).toBeNull();
    expect(result.level).toBe('no-value');
    expect(result.count).toBe(0);
  });

  it('handles single site', () => {
    const sites = [makeSiteData({ value: 42 })];
    const result = calculateAverageAirQuality(sites);
    expect(result.averageValue).toBe(42);
    expect(result.count).toBe(1);
  });

  it('uses provided pollutant parameter for level calculation', () => {
    const sites = [makeSiteData({ value: 30 })];
    const result = calculateAverageAirQuality(sites, 'pm10');
    expect(result.level).toBe('good');
  });
});

// ===========================================================================
// normalizeRecentReadingsToSiteData
// ===========================================================================

describe('normalizeRecentReadingsToSiteData', () => {
  it('returns empty array for null input', () => {
    expect(
      normalizeRecentReadingsToSiteData(null as unknown as RecentReading[])
    ).toEqual([]);
  });

  it('returns empty array for undefined input', () => {
    expect(
      normalizeRecentReadingsToSiteData(undefined as unknown as RecentReading[])
    ).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(
      normalizeRecentReadingsToSiteData(
        'not-an-array' as unknown as RecentReading[]
      )
    ).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(normalizeRecentReadingsToSiteData([])).toEqual([]);
  });

  it('normalizes a single reading with pm2_5 active', () => {
    const reading = makeRecentReading({
      pm2_5: { value: 25 },
    });
    const result = normalizeRecentReadingsToSiteData([reading], 'pm2_5');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(25);
    expect(result[0].pollutant).toBe('pm2_5');
    expect(result[0].unit).toBe('μg/m³');
  });

  it('normalizes a single reading with pm10 active', () => {
    const reading = makeRecentReading({
      pm10: { value: 50 },
    });
    const result = normalizeRecentReadingsToSiteData([reading], 'pm10');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(50);
    expect(result[0].pollutant).toBe('pm10');
  });

  it('defaults activePollutant to pm2_5', () => {
    const reading = makeRecentReading({ pm2_5: { value: 15 } });
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].pollutant).toBe('pm2_5');
    expect(result[0].value).toBe(15);
  });

  it('sets value to 0 when pollutant value is null', () => {
    const reading = makeRecentReading({ pm2_5: { value: null } });
    const result = normalizeRecentReadingsToSiteData([reading], 'pm2_5');
    expect(result[0].value).toBe(0);
  });

  it('sets value to 0 when pollutant value is NaN', () => {
    const reading = makeRecentReading({ pm2_5: { value: NaN } });
    const result = normalizeRecentReadingsToSiteData([reading], 'pm2_5');
    expect(result[0].value).toBe(0);
  });

  it('sets value to 0 when pollutant value is Infinity', () => {
    const reading = makeRecentReading({ pm2_5: { value: Infinity } });
    const result = normalizeRecentReadingsToSiteData([reading], 'pm2_5');
    expect(result[0].value).toBe(0);
  });

  it('sets status to no-value when pollutant value is invalid', () => {
    const reading = makeRecentReading({ pm2_5: { value: null } });
    const result = normalizeRecentReadingsToSiteData([reading], 'pm2_5');
    expect(result[0].status).toBe('no-value');
  });

  it('sets status to correct level when pollutant value is valid', () => {
    const reading = makeRecentReading({ pm2_5: { value: 3 } });
    const result = normalizeRecentReadingsToSiteData([reading], 'pm2_5');
    expect(result[0].status).toBe('good');
  });

  it('sets trend up when percentageDifference is positive', () => {
    const reading = makeRecentReading({
      averages: {
        dailyAverage: 10,
        percentageDifference: 15,
        weeklyAverages: { currentWeek: 10, previousWeek: 8 },
      },
    });
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].trend).toBe('up');
  });

  it('sets trend down when percentageDifference is negative', () => {
    const reading = makeRecentReading({
      averages: {
        dailyAverage: 10,
        percentageDifference: -15,
        weeklyAverages: { currentWeek: 10, previousWeek: 12 },
      },
    });
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].trend).toBe('down');
  });

  it('sets trend stable when percentageDifference is zero', () => {
    const reading = makeRecentReading({
      averages: {
        dailyAverage: 10,
        percentageDifference: 0,
        weeklyAverages: { currentWeek: 10, previousWeek: 10 },
      },
    });
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].trend).toBe('stable');
  });

  it('sets trend stable when averages is undefined', () => {
    const reading = makeRecentReading({
      averages: undefined as unknown as RecentReading['averages'],
    });
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].trend).toBe('stable');
  });

  it('uses siteDetails.search_name as display name', () => {
    const reading = makeRecentReading();
    reading.siteDetails.search_name = 'Kampala Central';
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].name).toBe('Kampala Central');
  });

  it('falls back to siteDetails.name when search_name is empty', () => {
    const reading = makeRecentReading();
    reading.siteDetails.search_name = '';
    reading.siteDetails.name = 'Fallback Name';
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].name).toBe('Fallback Name');
  });

  it('falls back to siteDetails.location_name when name is empty', () => {
    const reading = makeRecentReading();
    reading.siteDetails.search_name = '';
    reading.siteDetails.name = '';
    reading.siteDetails.location_name = 'Location Fallback';
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].name).toBe('Location Fallback');
  });

  it('falls back to siteDetails.formatted_name when location_name is empty', () => {
    const reading = makeRecentReading();
    reading.siteDetails.search_name = '';
    reading.siteDetails.name = '';
    reading.siteDetails.location_name = '';
    reading.siteDetails.formatted_name = 'Formatted Fallback';
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].name).toBe('Formatted Fallback');
  });

  it('falls back to "Unknown Location" when all name fields are empty', () => {
    const reading = makeRecentReading();
    reading.siteDetails.search_name = '';
    reading.siteDetails.name = '';
    reading.siteDetails.location_name = '';
    reading.siteDetails.formatted_name = '';
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].name).toBe('Unknown Location');
  });

  it('uses country from siteDetails as location', () => {
    const reading = makeRecentReading();
    reading.siteDetails.country = 'Kenya';
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].location).toBe('Kenya');
  });

  it('falls back to "Unknown Country" when country is empty', () => {
    const reading = makeRecentReading();
    reading.siteDetails.country = '';
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].location).toBe('Unknown Country');
  });

  it('uses site_id as _id when siteDetails._id is missing', () => {
    const reading = makeRecentReading();
    reading.siteDetails = undefined as unknown as RecentReading['siteDetails'];
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0]._id).toBe('site-1');
  });

  it('includes aqi_category from the reading', () => {
    const reading = makeRecentReading({ aqi_category: 'Moderate' });
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].aqi_category).toBe('Moderate');
  });

  it('includes percentageDifference in output', () => {
    const reading = makeRecentReading({
      averages: {
        dailyAverage: 10,
        percentageDifference: 5.5,
        weeklyAverages: { currentWeek: 10, previousWeek: 9.5 },
      },
    });
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].percentageDifference).toBe(5.5);
  });

  it('sets percentageDifference to 0 when averages is undefined', () => {
    const reading = makeRecentReading({
      averages: undefined as unknown as RecentReading['averages'],
    });
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].percentageDifference).toBe(0);
  });

  it('normalizes multiple readings', () => {
    const readings = [
      makeRecentReading({ site_id: 'site-1', pm2_5: { value: 5 } }),
      makeRecentReading({ site_id: 'site-2', pm2_5: { value: 15 } }),
      makeRecentReading({ site_id: 'site-3', pm2_5: { value: 80 } }),
    ];
    const result = normalizeRecentReadingsToSiteData(readings);
    expect(result).toHaveLength(3);
    expect(result[0].status).toBe('good');
    expect(result[1].status).toBe('moderate');
    expect(result[2].status).toBe('unhealthy');
  });

  it('includes city and region from siteDetails when present', () => {
    const reading = makeRecentReading();
    reading.siteDetails.city = 'Nairobi';
    reading.siteDetails.region = 'Nairobi County';
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].city).toBe('Nairobi');
    expect(result[0].region).toBe('Nairobi County');
  });

  it('includes country field in output', () => {
    const reading = makeRecentReading();
    reading.siteDetails.country = 'Uganda';
    const result = normalizeRecentReadingsToSiteData([reading]);
    expect(result[0].country).toBe('Uganda');
  });
});
