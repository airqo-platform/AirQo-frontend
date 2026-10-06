'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { DynamicChart } from '@/shared/components/charts';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import { DatePicker } from '@/shared/components/calendar';
import type { DatePickerProps } from '@/shared/components/calendar';
import { DATE_FORMATS, formatWithPattern } from '@/shared/utils';
import {
  formatNumber,
  resolveDateSelection,
} from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import type { UsageTimelineResponse } from '@/shared/types/usage';

/** Payload type emitted by the shared DatePicker's onChange callback. */
type DatePickerValue = Parameters<NonNullable<DatePickerProps['onChange']>>[0];

/** Extracts the picked Date from any DatePicker onChange payload shape. */
const pickedDate = (value: DatePickerValue): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const range = value as { from?: Date | string };
  const rawFrom = range.from;
  if (!rawFrom) return null;
  const from = rawFrom instanceof Date ? rawFrom : new Date(rawFrom);
  return Number.isNaN(from.getTime()) ? null : from;
};

const dateStringToDate = (date: string): Date | undefined => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export interface UserUsageTimelineProps {
  data: UsageTimelineResponse | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  date: string;
  onDateChange: (date: string) => void;
}

/** Series keys for the hourly timeline chart (each becomes one bar series). */
const SERIES_PAGE_VIEWS = 'pageViews';
const SERIES_API_CALLS = 'apiCalls';

const SERIES_LABELS: Record<string, string> = {
  [SERIES_PAGE_VIEWS]: 'Page views',
  [SERIES_API_CALLS]: 'API calls',
};

/** Zero-padded "HH:00" bucket label — sorts lexicographically like a time. */
const hourLabel = (hour: number): string =>
  `${String(hour).padStart(2, '0')}:00`;

const TopList: React.FC<{
  title: string;
  basis?: string;
  entries: { key: string; count: number }[];
}> = ({ title, basis, entries }) => (
  <div className="space-y-2">
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {basis ? (
        <p className="text-xs text-muted-foreground">Basis: {basis}</p>
      ) : null}
    </div>
    {entries.length === 0 ? (
      <p className="text-sm text-muted-foreground">None recorded.</p>
    ) : (
      <ul className="space-y-1 max-h-64 overflow-y-auto overscroll-contain pr-2">
        {entries.map(entry => (
          <li
            key={entry.key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="truncate font-medium break-all">{entry.key}</span>
            <span className="tabular-nums text-muted-foreground">
              {formatNumber(entry.count)}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * 24-hour timeline for a single day. The date input rejects future dates
 * client-side (the backend reports hourly data in UTC; the chart header notes
 * the viewer's tz from the response). Top pages/endpoints carry the
 * `top_lists_basis` note where the response provides it.
 */
const UserUsageTimeline: React.FC<UserUsageTimelineProps> = ({
  data,
  isLoading,
  error,
  onRetry,
  date,
  onDateChange,
}) => {
  const handleDateChange = (value: DatePickerValue) => {
    const picked = pickedDate(value);
    if (!picked) return;
    // Clamp future dates client-side — the latest available day is today UTC.
    onDateChange(resolveDateSelection(picked));
  };

  if (isLoading && !data) {
    return (
      <Card className="p-4">
        <LoadingState text="Loading timeline..." className="min-h-[200px]" />
      </Card>
    );
  }

  if (error && !data) {
    return (
      <UsageSectionError
        title="Failed to load timeline"
        message={error.message || 'An unexpected error occurred.'}
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <Card className="p-4">
        <EmptyState
          title="No timeline data"
          description="No activity recorded for this day yet."
          compact
        />
      </Card>
    );
  }

  // One NormalizedChartData point per (hour, series): the shared DynamicChart
  // groups by the `site` field and pivots each site into its own bar series.
  const chartData: NormalizedChartData[] = data.hours.flatMap(hour => [
    {
      time: hourLabel(hour.hour),
      value: hour.page_views,
      site: SERIES_PAGE_VIEWS,
      device_id: '',
    },
    {
      time: hourLabel(hour.hour),
      value: hour.api_calls,
      site: SERIES_API_CALLS,
      device_id: '',
    },
  ]);

  const hasActivity = data.page_views > 0 || data.api_calls > 0;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Daily Timeline
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Hourly activity for{' '}
            {formatWithPattern(data.date, DATE_FORMATS.READABLE_DATE_LONG)}
            {data.tz ? ` · ${data.tz}` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <label htmlFor="user-usage-date" className="font-medium">
            Date
          </label>
          <DatePicker
            key={date}
            value={dateStringToDate(date)}
            onChange={handleDateChange}
            placeholder="Select date"
            mode="single"
            id="user-usage-date"
            className="w-[180px]"
          />
        </div>
      </div>

      {!hasActivity ? (
        <EmptyState
          title="No activity this day"
          description="Pick a day with activity to see the hourly breakdown."
          compact
        />
      ) : (
        <>
          <DynamicChart
            data={chartData}
            config={{
              type: 'bar',
              showGrid: true,
              showTooltip: true,
              showLegend: true,
              height: 256,
              // The x values are "HH:00" bucket labels, not ISO timestamps —
              // pass them through untouched on the axis and in the tooltip.
              xAxisTickFormatter: value => value,
              tooltipDateFormatter: label => String(label),
            }}
            seriesLabels={SERIES_LABELS}
            autoSelectType={false}
            yAxisLabel="Count"
            tooltipValueSuffix=""
            tooltipValuePrecision={0}
            showAirQualityLevel={false}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TopList
              title="Top pages"
              basis={data.top_lists_basis}
              entries={data.top_pages}
            />
            <TopList
              title="Top API endpoints"
              basis={data.top_lists_basis}
              entries={data.top_endpoints}
            />
          </div>
        </>
      )}
    </Card>
  );
};

export default UserUsageTimeline;
