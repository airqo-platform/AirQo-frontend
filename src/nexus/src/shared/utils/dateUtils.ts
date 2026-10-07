import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Date formatting utilities using date-fns for consistency across the application
 */

/**
 * Formats a date to a localized date string (e.g., "12/25/2023")
 * @param date - Date to format (Date object, ISO string, or timestamp)
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string or fallback string
 */
export const formatDate = (
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!date) return 'N/A';

  try {
    // Try parseISO first for strict ISO strings, then fallback to Date constructor
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = parseISO(date);
      if (!isValid(dateObj)) {
        // fallback: try Date constructor (handles other formats/timestamps)
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date as number | Date);
    }

    if (!isValid(dateObj)) return 'Invalid Date';

    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options,
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Formats a date to a localized time string (e.g., "2:30:45 PM")
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted time string or fallback string
 */
export const formatTime = (
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) return 'Invalid Time';

    return dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options,
    });
  } catch {
    return 'Invalid Time';
  }
};

/**
 * Formats a date to a localized date and time string (e.g., "12/25/2023, 2:30:45 PM")
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date and time string or fallback string
 */
export const formatDateTime = (
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) return 'Invalid Date/Time';

    return dateObj.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options,
    });
  } catch {
    return 'Invalid Date/Time';
  }
};

/**
 * Formats a date using date-fns format patterns
 * @param date - Date to format
 * @param pattern - date-fns format pattern (e.g., 'yyyy-MM-dd', 'MMM dd, yyyy')
 * @returns Formatted date string or fallback string
 */
export const formatWithPattern = (
  date: Date | string | number | null | undefined,
  pattern: string = 'yyyy-MM-dd'
): string => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) return 'Invalid Date';

    return format(dateObj, pattern);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Formats a date as a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date - Date to format
 * @param options - Options for formatDistanceToNow
 * @returns Relative time string or fallback string
 */
export const formatRelativeTime = (
  date: Date | string | number | null | undefined,
  options: { addSuffix?: boolean; includeSeconds?: boolean } = {
    addSuffix: true,
  }
): string => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) return 'Invalid Date';

    return formatDistanceToNow(dateObj, options);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Checks if a date is valid
 * @param date - Date to check
 * @returns True if the date is valid
 */
export const isValidDate = (
  date: Date | string | number | null | undefined
): boolean => {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isValid(dateObj);
  } catch {
    return false;
  }
};

/**
 * Parses various date formats and returns a Date object
 * @param date - Date to parse
 * @returns Date object or null if invalid
 */
export const parseDate = (
  date: Date | string | number | null | undefined
): Date | null => {
  if (!date) return null;

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) return null;

    return dateObj;
  } catch {
    return null;
  }
};

/**
 * Common date format patterns for consistency
 */
export const DATE_FORMATS = {
  // ISO formats
  ISO_DATE: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",

  // US formats
  US_DATE: 'MM/dd/yyyy',
  US_DATETIME: 'MM/dd/yyyy hh:mm a',

  // European formats
  EU_DATE: 'dd/MM/yyyy',
  EU_DATETIME: 'dd/MM/yyyy HH:mm',

  // Readable formats
  READABLE_DATE: 'MMM dd, yyyy',
  READABLE_DATE_LONG: 'MMM d, yyyy', // e.g. "Oct 6, 2026" — matches the shared DatePicker trigger
  READABLE_DATETIME: 'MMM dd, yyyy hh:mm a',
  FULL_READABLE: 'EEEE, MMMM dd, yyyy',

  // Short formats
  SHORT_DATE: 'MM/dd',
  MONTH_YEAR: 'MMMM yyyy',
} as const;

/** `yyyy-MM-dd`, the value shape of a native `<input type="date">`. */
export const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * `yyyy-MM-dd` -> a **local** Date at midnight.
 *
 * `new Date('2026-09-30')` is parsed as UTC, which lands on the previous day
 * for every positive-offset (UTC+) viewer, so the parts are read explicitly and
 * the round trip is verified: `new Date(2026, 1, 31)` is a *valid* Date that
 * silently rolls forward to Mar 3, so validity alone is not enough.
 *
 * Returns `undefined` when the value is empty, malformed, or a date that does
 * not exist.
 */
export const toLocalDate = (
  value: string | null | undefined
): Date | undefined => {
  if (!value || !ISO_DATE_ONLY.test(value.trim())) return undefined;
  const [year, month, day] = value.trim().split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : undefined;
};

/**
 * local Date -> `yyyy-MM-dd`, for native date inputs and the date-only
 * `from`/`to` query parameters the API takes.
 */
export const toDateInputString = (date: Date | null | undefined): string =>
  date instanceof Date && isValid(date) ? format(date, 'yyyy-MM-dd') : '';
