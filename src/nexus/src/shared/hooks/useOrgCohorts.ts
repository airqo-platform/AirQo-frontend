'use client';

import useSWR, { mutate } from 'swr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deviceService } from '../services/deviceService';
import { useGroupCohorts } from './useDevice';
import { normalizeCohortIds } from '../utils/cohortUtils';
import { isAbortError } from '../lib/retryPolicy';
import type { CohortSummary } from '../types/api';

export interface OrgCohortOption {
  id: string;
  name: string;
  visibility?: boolean;
}

/**
 * One summary request per unique id set. The key is the SORTED comma-joined
 * ids, so a group switch (different ids) can never resolve group A's cached
 * names into group B's key, and repeated mounts of the same id set dedupe
 * into a single request.
 */
const COHORTS_SUMMARY_SWR_OPTIONS = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  dedupingInterval: 5000,
} as const;

const buildCohortsSummaryKey = (
  cohortIds: string[]
): [string, string] | null =>
  cohortIds.length > 0
    ? ['cohorts/summary', [...cohortIds].sort().join(',')]
    : null;

// Resolves display names for a known cohort id set via ONE
// /devices/cohorts/summary call (JWT path).
export const useCohortsSummary = (cohortIds: string[], enabled = true) => {
  const key = useMemo(
    () => (enabled ? buildCohortsSummaryKey(cohortIds) : null),
    [enabled, cohortIds]
  );

  // Abort the previous in-flight request when a new fetch supersedes it
  // (same pattern as useDevice's useAbortableFetcher — no abort on unmount,
  // SWR shares one in-flight request between subscribers).
  const abortRef = useRef<AbortController | null>(null);
  const fetcher = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      return await deviceService.getCohortsSummary(
        cohortIds,
        controller.signal
      );
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [cohortIds]);

  const result = useSWR<CohortSummary[]>(
    key,
    fetcher,
    COHORTS_SUMMARY_SWR_OPTIONS
  );

  return {
    ...result,
    error: isAbortError(result.error) ? null : result.error,
  };
};

export interface UseOrgCohortsResult {
  /** Cohorts of the group, in backend order, with resolved names. */
  cohorts: OrgCohortOption[];
  cohortIds: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const toErrorMessage = (error: unknown, fallback: string): string | null => {
  if (!error) return null;
  return error instanceof Error && error.message ? error.message : fallback;
};

/**
 * Organization-flow cohort source: resolves the group's cohort ids and their
 * display names with two SWR requests (group cohorts + one summary call).
 * Both keys are group/id-scoped, so a fast group switch never serves stale
 * names. Abort errors are normalized to null (cancelled ≠ failure).
 */
export const useOrgCohorts = (
  groupId: string,
  enabled = true
): UseOrgCohortsResult => {
  const groupEnabled = enabled && !!groupId;

  const {
    data: groupCohorts,
    isLoading: idsLoading,
    error: groupCohortsError,
  } = useGroupCohorts(groupId, groupEnabled);

  const cohortIds = useMemo(
    () => normalizeCohortIds(groupCohorts?.data ?? []),
    [groupCohorts?.data]
  );

  const {
    data: summaries,
    isLoading: summaryLoading,
    error: summaryError,
  } = useCohortsSummary(cohortIds, groupEnabled && cohortIds.length > 0);

  const summaryById = useMemo(() => {
    const map = new Map<string, CohortSummary>();
    for (const summary of summaries ?? []) {
      map.set(summary._id, summary);
    }
    return map;
  }, [summaries]);

  const cohorts = useMemo<OrgCohortOption[]>(
    () =>
      cohortIds.map(id => {
        const summary = summaryById.get(id);
        return {
          id,
          name: summary?.name ?? '',
          ...(summary?.visibility !== undefined
            ? { visibility: summary.visibility }
            : {}),
        };
      }),
    [cohortIds, summaryById]
  );

  const resolvedIdsError = isAbortError(groupCohortsError)
    ? null
    : groupCohortsError;
  const error = resolvedIdsError
    ? toErrorMessage(
        resolvedIdsError,
        'The organization cohorts could not be loaded.'
      )
    : toErrorMessage(summaryError, 'The cohort details could not be loaded.');

  // Loader-derived (not `groupEnabled`-gated): a cleared/disabled group must
  // keep reporting loading while a previous request is still in flight.
  const isLoading = idsLoading || (cohortIds.length > 0 && summaryLoading);

  const refetch = useCallback(() => {
    if (!groupEnabled) {
      return;
    }
    void mutate(['group/cohorts', groupId]);
    const summaryKey = buildCohortsSummaryKey(cohortIds);
    if (summaryKey) {
      void mutate(summaryKey);
    }
  }, [groupEnabled, groupId, cohortIds]);

  return { cohorts, cohortIds, isLoading, error, refetch };
};

const COHORT_SELECTION_STORAGE_PREFIX = 'nexus:org:cohort:';

const readStoredCohortId = (groupId: string): string | null => {
  if (!groupId || typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(
      `${COHORT_SELECTION_STORAGE_PREFIX}${groupId}`
    );
    return typeof stored === 'string' && stored ? stored : null;
  } catch {
    // localStorage unavailable (private mode / quota) — selection just
    // doesn't persist.
    return null;
  }
};

const storeCohortId = (groupId: string, cohortId: string): void => {
  if (!groupId || typeof window === 'undefined') {
    return;
  }
  try {
    if (cohortId) {
      window.localStorage.setItem(
        `${COHORT_SELECTION_STORAGE_PREFIX}${groupId}`,
        cohortId
      );
    } else {
      window.localStorage.removeItem(
        `${COHORT_SELECTION_STORAGE_PREFIX}${groupId}`
      );
    }
  } catch {
    // Best effort only.
  }
};

export interface UseOrgCohortSelectionResult {
  selectedCohortId: string;
  selectCohort: (cohortId: string) => void;
}

/**
 * Per-group cohort selection, persisted under
 * `nexus:org:cohort:{groupId}`. Auto-selects the stored id while it is still
 * valid, else the first cohort; clears when the id set is empty. Single-cohort
 * only — there is no "all cohorts" option.
 */
export const useOrgCohortSelection = (
  groupId: string,
  cohortIds: string[]
): UseOrgCohortSelectionResult => {
  const [selectedCohortId, setSelectedCohortId] = useState('');

  const cohortIdsKey = cohortIds.join(',');
  useEffect(() => {
    if (cohortIds.length === 0) {
      setSelectedCohortId('');
      return;
    }
    // Re-read storage on group/id-set change so a stored selection for the
    // new group wins over whatever was selected for the previous one.
    const stored = readStoredCohortId(groupId) ?? '';
    setSelectedCohortId(cohortIds.includes(stored) ? stored : cohortIds[0]);
    // Cohort ids are content-addressed by `cohortIdsKey`; depending on the
    // array identity would re-run this on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, cohortIdsKey]);

  const selectCohort = useCallback(
    (cohortId: string) => {
      setSelectedCohortId(cohortId);
      storeCohortId(groupId, cohortIds.includes(cohortId) ? cohortId : '');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupId, cohortIdsKey]
  );

  return { selectedCohortId, selectCohort };
};
