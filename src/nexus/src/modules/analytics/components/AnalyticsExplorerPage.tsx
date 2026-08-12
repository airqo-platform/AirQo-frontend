'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { cn } from '@/shared/lib/utils';
import PageHeading from '@/shared/components/ui/page-heading';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { toast } from '@/shared/components/ui/toast';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { AqPlus } from '@airqo/icons-react';
import { useUser } from '@/shared/hooks/useUser';
import {
  useGroupCharts,
  useCreateGroupChart,
  useUpdateGroupChart,
  useDeleteGroupChart,
} from '@/shared/hooks/useGroupCharts';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { AnalyticsChartTile } from './explorer/AnalyticsChartTile';
import { ChartConfigDialog } from './explorer/ChartConfigDialog';
import { ComparisonTable } from './explorer/ComparisonTable';
import { ComparisonCards } from './explorer/ComparisonCards';
import { AqiLegend } from './explorer/AqiLegend';
import {
  useComparisonReadings,
  extractReadingNames,
} from '../hooks/useComparisonReadings';
import {
  persistedConfigToDraft,
  draftToPersistedConfig,
  readChartSidecar,
  writeChartSidecar,
  removeChartSidecar,
  DEFAULT_CHART_SIDECAR,
  type ExplorerChartDraft,
} from '../utils/chartConfig';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type { PollutantType } from '@/shared/components/charts/types';

interface AnalyticsExplorerPageProps {
  className?: string;
  isOrganizationFlow?: boolean;
  organizationSlug?: string;
}

type ViewMode = 'grid' | 'full' | 'table';
type CompareMode = 'table' | 'cards';

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'grid', label: 'Grid view' },
  { value: 'full', label: 'Full view' },
  { value: 'table', label: 'Compare table' },
];

const COMPARE_VIEW_OPTIONS: { value: CompareMode; label: string }[] = [
  { value: 'table', label: 'Table' },
  { value: 'cards', label: 'Cards' },
];

const isCancellationError = (error: unknown): boolean => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;
  return (
    candidate?.name === 'AbortError' ||
    candidate?.name === 'CanceledError' ||
    candidate?.code === 'ERR_CANCELED' ||
    candidate?.message === 'canceled'
  );
};

/**
 * Air Quality Analytics - a dashboard of user-configurable charts persisted
 * to the group's chart configurations (auth-service). Each chart carries its
 * own title, pollutant, frequency, custom date range, style and locations.
 * The AQI scale is shown ONCE at page level (IQAir/WAQI pattern), forecasts
 * cover one selected location, and the view switcher offers grid, full-width
 * and an unlimited location-comparison table.
 */
