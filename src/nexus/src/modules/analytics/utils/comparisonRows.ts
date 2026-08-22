import type { RecentReading } from '@/shared/types/api';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';

/**
 * One row of the "Compare locations" table. Rows exist for EVERY selected
 * location — a location whose reading is missing renders an honest
 * "No reading" row (hasReading: false), never a silently-omitted line.
 */
export interface ComparisonRow {
  siteId: string;
  siteName: string;
  hasReading: boolean;
  /** Numeric AQI index (e.g. 72); null when there is no reading. */
  aqiIndex: number | null;
  /** CSS-ready hex color ('#ECAA06'); null when there is no reading. */
  aqiColor: string | null;
  /** Human category text (aqi_color_name, falling back to aqi_category). */
  aqiCategory: string;
  pm2_5: number | null;
  pm10: number | null;
  no2: number | null;
  /** ISO timestamp of the reading; null when there is no reading. */
  readingTime: string | null;
  /** Formatted local time, e.g. "14:05 · Aug 22". */
  lastReadingLabel: string;
  /** "<1h ago" / "3h ago" / "2d ago" / "No reading". */
  freshnessLabel: string;
}

export type ComparisonSortKey =
  'name' | 'aqi' | 'pm2_5' | 'pm10' | 'no2' | 'time';
export type ComparisonSortDir = 'asc' | 'desc';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * The backend sends `aqi_color` as hex WITHOUT a leading # ("ECAA06").
 * Normalize defensively: trim, return null for empty values and pass values
 * that already carry a # straight through.
 */
export const normalizeAqiColor = (
  color: string | null | undefined
): string | null => {
  const trimmed = color?.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

/** Rounds a pollutant value to 1 decimal; non-finite/null → null. */
export const roundPollutantValue = (
  value: number | null | undefined
): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(value * 10) / 10;
};

/**
 * Freshness bucket for the reading age in hours:
 * `<1h ago` / `Xh ago` / `Xd ago`, or "No reading" when absent/invalid.
 */
export const getFreshnessLabel = (hours: number | null | undefined): string => {
  if (typeof hours !== 'number' || !Number.isFinite(hours) || hours < 0) {
    return 'No reading';
  }
  if (hours < 1) return '<1h ago';
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

/** Local-time label for a reading timestamp, e.g. "14:05 · Aug 22". */
export const formatLastReading = (
  isoTime: string | null | undefined
): string => {
  if (!isoTime) return '—';
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())} · ${
    MONTHS[date.getMonth()]
  } ${date.getDate()}`;
};

const pollutantValue = (
  reading: RecentReading,
  key: 'pm2_5' | 'pm10' | 'no2'
): number | null => roundPollutantValue(reading[key]?.value);

/** Builds a display row from a recent-readings API measurement. */
export const buildComparisonRow = (reading: RecentReading): ComparisonRow => {
  const hasReading = !!reading;
  const time = hasReading && reading.time ? reading.time : null;

  return {
    siteId: reading?.site_id ?? '',
    siteName: reading?.siteDetails
      ? getSiteDisplayName(reading.siteDetails)
      : (reading?.site_id ?? ''),
    hasReading,
    aqiIndex:
      hasReading && typeof reading.aqi_index === 'number'
        ? reading.aqi_index
        : null,
    aqiColor: hasReading ? normalizeAqiColor(reading.aqi_color) : null,
    aqiCategory: hasReading
      ? (reading.aqi_color_name || reading.aqi_category || '').trim()
      : '',
    pm2_5: hasReading ? pollutantValue(reading, 'pm2_5') : null,
    pm10: hasReading ? pollutantValue(reading, 'pm10') : null,
    no2: hasReading ? pollutantValue(reading, 'no2') : null,
    readingTime: time,
    lastReadingLabel: formatLastReading(time),
    freshnessLabel: hasReading
      ? getFreshnessLabel(reading.timeDifferenceHours)
      : 'No reading',
  };
};

/**
 * Honest placeholder row for a selected location the response did not cover
 * (valid-but-unknown site id, or no recent reading). Rendered with "—"
 * values and a muted "No reading" pill — never silently omitted.
 */
export const buildEmptyComparisonRow = (
  siteId: string,
  siteName: string
): ComparisonRow => ({
  siteId,
  siteName,
  hasReading: false,
  aqiIndex: null,
  aqiColor: null,
  aqiCategory: '',
  pm2_5: null,
  pm10: null,
  no2: null,
  readingTime: null,
  lastReadingLabel: '—',
  freshnessLabel: 'No reading',
});

const sortValueFor = (
  row: ComparisonRow,
  key: ComparisonSortKey
): number | string | null => {
  switch (key) {
    case 'name':
      return row.siteName.toLowerCase();
    case 'aqi':
      return row.aqiIndex;
    case 'pm2_5':
      return row.pm2_5;
    case 'pm10':
      return row.pm10;
    case 'no2':
      return row.no2;
    case 'time':
      return row.readingTime;
  }
};

/**
 * Sorts comparison rows without mutating the input. The default
 * (`key: 'aqi'`, `dir: 'desc'`) is the specialist "league table": worst AQI
 * first, locations without readings last, ties broken alphabetically.
 * Null values always sink to the bottom regardless of direction.
 */
export const sortComparisonRows = (
  rows: ComparisonRow[],
  key: ComparisonSortKey = 'aqi',
  dir: ComparisonSortDir = 'desc'
): ComparisonRow[] =>
  [...rows].sort((a, b) => {
    const valueA = sortValueFor(a, key);
    const valueB = sortValueFor(b, key);

    if (valueA === null && valueB === null) {
      return a.siteName.localeCompare(b.siteName);
    }
    if (valueA === null) return 1;
    if (valueB === null) return -1;

    const result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    if (result !== 0) return dir === 'asc' ? result : -result;
    return a.siteName.localeCompare(b.siteName);
  });
