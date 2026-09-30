import { reassembleDraft } from '../workspaceStorage';
import type { UploadedDataRow } from '../../types';

type StoredRecord = Parameters<typeof reassembleDraft>[0];

const rows: UploadedDataRow[] = [
  { timestamp: '2026-01-01', pm25: 12 },
  { timestamp: '2026-01-02', pm25: 15 },
];

const baseRecord = (overrides: Partial<StoredRecord> = {}): StoredRecord =>
  ({
    id: 'default-workspace',
    version: 4,
    savedAt: '2026-01-02T10:00:00.000Z',
    name: 'AirQo air quality explorer draft',
    charts: [],
    activeChartId: undefined,
    rowSignatures: {},
    datasets: [
      {
        id: 'dataset-1',
        label: 'Readings',
        fileName: 'readings.csv',
        fileType: 'csv',
        sheetOptions: [],
        columns: ['timestamp', 'pm25'],
        rows: [] as UploadedDataRow[],
        rowCount: 2,
        sourceRowCount: 2,
        warnings: [],
        uploadedAt: '2026-01-02T00:00:00.000Z',
      },
    ],
    ...overrides,
  }) as unknown as StoredRecord;

/**
 * The regression: drafts written before rows moved into their own store kept
 * the rows INLINE. Reading only the data store restored those with zero rows,
 * which surfaced as "No chartable metrics" and empty chart panels — the draft
 * looked lost when its configuration was actually intact.
 */
describe('reassembleDraft', () => {
  it('keeps rows stored inline (legacy draft layout)', () => {
    const legacy = baseRecord();
    legacy.datasets[0].rows = rows;

    const result = reassembleDraft(legacy, {});

    expect(result.datasets[0].rows).toEqual(rows);
  });

  it('prefers rows from the data store (current layout)', () => {
    const current = baseRecord();
    const storedRows = [{ timestamp: '2026-02-01', pm25: 42 }];

    const result = reassembleDraft(current, { 'dataset-1': storedRows });

    expect(result.datasets[0].rows).toEqual(storedRows);
  });

  it('falls back to empty rows only when nothing was stored anywhere', () => {
    const result = reassembleDraft(baseRecord(), {});

    expect(result.datasets[0].rows).toEqual([]);
    // Metadata is preserved so the UI can name the file it is waiting for.
    expect(result.datasets[0].rowCount).toBe(2);
    expect(result.datasets[0].fileName).toBe('readings.csv');
  });

  it('keeps other datasets intact when only one is missing rows', () => {
    const mixed = baseRecord();
    mixed.datasets = [
      { ...mixed.datasets[0], id: 'dataset-1', fileName: 'a.csv', rows: rows },
      { ...mixed.datasets[0], id: 'dataset-2', fileName: 'b.csv', rows: [] },
    ] as StoredRecord['datasets'];

    const result = reassembleDraft(mixed, {});

    expect(result.datasets[0].rows).toEqual(rows);
    expect(result.datasets[1].rows).toEqual([]);
  });

  it('preserves the saved configuration and charts', () => {
    const result = reassembleDraft(
      baseRecord({ charts: [{ id: 'chart-1' }] as never }),
      {}
    );

    expect(result.charts).toHaveLength(1);
    expect(result.savedAt).toBe('2026-01-02T10:00:00.000Z');
  });
});
