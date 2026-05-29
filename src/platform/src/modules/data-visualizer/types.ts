export type UploadedCellValue = string | number | boolean | Date | null;

export type UploadedDataRow = Record<string, UploadedCellValue | undefined>;

export interface SheetOption {
  name: string;
  rowCount: number;
}

export interface UploadedDataset {
  id: string;
  label: string;
  fileName: string;
  fileType: 'csv' | 'xlsx';
  sheetName?: string;
  sheetOptions: SheetOption[];
  rows: UploadedDataRow[];
  columns: string[];
  rowCount: number;
  sourceRowCount: number;
  warnings: string[];
  uploadedAt: string;
}

export interface VisualizerDraftSourceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file: File;
}

export type ColumnKind = 'time' | 'numeric' | 'dimension' | 'mixed' | 'empty';

export interface ColumnProfile {
  name: string;
  kind: ColumnKind;
  nonEmptyCount: number;
  numericCount: number;
  dateCount: number;
  uniqueCount: number;
  sampleValues: string[];
}

export interface DatasetProfile {
  columns: ColumnProfile[];
  numericColumns: string[];
  timeColumns: string[];
  dimensionColumns: string[];
  defaultTimeColumn?: string;
  defaultMetricColumn?: string;
  defaultSecondaryMetricColumn?: string;
  defaultCompareColumn?: string;
}

export type VisualizerChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'composed'
  | 'scatter'
  | 'histogram'
  | 'pie'
  | 'radar';

export type AggregationMethod = 'average' | 'sum' | 'min' | 'max' | 'count';

export interface VisualizerChartConfig {
  id: string;
  title: string;
  subtitle?: string;
  type: VisualizerChartType;
  datasetIds: string[];
  metricColumn: string;
  xColumn?: string;
  compareColumn?: string;
  secondaryMetricColumn?: string;
  aggregation: AggregationMethod;
  maxGroups: number;
  showGrid: boolean;
  showLegend: boolean;
  showYAxisLabel: boolean;
  yAxisLabel?: string;
  showReferenceLines: boolean;
  referenceValue?: number;
  referenceLabel?: string;
  referenceColor?: string;
  standards: 'WHO' | 'NEMA_UGANDA' | 'NEMA_KENYA';
  height: number;
  seriesColors: Record<string, string>;
}

export interface ChartSeriesModel {
  data: Array<Record<string, string | number | null>>;
  seriesKeys: string[];
  seriesLabels: Record<string, string>;
  xKey: string;
  yLabel: string;
  pollutant?: 'pm2_5' | 'pm10';
  emptyReason?: string;
}

export interface VisualizerWorkspaceDraft {
  id: string;
  version: number;
  name: string;
  datasets: UploadedDataset[];
  sourceFiles?: VisualizerDraftSourceFile[];
  datasetFileMap?: Record<string, string>;
  charts: VisualizerChartConfig[];
  activeChartId?: string;
  savedAt: string;
}
