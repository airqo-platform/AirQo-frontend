'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { useUser } from '@/shared/hooks/useUser';
import { comparisonsService } from '@/shared/services/comparisonsService';
import type {
  CreateSavedComparisonRequest,
  SavedComparison,
  UpdateSavedComparisonRequest,
} from '@/shared/types/api';

export interface UseSavedComparisonsOptions {
  groupId?: string;
  enabled?: boolean;
}

export interface UseSavedComparisonsResult {
  comparisons: SavedComparison[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  refresh: () => void;
  createComparison: (
    payload: CreateSavedComparisonRequest
  ) => Promise<SavedComparison | null>;
  renameComparison: (
    comparisonId: string,
    name: string
  ) => Promise<SavedComparison | null>;
  updateComparison: (
    comparisonId: string,
    payload: UpdateSavedComparisonRequest
  ) => Promise<SavedComparison | null>;
  deleteComparison: (comparisonId: string) => Promise<boolean>;
}

/**
 * The SWR key for the saved-comparisons list. Group-scoped so a request for
 * group A never resolves into group B's cache (AGENTS.md).
 */
export const buildSavedComparisonsKey = (
  groupId: string | undefined
): string[] => ['saved-comparisons', groupId ?? 'no-active-group'];

// Fetch once per group, revalidate after mutations (mutate()), and never
// refetch on remount while cached data exists. There is no staleTime: SWR
// revalidates stale keys on mount by default, so revalidateIfStale:false is
// what actually suppresses the remount refetch.
const SWR_STABLE_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  shouldRetryOnError: false,
  dedupingInterval: 10000,
} as const;

const sortByUpdatedAtDesc = (
  comparisons: SavedComparison[]
): SavedComparison[] =>
  [...comparisons].sort((a, b) => {
    const timeA = a.updated_at ? new Date(a.updated_at).getTime() : NaN;
    const timeB = b.updated_at ? new Date(b.updated_at).getTime() : NaN;
    // Missing/invalid dates sink to the bottom.
    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;
    return timeB - timeA;
  });

const logMutationFailure = (operation: string, error: unknown): void => {
  // Only the numeric status code is whitelisted for logs — never the error
  // message/data, which can carry sensitive API payload content (AGENTS.md).
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : undefined;
  if (status === undefined) {
    console.error(`Failed to ${operation} comparison`);
  } else {
    console.error(`Failed to ${operation} comparison`, { status });
  }
};

/**
 * SWR-backed saved-comparisons list for the active group, plus sanitized
 * mutation wrappers. Errors are surfaced as message-only strings — never raw
 * axios errors (AGENTS.md: tokens/auth headers must never reach the UI).
 */
export const useSavedComparisons = ({
  groupId,
  enabled = true,
}: UseSavedComparisonsOptions): UseSavedComparisonsResult => {
  const { user } = useUser();
  const userId = user?.id ?? '';

  const shouldFetch = enabled && !!groupId && !!userId;

  const key = useMemo(
    () => (shouldFetch ? buildSavedComparisonsKey(groupId) : null),
    [shouldFetch, groupId]
  );

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Abort the previous group's in-flight list request when the group
    // changes or the hook unmounts — a group-A response must never resolve
    // after the group-B query starts (AGENTS.md).
    return () => abortRef.current?.abort();
  }, [groupId]);

  const fetcher = useCallback(async (): Promise<SavedComparison[]> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await comparisonsService.list(
        { group_id: groupId as string, limit: 100 },
        controller.signal
      );
      return sortByUpdatedAtDesc(response.comparisons ?? []);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [groupId]);

  const { data, error, isLoading, mutate } = useSWR(
    key,
    fetcher,
    SWR_STABLE_OPTIONS
  );

  const [isMutating, setIsMutating] = useState(false);

  const createComparison = useCallback(
    async (
      payload: CreateSavedComparisonRequest
    ): Promise<SavedComparison | null> => {
      setIsMutating(true);
      try {
        const response = await comparisonsService.create(payload);
        await mutate();
        return response.comparison;
      } catch (err) {
        logMutationFailure('create', err);
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  const renameComparison = useCallback(
    async (
      comparisonId: string,
      name: string
    ): Promise<SavedComparison | null> => {
      setIsMutating(true);
      try {
        const response = await comparisonsService.update(comparisonId, {
          name,
        } as UpdateSavedComparisonRequest);
        await mutate();
        return response.comparison;
      } catch (err) {
        logMutationFailure('rename', err);
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  const updateComparison = useCallback(
    async (
      comparisonId: string,
      payload: UpdateSavedComparisonRequest
    ): Promise<SavedComparison | null> => {
      setIsMutating(true);
      try {
        const response = await comparisonsService.update(comparisonId, payload);
        await mutate();
        return response.comparison;
      } catch (err) {
        logMutationFailure('update', err);
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  const deleteComparison = useCallback(
    async (comparisonId: string): Promise<boolean> => {
      setIsMutating(true);
      try {
        const response = await comparisonsService.remove(comparisonId);
        if (response.success) {
          await mutate();
        }
        return response.success;
      } catch (err) {
        logMutationFailure('delete', err);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  return {
    comparisons: data ?? [],
    isLoading,
    isMutating,
    error: error ? 'Failed to load saved comparisons.' : null,
    refresh: () => void mutate(),
    createComparison,
    renameComparison,
    updateComparison,
    deleteComparison,
  };
};
