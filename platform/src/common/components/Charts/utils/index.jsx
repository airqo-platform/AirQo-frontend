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
  numTicks,
}) => {
  /**
   * Formats the date based on the frequency.
   * @param {string} value - The raw ISO date string.
   * @returns {string} - Formatted date string.
   */
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

  /**
   * Controls the visibility of the X-axis ticks to avoid overcrowding.
   * If there are too many ticks, we hide some based on the index.
   */
  const shouldDisplayTick = () => {
    if (frequency === 'weekly') {
      return index % 2 === 0; // Show every second tick for weekly frequency
    }
    if (frequency === 'daily') {
      return index % Math.floor(numTicks / 5) === 0; // Show fewer ticks for daily frequency
    }
    return true; // Show all ticks for other frequencies
  };

  // If the tick should not be displayed, return null.
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
