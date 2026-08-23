import {
  formatRankingsGeneratedAt,
  sortRankingEntries,
  sortHistoryEntriesByLatestValue,
  buildHistoryChartData,
} from '../rankings';
import type {
  RankingEntry,
  RankingHistoryEntry,
} from '@/shared/types/api';

const makeEntry = (
  name: string,
  avgPm25: number | null,
  rank = 1
): RankingEntry => ({
  rank,
  name,
  level: 'country',
  country_code: null,
  avg_pm2_5: avgPm25,
  aqi_index: avgPm25,
  aqi_category: 'good',
  site_count: 1,
  generated_at: '2026-08-12T17:02:04.561Z',
});

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

  describe('sortRankingEntries', () => {
    it('sorts worst-first (descending PM2.5) and re-assigns ranks', () => {
      const entries = [
        makeEntry('Kenya', 22.83, 7),
        makeEntry('Malawi', 102.7, 11),
        makeEntry('Senegal', 4.3, 1),
        makeEntry('Uganda', 28.33, 10),
      ];

      const sorted = sortRankingEntries(entries, 'worst');

      expect(sorted.map(entry => entry.name)).toEqual([
        'Malawi',
        'Uganda',
        'Kenya',
        'Senegal',
      ]);
      expect(sorted.map(entry => entry.rank)).toEqual([1, 2, 3, 4]);
    });

    it('sorts cleanest-first (ascending PM2.5) and re-assigns ranks', () => {
      const entries = [
        makeEntry('Kenya', 22.83, 7),
        makeEntry('Malawi', 102.7, 1),
        makeEntry('Senegal', 4.3, 11),
        makeEntry('Uganda', 28.33, 10),
      ];

      const sorted = sortRankingEntries(entries, 'best');

      expect(sorted.map(entry => entry.name)).toEqual([
        'Senegal',
        'Kenya',
        'Uganda',
        'Malawi',
      ]);
      expect(sorted.map(entry => entry.rank)).toEqual([1, 2, 3, 4]);
    });

    it('keeps entries without a value at the end in both directions', () => {
      const entries = [
        makeEntry('NoData', null, 2),
        makeEntry('Mid', 15, 3),
        makeEntry('Low', 5, 1),
      ];

      expect(sortRankingEntries(entries, 'worst').map(e => e.name)).toEqual([
        'Mid',
        'Low',
        'NoData',
      ]);
      expect(sortRankingEntries(entries, 'best').map(e => e.name)).toEqual([
        'Low',
        'Mid',
        'NoData',
      ]);
    });

    it('re-assigns contiguous 1..N ranks even when entries lack values', () => {
      const entries = [
        makeEntry('NoData', null, 99),
        makeEntry('Mid', 15, 3),
        makeEntry('Low', 5, 1),
      ];

      const sorted = sortRankingEntries(entries, 'worst');
      expect(sorted.map(entry => entry.rank)).toEqual([1, 2, 3]);
      expect(sorted[2]).toMatchObject({ name: 'NoData', rank: 3 });
    });

    it('does not mutate the input array', () => {
      const entries = [makeEntry('A', 10, 1), makeEntry('B', 20, 2)];
      const copy = [...entries];
      sortRankingEntries(entries, 'worst');
      expect(entries).toEqual(copy);
    });

    it('returns an empty array for empty input', () => {
      expect(sortRankingEntries([], 'worst')).toEqual([]);
      expect(sortRankingEntries([], 'best')).toEqual([]);
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
