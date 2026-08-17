'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { usePostHog } from 'posthog-js/react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Banner } from '@/shared/components/ui/banner';
import { toast } from '@/shared/components/ui/toast';
import ReusableDialog from '@/shared/components/ui/dialog';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { AqTrash01 } from '@airqo/icons-react';
import { AqPlus, AqLayoutGrid01, AqList } from '@airqo/icons-react';
import { useUser } from '@/shared/hooks/useUser';
import {
  useGroupCharts,
  useCreateGroupChart,
  useUpdateGroupChart,
  useDeleteGroupChart,
  useCopyGroupChart,
} from '@/shared/hooks/useGroupCharts';
import { analyticsService } from '@/shared/services/analyticsService';
import {
  buildChartDataQueryKey,
  transformChartData,
  type ChartDataFilters,
} from '../hooks';
import { AnalyticsChartCard } from './explorer/AnalyticsChartCard';
import { ChartsOverviewView } from './explorer/ChartsOverviewView';
import { ChartConfigDialog } from './explorer/ChartConfigDialog';
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
  draftToUpdateRequest,
  buildChartPeriod,
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

type TrendsLayout = 'list' | 'grid';

const TRENDS_LAYOUT_STORAGE_KEY = 'nexus:analytics:overview-layout';

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
 * Air Quality Analytics — the chart workspace. Every configured chart is
 * rendered in a list (each as the full focused workspace) or a grid, plus
 * the page-level AQI legend. Location details are opened from the data
 * export tables so there is one location-discovery experience.
 */
