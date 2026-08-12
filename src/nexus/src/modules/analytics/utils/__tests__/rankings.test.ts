import {
  formatRankingsGeneratedAt,
  sortHistoryEntriesByLatestValue,
  buildHistoryChartData,
} from '../rankings';
import type { RankingHistoryEntry } from '@/shared/types/api';

describe('rankings utils', () => {
  describe('formatRankingsGeneratedAt', () => {
    it('returns "Recently" for missing or invalid timestamps', () => {
      expect(formatRankingsGeneratedAt(undefined)).toBe('Recently');
      expect(formatRankingsGeneratedAt(null)).toBe('Recently');
      expect(formatRankingsGeneratedAt('not-a-date')).toBe('Recently');
    });

    it('formats a valid timestamp relative to now', () => {
      const recent = new Date(Date.now() - 60_000).toISOString();
      expect(formatRankingsGeneratedAt(recent)).toContain('minute');
    });
  });

  describe('sortHistoryEntriesByLatestValue', () => {
    it('sorts entries by their latest non-null value, descending', () => {
      const entries: RankingHistoryEntry[] = [
        {
          name: 'Uganda',
          level: 'country',
          country_code: 'ug',
          values: [
            { year: 2024, avg_pm2_5: null, aqi_category: null, site_count: 0 },
            { year: 2025, avg_pm2_5: 40, aqi_category: 'moderate', site_count: 2 },
          ],
        },
        {
          name: 'Kenya',
          level: 'country',
          country_code: 'ke',
          values: [
            { year: 2024, avg_pm2_5: 10, aqi_category: 'good', site_count: 1 },
            { year: 2025, avg_pm2_5: 25, aqi_category: 'moderate', site_count: 3 },
          ],
        },
        {
          name: 'NoData',
          level: 'country',
          country_code: null,
          values: [
            { year: 2024, avg_pm2_5: null, aqi_category: null, site_count: 0 },
          ],
        },
      ];

      const sorted = sortHistoryEntriesByLatestValue(entries);
      expect(sorted.map(entry => entry.name)).toEqual([
        'Uganda',
        'Kenya',
        'NoData',
      ]);
    });

    it('does not mutate the input and tolerates non-array input', () => {
      const entries: RankingHistoryEntry[] = [];
      expect(sortHistoryEntriesByLatestValue(entries)).toEqual([]);
      expect(
        sortHistoryEntriesByLatestValue(
          undefined as unknown as RankingHistoryEntry[]
        )
      ).toEqual([]);
    });
  });

  describe('buildHistoryChartData', () => {
    it('skips years without data and caps the number of entities', () => {
      const entries: RankingHistoryEntry[] = Array.from(
        { length: 15 },
        (_, index) => ({
          name: `Entity ${index}`,
          level: 'country' as const,
          country_code: null,
          values: [
            { year: 2024, avg_pm2_5: null, aqi_category: null, site_count: 0 },
            {
              year: 2025,
              avg_pm2_5: index + 1,
              aqi_category: 'good',
              site_count: 1,
            },
          ],
        })
      );

      const chartData = buildHistoryChartData(entries, 10);
      expect(chartData).toHaveLength(10);
      expect(chartData.every(point => typeof point.value === 'number')).toBe(
        true
      );
      expect(chartData.every(point => point.time === '2025')).toBe(true);
      expect(chartData[0]).toMatchObject({
        site: 'Entity 14',
        device_id: 'Entity 14',
        rawTime: '2025',
      });
    });

    it('returns an empty array for empty or invalid input', () => {
      expect(buildHistoryChartData([])).toEqual([]);
      expect(
        buildHistoryChartData(undefined as unknown as RankingHistoryEntry[])
      ).toEqual([]);
    });
  });
});
