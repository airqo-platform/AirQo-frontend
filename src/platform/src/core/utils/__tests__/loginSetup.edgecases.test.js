import { setupUserSession } from '@/core/utils/loginSetup';
import { waitFor } from '@testing-library/react';

// reuse the same mock dispatch helper
const makeMockDispatch = () => {
  const calls = [];
  const dispatch = (action) => calls.push(action);
  return { dispatch, calls };
};

const baseSession = {
  user: {
    id: 'user-edge',
    name: 'Edge User',
    email: 'edge@example.com',
  },
};

// Mocks for APIs and store slices (reuse same shapes as existing tests)
import * as AccountApi from '@/core/apis/Account';
jest.mock('@/core/apis/Account', () => ({
  getUserDetails: jest
    .fn()
    .mockResolvedValue({ users: [{ _id: 'user-edge', groups: [] }] }),
  getUserGroupPermissionsApi: jest.fn().mockResolvedValue({ permissions: [] }),
}));

import * as OrgApi from '@/core/apis/Organizations';
jest.mock('@/core/apis/Organizations', () => ({
  getOrganizationThemePreferencesApi: jest
    .fn()
    .mockResolvedValue({ theme: null }),
}));

jest.mock('@/lib/store/services/account/UserDefaultsSlice', () => ({
  getIndividualUserPreferences: jest.fn(() => ({ type: 'MOCK' })),
}));

jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock(
  '@/lib/store/services/organizationTheme/OrganizationThemeSlice',
  () => ({
    setOrganizationTheme: (t) => ({ type: 'SET_ORG_THEME', payload: t }),
    setOrganizationThemeLoading: (b) => ({
      type: 'SET_ORG_THEME_LOADING',
      payload: b,
    }),
    setOrganizationThemeError: (e) => ({
      type: 'SET_ORG_THEME_ERROR',
      payload: e,
    }),
    clearOrganizationTheme: () => ({ type: 'CLEAR_ORG_THEME' }),
  }),
);

jest.mock('@/lib/store/services/permissions/PermissionsSlice', () => ({
  setPermissionsData: (p) => ({ type: 'SET_PERMS', payload: p }),
  setPermissionsError: (e) => ({ type: 'SET_PERMS_ERROR', payload: e }),
  clearPermissions: () => ({ type: 'CLEAR_PERMS' }),
}));

jest.mock('@/lib/store/services/charts/ChartSlice', () => ({
  setChartSites: (s) => ({ type: 'SET_CHART_SITES', payload: s }),
}));

jest.mock('@/lib/store/services/groups', () => ({
  setUserGroups: (g) => ({ type: 'SET_USER_GROUPS', payload: g }),
  setActiveGroup: (g) => ({ type: 'SET_ACTIVE_GROUP', payload: g }),
}));

jest.mock('@/lib/store/services/account/LoginSlice', () => ({
  setUserInfo: (u) => ({ type: 'SET_USER_INFO', payload: u }),
  setSuccess: (s) => ({ type: 'SET_SUCCESS', payload: s }),
  setError: (e) => ({ type: 'SET_ERROR', payload: e }),
}));

describe('setupUserSession edge cases', () => {
  test('no groups returned creates fallback group and succeeds', async () => {
    const { dispatch, calls } = makeMockDispatch();

    const result = await setupUserSession(baseSession, dispatch, '/', {});

    // With the updated implementation, it should succeed with fallback group
    expect(result.success).toBe(true);
    expect(result.activeGroup).toBeDefined();
    expect(result.activeGroup.grp_title).toBe('AirQo'); // Fallback group

    // Should set success action
    const hasSuccess = calls.some((c) => c && c.type === 'SET_SUCCESS');
    expect(hasSuccess).toBe(true);
  });

  test('organization route with matching slug redirects to org dashboard', async () => {
    // make getUserDetails return a group with slug
    AccountApi.getUserDetails.mockResolvedValue({
      users: [
        {
          _id: 'user-edge',
          groups: [
            {
              _id: 'og1',
              grp_title: 'Org One',
              grp_name: 'Org One',
              organization_slug: 'org-one',
            },
          ],
        },
      ],
    });

    const { dispatch, calls } = makeMockDispatch();

    const result = await setupUserSession(
      { ...baseSession, requestedOrgSlug: 'org-one' },
      dispatch,
      '/org/org-one',
      {},
    );

    expect(result.success).toBe(true);
    expect(result.redirectPath).toBe('/org/org-one/dashboard');

    const hasActive = calls.some((c) => c && c.type === 'SET_ACTIVE_GROUP');
    expect(hasActive).toBe(true);
  });

  test('admin route uses AirQo group and does not force redirect', async () => {
    // Return AirQo and another group
    AccountApi.getUserDetails.mockResolvedValue({
      users: [
        {
          _id: 'user-edge',
          groups: [
            { _id: 'airqo', grp_title: 'AirQo' },
            { _id: 'og2', grp_title: 'Org Two' },
          ],
        },
      ],
    });

    const { dispatch, calls } = makeMockDispatch();

    const result = await setupUserSession(
      baseSession,
      dispatch,
      '/admin/settings',
      {},
    );

    expect(result.success).toBe(true);
    // Admin route shouldn't set redirectPath normally
    expect(result.redirectPath).toBeNull();

    const active = calls.find((c) => c && c.type === 'SET_ACTIVE_GROUP');
    expect(active).toBeTruthy();
    // Ensure active group chosen is AirQo (first group in mocked list)
    expect(active.payload._id).toBe('airqo');
  });

  test('permission API failure is handled and sets permissions error', async () => {
    // Make permissions API throw
    AccountApi.getUserGroupPermissionsApi.mockRejectedValue(
      new Error('permissions failed'),
    );

    // Provide a valid group in user details
    AccountApi.getUserDetails.mockResolvedValue({
      users: [
        { _id: 'user-edge', groups: [{ _id: 'gperm', grp_title: 'Perm Org' }] },
      ],
    });

    const { dispatch, calls } = makeMockDispatch();

    const result = await setupUserSession(baseSession, dispatch, '/', {});

    // Should still succeed in setting session (permissions loaded in background should not break main flow)
    expect(result.success).toBe(true);

    // Permissions failure is handled in background; wait for the dispatch
    await waitFor(() =>
      expect(calls.some((c) => c && c.type === 'SET_PERMS_ERROR')).toBe(true),
    );
  });

  test('organization theme API failure is handled and sets organization theme error', async () => {
    OrgApi.getOrganizationThemePreferencesApi.mockRejectedValue(
      new Error('theme failed'),
    );

    // Provide a non-AirQo group so theme loading is attempted
    AccountApi.getUserDetails.mockResolvedValue({
      users: [
        {
          _id: 'user-edge',
          groups: [{ _id: 'gtheme', grp_title: 'Theme Org' }],
        },
      ],
    });

    const { dispatch, calls } = makeMockDispatch();

    const result = await setupUserSession(baseSession, dispatch, '/', {});

    expect(result.success).toBe(true);

    await waitFor(() =>
      expect(calls.some((c) => c && c.type === 'SET_ORG_THEME_ERROR')).toBe(
        true,
      ),
    );
  });
});
