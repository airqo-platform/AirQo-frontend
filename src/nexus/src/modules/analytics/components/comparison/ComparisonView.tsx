'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { HiCheck } from 'react-icons/hi';
import { AqChevronDown, AqPlus, AqTrash01 } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useUser } from '@/shared/hooks/useUser';
import type { NormalizedSiteData, RawSiteData } from '@/shared/utils/siteUtils';
import type {
  RecentReading,
  SavedComparison,
  SavedComparisonSite,
} from '@/shared/types/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useRecentReadings } from '../../hooks/useRecentReadings';
import { useSavedComparisons } from '../../hooks/useSavedComparisons';
import {
  buildComparisonRow,
  buildEmptyComparisonRow,
  getComparisonSiteDisplayName,
  type ComparisonRow,
} from '../../utils/comparisonRows';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { AqiLegend } from '../explorer/AqiLegend';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import type { AqiPollutant } from '@/shared/types/aqi';
import { ComparisonSitePicker } from './ComparisonSitePicker';
import { ComparisonTableView } from './ComparisonTableView';
import { downloadComparisonCsv } from './comparisonExport';
import MoreInsights from '@/modules/location-insights/more-insights';
import AddLocation from '@/modules/location-insights/add-location';
import { toSiteSlug } from '@/modules/data-download/utils/siteDetails';
import { rememberSiteSlug } from '@/modules/data-download/hooks/useResolveSiteByName';
import ReusableDialog from '@/shared/components/ui/dialog';
import { toast } from '@/shared/components/ui/toast';
import { getDefaultSiteColor } from '../../utils/siteColors';
import { openMoreInsights } from '@/shared/store/insightsSlice';
import type { SelectedSite } from '@/shared/store/insightsSlice';

interface ComparisonViewProps {
  /** Organization group id; empty in the user flow (uses the active group). */
  groupId?: string;
  className?: string;
  /** When true, site clicks route into the org analytics sub-route. */
  isOrganizationFlow?: boolean;
  /** Org slug used to build the org site-details URL in the org flow. */
  organizationSlug?: string;
}

const SAVED_INDICATOR_MS = 1500;

const toFiniteNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

/**
 * Builds the SavedComparisonSite snapshot for one selected id, mirroring what
 * the favorites dialog saves: real display name plus geo when the source row
 * carries it. Sources, best-first: the cohort picker's loaded rows, the saved
 * comparison payload, the reading payload's embedded siteDetails. Falls back
 * to a minimal `{ id, name }` so a save never silently drops a selected id.
 */
const buildComparisonSiteForSave = (
  siteId: string,
  pickerRows: Map<string, NormalizedSiteData>,
  savedSites: SavedComparisonSite[],
  readingsBySiteId: Map<string, RecentReading>,
  fallbackName: string
): SavedComparisonSite => {
  const pickerRow = pickerRows.get(siteId);
  if (pickerRow) {
    const raw: RawSiteData = pickerRow._raw ?? { _id: pickerRow.id };
    return {
      id: pickerRow.id,
      name: pickerRow.location,
      location: pickerRow.location,
      city: pickerRow.city,
      country: pickerRow.country,
      latitude:
        toFiniteNumber(raw.latitude) ??
        toFiniteNumber(raw.lat) ??
        toFiniteNumber(raw.approximate_latitude),
      longitude:
        toFiniteNumber(raw.longitude) ??
        toFiniteNumber(raw.lng) ??
        toFiniteNumber(raw.approximate_longitude),
    };
  }

  const savedSite = savedSites.find(site => site.id === siteId);
  if (savedSite) return savedSite;

  const siteDetails = readingsBySiteId.get(siteId)?.siteDetails;
  if (siteDetails) {
    return {
      id: siteId,
      name: siteDetails.name || undefined,
      location: siteDetails.location_name || undefined,
      city: siteDetails.city || undefined,
      country: siteDetails.country || undefined,
      latitude: toFiniteNumber(siteDetails.approximate_latitude),
      longitude: toFiniteNumber(siteDetails.approximate_longitude),
    };
  }

  return { id: siteId, name: fallbackName };
};

/**
 * Builds the full SavedComparisonSite[] snapshot for the current selection.
 */
