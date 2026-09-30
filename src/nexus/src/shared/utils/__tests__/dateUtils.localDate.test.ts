import { toDateInputString, toLocalDate } from '../dateUtils';

describe('toLocalDate', () => {
  it('parses yyyy-MM-dd as a local calendar date, not a UTC instant', () => {
    // `new Date('2026-09-30')` is parsed as UTC and lands on Sep 29 for every
    // UTC+ viewer, so the parts are read explicitly.
    const parsed = toLocalDate('2026-09-30');

    expect(parsed).toBeDefined();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(30);
    expect(parsed?.getHours()).toBe(0);
    expect(parsed?.getMinutes()).toBe(0);
    expect(parsed?.getSeconds()).toBe(0);
    expect(parsed?.getMilliseconds()).toBe(0);
  });

  it('rejects empty and malformed values', () => {
    expect(toLocalDate('')).toBeUndefined();
    expect(toLocalDate(undefined)).toBeUndefined();
    expect(toLocalDate(null)).toBeUndefined();
    expect(toLocalDate('2026-9-3')).toBeUndefined();
    expect(toLocalDate('09/30/2026')).toBeUndefined();
    expect(toLocalDate('2026-09')).toBeUndefined();
    expect(toLocalDate('garbage')).toBeUndefined();
  });

  it('rejects dates that do not exist instead of rolling them forward', () => {
    // `new Date(2026, 1, 31)` is a valid Date that silently becomes Mar 3, so
    // `isValid` alone is not enough — this is what a strict round trip catches.
    expect(toLocalDate('2026-02-31')).toBeUndefined();
    // Month 13 would roll into the next year.
    expect(toLocalDate('2026-13-01')).toBeUndefined();
    // Feb 29 does not exist in a non-leap year.
    expect(toLocalDate('2026-02-29')).toBeUndefined();
    // ...but it does in a leap year.
    expect(toLocalDate('2028-02-29')).toEqual(new Date(2028, 1, 29));
  });
});

describe('toDateInputString', () => {
  it('formats a local Date as yyyy-MM-dd', () => {
    expect(toDateInputString(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateInputString(new Date(2026, 8, 30))).toBe('2026-09-30');
  });

  it('round-trips through toLocalDate', () => {
    const date = new Date(2026, 5, 1);

    expect(toLocalDate(toDateInputString(date))?.getTime()).toBe(
      date.getTime()
    );
  });

  it('returns an empty string for anything unusable', () => {
    expect(toDateInputString(undefined)).toBe('');
    expect(toDateInputString(null)).toBe('');
    expect(toDateInputString(new Date('not-a-date'))).toBe('');
  });
});