export const AnalyticsExplorerPage: React.FC<AnalyticsExplorerPageProps> = ({
  className,
  isOrganizationFlow = false,
  organizationSlug,
}) => {
  const posthog = usePostHog();
  const {
    user,
    activeGroup,
    groups,
    isLoading: userContextLoading,
  } = useUser();

  const [trendsLayout, setTrendsLayout] = useState<TrendsLayout>(
    readStoredTrendsLayout
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<ExplorerChartDraft | null>(
    null
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteDraft, setDeleteDraft] = useState<ExplorerChartDraft | null>(
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

  // The sidecar lives in localStorage, which React can't observe. Whenever a
  // sidecar is written (create/update/duplicate/delete), this version bumps
  // so the charts memo below re-reads the fresh sidecar — otherwise a just-
  // created chart renders with the DEFAULT sidecar (e.g. always PM2.5) until
  // the next page load.
  const [sidecarVersion, setSidecarVersion] = useState(0);
  const bumpSidecarVersion = useCallback(() => {
    setSidecarVersion(version => version + 1);
  }, []);

  // Merge persisted configs with the client-side sidecar into drafts
  const charts = useMemo<ExplorerChartDraft[]>(() => {
    if (!persistedCharts) return [];
    return persistedCharts.map(config => {
      const sidecar = config._id
        ? readChartSidecar(groupId, config._id)
        : DEFAULT_CHART_SIDECAR;
      return persistedConfigToDraft(config, sidecar);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedCharts, groupId, sidecarVersion]);

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

  // Data-coverage warning: users can select many locations, but the chart
  // API only returns series for locations that actually have data. These
  // queries share the exact query keys the chart cards use, so no extra
  // requests fire — the coverage reads the same cached chart data. Gated to
  // the Trends view (where charts render).
  const coverageQueries = useQueries({
    queries: charts.map(draft => {
      const filters: ChartDataFilters = {
        frequency: draft.frequency,
        pollutant: draft.pollutant,
        startDate: draft.startDate,
        endDate: draft.endDate,
      };
      const chartType = draft.chartType === 'Bar' ? 'bar' : 'line';
      return {
        queryKey: buildChartDataQueryKey(
          user?.id,
          activeGroup?.id,
          chartType,
          draft.siteIds,
          filters
        ),
        queryFn: async ({ signal }) => {
          const response = await analyticsService.getChartData(
            {
              sites: draft.siteIds,
              startDate: filters.startDate,
              endDate: filters.endDate,
              chartType,
              frequency: filters.frequency,
              pollutant: filters.pollutant.toLowerCase().replace('.', '_'),
              organisation_name: '',
            },
            signal
          );
          return response?.data && response.data.length > 0
            ? transformChartData(response.data)
            : [];
        },
        enabled:
          !isInitialLoading && charts.length > 0 && draft.siteIds.length > 0,
        networkMode: 'online',
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60 * 12,
      };
    }),
  });

  // Distinct locations that actually returned chart data across all charts.
  const coveredSiteIds = useMemo(() => {
    const withData = new Set<string>();
    coverageQueries.forEach(query => {
      (query.data ?? []).forEach(point => {
        if (point.site_id) withData.add(point.site_id);
      });
    });
    return withData;
  }, [coverageQueries]);

  const dataCoverage = useMemo(() => {
    if (allSiteIds.length === 0) return null;
    const withData = allSiteIds.filter(id => coveredSiteIds.has(id)).length;
    if (withData >= allSiteIds.length) return null;
    return { selected: allSiteIds.length, withData };
  }, [allSiteIds, coveredSiteIds]);

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
    posthog?.capture('analytics_trends_viewed', {
      layout: trendsLayout,
      chart_count: charts.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendsLayout]);

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
        // Update: flat partial body (the chartConfig wrapper is not used by
        // PUT). The existing server fieldId remains untouched; Area is kept
        // in the sidecar while the API receives a compatible Line type.
        const nextSidecar = {
          subtitle: draft.subtitle,
          chartType: draft.chartType,
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
        bumpSidecarVersion();
        try {
          await updateMutation.trigger({
            groupId,
            chartId: draft.id,
            request: draftToUpdateRequest(draft),
          });
        } catch (error) {
          writeChartSidecar(groupId, draft.id, prevSidecar);
          bumpSidecarVersion();
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
            period: buildChartPeriod(draft.startDate, draft.endDate),
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
            chartType: draft.chartType,
            startDate: draft.startDate,
            endDate: draft.endDate,
            siteNames: namesSnapshot,
          });
          // Recompute the charts memo now that the sidecar exists — without
          // this the optimistic cache entry renders with the DEFAULT sidecar
          // (e.g. always PM2.5) until the next reload.
          bumpSidecarVersion();
        }
        return newChartId || null;
      }
    },
    [bumpSidecarVersion, charts, createMutation, groupId, updateMutation]
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
            chartType: draft.chartType,
            siteNames: Object.fromEntries(siteNames),
          });
          bumpSidecarVersion();
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
    [bumpSidecarVersion, copyMutation, groupId, posthog, siteNames]
  );

  // Opens the delete-confirmation dialog for the chart
  const handleRequestDelete = useCallback((draft: ExplorerChartDraft) => {
    setDeleteDraft(draft);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteDraft(null);
  }, []);

  // Executes the delete after the user confirms in the dialog
  const handleConfirmDelete = useCallback(() => {
    const draft = deleteDraft;
    if (!draft) return;
    setDeleteDraft(null);
    void (async () => {
      try {
        await deleteMutation.trigger({ groupId, chartId: draft.id });
        removeChartSidecar(groupId, draft.id);
        bumpSidecarVersion();
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
  }, [bumpSidecarVersion, deleteDraft, deleteMutation, groupId, posthog]);

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
            {/* Data-coverage warning — some selected locations have no
                readings for the current time period / frequency, so charts
                silently omit them. */}
            {dataCoverage && (
              <Banner
                severity="warning"
                dense
                title="Some locations have no data for the selected time period"
                message="A few of your selected locations don't have readings available for the current time period and frequency, so some charts may not show every location. Try adjusting the time period or frequency, or remove locations without data from your charts."
              />
            )}

            {/* Layout switcher and New chart button — right-aligned */}
            <div className="flex items-center justify-end gap-2">
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
              <Button
                variant="filled"
                size="md"
                Icon={AqPlus}
                onClick={handleOpenCreate}
                disabled={isInitialLoading || !groupId}
                showTextOnMobile
              >
                New chart
              </Button>
            </div>

            {trendsLayout === 'grid' ? (
              <ChartsOverviewView
                charts={charts}
                siteNames={siteNames}
                groupId={groupId}
                onEdit={handleOpenEdit}
                onRequestDelete={handleRequestDelete}
              />
            ) : (
              /* List view — chart cards span the full width */
              <div className="space-y-4">
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
                    onEditTitle={handleEditTitle}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Compact page header: title, description */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl text-foreground">Air Quality Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor current conditions, trends and forecasts for your configured
            locations.
          </p>
        </div>
      </div>

      {renderTrendsView()}

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

      {/* Delete chart confirmation */}
      <ReusableDialog
        isOpen={!!deleteDraft}
        onClose={handleCancelDelete}
        title="Delete chart?"
        subtitle={
          deleteDraft
            ? `"${deleteDraft.title}" will be permanently removed from your saved charts. This action cannot be undone.`
            : undefined
        }
        icon={AqTrash01}
        iconColor="text-destructive"
        iconBgColor="bg-destructive/10"
        size="sm"
        primaryAction={{
          label: 'Delete chart',
          onClick: handleConfirmDelete,
          variant: 'danger',
        }}
        secondaryAction={{ label: 'Cancel', onClick: handleCancelDelete }}
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to continue? The chart configuration and its
          saved settings will be removed.
        </p>
      </ReusableDialog>
    </div>
  );
};

export default AnalyticsExplorerPage;
