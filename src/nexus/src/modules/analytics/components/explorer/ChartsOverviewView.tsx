'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import {
  AqEdit02,
  AqTrash01,
} from '@airqo/icons-react';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { useAnalyticsChartData } from '../../hooks';
import {
  buildChartMetadata,
  getGuidelinePeriod,
  readChartSidecar,
  type ExplorerChartDraft,
} from '../../utils/chartConfig';
import {
  buildDataKeyBySiteId,
  buildSiteLabels,
  buildSeriesLabels,
} from '../../utils/chartLabels';
import { getDefaultSiteColor } from '../../utils/siteColors';

interface ChartsOverviewViewProps {
  charts: ExplorerChartDraft[];
  siteNames: Map<string, string>;
  /** Organization group id (empty in the user flow) — used for the sidecar */
  groupId: string;
  onEdit: (draft: ExplorerChartDraft) => void;
  onRequestDelete: (draft: ExplorerChartDraft) => void;
  onConfirmDelete: (draft: ExplorerChartDraft) => void;
  onCancelDelete: () => void;
  deleteConfirmingId: string | null;
  className?: string;
}

/**
 * One chart in the grid view: the SAME shared ChartContainer used by the
 * favorites dashboard, so every chart in the app looks and behaves the same
 * (header, More menu, loading/error states, interactive tooltip + legend).
 * Data is fetched with the same hook + query keys as the list view, so
 * results are shared and cached.
 */
const OverviewChartCard: React.FC<{
  draft: ExplorerChartDraft;
  siteNames: Map<string, string>;
  groupId: string;
  onEdit: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  deleteConfirming: boolean;
}> = ({
  draft,
  siteNames,
  groupId,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  deleteConfirming,
}) => {
  const { config: aqiConfig } = useAqiConfig(draft.pollutant);

  // Theme-shade coloring preference — same sidecar + toggle as the list
  // view so both surfaces can never disagree. The mode feeds the series
  // resolution from LIVE state so the More-menu toggle repaints instantly.
  const [themeColors, setThemeColors] = useState<boolean>(
    () => readChartSidecar(groupId, draft.id).themeColors ?? false
  );

  useEffect(() => {
    setThemeColors(draft.themeColors ?? false);
  }, [draft.themeColors]);

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
  // list view, so data is shared.
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

  // Series colors resolve EXACTLY like the list view: explicit picks win,
  // unset sites get a distinct default for their position — theme shades
  // when the chart's toggle is on, palette hues otherwise. One shared
  // resolution pattern so the two surfaces never disagree.
  const seriesColors = useMemo(() => {
    const colors: Record<string, string> = {};
    draft.siteIds.forEach((siteId, index) => {
      const seriesKey = dataKeyBySiteId.get(siteId) ?? siteNames.get(siteId);
      if (seriesKey) {
        colors[seriesKey] =
          draft.locationColors.find(entry => entry.id === siteId)?.color ??
          getDefaultSiteColor(index, themeColors);
      }
    });
    return Object.keys(colors).length > 0 ? colors : undefined;
  }, [draft.siteIds, draft.locationColors, themeColors, dataKeyBySiteId, siteNames]);

  const metadata = useMemo(() => buildChartMetadata(draft), [draft]);

  // Same slugged export filename as the list view, so grid downloads are
  // consistent with list downloads for the same chart.
  const exportFilename = useMemo(
    () =>
      `air-quality-${
        draft.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'chart'
      }`,
    [draft.title]
  );

  return (
    <div className="w-full min-w-0 space-y-2">
      <ChartContainer
        title={draft.title}
        // Only the user-set subtitle lives in the header — the auto-generated
        // metadata line renders in the footer instead, matching the list view
        // (and keeping the inline editor from baking it in).
        subtitle={draft.subtitle}
        loading={isLoading}
        error={error ?? null}
        onRefresh={refresh}
        exportOptions={{
          enablePDF: true,
          enablePNG: true,
          filename: exportFilename,
        }}
        themeColors={themeColors}
        className="w-full"
        footerHint={
          <span className="block truncate text-xs text-muted-foreground">
            {metadata}
          </span>
        }
        menuItems={
          <>
            <DropdownMenuItem onClick={onEdit}>
              <AqEdit02 className="mr-2 h-4 w-4" />
              Edit chart
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
              themeColors,
              // Single-series charts render under recharts' generic 'value'
              // key — pin the resolved site color so a picked color renders.
              ...(draft.siteIds.length === 1
                ? {
                    color:
                      draft.locationColors.find(
                        c => c.id === draft.siteIds[0]
                      )?.color ?? getDefaultSiteColor(0, themeColors),
                  }
                : {}),
              seriesColors,
            }}
            pollutant={draft.pollutant}
            aqiConfig={aqiConfig}
            frequency={draft.frequency}
            autoSelectType={false}
            // Same guideline period as the list view — the reference line
            // must never disagree with the chart's frequency.
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
 * All configured charts at once as a 2-column grid — the "Grid" layout of the
 * Trends view. Each card renders the chart's REAL data (same hooks + query
 * keys as the list view, so results are shared and cached) inside the shared
 * ChartContainer, with the correct site/device labels and colors. The "List"
 * layout is rendered by the page itself (each chart as a full AnalyticsChartCard).
 */
export const ChartsOverviewView: React.FC<ChartsOverviewViewProps> = ({
  charts,
  siteNames,
  groupId,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  deleteConfirmingId,
  className,
}) => {
  if (charts.length === 0) {
    return (
      <p className="rounded-md bg-muted/50 px-4 py-10 text-center text-sm text-muted-foreground">
        No charts yet — create one with “New chart”.
      </p>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 items-start gap-4 sm:grid-cols-2',
        className
      )}
    >
      {charts.map(draft => (
        <OverviewChartCard
          key={draft.id}
          draft={draft}
          siteNames={siteNames}
          groupId={groupId}
          onEdit={() => onEdit(draft)}
          onRequestDelete={() => onRequestDelete(draft)}
          onConfirmDelete={() => onConfirmDelete(draft)}
          onCancelDelete={onCancelDelete}
          deleteConfirming={deleteConfirmingId === draft.id}
        />
      ))}
    </div>
  );
};

export default ChartsOverviewView;
