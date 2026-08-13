'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePostHog } from 'posthog-js/react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { toast } from '@/shared/components/ui/toast';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import {
  AqPlus,
  AqMaximize01,
  AqLayoutGrid01,
  AqTable,
} from '@airqo/icons-react';
import { useUser } from '@/shared/hooks/useUser';
import {
  useGroupCharts,
  useCreateGroupChart,
  useUpdateGroupChart,
  useDeleteGroupChart,
  useCopyGroupChart,
} from '@/shared/hooks/useGroupCharts';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { AnalyticsChartCard } from './explorer/AnalyticsChartCard';
import { AirQualityReferenceLegend } from './explorer/AirQualityReferenceLegend';
import { ForecastSummaryCard } from './explorer/ForecastSummaryCard';
import { SavedChartsCard } from './explorer/SavedChartsCard';
import { ChartsOverviewView } from './explorer/ChartsOverviewView';
import { ChartConfigDialog } from './explorer/ChartConfigDialog';
import { ComparisonTable } from './explorer/ComparisonTable';
import { ComparisonCards } from './explorer/ComparisonCards';
import {
  useComparisonReadings,
  extractReadingNames,
} from '../hooks/useComparisonReadings';
import {
  useSiteNamesFallback,
  useMergeFallbackNames,
} from '../hooks/useSiteNamesFallback';
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

type ViewMode = 'focused' | 'charts' | 'table';
type CompareMode = 'table' | 'cards';

const ACTIVE_CHART_STORAGE_KEY = 'nexus:analytics:active-chart';

const VIEW_OPTIONS: {
  value: ViewMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'focused',
    label: 'Focused',
    icon: <AqMaximize01 className="h-3.5 w-3.5" />,
  },
  {
    value: 'charts',
    label: 'Charts',
    icon: <AqLayoutGrid01 className="h-3.5 w-3.5" />,
  },
  {
    value: 'table',
    label: 'Table',
    icon: <AqTable className="h-3.5 w-3.5" />,
  },
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

