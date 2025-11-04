import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isTokenExpired = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return true;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }
    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (!decoded?.exp) {
      return true;
    }
    const exp =
      typeof decoded.exp === 'string' ? parseInt(decoded.exp, 10) : decoded.exp;
    if (typeof exp !== 'number' || isNaN(exp)) {
      return true;
    }

    const now = Date.now() / 1000;

    return now > exp;
  } catch {
    return true;
  }
};

/**
 * Removes underscores from a string and replaces them with spaces
 * @param str The string to process
 * @returns The string with underscores replaced by spaces
 */
export const removeUnderscores = (str: string): string => {
  return str.replace(/_/g, ' ');
};

/**
 * Capitalizes the first letter of each word in a string (title case)
 * @param str The string to process
 * @returns The string with each word capitalized
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Normalizes text by converting to lowercase first, then applying title case
 * @param str The string to process
 * @returns The normalized string with consistent capitalization
 */
export const normalizeText = (str: string): string => {
  return capitalizeWords(str.toLowerCase());
};

/**
 * Truncates a number to specified decimal places without rounding
 * @param value The number to truncate
 * @param decimalPlaces The number of decimal places to keep (default: 2)
 * @returns The truncated number
 */
export const truncateDecimals = (
  value: number,
  decimalPlaces: number = 2
): number => {
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.trunc(value * multiplier) / multiplier;
};

/**
 * Formats a number by truncating to specified decimal places and converting to string
 * @param value The number to format
 * @param decimalPlaces The number of decimal places to keep (default: 2)
 * @returns The formatted string
 */
export const formatTruncatedNumber = (
  value: number,
  decimalPlaces: number = 2
): string => {
  return truncateDecimals(value, decimalPlaces).toFixed(decimalPlaces);
};
