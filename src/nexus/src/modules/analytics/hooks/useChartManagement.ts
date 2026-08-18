'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { toast } from '@/shared/components/ui/toast';
import {
  useGroupCharts,
  useCreateGroupChart,
  useUpdateGroupChart,
  useDeleteGroupChart,
  useCopyGroupChart,
} from '@/shared/hooks/useGroupCharts';
import {
  useComparisonReadings,
  extractReadingNames,
} from './useComparisonReadings';
import {
  useSiteNamesFallback,
  useMergeFallbackNames,
} from './useSiteNamesFallback';
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

export interface UseChartManagementResult {
  charts: ExplorerChartDraft[];
  chartsLoading: boolean;
  chartsError: unknown;
  refetchCharts: () => void;
  siteNames: Map<string, string>;
  forecastChartIds: Set<string>;
  dialogOpen: boolean;
  editingDraft: ExplorerChartDraft | null;
  deleteDraft: ExplorerChartDraft | null;
  isDeleteConfirming: boolean;
  saveError: string | null;
  isSaving: boolean;
  openCreate: () => void;
  openEdit: (draft: ExplorerChartDraft) => void;
  closeDialog: () => void;
  handleSaveDraft: (draft: ExplorerChartDraft) => Promise<void>;
  handleRequestDelete: (draft: ExplorerChartDraft) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  handleDuplicate: (draft: ExplorerChartDraft) => Promise<void>;
  handleForecastToggle: (chartId: string) => void;
  handleEditTitle: (
    draftId: string,
    title: string,
    subtitle?: string
  ) => Promise<void>;
  handleNamesResolved: (names: Map<string, string>) => void;
}

/**
 * Extracts ALL chart-management orchestration from AnalyticsExplorerPage:
 * state, hooks, handlers — so both the explorer page and the org-dashboard
 * charts section can share the exact same logic.
 *
 * Preserves: sidecar reads/writes, sidecarVersion bumps, forecast toggle
 * persistence, title edit persistence, duplicate with sidecar copy, delete
 * with sidecar removal, PostHog events.
 */
export const useChartManagement = (
  groupId: string,
  enabled: boolean
): UseChartManagementResult => {
  const posthog = usePostHog();

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

  const {
    data: persistedCharts,
    isLoading: chartsLoading,
    error: chartsError,
    mutate: refetchCharts,
  } = useGroupCharts(groupId, enabled);

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
    enabled && charts.length > 0
  );
  useMergeFallbackNames(siteNames, fallbackSiteNames, handleNamesResolved);

  const createMutation = useCreateGroupChart();
  const updateMutation = useUpdateGroupChart();
  const deleteMutation = useDeleteGroupChart();
  const copyMutation = useCopyGroupChart();

  const openCreate = useCallback(() => {
    setEditingDraft(null);
    setSaveError(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((draft: ExplorerChartDraft) => {
    setEditingDraft(draft);
    setSaveError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
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
        closeDialog();
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
    [closeDialog, persistDraft, posthog, siteNames]
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

  const cancelDelete = useCallback(() => {
    setDeleteDraft(null);
  }, []);

  // Executes the delete after the user confirms in the dialog
  const confirmDelete = useCallback(() => {
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

  return {
    charts,
    chartsLoading,
    chartsError,
    refetchCharts,
    siteNames,
    forecastChartIds,
    dialogOpen,
    editingDraft,
    deleteDraft,
    isDeleteConfirming: !!deleteDraft,
    saveError,
    isSaving: createMutation.isMutating || updateMutation.isMutating,
    openCreate,
    openEdit,
    closeDialog,
    handleSaveDraft,
    handleRequestDelete,
    cancelDelete,
    confirmDelete,
    handleDuplicate,
    handleForecastToggle,
    handleEditTitle,
    handleNamesResolved,
  };
};
