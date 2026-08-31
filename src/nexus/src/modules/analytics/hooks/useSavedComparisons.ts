'use client';

import { useCallback, useMemo, useState } from 'react';
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

const SWR_STABLE_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
  dedupingInterval: 10000,
  staleTime: 60000,
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

  const fetcher = useCallback(async (): Promise<SavedComparison[]> => {
    const response = await comparisonsService.list({
      group_id: groupId as string,
      limit: 100,
    });
    return sortByUpdatedAtDesc(response.comparisons ?? []);
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
        console.error(
          'Failed to create comparison:',
          err instanceof Error ? err.message : err
        );
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
        console.error(
          'Failed to rename comparison:',
          err instanceof Error ? err.message : err
        );
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
        console.error(
          'Failed to update comparison:',
          err instanceof Error ? err.message : err
        );
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
        console.error(
          'Failed to delete comparison:',
          err instanceof Error ? err.message : err
        );
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
    error: error
      ? (error.message ?? 'Failed to load saved comparisons.')
      : null,
    refresh: () => void mutate(),
    createComparison,
    renameComparison,
    updateComparison,
    deleteComparison,
  };
};
