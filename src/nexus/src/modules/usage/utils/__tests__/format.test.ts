import {
  DASH,
  formatNumber,
  formatPercent,
  formatPercentChange,
  formatSignedInt,
  formatDurationSec,
  formatCsvFilename,
  formatMonthLabel,
  retentionColorClass,
  currentUtcMonth,
  currentUtcDate,
  toUtcMonth,
  resolveMonthSelection,
  resolveDateSelection,
  normalizeKind,
  retentionCellView,
  usersPagination,
  downsampleMax,
  computeSparklineBars,
} from '../format';

describe('formatNumber', () => {
  it('formats integers with grouping separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(0)).toBe('0');
  });

  it('returns DASH for null, undefined, or non-finite values', () => {
    expect(formatNumber(null)).toBe(DASH);
    expect(formatNumber(undefined)).toBe(DASH);
    expect(formatNumber(NaN)).toBe(DASH);
    expect(formatNumber(Infinity)).toBe(DASH);
  });
});

describe('formatPercent', () => {
  it('formats with one decimal and % suffix', () => {
    expect(formatPercent(42.34)).toBe('42.3%');
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('returns DASH for null/undefined', () => {
    expect(formatPercent(null)).toBe(DASH);
    expect(formatPercent(undefined)).toBe(DASH);
  });
});

describe('formatPercentChange', () => {
  it('prefixes positive values with + and negative with -', () => {
    // Intl.NumberFormat with maximumFractionDigits:1 drops trailing zeros.
    expect(formatPercentChange(12)).toBe('+12%');
    expect(formatPercentChange(-3)).toBe('-3%');
    expect(formatPercentChange(2.5)).toBe('+2.5%');
  });

  it('returns DASH for null rather than inventing "0%"', () => {
    expect(formatPercentChange(null)).toBe(DASH);
    expect(formatPercentChange(undefined)).toBe(DASH);
  });
});

describe('formatSignedInt', () => {
  it('adds a sign to integers', () => {
    expect(formatSignedInt(5)).toBe('+5');
    expect(formatSignedInt(-2)).toBe('-2');
  });

  it('returns DASH for null', () => {
    expect(formatSignedInt(null)).toBe(DASH);
  });
});

describe('formatDurationSec', () => {
  it('renders sub-minute durations in seconds', () => {
    expect(formatDurationSec(45)).toBe('45s');
  });

  it('renders minutes and seconds', () => {
    expect(formatDurationSec(330)).toBe('5m 30s');
    expect(formatDurationSec(120)).toBe('2m');
  });

  it('renders hours and minutes', () => {
    expect(formatDurationSec(8100)).toBe('2h 15m');
    expect(formatDurationSec(3600)).toBe('1h');
  });

  it('renders days and hours', () => {
    expect(formatDurationSec(100800)).toBe('1d 4h');
    expect(formatDurationSec(86400)).toBe('1d');
  });

  it('clamps negatives to zero', () => {
    expect(formatDurationSec(-10)).toBe('0s');
  });

  it('returns DASH for null/undefined', () => {
    expect(formatDurationSec(null)).toBe(DASH);
    expect(formatDurationSec(undefined)).toBe(DASH);
  });
});

describe('formatCsvFilename', () => {
  it('embeds the month into the canonical filename', () => {
    expect(formatCsvFilename('2025-07')).toBe('nexus-usage-2025-07.csv');
  });

  it('falls back to the current UTC month for null/empty/invalid', () => {
    const expected = `nexus-usage-${currentUtcMonth()}.csv`;
    expect(formatCsvFilename(null)).toBe(expected);
    expect(formatCsvFilename('')).toBe(expected);
    expect(formatCsvFilename('nope')).toBe(expected);
  });
});

describe('formatMonthLabel', () => {
  it('formats a YYYY-MM token as a full month label', () => {
    expect(formatMonthLabel('2026-10')).toBe('October 2026');
    expect(formatMonthLabel('2026-01')).toBe('January 2026');
  });

  it('returns DASH for empty or malformed months', () => {
    expect(formatMonthLabel(null)).toBe(DASH);
    expect(formatMonthLabel(undefined)).toBe(DASH);
    expect(formatMonthLabel('')).toBe(DASH);
    expect(formatMonthLabel('2026')).toBe(DASH);
    expect(formatMonthLabel('not-a-month')).toBe(DASH);
    expect(formatMonthLabel('2026-13')).toBe(DASH);
    expect(formatMonthLabel('2026-00')).toBe(DASH);
  });
});

describe('retentionColorClass', () => {
  it('returns a neutral muted class for null/undefined rates', () => {
    const c = retentionColorClass(null);
    expect(c).toContain('bg-muted/40');
    expect(c).toContain('text-muted-foreground');
  });

  it('uses distinct intensity buckets by rate', () => {
    const low = retentionColorClass(10);
    const high = retentionColorClass(90);
    expect(low).not.toBe(high);
    // both remain readable foreground classes
    expect(low).toContain('text-foreground');
    expect(high).toContain('text-white');
  });

  it('clamps out-of-range values to the nearest bucket', () => {
    expect(retentionColorClass(-50)).toBe(retentionColorClass(0));
    expect(retentionColorClass(150)).toBe(retentionColorClass(100));
  });
});

describe('currentUtcMonth / currentUtcDate / toUtcMonth', () => {
  it('currentUtcMonth returns a valid YYYY-MM string', () => {
    expect(currentUtcMonth()).toMatch(/^\d{4}-\d{2}$/);
  });

  it('currentUtcDate returns a valid YYYY-MM-DD string', () => {
    expect(currentUtcDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('toUtcMonth extracts the UTC month from a Date', () => {
    const d = new Date(Date.UTC(2025, 6, 15)); // July 2025
    expect(toUtcMonth(d)).toBe('2025-07');
  });

  it('currentUtcMonth never returns a future month (sanity guard)', () => {
    const now = new Date();
    const [y, m] = currentUtcMonth().split('-').map(Number);
    const curY = now.getUTCFullYear();
    const curM = now.getUTCMonth() + 1;
    expect(y < curY || (y === curY && m <= curM)).toBe(true);
  });
});

describe('resolveMonthSelection', () => {
  it('normalizes any picked day to its YYYY-MM month', () => {
    // "Sep 15" and "Sep 1" are the same month-granular selection — both
    // resolve to the same canonical month so the dashboard always updates.
    expect(resolveMonthSelection(new Date(2025, 8, 15), '2025-12')).toBe(
      '2025-09'
    );
    expect(resolveMonthSelection(new Date(2025, 8, 1), '2025-12')).toBe(
      '2025-09'
    );
  });

  it('keeps past and current-month picks untouched', () => {
    expect(resolveMonthSelection(new Date(2024, 0, 31), '2025-09')).toBe(
      '2024-01'
    );
    expect(resolveMonthSelection(new Date(2025, 8, 20), '2025-09')).toBe(
      '2025-09'
    );
  });

  it('clamps a future pick to the max month instead of dropping it', () => {
    expect(resolveMonthSelection(new Date(2026, 0, 15), '2025-09')).toBe(
      '2025-09'
    );
    expect(resolveMonthSelection(new Date(2099, 11, 1), '2025-09')).toBe(
      '2025-09'
    );
  });

  it('defaults the clamp bound to the current UTC month', () => {
    const futurePick = new Date(new Date().getUTCFullYear() + 2, 0, 10);
    expect(resolveMonthSelection(futurePick)).toBe(currentUtcMonth());
  });
});

describe('resolveDateSelection', () => {
  it('normalizes a picked day to its YYYY-MM-DD date', () => {
    expect(resolveDateSelection(new Date(2025, 8, 15), '2025-12-31')).toBe(
      '2025-09-15'
    );
    expect(resolveDateSelection(new Date(2025, 0, 1), '2025-12-31')).toBe(
      '2025-01-01'
    );
  });

  it('keeps past and current-month picks untouched', () => {
    expect(resolveDateSelection(new Date(2024, 0, 31), '2025-09-15')).toBe(
      '2024-01-31'
    );
    expect(resolveDateSelection(new Date(2025, 8, 15), '2025-09-15')).toBe(
      '2025-09-15'
    );
  });

  it('clamps a future pick to the max date instead of dropping it', () => {
    expect(resolveDateSelection(new Date(2026, 0, 15), '2025-09-15')).toBe(
      '2025-09-15'
    );
    expect(resolveDateSelection(new Date(2099, 11, 1), '2025-09-15')).toBe(
      '2025-09-15'
    );
  });

  it('defaults the clamp bound to the current UTC date', () => {
    const futurePick = new Date(
      new Date().getUTCFullYear() + 2,
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    );
    expect(resolveDateSelection(futurePick)).toBe(currentUtcDate());
  });
});

describe('normalizeKind', () => {
  it('passes "api" through', () => {
    expect(normalizeKind('api')).toBe('api');
  });

  it('defaults anything else to "page"', () => {
    expect(normalizeKind('page')).toBe('page');
    expect(normalizeKind(null)).toBe('page');
    expect(normalizeKind(undefined)).toBe('page');
    expect(normalizeKind('weird')).toBe('page');
  });
});

describe('retentionCellView', () => {
  it('M+0 renders cohort size, NOT a percentage', () => {
    const view = retentionCellView(0, 1200, 100);
    expect(view.text).toBe('1,200');
    expect(view.text).not.toContain('%');
    expect(view.isBaseline).toBe(true);
    expect(view.label).toMatch(/baseline cohort size/i);
    expect(view.label).toContain('1,200');
    expect(view.label).toContain('acquisition month');
  });

  it('M+0 with missing size renders DASH with unavailable label', () => {
    const view = retentionCellView(0, null, 100);
    expect(view.text).toBe(DASH);
    expect(view.isBaseline).toBe(true);
    expect(view.label).toMatch(/unavailable/i);
  });

  it('M+0 ignores the rate_pct entirely', () => {
    const a = retentionCellView(0, 50, 42.5);
    const b = retentionCellView(0, 50, 99.9);
    expect(a.text).toBe('50');
    expect(b.text).toBe('50');
  });

  it('offsets > 0 render percent rate', () => {
    const view = retentionCellView(1, 1200, 42.5);
    expect(view.text).toBe('42.5%');
    expect(view.isBaseline).toBe(false);
    expect(view.label).toContain('42.5%');
    expect(view.label).toContain('returned');
  });

  it('offsets > 0 with null rate render DASH with "No data" label', () => {
    const view = retentionCellView(2, 800, null);
    expect(view.text).toBe(DASH);
    expect(view.isBaseline).toBe(false);
    expect(view.label).toBe('No data');
  });
});

describe('usersPagination', () => {
  it('(1, 25, 120, 5) → currentPage 1, totalPages 5, prev 1, next 2', () => {
    const p = usersPagination(1, 25, 120, 5);
    expect(p.currentPage).toBe(1);
    expect(p.totalPages).toBe(5);
    expect(p.prevPage).toBe(1);
    expect(p.nextPage).toBe(2);
    expect(p.summary).toBe('120 users · page 1 of 5');
  });

  it('uses parent-owned page, never a stale response page', () => {
    // Parent says page 3 — response may echo page 1 due to placeholderData.
    const p = usersPagination(3, 25, 120, 5);
    expect(p.currentPage).toBe(3);
    expect(p.prevPage).toBe(2);
    expect(p.nextPage).toBe(4);
  });

  it('clamps prevPage at 1 and nextPage at totalPages', () => {
    const first = usersPagination(1, 25, 100, 4);
    expect(first.prevPage).toBe(1);
    const last = usersPagination(4, 25, 100, 4);
    expect(last.nextPage).toBe(4);
  });

  it('falls back to ceil(total/pageSize) when responsePages is null', () => {
    const p = usersPagination(1, 10, 35, null);
    expect(p.totalPages).toBe(4);
  });

  it('singular "user" for total=1', () => {
    const p = usersPagination(1, 25, 1, null);
    expect(p.summary).toBe('1 user · page 1 of 1');
  });
});

describe('downsampleMax', () => {
  it('returns a copy unchanged when already short enough', () => {
    const input = [3, 1, 4, 1, 5];
    expect(downsampleMax(input, 5)).toEqual(input);
    expect(downsampleMax(input, 10)).toEqual(input);
  });

  it('is deterministic — same input always yields same output', () => {
    const input = Array.from({ length: 200 }, (_, i) => i % 17);
    const a = downsampleMax(input, 30);
    const b = downsampleMax(input, 30);
    expect(a).toEqual(b);
  });

  it('preserves bucket maxima (peaks survive)', () => {
    const input = [1, 1, 1, 1, 100, 1, 1, 1, 1, 200];
    const result = downsampleMax(input, 2);
    expect(result[0]).toBe(100); // bucket 0 covers indices 0-4
    expect(result[1]).toBe(200); // bucket 1 covers indices 5-9
  });

  it('handles empty and single-element arrays', () => {
    expect(downsampleMax([], 5)).toEqual([]);
    expect(downsampleMax([42], 5)).toEqual([42]);
  });
});

describe('computeSparklineBars', () => {
  const WIDTH = 96;
  const HEIGHT = 24;
  const lengths = [0, 1, 2, 23, 24, 31, 48, 49, 100, 1000];

  it.each(lengths)('all bars stay inside viewBox for length %i', length => {
    const values = Array.from({ length }, (_, i) => i % 7);
    const bars = computeSparklineBars(values, WIDTH, HEIGHT);
    expect(bars.length).toBeGreaterThan(0);
    for (const bar of bars) {
      expect(bar.x).toBeGreaterThanOrEqual(0);
      expect(bar.x + bar.width).toBeLessThanOrEqual(WIDTH + 1e-9);
      expect(bar.y).toBeGreaterThanOrEqual(0);
      expect(bar.y + bar.height).toBeLessThanOrEqual(HEIGHT + 1e-9);
      expect(bar.width).toBeGreaterThan(0);
      expect(bar.height).toBeGreaterThan(0);
    }
  });

  it('handles null/undefined values array', () => {
    expect(computeSparklineBars(null, WIDTH, HEIGHT).length).toBe(1);
    expect(computeSparklineBars(undefined, WIDTH, HEIGHT).length).toBe(1);
  });

  it('sanitizes negative and non-finite values to 0', () => {
    const bars = computeSparklineBars([-5, NaN, Infinity, 10], WIDTH, HEIGHT);
    expect(bars.length).toBeGreaterThan(0);
    for (const bar of bars) {
      expect(bar.x + bar.width).toBeLessThanOrEqual(WIDTH + 1e-9);
    }
  });

  it('downsamples long arrays to at most maxBars', () => {
    const maxBars = Math.floor((WIDTH + 1) / 2); // floor((w+GAP)/(MIN+GAP))
    const bars = computeSparklineBars(
      Array.from({ length: 1000 }, () => 1),
      WIDTH,
      HEIGHT
    );
    expect(bars.length).toBeLessThanOrEqual(maxBars);
  });
});
