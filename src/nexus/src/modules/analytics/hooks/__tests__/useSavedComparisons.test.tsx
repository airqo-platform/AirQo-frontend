import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { SavedComparisonListResponse } from '@/shared/types/api';

const mockList = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();

jest.mock('@/shared/services/comparisonsService', () => ({
  comparisonsService: {
    list: (...args: unknown[]) => mockList(...args),
    get: jest.fn(),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    remove: (...args: unknown[]) => mockRemove(...args),
  },
}));

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => ({
    user: { id: 'user-1' },
    activeGroup: { id: 'group-1' },
    isLoading: false,
  }),
}));

// eslint-disable-next-line import/first
import {
  buildSavedComparisonsKey,
  useSavedComparisons,
} from '../useSavedComparisons';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

const makeComparison = (overrides: Record<string, unknown> = {}) => ({
  id: 'comp-1',
  user_id: 'user-1',
  group_id: 'group-1',
  name: 'My comparison',
  site_ids: ['site-1'],
  sites: [{ id: 'site-1', name: 'Kampala Site' }],
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-22T00:00:00Z',
  ...overrides,
});

describe('buildSavedComparisonsKey', () => {
  it('includes the groupId in the key', () => {
    expect(buildSavedComparisonsKey('group-1')).toEqual([
      'saved-comparisons',
      'group-1',
    ]);
  });

  it('falls back to a no-active-group sentinel when groupId is undefined', () => {
    expect(buildSavedComparisonsKey(undefined)).toEqual([
      'saved-comparisons',
      'no-active-group',
    ]);
  });
});

