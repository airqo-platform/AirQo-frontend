'use client';

import React from 'react';
import { LegendData } from '../../types';
import { cn } from '@/shared/lib/utils';
import type { LegendPayload } from 'recharts';
// Tooltip removed: using native title attribute wrapper to ensure clicks reach legend buttons

interface CustomLegendProps extends LegendData {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';
}

export const CustomLegend: React.FC<CustomLegendProps> = ({
  payload,
  className,
  orientation = 'horizontal',
  align = 'center',
}) => {
  if (!payload || payload.length === 0) {
    return null;
  }

  const containerClasses = cn(
    'flex gap-2 py-1',
    {
      'flex-row flex-wrap': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
      'justify-start': align === 'left',
      'justify-center': align === 'center',
      'justify-end': align === 'right',
    },
    className
  );

  return (
    <div className={containerClasses}>
      {payload.map((entry, index) => {
        const rawValue = entry.value;
        const value = String(rawValue || '')
          .replace(/_/g, ' ')
          .trim();
        const color = entry.color;

        // Truncate long names
        const maxLength = 18;
        const truncatedValue =
          value.length > maxLength
            ? `${value.substring(0, maxLength)}...`
            : value;
        const needsTooltip = value.length > maxLength;

        const legendItem = (
          <div
            key={index}
            className="flex items-center space-x-2 text-sm max-w-[150px]"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span
              className="text-foreground font-normal truncate"
              title={needsTooltip ? value : undefined}
            >
              {truncatedValue}
            </span>
          </div>
        );

        // Use native title attribute wrapper instead of Flowbite Tooltip for
        // interactive legend items. The Tooltip wrapper can sometimes capture
        // pointer events and prevent the inner button from receiving clicks
        // (observed as top-row legend items not clickable). A simple title
        // preserves hover tooltip while ensuring clicks propagate.
        return needsTooltip ? (
          <div title={value} className="inline-block pointer-events-auto">
            {legendItem}
          </div>
        ) : (
          legendItem
        );
      })}
    </div>
  );
};

// Compact legend for small spaces
interface CompactLegendProps {
  items: Array<{
    name: string;
    color: string;
    value?: number;
  }>;
  className?: string;
}

export const CompactLegend: React.FC<CompactLegendProps> = ({
  items,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-1 py-1', className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center space-x-1 text-xs bg-muted/50 rounded-full px-2 py-0.5"
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-foreground font-normal">{item.name}</span>
          {item.value !== undefined && (
            <span className="text-muted-foreground">
              ({item.value.toFixed(1)})
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// Interactive legend with toggle functionality
interface InteractiveLegendProps {
  payload?: readonly LegendPayload[];
  className?: string;
  onToggle?: (dataKey: string, visible: boolean) => void;
  hiddenSeries?: Set<string>;
}

export const InteractiveLegend: React.FC<InteractiveLegendProps> = ({
  payload,
  className,
  onToggle,
  hiddenSeries = new Set(),
}) => {
  if (!payload || payload.length === 0) {
    return null;
  }

  const handleToggle = (dataKey: string) => {
    if (onToggle) {
      const isCurrentlyHidden = hiddenSeries.has(dataKey);
      onToggle(dataKey, isCurrentlyHidden);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2 py-1', className)}>
      {payload
        .filter((entry: LegendPayload) => {
          const dataKey = String(entry.dataKey ?? entry.value ?? `series-0`);
          return dataKey;
        })
        .map((entry: LegendPayload, index: number) => {
          const dataKey = String(
            entry.dataKey ?? entry.value ?? `series-${index}`
          );
          const rawValue =
            entry.value || entry.dataKey || `Series ${index + 1}`;
          const value = String(rawValue).replace(/_/g, ' ').trim();
          const color = entry.color || '#8884d8';

          // Truncate long names
          const maxLength = 20;
          const truncatedValue =
            value.length > maxLength
              ? `${value.substring(0, maxLength)}...`
              : value;
          const needsTooltip = value.length > maxLength;

          const isHidden = hiddenSeries.has(dataKey);

          const legendItem = (
            <button
              key={`legend-item-${dataKey}-${index}`}
              onClick={() => handleToggle(dataKey)}
              className={cn(
                'flex items-center space-x-2 text-sm transition-opacity hover:opacity-80 max-w-[200px]',
                isHidden && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0 transition-all',
                  isHidden &&
                    'opacity-50 border-2 border-current bg-transparent'
                )}
                style={{
                  backgroundColor: isHidden ? 'transparent' : color,
                  borderColor: color,
                }}
              />
              <span
                className={cn(
                  'text-foreground font-normal truncate transition-all',
                  isHidden && 'line-through opacity-75'
                )}
                title={needsTooltip ? value : undefined}
              >
                {truncatedValue}
              </span>
            </button>
          );

          return needsTooltip ? (
            <div
              key={`legend-wrapper-${dataKey}-${index}`}
              title={value}
              className="inline-block pointer-events-auto"
            >
              {legendItem}
            </div>
          ) : (
            legendItem
          );
        })}
    </div>
  );
};
