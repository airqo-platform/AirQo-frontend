import React from 'react';
import { format, startOfWeek, startOfMonth } from 'date-fns';
import { parseAndValidateISODate } from '@/core/utils/dateUtils';

/**
 * Formats Y-axis ticks for air quality data.
 * Handles values with appropriate units for clarity and precision.
 * @param {number} tick - The tick value.
 * @returns {string|number} - Formatted tick.
 */
export const formatYAxisTick = (tick) => {
  if (tick >= 1_000 && tick < 1_000_000) {
    return `${(tick / 1_000).toFixed(1)}K`;
  }

  if (tick >= 1_000_000) {
    return `${(tick / 1_000_000).toFixed(1)}M`;
  }

  if (tick < 1 && tick > -1 && tick !== 0) {
    return tick.toFixed(2);
  }

  return tick;
};

/**
 * CustomizedAxisTick Component
 * Formats the X-axis ticks based on the frequency passed as a prop.
 */
export const CustomizedAxisTick = ({
  x,
  y,
  payload,
  fill,
  frequency,
  index,
  step,
}) => {
  const formatDate = (value) => {
    const date = parseAndValidateISODate(value);
    if (!date) {
      return 'Invalid Date';
    }

    switch (frequency) {
      case 'hourly':
        return format(date, 'HH:mm');
      case 'daily':
        return format(date, 'MMM dd');
      case 'weekly':
        return `Week of ${format(startOfWeek(date), 'MMM dd')}`;
      case 'monthly':
        return format(startOfMonth(date), 'MMM yyyy');
      default:
        return format(date, 'MMM dd');
    }
  };

  const shouldDisplayTick = () => {
    return step > 1 ? index % step === 0 : true;
  };

  if (!shouldDisplayTick()) {
    return null;
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={fill || '#485972'}
        fontSize={12}
      >
        {formatDate(payload.value)}
      </text>
    </g>
  );
};
