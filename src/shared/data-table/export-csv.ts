import React from 'react';

/*
 * Writes table rows to a CSV download, using each column's `render` output so the
 * file matches what is on screen.
 *
 * Lifted from `handleExport` and `normalizeToString` in
 * vertex/components/shared/table/ReusableTable.tsx, where it is built into the
 * table. Here it is a plain function so any table (./multi-select-table via
 * `searchActions`, or a Beacon page table) can offer the ./table-export-modal.
 * Choosing the rows (current page, filtered set, or a server export) stays with
 * the caller, as Vertex's `scope` and `onExport` did. papaparse is loaded on demand.
 */
export interface ExportColumn<T> {
  key: string;
  title?: string;
  label?: React.ReactNode;
  render?: (value: never, item: T) => React.ReactNode;
}

export interface AdditionalExportField {
  key: string;
  title: string;
}

interface ExportTableToCsvOptions<T> {
  rows: T[];
  columns: ExportColumn<T>[];
  /** Raw fields that are not table columns (Vertex's `additionalExportFields`). */
  additionalFields?: AdditionalExportField[];
  /** Keys picked in the export dialog. */
  selectedColumns: string[];
  /** Becomes `<title>_export.csv`, lower-cased with spaces as underscores. */
  title: string;
}

// Normalize any value to a searchable string
export const normalizeToString = (value: unknown): string => {
  if (value == null) return '';
  if (Array.isArray(value)) {
    return value
      .map(v => normalizeToString(v))
      .filter(Boolean)
      .join(' ');
  }
  const t = typeof value;
  if (t === 'string') return value as string;
  if (t === 'number' || t === 'boolean') return String(value);
  if (t === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === 'string') return obj.name as string;
    if (typeof obj.long_name === 'string') return obj.long_name as string;
    if (typeof obj.label === 'string') return obj.label as string;
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return '';
};

// Extract text from React elements
const extractText = (element: unknown): string => {
  if (typeof element === 'string' || typeof element === 'number') {
    return String(element);
  }
  if (React.isValidElement(element)) {
    const props = element.props as { children?: unknown };
    if (props.children) {
      if (Array.isArray(props.children)) {
        return props.children.map(extractText).join(' ');
      }
      return extractText(props.children);
    }
  }
  return '';
};

export async function exportTableToCsv<T extends object>({
  rows,
  columns,
  additionalFields = [],
  selectedColumns,
  title,
}: ExportTableToCsvOptions<T>): Promise<void> {
  // Dynamically import papaparse
  const Papa = (await import('papaparse')).default;

  const csvData = rows.map(item => {
    const row: Record<string, string> = {};
    selectedColumns.forEach(colKey => {
      const colDef = columns.find(c => c.key === colKey);
      const additionalField = additionalFields.find(f => f.key === colKey);
      const rawValue = (item as Record<string, unknown>)[colKey];

      if (colDef) {
        // Use the column's render function to get the exact displayed value
        let displayValue = '';

        try {
          const rendered = colDef.render
            ? colDef.render(rawValue as never, item)
            : rawValue;

          // Extract text from rendered content
          if (typeof rendered === 'string' || typeof rendered === 'number') {
            displayValue = String(rendered);
          } else if (React.isValidElement(rendered)) {
            displayValue = extractText(rendered);
          } else {
            // Fallback to raw value
            displayValue = normalizeToString(rawValue);
          }
        } catch {
          // If render fails, use raw value
          displayValue = normalizeToString(rawValue);
        }

        // Use the column title (or label) as it appears in the table header
        const columnHeader =
          colDef.title ||
          (typeof colDef.label === 'string' ? colDef.label : String(colKey));
        row[columnHeader] = displayValue;
      } else if (additionalField) {
        // If it's an additional field, use raw value
        row[additionalField.title] = normalizeToString(rawValue);
      }
    });
    return row;
  });

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
