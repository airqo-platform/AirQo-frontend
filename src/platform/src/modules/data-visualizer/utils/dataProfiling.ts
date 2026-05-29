import type {
  ColumnProfile,
  DatasetProfile,
  UploadedCellValue,
  UploadedDataRow,
} from '../types';

const TIME_COLUMN_PATTERN =
  /\b(date|time|datetime|timestamp|created|updated|observed|period|day|month|year)\b/i;
const METRIC_COLUMN_PATTERN =
  /(pm\s*2[\W_]*5|pm25|pm_?2_?5|pm10|aqi|concentration|value|reading|no2|o3|so2|co\b|temperature|humidity)/i;
const DIMENSION_COLUMN_PATTERN =
  /(site|device|sensor|location|station|city|country|region|district|name|id|network|provider)/i;

export const normalizeHeader = (value: unknown, index: number) => {
  const text = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  return text || `Column ${index + 1}`;
};

export const makeUniqueHeaders = (headers: string[]) => {
  const seen = new Map<string, number>();

  return headers.map((header, index) => {
    const fallback = normalizeHeader(header, index);
    const seenKey = fallback.toLowerCase();
    const count = seen.get(seenKey) ?? 0;
    seen.set(seenKey, count + 1);

    return count === 0 ? fallback : `${fallback} ${count + 1}`;
  });
};

export const formatCellValue = (value: UploadedCellValue | undefined) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  }

  return String(value);
};

export const parseNumberValue = (
  value: UploadedCellValue | undefined
): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'boolean' || value instanceof Date || value == null) {
    return null;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed
    .replace(/,/g, '')
    .replace(/\s*(ug\/m3|µg\/m³|µg\/m3|ppm|ppb|c|%|percent)\s*$/i, '');

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseDateValue = (
  value: UploadedCellValue | undefined
): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    if (value > 100000000000) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (value > 1000000000) {
      const date = new Date(value * 1000);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || /^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return new Date(parsed);
};

const getColumnValue = (row: UploadedDataRow, column: string) => row[column];

const getColumnPriority = (column: string, pattern: RegExp) =>
  pattern.test(column) ? 0 : 1;

export const profileDataset = (
  rows: UploadedDataRow[],
  options?: { includeDateRange?: boolean }
): DatasetProfile => {
  const columns = Object.keys(rows[0] ?? {});
  const profiles: ColumnProfile[] = columns.map(column => {
    const values = rows.map(row => getColumnValue(row, column));
    const nonEmptyValues = values.filter(value => {
      const formatted = formatCellValue(value);
      return formatted.trim() !== '';
    });
    const numericCount = nonEmptyValues.filter(
      value => parseNumberValue(value) !== null
    ).length;
    const dateCount = nonEmptyValues.filter(
      value => parseDateValue(value) !== null
    ).length;
    const uniqueValues = new Set(
      nonEmptyValues.map(value => formatCellValue(value).trim())
    );
    const nonEmptyCount = nonEmptyValues.length;
    const numericRatio = nonEmptyCount > 0 ? numericCount / nonEmptyCount : 0;
    const dateRatio = nonEmptyCount > 0 ? dateCount / nonEmptyCount : 0;
    const uniqueRatio =
      nonEmptyCount > 0 ? uniqueValues.size / Math.max(nonEmptyCount, 1) : 0;
    const sampleValues = Array.from(uniqueValues).slice(0, 4);

    let kind: ColumnProfile['kind'] = 'empty';

    if (nonEmptyCount > 0) {
      if (
        dateRatio >= 0.6 ||
        (TIME_COLUMN_PATTERN.test(column) && dateCount > 0)
      ) {
        kind = 'time';
      } else if (
        numericRatio >= 0.7 ||
        (METRIC_COLUMN_PATTERN.test(column) && numericCount > 0)
      ) {
        kind = 'numeric';
      } else if (
        DIMENSION_COLUMN_PATTERN.test(column) ||
        uniqueRatio <= 0.65 ||
        uniqueValues.size <= 50
      ) {
        kind = 'dimension';
      } else {
        kind = 'mixed';
      }
    }

    return {
      name: column,
      kind,
      nonEmptyCount,
      numericCount,
      dateCount,
      uniqueCount: uniqueValues.size,
      sampleValues,
    };
  });

  const timeColumns = profiles
    .filter(profile => profile.kind === 'time')
    .sort(
      (a, b) =>
        getColumnPriority(a.name, TIME_COLUMN_PATTERN) -
        getColumnPriority(b.name, TIME_COLUMN_PATTERN)
    )
    .map(profile => profile.name);

  const numericColumns = profiles
    .filter(profile => profile.kind === 'numeric')
    .sort(
      (a, b) =>
        getColumnPriority(a.name, METRIC_COLUMN_PATTERN) -
        getColumnPriority(b.name, METRIC_COLUMN_PATTERN)
    )
    .map(profile => profile.name);

  const dimensionColumns = profiles
    .filter(profile => profile.kind === 'dimension')
    .sort(
      (a, b) =>
        getColumnPriority(a.name, DIMENSION_COLUMN_PATTERN) -
        getColumnPriority(b.name, DIMENSION_COLUMN_PATTERN)
    )
    .map(profile => profile.name);

  // Compute date range — only when explicitly requested (expensive: O(rows × timeColumns))
  let minDate: Date | undefined;
  let maxDate: Date | undefined;
  if (options?.includeDateRange) {
    timeColumns.forEach(column => {
      rows.forEach(row => {
        const d = parseDateValue(row[column]);
        if (!d) return;
        if (!minDate || d < minDate) minDate = d;
        if (!maxDate || d > maxDate) maxDate = d;
      });
    });
  }

  return {
    columns: profiles,
    numericColumns,
    timeColumns,
    dimensionColumns,
    defaultTimeColumn: timeColumns[0],
    defaultMetricColumn: numericColumns[0],
    defaultSecondaryMetricColumn: numericColumns[1],
    defaultCompareColumn: dimensionColumns[0],
    minDate,
    maxDate,
  };
};
