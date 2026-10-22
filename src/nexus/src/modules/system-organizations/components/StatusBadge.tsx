'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';

export interface StatusBadgeProps {
  /** Raw status value; upper-cased before comparison. */
  status?: string | null;
  /** Label/class shown when `status` is missing — e.g. `ACTIVE` for roles. */
  fallback?: string;
  className?: string;
}

const STATUS_CLASSES: Record<'ACTIVE' | 'INACTIVE', string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  INACTIVE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

/**
 * Pill badge for organization/role statuses. `ACTIVE` is green, everything
 * else — including unknown or missing values — falls back to gray, so a new
 * backend status can never render with a misleading color.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  fallback = 'UNKNOWN',
  className,
}) => {
  const normalized = String(status ?? '')
    .trim()
    .toUpperCase();
  const label = normalized || String(fallback).trim().toUpperCase();
  const colorClasses =
    label === 'ACTIVE' ? STATUS_CLASSES.ACTIVE : STATUS_CLASSES.INACTIVE;

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClasses,
        className
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
