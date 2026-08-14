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
  AqLayoutGrid01,
  AqLineChartUp01,
  AqList,
  AqCompass01,
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
import { ChartsOverviewView } from './explorer/ChartsOverviewView';
import { ChartConfigDialog } from './explorer/ChartConfigDialog';
import { ExploreSitesView } from './explorer/ExploreSitesView';
import { AqiLegend } from './explorer/AqiLegend';
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

interface AnalyticsExplorerPageProps {
  className?: string;
  isOrganizationFlow?: boolean;
  organizationSlug?: string;
}

type ViewMode = 'trends' | 'explore';
type TrendsLayout = 'list' | 'grid';

const VIEW_MODE_STORAGE_KEY = 'nexus:analytics:view-mode';
const TRENDS_LAYOUT_STORAGE_KEY = 'nexus:analytics:overview-layout';

const VIEW_OPTIONS: {
  value: ViewMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'trends',
    label: 'Trends',
    icon: <AqLineChartUp01 className="h-3.5 w-3.5" />,
  },
  {
    value: 'explore',
    label: 'Explore',
    icon: <AqCompass01 className="h-3.5 w-3.5" />,
  },
];

const TRENDS_LAYOUT_OPTIONS: {
  value: TrendsLayout;
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

// The active view survives reloads: read it lazily (guarded for SSR) and
// persist on change so a refreshed page returns to the same tab. Legacy
// 'table' values map to the Trends view.
const readStoredViewMode = (): ViewMode => {
  if (typeof window === 'undefined') return 'trends';
  try {
    return window.localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'explore'
      ? 'explore'
      : 'trends';
  } catch {
    return 'trends';
  }
};

// The Trends layout (list vs grid) survives reloads too.
const readStoredTrendsLayout = (): TrendsLayout => {
  if (typeof window === 'undefined') return 'list';
  try {
    const stored = window.localStorage.getItem(TRENDS_LAYOUT_STORAGE_KEY);
    return stored === 'list' || stored === 'grid' ? stored : 'list';
  } catch {
    return 'list';
  }
};

/**
 * Air Quality Analytics — two top-level views. "Trends" hosts the chart
 * workspace: every configured chart in a list (each rendered as the full
 * focused workspace) or a grid, plus the page-level AQI legend. "Explore"
 * lists the fleet's monitored locations (cached-sites, server-side
 * pagination) and links through to each location's detail page. The page
 * itself never depends on chart configuration — the empty state and the
 * "New chart" action live inside the Trends tab.
 */
export const AnalyticsExplorerPage: React.FC<AnalyticsExplorerPageProps> = ({
  className,
  isOrganizationFlow = false,
  organizationSlug,
}) => {
  const posthog = usePostHog();
  const { activeGroup, groups, isLoading: userContextLoading } = useUser();

  const [viewMode, setViewMode] = useState<ViewMode>(readStoredViewMode);
  const [trendsLayout, setTrendsLayout] =
    useState<TrendsLayout>(readStoredTrendsLayout);

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

  // Persist the active view so a refresh returns to the same tab.
  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {
      // Storage unavailable — view memory is best-effort.
    }
  }, [viewMode]);

  // Persist the Trends layout so a refresh returns to the same view.
  useEffect(() => {
    try {
      window.localStorage.setItem(TRENDS_LAYOUT_STORAGE_KEY, trendsLayout);
    } catch {
      // Storage unavailable — layout memory is best-effort.
    }
  }, [trendsLayout]);

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
  // location detail page) so chart legends never show raw ids.
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
      layout: trendsLayout,
      chart_count: charts.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, trendsLayout]);

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
          themeColors: draft.themeColors,
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
            themeColors: draft.themeColors,
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
  // sidecar over.
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

  useEffect(
    () => () => {
      if (pendingDeleteTimerRef.current) {
        clearTimeout(pendingDeleteTimerRef.current);
      }
    },
    []
  );

  const { config: aqiConfig } = useAqiConfig('pm2_5');

  const baseHref = isOrganizationFlow
    ? `/org/${normalizedOrganizationSlug}/air-quality/analytics`
    : '/user/air-quality/analytics';

  const renderTrendsView = () => {
    if (isInitialLoading || (chartsLoading && charts.length === 0)) {
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingState text="Loading analytics..." />
        </div>
      );
    }

    if (chartsError && charts.length === 0) {
      return (
        <ErrorState
          title="Unable to load chart configurations"
          description={
            chartsError instanceof Error
              ? chartsError.message
              : 'We could not load your saved charts.'
          }
          retryAction={{ label: 'Retry', onClick: () => void refetchCharts() }}
        />
      );
    }

    return (
      <div className="space-y-4">
        {charts.length === 0 ? (
          <EmptyState
            title="No charts yet"
            description="Create your first chart to explore air quality across locations and time periods."
            action={{ label: 'Create chart', onClick: handleOpenCreate }}
          />
        ) : (
          <>
            {/* Layout switcher — wrapped in a card, sized to content */}
            <Card className="w-fit">
              <CardContent className="p-1">
                <SegmentedTabs
                  ariaLabel="Charts layout"
                  options={TRENDS_LAYOUT_OPTIONS}
                  value={trendsLayout}
                  onChange={setTrendsLayout}
                />
              </CardContent>
            </Card>

            {trendsLayout === 'grid' ? (
              <ChartsOverviewView
                charts={charts}
                siteNames={siteNames}
                groupId={groupId}
                onEdit={handleOpenEdit}
                onRequestDelete={handleRequestDelete}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={handleCancelDelete}
                deleteConfirmingId={pendingDeleteId}
              />
            ) : (
              /* List view — the original focused workspace layout:
                 chart cards on the left, AQI legend sidebar on the right. */
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 space-y-4">
                  {charts.map(draft => (
                    <AnalyticsChartCard
                      key={draft.id}
                      draft={draft}
                      groupId={groupId}
                      siteNames={siteNames}
                      forecastEnabled={forecastChartIds.has(draft.id)}
                      onForecastToggle={() => handleForecastToggle(draft.id)}
                      onEdit={handleOpenEdit}
                      onRequestDelete={handleRequestDelete}
                      onConfirmDelete={handleConfirmDelete}
                      onCancelDelete={handleCancelDelete}
                      onEditTitle={handleEditTitle}
                      onDuplicate={handleDuplicate}
                      deleteConfirming={pendingDeleteId === draft.id}
                    />
                  ))}
                </div>
                {/* Sidebar: AQI reference legend */}
                <div className="min-w-0 space-y-5 lg:sticky lg:top-24">
                  <AqiLegend aqiConfig={aqiConfig ?? null} />
                </div>
              </div>
            )}
          </>
        )}
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
            Monitor current conditions, trends and forecasts for your
            monitored locations — or explore every location in your network.
          </p>
        </div>
        {charts.length > 0 && (
          <Button
            variant="filled"
            size="sm"
            Icon={AqPlus}
            onClick={handleOpenCreate}
            disabled={isInitialLoading || !groupId}
          >
            New chart
          </Button>
        )}
      </div>

      {/* View switcher — always available, independent of chart setup */}
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

      {viewMode === 'explore' ? (
        isInitialLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingState text="Loading locations..." />
          </div>
        ) : (
          <ExploreSitesView groupId={groupId} baseHref={baseHref} />
        )
      ) : (
        renderTrendsView()
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
