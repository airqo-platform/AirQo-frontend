import { normalizeChartConfigForDatasets } from '../chartConfig';
import type { UploadedDataset, VisualizerChartConfig } from '../../types';

/**
 * Axis-label synchronisation. The two states must stay distinct:
 *   `undefined` → automatic (follows the column), `''` → deliberately cleared.
 * When they collapse, clearing a label in the chart config appears to "rewrite
 * itself", and the derived text comes back on every dataset change or draft
 * restore because this runs from `normalizeChartConfigForDatasets`.
 */
const makeDataset = (): UploadedDataset => ({
  id: 'dataset-1',
  label: 'Readings',
  fileName: 'readings.csv',
  fileType: 'csv',
  sheetOptions: [],
  columns: ['timestamp', 'pm25', 'pm10', 'station'],
  rows: [
    { timestamp: '2026-01-01', pm25: 12, pm10: 20, station: 'A' },
    { timestamp: '2026-01-02', pm25: 15, pm10: 24, station: 'B' },
  ],
  rowCount: 2,
  sourceRowCount: 2,
  warnings: [],
  uploadedAt: '2026-01-02T00:00:00.000Z',
});

const makeChart = (
  overrides: Partial<VisualizerChartConfig> = {}
): VisualizerChartConfig =>
  ({
    id: 'chart-1',
    type: 'line',
    datasetIds: ['dataset-1'],
    metricColumn: 'pm25',
    compareColumn: 'station',
    xColumn: 'timestamp',
    title: 'Chart 1',
    height: 340,
    maxGroups: 8,
    showGrid: true,
    showLegend: true,
    showXAxisLabel: true,
    showYAxisLabel: true,
    showReferenceLines: false,
    referenceLines: [],
    seriesColors: {},
    ...overrides,
  }) as VisualizerChartConfig;

const normalize = (chart: VisualizerChartConfig, datasets = [makeDataset()]) =>
  normalizeChartConfigForDatasets(chart, datasets);

describe('normalizeChartConfigForDatasets — axis labels', () => {
  it('derives labels from the columns when none were chosen (automatic)', () => {
    const result = normalize(
      makeChart({ xAxisLabel: undefined, yAxisLabel: undefined })
    );

    expect(result.xAxisLabel).toBeTruthy();
    expect(result.yAxisLabel).toBeTruthy();
  });

  it('keeps a custom label when the dataset changes', () => {
    const result = normalize(
      makeChart({ xAxisLabel: 'Day of week', yAxisLabel: 'Fine particles' })
    );

    expect(result.xAxisLabel).toBe('Day of week');
    expect(result.yAxisLabel).toBe('Fine particles');
  });

  it('honours a deliberately cleared label instead of restoring the derived text', () => {
    // The regression: clearing the field used to store `undefined`, so the
    // input re-rendered the auto label and the user could never remove it.
    const result = normalize(makeChart({ xAxisLabel: '', yAxisLabel: '' }));

    expect(result.xAxisLabel).toBe('');
    expect(result.yAxisLabel).toBe('');
  });

  it('honours a whitespace-only label as cleared', () => {
    const result = normalize(makeChart({ yAxisLabel: '   ' }));

    expect(result.yAxisLabel).toBe('');
  });

  it('keeps a cleared label across repeated normalizations', () => {
    // Draft restore and dataset changes both re-normalize; a cleared label must
    // not resurrect itself on the second pass either.
    const first = normalize(makeChart({ yAxisLabel: '' }));
    const second = normalize(first);

    expect(second.yAxisLabel).toBe('');
  });

  it('re-derives when the label only repeated the previous automatic value', () => {
    // A label that merely mirrors the old column tracks the new column, so it
    // never goes stale — while a real custom label is left alone.
    const chart = makeChart({ metricColumn: 'pm25', yAxisLabel: 'pm25' });
    const result = normalize(chart);

    expect(result.yAxisLabel).not.toBe('pm25');
    expect(result.yAxisLabel).toBeTruthy();
  });

  it('still repairs column selections that no longer exist', () => {
    const result = normalize(makeChart({ metricColumn: 'removed_column' }));

    expect(result.metricColumn).toBe('pm25');
  });
});
