import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';

const mockGetUserPreferencesList = jest.fn();
const mockUpdateUserPreferences = jest.fn();

jest.mock('@/shared/services/preferencesService', () => ({
  preferencesService: {
    getUserPreferencesList: (...args: unknown[]) =>
      mockGetUserPreferencesList(...(args as [string, string])),
    updateUserPreferences: (...args: unknown[]) =>
      mockUpdateUserPreferences(...(args as [unknown])),
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
  savedOverrideMatchesPreference,
  useComparisonSelection,
} from '../useComparisonSelection';

interface ServerSite {
  _id: string;
  search_name?: string;
  city?: string;
  country?: string;
}

/** Simulated server document — PATCH persists synchronously, like staging. */
let serverSites: ServerSite[];

/** Resolvers for GETs deliberately held back to simulate a slow refetch. */
let blockedGetResolvers: Array<() => void>;

const makeListResponse = (groupId: string) => ({
  success: true,
  message: 'ok',
  preferences: [
    {
      _id: 'pref-1',
      group_id: groupId,
      user_id: 'user-1',
      site_ids: serverSites.map(site => site._id),
      selected_sites: serverSites.map(site => ({ ...site })),
      updatedAt: '2026-08-22T00:00:00Z',
      lastAccessed: '2026-08-22T00:00:00Z',
    },
  ],
});

const installBaseGet = () => {
  mockGetUserPreferencesList.mockImplementation(
    async (_userId: string, groupId: string) => makeListResponse(groupId)
  );
};

/** The next GET hangs until releaseBlockedGets — simulates a slow refetch. */
const blockNextGet = () => {
  blockedGetResolvers = [];
  mockGetUserPreferencesList.mockImplementationOnce(
    (_userId: string, groupId: string) =>
      new Promise<ReturnType<typeof makeListResponse>>(resolve => {
        blockedGetResolvers.push(() => resolve(makeListResponse(groupId)));
      })
  );
};

const releaseBlockedGets = () => {
  const resolvers = [...blockedGetResolvers];
  blockedGetResolvers = [];
  resolvers.forEach(resolve => resolve());
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('savedOverrideMatchesPreference', () => {
  it('matches the same ids in a different order (set comparison, not identity)', () => {
    expect(savedOverrideMatchesPreference(['b', 'a'], ['a', 'b'])).toBe(true);
  });

  it('rejects different lengths or contents', () => {
    expect(savedOverrideMatchesPreference(['a'], ['a', 'b'])).toBe(false);
    expect(savedOverrideMatchesPreference(['a', 'c'], ['a', 'b'])).toBe(false);
    expect(savedOverrideMatchesPreference([], [])).toBe(true);
  });
});

describe('useComparisonSelection override convergence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    blockedGetResolvers = [];
    serverSites = [{ _id: 'site-a', search_name: 'Alpha' }];
    installBaseGet();
    // The backend persists before responding, so any GET after the PATCH
    // sees the new selection (verified live against staging).
    mockUpdateUserPreferences.mockImplementation(
      async (body: { selected_sites: ServerSite[] }) => {
        serverSites = body.selected_sites.map(site => ({ ...site }));
        return { success: true, message: 'ok' };
      }
    );
  });

  it('keeps just-saved names while the refetch is in flight, then converges on the server payload', async () => {
    const { result } = renderHook(
      () => useComparisonSelection({ groupId: 'group-1', userId: 'user-1' }),
      { wrapper }
    );

    // Initial server truth: site-a "Alpha".
    await waitFor(() =>
      expect(result.current.savedSiteIds).toEqual(['site-a'])
    );
    expect(result.current.savedSites[0].search_name).toBe('Alpha');

    // Hold back the post-save preferences refetch.
    blockNextGet();

    let saveOk = false;
    await act(async () => {
      saveOk = await result.current.save([
        {
          _id: 'site-b',
          search_name: 'Beta',
          city: 'Kampala',
          country: 'Uganda',
        },
      ]);
    });
    expect(saveOk).toBe(true);
    expect(mockUpdateUserPreferences).toHaveBeenCalledWith({
      user_id: 'user-1',
      group_id: 'group-1',
      selected_sites: [
        expect.objectContaining({ _id: 'site-b', search_name: 'Beta' }),
      ],
    });

    // Refetch still pending: the just-saved Site objects win, so display
    // names survive the stale-preference window.
    expect(result.current.savedSiteIds).toEqual(['site-b']);
    expect(result.current.savedSites[0].search_name).toBe('Beta');
    expect(result.current.savedSites[0].city).toBe('Kampala');

    // Refetch lands with the persisted payload → override is dropped and
    // the server document wins.
    await act(async () => {
      releaseBlockedGets();
    });
    await waitFor(() =>
      expect(result.current.savedSites[0].search_name).toBe('Beta')
    );
    expect(result.current.savedSiteIds).toEqual(['site-b']);
  });

  it('server payload wins after convergence even when the stored name differs', async () => {
    const { result } = renderHook(
      () => useComparisonSelection({ groupId: 'group-1', userId: 'user-1' }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.savedSiteIds).toEqual(['site-a'])
    );

    blockNextGet();

    await act(async () => {
      await result.current.save([
        { _id: 'site-c', search_name: 'Client Name' },
      ]);
    });
    // Override carries the client-side name while the refetch is pending…
    expect(result.current.savedSites[0].search_name).toBe('Client Name');

    // …but the server normalized the name; once its response lands it must
    // replace the local override.
    serverSites = [{ _id: 'site-c', search_name: 'Server Name' }];
    await act(async () => {
      releaseBlockedGets();
    });
    await waitFor(() =>
      expect(result.current.savedSites[0]?.search_name).toBe('Server Name')
    );
    expect(result.current.savedSiteIds).toEqual(['site-c']);
  });

  it('falls back to the group preference immediately on a group switch (no cross-group bleed)', async () => {
    const { result, rerender } = renderHook(
      (props: { groupId: string }) =>
        useComparisonSelection({ groupId: props.groupId, userId: 'user-1' }),
      { wrapper, initialProps: { groupId: 'group-1' } }
    );

    await waitFor(() =>
      expect(result.current.savedSiteIds).toEqual(['site-a'])
    );

    await act(async () => {
      await result.current.save([{ _id: 'site-b', search_name: 'Beta' }]);
    });
    expect(result.current.savedSiteIds).toEqual(['site-b']);

    rerender({ groupId: 'group-2' });
    // Override belongs to group-1 — group-2 shows only its own selection
    // (empty here) until its preference loads.
    expect(result.current.savedSiteIds).toEqual([]);
  });
});
