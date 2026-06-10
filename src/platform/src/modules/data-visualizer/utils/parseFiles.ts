import Papa from 'papaparse';
import readExcelFile, { readSheet, type Sheet } from 'read-excel-file/browser';
import { MAX_UPLOAD_FILE_SIZE_BYTES, MAX_VISUALIZER_ROWS } from '../constants';
import type {
  SheetOption,
  UploadedCellValue,
  UploadedDataset,
  UploadedDataRow,
} from '../types';
import { makeUniqueHeaders, normalizeHeader } from './dataProfiling';

interface ParseUploadedFileOptions {
  sheetName?: string;
  knownSheets?: SheetOption[];
  label?: string;
  signal?: AbortSignal;
}

type TabularRow = readonly unknown[];
type TabularData = readonly TabularRow[];

const CSV_EXTENSIONS = ['.csv'];
const XLSX_EXTENSIONS = ['.xlsx'];
const LEGACY_EXCEL_EXTENSIONS = ['.xls', '.xlsm', '.xlsb'];
const CSV_HEADER_SCAN_ROWS = 25;
const CSV_RETAINED_ROW_LIMIT = MAX_VISUALIZER_ROWS + CSV_HEADER_SCAN_ROWS + 1;

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

export const buildSourceFileKey = (
  file: Pick<File, 'name' | 'size' | 'lastModified'>
) => `${file.name}:${file.size}:${file.lastModified}`;

const createAbortError = (signal?: AbortSignal) => {
  if (signal?.reason instanceof Error) {
    return signal.reason;
  }

  const error = new Error('Upload cancelled');
  error.name = 'AbortError';
  return error;
};

export const isAbortError = (error: unknown): error is Error =>
  error instanceof Error && error.name === 'AbortError';

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw createAbortError(signal);
  }
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

const findHeaderRowIndex = (rows: TabularData) => {
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
  sheetData: TabularData,
  maxRows: number,
  sourceRowCountOverride?: number
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
    sourceRowCount: sourceRowCountOverride ?? dataRows.length,
    truncated: (sourceRowCountOverride ?? dataRows.length) > maxRows,
  };
};

const getExcelSheetName = (sheet: Sheet): string => sheet.sheet || 'Sheet';

const parseCsvFileWithWorker = (
  file: File,
  options: ParseUploadedFileOptions,
  useWorker: boolean
): Promise<UploadedDataset> =>
  new Promise((resolve, reject) => {
    const { signal } = options;
    const retainedRows: TabularRow[] = [];
    let nonEmptyRowCount = 0;
    const warnings: string[] = [];
    let activeParser: Papa.Parser | null = null;

    throwIfAborted(signal);

    const handleAbort = () => {
      activeParser?.abort();
    };

    signal?.addEventListener('abort', handleAbort, { once: true });

    Papa.parse<unknown[]>(file, {
      header: false,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      worker: useWorker,
      // Use `step` (not `chunk`) — step is the reliable row-by-row streaming
      // API for worker:false. The `chunk` callback has known issues in Next.js
      // where it causes `complete` to receive undefined, breaking the parse.
      step: (results, parser) => {
        activeParser = parser;

        if (signal?.aborted) {
          parser.abort();
          return;
        }

        if (!results) return;

        (results.errors ?? []).slice(0, 5 - warnings.length).forEach(error => {
          const row =
            typeof error.row === 'number' ? `row ${error.row + 1}` : 'file';
          warnings.push(`${row}: ${error.message}`);
        });

        // With step + header:false, results.data is the current row (unknown[])
        const row = results.data as readonly unknown[];

        if (!Array.isArray(row) || countFilledCells(row) === 0) {
          return;
        }

        nonEmptyRowCount += 1;

        if (retainedRows.length < CSV_RETAINED_ROW_LIMIT) {
          retainedRows.push(row);
        }
      },
      complete: results => {
        signal?.removeEventListener('abort', handleAbort);

        if (signal?.aborted) {
          reject(createAbortError(signal));
          return;
        }

        if (!results) {
          reject(new Error('CSV parsing failed. Try re-uploading the file.'));
          return;
        }
        (results.errors ?? []).slice(0, 5 - warnings.length).forEach(error => {
          const row =
            typeof error.row === 'number' ? `row ${error.row + 1}` : 'file';
          warnings.push(`${row}: ${error.message}`);
        });

        const headerRowIndex =
          retainedRows.length > 0 ? findHeaderRowIndex(retainedRows) : 0;
        const sourceRowCount = Math.max(
          0,
          nonEmptyRowCount - headerRowIndex - 1
        );
        const parsedCsv = rowsFromSheetData(
          retainedRows,
          MAX_VISUALIZER_ROWS,
          sourceRowCount
        );

        if (parsedCsv.truncated) {
          warnings.push(
            `Only the first ${MAX_VISUALIZER_ROWS.toLocaleString()} rows were loaded to keep charts responsive.`
          );
        }

        resolve({
          id: createDatasetId(),
          label: options.label || createDatasetLabel(file),
          fileName: file.name,
          sourceFileKey: buildSourceFileKey(file),
          fileType: 'csv',
          sheetOptions: [],
          rows: parsedCsv.rows,
          columns: parsedCsv.columns,
          rowCount: parsedCsv.rows.length,
          sourceRowCount: parsedCsv.sourceRowCount,
          warnings,
          uploadedAt: new Date().toISOString(),
        });
      },
      error: error => {
        signal?.removeEventListener('abort', handleAbort);
        reject(signal?.aborted ? createAbortError(signal) : error);
      },
    });
  });

const parseCsvFile = async (
  file: File,
  options: ParseUploadedFileOptions
): Promise<UploadedDataset> => {
  // PapaParse workers are incompatible with Next.js/webpack module bundling.
  // The worker URL cannot be resolved at runtime, causing the complete/chunk
  // callbacks to receive undefined and the Promise to never settle (infinite load).
  // Always parse on the main thread — chunk streaming keeps peak memory bounded.
  return parseCsvFileWithWorker(file, options, false);
};

const buildExcelDataset = (
  file: File,
  sheetName: string,
  sheetOptions: SheetOption[],
  sheetData: TabularData,
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
    sourceFileKey: buildSourceFileKey(file),
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
  throwIfAborted(options.signal);

  if (options.sheetName && options.knownSheets?.length) {
    const sheetData = await readSheet(file, options.sheetName);

    throwIfAborted(options.signal);

    return buildExcelDataset(
      file,
      options.sheetName,
      options.knownSheets,
      sheetData,
      options.label
    );
  }

  const sheets = await readExcelFile(file);

  throwIfAborted(options.signal);

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
  throwIfAborted(options.signal);

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

export const parseUploadedFiles = async (
  files: File[],
  signal?: AbortSignal
) => {
  const datasets: UploadedDataset[] = [];
  const errors: Array<{ fileName: string; message: string }> = [];

  for (const file of files) {
    throwIfAborted(signal);

    try {
      datasets.push(await parseUploadedFile(file, { signal }));
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      errors.push({
        fileName: file.name,
        message:
          error instanceof Error ? error.message : 'Could not parse file.',
      });
    }
  }

  throwIfAborted(signal);

  return { datasets, errors };
};
