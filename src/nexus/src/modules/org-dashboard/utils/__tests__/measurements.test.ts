import type { Measurement, Site, SiteAverages } from '@/shared/types/api';
import type { AqiConfig } from '@/shared/types/aqi';
import {
  buildFleetDailySeries,
  buildLocationCardData,
  buildSiteDailySeriesMap,
  countLevelDistribution,
  getMeasurementValue,
  latestMeasurementPerSite,
  summarizeFleetMeasurements,
} from '../measurements';

const mockAqiConfig: AqiConfig = {
  pollutant: 'pm2_5',
  standard: 'WHO',
  source: 'airqo',
  version: '1',
  effective_from: '2024-01-01',
  ranges: [
    {
      key: 'good',
      label: 'Good',
      min_value: 0,
      max_value: 10,
      color: '#10B981',
      display_order: 1,
    },
    {
      key: 'moderate',
      label: 'Moderate',
      min_value: 10.1,
      max_value: 35,
      color: '#F59E0B',
      display_order: 2,
    },
    {
      key: 'u4sg',
      label: 'Unhealthy for sensitive groups',
      min_value: 35.1,
      max_value: 55,
      color: '#F97316',
      display_order: 3,
    },
    {
      key: 'unhealthy',
      label: 'Unhealthy',
      min_value: 55.1,
      max_value: 125,
      color: '#EF4444',
      display_order: 4,
    },
    {
      key: 'very_unhealthy',
      label: 'Very unhealthy',
      min_value: 125.1,
      max_value: 225,
      color: '#8B5CF6',
      display_order: 5,
    },
    {
      key: 'hazardous',
      label: 'Hazardous',
      min_value: 225.1,
      max_value: null,
      color: '#7C2D12',
      display_order: 6,
    },
  ],
};

const makeMeasurement = (
  overrides: Partial<Measurement> & { site_id: string }
): Measurement => ({
  device: 'aq_g1',
  device_id: 'dev-1',
  time: '2026-08-15T06:00:00.000Z',
  pm2_5: { value: 12.5 },
  pm10: { value: 20.1 },
  no2: { value: null },
  frequency: 'hourly',
  is_reading_primary: true,
  deviceDetails: { _id: 'dev-1', name: 'aq_g1', isOnline: true },
  ...overrides,
});

describe('getMeasurementValue', () => {
  it('returns the numeric value for the selected pollutant', () => {
    const measurement = makeMeasurement({
      site_id: 's1',
      pm2_5: { value: 9.5 },
    });
    expect(getMeasurementValue(measurement, 'pm2_5')).toBe(9.5);
    expect(getMeasurementValue(measurement, 'pm10')).toBe(20.1);
  });

  it('returns null for null / non-finite values', () => {
    const measurement = makeMeasurement({
      site_id: 's1',
      pm2_5: { value: null },
    });
    expect(getMeasurementValue(measurement, 'pm2_5')).toBeNull();
  });
});

describe('latestMeasurementPerSite', () => {
  it('dedupes multiple devices per site, preferring primary and newest', () => {
    const older = makeMeasurement({
      site_id: 's1',
      device_id: 'dev-1',
      time: '2026-08-15T05:00:00.000Z',
      pm2_5: { value: 10 },
      is_reading_primary: false,
    });
    const newer = makeMeasurement({
      site_id: 's1',
      device_id: 'dev-2',
      time: '2026-08-15T06:00:00.000Z',
      pm2_5: { value: 22 },
      is_reading_primary: true,
    });
    const map = latestMeasurementPerSite([older, newer]);
    expect(map.size).toBe(1);
    expect(map.get('s1')?.pm2_5?.value).toBe(22);
  });

  it('returns an empty map for null/undefined input', () => {
    expect(latestMeasurementPerSite(null).size).toBe(0);
    expect(latestMeasurementPerSite(undefined).size).toBe(0);
  });
});

describe('summarizeFleetMeasurements', () => {
  it('averages concentrations and classifies with the config', () => {
    const latest = latestMeasurementPerSite([
      makeMeasurement({ site_id: 's1', pm2_5: { value: 10 } }),
      makeMeasurement({ site_id: 's2', pm2_5: { value: 20 } }),
    ]);
    const summary = summarizeFleetMeasurements(latest, 'pm2_5', null);
    expect(summary.monitoredSiteCount).toBe(2);
    expect(summary.averageConcentration).toBe(15);
    expect(summary.worstSite?.siteId).toBe('s2');
    expect(summary.cleanestSite?.siteId).toBe('s1');
  });

  it('reports no-value when no site has data', () => {
    const latest = latestMeasurementPerSite([
      makeMeasurement({ site_id: 's1', pm2_5: { value: null } }),
    ]);
    const summary = summarizeFleetMeasurements(latest, 'pm2_5', null);
    expect(summary.averageConcentration).toBeNull();
    expect(summary.averageLevel).toBe('no-value');
    expect(summary.worstSite).toBeNull();
  });
});

