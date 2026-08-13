'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { cn } from '@/shared/lib/utils';
import { useUser } from '@/shared/hooks/useUser';
import { buildChartDataQueryKey } from '../../hooks';
import { getPollutantLabel } from '@/shared/utils/airQuality';
import { FREQUENCY_LABELS } from '@/shared/components/charts/constants';
import { resolveSiteColor } from '../../utils/siteColors';
import type { ExplorerChartDraft } from '../../utils/chartConfig';
import type { ChartData } from '../../types';
import { Card, CardContent } from '@/shared/components/ui/card';

interface SavedChartsCardProps {
  charts: ExplorerChartDraft[];
  /** The chart currently shown in the main workspace (excluded from the list) */
  activeChartId: string | null;
  onSelect: (draft: ExplorerChartDraft) => void;
  className?: string;
}

const VISIBLE_LIMIT = 4;

/** Height cap for the expanded list so long sets scroll inside the card. */
const EXPANDED_LIST_MAX_HEIGHT_CLASS = 'max-h-[360px] overflow-y-auto';

interface SparklinePoint {
  time: string;
  value: number;
}

/** Averages a chart's cached readings across sites per time bucket. */
const toSparklinePoints = (data: ChartData[] | undefined): SparklinePoint[] => {
  if (!data || data.length === 0) return [];
  const byTime = new Map<string, number[]>();
  data.forEach(point => {
    const time = String(point.time);
    if (typeof point.value !== 'number' || !Number.isFinite(point.value)) {
      return;
    }
    const bucket = byTime.get(time) ?? [];
    bucket.push(point.value);
    byTime.set(time, bucket);
  });
  return Array.from(byTime.entries())
    .map(([time, values]) => ({
      time,
      value: values.reduce((sum, v) => sum + v, 0) / values.length,
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-30);
};

const Sparkline: React.FC<{ draft: ExplorerChartDraft }> = ({ draft }) => {
  const queryClient = useQueryClient();
  const { user, activeGroup } = useUser();

  // Read-only peek at the React Query cache: only charts that were recently
  // viewed have data, so no extra requests are fired for the sidebar.
  const cached = useMemo(() => {
    if (draft.siteIds.length === 0) return undefined;
    return queryClient.getQueryData<ChartData[]>(
      buildChartDataQueryKey(
        user?.id,
        activeGroup?.id,
        draft.chartType === 'Bar' ? 'bar' : 'line',
        draft.siteIds,
        {
          frequency: draft.frequency,
          startDate: draft.startDate,
          endDate: draft.endDate,
          pollutant: draft.pollutant,
        }
      )
    );
  }, [
    draft.chartType,
    draft.endDate,
    draft.frequency,
    draft.pollutant,
    draft.siteIds,
    draft.startDate,
    queryClient,
    user?.id,
    activeGroup?.id,
  ]);

  const points = useMemo(() => toSparklinePoints(cached), [cached]);

  if (points.length === 0) {
    // No cached readings yet — a neutral placeholder, not fabricated data.
    return (
      <div
        aria-hidden="true"
        className="h-8 w-16 shrink-0 rounded bg-gradient-to-b from-muted/70 to-muted/30"
      />
    );
  }

  // The sparkline reflects the FIRST selected site's resolved color (not the
  // first color-pick entry, whose insertion order can differ from the site
  // order the chart renders in).
  const color = resolveSiteColor(draft, draft.siteIds[0] ?? '', 0);
  const isBar = draft.chartType === 'Bar';

  return (
    <div aria-hidden="true" className="h-8 w-16 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        {isBar ? (
          <BarChart
            data={points}
            margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
          >
            <Bar
              dataKey="value"
              fill={color}
              radius={[1, 1, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <LineChart
            data={points}
            margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
          >
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Compact list of the user's other saved charts. Clicking a row makes it the
 * active chart (no duplicate is created). Shows a preview of the most recent
 * charts with a "View all" toggle when more are configured; the header always
 * shows the total count. Sparklines read the React Query cache, so they
 * appear once a chart's data has been loaded at least once.
 */
export const SavedChartsCard: React.FC<SavedChartsCardProps> = ({
  charts,
  activeChartId,
  onSelect,
  className,
}) => {
  const [showAll, setShowAll] = useState(false);

  // Reset to the compact preview whenever the workspace switches to another
  // chart so the sidebar state stays predictable.
  useEffect(() => {
    setShowAll(false);
  }, [activeChartId]);

  const saved = useMemo(
    () =>
      charts
        .filter(chart => chart.id !== activeChartId)
        .sort((a, b) => (b.fieldId || 0) - (a.fieldId || 0)),
    [charts, activeChartId]
  );

  const hiddenCount = Math.max(0, saved.length - VISIBLE_LIMIT);
  const visible =
    showAll || hiddenCount === 0 ? saved : saved.slice(0, VISIBLE_LIMIT);
  const listId = 'saved-charts-list';

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Your saved charts
          </h3>
          <span className="flex items-center gap-2">
            {saved.length > 0 && (
              <span
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground"
                title={`${saved.length} saved chart${saved.length === 1 ? '' : 's'}`}
              >
                {saved.length}
              </span>
            )}
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(prev => !prev)}
                aria-expanded={showAll}
                aria-controls={listId}
                className="text-xs font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                {showAll
                  ? 'Show less'
                  : `View all (${saved.length - hiddenCount} more)`}
              </button>
            )}
          </span>
        </div>

        {saved.length === 0 ? (
          <p className="rounded-md bg-muted/50 px-3 py-4 text-center text-xs text-muted-foreground">
            No other saved charts — create one with “New chart”.
          </p>
        ) : (
          <ul
            id={listId}
            className={cn(
              'grid grid-cols-1 divide-y divide-border/60',
              showAll && EXPANDED_LIST_MAX_HEIGHT_CLASS
            )}
          >
            {visible.map(draft => (
              <li key={draft.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => onSelect(draft)}
                  className="group flex w-full items-center justify-between gap-3 rounded-sm px-2 py-2 text-left transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {draft.title}
                    </span>
                    {draft.subtitle && (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground/80">
                        {draft.subtitle}
                      </span>
                    )}
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {getPollutantLabel(draft.pollutant)} •{' '}
                      {FREQUENCY_LABELS[draft.frequency] ?? draft.frequency} •{' '}
                      {draft.siteIds.length} location
                      {draft.siteIds.length === 1 ? '' : 's'}
                    </span>
                  </span>
                  <span className="shrink-0">
                    <Sparkline draft={draft} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedChartsCard;
