'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import {
  AqLayoutGrid01,
  AqList,
  AqMaximize01,
  AqEdit02,
  AqTrash01,
} from '@airqo/icons-react';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import { FREQUENCY_LABELS } from '@/shared/components/charts/constants';
import { getPollutantLabel } from '@/shared/utils/airQuality';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { useAnalyticsChartData } from '../../hooks';
import {
  formatChartRangeLabel,
  type ExplorerChartDraft,
} from '../../utils/chartConfig';
import {
  buildDataKeyBySiteId,
  buildSiteLabels,
  buildSeriesLabels,
} from '../../utils/chartLabels';

interface ChartsOverviewViewProps {
  charts: ExplorerChartDraft[];
  siteNames: Map<string, string>;
  /** Focus a chart: make it active and switch to the focused workspace */
  onFocusChart: (draft: ExplorerChartDraft) => void;
  onEdit: (draft: ExplorerChartDraft) => void;
  onRequestDelete: (draft: ExplorerChartDraft) => void;
  onConfirmDelete: (draft: ExplorerChartDraft) => void;
  onCancelDelete: () => void;
  deleteConfirmingId: string | null;
  className?: string;
}

type OverviewLayout = 'list' | 'grid';

const LAYOUT_OPTIONS: {
  value: OverviewLayout;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'list',
    label: 'List',
    icon: <AqList className="h-3.5 w-3.5" />,
  },
  {
    value: 'grid',
    label: 'Grid',
    icon: <AqLayoutGrid01 className="h-3.5 w-3.5" />,
  },
];

/**
 * One chart in the overview: the SAME shared ChartContainer used by the
 * favorites dashboard, so every chart in the app looks and behaves the same
 * (header, More menu, loading/error states, interactive tooltip + legend).
 * Data is fetched with the same hook + query keys as the focused workspace,
 * so results are shared and cached.
 */
