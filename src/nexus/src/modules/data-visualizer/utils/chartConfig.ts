import { SOURCE_COLUMN_KEYS } from '../constants';
import type {
  DatasetProfile,
  UploadedDataset,
  VisualizerChartConfig,
  VisualizerChartType,
} from '../types';
import { profileDataset } from './dataProfiling';
import { detectCoordinateColumns } from './geospatial';
import { formatColumnLabel, formatMeasurementLabel } from './measurementLabels';
import { getDatasetRowsForChart } from './workspaceData';

const CATEGORY_CHART_TYPES = new Set<VisualizerChartType>([
  'bar',
  'pie',
  'radar',
]);
const TIME_SERIES_CHART_TYPES = new Set<VisualizerChartType>([
  'line',
  'area',
  'composed',
]);
const SECONDARY_METRIC_CHART_TYPES = new Set<VisualizerChartType>([
  'scatter',
  'composed',
]);

const getSelectedDatasets = (
  datasets: UploadedDataset[],
  datasetIds: string[]
) => {
  if (datasetIds.length === 0) {
    return datasets;
  }

  const selectedIds = new Set(datasetIds);
  const selectedDatasets = datasets.filter(dataset =>
    selectedIds.has(dataset.id)
  );

  return selectedDatasets.length > 0 ? selectedDatasets : datasets;
};

const getProfilesForDatasets = (datasets: UploadedDataset[]) =>
  datasets.map(dataset => ({
    dataset,
    profile: profileDataset(dataset.rows),
  }));

const getSharedColumns = (
  profiles: Array<{ profile: DatasetProfile }>,
  pickColumns: (profile: DatasetProfile) => string[]
) => {
  if (profiles.length === 0) {
    return [];
  }

  const [firstProfile, ...restProfiles] = profiles;

  return pickColumns(firstProfile.profile).filter(column =>
    restProfiles.every(({ profile }) => pickColumns(profile).includes(column))
  );
};

const buildColumnSet = (...groups: string[][]) =>
  new Set(groups.flatMap(group => group));

const keepOrFallback = (
  currentValue: string | undefined,
  preferredColumns: string[],
  availableColumns: string[],
  fallback?: string
) => {
  if (currentValue && preferredColumns.includes(currentValue)) {
    return currentValue;
  }

  if (preferredColumns.length > 0) {
    return preferredColumns[0];
  }

  if (currentValue && availableColumns.includes(currentValue)) {
    return currentValue;
  }

  if (fallback && availableColumns.includes(fallback)) {
    return fallback;
  }

  return availableColumns[0];
};

const syncAxisLabel = (
  currentLabel: string | undefined,
  previousDefault: string,
  nextDefault: string,
  previousRawValue?: string,
  nextRawValue?: string
) => {
  const trimmedLabel = currentLabel?.trim();

  if (
    !trimmedLabel ||
    trimmedLabel === previousDefault ||
    trimmedLabel === (previousRawValue ?? '')
  ) {
    return nextDefault || nextRawValue;
  }

  return currentLabel;
};

