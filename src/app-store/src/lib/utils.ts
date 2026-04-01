import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const stripTrailingSlash = (value: string): string => {
  if (!value) return value;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const cn = (...inputs: Array<string | undefined | null | false>) =>
  twMerge(clsx(inputs));