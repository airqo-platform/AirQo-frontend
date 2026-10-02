'use client';

import React from 'react';
import { AqRefreshCw05 } from '@airqo/icons-react';
import {
  Button,
  Card,
  DatePicker,
  Select,
  type DateRange,
} from '@/shared/components/ui';
import type { ApiKeyUsageLeaderboardParams } from '@/shared/types/apiKeyUsage';

export interface ApiKeyUsageFiltersProps {
  range: DateRange;
  onRangeChange: (r: DateRange) => void;
  service?: string;
  onServiceChange?: (s: string) => void;
  services?: readonly string[];
  sort?: ApiKeyUsageLeaderboardParams['sort'];
  onSortChange?: (s: NonNullable<ApiKeyUsageLeaderboardParams['sort']>) => void;
  order?: 'asc' | 'desc';
  onOrderChange?: (o: 'asc' | 'desc') => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  extraActions?: React.ReactNode;
  /** Heading copy; the detail page reuses the bar with a narrower scope. */
  title?: string;
  description?: string;
}

type SortOption = NonNullable<ApiKeyUsageLeaderboardParams['sort']>;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'calls', label: 'Calls' },
  { value: 'active_days', label: 'Active days' },
  { value: 'peak_day_calls', label: 'Peak day' },
  { value: 'last_used', label: 'Last used' },
];

const ORDER_OPTIONS: { value: 'asc' | 'desc'; label: string }[] = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

/** Service filter choices when the parent doesn't supply its own list. */
const DEFAULT_SERVICES = ['analytics', 'devices'];

/**
 * Presentational filter bar for the API key usage views: date range, optional
 * service filter, sort/order controls, refresh, and a slot for caller-owned
 * actions (e.g. the CSV export button).
 *
 * Presentational — the page owns all filter state so the leaderboard, chart and
 * export can share one selection. Controls stack on small screens and sit in a
 * single row from `sm` up, and every control is labelled for screen readers.
 */
const ApiKeyUsageFilters: React.FC<ApiKeyUsageFiltersProps> = ({
  range,
  onRangeChange,
  service,
  onServiceChange,
  services,
  sort,
  onSortChange,
  order,
  onOrderChange,
  onRefresh,
  isRefreshing,
  extraActions,
  title = 'Filters',
  description = 'Date range and service apply to the chart, the table and the CSV export.',
}) => (
  <Card className="p-4">
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="api-key-usage-range"
          className="text-sm font-medium text-foreground"
        >
          Date range
        </label>
        <DatePicker
          id="api-key-usage-range"
          value={range}
          onChange={value => onRangeChange(value as DateRange)}
          mode="range"
          returnFormat="date"
          placeholder="Select date range"
          className="w-[240px]"
        />
        <p className="text-xs text-muted-foreground">
          Days are counted in UTC.
        </p>
      </div>

      {onServiceChange && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="api-key-usage-service"
            className="text-sm font-medium text-foreground"
          >
            Service
          </label>
          <Select
            id="api-key-usage-service"
            value={service ?? ''}
            onChange={event =>
              onServiceChange(String(event.target.value ?? ''))
            }
            containerClassName="!mb-0 w-40"
          >
            <option value="">All services</option>
            {(services ?? DEFAULT_SERVICES).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
      )}

      {onSortChange && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="api-key-usage-sort"
            className="text-sm font-medium text-foreground"
          >
            Sort by
          </label>
          <Select
            id="api-key-usage-sort"
            value={sort ?? 'calls'}
            onChange={event => onSortChange(event.target.value as SortOption)}
            containerClassName="!mb-0 w-40"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {onOrderChange && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="api-key-usage-order"
            className="text-sm font-medium text-foreground"
          >
            Order
          </label>
          <Select
            id="api-key-usage-order"
            value={order ?? 'desc'}
            onChange={event =>
              onOrderChange(event.target.value === 'asc' ? 'asc' : 'desc')
            }
            containerClassName="!mb-0 w-40"
          >
            {ORDER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Button
          variant="outlined"
          Icon={AqRefreshCw05}
          loading={isRefreshing}
          onClick={onRefresh}
        >
          Refresh
        </Button>
        {extraActions}
      </div>
    </div>
  </Card>
);

export default ApiKeyUsageFilters;
