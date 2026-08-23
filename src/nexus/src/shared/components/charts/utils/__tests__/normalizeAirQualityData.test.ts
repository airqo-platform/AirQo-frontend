import { normalizeAirQualityData } from '../index';
import type { AirQualityDataPoint } from '../../types';

describe('normalizeAirQualityData', () => {
  it('passes through the legacy {time, value, site_id, name} shape', () => {
    const input: AirQualityDataPoint[] = [
      {
        time: '2025-01-15T12:00:00Z',
        value: 12.345,
        site_id: 'site-1',
        device_id: 'dev-1',
        name: 'Kampala Monitor',
      },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].time).toBe('2025-01-15T12:00:00Z');
    expect(result[0].value).toBe(12.35);
    expect(result[0].site).toBe('Kampala Monitor');
    expect(result[0].site_id).toBe('site-1');
    expect(result[0].device_id).toBe('dev-1');
  });

  it('resolves {date, pm2_5} shape to time=date, value=pm2_5', () => {
    const input: AirQualityDataPoint[] = [{ date: '2025-01-01', pm2_5: 10 }];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].time).toBe('2025-01-01');
    expect(result[0].value).toBe(10);
  });

  it('converts epoch millisecond timestamp to ISO string', () => {
    const input: AirQualityDataPoint[] = [
      { timestamp: 1704067200000, value: 5 },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].time).toBe(new Date(1704067200000).toISOString());
  });

  it('coerces numeric string values to numbers', () => {
    const input: AirQualityDataPoint[] = [
      { time: '2025-06-01', value: '12.5' },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(12.5);
    expect(typeof result[0].value).toBe('number');
  });

  it('unwraps nested {value: number} objects', () => {
    const input: AirQualityDataPoint[] = [
      { time: '2025-03-10', value: { value: 12.5 } },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(12.5);
  });

  it('falls back to pm10 when pm2_5 is absent', () => {
    const input: AirQualityDataPoint[] = [{ time: '2025-04-01', pm10: 35.2 }];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(35.2);
  });

  it('preserves zero value (does not drop it)', () => {
    const input: AirQualityDataPoint[] = [{ time: '2025-07-01', value: 0 }];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(0);
  });

  it('drops points with non-finite or missing values', () => {
    const input: AirQualityDataPoint[] = [
      { time: '2025-01-01', value: NaN },
      { time: '2025-01-02', value: undefined },
      { time: '2025-01-03' },
      { time: '2025-01-04', value: 'not-a-number' },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(0);
  });

  it('returns Unknown Location fallback when no name fields present', () => {
    const input: AirQualityDataPoint[] = [
      { time: '2025-01-01', value: 5, site_id: 's1', device_id: 'd1' },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].site).toBe('Unknown Location');
  });

  it('passes through extra keys via index signature', () => {
    const input: AirQualityDataPoint[] = [
      {
        time: '2025-01-01',
        value: 10,
        site_id: 's1',
        custom_field: 'extra',
        count: 42,
      },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(42);
  });

  it('handles string timestamp with space separator (YYYY-MM-DD HH:mm:ss)', () => {
    const input: AirQualityDataPoint[] = [
      { time: '2025-03-15 14:30:00', value: 8.5 },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].time).toBe('2025-03-15T14:30:00');
  });

  it('handles epoch millis as a pure-digit string', () => {
    const input: AirQualityDataPoint[] = [{ time: '1704067200000', value: 3 }];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].time).toBe(new Date(1704067200000).toISOString());
  });

  it('handles empty input', () => {
    expect(normalizeAirQualityData([])).toEqual([]);
  });

  it('handles null/undefined input', () => {
    expect(
      normalizeAirQualityData(null as unknown as AirQualityDataPoint[])
    ).toEqual([]);
    expect(
      normalizeAirQualityData(undefined as unknown as AirQualityDataPoint[])
    ).toEqual([]);
  });

  it('uses pm25Value and pm10Value fallbacks', () => {
    const input: AirQualityDataPoint[] = [
      { time: '2025-01-01', pm25Value: '7.5' },
      { time: '2025-01-02', pm10Value: '22.1' },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(7.5);
    expect(result[1].value).toBe(22.1);
  });

  it('searches all keys for a time-like field when canonical fields are absent', () => {
    const input = [
      { myCustomDate: '2025-09-10', value: 4 },
    ] as unknown as AirQualityDataPoint[];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].time).toBe('2025-09-10');
  });

  it('rounds to 2 decimal places', () => {
    const input: AirQualityDataPoint[] = [
      { time: '2025-01-01', value: 12.3456 },
    ];
    const result = normalizeAirQualityData(input);

    expect(result[0].value).toBe(12.35);
  });

  it('preserves search_name and location_name fields', () => {
    const input: AirQualityDataPoint[] = [
      {
        time: '2025-01-01',
        value: 1,
        search_name: 'Search',
        location_name: 'Location',
        formatted_name: 'Formatted',
        generated_name: 'Generated',
      },
    ];
    const result = normalizeAirQualityData(input);

    expect(result[0].search_name).toBe('Search');
    expect(result[0].location_name).toBe('Location');
    expect(result[0].formatted_name).toBe('Formatted');
    expect(result[0].generated_name).toBe('Generated');
    expect(result[0].site).toBe('Search'); // search_name has highest priority
  });

  it('uses site_name when other name fields are absent (d3 chart-data shape)', () => {
    const input: AirQualityDataPoint[] = [
      {
        datetime: '2026-07-23 00:00:00Z',
        pm2_5: 14.24,
        site_name: 'Universite Amadou Mahtar Mbow (UAM)',
        device_name: 'ag_168372',
        frequency: 'daily',
      },
    ];
    const result = normalizeAirQualityData(input);

    expect(result).toHaveLength(1);
    expect(result[0].site).toBe('Universite Amadou Mahtar Mbow (UAM)');
    expect(result[0].value).toBe(14.24);
  });

  it('passes site_name through to NormalizedChartData output', () => {
    const input: AirQualityDataPoint[] = [
      {
        time: '2025-06-01',
        value: 5,
        site_name: 'My Site',
      },
    ];
    const result = normalizeAirQualityData(input);

    expect(result[0].site_name).toBe('My Site');
    expect(result[0].site).toBe('My Site');
  });
});
