import { formatDistanceToNow, parseISO } from 'date-fns';
import type {
  RankingEntry,
  RankingHistoryEntry,
  RankingsSort,
} from '@/shared/types/api';
import type { NormalizedChartData } from '@/shared/components/charts/types';

/**
 * Format the `generated_at` timestamp of a rankings snapshot for display.
 * Falls back to the raw value when the date cannot be parsed.
 */
export const formatRankingsGeneratedAt = (
  generatedAt?: string | null
): string => {
  if (!generatedAt) return 'Recently';

  try {
    const parsed = parseISO(generatedAt);
    if (Number.isNaN(parsed.getTime())) {
      return 'Recently';
    }
    return `${formatDistanceToNow(parsed, { addSuffix: true })}`;
  } catch {
    return 'Recently';
  }
};

/**
 * Canonical sort for live rankings: order entries by `avg_pm2_5` so the UI
 * always reflects the selected direction, regardless of the order the API
 * happened to return. `worst` = descending (highest PM2.5 first), `best` =
 * ascending. Entries without a numeric value sort last either way, and the
 * `rank` field is re-assigned from the resulting position so the displayed
 * rank always matches the visible order.
 */
export const sortRankingEntries = (
  entries: RankingEntry[],
  sort: RankingsSort
): RankingEntry[] => {
  const withValue: RankingEntry[] = [];
  const withoutValue: RankingEntry[] = [];

  for (const entry of entries) {
    if (typeof entry.avg_pm2_5 === 'number') {
      withValue.push(entry);
    } else {
      withoutValue.push(entry);
    }
  }

  withValue.sort((left, right) =>
    sort === 'worst'
      ? (right.avg_pm2_5 as number) - (left.avg_pm2_5 as number)
      : (left.avg_pm2_5 as number) - (right.avg_pm2_5 as number)
  );

  return [...withValue, ...withoutValue].map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
};

/**
 * Sort historical ranking entries so the entity with the most recent
 * recorded value comes first, using `avg_pm2_5` of the latest non-null year.
 */
export const sortHistoryEntriesByLatestValue = (
  entries: RankingHistoryEntry[]
): RankingHistoryEntry[] => {
  if (!Array.isArray(entries)) {
    return [];
  }

  const getLatestValue = (entry: RankingHistoryEntry): number => {
    for (let index = entry.values.length - 1; index >= 0; index--) {
      const value = entry.values[index];
      if (value && typeof value.avg_pm2_5 === 'number') {
        return value.avg_pm2_5;
      }
    }
    return -1;
  };

  return [...entries].sort(
    (left, right) => getLatestValue(right) - getLatestValue(left)
  );
};

/**
 * Build a chart-friendly representation of the historical comparison.
 * Each yearly value becomes a data point shaped for the shared DynamicChart
 * (`time` = year label, `value` = PM2.5, `site` = entity name).
 * Years without data are skipped rather than rendered as zero.
 */
export const buildHistoryChartData = (
  entries: RankingHistoryEntry[],
  maxEntities = 10
): NormalizedChartData[] => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return sortHistoryEntriesByLatestValue(entries)
    .slice(0, maxEntities)
    .flatMap(entry =>
      entry.values
        .filter(value => value && typeof value.avg_pm2_5 === 'number')
        .map(value => ({
          time: String(value.year),
          value: value.avg_pm2_5 as number,
          site: entry.name,
          site_id: entry.name,
          device_id: entry.name,
          rawTime: String(value.year),
        }))
    );
};
