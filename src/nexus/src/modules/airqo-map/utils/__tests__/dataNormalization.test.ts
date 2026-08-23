import {
  normalizeCountries,
  normalizeLocations,
  formatCountryForApi,
  filterLocations,
  limitLocationsForDisplay,
  calculateMapBounds,
  normalizeMapReadings,
  getReadingAqiLevel,
  getClusterCategoryFallback,
  resolveReadingDisplayLevel,
  resolveClusterDisplay,
  POLLUTANT_CONFIGS,
  DEFAULT_POLLUTANT,
} from '../dataNormalization';
import type { CountryData, MapReading } from '../../../../shared/types/api';
import type { AqiConfig } from '../../../../shared/types/aqi';

const makeCountryData = (country: string, flag = '🏳️'): CountryData =>
  ({ country, flag_url: flag }) as unknown as CountryData;

const makeAqiConfig = (): AqiConfig => ({
  pollutant: 'pm2_5',
  standard: 'WHO',
  source: 'test',
  version: null,
  effective_from: null,
  ranges: [
    {
      key: 'good',
      label: 'Good',
      min_value: 0,
      max_value: 5,
      color: '#00e400',
      display_order: 1,
    },
    {
      key: 'moderate',
      label: 'Moderate',
      min_value: 5,
      max_value: 15,
      color: '#ffff00',
      display_order: 2,
    },
    {
      key: 'u4sg',
      label: 'Unhealthy for Sensitive Groups',
      min_value: 15,
      max_value: 25,
      color: '#ff7e00',
      display_order: 3,
    },
    {
      key: 'unhealthy',
      label: 'Unhealthy',
      min_value: 25,
      max_value: 35,
      color: '#ff0000',
      display_order: 4,
    },
    {
      key: 'very_unhealthy',
      label: 'Very Unhealthy',
      min_value: 35,
      max_value: 75,
      color: '#8f3f98',
      display_order: 5,
    },
    {
      key: 'hazardous',
      label: 'Hazardous',
      min_value: 75,
      max_value: null,
      color: '#7e0023',
      display_order: 6,
    },
  ],
});

describe('normalizeCountries', () => {
  it('prepends All entry at index 0', () => {
    const result = normalizeCountries([makeCountryData('Kenya')]);
    expect(result[0]).toEqual({ code: 'all', name: 'All', flag: '🌍' });
  });

  it('sorts countries alphabetically with Uganda first', () => {
    const data = [
      makeCountryData('Kenya'),
      makeCountryData('Uganda'),
      makeCountryData('Tanzania'),
    ];
    const result = normalizeCountries(data);
    const names = result.slice(1).map(c => c.name);
    expect(names[0]).toBe('Uganda');
    expect(names[1]).toBe('Kenya');
    expect(names[2]).toBe('Tanzania');
  });

  it('handles empty array', () => {
    const result = normalizeCountries([]);
    expect(result).toEqual([{ code: 'all', name: 'All', flag: '🌍' }]);
  });

  it('uses underscored lowercase code', () => {
    const result = normalizeCountries([makeCountryData('South Africa')]);
    expect(result[1].code).toBe('south_africa');
  });
});

describe('normalizeLocations', () => {
  it('maps site data to Location format', () => {
    const sites = [
      {
        _id: '1',
        search_name: 'Kampala Central',
        location_name: 'Kampala, Uganda',
      },
    ];
    const result = normalizeLocations(sites);
    expect(result).toEqual([
      { id: '1', title: 'Kampala Central', location: 'Kampala, Uganda' },
    ]);
  });

  it('uses search_name || name || formatted_name for title', () => {
    expect(normalizeLocations([{ _id: '1', search_name: 'A' }])[0].title).toBe(
      'A'
    );
    expect(normalizeLocations([{ _id: '1', name: 'B' }])[0].title).toBe('B');
    expect(
      normalizeLocations([{ _id: '1', formatted_name: 'C' }])[0].title
    ).toBe('C');
  });

  it('uses location_name || city, country for location', () => {
    expect(
      normalizeLocations([{ _id: '1', location_name: 'X' }])[0].location
    ).toBe('X');
    expect(
      normalizeLocations([{ _id: '1', city: 'Kampala', country: 'Uganda' }])[0]
        .location
    ).toBe('Kampala, Uganda');
  });
});