describe('useSavedComparisons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not fetch without a groupId', () => {
    renderHook(() => useSavedComparisons({ groupId: undefined }), { wrapper });
    expect(mockList).not.toHaveBeenCalled();
  });

  it('fetches the list once the group resolves and sorts by updated_at desc', async () => {
    mockList.mockResolvedValue({
      success: true,
      message: 'ok',
      comparisons: [
        makeComparison({ id: 'old', updated_at: '2026-08-01T00:00:00Z' }),
        makeComparison({ id: 'new', updated_at: '2026-08-22T00:00:00Z' }),
        makeComparison({ id: 'mid', updated_at: '2026-08-10T00:00:00Z' }),
      ],
      meta: { total: 3, total_pages: 1, page: 1, skip: 0, limit: 100 },
    });

    const { result } = renderHook(
      () => useSavedComparisons({ groupId: 'group-1' }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.comparisons.length).toBeGreaterThan(0)
    );

    // Most recent first.
    expect(result.current.comparisons.map(c => c.id)).toEqual([
      'new',
      'mid',
      'old',
    ]);
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ group_id: 'group-1', limit: 100 }),
      expect.any(AbortSignal)
    );
  });

  it('sinks comparisons with missing/invalid dates to the bottom', async () => {
    mockList.mockResolvedValue({
      success: true,
      message: 'ok',
      comparisons: [
        makeComparison({ id: 'valid', updated_at: '2026-08-22T00:00:00Z' }),
        makeComparison({ id: 'nodate', updated_at: '' }),
      ],
      meta: { total: 2, total_pages: 1, page: 1, skip: 0, limit: 100 },
    });

    const { result } = renderHook(
      () => useSavedComparisons({ groupId: 'group-1' }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.comparisons.length).toBeGreaterThan(0)
    );
    expect(result.current.comparisons.map(c => c.id)).toEqual([
      'valid',
      'nodate',
    ]);
  });

  it('surfaces sanitized error messages (never raw axios errors)', async () => {
    mockList.mockRejectedValue(new Error('Request failed with status 401'));

    const { result } = renderHook(
      () => useSavedComparisons({ groupId: 'group-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.error).not.toBeNull());
    // The raw axios message never reaches the UI — only the fixed public text.
    expect(result.current.error).toBe('Failed to load saved comparisons.');
  });

  it('createComparison calls the service and revalidates', async () => {
    mockList.mockResolvedValue({
      success: true,
      message: 'ok',
      comparisons: [],
      meta: { total: 0, total_pages: 0, page: 1, skip: 0, limit: 100 },
    });
    mockCreate.mockResolvedValue({
      success: true,
      message: 'ok',
      comparison: makeComparison({ id: 'created' }),
    });

    const { result } = renderHook(
      () => useSavedComparisons({ groupId: 'group-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let created: unknown;
    await act(async () => {
      created = await result.current.createComparison({
        group_id: 'group-1',
        name: 'New',
        site_ids: ['site-1'],
      });
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ group_id: 'group-1', name: 'New' })
    );
    expect((created as { id: string }).id).toBe('created');
    // Revalidation fires a refetch.
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
  });

  it('renameComparison calls update with { name }', async () => {
    mockList.mockResolvedValue({
      success: true,
      message: 'ok',
      comparisons: [],
      meta: { total: 0, total_pages: 0, page: 1, skip: 0, limit: 100 },
    });
    mockUpdate.mockResolvedValue({
      success: true,
      message: 'ok',
      comparison: makeComparison({ name: 'Renamed' }),
    });

    const { result } = renderHook(
      () => useSavedComparisons({ groupId: 'group-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let renamed: unknown;
    await act(async () => {
      renamed = await result.current.renameComparison('comp-1', 'Renamed');
    });

    expect(mockUpdate).toHaveBeenCalledWith('comp-1', { name: 'Renamed' });
    expect((renamed as { name: string }).name).toBe('Renamed');
  });

  it('deleteComparison calls remove and revalidates', async () => {
    mockList.mockResolvedValue({
      success: true,
      message: 'ok',
      comparisons: [],
      meta: { total: 0, total_pages: 0, page: 1, skip: 0, limit: 100 },
    });
    mockRemove.mockResolvedValue({ success: true });

    const { result } = renderHook(
      () => useSavedComparisons({ groupId: 'group-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let ok = false;
    await act(async () => {
      ok = await result.current.deleteComparison('comp-1');
    });

    expect(mockRemove).toHaveBeenCalledWith('comp-1');
    expect(ok).toBe(true);
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
  });

  it('returns null/false (sanitized) when a mutation fails', async () => {
    mockList.mockResolvedValue({
      success: true,
      message: 'ok',
      comparisons: [],
      meta: { total: 0, total_pages: 0, page: 1, skip: 0, limit: 100 },
    });
    mockCreate.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(
      () => useSavedComparisons({ groupId: 'group-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let created: unknown;
    await act(async () => {
      created = await result.current.createComparison({
        group_id: 'group-1',
        name: 'New',
        site_ids: ['site-1'],
      });
    });

    // Sanitized: resolves null instead of throwing the raw axios error.
    expect(created).toBeNull();
    expect(result.current.isMutating).toBe(false);
  });

  it('does not refetch on remount while cached data exists (revalidateIfStale: false)', async () => {
    // A shared cache Map so the cached data survives unmount — proving the
    // remount reuses it instead of refetching.
    const sharedCache = new Map();
    const cachedWrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => sharedCache, dedupingInterval: 0 }}>
        {children}
      </SWRConfig>
    );

    mockList.mockResolvedValue({
      success: true,
      message: 'ok',
      comparisons: [makeComparison({ id: 'cached' })],
      meta: { total: 1, total_pages: 1, page: 1, skip: 0, limit: 100 },
    });

    const { result, unmount } = renderHook(
      () => useSavedComparisons({ groupId: 'group-1' }),
      { wrapper: cachedWrapper }
    );

    await waitFor(() =>
      expect(result.current.comparisons.length).toBeGreaterThan(0)
    );
    expect(mockList).toHaveBeenCalledTimes(1);

    // Unmount and remount — the cached data must be reused, not refetched.
    unmount();

    const { result: result2 } = renderHook(
      () => useSavedComparisons({ groupId: 'group-1' }),
      { wrapper: cachedWrapper }
    );

    await waitFor(() =>
      expect(result2.current.comparisons.length).toBeGreaterThan(0)
    );
    expect(mockList).toHaveBeenCalledTimes(1);
  });

  it('aborts the in-flight list request when the group switches', async () => {
    // First call never resolves until we let it — keeps a request in flight.
    let resolveFirst!: (value: SavedComparisonListResponse) => void;
    mockList.mockImplementationOnce(
      () =>
        new Promise<SavedComparisonListResponse>(resolve => {
          resolveFirst = resolve;
        })
    );

    const { rerender } = renderHook(
      (props: { groupId: string }) => useSavedComparisons(props),
      { wrapper, initialProps: { groupId: 'group-1' } }
    );

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));

    // The fetcher passes an AbortSignal as the second argument.
    const signalArg = mockList.mock.calls[0][1];
    expect(signalArg).toBeInstanceOf(AbortSignal);

    // Switching groups aborts the group-1 request.
    rerender({ groupId: 'group-2' });

    expect(signalArg.aborted).toBe(true);

    resolveFirst({
      success: true,
      message: 'ok',
      comparisons: [],
      meta: { total: 0, total_pages: 0, page: 1, skip: 0, limit: 100 },
    });

    // A fresh request fires for group-2.
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
  });
});
