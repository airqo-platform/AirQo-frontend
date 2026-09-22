'use client';

import React from 'react';
import { DASH, formatPercentChange } from '@/modules/usage/utils/format';

export interface UsageChangeBadgeProps {
  value: number | null | undefined;
  suffix?: string;
}

/** Shared signed month-over-month indicator; null remains an honest dash. */
const UsageChangeBadge: React.FC<UsageChangeBadgeProps> = ({
  value,
  suffix = 'vs prev. month',
}) => {
  const text = formatPercentChange(value);
  const tone =
    text === DASH
      ? 'text-muted-foreground'
      : value !== null && value !== undefined && value >= 0
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-red-600 dark:text-red-400';

  return (
    <span className={`mt-1 block text-xs font-medium ${tone}`}>
      {text === DASH ? text : `${text} ${suffix}`}
    </span>
  );
};

export default UsageChangeBadge;