describe('formatCountryForApi', () => {
  it('returns empty for all', () => {
    expect(formatCountryForApi('all')).toBe('');
  });

  it('returns empty for empty string', () => {
    expect(formatCountryForApi('')).toBe('');
  });

  it('capitalizes words', () => {
    expect(formatCountryForApi('uganda')).toBe('Uganda');
  });

  it('handles underscored values', () => {
    expect(formatCountryForApi('south_africa')).toBe('South Africa');
  });
});

describe('filterLocations', () => {
  const locations = [
    { id: '1', title: 'Kampala Central', location: 'Kampala, Uganda' },
    { id: '2', title: 'Entebbe Airport', location: 'Entebbe, Uganda' },
    { id: '3', title: 'Nairobi City', location: 'Nairobi, Kenya' },
  ];

  it('returns all when query is empty', () => {
    expect(filterLocations(locations, '')).toEqual(locations);
  });

  it('filters by title match', () => {
    const result = filterLocations(locations, 'Kampala');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by location match', () => {
    const result = filterLocations(locations, 'Kenya');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('is case insensitive', () => {
    const result = filterLocations(locations, 'kampala');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

describe('limitLocationsForDisplay', () => {
  const locations = Array.from({ length: 10 }, (_, i) => ({
    id: String(i),
    title: `Location ${i}`,
    location: `City ${i}`,
  }));

  it('returns all when isSearching', () => {
    const result = limitLocationsForDisplay(locations, true);
    expect(result.displayed).toEqual(locations);
    expect(result.hasMore).toBe(false);
  });

  it('limits to initialLimit when not searching', () => {
    const result = limitLocationsForDisplay(locations, false, 3);
    expect(result.displayed).toHaveLength(3);
    expect(result.hasMore).toBe(true);
  });

  it('hasMore is false when locations fit within limit', () => {
    const small = locations.slice(0, 2);
    const result = limitLocationsForDisplay(small, false, 6);
    expect(result.hasMore).toBe(false);
  });
});

describe('calculateMapBounds', () => {
  it('returns null for empty array', () => {
    expect(calculateMapBounds([])).toBeNull();
  });

  it('returns center and zoom 16 for single point', () => {
    const result = calculateMapBounds([{ latitude: 0.5, longitude: 32.5 }]);
    expect(result).toEqual({
      center: { latitude: 0.5, longitude: 32.5 },
      zoom: 16,
    });
  });

  it('calculates bounds for multiple points', () => {
    const readings = [
      { latitude: 0, longitude: 32 },
      { latitude: 1, longitude: 33 },
    ];
    const result = calculateMapBounds(readings);
    expect(result).not.toBeNull();
    expect(result!.center.latitude).toBe(0.5);
    expect(result!.center.longitude).toBe(32.5);
    expect(result!.zoom).toBe(10);
  });

  it('uses siteDetails coordinates when direct coordinates missing', () => {
    const readings = [
      {
        siteDetails: {
          approximate_latitude: 0.5,
          approximate_longitude: 32.5,
        },
      },
    ];
    const result = calculateMapBounds(readings);
    expect(result).toEqual({
      center: { latitude: 0.5, longitude: 32.5 },
      zoom: 16,
    });
  });

  it('returns null when no valid coordinates', () => {
    expect(
      calculateMapBounds([{ latitude: undefined, longitude: undefined }])
    ).toBeNull();
  });
});

const makeMapReading = (overrides: Partial<MapReading> = {}): MapReading =>
  ({
    _id: 'reading-1',
    site_id: 'site-1',
    time: '2024-01-01T00:00:00.000Z',
    aqi_category: 'good',
    aqi_color: '#00e400',
    aqi_color_name: 'green',
    aqi_ranges: {},
    averages: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    device: 'device-1',
    device_id: 'device-id-1',
    frequency: 'hourly',
    health_tips: [],
    is_reading_primary: true,
    no2: { value: 10 },
    pm10: { value: 20 },
    pm2_5: { value: 15 },
    siteDetails: {
      _id: 'site-1',
      formatted_name: 'Formatted Site',
      location_name: 'Location Name',
      search_name: 'Search Name',
      town: 'Town',
      city: 'Kampala',
      district: 'District',
      county: 'County',
      region: 'Region',
      country: 'Uganda',
      name: 'Site Name',
      approximate_latitude: 0.3,
      approximate_longitude: 32.5,
      bearing_in_radians: 0,
      data_provider: 'AirQo',
      description: 'Description',
      site_category: { tags: [], category: 'category' },
    },
    timeDifferenceHours: 1,
    updatedAt: '2024-01-01T01:00:00.000Z',
    ...overrides,
  }) as unknown as MapReading;

describe('normalizeMapReadings', () => {
  it('returns empty array when no readings', () => {
    expect(normalizeMapReadings([])).toEqual([]);
  });

  it('filters out readings with missing pollutant value', () => {
    const reading = makeMapReading({ pm2_5: { value: null } });
    expect(normalizeMapReadings([reading])).toEqual([]);
  });

  it('filters out readings with missing coordinates', () => {
    const reading = makeMapReading({
      siteDetails: {
        ...makeMapReading().siteDetails,
        approximate_latitude: null,
        approximate_longitude: null,
      } as unknown as MapReading['siteDetails'],
    });
    expect(normalizeMapReadings([reading])).toEqual([]);
  });

  it('normalizes reading with default pollutant', () => {
    const reading = makeMapReading();
    const result = normalizeMapReadings([reading]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('site-1');
    expect(result[0].pollutantType).toBe(DEFAULT_POLLUTANT);
    expect(result[0].pollutantValue).toBe(15);
    expect(result[0].locationName).toBe('Search Name');
  });

  it('uses pm10 when specified', () => {
    const reading = makeMapReading();
    const result = normalizeMapReadings([reading], 'pm10');
    expect(result[0].pollutantType).toBe('pm10');
    expect(result[0].pollutantValue).toBe(20);
  });

  it('falls back location name to city, country', () => {
    const reading = makeMapReading({
      siteDetails: {
        ...makeMapReading().siteDetails,
        search_name: '',
        name: '',
        formatted_name: '',
      } as unknown as MapReading['siteDetails'],
    });
    const result = normalizeMapReadings([reading]);
    expect(result[0].locationName).toBe('Kampala, Uganda');
  });

  it('uses current date for invalid time values', () => {
    const reading = makeMapReading({ time: 'invalid', updatedAt: 'invalid' });
    const result = normalizeMapReadings([reading]);
    expect(result[0].lastUpdated).toBeInstanceOf(Date);
    expect(Number.isNaN((result[0].lastUpdated as Date).getTime())).toBe(false);
  });

  it('marks inactive when reading is not primary', () => {
    const reading = makeMapReading({ is_reading_primary: false });
    const result = normalizeMapReadings([reading]);
    expect(result[0].status).toBe('inactive');
    expect(result[0].isPrimary).toBe(false);
  });

  it('exposes POLLUTANT_CONFIGS', () => {
    expect(POLLUTANT_CONFIGS.pm2_5.label).toBe('PM2.5');
    expect(POLLUTANT_CONFIGS.pm10.unit).toBe('µg/m³');
  });
});

describe('getReadingAqiLevel', () => {
  it('falls back to the API category when the config is unavailable', () => {
    const reading = makeMapReading({ aqi_category: 'Moderate' });
    const normalized = normalizeMapReadings([reading])[0];
    const level = getReadingAqiLevel(normalized, 'pm2_5', null);
    expect(level).toBe('moderate');
  });

  it('maps API category variants to levels', () => {
    const level = getReadingAqiLevel(
      {
        pm25Value: NaN,
        pm10Value: NaN,
        aqiCategory: 'Unhealthy for Sensitive Groups',
      },
      'pm2_5',
      null
    );
    expect(level).toBe('unhealthy-sensitive-groups');
  });

  it('returns no-value when neither config nor category resolves', () => {
    const level = getReadingAqiLevel(
      { pm25Value: NaN, pm10Value: NaN, aqiCategory: undefined },
      'pm2_5',
      null
    );
    expect(level).toBe('no-value');
  });

  it('prefers the API category even when the concentration classifies differently', () => {
    // 100 µg/m³ would classify as hazardous under the config, but the
    // displayed number is the API AQI index whose own classification is
    // 'Good' — the category must win so color/label match the number.
    const level = getReadingAqiLevel(
      { pm25Value: 100, pm10Value: 100, aqiCategory: 'Good' },
      'pm2_5',
      makeAqiConfig()
    );
    expect(level).toBe('good');
  });
});

describe('resolveReadingDisplayLevel', () => {
  it('classifies from the API category first', () => {
    const result = resolveReadingDisplayLevel(
      { pm25Value: 100, aqiCategory: 'Good' },
      'pm2_5',
      makeAqiConfig()
    );
    expect(result).toEqual({ level: 'good', source: 'aqi-category' });
  });

  it('uses fullReadingData.aqi_category when aqiCategory is absent', () => {
    const result = resolveReadingDisplayLevel(
      { fullReadingData: { aqi_category: 'Unhealthy' } },
      'pm2_5',
      null
    );
    expect(result).toEqual({ level: 'unhealthy', source: 'aqi-category' });
  });

  it('falls back to concentration classification without a category', () => {
    const result = resolveReadingDisplayLevel(
      { pm25Value: 100 },
      'pm2_5',
      makeAqiConfig()
    );
    expect(result).toEqual({ level: 'hazardous', source: 'concentration' });
  });

  it('returns no-value when neither category nor concentration resolves', () => {
    const result = resolveReadingDisplayLevel(
      { pm25Value: NaN, aqiCategory: 'UnknownCategory' },
      'pm2_5',
      null
    );
    expect(result).toEqual({ level: 'no-value', source: 'concentration' });
  });
});

describe('resolveClusterDisplay', () => {
  it('classifies from the most common member category and aggregates averages', () => {
    const result = resolveClusterDisplay(
      [
        { pm25Value: 10, pm10Value: 10, aqiCategory: 'Moderate', aqiIndex: 60 },
        { pm25Value: 12, pm10Value: 12, aqiCategory: 'Moderate', aqiIndex: 62 },
        { pm25Value: 11, pm10Value: 11, aqiCategory: 'Good', aqiIndex: 30 },
      ],
      'pm2_5',
      makeAqiConfig()
    );
    expect(result.level).toBe('moderate');
    expect(result.source).toBe('aqi-category');
    expect(result.hasData).toBe(true);
    expect(result.avgConcentration).toBeCloseTo(11);
    expect(result.avgAqiIndex).toBeCloseTo((60 + 62 + 30) / 3);
  });

  it('falls back to mean concentration when no member has a category', () => {
    const result = resolveClusterDisplay(
      [
        { pm25Value: 4, pm10Value: 4, aqiIndex: 20 },
        { pm25Value: 8, pm10Value: 8, aqiIndex: 40 },
      ],
      'pm2_5',
      makeAqiConfig()
    );
    expect(result.level).toBe('moderate');
    expect(result.source).toBe('concentration');
    expect(result.avgConcentration).toBe(6);
    expect(result.avgAqiIndex).toBe(30);
  });

  it('reports hasData false and undefined averages without valid values', () => {
    const result = resolveClusterDisplay(
      [{ pm25Value: NaN, pm10Value: NaN }],
      'pm2_5',
      makeAqiConfig()
    );
    expect(result.hasData).toBe(false);
    expect(result.avgConcentration).toBe(0);
    expect(result.avgAqiIndex).toBeUndefined();
  });
});

describe('getClusterCategoryFallback', () => {
  it('returns the most common category', () => {
    const fallback = getClusterCategoryFallback([
      { aqiCategory: 'Moderate' },
      { aqiCategory: 'Good' },
      { aqiCategory: 'Moderate' },
    ]);
    expect(fallback).toBe('Moderate');
  });

  it('returns undefined when no member has a category', () => {
    expect(
      getClusterCategoryFallback([{ aqiCategory: undefined }])
    ).toBeUndefined();
  });

  it('returns undefined for empty clusters', () => {
    expect(getClusterCategoryFallback([])).toBeUndefined();
  });
});
