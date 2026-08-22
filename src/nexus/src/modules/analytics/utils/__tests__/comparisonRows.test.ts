import type { RecentReading } from '@/shared/types/api';
import {
  buildComparisonRow,
  buildEmptyComparisonRow,
  formatLastReading,
  getFreshnessLabel,
  normalizeAqiColor,
  roundPollutantValue,
  sortComparisonRows,
} from '../comparisonRows';

const makeReading = (overrides: Partial<RecentReading> = {}): RecentReading =>
  ({
    _id: 'reading-1',
    site_id: 'site-1',
    time: '2026-08-22T09:05:00Z',
    __v: 0,
    aqi_category: 'Moderate',
    aqi_color: 'ECAA06',
    aqi_color_name: 'yellow',
    aqi_index: 72,
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
    createdAt: '2026-08-22T09:05:00Z',
    device: 'device-1',
    device_id: 'device-1',
    frequency: 'hourly',
    health_tips: [],
    is_reading_primary: true,
    no2: { value: 3.45 },
    pm10: { value: 15 },
    pm2_5: { value: 12.34 },
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
      site_category: { tags: [], category: 'Reference' },
    },
    timeDifferenceHours: 2,
    updatedAt: '2026-08-22T09:05:00Z',
    ...overrides,
  }) as RecentReading;

describe('normalizeAqiColor', () => {
  it('prepends # to bare hex values from the API', () => {
    expect(normalizeAqiColor('ECAA06')).toBe('#ECAA06');
  });

  it('passes values that already carry a # straight through', () => {
    expect(normalizeAqiColor('#34C759')).toBe('#34C759');
  });

  it('returns null for empty/whitespace values', () => {
    expect(normalizeAqiColor('')).toBeNull();
    expect(normalizeAqiColor('   ')).toBeNull();
    expect(normalizeAqiColor(undefined)).toBeNull();
    expect(normalizeAqiColor(null)).toBeNull();
  });
});

describe('roundPollutantValue', () => {
  it('rounds to one decimal', () => {
    expect(roundPollutantValue(12.34)).toBe(12.3);
    expect(roundPollutantValue(3.45)).toBe(3.5);
    expect(roundPollutantValue(15)).toBe(15);
  });

  it('maps non-finite and missing values to null', () => {
    expect(roundPollutantValue(null)).toBeNull();
    expect(roundPollutantValue(undefined)).toBeNull();
    expect(roundPollutantValue(Number.NaN)).toBeNull();
    expect(roundPollutantValue(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('getFreshnessLabel', () => {
  it('buckets hours into <1h / Xh / Xd', () => {
    expect(getFreshnessLabel(0.4)).toBe('<1h ago');
    expect(getFreshnessLabel(1)).toBe('1h ago');
    expect(getFreshnessLabel(2)).toBe('2h ago');
    expect(getFreshnessLabel(23.9)).toBe('23h ago');
    expect(getFreshnessLabel(24)).toBe('1d ago');
    expect(getFreshnessLabel(50)).toBe('2d ago');
  });

  it('returns "No reading" for absent or invalid ages', () => {
    expect(getFreshnessLabel(null)).toBe('No reading');
    expect(getFreshnessLabel(undefined)).toBe('No reading');
    expect(getFreshnessLabel(Number.NaN)).toBe('No reading');
    expect(getFreshnessLabel(-3)).toBe('No reading');
  });
});

describe('formatLastReading', () => {
  it('formats a valid ISO timestamp as local HH:MM · MMM D', () => {
    // Constructed in local time so the assertion is timezone-independent.
    const local = new Date(2026, 7, 22, 14, 5);
    const label = formatLastReading(local.toISOString());
    expect(label).toMatch(/^14:05 · Aug 22$/);
  });

  it('returns an em dash for missing or invalid timestamps', () => {
    expect(formatLastReading(null)).toBe('—');
    expect(formatLastReading('not-a-date')).toBe('—');
  });
});

describe('buildComparisonRow', () => {
  it('maps a reading into a display row with normalized color and rounded values', () => {
    const row = buildComparisonRow(makeReading());
    expect(row.siteId).toBe('site-1');
    expect(row.siteName).toBe('Search Name');
    expect(row.hasReading).toBe(true);
    expect(row.aqiIndex).toBe(72);
    expect(row.aqiColor).toBe('#ECAA06');
    expect(row.aqiCategory).toBe('yellow');
    expect(row.pm2_5).toBe(12.3);
    expect(row.pm10).toBe(15);
    expect(row.no2).toBe(3.5);
    expect(row.freshnessLabel).toBe('2h ago');
    expect(row.lastReadingLabel).not.toBe('—');
  });

  it('falls back through the AQI category chain and handles null pollutant values', () => {
    const row = buildComparisonRow(
      makeReading({
        aqi_color_name: '',
        pm2_5: { value: null },
        no2: { value: null },
      })
    );
    expect(row.aqiCategory).toBe('Moderate');
    expect(row.pm2_5).toBeNull();
    expect(row.no2).toBeNull();
  });
});

describe('buildEmptyComparisonRow', () => {
  it('produces an honest no-data row', () => {
    const row = buildEmptyComparisonRow('site-x', 'Unknown Site');
    expect(row.hasReading).toBe(false);
    expect(row.aqiIndex).toBeNull();
    expect(row.aqiColor).toBeNull();
    expect(row.pm2_5).toBeNull();
    expect(row.pm10).toBeNull();
    expect(row.no2).toBeNull();
    expect(row.lastReadingLabel).toBe('—');
    expect(row.freshnessLabel).toBe('No reading');
  });
});

describe('sortComparisonRows', () => {
  const rows = [
    buildComparisonRow(makeReading({ site_id: 'a', aqi_index: 40 })),
    buildComparisonRow(makeReading({ site_id: 'b', aqi_index: 90 })),
    buildEmptyComparisonRow('c', 'Charlie'),
  ];

  it('defaults to worst-AQI-first with no-reading rows last', () => {
    const sorted = sortComparisonRows(rows);
    expect(sorted.map(row => row.siteId)).toEqual(['b', 'a', 'c']);
  });

  it('supports ascending order without losing no-data rows at the bottom', () => {
    const sorted = sortComparisonRows(rows, 'aqi', 'asc');
    expect(sorted.map(row => row.siteId)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by name alphabetically', () => {
    const byName = [
      buildEmptyComparisonRow('z', 'Zeta'),
      buildEmptyComparisonRow('a', 'Alpha'),
    ];
    expect(
      sortComparisonRows(byName, 'name', 'asc').map(r => r.siteId)
    ).toEqual(['a', 'z']);
  });

  it('does not mutate the input array', () => {
    const input = [...rows];
    sortComparisonRows(input);
    expect(input.map(row => row.siteId)).toEqual(['a', 'b', 'c']);
  });
});
