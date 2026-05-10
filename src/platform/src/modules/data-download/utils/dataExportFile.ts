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

export interface DownloadWorkbookOptions {
  activeTab: TabType;
  preserveSelectedColumns?: boolean;
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

const formatBaseColumnLabel = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/Pm2 5/g, 'PM2.5')
    .replace(/Pm10/g, 'PM10');

const SENSOR_PREFIX_LABELS = {
  s1: 'Sensor 1',
  s2: 'Sensor 2',
} as const;

const formatColumnLabel = (key: string): string => {
  const sensorMatch = key.match(/^(s[12])_(.+)$/);

  if (sensorMatch) {
    const [, sensorPrefix, remainder] = sensorMatch;
    const sensorLabel =
      SENSOR_PREFIX_LABELS[sensorPrefix as keyof typeof SENSOR_PREFIX_LABELS] ||
      sensorPrefix.toUpperCase();

    return `${sensorLabel} ${formatColumnLabel(remainder)}`;
  }

  return formatBaseColumnLabel(key);
};

const normalizeSelectedColumnKeys = (selectedColumnKeys?: string[]) =>
  Array.from(new Set((selectedColumnKeys || []).filter(Boolean)));

const isPlainObject = (value: unknown): value is DownloadRecord =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const getNormalizedString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
};

const normalizeDownloadRecord = (record: DownloadRecord): DownloadRecord => {
  const normalizedRecord: DownloadRecord = { ...record };

  const existingDatetime = getNormalizedString(normalizedRecord['datetime']);
  if (existingDatetime) {
    normalizedRecord['datetime'] = existingDatetime;
    return normalizedRecord;
  }

  const dateValue =
    getNormalizedString(normalizedRecord['date_time']) ||
    getNormalizedString(normalizedRecord['dateTime']) ||
    getNormalizedString(normalizedRecord['date']) ||
    getNormalizedString(normalizedRecord['day']) ||
    getNormalizedString(normalizedRecord['timestamp']) ||
    getNormalizedString(normalizedRecord['week_start']) ||
    getNormalizedString(normalizedRecord['week_end']) ||
    getNormalizedString(normalizedRecord['week']) ||
    getNormalizedString(normalizedRecord['month']) ||
    getNormalizedString(normalizedRecord['period_start']) ||
    getNormalizedString(normalizedRecord['period_end']) ||
    getNormalizedString(normalizedRecord['period']) ||
    getNormalizedString(normalizedRecord['created_at']) ||
    getNormalizedString(normalizedRecord['updated_at']);

  const timeValue =
    getNormalizedString(normalizedRecord['time']) ||
    getNormalizedString(normalizedRecord['time_of_day']);

  if (dateValue && timeValue) {
    normalizedRecord['datetime'] = `${dateValue} ${timeValue}`;
  } else if (dateValue) {
    normalizedRecord['datetime'] = dateValue;
  }

  return normalizedRecord;
};

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
  selectedColumnKeys?: string[]
) => {
  const normalizedSelectedColumnKeys =
    normalizeSelectedColumnKeys(selectedColumnKeys);

  if (normalizedSelectedColumnKeys.length === 0) {
    return availableHeaders;
  }

  const selectedHeaders = normalizedSelectedColumnKeys.flatMap(key => {
    if (availableHeaders.includes(key)) {
      return [key];
    }

    const sensorAliasHeaders = [`s1_${key}`, `s2_${key}`].filter(alias =>
      availableHeaders.includes(alias)
    );

    if (sensorAliasHeaders.length > 0) {
      return sensorAliasHeaders;
    }

    return [];
  });

  if (selectedHeaders.length === 0) {
    if (availableHeaders.length > 0) {
      return availableHeaders;
    }

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

      return normalizeDownloadRecord(record);
    });

    return {
      records,
      headers,
      responseObject: null as DataDownloadResponse | null,
    };
  }

  const records = response.data.map(item =>
    normalizeDownloadRecord(isPlainObject(item) ? item : {})
  );

  return {
    records,
    headers: getRecordHeaders(records),
    responseObject: {
      ...response,
      data: records,
    } as unknown as DataDownloadResponse,
  };
};

