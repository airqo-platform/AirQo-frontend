'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { useAnalyticsChartData } from '../../hooks';
import {
  buildChartMetadata,
  getGuidelinePeriod,
  type ExplorerChartDraft,
} from '../../utils/chartConfig';
import {
  buildDataKeyBySiteId,
  buildSiteLabels,
  buildSeriesLabels,
} from '../../utils/chartLabels';

/**
 * Generate a shade of the primary theme color for a given index.
 * Index 0 is the full primary, subsequent indices get progressively
 * lighter shades via color-mix with white.
 */
const getPrimaryShade = (index: number): string => {
  if (index === 0) return 'rgb(var(--primary))';
  const lightness = Math.min(15 + index * 12, 60);
  return `color-mix(in srgb, rgb(var(--primary)) ${100 - lightness}%, white)`;
};

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

const OVERVIEW_LAYOUT_STORAGE_KEY = 'nexus:analytics:overview-layout';

// The chosen layout survives reloads: read lazily (guarded for SSR) and
// persist on change so a refreshed page returns to the same layout.
const readStoredOverviewLayout = (): OverviewLayout => {
  if (typeof window === 'undefined') return 'list';
  try {
    const stored = window.localStorage.getItem(OVERVIEW_LAYOUT_STORAGE_KEY);
    return stored === 'list' || stored === 'grid' ? stored : 'list';
  } catch {
    return 'list';
  }
};

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

  // Use shades of the primary theme color for series — keeps the overview
  // visually cohesive while still distinguishing multiple sites.
  const seriesColors = useMemo(() => {
    const colors: Record<string, string> = {};
    draft.siteIds.forEach((siteId, index) => {
      const seriesKey = dataKeyBySiteId.get(siteId) ?? siteNames.get(siteId);
      if (seriesKey) {
        colors[seriesKey] =
          draft.locationColors.find(c => c.id === siteId)?.color ??
          getPrimaryShade(index);
      }
    });
    return Object.keys(colors).length > 0 ? colors : undefined;
  }, [draft.siteIds, draft.locationColors, dataKeyBySiteId, siteNames]);

  const metadata = useMemo(() => buildChartMetadata(draft), [draft]);

  return (
    <div className="w-full min-w-0 space-y-2">
      <ChartContainer
        title={draft.title}
        // Only the user-set subtitle lives in the header — the auto-generated
        // metadata line renders in the footer instead, matching the focused
        // workspace (and keeping the inline editor from baking it in).
        subtitle={draft.subtitle}
        loading={isLoading}
        error={error ?? null}
        onRefresh={refresh}
        exportOptions={{ enablePDF: false, enablePNG: false }}
        className="w-full"
        footerHint={
          <span className="block truncate text-xs text-muted-foreground">
            {metadata}
          </span>
        }
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
              // Single-series charts render under recharts' generic 'value'
              // key — pin the resolved site color so a picked color renders.
              ...(draft.siteIds.length === 1
                ? {
                    color:
                      draft.locationColors.find(
                        c => c.id === draft.siteIds[0]
                      )?.color ?? getPrimaryShade(0),
                  }
                : {}),
              seriesColors,
            }}
            pollutant={draft.pollutant}
            aqiConfig={aqiConfig}
            frequency={draft.frequency}
            autoSelectType={false}
            // Same guideline period as the focused workspace — the reference
            // line must never disagree with the chart's frequency.
            referenceLinePeriod={getGuidelinePeriod(draft.frequency)}
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
  const [layout, setLayout] = useState<OverviewLayout>(
    readStoredOverviewLayout
  );

  // Persist the layout so a refresh returns to the same view.
  useEffect(() => {
    try {
      window.localStorage.setItem(OVERVIEW_LAYOUT_STORAGE_KEY, layout);
    } catch {
      // Storage unavailable — layout memory is best-effort.
    }
  }, [layout]);

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
