import { decimateRows } from '../index';

type Row = Record<string, unknown>;

const buildRows = (count: number, valueAt: (i: number) => number): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    time: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z`,
    value: valueAt(i),
    site: 'Site A',
  }));

describe('decimateRows', () => {
  it('passes data through unchanged below the budget', () => {
    const rows = buildRows(500, i => i);
    const out = decimateRows(rows, 2000);

    expect(out).toBe(rows);
  });

  it('keeps the output within the budget for huge datasets', () => {
    const out = decimateRows(
      buildRows(50_000, i => i),
      2000
    );

    expect(out.length).toBeLessThanOrEqual(2000 + 2);
  });

  it('preserves the full min/max envelope (peaks and valleys survive)', () => {
    // 200 rows with a single spike at index 100.
    const rows = buildRows(200, i => (i === 100 ? 999 : i % 50));
    const out = decimateRows(rows, 20);

    const values = out.map(row => row.value as number);
    expect(Math.max(...values)).toBe(999);
    expect(Math.min(...values)).toBe(0);
  });

  it('keeps the exact x-domain: first row keeps start, last row keeps end', () => {
    const rows = buildRows(1000, i => i);
    const out = decimateRows(rows, 100);

    expect(out[0].time).toBe(rows[0].time);
    expect(out[out.length - 1].time).toBe(rows[rows.length - 1].time);
  });

  it('emits nulls for data-gap buckets instead of the first row value', () => {
    const rows: Row[] = [
      { time: 't1', value: 10 },
      { time: 't2', value: null },
      { time: 't3', value: null },
      { time: 't4', value: null },
      { time: 't5', value: null },
      { time: 't6', value: null },
    ];
    const out = decimateRows(rows, 4);

    // Budget 4 → 2 buckets of 3: bucket 1 = t1..t3 (min/max 10), bucket 2 =
    // t4..t6 (all null → both rows null, never the first row's value).
    expect(out).toHaveLength(4);
    expect(out[0].value).toBe(10);
    expect(out[1].value).toBe(10);
    expect(out[2].value).toBeNull();
    expect(out[3].value).toBeNull();
  });

  it('computes the envelope per series column for multi-series rows', () => {
    const rows: Row[] = [
      { time: 't1', siteA: 5, siteB: 20 },
      { time: 't2', siteA: 8, siteB: 12 },
      { time: 't3', siteA: 2, siteB: 30 },
      { time: 't4', siteA: 9, siteB: 3 },
    ];
    const out = decimateRows(rows, 2);

    // Budget 2 → single bucket of all 4 rows → one min + one max row,
    // computed independently per series column.
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ siteA: 2, siteB: 3 });
    expect(out[1]).toMatchObject({ siteA: 9, siteB: 30 });
  });

  it('handles empty input', () => {
    expect(decimateRows([], 100)).toEqual([]);
  });
});
