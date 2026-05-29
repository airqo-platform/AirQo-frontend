import { getAirQualityInfo } from '@/shared/utils/airQuality';
import {
  getPrimaryColor,
  AIR_QUALITY_CATEGORY_COLORS,
  MAX_CHART_RENDER_ROWS,
} from '../constants';
import type {
  AggregationMethod,
  ChartSeriesModel,
  UploadedDataRow,
  VisualizerChartConfig,
} from '../types';
import {
  formatCellValue,
  parseDateValue,
  parseNumberValue,
} from './dataProfiling';

const X_KEY = 'x';

const createEmptyModel = (reason: string): ChartSeriesModel => ({
  data: [],
  seriesKeys: [],
  seriesLabels: {},
  xKey: X_KEY,
  yLabel: '',
  emptyReason: reason,
});

const toSeriesSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);

const createSeriesRegistry = (labels: string[]) => {
  const used = new Map<string, number>();
  const seriesLabels: Record<string, string> = {};
  const labelToKey = new Map<string, string>();

  labels.forEach((label, index) => {
    const fallback = `series_${index + 1}`;
    const slug = toSeriesSlug(label) || fallback;
    const count = used.get(slug) ?? 0;
    used.set(slug, count + 1);

    const key = count === 0 ? `series_${slug}` : `series_${slug}_${count + 1}`;
    seriesLabels[key] = label;
    labelToKey.set(label, key);
  });

  return {
    seriesKeys: Array.from(labelToKey.values()),
    seriesLabels,
    getKey: (label: string) => labelToKey.get(label) ?? '',
  };
};

const aggregateValues = (values: number[], method: AggregationMethod) => {
  if (method === 'count') {
    return values.length;
  }

  if (values.length === 0) {
    return null;
  }

  switch (method) {
    case 'sum':
      return values.reduce((sum, value) => sum + value, 0);
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'average':
    default:
      return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
};

const roundValue = (value: number | null) =>
  value === null ? null : Math.round(value * 100) / 100;

const getDimensionValue = (
  row: UploadedDataRow,
  column?: string,
  fallback = 'All data'
) => {
  if (!column) {
    return fallback;
  }

  return formatCellValue(row[column]).trim() || 'Unspecified';
};

const getMetricValue = (row: UploadedDataRow, metricColumn: string) =>
  parseNumberValue(row[metricColumn]);

const getXAxisValue = (
  row: UploadedDataRow,
  column: string | undefined,
  rowIndex: number
) => {
  if (!column) {
    return String(rowIndex + 1);
  }

  const dateValue = parseDateValue(row[column]);
  if (dateValue) {
    return dateValue.toISOString();
  }

  return formatCellValue(row[column]).trim() || String(rowIndex + 1);
};

const sortChartDataByX = (
  data: Array<Record<string, string | number | null>>
) =>
  [...data].sort((a, b) => {
    const aValue = String(a[X_KEY] ?? '');
    const bValue = String(b[X_KEY] ?? '');
    const aDate = Date.parse(aValue);
    const bDate = Date.parse(bValue);

    if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      return aDate - bDate;
    }

    const aNumber = Number(aValue);
    const bNumber = Number(bValue);

    if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
      return aNumber - bNumber;
    }

    return aValue.localeCompare(bValue);
  });

const sampleChartData = (
  data: Array<Record<string, string | number | null>>
) => {
  if (data.length <= MAX_CHART_RENDER_ROWS) {
    return data;
  }

  const step = Math.ceil(data.length / MAX_CHART_RENDER_ROWS);
  return data.filter((_, index) => index % step === 0);
};

