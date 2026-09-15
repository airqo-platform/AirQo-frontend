import Papa from 'papaparse';
import type { ComparisonRow } from '../../utils/comparisonRows';

/**
 * Sanitises a string CSV cell against formula-injection attacks.
 *
 * Excel, Google Sheets, and LibreOffice execute cells whose first meaningful
 * character is one of `=`, `+`, `-`, `@`, tab, or carriage return. Prefixing
 * a single quote `'` forces the spreadsheet to treat the cell as literal text.
 *
 * @see https://owasp.org/www-community/attacks/CSV_Injection
 */
const sanitizeCsvCell = (value: string): string => {
  // Check the raw first character (tab / CR are attack chars themselves).
  if (value.length > 0 && /^[=+\-@\t\r]/.test(value[0])) {
    return `'${value}`;
  }
  // Also catch leading whitespace followed by a dangerous char.
  const trimmed = value.trimStart();
  if (trimmed.length > 0 && /^[=+\-@]/.test(trimmed[0])) {
    return `'${value}`;
  }
  return value;
};

/**
 * CSV export for the comparison (latest-readings) table. Column order mirrors
 * the table exactly; missing values render as the table renders them —
 * pollutants as "—", AQI as "No reading". All values are stringified before
 * being handed to papaparse so quoting/escaping is uniform (a comma or quote
 * in a site name is escaped per RFC 4180). The file is written with a UTF-8
 * BOM so Excel opens it with the correct encoding (matches the data-export
 * convention in `dataExportFile.stringifyCsv`).
 */
export const COMPARISON_EXPORT_HEADERS = [
  'Site',
  'AQI',
  'PM2.5',
  'PM10',
  'NO2',
  'Last reading',
  'Freshness',
];

const formatPollutantForExport = (value: number | null): string =>
  value === null ? '—' : value.toFixed(1);

/** One CSV cell per column, matching the table's rendering of each row. */
const buildComparisonRowCells = (row: ComparisonRow): string[] => [
  sanitizeCsvCell(row.siteName),
  row.hasReading ? String(row.aqiIndex ?? '—') : sanitizeCsvCell('No reading'),
  formatPollutantForExport(row.pm2_5),
  formatPollutantForExport(row.pm10),
  formatPollutantForExport(row.no2),
  sanitizeCsvCell(row.lastReadingLabel),
  sanitizeCsvCell(row.freshnessLabel),
];

/**
 * Builds the CSV text (with BOM) for the given comparison rows. CSV only:
 * the rows are small (per selected sites, ≤ 80) and fully client-side, so
 * XLSX/PDF generation would add no value this round.
 */
export const buildComparisonCsv = (rows: ComparisonRow[]): string => {
  const records = rows.map(buildComparisonRowCells);
  // quotes: false (papaparse's default) — only quote cells that actually
  // contain a delimiter, quote, or newline; numbers stay bare.
  const csv = Papa.unparse([COMPARISON_EXPORT_HEADERS, ...records], {
    newline: '\r\n',
  });
  return `\uFEFF${csv}`;
};

/** `air-quality-comparison-<yyyy-MM-dd>.csv` (local-time date, zero-padded). */
export const buildComparisonFilename = (date: Date = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `air-quality-comparison-${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}.csv`;
};

/**
 * Builds the CSV and downloads it client-side (Blob + hidden anchor, mirroring
 * the `useDataDownload` download flow). Returns the filename used.
 */
export const downloadComparisonCsv = (rows: ComparisonRow[]): string => {
  const csv = buildComparisonCsv(rows);
  const filename = buildComparisonFilename();

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
};
