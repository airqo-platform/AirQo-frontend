import { differenceInCalendarDays } from 'date-fns';
import {
  ACTIVITY_DEFAULT_DAYS,
  formatDateInput,
  getDefaultActivityDateRange,
  isDefaultActivityDateRange,
  toActivityApiEndDate,
} from '../dateRange';

// Frozen "now": Oct 22 2026, 15:00 LOCAL time. Passing it explicitly keeps
// every assertion independent of the real clock.
const now = new Date(2026, 9, 22, 15, 0, 0);

describe('ACTIVITY_DEFAULT_DAYS', () => {
  it('is 7', () => {
    expect(ACTIVITY_DEFAULT_DAYS).toBe(7);
  });
});

describe('formatDateInput', () => {
  it('formats the LOCAL calendar day, never the UTC-shifted one', () => {
    // 00:30 local on Jan 5 is still Jan 4 in UTC for every timezone behind
    // UTC — `toISOString` would print 2026-01-04 here.
    expect(formatDateInput(new Date(2026, 0, 5, 0, 30, 0))).toBe('2026-01-05');
    expect(formatDateInput(now)).toBe('2026-10-22');
  });
});

describe('getDefaultActivityDateRange', () => {
  it('spans 7 calendar days including today', () => {
    expect(getDefaultActivityDateRange(now)).toEqual({
      startDate: '2026-10-16',
      endDate: '2026-10-22',
    });
  });

  it('counts calendar days, not elapsed hours', () => {
    // A 24h-based span would miscount across a DST transition inside the
    // window; the range must always be 7 days on the wall calendar.
    const { startDate, endDate } = getDefaultActivityDateRange(now);
    const span =
      differenceInCalendarDays(
        new Date(`${endDate}T00:00:00`),
        new Date(`${startDate}T00:00:00`)
      ) + 1;

    expect(span).toBe(7);
  });

  it('crosses month boundaries correctly', () => {
    expect(getDefaultActivityDateRange(new Date(2026, 2, 2, 12, 0, 0))).toEqual(
      {
        startDate: '2026-02-24',
        endDate: '2026-03-02',
      }
    );
  });
});

describe('toActivityApiEndDate', () => {
  it('adds one day so the whole of the To date is included', () => {
    // The API reads end_date as midnight at the START of the day, so an
    // inclusive To of Oct 22 must be queried as Oct 23.
    expect(toActivityApiEndDate('2026-10-22')).toBe('2026-10-23');
  });

  it('rolls over month and year boundaries', () => {
    expect(toActivityApiEndDate('2026-12-31')).toBe('2027-01-01');
    expect(toActivityApiEndDate('2026-02-28')).toBe('2026-03-01');
  });

  it('returns empty and invalid values unchanged (no filter)', () => {
    expect(toActivityApiEndDate('')).toBe('');
    expect(toActivityApiEndDate('not-a-date')).toBe('not-a-date');
    expect(toActivityApiEndDate('22-10-2026')).toBe('22-10-2026');
    expect(toActivityApiEndDate('2026-13-45')).toBe('2026-13-45');
  });
});

describe('isDefaultActivityDateRange', () => {
  it('is true for the default pair', () => {
    expect(isDefaultActivityDateRange('2026-10-16', '2026-10-22', now)).toBe(
      true
    );
  });

  it('is false when either bound changes', () => {
    expect(isDefaultActivityDateRange('2026-10-15', '2026-10-22', now)).toBe(
      false
    );
    expect(isDefaultActivityDateRange('2026-10-16', '2026-10-21', now)).toBe(
      false
    );
    expect(isDefaultActivityDateRange('', '', now)).toBe(false);
  });
});
