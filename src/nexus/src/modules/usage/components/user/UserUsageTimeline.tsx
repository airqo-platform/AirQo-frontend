'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui';
import { EmptyState } from '@/shared/components/ui';
import { formatNumber } from '@/modules/usage/utils/format';
import { currentUtcDate } from '@/modules/usage/utils/format';
import UsageSectionError from '@/modules/usage/components/platform/UsageSectionError';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getPrimaryColor } from '@/shared/components/charts/constants';
import type { UsageTimelineResponse } from '@/shared/types/usage';

export interface UserUsageTimelineProps {
  data: UsageTimelineResponse | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  date: string;
  onDateChange: (date: string) => void;
}

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
      <ul className="space-y-1">
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
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (!next) return;
    // Reject future dates client-side — the latest available day is today UTC.
    const max = currentUtcDate();
    onDateChange(next > max ? max : next);
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

  const chartData = data.hours.map(hour => ({
    hour: hour.hour,
    pageViews: hour.page_views,
    apiCalls: hour.api_calls,
  }));

  const hasActivity = data.page_views > 0 || data.api_calls > 0;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Daily Timeline
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Hourly activity for {data.date}
            {data.tz ? ` · ${data.tz}` : ''}
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="font-medium">Date</span>
          <input
            type="date"
            value={date}
            max={currentUtcDate()}
            onChange={handleDateChange}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </label>
      </div>

      {!hasActivity ? (
        <EmptyState
          title="No activity this day"
          description="Pick a day with activity to see the hourly breakdown."
          compact
        />
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(226,232,240)"
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12, fill: 'rgb(100,116,139)' }}
                  tickLine={{ stroke: 'rgb(226,232,240)' }}
                  axisLine={{ stroke: 'rgb(226,232,240)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: 'rgb(100,116,139)' }}
                  tickLine={{ stroke: 'rgb(226,232,240)' }}
                  axisLine={{ stroke: 'rgb(226,232,240)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="pageViews"
                  name="Page views"
                  fill={getPrimaryColor(0)}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="apiCalls"
                  name="API calls"
                  fill={getPrimaryColor(1)}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

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