export const getDownloadColumnGroups = (
  activeTab: TabType,
  selectedPollutants: string[],
  dataType: string = 'raw'
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
  const useCalibratedColumns = dataType === 'calibrated';

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
      options: uniquePollutants.map(pollutant => {
        const pollutantLabel =
          POLLUTANT_LABELS[pollutant as keyof typeof POLLUTANT_LABELS] ||
          formatColumnLabel(pollutant);

        return {
          key: useCalibratedColumns
            ? `${pollutant}_calibrated_value`
            : pollutant,
          label: useCalibratedColumns
            ? `${pollutantLabel} calibrated`
            : pollutantLabel,
          group: 'pollutants' as const,
        };
      }),
    },
  ];
};

export const getDownloadColumnOptions = (
  activeTab: TabType,
  selectedPollutants: string[],
  dataType: string = 'raw'
) =>
  getDownloadColumnGroups(activeTab, selectedPollutants, dataType).flatMap(
    group => group.options
  );

export const getDownloadColumnLabelMap = (
  activeTab: TabType,
  selectedPollutants: string[],
  dataType: string = 'raw'
) =>
  Object.fromEntries(
    getDownloadColumnOptions(activeTab, selectedPollutants, dataType).map(
      option => [option.key, option.label]
    )
  );

export const getDefaultDownloadColumnKeys = (
  activeTab: TabType,
  selectedPollutants: string[],
  dataType: string = 'raw'
) =>
  getDownloadColumnOptions(activeTab, selectedPollutants, dataType).map(
    option => option.key
  );

export const buildDownloadFileContent = (
  response: DataDownloadResponse | string,
  downloadType: DataDownloadRequest['downloadType'],
  selectedColumnKeys?: string[],
  preserveSelectedColumns = false
) => {
  const { records, headers, responseObject } = extractDownloadRecords(response);
  const selectedHeaders = resolveSelectedHeaders(headers, selectedColumnKeys);
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

const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const EXCEL_MAX_SHEET_NAME_LENGTH = 31;
const EXCEL_MAX_ROWS_PER_SHEET = 1048576;

interface ZipFileEntry {
  path: string;
  data: string | Uint8Array;
}

interface WorksheetGroup {
  name: string;
  records: DownloadRecord[];
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
})();

const calculateCrc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;

  data.forEach(byte => {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });

  return (crc ^ 0xffffffff) >>> 0;
};

const concatUint8Arrays = (parts: Uint8Array[]) => {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach(part => {
    result.set(part, offset);
    offset += part.length;
  });

  return result;
};

const createZipArchive = (files: ZipFileEntry[]) => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  files.forEach(file => {
    const fileName = encoder.encode(file.path);
    const fileData =
      typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
    const crc = calculateCrc32(fileData);
    const localHeader = new Uint8Array(30 + fileName.length);
    const localView = new DataView(localHeader.buffer);

    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, fileData.length, true);
    localView.setUint32(22, fileData.length, true);
    localView.setUint16(26, fileName.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(fileName, 30);

    localParts.push(localHeader, fileData);

    const centralHeader = new Uint8Array(46 + fileName.length);
    const centralView = new DataView(centralHeader.buffer);

    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, fileData.length, true);
    centralView.setUint32(24, fileData.length, true);
    centralView.setUint16(28, fileName.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(fileName, 46);

    centralParts.push(centralHeader);
    localOffset += localHeader.length + fileData.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);

  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralDirectory.length, true);
  endView.setUint32(16, localOffset, true);
  endView.setUint16(20, 0, true);

  return concatUint8Arrays([...localParts, centralDirectory, endRecord]);
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const sanitizeXmlText = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

const normalizeSpreadsheetText = (value: string) => {
  const trimmedValue = value.trimStart();
  const firstVisibleCharacter = trimmedValue[0];
  const needsNeutralize =
    firstVisibleCharacter === '=' ||
    firstVisibleCharacter === '+' ||
    firstVisibleCharacter === '-' ||
    firstVisibleCharacter === '@' ||
    value.charAt(0) === '\t' ||
    value.charAt(0) === '\r';

  return needsNeutralize ? `'${value}` : value;
};

const formatSpreadsheetValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(item => formatSpreadsheetValue(item)).join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const getColumnName = (columnIndex: number) => {
  let dividend = columnIndex + 1;
  let columnName = '';

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
};

