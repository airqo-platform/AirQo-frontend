'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { useUser } from '@/shared/hooks/useUser';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';
import type { NormalizedSiteData, RawSiteData } from '@/shared/utils/siteUtils';
import type { RecentReading, Site } from '@/shared/types/api';
import { useComparisonSelection } from '../../hooks/useComparisonSelection';
import { useRecentReadings } from '../../hooks/useRecentReadings';
import {
  buildComparisonRow,
  buildEmptyComparisonRow,
  type ComparisonRow,
} from '../../utils/comparisonRows';
import { ComparisonSitePicker } from './ComparisonSitePicker';
import { ComparisonTableView } from './ComparisonTableView';

interface ComparisonViewProps {
  /** Organization group id; empty in the user flow (uses the active group). */
  groupId?: string;
  className?: string;
}

const SAVED_INDICATOR_MS = 1500;

const toFiniteNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

/**
 * Builds the persisted `Site` shape for a selected id, mirroring what the
 * favorites dialog saves (add-favorites.tsx): real display name plus geo
 * when the source row carries it. Sources, best-first: the cohort picker's
 * loaded rows, the saved preference payload, the reading payload's embedded
 * siteDetails. Falls back to a minimal `{_id, search_name}` so a save never
 * silently drops a selected id.
 */
const buildSiteForSave = (
  siteId: string,
  pickerRows: Map<string, NormalizedSiteData>,
  savedSites: Site[],
  readingsBySiteId: Map<string, RecentReading>,
  fallbackName: string
): Site => {
  const pickerRow = pickerRows.get(siteId);
  if (pickerRow) {
    const raw: RawSiteData = pickerRow._raw ?? { _id: pickerRow.id };
    return {
      _id: pickerRow.id,
      name: pickerRow.location,
      search_name: pickerRow.location,
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
      approximate_latitude: toFiniteNumber(raw.approximate_latitude),
      approximate_longitude: toFiniteNumber(raw.approximate_longitude),
    };
  }

  const savedSite = savedSites.find(site => site._id === siteId);
  if (savedSite) return savedSite;

  const siteDetails = readingsBySiteId.get(siteId)?.siteDetails;
  if (siteDetails) {
    return {
      _id: siteId,
      search_name: getSiteDisplayName(siteDetails),
      name: siteDetails.name || undefined,
      city: siteDetails.city || undefined,
      country: siteDetails.country || undefined,
      approximate_latitude: toFiniteNumber(siteDetails.approximate_latitude),
      approximate_longitude: toFiniteNumber(siteDetails.approximate_longitude),
    };
  }

  return { _id: siteId, search_name: fallbackName };
};

/**
 * The Comparison tab body: a cohort-scoped location multi-select, an explicit
 * "Save selection" action (persisted to the shared `selected_sites`
 * preference — same list as favorites), and the latest-readings comparison
 * table underneath.
 *
 * The recent-readings query fires on the CURRENT picker selection (live
 * preview); only "Save selection" persists it. Until the group's preference
 * has loaded, nothing is pre-checked and saving is disabled — no flash of an
 * empty selection masquerading as "no locations saved".
 */
export const ComparisonView: React.FC<ComparisonViewProps> = ({
  groupId,
  className,
}) => {
  const { user } = useUser();
  const resolvedUserId = user?.id ?? '';
  const resolvedGroupId = groupId ?? '';

  const {
    savedSiteIds,
    savedSites,
    isInitialLoading,
    isSaving,
    error: saveError,
    save,
  } = useComparisonSelection({
    groupId: resolvedGroupId,
    userId: resolvedUserId,
  });

  // Current picker selection. Syncs from the persisted preference exactly
  // once per group (after the preference loads, or immediately on a group
  // switch) — afterwards the user's in-progress edits are never clobbered by
  // background preference refetches.
  const [pickerIds, setPickerIds] = useState<string[]>([]);
  const syncedGroupRef = useRef<string | null>(null);

  useEffect(() => {
    if (isInitialLoading) return;
    const group = resolvedGroupId;
    if (syncedGroupRef.current !== group) {
      syncedGroupRef.current = group;
      setPickerIds(savedSiteIds);
    }
  }, [isInitialLoading, resolvedGroupId, savedSiteIds]);

  // Cohort rows seen by the picker — used to build full Site objects for the
  // save payload without prop-drilling the picker's internal fetch.
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

  const readingsBySiteId = useMemo(() => {
    const map = new Map<string, RecentReading>();
    readings.forEach(reading => {
      if (!map.has(reading.site_id)) map.set(reading.site_id, reading);
    });
    return map;
  }, [readings]);

  // Display names for off-page selections and no-data rows: picker rows
  // first (highest priority — knows the name for newly-picked sites), then
  // saved preference payload, then reading payloads (self-contained).
  const namesBySite = useMemo(() => {
    const map = new Map<string, string>();
    resolvedPickerSites.forEach(site => {
      const name = site.location;
      if (name && !map.has(site.id)) map.set(site.id, name);
    });
    savedSites.forEach(site => {
      const name =
        site.search_name ||
        site.name ||
        site.formatted_name ||
        site.generated_name;
      if (name && !map.has(site._id)) map.set(site._id, name);
    });
    readings.forEach(reading => {
      if (reading.siteDetails && !map.has(reading.site_id)) {
        map.set(reading.site_id, getSiteDisplayName(reading.siteDetails));
      }
    });
    return map;
  }, [readings, savedSites, resolvedPickerSites]);

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

  const isDirty = useMemo(() => {
    if (isInitialLoading) return false;
    if (pickerIds.length !== savedSiteIds.length) return true;
    const savedSet = new Set(savedSiteIds);
    return pickerIds.some(siteId => !savedSet.has(siteId));
  }, [isInitialLoading, pickerIds, savedSiteIds]);

  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const handleSaveSelection = useCallback(async () => {
    if (!isDirty || isSaving) return;

    const sitesToSave = pickerIds.map(siteId =>
      buildSiteForSave(
        siteId,
        pickerRowsRef.current,
        savedSites,
        readingsBySiteId,
        namesBySite.get(siteId) ?? siteId
      )
    );

    const succeeded = await save(sitesToSave);
    if (succeeded) {
      setShowSavedIndicator(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(
        () => setShowSavedIndicator(false),
        SAVED_INDICATOR_MS
      );
    }
  }, [
    isDirty,
    isSaving,
    namesBySite,
    pickerIds,
    readingsBySiteId,
    save,
    savedSites,
  ]);

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
          {showSavedIndicator && !saveError && (
            <span
              className="text-xs font-medium text-green-600 dark:text-green-400"
              role="status"
            >
              Saved
            </span>
          )}
          <Button
            variant="filled"
            size="sm"
            onClick={() => void handleSaveSelection()}
            disabled={!isDirty || isSaving || isInitialLoading}
            loading={isSaving}
          >
            Save selection
          </Button>
        </div>
      </div>

      <ComparisonSitePicker
        groupId={resolvedGroupId}
        selectedSiteIds={pickerIds}
        onSelectionChange={setPickerIds}
        namesBySite={namesBySite}
        onSitesResolved={handleSitesResolved}
      />

      <ComparisonTableView
        rows={rows}
        isLoading={readingsLoading}
        error={readingsError?.message ?? null}
        hasSelection={pickerIds.length > 0}
        onRetry={refetchReadings}
      />
    </div>
  );
};
