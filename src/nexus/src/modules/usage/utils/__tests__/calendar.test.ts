import {
  buildCalendarGrid,
  calendarLevelClass,
  rhythmIntensityClass,
  rhythmMatrixMax,
  rhythmCellLabel,
  WEEKDAYS,
  type CalendarGrid,
} from '../calendar';
import type { UsageCalendarDay } from '@/shared/types/usage';

const days = (
  entries: Array<[string, number, 0 | 1 | 2 | 3 | 4]>
): UsageCalendarDay[] =>
  entries.map(([date, count, level]) => ({ date, count, level }));

describe('buildCalendarGrid', () => {
  it('starts the grid at the Sunday on or before `from` and pads out-of-range cells as null', () => {
    // 2025-07-01 is a Tuesday -> grid starts Sunday 2025-06-29.
    const grid = buildCalendarGrid([], '2025-07-01', '2025-07-01');

    expect(grid.weeks.length).toBe(1);
    const column = grid.weeks[0];
    // Sun 06-29, Mon 06-30 are padding (null); Tue 07-01 is in range.
    expect(column[0]).toBeNull();
    expect(column[1]).toBeNull();
    expect(column[2]).toEqual({
      date: '2025-07-01',
      count: 0,
      level: 0,
      inRange: true,
    });
    // Thu..Sat are padding.
    expect(column[3]).toBeNull();
    expect(column[4]).toBeNull();
    expect(column[5]).toBeNull();
    expect(column[6]).toBeNull();
  });

  it('fills missing days with count 0 / level 0 (sparse calendar)', () => {
    const grid = buildCalendarGrid(
      [days([['2025-07-02', 5, 2]])[0]],
      '2025-07-01',
      '2025-07-03'
    );

    const column = grid.weeks[0];
    // Tue 07-01 present but absent from data -> count 0.
    expect(column[2]).toMatchObject({ date: '2025-07-01', count: 0, level: 0 });
    // Wed 07-02 present in data.
    expect(column[3]).toMatchObject({ date: '2025-07-02', count: 5, level: 2 });
    // Thu 07-03 present but absent from data -> count 0.
    expect(column[4]).toMatchObject({ date: '2025-07-03', count: 0, level: 0 });
  });

  it('emits a month label for each month boundary', () => {
    // Span Thu 2025-01-30 .. Sat 2025-02-01 -> two month columns (Jan, Feb).
    const grid = buildCalendarGrid([], '2025-01-30', '2025-02-01');

    const labels = grid.monthLabels.map(l => l.label);
    expect(labels).toContain('Jan');
    expect(labels).toContain('Feb');
    // Jan label must come before Feb.
    expect(labels.indexOf('Jan')).toBeLessThan(labels.indexOf('Feb'));
  });

  it('exposes the seven weekday labels, Sunday-first', () => {
    const grid: CalendarGrid = buildCalendarGrid(
      [],
      '2025-07-01',
      '2025-07-01'
    );
    expect([...grid.weekdays]).toEqual([...WEEKDAYS]);
    expect(grid.weekdays[0]).toBe('Sun');
    expect(grid.weekdays[6]).toBe('Sat');
  });
});

describe('calendarLevelClass', () => {
  it('maps each level to a distinct, dark-mode-friendly class', () => {
    const classes = ([0, 1, 2, 3, 4] as const).map(calendarLevelClass);
    // All five levels resolve to different classes.
    expect(new Set(classes).size).toBe(5);
    // Level 0 is the muted/empty cell with a visible ring outline.
    expect(classes[0]).toContain('bg-muted');
    expect(classes[0]).toContain('ring-1');
    // Higher levels use the color-mix primary pattern.
    expect(classes[4]).toContain('color-mix');
    expect(classes[4]).toContain('dark:text-foreground');
  });
});

describe('rhythmIntensityClass', () => {
  it('renders muted for zero value or empty matrix', () => {
    expect(rhythmIntensityClass(0, 0)).toContain('bg-muted/30');
    expect(rhythmIntensityClass(0, 10)).toContain('bg-muted/30');
  });

  it('ramps intensity with the value/max ratio', () => {
    const low = rhythmIntensityClass(1, 10); // ratio 0.1
    const high = rhythmIntensityClass(9, 10); // ratio 0.9
    expect(low).toContain('15%');
    expect(high).toContain('dark:text-foreground');
    expect(low).not.toEqual(high);
  });
});

describe('rhythmMatrixMax', () => {
  it('returns the largest finite value, ignoring non-finite entries', () => {
    expect(rhythmMatrixMax([])).toBe(0);
    expect(
      rhythmMatrixMax([
        [0, 3],
        [7, 2],
      ])
    ).toBe(7);
    expect(
      rhythmMatrixMax([
        [NaN, 4],
        [Infinity, 1],
      ])
    ).toBe(4);
  });
});

describe('rhythmCellLabel', () => {
  it('formats an accessible weekday/hour/value label', () => {
    expect(rhythmCellLabel('Mon', 14, 23)).toBe('Mon 14:00 — 23 actions');
    expect(rhythmCellLabel('Sun', 9, 1)).toBe('Sun 09:00 — 1 actions');
  });
});
