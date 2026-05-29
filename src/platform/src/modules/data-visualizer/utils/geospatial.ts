import { MAX_CHART_RENDER_ROWS } from '../constants';
import type { UploadedDataRow, VisualizerChartConfig } from '../types';
import { formatCellValue, parseNumberValue } from './dataProfiling';

export interface CoordinateColumns {
  latitudeColumn?: string;
  longitudeColumn?: string;
}

export interface VisualizerMapPoint {
  id: string;
  latitude: number;
  longitude: number;
  value: number | null;
  label: string;
  dataset?: string;
}

const normalizeColumnName = (column: string) =>
  column
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const LATITUDE_NAMES = new Set([
  'lat',
  'latitude',
  'site_latitude',
  'device_latitude',
  'sensor_latitude',
  'station_latitude',
  'approximate_latitude',
  'gps_latitude',
  'y',
]);

const LONGITUDE_NAMES = new Set([
  'lon',
  'lng',
  'long',
  'longitude',
  'site_longitude',
  'device_longitude',
  'sensor_longitude',
  'station_longitude',
  'approximate_longitude',
  'gps_longitude',
  'x',
]);

const getCoordinateNameScore = (
  column: string,
  names: Set<string>,
  words: string[]
) => {
  const normalized = normalizeColumnName(column);

  if (names.has(normalized)) {
    return 5;
  }

  if (words.some(word => normalized === word || normalized.endsWith(`_${word}`))) {
    return 4;
  }

  if (words.some(word => normalized.includes(word))) {
    return 2;
  }

  return 0;
};

const isValidLatitude = (value: number) => value >= -90 && value <= 90;
const isValidLongitude = (value: number) => value >= -180 && value <= 180;

const getRangeScore = (
  rows: UploadedDataRow[],
  column: string,
  validator: (value: number) => boolean
) => {
  let numericCount = 0;
  let validCount = 0;

  for (const row of rows.slice(0, 1000)) {
    const value = parseNumberValue(row[column]);

    if (value === null) {
      continue;
    }

    numericCount += 1;

    if (validator(value)) {
      validCount += 1;
    }
  }

  if (numericCount === 0) {
    return 0;
  }

  return validCount / numericCount;
};

const chooseCoordinateColumn = (
  rows: UploadedDataRow[],
  columns: string[],
  direction: 'latitude' | 'longitude'
) => {
  const isLatitude = direction === 'latitude';
  const names = isLatitude ? LATITUDE_NAMES : LONGITUDE_NAMES;
  const words = isLatitude ? ['lat', 'latitude'] : ['lon', 'lng', 'long', 'longitude'];
  const validator = isLatitude ? isValidLatitude : isValidLongitude;

  return columns
    .map(column => {
      const nameScore = getCoordinateNameScore(column, names, words);
      const rangeScore = getRangeScore(rows, column, validator);

      return {
        column,
        score: nameScore + rangeScore * 3,
        rangeScore,
      };
    })
    .filter(candidate => candidate.score >= 4 && candidate.rangeScore >= 0.7)
    .sort((a, b) => b.score - a.score)[0]?.column;
};

export const detectCoordinateColumns = (
  rows: UploadedDataRow[],
  columns = Object.keys(rows[0] ?? {})
): CoordinateColumns => ({
  latitudeColumn: chooseCoordinateColumn(rows, columns, 'latitude'),
  longitudeColumn: chooseCoordinateColumn(rows, columns, 'longitude'),
});

export const hasCoordinateColumns = (coordinates: CoordinateColumns) =>
  Boolean(coordinates.latitudeColumn && coordinates.longitudeColumn);

export const buildMapPoints = (
  rows: UploadedDataRow[],
  config: VisualizerChartConfig
): VisualizerMapPoint[] => {
  const latitudeColumn = config.latitudeColumn;
  const longitudeColumn = config.longitudeColumn;

  if (!latitudeColumn || !longitudeColumn) {
    return [];
  }

  const points: VisualizerMapPoint[] = [];

  for (const row of rows) {
    const latitude = parseNumberValue(row[latitudeColumn]);
    const longitude = parseNumberValue(row[longitudeColumn]);

    if (
      latitude === null ||
      longitude === null ||
      !isValidLatitude(latitude) ||
      !isValidLongitude(longitude)
    ) {
      continue;
    }

    const value = parseNumberValue(row[config.metricColumn]);
    const compareLabel = config.compareColumn
      ? formatCellValue(row[config.compareColumn]).trim()
      : '';
    const datasetLabel = formatCellValue(row.Dataset).trim();

    points.push({
      id: `point-${points.length}`,
      latitude,
      longitude,
      value,
      label: compareLabel || datasetLabel || `Location ${points.length + 1}`,
      dataset: datasetLabel || undefined,
    });

    if (points.length >= MAX_CHART_RENDER_ROWS) {
      break;
    }
  }

  return points;
};