const OverviewChartCard: React.FC<{
  draft: ExplorerChartDraft;
  siteNames: Map<string, string>;
  onFocus: () => void;
  onEdit: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  deleteConfirming: boolean;
}> = ({
  draft,
  siteNames,
  onFocus,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  deleteConfirming,
}) => {
  const { config: aqiConfig } = useAqiConfig(draft.pollutant);

  const filters = useMemo(
    () => ({
      frequency: draft.frequency,
      pollutant: draft.pollutant,
      startDate: draft.startDate,
      endDate: draft.endDate,
    }),
    [draft]
  );

  // One request per chart while this view is mounted (React Query caches it,
  // so revisiting the overview never re-fires). Same hook + keys as the
  // focused workspace, so data is shared.
  const { chartData, isLoading, error, refresh } = useAnalyticsChartData(
    filters,
    draft.chartType === 'Bar' ? 'bar' : 'line',
    draft.siteIds,
    draft.siteIds.length > 0
  );

  const dataKeyBySiteId = useMemo(
    () => buildDataKeyBySiteId(chartData),
    [chartData]
  );
  const siteLabels = useMemo(
    () => buildSiteLabels(chartData, siteNames),
    [chartData, siteNames]
  );
  const seriesLabels = useMemo(
    () => buildSeriesLabels(chartData, siteLabels),
    [chartData, siteLabels]
  );
  const locationColors = useMemo(
    () => Object.fromEntries(draft.locationColors.map(c => [c.id, c.color])),
    [draft.locationColors]
  );

  const seriesColors = useMemo(() => {
    const colors: Record<string, string> = {};
    draft.siteIds.forEach(siteId => {
      const seriesKey = dataKeyBySiteId.get(siteId) ?? siteNames.get(siteId);
      if (!seriesKey) return;
      const color = locationColors[siteId] ?? draft.color ?? undefined;
      if (color) colors[seriesKey] = color;
    });
    return Object.keys(colors).length > 0 ? colors : undefined;
  }, [dataKeyBySiteId, draft.color, draft.siteIds, locationColors, siteNames]);

  const metadata = [
    getPollutantLabel(draft.pollutant),
    FREQUENCY_LABELS[draft.frequency] ?? draft.frequency,
    formatChartRangeLabel(draft.startDate, draft.endDate),
    `${draft.siteIds.length} location${draft.siteIds.length === 1 ? '' : 's'}`,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="w-full min-w-0 space-y-2">
      <ChartContainer
        title={draft.title}
        subtitle={metadata}
        loading={isLoading}
        error={error ?? null}
        onRefresh={refresh}
        exportOptions={{ enablePDF: false, enablePNG: false }}
        className="w-full"
        menuItems={
          <>
            <DropdownMenuItem onClick={onFocus}>
              <AqMaximize01 className="mr-2 h-4 w-4" />
              Open in workspace
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <AqEdit02 className="mr-2 h-4 w-4" />
              Edit chart
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onRequestDelete}
              className="text-destructive hover:bg-destructive/10"
            >
              <AqTrash01 className="mr-2 h-4 w-4" />
              Delete chart
            </DropdownMenuItem>
          </>
        }
      >
        {/* Skip the chart itself while its first load is in flight — the
            container's loading overlay covers the empty area instead of the
            "No data available" placeholder flashing underneath. */}
        {isLoading ? null : (
          <DynamicChart
            data={chartData}
            config={{
              type: draft.chartType.toLowerCase() as 'line' | 'area' | 'bar',
              showGrid: draft.showGrid,
              showTooltip: draft.showTooltip,
              showLegend: draft.showLegend,
              height: 380,
              ...(draft.color ? { color: draft.color } : {}),
              seriesColors,
            }}
            pollutant={draft.pollutant}
            aqiConfig={aqiConfig}
            frequency={draft.frequency}
            autoSelectType={false}
            seriesLabels={seriesLabels}
          />
        )}
      </ChartContainer>

      {deleteConfirming && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2"
          role="alert"
        >
          <span className="text-xs font-medium text-destructive">
            Delete this chart?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onConfirmDelete}
              className="rounded-md bg-destructive px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-destructive/90"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Keep chart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * All configured charts at once, as a list (default) or a grid (toggle below
 * the page tabs). Each card renders the chart's REAL data (same hooks + query
 * keys as the focused workspace, so results are shared and cached) inside the
 * shared ChartContainer, with the correct site/device labels and colors.
 * Clicking a card focuses it.
 */
export const ChartsOverviewView: React.FC<ChartsOverviewViewProps> = ({
  charts,
  siteNames,
  onFocusChart,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  deleteConfirmingId,
  className,
}) => {
  const [layout, setLayout] = useState<OverviewLayout>('list');

  const handleFocus = useCallback(
    (draft: ExplorerChartDraft) => onFocusChart(draft),
    [onFocusChart]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Layout toggle — wrapped in a card, sized to content */}
      <Card className="w-fit">
        <CardContent className="p-1">
          <SegmentedTabs
            ariaLabel="Charts overview layout"
            options={LAYOUT_OPTIONS}
            value={layout}
            onChange={setLayout}
          />
        </CardContent>
      </Card>

      {charts.length === 0 ? (
        <p className="rounded-md bg-muted/50 px-4 py-10 text-center text-sm text-muted-foreground">
          No charts yet — create one with “New chart”.
        </p>
      ) : (
        <div
          className={cn(
            layout === 'grid'
              ? 'grid grid-cols-1 items-start gap-4 md:grid-cols-2'
              : 'flex flex-col gap-4'
          )}
        >
          {charts.map(draft => (
            <OverviewChartCard
              key={draft.id}
              draft={draft}
              siteNames={siteNames}
              onFocus={() => handleFocus(draft)}
              onEdit={() => onEdit(draft)}
              onRequestDelete={() => onRequestDelete(draft)}
              onConfirmDelete={() => onConfirmDelete(draft)}
              onCancelDelete={onCancelDelete}
              deleteConfirming={deleteConfirmingId === draft.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartsOverviewView;