export const normalizeChartConfigForDatasets = (
  chart: VisualizerChartConfig,
  datasets: UploadedDataset[]
): VisualizerChartConfig => {
  if (datasets.length === 0) {
    return chart;
  }

  const selectedDatasets = getSelectedDatasets(datasets, chart.datasetIds);
  const selectedDatasetIds = selectedDatasets.map(dataset => dataset.id);
  const rows = getDatasetRowsForChart(datasets, selectedDatasetIds);
  const workspaceProfile = profileDataset(rows);
  const datasetProfiles = getProfilesForDatasets(selectedDatasets);
  const sharedNumericColumns = getSharedColumns(
    datasetProfiles,
    profile => profile.numericColumns
  );
  const sharedTimeColumns = getSharedColumns(
    datasetProfiles,
    profile => profile.timeColumns
  );
  const sharedDimensionColumns = getSharedColumns(
    datasetProfiles,
    profile => profile.dimensionColumns
  );
  const hasMultipleDatasets = selectedDatasets.length > 1;
  const previousMetricDefault =
    formatMeasurementLabel(chart.metricColumn) || 'Measurement';
  const nextMetricColumn = keepOrFallback(
    chart.metricColumn,
    hasMultipleDatasets
      ? sharedNumericColumns
      : workspaceProfile.numericColumns,
    workspaceProfile.numericColumns
  );
  const nextSecondaryMetricColumn = SECONDARY_METRIC_CHART_TYPES.has(chart.type)
    ? keepOrFallback(
        chart.secondaryMetricColumn,
        (hasMultipleDatasets
          ? sharedNumericColumns
          : workspaceProfile.numericColumns
        ).filter(column => column !== nextMetricColumn),
        workspaceProfile.numericColumns.filter(
          column => column !== nextMetricColumn
        )
      )
    : undefined;
  const nextCompareColumn =
    chart.type === 'histogram'
      ? undefined
      : hasMultipleDatasets
        ? sharedDimensionColumns.includes(chart.compareColumn || '')
          ? chart.compareColumn
          : SOURCE_COLUMN_KEYS.INTERNAL.dataset
        : chart.compareColumn === SOURCE_COLUMN_KEYS.INTERNAL.dataset
          ? workspaceProfile.defaultCompareColumn
          : keepOrFallback(
              chart.compareColumn,
              workspaceProfile.dimensionColumns,
              workspaceProfile.dimensionColumns
            );
  const sharedAxisColumns = buildColumnSet(
    sharedTimeColumns,
    sharedDimensionColumns,
    hasMultipleDatasets
      ? [SOURCE_COLUMN_KEYS.INTERNAL.dataset, SOURCE_COLUMN_KEYS.INTERNAL.file]
      : []
  );
  const availableAxisColumns = buildColumnSet(
    workspaceProfile.timeColumns,
    workspaceProfile.dimensionColumns
  );
  const nextCategoryColumn =
    nextCompareColumn ||
    (hasMultipleDatasets
      ? SOURCE_COLUMN_KEYS.INTERNAL.dataset
      : workspaceProfile.defaultCompareColumn);
  const nextXColumn = CATEGORY_CHART_TYPES.has(chart.type)
    ? nextCategoryColumn
    : TIME_SERIES_CHART_TYPES.has(chart.type)
      ? chart.xColumn && sharedAxisColumns.has(chart.xColumn)
        ? chart.xColumn
        : sharedTimeColumns[0] ||
          workspaceProfile.defaultTimeColumn ||
          nextCategoryColumn
      : chart.xColumn && availableAxisColumns.has(chart.xColumn)
        ? chart.xColumn
        : workspaceProfile.defaultTimeColumn;
  const coordinateColumns = detectCoordinateColumns(
    rows,
    workspaceProfile.numericColumns
  );
  const nextLatitudeColumn =
    chart.type === 'map'
      ? keepOrFallback(
          chart.latitudeColumn,
          coordinateColumns.latitudeColumn
            ? [coordinateColumns.latitudeColumn]
            : [],
          workspaceProfile.numericColumns,
          coordinateColumns.latitudeColumn
        )
      : undefined;
  const nextLongitudeColumn =
    chart.type === 'map'
      ? keepOrFallback(
          chart.longitudeColumn,
          coordinateColumns.longitudeColumn
            ? [coordinateColumns.longitudeColumn]
            : [],
          workspaceProfile.numericColumns,
          coordinateColumns.longitudeColumn
        )
      : undefined;
  const nextXAxisDefault =
    chart.type === 'scatter'
      ? formatMeasurementLabel(nextSecondaryMetricColumn)
      : formatColumnLabel(nextXColumn);
  const nextYAxisDefault = formatMeasurementLabel(nextMetricColumn);

  return {
    ...chart,
    datasetIds: selectedDatasetIds,
    metricColumn: nextMetricColumn || chart.metricColumn,
    secondaryMetricColumn:
      nextSecondaryMetricColumn &&
      nextSecondaryMetricColumn !== nextMetricColumn
        ? nextSecondaryMetricColumn
        : undefined,
    compareColumn: nextCompareColumn,
    xColumn: nextXColumn,
    latitudeColumn: nextLatitudeColumn,
    longitudeColumn: nextLongitudeColumn,
    xAxisLabel: syncAxisLabel(
      chart.xAxisLabel,
      chart.type === 'scatter'
        ? formatMeasurementLabel(chart.secondaryMetricColumn)
        : formatColumnLabel(chart.xColumn),
      nextXAxisDefault,
      chart.xColumn,
      nextXColumn
    ),
    yAxisLabel: syncAxisLabel(
      chart.yAxisLabel,
      previousMetricDefault,
      nextYAxisDefault,
      chart.metricColumn,
      nextMetricColumn
    ),
  };
};
