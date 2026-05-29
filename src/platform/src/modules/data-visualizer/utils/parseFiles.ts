import Papa from 'papaparse';
import readExcelFile, {
  readSheet,
  type Sheet,
  type SheetData,
} from 'read-excel-file/browser';
import { MAX_UPLOAD_FILE_SIZE_BYTES, MAX_VISUALIZER_ROWS } from '../constants';
import type {
  SheetOption,
  UploadedCellValue,
  UploadedDataset,
  UploadedDataRow,
} from '../types';
import { makeUniqueHeaders, normalizeHeader } from './dataProfiling';

type ParsedCsvRow = Record<string, unknown>;

interface ParseUploadedFileOptions {
  sheetName?: string;
  knownSheets?: SheetOption[];
  label?: string;
}

const CSV_EXTENSIONS = ['.csv'];
const XLSX_EXTENSIONS = ['.xlsx'];
const LEGACY_EXCEL_EXTENSIONS = ['.xls', '.xlsm', '.xlsb'];

const getFileExtension = (fileName: string) => {
  const match = fileName.toLowerCase().match(/\.[^.]+$/);
  return match?.[0] ?? '';
};

export const getReadableFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const createDatasetId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `dataset-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createDatasetLabel = (file: File, sheetName?: string) => {
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return sheetName ? `${baseName} - ${sheetName}` : baseName;
};

const normalizeCellValue = (value: unknown): UploadedCellValue => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const stringValue = String(value)
    .replace(/\u0000/g, '')
    .trim();
  return stringValue || null;
};

const isEmptyCell = (value: unknown) => normalizeCellValue(value) === null;

const countFilledCells = (row: readonly unknown[]) =>
  row.reduce<number>((count, cell) => count + (isEmptyCell(cell) ? 0 : 1), 0);

const findHeaderRowIndex = (rows: SheetData) => {
  const inspectedRows = rows.slice(0, 25);
  let bestIndex = 0;
  let bestScore = 0;

  inspectedRows.forEach((row, index) => {
    const filledCellCount = countFilledCells(row);
    const hasLikelyDataAfter =
      rows[index + 1] && countFilledCells(rows[index + 1]) >= 2;
    const score = filledCellCount + (hasLikelyDataAfter ? 2 : 0);

    if (score > bestScore && filledCellCount >= 2) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
};

const rowsFromSheetData = (
  sheetData: SheetData,
  maxRows: number
): {
  rows: UploadedDataRow[];
  columns: string[];
  sourceRowCount: number;
  truncated: boolean;
} => {
  const nonEmptyRows = sheetData.filter(row => countFilledCells(row) > 0);

  if (nonEmptyRows.length === 0) {
    return {
      rows: [],
      columns: [],
      sourceRowCount: 0,
      truncated: false,
    };
  }

  const headerRowIndex = findHeaderRowIndex(nonEmptyRows);
  const headerRow = nonEmptyRows[headerRowIndex] ?? [];
  const columns = makeUniqueHeaders(
    headerRow.map((value, index) => normalizeHeader(value, index))
  );
  const dataRows = nonEmptyRows.slice(headerRowIndex + 1);
  const limitedRows = dataRows.slice(0, maxRows);
  const rows = limitedRows
    .map(row => {
      const record: UploadedDataRow = {};

      columns.forEach((column, index) => {
        record[column] = normalizeCellValue(row[index]);
      });

      return record;
    })
    .filter(row =>
      Object.values(row).some(value => normalizeCellValue(value) !== null)
    );

  return {
    rows,
    columns,
    sourceRowCount: dataRows.length,
    truncated: dataRows.length > maxRows,
  };
};

const getExcelSheetName = (sheet: Sheet): string => sheet.sheet || 'Sheet';

const parseCsvFile = (
  file: File,
  options: ParseUploadedFileOptions
): Promise<UploadedDataset> =>
  new Promise((resolve, reject) => {
    Papa.parse<ParsedCsvRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      worker:
        typeof Papa.WORKERS_SUPPORTED === 'boolean' &&
        Papa.WORKERS_SUPPORTED &&
        file.size > 1024 * 1024,
      transformHeader: (header, index) => normalizeHeader(header, index),
      complete: results => {
        const warnings = results.errors.slice(0, 5).map(error => {
          const row =
            typeof error.row === 'number' ? `row ${error.row + 1}` : 'file';
          return `${row}: ${error.message}`;
        });
        const fields = makeUniqueHeaders(results.meta.fields ?? []);
        const allRows = results.data.filter(Boolean);
        const limitedRows = allRows.slice(0, MAX_VISUALIZER_ROWS);
        const rows = limitedRows
          .map(rawRow => {
            const record: UploadedDataRow = {};

            fields.forEach(field => {
              record[field] = normalizeCellValue(rawRow[field]);
            });

            return record;
          })
          .filter(row =>
            Object.values(row).some(value => normalizeCellValue(value) !== null)
          );

        if (allRows.length > MAX_VISUALIZER_ROWS) {
          warnings.push(
            `Only the first ${MAX_VISUALIZER_ROWS.toLocaleString()} rows were loaded to keep charts responsive.`
          );
        }

        resolve({
          id: createDatasetId(),
          label: options.label || createDatasetLabel(file),
          fileName: file.name,
          fileType: 'csv',
          sheetOptions: [],
          rows,
          columns: fields,
          rowCount: rows.length,
          sourceRowCount: allRows.length,
          warnings,
          uploadedAt: new Date().toISOString(),
        });
      },
      error: error => reject(error),
    });
  });

const buildExcelDataset = (
  file: File,
  sheetName: string,
  sheetOptions: SheetOption[],
  sheetData: SheetData,
  label?: string
): UploadedDataset => {
  const parsedSheet = rowsFromSheetData(sheetData, MAX_VISUALIZER_ROWS);
  const warnings: string[] = [];

  if (parsedSheet.truncated) {
    warnings.push(
      `Only the first ${MAX_VISUALIZER_ROWS.toLocaleString()} rows from "${sheetName}" were loaded to keep charts responsive.`
    );
  }

  return {
    id: createDatasetId(),
    label: label || createDatasetLabel(file, sheetName),
    fileName: file.name,
    fileType: 'xlsx',
    sheetName,
    sheetOptions,
    rows: parsedSheet.rows,
    columns: parsedSheet.columns,
    rowCount: parsedSheet.rows.length,
    sourceRowCount: parsedSheet.sourceRowCount,
    warnings,
    uploadedAt: new Date().toISOString(),
  };
};

const parseExcelFile = async (
  file: File,
  options: ParseUploadedFileOptions
): Promise<UploadedDataset> => {
  if (options.sheetName && options.knownSheets?.length) {
    const sheetData = await readSheet(file, options.sheetName);

    return buildExcelDataset(
      file,
      options.sheetName,
      options.knownSheets,
      sheetData,
      options.label
    );
  }

  const sheets = await readExcelFile(file);
  const sheetOptions = sheets.map(sheet => ({
    name: getExcelSheetName(sheet),
    rowCount: Math.max(0, sheet.data.length - 1),
  }));
  const selectedSheet =
    sheets.find(sheet => countFilledCells(sheet.data[0] ?? []) > 0) ||
    sheets[0];

  if (!selectedSheet) {
    throw new Error('No readable sheets were found in this workbook.');
  }

  return buildExcelDataset(
    file,
    getExcelSheetName(selectedSheet),
    sheetOptions,
    selectedSheet.data,
    options.label
  );
};

export const parseUploadedFile = async (
  file: File,
  options: ParseUploadedFileOptions = {}
): Promise<UploadedDataset> => {
  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new Error(
      `This file is ${getReadableFileSize(file.size)}. Please upload a file under ${getReadableFileSize(MAX_UPLOAD_FILE_SIZE_BYTES)}.`
    );
  }

  const extension = getFileExtension(file.name);

  if (CSV_EXTENSIONS.includes(extension)) {
    return parseCsvFile(file, options);
  }

  if (XLSX_EXTENSIONS.includes(extension)) {
    return parseExcelFile(file, options);
  }

  if (LEGACY_EXCEL_EXTENSIONS.includes(extension)) {
    throw new Error(
      'This Excel format is not supported here. Save the workbook as .xlsx or CSV and upload it again.'
    );
  }

  throw new Error('Upload a CSV or XLSX file.');
};

export const parseUploadedFiles = async (files: File[]) => {
  const datasets: UploadedDataset[] = [];
  const errors: Array<{ fileName: string; message: string }> = [];

  for (const file of files) {
    try {
      datasets.push(await parseUploadedFile(file));
    } catch (error) {
      errors.push({
        fileName: file.name,
        message:
          error instanceof Error ? error.message : 'Could not parse file.',
      });
    }
  }

  return { datasets, errors };
};
