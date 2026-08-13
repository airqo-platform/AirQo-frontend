import {
  AirQualityDataPoint,
  NormalizedChartData,
  ChartType,
  FrequencyType,
  PollutantType,
} from '../types';
import { format, parseISO } from 'date-fns';
import { CHART_TYPE_THRESHOLDS } from '../constants';

type ChartLocationDisplaySource = {
  search_name?: string;
  location_name?: string;
  name?: string;
  formatted_name?: string;
  generated_name?: string;
  site?: string;
};

/**
 * Resolves the display name for a chart site/location.
 */
export const getChartLocationDisplayName = (
  source: ChartLocationDisplaySource
): string => {
  return (
    source.search_name?.trim() ||
    source.location_name?.trim() ||
    source.name?.trim() ||
    source.formatted_name?.trim() ||
    source.site?.trim() ||
    source.generated_name?.trim() ||
    'Unknown Location'
  );
};

/**
 * Normalizes air quality data for chart consumption
 */
export const normalizeAirQualityData = (
  data: AirQualityDataPoint[]
): NormalizedChartData[] => {
  if (!data || data.length === 0) return [];

  // Keep the original ISO timestamp in `time` so the formatter used by the
  // charts can convert it correctly depending on frequency. Store a rawTime
  // field as well for backwards compatibility where needed.
  return data.map(point => ({
    time: point.time,
    value: Math.round(point.value * 100) / 100, // Round to 2 decimal places
    site: getChartLocationDisplayName(point),
    device_id: point.device_id,
    site_id: point.site_id,
    rawTime: point.time,
    search_name: point.search_name,
    location_name: point.location_name,
    formatted_name: point.formatted_name,
    name: point.name,
    generated_name: point.generated_name,
  }));
};

/**
 * Formats timestamp for chart display
 */
export const formatTimestamp = (timestamp: string): string => {
  try {
    const date = parseISO(timestamp);
    return format(date, 'MMM dd, HH:mm');
  } catch {
    console.warn('Invalid timestamp format:', timestamp);
    return timestamp;
  }
};

/**
 * Groups data by device/site for multi-series charts
 */
export const groupDataBySite = (
  data: NormalizedChartData[]
): Record<string, NormalizedChartData[]> => {
  return data.reduce(
    (acc, point) => {
      const key = point.site;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(point);
      return acc;
    },
    {} as Record<string, NormalizedChartData[]>
  );
};

/**
 * Converts grouped data to format suitable for recharts
 */
export const convertToMultiSeriesFormat = (
  groupedData: Record<string, NormalizedChartData[]>
): Array<Record<string, string | number | null>> => {
  // Index every site's points by timestamp ONCE so the pivot below is
  // O(points × sites) instead of O(points² × sites) on large datasets.
  const siteIndexes = Object.fromEntries(
    Object.entries(groupedData).map(([siteName, siteData]) => {
      const byTime = new Map<string, NormalizedChartData>();
      siteData.forEach(point => byTime.set(point.time, point));
      return [siteName, byTime];
    })
  ) as Record<string, Map<string, NormalizedChartData>>;

  const timePoints = new Set<string>();

  // Collect all time points
  Object.values(groupedData).forEach(siteData => {
    siteData.forEach(point => {
      timePoints.add(point.time);
    });
  });

  // Create data structure with all sites for each time point
  // Sort by actual date order (parseISO) to ensure consistent chronological spacing
  return Array.from(timePoints)
    .sort((a, b) => {
      try {
        const da = parseISO(a);
        const db = parseISO(b);
        return da.getTime() - db.getTime();
      } catch {
        return a.localeCompare(b);
      }
    })
    .map(time => {
      const dataPoint: Record<string, string | number | null> = { time };

      Object.entries(siteIndexes).forEach(([siteName, byTime]) => {
        const point = byTime.get(time);
        dataPoint[siteName] = point ? point.value : null;
      });

      return dataPoint;
    });
};

