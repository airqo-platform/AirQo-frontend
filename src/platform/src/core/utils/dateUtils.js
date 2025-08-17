// utils/dateUtils.js
import { parseISO, isValid } from 'date-fns';

/**
 * Parses an ISO date string and validates it.
 * @param {string} dateString - The ISO date string to parse.
 * @returns {Date|null} - Returns a valid Date object or null if invalid.
 */
// Try to coerce common non-ISO formats to ISO 8601 (UTC)
// Examples handled:
// - 'YYYY-MM-DD HH:mm:ss' -> 'YYYY-MM-DDTHH:mm:ssZ'
// - 'YYYY-MM-DDTHH:mm:ss' -> 'YYYY-MM-DDTHH:mm:ssZ'
const normalizeToISO = (value) => {
  if (!value || typeof value !== 'string') return null;
  // If already contains timezone (Z or +/-), return as-is
  if (/T/.test(value) && /(Z|[+-]\d{2}:?\d{2})$/.test(value)) return value;

  // If it's missing timezone but has 'T', append Z
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)) {
    return `${value}Z`;
  }

  // If it's space-separated (common backend format): 'YYYY-MM-DD HH:mm:ss(.SSS)'
  const m = value.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.(\d+))?$/,
  );
  if (m) {
    const [, d, t, ms] = m;
    return `${d}T${t}${ms ? `.${ms}` : ''}Z`;
  }
  return null;
};

export const parseAndValidateISODate = (dateString) => {
  if (!dateString) return null;
  // First attempt: direct ISO parse
  let date = parseISO(dateString);
  if (isValid(date)) return date;

  // Fallback: attempt to normalize and parse again
  const coerced = normalizeToISO(dateString);
  if (coerced) {
    const coercedDate = parseISO(coerced);
    if (isValid(coercedDate)) return coercedDate;
  }

  // As last resort, try native Date
  const nativeDate = new Date(dateString);
  if (isValid(nativeDate)) return nativeDate;

  if (process.env.NODE_ENV === 'development') {
    // Avoid noisy logs in production
    // eslint-disable-next-line no-console
    console.warn(`Invalid date string (unparsed): ${dateString}`);
  }
  return null;
};