const getTopLabels = (
  rows: UploadedDataRow[],
  column: string | undefined,
  maxGroups: number
) => {
  if (!column) {
    return ['All data'];
  }

  const counts = new Map<string, number>();
  rows.forEach(row => {
    const label = getDimensionValue(row, column);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, Math.max(1, maxGroups))
    .map(([label]) => label);
};

const buildTimeSeriesModel = (
  rows: UploadedDataRow[],
  config: VisualizerChartConfig
): ChartSeriesModel => {
  if (!config.metricColumn) {
    return createEmptyModel('Choose a numeric metric column.');
  }

  const compareLabels = config.compareColumn
    ? getTopLabels(rows, config.compareColumn, config.maxGroups)
    : [
        config.metricColumn,
        ...(config.secondaryMetricColumn ? [config.secondaryMetricColumn] : []),
      ];
  const registry = createSeriesRegistry(compareLabels);
  const buckets = new Map<string, Map<string, number[]>>();

  rows.forEach((row, rowIndex) => {
    const xValue = getXAxisValue(row, config.xColumn, rowIndex);
    const metricValue = getMetricValue(row, config.metricColumn);

    if (metricValue === null) {
      return;
    }

    const bucket = buckets.get(xValue) ?? new Map<string, number[]>();

    if (config.compareColumn) {
      const label = getDimensionValue(row, config.compareColumn);
      if (!compareLabels.includes(label)) {
        return;
      }

      const key = registry.getKey(label);
      bucket.set(key, [...(bucket.get(key) ?? []), metricValue]);
    } else {
      const metricKey = registry.getKey(config.metricColumn);
      bucket.set(metricKey, [...(bucket.get(metricKey) ?? []), metricValue]);

      if (config.secondaryMetricColumn) {
        const secondaryValue = getMetricValue(
          row,
          config.secondaryMetricColumn
        );
        const secondaryKey = registry.getKey(config.secondaryMetricColumn);

        if (secondaryValue !== null) {
          bucket.set(secondaryKey, [
            ...(bucket.get(secondaryKey) ?? []),
            secondaryValue,
          ]);
        }
      }
    }

    buckets.set(xValue, bucket);
  });

  const data = Array.from(buckets.entries()).map(([xValue, seriesBucket]) => {
    const point: Record<string, string | number | null> = { [X_KEY]: xValue };

    registry.seriesKeys.forEach(key => {
      point[key] = roundValue(
        aggregateValues(seriesBucket.get(key) ?? [], config.aggregation)
      );
    });

    return point;
  });

  const chartData = sampleChartData(sortChartDataByX(data));

  return {
    data: chartData,
    seriesKeys: registry.seriesKeys,
    seriesLabels: registry.seriesLabels,
    xKey: X_KEY,
    yLabel: config.metricColumn,
    pollutant: getPollutantFromMetric(config.metricColumn),
    emptyReason:
      chartData.length === 0
        ? 'No numeric values matched this chart.'
        : undefined,
  };
};

const buildBarLikeModel = (
  rows: UploadedDataRow[],
  config: VisualizerChartConfig
): ChartSeriesModel => {
  if (!config.metricColumn) {
    return createEmptyModel('Choose a numeric metric column.');
  }

  const categoryColumn = config.compareColumn || config.xColumn;
  const categoryLabels = getTopLabels(rows, categoryColumn, config.maxGroups);
  const metricLabels = [
    config.metricColumn,
    ...(config.secondaryMetricColumn ? [config.secondaryMetricColumn] : []),
  ];
  const registry = createSeriesRegistry(metricLabels);

  const data = categoryLabels.map(label => {
    const matchingRows = rows.filter(
      row => getDimensionValue(row, categoryColumn) === label
    );
    const point: Record<string, string | number | null> = { [X_KEY]: label };

    metricLabels.forEach(metric => {
      const key = registry.getKey(metric);
      const values = matchingRows
        .map(row => getMetricValue(row, metric))
        .filter((value): value is number => value !== null);

      point[key] = roundValue(aggregateValues(values, config.aggregation));
    });

    return point;
  });

  return {
    data,
    seriesKeys: registry.seriesKeys,
    seriesLabels: registry.seriesLabels,
    xKey: X_KEY,
    yLabel: metricLabels.join(', '),
    pollutant: getPollutantFromMetric(config.metricColumn),
    emptyReason:
      data.length === 0
        ? 'No groups could be built from this data.'
        : undefined,
  };
};

const buildScatterModel = (
  rows: UploadedDataRow[],
  config: VisualizerChartConfig
): ChartSeriesModel => {
  if (!config.metricColumn) {
    return createEmptyModel('Choose a numeric metric column.');
  }

  const labels = config.compareColumn
    ? getTopLabels(rows, config.compareColumn, config.maxGroups)
    : [config.metricColumn];
  const registry = createSeriesRegistry(labels);
  const data: Array<Record<string, string | number | null>> = [];

  rows.forEach((row, index) => {
    const yValue = getMetricValue(row, config.metricColumn);
    const xValue = config.secondaryMetricColumn
      ? getMetricValue(row, config.secondaryMetricColumn)
      : index + 1;

    if (xValue === null || yValue === null) {
      return;
    }

    const label = config.compareColumn
      ? getDimensionValue(row, config.compareColumn)
      : config.metricColumn;

    if (!labels.includes(label)) {
      return;
    }

    const key = registry.getKey(label);
    data.push({
      [X_KEY]: xValue,
      [key]: yValue,
    });
  });

  return {
    data: sampleChartData(data),
    seriesKeys: registry.seriesKeys,
    seriesLabels: registry.seriesLabels,
    xKey: X_KEY,
    yLabel: config.metricColumn,
    pollutant: getPollutantFromMetric(config.metricColumn),
    emptyReason:
      data.length === 0
        ? 'Choose two numeric columns for a scatter plot.'
        : undefined,
  };
};

const buildHistogramModel = (
  rows: UploadedDataRow[],
  config: VisualizerChartConfig
): ChartSeriesModel => {
  if (!config.metricColumn) {
    return createEmptyModel('Choose a numeric metric column.');
  }

  const values = rows
    .map(row => getMetricValue(row, config.metricColumn))
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return createEmptyModel('No numeric values were found for this metric.');
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = Math.min(
    12,
    Math.max(6, Math.ceil(Math.sqrt(values.length)))
  );
  const span = max - min || 1;
  const binSize = span / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => {
    const start = min + index * binSize;
    const end = index === binCount - 1 ? max : start + binSize;

    return {
      start,
      end,
      count: 0,
    };
  });

  values.forEach(value => {
    const index = Math.min(binCount - 1, Math.floor((value - min) / binSize));
    bins[index].count += 1;
  });

  const registry = createSeriesRegistry(['Count']);

  return {
    data: bins.map(bin => ({
      [X_KEY]: `${bin.start.toFixed(1)}-${bin.end.toFixed(1)}`,
      [registry.seriesKeys[0]]: bin.count,
    })),
    seriesKeys: registry.seriesKeys,
    seriesLabels: registry.seriesLabels,
    xKey: X_KEY,
    yLabel: 'Count',
    pollutant: getPollutantFromMetric(config.metricColumn),
  };
};

