import { DataDownloadRequest, DataDownloadResponse } from '@/shared/types/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { POLLUTANT_LABELS } from '@/shared/components/charts/constants';
import { areArraysEqual } from '@/shared/utils/arrays';
import { TabType } from '../types/dataExportTypes';

export type DownloadColumnGroupId =
  | 'location'
  | 'core'
  | 'metadata'
  | 'pollutants';

export interface DownloadColumnOption {
  key: string;
  label: string;
  group: DownloadColumnGroupId;
}

export interface DownloadColumnGroup {
  id: DownloadColumnGroupId;
  title: string;
  options: DownloadColumnOption[];
}

export interface DownloadFileTransformOptions {
  selectedColumnKeys?: string[];
}

export interface DownloadPdfSummaryItem {
  label: string;
  value: string;
}

export interface DownloadPdfOptions {
  title?: string;
  subtitle?: string;
  summaryItems?: DownloadPdfSummaryItem[];
  footerText?: string;
  preserveSelectedColumns?: boolean;
  allowLargePdf?: boolean;
}

type DownloadRecord = Record<string, unknown>;

const formatColumnLabel = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/Pm2 5/g, 'PM2.5')
    .replace(/Pm10/g, 'PM10');

const normalizeSelectedColumnKeys = (selectedColumnKeys?: string[]) =>
  Array.from(new Set((selectedColumnKeys || []).filter(Boolean)));

const isPlainObject = (value: unknown): value is DownloadRecord =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const parseCsvRows = (csvText: string): string[][] => {
  const normalizedCsv = csvText.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let index = 0; index < normalizedCsv.length; index += 1) {
    const char = normalizedCsv[index];

    if (inQuotes) {
      if (char === '"') {
        const nextChar = normalizedCsv[index + 1];
        if (nextChar === '"') {
          currentField += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      currentRow.push(currentField);
      currentField = '';
    } else if (char === '\n') {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else if (char === '\r') {
      continue;
    } else {
      currentField += char;
    }
  }

  currentRow.push(currentField);
  rows.push(currentRow);

  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    if (lastRow.length === 1 && lastRow[0] === '') {
      rows.pop();
    }
  }

  return rows;
};

export const parseDownloadCsvRows = (csvText: string): string[][] =>
  parseCsvRows(csvText);

const escapeCsvValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringValue = String(value);
  const trimmedValue = stringValue.trimStart();
  const firstVisibleCharacter = trimmedValue[0];
  const needsNeutralize =
    firstVisibleCharacter === '=' ||
    firstVisibleCharacter === '+' ||
    firstVisibleCharacter === '-' ||
    firstVisibleCharacter === '@' ||
    stringValue.charAt(0) === '\t' ||
    stringValue.charAt(0) === '\r';
  const prefixedValue = needsNeutralize ? `'${stringValue}` : stringValue;

  return `"${prefixedValue.replace(/"/g, '""')}"`;
};

const getRecordHeaders = (records: DownloadRecord[]) => {
  const headers: string[] = [];
  const seenHeaders = new Set<string>();

  records.forEach(record => {
    Object.keys(record).forEach(key => {
      if (!seenHeaders.has(key)) {
        seenHeaders.add(key);
        headers.push(key);
      }
    });
  });

  return headers;
};

const pickRecordColumnsForCsv = (record: DownloadRecord, headers: string[]) => {
  const filteredRecord: DownloadRecord = {};

  headers.forEach(header => {
    filteredRecord[header] = record[header] ?? '';
  });

  return filteredRecord;
};

const pickRecordColumnsForJson = (
  record: DownloadRecord,
  headers: string[],
  preserveMissingColumns = false
) => {
  const filteredRecord: DownloadRecord = {};

  headers.forEach(header => {
    if (preserveMissingColumns) {
      filteredRecord[header] = record[header] ?? '';
      return;
    }

    if (Object.prototype.hasOwnProperty.call(record, header)) {
      filteredRecord[header] = record[header];
    }
  });

  return filteredRecord;
};

const stringifyCsv = (headers: string[], records: DownloadRecord[]) => {
  const lines = [headers.map(escapeCsvValue).join(',')];

  records.forEach(record => {
    const row = headers.map(header => escapeCsvValue(record[header]));
    lines.push(row.join(','));
  });

  return `\uFEFF${lines.join('\n')}`;
};