export const AnalyticsExplorerPage: React.FC<AnalyticsExplorerPageProps> = ({
  className,
  isOrganizationFlow = false,
  organizationSlug,
}) => {
  const posthog = usePostHog();
  const { activeGroup, groups, isLoading: userContextLoading } = useUser();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [compareMode, setCompareMode] = useState<CompareMode>('table');
  const [tablePollutant, setTablePollutant] = useState<PollutantType>('pm2_5');
  const { config: tableAqiConfig } = useAqiConfig(tablePollutant);
  const { config: aqiConfig } = useAqiConfig('pm2_5');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<ExplorerChartDraft | null>(
    null
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [siteNames, setSiteNames] = useState<Map<string, string>>(new Map());
  const [openForecastId, setOpenForecastId] = useState<string | null>(null);

  const normalizedOrganizationSlug = useMemo(
    () => (organizationSlug || '').trim().toLowerCase(),
    [organizationSlug]
  );

  const organizationGroup = useMemo(() => {
    if (!isOrganizationFlow || !normalizedOrganizationSlug) return null;
    return (
      groups?.find(
        group =>
          (group.organizationSlug || '').trim().toLowerCase() ===
          normalizedOrganizationSlug
      ) || null
    );
  }, [groups, isOrganizationFlow, normalizedOrganizationSlug]);

  const organizationGroupId = organizationGroup?.id || '';
  const groupId = isOrganizationFlow ? organizationGroupId : activeGroup?.id ?? '';

  const isInitialLoading =
    userContextLoading ||
    (isOrganizationFlow &&
      !!normalizedOrganizationSlug &&
      !organizationGroupId);

  const {
    data: persistedCharts,
    isLoading: chartsLoading,
    error: chartsError,
    mutate: refetchCharts,
  } = useGroupCharts(groupId, !!groupId && !isInitialLoading);

  // Merge persisted configs with the client-side sidecar into drafts
  const charts = useMemo<ExplorerChartDraft[]>(() => {
    if (!persistedCharts) return [];
    return persistedCharts.map(config => {
      const sidecar = config._id
        ? readChartSidecar(groupId, config._id)
        : DEFAULT_CHART_SIDECAR;
      return persistedConfigToDraft(config, sidecar);
    });
  }, [persistedCharts, groupId]);

  // Hydrate the site-names map (chips + forecast selector) from the sidecars
  // so names survive reloads.
  useEffect(() => {
    if (!persistedCharts) return;
    setSiteNames(prev => {
      const next = new Map(prev);
      persistedCharts.forEach(config => {
        if (!config._id) return;
        const sidecar = readChartSidecar(groupId, config._id);
        Object.entries(sidecar.siteNames ?? {}).forEach(([id, name]) => {
          if (name) next.set(id, name);
        });
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedCharts, groupId]);

  const handleNamesResolved = useCallback((names: Map<string, string>) => {
    setSiteNames(prev => {
      const next = new Map(prev);
      names.forEach((name, id) => next.set(id, name));
      return next;
    });
  }, []);

  const handleForecastToggle = useCallback((chartId: string) => {
    setOpenForecastId(prev => (prev === chartId ? null : chartId));
  }, []);

  const allSiteIds = useMemo(
    () => Array.from(new Set(charts.flatMap(chart => chart.siteIds))),
    [charts]
  );

  // Resolve display names from the latest readings (shared cache with the
  // comparison table) so the forecast selector and chips never show raw ids.
  const { data: readingsForNames } = useComparisonReadings(
    allSiteIds,
    allSiteIds.length > 0
  );
  useEffect(() => {
    if (!readingsForNames || readingsForNames.length === 0) return;
    const names = extractReadingNames(readingsForNames);
    if (names.size > 0) handleNamesResolved(names);
  }, [readingsForNames, handleNamesResolved]);

  const createMutation = useCreateGroupChart();
  const updateMutation = useUpdateGroupChart();
  const deleteMutation = useDeleteGroupChart();

  useEffect(() => {
    posthog?.capture('analytics_explorer_viewed', {
      view: viewMode,
      chart_count: charts.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleOpenCreate = useCallback(() => {
    setEditingDraft(null);
    setSaveError(null);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((draft: ExplorerChartDraft) => {
    setEditingDraft(draft);
    setSaveError(null);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingDraft(null);
    setSaveError(null);
  }, []);

  const persistDraft = useCallback(
    async (draft: ExplorerChartDraft, namesSnapshot: Record<string, string>) => {
      if (draft.id) {
        // Update: flat partial body (verified live -- the chartConfig
        // wrapper is silently ignored by PUT). Round-trip the persisted
        // fieldId so edits don't reset the chart's slot to 1.
        const nextSidecar = {
          subtitle: draft.subtitle,
          pollutant: draft.pollutant,
          frequency: draft.frequency,
          color: draft.color,
          startDate: draft.startDate,
          endDate: draft.endDate,
          siteNames: namesSnapshot,
        };
        // Write the sidecar FIRST so the optimistic cache update renders the
        // client-side fields (subtitle, pollutant, range, ...) instantly;
        // roll it back if the PUT fails.
        const prevSidecar = readChartSidecar(groupId, draft.id);
        writeChartSidecar(groupId, draft.id, nextSidecar);
        try {
          await updateMutation.trigger({
            groupId,
            chartId: draft.id,
            request: {
              ...draftToPersistedConfig(draft, draft.fieldId),
              site_ids: draft.siteIds,
              device_ids: draft.deviceIds,
            },
          });
        } catch (error) {
          writeChartSidecar(groupId, draft.id, prevSidecar);
          throw error;
        }
      } else {
        // Create: pick the next free slot (1-8), avoiding slots already in use
        const usedFieldIds = new Set(
          charts.map(chart => chart.fieldId).filter((id): id is number => id >= 1)
        );
        let fieldId = 1;
        for (let slot = 1; slot <= 8; slot++) {
          if (!usedFieldIds.has(slot)) {
            fieldId = slot;
            break;
          }
        }
        const result = await createMutation.trigger({
          groupId,
          request: {
            site_ids: draft.siteIds,
            device_ids: draft.deviceIds,
            chartConfig: draftToPersistedConfig(draft, fieldId),
          },
        });
        const newChartId = result?.data?._id ?? '';
        if (newChartId) {
          writeChartSidecar(groupId, newChartId, {
            subtitle: draft.subtitle,
            pollutant: draft.pollutant,
            frequency: draft.frequency,
            color: draft.color,
            startDate: draft.startDate,
            endDate: draft.endDate,
            siteNames: namesSnapshot,
          });
        }
      }
    },
    [charts, createMutation, groupId, updateMutation]
  );

  const handleSaveDraft = useCallback(
    async (draft: ExplorerChartDraft) => {
      setSaveError(null);
      const namesSnapshot = Object.fromEntries(siteNames);
      try {
        await persistDraft(draft, namesSnapshot);
        toast.success(
          draft.id ? 'Chart updated' : 'Chart added',
          draft.id
            ? 'Your chart configuration was saved.'
            : 'Your new chart was added to the dashboard.'
        );
        posthog?.capture(
          draft.id ? 'analytics_chart_updated' : 'analytics_chart_created',
          { title: draft.title, site_count: draft.siteIds.length }
        );
        handleCloseDialog();
      } catch (error) {
        if (isCancellationError(error)) return;
        console.error('Failed to save chart configuration:', error instanceof Error ? error.message : error);
        setSaveError(
          getUserFriendlyErrorMessage(error, {
            Default: 'We could not save the chart configuration.',
          })
        );
      }
    },
    [handleCloseDialog, persistDraft, posthog, siteNames]
  );

  // Inline title/subtitle edit from the chart header
  const handleEditTitle = useCallback(
    async (draftId: string, title: string, subtitle?: string) => {
      const chartToUpdate = charts.find(chart => chart.id === draftId);
      if (!chartToUpdate) return;

      const updated: ExplorerChartDraft = {
        ...chartToUpdate,
        title,
        subtitle: subtitle ?? '',
      };
      const namesSnapshot = Object.fromEntries(siteNames);
      await persistDraft(updated, namesSnapshot);
      posthog?.capture('analytics_chart_title_updated', {
        chart_id: draftId,
        title,
      });
    },
    [charts, persistDraft, posthog, siteNames]
  );

  // Arms the inline delete confirmation on the tile
  const handleRequestDelete = useCallback(
    (draft: ExplorerChartDraft) => {
      if (pendingDeleteId === draft.id) return;
      setPendingDeleteId(draft.id);
      if (pendingDeleteTimerRef.current) {
        clearTimeout(pendingDeleteTimerRef.current);
      }
      pendingDeleteTimerRef.current = setTimeout(() => {
        setPendingDeleteId(null);
        pendingDeleteTimerRef.current = null;
      }, 15000);
    },
    [pendingDeleteId]
  );

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteId(null);
    if (pendingDeleteTimerRef.current) {
      clearTimeout(pendingDeleteTimerRef.current);
      pendingDeleteTimerRef.current = null;
    }
  }, []);

  // Executes the delete after the user confirms on the tile
  const handleConfirmDelete = useCallback(
    (draft: ExplorerChartDraft) => {
      setPendingDeleteId(null);
      if (pendingDeleteTimerRef.current) {
        clearTimeout(pendingDeleteTimerRef.current);
        pendingDeleteTimerRef.current = null;
      }
      void (async () => {
        try {
          await deleteMutation.trigger({ groupId, chartId: draft.id });
          removeChartSidecar(groupId, draft.id);
          toast.success(
            'Chart deleted',
            'The chart was removed from the dashboard.'
          );
          posthog?.capture('analytics_chart_deleted', { title: draft.title });
        } catch (error) {
          if (isCancellationError(error)) return;
          console.error('Failed to delete chart configuration:', error instanceof Error ? error.message : error);
          toast.error(
            'Delete failed',
            getUserFriendlyErrorMessage(error, {
              Default: 'We could not delete the chart configuration.',
            })
          );
        }
      })();
    },
    [deleteMutation, groupId, posthog]
  );

  useEffect(
    () => () => {
      if (pendingDeleteTimerRef.current) {
        clearTimeout(pendingDeleteTimerRef.current);
      }
    },
    []
  );

  const renderChartTiles = (fullWidth: boolean) => (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 items-start',
        fullWidth ? 'lg:grid-cols-1' : 'lg:grid-cols-2'
      )}
    >
      {charts.map(draft => (
        <AnalyticsChartTile
          key={draft.id}
          draft={draft}
          aqiConfig={aqiConfig}
          forecastOpen={openForecastId === draft.id}
          onForecastToggle={() => handleForecastToggle(draft.id)}
          onEdit={handleOpenEdit}
          onRequestDelete={handleRequestDelete}
          onConfirmDelete={handleConfirmDelete}
          onCancelDelete={handleCancelDelete}
          onEditTitle={handleEditTitle}
          deleteConfirming={pendingDeleteId === draft.id}
        />
      ))}

      {/* Build chart tile */}
      <button
        type="button"
        onClick={handleOpenCreate}
        aria-label="Build chart"
        className="flex min-h-[240px] w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-primary/50 dark:border-primary/80 bg-primary/10 text-primary transition-all duration-200 hover:scale-[0.99] hover:bg-primary/15"
      >
        <AqPlus className="h-8 w-8" />
        <span className="text-sm font-medium">Build chart</span>
        <span className="px-6 text-center text-xs text-muted-foreground">
          Configure a new chart with its own locations, pollutant and time
          range.
        </span>
      </button>
    </div>
  );

  return (
    <div className={cn('space-y-5', className)}>
      <PageHeading
        title="Air Quality Analytics"
        subtitle="Build and save as many charts as you need, each with its own locations, pollutant, time range and style, or compare every selected location side by side."
        infoLine="Charts are saved when you click Add chart or Save changes."
        action={
          charts.length > 0 ? (
            <Button
              variant="filled"
              size="sm"
              onClick={handleOpenCreate}
              disabled={isInitialLoading || !groupId}
            >
              Build chart
            </Button>
          ) : undefined
        }
      />

      {isInitialLoading || (chartsLoading && charts.length === 0) ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingState text="Loading analytics..." />
        </div>
      ) : chartsError && charts.length === 0 ? (
        <ErrorState
          title="Unable to load chart configurations"
          description={
            chartsError instanceof Error
              ? chartsError.message
              : "We could not load your saved charts."
          }
          retryAction={{ label: 'Retry', onClick: () => void refetchCharts() }}
        />
      ) : charts.length === 0 ? (
        <EmptyState
          title="No charts yet"
          description="Add your first chart to start exploring air quality trends."
          action={{ label: 'Build chart', onClick: handleOpenCreate }}
        />
      ) : (
        <>
          {/* View switcher - wrapped in a card, sized to content */}
          <Card className="w-fit">
            <CardContent className="p-2">
              <SegmentedTabs
                ariaLabel="Analytics view"
                options={VIEW_OPTIONS}
                value={viewMode}
                onChange={setViewMode}
              />
            </CardContent>
          </Card>

          {/* AQI scale - shown once at page level for the chart and card
              views; the comparison table renders its own legend inline so it
              is not duplicated here */}
          {viewMode !== 'table' && <AqiLegend aqiConfig={aqiConfig} />}

          {viewMode === 'table' ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Card className="w-fit">
                  <CardContent className="p-1">
                    <SegmentedTabs
                      ariaLabel="Comparison layout"
                      options={COMPARE_VIEW_OPTIONS}
                      value={compareMode}
                      onChange={setCompareMode}
                    />
                  </CardContent>
                </Card>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Legend pollutant
                  </span>
                  <select
                    aria-label="Comparison pollutant"
                    value={tablePollutant}
                    onChange={event =>
                      setTablePollutant(event.target.value as PollutantType)
                    }
                    className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1d1f20] px-3 py-1.5 text-sm"
                  >
                    <option value="pm2_5">PM2.5</option>
                    <option value="pm10">PM10</option>
                  </select>
                </div>
              </div>

              {compareMode === 'table' ? (
                <ComparisonTable
                  siteIds={allSiteIds}
                  siteNames={siteNames}
                  aqiConfig={tableAqiConfig}
                  onNamesResolved={handleNamesResolved}
                />
              ) : (
                <>
                  <AqiLegend aqiConfig={tableAqiConfig} />
                  <ComparisonCards
                    siteIds={allSiteIds}
                    siteNames={siteNames}
                    aqiConfig={tableAqiConfig}
                    onNamesResolved={handleNamesResolved}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {viewMode === 'grid'
                ? renderChartTiles(false)
                : charts.map(draft => (
                    <AnalyticsChartTile
                      key={draft.id}
                      draft={draft}
                      aqiConfig={aqiConfig}
                      forecastOpen={openForecastId === draft.id}
                      onForecastToggle={() => handleForecastToggle(draft.id)}
                      onEdit={handleOpenEdit}
                      onRequestDelete={handleRequestDelete}
                      onConfirmDelete={handleConfirmDelete}
                      onCancelDelete={handleCancelDelete}
                      onEditTitle={handleEditTitle}
                      deleteConfirming={pendingDeleteId === draft.id}
                    />
                  ))}

              {viewMode === 'full' && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-primary/50 dark:border-primary/80 bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/15"
                  aria-label="Build chart"
                >
                  <AqPlus className="h-7 w-7" />
                  <span className="text-sm font-medium">Build chart</span>
                </button>
              )}
            </>
          )}
        </>
      )}

      <ChartConfigDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        groupId={groupId}
        draft={editingDraft}
        onSave={draft => void handleSaveDraft(draft)}
        onSelectionNamesChange={handleNamesResolved}
        isSaving={createMutation.isMutating || updateMutation.isMutating}
        saveError={saveError}
      />
    </div>
  );
};

export default AnalyticsExplorerPage;

