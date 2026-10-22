import { addDays, format, parse, subDays } from 'date-fns';

/**
 * Default filter window for the activity log: 7 calendar days including
 * today (e.g. on Oct 22 the range starts Oct 16, not Oct 15).
 */
export const ACTIVITY_DEFAULT_DAYS = 7;

/** Strict `yyyy-MM-dd` shape of a `<input type="date">` value. */
const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Formats a date as a LOCAL `yyyy-MM-dd` string for a date input.
 *
 * `toISOString().slice(0, 10)` is wrong here: it formats in UTC, so a date
 * just after local midnight (or just before, for viewers west of UTC) gets
 * shifted to the neighbouring calendar day.
 */
export const formatDateInput = (date: Date): string =>
  format(date, 'yyyy-MM-dd');

/** 7 calendar days including today, as date-input strings. */
export const getDefaultActivityDateRange = (
  now: Date = new Date()
): { startDate: string; endDate: string } => ({
  startDate: formatDateInput(subDays(now, ACTIVITY_DEFAULT_DAYS - 1)),
  endDate: formatDateInput(now),
});

/**
 * Converts the UI's inclusive "To" date into the API's `end_date`.
 *
 * The backend treats `end_date=YYYY-MM-DD` as MIDNIGHT AT THE START of that
 * day, so a To date of Oct 22 would silently exclude everything that happened
 * on Oct 22 (and `start=end` is rejected outright). Adding one day locally
 * makes the queried window cover the whole of the selected final day.
 *
 * Empty or unparseable values pass through unchanged (no end filter).
 */
export const toActivityApiEndDate = (endDate: string): string => {
  if (!endDate || !DATE_INPUT_PATTERN.test(endDate)) return endDate;

  // Parsed at LOCAL midnight — the string is a calendar day, not an instant.
  const parsed = parse(endDate, 'yyyy-MM-dd', new Date());
  if (Number.isNaN(parsed.getTime())) return endDate;

  return formatDateInput(addDays(parsed, 1));
};

/** True when the given pair equals the 7-day default for `now`. */
export const isDefaultActivityDateRange = (
  startDate: string,
  endDate: string,
  now: Date = new Date()
): boolean => {
  const defaults = getDefaultActivityDateRange(now);
  return startDate === defaults.startDate && endDate === defaults.endDate;
};
