import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';

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
      expect.objectContaining({ group_id: 'group-1', limit: 100 })
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
    expect(result.current.error).toBe('Request failed with status 401');
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
});
