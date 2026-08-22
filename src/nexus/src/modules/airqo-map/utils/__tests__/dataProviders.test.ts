import {
  DATA_PROVIDER_ALL,
  normalizeDataProvider,
  getDataProviderDisplayLabel,
  extractDataProviders,
  readingMatchesDataProvider,
} from '../dataProviders';
import type { AirQualityReading } from '../../components/map/MapNodes';

const makeReading = (dataProvider: string | undefined): AirQualityReading =>
  ({
    id: 'r1',
    siteId: 's1',
    longitude: 0,
    latitude: 0,
    pm25Value: 10,
    pm10Value: 20,
    locationName: 'Site',
    lastUpdated: new Date(),
    provider: 'AirQo',
    fullReadingData: {
      siteDetails: { data_provider: dataProvider },
    },
  }) as unknown as AirQualityReading;

describe('normalizeDataProvider', () => {
  it('returns empty array for missing values', () => {
    expect(normalizeDataProvider(undefined)).toEqual([]);
    expect(normalizeDataProvider(null)).toEqual([]);
    expect(normalizeDataProvider('')).toEqual([]);
    expect(normalizeDataProvider('   ')).toEqual([]);
  });

  it('normalizes casing', () => {
    expect(normalizeDataProvider('AirQo')).toEqual(['AIRQO']);
    expect(normalizeDataProvider('airqo')).toEqual(['AIRQO']);
    expect(normalizeDataProvider('AIRGRADIENT')).toEqual(['AIRGRADIENT']);
  });

  it('splits combined providers', () => {
    expect(normalizeDataProvider('AIRGRADIENT / AIRQO')).toEqual([
      'AIRGRADIENT',
      'AIRQO',
    ]);
  });

  it('deduplicates repeated providers', () => {
    expect(normalizeDataProvider('AirQo / airqo')).toEqual(['AIRQO']);
  });
});

describe('getDataProviderDisplayLabel', () => {
  it('maps known providers to branded labels', () => {
    expect(getDataProviderDisplayLabel('AIRQO')).toBe('AirQo');
    expect(getDataProviderDisplayLabel('AIRGRADIENT')).toBe('AirGradient');
  });

  it('normalizes unknown providers to title case', () => {
    expect(getDataProviderDisplayLabel('purple_air')).toBe('Purple_air');
  });
});

describe('extractDataProviders', () => {
  it('returns empty array for no readings', () => {
    expect(extractDataProviders([])).toEqual([]);
  });

  it('derives unique providers from readings', () => {
    const readings = [
      makeReading('AIRQO'),
      makeReading('AirQo'),
      makeReading('AIRGRADIENT'),
      makeReading('AIRGRADIENT / AIRQO'),
    ];
    expect(extractDataProviders(readings)).toEqual(['AIRQO', 'AIRGRADIENT']);
  });

  it('orders AirQo first, AirGradient second, others alphabetically', () => {
    const readings = [
      makeReading('PURPLE_AIR'),
      makeReading('AIRGRADIENT'),
      makeReading('AIRQO'),
    ];
    expect(extractDataProviders(readings)).toEqual([
      'AIRQO',
      'AIRGRADIENT',
      'PURPLE_AIR',
    ]);
  });
});

describe('readingMatchesDataProvider', () => {
  it('matches everything when the filter is "all"', () => {
    expect(
      readingMatchesDataProvider(makeReading('AIRQO'), DATA_PROVIDER_ALL)
    ).toBe(true);
  });

  it('matches the canonical provider regardless of raw casing', () => {
    expect(readingMatchesDataProvider(makeReading('airqo'), 'AIRQO')).toBe(
      true
    );
    expect(
      readingMatchesDataProvider(makeReading('AIRGRADIENT'), 'airgradient')
    ).toBe(true);
  });

  it('matches combined readings against either provider', () => {
    const reading = makeReading('AIRGRADIENT / AIRQO');
    expect(readingMatchesDataProvider(reading, 'AIRQO')).toBe(true);
    expect(readingMatchesDataProvider(reading, 'AIRGRADIENT')).toBe(true);
  });

  it('does not match a different provider', () => {
    expect(
      readingMatchesDataProvider(makeReading('AIRQO'), 'AIRGRADIENT')
    ).toBe(false);
  });

  it('does not match readings without a provider', () => {
    expect(readingMatchesDataProvider(makeReading(undefined), 'AIRQO')).toBe(
      false
    );
  });
});