const buildComparisonSitesSnapshot = (
  pickerIds: string[],
  pickerRows: Map<string, NormalizedSiteData>,
  savedSites: SavedComparisonSite[],
  readingsBySiteId: Map<string, RecentReading>,
  namesBySite: Map<string, string>
): SavedComparisonSite[] =>
  pickerIds.map(siteId =>
    buildComparisonSiteForSave(
      siteId,
      pickerRows,
      savedSites,
      readingsBySiteId,
      namesBySite.get(siteId) ?? siteId
    )
  );

/**
 * The Comparison tab body: a cohort-scoped location multi-select, a single
 * named saved comparison per group (auto-loaded on open, updated in place on
 * save), and the latest-readings comparison table underneath.
 *
 * Selection state is local to this component; the saved comparison persists
 * the chosen sites. The most recent saved comparison auto-loads once per
 * group when the picker is empty (the "come back and see them loaded"
 * behavior); switching groups drops any stale selection immediately.
 */
export const ComparisonView: React.FC<ComparisonViewProps> = ({
  groupId,
  className,
  isOrganizationFlow = false,
  organizationSlug,
}) => {
  const { user } = useUser();
  const resolvedUserId = user?.id ?? '';
  const resolvedGroupId = groupId ?? '';

  const dispatch = useDispatch();
  const {
    comparisons,
    isLoading: savedListLoading,
    isMutating,
    error: savedListError,
    createComparison,
    updateComparison,
    deleteComparison,
  } = useSavedComparisons({ groupId: resolvedGroupId });

  // Current picker selection. Syncs from a loaded comparison exactly once per
  // group (after the saved list resolves) — afterwards the user's in-progress
  // edits are never clobbered by background refetches.
  const [pickerIds, setPickerIds] = useState<string[]>([]);
  const syncedGroupRef = useRef<string | null>(null);
  // Group the current picker selection belongs to. Differs from the active
  // group only in the brief window after a group switch, before the selection
  // is dropped.
  const selectionGroupRef = useRef<string>(resolvedGroupId);
  // The group whose mutations are still "in flight". Captured before each await
  // so a completion belonging to a departed group can be discarded.
  const activeGroupRef = useRef(resolvedGroupId);

  // The currently-loaded saved comparison (drives dirty check + save mode).
  const [loadedComparison, setLoadedComparison] =
    useState<SavedComparison | null>(null);

  // Group-scoped sync. Order matters:
  // 1. A selection belonging to a previous group is dropped IMMEDIATELY (even
  //    while the saved list is still loading), so no readings request can
  //    fire for the old group's sites under the new group, and no stale rows
  //    are ever rendered.
  // 2. Once per group, after the saved list resolves, if the picker is empty
  //    and saved comparisons exist — load the most recent one (first in the
  //    already-sorted-by-updated_at list). An in-progress selection wins over
  //    auto-load and marks the group synced so a later refetch never
  //    clobbers it.
  useEffect(() => {
    const group = resolvedGroupId;
    activeGroupRef.current = group;
    if (selectionGroupRef.current !== group) {
      selectionGroupRef.current = group;
      setPickerIds([]);
      setLoadedComparison(null);
      // A dialog opened for a record in the previous group must not survive
      // into the new group (AGENTS.md group-switch guard).
      setPendingDelete(null);
      // Clear picker rows so stale group-A rows never bleed into a group-B
      // save snapshot.
      pickerRowsRef.current = new Map();
      // Reset the resolved-list guard so the picker re-resolves fresh for
      // the new group.
      resolvedPickerSitesRef.current = '';
      setResolvedPickerSites([]);
      return;
    }
    if (savedListLoading) return;
    if (syncedGroupRef.current === group) return;
    if (pickerIds.length > 0) {
      syncedGroupRef.current = group;
      return;
    }
    if (comparisons.length > 0) {
      const mostRecent = comparisons[0];
      selectionGroupRef.current = group;
      setPickerIds(mostRecent.site_ids);
      setLoadedComparison(mostRecent);
    }
    syncedGroupRef.current = group;
  }, [savedListLoading, resolvedGroupId, comparisons, pickerIds.length]);

  // Cohort rows seen by the picker — used to build full site snapshots for
  // the save payload without prop-drilling the picker's internal fetch.
  const pickerRowsRef = useRef(new Map<string, NormalizedSiteData>());
  const resolvedPickerSitesRef = useRef<string>('');
  const [resolvedPickerSites, setResolvedPickerSites] = useState<
    NormalizedSiteData[]
  >([]);
  const handleSitesResolved = useCallback((sites: NormalizedSiteData[]) => {
    sites.forEach(site => pickerRowsRef.current.set(site.id, site));
    // Guard: only update state when the set of site IDs actually changes,
    // preventing an infinite render loop when the child re-fires its effect.
    const key = sites.map(s => s.id).join(',');
    if (key !== resolvedPickerSitesRef.current) {
      resolvedPickerSitesRef.current = key;
      setResolvedPickerSites(sites);
    }
  }, []);

  // Manual picker edits belong to the active group — this both keeps the
  // group-scoped sync honest and lets the sync effect drop the selection when
  // the group changes.
  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      selectionGroupRef.current = resolvedGroupId;
      setPickerIds(ids);
    },
    [resolvedGroupId]
  );

  // Live preview: the query follows the current selection, not the saved one.
  const {
    readings,
    isLoading: readingsLoading,
    error: readingsError,
    refetch: refetchReadings,
  } = useRecentReadings({
    userId: resolvedUserId,
    groupId: resolvedGroupId,
    siteIds: pickerIds,
  });

  const { config: pm25Config } = useAqiConfig('pm2_5');
  const { config: pm10Config } = useAqiConfig('pm10');

  const [legendPollutant, setLegendPollutant] = useState<AqiPollutant>('pm2_5');

  const readingsBySiteId = useMemo(() => {
    const map = new Map<string, RecentReading>();
    readings.forEach(reading => {
      if (!map.has(reading.site_id)) map.set(reading.site_id, reading);
    });
    return map;
  }, [readings]);

  // Display names for off-page selections and no-data rows: picker rows first
  // (highest priority), then the loaded comparison snapshot, then reading
  // payloads (self-contained).
  const namesBySite = useMemo(() => {
    const map = new Map<string, string>();
    resolvedPickerSites.forEach(site => {
      const name = site.location;
      if (name && !map.has(site.id)) map.set(site.id, name);
    });
    loadedComparison?.sites.forEach(site => {
      const name = site.location ?? site.name;
      if (name && !map.has(site.id)) map.set(site.id, name);
    });
    readings.forEach(reading => {
      if (reading.siteDetails && !map.has(reading.site_id)) {
        map.set(
          reading.site_id,
          getComparisonSiteDisplayName(reading.siteDetails)
        );
      }
    });
    return map;
  }, [readings, loadedComparison, resolvedPickerSites]);

  // Per-site series colors keyed by site id, in picker order — shared across
  // the picker chips, the comparison table rows and the trend chart so a given
  // location renders in one consistent color everywhere.
  const siteColorBySiteId = useMemo(() => {
    const map = new Map<string, string>();
    pickerIds.forEach((siteId, index) => {
      map.set(siteId, getDefaultSiteColor(index));
    });
    return map;
  }, [pickerIds]);

  // One honest row per selected location — missing readings render as
  // "No reading", they are never omitted.
  const rows = useMemo<ComparisonRow[]>(
    () =>
      pickerIds.map(siteId => {
        const reading = readingsBySiteId.get(siteId);
        return reading
          ? buildComparisonRow(reading)
          : buildEmptyComparisonRow(siteId, namesBySite.get(siteId) ?? siteId);
      }),
    [namesBySite, pickerIds, readingsBySiteId]
  );

  // Dirty: the picker differs from the loaded comparison's site_ids
  // (order-insensitive), OR nothing is loaded yet and the picker is non-empty.
  const isDirty = useMemo(() => {
    const loadedIds = loadedComparison?.site_ids ?? [];
    if (pickerIds.length !== loadedIds.length) return true;
    const loadedSet = new Set(loadedIds);
    return pickerIds.some(siteId => !loadedSet.has(siteId));
  }, [pickerIds, loadedComparison]);

  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedDropdownOpen, setSavedDropdownOpen] = useState(false);
  // The comparison targeted for deletion via the per-row trash icon or the
  // "Delete saved comparison" button. null when no delete is pending.
  const [pendingDelete, setPendingDelete] = useState<SavedComparison | null>(
    null
  );
  const router = useRouter();
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const flashSavedIndicator = useCallback(() => {
    setShowSavedIndicator(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(
      () => setShowSavedIndicator(false),
      SAVED_INDICATOR_MS
    );
  }, []);

  // PATCH update of the loaded comparison with new site_ids + sites snapshot.
  const updateLoadedComparison = useCallback(
    async (snapshot: SavedComparisonSite[]): Promise<boolean> => {
      if (!loadedComparison) return false;
      const groupAtStart = activeGroupRef.current;
      const updated = await updateComparison(loadedComparison.id, {
        site_ids: pickerIds,
        sites: snapshot,
      });
      // The mutation belonged to a group the user has left — its result must
      // never restore group-A state into the current group (AGENTS.md).
      if (activeGroupRef.current !== groupAtStart) return false;
      if (updated) {
        setLoadedComparison(updated);
        return true;
      }
      return false;
    },
    [loadedComparison, pickerIds, updateComparison]
  );

  const handleSaveSelection = useCallback(async () => {
    if (!isDirty) return;

    // Loaded comparison + EMPTY selection (user cleared it) — the save button
    // becomes "Delete saved comparison". Opening the delete confirmation dialog
    // (which issues DELETE, never PATCHes an empty list — the backend rejects
    // empty site_ids with 400).
    if (loadedComparison && pickerIds.length === 0) {
      setPendingDelete(loadedComparison);
      return;
    }

    const groupAtStart = activeGroupRef.current;

    // Loaded comparison + non-empty selection — PATCH its site_ids/sites,
    // keep the name unchanged. site_ids is guaranteed 1..80 because the
    // selection is non-empty.
    if (loadedComparison) {
      setSaveError(null);
      const snapshot = buildComparisonSitesSnapshot(
        pickerIds,
        pickerRowsRef.current,
        loadedComparison.sites,
        readingsBySiteId,
        namesBySite
      );
      const updated = await updateLoadedComparison(snapshot);
      // The save belonged to a group the user has left — don't flash "Saved"
      // or surface a misleading error for a departed group (AGENTS.md).
      if (activeGroupRef.current !== groupAtStart) return;
      if (updated) {
        flashSavedIndicator();
      } else {
        setSaveError(
          'Failed to save your selection. Please check your connection and try again.'
        );
      }
      return;
    }

    // No loaded comparison yet and nothing selected — there is nothing to
    // persist (an empty selection with no loaded comparison is a no-op).
    if (pickerIds.length === 0) return;

    // No loaded comparison yet — open the name dialog to create a new one.
    setSaveName('My comparison');
    setSaveDialogOpen(true);
  }, [
    isDirty,
    pickerIds,
    loadedComparison,
    readingsBySiteId,
    namesBySite,
    flashSavedIndicator,
    updateLoadedComparison,
  ]);

  // Loads a saved comparison from the dropdown: sync the picker to its sites,
  // mark it loaded, and arm the group-sync refs so the one-time auto-load
  // effect can never clobber the manual choice.
  const handleLoadComparison = useCallback(
    (comparison: SavedComparison) => {
      setPickerIds(comparison.site_ids.filter(Boolean));
      setLoadedComparison(comparison);
      selectionGroupRef.current = resolvedGroupId;
      syncedGroupRef.current = resolvedGroupId;
      setSavedDropdownOpen(false);
    },
    [resolvedGroupId]
  );

  const handleRequestDelete = useCallback((comparison: SavedComparison) => {
    // Close the dropdown first: its content has a higher z-index than the
    // delete confirmation dialog and would otherwise overlap it.
    setSavedDropdownOpen(false);
    setPendingDelete(comparison);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const target = pendingDelete;
    if (!target) return;
    // Never delete a record belonging to a different group than the one
    // currently active — a dialog opened in group A can outlive the switch
    // to group B (AGENTS.md: invalidation on group switch; never resolve a
    // stale group's mutation into the current group).
    if (target.group_id !== activeGroupRef.current) {
      setPendingDelete(null);
      return;
    }
    setPendingDelete(null);
    setSaveError(null);
    const id = target.id;
    const wasLoaded = loadedComparison?.id === id;
    const groupAtStart = activeGroupRef.current;
    const success = await deleteComparison(id);
    // The delete belonged to a group the user has left — set NO state and show
    // no toast/error for the departed group (AGENTS.md group-switch guard).
    if (activeGroupRef.current !== groupAtStart) return;
    if (success) {
      toast.success(
        'Saved comparison deleted',
        `"${target.name}" was removed from your saved comparisons.`
      );
      if (wasLoaded) setLoadedComparison(null);
    } else {
      toast.error(
        'Failed to delete comparison',
        'Please check your connection and try again.'
      );
    }
  }, [deleteComparison, loadedComparison, pendingDelete]);

  const handleViewInsights = useCallback(
    (row: ComparisonRow) => {
      const reading = readingsBySiteId.get(row.siteId);
      const siteDetails = reading?.siteDetails;
      const site: SelectedSite = {
        _id: row.siteId,
        name: row.siteName,
        search_name: siteDetails?.search_name || undefined,
        country: siteDetails?.country || undefined,
        city: siteDetails?.city || undefined,
        region: siteDetails?.region || undefined,
      };
      dispatch(openMoreInsights({ sites: [site] }));
    },
    [readingsBySiteId, dispatch]
  );

  const handleConfirmSave = useCallback(async () => {
    // Block saving an empty selection — the picker may have been cleared by a
    // group switch while the dialog was open.
    if (!saveName.trim() || pickerIds.length === 0) return;
    setSaveDialogOpen(false);
    setSaveError(null);
    const snapshot = buildComparisonSitesSnapshot(
      pickerIds,
      pickerRowsRef.current,
      loadedComparison?.sites ?? [],
      readingsBySiteId,
      namesBySite
    );
    const groupAtStart = activeGroupRef.current;
    const created = await createComparison({
      group_id: resolvedGroupId,
      name: saveName.trim(),
      site_ids: pickerIds,
      sites: snapshot,
    });
    // The save belonged to a group the user has left — its result must never
    // restore group-A state into the current group (AGENTS.md).
    if (activeGroupRef.current !== groupAtStart) return;
    if (created) {
      setLoadedComparison(created);
      flashSavedIndicator();
    } else {
      setSaveError(
        'Failed to save your comparison. Please check your connection and try again.'
      );
    }
  }, [
    saveName,
    pickerIds,
    loadedComparison,
    readingsBySiteId,
    namesBySite,
    resolvedGroupId,
    createComparison,
    flashSavedIndicator,
  ]);

  const isSaving = isMutating;

  // Exports the latest-readings table as CSV — closed over `rows`, so the
  // table stays presentational (no data plumbing, just the trigger).
  const handleExport = useCallback(() => {
    downloadComparisonCsv(rows);
  }, [rows]);

  // Clicking a site opens its details in a sub-route (Data Export pattern):
  // write the slug index so the details page resolves instantly and exactly,
  // then navigate with the authoritative site id.
  const handleSiteClick = useCallback(
    (row: ComparisonRow) => {
      const slug = toSiteSlug(row.siteName);
      rememberSiteSlug(slug, {
        siteId: row.siteId,
        displayName: row.siteName,
      });
      // In the organization flow the site details live under the org
      // data-export route, not the user route — keep the user bounded to
      // their own analytics. When the org slug is still resolving (empty),
      // do not fall through to the user-flow URL — that would leak an org
      // click into the user's own analytics route.
      if (isOrganizationFlow && !organizationSlug) return;
      const base =
        isOrganizationFlow && organizationSlug
          ? `/org/${organizationSlug}/data-export/sites`
          : '/user/air-quality/analytics/sites';
      void router.push(
        `${base}/${slug}?site_id=${encodeURIComponent(row.siteId)}`
      );
    },
    [router, isOrganizationFlow, organizationSlug]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section header: description + save controls */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-medium text-foreground">
            Compare locations
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pick locations to compare their latest air-quality readings side by
            side. Save your selection to keep it for next time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveError && (
            <span className="text-xs text-destructive" role="alert">
              {saveError}
            </span>
          )}
          {savedListError && !saveError && (
            <span className="text-xs text-destructive" role="alert">
              {savedListError}
            </span>
          )}
          {!saveError && loadedComparison && (
            <span
              role="status"
              className={cn(
                'text-xs font-medium',
                showSavedIndicator
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
              title={
                showSavedIndicator
                  ? undefined
                  : 'Your saved comparison for this group, loaded automatically'
              }
            >
              {showSavedIndicator
                ? 'Saved'
                : `Saved · ${loadedComparison.name}`}
            </span>
          )}
          <DropdownMenu
            open={savedDropdownOpen}
            onOpenChange={setSavedDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outlined"
                size="sm"
                Icon={AqChevronDown}
                iconPosition="end"
                aria-haspopup="menu"
              >
                Saved comparisons
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[260px]">
              {savedListLoading && comparisons.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Loading saved comparisons…
                </p>
              ) : comparisons.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  No saved comparisons yet
                </p>
              ) : (
                comparisons.map(comparison => {
                  const isLoaded = loadedComparison?.id === comparison.id;
                  return (
                    <div
                      key={comparison.id}
                      className="flex items-center gap-1"
                    >
                      <DropdownMenuItem
                        onClick={() => handleLoadComparison(comparison)}
                        className="flex flex-1 items-center justify-between gap-2"
                      >
                        <span className="truncate">{comparison.name}</span>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                          {comparison.site_ids.length}
                          {isLoaded && (
                            <HiCheck className="h-3.5 w-3.5 text-primary" />
                          )}
                        </span>
                      </DropdownMenuItem>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleRequestDelete(comparison);
                        }}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        aria-label={`Delete saved comparison ${comparison.name}`}
                      >
                        <AqTrash01 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
              {pickerIds.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSaveName(
                        `My comparison${comparisons.length > 0 ? ` ${comparisons.length + 1}` : ''}`
                      );
                      setSaveDialogOpen(true);
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <AqPlus className="h-3.5 w-3.5" />
                      Save as new comparison…
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="filled"
            size="sm"
            onClick={() => void handleSaveSelection()}
            disabled={
              !isDirty ||
              (pickerIds.length === 0 && !loadedComparison) ||
              isSaving
            }
            loading={isSaving}
          >
            {loadedComparison && pickerIds.length === 0
              ? 'Delete saved comparison'
              : 'Save selection'}
          </Button>
        </div>
      </div>

      <ComparisonSitePicker
        groupId={resolvedGroupId}
        selectedSiteIds={pickerIds}
        onSelectionChange={handleSelectionChange}
        namesBySite={namesBySite}
        siteColorBySiteId={siteColorBySiteId}
        onSitesResolved={handleSitesResolved}
      />

      <ComparisonTableView
        rows={rows}
        isLoading={readingsLoading}
        error={readingsError?.message ?? null}
        hasSelection={pickerIds.length > 0}
        onRetry={refetchReadings}
        pm25Config={pm25Config}
        pm10Config={pm10Config}
        onSiteClick={handleSiteClick}
        onViewInsights={handleViewInsights}
        onExport={handleExport}
        siteColorBySiteId={siteColorBySiteId}
      />

      <div className="flex flex-col items-center gap-3 pt-2">
        <SegmentedTabs
          options={[
            { value: 'pm2_5' as AqiPollutant, label: 'PM2.5' },
            { value: 'pm10' as AqiPollutant, label: 'PM10' },
          ]}
          value={legendPollutant}
          onChange={setLegendPollutant}
          ariaLabel="AQI legend pollutant"
          size="sm"
        />
        <AqiLegend
          aqiConfig={legendPollutant === 'pm2_5' ? pm25Config : pm10Config}
        />
      </div>

      {/* Name dialog for creating a new saved comparison */}
      <ReusableDialog
        isOpen={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        title="Save comparison"
        subtitle="Give this location set a name so you can load it again later."
        size="sm"
        primaryAction={{
          label: 'Save',
          onClick: () => void handleConfirmSave(),
          disabled: !saveName.trim() || pickerIds.length === 0,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setSaveDialogOpen(false),
        }}
      >
        <Input
          label="Comparison name"
          value={saveName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSaveName(e.target.value)
          }
          placeholder="My comparison"
        />
      </ReusableDialog>

      {/* Delete-saved-comparison confirmation */}
      <ReusableDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete saved comparison?"
        size="sm"
        primaryAction={{
          label: 'Delete',
          onClick: () => void handleConfirmDelete(),
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setPendingDelete(null),
        }}
      >
        <p className="text-sm text-muted-foreground">
          This will permanently delete the saved comparison{' '}
          <span className="font-medium text-foreground">
            {pendingDelete?.name}
          </span>
          . This action cannot be undone.
        </p>
      </ReusableDialog>

      <MoreInsights activeTab="sites" />

      {/* MoreInsights' "Add Location" action pushes the add-location dialog
          onto the Redux stack; this mount is what renders it in the
          Comparison tab (mirrors DataExportPage's pairing). */}
      <AddLocation />
    </div>
  );
};
