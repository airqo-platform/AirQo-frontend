'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR, { type SWRResponse } from 'swr';
import {
  STABLE_SWR_OPTIONS,
  useAbortableFetcher,
} from '@/shared/hooks/useAbortableSWR';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { toast } from '@/shared/components/ui/toast';
import { getBillingErrorMessage, isBillingConflict } from './errors';
import { useBillingMutate } from './queries';
import type { BillingListMeta } from '@/shared/types/billing';

export const SEARCH_DEBOUNCE_MS = 400;

/**
 * SWR wiring for billing reads: abortable fetch + the app's stable SWR options.
 * Replaces the `useAbortableFetcher` + `useSWR(key, fetcher, STABLE_SWR_OPTIONS)`
 * pair that every billing page used to repeat.
 */
export function useBillingQuery<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>
): SWRResponse<T, Error> {
  const { fetcher: abortableFetcher } = useAbortableFetcher(fetcher);
  return useSWR<T, Error>(key, abortableFetcher, STABLE_SWR_OPTIONS);
}

type Filters = Record<string, unknown>;

interface BillingListOptions<TFilters extends Filters> {
  defaultFilters: TFilters;
  defaultLimit?: number;
  searchEnabled?: boolean;
}

/**
 * Server-side list state: page/offset, page size, debounced search and filters,
 * with the "any filter change resets to page 1" rule applied once instead of in
 * every list page.
 */
export function useBillingList<TFilters extends Filters>({
  defaultFilters,
  defaultLimit = 10,
  searchEnabled = true,
}: BillingListOptions<TFilters>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultLimit);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);
  const [filters, setFilters] = useState<TFilters>(defaultFilters);

  const setFilter = useCallback(
    <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
      setFilters(previous => ({ ...previous, [key]: value }));
    },
    []
  );

  // Filter/search/page-size changes invalidate the current offset.
  useEffect(() => {
    setPage(1);
  }, [search, filters, pageSize]);

  const onPageChange = useCallback((next: number) => {
    setPage(Math.max(1, next));
  }, []);

  const onPageSizeChange = useCallback((next: number) => {
    setPageSize(next);
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    search,
    searchInput,
    setSearchInput,
    searchEnabled,
    filters,
    setFilters,
    setFilter,
    onPageChange,
    onPageSizeChange,
    /** Ready to spread into a service list call: filters + offset + search. */
    params: useMemo(
      () => ({
        ...filters,
        skip: (page - 1) * pageSize,
        limit: pageSize,
        ...(searchEnabled && search ? { search } : {}),
      }),
      [filters, page, pageSize, search, searchEnabled]
    ) as TFilters & { skip: number; limit: number; search?: string },
  };
}

/** Maps list meta + local list state onto `ServerSideTable` pagination props. */
export const toPaginationProps = (
  meta: BillingListMeta | undefined,
  list: {
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  }
) => {
  const totalItems = meta?.total ?? 0;
  const effectiveLimit = meta?.limit || list.pageSize;

  return {
    currentPage: list.page,
    pageSize: list.pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / effectiveLimit)),
    onPageChange: list.onPageChange,
    onPageSizeChange: list.onPageSizeChange,
  };
};

interface BillingActionOptions<T> {
  success?: string;
  onSuccess?: (result: T) => void | Promise<void>;
  onError?: (message: string, error: unknown) => void;
  /** Set for inline field errors where the dialog renders the message itself. */
  silent?: boolean;
}

/**
 * Single-flight mutation runner: one action at a time per component, friendly
 * toasts, server-message extraction and automatic revalidation on 409 conflicts.
 * Replaces the repeated busy/toast/try-catch blocks in actions, pages and dialogs.
 */
export function useBillingAction() {
  const revalidateAll = useBillingMutate();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const busyRef = useRef<string | null>(null);

  const isBusy = useCallback(
    (key?: string) =>
      key ? busyRef.current === key : busyRef.current !== null,
    []
  );

  const run = useCallback(
    async <T>(
      key: string,
      task: () => Promise<T>,
      { success, onSuccess, onError, silent }: BillingActionOptions<T> = {}
    ): Promise<T | undefined> => {
      if (busyRef.current) return undefined;

      busyRef.current = key;
      setBusyKey(key);
      try {
        const result = await task();
        if (success) toast.success(success);
        await onSuccess?.(result);
        return result;
      } catch (error) {
        if (isBillingConflict(error)) {
          await revalidateAll();
        }
        const message = getBillingErrorMessage(error);
        if (!silent) toast.error(message);
        onError?.(message, error);
        return undefined;
      } finally {
        busyRef.current = null;
        setBusyKey(null);
      }
    },
    [revalidateAll]
  );

  return { busyKey, isBusy, run };
}