const buildWorksheetCellXml = (
  cellReference: string,
  value: unknown,
  styleId?: number
) => {
  const styleAttribute = styleId ? ` s="${styleId}"` : '';

  if (value === null || value === undefined || value === '') {
    return `<c r="${cellReference}"${styleAttribute}/>`;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${cellReference}"${styleAttribute}><v>${value}</v></c>`;
  }

  if (typeof value === 'boolean') {
    return `<c r="${cellReference}" t="b"${styleAttribute}><v>${value ? 1 : 0}</v></c>`;
  }

  const text = sanitizeXmlText(
    normalizeSpreadsheetText(formatSpreadsheetValue(value))
  );
  const preserveSpace = /^\s|\s$/.test(text) ? ' xml:space="preserve"' : '';

  return `<c r="${cellReference}" t="inlineStr"${styleAttribute}><is><t${preserveSpace}>${escapeXml(text)}</t></is></c>`;
};

const buildWorksheetXml = (headers: string[], records: DownloadRecord[]) => {
  if (records.length + 1 > EXCEL_MAX_ROWS_PER_SHEET) {
    throw new Error(
      `Excel worksheets support up to ${EXCEL_MAX_ROWS_PER_SHEET.toLocaleString()} rows. Please reduce the export size.`
    );
  }

  const rows = [
    headers,
    ...records.map(record => headers.map(header => record[header] ?? '')),
  ];
  const columnWidths = headers.map((header, columnIndex) => {
    const maxContentLength = rows.reduce((maxLength, row) => {
      const textLength = formatSpreadsheetValue(row[columnIndex]).length;
      return Math.max(maxLength, textLength);
    }, header.length);

    return Math.min(Math.max(maxContentLength + 2, 10), 42);
  });
  const lastColumnName =
    headers.length > 0 ? getColumnName(headers.length - 1) : 'A';
  const columnXml = columnWidths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
    )
    .join('');
  const rowsXml = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cellsXml = row
        .map((value, columnIndex) =>
          buildWorksheetCellXml(
            `${getColumnName(columnIndex)}${rowNumber}`,
            value,
            rowIndex === 0 ? 1 : undefined
          )
        )
        .join('');

      return `<row r="${rowNumber}">${cellsXml}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <cols>${columnXml}</cols>
  <sheetData>${rowsXml}</sheetData>
  <autoFilter ref="A1:${lastColumnName}1"/>
</worksheet>`;
};

const getWorksheetGroupName = (record: DownloadRecord, activeTab: TabType) => {
  const keyCandidates: Record<TabType, string[]> = {
    sites: [
      'site_name',
      'location_name',
      'search_name',
      'formatted_name',
      'name',
      'site_id',
    ],
    devices: ['device_name', 'device_id', 'site_name', 'site_id'],
    countries: [
      'site_name',
      'location_name',
      'search_name',
      'formatted_name',
      'site_id',
      'country_name',
      'country',
    ],
    cities: [
      'site_name',
      'location_name',
      'search_name',
      'formatted_name',
      'site_id',
      'city_name',
      'city',
    ],
  };

  for (const key of keyCandidates[activeTab]) {
    const value = getNormalizedString(record[key]);
    if (value) {
      return value;
    }
  }

  return 'Unknown Location';
};

const groupRecordsByWorksheet = (
  records: DownloadRecord[],
  activeTab: TabType
): WorksheetGroup[] => {
  if (records.length === 0) {
    return [{ name: 'Data', records: [] }];
  }

  const groupedRecords = new Map<string, DownloadRecord[]>();

  records.forEach(record => {
    const groupName = getWorksheetGroupName(record, activeTab);
    const existingRecords = groupedRecords.get(groupName);

    if (existingRecords) {
      existingRecords.push(record);
    } else {
      groupedRecords.set(groupName, [record]);
    }
  });

  return Array.from(groupedRecords.entries()).map(([name, groupRecords]) => ({
    name,
    records: groupRecords,
  }));
};