const resolveSelectedHeaders = (
  availableHeaders: string[],
  selectedColumnKeys?: string[],
  preserveSelectedColumns = false
) => {
  const normalizedSelectedColumnKeys =
    normalizeSelectedColumnKeys(selectedColumnKeys);

  if (normalizedSelectedColumnKeys.length === 0) {
    return availableHeaders;
  }

  if (preserveSelectedColumns) {
    return normalizedSelectedColumnKeys;
  }

  const selectedHeaders = normalizedSelectedColumnKeys.filter(key =>
    availableHeaders.includes(key)
  );

  if (selectedHeaders.length === 0) {
    throw new Error(
      'None of the selected export columns match the available data columns.'
    );
  }

  return selectedHeaders;
};

const extractDownloadRecords = (response: DataDownloadResponse | string) => {
  if (typeof response === 'string') {
    const rows = parseCsvRows(response);
    const [headers = [], ...dataRows] = rows;

    const records = dataRows.map(row => {
      const record: DownloadRecord = {};

      headers.forEach((header, index) => {
        record[header] = row[index] ?? '';
      });

      return record;
    });

    return {
      records,
      headers,
      responseObject: null as DataDownloadResponse | null,
    };
  }

  const records = response.data.map(item => (isPlainObject(item) ? item : {}));

  return {
    records,
    headers: getRecordHeaders(records),
    responseObject: response,
  };
};

export const getDownloadColumnGroups = (
  activeTab: TabType,
  selectedPollutants: string[]
): DownloadColumnGroup[] => {
  const locationOption =
    activeTab === 'sites'
      ? { key: 'site_name', label: 'Site name' }
      : activeTab === 'devices'
        ? { key: 'device_name', label: 'Device name' }
        : activeTab === 'countries'
          ? { key: 'country_name', label: 'Country name' }
          : { key: 'city_name', label: 'City name' };

  const uniquePollutants = Array.from(
    new Set(selectedPollutants.filter(Boolean))
  );

  return [
    {
      id: 'location',
      title: 'Location',
      options: [{ ...locationOption, group: 'location' }],
    },
    {
      id: 'core',
      title: 'Core Data',
      options: [
        { key: 'datetime', label: 'Date and time', group: 'core' },
        { key: 'frequency', label: 'Frequency', group: 'core' },
        { key: 'network', label: 'Sensor Manufacturer', group: 'core' },
      ],
    },
    {
      id: 'metadata',
      title: 'Metadata',
      options: [
        { key: 'latitude', label: 'Latitude', group: 'metadata' },
        { key: 'longitude', label: 'Longitude', group: 'metadata' },
        { key: 'temperature', label: 'Temperature', group: 'metadata' },
        { key: 'humidity', label: 'Humidity', group: 'metadata' },
      ],
    },
    {
      id: 'pollutants',
      title: 'Pollutants',
      options: uniquePollutants.flatMap(pollutant => {
        const pollutantLabel =
          POLLUTANT_LABELS[pollutant as keyof typeof POLLUTANT_LABELS] ||
          formatColumnLabel(pollutant);

        return [
          {
            key: pollutant,
            label: pollutantLabel,
            group: 'pollutants' as const,
          },
          {
            key: `${pollutant}_calibrated_value`,
            label: `${pollutantLabel} calibrated`,
            group: 'pollutants' as const,
          },
        ];
      }),
    },
  ];
};

export const getDownloadColumnOptions = (
  activeTab: TabType,
  selectedPollutants: string[]
) =>
  getDownloadColumnGroups(activeTab, selectedPollutants).flatMap(
    group => group.options
  );

export const getDownloadColumnLabelMap = (
  activeTab: TabType,
  selectedPollutants: string[]
) =>
  Object.fromEntries(
    getDownloadColumnOptions(activeTab, selectedPollutants).map(option => [
      option.key,
      option.label,
    ])
  );

export const getDefaultDownloadColumnKeys = (
  activeTab: TabType,
  selectedPollutants: string[]
) =>
  getDownloadColumnOptions(activeTab, selectedPollutants).map(
    option => option.key
  );