/**
 * Envelope decimation for extremely large datasets.
 *
 * Buckets consecutive rows and emits TWO rows per bucket carrying the per
 * series-column MIN and MAX of the bucket. Unlike stride sampling (which
 * drops peaks), this preserves the full data envelope, so huge time series
 * keep their spikes and valleys while the DOM stays within `maxRows`.
 *
 * The first row of a bucket keeps the bucket's start x value, the second
 * keeps the bucket's end x value, so the visible domain always covers the
 * exact original range. Rows whose numeric columns are all null (data gaps)
 * are emitted as nulls — never as the first row's stale value.
 */
export const decimateRows = <T extends Record<string, unknown>>(
  rows: T[],
  maxRows: number,
  xKey = 'time'
): T[] => {
  if (rows.length <= maxRows) return rows;
  if (rows.length === 0) return rows;

  const bucketCount = Math.max(1, Math.ceil(maxRows / 2));
  const bucketSize = Math.ceil(rows.length / bucketCount);
  const out: T[] = [];

  for (let start = 0; start < rows.length; start += bucketSize) {
    const bucket = rows.slice(start, Math.min(rows.length, start + bucketSize));
    const first = bucket[0] as Record<string, unknown>;
    const last = bucket[bucket.length - 1] as Record<string, unknown>;
    const numericKeys = Object.keys(first).filter(k => k !== xKey);
    const minRow: Record<string, unknown> = { ...first };
    const maxRow: Record<string, unknown> = { ...first };

    numericKeys.forEach(k => {
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      let hasValue = false;

      for (const row of bucket) {
        const v = row[k];
        if (typeof v !== 'number' || Number.isNaN(v)) continue;
        hasValue = true;
        if (v < min) min = v;
        if (v > max) max = v;
      }

      if (hasValue) {
        minRow[k] = min;
        maxRow[k] = max;
      } else {
        // Data gap — emit nulls instead of leaking the first row's value.
        minRow[k] = null;
        maxRow[k] = null;
      }
    });

    maxRow[xKey] = last[xKey];
    out.push(minRow as T, maxRow as T);
  }

  return out;
};

/**
 * Automatically selects the best chart type based on data characteristics
 */
export const autoSelectChartType = (data: NormalizedChartData[]): ChartType => {
  if (!data || data.length === 0) return 'line';

  const dataLength = data.length;
  const uniqueSites = new Set(data.map(d => d.site)).size;
  const hasTimeData = data.every(d => d.time);

  // For time series data
  if (hasTimeData) {
    if (
      dataLength <= CHART_TYPE_THRESHOLDS.maxPointsForScatter &&
      uniqueSites === 1
    ) {
      return 'scatter';
    }
    if (dataLength >= CHART_TYPE_THRESHOLDS.minPointsForArea) {
      return 'area';
    }
    return 'line';
  }

  // For categorical data
  if (uniqueSites <= CHART_TYPE_THRESHOLDS.maxCategoriesForPie) {
    return 'pie';
  }

  return 'bar';
};

/**
 * Calculates statistical summary of the data
 */
export const calculateDataStats = (data: NormalizedChartData[]) => {
  if (!data || data.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      count: 0,
    };
  }

  const values = data
    .map(d => d.value)
    .filter(v => v !== null && v !== undefined);
  const sortedValues = [...values].sort((a, b) => a - b);

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg:
      Math.round(
        (values.reduce((sum, val) => sum + val, 0) / values.length) * 100
      ) / 100,
    median:
      sortedValues.length % 2 === 0
        ? (sortedValues[sortedValues.length / 2 - 1] +
            sortedValues[sortedValues.length / 2]) /
          2
        : sortedValues[Math.floor(sortedValues.length / 2)],
    count: values.length,
  };
};

/**
 * Filters data based on date range
 */
export const filterDataByDateRange = (
  data: NormalizedChartData[],
  startDate: Date,
  endDate: Date
): NormalizedChartData[] => {
  return data.filter(point => {
    try {
      const timeStr =
        typeof point.time === 'string' ? point.time : String(point.time);
      const rawTime = (point as NormalizedChartData & { rawTime?: string })
        .rawTime;
      const pointDate = parseISO(rawTime || timeStr);
      return pointDate >= startDate && pointDate <= endDate;
    } catch {
      return true; // Include points with invalid dates
    }
  });
};