const readStoredActiveChartId = (): string | null => {
  try {
    return window.localStorage.getItem(ACTIVE_CHART_STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * Air Quality Analytics — a workspace built around ONE active chart. The
 * selected chart is the primary focus; the reference legend, saved charts
 * and forecast summary are supporting components around it. Chart CRUD is
 * unchanged (group-chart configs + localStorage sidecars), and the compare
 * table view still shows every selected location side by side.
 */
export const AnalyticsExplorerPage: React.FC<AnalyticsExplorerPageProps> = ({
  className,
  isOrganizationFlow = false,
  organizationSlug,
}) => {
  const posthog = usePostHog();
  const { activeGroup, groups, isLoading: userContextLoading } = useUser();

  const [viewMode, setViewMode] = useState<ViewMode>('focused');
  const [compareMode, setCompareMode] = useState<CompareMode>('table');
  const [tablePollutant, setTablePollutant] = useState<PollutantType>('pm2_5');
  const { config: tableAqiConfig } = useAqiConfig(tablePollutant);

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
  const [activeChartId, setActiveChartId] = useState<string | null>(null);
  const [forecastChartIds, setForecastChartIds] = useState<Set<string>>(
    () => new Set()
  );

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
  const groupId = isOrganizationFlow
    ? organizationGroupId
    : (activeGroup?.id ?? '');

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
  } = useGroupCharts(groupId, !isInitialLoading);

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

  // Keep the stored active chart in sync with reality (deleted charts, group
  // switches, first load) and persist user choices for continuity.
  useEffect(() => {
    if (charts.length === 0) return;
    if (!charts.some(chart => chart.id === activeChartId)) {
      setActiveChartId(charts[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charts, groupId]);

  // Restore the last-active chart on the client (deferred so SSR/hydration
  // render the same initial state).
  useEffect(() => {
    const stored = readStoredActiveChartId();
    if (stored) setActiveChartId(stored);
  }, []);

  useEffect(() => {
    if (!activeChartId) return;
    try {
      window.localStorage.setItem(ACTIVE_CHART_STORAGE_KEY, activeChartId);
    } catch {
      // Storage unavailable — active-chart memory is best-effort.
    }
  }, [activeChartId]);

  const activeChart = useMemo(
    () => charts.find(chart => chart.id === activeChartId) ?? charts[0] ?? null,
    [charts, activeChartId]
  );

  // Hydrate the site-names map (chips + location legend) from the sidecars
  // so names survive reloads.
  useEffect(() => {
    if (!persistedCharts) return;
    setSiteNames(prev => {
      const next = new Map(prev);
      persistedCharts.forEach(config => {
        if (!config._id) return;
        const sidecar = readChartSidecar(groupId, config._id);
        Object.entries(sidecar.siteNames ?? {}).forEach(([id, name]) => {
          // Skip "Unknown location" entries from the sidecar so the
          // fallback chain (forecast API / fleet summary) can resolve real
          // names after the page loads.
          if (
            name &&
            name !== 'Unknown location' &&
            name !== 'Unknown Location'
          ) {
            next.set(id, name);
          }
        });
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedCharts, groupId]);

  const handleNamesResolved = useCallback((names: Map<string, string>) => {
    setSiteNames(prev => {
      const next = new Map(prev);
      names.forEach((name, id) => {
        // Never let "Unknown location" placeholders overwrite real names —
        // the picker reports them for off-page rows that haven't loaded yet.
        if (
          name &&
          name !== 'Unknown location' &&
          name !== 'Unknown Location'
        ) {
          next.set(id, name);
        }
      });
      return next;
    });
  }, []);

  const allSiteIds = useMemo(
    () => Array.from(new Set(charts.flatMap(chart => chart.siteIds))),
    [charts]
  );

  // Resolve display names from the latest readings (shared cache with the
  // comparison table) so the location legend never shows raw ids.
  const { data: readingsForNames } = useComparisonReadings(
    allSiteIds,
    allSiteIds.length > 0
  );
  useEffect(() => {
    if (!readingsForNames || readingsForNames.length === 0) return;
    const names = extractReadingNames(readingsForNames);
    if (names.size > 0) handleNamesResolved(names);
  }, [readingsForNames, handleNamesResolved]);

  // Fleet-wide site-name fallback: fills names the picker sidecar/readings
  // couldn't provide (e.g. charts built on another browser), so "Unknown
  // location" and raw ids never surface in the table/summary.
  const { names: fallbackSiteNames } = useSiteNamesFallback(
    !isInitialLoading && charts.length > 0
  );
  useMergeFallbackNames(siteNames, fallbackSiteNames, handleNamesResolved);

  const createMutation = useCreateGroupChart();
  const updateMutation = useUpdateGroupChart();
  const deleteMutation = useDeleteGroupChart();
  const copyMutation = useCopyGroupChart();

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
    async (
      draft: ExplorerChartDraft,
      namesSnapshot: Record<string, string>
    ): Promise<string | null> => {
      if (draft.id) {
        // Update: flat partial body (verified live -- the chartConfig
        // wrapper is silently ignored by PUT). Round-trip the persisted
        // fieldId so edits don't reset the chart's slot to 1.
        const nextSidecar = {
          subtitle: draft.subtitle,
          pollutant: draft.pollutant,
          frequency: draft.frequency,
          referenceStandard: draft.referenceStandard,
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
            },
          });
        } catch (error) {
          writeChartSidecar(groupId, draft.id, prevSidecar);
          throw error;
        }
        return draft.id;
      } else {
        // Create: pick the next free slot (1-8), avoiding slots already in use
        const usedFieldIds = new Set(
          charts
            .map(chart => chart.fieldId)
            .filter((id): id is number => id >= 1)
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
            group_id: groupId || undefined,
            site_ids: draft.siteIds,
            chartConfig: draftToPersistedConfig(draft, fieldId),
          },
        });
        const newChartId = result?.data?._id ?? '';
        if (newChartId) {
          writeChartSidecar(groupId, newChartId, {
            subtitle: draft.subtitle,
            pollutant: draft.pollutant,
            frequency: draft.frequency,
            referenceStandard: draft.referenceStandard,
            color: draft.color,
            startDate: draft.startDate,
            endDate: draft.endDate,
            siteNames: namesSnapshot,
          });
        }
        return newChartId || null;
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
        console.error(
          'Failed to save chart configuration:',
          error instanceof Error ? error.message : error
        );
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

  // Duplicates the chart via the server copy endpoint (includes scope +
  // locationColors; new title ends with "(Copy)"), carries the client-side
  // sidecar over, and focuses the copy so the user sees it immediately.
  const handleDuplicate = useCallback(
    async (draft: ExplorerChartDraft) => {
      try {
        const result = await copyMutation.trigger({
          groupId,
          chartId: draft.id,
        });
        const newChartId = result?.data?._id ?? '';
        if (newChartId) {
          // Carry over the client-side fields (pollutant, frequency, range,
          // color, reference standard, site names) to the copy.
          const sourceSidecar = readChartSidecar(groupId, draft.id);
          writeChartSidecar(groupId, newChartId, {
            ...sourceSidecar,
            subtitle: draft.subtitle,
            siteNames: Object.fromEntries(siteNames),
          });
          setActiveChartId(newChartId);
        }
        toast.success(
          'Chart duplicated',
          'A copy was added to your saved charts.'
        );
        posthog?.capture('analytics_chart_duplicated', {
          title: result?.data?.title ?? draft.title,
          site_count: draft.siteIds.length,
        });
      } catch (error) {
        if (isCancellationError(error)) return;
        console.error(
          'Failed to duplicate chart configuration:',
          error instanceof Error ? error.message : error
        );
        toast.error(
          'Duplicate failed',
          getUserFriendlyErrorMessage(error, {
            Default: 'We could not duplicate the chart configuration.',
          })
        );
      }
    },
    [copyMutation, groupId, posthog, siteNames]
  );

  // Arms the inline delete confirmation on the card
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

  // Executes the delete after the user confirms on the card
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
          console.error(
            'Failed to delete chart configuration:',
            error instanceof Error ? error.message : error
          );
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

  const handleForecastToggle = useCallback((chartId: string) => {
    setForecastChartIds(prev => {
      const next = new Set(prev);
      if (next.has(chartId)) {
        next.delete(chartId);
      } else {
        next.add(chartId);
      }
      return next;
    });
  }, []);

  // Focus a chart from the overview: make it active and open the focused
  // workspace.
  const handleFocusChart = useCallback((draft: ExplorerChartDraft) => {
    setActiveChartId(draft.id);
    setViewMode('focused');
  }, []);

  useEffect(
    () => () => {
      if (pendingDeleteTimerRef.current) {
        clearTimeout(pendingDeleteTimerRef.current);
      }
    },
    []
  );

  const renderWorkspace = () => {
    if (!activeChart) return null;
    return (
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column: active chart + forecast summary (independent stack) */}
        <div className="min-w-0 space-y-5">
          <AnalyticsChartCard
            key={activeChart.id}
            draft={activeChart}
            groupId={groupId}
            siteNames={siteNames}
            forecastEnabled={forecastChartIds.has(activeChart.id)}
            onForecastToggle={() => handleForecastToggle(activeChart.id)}
            onEdit={handleOpenEdit}
            onRequestDelete={handleRequestDelete}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={handleCancelDelete}
            onEditTitle={handleEditTitle}
            onDuplicate={handleDuplicate}
            deleteConfirming={pendingDeleteId === activeChart.id}
          />
          <ForecastSummaryCard
            siteIds={activeChart.siteIds}
            siteNames={siteNames}
          />
        </div>

        {/* Sidebar: reference legend + saved charts (independent stack) */}
        <div className="min-w-0 space-y-5">
          <AirQualityReferenceLegend
            pollutant={activeChart.pollutant}
            averagingPeriod="24-hour"
          />
          <SavedChartsCard
            charts={charts}
            activeChartId={activeChart.id}
            onSelect={draft => setActiveChartId(draft.id)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Compact page header: title, description, primary CTA */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl text-foreground">Air Quality Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore air quality trends across locations and time.
          </p>
        </div>
        <Button
          variant="filled"
          size="sm"
          Icon={AqPlus}
          onClick={handleOpenCreate}
          disabled={isInitialLoading || !groupId}
        >
          New chart
        </Button>
      </div>

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
              : 'We could not load your saved charts.'
          }
          retryAction={{ label: 'Retry', onClick: () => void refetchCharts() }}
        />
      ) : charts.length === 0 ? (
        <EmptyState
          title="No charts yet"
          description="Create your first chart to explore air quality across locations and time periods."
          action={{ label: 'Create chart', onClick: handleOpenCreate }}
        />
      ) : (
        <>
          {/* View switcher — wrapped in a card, sized to content */}
          <Card className="w-fit">
            <CardContent className="p-1">
              <SegmentedTabs
                ariaLabel="Analytics view"
                options={VIEW_OPTIONS}
                value={viewMode}
                onChange={setViewMode}
              />
            </CardContent>
          </Card>

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
                <ComparisonCards
                  siteIds={allSiteIds}
                  siteNames={siteNames}
                  aqiConfig={tableAqiConfig}
                  onNamesResolved={handleNamesResolved}
                />
              )}
            </>
          ) : viewMode === 'charts' ? (
            <ChartsOverviewView
              charts={charts}
              siteNames={siteNames}
              onFocusChart={handleFocusChart}
              onEdit={handleOpenEdit}
              onRequestDelete={handleRequestDelete}
              onConfirmDelete={handleConfirmDelete}
              onCancelDelete={handleCancelDelete}
              deleteConfirmingId={pendingDeleteId}
            />
          ) : (
            renderWorkspace()
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
        siteNames={siteNames}
        isSaving={createMutation.isMutating || updateMutation.isMutating}
        saveError={saveError}
      />
    </div>
  );
};

export default AnalyticsExplorerPage;
