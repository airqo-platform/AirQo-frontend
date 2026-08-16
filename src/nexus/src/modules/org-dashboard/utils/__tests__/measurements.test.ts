import type { AqiConfig } from '@/shared/types/aqi';
import type { SiteData } from '@/modules/analytics';
import {
  buildFleetAverageSeries,
  countLevelDistribution,
  getFriendlyErrorMessage,
  summarizeSiteCards,
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

const makeCard = (
  overrides: Partial<SiteData> & { _id: string }
): SiteData => ({
  name: 'Site',
  location: 'Kampala, Uganda',
  value: 12.5,
  status: 'moderate',
  pollutant: 'pm2_5',
  unit: 'µg/m³',
  trend: 'stable',
  ...overrides,
});

describe('summarizeSiteCards', () => {
  it('averages reporting cards and classifies with the config', () => {
    const cards = [
      makeCard({ _id: 's1', name: 'Kisumu', value: 10, status: 'good' }),
      makeCard({ _id: 's2', name: 'Kampala', value: 20, status: 'moderate' }),
    ];
    const summary = summarizeSiteCards(cards, 'pm2_5', mockAqiConfig);
    expect(summary.totalSiteCount).toBe(2);
    expect(summary.monitoredSiteCount).toBe(2);
    expect(summary.averageConcentration).toBe(15);
    expect(summary.worstSite?.name).toBe('Kampala');
    expect(summary.cleanestSite?.name).toBe('Kisumu');
  });

  it('ignores no-value cards and reports no average when none report', () => {
    const cards = [
      makeCard({ _id: 's1', value: 0, status: 'no-value' }),
      makeCard({ _id: 's2', value: 0, status: 'no-value' }),
    ];
    const summary = summarizeSiteCards(cards, 'pm2_5', null);
    expect(summary.totalSiteCount).toBe(2);
    expect(summary.monitoredSiteCount).toBe(0);
    expect(summary.averageConcentration).toBeNull();
    expect(summary.averageLevel).toBe('no-value');
    expect(summary.worstSite).toBeNull();
  });

  it('handles null/undefined input', () => {
    const summary = summarizeSiteCards(null, 'pm2_5', null);
    expect(summary.totalSiteCount).toBe(0);
    expect(summary.monitoredSiteCount).toBe(0);
  });
});

describe('countLevelDistribution', () => {
  it('counts cards per AQI level including no-value', () => {
    const cards = [
      makeCard({ _id: 's1', value: 4, status: 'good' }),
      makeCard({ _id: 's2', value: 20, status: 'moderate' }),
      makeCard({ _id: 's3', value: 0, status: 'no-value' }),
    ];
    const distribution = countLevelDistribution(cards, mockAqiConfig);
    const good = distribution.find(entry => entry.level === 'good');
    const moderate = distribution.find(entry => entry.level === 'moderate');
    const noValue = distribution.find(entry => entry.level === 'no-value');
    expect(good?.count).toBe(1);
    expect(moderate?.count).toBe(1);
    expect(noValue?.count).toBe(1);
    expect(distribution.reduce((sum, entry) => sum + entry.count, 0)).toBe(3);
  });

  it('maps very-unhealthy to the very_unhealthy range color', () => {
    const cards = [
      makeCard({ _id: 's1', value: 150, status: 'very-unhealthy' }),
    ];
    const distribution = countLevelDistribution(cards, mockAqiConfig);
    const veryUnhealthy = distribution.find(
      entry => entry.level === 'very-unhealthy'
    );
    expect(veryUnhealthy?.count).toBe(1);
    expect(veryUnhealthy?.color).toBe('#8B5CF6');
  });

  it('counts everything as no-value without a config', () => {
    const cards = [makeCard({ _id: 's1', value: 4, status: 'no-value' })];
    const distribution = countLevelDistribution(cards, null);
    const noValue = distribution.find(entry => entry.level === 'no-value');
    expect(noValue?.count).toBe(1);
  });
});

describe('getFriendlyErrorMessage', () => {
  it('returns an actionable message for 429 rate limits', () => {
    const error = {
      response: { status: 429, headers: { 'retry-after': '30' } },
      message: 'Request failed with status code 429',
    };
    expect(getFriendlyErrorMessage(error)).toContain('wait a moment');
  });

  it('detects status codes embedded in string messages', () => {
    expect(
      getFriendlyErrorMessage('Request failed with status code 429')
    ).toContain('wait a moment');
    expect(
      getFriendlyErrorMessage('Request failed with status code 500')
    ).toContain('temporarily unavailable');
  });

  it('reads the backend message from response.data for axios-style errors', () => {
    const error = {
      message: 'Request failed with status code 400',
      response: {
        status: 400,
        data: {
          message: 'Unable to process measurements for the provided Cohort ID',
        },
      },
    };
    expect(getFriendlyErrorMessage(error)).toContain(
      'No active devices with measurements'
    );
  });

  it('returns null for aborted requests', () => {
    const error = new Error('canceled');
    Object.assign(error, { code: 'ERR_CANCELED' });
    expect(getFriendlyErrorMessage(error)).toBeNull();
  });

  it('falls back to the raw message for other errors', () => {
    expect(getFriendlyErrorMessage(new Error('something broke'))).toBe(
      'something broke'
    );
  });
});

describe('buildFleetAverageSeries', () => {
  it('averages chart-data points per day and sorts chronologically', () => {
    const chartData = [
      {
        time: '2026-08-10',
        value: 10,
        site: 'Kisumu',
        site_id: 's1',
        device_id: '',
      },
      {
        time: '2026-08-10',
        value: 20,
        site: 'Kampala',
        site_id: 's2',
        device_id: '',
      },
      {
        time: '2026-08-11',
        value: 30,
        site: 'Kisumu',
        site_id: 's1',
        device_id: '',
      },
    ];
    const series = buildFleetAverageSeries(chartData);
    expect(series).toHaveLength(2);
    expect(series[0]).toMatchObject({ time: '2026-08-10', value: 15 });
    expect(series[1]).toMatchObject({ time: '2026-08-11', value: 30 });
  });

  it('returns an empty array for empty input', () => {
    expect(buildFleetAverageSeries(null)).toEqual([]);
    expect(buildFleetAverageSeries([])).toEqual([]);
  });
});