/**
 * Aggregates data by time intervals (hourly, daily, weekly)
 */
export const aggregateDataByInterval = (
  data: NormalizedChartData[],
  interval: 'hour' | 'day' | 'week' | 'month'
): NormalizedChartData[] => {
  const formatMap = {
    hour: 'yyyy-MM-dd HH:00',
    day: 'yyyy-MM-dd',
    week: "yyyy-'W'II",
    month: 'yyyy-MM',
  };

  const groups = data.reduce(
    (acc, point) => {
      try {
        const timeStr =
          typeof point.time === 'string' ? point.time : String(point.time);
        const rawTime = (point as NormalizedChartData & { rawTime?: string })
          .rawTime;
        const date = parseISO(rawTime || timeStr);
        const key = format(date, formatMap[interval]);

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(point);
      } catch {
        console.warn('Error parsing date for aggregation:', point.time);
      }

      return acc;
    },
    {} as Record<string, NormalizedChartData[]>
  );

  return Object.entries(groups)
    .map(([key, points]) => {
      const avgValue =
        points.reduce((sum, p) => sum + p.value, 0) / points.length;
      const sitesArray = Array.from(new Set(points.map(p => p.site)));
      const sites = sitesArray.join(', ');

      return {
        time: key,
        value: Math.round(avgValue * 100) / 100,
        site: sites,
        device_id: points[0].device_id,
        count: points.length,
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));
};

/**
 * Removes outliers using IQR method
 */
export const removeOutliers = (
  data: NormalizedChartData[],
  multiplier: number = 1.5
): NormalizedChartData[] => {
  const values = data.map(d => d.value).sort((a, b) => a - b);
  const q1Index = Math.floor(values.length * 0.25);
  const q3Index = Math.floor(values.length * 0.75);

  const q1 = values[q1Index];
  const q3 = values[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;

  return data.filter(
    point => point.value >= lowerBound && point.value <= upperBound
  );
};

/**
 * Smooths data using moving average
 */
export const smoothDataWithMovingAverage = (
  data: NormalizedChartData[],
  windowSize: number = 3
): NormalizedChartData[] => {
  if (windowSize <= 1 || data.length < windowSize) return data;

  return data.map((point, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2));
    const end = Math.min(data.length, start + windowSize);

    const window = data.slice(start, end);
    const avgValue =
      window.reduce((sum, p) => sum + p.value, 0) / window.length;

    return {
      ...point,
      value: Math.round(avgValue * 100) / 100,
    };
  });
};

/**
 * Formats timestamp based on frequency for chart display
 */
export const formatTimestampByFrequency = (
  timestamp: string,
  frequency: FrequencyType
): string => {
  try {
    const date = parseISO(timestamp);

    switch (frequency) {
      case 'raw':
      case 'hourly':
        return format(date, 'HH:mm');
      case 'daily':
        return format(date, 'MMM dd');
      case 'weekly':
        return format(date, 'MMM dd');
      case 'monthly':
        return format(date, 'MMM yyyy');
      default:
        return format(date, 'MMM dd, HH:mm');
    }
  } catch {
    console.warn('Invalid timestamp format:', timestamp);
    return timestamp;
  }
};

import { POLLUTANT_LABELS } from '../constants';

/**
 * Gets the display label for a pollutant
 */
export const getPollutantLabel = (pollutant: PollutantType): string => {
  return POLLUTANT_LABELS[pollutant] || pollutant.toUpperCase();
};

/**
 * Gets the unit for a pollutant
 */
export const getPollutantUnits = (pollutant: PollutantType): string => {
  const units: Record<PollutantType, string> = {
    pm2_5: 'µg/m³',
    pm10: 'µg/m³',
  };

  return units[pollutant] || 'µg/m³';
};