describe('countLevelDistribution', () => {
  it('counts sites per AQI level', () => {
    const latest = latestMeasurementPerSite([
      makeMeasurement({ site_id: 's1', pm2_5: { value: 4 } }), // good
      makeMeasurement({ site_id: 's2', pm2_5: { value: 20 } }), // moderate
      makeMeasurement({ site_id: 's3', pm2_5: { value: null } }), // no value
    ]);
    const distribution = countLevelDistribution(latest, 'pm2_5', mockAqiConfig);
    const good = distribution.find(entry => entry.level === 'good');
    const moderate = distribution.find(entry => entry.level === 'moderate');
    const noValue = distribution.find(entry => entry.level === 'no-value');
    expect(good?.count).toBe(1);
    expect(moderate?.count).toBe(1);
    expect(noValue?.count).toBe(1);
    expect(distribution.reduce((sum, entry) => sum + entry.count, 0)).toBe(3);
  });

  it('classifies sites as no-value when no config is available', () => {
    const latest = latestMeasurementPerSite([
      makeMeasurement({ site_id: 's1', pm2_5: { value: 4 } }),
    ]);
    const distribution = countLevelDistribution(latest, 'pm2_5', null);
    const noValue = distribution.find(entry => entry.level === 'no-value');
    expect(noValue?.count).toBe(1);
    expect(distribution.reduce((sum, entry) => sum + entry.count, 0)).toBe(1);
  });
});

describe('buildFleetDailySeries', () => {
  it('averages measurements per day and sorts chronologically', () => {
    const measurements = [
      makeMeasurement({
        site_id: 's1',
        time: '2026-08-10T06:00:00.000Z',
        pm2_5: { value: 10 },
      }),
      makeMeasurement({
        site_id: 's2',
        time: '2026-08-10T12:00:00.000Z',
        pm2_5: { value: 20 },
      }),
      makeMeasurement({
        site_id: 's1',
        time: '2026-08-11T06:00:00.000Z',
        pm2_5: { value: 30 },
      }),
    ];
    const series = buildFleetDailySeries(measurements, 'pm2_5');
    expect(series).toHaveLength(2);
    expect(series[0]).toEqual({ date: '2026-08-10', value: 15 });
    expect(series[1]).toEqual({ date: '2026-08-11', value: 30 });
  });
});

describe('buildSiteDailySeriesMap', () => {
  it('groups daily averages by site', () => {
    const measurements = [
      makeMeasurement({
        site_id: 's1',
        time: '2026-08-10T06:00:00.000Z',
        pm2_5: { value: 10 },
      }),
      makeMeasurement({
        site_id: 's1',
        time: '2026-08-10T12:00:00.000Z',
        pm2_5: { value: 20 },
      }),
      makeMeasurement({
        site_id: 's2',
        time: '2026-08-10T06:00:00.000Z',
        pm2_5: { value: 40 },
      }),
    ];
    const map = buildSiteDailySeriesMap(measurements, 'pm2_5');
    expect(map.get('s1')).toEqual([{ date: '2026-08-10', value: 15 }]);
    expect(map.get('s2')).toEqual([{ date: '2026-08-10', value: 40 }]);
  });
});

describe('buildLocationCardData', () => {
  const site: Site = {
    _id: 's1',
    search_name: 'Kisumu Airport',
    city: 'Kisumu',
    country: 'Kenya',
  };

  it('derives status from the live measurement value', () => {
    const measurement = makeMeasurement({
      site_id: 's1',
      pm2_5: { value: 6 },
    });
    const card = buildLocationCardData({
      site,
      measurement,
      averages: null,
      pollutant: 'pm2_5',
      aqiConfig: null,
    });
    expect(card.name).toContain('Kisumu');
    expect(card.value).toBe(6);
    expect(card.trend).toBe('stable');
  });

  it('maps the weekly percentage difference to a trend badge', () => {
    const averages: SiteAverages = {
      dailyAverage: 12,
      percentageDifference: 25.4,
      weeklyAverages: { currentWeek: 12, previousWeek: 9.6 },
    };
    const measurement = makeMeasurement({
      site_id: 's1',
      pm2_5: { value: 12 },
    });
    const card = buildLocationCardData({
      site,
      measurement,
      averages,
      pollutant: 'pm2_5',
      aqiConfig: null,
    });
    expect(card.trend).toBe('up');
    expect(card.percentageDifference).toBe(25.4);
  });

  it('renders no-value when the measurement is missing', () => {
    const card = buildLocationCardData({
      site,
      measurement: null,
      averages: null,
      pollutant: 'pm2_5',
      aqiConfig: null,
    });
    expect(card.status).toBe('no-value');
    expect(card.value).toBe(0);
  });
});