const getSafeWorksheetNames = (groups: WorksheetGroup[]) => {
  const usedNames = new Set<string>();

  return groups.map((group, index) => {
    const fallbackName = `Location ${index + 1}`;
    let baseName = (group.name || fallbackName)
      .replace(/[:\\/?*[\]]/g, ' ')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^'+|'+$/g, '')
      .trim();

    if (!baseName) {
      baseName = fallbackName;
    }

    baseName = baseName.slice(0, EXCEL_MAX_SHEET_NAME_LENGTH).trim();

    if (!baseName) {
      baseName = fallbackName;
    }

    let candidate = baseName;
    let suffixIndex = 2;

    while (usedNames.has(candidate.toLowerCase())) {
      const suffix = ` (${suffixIndex})`;
      candidate = `${baseName.slice(0, EXCEL_MAX_SHEET_NAME_LENGTH - suffix.length).trim()}${suffix}`;
      suffixIndex += 1;
    }

    usedNames.add(candidate.toLowerCase());
    return candidate;
  });
};

const buildWorkbookXml = (
  sheetNames: string[]
) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheetNames
      .map(
        (name, index) =>
          `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
      )
      .join('')}
  </sheets>
</workbook>`;

const buildWorkbookRelationshipsXml = (
  sheetCount: number
) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${Array.from(
    { length: sheetCount },
    (_, index) =>
      `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
  ).join('')}
  <Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const buildContentTypesXml = (
  sheetCount: number
) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${Array.from(
    { length: sheetCount },
    (_, index) =>
      `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join('')}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const ROOT_RELATIONSHIPS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;

const buildCorePropertiesXml = () => {
  const createdAt = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>AirQo</dc:creator>
  <dc:title>AirQo Data Export</dc:title>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
</cp:coreProperties>`;
};

const buildAppPropertiesXml = (
  sheetNames: string[]
) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>AirQo Analytics</Application>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>${sheetNames.length}</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="${sheetNames.length}" baseType="lpstr">
      ${sheetNames.map(name => `<vt:lpstr>${escapeXml(name)}</vt:lpstr>`).join('')}
    </vt:vector>
  </TitlesOfParts>
</Properties>`;

export const buildDownloadXlsxBlob = (
  response: DataDownloadResponse | string,
  selectedColumnKeys: string[] | undefined,
  options: DownloadWorkbookOptions
) => {
  const { records, headers } = extractDownloadRecords(response);
  const selectedHeaders = resolveSelectedHeaders(headers, selectedColumnKeys);

  if (selectedHeaders.length === 0) {
    throw new Error('No export columns are available for this workbook.');
  }

  const groups = groupRecordsByWorksheet(records, options.activeTab);
  const sheetNames = getSafeWorksheetNames(groups);
  const worksheetFiles = groups.map((group, index) => ({
    path: `xl/worksheets/sheet${index + 1}.xml`,
    data: buildWorksheetXml(
      selectedHeaders,
      group.records.map(record =>
        pickRecordColumnsForCsv(record, selectedHeaders)
      )
    ),
  }));
  const workbookBytes = createZipArchive([
    { path: '[Content_Types].xml', data: buildContentTypesXml(groups.length) },
    { path: '_rels/.rels', data: ROOT_RELATIONSHIPS_XML },
    { path: 'xl/workbook.xml', data: buildWorkbookXml(sheetNames) },
    {
      path: 'xl/_rels/workbook.xml.rels',
      data: buildWorkbookRelationshipsXml(groups.length),
    },
    { path: 'xl/styles.xml', data: STYLES_XML },
    { path: 'docProps/core.xml', data: buildCorePropertiesXml() },
    { path: 'docProps/app.xml', data: buildAppPropertiesXml(sheetNames) },
    ...worksheetFiles,
  ]);

  return new Blob([workbookBytes], { type: XLSX_MIME_TYPE });
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
  const selectedHeaders = resolveSelectedHeaders(headers, selectedColumnKeys);
  const filteredRows = records.map(record =>
    pickRecordColumnsForCsv(record, selectedHeaders)
  );
  const totalCells = filteredRows.length * selectedHeaders.length;
  const exceedsPdfLimit =
    !options.allowLargePdf &&
    (filteredRows.length > 5000 || totalCells > 50000);

  if (exceedsPdfLimit) {
    throw new Error(
      'Export too large for PDF; please reduce rows/columns or use CSV.'
    );
  }

  const title = options.title || 'AirQo Data Export';
  const subtitle = options.subtitle?.trim() || '';
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

      if (subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(subtitle, margin, 44, { maxWidth: contentWidth });
      }

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
