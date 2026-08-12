'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { ChartContainer } from '@/shared/components/charts';
import { DynamicChart } from '@/shared/components/charts';
import { AqEdit02, AqTrash01, AqChevronDown } from '@airqo/icons-react';
import { WeeklyForecastCard } from '@/modules/airqo-map/components/sidebar/WeeklyForecastCard';
import { useAnalyticsChartData } from '../../hooks';
import {
  formatChartRangeLabel,
  type ExplorerChartDraft,
} from '../../utils/chartConfig';
import type { AqiConfig } from '@/shared/types/aqi';

interface AnalyticsChartTileProps {
  draft: ExplorerChartDraft;
  aqiConfig?: AqiConfig | null;
  enabled?: boolean;
  onEdit: (draft: ExplorerChartDraft) => void;
  /** Arms the inline delete confirmation on the tile */
  onRequestDelete: (draft: ExplorerChartDraft) => void;
  /** Executes the delete after the user confirms on the tile */
  onConfirmDelete: (draft: ExplorerChartDraft) => void;
  onCancelDelete: () => void;
  onEditTitle: (
    draftId: string,
    title: string,
    subtitle?: string
  ) => Promise<void>;
  deleteConfirming?: boolean;
  className?: string;
}

/**
 * Chart tile with collapsible forecast per configuration — one expanded
 * section at a time (accordion pattern).
 */
export const AnalyticsChartTile: React.FC<AnalyticsChartTileProps> = ({
  draft,
  aqiConfig,
  enabled = true,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onEditTitle,
  deleteConfirming = false,
  className,
}) => {
  const [forecastOpen, setForecastOpen] = useState(false);

  const filters = useMemo(
    () => ({
      frequency: draft.frequency,
      pollutant: draft.pollutant,
      startDate: draft.startDate,
      endDate: draft.endDate,
    }),
    [draft]
  );

  const {
    chartData,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useAnalyticsChartData(
    filters,
    draft.chartType === 'Bar' ? 'bar' : 'line',
    draft.siteIds,
    enabled && draft.siteIds.length > 0
  );

  const handleRefresh = useCallback(async () => {
    await refresh?.();
  }, [refresh]);

  // ASCII-safe subtitle: some fonts render subscript/unicode glyphs as boxes,
  // so use plain "PM2.5"/"PM10" and simple separators.
  const plainPollutant = draft.pollutant === 'pm10' ? 'PM10' : 'PM2.5';

  const subtitleParts = [
    plainPollutant,
    draft.frequency,
    formatChartRangeLabel(draft.startDate, draft.endDate),
    draft.siteIds.length > 0 &&
      `${draft.siteIds.length} location${draft.siteIds.length === 1 ? '' : 's'}`,
  ].filter(Boolean);

  const subtitle = draft.subtitle || subtitleParts.join(' | ');
  const firstSiteId = draft.siteIds[0] ?? '';

  return (
    <div className={cn('rounded-md border border-border overflow-hidden', className)}>
      <ChartContainer
        title={draft.title}
        subtitle={subtitle}
        exportOptions={{
          enablePDF: true,
          enablePNG: true,
          filename: `air-quality-${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'chart'}`,
        }}
        onRefresh={() => void handleRefresh()}
        onEditTitle={(nextTitle, nextSubtitle) =>
          onEditTitle(draft.id, nextTitle, nextSubtitle ?? '')
        }
        loading={isLoading || isRefreshing}
        error={error}
        menuItems={
          <div className="py-1">
            <button
              type="button"
              onClick={() => onEdit(draft)}
              className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <AqEdit02 className="h-4 w-4 mr-2" />
              Edit chart
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(draft)}
              className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            >
              <AqTrash01 className="h-4 w-4 mr-2" />
              Delete chart
            </button>
          </div>
        }
      >
        <DynamicChart
          data={chartData}
          config={{
            type: draft.chartType.toLowerCase() as 'line' | 'area' | 'bar',
            showGrid: draft.showGrid,
            showTooltip: draft.showTooltip,
            showLegend: draft.showLegend,
            ...(draft.color ? { color: draft.color } : {}),
            height: 360,
          }}
          pollutant={draft.pollutant}
          aqiConfig={aqiConfig ?? null}
          frequency={draft.frequency}
          autoSelectType={false}
        />
      </ChartContainer>

      {/* Inline delete confirmation — visible on the tile, not hidden in a menu */}
      {deleteConfirming && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-destructive/30 bg-destructive/10 px-4 py-2.5" role="alert">
          <span className="text-sm font-medium text-destructive">
            Delete this chart?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onConfirmDelete(draft)}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:bg-destructive/90 transition-colors"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              Keep chart
            </button>
          </div>
        </div>
      )}

      {/* Collapsible forecast for this chart's first site */}
      {firstSiteId && (
        <div className="border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={() => setForecastOpen(prev => !prev)}
            className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            aria-expanded={forecastOpen}
          >
            <span className="flex items-center gap-2">
              <span role="img" aria-label="Forecast">
                🌤
              </span>
              Forecast
            </span>
            <AqChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                forecastOpen && 'rotate-180'
              )}
            />
          </button>
          {forecastOpen && (
            <div className="px-2 pb-3">
              <WeeklyForecastCard siteId={firstSiteId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsChartTile;
