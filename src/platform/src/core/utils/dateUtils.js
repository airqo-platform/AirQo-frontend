// utils/dateUtils.js
import { parseISO, isValid } from 'date-fns';

/**
 * Parses an ISO date string and validates it.
 * @param {string} dateString - The ISO date string to parse.
 * @returns {Date|null} - Returns a valid Date object or null if invalid.
 */
export const parseAndValidateISODate = (dateString) => {
  const date = parseISO(dateString);
  if (isValid(date)) {
    return date;
  }
  console.warn(`Invalid ISO date string: ${dateString}`);
  return null;
};
