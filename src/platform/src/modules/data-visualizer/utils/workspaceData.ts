import { SOURCE_COLUMN_KEYS } from '../constants';
import type {
  DatasetProfile,
  UploadedDataset,
  UploadedDataRow,
} from '../types';
import { profileDataset } from './dataProfiling';

export const getDatasetRowsForChart = (
  datasets: UploadedDataset[],
  datasetIds: string[]
): UploadedDataRow[] => {
  const selectedIdSet = new Set(datasetIds);
  const selectedDatasets =
    datasetIds.length > 0
      ? datasets.filter(dataset => selectedIdSet.has(dataset.id))
      : datasets;

  return selectedDatasets.flatMap(dataset =>
    dataset.rows.map(row => ({
      ...row,
      [SOURCE_COLUMN_KEYS.dataset]: dataset.label,
      [SOURCE_COLUMN_KEYS.file]: dataset.fileName,
      [SOURCE_COLUMN_KEYS.sheet]: dataset.sheetName || '',
    }))
  );
};

export const buildWorkspaceProfile = (
  datasets: UploadedDataset[],
  datasetIds: string[]
): DatasetProfile =>
  profileDataset(getDatasetRowsForChart(datasets, datasetIds));

export const getDatasetSummary = (
  datasets: UploadedDataset[],
  datasetIds: string[]
) => {
  const selectedIdSet = new Set(datasetIds);
  const selectedDatasets =
    datasetIds.length > 0
      ? datasets.filter(dataset => selectedIdSet.has(dataset.id))
      : datasets;

  return {
    datasetCount: selectedDatasets.length,
    rowCount: selectedDatasets.reduce(
      (sum, dataset) => sum + dataset.rowCount,
      0
    ),
    columnCount: new Set(selectedDatasets.flatMap(dataset => dataset.columns))
      .size,
  };
};
