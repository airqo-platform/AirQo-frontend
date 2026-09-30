/**
 * Generic CSV building utilities shared by client-side exports.
 *
 * Follows the conventions established by
 * `src/modules/analytics/components/comparison/comparisonExport.ts`: UTF-8 BOM
 * so Excel picks the right encoding, CRLF line endings, every field quoted,
 * and formula-injection neutralization for spreadsheet apps.
 */

/**
 * Sanitises a string CSV cell against formula-injection attacks.
 *
 * Excel, Google Sheets, and LibreOffice execute cells whose first meaningful
 * character is one of `=`, `+`, `-`, `@`, tab, or carriage return. Prefixing
 * a single quote `'` forces the spreadsheet to treat the cell as literal text.
 *
 * @see https://owasp.org/www-community/attacks/CSV_Injection
 */
export const sanitizeCsvCell = (value: string): string => {
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
 * Sanitises a cell, then quotes it per RFC 4180: inner double quotes are
 * doubled and the whole cell is wrapped in double quotes.
 */
export const escapeCsvCell = (value: string): string =>
  `"${sanitizeCsvCell(value).replace(/"/g, '""')}"`;

/**
 * Builds the full CSV text: UTF-8 BOM prefix, CRLF-joined lines, and every
 * cell (headers included) escaped and quoted.
 */
export const buildCsv = (
  headers: readonly string[],
  rows: readonly (readonly string[])[]
): string => {
  const lines = [headers, ...rows].map(row =>
    row.map(cell => escapeCsvCell(cell)).join(',')
  );
  return `\uFEFF${lines.join('\r\n')}`;
};

/** `<prefix>-<yyyy-MM-dd>.csv` (local-time date, zero-padded). */
export const buildCsvFilename = (
  prefix: string,
  date: Date = new Date()
): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${prefix}-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}.csv`;
};

/**
 * Downloads the given CSV text client-side via a Blob + hidden anchor click,
 * then revokes the object URL (mirrors `downloadComparisonCsv`).
 */
export const downloadCsv = (filename: string, csvContent: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