export const buildDownloadFileContent = (
  response: DataDownloadResponse | string,
  downloadType: DataDownloadRequest['downloadType'],
  selectedColumnKeys?: string[],
  preserveSelectedColumns = false
) => {
  const { records, headers, responseObject } = extractDownloadRecords(response);
  const selectedHeaders = resolveSelectedHeaders(
    headers,
    selectedColumnKeys,
    preserveSelectedColumns
  );
  const normalizedSelectedColumnKeys =
    normalizeSelectedColumnKeys(selectedColumnKeys);
  const hasExplicitColumnFilter = normalizedSelectedColumnKeys.length > 0;
  const isCsv = downloadType === 'csv';

  if (isCsv) {
    const filteredRows = records.map(record =>
      pickRecordColumnsForCsv(record, selectedHeaders)
    );

    return {
      content: stringifyCsv(selectedHeaders, filteredRows),
      mimeType: 'text/csv;charset=utf-8;',
      extension: 'csv' as const,
    };
  }

  if (responseObject) {
    if (
      !hasExplicitColumnFilter ||
      (!preserveSelectedColumns && areArraysEqual(selectedHeaders, headers))
    ) {
      return {
        content: JSON.stringify(responseObject, null, 2),
        mimeType: 'application/json;charset=utf-8;',
        extension: 'json' as const,
      };
    }

    const filteredData = responseObject.data.map(item =>
      pickRecordColumnsForJson(
        isPlainObject(item) ? item : {},
        selectedHeaders,
        preserveSelectedColumns
      )
    );

    return {
      content: JSON.stringify(
        {
          ...responseObject,
          data: filteredData,
        },
        null,
        2
      ),
      mimeType: 'application/json;charset=utf-8;',
      extension: 'json' as const,
    };
  }

  const filteredData = records.map(record =>
    pickRecordColumnsForJson(record, selectedHeaders, preserveSelectedColumns)
  );

  return {
    content: JSON.stringify(filteredData, null, 2),
    mimeType: 'application/json;charset=utf-8;',
    extension: 'json' as const,
  };
};

const formatPdfValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(item => formatPdfValue(item)).join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

export const buildDownloadPdfBlob = (
  response: DataDownloadResponse | string,
  selectedColumnKeys?: string[],
  options: DownloadPdfOptions = {}
) => {
  const { records, headers } = extractDownloadRecords(response);
  const selectedHeaders = resolveSelectedHeaders(
    headers,
    selectedColumnKeys,
    options.preserveSelectedColumns
  );
  const filteredRows = records.map(record =>
    pickRecordColumnsForCsv(record, selectedHeaders)
  );
  const totalCells = filteredRows.length * selectedHeaders.length;
  const exceedsPdfLimit =
    !options.allowLargePdf &&
    (filteredRows.length > 2000 || totalCells > 12000);

  if (exceedsPdfLimit) {
    throw new Error(
      'Export too large for PDF; please reduce rows/columns or use CSV.'
    );
  }

  const title = options.title || 'AirQo Data Export';
  const subtitle =
    options.subtitle || 'Prepared export with a polished PDF layout.';
  const summaryItems = options.summaryItems || [];
  const doc = new jsPDF({
    orientation: selectedHeaders.length > 6 ? 'landscape' : 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  const summaryRows = Math.ceil(summaryItems.length / 2);
  const headerLineY = summaryItems.length > 0 ? 62 + summaryRows * 12 + 8 : 60;
  const tableStartY = summaryItems.length > 0 ? headerLineY + 12 : 78;

  autoTable(doc, {
    head: [selectedHeaders.map(formatColumnLabel)],
    body: filteredRows.map(record =>
      selectedHeaders.map(header => formatPdfValue(record[header]))
    ),
    startY: tableStartY,
    margin: { top: tableStartY, left: margin, right: margin, bottom: 44 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: () => {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(title, margin, 28);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(subtitle, margin, 44, { maxWidth: contentWidth });

      if (summaryItems.length > 0) {
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);

        summaryItems.forEach((item, index) => {
          const columnIndex = index % 2;
          const rowIndex = Math.floor(index / 2);
          const x = margin + columnIndex * (contentWidth / 2);
          const y = 62 + rowIndex * 12;
          const label = `${item.label}: `;
          const valueX = x + 72;

          doc.text(label, x, y, { maxWidth: 68 });
          doc.setFont('helvetica', 'normal');
          doc.text(item.value || '—', valueX, y, {
            maxWidth: contentWidth / 2 - 80,
          });
          doc.setFont('helvetica', 'bold');
        });
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, headerLineY, pageWidth - margin, headerLineY);
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    doc.setPage(pageIndex);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      options.footerText || 'Generated by AirQo Data Export',
      margin,
      pageHeight - 20
    );
    doc.text(
      `Page ${pageIndex} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 20,
      {
        align: 'right',
      }
    );
  }

  return doc.output('blob');
};
