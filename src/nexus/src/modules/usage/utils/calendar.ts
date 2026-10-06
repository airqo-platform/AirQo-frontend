import type { UsageCalendarDay } from '@/shared/types/usage';
import { formatNumber } from './format';

/**
 * Pure calendar-grid geometry and color-intensity helpers for the per-user
 * Usage calendar (M3). Kept dependency-free and side-effect-free so they are
 * trivially unit-testable, mirroring the `format.ts` helpers reused from M2.
 */

export const WEEKDAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Parses a "YYYY-MM-DD" string into a local-midnight Date. */
const parseDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** Formats a Date as "YYYY-MM-DD" in local time. */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Returns a new Date shifted by `n` days (n may be negative). */
const addDays = (date: Date, n: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + n);
  return next;
};

/** A single rendered cell in the GitHub-style heatmap grid. */
export interface CalendarCell {
  /** "YYYY-MM-DD" — the calendar day this cell represents. */
  date: string;
  /** Activity count for the day (0 when absent from the response). */
  count: number;
  /** Intensity level 0-4 (0 when absent from the response). */
  level: 0 | 1 | 2 | 3 | 4;
  /** False for padding cells that fall outside the [from, to] window. */
  inRange: boolean;
}

/** A month label anchored to the first week column where that month appears. */
export interface CalendarMonthLabel {
  weekIndex: number;
  label: string;
}

/** The fully laid-out calendar grid plus its month/weekday labels. */
export interface CalendarGrid {
  /** weeks[weekIndex][weekdayIndex] — Sunday-start columns of 7 cells. */
  weeks: (CalendarCell | null)[][];
  monthLabels: CalendarMonthLabel[];
  weekdays: readonly string[];
}

/**
 * Lays the calendar days out into Sunday-start week columns with correct month
 * boundaries — the geometry behind the GitHub-style heatmap.
 *
 * The grid starts at the Sunday on or before `from` and ends at the Saturday on
 * or after `to`, so the first/last columns may contain out-of-range padding
 * cells (rendered as gaps). Days missing from `days` are filled with count 0 /
 * level 0 so sparse/new-user calendars still render a complete grid.
 */
export const buildCalendarGrid = (
  days: UsageCalendarDay[],
  from: string,
  to: string
): CalendarGrid => {
  const byDate = new Map(days.map(day => [day.date, day]));

  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  // Grid starts at the Sunday on or before `from`.
  const gridStart = addDays(fromDate, -fromDate.getDay());

  const weeks: (CalendarCell | null)[][] = [];
  const monthLabels: CalendarMonthLabel[] = [];
  let previousMonthKey = '';

  let weekStart = new Date(gridStart);
  let weekIndex = 0;
  while (weekStart <= toDate) {
    const column: (CalendarCell | null)[] = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      const cellDate = addDays(weekStart, weekday);
      const date = formatDate(cellDate);
      const inRange = cellDate >= fromDate && cellDate <= toDate;
      if (!inRange) {
        column.push(null);
        continue;
      }

      // A month can start in the middle of a Sunday-start week. Track the
      // first in-range cell instead of only inspecting `weekStart`, otherwise
      // a Jan 30–Feb 1 range never receives a February label.
      const monthKey = `${cellDate.getFullYear()}-${cellDate.getMonth()}`;
      if (monthKey !== previousMonthKey) {
        monthLabels.push({
          weekIndex,
          label: MONTHS[cellDate.getMonth()],
        });
        previousMonthKey = monthKey;
      }

      const day = byDate.get(date);
      column.push({
        date,
        count: day?.count ?? 0,
        level: day?.level ?? 0,
        inRange: true,
      });
    }
    weeks.push(column);

    weekStart = addDays(weekStart, 7);
    weekIndex += 1;
  }

  return { weeks, monthLabels, weekdays: WEEKDAYS };
};

/**
 * Maps a calendar intensity level (0-4) to a Tailwind color-mix class that is
 * readable in BOTH light and dark themes, following the `retentionColorClass`
 * pattern from `format.ts`. Level 0 is the empty/muted cell with a visible
 * ring outline; levels 1-4 ramp the `--primary` hue from 25% to 90% opacity.
 * Meaning is never color-only — the numeric label is always rendered in the
 * cell.
 */
export const calendarLevelClass = (level: 0 | 1 | 2 | 3 | 4): string => {
  switch (level) {
    case 0:
      return 'bg-muted ring-1 ring-inset ring-border/60 text-muted-foreground';
    case 1:
      return 'bg-[color-mix(in_srgb,rgb(var(--primary))_25%,transparent)] text-foreground';
    case 2:
      return 'bg-[color-mix(in_srgb,rgb(var(--primary))_45%,transparent)] text-foreground';
    case 3:
      return 'bg-[color-mix(in_srgb,rgb(var(--primary))_70%,transparent)] text-foreground';
    case 4:
      return 'bg-[color-mix(in_srgb,rgb(var(--primary))_90%,transparent)] text-white dark:text-foreground';
    default:
      return 'bg-muted/30 text-muted-foreground';
  }
};

/**
 * Maps a rhythm matrix value to a color-mix intensity class relative to the
 * matrix maximum, so the 7×24 weekday×hour heatmap is comparable across users
 * with very different activity volumes. A zero or empty matrix renders muted.
 * Meaning is never color-only — the numeric label is always rendered.
 */
export const rhythmIntensityClass = (value: number, max: number): string => {
  if (max <= 0 || value <= 0) {
    return 'bg-muted/30 text-muted-foreground';
  }
  const ratio = value / max;
  if (ratio < 0.25) {
    return 'bg-[color-mix(in_srgb,rgb(var(--primary))_15%,transparent)] text-foreground';
  }
  if (ratio < 0.5) {
    return 'bg-[color-mix(in_srgb,rgb(var(--primary))_30%,transparent)] text-foreground';
  }
  if (ratio < 0.75) {
    return 'bg-[color-mix(in_srgb,rgb(var(--primary))_50%,transparent)] text-foreground';
  }
  return 'bg-[color-mix(in_srgb,rgb(var(--primary))_80%,transparent)] text-white dark:text-foreground';
};

/** The maximum finite value in a rhythm matrix (0 when the matrix is empty). */
export const rhythmMatrixMax = (matrix: number[][]): number => {
  let max = 0;
  for (const row of matrix) {
    for (const value of row) {
      if (Number.isFinite(value) && value > max) {
        max = value;
      }
    }
  }
  return max;
};

/** Accessible label for a single rhythm cell: "Mon 14:00 — 23 actions". */
export const rhythmCellLabel = (
  weekday: string,
  hour: number,
  value: number
): string => {
  const hh = String(hour).padStart(2, '0');
  return `${weekday} ${hh}:00 — ${formatNumber(value)} actions`;
};
