import type { ComparisonSiteReading, RecentReading } from '@/shared/types/api';
import {
  buildComparisonRow,
  buildEmptyComparisonRow,
  formatLastReading,
  getComparisonSiteDisplayName,
  getFreshnessLabel,
  mapComparisonSiteReadingToRecentReading,
  mergeComparisonReadings,
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

describe('mapComparisonSiteReadingToRecentReading', () => {
  const makeReading = (
    overrides: Partial<ComparisonSiteReading> = {}
  ): ComparisonSiteReading => ({
    site_id: 'site-1',
    site: {
      name: 'Kampala Site',
      location_name: 'Kampala',
      city: 'Kampala',
      country: 'Uganda',
      latitude: 0.3,
      longitude: 32.6,
    },
    has_reading: true,
    time: '2026-08-22T09:05:00Z',
    time_difference_hours: 2,
    aqi: {
      index: 72,
      category: 'Moderate',
      color_name: 'yellow',
      color: 'ECAA06',
    },
    pollutants: {
      pm2_5: { value: 12.3 },
      pm10: { value: 15 },
      no2: { value: 3 },
    },
    ...overrides,
  });

  it('maps a full reading to every RecentReading field', () => {
    const reading = makeReading();
    const result = mapComparisonSiteReadingToRecentReading(reading);

    expect(result.site_id).toBe('site-1');
    expect(result._id).toBe('site-1');
    expect(result.time).toBe('2026-08-22T09:05:00Z');
    expect(result.timeDifferenceHours).toBe(2);
    expect(result.aqi_index).toBe(72);
    expect(result.aqi_color).toBe('ECAA06');
    expect(result.aqi_color_name).toBe('yellow');
    expect(result.aqi_category).toBe('Moderate');
    expect(result.pm2_5).toEqual({ value: 12.3 });
    expect(result.pm10).toEqual({ value: 15 });
    expect(result.no2).toEqual({ value: 3 });
    expect(result.siteDetails.search_name).toBe('');
    expect(result.siteDetails.city).toBe('Kampala');
    expect(result.siteDetails.country).toBe('Uganda');
    expect(result.siteDetails.approximate_latitude).toBe(0.3);
    expect(result.siteDetails.approximate_longitude).toBe(32.6);
  });

  it('maps a has_reading:false entry (null aqi/pollutants) to null-ish fields without throwing', () => {
    const reading = makeReading({
      has_reading: false,
      time: null,
      time_difference_hours: null,
      aqi: null,
      pollutants: null,
    });
    const result = mapComparisonSiteReadingToRecentReading(reading);

    expect(result.site_id).toBe('site-1');
    expect(result.time).toBe('');
    expect(result.timeDifferenceHours).toBe(0);
    expect(result.aqi_index).toBe(0);
    expect(result.aqi_color).toBe('');
    expect(result.aqi_color_name).toBe('');
    expect(result.aqi_category).toBe('');
    expect(result.pm2_5).toEqual({ value: null });
    expect(result.pm10).toEqual({ value: null });
    expect(result.no2).toEqual({ value: null });
    // siteDetails still populated from the non-null site object.
    expect(result.siteDetails.search_name).toBe('');
  });

  it('handles a null site object with empty siteDetails strings', () => {
    const reading = makeReading({ site: null });
    const result = mapComparisonSiteReadingToRecentReading(reading);

    expect(result.site_id).toBe('site-1');
    expect(result.siteDetails.search_name).toBe('');
    expect(result.siteDetails.city).toBe('');
    expect(result.siteDetails.country).toBe('');
    expect(result.siteDetails.approximate_latitude).toBe(0);
    expect(result.siteDetails.approximate_longitude).toBe(0);
  });
});

describe('getComparisonSiteDisplayName', () => {
  const makeSiteDetails = (
    overrides: Partial<{
      _id: string;
      name: string;
      location_name: string;
      search_name: string;
      formatted_name: string;
    }> = {}
  ) =>
    ({
      _id: 'site-1',
      formatted_name: '',
      street: '',
      parish: '',
      village: '',
      sub_county: '',
      town: '',
      city: '',
      district: '',
      county: '',
      region: '',
      country: '',
      name: '3rd Street, Ibex Hill',
      description: '',
      location_name: 'Lusaka Central, Zambia',
      search_name: '3rd Street, Ibex Hill',
      approximate_latitude: 0,
      approximate_longitude: 0,
      data_provider: '',
      site_category: { tags: [], category: '' },
      ...overrides,
    }) as RecentReading['siteDetails'];

  it('prefers search_name (via getSiteDisplayName) over location_name', () => {
    const result = getComparisonSiteDisplayName(makeSiteDetails());
    expect(result).toBe('3rd Street, Ibex Hill');
  });

  it('falls back to name when location_name is empty', () => {
    const result = getComparisonSiteDisplayName(
      makeSiteDetails({ location_name: '' })
    );
    expect(result).toBe('3rd Street, Ibex Hill');
  });

  it('falls back to shared getSiteDisplayName then _id when location_name is empty', () => {
    const result = getComparisonSiteDisplayName(
      makeSiteDetails({ location_name: '', name: '', search_name: '' })
    );
    // getSiteDisplayName returns 'Unknown Location' as its final fallback
    expect(result).toBe('Unknown Location');
  });

  it('returns empty string for null/undefined siteDetails', () => {
    expect(getComparisonSiteDisplayName(null)).toBe('');
    expect(getComparisonSiteDisplayName(undefined)).toBe('');
  });
});

describe('buildComparisonRow via mapComparisonSiteReadingToRecentReading', () => {
  const makeComparisonSiteReading = (
    overrides: Partial<ComparisonSiteReading> = {}
  ): ComparisonSiteReading => ({
    site_id: 'site-nr',
    site: {
      name: 'No Reading Site',
      location_name: 'Kampala',
      city: 'Kampala',
      country: 'Uganda',
      latitude: 0.3,
      longitude: 32.6,
    },
    has_reading: false,
    time: null,
    time_difference_hours: null,
    aqi: null,
    pollutants: null,
    ...overrides,
  });

  it('renders honest no-reading row when has_reading is false', () => {
    const mapped = mapComparisonSiteReadingToRecentReading(
      makeComparisonSiteReading()
    );
    const row = buildComparisonRow(mapped);
    expect(row.hasReading).toBe(false);
    expect(row.aqiIndex).toBeNull();
    expect(row.freshnessLabel).toBe('No reading');
    expect(row.lastReadingLabel).toBe('—');
    expect(row.siteId).toBe('site-nr');
  });

  it('renders real reading row when has_reading is true with valid data', () => {
    const mapped = mapComparisonSiteReadingToRecentReading(
      makeComparisonSiteReading({
        has_reading: true,
        time: '2026-08-22T09:05:00Z',
        time_difference_hours: 0.5,
        aqi: {
          index: 72,
          category: 'Moderate',
          color_name: 'yellow',
          color: 'ECAA06',
        },
        pollutants: {
          pm2_5: { value: 12.3 },
          pm10: { value: 15 },
          no2: { value: 3 },
        },
      })
    );
    const row = buildComparisonRow(mapped);
    expect(row.hasReading).toBe(true);
    expect(row.aqiIndex).toBe(72);
    expect(row.freshnessLabel).toBe('<1h ago');
    expect(row.lastReadingLabel).not.toBe('—');
    expect(row.siteId).toBe('site-nr');
  });
});

describe('buildComparisonRow with location_name', () => {
  it('uses search_name as siteName when present (search_name wins over location_name)', () => {
    const reading = makeReading({
      siteDetails: {
        _id: 'site-1',
        formatted_name: '',
        street: '',
        parish: '',
        village: '',
        sub_county: '',
        town: '',
        city: 'Kampala',
        district: '',
        county: '',
        region: '',
        country: 'Uganda',
        name: '3rd Street, Ibex Hill',
        description: '',
        location_name: 'Lusaka Central, Zambia',
        search_name: '3rd Street, Ibex Hill',
        approximate_latitude: 0.3,
        approximate_longitude: 32.6,
        data_provider: 'AirQo',
        site_category: { tags: [], category: 'Reference' },
      },
    });
    const row = buildComparisonRow(reading);
    expect(row.siteName).toBe('3rd Street, Ibex Hill');
  });

  it('uses location_name as siteName when search_name is empty', () => {
    const reading = makeReading({
      siteDetails: {
        _id: 'site-1',
        formatted_name: '',
        street: '',
        parish: '',
        village: '',
        sub_county: '',
        town: '',
        city: 'Kampala',
        district: '',
        county: '',
        region: '',
        country: 'Uganda',
        name: '3rd Street, Ibex Hill',
        description: '',
        location_name: 'Lusaka Central, Zambia',
        search_name: '',
        approximate_latitude: 0.3,
        approximate_longitude: 32.6,
        data_provider: 'AirQo',
        site_category: { tags: [], category: 'Reference' },
      },
    });
    const row = buildComparisonRow(reading);
    expect(row.siteName).toBe('Lusaka Central, Zambia');
  });

  it('uses name as siteName when both search_name and location_name are empty', () => {
    const reading = makeReading({
      siteDetails: {
        _id: 'site-1',
        formatted_name: '',
        street: '',
        parish: '',
        village: '',
        sub_county: '',
        town: '',
        city: 'Kampala',
        district: '',
        county: '',
        region: '',
        country: 'Uganda',
        name: '3rd Street, Ibex Hill',
        description: '',
        location_name: '',
        search_name: '',
        approximate_latitude: 0.3,
        approximate_longitude: 32.6,
        data_provider: 'AirQo',
        site_category: { tags: [], category: 'Reference' },
      },
    });
    const row = buildComparisonRow(reading);
    expect(row.siteName).toBe('3rd Street, Ibex Hill');
  });
});

describe('mergeComparisonReadings', () => {
  const makeComparisonSite = (
    overrides: Partial<ComparisonSiteReading> = {}
  ): ComparisonSiteReading => ({
    site_id: 'site-1',
    site: {
      name: '3rd Street, Ibex Hill',
      location_name: 'Lusaka Central, Zambia',
      city: 'Lusaka',
      country: 'Zambia',
      latitude: -15.4,
      longitude: 28.3,
    },
    has_reading: true,
    time: null,
    time_difference_hours: null,
    aqi: null,
    pollutants: null,
    ...overrides,
  });

  const makeRecent = (overrides: Partial<RecentReading> = {}): RecentReading =>
    ({
      _id: 'site-1',
      site_id: 'site-1',
      time: '2026-08-22T09:05:00Z',
      __v: 0,
      aqi_category: 'Moderate',
      aqi_color: 'ECAA06',
      aqi_color_name: 'yellow',
      aqi_index: 72,
      aqi_ranges: {} as RecentReading['aqi_ranges'],
      averages: {} as RecentReading['averages'],
      createdAt: '',
      device: '',
      device_id: '',
      frequency: '',
      health_tips: [],
      is_reading_primary: true,
      no2: { value: 3.45 },
      pm10: { value: 15 },
      pm2_5: { value: 12.34 },
      timeDifferenceHours: 2,
      updatedAt: '',
      siteDetails: {
        _id: 'site-1',
        formatted_name: '',
        street: '',
        parish: '',
        village: '',
        sub_county: '',
        town: '',
        city: 'Lusaka',
        district: '',
        county: '',
        region: '',
        country: 'Zambia',
        name: '3rd Street, Ibex Hill',
        description: '',
        location_name: 'Lusaka Central, Zambia',
        search_name: '3rd Street, Ibex Hill',
        approximate_latitude: -15.4,
        approximate_longitude: 28.3,
        data_provider: '',
        site_category: { tags: [], category: '' },
      } as RecentReading['siteDetails'],
      ...overrides,
    }) as unknown as RecentReading;

  it('merges comparison site metadata with recent measurements', () => {
    const comparisonSite = makeComparisonSite();
    const recentReading = makeRecent();
    const merged = mergeComparisonReadings([comparisonSite], [recentReading]);
    expect(merged).toHaveLength(1);
    const row = merged[0];
    // siteDetails from the comparison payload (location_name)
    expect(row.siteDetails.location_name).toBe('Lusaka Central, Zambia');
    // measurements from the recent reading
    expect(row.pm2_5).toEqual({ value: 12.34 });
    expect(row.pm10).toEqual({ value: 15 });
    expect(row.no2).toEqual({ value: 3.45 });
    expect(row.aqi_index).toBe(72);
  });

  it('returns metadata-only row when no recent reading exists', () => {
    const comparisonSite = makeComparisonSite();
    const merged = mergeComparisonReadings([comparisonSite], []);
    expect(merged).toHaveLength(1);
    expect(merged[0].siteDetails.location_name).toBe('Lusaka Central, Zambia');
    expect(merged[0].pm2_5).toEqual({ value: null });
    expect(merged[0].aqi_index).toBe(0);
  });

  it('appends recent readings whose site_id is not in comparisonSites', () => {
    const comparisonSite = makeComparisonSite({ site_id: 'site-1' });
    const extraRecent = makeRecent({
      site_id: 'site-extra',
      pm2_5: { value: 5 },
    });
    const merged = mergeComparisonReadings([comparisonSite], [extraRecent]);
    expect(merged).toHaveLength(2);
    expect(merged[1].site_id).toBe('site-extra');
  });

  it('does not mutate input arrays', () => {
    const comparisonSites = [makeComparisonSite()];
    const recentReadings = [makeRecent()];
    const origComparison = [...comparisonSites];
    const origRecent = [...recentReadings];
    mergeComparisonReadings(comparisonSites, recentReadings);
    expect(comparisonSites).toEqual(origComparison);
    expect(recentReadings).toEqual(origRecent);
  });

  it('preserves recent reading search_name over metadata (search_name || location_name)', () => {
    const comparisonSite = makeComparisonSite({
      site: {
        name: 'Mary Queen of Peace P/s Gulu',
        location_name: 'Gulu, Uganda',
        city: 'Gulu',
        country: 'Uganda',
        latitude: 2.77,
        longitude: 32.3,
      },
    });
    const recentReading = makeRecent({
      siteDetails: {
        _id: 'site-1',
        formatted_name: '',
        street: '',
        parish: '',
        village: '',
        sub_county: '',
        town: '',
        city: 'Gulu',
        district: '',
        county: '',
        region: '',
        country: 'Uganda',
        name: 'Mary Queen of Peace P/s Gulu',
        description: '',
        location_name: 'Gulu, Uganda',
        search_name: 'Gulu',
        approximate_latitude: 2.77,
        approximate_longitude: 32.3,
        data_provider: '',
        site_category: { tags: [], category: '' },
      } as RecentReading['siteDetails'],
    });
    const merged = mergeComparisonReadings([comparisonSite], [recentReading]);
    expect(merged).toHaveLength(1);
    // Recent reading's search_name is kept
    expect(merged[0].siteDetails.search_name).toBe('Gulu');
    // location_name stays from metadata
    expect(merged[0].siteDetails.location_name).toBe('Gulu, Uganda');
  });

  it('falls back to metadata search_name when recent reading has empty search_name', () => {
    const comparisonSite = makeComparisonSite({
      site: {
        name: 'Mary Queen of Peace P/s Gulu',
        location_name: 'Gulu, Uganda',
        city: 'Gulu',
        country: 'Uganda',
        latitude: 2.77,
        longitude: 32.3,
      },
    });
    const recentReading = makeRecent({
      siteDetails: {
        _id: 'site-1',
        formatted_name: '',
        street: '',
        parish: '',
        village: '',
        sub_county: '',
        town: '',
        city: 'Gulu',
        district: '',
        county: '',
        region: '',
        country: 'Uganda',
        name: 'Mary Queen of Peace P/s Gulu',
        description: '',
        location_name: 'Gulu, Uganda',
        search_name: '',
        approximate_latitude: 2.77,
        approximate_longitude: 32.3,
        data_provider: '',
        site_category: { tags: [], category: '' },
      } as RecentReading['siteDetails'],
    });
    const merged = mergeComparisonReadings([comparisonSite], [recentReading]);
    expect(merged).toHaveLength(1);
    // Recent has empty search_name, falls back to metadata's (which is also '')
    expect(merged[0].siteDetails.search_name).toBe('');
    // Display name will fall through to location_name
    expect(merged[0].siteDetails.location_name).toBe('Gulu, Uganda');
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