export const getPollutantFromMetric = (
  metricColumn: string
): 'pm2_5' | 'pm10' | undefined => {
  if (/pm\s*10|pm10|pm_?10/i.test(metricColumn)) {
    return 'pm10';
  }

  if (/pm\s*2[\W_]*5|pm25|pm_?2_?5/i.test(metricColumn)) {
    return 'pm2_5';
  }

  return undefined;
};

const buildPieModel = (
  rows: UploadedDataRow[],
  config: VisualizerChartConfig
): ChartSeriesModel => {
  if (!config.metricColumn) {
    return createEmptyModel('Choose a numeric metric column.');
  }

  const counts = new Map<string, number>();

  if (config.compareColumn) {
    getTopLabels(rows, config.compareColumn, config.maxGroups).forEach(label =>
      counts.set(label, 0)
    );

    rows.forEach(row => {
      const label = getDimensionValue(row, config.compareColumn);
      if (counts.has(label)) {
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    });
  } else {
    const pollutant = getPollutantFromMetric(config.metricColumn);
    if (!pollutant) {
      return createEmptyModel(
        'Choose a group field for category share, or use a PM2.5/PM10 metric for air quality bands.'
      );
    }

    rows.forEach(row => {
      const value = getMetricValue(row, config.metricColumn);

      if (value === null) {
        return;
      }

      const label = getAirQualityInfo(value, pollutant).label;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
  }

  const labels = Array.from(counts.keys());
  const registry = createSeriesRegistry(['Records']);

  return {
    data: labels.map(label => ({
      [X_KEY]: label,
      [registry.seriesKeys[0]]: counts.get(label) ?? 0,
    })),
    seriesKeys: registry.seriesKeys,
    seriesLabels: registry.seriesLabels,
    xKey: X_KEY,
    yLabel: 'Records',
    pollutant: getPollutantFromMetric(config.metricColumn),
    emptyReason:
      labels.length === 0
        ? 'No categories could be built for this chart.'
        : undefined,
  };
};

export const buildChartModel = (
  rows: UploadedDataRow[],
  config: VisualizerChartConfig
): ChartSeriesModel => {
  switch (config.type) {
    case 'line':
    case 'area':
    case 'composed':
      return buildTimeSeriesModel(rows, config);
    case 'scatter':
      return buildScatterModel(rows, config);
    case 'histogram':
      return buildHistogramModel(rows, config);
    case 'pie':
      return buildPieModel(rows, config);
    case 'radar':
    case 'bar':
    default:
      return buildBarLikeModel(rows, config);
  }
};

export const getSeriesColor = (
  seriesKey: string,
  index: number,
  colors: Record<string, string>
) => colors[seriesKey] || getPrimaryColor(index);

export const getPieSegmentColor = (
  label: string,
  index: number,
  colors: Record<string, string>
) =>
  colors[label] ||
  AIR_QUALITY_CATEGORY_COLORS[
    label as keyof typeof AIR_QUALITY_CATEGORY_COLORS
  ] ||
  getPrimaryColor(index);
