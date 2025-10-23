import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { JWT } from 'next-auth/jwt';

// Extend JWT type to include exp property
interface ExtendedJWT extends JWT {
  exp?: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isTokenExpired = (token: ExtendedJWT): boolean => {
  if (!token?.exp || typeof token.exp !== 'number') return true;
  return Date.now() / 1000 > token.exp;
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
